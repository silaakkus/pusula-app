import html2canvas from 'html2canvas';
import { logEvent } from './analytics.js';

export async function downloadCareerCardPng(element, filename = 'pusula-kariyer-rota-karti.png') {
  if (!element) throw new Error('Kart öğesi bulunamadı');

  const canvas = await html2canvas(element, {
    scale: 2,
    backgroundColor: '#ffffff',
    useCORS: true,
    logging: false,
    scrollX: 0,
    scrollY: 0,
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight,
  });

  const url = canvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();

  logEvent('card_download', { filename });
}
