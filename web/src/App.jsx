import React, { useMemo, useState } from 'react';
import { Compass } from 'lucide-react';
import { LandingPage } from './pages/LandingPage';
import { BaselinePage } from './pages/BaselinePage';

const App = () => {
  const [route, setRoute] = useState('home'); // 'home' | 'flow' | 'result'
  const [baselineConfidence, setBaselineConfidence] = useState(3);

  const stepLabel = useMemo(() => {
    if (route === 'flow') return 'Adım 2/7 · Baseline';
    if (route === 'result') return 'Adım 7/7 · Çıktı';
    return 'Adım 1/7 · Landing';
  }, [route]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-orange-50 font-sans text-slate-900">
      {/* Dekoratif Arka Plan Elementleri */}
      <div className="pointer-events-none absolute left-[-10%] top-[-10%] h-[40%] w-[40%] rounded-full bg-pusula-purple/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-10%] right-[-10%] h-[40%] w-[40%] rounded-full bg-pusula-coral/15 blur-3xl" />

      {/* Navigasyon */}
      <nav className="relative mx-auto flex w-full max-w-none items-center justify-between px-4 py-6 sm:px-6 lg:px-10">
        <div className="group flex items-center gap-2">
          <div className="rounded-lg bg-indigo-600 p-2 transition-transform duration-300 group-hover:rotate-12">
            <Compass className="h-6 w-6 text-white" />
          </div>
          <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-2xl font-bold tracking-tight text-transparent">
            Pusula
          </span>
        </div>

        <div className="hidden rounded-full border border-white/40 bg-white/40 px-4 py-2 text-xs font-semibold text-slate-700 backdrop-blur-sm sm:block">
          {stepLabel}
        </div>
      </nav>

      {route === 'home' && <LandingPage onStart={() => setRoute('flow')} />}

      {route === 'flow' && (
        <BaselinePage
          value={baselineConfidence}
          onChange={setBaselineConfidence}
          onBack={() => setRoute('home')}
          onNext={() => setRoute('result')}
        />
      )}

      {route === 'result' && (
        <main className="relative mx-auto flex w-full max-w-none flex-col items-stretch px-4 pb-16 pt-10 sm:px-6 lg:px-10">
          <div className="rounded-3xl border border-white/30 bg-white/60 p-8 shadow-xl shadow-indigo-100 backdrop-blur-sm">
            <div className="text-sm font-semibold text-indigo-700">Result (placeholder)</div>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-indigo-900">
              Sonuç ekranı bir sonraki adım.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Şimdilik Adım 0 kapsamında sadece sayfa iskeleti kuruldu.
            </p>
          </div>
        </main>
      )}
    </div>
  );
};

export default App;
