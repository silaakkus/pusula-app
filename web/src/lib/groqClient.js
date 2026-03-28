const GROQ_CHAT_URL = 'https://api.groq.com/openai/v1/chat/completions';

/** Groq konsolunda listelenen model adları; https://console.groq.com/docs/models */
const DEFAULT_GROQ_MODEL = 'llama-3.3-70b-versatile';

function groqTimeoutMs() {
  const raw = import.meta.env.VITE_GROQ_TIMEOUT_MS;
  const n = raw != null && String(raw).trim() !== '' ? Number(raw) : NaN;
  return Number.isFinite(n) && n >= 15_000 ? Math.floor(n) : 90_000;
}

/**
 * OpenAI uyumlu sohbet API’si; yanıt metni (istemde JSON istenir, parse tarafında gevşetilir).
 */
export async function groqGenerateText({ apiKey, systemInstruction, userPrompt }) {
  if (!apiKey || !String(apiKey).trim()) throw new Error('Groq API anahtarı eksik');

  const model = import.meta.env.VITE_GROQ_MODEL?.trim() || DEFAULT_GROQ_MODEL;
  const timeoutMs = groqTimeoutMs();
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(GROQ_CHAT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey.trim()}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemInstruction },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.35,
        max_tokens: 8192,
      }),
    });

    const rawText = await res.text();
    let data;
    try {
      data = rawText ? JSON.parse(rawText) : null;
    } catch {
      data = null;
    }

    if (!res.ok) {
      const msg =
        data?.error?.message ||
        (rawText.length > 400 ? `${rawText.slice(0, 400)}…` : rawText) ||
        res.statusText;
      throw new Error(`Groq [${res.status}]: ${msg}`);
    }

    const text = data?.choices?.[0]?.message?.content;
    if (!text || !String(text).trim()) throw new Error('Groq boş yanıt');
    return String(text).trim();
  } catch (e) {
    if (e?.name === 'AbortError' || /aborted/i.test(e?.message ?? '')) {
      throw new Error(`Groq zaman aşımı (${Math.round(timeoutMs / 1000)}s)`);
    }
    throw e;
  } finally {
    window.clearTimeout(timer);
  }
}
