const fs = require('fs');
const path = require('path');

const locales = ['tr', 'en', 'es', 'ru', 'zh-CN', 'ja', 'ko'];
const descs = {
  tr: 'Yapay zekâ modelleri sürekli gelişebilir, ancak hafıza sabittir. Saule; zihinsel yükünüzü, kararlarınızı ve niyetlerinizi koruyarak, hangi yapay zekâ asistanını kullanırsanız kullanın sizi zaman içinde anlayan bağımsız bir Anlamsal Bellek Katmanı\'dır.',
  en: 'AI models constantly evolve, but memory remains constant. Saule is an independent Semantic Memory Layer that preserves your mental load, decisions, and intentions, understanding you over time regardless of which AI assistant you use.',
  es: 'Los modelos de IA evolucionan constantemente, pero la memoria permanece constante. Saule es una Capa de Memoria Semántica independiente que preserva su carga mental, decisiones e intenciones, entendiéndole a lo largo del tiempo sin importar qué asistente de IA utilice.',
  ru: 'Модели ИИ постоянно развиваются, но память остается неизменной. Saule — это независимый слой семантической памяти, который сохраняет вашу умственную нагрузку, решения и намерения, понимая вас с течением времени независимо от того, какого ИИ-ассистента вы используете.',
  'zh-CN': 'AI模型在不断进化，但记忆是不变的。Saule是一个独立的语义记忆层，无论您使用哪种AI助手，它都能保存您的心理负荷、决定和意图，随着时间的推移理解您。',
  ja: 'AIモデルは常に進化していますが、記憶は変わりません。Sauleは、使用するAIアシスタントに関係なく、時間の経過とともにあなたを理解し、精神的負荷、決定、意図を保持する独立したセマンティック・メモリ・レイヤーです。',
  ko: 'AI 모델은 끊임없이 진화하지만 기억은 변함이 없습니다. Saule는 사용하는 AI 어시스턴트에 관계없이 시간이 지남에 따라 사용자를 이해하고 정신적 부담, 결정 및 의도를 보존하는 독립적인 시맨틱 메모리 계층입니다.'
};

locales.forEach(loc => {
  const file = path.join(__dirname, '../src/dictionaries', loc + '.json');
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  data.home_page.hero_desc = descs[loc];
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
});

console.log("Hero descriptions updated successfully.");
