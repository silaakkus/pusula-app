# Pusula — Teknoloji yığını (Tech Stack)

Bu doküman, projede **gerçekten kullanılan** teknolojileri ve seçim gerekçelerini özetler (buildathon `tech-stack.md` teslimi ile uyumlu).

---

## Ön uç (web uygulaması)

| Teknoloji | Kullanım | Gerekçe |
|-----------|----------|---------|
| **React 19** | UI bileşenleri, sayfa akışı | Yaygın ekosistem, bileşen tabanlı yapı, Cursor ile hızlı iterasyon |
| **Vite** | Derleme ve dev sunucusu | Hızlı HMR, üretim build’i sade |
| **JavaScript (ES modules)** | Uygulama dili | Proje genişlemesinde tip zorunluluğu olmadan prototip hızı |
| **Tailwind CSS** | Stil | Utility-first ile tutarlı spacing/renk; ayrı CSS dosya yükü az |
| **Framer Motion** | Sayfa / bileşen animasyonları | Karşılama ve kart geçişlerinde düşük eforlu hareket |
| **Lucide React** | İkon seti | Hafif, tutarlı ikonlar |
| **html2canvas** | Kariyer / yönelim kartı PNG | Tarayıcıda kartı görüntüle, indirilebilir görsel üret |

**Konum:** `web/`  
**Çalıştırma:** `cd web && npm install && npm run dev`  
**Üretim build:** `npm run build` → `web/dist/`

---

## Yapay zeka (LLM)

| Teknoloji | Kullanım | Gerekçe |
|-----------|----------|---------|
| **Google Gemini** (`@google/generative-ai`) | Kariyer analizi, engel yeniden çerçeveleme (provider seçiminde) | Google AI Studio ile ücretsiz kota; resmi SDK |
| **Groq API** (OpenAI uyumlu REST) | Kariyer analizi, engel, yönelim zenginleştirme (provider seçiminde) | Hızlı çıkarım; UP School / proje içinde markalı kullanım |
| **Ortam seçimi** | `VITE_LLM_PROVIDER` (`groq` \| varsayılan `gemini`) | Tek kod tabanında iki sağlayıcı; `web/src/lib/llmConfig.js` |

Ana prompt ve JSON şeması: `web/src/lib/gemini.js`  
Yönelim Groq ek promptu: `web/src/lib/orientationGroqEnrich.js`  
Groq HTTP istemcisi: `web/src/lib/groqClient.js`

---

## Veri ve mantık (istemci tarafı)

| Teknoloji / format | Kullanım | Gerekçe |
|--------------------|----------|---------|
| **JSON** | `discipline_matrix.json`, `opportunities.json`, `roadmaps.json` | Statik veri; CDN/repo üzerinden yükleme, LLM’e özet besleme |
| **localStorage** | `pusula_flow`, profil taslağı, oturum, rozet ilerlemesi | Sunucusuz prototipte “kaldığın yerden devam” ve Δ tekrar kullanımı |

İlgili modüller: `web/src/lib/dataLoader.js`, `web/src/lib/pusulaFlow.js`, `web/src/lib/profileDraft.js`

---

## Otomasyon

| Teknoloji | Kullanım | Gerekçe |
|-----------|----------|---------|
| **n8n** (workflow) | Webhook ile e-posta / bildirim | Brief’teki “görsel otomasyon” beklentisi; kod içi `Code` node örnekleri repo’da |

**Konum:** `n8n/pusula-webhook-code.js`, `n8n/orientation-webhook-code.js`, `n8n/README.md`

---

## Barındırma ve dağıtım

| Teknoloji | Kullanım | Gerekçe |
|-----------|----------|---------|
| **Vercel** (veya benzeri static host) | `web` build çıktısının yayını | README’deki canlı demo; GitHub ile entegre sürekli dağıtım |

Brief’te örnek olarak **Lovable / Netlify** geçer; bu projede üretim linki **Vercel** üzerindedir — aynı teslim kategorisinde (statik SPA + env ile API anahtarları).

---

## Geliştirme araçları

| Araç | Rol |
|------|-----|
| **Git / GitHub** | Versiyon ve teslim |
| **Cursor** | Kod üretimi ve düzenleme |
| **npm** | Paket yönetimi (`web/package.json`) |

---

## Güvenlik notu (kısa)

API anahtarları tarayıcıya gider (`VITE_*`); bu bir **prototip bilinçli tercih**idir. Üretimde anahtarlar backend veya sunucu proxy arkasında tutulmalıdır.
