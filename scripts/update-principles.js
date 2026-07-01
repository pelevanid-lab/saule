const fs = require('fs');
const path = require('path');

const locales = ['tr', 'en', 'es', 'ru', 'zh-CN', 'ja', 'ko'];

const content = {
  tr: {
    section_principles_title: "Mimari İlkeler",
    principles_desc: "Saule, anlık çıktı üretmeyi değil, bağlamsal bütünlüğü korumayı hedefler.",
    principles: [
      "Model Bağımsızlığı: Herhangi bir LLM sağlayıcısına kilitlenmez, kontrolü size bırakır.",
      "Kesintisiz Bağlam: Parçalanmış dijital izleri anlamlı ve bütünsel bir hikâyeye dönüştürür.",
      "Aktif Bellek: İnsanı sadece bir komut kaynağı değil, hafızanın öznesi olarak konumlandırır.",
      "Sessiz Asistan: Sürekli yönlendirme beklemez; arka planda öğrenir ve doğru anı kollar."
    ]
  },
  en: {
    section_principles_title: "Architectural Principles",
    principles_desc: "Saule aims to preserve contextual integrity rather than just generating immediate outputs.",
    principles: [
      "Model Independence: Not locked into any LLM provider; keeps you in control.",
      "Seamless Context: Transforms fragmented digital footprints into a coherent, holistic story.",
      "Active Memory: Positions humans not merely as prompt sources, but as the subjects of memory.",
      "Silent Assistant: Doesn't constantly wait for directions; learns in the background and acts at the right moment."
    ]
  },
  es: {
    section_principles_title: "Principios Arquitectónicos",
    principles_desc: "Saule tiene como objetivo preservar la integridad contextual en lugar de solo generar resultados inmediatos.",
    principles: [
      "Independencia del Modelo: No está bloqueado con ningún proveedor de LLM; te mantiene en control.",
      "Contexto Continuo: Transforma huellas digitales fragmentadas en una historia coherente y holística.",
      "Memoria Activa: Posiciona a los humanos no simplemente como fuentes de comandos, sino como sujetos de memoria.",
      "Asistente Silencioso: No espera constantemente direcciones; aprende en segundo plano y actúa en el momento adecuado."
    ]
  },
  ru: {
    section_principles_title: "Архитектурные принципы",
    principles_desc: "Saule стремится сохранить контекстную целостность, а не просто генерировать мгновенные результаты.",
    principles: [
      "Независимость от модели: Не привязан к одному поставщику LLM; оставляет контроль за вами.",
      "Бесшовный контекст: Преобразует фрагментированные цифровые следы в связную, целостную историю.",
      "Активная память: Позиционирует людей не просто как источники команд, а как субъекты памяти.",
      "Тихий помощник: Не ждет постоянно указаний; учится в фоновом режиме и действует в нужный момент."
    ]
  },
  'zh-CN': {
    section_principles_title: "架构原则",
    principles_desc: "Saule 旨在保留上下文完整性，而不仅仅是生成即时输出。",
    principles: [
      "模型独立性：不锁定任何 LLM 供应商；让您保持控制。",
      "无缝上下文：将碎片化的数字足迹转化为连贯、全面的故事。",
      "主动记忆：将人类定位为记忆的主体，而不仅仅是提示词来源。",
      "静默助手：不总是等待指令；在后台学习并在合适的时刻行动。"
    ]
  },
  ja: {
    section_principles_title: "アーキテクチャ原則",
    principles_desc: "Sauleは、即座にアウトプットを生成するだけでなく、文脈の完全性を維持することを目指しています。",
    principles: [
      "モデルの独立性: 特定のLLMプロバイダーに縛られず、あなたが制御を維持します。",
      "シームレスなコンテキスト: 断片化されたデジタルの足跡を、一貫した全体的な物語に変換します。",
      "アクティブメモリ: 人間を単なるプロンプトのソースとしてではなく、記憶の主体として位置づけます。",
      "サイレントアシスタント: 常に指示を待つのではなく、バックグラウンドで学習し、適切なタイミングで行動します。"
    ]
  },
  ko: {
    section_principles_title: "아키텍처 원칙",
    principles_desc: "Saule는 즉각적인 출력을 생성하는 것보다 맥락적 무결성을 보존하는 것을 목표로 합니다.",
    principles: [
      "모델 독립성: 특정 LLM 제공업체에 종속되지 않으며 통제권을 유지합니다.",
      "원활한 컨텍스트: 파편화된 디지털 발자국을 일관되고 전체적인 이야기로 변환합니다.",
      "활성 메모리: 인간을 단순한 프롬프트 소스가 아니라 기억의 주체로 자리매김합니다.",
      "조용한 어시스턴트: 지속적으로 지시를 기다리지 않고 백그라운드에서 학습하며 적절한 순간에 행동합니다."
    ]
  }
};

locales.forEach(loc => {
  const file = path.join(__dirname, '../src/dictionaries', loc + '.json');
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  
  data.home_page.section_principles_title = content[loc].section_principles_title;
  data.home_page.principles_desc = content[loc].principles_desc;
  data.home_page.principles = content[loc].principles;
  
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
});

console.log("Principles updated successfully.");
