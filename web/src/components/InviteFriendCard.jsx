import React, { useCallback, useMemo, useState } from 'react';
import { Copy, Mail, MessageCircle } from 'lucide-react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { logEvent } from '../lib/analytics.js';

const DEFAULT_SHARE_SITE_URL = 'https://pusula-fdnbtix3-silaakkus-projects.vercel.app';

/**
 * Paylaşılan link sırası:
 * 1) VITE_APP_SHARE_CANONICAL_URL (manuel sabit domain)
 * 2) DEFAULT_SHARE_SITE_URL (projenin kalıcı production adresi)
 * 3) window.location.origin
 * 4) legacy VITE_APP_URL
 */
function getShareSiteUrl() {
  const canonical = import.meta.env.VITE_APP_SHARE_CANONICAL_URL?.trim();
  if (canonical) return canonical.replace(/\/+$/, '');
  if (DEFAULT_SHARE_SITE_URL) return DEFAULT_SHARE_SITE_URL.replace(/\/+$/, '');
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin.replace(/\/+$/, '');
  }
  const legacy = import.meta.env.VITE_APP_URL?.trim();
  if (legacy) return legacy.replace(/\/+$/, '');
  return '';
}

function buildShareText(siteUrl) {
  const base = siteUrl?.trim();
  if (base) {
    return `Bölümüm ne olursa olsun geleceğim teknolojide! Sen de rotanı keşfet → ${base}`;
  }
  return 'Bölümüm ne olursa olsun geleceğim teknolojide! Sen de Pusula ile rotanı keşfet.';
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
  const shareText = useMemo(() => buildShareText(siteUrl), [siteUrl]);
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
