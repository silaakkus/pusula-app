# Pusula 🧭

> ✨ Teknolojiye ilk adım atan kadınlar için AI destekli kariyer keşif rehberi — Groq / Gemini ile güçlendirilir 🚀

---

## Problem

Türkiye’de teknoloji alanına adım atmak isteyen birçok kadın üniversite öğrencisi **nereden başlayacağını** ve **hangi rolün kendine uygun olduğunu** netleştiremiyor. Bilgi kirliliği yüksek; bölümü “klasik mühendislik” olmayan öğrenciler ise “ben buna uygun değilim” hissine kapılarak ilk adımı hiç atmıyor.

**Özet:** Sorun yalnızca bilgi eksikliği değil; kişiye özel, yargılamayan ve Türkiye bağlamında uygulanabilir **yön** eksikliğidir.

**Kapsam:** Ürün bilinçli olarak Türkiye odaklıdır (kaynaklar, programlar, şehir filtresi, maaş bantları dili).

---

## Kullanıcı

**Kim?** Teknolojiye **ilk adımını** atmak veya yolunu netleştirmek isteyen **kadınlar**; çoğu üniversite çağında ve akademik profil üzerinden ilerler (fakülte / bölüm çeşitliliği yüksek; klasik teknoloji diploması şartı yok).

**Tipik ihtiyaçlar / hisler:**

- “Hangi teknoloji rolü bana daha yakın?”
- “Bölümüm teknolojiye kapı açıyor mu?”
- “İlk adımı atmaktan çekiniyorum; yargılanmadan net bir rota istiyorum.”

**Ne bekliyor?** Samimi dil, kişiselleştirilmiş rol önerileri, başlangıç kaynakları, mümkün olduğunda yerel fırsat ve program köprüleri, paylaşılabilir bir özet (kariyer kartı).

---

## Çözüm (ürünün bugünkü hali)

Pusula çok adımlı bir akış sunar:

1. **Landing:** Akışa başlama, kaldığı yerden devam, isteğe bağlı öğrenme yolları ve yönelim testi girişleri; gizlilik / özellik özeti.
2. **Çok boyutlu profil:** Fakülte, bölüm, bölüm ilgileri, teknoloji ilgi kümeleri (alan / el becerisi / ortam), hedef, öğrenme ve çalışma tercihleri, şehir vb.
3. **Ön anket (baseline):** Özgüven 1–5.
4. **AI analiz:** Profil + disiplin matrisi özeti + (varsa) yönelim sonucu ile **4–5 rol**; her rol için gerekçe, ilk adımlar, başlangıç kaynakları, maaş bandı (LLM + matris / kalibrasyon), işveren ve staj/program ipuçları.
5. **Sonuç ekranı:** Fırsat filtresi, detaylı rol kartları.
6. **Engel:** Kullanıcının yazdığı engeli AI ile yeniden çerçeveleme ve aksiyonlar.
7. **Son anket + kariyer kartı:** Özgüven tekrarı, Δ hesabı, PNG kart indirme.
8. **Opsiyonel:** Yol haritaları (roadmap), yönelim testi ve sonuç zenginleştirme (Groq), davet / n8n e-posta otomasyonu.

---

## AI'ın Rolü (zorunlu özet)

| Bağlam | AI ne yapıyor? |
|--------|----------------|
| Kariyer analizi | Profil ve matris sinyallerini yorumlayıp kişiselleştirilmiş rol seti ve açıklamalar üretir. Sağlayıcı: **Groq** veya **Gemini** (`VITE_LLM_PROVIDER` ile seçilir). |
| Engel modülü | Engeli dışlayıcı olmayan dilde yeniden çerçeveler; 3–4 somut aksiyon önerir. |
| Yönelim sonucu | İsteğe bağlı ek özet ve sıradaki adımlar (Groq zenginleştirme). |
| n8n | Webhook üzerinden profil / sonuç verisini işleyip e-posta gibi dış sistemlere iletir (otomasyon katmanı). |

**Önemli:** AI çıktıları tahmin niteliğindedir; özellikle maaş ve işveren örnekleri için kullanıcıya “resmi teklif / garanti değildir” mesajı UI’da korunur.

---

## Rakip Durum (kısa)

| Tür | Örnek | Pusula farkı |
|-----|--------|--------------|
| Genel sohbet | ChatGPT | Türkiye odaklı akış, profil + matris + kart entegre değil |
| Global platformlar | İngilizce kariyer araçları | Türkçe, yerel program ve fırsat dili |
| Tek özellik | Sadece ik veya sadece quiz | Profil + AI + engel + Δ + kart + opsiyonel yönelim / roadmap |

---

## Başarı kriteri

- Kullanıcı akışı sonunda **somut roller** ve **ilk adımlar** ile ayrılır.
- Engel adımından sonra **yeniden çerçevelenmiş** ve **eyleme dönük** mesaj alır.
- Kariyer kartında Δ ve özet görünür; **paylaşılabilir çıktı** üretilir.
- (Bonus) n8n ile e-posta / bildirim hattı çalışır.

---

## MVP / Buildathon teslim odağı — **10 günlük plan** (brief ile uyumlu)

Buildathon **10 günde ve 6 adımda** ilerler; Pusula bu çerçevede şu teslimleri karşılar:

| Gün / adım (brief) | Pusula karşılığı |
|-------------------|------------------|
| 1–2: Problem, rakip, idea.md | Bu dosya + rakip özeti |
| 2–4: PRD, tasks, user-flow, tech-stack | `prd.md`, `tasks.md`, `user-flow.md`, `tech-stack.md` |
| 3–6: Çalışan kod | `web/` (React/Vite), `features/README.md` envanteri |
| 6–7: AI güçlendirme | Sistem promptları, Groq yönelim zenginleştirme, maaş kalibrasyonu |
| 7–8: Yayın ve test | Canlı demo (README’deki Vercel linki) |
| 9–10: Demo video + README | README’de ekran görüntüleri; demo video linki eklenebilir |

**Not:** Eski taslaklardaki “5 günlük sprint” ifadesi kaldırıldı; tek resmi plan **10 günlük buildathon** olarak bu belgede tanımlıdır.

---

## Kapsam tablosu (güncel)

| Özellik | Durum |
|---------|--------|
| Çok boyutlu profil + AI rol önerisi | ✅ |
| Disiplin matrisi + yerel fırsat verisi | ✅ |
| Engel kırıcı (AI) | ✅ |
| Ön / son anket + Δ + kariyer kartı PNG | ✅ |
| Yönelim testi (opsiyonel) | ✅ |
| Öğrenme yolları (roadmap) | ✅ |
| Rozetler + localStorage akış kaydı | ✅ |
| n8n webhook (e-posta / tamamlanma) | ✅ |

---

## Bir sonraki adım (sürdürülebilirlik)

- Demo video linkini README’ye sabitlemek.
- Geri bildirim formu (brief Adım 5) ile 5+ kullanıcı testi özetini eklemek.
- `agents/` altında prompt / değerlendirme notlarını genişletmek (bonus).
