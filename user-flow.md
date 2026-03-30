# Pusula — Kullanıcı akışı (User Flow) 🧭

Bu doküman, uygulamanın **güncel** uçtan uca akışını adım adım tanımlar. Diyagram için aşağıdaki **ASCII akış** kullanılabilir.

---

## Akış diyagramı (özet)

```
[Landing / Home]
    ├─► [Akışa başla] ──► [Profil]
    ├─► [Kaldığın yerden devam] ──► (kaydedilen adıma)
    ├─► [Öğrenme yolları] ──► [Roadmap hub] ⇄ [Track]
    ├─► [Yönelim testi] ──► [Quiz] ──► [Yönelim sonucu]
    └─► [Gizlilik / bilgi] ──► [Landing bilgi sayfası]

[Profil] ──► [Ön anket (baseline)] ──► [Analiz (yükleniyor)]
    ──► [Sonuçlar — rol haritası]
    ──► [Engel]
    ──► [Engel özeti]
    ──► [Son anket]
    ──► [Kariyer kartı — PNG indir]

[Her adımda] ◄── [Önceki] / [Ana sayfaya dön]
```

Durum, tarayıcıda `localStorage` ile **`pusula_flow`** snapshot’ında saklanır (adım, profil, roller, engel özeti vb.).

---

## 1) Landing (Ana sayfa)

**Görür:** Pusula markası, Groq Destekli rozet metni, hero başlık ve açıklama, veri gizliliği / özellikler için accordion (ilk konu varsayılan açık), “Akışa başla — profil ve rota”, varsa “Kaldığın yerden devam”, “Öğrenme yolları”, “Yönelim testi”, kayıtlı oturum özeti satırı.

**Yapar:** Akışa başlar veya devam eder; isteğe bağlı roadmap / yönelim / bilgi sayfasına gider.

---

## 2) Profil (çok boyutlu)

**Görür:** Fakülte ve bölüm seçimi, bölüm ilgileri ve keyif maddeleri, üç teknoloji ilgi kümesi (alan / yapmak istedikleri / ortam), hedef, öğrenme stili, müsaitlik, çalışma modu, çalışma ortamı, etki teması, şehir.

**Yapar:** Formu doldurur, “Devam et” ile doğrulama sonrası akışa girer. Taslak `pusula_profile_draft` ile gecikmeli kaydedilebilir.

---

## 3) Ön anket (baseline)

**Görür:** Teknoloji kariyerinde özgüveni 1–5 arası soru.

**Yapar:** Skoru seçer; bu değer sonradan Δ hesabında **ilk** skor olarak kullanılır.

---

## 4) Analiz

**Görür:** Yükleniyor ekranı; arka planda LLM (Groq veya Gemini) + profil + matris özeti + (varsa) yönelim özeti ile rol üretimi.

**Yapar:** Bekler; hata olursa uygulama matris tabanlı yedek önerilere düşebilir.

---

## 5) Sonuçlar (rol haritası)

**Görür:** Önerilen roller (kartlar), neden uygun, ilk adımlar, başlangıç kaynakları, günün akışı, maaş (LLM + matris / kalibrasyon), işveren ve staj/program önerileri, şehre göre fırsat listesi, isteğe bağlı e-posta webhook gönderimi.

**Yapar:** Kartları inceler, bağlantılara gider, ilerler veya geri döner.

---

## 6) Engel

**Görür:** Serbest metin: kariyer yolunda hissettiği engel.

**Yapar:** Metni gönderir; AI yeniden çerçeveleme + aksiyon listesi üretir.

---

## 7) Engel özeti

**Görür:** Önceki adımın özeti ve ilerleme için kısa onay ekranı.

**Yapar:** Son ankete geçer.

---

## 8) Son anket (post-survey)

**Görür:** Özgüven sorusu tekrar (1–5).

**Yapar:** **Son** skoru verir; Δ = son − ilk hesaplanır.

---

## 9) Kariyer kartı

**Görür:** Δ özeti, önizlemede “Kariyer Rota Kartı” (fakülte · bölüm, rol örnekleri, Δ, tarih).

**Yapar:** PNG indirir, ana sayfaya veya önceki adıma dönebilir.

---

## Opsiyonel paralel akışlar

| Giriş | Akış |
|--------|------|
| Landing → Yönelim testi | `OrientationQuizPage` → tamamlanınca `OrientationResultPage`; sonuç akış snapshot’ına yazılabilir. |
| Landing → Öğrenme yolları | `RoadmapHubPage` → parça seçimi → `RoadmapTrackPage` |
| Davet linki | İnviter tamamlanınca n8n / referral mantığı tetiklenebilir. |

---

## Teknik not

- Ana rota state makinesi: `web/src/App.jsx`
- Sayfa bileşenleri: `web/src/pages/`
- Akış kalıcılığı: `web/src/lib/pusulaFlow.js`, taslak: `web/src/lib/profileDraft.js`
