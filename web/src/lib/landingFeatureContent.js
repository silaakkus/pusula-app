/** Ana sayfa accordion + bilgi sayfası bölümleri için ortak metinler. */

export function privacyDetailParagraph(brand) {
  const b = brand || 'Yapay zeka';
  return `Yanıtlarının çoğu cihazında tutulur; analiz için seçilen sağlayıcıya (${b}) yalnızca akışta verdiğin özet bilgiler gönderilir. Hesap açman gerekmez; sonuçları istersen indirip paylaşabilirsin. Tasarım gereği ham veriler sunucularımızda kalıcı profil olarak saklanmaz.`;
}

export function getLandingAccordionSections(brand) {
  const b = brand || 'Yapay zeka';
  return [
    {
      id: 'privacy',
      title: 'Veri gizliliği',
      shortDesc: 'Verilerin nasıl işlendiğine dair özet.',
      detail: privacyDetailParagraph(b),
    },
    {
      id: 'feature-hizli-analiz',
      title: 'Kişiselleştirilmiş rota',
      shortDesc: 'Fakülte, bölüm ve teknoloji ilgilerinle eşleşen öneriler.',
      detail:
        'Önce fakülte ve bölümünü seçersin; bölümüne özel ilgi ve keyif maddelerinin yanı sıra teknoloji dünyasında seni çeken alanlar, yapmak istediğin şeyler ve sana yakın rol/ortam tiplerini işaretlersin. Öğrenme stilin, hedefin ve şehir tercihin fırsat filtrelerine girer. Bu profil ve disiplin matrisi, Groq veya Gemini ile uyumlu rol, staj ve program önerileri üretmek için kullanılır.',
    },
    {
      id: 'feature-yerel-firsatlar',
      title: 'Yerel Fırsatlar',
      shortDesc: "Türkiye'deki burs ve eğitim radarı.",
      detail:
        "Türkiye'deki burs programları, bootcamp'ler, topluluklar ve staj/iş fırsatları arasından profilinle eşleşenleri ön plana çıkarıyoruz. Henüz tüm kurumları kapsamasa da, teknolojiye girişte işine yarayacak kapıları bir arada görmeni sağlıyor.",
    },
    {
      id: 'feature-ai-mentor',
      title: 'Yapay zekâ önerileri',
      shortDesc: `${b} ile rol metinleri ve program bağlantıları.`,
      detail: `${b} ile rol açıklamaları, ilk adımlar, başlangıç kaynakları ve (varsa) staj / başvuru linkleri üretilir. Günün akışı, matris maaş bantları ve örnek işverenler yerel veri katmanından tamamlanır; bağlantılarda her zaman resmi sayfayı doğrula.`,
    },
  ];
}
