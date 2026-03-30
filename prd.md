## Pusula — PRD (Ürün Gereksinim Belgesi) 🧭

### 1) Ürün Vizyonu ve Değer Önerisi

Pusula, **teknolojiye ilk adım atan kadınlar** için akademik ve kişisel arka planlarını teknoloji ekosistemiyle birleştiren **AI destekli kariyer keşif ve rehberlik** platformudur.

- **Temel sorun**: Öğrencilerin kendi bölümlerini (İstatistik, Psikoloji, İşletme, Biyoloji, Matematik vb.) teknoloji sektöründen bağımsız görmeleri ve sektördeki somut yerel fırsatlara (burs, topluluk, eğitim) erişim yollarını bilmemeleri.
- **Çözüm**: Akademik disiplin fark etmeksizin, kullanıcının mevcut yetkinliklerini Gemini AI ile analiz ederek **“Sektörel Uyumluluk Analizi”** ve **“Yerel Fırsat Radarı”** sunmak.
- **Kapsam kararı (yerel odak)**: Ürün bilinçli olarak **Türkiye’de teknoloji kariyerine adım atan kadınlara** odaklanır; bu yüzden öneriler ve fırsat radarı Türkiye’de erişilebilir kaynak/program/topluluklar üzerinden kurgulanır.

### 2) Kullanıcı Segmentasyonu (Multidisipliner Yaklaşım)

| Akademik Disiplin | Teknoloji Kesişim Noktası (Örnekler) | Öne Çıkan Yetkinlik |
|---|---|---|
| Sayısal & Analitik (İstatistik, Matematik, Aktüerya, Fizik) | Veri Bilimi, Yapay Zeka, FinTech, Risk Analizi | Veri Modelleme & Olasılık |
| İnsan & Toplum Bilimleri (Psikoloji, Sosyoloji, Felsefe) | UX Research, AI Etiği, İK Teknolojileri (HRTech) | Davranış Analizi & Empati |
| Doğa & Yaşam Bilimleri (Biyoloji, Kimya, Genetik) | BioTech, Sağlık Teknolojileri, Sürdürülebilirlik | Araştırma Metodolojisi |
| İdari & İktisadi Bilimler (İşletme, Ekonomi, Maliye) | Ürün Yönetimi (PM), Dijital Pazarlama, İş Analitiği | Stratejik Planlama & Analiz |
| Eğitim & Sanat (Öğretmenlikler, Tasarım, Konservatuvar) | EdTech, UI Tasarımı, Oyun Geliştirme (Game Dev) | Yaratıcılık & Bilgi Aktarımı |

### 3) Fonksiyonel Özellikler

#### 3.1) Çok Boyutlu Profilleme (Multidimensional Profiling)

Kullanıcının sadece bölümünü değil, ilgi alanlarını ve “soft skill” (sosyal beceri) envanterini sorgulayan interaktif modül.

- **AI analizi**: Gemini API kullanarak, kullanıcının akademik geçmişindeki “gizli teknoloji potansiyelini” (örn. bir edebiyat öğrencisinin dil işleme yeteneği) açığa çıkarır.

#### 3.2) Yerel Fırsat ve Ekosistem Radarı

Türkiye merkezli, kadın odaklı gelişim programlarının disiplin bazlı filtrelenmiş listesi.

- **İş birlikleri/kaynaklar**: UP School, SistersLab, Kodluyoruz, Patika.dev, Women Techmakers (WTM) ve üniversite kulüpleri.

#### 3.3) Bilişsel Engel Kırıcı (Barrier Breaker)

Sektörel mitleri (örn. “Yazılım için mühendislik diploması şarttır”) veriler ve farklı branşlardan gelmiş başarılı kadınların hikayeleriyle çürüten etkileşim katmanı.

#### 3.4) Dinamik Kariyer Rota Kartı (Visual Output)

Analiz sonuçlarını, önerilen 3 temel rolü ve **“Özgüven Deltası”** metriğini içeren, sosyal medyada paylaşılmaya uygun PNG çıktısı.

### 3.5) MVP Kapsamı (Buildathon Odaklı)

#### MVP (Kesin)

- Çok boyutlu profilleme: 5–8 soru ile kullanıcı profili toplama (bölüm + ilgi + güçlü yön + öğrenme tercihi + hedef)
- Gemini analizi: “Sektörel Uyumluluk Analizi” + 3 rol önerisi + her rol için “neden uygun?” açıklaması
- Yerel fırsat radarı: Rol/discipline göre **Türkiye odaklı** kaynak ve program önerileri (minimum: UP School, SistersLab, Kodluyoruz, Patika.dev, WTM)
- (Opsiyonel) Türkiye'de bu rollerde işe alan şirket örnekleri: Her rol için 3–5 şirket adı listeleme
- Engel kırıcı: Kullanıcının yazdığı engeli yeniden çerçeveleme + 1–2 somut aksiyon önerisi
- Kariyer rota kartı: Sonucu tek bir görsel çıktıya (PNG) dönüştürme (indirme/paylaşma)
- Özgüven Deltası (\( \Delta \)) anketi: Önce/sonra skor toplama ve farkı hesaplama

#### Zaman Kalırsa (Nice-to-have)

- Rozet sistemi
- `localStorage` ile ilerleme/sonuç hafızası
- Gelişmiş disiplin matrisi (daha fazla rol ve daha zengin eşleşme)

### 4) Kullanıcı Akışı (User Flow)

1. **Karşılama**: Proje vaadi + veri gizliliği kısa notu + başla
2. **Profil soruları**: Bölüm/disiplin + ilgi alanları + güçlü yönler + öğrenme stili + hedefler
3. **Ön anket**: “Teknoloji sektöründe kendimi hazır hissediyorum” (1–5)
4. **Analiz**: Gemini + disiplin matrisi -> 3 rol önerisi + açıklamalar
5. **Yerel fırsat ekranı**: Her rol için Türkiye kaynakları + program/topluluk linkleri
6. **Engel kırıcı**: Kullanıcı engelini yazar -> yeniden çerçeveleme + aksiyon adımı
7. **Son anket**: Aynı soru (1–5) -> \( \Delta \) hesaplama ve gösterme
8. **Kariyer kartı**: Görsel oluştur -> indir/paylaş

### 5) Kabul Kriterleri (Acceptance Criteria)

#### Profilleme

- Kullanıcı en az 5 soruyu cevaplayıp tek seferde gönderebilmeli
- Boş bırakılan alanlar için güvenli varsayılanlarla (örn. “belirtmek istemiyorum”) devam edebilmeli

#### Gemini analizi

- Çıktı **tam olarak 3 rol** içermeli
- Her rol için: “neden uygun?”, “ilk 3 adım” ve “başlangıç kaynakları” alanları bulunmalı
- Yanıt Türkçe olmalı ve yargılayıcı dil içermemeli

#### Yerel fırsat radarı

- Her rol için en az 3 kaynak/program listelenmeli
- Liste en az 1 “program/topluluk” (örn. UP School/WTM/YGA) içermeli

#### Engel kırıcı

- Kullanıcı metin girdiğinde 1 yanıt üretmeli: yeniden çerçeveleme + 1–2 aksiyon
- Yanıtta “imkansız, yapamazsın” gibi dışlayıcı ifade olmamalı

#### Özgüven Deltası (\( \Delta \))

- Önce ve sonra skorları (1–5) alınmalı
- \( \Delta = \text{son} - \text{ilk} \) hesaplanıp kullanıcıya gösterilmeli

#### Kariyer rota kartı (PNG)

- Kartta minimum şu alanlar bulunmalı: disiplin/bölüm (veya kullanıcı etiketi), 3 rol, \( \Delta \), tarih
- Tek tıkla PNG indirilebilmeli
- Mobil ekranda taşma/bozulma olmamalı

### 6) Teknik Mimari ve Stack

- **Frontend**: React.js (Vite), Tailwind CSS, Framer Motion (Animasyon)
- **AI Engine**: Gemini 1.5 Flash (sistem komutu: “Multidisipliner Kariyer Mentörü”)
- **Veri seti**: Türkiye’deki tüm ana disiplinlerin teknoloji eşleşme matrisini içeren JSON kütüphanesi
- **Görselleştirme**: html2canvas (kariyer kartı üretimi için)

### 7) Veri Gereksinimleri (Minimum Şema)

PRD’nin çalışır MVP’si için veri seti “küçük ama doğru” olmalı.

#### Disiplin matrisi (`discipline_matrix.json`)

- `disciplineId` (string)
- `disciplineName` (string)
- `roleMatches` (array)
  - `roleId` (string)
  - `roleName` (string)
  - `whyFits` (string[])
  - `firstSteps` (string[])
  - `tags` (string[])

#### Fırsat radarı (`opportunities.json`)

- `opportunityId` (string)
- `name` (string)
- `type` (enum: `program|community|course|scholarship`)
- `targetTags` (string[]) (örn. `data`, `ux`, `biotech`, `pm`)
- `forWho` (string) (kime uygun)
- `url` (string)

### 8) Ölçüm ve Analitik Planı

- **Birincil metrik**: \( \Delta \) dağılımı ve ortalaması
- **Akış metrikleri**:
  - Profil tamamlama oranı
  - Engel kırıcı kullanım oranı
  - Kariyer kartı indirme oranı
  - Fırsat link tıklanma oranı (UP School/YGA vb.)
- **Kalite sinyalleri**:
  - “Öneriler bana uydu” mini sorusu (1–5) (opsiyonel)
  - En sık yazılan engellerin tematik listesi (anonim)

### 9) Uygulama Yol Haritası (Roadmap)

#### Faz 1: Kapsayıcı Veri Tasarımı (1–4. Gün)

- **Disiplin matrisi**: Tüm fakültelerin teknoloji rolleriyle eşleşme mantığının koda dökülmesi
- **UI/UX**: Her disipline hitap eden, kapsayıcı ve modern bir görsel dil oluşturulması

#### Faz 2: AI Entegrasyonu (5–8. Gün)

- Gemini API ile “Akademik Geçiş” senaryolarının tüm branşlar için test edilmesi
- Türkiye’deki güncel eğitim/burs fırsatlarının veri tabanına işlenmesi

#### Faz 3: Lansman ve Test (9–12. Gün)

- Kariyer kartı indirme fonksiyonunun doğrulanması
- Vercel veya Netlify üzerinden canlıya alım

### 10) Başarı Metriği: Özgüven Deltası (\( \Delta \))

Anket başında ve sonunda sorulan “Teknoloji sektöründe kendimi hazır hissediyorum” sorusuna verilen cevaplar arasındaki fark.

- **Hedef**: Her kullanıcının en az **+3** birimlik farkındalık ve özgüven artışı ile platformdan ayrılması.

