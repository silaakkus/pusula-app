/**
 * n8n Code node — Pusula Results webhook gövdesini HTML e-postaya çevirir.
 * Webhook → Code (bu betik) → Gmail "Message" = {{ $json.html }}
 *
 * Girdi: ResultsPage buildRichWebhookPayload ile aynı JSON (doğrudan kök veya { body: {...} }).
 */

function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function ul(items) {
  if (!Array.isArray(items) || !items.length) return '<p>—</p>';
  return `<ul>${items.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`;
}

function salaryBlockHtml(label, chunk) {
  if (!chunk) return '';
  return `
    <div style="margin:12px 0;padding:12px;border:1px solid #e2e8f0;border-radius:8px;background:#f8fafc;">
      <div style="font-weight:700;color:#312e81;margin-bottom:8px;">${esc(label)}</div>
      <table style="width:100%;font-size:14px;">
        <tr><td style="padding:4px 0;"><strong>Juniör</strong></td><td>${esc(chunk.junior)}</td></tr>
        <tr><td style="padding:4px 0;"><strong>Orta</strong></td><td>${esc(chunk.mid)}</td></tr>
        <tr><td style="padding:4px 0;"><strong>Kıdemli</strong></td><td>${esc(chunk.senior)}</td></tr>
      </table>
      <p style="font-size:12px;color:#64748b;margin:8px 0 0;">${esc(chunk.source)}</p>
    </div>`;
}

/** n8n Code node girişi */
const raw = $input.first().json;
const p =
  raw.body && typeof raw.body === 'object' && !Array.isArray(raw.body) ? raw.body : raw;

const profile = p.profile || {};
const rolesDetail = Array.isArray(p.rolesDetail) ? p.rolesDetail : [];
const opportunities = Array.isArray(p.opportunities) ? p.opportunities : [];

let rolesHtml = '';
for (const r of rolesDetail) {
  const sr = r.salaryRangesByOrigin || {};
  let salaryParts = [
    sr.llm ? salaryBlockHtml('Maaş (AI tahmini)', sr.llm) : '',
    sr.matrix ? salaryBlockHtml('Maaş (matris rehberi)', sr.matrix) : '',
    sr.default ? salaryBlockHtml('Maaş (genel şablon)', sr.default) : '',
  ].join('');
  if (!salaryParts && r.salaryRange?.junior) {
    const { primaryOrigin: _po, ...rest } = r.salaryRange;
    salaryParts = salaryBlockHtml('Maaş özeti', rest);
  }
  if (!salaryParts) salaryParts = '<p>—</p>';

  const interns = Array.isArray(r.internships) ? r.internships : [];
  const internList =
    interns.length === 0
      ? '<p>—</p>'
      : `<ul>${interns
          .map(
            (x) =>
              `<li><a href="${esc(x.url)}">${esc(x.name)}</a> <small>(${esc(x.source)})</small><br/><span style="color:#64748b;font-size:13px;">${esc(x.summary)}</span></li>`,
          )
          .join('')}</ul>`;

  const llmProgs = Array.isArray(r.llmApplicationPrograms) ? r.llmApplicationPrograms : [];
  const llmProgList =
    llmProgs.length === 0
      ? ''
      : `<h4 style="margin:16px 0 8px;">AI önerilen program linkleri</h4><ul>${llmProgs
          .map((x) => `<li><a href="${esc(x.url)}">${esc(x.name)}</a> — ${esc(x.forWho)}</li>`)
          .join('')}</ul>`;

  const emps = Array.isArray(r.employers) ? r.employers : [];
  const empList =
    emps.length === 0
      ? '<p>—</p>'
      : `<ul>${emps
          .map((e) =>
            e.url
              ? `<li><a href="${esc(e.url)}">${esc(e.name)}</a></li>`
              : `<li>${esc(e.name)}</li>`,
          )
          .join('')}</ul>`;

  const dil = r.dayInLife || {};
  rolesHtml += `
    <section style="margin:24px 0;padding:20px;border:1px solid #c7d2fe;border-radius:12px;background:#fff;">
      <h2 style="margin:0 0 12px;color:#1e1b4b;">${esc(r.roleName)}</h2>
      <p style="margin:0 0 8px;"><strong>Etiketler:</strong> ${esc((r.tags || []).join(', '))}</p>
      <h3 style="margin:16px 0 8px;color:#3730a3;">Neden uygun?</h3>
      ${ul(r.whyFits)}
      <h3 style="margin:16px 0 8px;color:#3730a3;">İlk adımlar</h3>
      ${ul(r.firstSteps)}
      <h3 style="margin:16px 0 8px;color:#3730a3;">Başlangıç kaynakları</h3>
      ${ul(r.starterResources)}
      <h3 style="margin:16px 0 8px;color:#3730a3;">Bir günün nasıl geçer?</h3>
      <p><strong>Sabah:</strong> ${esc(dil.morning)}</p>
      <p><strong>Öğleden sonra:</strong> ${esc(dil.afternoon)}</p>
      <p><strong>Akşam:</strong> ${esc(dil.evening)}</p>
      <h3 style="margin:16px 0 8px;color:#3730a3;">Maaş</h3>
      ${salaryParts}
      <h3 style="margin:16px 0 8px;color:#3730a3;">Staj / başvuru linkleri</h3>
      ${internList}
      ${llmProgList}
      <h3 style="margin:16px 0 8px;color:#3730a3;">Örnek işverenler</h3>
      ${empList}
    </section>`;
}

const oppHtml =
  opportunities.length === 0
    ? '<p>—</p>'
    : `<ul>${opportunities
        .map(
          (o) =>
            `<li><strong>${esc(o.name)}</strong> <small>(${esc(o.source || 'dataset')})</small> — ${esc(o.forRole || '')}<br/>
            <a href="${esc(o.url)}">${esc(o.url)}</a><br/><span style="color:#64748b;">${esc(o.description)}</span></li>`,
        )
        .join('')}</ul>`;

const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/></head>
<body style="font-family:system-ui,sans-serif;line-height:1.5;color:#0f172a;max-width:720px;margin:0 auto;padding:16px;">
  <h1 style="color:#4f46e5;">Pusula — Sonuç özeti</h1>
  <p><strong>E-posta:</strong> ${esc(p.email)}</p>
  <p><strong>Tarih:</strong> ${esc(p.timestamp)}</p>
  <p><strong>Şehir:</strong> ${esc(p.city)} (${esc(p.cityId)})</p>
  <p><strong>Analiz kaynağı:</strong> ${esc(p.analysisSource)} — ${esc(p.aiProviderLabel)}</p>
  <h2 style="margin-top:24px;color:#1e1b4b;">Profil</h2>
  <p><strong>Disiplin:</strong> ${esc(profile.disciplineLabel)}</p>
  <p><strong>İlgi:</strong> ${esc((profile.interests || []).join(', '))}</p>
  <p><strong>Güçlü yönler:</strong> ${esc((profile.strengths || []).join(', '))}</p>
  <p><strong>Öğrenme:</strong> ${esc(profile.learningStyle)}</p>
  <p><strong>Hedef:</strong> ${esc(profile.goal)}</p>
  <p><strong>Rol başlıkları:</strong> ${esc((p.roles || []).join(' · '))}</p>
  ${rolesHtml}
  <h2 style="margin-top:24px;color:#1e1b4b;">Fırsat radarı (tüm roller, düz liste)</h2>
  ${oppHtml}
  <p style="margin-top:32px;font-size:12px;color:#94a3b8;">Bu e-posta Pusula uygulamasından webhook ile oluşturulmuştur.</p>
</body></html>`;

const subject = `Pusula sonuçları — ${profile.disciplineLabel || 'Özet'}`;

return [{ json: { html, subject, to: p.email } }];
