import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ExternalLink, RefreshCw, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { opportunitiesForRole } from '../lib/opportunitiesFilter.js';
import { logEvent } from '../lib/analytics.js';

export function ResultsPage({
  profile,
  roles,
  opportunities,
  analysisSource,
  geminiErrorMessage,
  onRetryAnalysis,
  onContinue,
}) {
  return (
    <main className="relative mx-auto flex max-w-4xl flex-col items-stretch gap-8 px-6 pb-16 pt-10 text-left sm:px-8">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <Badge>
            <Sparkles size={16} />
            <span>Sektörel uyumluluk analizi</span>
          </Badge>
          {analysisSource === 'fallback' && (
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">
              API kullanılamadı — disiplin matrisi önerileri gösteriliyor
            </span>
          )}
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-indigo-900">Önerilen 3 rol</h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          {profile?.disciplineLabel && (
            <>
              <span className="font-semibold text-slate-800">{profile.disciplineLabel}</span>
              {' · '}
            </>
          )}
          Profiline göre teknoloji ekosisteminde öne çıkan yollar.
        </p>
        {geminiErrorMessage && analysisSource === 'fallback' && (
          <p className="mt-2 text-xs text-slate-500">Teknik not: {geminiErrorMessage}</p>
        )}
      </motion.div>

      <div className="grid gap-6">
        {roles.map((role, idx) => {
          const opps = opportunitiesForRole(role, opportunities, 3);
          return (
            <motion.div
              key={`${role.roleName}-${idx}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
            >
              <Card>
                <div className="mb-2 text-xs font-bold uppercase tracking-wide text-indigo-600">
                  Rol {idx + 1}
                </div>
                <h3 className="text-xl font-extrabold text-indigo-950">{role.roleName}</h3>
                <div className="mt-2 flex flex-wrap gap-1">
                  {(role.tags ?? []).map((t) => (
                    <span
                      key={t}
                      className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-800"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                <div className="mt-6">
                  <h4 className="text-sm font-bold text-slate-800">Neden uygun?</h4>
                  <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-600">
                    {(role.whyFits ?? []).map((line, i) => (
                      <li key={i}>{line}</li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6">
                  <h4 className="text-sm font-bold text-slate-800">İlk 3 adım</h4>
                  <ol className="mt-2 list-inside list-decimal space-y-1 text-sm text-slate-600">
                    {(role.firstSteps ?? []).map((line, i) => (
                      <li key={i}>{line}</li>
                    ))}
                  </ol>
                </div>

                <div className="mt-6">
                  <h4 className="text-sm font-bold text-slate-800">Başlangıç kaynakları</h4>
                  <ul className="mt-2 space-y-1 text-sm text-slate-600">
                    {(role.starterResources ?? []).map((line, i) => (
                      <li key={i}>{line}</li>
                    ))}
                  </ul>
                </div>

                {role.employersTurkey?.length > 0 && (
                  <div className="mt-6 rounded-2xl bg-slate-50/80 p-4">
                    <h4 className="text-sm font-bold text-slate-800">Türkiye’de örnek işverenler</h4>
                    <p className="mt-1 text-xs text-slate-500">
                      Kesin iş garantisi değildir; sektörde bu rollere yakın ekipleri hatırlatmak içindir.
                    </p>
                    <ul className="mt-2 flex flex-wrap gap-2">
                      {role.employersTurkey.map((name) => (
                        <li
                          key={name}
                          className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700"
                        >
                          {name}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-6 border-t border-slate-200/80 pt-6">
                  <h4 className="text-sm font-bold text-slate-800">Yerel fırsat radarı (bu rol için)</h4>
                  <ul className="mt-3 space-y-3">
                    {opps.map((o) => (
                      <li
                        key={o.opportunityId}
                        className="flex flex-col gap-1 rounded-2xl border border-white/40 bg-white/50 p-3 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <div className="font-semibold text-slate-900">{o.name}</div>
                          <div className="text-xs text-slate-500">
                            {o.type === 'program' && 'Program'}
                            {o.type === 'community' && 'Topluluk'}
                            {o.type === 'course' && 'Kurs / içerik'}
                            {o.type === 'scholarship' && 'Burs / destek'}
                            {' · '}
                            {o.forWho}
                          </div>
                        </div>
                        <a
                          href={o.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() =>
                            logEvent('opportunity_click', { opportunityId: o.opportunityId, role: role.roleName })
                          }
                          className="inline-flex items-center gap-1 text-sm font-bold text-indigo-600 hover:text-indigo-800"
                        >
                          Siteye git
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        {analysisSource === 'fallback' && typeof onRetryAnalysis === 'function' && (
          <Button variant="ghost" className="sm:mr-auto" onClick={onRetryAnalysis}>
            <RefreshCw className="h-5 w-5" />
            Gemini ile tekrar dene
          </Button>
        )}
        <Button size="lg" className="sm:ml-auto" onClick={onContinue}>
          Engel kırıcıya geç
          <ArrowRight className="h-5 w-5" />
        </Button>
      </div>
    </main>
  );
}
