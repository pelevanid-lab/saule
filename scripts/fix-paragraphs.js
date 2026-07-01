const fs = require('fs');
const path = require('path');

const contentDir = path.join(__dirname, '../src/content/volume1');

// All translated paragraphs for ES, RU, ZH-CN, JA, KO
const allParagraphs = {
  es: {
    summary: [
      'La inteligencia artificial se está convirtiendo en una mercancía (commodity).',
      'Los modelos de razonamiento mejoran mes a mes, los precios caen y cambiar de proveedor es más fácil que nunca.',
      'Sin embargo, se está perdiendo algo mucho más valioso.',
      'No la inteligencia. La memoria.',
      'El conocimiento humano, el contexto organizacional, las relaciones, las decisiones y las experiencias se fragmentan en docenas de herramientas digitales. Cada plataforma almacena información, pero ninguna preserva el significado a lo largo del tiempo.',
      'Saule presenta una nueva categoría de software: La Capa de Memoria Semántica (SML - Semantic Memory Layer).',
      'En lugar de construir un nuevo modelo de IA, Saule construye una capa de memoria independiente que preserva el contexto semántico entre personas, equipos y comunidades, independientemente del modelo de IA que la impulse.',
      'La inteligencia puede cambiar. La memoria no.'
    ],
    'memory-crisis': [
      'El problema del ser humano moderno no es la falta de información. Es la crisis de la memoria fragmentada.',
      'Nuestro conocimiento vive dentro de estas herramientas:',
      'Correo electrónico | Slack | WhatsApp | Google Drive | Notion | Calendarios | CRM | Chatbots de IA',
      'Cada plataforma recuerda una pequeña parte de la historia. Ninguna conoce la historia completa.',
      'La información persiste. El contexto se pierde.'
    ],
    'ai-illusion': [
      'Los sistemas de IA actuales parecen inteligentes porque recuerdan conversaciones. Sin embargo, esta memoria: Es específica de la plataforma, Está bloqueada en el modelo, Es transitoria, Depende del proveedor (vendor).',
      'El contexto acumulado le pertenece al proveedor de IA, no a usted. Cuando cambia de un modelo a otro, meses o años de comprensión contextual desaparecen al instante.',
      'El mundo cree que está construyendo inteligencia. En realidad, está reconstruyendo la memoria desde cero constantemente.'
    ],
    'intelligence-commodity': [
      'Los modelos de razonamiento (LLM) pronto estarán en todas partes. Los usuarios cambiarán de modelo tal como eligen un navegador. OpenAI. Anthropic. Google. Nuevos modelos del futuro. Todos serán intercambiables.',
      'La verdadera ventaja competitiva del futuro no será la inteligencia. Será la memoria.'
    ],
    'semantic-memory-layer': [
      'Saule no compite con los modelos de IA. Saule existe de forma integrada en ellos.',
      'Aplicaciones → Modelos de Razonamiento (LLMs) → Capa de Memoria Semántica de Saule (SML) [Gráfico de Conocimiento | Memoria Vectorial | Gráfico de Identidad | Línea de Tiempo | Memoria del Espacio de Trabajo] → Vida Digital Humana',
      'El LLM piensa. Saule recuerda.'
    ],
    'living-memory': [
      'El software tradicional almacena información. Saule almacena experiencia.',
      'Comprende: ¿Por qué se tomó una decisión? ¿Quién influyó en ella? ¿Qué alternativas estaban disponibles? ¿Qué condiciones estaban activas? ¿Cómo evolucionó la información con el tiempo?',
      'La memoria cobra vida.'
    ],
    'personal-memory': [
      'Una persona no debería consumir energía mental en recordarlo todo. Ideas. Objetivos. Notas. Proyectos. Relaciones. Hábitos.',
      'Saule conecta estos elementos continuamente dentro de una red semántica viva.',
      'El usuario ya no busca. El usuario recuerda.'
    ],
    'collective-memory': [
      'Los grupos olvidan incluso más rápido que los individuos. Equipos estratégicos. Grupos de investigación. Startups. Instituciones.',
      'Cada día se genera nueva información y casi toda se pierde.',
      'Saule crea una memoria colectiva permanente. No un historial de chat. No una pila de documentos. Un entendimiento compartido.'
    ],
    'beyond-communication': [
      'Las aplicaciones de mensajería ayudan a las personas a comunicarse. Las herramientas de gestión de proyectos organizan las tareas. Las bases de conocimiento estructuran los documentos.',
      'Saule organiza la memoria misma.'
    ],
    'workspace-model': [
      'Cada espacio de trabajo representa una memoria viva.',
      'Las estructuras principales en las que nos enfocamos: Área de Inteligencia Personal | Equipos Estratégicos | Grupos de Investigación y Desarrollo | Centros de Memoria Compartida Empresarial.',
      'Cada espacio de trabajo desarrolla y profundiza su propia memoria semántica única con el tiempo.'
    ],
    'ai-as-interface': [
      'La IA no es el producto en sí. Es meramente la interfaz.',
      'Los motores de razonamiento (modelos) cambiarán. La memoria de Saule es permanente.'
    ],
    'absolute-privacy': [
      'Su memoria es valiosa solo cuando le pertenece únicamente a usted.',
      'Saule es una extensión de la mente humana y del intelecto corporativo. Por lo tanto, su memoria externa nunca se convierte en datos de entrenamiento para un modelo.',
      'Saule opera bajo principios de "Conocimiento Cero". El sistema que lee, procesa y fusiona el contexto no almacena esta información para su propio beneficio. Las personas y las organizaciones son los soberanos absolutos de su propia memoria.'
    ],
    'new-digital-organ': [
      'La civilización humana ha inventado: La escritura, Las bibliotecas, Los motores de búsqueda, El almacenamiento en la nube, La Inteligencia Artificial.',
      'La siguiente capa: Memoria semántica persistente.',
      'No para reemplazar la inteligencia humana. Sino para extenderla.'
    ],
    vision: [
      'Creemos que:',
      'Cada individuo merece una memoria de por vida.',
      'Cada equipo creativo merece un intelecto compartido que preserve su contexto.',
      'Cada empresa merece una memoria corporativa imborrable.',
      'La memoria debe pertenecer a las personas que la crean. No a las plataformas que casualmente utilizan.'
    ],
    'closing-manifesto': [
      'La IA nos ayuda a pensar.',
      'La Memoria Semántica nos permite recordar.',
      'El progreso humano requiere ambas.',
      'Saule está construyendo la capa de memoria de la humanidad.'
    ]
  },
  ru: {
    summary: [
      'Искусственный интеллект становится сырьевым товаром (commodity).',
      'Модели рассуждения совершенствуются с каждым месяцем, цены падают, а переключение между провайдерами становится проще, чем когда-либо.',
      'Однако теряется нечто гораздо более ценное.',
      'Не интеллект. Память.',
      'Человеческие знания, контекст компании, отношения, решения и опыт фрагментированы по десяткам цифровых инструментов. Каждая платформа хранит информацию, но ни одна не сохраняет смысл с течением времени.',
      'Saule представляет новую категорию программного обеспечения: Семантический слой памяти (SML - Semantic Memory Layer).',
      'Вместо создания новой модели искусственного интеллекта Saule строит независимый слой памяти, который сохраняет семантический контекст для отдельных людей, команд и сообществ — независимо от того, какая модель ИИ его использует.',
      'Интеллект может меняться. Память — нет.'
    ],
    'memory-crisis': [
      'Проблема современного человека — не в нехватке информации. Это кризис фрагментированной памяти.',
      'Наши знания живут внутри этих инструментов:',
      'Электронная почта | Slack | WhatsApp | Google Диск | Notion | Календари | CRM-системы | ИИ-чат-боты',
      'Каждая платформа помнит лишь небольшую часть истории. Ни одна не знает истории целиком.',
      'Информация сохраняется. Контекст теряется.'
    ],
    'ai-illusion': [
      'Современные системы ИИ кажутся умными, потому что помнят разговоры. Однако эта память: Привязана к конкретной платформе, Заблокирована в модели, Временна, Зависима от поставщика (vendor-lock).',
      'Накопленный вами контекст принадлежит поставщику ИИ, а не вам. При переходе от одной модели к другой месяцы или годы контекстного понимания мгновенно исчезают.',
      'Мир верит, что строит интеллект. На самом деле он постоянно перестраивает память с нуля.'
    ],
    'intelligence-commodity': [
      'Модели рассуждения (LLM) скоро будут везде. Пользователи будут переключаться между ними так же просто, как выбирать браузер. OpenAI. Anthropic. Google. Совершенно новые модели будущего. Все они станут взаимозаменяемыми.',
      'Главным конкурентным преимуществом будущего станет не интеллект. Им станет память.'
    ],
    'semantic-memory-layer': [
      'Saule не конкурирует с моделями ИИ. Saule интегрируется и существует вместе с ними.',
      'Приложения → Модели рассуждения (LLM) → Семантический слой памяти Saule (SML) [Граф знаний | Векторная память | Граф идентичности | Временная шкала | Память рабочего пространства] → Цифровая жизнь человека',
      'LLM думает. Saule помнит.'
    ],
    'living-memory': [
      'Традиционное ПО хранит информацию. Saule хранит опыт.',
      'Система понимает: Почему было принято решение? Кто на него повлиял? Какие были альтернативы? Какие условия были активны? Как информация развивалась со временем?',
      'Память оживает.'
    ],
    'personal-memory': [
      'Человек не должен тратить ментальную энергию на то, чтобы помнить всё. Идеи. Цели. Заметки. Проекты. Отношения. Привычки.',
      'Saule непрерывно связывает их в живую семантическую сеть.',
      'Пользователю больше не нужно искать. Пользователь просто помнит.'
    ],
    'collective-memory': [
      'Группы забывают информацию даже быстрее, чем отдельные люди. Стратегические команды. Исследовательские группы. Стартапы. Организации.',
      'Каждый день создается новая информация, и почти вся она теряется.',
      'Saule создает постоянную коллективную память. Не историю чата. Не стопку документов. Общее разделяемое понимание.'
    ],
    'beyond-communication': [
      'Мессенджеры помогают людям общаться. Инструменты управления проектами организуют задачи. Базы знаний структурируют документы.',
      'Saule организует саму память.'
    ],
    'workspace-model': [
      'Каждое рабочее пространство представляет собой живую память.',
      'Основные структуры, на которых мы фокусируемся: Пространство личного интеллекта | Стратегические команды | Группы исследований и разработок | Центры общей памяти организаций.',
      'Каждое рабочее пространство со временем развивает и углубляет свою уникальную семантическую память.'
    ],
    'ai-as-interface': [
      'ИИ — это не сам продукт. Это лишь интерфейс.',
      'Модели рассуждения будут меняться. Память Saule останется навсегда.'
    ],
    'absolute-privacy': [
      'Ваша память ценна только тогда, когда она принадлежит исключительно вам.',
      'Saule — это расширение человеческого разума и корпоративного интеллекта. Поэтому ваша внешняя память никогда не станет обучающими данными для какой-либо модели.',
      'Saule работает по принципам «Нулевого разглашения». Система, которая считывает, обрабатывает и объединяет контекст, не сохраняет эту информацию для собственной выгоды. Люди и организации являются абсолютными суверенами своей памяти.'
    ],
    'new-digital-organ': [
      'Человеческая цивилизация изобрела: Письменность, Библиотеки, Поисковые системы, Облачные хранилища, Искусственный интеллект.',
      'Следующий слой: Постоянная семантическая память.',
      'Не для замены человеческого разума. А для его расширения.'
    ],
    vision: [
      'Мы верим, что:',
      'Каждый человек заслуживает пожизненную память.',
      'Каждая творческая команда заслуживает общего разума, сохраняющего контекст.',
      'Каждая компания заслуживает нестираемую корпоративную память.',
      'Память должна принадлежать тем, кто ее создает. А не платформам, которыми они случайно пользуются.'
    ],
    'closing-manifesto': [
      'ИИ помогает нам думать.',
      'Семантическая память позволяет нам помнить.',
      'Прогресс человечества требует и того, и другого.',
      'Saule создает слой памяти человечества.'
    ]
  },
  'zh-CN': {
    summary: ['人工智能正在成为一种商品 (commodity)。','推理模型月复一月地改进，价格不断下降，切换服务商变得比以往任何时候都更容易。','然而，某种更有价值的东西正在流失。','不是智能。而是记忆。','人类的知识、组织背景、关系、决策和经验碎片化地散落在数十个数字办公工具中。每个平台都在存储信息，但没有一个能够随时间保留其语义。','Saule 提供了一种全新的软件类别：语义记忆层 (SML - Semantic Memory Layer)。','Saule 不去构建新的 AI 模型，而是构建一个独立的记忆层。无论底层是由什么 AI 模型驱动，它都能在个人、团队和社区之间保留语义上下文。','智能会变。记忆永恒。'],
    'memory-crisis': ['现代人的问题不是缺乏信息。而是记忆的碎片化危机。','我们的知识积累寄生在这些工具中：','电子邮件 | Slack | WhatsApp | Google 云端硬盘 | Notion | 日历 | CRM系统 | 人工智能聊天机器人','每个平台都只记得故事的一小部分。没有一个知道完整的故事。','信息依然存在。上下文却已丢失。'],
    'ai-illusion': ['目前的人工智能系统因能记住对话而显得智能。然而，这种记忆：仅限于特定平台，绑定在特定模型中，是暂时的，依赖于特定厂商 (vendor)。','你积累的上下文属于 AI 厂商，而不是你。当你从一个模型切换到另一个模型时，数月或数年的上下文理解瞬间化为乌有。','世界相信它正在构建智能。实际上，它只是在不断地从头重建记忆。'],
    'intelligence-commodity': ['推理模型 (LLM) 很快将无处不在。用户将像选择浏览器一样在模型之间进行切换。OpenAI. Anthropic. Google. 未来的全新模型。一切都将是可互换的 (interchangeable)。','未来真正的竞争优势不是智能。而是记忆。'],
    'semantic-memory-layer': ['Saule 不与 AI 模型竞争。Saule 与它们融合共生。','应用程序 → 推理模型 (LLM) → Saule 语义记忆层 (SML) [ 知识图谱 | 向量记忆 | 身份图谱 | 时间线 | 工作区记忆 ] → 人类数字生活','LLM 负责思考。Saule 负责记忆。'],
    'living-memory': ['传统软件存储信息。Saule 存储体验。','它理解：为什么会做出这个决定？谁影响了它？当时有哪些替代方案？当时有哪些条件适用？信息随时间是如何演变的？','记忆变得生动。'],
    'personal-memory': ['人不应该消耗精力去记住所有事情。想法、目标、笔记、项目、关系、习惯。','Saule 将它们连接在持续生长的语义网络中。','用户不再需要搜索。用户直接记起。'],
    'collective-memory': ['群体比个人忘得更快。战略团队。研发小组。初创企业 (Startups)。机构。','每天都有新的知识产生，但几乎全部流失。','Saule 创造了永久的集体记忆。不是聊天记录。不是文档堆积。而是共享的共同理解。'],
    'beyond-communication': ['即时通讯应用帮助人们沟通。项目管理工具组织工作。知识库整理文档。','Saule 组织记忆本身。'],
    'workspace-model': ['每个工作区都代表着一段生长的记忆。','我们关注的核心结构：个人智能空间 | 战略团队 | 研究与开发小组 | 企业共享记忆中心。','随着时间的推移，每个工作区都会发展并深化其独特的语义记忆。'],
    'ai-as-interface': ['AI 本身不是产品。它只是一个接口。','推理引擎（模型）会变。Saule 的记忆永存。'],
    'absolute-privacy': ['只有当记忆完全属于你时，它才有价值。','Saule 是人类心智与组织智慧的延伸。因此，你的外部记忆绝不会成为任何模型的训练数据 (training data)。','Saule 遵循"零知识"原则。读取、处理和整合上下文的系统不会为了自身利益而保留这些信息。个人和机构是自身记忆的绝对主权者。'],
    'new-digital-organ': ['人类文明发明了：文字，图书馆，搜索引擎，云存储，人工智能。','下一层是：永久的语义记忆。','不是为了取代人类智能。而是为了延伸它。'],
    vision: ['我们相信：','每个人都值得拥有终生难忘的记忆。','每个创意团队都值得拥有一个保留其上下文的共享智慧。','每个企业都值得拥有不可磨灭的组织记忆。','记忆必须属于创造它的人。而不是属于他们偶然使用的平台。'],
    'closing-manifesto': ['AI 辅助我们思考。','语义记忆让我们能够记住。','人类的进步两者缺一不可。','Saule 正在构建人类的记忆层。']
  },
  ja: {
    summary: ['人工知能（AI）はコモディティ（商品）になりつつあります。','推論モデルは月を追うごとに進化し、価格は下がり、プロバイダー間の移行はかつてないほど容易になっています。','しかし、それよりもはるかに価値のある何かが失われつつあります。','知性ではありません。記憶です。','人間の知識、組織の文脈、関係性、意思決定、そして経験は、数多くのデジタルツールの間で断片化されています。どのプラットフォームも情報を保存しますが、時間の経過とともにその意味を保持するものはありません。','Sauleは、新しいソフトウェアのカテゴリーを提案します：セマンティックメモリレイヤー（SML - Semantic Memory Layer）。','Sauleは、新しいAIモデルを構築するのではなく、どのAIモデルから力を得ようとも、個人、チーム、コミュニティを通じてセマンティックな文脈を維持する、独立した記憶レイヤーを構築します。','知性は変わり得る。記憶は変わらない。'],
    'memory-crisis': ['現代人の問題は、情報の不足ではありません。断片化された記憶の危機です。','私たちの知識は、以下のようなツールの中に存在しています：','メール | Slack | WhatsApp | Google ドライブ | Notion | カレンダー | CRM | AIチャットボット','それぞれのプラットフォームは、ストーリーの小さな断片しか覚えていません。全体を知るものは一つもありません。','情報は存在し続けますが、文脈は失われます。'],
    'ai-illusion': ['現在のAIシステムは、会話を記憶しているため、賢く見えます。しかし、この記憶は：プラットフォーム固有である、モデルにロックされている、一時的である、ベンダー（提供元）に依存している。','蓄積された文脈は、あなたのものではなく、AIプロバイダーのものです。あるモデルから別のモデルへと移行すると、何ヶ月、何年にもわたる文脈の理解が一瞬にして消え去ります。','世界は知性を構築していると信じています。しかし実際には、絶えず記憶をゼロから作り直しているのです。'],
    'intelligence-commodity': ['推論モデル（LLM）は、間もなくどこにでも存在するようになります。ユーザーはブラウザを選ぶように、モデルを切り替えるようになるでしょう。OpenAI。Anthropic。Google。そして、未来の新しいモデルたち。すべてが互換性のある（interchangeable）存在になります。','未来における真の競争優位性は、知性ではありません。記憶です。'],
    'semantic-memory-layer': ['SauleはAIモデルと競合しません。Sauleはそれらに統合される形で存在します。','アプリケーション → 推論モデル (LLM) → Saule セマンティックメモリレイヤー (SML) [ 知識グラフ | ベクトルメモリ | アイデンティティグラフ | タイムライン | ワークスペースメモリ ] → 人間のデジタルライフ','LLMが考える。Sauleが覚えている。'],
    'living-memory': ['従来のソフトウェアは情報を保存します。Sauleは経験を保存します。','以下を理解します：なぜその決定が下されたのか？誰がそれに影響を与えたのか？どのような選択肢があったのか？どのような条件が有効だったのか？情報は時間とともにどのように進化してきたのか？','記憶が蘇ります。'],
    'personal-memory': ['人間は、すべてを記憶するために精神的エネルギーを消耗すべきではありません。アイデア。目標。メモ。プロジェクト。人間関係。習慣。','Sauleは、これらを絶えず「生きているセマンティックネットワーク」の中で結びつけます。','ユーザーはもう検索しません。ユーザーは思い出します。'],
    'collective-memory': ['グループは個人よりもさらに早く忘れます。戦略的チーム。研究開発グループ。スタートアップ。組織。','毎日新しい知識が生み出され、そのほぼすべてが失われています。','Sauleは永続的な共同体の記憶を作ります。チャット履歴ではありません。ドキュメントの山でもありません。共有された共通の理解です。'],
    'beyond-communication': ['メッセージングアプリは人々のコミュニケーションを助けます。プロジェクト管理ツールは仕事を整理します。ナレッジベースはドキュメントを整理します。','Sauleは記憶そのものを整理します。'],
    'workspace-model': ['各ワークスペースは、生きている記憶を代表しています。','私たちが焦点を当てるコア構造：個人の知性領域 | 戦略チーム | 研究開発グループ | 企業の共有記憶センター。','各ワークスペースは、時間とともに独自のセマンティックメモリを発展させ、深めていきます。'],
    'ai-as-interface': ['AIは製品そのものではありません。ただのインターフェースです。','推論エンジン（モデル）は変わります。Sauleの記憶は永続的です。'],
    'absolute-privacy': ['あなたの記憶は、あなただけのものだからこそ価値があります。','Sauleは人間の精神と組織の知性の拡張です。したがって、あなたの外部記憶がモデルの学習データ（training data）になることは決してありません。','Sauleは「ゼロ知識」の原則に基づいて動作します。文脈を読み、処理し、統合するシステムは、その情報を自らの利益のために保管することはありません。個人や組織は、自らの記憶の絶対的な主権者です。'],
    'new-digital-organ': ['人類は以下を発明してきました：文字、図書館、検索エンジン、クラウドストレージ、人工知能。','次のレイヤー：永続的なセマンティックメモリ。','人間の知性に取って代わるためではありません。それを拡張するためです。'],
    vision: ['私たちは信じています：','すべての個人が生涯にわたる記憶を持つ権利があること。','すべてのクリエイティブなチームが、文脈を維持する共有の知性を持つ権利があること。','すべての企業が、消えない組織の記憶を持つ権利があること。','記憶は、それを創り出す人々に帰属すべきであること。彼らがたまたま使っているプラットフォームではなく。'],
    'closing-manifesto': ['AIは私たちが考えるのを助けます。','セマンティックメモリは私たちが思い出すのを可能にします。','人類の進歩には両方が必要です。','Sauleは人類の記憶レイヤーを構築しています。']
  },
  ko: {
    summary: ['인공지능(AI)은 상품(commodity)화되고 있습니다.','추론 모델은 매달 발전하고, 가격은 하락하며, 제공업체 간 전환은 그 어느 때보다 쉬워지고 있습니다.','하지만 훨씬 더 가치 있는 무언가가 사라지고 있습니다.','지능이 아닙니다. 기억입니다.','인간의 지식, 조직의 맥락, 관계, 결정, 경험은 수십 개의 디지털 도구 사이에 파편화되어 있습니다. 모든 플랫폼이 정보를 저장하지만, 시간이 지나도 의미를 보존하는 플랫폼은 없습니다.','Saule은 새로운 소프트웨어 카테고리를 제시합니다: 의미론적 메모리 레이어(SML - Semantic Memory Layer).','Saule은 새로운 AI 모델을 구축하는 대신, 어떤 AI 모델을 사용하더라도 개인, 팀, 커뮤니티 전반에 걸쳐 의미론적 맥락을 보존하는 독립적인 메모리 레이어를 구축합니다.','지능은 변할 수 있습니다. 기억은 그렇지 않습니다.'],
    'memory-crisis': ['현대인의 문제는 정보의 부족이 아닙니다. 파편화된 기억의 위기입니다.','우리의 지식은 다음과 같은 도구 안에 살고 있습니다:','이메일 | Slack | WhatsApp | Google 드라이브 | Notion | 캘린더 | CRM | AI 챗봇','각 플랫폼은 이야기의 아주 작은 부분만 기억합니다. 그 누구도 이야기 전체를 알지 못합니다.','정보는 존속합니다. 맥락은 사라집니다.'],
    'ai-illusion': ['현재의 AI 시스템은 대화를 기억하기 때문에 똑똑해 보입니다. 하지만 이 기억은: 플랫폼에 종속적이며, 모델에 갇혀 있고, 일시적이며, 제공업체(vendor)에 의존합니다.','축적된 맥락은 당신이 아닌 AI 제공업체의 소유입니다. 하나의 모델에서 다른 모델로 전환하는 순간, 수개월 또는 수년에 걸친 맥락적 이해가 순식간에 사라집니다.','세상은 지능을 구축하고 있다고 믿습니다. 실제로는 끊임없이 기억을 처음부터 다시 만들고 있을 뿐입니다.'],
    'intelligence-commodity': ['추론 모델(LLM)은 곧 어디에나 존재하게 될 것입니다. 사용자들은 마치 브라우저를 선택하듯이 모델 간에 전환하게 될 것입니다. OpenAI. Anthropic. Google. 미래의 완전히 새로운 모델들. 모두 상호 대체(interchangeable) 가능해질 것입니다.','미래의 진정한 경쟁 우위는 지능이 아닐 것입니다. 기억일 것입니다.'],
    'semantic-memory-layer': ['Saule은 AI 모델과 경쟁하지 않습니다. Saule은 모델들과 통합되어 존재합니다.','애플리케이션 → 추론 모델 (LLM) → Saule 의미론적 메모리 레이어 (SML) [ 지식 그래프 | 벡터 메모리 | ID 그래프 | 타임라인 | 워크스페이스 메모리 ] → 인간의 디지털 삶','LLM은 생각합니다. Saule은 기억합니다.'],
    'living-memory': ['기존의 소프트웨어는 정보를 저장합니다. Saule은 경험을 저장합니다.','시스템은 다음을 이해합니다: 결정이 왜 내려졌는가? 누가 그것에 영향을 미쳤는가? 어떤 대안이 있었는가? 어떤 조건이 유효했는가? 정보가 시간에 따라 어떻게 진화했는가?','기억이 살아납니다.'],
    'personal-memory': ['인간은 모든 것을 기억하기 위해 정신적 에너지를 소모해서는 안 됩니다. 아이디어. 목표. 메모. 프로젝트. 관계. 습관.','Saule은 이것들을 살아 있는 의미론적 네트워크 속에서 지속적으로 연결합니다.','사용자는 더 이상 검색하지 않습니다. 사용자는 기억해 냅니다.'],
    'collective-memory': ['그룹은 개인보다 훨씬 더 빨리 잊어버립니다. 전략 팀. 연구 개발 그룹. 스타트업. 조직.','매일 새로운 지식이 생산되지만 거의 모두 사라집니다.','Saule은 영구적인 집단 기억을 창조합니다. 대화 기록이 아닙니다. 문서 더미가 아닙니다. 공유된 공통의 이해입니다.'],
    'beyond-communication': ['메시징 앱은 사람들이 소통하도록 돕습니다. 프로젝트 관리 도구는 일을 조직합니다. 지식 베이스는 문서를 정리합니다.','Saule은 기억 자체를 조직합니다.'],
    'workspace-model': ['각 워크스페이스는 살아 있는 기억을 나타냅니다.','우리가 집중하는 핵심 구조: 개인 지능 영역 | 전략 팀 | 연구 개발 그룹 | 기업 공유 기억 센터.','각 워크스페이스는 시간이 지남에 따라 자신만의 고유한 의미론적 메모리를 개발하고 깊게 만듭니다.'],
    'ai-as-interface': ['AI는 제품 자체가 아닙니다. 단지 인터페이스일 뿐입니다.','추론 엔진(모델)은 바뀔 것입니다. Saule의 기억은 영구적입니다.'],
    'absolute-privacy': ['당신의 기억은 오직 당신의 것일 때만 가치가 있습니다.','Saule은 인간의 마음과 조직 지성의 확장입니다. 따라서 당신의 외부 기억은 결코 모델의 학습 데이터(training data)로 변하지 않습니다.','Saule은 \'제로 지식\' 원칙에 따라 작동합니다. 맥락을 읽고, 처리하고, 결합하는 시스템은 이 정보를 자신의 이익을 위해 보관하지 않습니다. 개인과 조직은 자신만의 기억에 대한 절대적인 주권자입니다.'],
    'new-digital-organ': ['인류 문명은 다음을 발명했습니다: 글쓰기, 도서관, 검색 엔진, 클라우드 스토리지, 인공지능.','다음 레이어: 영구적인 의미론적 메모리.','인간의 지능을 대체하기 위한 것이 아닙니다. 지능을 확장하기 위한 것입니다.'],
    vision: ['우리는 믿습니다:','모든 개인은 평생 지속되는 기억을 가질 자격이 있습니다.','모든 창의적인 팀은 맥락을 보존하는 공유된 지성을 가질 자격이 있습니다.','모든 기업은 지워지지 않는 조직의 기억을 가질 자격이 있습니다.','기억은 그것을 창조한 사람들의 것이어야 합니다. 어쩌다 사용하게 된 플랫폼의 것이 아닙니다.'],
    'closing-manifesto': ['AI는 우리가 생각하는 것을 돕습니다.','의미론적 메모리는 우리가 기억할 수 있게 합니다.','인류의 진보는 이 두 가지를 모두 필요로 합니다.','Saule은 인류의 메모리 레이어를 구축하고 있습니다.']
  }
};

['es', 'ru', 'zh-CN', 'ja', 'ko'].forEach((loc) => {
  const filePath = path.join(contentDir, `${loc}.json`);
  const dict = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const paragraphs = allParagraphs[loc];

  Object.keys(dict.chapters).forEach((key) => {
    if (paragraphs[key]) {
      dict.chapters[key].draft.sections[0].paragraphs = paragraphs[key];
    }
  });

  fs.writeFileSync(filePath, JSON.stringify(dict, null, 2), 'utf8');
  console.log(`Fixed paragraphs: ${filePath}`);
});
console.log('Done!');
