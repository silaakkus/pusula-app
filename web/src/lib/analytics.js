const PREFIX = '[Pusula]';

export function logEvent(name, payload = {}) {
  const entry = { event: name, ...payload, ts: new Date().toISOString() };
  // MVP: konsol; ileride analytics sağlayıcısına köprülenebilir
  console.log(PREFIX, entry);
}
