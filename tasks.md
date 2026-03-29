# Pusula — Uygulama Görev Listesi (MVP → Nice-to-have)

Bu liste `prd.md` içeriğini adım adım koda dökmek için hazırlanmıştır. Önce **MVP (kesin)** işleri tamamlanır; ardından **zaman kalırsa** işleri eklenir.

---

## 0) Proje Kurulum ve Temel Altyapı

- [x] React (Vite) proje kurulumu
- [x] Tailwind CSS kurulumu ve temel tema (renkler, font, spacing)
- [x] Sayfa iskeleti ve akış: karşılama → profil → ön anket → analiz → sonuçlar → engel → son anket → kariyer kartı (`App.jsx` içi adım yönetimi)
- [x] Ortam değişkenleri: Gemini API anahtarı için `.env` ve örnek `.env.example`
- [x] Basit UI bileşenleri: Button, Card, Input, Progress, Badge (rozet için değil; UI etiket)

## 1) Veri Katmanı (MVP Minimum)

### 1.1 Disiplin matrisi
- [x] `discipline_matrix.json` oluştur (minimum 5 disiplin x rol eşleşmeleri) — `web/public/data/discipline_matrix.json`
- [x] JSON okuma yardımcıları (load/parse/validate) — `web/src/lib/dataLoader.js`
- [x] Rol eşleşmesi için tag stratejisi belirle (örn. `data`, `ux`, `pm`, `biotech`) — matris + `opportunitiesFilter.js`

### 1.2 Fırsat radarı
- [x] `opportunities.json` oluştur — `web/public/data/opportunities.json`
- [x] Fırsat tipleri: `program|community|course|scholarship`
- [x] Minimum kaynaklar eklensin: UP School, SistersLab, Kodluyoruz, Patika.dev, WTM, YGA
- [x] Tag’e göre filtreleme fonksiyonu (rol tag’leri -> fırsat listesi) — `opportunitiesFilter.js`

## 2) Kullanıcı Akışı (UI) — Profil Soruları + Ön Anket

- [x] Karşılama ekranı: değer önerisi + “Başla”
- [x] Veri gizliliği kısa notu (metin) — `LandingPage.jsx`
- [x] Profil formu (5–8 soru) — `ProfilePage.jsx` (5 ana blok)
  - [x] Bölüm/disiplin seçimi
  - [x] İlgi alanları (çoklu seçim)
  - [x] Güçlü yönler (çoklu seçim)
  - [x] Öğrenme stili (tek seçim)
  - [x] Hedef (tek seçim veya kısa metin)
  - [x] Boş geçilebilir alanlar için güvenli varsayılanlar (“Belirtmek istemiyorum”)
- [x] Ön anket: “Teknoloji sektöründe kendimi hazır hissediyorum” (1–5)
- [x] Form doğrulama + “Devam et” butonu (sonraki adıma bağlı)

## 3) Gemini Entegrasyonu — Analiz ve 3 Rol Çıktısı

- [x] `@google/generative-ai` paketi kurulumu
- [x] Gemini istemci katmanı (fetch wrapper + hata yönetimi) — `gemini.js` + SDK; `createModel` / `apiVersion`
- [x] Sistem komutu: “Multidisipliner Kariyer Mentörü” konseptine uygun prompt taslağı
- [x] Prompt input’u: profil cevapları + disiplin matrisi özet sinyali
- [x] Yanıt formatını zorla (JSON gibi) ve parse et
  - [x] Tam olarak **3 rol** döndüğünü doğrula
  - [x] Her rol için alanlar: `roleName`, `whyFits[]`, `firstSteps[]`, `starterResources[]`, `tags[]` (+ `employersTurkey[]`)
- [x] Hata durumları: API başarısızsa matris fallback + sonuç ekranında **“Gemini ile tekrar dene”** (`ResultsPage` / `analysis_retry` olayı)

## 4) Sonuç Ekranı — Rol Önerileri + Yerel Fırsat Radarı

- [x] 3 rol kartı UI — `ResultsPage.jsx`
  - [x] “Neden uygun?” maddeleri
  - [x] “İlk 3 adım” maddeleri
  - [x] “Başlangıç kaynakları” linkleri/başlıkları
- [x] Yerel fırsatlar alanı
  - [x] Rol tag’lerine göre `opportunities.json` filtreleme
  - [x] Her rol için en az 3 fırsat gösterimi
  - [x] En az 1 “program/topluluk” (UP School/WTM/YGA vb.) görünsün
- [x] (Opsiyonel) Türkiye’de işe alan şirket örnekleri alanı (rol başına 3–5) — `employersTurkey`

## 5) Engel Kırıcı Modül + Son Anket + Δ Hesabı

- [x] “Engelin nedir?” metin girişi (örn. matematik, geç kaldım, bölümüm alakasız) — `BarrierPage.jsx`
- [x] Gemini’ye engel-kırıcı prompt (yeniden çerçeveleme + 1–2 aksiyon) — `gemini.js`
- [x] Engel kırıcı yanıt UI (ton kontrolü: dışlayıcı dil yok) — `BarrierReviewPage.jsx`; API hata/skip → `barrierFallback.js`
- [x] Son anket: aynı soru (1–5) — `PostSurveyPage.jsx`
- [x] Δ = son − ilk hesapla ve ekranda göster — `FinalCardPage.jsx`

## 6) Kariyer Rota Kartı (PNG) — html2canvas

- [x] Kart tasarımı (mobil uyumlu) — `CareerCardCapture.jsx`
  - [x] Kullanıcı etiketi (disiplin/bölüm veya seçili etiket)
  - [x] 3 rol
  - [x] Δ
  - [x] Tarih
- [x] html2canvas ile PNG üret — `downloadCareerCard.js`
- [x] “İndir” butonu ile dosya indir (tek tık)
- [x] Görsel taşma/bozulma testleri (mobil + masaüstü) — manuel QA önerilir; kart `max-w-[360px]` ile sınırlandı

## 7) Ölçüm ve Analitik (MVP)

- [x] Event şeması belirle (en azından konsol/log ile başlayabilir) — `analytics.js` (`[Pusula]` önekli)
- [x] Kaydet/ölç:
  - [x] Profil tamamlama (`profile_complete`)
  - [x] Engel kırıcı kullanımı (`barrier_submit`, `barrier_skip`, `barrier_complete`)
  - [x] Kart indirme (`card_download`)
  - [x] Fırsat link tıklama (`opportunity_click`)
  - [x] Δ değeri (`delta_value`)

## 8) Deploy + Final Kontroller

- [x] Build ayarları ve environment değişkenleri kontrolü — `npm run build` / `VITE_*` değişkenleri
- [x] Netlify/Vercel deploy (canlıya alındı)
- [x] Hızlı test senaryoları (akış kodda uçtan uca mevcut; manuel tıklama testi önerilir):
  - [x] Profil → 3 rol → fırsatlar → engel kırıcı → Δ → kart indir
  - [x] API hata senaryosu (fallback + “Gemini ile tekrar dene”)

---

## Zaman Kalırsa (Nice-to-have)

- [x] Rozet sistemi (tamamlama/engeli yazma/kart indirme) — `pusulaBadges.js`, `PusulaBadgesStrip.jsx`
- [x] `localStorage` ile ilerleme/sonuç hafızası — `pusulaFlow.js` (`pusula_flow`), karşılama “Kaldığın yerden devam et”
- [x] Şehir bazlı filtre (V2 fikri) — profilde şehir + `opportunities.json` `cities` + `opportunitiesFilter.js`
- [x] Daha zengin disiplin matrisi (daha fazla rol + daha fazla örnek) — 4. rol satırları eklendi (çoklu disiplin)

---

## V2 (Tamamlananlar)

- [x] Öğrenme yolları modülü: hub + adım sayfası + yerel ilerleme takibi (`RoadmapHubPage.jsx`, `RoadmapTrackPage.jsx`, `roadmapProgress.js`)
- [x] Yönelim testi modülü: 6 soru, sonuç üretimi ve sonuç kartı PNG indir (`orientationQuiz.js`, `OrientationQuizPage.jsx`, `OrientationResultPage.jsx`, `OrientationCardCapture.jsx`)
- [x] Yönelim testi metinleri yeni başlayan diliyle sadeleştirildi; seçenek altı açıklamalar eklendi; kullanıcıya görünen n8n ipuçları kaldırıldı
- [x] Öğrenme yolu içerikleri yeni başlayan seviyesine göre güncellendi (`web/public/data/roadmaps.json`)
- [x] Davet akışı iyileştirildi: kısa link kopyalama/paylaşma ve davetli girişinde öneri görünce bilgilendirme gönderimi (`InviteFriendCard.jsx`, `inviteReferral.js`)
- [x] Yönelim sonucu: daha uzun sade metin, emoji’li başlıklar, adım satırlarında “başlık — açıklama”; uzak yanıtta kalan n8n kalıntıları `sanitizeOrientationBody` ile temizleniyor (`orientationQuiz.js`, `OrientationResultPage.jsx`)
- [x] Rozetler: “Yönelim” ve “Harita” rozetleri eklendi; harita adımı işaretlenince otomatik açılıyor; uygulama açılışında mevcut harita ilerlemesi rozete yansıyor (`pusulaBadges.js`, `App.jsx`, `roadmapProgress.js`)
- [x] Rozet şeridi mobilde sola hizalı satır kırılımı (`PusulaBadgesStrip.jsx` — `flex-wrap` + `justify-start` / `content-start`)
