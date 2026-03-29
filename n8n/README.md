# Pusula → n8n webhook

Uygulama `ResultsPage` içinde **JSON POST** eder; gövde `web/src/pages/ResultsPage.jsx` içindeki `buildRichWebhookPayload` ile üretilir.

## Akış

1. **Webhook** (POST, JSON) — URL’yi `web/.env` içinde `VITE_N8N_WEBHOOK_URL` olarak tanımla.
2. **Code** — `pusula-webhook-code.js` dosyasının **tamamını** Code node’a yapıştır (mode: run once for all items).
3. **Gmail** (veya Send Email) — HTML: `{{ $json.html }}`, konu: `{{ $json.subject }}`, alıcı: `{{ $json.to }}` (Code çıktısı her iki olayda da `to` doldurur).

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

`pusula-webhook-code.js` bu `event` değerini görünce kısa bir HTML üretir ve **alıcıyı** `inviterEmail` yapar. Kullanıcının “Sonuçları e-postaya gönder” akışı (`buildRichWebhookPayload`) aynı webhook’a gider; `event` alanı olmadığı için Code betiği uzun analiz e-postasını üretmeye devam eder.

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
