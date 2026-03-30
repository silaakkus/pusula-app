# Pusula → n8n webhook

Uygulama `ResultsPage` içinde **JSON POST** eder; gövde `web/src/pages/ResultsPage.jsx` içindeki `buildRichWebhookPayload` ile üretilir.

## Akış

1. **Webhook** (POST, JSON) — URL’yi `web/.env` içinde `VITE_N8N_WEBHOOK_URL` olarak tanımla.
2. **Code** — `pusula-webhook-code.js` dosyasının **tamamını** Code node’a yapıştır (mode: run once for all items).
3. **Gmail** (veya Send Email) — alanları **ifade (Expression)** modunda doldur; düz metin kutusuna `{{ $json.subject }}` yazarsan Gmail konuyu aynen böyle gönderir.
   - **Alıcı (To):** ifade → `{{ $json.to }}` veya bazı sürümlerde `={{ $json.to }}`
   - **Konu (Subject):** ifade → `={{ $json.subject }}` (n8n 1.80+ çoğu yerde `=` ile ifade başlar)
   - **Message (HTML):** ifade → `={{ $json.html }}`
   Code çıktısı hem analiz hem `davet_tamamlandi` için `to` / `subject` / `html` üretir.

**Önemli:** Tek bir **Webhook → Code → Gmail** hattı kullan. Code node aynı formatta çıktı üretir; Gmail’i **If** düğümünün yalnızca bir dalına bağlama — her istek Code’dan geçmeli.

## `davet_tamamlandi` (davet eden kullanıcıya mail)

Son adımda arkadaşını davet ederken **e-posta alanını** dolduran kullanıcı, paylaşılan linkte `?inviter=e-posta` ile gider. Arkadaş **sonuç sayfasına** (önerilen roller yüklendiğinde) gelince uygulama aynı `VITE_N8N_WEBHOOK_URL` adresine ikinci bir gövde gönderir:

| Alan | Açıklama |
|------|----------|
| `event` | Sabit: `davet_tamamlandi` |
| `inviterEmail` | Bildirim gidecek adres (davet eden) |
| `roles` | Rol başlıkları (kısa özet) |
| `inviteeDiscipline`, `inviteeCity` | Özet metin için (PII yok) |
| `timestamp` | ISO zaman |

`pusula-webhook-code.js` bu `event` değerini görünce kısa bir HTML üretir ve **alıcıyı** `inviterEmail` yapar. Kullanıcının “Sonuçları e-postaya gönder” akışı (`buildRichWebhookPayload`) aynı webhook’a gider; `event` alanı olmadığı için Code betiği uzun analiz e-postasını üretmeye devam eder. **Not:** Arkadaşın sonuçları kendi adresine istemesi gerekmez; uygulama sonuç sayfasına gelindiğinde / akış ilerlediğinde bu bildirim ayrı gönderilir.

## Payload özeti

| Alan | Açıklama |
|------|----------|
| `email`, `timestamp`, `city`, `cityId` | Kullanıcı ve zaman |
| `analysisSource`, `aiProviderLabel` | groq / gemini / fallback |
| `profile` | disiplin, ilgi, güçlü yönler, öğrenme, hedef |
| `roles` | Rol başlıkları dizisi |
| `rolesDetail[]` | Her rol: `whyFits`, `firstSteps`, `starterResources`, `dayInLife`, `salaryRange` + `salaryRangesByOrigin` (`llm` / `matrix` / `default`), `employers`, `internships` (`source`: llm/matrix), `llmApplicationPrograms` |
| `opportunities[]` | `name`, `url`, `description`, `forRole`, `source` (`dataset` \| `llm`) |

Webhook gövdesi kökte gelir; bazı proxy’ler `{ "body": { ... } }` sararsa Code betiği bunu da çözer.

## Sorun giderme

- **“Workflow ran into an error”** ve arkadaş tamamlayınca mail gitmiyorsa: n8n’de **Executions** → hatalı çalıştırmayı açıp **Code** satırındaki mesaja bak. Eski betikte `davet_tamamlandi` dalı `esc` tanımlanmadan önce çalıştığı için `ReferenceError: esc is not defined` oluşabiliyordu; repodaki güncel `pusula-webhook-code.js` dosyasını Code node’a **yeniden yapıştır**.
- Gmail’e **boş alıcı** gitmesi de hataya yol açar; güncel betik geçersiz `to` için çıktı üretmez (Gmail atlanır).
- **To / Subject / Message** alanlarında **ifade** kullan (alanın sağındaki **Expression** / **fx** veya metnin başına `=`). Düz metin modunda `{{ $json.subject }}` yazdıysan gelen mailin konusu tam olarak bu kalır — düzelt: konu alanını ifadeye çevir ve içeriği `={{ $json.subject }}` yap.
- n8n arayüzünde bir çalıştırma açıp **Gmail** düğümüne tıkla; **INPUT** panelinde Code çıktısında `subject`, `to`, `html` dolu mu kontrol et. Doluysa sorun yalnızca Gmail alanının “fixed” kalmasıdır.

## Yönelim testi (`yonerge_testi`)

**Workflow:** Webhook (Respond = *Using Respond to Webhook Node*) → **Code** (`orientation-webhook-code.js` dosyasının tamamını yapıştır) → **Respond to Webhook** (*Respond With:* **First Incoming Item**).

Pusula ana sayfadaki **“Hangi alana yakınsın?”** akışı son soruda `VITE_N8N_ORIENTATION_WEBHOOK_URL` tanımlıysa POST atar:

```json
{
  "event": "yonerge_testi",
  "answers": [{ "questionId": "q1", "optionId": "q1a" }, "..."],
  "localGuess": "frontend",
  "localScores": { "frontend": 0, "backend": 0, "...": 0 }
}
```

**Respond to Webhook** ile dönen gövde JSON olmalı (örnek):

```json
{
  "archetype": "backend",
  "headline": "Sen backend tarafına güçlü kayıyorsun!",
  "subline": "Kısa alt başlık",
  "body": "Paragraf metni…",
  "nextSteps": ["Adım 1", "Adım 2", "Adım 3"]
}
```

`archetype` opsiyonel; şu id’lerden biri: `frontend`, `backend`, `veri-bilimi`, `yapay-zeka`, `devops`, `urun-ux`. Webhook yoksa veya yanıt geçersizse Pusula **yerelde** skorla aynı alanları hesaplar.

**CORS:** Ön uçtan doğrudan n8n’e `fetch` yapılıyorsa n8n bulutunun CORS politikası engelleyebilir; engellenirse yalnızca yerel skor kullanılır veya kök alan adında reverse proxy gerekir.

---

## Güncel Staj Programları entegrasyonu (yeni)

Ana sayfadaki **“Güncel Staj Programları”** butonu `staj-listesi` ekranını açar; bu ekran `useEffect` ile n8n webhook’tan veri çeker.

### Senin n8n’de yapacağınlar (basit)

1. **Yeni workflow aç**
   - Düğüm: **Webhook**
   - Method: **GET**
   - Path: örn. `pusula-staj-listesi`
2. **(Opsiyonel) Code / HTTP Request düğümü ekle**
   - İstersen veriyi sabit bir diziden döndür.
   - İstersen Youthall/LinkedIn gibi kaynaklardan toplayıp normalize et.
3. **Respond to Webhook** düğümü ekle
   - JSON döndür.
4. **CORS izinlerini** kontrol et (frontend domain’inden çağrı yapılacak).
5. Webhook URL’ini al, frontend’e yaz:
   - `web/.env` içine:
     - `VITE_N8N_INTERNSHIP_LIST_WEBHOOK_URL=https://<senin-n8n>/webhook/pusula-staj-listesi`
6. Frontend’i yeniden başlat (`npm run dev`), ana sayfadan butona tıkla.

### Beklenen JSON formatı

Ekran hem düz dizi, hem `{ items: [...] }`, hem `{ data: [...] }` kabul eder.

```json
{
  "items": [
    {
      "title": "Data Analyst Intern",
      "company": "Örnek Şirket",
      "location": "İstanbul / Uzaktan",
      "deadline": "2026-06-15",
      "type": "Staj",
      "url": "https://ornek.com/kariyer/staj",
      "summary": "SQL ve dashboard odaklı staj programı.",
      "eligibility": "Kimler katılabilir: 3. veya 4. sınıf öğrencileri"
    }
  ]
}
```

### V3 için önerilen n8n mimarisi

- `GET /webhook/pusula-staj-listesi`
- `GET /webhook/pusula-yarisma-listesi`
- `GET /webhook/pusula-bootcamp-listesi`

Bu üç endpoint aynı kart bileşeniyle UI’da sekmeli şekilde gösterilebilir.
