import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { flowPreviousStepButtonClass } from '../lib/flowPreviousStepButton.js';
import { clearProfileDraft, loadProfileDraft, saveProfileDraft } from '../lib/profileDraft.js';
import { getLlmBrandLabel } from '../lib/llmConfig.js';
import { HACETTEPE_FACULTIES, getDepartmentById } from '../lib/hacettepeDepartments.js';

function readProfileDraftInitial() {
  const d = loadProfileDraft();
  if (!d || typeof d !== 'object') {
    return {
      facultyId: '',
      departmentId: '',
      disciplineId: '',
      deptInterests: [],
      joyActivities: [],
      deptInterestSkip: false,
      joySkip: false,
      learningStyle: 'mixed',
      goalId: 'explore',
      goalDetail: '',
      disciplineFocus: '',
      availability: 'medium',
      workMode: 'balanced',
      workEnvironment: 'hybrid',
      impactTheme: 'social-impact',
      cityId: 'all',
    };
  }
  return {
    facultyId: d.facultyId ?? '',
    departmentId: d.departmentId ?? '',
    disciplineId: d.disciplineId ?? '',
    deptInterests: Array.isArray(d.deptInterests) ? d.deptInterests : [],
    joyActivities: Array.isArray(d.joyActivities) ? d.joyActivities : [],
    deptInterestSkip: Boolean(d.deptInterestSkip),
    joySkip: Boolean(d.joySkip),
    learningStyle: d.learningStyle ?? 'mixed',
    goalId: d.goalId ?? 'explore',
    goalDetail: typeof d.goalDetail === 'string' ? d.goalDetail : '',
    disciplineFocus: typeof d.disciplineFocus === 'string' ? d.disciplineFocus : '',
    availability: d.availability ?? 'medium',
    workMode: d.workMode ?? 'balanced',
    workEnvironment: d.workEnvironment ?? 'hybrid',
    impactTheme: d.impactTheme ?? 'social-impact',
    cityId: d.cityId ?? 'all',
  };
}

const LEARNING_OPTIONS = [
  { id: 'project', label: 'Kendi kendime küçük projeler yaparak' },
  { id: 'course', label: 'Yapılandırılmış kurs ve bootcamp ile' },
  { id: 'mentor', label: 'Mentorluk ve topluluk etkinlikleriyle' },
  { id: 'mixed', label: 'Karışık (hepsi)' },
  { id: 'challenge', label: 'Hackathon / challenge ve uygulamalı görevlerle' },
  { id: 'internship', label: 'Staj içinde öğrenme ve gerçek görevlerle' },
];

const GOAL_OPTIONS = [
  { id: 'intern', label: 'Staj veya part-time deneyim' },
  { id: 'switch', label: 'Bölümümden teknoloji rolüne geçiş' },
  { id: 'skill', label: 'Belirli bir beceride güçlenmek' },
  { id: 'explore', label: 'Henüz keşfetme aşamasındayım' },
  { id: 'career', label: 'Mezuniyet sonrası teknoloji rolüne doğrudan başlamak' },
  { id: 'startup', label: 'Girişim veya ürün fikri geliştirmek' },
];

const CITY_OPTIONS = [
  { id: 'all', label: 'Tüm Türkiye / belirtmek istemiyorum' },
  { id: 'istanbul', label: 'İstanbul' },
  { id: 'ankara', label: 'Ankara' },
  { id: 'izmir', label: 'İzmir' },
  { id: 'other', label: 'Diğer şehir' },
];

const AVAILABILITY_OPTIONS = [
  { id: 'low', label: 'Haftada 2-4 saat (çok yoğun)' },
  { id: 'medium', label: 'Haftada 5-8 saat (dengeli)' },
  { id: 'high', label: 'Haftada 9+ saat (hızlı ilerleme)' },
  { id: 'sprint', label: 'Dönemsel sprintler: bazı haftalar yoğun, bazı haftalar hafif' },
];

const WORK_MODE_OPTIONS = [
  { id: 'solo', label: 'Tek başıma derin çalışmayı seviyorum' },
  { id: 'team', label: 'Ekip içinde fikir alışverişiyle ilerlemeyi seviyorum' },
  { id: 'balanced', label: 'Denge: hem bireysel hem ekip çalışması' },
];

const WORK_ENV_OPTIONS = [
  { id: 'remote', label: 'Uzaktan / dağıtık çalışma bana uygun' },
  { id: 'office', label: 'Ofis ortamı ve yüz yüze iletişim bana uygun' },
  { id: 'hybrid', label: 'Hibrit çalışma benim için en verimli' },
];

const IMPACT_THEME_OPTIONS = [
  { id: 'social-impact', label: 'Toplumsal etki ve erişilebilirlik' },
  { id: 'health', label: 'Sağlık ve yaşam kalitesi' },
  { id: 'finance', label: 'Finansal kapsayıcılık ve ekonomi' },
  { id: 'education', label: 'Eğitim ve öğrenme deneyimi' },
  { id: 'sustainability', label: 'Sürdürülebilirlik ve çevre' },
  { id: 'productivity', label: 'İş süreçlerinde verimlilik' },
];

const PREFER_NOT = 'Belirtmek istemiyorum';

function toggleInList(list, item) {
  if (list.includes(item)) return list.filter((x) => x !== item);
  return [...list, item];
}

export function ProfilePage({ matrix, onPreviousStep, onSubmit }) {
  const disciplines = useMemo(() => matrix ?? [], [matrix]);
  const draftIni = useMemo(() => readProfileDraftInitial(), []);
  const aiBrandLabel = getLlmBrandLabel();

  const [facultyId, setFacultyId] = useState(draftIni.facultyId);
  const [departmentId, setDepartmentId] = useState(draftIni.departmentId);
  const [disciplineId, setDisciplineId] = useState(draftIni.disciplineId);
  const [deptInterests, setDeptInterests] = useState(draftIni.deptInterests);
  const [joyActivities, setJoyActivities] = useState(draftIni.joyActivities);
  const [deptInterestSkip, setDeptInterestSkip] = useState(draftIni.deptInterestSkip);
  const [joySkip, setJoySkip] = useState(draftIni.joySkip);
  const [learningStyle, setLearningStyle] = useState(draftIni.learningStyle);
  const [goalId, setGoalId] = useState(draftIni.goalId);
  const [goalDetail, setGoalDetail] = useState(draftIni.goalDetail);
  const [availability, setAvailability] = useState(draftIni.availability);
  const [workMode, setWorkMode] = useState(draftIni.workMode);
  const [workEnvironment, setWorkEnvironment] = useState(draftIni.workEnvironment);
  const [impactTheme, setImpactTheme] = useState(draftIni.impactTheme);
  const [cityId, setCityId] = useState(draftIni.cityId);
  const [errors, setErrors] = useState({});
  const selectedFaculty = useMemo(() => HACETTEPE_FACULTIES.find((f) => f.id === facultyId) ?? null, [facultyId]);
  const selectedDepartment = useMemo(() => getDepartmentById(facultyId, departmentId), [facultyId, departmentId]);
  const deptInterestOptions = selectedDepartment?.focusInterests ?? [];
  const joyOptions = selectedDepartment?.joyActivities ?? [];

  useEffect(() => {
    if (!selectedFaculty) {
      if (departmentId) setDepartmentId('');
      return;
    }
    const valid = selectedFaculty.departments.some((d) => d.id === departmentId);
    if (!valid && departmentId) setDepartmentId('');
  }, [selectedFaculty, departmentId]);

  useEffect(() => {
    setDisciplineId(selectedDepartment?.disciplineId ?? '');
  }, [selectedDepartment]);

  useEffect(() => {
    setDeptInterests((prev) => prev.filter((x) => deptInterestOptions.includes(x)));
    setJoyActivities((prev) => prev.filter((x) => joyOptions.includes(x)));
  }, [deptInterestOptions, joyOptions]);

  useEffect(() => {
    const row = disciplines.find((d) => d.disciplineId === disciplineId);
    const t = window.setTimeout(() => {
      saveProfileDraft({
        facultyId,
        facultyLabel: selectedFaculty?.name ?? '',
        departmentId,
        departmentLabel: selectedDepartment?.name ?? '',
        disciplineId,
        disciplineLabel: row?.disciplineName ?? '',
        deptInterests,
        joyActivities,
        deptInterestSkip,
        joySkip,
        learningStyle,
        goalId,
        goalDetail,
        availability,
        workMode,
        workEnvironment,
        impactTheme,
        cityId,
      });
    }, 450);
    return () => window.clearTimeout(t);
  }, [
    facultyId,
    selectedFaculty,
    departmentId,
    selectedDepartment,
    disciplines,
    disciplineId,
    deptInterests,
    joyActivities,
    deptInterestSkip,
    joySkip,
    learningStyle,
    goalId,
    goalDetail,
    availability,
    workMode,
    workEnvironment,
    impactTheme,
    cityId,
  ]);

  const handleDeptInterestSkip = (checked) => {
    setDeptInterestSkip(checked);
    if (checked) setDeptInterests([]);
  };

  const handleJoySkip = (checked) => {
    setJoySkip(checked);
    if (checked) setJoyActivities([]);
  };

  const validate = () => {
    const next = {};
    if (!facultyId) next.facultyId = 'Lütfen fakülte seç.';
    if (!departmentId) next.departmentId = 'Lütfen bölüm seç.';

    const effDeptInterests = deptInterestSkip ? [PREFER_NOT] : deptInterests;
    const effJoyActivities = joySkip ? [PREFER_NOT] : joyActivities;

    if (!deptInterestSkip && effDeptInterests.length === 0) {
      next.deptInterests = 'En az bir bölüm-ilgisi seç veya “Belirtmek istemiyorum” kutusunu işaretle.';
    }
    if (!joySkip && effJoyActivities.length === 0) {
      next.joyActivities = 'En az bir keyif aldığın aktivite seç veya “Belirtmek istemiyorum” kutusunu işaretle.';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleContinue = () => {
    if (!validate()) return;

    clearProfileDraft();
    const row = disciplines.find((d) => d.disciplineId === disciplineId);
    const effDeptInterests = deptInterestSkip ? [PREFER_NOT] : deptInterests;
    const effJoyActivities = joySkip ? [PREFER_NOT] : joyActivities;
    const goalLabel = GOAL_OPTIONS.find((g) => g.id === goalId)?.label ?? goalId;
    const availabilityLabel = AVAILABILITY_OPTIONS.find((a) => a.id === availability)?.label ?? availability;
    const workModeLabel = WORK_MODE_OPTIONS.find((w) => w.id === workMode)?.label ?? workMode;
    const workEnvironmentLabel = WORK_ENV_OPTIONS.find((w) => w.id === workEnvironment)?.label ?? workEnvironment;
    const impactThemeLabel = IMPACT_THEME_OPTIONS.find((i) => i.id === impactTheme)?.label ?? impactTheme;
    const cityLabel = CITY_OPTIONS.find((c) => c.id === cityId)?.label ?? cityId;

    onSubmit({
      facultyId,
      facultyLabel: selectedFaculty?.name ?? '',
      departmentId,
      departmentLabel: selectedDepartment?.name ?? '',
      disciplineId,
      disciplineLabel: row?.disciplineName ?? '',
      interests: effDeptInterests,
      strengths: effJoyActivities,
      deptInterests: effDeptInterests,
      joyActivities: effJoyActivities,
      learningStyle: LEARNING_OPTIONS.find((l) => l.id === learningStyle)?.label ?? learningStyle,
      goal: goalDetail.trim() ? `${goalLabel}: ${goalDetail.trim()}` : goalLabel,
      disciplineFocus: effDeptInterests[0] ?? '',
      availability,
      availabilityLabel,
      workMode,
      workModeLabel,
      workEnvironment,
      workEnvironmentLabel,
      impactTheme,
      impactThemeLabel,
      cityId,
      cityLabel,
    });
  };

  return (
    <main className="relative mx-auto flex w-full max-w-none flex-col items-stretch px-1 pb-16 pt-10 text-left sm:px-2 lg:px-3">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <Card>
          <div className="mb-3 text-sm font-semibold text-indigo-700">Profil (Çok boyutlu)</div>
          <h2 className="mb-2 text-xl font-extrabold tracking-tight text-indigo-900 sm:text-2xl">
            Seni tanıyalım
          </h2>
          <p className="mb-8 text-sm leading-relaxed text-slate-600">
            Cevapların {aiBrandLabel} analizi ve yerel fırsat önerileri için kullanılır. Fakülte → bölüm seçimi ve
            bölümüne özel sorularla daha tutarlı rol eşleşmesi üretmeyi hedefliyoruz.
          </p>

          <div className="space-y-8">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-800">1. Fakülte</label>
              <select
                value={facultyId}
                onChange={(e) => setFacultyId(e.target.value)}
                className="w-full rounded-2xl bg-white/80 px-4 py-3 text-base text-slate-900 ring-1 ring-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40"
              >
                <option value="">Seçiniz…</option>
                {HACETTEPE_FACULTIES.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
              {errors.facultyId && <p className="mt-2 text-sm text-red-600">{errors.facultyId}</p>}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-800">2. Bölüm</label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                disabled={!selectedFaculty}
                className="w-full rounded-2xl bg-white/80 px-4 py-3 text-base text-slate-900 ring-1 ring-black/5 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40"
              >
                <option value="">{selectedFaculty ? 'Seçiniz…' : 'Önce fakülte seçiniz…'}</option>
                {(selectedFaculty?.departments ?? []).map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
              {errors.departmentId && <p className="mt-2 text-sm text-red-600">{errors.departmentId}</p>}
              {disciplineId ? (
                <p className="mt-2 text-xs text-slate-500">
                  Eşleşen disiplin grubu:{' '}
                  <span className="font-semibold text-slate-700">
                    {disciplines.find((d) => d.disciplineId === disciplineId)?.disciplineName ?? disciplineId}
                  </span>
                </p>
              ) : null}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-800">3. Bölüm bazlı ilgi alanları</label>
              <label className="mb-3 flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={deptInterestSkip}
                  onChange={(e) => handleDeptInterestSkip(e.target.checked)}
                />
                Belirtmek istemiyorum
              </label>
              <div className="flex flex-wrap gap-2">
                {deptInterestOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    disabled={deptInterestSkip || !selectedDepartment}
                    onClick={() => setDeptInterests((prev) => toggleInList(prev, opt))}
                    className={[
                      'rounded-full border px-3 py-1.5 text-sm font-medium transition',
                      deptInterestSkip || !selectedDepartment
                        ? 'cursor-not-allowed opacity-40'
                        : deptInterests.includes(opt)
                          ? 'border-indigo-600 bg-indigo-600 text-white'
                          : 'border-slate-200 bg-white/80 text-slate-700 hover:border-indigo-300',
                    ].join(' ')}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              {!selectedDepartment ? <p className="mt-2 text-xs text-slate-500">Önce bölüm seçiniz.</p> : null}
              {errors.deptInterests && <p className="mt-2 text-sm text-red-600">{errors.deptInterests}</p>}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-800">
                4. Bölümünde yapmaktan keyif aldığın şeyler
              </label>
              <label className="mb-3 flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                <input type="checkbox" checked={joySkip} onChange={(e) => handleJoySkip(e.target.checked)} />
                Belirtmek istemiyorum
              </label>
              <div className="flex flex-wrap gap-2">
                {joyOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    disabled={joySkip || !selectedDepartment}
                    onClick={() => setJoyActivities((prev) => toggleInList(prev, opt))}
                    className={[
                      'rounded-full border px-3 py-1.5 text-sm font-medium transition',
                      joySkip || !selectedDepartment
                        ? 'cursor-not-allowed opacity-40'
                        : joyActivities.includes(opt)
                          ? 'border-indigo-600 bg-indigo-600 text-white'
                          : 'border-slate-200 bg-white/80 text-slate-700 hover:border-indigo-300',
                    ].join(' ')}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              {!selectedDepartment ? <p className="mt-2 text-xs text-slate-500">Önce bölüm seçiniz.</p> : null}
              {errors.joyActivities && <p className="mt-2 text-sm text-red-600">{errors.joyActivities}</p>}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-800">5. Öğrenme stili</label>
              <div className="space-y-2">
                {LEARNING_OPTIONS.map((opt) => (
                  <label key={opt.id} className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                    <input
                      type="radio"
                      name="learning"
                      checked={learningStyle === opt.id}
                      onChange={() => setLearningStyle(opt.id)}
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-800">6. Hedef</label>
              <select
                value={goalId}
                onChange={(e) => setGoalId(e.target.value)}
                className="mb-3 w-full rounded-2xl bg-white/80 px-4 py-3 text-base text-slate-900 ring-1 ring-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40"
              >
                {GOAL_OPTIONS.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.label}
                  </option>
                ))}
              </select>
              <label className="mb-1 block text-xs font-medium text-slate-500">İstersen kısa detay (opsiyonel)</label>
              <textarea
                value={goalDetail}
                onChange={(e) => setGoalDetail(e.target.value)}
                rows={2}
                placeholder="Örn. yaz stajı, veri görselleştirme, ürün stajyerliği…"
                className="w-full rounded-2xl bg-white/80 px-4 py-3 text-base text-slate-900 ring-1 ring-black/5 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-800">7. Haftalık öğrenme zamanı</label>
              <div className="space-y-2">
                {AVAILABILITY_OPTIONS.map((opt) => (
                  <label key={opt.id} className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                    <input
                      type="radio"
                      name="availability"
                      checked={availability === opt.id}
                      onChange={() => setAvailability(opt.id)}
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-800">8. Çalışma modu tercihi</label>
              <div className="space-y-2">
                {WORK_MODE_OPTIONS.map((opt) => (
                  <label key={opt.id} className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                    <input type="radio" name="work-mode" checked={workMode === opt.id} onChange={() => setWorkMode(opt.id)} />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-800">9. Çalışma ortamı tercihi</label>
              <div className="space-y-2">
                {WORK_ENV_OPTIONS.map((opt) => (
                  <label key={opt.id} className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                    <input
                      type="radio"
                      name="work-environment"
                      checked={workEnvironment === opt.id}
                      onChange={() => setWorkEnvironment(opt.id)}
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-800">10. Etki yaratmak istediğin tema</label>
              <div className="space-y-2">
                {IMPACT_THEME_OPTIONS.map((opt) => (
                  <label key={opt.id} className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                    <input
                      type="radio"
                      name="impact-theme"
                      checked={impactTheme === opt.id}
                      onChange={() => setImpactTheme(opt.id)}
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-800">11. Şehir (fırsat filtresi)</label>
              <p className="mb-3 text-xs text-slate-500">
                Yerel etkinlik ağırlıklı önerileri öne çıkarmak için; çevrim içi ve Türkiye geneli kaynaklar yine
                listelenir.
              </p>
              <select
                value={cityId}
                onChange={(e) => setCityId(e.target.value)}
                className="w-full rounded-2xl bg-white/80 px-4 py-3 text-base text-slate-900 ring-1 ring-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40"
              >
                {CITY_OPTIONS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-end gap-3">
            {typeof onPreviousStep === 'function' && (
              <Button type="button" variant="ghost" onClick={onPreviousStep} className={flowPreviousStepButtonClass}>
                <ArrowLeft className="h-5 w-5" aria-hidden />
                Önceki adım
              </Button>
            )}
            <Button onClick={handleContinue}>
              Devam et
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </Card>
      </motion.div>
    </main>
  );
}
