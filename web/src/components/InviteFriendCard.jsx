import React, { useCallback, useMemo, useState } from 'react';
import { Copy, Mail, MessageCircle } from 'lucide-react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { logEvent } from '../lib/analytics.js';
import { isValidInviterEmail } from '../lib/inviteReferral.js';

/** Settings → Domains → Production (hash’siz, herkese açık olması gereken adres). */
const PUBLIC_VERCEL_PRODUCTION = 'https://pusula-app-two.vercel.app';

function isVercelTeamDeploymentHost(url) {
  try {
    const u = String(url ?? '').trim();
    if (!u) return false;
    const { hostname } = new URL(u.includes('://') ? u : `https://${u}`);
    return hostname.endsWith('-projects.vercel.app');
  } catch {
    return /-projects\.vercel\.app$/i.test(String(url ?? ''));
  }
}

/**
 * Sıra:
 * 1) VITE_APP_SHARE_CANONICAL_URL
 * 2) window.origin — *-projects.vercel.app ise (korunur) PUBLIC_VERCEL_PRODUCTION kullan
 * 3) VITE_APP_URL — aynı kural
 * 4) PUBLIC_VERCEL_PRODUCTION
 */
function getShareSiteUrl() {
  const strip = (s) => String(s).trim().replace(/\/+$/, '');
  const canonical = import.meta.env.VITE_APP_SHARE_CANONICAL_URL?.trim();
  if (canonical) return strip(canonical);

  if (typeof window !== 'undefined' && window.location?.origin) {
    const origin = strip(window.location.origin);
    if (isVercelTeamDeploymentHost(origin)) return strip(PUBLIC_VERCEL_PRODUCTION);
    return origin;
  }

  const legacy = import.meta.env.VITE_APP_URL?.trim();
  if (legacy) {
    const l = strip(legacy);
    if (!isVercelTeamDeploymentHost(l)) return l;
  }

  return strip(PUBLIC_VERCEL_PRODUCTION);
}

function buildShareText(shareUrlWithRef) {
  const base = shareUrlWithRef?.trim();
  if (base) {
    return `Bölümüm ne olursa olsun geleceğim teknolojide! Sen de rotanı keşfet → ${base}`;
  }
  return 'Bölümüm ne olursa olsun geleceğim teknolojide! Sen de Pusula ile rotanı keşfet.';
}

function withInviterQuery(siteUrl, inviterEmail) {
  const base = siteUrl?.trim();
  if (!base) return '';
  const e = inviterEmail?.trim() ?? '';
  if (!e || !isValidInviterEmail(e)) return base;
  try {
    const u = new URL(base.includes('://') ? base : `https://${base}`);
    u.searchParams.set('inviter', e);
    return u.toString();
  } catch {
    return base;
  }
}

/**
 * n8n / webhook: paylaşım tıklamalarını kaydetmek için.
 * Aynı endpoint ResultsPage e-postası ile paylaşılabilir; n8n içinde body.event === 'davet_tiklandi' ile ayrıştır.
 *
 * İsteğe bağlı ayrı URL: import.meta.env.VITE_PUSULA_EVENTS_WEBHOOK_URL
 * Şimdilik mevcut VITE_N8N_WEBHOOK_URL kullanılır; tanımlı değilse istek gönderilmez.
 */
async function postInviteEvent(kanal) {
  const explicit = import.meta.env.VITE_PUSULA_EVENTS_WEBHOOK_URL;
  const fallback = import.meta.env.VITE_N8N_WEBHOOK_URL;
  const url = (explicit && String(explicit).trim()) || (fallback && String(fallback).trim());
  if (!url) return;

  const payload = {
    event: 'davet_tiklandi',
    kanal,
    zaman: new Date().toISOString(),
  };

  try {
    await fetch(String(url).trim(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    // Sessizce yut; paylaşım akışı bloklanmasın
  }
}

/*
 * Ayrı bir olay webhook’u yoksa, aşağıdaki gibi sabit URL ile kullanabilirsin:
 * await fetch('https://your-n8n-instance/webhook/pusula-events', { ... });
 */

export function InviteFriendCard() {
  const siteUrl = useMemo(() => getShareSiteUrl(), []);
  const [inviterEmail, setInviterEmail] = useState('');
  const shareTargetUrl = useMemo(
    () => withInviterQuery(siteUrl, inviterEmail),
    [siteUrl, inviterEmail],
  );
  const shareText = useMemo(() => buildShareText(shareTargetUrl), [shareTargetUrl]);
  const [copyLabel, setCopyLabel] = useState('Linki Kopyala');

  const handleWhatsapp = useCallback(() => {
    const href = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(href, '_blank', 'noopener,noreferrer');
    logEvent('invite_share', { kanal: 'whatsapp' });
    postInviteEvent('whatsapp');
  }, [shareText]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopyLabel('Kopyalandı!');
      window.setTimeout(() => setCopyLabel('Linki Kopyala'), 2000);
      logEvent('invite_share', { kanal: 'link' });
      postInviteEvent('link');
    } catch {
      alert('Panoya kopyalanamadı. Tarayıcı iznini kontrol et.');
    }
  }, [shareText]);

  const handleMail = useCallback(() => {
    const subject = 'Pusula — Kariyer rotanı keşfet';
    const mailto = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(shareText)}`;
    window.location.href = mailto;
    logEvent('invite_share', { kanal: 'mail' });
    postInviteEvent('mail');
  }, [shareText]);

  return (
    <Card className="mt-10 w-full max-w-none border border-indigo-200/80 bg-gradient-to-br from-indigo-50/90 via-white to-violet-50/60 text-left shadow-md shadow-indigo-900/5">
      <h3 className="text-lg font-extrabold text-indigo-950">Arkadaşını davet et</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        Rotanı tamamladın — paylaşım metni aşağıdaki gibidir; tek tıkla gönderebilirsin.
      </p>
      <label className="mt-4 block text-left text-xs font-semibold text-slate-700">
        Arkadaşın önerileri görünce sana haber verilsin (isteğe bağlı)
        <Input
          type="email"
          name="inviter-notify-email"
          autoComplete="email"
          placeholder="E-posta adresin"
          value={inviterEmail}
          onChange={(ev) => setInviterEmail(ev.target.value)}
          className="mt-1.5"
        />
      </label>
      <p className="mt-1 text-[11px] leading-snug text-slate-500">
        Doldurursan linkin sonuna e-postanı taşıyan bir parametre eklenir (URL içinde görünür). Arkadaşın önerileri yüklendiğinde bu adrese kısa bir bilgi maili gider — n8n akışında{' '}
        <code className="rounded bg-slate-100 px-0.5 text-[10px]">davet_tamamlandi</code> olayını kullan.
      </p>
      <blockquote className="mt-3 rounded-xl border border-slate-200/80 bg-white/80 px-3 py-2.5 text-sm text-slate-700">
        {shareText}
      </blockquote>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          type="button"
          size="lg"
          className="min-w-0 flex-1 basis-[140px] sm:flex-none sm:basis-auto"
          onClick={handleWhatsapp}
        >
          <MessageCircle className="h-5 w-5 shrink-0" aria-hidden />
          WhatsApp&apos;ta Paylaş
        </Button>
        <Button
          type="button"
          size="lg"
          variant="ghost"
          className="min-w-0 flex-1 basis-[140px] ring-1 ring-indigo-200/80 bg-white/90 hover:bg-white sm:flex-none sm:basis-auto"
          onClick={handleCopy}
        >
          <Copy className="h-5 w-5 shrink-0" aria-hidden />
          {copyLabel}
        </Button>
        <Button
          type="button"
          size="lg"
          variant="ghost"
          className="min-w-0 flex-1 basis-[140px] border border-indigo-200/90 bg-white/90 sm:flex-none sm:basis-auto"
          onClick={handleMail}
        >
          <Mail className="h-5 w-5 shrink-0" aria-hidden />
          Mail ile Gönder
        </Button>
      </div>
    </Card>
  );
}
