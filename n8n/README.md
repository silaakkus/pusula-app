# Pusula → n8n webhook

Uygulama `ResultsPage` içinde **JSON POST** eder; gövde `web/src/pages/ResultsPage.jsx` içindeki `buildRichWebhookPayload` ile üretilir.

## Akış

1. **Webhook** (POST, JSON) — URL’yi `web/.env` içinde `VITE_N8N_WEBHOOK_URL` olarak tanımla.
2. **Code** — `pusula-webhook-code.js` dosyasının **tamamını** Code node’a yapıştır (mode: run once for all items).
3. **Gmail** (veya Send Email) — HTML içerik: `{{ $json.html }}`, konu: `{{ $json.subject }}`, alıcı: `{{ $json.to }}` veya sabit test adresi.

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
