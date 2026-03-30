/**
 * n8n Code node — Pusula webhook → Gmail HTML
 * Gmail: Message = {{ $json.html }}, Subject = {{ $json.subject }}, To: {{ $json.to }}
 *
 * Not: `esc` ve `safeHref` dosya başında tanımlı olmalı; n8n Code sandbox'ında
 * aksi halde davet_tamamlandi dalında ReferenceError oluşabiliyor.
 */

function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Liste öğesi beklenmedik tip olursa boş / metin — HTML’de [object Object] önleme */
function escLine(s) {
  if (s == null) return '';
  if (typeof s === 'string') return esc(s);
  if (typeof s === 'number' || typeof s === 'boolean') return esc(String(s));
  return '';
}

function safeHref(url) {
  const u = String(url ?? '').trim();
  return /^https?:\/\//i.test(u) ? u : '';
}

/** Webhook: body nesne/string veya kök düz JSON */
function resolveWebhookPayload(item) {
  if (!item || typeof item !== 'object') return {};
  const b = item.body;
  if (b === undefined || b === null) {
    if ('event' in item || 'email' in item || 'roles' in item || 'rolesDetail' in item) return item;
    return item;
  }
  if (typeof b === 'string') {
    try {
      const p = JSON.parse(b);
      if (p && typeof p === 'object' && !Array.isArray(p)) return p;
    } catch {
      /* ignore */
    }
    return {};
  }
  if (typeof b === 'object' && !Array.isArray(b)) return b;
  return {};
}

const rawInput = $input.first();
if (!rawInput || rawInput.json == null) return [];

const data = resolveWebhookPayload(rawInput.json);

/** Davet eden kullanıcıya: arkadaş sonuç sayfasına geldi. */
if (data.event === 'davet_tamamlandi') {
  const inv = String(data.inviterEmail ?? '')
    .trim()
    .toLowerCase();
  const rolesInvite = Array.isArray(data.roles) ? data.roles : [];
  const rolesText = rolesInvite.map((r) => esc(String(r))).join(', ');
  const disc = esc(data.inviteeDiscipline ?? '');
  const city = esc(data.inviteeCity ?? '');
  if (!inv || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inv)) {
    return [];
  }
  const html = `<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;padding:20px;line-height:1.55;color:#334155;">
  <p style="font-size:17px;font-weight:700;margin:0 0 12px;">Pusula — Davet haberi</p>
  <p style="margin:0 0 10px;font-size:15px;">Merhaba,</p>
  <p style="margin:0 0 10px;font-size:15px;">Paylaştığın Pusula linkiyle gelen bir kişi <strong>kariyer önerilerini</strong> (sonuç adımına) ulaştı.</p>
  ${disc ? `<p style="margin:0 0 6px;font-size:14px;"><strong>Disiplin (özet):</strong> ${disc}</p>` : ''}
  ${city ? `<p style="margin:0 0 6px;font-size:14px;"><strong>Şehir / filtre:</strong> ${city}</p>` : ''}
  ${rolesText ? `<p style="margin:12px 0 0;font-size:14px;"><strong>Önerilen rol başlıkları:</strong> ${rolesText}</p>` : ''}
  <p style="margin:20px 0 0;font-size:13px;color:#64748b;">Bu ileti otomatik gönderilmiştir. Kişisel veri minimizasyonu için ayrıntılı profil eklenmez.</p>
</div>`;
  return [
    {
      json: {
        email: inv,
        to: inv,
        subject: 'Pusula — Davet ettiğin kişi önerilerini gördü',
        html,
        _pusulaEvent: 'davet_tamamlandi',
      },
    },
  ];
}

function salarySectionHtml(rd) {
  const sr = rd.salaryRangesByOrigin || {};
  const parts = [];
  if (sr.llm) parts.push({ label: 'AI maaş tahmini', chunk: sr.llm });
  if (sr.matrix) parts.push({ label: 'Matris rehberi', chunk: sr.matrix });
  if (sr.default) parts.push({ label: 'Genel şablon', chunk: sr.default });
  if (!parts.length && rd.salaryRange?.junior) {
    const { primaryOrigin: _po, ...rest } = rd.salaryRange;
    parts.push({ label: 'Maaş özeti', chunk: rest });
  }
  if (!parts.length) return '';
  return parts
    .map(
      ({ label, chunk }) => `
    <div style="margin:8px 0;padding:10px;background:#f5f3ff;border-radius:8px;border:1px solid #e9d5ff;">
      <strong style="font-size:12px;color:#5b21b6;">${esc(label)}</strong>
      <p style="margin:6px 0 0;font-size:13px;color:#444;">Juniör: ${esc(chunk.junior)} · Orta: ${esc(chunk.mid)} · Kıdemli: ${esc(chunk.senior)}</p>
      <span style="color:#888;font-size:11px;">${esc(chunk.source)}</span>
    </div>`,
    )
    .join('');
}

function internshipSourceLabel(src) {
  const s = String(src ?? '')
    .trim()
    .toLowerCase();
  if (s === 'llm' || s === 'groq' || s === 'gemini' || s === 'ai')
    return '<span style="font-size:11px;color:#7c3aed;font-weight:600;"> · AI önerisi</span>';
  return '<span style="font-size:11px;color:#059669;font-weight:600;"> · Matris</span>';
}

function employerSourceLabel(src) {
  const s = String(src ?? '')
    .trim()
    .toLowerCase();
  if (s === 'llm' || s === 'groq' || s === 'gemini' || s === 'ai')
    return '<span style="font-size:10px;color:#7c3aed;font-weight:600;"> · AI</span>';
  return '<span style="font-size:10px;color:#059669;font-weight:600;"> · Matris</span>';
}

function opportunitySourceLabel(src) {
  const s = String(src ?? '')
    .trim()
    .toLowerCase();
  if (s === 'llm' || s === 'groq' || s === 'gemini' || s === 'ai')
    return '<span style="font-size:11px;background:#ede9fe;color:#5b21b6;padding:2px 6px;border-radius:4px;">AI link</span>';
  return '<span style="font-size:11px;background:#ecfdf5;color:#047857;padding:2px 6px;border-radius:4px;">Yerel veri</span>';
}

const email = data.email || '';
const city = data.city || '';
const timestamp = data.timestamp || '';
const analysisSource = data.analysisSource || '';
const aiProviderLabel = data.aiProviderLabel || '';
const profile = data.profile || {};
const roles = Array.isArray(data.roles) ? data.roles : [];
const rolesDetail = Array.isArray(data.rolesDetail) ? data.rolesDetail : [];
const opportunities = Array.isArray(data.opportunities) ? data.opportunities : [];

const always = [
  { name: 'YGA — Geleceği Yazan Kadınlar', url: 'https://yga.org.tr' },
  { name: 'SistersLab', url: 'https://sisterslab.org' },
  { name: 'Kodluyoruz', url: 'https://www.kodluyoruz.org' },
  { name: 'Patika.dev', url: 'https://www.patika.dev' },
  { name: 'Women Techmakers', url: 'https://developers.google.com/womentechmakers' },
];

let profileHtml = '';
if (
  profile.disciplineLabel ||
  profile.facultyLabel ||
  profile.departmentLabel ||
  profile.goal ||
  (profile.interests && profile.interests.length) ||
  (profile.strengths && profile.strengths.length) ||
  (profile.techDomainInterests && profile.techDomainInterests.length) ||
  (profile.techHandsOnInterests && profile.techHandsOnInterests.length) ||
  (profile.techContextInterests && profile.techContextInterests.length) ||
  profile.learningStyle ||
  profile.availabilityLabel ||
  profile.workModeLabel ||
  profile.workEnvironmentLabel ||
  profile.impactThemeLabel ||
  city
) {
  profileHtml = `
  <div style="background:#f0f4ff;padding:14px 16px;border-radius:10px;margin-bottom:18px;border:1px solid #dbe4ff;">
    <strong style="color:#4338ca;">Profil özeti</strong>
    ${profile.facultyLabel ? `<p style="margin:8px 0 4px;color:#333;"><strong>Fakülte:</strong> ${esc(profile.facultyLabel)}</p>` : ''}
    ${profile.departmentLabel ? `<p style="margin:4px 0;color:#333;font-size:14px;"><strong>Bölüm:</strong> ${esc(profile.departmentLabel)}</p>` : ''}
    ${profile.disciplineLabel ? `<p style="margin:4px 0;color:#333;font-size:14px;"><strong>Disiplin:</strong> ${esc(profile.disciplineLabel)}</p>` : ''}
    ${profile.goal ? `<p style="margin:4px 0;color:#555;font-size:14px;"><strong>Hedef:</strong> ${esc(profile.goal)}</p>` : ''}
    ${profile.interests && profile.interests.length ? `<p style="margin:4px 0;color:#555;font-size:14px;"><strong>İlgi alanları:</strong> ${esc(profile.interests.join(', '))}</p>` : ''}
    ${profile.strengths && profile.strengths.length ? `<p style="margin:4px 0;color:#555;font-size:14px;"><strong>Güçlü yönler:</strong> ${esc(profile.strengths.join(', '))}</p>` : ''}
    ${profile.techDomainInterests && profile.techDomainInterests.length ? `<p style="margin:4px 0;color:#555;font-size:14px;"><strong>Teknoloji — çekici alanlar:</strong> ${esc(profile.techDomainInterests.join(', '))}</p>` : ''}
    ${profile.techHandsOnInterests && profile.techHandsOnInterests.length ? `<p style="margin:4px 0;color:#555;font-size:14px;"><strong>Teknoloji — yapmak/öğrenmek:</strong> ${esc(profile.techHandsOnInterests.join(', '))}</p>` : ''}
    ${profile.techContextInterests && profile.techContextInterests.length ? `<p style="margin:4px 0;color:#555;font-size:14px;"><strong>Teknoloji — ortam/rol:</strong> ${esc(profile.techContextInterests.join(', '))}</p>` : ''}
    ${profile.learningStyle ? `<p style="margin:4px 0;color:#555;font-size:14px;"><strong>Öğrenme stili:</strong> ${esc(profile.learningStyle)}</p>` : ''}
    ${profile.availabilityLabel ? `<p style="margin:4px 0;color:#555;font-size:14px;"><strong>Zaman / yoğunluk:</strong> ${esc(profile.availabilityLabel)}</p>` : ''}
    ${profile.workModeLabel ? `<p style="margin:4px 0;color:#555;font-size:14px;"><strong>Çalışma tarzı:</strong> ${esc(profile.workModeLabel)}</p>` : ''}
    ${profile.workEnvironmentLabel ? `<p style="margin:4px 0;color:#555;font-size:14px;"><strong>Çalışma ortamı:</strong> ${esc(profile.workEnvironmentLabel)}</p>` : ''}
    ${profile.impactThemeLabel ? `<p style="margin:4px 0;color:#555;font-size:14px;"><strong>Etki odağı:</strong> ${esc(profile.impactThemeLabel)}</p>` : ''}
    ${city ? `<p style="margin:4px 0;color:#555;font-size:14px;"><strong>Şehir / filtre:</strong> ${esc(city)}</p>` : ''}
  </div>`;
}

let aiLine = '';
if (analysisSource === 'fallback') {
  aiLine =
    '<p style="color:#92400e;font-size:13px;margin-bottom:12px;padding:10px 12px;background:#fffbeb;border-radius:8px;border:1px solid #fde68a;"><strong>Analiz:</strong> Yapay zeka kullanılamadı; öneriler <strong>disiplin matrisi</strong> yedeğinden üretildi.</p>';
} else if (aiProviderLabel) {
  aiLine = `<p style="color:#555;font-size:13px;margin-bottom:12px;padding:10px 12px;background:#f5f3ff;border-radius:8px;border:1px solid #ddd6fe;"><strong>Analiz:</strong> Rol metinleri ve (kullanıldıysa) <strong>maaş tahmini, staj ve program bağlantıları</strong> <strong>${esc(aiProviderLabel)}</strong> ile üretildi; bağlantılarda resmi sayfayı doğrula. Günün akışı, matris maaşı ve işverenler <strong>matris / veri katmanından</strong> tamamlanır.</p>`;
}

let rolesHtml = '';
if (rolesDetail.length) {
  rolesHtml = rolesDetail
    .map((rd, i) => {
      const title = esc(rd.roleName || roles[i] || `Rol ${i + 1}`);
      const tags = (rd.tags || []).map((t) => esc(t)).join(', ');
      const why = (rd.whyFits || []).map((w) => `<li>${escLine(w)}</li>`).join('');
      const steps = (rd.firstSteps || []).map((s) => `<li>${escLine(s)}</li>`).join('');
      const res = (rd.starterResources || []).map((s) => `<li>${escLine(s)}</li>`).join('');
      const day = rd.dayInLife;
      const dayBlock = day
        ? `<p style="margin:10px 0 6px;font-size:13px;color:#444;"><strong>Günün akışı</strong><br/>
        <span style="color:#666;">☀️ Sabah:</span> ${esc(day.morning)}<br/>
        <span style="color:#666;">🌤️ Öğleden sonra:</span> ${esc(day.afternoon)}<br/>
        <span style="color:#666;">🌙 Akşam:</span> ${esc(day.evening)}</p>`
        : '';

      const salMulti = salarySectionHtml(rd);
      const sal = rd.salaryRange;
      const salBlock =
        salMulti ||
        (sal
          ? `<p style="margin:8px 0;font-size:13px;color:#444;"><strong>Maaş bantları (yaklaşık):</strong><br/>
        Juniör: ${esc(sal.junior)} · Orta: ${esc(sal.mid)} · Kıdemli: ${esc(sal.senior)}<br/>
        <span style="color:#888;font-size:12px;">${esc(sal.source)}</span></p>`
          : '');

      const empItems = (rd.employers || [])
        .filter((e) => e && e.name)
        .map((e) => {
          const h = safeHref(e.url);
          const srcLab = employerSourceLabel(e.source);
          return h
            ? `<a href="${esc(h)}" style="color:#5b21b6;font-size:13px;display:inline-block;margin:4px 10px 4px 0;">${esc(e.name)}${srcLab} →</a>`
            : `<span style="font-size:13px;color:#333;margin-right:10px;">${esc(e.name)}${srcLab}</span>`;
        })
        .join('');

      const intItems = (rd.internships || [])
        .filter((x) => x && x.name)
        .map((x) => {
          const h = safeHref(x.url);
          return `<div style="margin:8px 0;padding:10px;background:#fafafa;border-radius:8px;border:1px solid #eee;">
            <strong style="font-size:13px;">${esc(x.name)}</strong>${internshipSourceLabel(x.source)}
            ${h ? ` <a href="${esc(h)}" style="color:#667eea;font-size:12px;">Başvuru</a>` : ''}
            ${x.summary ? `<div style="font-size:12px;color:#666;margin-top:6px;line-height:1.45;">${esc(x.summary)}</div>` : ''}
            ${x.eligibility ? `<div style="font-size:11px;color:#888;margin-top:4px;line-height:1.4;"><strong>Kimler:</strong> ${esc(x.eligibility)}</div>` : ''}
          </div>`;
        })
        .join('');

      const llmProgs = Array.isArray(rd.llmApplicationPrograms) ? rd.llmApplicationPrograms : [];
      const llmProgBlock =
        llmProgs.length === 0
          ? ''
          : `<div style="margin-top:12px;"><strong style="font-size:14px;color:#333;">AI önerilen program / başvuru linkleri</strong>
          ${llmProgs
            .filter((p) => p && p.name)
            .map((p) => {
              const h = safeHref(p.url);
              return `<div style="margin:8px 0;padding:10px;background:#faf5ff;border-radius:8px;border:1px solid #e9d5ff;">
              <strong style="font-size:13px;">${esc(p.name)}</strong>
              ${h ? ` <a href="${esc(h)}" style="color:#7c3aed;font-size:12px;">Sayfaya git</a>` : ''}
              ${p.forWho ? `<div style="font-size:12px;color:#666;margin-top:6px;">${esc(p.forWho)}</div>` : ''}
            </div>`;
            })
            .join('')}
        </div>`;

      return `<div style="background:#f8f7ff;border-left:4px solid #667eea;padding:14px 16px;border-radius:10px;margin-bottom:16px;">
        <div style="font-size:18px;font-weight:bold;color:#5b21b6;margin-bottom:6px;">${i + 1}. ${title}</div>
        ${tags ? `<p style="margin:0 0 8px;font-size:12px;color:#666;">Etiketler: ${tags}</p>` : ''}
        ${why ? `<div style="margin-top:8px;"><strong style="font-size:14px;color:#333;">Neden uygun?</strong><ul style="margin:6px 0;padding-left:20px;color:#555;font-size:14px;line-height:1.5;">${why}</ul></div>` : ''}
        ${steps ? `<div style="margin-top:8px;"><strong style="font-size:14px;color:#333;">İlk adımlar</strong><ol style="margin:6px 0;padding-left:20px;color:#555;font-size:14px;line-height:1.5;">${steps}</ol></div>` : ''}
        ${res ? `<div style="margin-top:8px;"><strong style="font-size:14px;color:#333;">Başlangıç kaynakları</strong><ul style="margin:6px 0;padding-left:20px;color:#555;font-size:14px;line-height:1.5;">${res}</ul></div>` : ''}
        ${dayBlock}
        ${salBlock ? `<div style="margin-top:8px;"><strong style="font-size:14px;color:#333;">Maaş aralığı</strong></div>${salBlock}` : ''}
        ${empItems ? `<div style="margin-top:12px;"><strong style="font-size:14px;color:#333;">Örnek işverenler (Türkiye)</strong><div style="margin-top:6px;">${empItems}</div></div>` : ''}
        ${intItems ? `<div style="margin-top:12px;"><strong style="font-size:14px;color:#333;">Staj programları</strong><p style="font-size:12px;color:#666;margin:4px 0 8px;line-height:1.45;">Yapay zekâ önerileri ile matris rehberi birlikte listelenir; yanındaki etiketten kaynağı ayırt edebilirsin. Resmi sayfayı doğrula.</p>${intItems}</div>` : ''}
        ${llmProgBlock}
      </div>`;
    })
    .join('');
} else {
  rolesHtml = roles
    .map(
      (r, i) =>
        `<div style="background:#f8f7ff;border-left:4px solid #667eea;padding:12px 16px;border-radius:8px;margin-bottom:10px;"><strong style="color:#667eea;">${i + 1}. ${esc(r)}</strong></div>`,
    )
    .join('');
}

let oppsHtml = '';
for (const roleTitle of roles) {
  const roleOpps = opportunities.filter((o) => o.forRole === roleTitle);
  if (!roleOpps.length) continue;
  oppsHtml += `
  <div style="margin-bottom:20px;">
    <div style="background:#667eea;color:white;padding:10px 14px;border-radius:8px 8px 0 0;font-weight:bold;font-size:14px;">${esc(roleTitle)} — fırsat radarı</div>
    ${roleOpps
      .map((o) => {
        const h = safeHref(o.url);
        const src = opportunitySourceLabel(o.source);
        return `<div style="background:#f8f7ff;padding:12px 16px;border-bottom:1px solid #e8e4ff;display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap;">
      <div style="flex:1;min-width:200px;">
        <strong style="color:#333;font-size:14px;">${esc(o.name)}</strong> ${src}<br/>
        <span style="color:#888;font-size:12px;">${esc(o.description || '')}</span>
      </div>
      ${h ? `<a href="${esc(h)}" style="color:#667eea;font-size:13px;text-decoration:none;white-space:nowrap;">Git →</a>` : ''}
    </div>`;
      })
      .join('')}
  </div>`;
}

const alwaysHtml = always
  .map((p) => {
    const h = safeHref(p.url);
    return h
      ? `<div style="background:#fff3cd;padding:12px 16px;border-radius:8px;margin-bottom:8px;"><a href="${esc(h)}" style="color:#856404;text-decoration:none;font-weight:bold;">✓ ${esc(p.name)}</a></div>`
      : '';
  })
  .join('');

const html = `<div style="font-family: Arial, Helvetica, sans-serif; max-width: 640px; margin: 0 auto; padding: 20px;">
  <div style="display:none;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:#ffffff;width:0;height:0;opacity:0;">
    Profil özeti, roller, maaş, staj ve program bağlantıları bu e-postada.
  </div>
  <p style="color:#334155;line-height:1.5;font-size:17px;font-weight:700;margin:0 0 12px;">Pusula Kariyer Keşif Rehberin<br/>Kariyer analizin tamamlandı!</p>
  <p style="color:#555;line-height:1.65;font-size:15px;margin:0 0 14px;">Aşağıda profil özeti, önerilen roller, maaş ve staj bağlantıları ile program önerilerini bulabilirsin.</p>
  ${timestamp ? `<p style="color:#999;font-size:12px;margin:0 0 14px;">${esc(timestamp)}</p>` : ''}
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 24px; border-radius: 12px; text-align: center; margin-bottom: 20px;">
    <div style="font-size:34px;line-height:1;margin-bottom:10px;" aria-hidden="true">🧭</div>
    <h1 style="color: white; margin: 0; font-size: 22px;">Kariyer özeti</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 14px;">Önerilerin ve bağlantıların derlemesi</p>
  </div>
  ${aiLine}
  ${profileHtml}
  <h2 style="color:#333;font-size:18px;margin:20px 0 10px;">Önerilen roller</h2>
  ${rolesHtml}
  <h3 style="color:#333;margin-top:26px;font-size:17px;">📚 Rollerine özel program / topluluk / kurs</h3>
  ${oppsHtml || '<p style="color:#888;font-size:14px;">Bu oturum için ek program satırı yok.</p>'}
  <h3 style="color:#333;margin-top:28px;font-size:17px;">🌟 Her zaman takip edebileceğin kaynaklar</h3>
  ${alwaysHtml}
  <p style="color:#888;font-size:13px;text-align:center;margin-top:28px;border-top:1px solid #eee;padding-top:16px;line-height:1.55;">Teknoloji yolculuğunda başarılar 💜<br/><span style="color:#7c3aed;">Pusula</span></p>
</div>`;

const toAddr = String(email ?? '').trim();
if (!toAddr || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(toAddr)) {
  return [];
}

return [
  {
    json: {
      email: toAddr,
      to: toAddr,
      subject: 'Pusula — Kariyer analizin tamamlandı! 🧭',
      html,
    },
  },
];
