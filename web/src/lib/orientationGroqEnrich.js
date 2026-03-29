import { groqGenerateText } from './groqClient.js';

function stripCodeFences(text) {
  let t = String(text ?? '').trim();
  const m = t.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (m) t = m[1].trim();
  return t;
}

function extractJsonObject(rawText) {
  if (rawText == null) return null;
  let cleaned = stripCodeFences(String(rawText).trim());
  try {
    return JSON.parse(cleaned);
  } catch {
    /* devam */
  }
  const start = cleaned.indexOf('{');
  if (start === -1) return null;
  let depth = 0;
  for (let i = start; i < cleaned.length; i += 1) {
    const ch = cleaned[i];
    if (ch === '{') depth += 1;
    else if (ch === '}') {
      depth -= 1;
      if (depth === 0) {
        try {
          return JSON.parse(cleaned.slice(start, i + 1));
        } catch {
          return null;
        }
      }
    }
  }
  return null;
}

const SYSTEM = `Sen Pusula adlı Türkçe kariyer/yönelim uygulamasında yardımcı bir asistansın.
Kullanıcıya yargılamadan, acemi dostu ve kısa yaz.

SADECE şu JSON'u döndür; başına/sonuna açıklama veya markdown ekleme:
{"summary":"2-3 cümle","tips":["bir cümle","bir cümle","bir cümle"]}

summary: Mevcut özeti tekrar etme; tamamlayıcı bir bakış veya cesaretlendirici yönlendirme ver.
tips: Tam 3 madde; her biri tek cümle, somut ve uygulanabilir (kurs, alıştırma, konuşma, deneme).
Türkçe yaz; İngilizce terim gerekiyorsa parantezle kısa açıkla.`;

/**
 * VITE_GROQ_API_KEY tanımlıysa yönelim sonucuna ek özet + ipuçları üretir; aksi halde null.
 */
export async function fetchOrientationGroqSupplement(payload) {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY?.trim();
  if (!apiKey) return null;

  const userPrompt = JSON.stringify(
    {
      archetype: payload.archetype ?? null,
      archetypeLabel: payload.archetypeLabel ?? '',
      headline: payload.headline ?? '',
      subline: payload.subline ?? '',
      body: payload.body ?? '',
      nextSteps: Array.isArray(payload.nextSteps) ? payload.nextSteps.slice(0, 10) : [],
    },
    null,
    0,
  );

  let raw;
  try {
    raw = await groqGenerateText({
      apiKey,
      systemInstruction: SYSTEM,
      userPrompt,
      temperature: 0.28,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new Error(msg || 'Groq isteği başarısız');
  }

  const obj = extractJsonObject(raw);
  if (!obj || typeof obj !== 'object') {
    throw new Error('Groq yanıtı okunamadı');
  }

  const summary = typeof obj.summary === 'string' ? obj.summary.trim() : '';
  let tips = Array.isArray(obj.tips) ? obj.tips.map((t) => String(t).trim()).filter(Boolean) : [];
  if (tips.length > 6) tips = tips.slice(0, 6);

  if (!summary && tips.length === 0) {
    throw new Error('Groq boş öneri döndü');
  }

  return { summary, tips };
}
