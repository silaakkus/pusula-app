import React, { useEffect, useMemo, useState } from 'react';
import { ExternalLink, RefreshCw, Briefcase, CalendarDays, MapPin } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

function toList(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

function normalizeItem(raw, index) {
  const title = String(raw?.title ?? raw?.name ?? `Staj Programı ${index + 1}`).trim();
  const company = String(raw?.company ?? raw?.organization ?? raw?.brand ?? '').trim();
  const location = String(raw?.location ?? raw?.city ?? '').trim();
  const deadline = String(raw?.deadline ?? raw?.lastDate ?? raw?.applyUntil ?? '').trim();
  const type = String(raw?.type ?? raw?.programType ?? 'Staj').trim();
  const url = String(raw?.url ?? raw?.link ?? '#').trim();
  const summary = String(raw?.summary ?? raw?.description ?? '').trim();
  const eligibility = String(raw?.eligibility ?? raw?.forWho ?? '').trim();
  return { title, company, location, deadline, type, url, summary, eligibility };
}

export function InternshipListPage({ onBack }) {
  const [items, setItems] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const webhookUrl = import.meta.env.VITE_N8N_INTERNSHIP_LIST_WEBHOOK_URL?.trim();

  const canFetch = useMemo(() => Boolean(webhookUrl), [webhookUrl]);

  const load = async () => {
    if (!webhookUrl) {
      setError('n8n webhook adresi tanımlı değil. VITE_N8N_INTERNSHIP_LIST_WEBHOOK_URL eklemelisin.');
      setItems([]);
      return;
    }
    setBusy(true);
    setError('');
    try {
      const res = await fetch(webhookUrl, { method: 'GET' });
      if (!res.ok) throw new Error(`Webhook hatası (${res.status})`);
      const json = await res.json();
      const list = toList(json).map(normalizeItem).filter((x) => x.title && x.url);
      setItems(list);
      if (list.length === 0) {
        setError('Liste boş döndü. n8n çıktısında en az bir kayıt olduğundan emin ol.');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Staj listesi alınamadı');
      setItems([]);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <main className="mx-auto w-full max-w-none px-1 pb-16 pt-8 sm:px-2 lg:px-3">
      <section className="mx-auto w-full max-w-5xl">
        <Card className="border-violet-200/80 bg-gradient-to-br from-violet-50/80 via-white to-indigo-50/70 p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">Staj rotası</p>
              <h1 className="mt-1 text-2xl font-extrabold text-slate-900 sm:text-3xl">Güncel Staj Programları</h1>
              <p className="mt-2 text-sm text-slate-600">
                Bu liste n8n webhook’undan canlı çekilir. Mor-beyaz Pusula tasarımına uygun kartlarda gösterilir.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={onBack}>
                Geri dön
              </Button>
              <Button variant="ghost" onClick={() => void load()} disabled={busy || !canFetch}>
                <RefreshCw className={busy ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
                Yenile
              </Button>
            </div>
          </div>
        </Card>

        {busy && (
          <Card className="mt-5 border-violet-100 bg-white/85 p-6 text-sm text-slate-600">
            Liste güncelleniyor...
          </Card>
        )}

        {!busy && error && (
          <Card className="mt-5 border-rose-200 bg-rose-50/70 p-6 text-sm text-rose-700">
            {error}
          </Card>
        )}

        {!busy && items.length > 0 && (
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {items.map((item, i) => (
              <Card
                key={`${item.title}-${i}`}
                className="border-violet-100 bg-white/90 p-5 shadow-md shadow-violet-100/60 transition hover:shadow-lg"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="inline-flex items-center rounded-full bg-violet-100 px-2.5 py-1 text-[11px] font-semibold text-violet-700">
                      {item.type || 'Staj'}
                    </p>
                    <h2 className="mt-2 line-clamp-2 text-lg font-bold text-slate-900">{item.title}</h2>
                    {item.company ? <p className="mt-1 text-sm font-medium text-slate-600">{item.company}</p> : null}
                  </div>
                  <Briefcase className="mt-1 h-5 w-5 shrink-0 text-violet-500" />
                </div>

                {(item.location || item.deadline) && (
                  <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
                    {item.location ? (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {item.location}
                      </span>
                    ) : null}
                    {item.deadline ? (
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays className="h-3.5 w-3.5" />
                        Son tarih: {item.deadline}
                      </span>
                    ) : null}
                  </div>
                )}

                {item.summary ? <p className="mt-3 line-clamp-3 text-sm text-slate-600">{item.summary}</p> : null}
                {item.eligibility ? (
                  <p className="mt-3 rounded-xl bg-violet-50 px-3 py-2 text-xs text-violet-800">
                    <span className="font-semibold">Kimler katılabilir:</span> {item.eligibility}
                  </p>
                ) : null}

                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-violet-700 hover:text-violet-900"
                >
                  Başvuru sayfasını aç
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Card>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

