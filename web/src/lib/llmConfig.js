/**
 * Tarayıcıda çalışan istemci; anahtarlar Vite env ile gelir (üretimde dikkat).
 */
export function getLlmProvider() {
  const v = import.meta.env.VITE_LLM_PROVIDER?.trim().toLowerCase();
  return v === 'groq' ? 'groq' : 'gemini';
}

export function getLlmApiKey() {
  if (getLlmProvider() === 'groq') {
    return import.meta.env.VITE_GROQ_API_KEY?.trim() ?? '';
  }
  return import.meta.env.VITE_GEMINI_API_KEY?.trim() ?? '';
}

export function getLlmBrandLabel() {
  return getLlmProvider() === 'groq' ? 'Groq' : 'Gemini';
}
