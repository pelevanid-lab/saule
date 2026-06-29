'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import SauleLogo from '@/components/SauleLogo';

type SupportedLocale = 'tr' | 'en' | 'ru';

type Slide = {
  eyebrow: string;
  title: string;
  accent: string;
  body: string;
  visual: 'assistant' | 'risk' | 'memory';
};

type BusinessCopy = {
  nav: {
    product: string;
    platform: string;
    solutions: string;
    pricing: string;
    resources: string;
    signIn: string;
    demo: string;
  };
  hero: Slide[];
  primaryCta: string;
  secondaryCta: string;
  capabilityTitle: string;
  capabilities: string[];
  sections: {
    platform: {
      eyebrow: string;
      title: string;
      body: string;
      bullets: string[];
    };
    solutions: {
      eyebrow: string;
      title: string;
      body: string;
      bullets: string[];
    };
    pricing: {
      eyebrow: string;
      title: string;
      body: string;
      cards: { name: string; copy: string }[];
    };
    resources: {
      eyebrow: string;
      title: string;
      body: string;
      bullets: string[];
    };
  };
  finalCta: {
    title: string;
    body: string;
    primary: string;
    secondary: string;
  };
};

const businessCopy: Record<SupportedLocale, BusinessCopy> = {
  tr: {
    nav: {
      product: 'Ürün',
      platform: 'Platform',
      solutions: 'Çözümler',
      pricing: 'Fiyatlandırma',
      resources: 'Kaynaklar',
      signIn: 'Giriş Yap',
      demo: 'Demo Planla',
    },
    hero: [
      {
        eyebrow: 'Yaşayan Saule Asistan',
        title: 'İşinizi tanıyan',
        accent: 'yaşayan asistan',
        body: 'Soruları yanıtlar, sizin için not alır, şirketinizi öğrenir ve onayınızla CRM aksiyonlarını gerçekleştirir.',
        visual: 'assistant',
      },
      {
        eyebrow: 'SLA ve Gelir Koruması',
        title: 'Riski müşteriden',
        accent: 'önce fark edin',
        body: 'SLA ihlallerini, geciken işleri ve gelir risklerini Saule sizin için sürekli takip eder.',
        visual: 'risk',
      },
      {
        eyebrow: 'Kurumsal Hafıza',
        title: 'Her etkileşimden',
        accent: 'öğrenen CRM',
        body: 'Müşteri görüşmelerini örüntülere, playbook’lara ve iyileştirme aksiyonlarına dönüştüren public business experience.',
        visual: 'memory',
      },
    ],
    primaryCta: 'Demo Planla',
    secondaryCta: 'Platformu İncele',
    capabilityTitle: 'Capabilities',
    capabilities: [
      'Customer 360',
      'Company 360',
      'Omnichannel Inbox',
      'Tickets',
      'Insights',
      'Pattern Memory',
      'Playbooks',
      'Scripts',
      'Tasks',
      'SLA learning',
      'Continuous improvement CRM',
    ],
    sections: {
      platform: {
        eyebrow: 'Platform',
        title: 'CRM gövdesi ile öğrenen zeka aynı yerde',
        body: 'Saule Business, müşteri operasyonlarını yöneten yüzeyleri kurumsal hafıza ve karar desteğiyle birleştirir. Amaç yalnızca kayıt tutmak değil; ekibin her temastan daha net öğrenmesini sağlamaktır.',
        bullets: [
          'Müşteri, şirket ve temas bağlamını tek akışta toplar.',
          'Tekrar eden sinyalleri görünür örüntülere dönüştürür.',
          'Ekiplerin aynı müşteri hafızasıyla çalışmasını sağlar.',
        ],
      },
      solutions: {
        eyebrow: 'Çözümler',
        title: 'Destek, satış ve müşteri başarısı için ortak çalışma alanı',
        body: 'Business evreni yalnızca tek bir CRM ekranı değil; farklı ekiplerin aynı müşteri gerçeğiyle hizalanabildiği bir operasyon katmanı olarak düşünülür.',
        bullets: [
          'Destek ekipleri tekrar eden problemleri daha erken görür.',
          'Satış ekipleri itiraz ve yenileme risklerini bağlamıyla takip eder.',
          'Müşteri başarısı ekipleri geciken sinyalleri kurumsal hafızada kaybetmez.',
        ],
      },
      pricing: {
        eyebrow: 'Fiyatlandırma',
        title: 'Kurulumdan çok öğrenme ritmine göre ölçeklenir',
        body: 'Bu alan şimdilik yalnızca landing katmanıdır. Fiyatlandırma dili, ürün olgunlaştıkça netleşecek; ancak deneyim şimdiden ekip, bağlam ve öğrenme hızı etrafında kurgulanır.',
        cards: [
          { name: 'Starter', copy: 'Erken ekipler için net operasyon ve öğrenen hafıza başlangıcı.' },
          { name: 'Growth', copy: 'Daha fazla ekip, daha fazla temas ve daha güçlü örüntü takibi.' },
          { name: 'Enterprise', copy: 'Kurumsal süreçler, güvenlik ve genişleyen operasyon akışları için.' },
        ],
      },
      resources: {
        eyebrow: 'Kaynaklar',
        title: 'Adaptive CRM yaklaşımını açıklayan içerik katmanı',
        body: 'Business tarafı bir satış vitrini gibi değil, Saule Core’un iş katmanındaki davranışını açıklayan açık bir kaynak alanı gibi ilerlemelidir.',
        bullets: [
          'Adaptive CRM nedir?',
          'Kurumsal hafıza neden önemlidir?',
          'Açık operasyonel döngüler nasıl görünür kılınır?',
        ],
      },
    },
    finalCta: {
      title: 'Saule Business evrenine giriş buradan başlar.',
      body: 'Şimdilik CRM uygulamasına değil, business landing deneyimine geçiyorsunuz. Sonraki adımda diğer landing sayfalarını da aynı yapı altında açacağız.',
      primary: 'Business Yolculuğunu Başlat',
      secondary: 'Capabilities Bölümüne Dön',
    },
  },
  en: {
    nav: {
      product: 'Product',
      platform: 'Platform',
      solutions: 'Solutions',
      pricing: 'Pricing',
      resources: 'Resources',
      signIn: 'Sign In',
      demo: 'Book Demo',
    },
    hero: [
      {
        eyebrow: 'Living Saule Assistant',
        title: 'A living assistant that',
        accent: 'knows your business',
        body: 'Answers questions, takes notes, learns your company and performs CRM actions with your approval.',
        visual: 'assistant',
      },
      {
        eyebrow: 'SLA and Revenue Protection',
        title: 'See the risk',
        accent: 'before your customer does',
        body: 'Saule continuously watches SLA breaches, overdue work and revenue risk for your team.',
        visual: 'risk',
      },
      {
        eyebrow: 'Company Memory',
        title: 'A CRM that',
        accent: 'learns from every interaction',
        body: 'A public business landing experience built around memory, patterns and action loops.',
        visual: 'memory',
      },
    ],
    primaryCta: 'Book Demo',
    secondaryCta: 'Explore Platform',
    capabilityTitle: 'Capabilities',
    capabilities: [
      'Customer 360',
      'Company 360',
      'Omnichannel Inbox',
      'Tickets',
      'Insights',
      'Pattern Memory',
      'Playbooks',
      'Scripts',
      'Tasks',
      'SLA learning',
      'Continuous improvement CRM',
    ],
    sections: {
      platform: {
        eyebrow: 'Platform',
        title: 'CRM foundation and adaptive intelligence together',
        body: 'Saule Business combines customer operations surfaces with company memory and decision support. The point is not just to store records, but to help teams learn from every contact.',
        bullets: [
          'Unifies customer, company and interaction context.',
          'Turns repeated signals into visible patterns.',
          'Helps teams work from the same shared memory.',
        ],
      },
      solutions: {
        eyebrow: 'Solutions',
        title: 'One operational layer for support, sales and success',
        body: 'The business universe is not just a single CRM page. It is a public-facing operating layer where different teams can align around the same customer reality.',
        bullets: [
          'Support teams catch repeated issues earlier.',
          'Sales teams track objections and renewal risk with context.',
          'Success teams do not lose weak signals in disconnected systems.',
        ],
      },
      pricing: {
        eyebrow: 'Pricing',
        title: 'Scales around learning rhythm, not setup ceremony',
        body: 'For now, this is only the landing layer. Pricing will become clearer as the product matures, but the experience is already framed around teams, context and learning speed.',
        cards: [
          { name: 'Starter', copy: 'Clear operations and learning memory for early teams.' },
          { name: 'Growth', copy: 'More teams, more touchpoints and stronger pattern tracking.' },
          { name: 'Enterprise', copy: 'For security, governance and broader operational flows.' },
        ],
      },
      resources: {
        eyebrow: 'Resources',
        title: 'An open layer explaining the adaptive CRM approach',
        body: 'Business should grow not like a sales brochure, but like an open knowledge layer explaining how Saule behaves in the work domain.',
        bullets: [
          'What is adaptive CRM?',
          'Why does company memory matter?',
          'How do open operational loops become visible?',
        ],
      },
    },
    finalCta: {
      title: 'This is the entry point into the Saule Business universe.',
      body: 'For now, you are entering the landing experience, not the CRM app itself. We can bring the rest of the landing pages under this structure next.',
      primary: 'Enter Business Journey',
      secondary: 'Back to Capabilities',
    },
  },
  ru: {
    nav: {
      product: 'Продукт',
      platform: 'Платформа',
      solutions: 'Решения',
      pricing: 'Тарифы',
      resources: 'Ресурсы',
      signIn: 'Вход',
      demo: 'Запросить демо',
    },
    hero: [
      {
        eyebrow: 'Живой ассистент Saule',
        title: 'Ассистент, который',
        accent: 'знает ваш бизнес',
        body: 'Отвечает на вопросы, сохраняет заметки, изучает компанию и выполняет CRM-действия с вашим одобрением.',
        visual: 'assistant',
      },
      {
        eyebrow: 'SLA и защита выручки',
        title: 'Замечайте риск',
        accent: 'раньше клиента',
        body: 'Saule постоянно отслеживает нарушения SLA, просроченные задачи и риски для выручки.',
        visual: 'risk',
      },
      {
        eyebrow: 'Память компании',
        title: 'CRM, который',
        accent: 'учится на каждом контакте',
        body: 'Публичный business landing-опыт вокруг памяти, паттернов и замкнутых действий.',
        visual: 'memory',
      },
    ],
    primaryCta: 'Запросить демо',
    secondaryCta: 'Изучить платформу',
    capabilityTitle: 'Capabilities',
    capabilities: [
      'Customer 360',
      'Company 360',
      'Omnichannel Inbox',
      'Tickets',
      'Insights',
      'Pattern Memory',
      'Playbooks',
      'Scripts',
      'Tasks',
      'SLA learning',
      'Continuous improvement CRM',
    ],
    sections: {
      platform: {
        eyebrow: 'Платформа',
        title: 'CRM-основа и адаптивный интеллект вместе',
        body: 'Saule Business объединяет поверхности клиентских операций с памятью компании и поддержкой решений. Смысл не только в хранении данных, а в обучении команды на каждом контакте.',
        bullets: [
          'Собирает контекст клиента, компании и взаимодействий в одном слое.',
          'Преобразует повторяющиеся сигналы в видимые паттерны.',
          'Помогает командам работать с одной общей памятью.',
        ],
      },
      solutions: {
        eyebrow: 'Решения',
        title: 'Общий операционный слой для support, sales и success',
        body: 'Business-вселенная — это не просто один CRM-экран. Это публичный операционный слой, где разные команды выстраиваются вокруг одной клиентской реальности.',
        bullets: [
          'Support раньше замечает повторяющиеся проблемы.',
          'Sales отслеживает возражения и риски продления с контекстом.',
          'Success не теряет слабые сигналы в разрозненных системах.',
        ],
      },
      pricing: {
        eyebrow: 'Тарифы',
        title: 'Масштабируется вокруг ритма обучения, а не церемонии настройки',
        body: 'Пока это только landing-слой. Ценообразование станет яснее по мере зрелости продукта, но опыт уже строится вокруг команд, контекста и скорости обучения.',
        cards: [
          { name: 'Starter', copy: 'Ясные операции и обучающаяся память для ранних команд.' },
          { name: 'Growth', copy: 'Больше команд, больше контактов и сильнее отслеживание паттернов.' },
          { name: 'Enterprise', copy: 'Для безопасности, управления и более широких процессов.' },
        ],
      },
      resources: {
        eyebrow: 'Ресурсы',
        title: 'Открытый слой, объясняющий подход adaptive CRM',
        body: 'Business должен расти не как рекламный буклет, а как открытый слой знаний, объясняющий поведение Saule в рабочем контексте.',
        bullets: [
          'Что такое adaptive CRM?',
          'Почему память компании важна?',
          'Как открытые операционные петли становятся видимыми?',
        ],
      },
    },
    finalCta: {
      title: 'Это точка входа во вселенную Saule Business.',
      body: 'Сейчас вы входите в landing-опыт, а не в сам CRM-продукт. Следующим шагом мы можем перенести сюда остальные landing-страницы.',
      primary: 'Начать Business Journey',
      secondary: 'Вернуться к Capabilities',
    },
  },
};

function resolveLocale(locale: string): SupportedLocale {
  if (locale === 'tr' || locale === 'en' || locale === 'ru') return locale;
  return 'en';
}

export default function BusinessLanding({
  locale,
  basePath,
}: {
  locale: string;
  basePath?: string;
}) {
  const lang = resolveLocale(locale);
  const copy = businessCopy[lang];
  const [activeSlide, setActiveSlide] = useState(0);
  const slides = copy.hero;
  const routeBase = basePath ?? `/${lang}/business/crm`;
  const coreHref = `/${lang}`;
  const coreReturnLabel =
    lang === 'tr' ? "Core'a geri dön" : lang === 'ru' ? 'Вернуться в Core' : 'Return to Core';

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 5500);

    return () => window.clearInterval(timer);
  }, [slides.length]);

  const localeLinks = useMemo(
    () =>
      ['tr', 'en', 'ru'].map((item) => ({
        code: item,
        href: `/${item}/business/crm`,
        active: item === lang,
      })),
    [lang],
  );

  const currentSlide = slides[activeSlide];

  return (
    <div className="w-full pb-20">
      <section className="rounded-[2rem] border border-sand-300/70 bg-white shadow-[0_14px_40px_rgba(32,24,16,0.06)] overflow-hidden">
        <div className="border-b border-sand-300/70 bg-sand-50/85 px-5 py-4 backdrop-blur">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-5">
              <div className="flex items-center gap-3">
                <SauleLogo size={44} className="shadow-sm" />
                <div>
                  <p className="font-serif text-3xl font-bold tracking-tight text-charcoal">Saule</p>
                </div>
              </div>
              <nav className="hidden items-center gap-7 lg:flex">
                <a href={`${routeBase}#product`} className="text-lg font-semibold text-charcoal-muted transition-colors hover:text-charcoal">{copy.nav.product}</a>
                <a href={`${routeBase}#platform`} className="text-lg font-semibold text-charcoal-muted transition-colors hover:text-charcoal">{copy.nav.platform}</a>
                <a href={`${routeBase}#solutions`} className="text-lg font-semibold text-charcoal-muted transition-colors hover:text-charcoal">{copy.nav.solutions}</a>
                <a href={`${routeBase}#pricing`} className="text-lg font-semibold text-charcoal-muted transition-colors hover:text-charcoal">{copy.nav.pricing}</a>
                <a href={`${routeBase}#resources`} className="text-lg font-semibold text-charcoal-muted transition-colors hover:text-charcoal">{copy.nav.resources}</a>
              </nav>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center rounded-2xl border border-sand-300 bg-white p-1">
                {localeLinks.map((item) => (
                  <Link
                    key={item.code}
                    href={item.href}
                    className={`rounded-xl px-3 py-1.5 text-sm font-black uppercase transition-colors ${
                      item.active ? 'bg-charcoal text-sand-100' : 'text-charcoal-muted hover:bg-sand-200/70'
                    }`}
                  >
                    {item.code}
                  </Link>
                ))}
              </div>
              <a href={`${routeBase}#final-cta`} className="text-lg font-semibold text-charcoal-muted transition-colors hover:text-charcoal">
                {copy.nav.signIn}
              </a>
              <a href={`${routeBase}#final-cta`} className="inline-flex items-center gap-2 rounded-2xl bg-charcoal px-5 py-3 text-lg font-black text-sand-100 transition-colors hover:bg-black">
                {copy.nav.demo}
                <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>

        <div className="bg-[linear-gradient(rgba(230,226,218,0.55)_1px,transparent_1px),linear-gradient(90deg,rgba(230,226,218,0.55)_1px,transparent_1px)] bg-[size:52px_52px] px-3 py-4 sm:px-5 sm:py-5">
          <div className="relative min-h-[44rem] overflow-hidden rounded-[1.8rem] bg-[#11152b]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,198,87,0.16),transparent_24%),radial-gradient(circle_at_80%_18%,rgba(255,255,255,0.1),transparent_18%)]" />

            {currentSlide.visual === 'assistant' ? (
              <div className="absolute inset-y-0 right-0 hidden w-[48%] lg:block">
                <Image
                  src="/business/saule-human-hero-v1.png"
                  alt=""
                  fill
                  priority
                  sizes="48vw"
                  className="object-cover object-center"
                />
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(17,21,43,0.95)_0%,rgba(17,21,43,0.58)_18%,rgba(17,21,43,0.06)_40%,rgba(17,21,43,0)_100%)]" />
              </div>
            ) : null}

            {currentSlide.visual === 'risk' ? (
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_38%,rgba(216,112,90,0.22),transparent_30%),linear-gradient(110deg,rgba(17,21,43,0.96)_0%,rgba(25,28,51,0.96)_56%,rgba(58,28,24,0.92)_100%)]" />
            ) : null}

            {currentSlide.visual === 'memory' ? (
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_35%,rgba(255,209,90,0.18),transparent_26%),linear-gradient(110deg,rgba(17,21,43,0.96)_0%,rgba(20,28,57,0.94)_56%,rgba(27,33,53,0.96)_100%)]" />
            ) : null}

            <div className="relative z-10 grid gap-10 px-8 py-10 lg:grid-cols-[1.1fr_0.9fr] lg:px-12 lg:py-12">
              <div className="flex min-h-[37rem] flex-col justify-center">
                <div className="max-w-3xl">
                  <p className="mb-6 inline-flex rounded-2xl border border-[#f0bd4f]/40 bg-[#f0bd4f]/10 px-4 py-2 text-sm font-black uppercase tracking-[0.18em] text-[#ffd77e]">
                    {currentSlide.eyebrow}
                  </p>
                  <h1 className="text-balance font-sans text-6xl font-black leading-[0.95] tracking-tight text-white md:text-7xl xl:text-[5.5rem]">
                    {currentSlide.title}
                    <br />
                    <span className="text-[#ffc84f]">{currentSlide.accent}</span>
                  </h1>
                  <p className="mt-8 max-w-2xl text-2xl leading-relaxed text-[#efe8da]">
                    {currentSlide.body}
                  </p>

                  <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                    <a href={`${routeBase}#final-cta`} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#f5be31] px-6 py-4 text-xl font-black text-[#141828] transition-transform hover:-translate-y-0.5">
                      {copy.primaryCta}
                      <span aria-hidden="true">→</span>
                    </a>
                    <a href={`${routeBase}#platform`} className="inline-flex items-center justify-center rounded-2xl border border-white/35 bg-white/6 px-6 py-4 text-xl font-bold text-white transition-colors hover:bg-white/12">
                      {copy.secondaryCta}
                    </a>
                  </div>
                </div>
              </div>

              <div className="relative hidden min-h-[37rem] lg:block">
                <HeroPanel locale={lang} visual={currentSlide.visual} />
              </div>
            </div>

            <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-3">
              {slides.map((slide, index) => (
                <button
                  key={slide.eyebrow}
                  type="button"
                  onClick={() => setActiveSlide(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === activeSlide ? 'w-14 bg-[#f5be31]' : 'w-9 bg-white/35 hover:bg-white/55'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="product" className="mt-16 grid gap-8 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="space-y-5">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-clay">{copy.capabilityTitle}</p>
          <h2 className="font-serif text-5xl font-bold tracking-tight text-charcoal">
            Saule Business
          </h2>
          <p className="max-w-xl text-xl leading-9 text-charcoal-muted">
            İş için uyumlanabilir zeka. Müşteri etkileşimlerini belleğe, örüntülere, playbook’lara, senaryolara, görevlere ve iyileştirme eylemlerine dönüştüren öğrenen bir business katmanı.
          </p>
        </div>

        <div className="rounded-[2rem] border border-sand-300/70 bg-white p-8 shadow-[0_14px_35px_rgba(32,24,16,0.05)]">
          <h3 className="font-serif text-4xl font-bold text-clay">{copy.capabilityTitle}</h3>
          <div className="mt-8 grid gap-x-10 gap-y-4 sm:grid-cols-2">
            {copy.capabilities.map((item) => (
              <div key={item} className="flex items-center gap-3 text-lg text-charcoal-muted">
                <span className="text-clay">▹</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <BusinessSection
        id="platform"
        eyebrow={copy.sections.platform.eyebrow}
        title={copy.sections.platform.title}
        body={copy.sections.platform.body}
        bullets={copy.sections.platform.bullets}
      />

      <BusinessSection
        id="solutions"
        eyebrow={copy.sections.solutions.eyebrow}
        title={copy.sections.solutions.title}
        body={copy.sections.solutions.body}
        bullets={copy.sections.solutions.bullets}
        inverted
      />

      <section id="pricing" className="mt-16 rounded-[2rem] border border-sand-300/70 bg-white px-8 py-10 shadow-[0_14px_35px_rgba(32,24,16,0.05)]">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-clay">{copy.sections.pricing.eyebrow}</p>
        <div className="mt-5 max-w-4xl">
          <h2 className="font-serif text-5xl font-bold tracking-tight text-charcoal">{copy.sections.pricing.title}</h2>
          <p className="mt-5 text-xl leading-9 text-charcoal-muted">{copy.sections.pricing.body}</p>
        </div>
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {copy.sections.pricing.cards.map((card, index) => (
            <article
              key={card.name}
              className={`rounded-[1.5rem] border p-6 ${
                index === 1 ? 'border-charcoal bg-charcoal text-sand-100' : 'border-sand-300 bg-sand-50/60'
              }`}
            >
              <p className={`text-sm font-black uppercase tracking-[0.18em] ${index === 1 ? 'text-[#f5be31]' : 'text-clay'}`}>
                {card.name}
              </p>
              <p className={`mt-4 text-lg leading-8 ${index === 1 ? 'text-sand-200' : 'text-charcoal-muted'}`}>
                {card.copy}
              </p>
            </article>
          ))}
        </div>
      </section>

      <BusinessSection
        id="resources"
        eyebrow={copy.sections.resources.eyebrow}
        title={copy.sections.resources.title}
        body={copy.sections.resources.body}
        bullets={copy.sections.resources.bullets}
      />

      <section id="final-cta" className="mt-16 rounded-[2rem] bg-charcoal px-8 py-12 text-sand-100 shadow-[0_20px_50px_rgba(18,18,18,0.16)]">
        <div className="max-w-4xl">
          <Link
            href={coreHref}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-bold text-sand-200 transition-colors hover:bg-white/10 hover:text-white"
          >
            <span aria-hidden="true">←</span>
            {coreReturnLabel}
          </Link>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#f5be31]">Saule Business</p>
          <h2 className="mt-5 font-serif text-5xl font-bold tracking-tight">{copy.finalCta.title}</h2>
          <p className="mt-5 text-xl leading-9 text-sand-200">{copy.finalCta.body}</p>
        </div>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <a href={`${routeBase}#product`} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#f5be31] px-6 py-4 text-lg font-black text-[#141828] transition-transform hover:-translate-y-0.5">
            {copy.finalCta.primary}
            <span aria-hidden="true">→</span>
          </a>
          <a href={`${routeBase}#product`} className="inline-flex items-center justify-center rounded-2xl border border-white/25 px-6 py-4 text-lg font-bold text-white transition-colors hover:bg-white/8">
            {copy.finalCta.secondary}
          </a>
        </div>
      </section>
    </div>
  );
}

function BusinessSection({
  id,
  eyebrow,
  title,
  body,
  bullets,
  inverted = false,
}: {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  bullets: string[];
  inverted?: boolean;
}) {
  return (
    <section
      id={id}
      className={`mt-16 rounded-[2rem] border px-8 py-10 shadow-[0_14px_35px_rgba(32,24,16,0.05)] ${
        inverted ? 'border-charcoal bg-charcoal text-sand-100' : 'border-sand-300/70 bg-white'
      }`}
    >
      <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div>
          <p className={`text-sm font-black uppercase tracking-[0.18em] ${inverted ? 'text-[#f5be31]' : 'text-clay'}`}>{eyebrow}</p>
          <h2 className={`mt-5 font-serif text-5xl font-bold tracking-tight ${inverted ? 'text-white' : 'text-charcoal'}`}>{title}</h2>
        </div>
        <div>
          <p className={`text-xl leading-9 ${inverted ? 'text-sand-200' : 'text-charcoal-muted'}`}>{body}</p>
          <div className="mt-6 space-y-4">
            {bullets.map((item) => (
              <div key={item} className="flex items-start gap-3">
                <span className={`mt-1 ${inverted ? 'text-[#f5be31]' : 'text-clay'}`}>▹</span>
                <p className={`text-lg leading-8 ${inverted ? 'text-sand-100' : 'text-charcoal-muted'}`}>{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroPanel({ locale, visual }: { locale: SupportedLocale; visual: Slide['visual'] }) {
  if (visual === 'assistant') {
    const copy = {
      tr: {
        status: 'DİNLİYOR',
        message: 'Acme Corp şirketinde bir yenileme riski fark ettim. Bir takip eylemi hazırlamamı ister misiniz?',
        note: 'Bağlam duyarlı · Onayınız gerekiyor',
      },
      en: {
        status: 'LISTENING',
        message: 'I noticed a renewal risk in Acme Corp. Would you like me to prepare a follow-up action?',
        note: 'Context-aware · Approval required',
      },
      ru: {
        status: 'СЛУШАЕТ',
        message: 'Я заметила риск продления в Acme Corp. Хотите, чтобы я подготовила следующий шаг?',
        note: 'С учетом контекста · Нужно одобрение',
      },
    }[locale];

    return (
      <div className="absolute right-0 top-1/2 w-full max-w-[30rem] -translate-y-1/2 rounded-[2rem] border border-white/18 bg-white/10 p-5 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-[#f5be31]">
            <Image src="/business/saule-human-hero-v1.png" alt="" fill className="object-cover" />
          </div>
          <div>
            <p className="text-3xl font-black text-white">Saule</p>
            <p className="text-sm font-black tracking-[0.18em] text-[#d4dbff]">{copy.status}</p>
          </div>
        </div>
        <div className="mt-5 rounded-[1.6rem] rounded-tl-md bg-white p-5 text-xl font-semibold leading-9 text-slate-700">
          {copy.message}
        </div>
        <p className="mt-5 text-base font-black text-[#f5d477]">{copy.note}</p>
      </div>
    );
  }

  if (visual === 'risk') {
    const copy = {
      tr: {
        title: 'Gelir Koruma Sinyali',
        level: 'Yüksek',
        labelOne: 'SLA İHLALİ',
        labelTwo: 'GELİR RİSKİ',
        labelThree: 'ACİL TAKİP',
        note: 'Fiyatlandırma sürtünmesi ve açık bir SLA ihlali bu yenilemeyi riske atıyor.',
        cta: 'Öneriyi incele',
      },
      en: {
        title: 'Revenue Protection Signal',
        level: 'High',
        labelOne: 'SLA BREACH',
        labelTwo: 'REVENUE RISK',
        labelThree: 'URGENT FOLLOW-UP',
        note: 'Pricing friction and an open SLA breach are putting this renewal at risk.',
        cta: 'Review recommendation',
      },
      ru: {
        title: 'Сигнал защиты выручки',
        level: 'Высокий',
        labelOne: 'НАРУШЕНИЕ SLA',
        labelTwo: 'РИСК ВЫРУЧКИ',
        labelThree: 'СРОЧНО',
        note: 'Трение в ценообразовании и открытое нарушение SLA ставят продление под угрозу.',
        cta: 'Открыть рекомендацию',
      },
    }[locale];

    return (
      <div className="absolute right-0 top-1/2 w-full max-w-[34rem] -translate-y-1/2 rounded-[2rem] border border-white/18 bg-white/8 p-5 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-slate-400">{copy.title}</p>
            <p className="mt-2 text-4xl font-black text-white">Acme Corp</p>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-400/15 text-3xl text-rose-300">!</div>
        </div>
        <div className="mt-6 grid grid-cols-3 gap-3">
          <MetricCard value="1" label={copy.labelOne} />
          <MetricCard value={copy.level} label={copy.labelTwo} />
          <MetricCard value="3" label={copy.labelThree} />
        </div>
        <div className="mt-4 rounded-[1.6rem] border border-[#f5be31]/18 bg-[#f5be31]/10 p-5">
          <p className="text-lg font-black text-[#f5d477]">Saule fark etti</p>
          <p className="mt-3 text-lg leading-8 text-slate-200">{copy.note}</p>
          <div className="mt-4 inline-flex rounded-xl bg-[#f5be31] px-4 py-2.5 text-base font-black text-[#141828]">
            {copy.cta}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute right-0 top-1/2 w-full max-w-[34rem] -translate-y-1/2 rounded-[2rem] border border-white/18 bg-white/8 p-5 shadow-2xl backdrop-blur-xl">
      <div className="rounded-[1.8rem] bg-white p-5">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-clay">Company Memory</p>
        <h3 className="mt-2 text-4xl font-black text-charcoal">Tekrar eden fiyat itirazı</h3>
        <p className="mt-4 text-lg leading-8 text-charcoal-muted">
          Son 30 günde aynı müşteri bariyeri üç farklı ekipte yeniden belirdi. Saule bu örüntüyü bağlamıyla görünür kıldı.
        </p>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <MetricCard value="18" label="İÇGÖRÜ" light />
        <MetricCard value="7" label="ÖRÜNTÜ" light />
      </div>
    </div>
  );
}

function MetricCard({
  value,
  label,
  light = false,
}: {
  value: string;
  label: string;
  light?: boolean;
}) {
  return (
    <div className={`rounded-[1.35rem] border p-4 ${light ? 'border-sand-300 bg-sand-50' : 'border-white/12 bg-white/6'}`}>
      <p className={`text-4xl font-black ${light ? 'text-charcoal' : 'text-white'}`}>{value}</p>
      <p className={`mt-2 text-xs font-black uppercase tracking-[0.18em] ${light ? 'text-charcoal-muted' : 'text-slate-400'}`}>{label}</p>
    </div>
  );
}
