# agents

Bu klasor, buildathon brief'indeki bonus "agents/" beklentisi icin olusturuldu.

## Amac

Bu alanda, proje icin gelistirilen otomasyon/agent dosyalari tutulur.
Su an aktif ajan mantigi agirlikli olarak uygulama kodu ve n8n webhook akislari icinde calistigi icin,
burasi dokumantasyon ve ileride eklenecek agent scriptleri icin ayrilmistir.

## Olası Icerikler (ileride eklenebilir)

- `career-agent.md`: rol onerisi uretim kurallari
- `prompt-templates/`: farkli adimlar icin prompt sablonlari
- `automation-notes.md`: n8n ve webhook otomasyon notlari
- `evaluation-checklist.md`: agent ciktilari kalite kontrol listesi

## Mevcut Agent/Otomasyon Baglantilari

- Web uygulamasi AI analiz katmani: `web/src/lib/gemini.js`
- Yönelim zenginlestirme: `web/src/lib/orientationGroqEnrich.js`
- n8n otomasyon kodlari: `n8n/pusula-webhook-code.js`, `n8n/orientation-webhook-code.js`
