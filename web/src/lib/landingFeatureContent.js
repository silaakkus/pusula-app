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
      title: 'Hızlı Analiz',
      shortDesc: '5 dakikada kariyer rotanı belirle.',
      detail:
        'Pusula, bölümün, ilgi alanların ve güçlü yönlerin üzerinden geçerek senin için en uygun teknoloji rolleri ve alanlarını çıkartır. Sorular sade tutulur; birkaç dakikada doldurup ilk rota taslağını görebilirsin.',
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
      title: 'AI Mentor',
      shortDesc: `${b} ile sana özel öneriler.`,
      detail: `${b} destekli mentor, seçilen kariyer rotalarına göre hangi becerileri geliştirmen, hangi kaynaklardan başlaman ve hangi adımları denemen gerektiği konusunda sana özel bir aksiyon listesi çıkarır.`,
    },
  ];
}
