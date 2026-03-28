import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronDown, ExternalLink, Loader2, RefreshCw, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { opportunitiesForRole, buildWebhookOpportunities } from '../lib/opportunitiesFilter.js';
import { logEvent } from '../lib/analytics.js';
import {
  DEFAULT_DAY_IN_LIFE,
  DEFAULT_SALARY_RANGE,
  findDayInLifeInMatrix,
  findEmployersInMatrix,
  findInternshipProgramsInMatrix,
  findSalaryRangeInMatrix,
  validateDayInLife,
  validateSalaryRange,
} from '../lib/dataLoader.js';
import { normalizeEmployersList } from '../lib/employersNormalize.js';
import { normalizeInternshipPrograms } from '../lib/internshipsNormalize.js';
import { getLlmBrandLabel } from '../lib/llmConfig.js';

function getRoleTitlesForWebhook(roles) {
  return (roles ?? [])
    .map((r) => {
      if (typeof r?.roleName === 'string' && r.roleName.trim()) return r.roleName.trim();
      if (typeof r?.title === 'string' && r.title.trim()) return r.title.trim();
      return '';
    })
    .filter(Boolean);
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());
}

function resolveDayInLife(matrix, profile, role) {
  if (validateDayInLife(role?.dayInLife)) {
    return {
      morning: role.dayInLife.morning.trim(),
      afternoon: role.dayInLife.afternoon.trim(),
      evening: role.dayInLife.evening.trim(),
    };
  }
  const fromMatrix = findDayInLifeInMatrix(matrix, profile?.disciplineId, role);
  if (fromMatrix) return fromMatrix;
  return DEFAULT_DAY_IN_LIFE;
}

function resolveSalaryRange(matrix, profile, role) {
  if (validateSalaryRange(role?.salaryRange)) {
    return {
      junior: role.salaryRange.junior.trim(),
      mid: role.salaryRange.mid.trim(),
      senior: role.salaryRange.senior.trim(),
      source: role.salaryRange.source.trim(),
    };
  }
  const fromMatrix = findSalaryRangeInMatrix(matrix, profile?.disciplineId, role);
  if (fromMatrix) return fromMatrix;
  return DEFAULT_SALARY_RANGE;
}

function resolveEmployers(matrix, profile, role) {
  const fromRole = normalizeEmployersList(role?.employersTurkey, 8);
  if (fromRole.length) return fromRole;
  const fromMatrix = findEmployersInMatrix(matrix, profile?.disciplineId, role);
  if (fromMatrix?.length) return normalizeEmployersList(fromMatrix, 8);
  return [];
}

function resolveInternships(matrix, profile, role) {
  const fromRole = normalizeInternshipPrograms(role?.internshipPrograms, 6);
  if (fromRole.length) return fromRole;
  const fromMatrix = findInternshipProgramsInMatrix(matrix, profile?.disciplineId, role);
  if (fromMatrix?.length) return normalizeInternshipPrograms(fromMatrix, 6);
  return [];
}

/** n8n / e-posta webhook’u: uygulamadaki sonuç kartlarıyla uyumlu zengin gövde */
function buildRichWebhookPayload({
  email,
  profile,
  matrix,
  roles,
  opportunities,
  cityId,
  analysisSource,
}) {
  const rolesDetail = (roles ?? []).map((role) => {
    const dil = resolveDayInLife(matrix, profile, role);
    const sr = resolveSalaryRange(matrix, profile, role);
    const employers = resolveEmployers(matrix, profile, role)
      .slice(0, 8)
      .map(({ name, url }) => ({ name, url: url || '' }));
    const internships = resolveInternships(matrix, profile, role).slice(0, 5).map((p) => ({
      name: p.name,
      url: p.url,
      summary: typeof p.summary === 'string' ? p.summary.slice(0, 400) : '',
    }));
    return {
      roleName: typeof role?.roleName === 'string' ? role.roleName : '',
      tags: Array.isArray(role?.tags) ? role.tags : [],
      whyFits: Array.isArray(role?.whyFits) ? role.whyFits : [],
      firstSteps: Array.isArray(role?.firstSteps) ? role.firstSteps : [],
      starterResources: Array.isArray(role?.starterResources) ? role.starterResources : [],
      dayInLife: dil,
      salaryRange: {
        junior: sr.junior,
        mid: sr.mid,
        senior: sr.senior,
        source: sr.source,
      },
      employers,
      internships,
    };
  });

  return {
    email,
    timestamp: new Date().toISOString(),
    city: profile?.cityLabel ?? profile?.cityId ?? '',
    cityId,
    analysisSource,
    aiProviderLabel: analysisSource === 'fallback' ? 'Matris yedeği' : getLlmBrandLabel(),
    profile: {
      disciplineLabel: profile?.disciplineLabel ?? '',
      disciplineId: profile?.disciplineId ?? '',
      interests: profile?.interests ?? [],
      strengths: profile?.strengths ?? [],
      learningStyle: profile?.learningStyle ?? '',
      goal: profile?.goal ?? '',
    },
    roles: getRoleTitlesForWebhook(roles),
    rolesDetail,
    opportunities: buildWebhookOpportunities(roles, opportunities, 3, cityId),
  };
}

/** Sonuç kartında etiket: yapay zeka mı, matris mi (fallback’te rol nesnesi matristen dolduğu için ayrı kural). */
function narrativeSourceLabel(analysisSource) {
  if (analysisSource === 'fallback') return 'Matris rehberi';
  return `${getLlmBrandLabel()} önerisi`;
}

function structuredSourceType(matrix, profile, role, analysisSource, kind) {
  if (analysisSource === 'fallback') {
    if (kind === 'day') {
      if (validateDayInLife(role?.dayInLife) || findDayInLifeInMatrix(matrix, profile?.disciplineId, role))
        return 'matrix';
      return 'default';
    }
    if (kind === 'salary') {
      if (validateSalaryRange(role?.salaryRange) || findSalaryRangeInMatrix(matrix, profile?.disciplineId, role))
        return 'matrix';
      return 'default';
    }
    if (kind === 'employers') return 'matrix';
    if (kind === 'internships') return 'matrix';
  }
  if (kind === 'day') {
    if (validateDayInLife(role?.dayInLife)) return 'llm';
    if (findDayInLifeInMatrix(matrix, profile?.disciplineId, role)) return 'matrix';
    return 'default';
  }
  if (kind === 'salary') {
    if (validateSalaryRange(role?.salaryRange)) return 'llm';
    if (findSalaryRangeInMatrix(matrix, profile?.disciplineId, role)) return 'matrix';
    return 'default';
  }
  if (kind === 'employers') {
    if (normalizeEmployersList(role?.employersTurkey, 8).length) return 'llm';
    if (findEmployersInMatrix(matrix, profile?.disciplineId, role)?.length) return 'matrix';
    return 'default';
  }
  if (kind === 'internships') {
    if (normalizeInternshipPrograms(role?.internshipPrograms, 6).length) return 'llm';
    if (findInternshipProgramsInMatrix(matrix, profile?.disciplineId, role)?.length) return 'matrix';
    return 'default';
  }
  return 'default';
}

function structuredSourceLabel(sourceType, analysisSource) {
  if (sourceType === 'matrix') return 'Matris rehberi';
  if (sourceType === 'default') return 'Genel şablon';
  if (analysisSource === 'fallback') return 'Matris rehberi';
  return `${getLlmBrandLabel()} önerisi`;
}

function ResultSectionSourceTag({ label }) {
  const isMatrix = label.startsWith('Matris');
  const isTemplate = label.includes('Genel şablon');
  const isProgramData = label.includes('Program verisi');
  const isLlm = !isMatrix && !isTemplate && !isProgramData;
  return (
    <span
      className={[
        'shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold leading-none',
        isMatrix && 'bg-emerald-100 text-emerald-900 ring-1 ring-emerald-200/80',
        isTemplate && 'bg-slate-100 text-slate-600 ring-1 ring-slate-200/80',
        isProgramData && 'bg-sky-100 text-sky-900 ring-1 ring-sky-200/80',
        isLlm && 'bg-violet-100 text-violet-900 ring-1 ring-violet-200/80',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {label}
    </span>
  );
}

export function ResultsPage({
  profile,
  matrix,
  roles,
  opportunities,
  analysisSource,
  geminiErrorMessage,
  onRetryAnalysis,
  onContinue,
}) {
  const [email, setEmail] = useState('');
  const [emailSending, setEmailSending] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [dayMainOpen, setDayMainOpen] = useState({});
  const [dayPeriodOpen, setDayPeriodOpen] = useState({});
  const [salaryMainOpen, setSalaryMainOpen] = useState({});
  const [internMainOpen, setInternMainOpen] = useState({});

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setEmailError('');
    const trimmed = email.trim();
    if (!isValidEmail(trimmed)) {
      setEmailError('Geçerli bir e-posta adresi gir.');
      return;
    }
    const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL;
    if (!webhookUrl || !String(webhookUrl).trim()) {
      setEmailError('Webhook adresi tanımlı değil (.env içinde VITE_N8N_WEBHOOK_URL).');
      return;
    }

    const cityId = profile?.cityId ?? 'all';
    const payload = buildRichWebhookPayload({
      email: trimmed,
      profile,
      matrix,
      roles,
      opportunities,
      cityId,
      analysisSource,
    });

    setEmailSending(true);
    try {
      const res = await fetch(String(webhookUrl).trim(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      setEmailSuccess(true);
      logEvent('results_email_webhook', { ok: true });
    } catch (err) {
      setEmailSuccess(false);
      setEmailError('Gönderilemedi. Bağlantını kontrol et veya bir süre sonra tekrar dene.');
      logEvent('results_email_webhook', { ok: false, error: err?.message ?? String(err) });
    } finally {
      setEmailSending(false);
    }
  };

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
          {profile?.cityId && profile.cityId !== 'all' && (
            <span className="mt-1 block text-xs text-slate-500">
              Fırsat filtresi:{' '}
              <span className="whitespace-nowrap font-medium text-slate-700">
                {profile.cityLabel ?? profile.cityId}
              </span>{' '}
              — şehre uygun kaynaklar öne alınır; yine de çevrim içi ve Türkiye geneli programlar gösterilir.
            </span>
          )}
        </p>
        {geminiErrorMessage && analysisSource === 'fallback' && (
          <p className="mt-2 text-xs text-slate-500">Teknik not: {geminiErrorMessage}</p>
        )}
      </motion.div>

      <div className="grid gap-6">
        {roles.map((role, idx) => {
          const opps = opportunitiesForRole(role, opportunities, 3, profile?.cityId ?? 'all');
          const dil = resolveDayInLife(matrix, profile, role);
          const sr = resolveSalaryRange(matrix, profile, role);
          const employers = resolveEmployers(matrix, profile, role);
          const internships = resolveInternships(matrix, profile, role);
          const daySrc = structuredSourceType(matrix, profile, role, analysisSource, 'day');
          const salarySrc = structuredSourceType(matrix, profile, role, analysisSource, 'salary');
          const empSrc = structuredSourceType(matrix, profile, role, analysisSource, 'employers');
          const intSrc = structuredSourceType(matrix, profile, role, analysisSource, 'internships');
          const internOpen = !!internMainOpen[idx];
          const mainOpen = !!dayMainOpen[idx];
          const periodKey = dayPeriodOpen[idx] ?? null;
          const salaryOpen = !!salaryMainOpen[idx];
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
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="text-sm font-bold text-slate-800">Neden uygun?</h4>
                    <ResultSectionSourceTag label={narrativeSourceLabel(analysisSource)} />
                  </div>
                  <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-600">
                    {(role.whyFits ?? []).map((line, i) => (
                      <li key={i}>{line}</li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="text-sm font-bold text-slate-800">İlk 3 adım</h4>
                    <ResultSectionSourceTag label={narrativeSourceLabel(analysisSource)} />
                  </div>
                  <ol className="mt-2 list-inside list-decimal space-y-1 text-sm text-slate-600">
                    {(role.firstSteps ?? []).map((line, i) => (
                      <li key={i}>{line}</li>
                    ))}
                  </ol>
                </div>

                <div className="mt-6">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="text-sm font-bold text-slate-800">Başlangıç kaynakları</h4>
                    <ResultSectionSourceTag label={narrativeSourceLabel(analysisSource)} />
                  </div>
                  <ul className="mt-2 space-y-1 text-sm text-slate-600">
                    {(role.starterResources ?? []).map((line, i) => (
                      <li key={i}>{line}</li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-1">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-2 rounded-xl px-3 py-3 text-left text-sm font-bold text-slate-800 transition hover:bg-white/90"
                    aria-expanded={mainOpen}
                    onClick={() => {
                      setDayMainOpen((p) => ({ ...p, [idx]: !p[idx] }));
                    }}
                  >
                    <span className="min-w-0 pr-2">Bir günün nasıl geçer? 👀</span>
                    <span className="flex shrink-0 items-center gap-2">
                      <ResultSectionSourceTag label={structuredSourceLabel(daySrc, analysisSource)} />
                      <ChevronDown
                        className={`h-5 w-5 text-slate-500 transition-transform ${mainOpen ? 'rotate-180' : ''}`}
                        aria-hidden
                      />
                    </span>
                  </button>
                  {mainOpen && (
                    <div className="space-y-1 border-t border-slate-200/70 p-2 pb-3">
                      {[
                        { key: 'morning', label: 'Sabah', emoji: '☀️', text: dil.morning },
                        { key: 'afternoon', label: 'Öğleden Sonra', emoji: '🌤️', text: dil.afternoon },
                        { key: 'evening', label: 'Akşam', emoji: '🌙', text: dil.evening },
                      ].map(({ key, label, emoji, text }) => {
                        const open = periodKey === key;
                        return (
                          <div
                            key={key}
                            className="overflow-hidden rounded-xl border border-white/50 bg-white/75 shadow-sm"
                          >
                            <button
                              type="button"
                              className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-sm font-semibold text-slate-800 transition hover:bg-white"
                              aria-expanded={open}
                              onClick={() =>
                                setDayPeriodOpen((p) => ({
                                  ...p,
                                  [idx]: p[idx] === key ? null : key,
                                }))
                              }
                            >
                              <span>
                                {emoji} {label}
                              </span>
                              <ChevronDown
                                className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`}
                                aria-hidden
                              />
                            </button>
                            {open && (
                              <p className="border-t border-slate-100 px-3 pb-3 pt-2 text-sm leading-relaxed text-slate-600">
                                {text}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="mt-6 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-1">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-2 rounded-xl px-3 py-3 text-left text-sm font-bold text-slate-800 transition hover:bg-white/90"
                    aria-expanded={salaryOpen}
                    onClick={() => {
                      setSalaryMainOpen((p) => ({ ...p, [idx]: !p[idx] }));
                    }}
                  >
                    <span className="min-w-0 pr-2">Maaş aralığı 💰</span>
                    <span className="flex shrink-0 items-center gap-2">
                      <ResultSectionSourceTag label={structuredSourceLabel(salarySrc, analysisSource)} />
                      <ChevronDown
                        className={`h-5 w-5 text-slate-500 transition-transform ${salaryOpen ? 'rotate-180' : ''}`}
                        aria-hidden
                      />
                    </span>
                  </button>
                  {salaryOpen && (
                    <div className="border-t border-slate-200/70 px-3 pb-3 pt-1">
                      {[
                        { key: 'junior', label: 'Juniör', range: sr.junior },
                        { key: 'mid', label: 'Orta seviye', range: sr.mid },
                        { key: 'senior', label: 'Kıdemli', range: sr.senior },
                      ].map((row, rowIdx) => (
                        <div
                          key={row.key}
                          className={`flex flex-col gap-1 py-3 ${rowIdx < 2 ? 'border-b border-slate-200/60' : ''}`}
                        >
                          <span className="text-sm font-bold text-slate-800">{row.label}</span>
                          <span className="text-sm font-semibold tabular-nums text-indigo-900">{row.range}</span>
                          <span className="text-xs leading-snug text-slate-500">{sr.source}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {internships.length > 0 && (
                  <div className="mt-6 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-1">
                    <button
                      type="button"
                      className="flex w-full items-center justify-between gap-2 rounded-xl px-3 py-3 text-left text-sm font-bold text-slate-800 transition hover:bg-white/90"
                      aria-expanded={internOpen}
                      onClick={() => setInternMainOpen((p) => ({ ...p, [idx]: !p[idx] }))}
                    >
                      <span className="min-w-0 pr-2">Staj programları 🎓</span>
                      <span className="flex shrink-0 items-center gap-2">
                        <ResultSectionSourceTag label={structuredSourceLabel(intSrc, analysisSource)} />
                        <ChevronDown
                          className={`h-5 w-5 text-slate-500 transition-transform ${internOpen ? 'rotate-180' : ''}`}
                          aria-hidden
                        />
                      </span>
                    </button>
                    {internOpen && (
                      <div className="space-y-3 border-t border-slate-200/70 p-3 pb-3">
                        <p className="text-xs leading-relaxed text-amber-800/90">
                          Başvuru pencereleri yıla ve şirkete göre değişir; linkler yönlendirici olup ilan kapanmış veya
                          yenilenmiş olabilir — mutlaka resmi sayfadaki güncel metni kontrol et.
                        </p>
                        <ul className="space-y-3">
                          {internships.map((prog, pi) => (
                            <li
                              key={`${prog.name}-${pi}`}
                              className="rounded-xl border border-white/50 bg-white/80 p-3 text-left shadow-sm"
                            >
                              <a
                                href={prog.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() =>
                                  logEvent('internship_click', { name: prog.name, role: role.roleName })
                                }
                                className="inline-flex items-center gap-1 text-sm font-bold text-indigo-700 hover:text-indigo-900"
                              >
                                {prog.name}
                                <ExternalLink className="h-4 w-4 shrink-0 opacity-70" aria-hidden />
                              </a>
                              <p className="mt-2 text-sm leading-relaxed text-slate-600">{prog.summary}</p>
                              <p className="mt-2 text-xs font-semibold text-slate-700">
                                Kimler başvurabilir?{' '}
                                <span className="font-normal text-slate-600">{prog.eligibility}</span>
                              </p>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {employers.length > 0 && (
                  <div className="mt-6 rounded-2xl bg-slate-50/80 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4 className="text-sm font-bold text-slate-800">Türkiye’de örnek işverenler</h4>
                      <ResultSectionSourceTag label={structuredSourceLabel(empSrc, analysisSource)} />
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      Kesin iş garantisi değildir; kariyer sayfalarını inceleyerek ilan ve staj fırsatlarına
                      bakabilirsin.
                    </p>
                    <ul className="mt-2 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                      {employers.map((entry, ei) => (
                        <li
                          key={`${entry.name}-${ei}`}
                          className="rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700"
                        >
                          {entry.url ? (
                            <a
                              href={entry.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() =>
                                logEvent('employer_career_click', { name: entry.name, role: role.roleName })
                              }
                              className="inline-flex items-center gap-1 px-2 py-1.5 font-semibold text-indigo-700 hover:text-indigo-900"
                            >
                              {entry.name}
                              <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
                            </a>
                          ) : (
                            <span className="block px-2 py-1.5">{entry.name}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-6 border-t border-slate-200/80 pt-6">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="text-sm font-bold text-slate-800">Yerel fırsat radarı (bu rol için)</h4>
                    <ResultSectionSourceTag label="Program verisi" />
                  </div>
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

      <Card className="border-indigo-100 bg-white/90">
        <h3 className="text-lg font-extrabold text-indigo-900">Sonuçlarını e-postayla al</h3>
        <p className="mt-2 text-sm text-slate-600">
          Önerilen rol başlıkları ve şehir bilgin güvenli webhook’a iletilir; n8n veya benzeri bir akışa
          bağlayabilirsin.
        </p>
        {emailSuccess ? (
          <p className="mt-4 text-sm font-semibold text-emerald-700" role="status">
            E-posta gönderildi!
          </p>
        ) : (
          <form className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end" onSubmit={handleEmailSubmit} noValidate>
            <div className="min-w-0 flex-1">
              <label htmlFor="pusula-results-email" className="mb-1 block text-xs font-semibold text-slate-700">
                E-posta
              </label>
              <Input
                id="pusula-results-email"
                type="email"
                name="email"
                autoComplete="email"
                placeholder="ornek@eposta.com"
                value={email}
                onChange={(ev) => {
                  setEmail(ev.target.value);
                  if (emailSuccess) setEmailSuccess(false);
                }}
                disabled={emailSending}
                className="w-full"
              />
            </div>
            <Button type="submit" disabled={emailSending} className="shrink-0 sm:min-w-[120px]">
              {emailSending ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Gönderiliyor…
                </>
              ) : (
                'Gönder'
              )}
            </Button>
          </form>
        )}
        {emailError && (
          <p className="mt-3 text-sm text-red-600" role="alert">
            {emailError}
          </p>
        )}
      </Card>

      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        {analysisSource === 'fallback' && typeof onRetryAnalysis === 'function' && (
          <Button variant="ghost" className="sm:mr-auto" onClick={onRetryAnalysis}>
            <RefreshCw className="h-5 w-5" />
            {getLlmBrandLabel()} ile tekrar dene
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
