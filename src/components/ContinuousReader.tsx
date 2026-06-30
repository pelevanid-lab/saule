'use client';

import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getTranslationMember, getTranslationObject, getTranslationValue } from '@/lib/translation';
import type { Volume, ChapterMetadata, AppendixMetadata } from '@/lib/book';

interface OpenQuestion {
  id: string;
  question: string;
  status: 'open' | 'in_research' | 'answered' | 'deprecated';
  answerSummary?: string;
  answeredInChapters?: string[];
  relatedChapters?: string[];
  decisionArea?: string;
  designDecisionId?: string;
  notes?: string;
}

interface DraftContent {
  sections: {
    heading: string;
    paragraphs: string[];
  }[];
  open_questions: (string | OpenQuestion)[];
  design_decisions: string[];
  future_evolution: string;
  references: string[];
}

interface ReadingItem {
  type: 'chapter' | 'appendix' | 'volume';
  slug: string;
  metadata: ChapterMetadata | AppendixMetadata | Volume;
  startPage: number;
  endPage: number;
}

interface ContinuousReaderProps {
  locale: string;
  initialSlug: string;
  initialType: 'chapter' | 'appendix' | 'volume';
  dictionary: any;
  volumes: Volume[];
}

const getBookmarkTranslations = (locale: string) => {
  switch (locale) {
    case 'tr':
      return { add: 'Yer İmi Ekle', saved: 'Kaydedildi', page: 's.', jump: 'Yer İmine Git', top: 'Yukarı' };
    case 'es':
      return { add: 'Marcador', saved: 'Guardado', page: 'pág.', jump: 'Ir al Marcador', top: 'Subir' };
    case 'ru':
      return { add: 'Закладка', saved: 'Сохранено', page: 'стр.', jump: 'К Закладке', top: 'Вверх' };
    case 'zh-CN':
      return { add: '添加书签', saved: '已添加书签', page: '页', jump: '前往书签', top: '顶部' };
    case 'ja':
      return { add: 'しおり', saved: '保存済み', page: '頁', jump: 'しおりへ', top: '上へ' };
    case 'ko':
      return { add: '책갈피', saved: '저장됨', page: '쪽', jump: '책갈피로', top: '맨 위' };
    case 'en':
    default:
      return { add: 'Bookmark', saved: 'Bookmarked', page: 'p.', jump: 'Go to Bookmark', top: 'Top' };
  }
};

const getDynamicAppendixTitles = (locale: string): Record<string, string> => {
  switch (locale) {
    case 'tr':
      return {
        'open-questions': 'Açık Sorular',
        'design-decisions': 'Tasarım Kararları',
        'references': 'Kaynaklar',
      };
    case 'es':
      return {
        'open-questions': 'Preguntas Abiertas',
        'design-decisions': 'Decisiones de Diseño',
        'references': 'Referencias',
      };
    case 'ru':
      return {
        'open-questions': 'Открытые вопросы',
        'design-decisions': 'Дизайнерские решения',
        'references': 'Источники',
      };
    case 'zh-CN':
      return { 'open-questions': '开放问题', 'design-decisions': '设计决策', 'references': '参考文献' };
    case 'ja':
      return { 'open-questions': '未解決の問い', 'design-decisions': '設計上の判断', 'references': '参考文献' };
    case 'ko':
      return { 'open-questions': '열린 질문', 'design-decisions': '설계 결정', 'references': '참고문헌' };
    case 'en':
    default:
      return {
        'open-questions': 'Open Questions',
        'design-decisions': 'Design Decisions',
        'references': 'References',
      };
  }
};

const getBookBeginningContent = (locale: string, dictionary?: ContinuousReaderProps['dictionary']) => {
  if (dictionary?.book_beginning?.preface && dictionary?.book_beginning?.howToRead) {
    return dictionary.book_beginning;
  }

  switch (locale) {
    case 'tr':
      return {
        preface: {
          title: "Önsöz",
          p1: "",
          paragraphs: [
            { type: 'text', content: "Bu kitap, insanın modern dünyada neden bu kadar dağıldığını, neden bu kadar yorulduğunu, neden bildiği halde başlayamadığını, neden hatırlamak zorunda kaldığını, neden karar vermekte zorlandığını ve neden kendi hayatıyla bağını zaman zaman kaybettiğini anlamak için yazılmıştır." },
            { type: 'text', content: "Saule, bu soruların içinden doğar." },
            { type: 'text', content: "Bu nedenle Saule Yaşayan Kitabı, önce insanı anlamaya çalışır. Zihinsel dağınıklığı yalnızca düzensizlik olarak görmez. Karar yorgunluğunu yalnızca irade eksikliği saymaz. Unutulan niyetleri, yarım kalan planları, ertelenen konuşmaları, taşınan duygusal yükleri ve dağılan dikkati modern insanın ortak hâlleri olarak ele alır." },
            { type: 'text', content: "Ama bu mesele yalnızca bireyin iç dünyasına ait değildir. Aynı dağınıklık ekiplerde unutulan kararlara, şirketlerde kaybolan müşteri bağlamına, yaratıcı süreçlerde ise yarım kalmış fikirlerin ve taslakların sessiz yüküne dönüşebilir. Saule bu yüzden yalnızca kişisel hayatı düzenlemek için değil; yaşamı, işi ve üretimi taşıyan dağınıklığı anlamak için doğar." },
            { type: 'text', content: "Bu kitap kesin cevaplar vermek için değil, doğru soruları canlı tutmak için vardır." },
            { type: 'list', items: [
              "Saule insanı nasıl anlayacak?",
              "Bellek neyi hatırlayacak, neyi unutacak?",
              "Dikkat ne zaman korunacak, ne zaman yönlendirilecek?",
              "Bir öneri ne zaman yardım, ne zaman baskı olur?",
              "Bir sistem ne zaman konuşmalı, ne zaman susmalı?",
              "İnsan hangi anda teknolojiye değil, başka bir insana ihtiyaç duyar?",
              "Bir şirket hangi müşteri temasını yalnızca kayıt olarak değil, öğrenme fırsatı olarak görmelidir?",
              "Bir ekipte unutulan kararlar, açık döngüler ve tekrar eden problemler nasıl kurumsal hafızaya dönüşmelidir?",
              "Yaratıcı bir fikir ne zaman korunmalı, ne zaman geliştirilmeli, ne zaman bırakılmalıdır?"
            ] },
            { type: 'text', content: "Bu sorular yalnızca bir uygulamanın nasıl çalışacağıyla ilgili değildir. Aynı zamanda insanın kendi hayatını nasıl taşıdığı, ekiplerin neyi gözden kaçırdığı, şirketlerin neyi öğrenemeden kaybettiği ve yaratıcı süreçlerin hangi belirsizliklerle yarım kaldığıyla ilgilidir." },
            { type: 'text', content: "Saule, bu kitabın dışında gelişmeyecektir. Her yapay zekâ davranışı, her bellek kararı, her hatırlatma mantığı, her unutma politikası, her topluluk ilkesi, her arayüz tercihi ve her mühendislik kararı, üründe yer almadan önce bu kitapta anlamını bulmalıdır." },
            { type: 'bold-lead', lead: "Bu yüzden Saule Yaşayan Kitabı, Saule için bağlayıcı doğruluk kaynağıdır. ", text: "Ürünler ise bu kitabın hayata geçmiş, denenmiş ve sürekli öğrenen kanıtlarıdır." },
            { type: 'text', content: "Kitap değiştikçe Saule derinleşir. Saule geliştikçe kitap sınanır. Bu ilişki tek yönlü değildir. Kitap yön verir, ürün gerçeklikte test eder, topluluk ise bu öğrenmenin parçası olur." },
            { type: 'text', content: "Bu kitabı okuyan kişi yalnızca bir ürün fikrini takip etmez. Kendi ihtiyaçlarını, yüklerini ve gündelik hayatın içinde görünmez hâle gelen insan hâllerini; bunların işte ve yaratıcı üretimde nasıl yeniden ortaya çıktığını düşünmek için yeni bir alana girer." },
            { type: 'text', content: "Saule bu yüzden yalnızca bir uygulama olarak kalmayacak; kitabı, ürünleri ve topluluğuyla birlikte öğrenen, gelişen ve büyüyen yaşayan bir öğrenme sistemine dönüşecektir." }
          ]
        },
        howToRead: {
          title: "Nasıl Okunmalı?",
          paragraphs: [
            "Bu kitap doğrusal biçimde okunabilir; ancak yalnızca baştan sona ilerleyen kapalı bir metin olarak düşünülmemelidir. Saule Yaşayan Kitabı, aynı zamanda yaşayan bir araştırma haritasıdır.",
            "Bölümler, Saule’nin insanı anlamaya çalıştığı temel katmanları açar: zihinsel yük, dikkat, bellek, duygu, motivasyon, ilişkiler, karar verme, güven, etik ve yapay zekâ davranışı. Her bölüm, hem bir insan sorununu anlamaya hem de Saule’nin bu sorun karşısında nasıl davranması gerektiğini temellendirmeye çalışır.",
            "Bu kitap üç katmanda okunabilir: bireysel yaşam katmanı olarak zihinsel yük, dikkat, bellek, duygu ve ilişkiler üzerinden; iş ve organizasyon katmanı olarak müşteri ilişkileri, operasyonel hafıza, açık kararlar, takip sorumlulukları ve kurumsal öğrenme üzerinden; yaratıcılık katmanı olarak fikirlerin, projelerin, kampanyaların, karakterlerin, taslakların ve üretim süreçlerinin nasıl taşındığı üzerinden.",
            "Ekler ise kitabın açık kalan alanlarını toplar. Açık sorular, tasarım kararları, kaynaklar, ileride cevaplanacak teknik ve etik meseleler burada görünür hâle gelir. Bu nedenle ekler kitabın dışında kalan notlar değil, yaşayan yapının devamıdır.",
            "Okuyucu bu kitabı ister baştan sona okuyabilir, ister ihtiyaç duyduğu konuya göre belirli bölümlere dönebilir. Bazı bölümler bir kavramı anlamak için, bazıları bir tasarım kararını değerlendirmek için, bazıları ise Saule’nin hangi sınırlarda gelişeceğini görmek için okunabilir.",
            "Bu nedenle Saule Yaşayan Kitabı yalnızca kişisel bir rehber değildir; Saule’nin yaşam, iş ve yaratıcılık alanlarına temas eden felsefi işletim sistemidir.",
            "Bu kitap tamamlanmış bir sonuçtan çok, sürekli sınanan bir düşünme alanıdır. Bu yüzden okuma biçimi de tek değildir: anlamak, sorgulamak, geri dönmek, düzeltmek ve yeniden düşünmek bu kitabın doğal parçasıdır."
          ]
        }
      };
    case 'es':
      return {
        preface: {
          title: "Prefacio",
          p1: "",
          paragraphs: [
            { type: 'text', content: "Este libro está escrito para comprender por qué los seres humanos están tan dispersos en el mundo moderno, por qué están tan cansados, por qué no pueden empezar a pesar de saber qué hacer, por qué se ven obligados a recordar, por qué les cuesta tomar decisiones y por qué pierden la conexión con sus propias vidas de vez en cuando." },
            { type: 'text', content: "Saule nace de estas preguntas." },
            { type: 'text', content: "Por lo tanto, el Libro Vivo de Saule intenta primero comprender al ser humano. No ve el desorden mental simplemente como desorganización. No considera la fatiga de decisión únicamente como una falta de voluntad. Trata las intenciones olvidadas, los planes a medio terminar, las conversaciones pospuestas, las cargas emocionales acumuladas y la atención fragmentada como estados comunes del ser humano moderno." },
            { type: 'text', content: "Este libro existe no para dar respuestas definitivas, sino para mantener vivas las preguntas correctas." },
            { type: 'list', items: [
              "¿Cómo entenderá Saule al ser humano?",
              "¿Qué recordará la memoria y qué olvidará?",
              "¿Cuándo se protegerá la atención y cuándo se guiará?",
              "¿Cuándo se convierte una sugerencia en ayuda y cuándo en presión?",
              "¿Cuándo debe hablar un sistema y cuándo debe guardar silencio?",
              "¿En qué momento necesita un ser humano a otro ser humano, y no a la tecnología?"
            ] },
            { type: 'text', content: "Estas preguntas no se refieren únicamente al funcionamiento de una aplicación. Se refieren también a cómo una persona sobrelleva su propia vida, qué necesita y qué cargas ya no debería tener que mantener en su mente en solitario." },
            { type: 'text', content: "La aplicación Saule no se desarrollará al margen de este libro. Cada comportamiento de la IA, cada decisión de memoria, cada lógica de recordatorio, cada política de olvido, cada principio de comunidad, cada preferencia de interfaz y cada decisión de ingeniería debe encontrar su significado en este libro antes de implementarse en la aplicación." },
            { type: 'bold-lead', lead: "Por eso el Libro Vivo de Saule es la fuente de verdad vinculante para Saule. ", text: "La aplicación es la prueba realizada, probada y en continuo aprendizaje de este libro." },
            { type: 'text', content: "A medida que el libro cambia, Saule se profundiza. A medida que Saule se desarrolla, el libro se pone a prueba. Esta relación no es unidireccional. El libro guía, la aplicación prueba en la realidad y la comunidad se convierte en parte de este aprendizaje." },
            { type: 'text', content: "La persona que lee este libro no sigue simplemente una idea de producto. Entra en un nuevo espacio para reflexionar sobre sus propias necesidades, cargas y estados humanos que se vuelven invisibles en la vida cotidiana." },
            { type: 'text', content: "Por lo tanto, Saule no seguirá siendo solo una aplicación; se transformará en un movimiento que aprende, se desarrolla y crece junto con su libro, su aplicación y su comunidad." }
          ]
        },
        howToRead: {
          title: "¿Cómo debe leerse?",
          paragraphs: [
            "Este libro se puede leer de forma lineal; sin embargo, no debe considerarse simplemente como un texto cerrado que progresa de principio a fin. El Libro Vivo de Saule es también un mapa de investigación vivo.",
            "Los capítulos abren las capas fundamentales a través de las cuales Saule intenta comprender al ser humano: carga mental, atención, memoria, emoción, motivación, relaciones, toma de decisiones, confianza, ética y comportamiento de la IA. Cada capítulo busca tanto comprender un problema humano como fundamentar cómo debe comportarse Saule frente a dicho problema.",
            "Los anexos, por otro lado, recopilan las áreas abiertas del libro. Preguntas abiertas, decisiones de diseño, recursos y cuestiones técnicas y éticas que se responderán en el futuro se vuelven visibles aquí. Por lo tanto, los anexos no son notas que quedan fuera del libro, sino una continuación de la estructura viva.",
            "El lector puede leer este libro de principio a fin, o volver a capítulos específicos según el tema que necesite. Algunos capítulos se pueden leer para comprender un concepto, otros para evaluar una decisión de diseño y algunos para ver bajo qué límites se desarrollará Saule.",
            "Más que un resultado final, este libro es un espacio de pensamiento que se pone a prueba continuamente. Por eso no existe una única forma de lectura: comprender, cuestionar, volver, corregir y repensar son partes naturales de este libro."
          ]
        }
      };
    case 'ru':
      return {
        preface: {
          title: "Предисловие",
          p1: "",
          paragraphs: [
            { type: 'text', content: "Эта книга написана для того, чтобы понять, почему человек так рассеян в современном мире, почему он так устает, почему не может начать действовать, даже зная, что делать, почему он вынужден все помнить, почему ему трудно принимать решения и почему он время от времени теряет связь с собственной жизнью." },
            { type: 'text', content: "Saule рождается из этих вопросов." },
            { type: 'text', content: "Поэтому Живая книга Saule в первую очередь стремится понять человека. Она не рассматривает ментальный хаос просто как неорганизованность. Она не считает усталость от принятия решений исключительно отсутствием силы воли. Она относится к забытым намерениям, незавершенным планам, отложенным разговорам, переносимым эмоциональным нагрузкам и фрагментированному вниманию как к общим состояниям современного человека." },
            { type: 'text', content: "Эта книга существует не для того, чтобы давать окончательные ответы, а для того, чтобы поддерживать жизнь правильных вопросов." },
            { type: 'list', items: [
              "Как Saule будет понимать человека?",
              "Что память будет помнить, а что — забывать?",
              "Когда внимание будет защищено, а когда — направлено?",
              "Когда предложение становится помощью, а когда — давлением?",
              "Когда система должна говорить, а когда — молчать?",
              "В какой момент человеку нужна не технология, а другой человек?"
            ] },
            { type: 'text', content: "Эти вопросы касаются не только работы приложения. Они также касаются того, как человек несет свою собственную жизнь, в чем он нуждается и какие бремена ему больше не придется нести в одиночку в своем разуме." },
            { type: 'text', content: "Приложение Saule не будет развиваться отдельно от этой книги. Каждое поведение ИИ, каждое решение памяти, каждая логика напоминаний, каждая политика забывания, каждый принцип сообщества, каждый предпочтение интерфейса и каждое инженерное решение должны найти свой смысл в этой книге, прежде чем быть реализованными в приложении." },
            { type: 'bold-lead', lead: "Вот почему Живая книга Saule является обязательным источником истины для Saule. ", text: "Приложение же — это воплощенное на практике, проверенное временем и постоянно обучающееся доказательство этой книги." },
            { type: 'text', content: "По мере изменения книги Saule углубляется. По мере развития Saule книга проверяется. Эти отношения не односторонние. Книга направляет, приложение проверяет в реальности, а сообщество становится частью этого обучения." },
            { type: 'text', content: "Человек, читающий эту книгу, не просто следит за идеей продукта. Он входит в новое пространство, чтобы задуматься о своих собственных потребностях, нагрузках и человеческих состояниях, которые становятся невидимыми в повседневной жизни." },
            { type: 'text', content: "Поэтому Saule не останется просто приложением; оно превратится в движение, которое учится, развивается и растет вместе со своей книгой, приложением и сообществом." }
          ]
        },
        howToRead: {
          title: "Как её читать?",
          paragraphs: [
            "Эту книгу можно читать последовательно, однако её не следует рассматривать просто как закрытый текст, развивающийся от начала к концу. Живая книга Saule — это также и живая карта исследований.",
            "Главы раскрывают основные уровни, на которых Saule пытается понять человека: ментальная нагрузка, внимание, память, эмоции, мотивация, отношения, принятие решений, доверие, этика и поведение ИИ. Каждая глава призвана как понять человеческую проблему, так и обосновать, как Saule должна вести себя перед лицом этой проблемы.",
            "Приложения, с другой стороны, собирают открытые области книги. Здесь становятся видимыми открытые вопросы, дизайнерские решения, источники, а также технические и этические вопросы, на которые предстоит ответить в будущем. Поэтому приложения — это не заметки, оставленные за пределами книги, а продолжение живой структуры.",
            "Читатель может читать эту книгу от начала до конца или возвращаться к конкретным главам в зависимости от необходимой темы. Некоторые главы можно читать, чтобы понять концепцию, некоторые — чтобы оценить дизайнерское решение, а некоторые — чтобы увидеть, в каких границах будет развиваться Saule.",
            "Эта книга — скорее постоянно проверяемое пространство мысли, чем завершенный результат. Вот почему не существует единственного способа чтения: понимание, сомнение, возвращение, исправление и переосмысление являются естественными частями этой книги."
          ]
        }
      };
    case 'en':
    default:
      return {
        preface: {
          title: "Preface",
          p1: "",
          paragraphs: [
            { type: 'text', content: "This book is written to understand why human beings are so scattered in the modern world, why they are so tired, why they cannot start despite knowing what to do, why they are forced to remember, why they struggle to make decisions, and why they lose connection with their own lives from time to time." },
            { type: 'text', content: "Saule is born out of these questions." },
            { type: 'text', content: "Therefore, the Saule Living Book first tries to understand the human. It does not view mental clutter merely as disorganization. It does not count decision fatigue solely as a lack of willpower. It treats forgotten intentions, half-finished plans, postponed conversations, carried emotional burdens, and fragmented attention as common states of the modern human." },
            { type: 'text', content: "This book exists not to give definitive answers, but to keep the right questions alive." },
            { type: 'list', items: [
              "How will Saule understand the human?",
              "What will memory remember, and what will it forget?",
              "When will attention be protected, and when will it be guided?",
              "When does a suggestion become help, and when does it become pressure?",
              "When should a system speak, and when should it remain silent?",
              "At what moment does a human need another human, not technology?"
            ] },
            { type: 'text', content: "These questions are not only about how an application will work. They are also about how a person carries their own life, what they need, and which burdens they should no longer have to keep in their mind alone." },
            { type: 'text', content: "The Saule application will not develop outside of this book. Every AI behavior, every memory decision, every reminder logic, every forgetting policy, every community principle, every interface preference, and every engineering decision must find its meaning in this book before being implemented in the application." },
            { type: 'bold-lead', lead: "That is why the Saule Living Book is the binding source of truth for Saule. ", text: "The application is the realized, tested, and continuously learning proof of this book." },
            { type: 'text', content: "As the book changes, Saule deepens. As Saule develops, the book is tested. This relationship is not one-way. The book guides, the application tests in reality, and the community becomes a part of this learning." },
            { type: 'text', content: "The person who reads this book does not merely follow a product idea. They enter a new space to contemplate their own needs, burdens, and human states that become invisible in daily life." },
            { type: 'text', content: "Saule will therefore not remain just an application; it will transform into a movement that learns, develops, and grows together with its book, application, and community." }
          ]
        },
        howToRead: {
          title: "How should it be Read?",
          paragraphs: [
            "This book can be read linearly; however, it should not be thought of merely as a closed text that progresses from beginning to end. The Saule Living Book is also a living research map.",
            "The chapters open up the core layers through which Saule attempts to understand the human: mental load, attention, memory, emotion, motivation, relationships, decision-making, trust, ethics, and AI behavior. Each chapter aims both to understand a human problem and to ground how Saule should behave in the face of this problem.",
            "The appendices, on the other hand, gather the open areas of the book. Open questions, design decisions, resources, and technical and ethical issues to be answered in the future become visible here. Therefore, the appendices are not notes left outside the book, but a continuation of the living structure.",
            "The reader can read this book from start to finish, or return to specific chapters depending on the topic they need. Some chapters can be read to understand a concept, some to evaluate a design decision, and some to see within what boundaries Saule will develop.",
            "Rather than a completed result, this book is a continuously tested space of thought. That is why there is no single way of reading: understanding, questioning, returning, correcting, and rethinking are natural parts of this book."
          ]
        }
      };
  }
};

const getDynamicAppendixContent = (
  volumeId: number,
  slug: string,
  volumes: Volume[],
  dictionary: any
) => {
  const volume = volumes.find((v) => v.id === volumeId);
  if (!volume) return null;

  const sections: { heading: string; items?: any[] }[] = [];
  const type = slug.endsWith('-open-questions')
    ? 'open-questions'
    : slug.endsWith('-design-decisions')
    ? 'design-decisions'
    : 'references';

  const processDraft = (headerText: string, draft: any) => {
    if (!draft) return;

    if (type === 'open-questions' && draft.open_questions && draft.open_questions.length > 0) {
      sections.push({
        heading: headerText,
        items: draft.open_questions,
      });
    } else if (type === 'design-decisions' && draft.design_decisions && draft.design_decisions.length > 0) {
      sections.push({
        heading: headerText,
        items: draft.design_decisions,
      });
    } else if (type === 'references' && draft.references && draft.references.length > 0) {
      sections.push({
        heading: headerText,
        items: draft.references,
      });
    }
  };

  // 1. Chapters
  for (const ch of volume.chapters) {
    const chTitle = getTranslationValue(dictionary, ch.purposeKey.replace('.purpose', '.title')) || ch.slug;
    const numStr = ch.chapterNumber.toString().padStart(2, '0');
    const chHeader = `${dictionary.common.chapter || 'Bölüm'} ${numStr}: ${chTitle}`;
    const draft = getTranslationObject(dictionary, `chapters.${ch.slug}.draft`);
    processDraft(chHeader, draft);
  }

  // 2. Static Appendices
  const staticAppendices = (volume.appendices || []).filter(
    (ap) =>
      !ap.slug.endsWith('-open-questions') &&
      !ap.slug.endsWith('-design-decisions') &&
      !ap.slug.endsWith('-references')
  );

  for (const ap of staticAppendices) {
    const apTitle = getTranslationValue(dictionary, `appendices.${ap.slug}.title`) || ap.slug;
    const apHeader = `${dictionary.common.appendix || 'Ek'} ${ap.appendixNumber}: ${apTitle}`;
    const draft = getTranslationObject(dictionary, `appendices.${ap.slug}.draft`);
    processDraft(apHeader, draft);
  }

  return sections;
};

export default function ContinuousReader({
  locale,
  initialSlug,
  initialType,
  dictionary,
  volumes,
}: ContinuousReaderProps) {
  const [activeSlug, setActiveSlug] = useState(initialSlug);
  const [pageNumber, setPageNumber] = useState(1);
  const [bookmark, setBookmark] = useState<{ slug: string; type: 'chapter' | 'appendix' | 'volume' } | null>(null);

  const currentUrlSlugRef = useRef(initialSlug);
  const isInitialScrollDone = useRef(false);
  const t = getBookmarkTranslations(locale);

  // Precompute list of reading items and page boundaries
  const readingItems: ReadingItem[] = [];
  let currentPage = 1;

  // 0. Book Beginning sections
  readingItems.push({
    type: 'chapter',
    slug: 'preface',
    metadata: {
      volumeId: 0,
      chapterNumber: 0,
      slug: 'preface',
      version: '1.0.0',
      readingTime: '1-2 min',
      researchConfidence: 'High',
      lastUpdated: '2026-06-29',
      status: 'Reviewing',
      dependencies: [],
      relatedChapters: [],
      purposeKey: 'common.preface',
      keyQuestionKey: 'common.preface',
    } as any,
    startPage: currentPage,
    endPage: currentPage + 1,
  });
  currentPage += 2;

  readingItems.push({
    type: 'chapter',
    slug: 'how-to-read',
    metadata: {
      volumeId: 0,
      chapterNumber: 0,
      slug: 'how-to-read',
      version: '1.0.0',
      readingTime: '1-2 min',
      researchConfidence: 'High',
      lastUpdated: '2026-06-29',
      status: 'Reviewing',
      dependencies: [],
      relatedChapters: [],
      purposeKey: 'common.how_to_read',
      keyQuestionKey: 'common.how_to_read',
    } as any,
    startPage: currentPage,
    endPage: currentPage + 1,
  });
  currentPage += 2;

  // 1. Volumes loop
  for (const vol of volumes) {
    // Volume Cover Item
    readingItems.push({
      type: 'volume',
      slug: `volume-${vol.id}`,
      metadata: vol,
      startPage: currentPage,
      endPage: currentPage + 1, // 2 pages for volume cover
    });
    currentPage += 2;

    // Chapters
    for (const ch of vol.chapters) {
      const mins = parseInt(ch.readingTime, 10) || 8;
      const pageCount = ch.status === 'Researching' ? 4 : Math.max(4, mins * 2);
      readingItems.push({
        type: 'chapter',
        slug: ch.slug,
        metadata: ch,
        startPage: currentPage,
        endPage: currentPage + pageCount - 1,
      });
      currentPage += pageCount;
    }

    // Appendices
    if (vol.appendices) {
      for (const ap of vol.appendices) {
        const mins = parseInt(ap.readingTime, 10) || 10;
        const pageCount = ap.status === 'Researching' ? 4 : Math.max(4, mins * 2);
        readingItems.push({
          type: 'appendix',
          slug: ap.slug,
          metadata: ap,
          startPage: currentPage,
          endPage: currentPage + pageCount - 1,
        });
        currentPage += pageCount;
      }
    }
  }
  const totalPages = currentPage - 1;

  // Retrieve bookmark from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('saule-bookmark');
      if (saved) {
        setBookmark(JSON.parse(saved));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Perform initial scroll to active element
  useEffect(() => {
    if (!isInitialScrollDone.current) {
      const element = document.getElementById(initialSlug);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'auto', block: 'start' });
          isInitialScrollDone.current = true;
        }, 100);
      }
    }
  }, [initialSlug]);

  // Handle local scroll requests from sidebar quick clicks
  useEffect(() => {
    const handleLocalScrollRequest = (e: Event) => {
      const customEvent = e as CustomEvent<{ slug: string }>;
      const element = document.getElementById(customEvent.detail.slug);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };
    window.addEventListener('saule-scroll-to-section', handleLocalScrollRequest);
    return () => window.removeEventListener('saule-scroll-to-section', handleLocalScrollRequest);
  }, []);

  // Monitor scroll behavior to detect active item and page number
  useEffect(() => {
    const handleScroll = () => {
      let activeItem = readingItems[0];

      for (const item of readingItems) {
        const el = document.getElementById(item.slug);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= window.innerHeight * 0.35) {
            activeItem = item;
          }
        }
      }

      if (activeItem) {
        setActiveSlug(activeItem.slug);

        const activeEl = document.getElementById(activeItem.slug);
        if (activeEl) {
          const rect = activeEl.getBoundingClientRect();
          const height = activeEl.offsetHeight;
          const scrolled = Math.max(0, -rect.top);
          const progress = height > 0 ? scrolled / height : 0;
          const pagesInItem = activeItem.endPage - activeItem.startPage;
          const computedPage = Math.min(
            activeItem.endPage,
            Math.max(activeItem.startPage, Math.round(activeItem.startPage + progress * pagesInItem))
          );
          setPageNumber(computedPage);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [readingItems]);

  // Sync state to URL, page title, and sidebar
  useEffect(() => {
    const activeItem = readingItems.find((item) => item.slug === activeSlug);
    if (activeItem && activeSlug !== currentUrlSlugRef.current) {
      currentUrlSlugRef.current = activeSlug;
      
      const newPath = activeItem.type === 'volume'
        ? `/${locale}/volume/${(activeItem.metadata as Volume).id}`
        : (activeSlug === 'preface' || activeSlug === 'how-to-read')
        ? `/${locale}/book`
        : `/${locale}/${activeItem.type}/${activeSlug}`;
      
      window.history.replaceState(null, '', newPath);

      // Update page title
      let itemTitle = '';
      if (activeItem.type === 'volume') {
        const vol = activeItem.metadata as Volume;
        itemTitle = getTranslationValue(dictionary, vol.titleKey) || '';
      } else if (activeSlug === 'preface') {
        itemTitle = dictionary.common.preface || 'Preface';
      } else if (activeSlug === 'how-to-read') {
        itemTitle = dictionary.common.how_to_read || 'How should it be Read?';
      } else {
        const isDynamic = activeSlug.endsWith('-open-questions') ||
                          activeSlug.endsWith('-design-decisions') ||
                          activeSlug.endsWith('-references');
        
        if (isDynamic) {
          const type = activeSlug.endsWith('-open-questions')
            ? 'open-questions'
            : activeSlug.endsWith('-design-decisions')
            ? 'design-decisions'
            : 'references';
          const titles = getDynamicAppendixTitles(locale);
          itemTitle = `${dictionary.common.appendix || 'Ek'} ${(activeItem.metadata as AppendixMetadata).appendixNumber}: ${titles[type]}`;
        } else {
          itemTitle = getTranslationValue(
            dictionary,
            activeItem.type === 'chapter'
              ? (activeItem.metadata as ChapterMetadata).purposeKey.replace('.purpose', '.title')
              : `appendices.${activeSlug}.title`
          ) || '';
        }
      }

      document.title = `${itemTitle} — ${dictionary.header.logo}`;
      window.dispatchEvent(new CustomEvent('saule-active-section', { detail: activeSlug }));
    }
  }, [activeSlug, locale, dictionary, readingItems]);

  const toggleBookmark = () => {
    const activeItem = readingItems.find((item) => item.slug === activeSlug);
    if (!activeItem) return;

    if (bookmark?.slug === activeSlug) {
      localStorage.removeItem('saule-bookmark');
      setBookmark(null);
    } else {
      const value = { slug: activeSlug, type: activeItem.type };
      localStorage.setItem('saule-bookmark', JSON.stringify(value));
      setBookmark(value);
    }
    window.dispatchEvent(new CustomEvent('saule-bookmark-updated'));
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getStatusColorClass = (status: string) => {
    switch (status) {
      case 'Locked':
        return 'bg-sage/10 text-sage-dark border-sage/20';
      case 'Reviewing':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Drafting':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Deprecated':
        return 'bg-red-50 text-red-800 border-red-200';
      case 'Researching':
      default:
        return 'bg-sand-200 text-charcoal-muted border-sand-300/40';
    }
  };

  const getConfidenceColorClass = (confidence: string) => {
    switch (confidence) {
      case 'High':
        return 'bg-sage/10 text-sage-dark border-sage/20';
      case 'Medium':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Experimental':
      default:
        return 'bg-purple-100 text-purple-800 border-purple-200';
    }
  };

  const getQuestionStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-sand-200/60 text-charcoal border-sand-300/40';
      case 'in_research':
        return 'bg-amber-50 text-amber-800 border-amber-200/50';
      case 'answered':
        return 'bg-sage/10 text-sage-dark border-sage/20';
      case 'deprecated':
        return 'bg-red-50 text-red-800 border-red-200/50';
      default:
        return 'bg-sand-200/60 text-charcoal border-sand-300/40';
    }
  };

  return (
    <div className="relative pb-24 space-y-24 sm:space-y-32">
      {readingItems.map((item, idx) => {
        const isVolume = item.type === 'volume';
        const isChapter = item.type === 'chapter';
        const isAppendix = item.type === 'appendix';
        const isBookStartItem = item.slug === 'preface' || item.slug === 'how-to-read';
        
        const ch = (isChapter && !isBookStartItem) ? (item.metadata as ChapterMetadata) : null;
        const ap = isAppendix ? (item.metadata as AppendixMetadata) : null;
        const vol = isVolume
          ? (item.metadata as Volume)
          : isBookStartItem
          ? null
          : volumes.find((v) => v.id === (item.metadata as ChapterMetadata | AppendixMetadata).volumeId);

        const volTitle = vol ? getTranslationValue(dictionary, vol.titleKey) : '';
        const isDynamicAppendix = isAppendix && (
          item.slug.endsWith('-open-questions') ||
          item.slug.endsWith('-design-decisions') ||
          item.slug.endsWith('-references')
        );

        let itemTitle = '';
        if (isVolume) {
          itemTitle = volTitle || '';
        } else if (isBookStartItem) {
          itemTitle = item.slug === 'preface'
            ? (dictionary.common.preface || 'Preface')
            : (dictionary.common.how_to_read || 'How should it be Read?');
        } else if (isDynamicAppendix) {
          const type = item.slug.endsWith('-open-questions')
            ? 'open-questions'
            : item.slug.endsWith('-design-decisions')
            ? 'design-decisions'
            : 'references';
          const titles = getDynamicAppendixTitles(locale);
          itemTitle = titles[type];
        } else {
          itemTitle = getTranslationValue(
            dictionary,
            isChapter ? ch!.purposeKey.replace('.purpose', '.title') : `appendices.${item.slug}.title`
          ) || '';
        }

        const itemPurpose = !isVolume && !isDynamicAppendix && !isBookStartItem
          ? getTranslationValue(dictionary, isChapter ? ch!.purposeKey : `appendices.${item.slug}.purpose`) || ''
          : '';
        const itemKeyQuestion = !isVolume && !isDynamicAppendix && !isBookStartItem
          ? getTranslationValue(dictionary, isChapter ? ch!.keyQuestionKey : `appendices.${item.slug}.key_question`) || ''
          : '';

        const resolvedDependencies = (isChapter && !isDynamicAppendix && !isBookStartItem)
          ? ch!.dependencies.map((depSlug) => {
              const depCh = readingItems.find((c) => c.slug === depSlug)?.metadata;
              const title = depCh ? getTranslationValue(dictionary, (depCh as ChapterMetadata).purposeKey.replace('.purpose', '.title')) : depSlug;
              return { slug: depSlug, title: title || depSlug };
            })
          : [];

        const resolvedRelated = (isChapter && !isDynamicAppendix && !isBookStartItem)
          ? ch!.relatedChapters.map((relSlug) => {
              const relCh = readingItems.find((c) => c.slug === relSlug)?.metadata;
              const title = relCh ? getTranslationValue(dictionary, (relCh as ChapterMetadata).purposeKey.replace('.purpose', '.title')) : relSlug;
              return { slug: relSlug, title: title || relSlug };
            })
          : [];

        const draftData = (!isVolume && !isDynamicAppendix && !isBookStartItem)
          ? getTranslationObject(dictionary, isChapter ? `chapters.${item.slug}.draft` : `appendices.${item.slug}.draft`) as DraftContent
          : null;

        const meta = (!isVolume && !isBookStartItem) ? (item.metadata as ChapterMetadata | AppendixMetadata) : null;

        return (
          <article
            key={item.slug}
            id={item.slug}
            data-reading-section
            className={`border-t border-sand-300/20 first:border-t-0 first:pt-0 relative space-y-12 sm:space-y-16 scroll-mt-20 ${
              item.slug === 'how-to-read'
                ? 'pt-0 !mt-0 sm:!mt-0'
                : 'pt-16'
            }`}
          >
            {bookmark?.slug === item.slug && (
              <div className="absolute top-0 right-0 w-8 h-12 bg-clay text-sand-100 flex items-center justify-center shadow-md rounded-b animate-fade-in" title={t.saved}>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                </svg>
              </div>
            )}

            {isVolume ? (
              /* VOLUME COVER VIEW */
              <div className="min-h-[60vh] flex flex-col justify-center items-center text-center space-y-8 py-12">
                <div className="space-y-4 max-w-2xl">
                  <span className="text-base sm:text-lg font-sans font-bold tracking-[0.25em] text-clay uppercase">
                    {dictionary.common.volume || 'Volume'} {vol!.romanId}
                  </span>
                  <h1 className="font-serif text-4xl sm:text-6xl font-bold tracking-tight text-charcoal leading-tight">
                    {itemTitle.replace(/^[^:]+:\s*/, '')}
                  </h1>
                  <p className="font-serif text-lg sm:text-xl italic text-sage-dark font-medium leading-relaxed">
                    {getTranslationValue(dictionary, vol!.purposeKey)}
                  </p>
                </div>

                {/* Introduction Paragraphs */}
                {(() => {
                  const introP1 = getTranslationValue(dictionary, `volumes.v${vol!.id}.intro_p1`) || '';
                  const introP2 = getTranslationValue(dictionary, `volumes.v${vol!.id}.intro_p2`) || '';
                  const introP3 = getTranslationValue(dictionary, `volumes.v${vol!.id}.intro_p3`) || '';

                  if (!introP1) return null;

                  return (
                    <div className="space-y-6 font-serif text-base sm:text-lg text-charcoal-muted leading-relaxed max-w-2xl mx-auto border-l-2 border-sage/40 pl-6 py-1 italic text-left mt-8">
                      <p>{introP1}</p>
                      {introP2 && <p>{introP2}</p>}
                      {introP3 && <p className="font-sans text-xs sm:text-sm text-charcoal-muted/70 not-italic pt-4">{introP3}</p>}
                    </div>
                  );
                })()}
              </div>
            ) : isBookStartItem ? (
              /* BOOK START INTRO SECTIONS */
              <div className="space-y-6 pt-10 pb-0">
                <header className="space-y-2">
                  <div className="flex items-center justify-between border-b-2 border-clay/30 pb-3 mb-6">
                    <span className="font-serif italic text-lg sm:text-xl text-charcoal-muted">{dictionary.header.nav_book}</span>
                    <span className="font-serif font-bold text-lg sm:text-xl text-clay">Saule</span>
                  </div>
                  <span className="text-[10px] font-sans font-bold tracking-widest text-clay uppercase">
                    {dictionary.common.book_start || 'Book Start'}
                  </span>
                  <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-charcoal leading-tight">
                    {itemTitle}
                  </h2>
                </header>

                <div className="space-y-6 font-serif text-base sm:text-lg text-charcoal-muted leading-relaxed max-w-2xl border-l-2 border-sage/40 pl-6 py-1 italic">
                  {(() => {
                    const startContent = getBookBeginningContent(locale, dictionary);
                    if (item.slug === 'preface') {
                      return (
                        <div className="space-y-4">
                          {startContent.preface.p1 && <p className="font-bold text-sage-dark">{startContent.preface.p1}</p>}
                          {startContent.preface.paragraphs.map((p: any, idx: number) => {
                            if (p.type === 'text') {
                              return (
                                <p key={idx} className="not-italic text-charcoal-muted">{p.content}</p>
                              );
                            } else if (p.type === 'list') {
                              return (
                                <ul key={idx} className="list-disc pl-5 space-y-2 not-italic text-charcoal-muted font-sans text-sm sm:text-base">
                                  {p.items.map((li: string, lidx: number) => (
                                    <li key={lidx}>{li}</li>
                                  ))}
                                </ul>
                              );
                            } else if (p.type === 'bold-lead') {
                              return (
                                <p key={idx} className="not-italic text-charcoal-muted">
                                  <strong className="font-bold text-sage-dark">{p.lead}</strong>
                                  {p.text}
                                </p>
                              );
                            }
                            return null;
                          })}
                        </div>
                      );
                    } else {
                      return (
                        <div className="space-y-4">
                          {startContent.howToRead.paragraphs.map((p: string, idx: number) => (
                            <p key={idx} className="not-italic text-charcoal-muted">{p}</p>
                          ))}
                        </div>
                      );
                    }
                  })()}
                </div>

                {/* Image block removed to close gap */}
              </div>
            ) : (
              /* STANDARD READING VIEW (Chapters, Appendices) */
              <>
                <header className="space-y-4">
                  <div className="flex flex-col space-y-1">
                    {volTitle && (
                      <span className="text-xs sm:text-sm font-sans font-bold tracking-widest text-clay uppercase">
                        {volTitle}
                      </span>
                    )}
                    <span className="text-xs font-sans font-bold tracking-wider text-charcoal-muted/60 uppercase">
                      {isChapter
                        ? `${dictionary.common.chapter || 'Chapter'} ${ch!.chapterNumber.toString().padStart(2, '0')}`
                        : `${dictionary.common.appendix || 'Appendix'} ${ap!.appendixNumber.toString()}`}
                    </span>
                  </div>
                  <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-charcoal leading-tight">
                    {itemTitle}
                  </h2>
                </header>

                {!isDynamicAppendix && (
                  <div className="space-y-4 my-8 pb-8 border-b border-sand-300/30">
                    {itemKeyQuestion && (
                      <p className="font-serif text-lg sm:text-xl italic font-bold text-sage-dark leading-relaxed">
                        “{itemKeyQuestion}”
                      </p>
                    )}
                    {itemPurpose && (
                      <p className="font-sans text-sm sm:text-base text-charcoal-muted leading-relaxed">
                        {itemPurpose}
                      </p>
                    )}
                  </div>
                )}

                {isDynamicAppendix ? (
                  <div className="space-y-12 sm:space-y-16">
                    {(() => {
                      const dynamicSections = getDynamicAppendixContent((item.metadata as AppendixMetadata).volumeId, item.slug, volumes, dictionary);
                      if (!dynamicSections || dynamicSections.length === 0) {
                        return (
                          <p className="text-sm font-sans text-charcoal-muted/50 italic">
                            {dictionary.workspace.no_data || 'No entries available.'}
                          </p>
                        );
                      }

                      const isQuestions = item.slug.endsWith('-open-questions');
                      const isDecisions = item.slug.endsWith('-design-decisions');
                      const isRefs = item.slug.endsWith('-references');

                      return dynamicSections.map((sec, sIdx) => (
                        <section key={sIdx} className="space-y-4">
                          <h3 className="font-serif text-lg sm:text-xl font-bold text-charcoal pb-1 border-b border-sand-300/20">
                            {sec.heading}
                          </h3>

                          {isQuestions && sec.items && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {sec.items.map((q, qIdx) => {
                                if (typeof q === 'string') {
                                  return (
                                    <div key={qIdx} className="p-4 rounded border border-sand-300/30 bg-sand-100/20 font-serif text-sm leading-relaxed text-charcoal-muted">
                                      {q}
                                    </div>
                                  );
                                }
                                const qItem = q as OpenQuestion;
                                return (
                                  <div key={qItem.id || qIdx} className="p-4 rounded border border-sand-300/40 bg-sand-100/30 space-y-3">
                                    <div className="flex items-start justify-between gap-3">
                                      <span className="font-serif text-sm font-medium text-charcoal leading-relaxed">
                                        {qItem.question}
                                      </span>
                                      <span className={`text-[9px] font-sans font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border flex-shrink-0 ${getQuestionStatusBadgeClass(qItem.status)}`}>
                                        {getTranslationMember(dictionary.workspace, `status_${qItem.status}`, qItem.status)}
                                      </span>
                                    </div>
                                    {(qItem.decisionArea || (!['zh-CN', 'ja', 'ko'].includes(locale) && qItem.answeredInChapters && qItem.answeredInChapters.length > 0)) && (
                                      <div className="pt-2 border-t border-sand-300/25 space-y-2 text-xs font-sans">
                                        {qItem.decisionArea && (
                                          <div className="flex items-center gap-1.5">
                                            <span className="text-[9px] font-semibold text-charcoal-muted/50 uppercase tracking-wider">
                                              {dictionary.workspace.decision_area}:
                                            </span>
                                            <span className="text-charcoal-muted font-medium text-[11px]">{qItem.decisionArea}</span>
                                          </div>
                                        )}
                                        {!['zh-CN', 'ja', 'ko'].includes(locale) && qItem.answeredInChapters && qItem.answeredInChapters.length > 0 && (
                                          <div className="space-y-1">
                                            <span className="text-[9px] font-semibold text-charcoal-muted/50 uppercase tracking-wider block">
                                              {dictionary.workspace.will_be_answered_in}
                                            </span>
                                            <div className="flex flex-wrap gap-1.5 mt-0.5">
                                              {qItem.answeredInChapters.map((answeredCh, idx) => (
                                                <span key={idx} className="px-1.5 py-0.5 rounded bg-sand-200/50 text-[10px] text-charcoal-muted border border-sand-300/20">
                                                  {answeredCh}
                                                </span>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {(isDecisions || isRefs) && sec.items && (
                            <ul className="list-disc pl-5 space-y-1.5 text-sm text-charcoal-muted">
                              {sec.items.map((d: string, dIdx: number) => (
                                <li key={dIdx} className="leading-relaxed">
                                  {d}
                                </li>
                              ))}
                            </ul>
                          )}
                        </section>
                      ));
                    })()}
                  </div>
                ) : (
                  draftData && typeof draftData === 'object' ? (
                    <div className="space-y-12 sm:space-y-16">
                      {Array.isArray(draftData.sections) &&
                        draftData.sections.map((sec, sIdx) => (
                          <section key={sIdx} className="space-y-4">
                            <h3 className="font-serif text-xl sm:text-2xl font-semibold text-charcoal">
                              {sec.heading}
                            </h3>
                            <div className="space-y-4 font-sans text-sm sm:text-base text-charcoal-muted leading-relaxed">
                              {Array.isArray(sec.paragraphs) &&
                                sec.paragraphs.map((p, pIdx) => <p key={pIdx}>{p}</p>)}
                            </div>
                          </section>
                        ))}


                    </div>
                  ) : (
                    <section className="space-y-8">
                      <h3 className="font-serif text-xl sm:text-2xl font-semibold text-charcoal pb-2 border-b border-sand-300/20">
                        {dictionary.common.research_workspace}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                          <div className="space-y-2">
                            <h4 className="font-serif text-base font-bold text-sage-dark">
                              {dictionary.workspace.notes}
                            </h4>
                            <p className="font-sans text-xs text-charcoal-muted italic pl-3 border-l border-sand-300">
                              {dictionary.workspace.no_data}
                            </p>
                          </div>
                        </div>
                      </div>
                    </section>
                  )
                )}
              </>
            )}
          </article>
        );
      })}

      {/* Floating Premium Book Controls Panel */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-sm w-full px-4 sm:px-0">
        <div className="bg-sand-100/80 border border-sand-300/40 backdrop-blur-md shadow-lg rounded-full px-6 py-3 flex items-center justify-between text-xs sm:text-sm font-sans font-semibold text-charcoal-muted">
          <button
            onClick={toggleBookmark}
            className="flex items-center space-x-1.5 hover:text-clay transition-colors cursor-pointer"
          >
            <svg
              className={`w-4 h-4 ${bookmark?.slug === activeSlug ? 'text-clay' : 'text-charcoal-muted/65'}`}
              fill={bookmark?.slug === activeSlug ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            <span className={bookmark?.slug === activeSlug ? 'text-clay font-bold' : ''}>
              {bookmark?.slug === activeSlug ? t.saved : t.add}
            </span>
          </button>
          <span className="h-4 w-px bg-sand-300/60" />
          <span className="font-serif italic text-charcoal">
            {t.page} {pageNumber} / {totalPages}
          </span>
          <span className="h-4 w-px bg-sand-300/60" />
          <button
            onClick={scrollToTop}
            className="flex items-center space-x-1 hover:text-sage-dark transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            <span>{t.top}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
