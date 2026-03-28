# 🧭 Pusula — Adım Adım Kullanıcı Akışı (User Flow)

Bu doküman, Pusula uygulamasının uçtan uca kullanıcı akışını (MVP) tanımlar.

---

## 1) İlk Temas (Landing)

### Kullanıcı ne görür?
- Mor ve mercan tonlarında, modern ve ferah bir karşılama ekranı
- Mesaj: **“Bölümün ne olursa olsun, teknoloji rotan burada başlıyor”**
- Parlayan/öne çıkan CTA butonu: **“Rotanı Oluştur”**

### Kullanıcı ne yapar?
- CTA butonuna tıklar
- Kısa bir **veri gizliliği onayı** verdikten sonra keşfe başlar

---

## 2) Baseline (Özgüven Ölçümü)

### Kullanıcı ne görür?
- Soru: **“Şu an teknoloji sektöründe kendine yer bulma konusunda özgüvenin kaç?”**
- Cevap aralığı: **1–5** (yıldızlar veya slider)

### Kullanıcı ne yapar?
- Mevcut hissini işaretler  
- Bu değer, \( \Delta \) hesabı için **başlangıç** noktasıdır

---

## 3) Keşif Anketi (Profilleme)

### Kullanıcı ne görür?
- Tek tek gelen, interaktif ve sıkmayan **5–6 soru**
- Örnek soru tipleri:
  - “Bölümün?”
  - “Hobilerin/ilgi alanların?”
  - “Problem çözerken yaklaşımın?”

### Kullanıcı ne yapar?
- Seçenek işaretler ve/veya kısa metinler girer

---

## 4) AI Analiz Animasyonu

### Kullanıcı ne görür?
- Yükleme ekranı metni: **“Pusula senin için en uygun rotayı hesaplıyor…”**
- Gemini API yanıtını beklerken dönen **şık pusula animasyonu**

### Kullanıcı ne yapar?
- Birkaç saniye bekler

---

## 5) Rota ve Fırsat Ekranı (Sonuç)

### Kullanıcı ne görür?
- Gemini tarafından önerilen **3 spesifik rol**
  - Örn: İstatistik öğrencisi için “Veri Analisti”
  - Örn: Psikoloji öğrencisi için “UX Araştırmacı”
- **“Neden Sen?”** bölümü:
  - Akademik arka planıyla rolün nasıl örtüştüğüne dair mentorluk mesajı
- **Yerel Fırsatlar** alanı:
  - UP School, SistersLab vb. kurumların rol odaklı linkleri

### Kullanıcı ne yapar?
- Önerileri inceler
- Fırsat linklerine tıklar

---

## 6) Engel Kırıcı (Barrier Breaker)

### Kullanıcı ne görür?
- Prompt: **“Seni durduran nedir?”** metin kutucuğu

### Kullanıcı ne yapar?
- Engelini yazar (örn. “İngilizcem yetersiz”, “Kodlama çok zor geliyor”)
- AI, bu engeli **mantıklı bir zeminde yeniden çerçeveler** ve **somut bir ilk adım** önerir

---

## 7) Final ve Çıktı (Kariyer Kartı)

### Kullanıcı ne görür?
- Tekrar özgüven sorusu: **“Şimdi nasıl hissediyorsun?”** (1–5)
- Sonuç özeti:
  - \( \Delta \) artışı (örn. **+3**)
- Yolculuğu özetleyen estetik **Kariyer Rota Kartı**

### Kullanıcı ne yapar?
- \( \Delta \) sonucunu görür
- Kartı **PNG** olarak indirir
- LinkedIn/Instagram’da paylaşır

