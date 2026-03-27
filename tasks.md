# Pusula — Uygulama Görev Listesi (MVP → Nice-to-have)

Bu liste `prd.md` içeriğini adım adım koda dökmek için hazırlanmıştır. Önce **MVP (kesin)** işleri tamamlanır; ardından **zaman kalırsa** işleri eklenir.

---

## 0) Proje Kurulum ve Temel Altyapı

- [x] React (Vite) proje kurulumu
- [x] Tailwind CSS kurulumu ve temel tema (renkler, font, spacing)
- [x] Sayfa iskeleti ve routing (tek sayfa da olur): `Home` / `Flow` / `Result`
- [x] Ortam değişkenleri: Gemini API anahtarı için `.env` ve örnek `.env.example`
- [x] Basit UI bileşenleri: Button, Card, Input, Progress, Badge (rozet için değil; UI etiket)

## 1) Veri Katmanı (MVP Minimum)

### 1.1 Disiplin matrisi
- [ ] `discipline_matrix.json` oluştur (minimum 5 disiplin x rol eşleşmeleri)
- [ ] JSON okuma yardımcıları (load/parse/validate)
- [ ] Rol eşleşmesi için tag stratejisi belirle (örn. `data`, `ux`, `pm`, `biotech`)

### 1.2 Fırsat radarı
- [ ] `opportunities.json` oluştur
- [ ] Fırsat tipleri: `program|community|course|scholarship`
- [ ] Minimum kaynaklar eklensin: UP School, SistersLab, Kodluyoruz, Patika.dev, WTM, YGA
- [ ] Tag’e göre filtreleme fonksiyonu (rol tag’leri -> fırsat listesi)

## 2) Kullanıcı Akışı (UI) — Profil Soruları + Ön Anket

- [x] Karşılama ekranı: değer önerisi + “Başla”
- [ ] Veri gizliliği kısa notu (metin)
- [ ] Profil formu (5–8 soru)
  - [ ] Bölüm/disiplin seçimi
  - [ ] İlgi alanları (çoklu seçim)
  - [ ] Güçlü yönler (çoklu seçim)
  - [ ] Öğrenme stili (tek seçim)
  - [ ] Hedef (tek seçim veya kısa metin)
  - [ ] Boş geçilebilir alanlar için güvenli varsayılanlar
- [x] Ön anket: “Teknoloji sektöründe kendimi hazır hissediyorum” (1–5)
- [ ] Form doğrulama + “Devam et” butonu (kısmen: buton var, sonraki adıma bağlanmadı)

## 3) Gemini Entegrasyonu — Analiz ve 3 Rol Çıktısı

- [x] `@google/generative-ai` paketi kurulumu
- [ ] Gemini istemci katmanı (fetch wrapper + hata yönetimi)
- [ ] Sistem komutu: “Multidisipliner Kariyer Mentörü” konseptine uygun prompt taslağı
- [ ] Prompt input’u: profil cevapları + disiplin matrisi özet sinyali
- [ ] Yanıt formatını zorla (JSON gibi) ve parse et
  - [ ] Tam olarak **3 rol** döndüğünü doğrula
  - [ ] Her rol için alanlar: `roleName`, `whyFits[]`, `firstSteps[]`, `starterResources[]`, `tags[]`
- [ ] Hata durumları: API başarısızsa kullanıcıya tekrar dene + basit fallback

## 4) Sonuç Ekranı — Rol Önerileri + Yerel Fırsat Radarı

- [ ] 3 rol kartı UI
  - [ ] “Neden uygun?” maddeleri
  - [ ] “İlk 3 adım” maddeleri
  - [ ] “Başlangıç kaynakları” linkleri/başlıkları
- [ ] Yerel fırsatlar alanı
  - [ ] Rol tag’lerine göre `opportunities.json` filtreleme
  - [ ] Her rol için en az 3 fırsat gösterimi
  - [ ] En az 1 “program/topluluk” (UP School/WTM/YGA vb.) görünsün
- [ ] (Opsiyonel) Türkiye’de işe alan şirket örnekleri alanı (rol başına 3–5)

## 5) Engel Kırıcı Modül + Son Anket + Δ Hesabı

- [ ] “Engelin nedir?” metin girişi (örn. matematik, geç kaldım, bölümüm alakasız)
- [ ] Gemini’ye engel-kırıcı prompt (yeniden çerçeveleme + 1–2 aksiyon)
- [ ] Engel kırıcı yanıt UI (ton kontrolü: dışlayıcı dil yok)
- [ ] Son anket: aynı soru (1–5)
- [ ] \( \Delta = son - ilk \) hesapla ve ekranda göster

## 6) Kariyer Rota Kartı (PNG) — html2canvas

- [ ] Kart tasarımı (mobil uyumlu)
  - [ ] Kullanıcı etiketi (disiplin/bölüm veya seçili etiket)
  - [ ] 3 rol
  - [ ] \( \Delta \)
  - [ ] Tarih
- [ ] html2canvas ile PNG üret
- [ ] “İndir” butonu ile dosya indir (tek tık)
- [ ] Görsel taşma/bozulma testleri (mobil + masaüstü)

## 7) Ölçüm ve Analitik (MVP)

- [ ] Event şeması belirle (en azından konsol/log ile başlayabilir)
- [ ] Kaydet/ölç:
  - [ ] Profil tamamlama
  - [ ] Engel kırıcı kullanımı
  - [ ] Kart indirme
  - [ ] Fırsat link tıklama
  - [ ] \( \Delta \) değeri (anonim)

## 8) Deploy + Final Kontroller

- [ ] Build ayarları ve environment değişkenleri kontrolü
- [ ] Netlify/Vercel deploy
- [ ] Hızlı test senaryoları:
  - [ ] Profil -> 3 rol -> fırsatlar -> engel kırıcı -> \( \Delta \) -> kart indir
  - [ ] API hata senaryosu (yeniden dene)

---

## Zaman Kalırsa (Nice-to-have)

- [ ] Rozet sistemi (tamamlama/engeli yazma/kart indirme)
- [ ] `localStorage` ile ilerleme/sonuç hafızası
- [ ] Şehir bazlı filtre (V2 fikri)
- [ ] Daha zengin disiplin matrisi (daha fazla rol + daha fazla örnek)

