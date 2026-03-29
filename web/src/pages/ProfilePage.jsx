import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { flowPreviousStepButtonClass } from '../lib/flowPreviousStepButton.js';

const INTEREST_OPTIONS = [
  'Veri ve analiz',
  'Tasarım ve kullanıcı deneyimi',
  'Ürün ve strateji',
  'Araştırma ve yazım',
  'Sosyal etki ve sürdürülebilirlik',
  'Oyun ve etkileşim',
];

const STRENGTH_OPTIONS = [
  'Analitik düşünme',
  'Empati ve iletişim',
  'Sunum ve ikna',
  'Öğrenmeye açıklık',
  'Detay ve düzen',
  'Yaratıcılık',
];

const LEARNING_OPTIONS = [
  { id: 'project', label: 'Kendi kendime küçük projeler yaparak' },
  { id: 'course', label: 'Yapılandırılmış kurs ve bootcamp ile' },
  { id: 'mentor', label: 'Mentorluk ve topluluk etkinlikleriyle' },
  { id: 'mixed', label: 'Karışık (hepsi)' },
];

const GOAL_OPTIONS = [
  { id: 'intern', label: 'Staj veya part-time deneyim' },
  { id: 'switch', label: 'Bölümümden teknoloji rolüne geçiş' },
  { id: 'skill', label: 'Belirli bir beceride güçlenmek' },
  { id: 'explore', label: 'Henüz keşfetme aşamasındayım' },
];

const CITY_OPTIONS = [
  { id: 'all', label: 'Tüm Türkiye / belirtmek istemiyorum' },
  { id: 'istanbul', label: 'İstanbul' },
  { id: 'ankara', label: 'Ankara' },
  { id: 'izmir', label: 'İzmir' },
  { id: 'other', label: 'Diğer şehir' },
];

const PREFER_NOT = 'Belirtmek istemiyorum';

function toggleInList(list, item) {
  if (list.includes(item)) return list.filter((x) => x !== item);
  return [...list, item];
}

export function ProfilePage({ matrix, onPreviousStep, onSubmit }) {
  const disciplines = useMemo(() => matrix ?? [], [matrix]);

  const [disciplineId, setDisciplineId] = useState('');
  const [interests, setInterests] = useState([]);
  const [strengths, setStrengths] = useState([]);
  const [interestSkip, setInterestSkip] = useState(false);
  const [strengthSkip, setStrengthSkip] = useState(false);
  const [learningStyle, setLearningStyle] = useState('mixed');
  const [goalId, setGoalId] = useState('explore');
  const [goalDetail, setGoalDetail] = useState('');
  const [cityId, setCityId] = useState('all');
  const [errors, setErrors] = useState({});

  const handleInterestSkip = (checked) => {
    setInterestSkip(checked);
    if (checked) setInterests([]);
  };

  const handleStrengthSkip = (checked) => {
    setStrengthSkip(checked);
    if (checked) setStrengths([]);
  };

  const validate = () => {
    const next = {};
    if (!disciplineId) next.disciplineId = 'Lütfen bölüm/disiplin grubunu seç.';

    const effInterests = interestSkip ? [PREFER_NOT] : interests;
    const effStrengths = strengthSkip ? [PREFER_NOT] : strengths;

    if (!interestSkip && effInterests.length === 0) {
      next.interests = 'En az bir ilgi seç veya “Belirtmek istemiyorum” kutusunu işaretle.';
    }
    if (!strengthSkip && effStrengths.length === 0) {
      next.strengths = 'En az bir güçlü yön seç veya “Belirtmek istemiyorum” kutusunu işaretle.';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleContinue = () => {
    if (!validate()) return;

    const row = disciplines.find((d) => d.disciplineId === disciplineId);
    const effInterests = interestSkip ? [PREFER_NOT] : interests;
    const effStrengths = strengthSkip ? [PREFER_NOT] : strengths;
    const goalLabel = GOAL_OPTIONS.find((g) => g.id === goalId)?.label ?? goalId;

    const cityLabel = CITY_OPTIONS.find((c) => c.id === cityId)?.label ?? cityId;

    onSubmit({
      disciplineId,
      disciplineLabel: row?.disciplineName ?? '',
      interests: effInterests,
      strengths: effStrengths,
      learningStyle: LEARNING_OPTIONS.find((l) => l.id === learningStyle)?.label ?? learningStyle,
      goal: goalDetail.trim() ? `${goalLabel}: ${goalDetail.trim()}` : goalLabel,
      cityId,
      cityLabel,
    });
  };

  return (
    <main className="relative mx-auto flex w-full max-w-none flex-col items-stretch px-2 pb-16 pt-10 text-left sm:px-4 lg:px-5">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <Card>
          <div className="mb-3 text-sm font-semibold text-indigo-700">Profil (Çok boyutlu)</div>
          <h2 className="mb-2 text-2xl font-extrabold tracking-tight text-indigo-900">
            Seni tanıyalım
          </h2>
          <p className="mb-8 text-sm leading-relaxed text-slate-600">
            Cevapların Gemini analizi ve yerel fırsat önerileri için kullanılır (şehir seçimi fırsat
            listesini öne çıkarır). İstemediğin alanlarda “Belirtmek istemiyorum” seçeneğini kullanabilirsin.
          </p>

          <div className="space-y-8">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-800">1. Bölüm / disiplin grubu</label>
              <select
                value={disciplineId}
                onChange={(e) => setDisciplineId(e.target.value)}
                className="w-full rounded-2xl bg-white/80 px-4 py-3 text-base text-slate-900 ring-1 ring-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40"
              >
                <option value="">Seçiniz…</option>
                {disciplines.map((d) => (
                  <option key={d.disciplineId} value={d.disciplineId}>
                    {d.disciplineName}
                  </option>
                ))}
              </select>
              {errors.disciplineId && <p className="mt-2 text-sm text-red-600">{errors.disciplineId}</p>}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-800">2. İlgi alanları</label>
              <label className="mb-3 flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                <input type="checkbox" checked={interestSkip} onChange={(e) => handleInterestSkip(e.target.checked)} />
                Belirtmek istemiyorum
              </label>
              <div className="flex flex-wrap gap-2">
                {INTEREST_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    disabled={interestSkip}
                    onClick={() => setInterests((prev) => toggleInList(prev, opt))}
                    className={[
                      'rounded-full border px-3 py-1.5 text-sm font-medium transition',
                      interestSkip
                        ? 'cursor-not-allowed opacity-40'
                        : interests.includes(opt)
                          ? 'border-indigo-600 bg-indigo-600 text-white'
                          : 'border-slate-200 bg-white/80 text-slate-700 hover:border-indigo-300',
                    ].join(' ')}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              {errors.interests && <p className="mt-2 text-sm text-red-600">{errors.interests}</p>}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-800">3. Güçlü yönler</label>
              <label className="mb-3 flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                <input type="checkbox" checked={strengthSkip} onChange={(e) => handleStrengthSkip(e.target.checked)} />
                Belirtmek istemiyorum
              </label>
              <div className="flex flex-wrap gap-2">
                {STRENGTH_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    disabled={strengthSkip}
                    onClick={() => setStrengths((prev) => toggleInList(prev, opt))}
                    className={[
                      'rounded-full border px-3 py-1.5 text-sm font-medium transition',
                      strengthSkip
                        ? 'cursor-not-allowed opacity-40'
                        : strengths.includes(opt)
                          ? 'border-indigo-600 bg-indigo-600 text-white'
                          : 'border-slate-200 bg-white/80 text-slate-700 hover:border-indigo-300',
                    ].join(' ')}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              {errors.strengths && <p className="mt-2 text-sm text-red-600">{errors.strengths}</p>}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-800">4. Öğrenme stili</label>
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
              <label className="mb-2 block text-sm font-semibold text-slate-800">5. Hedef</label>
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
              <label className="mb-2 block text-sm font-semibold text-slate-800">6. Şehir (fırsat filtresi)</label>
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
