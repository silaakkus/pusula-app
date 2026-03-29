import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Compass } from 'lucide-react';
import { LandingPage } from './pages/LandingPage';
import { LandingInfoPage } from './pages/LandingInfoPage';
import { ProfilePage } from './pages/ProfilePage';
import { BaselinePage } from './pages/BaselinePage';
import { AnalyzingPage } from './pages/AnalyzingPage';
import { ResultsPage } from './pages/ResultsPage';
import { BarrierPage } from './pages/BarrierPage';
import { BarrierReviewPage } from './pages/BarrierReviewPage';
import { PostSurveyPage } from './pages/PostSurveyPage';
import { FinalCardPage } from './pages/FinalCardPage';
import { RoadmapHubPage } from './pages/RoadmapHubPage.jsx';
import { RoadmapTrackPage } from './pages/RoadmapTrackPage.jsx';
import { OrientationQuizPage } from './pages/OrientationQuizPage.jsx';
import { OrientationResultPage } from './pages/OrientationResultPage.jsx';
import { PusulaBadgesStrip } from './components/PusulaBadgesStrip.jsx';
import { loadPusulaData, getDisciplineById } from './lib/dataLoader.js';
import { runCareerAnalysis, runBarrierReframe } from './lib/gemini.js';
import { getLlmApiKey, getLlmProvider, getLlmBrandLabel } from './lib/llmConfig.js';
import { savePusulaSession } from './lib/pusulaSession.js';
import { rolesFromMatrix } from './lib/fallbackRoles.js';
import { BARRIER_STATIC_FALLBACK } from './lib/barrierFallback.js';
import { buildMatrixBarrierSuggestion } from './lib/barrierMatrixSuggestion.js';
import { logEvent } from './lib/analytics.js';
import {
  saveFlowSnapshot,
  loadFlowSnapshot,
  clearFlowSnapshot,
} from './lib/pusulaFlow.js';
import {
  clearProfileDraft,
  getResumeSummaryText,
  hasProfileDraft,
  hasResumeAvailable,
} from './lib/profileDraft.js';
import {
  captureInviterFromUrl,
  clearCompletionNotifyFlag,
  clearInviteReferralState,
  postInviterCompletionOnce,
} from './lib/inviteReferral.js';
import { unlockPusulaBadge, BADGE_IDS } from './lib/pusulaBadges.js';
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
    roadmapHub: 'Keşif · Öğrenme yolları',
    roadmapTrack: 'Keşif · Adım adım yol',
    orientationQuiz: 'Keşif · Yönelim testi',
    orientationResult: 'Keşif · Yönelim sonucu',
  };
  return map[step] ?? '';
}

function resumeTargetStep(s) {
  if (s.step === 'analyzing') {
    if (Array.isArray(s.roles) && s.roles.length > 0) return 'results';
    return 'baseline';
  }
  return s.step;
}

/** Analiz yüklenirken geri yok (async yarışı önlemek için). */
function getPreviousStep(current) {
  switch (current) {
    case 'profile':
      return 'home';
    case 'baseline':
      return 'profile';
    case 'analyzing':
      return null;
    case 'results':
      return 'baseline';
    case 'barrier':
      return 'results';
    case 'barrierReview':
      return 'barrier';
    case 'postsurvey':
      return 'barrierReview';
    case 'card':
      return 'postsurvey';
    case 'roadmapHub':
      return 'home';
    case 'roadmapTrack':
      return 'roadmapHub';
    case 'orientationQuiz':
      return 'home';
    case 'orientationResult':
      return 'orientationQuiz';
    default:
      return null;
  }
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
  const [barrierRetryBusy, setBarrierRetryBusy] = useState(false);
  const [landingInfoSectionId, setLandingInfoSectionId] = useState(null);
  const [roadmapTrackId, setRoadmapTrackId] = useState(null);
  const [orientationResult, setOrientationResult] = useState(null);

  const barrierProfileSummary = useMemo(
    () =>
      `${profile?.disciplineLabel ?? ''}; ilgi: ${profile?.interests?.join(', ')}; güçlü yön: ${profile?.strengths?.join(', ')}; hedef: ${profile?.goal ?? ''}`,
    [profile],
  );

  const navLabel = useMemo(() => stepLabel(step), [step]);

  useEffect(() => {
    if (step === 'home' || step === 'landingInfo') return;
    if (
      step === 'roadmapHub' ||
      step === 'roadmapTrack' ||
      step === 'orientationQuiz' ||
      step === 'orientationResult'
    ) {
      return;
    }
    if (step === 'profile' && !profile) return;
    saveFlowSnapshot({
      step,
      profile,
      baselineBefore,
      baselineAfter,
      roles,
      analysisSource,
      geminiError,
      barrierResult,
    });
  }, [step, profile, baselineBefore, baselineAfter, roles, analysisSource, geminiError, barrierResult]);

  useEffect(() => {
    if (step === 'results' && roles.length > 0) {
      unlockPusulaBadge(BADGE_IDS.ROLES);
    }
  }, [step, roles]);

  const handleFlowStart = useCallback(async () => {
    clearCompletionNotifyFlag();
    clearFlowSnapshot();
    clearProfileDraft();
    setProfile(null);
    setRoles([]);
    setBarrierResult(null);
    setGeminiError('');
    setAnalysisSource(getLlmProvider() === 'groq' ? 'groq' : 'gemini');
    setBaselineBefore(3);
    setBaselineAfter(3);
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

  const handleResume = useCallback(async () => {
    const s = loadFlowSnapshot();
    if (!s) {
      if (hasProfileDraft()) {
        if (!matrix || !opportunities) {
          setDataLoading(true);
          setDataError('');
          try {
            const d = await loadPusulaData();
            setMatrix(d.matrix);
            setOpportunities(d.opportunities);
          } catch (e) {
            setDataError(e?.message ?? 'Veri yüklenemedi');
            setStep('home');
            return;
          } finally {
            setDataLoading(false);
          }
        }
        setStep('profile');
        logEvent('flow_resume', { step: 'profile', source: 'profile_draft' });
        return;
      }
      return;
    }

    let nextStep = resumeTargetStep(s);
    if (nextStep !== 'profile' && !s.profile) nextStep = 'profile';
    if (nextStep === 'results' && (!Array.isArray(s.roles) || s.roles.length === 0)) nextStep = 'baseline';

    setProfile(s.profile ?? null);
    setBaselineBefore(typeof s.baselineBefore === 'number' ? s.baselineBefore : 3);
    setBaselineAfter(typeof s.baselineAfter === 'number' ? s.baselineAfter : 3);
    setRoles(Array.isArray(s.roles) ? s.roles : []);
    setAnalysisSource(
      s.analysisSource === 'fallback' ? 'fallback' : s.analysisSource === 'groq' ? 'groq' : 'gemini',
    );
    setGeminiError(typeof s.geminiError === 'string' ? s.geminiError : '');
    setBarrierResult(s.barrierResult ?? null);

    if (!matrix || !opportunities) {
      setDataLoading(true);
      setDataError('');
      try {
        const d = await loadPusulaData();
        setMatrix(d.matrix);
        setOpportunities(d.opportunities);
      } catch (e) {
        setDataError(e?.message ?? 'Veri yüklenemedi');
        setStep('home');
        return;
      } finally {
        setDataLoading(false);
      }
    }

    setStep(nextStep);
    logEvent('flow_resume', { step: nextStep });
  }, [matrix, opportunities]);

  const runAnalysis = useCallback(async () => {
    if (!profile || !matrix?.length) return;
    setStep('analyzing');
    setGeminiError('');
    try {
      const key = getLlmApiKey();
      const out = await runCareerAnalysis({ apiKey: key, profile, matrix });
      setRoles(out.roles);
      savePusulaSession({
        answers: { profile, baselineConfidenceBefore: baselineBefore },
        roles: out.roles,
      });
      const src = getLlmProvider() === 'groq' ? 'groq' : 'gemini';
      setAnalysisSource(src);
      logEvent('analysis_done', { source: src });
      setStep('results');
    } catch (e) {
      const row = getDisciplineById(matrix, profile.disciplineId);
      const r = rolesFromMatrix(row);
      setRoles(r);
      savePusulaSession({
        answers: { profile, baselineConfidenceBefore: baselineBefore },
        roles: r,
      });
      setAnalysisSource('fallback');
      setGeminiError(e?.message ?? String(e));
      logEvent('analysis_done', { source: 'fallback', error: e?.message ?? String(e) });
      setStep('results');
    }
  }, [profile, matrix, baselineBefore]);

  const goHome = useCallback(() => {
    setLandingInfoSectionId(null);
    setRoadmapTrackId(null);
    setOrientationResult(null);
    setStep('home');
    logEvent('nav_home_logo', {});
  }, []);

  useEffect(() => {
    if (step === 'roadmapTrack' && !roadmapTrackId) setStep('roadmapHub');
  }, [step, roadmapTrackId]);

  useEffect(() => {
    if (step === 'orientationResult' && !orientationResult) setStep('orientationQuiz');
  }, [step, orientationResult]);

  const goToPreviousStep = useCallback(() => {
    const prev = getPreviousStep(step);
    if (!prev) return;
    logEvent('flow_previous_step', { from: step, to: prev });
    setStep(prev);
  }, [step]);

  const resetFlow = () => {
    clearInviteReferralState();
    clearFlowSnapshot();
    clearProfileDraft();
    setLandingInfoSectionId(null);
    setRoadmapTrackId(null);
    setOrientationResult(null);
    setStep('home');
    setProfile(null);
    setBaselineBefore(3);
    setBaselineAfter(3);
    setRoles([]);
    setAnalysisSource(getLlmProvider() === 'groq' ? 'groq' : 'gemini');
    setGeminiError('');
    setBarrierResult(null);
  };

  const finishBarrier = (res) => {
    setBarrierResult(res);
    setStep('barrierReview');
    logEvent('barrier_complete', {});
  };

  const handleBarrierLlmRetry = useCallback(async () => {
    if (!barrierResult || !profile || !matrix) return;
    const text = barrierResult.barrierText?.trim();
    if (!text) {
      setStep('barrier');
      return;
    }
    const key = getLlmApiKey()?.trim();
    if (!key) {
      setStep('barrier');
      return;
    }
    logEvent('barrier_llm_retry', {});
    setBarrierRetryBusy(true);
    setBarrierResult((prev) => (prev ? { ...prev, llmError: undefined } : prev));
    const matrixSuggestion = buildMatrixBarrierSuggestion({ profile, matrix, barrierText: text });
    try {
      const llm = await runBarrierReframe({
        apiKey: key,
        barrierText: text,
        profileSummary: barrierProfileSummary,
      });
      setBarrierResult({ llm, matrix: matrixSuggestion, barrierText: text });
    } catch (e) {
      logEvent('barrier_llm_error', { message: e?.message ?? String(e), retry: true });
      setBarrierResult({
        llm: null,
        matrix: matrixSuggestion,
        llmError: e?.message ?? 'Yapay zeka yanıtı alınamadı',
        barrierText: text,
      });
    } finally {
      setBarrierRetryBusy(false);
    }
  }, [barrierResult, profile, matrix, barrierProfileSummary]);

  const apiKey = getLlmApiKey();

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-gradient-to-br from-indigo-50 via-white to-orange-50 font-sans text-slate-900">
      <div className="pointer-events-none absolute left-[-10%] top-[-10%] h-[40%] w-[40%] rounded-full bg-pusula-purple/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-10%] right-[-10%] h-[40%] w-[40%] rounded-full bg-pusula-coral/15 blur-3xl" />

      <nav className="relative z-20 w-full max-w-full px-1 py-4 sm:px-2 sm:py-5 lg:px-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between sm:gap-x-4 sm:gap-y-3">
          <div className="flex w-full min-w-0 shrink-0 sm:w-auto sm:max-w-[min(100%,28rem)]">
            <button
              type="button"
              onClick={goHome}
              className="group flex min-w-0 cursor-pointer items-center gap-2 rounded-xl border-0 bg-transparent p-0 text-left transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:ring-offset-2 sm:gap-3"
              aria-label="Ana sayfaya dön"
            >
              <div className="shrink-0 rounded-xl bg-indigo-600 p-2 transition-transform duration-300 group-hover:rotate-12 sm:p-3">
                <Compass className="h-6 w-6 text-white sm:h-8 sm:w-8" aria-hidden />
              </div>
              <span className="min-w-0 truncate bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-2xl font-bold leading-tight tracking-tight text-transparent sm:text-[2rem] sm:leading-none">
                Pusula
              </span>
            </button>
          </div>

          <div className="flex min-w-0 flex-col gap-2 sm:max-w-[min(100%,42rem)] sm:items-end">
            <PusulaBadgesStrip />
            {step !== 'home' && step !== 'landingInfo' && (
              <div className="w-full rounded-full border border-white/40 bg-white/40 px-3 py-2 text-center text-[11px] font-semibold leading-snug text-slate-700 backdrop-blur-sm sm:w-auto sm:px-4 sm:text-right sm:text-xs">
                {navLabel}
              </div>
            )}
          </div>
        </div>
      </nav>

      {step === 'home' && (
        <LandingPage
          onStart={handleFlowStart}
          onResume={handleResume}
          onOpenRoadmaps={() => {
            setRoadmapTrackId(null);
            setStep('roadmapHub');
          }}
          onOpenOrientation={() => {
            setOrientationResult(null);
            setStep('orientationQuiz');
          }}
          onOpenInfo={(sectionId) => {
            setLandingInfoSectionId(sectionId ?? null);
            setStep('landingInfo');
          }}
          resumeAvailable={hasResumeAvailable()}
          resumeSummary={getResumeSummaryText()}
        />
      )}

      {step === 'roadmapHub' && (
        <RoadmapHubPage
          onBack={goHome}
          onSelectTrack={(id) => {
            setRoadmapTrackId(id);
            setStep('roadmapTrack');
          }}
        />
      )}

      {step === 'roadmapTrack' && roadmapTrackId && (
        <RoadmapTrackPage
          trackId={roadmapTrackId}
          onBack={() => {
            setRoadmapTrackId(null);
            setStep('roadmapHub');
          }}
        />
      )}

      {step === 'orientationQuiz' && (
        <OrientationQuizPage
          onBack={goHome}
          onComplete={(r) => {
            setOrientationResult(r);
            setStep('orientationResult');
          }}
        />
      )}

      {step === 'orientationResult' && orientationResult && (
        <OrientationResultPage result={orientationResult} onBack={() => setStep('orientationQuiz')} onHome={goHome} />
      )}

      {step === 'landingInfo' && (
        <LandingInfoPage
          initialSectionId={landingInfoSectionId}
          aiBrandLabel={getLlmBrandLabel()}
          onBack={() => {
            setLandingInfoSectionId(null);
            setStep('home');
          }}
        />
      )}

      {step === 'profile' && (
        <>
          {dataLoading && (
            <main className="mx-auto w-full max-w-none px-1 py-16 text-center text-slate-600 sm:px-2 lg:px-3">
              Veriler yükleniyor…
            </main>
          )}
          {!dataLoading && dataError && (
            <main className="mx-auto w-full max-w-none px-1 py-16 text-center sm:px-2 lg:px-3">
              <p className="text-red-600">{dataError}</p>
              <Button className="mt-4" onClick={() => setStep('home')}>
                Ana sayfaya dön
              </Button>
            </main>
          )}
          {!dataLoading && !dataError && matrix && (
            <ProfilePage
              matrix={matrix}
              onPreviousStep={goToPreviousStep}
              onSubmit={(p) => {
                unlockPusulaBadge(BADGE_IDS.PROFILE);
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
          onPreviousStep={goToPreviousStep}
          onNext={runAnalysis}
        />
      )}

      {step === 'analyzing' && <AnalyzingPage />}

      {step === 'results' && profile && opportunities && (
        <ResultsPage
          profile={profile}
          matrix={matrix}
          roles={roles}
          opportunities={opportunities}
          analysisSource={analysisSource}
          geminiErrorMessage={geminiError}
          onRetryAnalysis={() => {
            logEvent('analysis_retry', {});
            runAnalysis();
          }}
          onContinue={() => {
            void postInviterCompletionOnce({ profile, roles });
            setStep('barrier');
          }}
          onPreviousStep={goToPreviousStep}
        />
      )}

      {step === 'barrier' && (
        <BarrierPage
          apiKey={apiKey}
          profile={profile}
          matrix={matrix}
          profileSummary={barrierProfileSummary}
          onResult={(res) => {
            unlockPusulaBadge(BADGE_IDS.BARRIER);
            finishBarrier(res);
          }}
          onSkip={() => {
            logEvent('barrier_skip', {});
            const matrixSuggestion = buildMatrixBarrierSuggestion({
              profile,
              matrix,
              barrierText: '',
            });
            finishBarrier({
              llm: { ...BARRIER_STATIC_FALLBACK },
              matrix: matrixSuggestion,
              skippedLlm: true,
            });
          }}
          onPreviousStep={goToPreviousStep}
        />
      )}

      {step === 'barrierReview' && barrierResult && (
        <BarrierReviewPage
          result={barrierResult}
          onPreviousStep={goToPreviousStep}
          onRetryLlm={handleBarrierLlmRetry}
          retryBusy={barrierRetryBusy}
          onNext={() => setStep('postsurvey')}
        />
      )}

      {step === 'postsurvey' && (
        <PostSurveyPage
          baselineBefore={baselineBefore}
          value={baselineAfter}
          onChange={setBaselineAfter}
          onPreviousStep={goToPreviousStep}
          onNext={() => setStep('card')}
        />
      )}

      {step === 'card' && profile && (
        <FinalCardPage
          profile={profile}
          roles={roles}
          baselineBefore={baselineBefore}
          baselineAfter={baselineAfter}
          onPreviousStep={goToPreviousStep}
          onHome={resetFlow}
          onCardDownloaded={() => unlockPusulaBadge(BADGE_IDS.CARD)}
        />
      )}
    </div>
  );
};

export default App;
