import React, { useCallback, useMemo, useState } from 'react';
import { Compass } from 'lucide-react';
import { LandingPage } from './pages/LandingPage';
import { ProfilePage } from './pages/ProfilePage';
import { BaselinePage } from './pages/BaselinePage';
import { AnalyzingPage } from './pages/AnalyzingPage';
import { ResultsPage } from './pages/ResultsPage';
import { BarrierPage } from './pages/BarrierPage';
import { BarrierReviewPage } from './pages/BarrierReviewPage';
import { PostSurveyPage } from './pages/PostSurveyPage';
import { FinalCardPage } from './pages/FinalCardPage';
import { loadPusulaData, getDisciplineById } from './lib/dataLoader.js';
import { runCareerAnalysis } from './lib/gemini.js';
import { rolesFromMatrix } from './lib/fallbackRoles.js';
import { BARRIER_STATIC_FALLBACK } from './lib/barrierFallback.js';
import { logEvent } from './lib/analytics.js';
import { Button } from './components/ui/Button';

function stepLabel(step) {
  const map = {
    home: 'Adım 1/8 · Karşılama',
    profile: 'Adım 2/8 · Profil',
    baseline: 'Adım 3/8 · Ön anket',
    analyzing: 'Adım 4/8 · Analiz',
    results: 'Adım 5/8 · Sonuçlar',
    barrier: 'Adım 6/8 · Engel',
    barrierReview: 'Adım 6/8 · Engel özeti',
    postsurvey: 'Adım 7/8 · Son anket',
    card: 'Adım 8/8 · Kariyer kartı',
  };
  return map[step] ?? '';
}

const App = () => {
  const [step, setStep] = useState('home');
  const [matrix, setMatrix] = useState(null);
  const [opportunities, setOpportunities] = useState(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState('');

  const [profile, setProfile] = useState(null);
  const [baselineBefore, setBaselineBefore] = useState(3);
  const [baselineAfter, setBaselineAfter] = useState(3);
  const [roles, setRoles] = useState([]);
  const [analysisSource, setAnalysisSource] = useState('gemini');
  const [geminiError, setGeminiError] = useState('');

  const [barrierResult, setBarrierResult] = useState(null);

  const navLabel = useMemo(() => stepLabel(step), [step]);

  const handleFlowStart = useCallback(async () => {
    logEvent('flow_start', {});
    setStep('profile');
    if (matrix && opportunities) return;

    setDataLoading(true);
    setDataError('');
    try {
      const d = await loadPusulaData();
      setMatrix(d.matrix);
      setOpportunities(d.opportunities);
    } catch (e) {
      setDataError(e?.message ?? 'Veri yüklenemedi');
    } finally {
      setDataLoading(false);
    }
  }, [matrix, opportunities]);

  const runAnalysis = useCallback(async () => {
    if (!profile || !matrix?.length) return;
    setStep('analyzing');
    setGeminiError('');
    try {
      const key = import.meta.env.VITE_GEMINI_API_KEY;
      const out = await runCareerAnalysis({ apiKey: key, profile, matrix });
      setRoles(out.roles);
      setAnalysisSource('gemini');
      logEvent('analysis_done', { source: 'gemini' });
      setStep('results');
    } catch (e) {
      const row = getDisciplineById(matrix, profile.disciplineId);
      const r = rolesFromMatrix(row);
      setRoles(r);
      setAnalysisSource('fallback');
      setGeminiError(e?.message ?? String(e));
      logEvent('analysis_done', { source: 'fallback', error: e?.message ?? String(e) });
      setStep('results');
    }
  }, [profile, matrix]);

  const resetFlow = () => {
    setStep('home');
    setProfile(null);
    setBaselineBefore(3);
    setBaselineAfter(3);
    setRoles([]);
    setAnalysisSource('gemini');
    setGeminiError('');
    setBarrierResult(null);
  };

  const finishBarrier = (res) => {
    setBarrierResult(res);
    setStep('barrierReview');
    logEvent('barrier_complete', {});
  };

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY ?? '';

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-orange-50 font-sans text-slate-900">
      <div className="pointer-events-none absolute left-[-10%] top-[-10%] h-[40%] w-[40%] rounded-full bg-pusula-purple/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-10%] right-[-10%] h-[40%] w-[40%] rounded-full bg-pusula-coral/15 blur-3xl" />

      <nav className="relative mx-auto flex max-w-7xl items-center justify-between px-8 py-6">
        <div className="group flex items-center gap-2">
          <div className="rounded-lg bg-indigo-600 p-2 transition-transform duration-300 group-hover:rotate-12">
            <Compass className="h-6 w-6 text-white" />
          </div>
          <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-2xl font-bold tracking-tight text-transparent">
            Pusula
          </span>
        </div>

        <div className="hidden rounded-full border border-white/40 bg-white/40 px-4 py-2 text-xs font-semibold text-slate-700 backdrop-blur-sm sm:block">
          {navLabel}
        </div>
      </nav>

      {step === 'home' && <LandingPage onStart={handleFlowStart} />}

      {step === 'profile' && (
        <>
          {dataLoading && (
            <main className="mx-auto max-w-3xl px-6 py-16 text-center text-slate-600">Veriler yükleniyor…</main>
          )}
          {!dataLoading && dataError && (
            <main className="mx-auto max-w-3xl px-6 py-16 text-center">
              <p className="text-red-600">{dataError}</p>
              <Button className="mt-4" onClick={() => setStep('home')}>
                Ana sayfaya dön
              </Button>
            </main>
          )}
          {!dataLoading && !dataError && matrix && (
            <ProfilePage
              matrix={matrix}
              onBack={() => setStep('home')}
              onSubmit={(p) => {
                setProfile(p);
                logEvent('profile_complete', { disciplineId: p.disciplineId });
                setStep('baseline');
              }}
            />
          )}
        </>
      )}

      {step === 'baseline' && (
        <BaselinePage
          value={baselineBefore}
          onChange={setBaselineBefore}
          onBack={() => setStep('profile')}
          onNext={runAnalysis}
        />
      )}

      {step === 'analyzing' && <AnalyzingPage />}

      {step === 'results' && profile && opportunities && (
        <ResultsPage
          profile={profile}
          roles={roles}
          opportunities={opportunities}
          analysisSource={analysisSource}
          geminiErrorMessage={geminiError}
          onRetryAnalysis={() => {
            logEvent('analysis_retry', {});
            runAnalysis();
          }}
          onContinue={() => setStep('barrier')}
        />
      )}

      {step === 'barrier' && (
        <BarrierPage
          apiKey={apiKey}
          profileSummary={`${profile?.disciplineLabel ?? ''}; ilgi: ${profile?.interests?.join(', ')}; güçlü yön: ${profile?.strengths?.join(', ')}; hedef: ${profile?.goal ?? ''}`}
          onResult={finishBarrier}
          onSkip={() => {
            logEvent('barrier_skip', {});
            finishBarrier(BARRIER_STATIC_FALLBACK);
          }}
        />
      )}

      {step === 'barrierReview' && barrierResult && (
        <BarrierReviewPage result={barrierResult} onNext={() => setStep('postsurvey')} />
      )}

      {step === 'postsurvey' && (
        <PostSurveyPage
          baselineBefore={baselineBefore}
          value={baselineAfter}
          onChange={setBaselineAfter}
          onNext={() => setStep('card')}
        />
      )}

      {step === 'card' && profile && (
        <FinalCardPage
          profile={profile}
          roles={roles}
          baselineBefore={baselineBefore}
          baselineAfter={baselineAfter}
          onHome={resetFlow}
        />
      )}
    </div>
  );
};

export default App;
