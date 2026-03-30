import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  ExternalLink,
  Loader2,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { opportunitiesForRoleWithLlm, buildWebhookOpportunities } from '../lib/opportunitiesFilter.js';
import { logEvent } from '../lib/analytics.js';
import {
  DEFAULT_DAY_IN_LIFE,
  DEFAULT_SALARY_RANGE,
  findDayInLifeInMatrix,
  findEmployersInMatrix,
  findEmployersInMatrixByTags,
  findInternshipProgramsInMatrix,
  findInternshipProgramsInMatrixByTags,
  findSalaryRangeInMatrix,
  validateDayInLife,
  validateSalaryRange,
} from '../lib/dataLoader.js';
import { normalizeEmployersList } from '../lib/employersNormalize.js';
import {
  normalizeInternshipPrograms,
  normalizeInternshipProgramsWithLlmFallback,
} from '../lib/internshipsNormalize.js';
import { getLlmBrandLabel } from '../lib/llmConfig.js';
import { flowPreviousStepButtonClass } from '../lib/flowPreviousStepButton.js';
import { postInviterCompletionOnce } from '../lib/inviteReferral.js';
import { ORIENTATION_ARCHETYPE_LABELS } from '../lib/orientationQuiz.js';

const MATRIX_SALARY_METHODOLOGY =
  'Pusula disiplin matrisinde bu rol için tanımlı rehber bantlar; kaynak satırında adı geçen iş ilanı ve ücret araştırma sitelerinin 2024–2025 dönemine yakın göstergeleriyle hizalanmıştır. Şehir, şirket ve yan haklara göre değişir; kesin teklif değildir.';

const LLM_SALARY_METHODOLOGY_FALLBACK =
  'Yapay zekâ tarafından üretilmiştir; LinkedIn, Kariyer.net, Glassdoor TR, Indeed TR ve benzeri kamuya açık ilan ve ücret göstergelerinin genel bandlarıyla uyumlu yaklaşık brüt aylık aralıklardır. Somut bir veri seti veya resmi istatistik iddiası yoktur; şehir ve sektöre göre sapma beklenir.';

function inferSalaryReferencePeriod(text) {
  const m = String(text ?? '').match(/20\d{2}/g);
  if (m?.length) return [...new Set(m)].slice(0, 4).join(', ');
  return '2025–2026 (tahmine dayalı)';
}

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

function normalizeProgramStepText(step) {
  const text = String(step ?? '').trim();
  if (!text) return '';
  const lower = text.toLowerCase();
  const hasThirtyMin = /30\s*dak/.test(lower);
  const isProgramLike = /(program|up school|sisterslab|bootcamp|akademi|academy)/i.test(text);
  if (hasThirtyMin && isProgramLike) {
    return 'Programın başvuru/takvim sayfasını kontrol et; canlı ders saatlerinden uygun oturumu takvimine ekleyip kaydını tamamla.';
  }
  return text;
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

/** LLM (Groq/Gemini) maaş tahmini önce, ardından matris; ikisi de varsa UI’da yan yana. */
function resolveSalaryBlocks(matrix, profile, role) {
  const blocks = [];
  if (validateSalaryRange(role?.salaryRange)) {
    const sr = role.salaryRange;
    const methodology =
      typeof sr.methodology === 'string' && sr.methodology.trim()
        ? sr.methodology.trim()
        : LLM_SALARY_METHODOLOGY_FALLBACK;
    const referenceYear =
      typeof sr.referenceYear === 'string' && sr.referenceYear.trim()
        ? sr.referenceYear.trim()
        : inferSalaryReferencePeriod(sr.source);
    blocks.push({
      junior: sr.junior.trim(),
      mid: sr.mid.trim(),
      senior: sr.senior.trim(),
      source: sr.source.trim(),
      methodology,
      referenceYear,
      _from: 'llm',
    });
  }
  const fromMatrix = findSalaryRangeInMatrix(matrix, profile?.disciplineId, role);
  if (fromMatrix && validateSalaryRange(fromMatrix)) {
    blocks.push({
      junior: fromMatrix.junior.trim(),
      mid: fromMatrix.mid.trim(),
      senior: fromMatrix.senior.trim(),
      source: fromMatrix.source.trim(),
      methodology: MATRIX_SALARY_METHODOLOGY,
      referenceYear: inferSalaryReferencePeriod(fromMatrix.source),
      _from: 'matrix',
    });
  }
  if (blocks.length === 0) {
    blocks.push({
      junior: DEFAULT_SALARY_RANGE.junior,
      mid: DEFAULT_SALARY_RANGE.mid,
      senior: DEFAULT_SALARY_RANGE.senior,
      source: DEFAULT_SALARY_RANGE.source,
      methodology: MATRIX_SALARY_METHODOLOGY,
      referenceYear: inferSalaryReferencePeriod(DEFAULT_SALARY_RANGE.source),
      _from: 'default',
    });
  }
  return blocks;
}

function salaryBlockTagLabel(from, analysisSource) {
  if (from === 'matrix') return 'Matris rehberi';
  if (from === 'default') return 'Genel şablon';
  if (analysisSource === 'fallback') return 'Matris rehberi';
  return `${getLlmBrandLabel()} tahmini`;
}

function employerNameKey(name) {
  return String(name ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

/** Matris rehberi + Groq employersTurkey; aynı isim tekil. */
function resolveEmployers(matrix, profile, role) {
  const matrixDirect = findEmployersInMatrix(matrix, profile?.disciplineId, role) ?? [];
  const matrixByTags = findEmployersInMatrixByTags(matrix, profile?.disciplineId, role) ?? [];
  const fromMatrix = normalizeEmployersList([...matrixDirect, ...matrixByTags], 10).map((e) => ({
    ...e,
    _source: 'matrix',
  }));
  const fromLlm = normalizeEmployersList(role?.employersTurkey, 6).map((e) => ({ ...e, _source: 'llm' }));
  const seen = new Set();
  const out = [];
  for (const e of [...fromMatrix, ...fromLlm]) {
    const k = employerNameKey(e.name);
    if (!k || seen.has(k)) continue;
    seen.add(k);
    out.push(e);
    if (out.length >= 14) break;
  }
  return out;
}

/** LLM staj linkleri ile matris stajlarını birleştirir; `_source`: `llm` | `matrix`. */
function resolveInternships(matrix, profile, role) {
  const fromLlm = normalizeInternshipProgramsWithLlmFallback(role?.internshipPrograms, 6).map((p) => ({
    ...p,
    _source: 'llm',
  }));
  const matrixDirect = findInternshipProgramsInMatrix(matrix, profile?.disciplineId, role) ?? [];
  const matrixByTags = findInternshipProgramsInMatrixByTags(matrix, profile?.disciplineId, role) ?? [];
  const fromMatrix = normalizeInternshipPrograms([...matrixDirect, ...matrixByTags], 8).map((p) => ({
    ...p,
    _source: 'matrix',
  }));
  const seen = new Set();
  const out = [];
  for (const p of fromLlm) {
    if (seen.has(p.url)) continue;
    seen.add(p.url);
    out.push(p);
  }
  for (const p of fromMatrix) {
    if (seen.has(p.url)) continue;
    seen.add(p.url);
    out.push(p);
    if (out.length >= 10) break;
  }
  return out;
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
  orientationResult,
}) {
  const rolesDetail = (roles ?? []).map((role) => {
    const dil = resolveDayInLife(matrix, profile, role);
    const salaryBlocks = resolveSalaryBlocks(matrix, profile, role);
    const pickSalary = (from) => salaryBlocks.find((b) => b._from === from);
    const salaryChunk = (b) =>
      b
        ? {
            junior: b.junior,
            mid: b.mid,
            senior: b.senior,
            source: b.source,
            referenceYear: b.referenceYear,
            methodology: b.methodology,
          }
        : null;
    const primarySalary = salaryBlocks[0];
    const employers = resolveEmployers(matrix, profile, role)
      .slice(0, 14)
      .map(({ name, url, _source }) => ({ name, url: url || '', source: _source === 'llm' ? 'llm' : 'matrix' }));
    const internships = resolveInternships(matrix, profile, role).slice(0, 5).map((p) => ({
      name: p.name,
      url: p.url,
      summary: typeof p.summary === 'string' ? p.summary.slice(0, 400) : '',
      eligibility: typeof p.eligibility === 'string' ? p.eligibility.slice(0, 400) : '',
      source: p._source === 'llm' ? 'llm' : 'matrix',
    }));
    const llmApplicationPrograms = Array.isArray(role?.llmApplicationPrograms)
      ? role.llmApplicationPrograms.map((p) => ({
          name: p.name,
          url: p.url,
          forWho: p.forWho ?? '',
        }))
      : [];
    return {
      roleName: typeof role?.roleName === 'string' ? role.roleName : '',
      tags: Array.isArray(role?.tags) ? role.tags : [],
      whyFits: Array.isArray(role?.whyFits) ? role.whyFits : [],
      firstSteps: Array.isArray(role?.firstSteps) ? role.firstSteps.map((s) => normalizeProgramStepText(s)) : [],
      starterResources: Array.isArray(role?.starterResources) ? role.starterResources : [],
      dayInLife: dil,
      salaryRange: {
        ...salaryChunk(primarySalary),
        primaryOrigin: primarySalary._from,
      },
      salaryRangesByOrigin: {
        llm: salaryChunk(pickSalary('llm')),
        matrix: salaryChunk(pickSalary('matrix')),
        default: salaryChunk(pickSalary('default')),
      },
      employers,
      internships,
      llmApplicationPrograms,
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
      facultyLabel: profile?.facultyLabel ?? '',
      departmentLabel: profile?.departmentLabel ?? '',
      interests: profile?.interests ?? [],
      strengths: profile?.strengths ?? [],
      learningStyle: profile?.learningStyle ?? '',
      goal: profile?.goal ?? '',
      availabilityLabel: profile?.availabilityLabel ?? '',
      workModeLabel: profile?.workModeLabel ?? '',
      workEnvironmentLabel: profile?.workEnvironmentLabel ?? '',
      impactThemeLabel: profile?.impactThemeLabel ?? '',
      techDomainInterests: profile?.techDomainInterests ?? [],
      techHandsOnInterests: profile?.techHandsOnInterests ?? [],
      techContextInterests: profile?.techContextInterests ?? [],
    },
    orientation: orientationResult
      ? {
          archetype: orientationResult.archetype ?? '',
          archetypeLabel: ORIENTATION_ARCHETYPE_LABELS[orientationResult.archetype] ?? orientationResult.archetype ?? '',
          headline: orientationResult.headline ?? '',
          subline: orientationResult.subline ?? '',
          source: orientationResult.source ?? '',
        }
      : null,
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
      const llm = validateSalaryRange(role?.salaryRange);
      const mat = !!findSalaryRangeInMatrix(matrix, profile?.disciplineId, role);
      if (llm && mat) return 'mixed-salary';
      if (llm) return 'matrix';
      if (mat) return 'matrix';
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
    const llm = validateSalaryRange(role?.salaryRange);
    const mat = !!findSalaryRangeInMatrix(matrix, profile?.disciplineId, role);
    if (llm && mat) return 'mixed-salary';
    if (llm) return 'llm';
    if (mat) return 'matrix';
    return 'default';
  }
  if (kind === 'employers') {
    const llmN = normalizeEmployersList(role?.employersTurkey, 6).length;
    const matDirectN = findEmployersInMatrix(matrix, profile?.disciplineId, role)?.length ?? 0;
    const matTagN = findEmployersInMatrixByTags(matrix, profile?.disciplineId, role)?.length ?? 0;
    const matN = Math.max(matDirectN, matTagN);
    if (llmN && matN) return 'mixed-employers';
    if (llmN) return 'llm';
    if (matN) return 'matrix';
    return 'default';
  }
  if (kind === 'internships') {
    const llmN = normalizeInternshipProgramsWithLlmFallback(role?.internshipPrograms, 6).length;
    const matRaw = findInternshipProgramsInMatrix(matrix, profile?.disciplineId, role);
    const matTagRaw = findInternshipProgramsInMatrixByTags(matrix, profile?.disciplineId, role);
    const matN = Math.max(Array.isArray(matRaw) ? matRaw.length : 0, Array.isArray(matTagRaw) ? matTagRaw.length : 0);
    if (llmN && matN) return 'mixed-internships';
    if (llmN) return 'llm';
    if (matN) return 'matrix';
    return 'default';
  }
  return 'default';
}

function structuredSourceLabel(sourceType, analysisSource) {
  if (sourceType === 'matrix') return 'Matris rehberi';
  if (sourceType === 'mixed-salary') return `Matris + ${getLlmBrandLabel()}`;
  if (sourceType === 'mixed-internships') return `Matris + ${getLlmBrandLabel()}`;
  if (sourceType === 'mixed-employers') return `Matris + ${getLlmBrandLabel()}`;
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

const TAG_HELP = {
  data: 'Data: Veriyi toplama, temizleme, analiz etme ve anlamlı içgörü üretme odağı.',
  analytics: 'Analytics: KPI takibi, raporlama ve karar destek için veri yorumlama becerileri.',
  fintech: 'Fintech: Finans + teknoloji kesişimi; ödeme, bankacılık ve risk ürünleri alanı.',
  ux: 'UX: Kullanıcı deneyimini araştırma, test etme ve iyileştirme yaklaşımı.',
  pm: 'PM: Ürün yönetimi; kullanıcı ihtiyacını iş hedefiyle birleştirip önceliklendirme.',
  'ai-ethics': 'AI Ethics: Yapay zekada adalet, güvenilirlik, şeffaflık ve sorumlu kullanım odağı.',
  hrtech: 'HRTech: İnsan kaynakları süreçlerini teknoloji ve veriyle iyileştirme alanı.',
  biotech: 'Biotech: Biyoloji ve teknolojiyi birleştirerek sağlık/yaşam bilimleri çözümleri üretme.',
  sustainability: 'Sustainability: Çevresel etkiyi azaltan, sürdürülebilir ürün ve süreç yaklaşımı.',
  gamedev: 'GameDev: Oyun tasarımı, oyun mekaniği, topluluk ve canlı operasyon süreçleri.',
  edtech: 'EdTech: Eğitim teknolojileri; öğrenme deneyimini dijital araçlarla güçlendirme.',
  'marketing-analytics': 'Marketing Analytics: Kampanya performansını ölçme ve büyüme kararları alma.',
  research: 'Research: Araştırma odaklı çalışma; nitel/nicel veriyle hipotez test etme.',
};

function formatTagLabel(tag) {
  return String(tag ?? '')
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function ResultsPage({
  profile,
  matrix,
  roles,
  opportunities,
  orientationResult,
  analysisSource,
  geminiErrorMessage,
  onRetryAnalysis,
  onContinue,
  onPreviousStep,
}) {
  const [email, setEmail] = useState('');
  const [emailSending, setEmailSending] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [dayMainOpen, setDayMainOpen] = useState({});
  const [dayPeriodOpen, setDayPeriodOpen] = useState({});
  const [salaryMainOpen, setSalaryMainOpen] = useState({});
  const [internMainOpen, setInternMainOpen] = useState({});
  const [activeTagByRole, setActiveTagByRole] = useState({});

  useEffect(() => {
    if (!Array.isArray(roles) || roles.length === 0) return;
    void postInviterCompletionOnce({ profile, roles });
  }, [roles, profile]);

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
      orientationResult,
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
    <main className="relative mx-auto flex w-full max-w-none flex-col items-stretch gap-8 px-1 pb-16 pt-10 text-left sm:px-2 lg:px-3">
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
        <h2 className="text-3xl font-extrabold tracking-tight text-indigo-900">Önerilen rol haritası</h2>
        <p className="mt-2 max-w-none text-sm text-slate-600">
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
          const opps = opportunitiesForRoleWithLlm(role, opportunities, 3, profile?.cityId ?? 'all', idx);
          const dil = resolveDayInLife(matrix, profile, role);
          const salaryBlocks = resolveSalaryBlocks(matrix, profile, role);
          const salaryMixed =
            salaryBlocks.some((b) => b._from === 'llm') && salaryBlocks.some((b) => b._from === 'matrix');
          const employers = resolveEmployers(matrix, profile, role);
          const empMixed =
            employers.some((e) => e._source === 'llm') && employers.some((e) => e._source === 'matrix');
          const internships = resolveInternships(matrix, profile, role);
          const internMixed =
            internships.some((p) => p._source === 'llm') && internships.some((p) => p._source === 'matrix');
          const daySrc = structuredSourceType(matrix, profile, role, analysisSource, 'day');
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
                    <button
                      key={t}
                      type="button"
                      onClick={() =>
                        setActiveTagByRole((prev) => ({
                          ...prev,
                          [idx]: prev[idx] === t ? null : t,
                        }))
                      }
                      className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-800 ring-1 ring-indigo-200/70 hover:bg-indigo-100"
                    >
                      {formatTagLabel(t)}
                    </button>
                  ))}
                </div>
                {activeTagByRole[idx] ? (
                  <p className="mt-2 rounded-lg border border-indigo-100 bg-indigo-50/60 px-2.5 py-2 text-xs leading-relaxed text-indigo-900">
                    {TAG_HELP[activeTagByRole[idx]] ??
                      `${formatTagLabel(activeTagByRole[idx])}: Bu etiket, rolün odaklandığı beceri alanını ifade eder.`}
                  </p>
                ) : null}

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
                      <li key={i}>{normalizeProgramStepText(line)}</li>
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
                    <span className="flex shrink-0 flex-wrap items-center justify-end gap-1">
                      {salaryBlocks.some((b) => b._from === 'llm') && (
                        <ResultSectionSourceTag label={salaryBlockTagLabel('llm', analysisSource)} />
                      )}
                      {salaryBlocks.some((b) => b._from === 'matrix') && (
                        <ResultSectionSourceTag label="Matris rehberi" />
                      )}
                      {salaryBlocks.some((b) => b._from === 'default') && (
                        <ResultSectionSourceTag label="Genel şablon" />
                      )}
                      <ChevronDown
                        className={`h-5 w-5 text-slate-500 transition-transform ${salaryOpen ? 'rotate-180' : ''}`}
                        aria-hidden
                      />
                    </span>
                  </button>
                  {salaryOpen && (
                    <div className="border-t border-slate-200/70 px-3 pb-3 pt-2">
                      {salaryMixed && (
                        <p className="mb-3 text-xs leading-relaxed text-slate-600">
                          Aşağıda yapay zekânın güncel piyasa tahmini ile matris rehberi yan yana; gerçek ücret şirket,
                          şehir ve deneyime göre değişir.
                        </p>
                      )}
                      {salaryBlocks.map((block, bi) => (
                        <div
                          key={`${block._from}-${bi}`}
                          className={bi > 0 ? 'mt-4 border-t border-slate-200/60 pt-4' : ''}
                        >
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            <ResultSectionSourceTag label={salaryBlockTagLabel(block._from, analysisSource)} />
                          </div>
                          {[
                            { key: 'junior', label: 'Juniör', range: block.junior },
                            { key: 'mid', label: 'Orta seviye', range: block.mid },
                            { key: 'senior', label: 'Kıdemli', range: block.senior },
                          ].map((row, rowIdx) => (
                            <div
                              key={row.key}
                              className={`flex flex-col gap-1 py-3 ${rowIdx < 2 ? 'border-b border-slate-200/60' : ''}`}
                            >
                              <span className="text-sm font-bold text-slate-800">{row.label}</span>
                              <span className="text-sm font-semibold tabular-nums text-indigo-900">{row.range}</span>
                            </div>
                          ))}
                          <p className="mt-2 text-xs font-semibold text-slate-600">
                            Referans dönem / yıl: {block.referenceYear}
                          </p>
                          <p className="mt-1 text-xs leading-relaxed text-slate-600">{block.methodology}</p>
                          <p className="mt-2 text-xs leading-snug text-slate-500">Kaynak özeti: {block.source}</p>
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
                          yenilenmiş olabilir — mutlaka resmi sayfadaki güncel metni kontrol et. Yapay zekâ önerdiği
                          adreslerde de aynı kontrolü yap.
                        </p>
                        <ul className="space-y-3">
                          {internships.map((prog, pi) => (
                            <li
                              key={`${prog.name}-${pi}`}
                              className="rounded-xl border border-white/50 bg-white/80 p-3 text-left shadow-sm"
                            >
                              <div className="flex flex-wrap items-center gap-2">
                                {prog.url ? (
                                  <a
                                    href={prog.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() =>
                                      logEvent('internship_click', {
                                        name: prog.name,
                                        role: role.roleName,
                                        source: prog._source,
                                      })
                                    }
                                    className="inline-flex items-center gap-1 text-sm font-bold text-indigo-700 hover:text-indigo-900"
                                  >
                                    {prog.name}
                                    <ExternalLink className="h-4 w-4 shrink-0 opacity-70" aria-hidden />
                                  </a>
                                ) : (
                                  <span className="text-sm font-bold text-slate-800">{prog.name}</span>
                                )}
                                {internMixed && prog._source === 'llm' && (
                                  <ResultSectionSourceTag label={`${getLlmBrandLabel()} önerisi`} />
                                )}
                                {internMixed && prog._source === 'matrix' && (
                                  <ResultSectionSourceTag label="Matris rehberi" />
                                )}
                              </div>
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
                      <div className="flex flex-wrap items-center justify-end gap-1">
                        {empMixed && (
                          <>
                            <ResultSectionSourceTag label="Matris rehberi" />
                            <ResultSectionSourceTag label={`${getLlmBrandLabel()} önerisi`} />
                          </>
                        )}
                        {!empMixed && <ResultSectionSourceTag label={structuredSourceLabel(empSrc, analysisSource)} />}
                      </div>
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
                          <div className="flex flex-wrap items-center gap-1.5 px-2 py-1.5">
                            {entry.url ? (
                              <a
                                href={entry.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() =>
                                  logEvent('employer_career_click', {
                                    name: entry.name,
                                    role: role.roleName,
                                    source: entry._source,
                                  })
                                }
                                className="inline-flex items-center gap-1 font-semibold text-indigo-700 hover:text-indigo-900"
                              >
                                {entry.name}
                                <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
                              </a>
                            ) : (
                              <span className="font-semibold text-slate-800">{entry.name}</span>
                            )}
                            {empMixed && entry._source === 'llm' && (
                              <ResultSectionSourceTag label={`${getLlmBrandLabel()} önerisi`} />
                            )}
                            {empMixed && entry._source === 'matrix' && (
                              <ResultSectionSourceTag label="Matris rehberi" />
                            )}
                            {!empMixed && empSrc === 'llm' && (
                              <ResultSectionSourceTag label={`${getLlmBrandLabel()} önerisi`} />
                            )}
                            {!empMixed && empSrc === 'matrix' && (
                              <ResultSectionSourceTag label="Matris rehberi" />
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-6 border-t border-slate-200/80 pt-6">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="text-sm font-bold text-slate-800">Fırsat radarı (bu rol için)</h4>
                    <div className="flex flex-wrap gap-1">
                      {opps.some((o) => !o.fromLlm) && <ResultSectionSourceTag label="Program verisi" />}
                      {opps.some((o) => o.fromLlm) && (
                        <ResultSectionSourceTag label={`${getLlmBrandLabel()} link önerisi`} />
                      )}
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    Yerel veri ile yapay zekâ önerileri aynı listede; etiketten kaynağı ayırt edebilirsin. Tüm
                    bağlantılarda resmi sayfadaki güncel metni doğrula.
                  </p>
                  <ul className="mt-3 space-y-3">
                    {opps.map((o) => (
                      <li
                        key={o.opportunityId}
                        className="flex flex-col gap-2 rounded-2xl border border-white/40 bg-white/50 p-3 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <div className="font-semibold text-slate-900">{o.name}</div>
                            {o.fromLlm ? (
                              <ResultSectionSourceTag label={`${getLlmBrandLabel()} link önerisi`} />
                            ) : (
                              <ResultSectionSourceTag label="Program verisi" />
                            )}
                          </div>
                          <div className="mt-1 text-xs text-slate-500">
                            {o.fromLlm
                              ? 'Başvuru / program sayfası · '
                              : [
                                  o.type === 'program' && 'Program',
                                  o.type === 'community' && 'Topluluk',
                                  o.type === 'course' && 'Kurs / içerik',
                                  o.type === 'scholarship' && 'Burs / destek',
                                ]
                                  .filter(Boolean)
                                  .join('') || 'Program'}
                            {!o.fromLlm && ' · '}
                            {o.forWho}
                          </div>
                        </div>
                        {o.url ? (
                          <a
                            href={o.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() =>
                              logEvent('opportunity_click', {
                                opportunityId: o.opportunityId,
                                role: role.roleName,
                                fromLlm: !!o.fromLlm,
                              })
                            }
                            className="inline-flex shrink-0 items-center gap-1 self-start text-sm font-bold text-indigo-600 hover:text-indigo-800 sm:self-center"
                          >
                            Siteye git
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        ) : (
                          <span className="shrink-0 self-start text-xs text-slate-400 sm:self-center">
                            Bağlantı yok
                          </span>
                        )}
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
          E-posta adresine, profil özetin, önerilen roller, maaş ve staj bağlantıları ile program önerilerinin
          derlendiği bir özet gönderilir. Posta kutunu bir süre sonra kontrol etmeyi unutma. Aynı veya farklı adrese
          istediğin kadar tekrar gönderebilirsin.
        </p>
        {emailSuccess && (
          <p className="mt-4 text-sm font-semibold text-emerald-700" role="status">
            E-posta gönderildi! Özeti başka bir adrese veya tekrar aynı adrese göndermek için alanı düzenleyip
            &quot;Gönder&quot;e bas.
          </p>
        )}
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
            ) : emailSuccess ? (
              'Tekrar gönder'
            ) : (
              'Gönder'
            )}
          </Button>
        </form>
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
        <div className="flex flex-wrap items-center justify-end gap-3 sm:ml-auto">
          {typeof onPreviousStep === 'function' && (
            <Button type="button" variant="ghost" onClick={onPreviousStep} className={flowPreviousStepButtonClass}>
              <ArrowLeft className="h-5 w-5" aria-hidden />
              Önceki adım
            </Button>
          )}
          <Button size="lg" onClick={onContinue}>
            Engel kırıcıya geç
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </main>
  );
}
