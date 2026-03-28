# Pusula 🧭
> Teknolojiye ilk adım atan kadınlar için AI destekli kariyer keşif rehberi

---

## Problem

Türkiye'de teknoloji sektöründe kadın temsili hâlâ erkeklerin çok gerisinde. Bunun en kritik kırılma noktası üniversite yılları: teknolojiye ilgi duyan pek çok kadın öğrenci, hangi alana yöneleceğini bilemiyor, "ben buna uygun muyum?" sorusuna takılıp kalıyor ve ilk adımı atmadan vazgeçiyor.

Sorun bilgi eksikliği değil — yön eksikliği.

**Ürün kapsamı bilinçli olarak Türkiye odaklıdır.** Çünkü hedef kullanıcı Türkiye'deki kadın öğrenciler olduğu için yönlendirmeler de Türkiye’de erişilebilir kaynak, program ve topluluklar üzerinden tasarlanır.

---

## Kullanıcı

**Kim?** Teknolojiye yeni başlayan veya başlamayı düşünen üniversite öğrencisi kadınlar.

**Nasıl hissediyor?**
- "Kodlamayı hiç bilmiyorum, geç mi kaldım?"
- "Veri bilimi mi, siber güvenlik mi, hangisi bana uyar?"
- "Matematiği sevmiyorum, bu yüzden teknoloji benim için değil mi?"

**Ne istiyor?** Yargılamayan, kişisel ve somut bir yön.

---

## Çözüm

Pusula, kullanıcıya 5-6 eğlenceli soru sorar — ilgi alanları, güçlü yönleri, günlük alışkanlıkları. Ardından AI iki şeyi birden yapar:

1. **Kariyer Önerisi:** Kullanıcının profiline en uygun **3 rol** önerir, her biri için "neden sen?" açıklaması üretir.
2. **Engel Kırıcı:** Kullanıcı bir engel yazdığında ("matematik bilmiyorum", "bu işler benim için değil") AI bunu kariyer dışlayıcı olarak değil, yeniden çerçeveleyen bir bakış açısıyla ele alır.

Öneri ekranı, sadece alan adıyla bitmez. Her öneri için şunları sunar:
- Türkiye'de bu alanda işe alan şirket örnekleri (opsiyonel)
- Ücretsiz Türkçe başlangıç kaynakları
- UP School / YGA programlarına yönlendirme

---

## AI'ın Rolü

Yapay zeka bu projede iki kritik noktada devreye girer:

| Nokta | AI Ne Yapıyor? |
|---|---|
| Kariyer keşfi | Kullanıcı cevaplarını analiz edip kişiselleştirilmiş alan önerisi üretir |
| Engel kırıcı | Kullanıcının yazdığı engeli alır, teknoloji kariyer bağlamında yeniden çerçeveler |

Kullanılan model: Gemini API (Google AI Studio)

---

## Rakip Durum

| Rakip | Ne Yapıyor | Eksik Olan |
|---|---|---|
| ChatGPT | Genel kariyer önerisi | Kişiselleştirme yok, Türkiye odaklı değil |
| LinkedIn AI | İş ilanı eşleştirme | Başlangıç seviyesine uygun değil |
| UP AI | Genel kişisel gelişim, rol deneyimleme | Teknoloji kariyer keşfine özel değil |
| techwomen.io | AI destekli kariyer koçu + iş eşleştirme | İngilizce, abonelik gerekli, Türkiye odaklı değil |
| MentorHer | AI kariyer yol haritası + mentor eşleştirme | Genel kadın profesyoneller için, başlangıç seviyesine özel değil |
| Asha Bot | Ses destekli AI kariyer botu, bias tespiti | Hackathon projesi, iş gücüne yeniden dönenler için tasarlanmış |
| Yabancı platformlar | Gelişmiş öneri motorları | Türkçe yok, Türk iş piyasasını tanımıyor |

**Pusula'nın net farkı:**
> *"Mevcut çözümlerin tamamı İngilizce, abonelik bazlı ve global. Pusula; Türkçe, ücretsiz, Türkiye iş piyasasına odaklı ve teknolojiye ilk kez adım atan üniversite öğrencisi kadınlara özel ilk AI kariyer rehberidir."*

---

## Başarı Kriteri

Bu proje başarılı olursa:

- Kullanıcı uygulamayı açtıktan 3 dakika içinde hangi teknoloji alanına yöneleceğini bilir
- "Ben buna uygun değilim" düşüncesiyle gelen kullanıcı, çıkarken somut bir sonraki adımla ayrılır
- UP School programlarına yönlendirilen kullanıcı sayısı artar

## MVP Teslim Odağı (10 Günlük Prototip)

Brief’in beklentisiyle uyumlu şekilde, ilk çalışan prototipi mümkün olduğunca erken görmek için kapsamı katmanlayacağız:

1. Önce en temel akış: soru-cevap -> Gemini önerisi (2-3 alan) -> “sonraki adım” butonları
2. Ardından kariyer kartı: öneriyi paylaşılabilir tek bir “profil kartı”na dönüştürme
3. Ardından engel kırıcı: kullanıcı engelini yazınca yeniden çerçeveleme + aksiyon önerisi
4. Zaman kalırsa: rozet sistemi + `localStorage` ile kaldığı yerden devam

Bu sırayı korumak, 5 günde (ve 10 günde çalışan prototip vizyonunda) “görünür değer üreten” bir ürün çıkarma riskini azaltır.

## Ek Başarı Metriği (Test Anketi)

Engel kırıcı modülün gerçekten “engel hissini” azalttığını ölçmek için kısa bir anket ekleyeceğiz:

- Engel örneği girdikten sonra kullanıcıya 1-5 arası “özgüven/uygunluk” puanı (örn. 1=çok düşük, 5=çok yüksek)
- Engel kırıcı öneriyi gördükten sonra aynı soruyu tekrar sorup puan artışını (delta) kaydetme

Bu metrik 5. adım test sürecini somutlaştırır ve “AI’ın etkisi var mı?” sorusuna yanıt verir.

## Cursor İçin Uygulama Önceliği

Cursor/Agent modunda ilk yazdırılacak akış şu olmalı:

1. Soru ekranı (minimum 5-6 soru) + tek seferde form gönderimi
2. Gemini’den alan önerisi alma (stream değil, tek yanıt MVP)
3. Öneri kartı içinde “Türkiye odaklı kaynaklar” + UP School/YGA yönlendirme butonları
4. Kullanıcı engelini yazınca Gemini’den yeniden çerçeveleme + 1-2 somut aksiyon
5. Kariyer kartı (paylaşılabilir görsel)
6. Zaman kalırsa: rozet + `localStorage` (tamamlandı/rozet aldım durumları)

## Bir Sonraki Adım

Şu an Adım 2’ye geçmek için (PRD + görevleri bölme):

- `idea.md` içeriğini baz alarak kısa bir PRD taslağı çıkar
- PRD’den `tasks.md` türet (MVP scope, ekranlar, API entegrasyonu, başarı metriklerini kaydetme)

Gemini/Canvas prompt örneği:

"Hazırladığım `idea.md` dosyasını baz alarak bana bir PRD (Ürün Gereksinim Belgesi) hazırlar mısın? İçinde kullanıcı akışı (user flow), teknik yığın (tech stack: React/Tailwind/Gemini API gibi) ve Cursor için adım adım `tasks.md` (görev listesi) olsun. 5 gün içinde çalışan MVP önceliğini özellikle uygula."

---

## Kapsam (5 Günlük Buildathon)

| Özellik | Durum |
|---|---|
| Kariyer keşif akışı (sorular → AI öneri) | ✅ Yapılacak |
| Engel kırıcı modül | ✅ Yapılacak |
| Kariyer kartı (paylaşılabilir görsel) | ✅ Yapılacak |
| Rozet sistemi | ⭐ Zaman kalırsa |
| localStorage hafıza | ⭐ Zaman kalırsa |
| Gerçek topluluk eşleştirme | 🔜 V2 |
