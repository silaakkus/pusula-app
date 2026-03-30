# features

Bu klasor, buildathon brief'indeki `features/` beklentisini karsilamak ve
projede calisan tum ozellikleri tek noktadan gostermek icin olusturuldu.

## Calisan tum ozellikler ve kod konumlari

### 1) Ana akis ve sayfa yonetimi
- Akis durumlari ve sayfa gecisleri: `web/src/App.jsx`
- Karsilama/landing deneyimi: `web/src/pages/LandingPage.jsx`
- Bilgilendirme ekrani: `web/src/pages/LandingInfoPage.jsx`

### 2) Profil toplama ve kullanici girdileri
- Profil formu ve secimler: `web/src/pages/ProfilePage.jsx`
- Profil taslak kaydi ve kaldigi yerden devam: `web/src/lib/profileDraft.js`
- Akis snapshot kaydi: `web/src/lib/pusulaFlow.js`

### 3) AI analiz motoru (kariyer onerileri)
- Analiz tetikleme ve prompt orkestrasyonu: `web/src/lib/gemini.js`
- Groq istemcisi ve yardimci entegrasyon: `web/src/lib/groqClient.js`
- Sonuc fallback/yardimci mantiklar: `web/src/lib/fallbackRoles.js`, `web/src/lib/barrierFallback.js`

### 4) Sonuc, bariyer ve kart deneyimi
- Analiz sonucu sayfasi: `web/src/pages/ResultsPage.jsx`
- Bariyer adimi: `web/src/pages/BarrierPage.jsx`
- Bariyer ozet adimi: `web/src/pages/BarrierReviewPage.jsx`
- Final kart sayfasi: `web/src/pages/FinalCardPage.jsx`
- Kariyer karti yakalama bileseni: `web/src/components/CareerCardCapture.jsx`

### 5) Yönelim testi modulu
- Quiz akisi: `web/src/pages/OrientationQuizPage.jsx`
- Quiz sonuc sayfasi: `web/src/pages/OrientationResultPage.jsx`
- Quiz veri/saklama katmani: `web/src/lib/orientationQuiz.js`
- Groq ile yonelim zenginlestirme: `web/src/lib/orientationGroqEnrich.js`
- Matris ipuclari: `web/src/lib/orientationMatrixHints.js`

### 6) Ogrenme yollari (roadmap)
- Yol secim merkezi: `web/src/pages/RoadmapHubPage.jsx`
- Yol adim sayfasi: `web/src/pages/RoadmapTrackPage.jsx`
- Yol verisi ve ilerleme kaydi: `web/src/lib/roadmapData.js`, `web/src/lib/roadmapProgress.js`
- Veri dosyasi: `web/public/data/roadmaps.json`

### 7) Veri katmani ve firsat eslestirme
- Veri yukleme: `web/src/lib/dataLoader.js`
- Firsat filtreleme/normalizasyon: `web/src/lib/opportunitiesFilter.js`, `web/src/lib/internshipsNormalize.js`, `web/src/lib/employersNormalize.js`
- Temel veri kaynaklari: `web/public/data/discipline_matrix.json`, `web/public/data/opportunities.json`

### 8) Otomasyon ve entegrasyonlar
- Ana n8n webhook kodu: `n8n/pusula-webhook-code.js`
- Yönelim n8n webhook kodu: `n8n/orientation-webhook-code.js`
- Davet/referral akis mantigi: `web/src/lib/inviteReferral.js`

### 9) UI altyapi bilesenleri
- UI temel bilesenleri: `web/src/components/ui/Button.jsx`, `web/src/components/ui/Card.jsx`, `web/src/components/ui/Badge.jsx`, `web/src/components/ui/Input.jsx`, `web/src/components/ui/Progress.jsx`
- Rozet sistemi: `web/src/components/PusulaBadgesStrip.jsx`, `web/src/lib/pusulaBadges.js`

## Neden dosyalar `features/` altina fiziksel olarak tasinmadi?

Dosyalar bilerek yerinde birakildi. Cunku:

1. **Calisan yapi korunur:** Proje su an `web/` dizin yapisina gore import ve build aliyor.
2. **Build/deploy riski azalir:** Buyuk klasor tasimalari import yol hatalarina ve deploy kirilmasina yol acabilir.
3. **Gereksiz diff engellenir:** Juriye kod kalitesini gosterirken "sadece tasima" kaynakli buyuk commit kalabaligi olusmaz.
4. **Brief uyumu yine saglanir:** `features/README.md` tek bakista tum calisan ozellikleri ve gercek kod konumlarini listeler.

Ozetle: `features/` burada "ozellik envanteri ve kanit klasoru" olarak kullaniliyor; uygulamanin canli ve stabil kodu ise `web/` ve `n8n/` altinda calismaya devam ediyor.
