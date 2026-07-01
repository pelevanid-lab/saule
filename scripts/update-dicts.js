const fs = require('fs');
const path = require('path');

const locales = ['tr', 'en', 'es', 'ru', 'zh-CN', 'ja', 'ko'];
const dictDir = path.join(__dirname, '../src/dictionaries');

const translations = {
  tr: {
    heroSubtitle: 'Anlamsal Bellek Katmanı (SML)',
    probTitle: 'Bellek Krizi',
    probDesc: 'Modern insanın sorunu bilgi eksikliği değildir. Parçalanmış bellek krizidir. Her platform hikâyenin küçük bir parçasını hatırlar, ancak hiçbiri hikâyenin tamamını bilmez.',
    solTitle: 'Anlamsal Bellek Katmanı',
    solDesc: 'Saule, yeni bir yapay zekâ modeli inşa etmek yerine; gücünü hangi yapay zekâ modelinden alırsa alsın, bireyler, ekipler ve topluluklar boyunca anlamsal bağlamı koruyan bağımsız bir hafıza katmanı inşa eder.',
    footCta: 'Zekâ değişebilir. Hafıza değil.',
    accItem1: "White Paper'ı oku"
  },
  en: {
    heroSubtitle: 'Semantic Memory Layer (SML)',
    probTitle: 'The Memory Crisis',
    probDesc: 'The problem of modern humans is not a lack of information. It is a crisis of fragmented memory. Each platform remembers a small piece of the story, but none knows the whole story.',
    solTitle: 'The Semantic Memory Layer',
    solDesc: 'Instead of building a new AI model, Saule builds an independent memory layer that preserves semantic context across individuals, teams, and communities—no matter which AI model powers it.',
    footCta: 'Intelligence may change. Memory does not.',
    accItem1: 'Read the White Paper'
  },
  es: {
    heroSubtitle: 'Capa de Memoria Semántica (SML)',
    probTitle: 'La crisis de la memoria',
    probDesc: 'El problema del ser humano moderno no es la falta de información. Es la crisis de la memoria fragmentada. Cada plataforma recuerda una pequeña parte de la historia. Ninguna conoce la historia completa.',
    solTitle: 'La Capa de Memoria Semántica',
    solDesc: 'En lugar de construir un nuevo modelo de IA, Saule construye una capa de memoria independiente que preserva el contexto semántico entre personas, equipos y comunidades, independientemente del modelo de IA que la impulse.',
    footCta: 'La inteligencia puede cambiar. La memoria no.',
    accItem1: 'Lee el White Paper'
  },
  ru: {
    heroSubtitle: 'Семантический слой памяти (SML)',
    probTitle: 'Кризис памяти',
    probDesc: 'Проблема современного человека — не в нехватке информации. Это кризис фрагментированной памяти. Каждая платформа помнит лишь небольшую часть истории. Ни одна не знает истории целиком.',
    solTitle: 'Семантический слой памяти',
    solDesc: 'Вместо создания новой модели искусственного интеллекта Saule строит независимый слой памяти, который сохраняет семантический контекст для отдельных людей, команд и сообществ — независимо от того, какая модель ИИ его использует.',
    footCta: 'Интеллект может меняться. Память — нет.',
    accItem1: 'Прочтите White Paper'
  },
  'zh-CN': {
    heroSubtitle: '语义记忆层 (SML)',
    probTitle: '记忆危机',
    probDesc: '现代人的问题不是缺乏信息。而是记忆的碎片化危机。每个平台都只记得故事的一小部分。没有一个知道完整的故事。',
    solTitle: '语义记忆层',
    solDesc: 'Saule 不去构建新的 AI 模型，而是构建一个独立的记忆层。无论底层是由什么 AI 模型驱动，它都能在个人、团队和社区之间保留语义上下文。',
    footCta: '智能会变。记忆永恒。',
    accItem1: '阅读白皮书 (White Paper)'
  },
  ja: {
    heroSubtitle: 'セマンティックメモリレイヤー (SML)',
    probTitle: '記憶の危機',
    probDesc: '現代人の問題は、情報の不足ではありません。断片化された記憶の危機です。それぞれのプラットフォームは、ストーリーの小さな断片しか覚えていません。全体を知るものは一つもありません。',
    solTitle: 'セマンティックメモリレイヤー',
    solDesc: 'Sauleは、新しいAIモデルを構築するのではなく、どのAIモデルから力を得ようとも、個人、チーム、コミュニティを通じてセマンティックな文脈を維持する、独立した記憶レイヤーを構築します。',
    footCta: '知性は変わり得る。記憶は変わらない。',
    accItem1: 'ホワイトペーパーを読む'
  },
  ko: {
    heroSubtitle: '의미론적 메모리 레이어 (SML)',
    probTitle: '기억의 위기',
    probDesc: '현대인의 문제는 정보의 부족이 아닙니다. 파편화된 기억의 위기입니다. 각 플랫폼은 이야기의 아주 작은 부분만 기억합니다. 그 누구도 이야기 전체를 알지 못합니다.',
    solTitle: '의미론적 메모리 레이어',
    solDesc: 'Saule은 새로운 AI 모델을 구축하는 대신, 어떤 AI 모델을 사용하더라도 개인, 팀, 커뮤니티 전반에 걸쳐 의미론적 맥락을 보존하는 독립적인 메모리 레이어를 구축합니다.',
    footCta: '지능은 변할 수 있습니다. 기억은 그렇지 않습니다.',
    accItem1: '백서(White Paper) 읽기'
  }
};

locales.forEach(loc => {
  const filePath = path.join(dictDir, `${loc}.json`);
  const dict = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  // 1. Remove book_beginning
  if (dict.book_beginning) {
    delete dict.book_beginning;
  }

  // 2. Remove community_page and header.nav_community
  if (dict.community_page) {
    delete dict.community_page;
  }
  if (dict.header && dict.header.nav_community) {
    delete dict.header.nav_community;
  }

  // 3. Update home_page
  if (dict.home_page) {
    delete dict.home_page.cta_community;
    delete dict.home_page.community_title;
    delete dict.home_page.community_desc;
    delete dict.home_page.section_ecosystem_title;
    
    dict.home_page.hero_subtitle = translations[loc].heroSubtitle;
    dict.home_page.problem_title = translations[loc].probTitle;
    dict.home_page.problem_desc = translations[loc].probDesc;
    dict.home_page.solution_title = translations[loc].solTitle;
    dict.home_page.solution_desc = translations[loc].solDesc;
    dict.home_page.footer_cta = translations[loc].footCta;
  }

  // 4. Update access_page ("Yaşayan Kitap" -> "White Paper")
  if (dict.access_page && dict.access_page.process_item1) {
    dict.access_page.process_item1 = translations[loc].accItem1;
  }

  fs.writeFileSync(filePath, JSON.stringify(dict, null, 2), 'utf8');
});

console.log('Dictionaries updated!');
