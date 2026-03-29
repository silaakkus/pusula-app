import { getDisciplineById } from './dataLoader.js';
import { loadPusulaSession } from './pusulaSession.js';
import { BARRIER_STATIC_FALLBACK } from './barrierFallback.js';

/**
 * LLM çağrısından bağımsız, disiplin matrisi + kayıtlı rol önerilerine dayalı yönlendirme.
 */
export function buildMatrixBarrierSuggestion({ profile, matrix, barrierText }) {
  const session = loadPusulaSession();
  const roles = Array.isArray(session?.roles) ? session.roles : [];
  const discipline =
    profile?.disciplineId && Array.isArray(matrix) ? getDisciplineById(matrix, profile.disciplineId) : null;

  const barrierShort = String(barrierText ?? '').trim().slice(0, 160);

  let reframe;
  if (discipline) {
    reframe = `Pusula’nın disiplin matrisine göre ${discipline.disciplineName} kökünün teknoloji rolleriyle köprü kurulabilir. “${
      barrierShort || 'Paylaştığın endişe'
    }” ifadesini, tek ve kalıcı bir sınırlama değil; netleştirilebilir beceriler ve adımlarla yönetilebilir bir geçiş olarak okumak matris yaklaşımıyla uyumludur.`;
  } else {
    reframe =
      'Matris rehberi, bölümünün teknoloji yollarıyla nasıl bağlanabileceğini çerçeveler; endişeni tek başına bir “yetersizlik” olarak değil, küçük öğrenme adımlarıyla aşılabilen bir geçiş noktası olarak görmek önerilir.';
  }

  const actions = [];

  const r0 = roles[0];
  const r1 = roles[1];
  const title0 = r0?.roleName ?? r0?.title ?? '';
  const title1 = r1?.roleName ?? r1?.title ?? '';

  if (r0?.firstSteps?.[0]) {
    actions.push(
      title0
        ? `Önerilen “${title0}” rotası (matris/oturum): ${r0.firstSteps[0]}`
        : `Matris/oturum önerisi: ${r0.firstSteps[0]}`,
    );
  } else if (discipline?.roleMatches?.[0]) {
    const rm = discipline.roleMatches[0];
    const why = (rm.whyFits?.[0] ?? '').trim().slice(0, 220);
    actions.push(why ? `Matristeki “${rm.roleName}”: ${why}` : `Matristeki “${rm.roleName}” rotasını incele.`);
  }

  if (r1?.firstSteps?.[0]) {
    actions.push(
      title1
        ? `Önerilen “${title1}” rotası (matris/oturum): ${r1.firstSteps[0]}`
        : `Matris/oturum önerisi: ${r1.firstSteps[0]}`,
    );
  } else if (r0?.firstSteps?.[1]) {
    actions.push(
      title0
        ? `“${title0}” için sonraki adım: ${r0.firstSteps[1]}`
        : String(r0.firstSteps[1]),
    );
  }

  let i = 0;
  while (actions.length < 2) {
    actions.push(BARRIER_STATIC_FALLBACK.actions[i % BARRIER_STATIC_FALLBACK.actions.length]);
    i += 1;
  }

  return { reframe, actions: actions.slice(0, 2).map((s) => String(s).trim()) };
}