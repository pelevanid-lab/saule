'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

type SitePage =
  | 'home'
  | 'crm'
  | 'adaptive-ai'
  | 'company-memory'
  | 'pricing'
  | 'security'
  | 'resource'
  | 'legal'
  | 'login'
  | 'demo';

type LocaleCode = 'tr' | 'en' | 'ru';

type FeatureItem = {
  title: string;
  description: string;
  icon?: string;
  status?: 'Mevcut' | 'Yakında' | 'Planlandı';
};

type Copy = {
  nav: {
    product: string;
    platform: string;
    solutions: string;
    pricing: string;
    resources: string;
    signIn: string;
    demo: string;
    home: string;
  };
  hero: Array<{
    eyebrow: string;
    title: string;
    accent: string;
    body: string;
    kind: 'memory' | 'assistant' | 'risk';
  }>;
  productPanel: {
    title: string;
    sideNav: string[];
    metrics: { label: string; value: string }[];
    patternLabel: string;
    memory: string;
    trend: string;
    insightLabel: string;
    insight: string;
    actionLabel: string;
    action: string;
    teamLabel: string;
    team: string;
    riskLabel: string;
    risk: string;
    loopSteps: string[];
    recommendationsTitle: string;
    recommendations: string[];
  };
  problem: { eyebrow: string; title: string; copy: string; points: string[] };
  loop: { eyebrow: string; title: string; copy: string; steps: string[] };
  crmBody: { eyebrow: string; title: string; copy: string; features: FeatureItem[] };
  intelligence: { eyebrow: string; title: string; copy: string; features: FeatureItem[] };
  memory: { eyebrow: string; title: string; copy: string; signals: string[] };
  useCases: { eyebrow: string; title: string; items: FeatureItem[] };
  roadmap: { eyebrow: string; title: string; current: string[]; coming: string[]; planned: string[] };
  trust: { eyebrow: string; title: string; copy: string; items: string[] };
  pricingPreview: {
    eyebrow: string;
    title: string;
    copy: string;
    note: string;
    plans: Array<{
      name: string;
      audience: string;
      price: string;
      description: string;
      features: string[];
      cta: string;
      highlighted?: boolean;
    }>;
  };
  finalCta: { title: string; copy: string; crmCta: string; coreCta: string };
  pages: {
    crm: { eyebrow: string; title: string; copy: string; pillars: FeatureItem[]; workflowTitle: string; workflow: string[] };
    adaptiveAi: { eyebrow: string; title: string; copy: string; layers: FeatureItem[]; noteTitle: string; noteCopy: string };
    companyMemory: { eyebrow: string; title: string; copy: string; signalsTitle: string; signals: FeatureItem[]; outcomeTitle: string; outcomes: string[] };
    pricing: { eyebrow: string; title: string; copy: string };
    security: { eyebrow: string; title: string; copy: string; principles: FeatureItem[]; noteTitle: string; noteCopy: string };
    resource: { eyebrow: string; title: string; copy: string; sections: Array<{ title: string; body: string }> };
    legal: { eyebrow: string; title: string; copy: string; lastUpdated: string; sections: Array<{ title: string; body: string }>; contactTitle: string; contactBody: string };
    login: { eyebrow: string; title: string; copy: string; cardTitle: string; cardCopy: string; fields: string[] };
    demo: { eyebrow: string; title: string; copy: string; cardTitle: string; cardCopy: string; bullets: string[] };
  };
};

const trCopy: Copy = {
  nav: {
    product: 'Ürün',
    platform: 'Platform',
    solutions: 'Çözümler',
    pricing: 'Fiyatlandırma',
    resources: 'Kaynaklar',
    signIn: 'Giriş Yap',
    demo: 'Demo Planla',
    home: 'Core',
  },
  hero: [
    {
      eyebrow: 'Kurumsal Hafıza',
      title: 'Her etkileşimden',
      accent: 'öğrenen CRM',
      body: 'Saule; müşteri görüşmelerini iç görülere, kılavuzlara ve aksiyonlara dönüştürür.',
      kind: 'memory',
    },
    {
      eyebrow: 'Yaşayan Saule Asistan',
      title: 'İşinizi tanıyan',
      accent: 'yaşayan asistan',
      body: 'Soruları yanıtlar, sizin için not alır, şirketinizi öğrenir ve onayınızla CRM aksiyonlarını gerçekleştirir.',
      kind: 'assistant',
    },
    {
      eyebrow: 'SLA ve Gelir Koruması',
      title: 'Riski müşteriden',
      accent: 'önce fark edin',
      body: 'SLA ihlallerini, geciken işleri ve gelir risklerini Saule sizin için sürekli takip eder.',
      kind: 'risk',
    },
  ],
  productPanel: {
    title: 'Müşteri Hafızası Konsolu',
    sideNav: ['Gelen Kutusu', 'Talepler', 'Müşteriler', 'Hafıza', 'Aksiyonlar'],
    metrics: [
      { label: 'İçgörüler', value: '18' },
      { label: 'Örüntüler', value: '7' },
      { label: 'Aksiyonlar', value: '4' },
    ],
    patternLabel: 'Hafıza Örüntüsü',
    memory: 'Tekrar eden fiyat itirazı: KOBİ segmentinde yükseliyor',
    trend: 'yükseliyor',
    insightLabel: 'İçgörü',
    insight: 'Son 30 günde 18 etkileşimden 6 yeni içgörü',
    actionLabel: 'Aksiyon',
    action: 'Önerilen aksiyon: başlangıç süreci yanıt metnini güncelle',
    teamLabel: 'Ekip hafızası',
    team: 'Destek, satış ve başarı ekipleri aynı hafızayı kullanıyor',
    riskLabel: 'Risk sinyali',
    risk: 'Risk: çözülmeyen tekrar eden konu müşteri kaybı sinyaline dönüştü',
    loopSteps: ['Etkileşim', 'İçgörü', 'Hafıza', 'Aksiyon', 'Öğrenme'],
    recommendationsTitle: 'Önerilen sonraki adımlar',
    recommendations: [
      'Başlangıç vaadini güncelle',
      'Fiyat itirazı yanıt metni oluştur',
      'Müşteri başarı ekibini bilgilendir',
      'Müşteri kaybı sinyalini haftalık takip et',
    ],
  },
  problem: {
    eyebrow: 'Problem',
    title: 'Müşteri verisi birikiyor. Şirket öğrenmiyor.',
    copy: 'Talep kapanıyor, görüşme bitiyor, not sisteme giriliyor. Fakat aynı problem, aynı itiraz ve aynı müşteri kaybı sebebi tekrar tekrar ekibin önüne düşüyor.',
    points: [
      'Konuşmalar operasyon içinde kayboluyor.',
      'Takımlar aynı müşteri sinyalini farklı yerlerde görüyor.',
      'Rapor var, ama davranış değişikliği yok.',
    ],
  },
  loop: {
    eyebrow: 'Saule Döngüsü',
    title: 'Temastan içgörüye, içgörüden öğrenmeye',
    copy: 'Saule her müşteri temasını kalıcı bir öğrenme döngüsüne bağlar. Sadece geçmişi göstermez; hangi davranışın değişmesi gerektiğini de görünür kılar.',
    steps: ['Etkileşim', 'İçgörü', 'Hafıza', 'Uygulama planı / Yanıt metni / Aksiyon', 'Öğrenme'],
  },
  crmBody: {
    eyebrow: 'CRM gövdesi',
    title: 'Operasyonu yöneten ürün katmanı',
    copy: 'Saule, gelişmiş bir müşteri operasyonları platformunun ihtiyaç duyduğu temel CRM yüzeylerini tek, temiz ve ekip odaklı bir deneyimde toplar.',
    features: [
      { title: 'Çok Kanallı Gelen Kutusu', description: 'E-posta, WhatsApp, canlı sohbet, çağrı ve sosyal temasları tek akışta yönetin.', status: 'Yakında', icon: '✉️' },
      { title: 'Talep Yönetimi', description: 'Atama, öncelik, durum, iç not, hizmet seviyesi ve takip akışlarıyla destek operasyonunu olgunlaştırın.', status: 'Mevcut', icon: '🎫' },
      { title: 'Müşteriler', description: 'Müşteri geçmişini, etkileşimlerini, risklerini ve açık konularını tek profilde görün.', status: 'Mevcut', icon: '👤' },
      { title: 'Şirketler', description: 'Şirket bazlı temasları, hesap sağlığını ve tekrar eden örüntüleri yönetin.', status: 'Mevcut', icon: '🏢' },
      { title: 'Müşteri 360', description: 'Her müşteri için geçmiş, duygu durumu, açık aksiyon ve önerilen sonraki adımı görün.', status: 'Mevcut', icon: '🧭' },
      { title: 'Raporlar', description: 'Operasyon, gelir ve öğrenme metriklerini yönetim seviyesinde izleyin.', status: 'Yakında', icon: '📊' },
    ],
  },
  intelligence: {
    eyebrow: 'Öğrenen Zeka',
    title: "Saule'yi klasik CRM'den ayıran zeka katmanı",
    copy: 'Klasik CRM veriyi saklar. Saule veriden öğrenir; tekrar eden sinyalleri hafızaya, hafızayı uygulama planlarına ve aksiyonlara dönüştürür.',
    features: [
      { title: 'İçgörü Çıkarma', description: 'Müşteri temaslarından kategori, duygu, kanıt ve önerilen aksiyon çıkarır.', status: 'Mevcut', icon: '✨' },
      { title: 'Kurumsal Hafıza', description: 'Tekrar eden müşteri problemlerini kalıcı örüntülere dönüştürür.', status: 'Mevcut', icon: '🧠' },
      { title: 'Örüntü Tespiti', description: 'Müşteri kaybı, itiraz, destek sorunu ve ürün sürtünmelerinin yükselişini yakalar.', status: 'Mevcut', icon: '📈' },
      { title: 'Uygulama Planı Üretimi', description: 'Ekibin kullanacağı uygulama planlarını ve cevap stratejilerini hafızadan üretir.', status: 'Mevcut', icon: '📝' },
      { title: 'Gelir Zekası', description: 'Satış itirazları, kayıp fırsatlar ve gelir risklerini görünür kılar.', status: 'Mevcut', icon: '💸' },
      { title: 'Kapalı Döngü Öğrenme', description: 'Alınan aksiyonların problemi azaltıp azaltmadığını ölçer.', status: 'Yakında', icon: '🔁' },
    ],
  },
  memory: {
    eyebrow: 'Kurumsal Hafıza',
    title: 'Kurumunuzun müşteri hafızası',
    copy: 'Saule, tekrar eden müşteri itirazlarını, şikayetleri, müşteri kaybı sebeplerini, destek problemlerini, satış bariyerlerini ve kampanya geri bildirimlerini kalıcı kurumsal hafızaya dönüştürür.',
    signals: ['Satış itirazları', 'Müşteri kaybı sebepleri', 'Destek problemleri', 'Ürün sürtünmeleri', 'Kampanya geri bildirimleri', 'Müşteri başarı riskleri'],
  },
  useCases: {
    eyebrow: 'Kullanım alanları',
    title: 'İnsanı, öğrenmeyi ve gelişimi merkeze alan ekipler için',
    items: [
      { title: 'Müşteri Destek', description: 'Talep kapatmanın ötesine geçin; tekrar eden problemleri azaltın.', icon: '🎧' },
      { title: 'Satış', description: 'İtirazları, kayıp sebeplerini ve en etkili yanıt metinlerini görün.', icon: '🎯' },
      { title: 'Müşteri Başarısı', description: 'Müşteri kaybı risklerini ve hesap sağlığını kurumsal hafızayla takip edin.', icon: '🤝' },
      { title: 'Pazarlama', description: 'Kampanya geri bildirimlerini müşteri dili ve bariyerleriyle analiz edin.', icon: '📣' },
      { title: 'Ürün Ekipleri', description: 'Özellik taleplerini, hata bildirimlerini ve ürün sürtünmelerini tekrar sıklığına göre önceliklendirin.', icon: '🧩' },
      { title: 'Yönetim', description: 'Operasyonel gelişim ve gelir zekasını tek yönetim ritmine bağlayın.', icon: '💼' },
    ],
  },
  roadmap: {
    eyebrow: 'Ürün yolculuğu',
    title: 'Bugünden yarına öğrenen müşteri operasyonları platformu',
    current: ['Manuel CRM kayıtları', 'Müşteriler', 'Şirketler', 'Talepler', 'Görevler', 'Etkileşimler', 'Yapay zeka ile içgörü çıkarma', 'Hafıza örüntüleri', 'Uygulama planları', 'Yanıt metinleri', 'İyileştirme aksiyonları', 'Şirket 360', 'Müşteri 360 görünümü', 'Hizmet seviyesi takibi', 'Gelir Zekası'],
    coming: ['Yaşayan Saule Asistan', 'Rol bazlı kullanıcı deneyimi', 'Yönlendirmeli ilk kurulum', 'Gelir aksiyonu onay akışları', 'Operasyonel darboğaz analizi', 'Kapalı döngü öğrenme altyapısı'],
    planned: ['E-posta entegrasyonu', 'WhatsApp entegrasyonu', 'Web canlı destek', 'VoIP ve çağrı zekası', 'HubSpot entegrasyonu', 'Salesforce entegrasyonu', 'Slack entegrasyonu', 'API erişimi'],
  },
  trust: {
    eyebrow: 'Güven',
    title: 'Müşteri verisi için ciddi ve kontrollü mimari',
    copy: 'Saule, müşteri operasyonları verisinin hassasiyetini merkeze alır. Mimari çalışma alanı izolasyonu, rol bazlı erişim ve kurumsal hazırlık prensipleriyle gelişir.',
    items: ['Çalışma alanı izolasyonu', 'Rol bazlı erişim', 'Denetim kayıtları', "KVKK'ya hazır mimari", 'Güvenli CRM veri modeli', 'Kurumsal hazırlık', 'Yerel destek'],
  },
  pricingPreview: {
    eyebrow: 'Paketler',
    title: "Yapay zeka ayrı eklenti değil, Saule'nin kendisi",
    copy: 'Bütün Adaptive CRM ve yapay zeka özellikleri her pakette standarttır. Paketler ekip büyüklüğüne ve AI kullanım kredisine göre ölçeklenir.',
    note: 'Fiyatlar yıllık paket fiyatı baz alınarak listelenmiştir. Kullanılmayan krediler devreder. Kurumsal paket için entegrasyon ve başlangıç ihtiyaçlarına göre özel planlama yapılır.',
    plans: [
      { name: 'Başlangıç', audience: '1-5 Kullanıcı', price: '$2,400 / Yıl', description: 'Çekirdek ekipler için tüm platform özellikleri ve temel kredi hacmi.', features: ['Tüm CRM ve yapay zeka özellikleri', '5 kullanıcıya kadar erişim', '100.000 AI kullanım kredisi', 'Standart destek'], cta: 'Demo Planla' },
      { name: 'Büyüme', audience: '6-20 Kullanıcı', price: '$8,900 / Yıl', description: 'Büyüyen operasyonlar için genişletilmiş yıllık kredi ve artan kullanıcı kapasitesi.', features: ['Tüm CRM ve yapay zeka özellikleri', '20 kullanıcıya kadar erişim', '500.000 AI kullanım kredisi', 'Öncelikli destek'], cta: 'Büyüme Demosu Planla', highlighted: true },
      { name: 'Ölçek', audience: '21-50 Kullanıcı', price: '$21,900 / Yıl', description: 'Yüksek müşteri etkileşimi olan ekipler için devasa kredi havuzu.', features: ['Tüm CRM ve yapay zeka özellikleri', '50 kullanıcıya kadar erişim', '1.500.000 AI kullanım kredisi', 'Özel Müşteri Temsilcisi'], cta: 'Ölçek Demosu Planla' },
      { name: 'Kurumsal', audience: '50+ Kullanıcı', price: 'Özel', description: 'Sınırsız kullanıcı mimarisi, özel entegrasyonlar ve esnek kredi modelleri.', features: ['Sınırsız kullanıcı', 'Özel AI kullanım kredisi planı', 'Özel entegrasyonlar ve API', 'Kurumsal güvenlik ve destek'], cta: 'Satış Ekibiyle Görüş' },
    ],
  },
  finalCta: {
    title: 'Müşteri verisini kaydetmekten fazlasını yapın.',
    copy: 'Her görüşmeden öğrenen, hafıza kuran ve ekibinize gelişim aksiyonları üreten bir CRM deneyimine geçin.',
    crmCta: "Saule CRM'i İncele",
    coreCta: "Core'a dön",
  },
  pages: {
    crm: {
      eyebrow: 'Saule Adaptive CRM',
      title: 'Müşteri operasyonları için CRM gövdesi, gelişim için kurumsal hafıza',
      copy: 'Saule CRM; gelen kutusu, talep yönetimi, müşteri ve şirket kayıtları, Müşteri 360, uygulama planı, yanıt metni ve aksiyon katmanlarını aynı öğrenme döngüsünde birleştirir.',
      pillars: [
        { title: 'Operasyonel netlik', description: 'Talep, gelen kutusu, hizmet seviyesi ve görevlerle ekiplerin günlük işini düzenler.', icon: '📋' },
        { title: 'Müşteri bağlamı', description: 'Her müşteri ve şirket için geçmiş, risk, duygu durumu ve açık konuları bir araya getirir.', icon: '👥' },
        { title: 'Öğrenen hafıza', description: 'Etkileşimlerden örüntü çıkarır ve ekibin davranışını geliştiren aksiyonlar üretir.', icon: '🧠' },
      ],
      workflowTitle: 'Saule CRM çalışma akışı',
      workflow: ['Müşteri teması yakalanır', 'Talep veya etkileşim kaydına bağlanır', 'Yapay zeka içgörü çıkarır', 'Örüntü kurumsal hafızaya işlenir', 'Uygulama planı, yanıt metni veya aksiyon üretilir', 'Sonuçlar takip edilir'],
    },
    adaptiveAi: {
      eyebrow: 'Öğrenen Yapay Zeka',
      title: "Yapay zeka, Saule'de ayrı bir eklenti değil; ürünün kendisidir",
      copy: "Saule'nin zeka katmanı müşteri temaslarını okur, tekrar eden sinyalleri yakalar, ekipler için davranış önerileri üretir ve sonuçları izler.",
      layers: [
        { title: 'Çıkar', description: 'Konuşmalardan duygu, niyet, itiraz, kanıt ve önerilen aksiyon çıkarır.', icon: '✨' },
        { title: 'Grupla', description: 'Benzer müşteri sinyallerini örüntülerde toplar.', icon: '🕸️' },
        { title: 'Öner', description: 'Uygulama planı, yanıt metni, takip ve iyileştirme aksiyonları önerir.', icon: '🪄' },
        { title: 'Ölç', description: 'Aksiyon sonrası sinyalin azalıp azalmadığını izler.', icon: '📏' },
      ],
      noteTitle: 'Öğrenen yapı, bağlama göre gelişmek demektir',
      noteCopy: 'Saule genel bir sohbet botu gibi davranmaz. Kurumunuzun gerçek müşteri hafızasını kullanır ve önerilerini bu hafızanın içindeki örüntülere göre şekillendirir.',
    },
    companyMemory: {
      eyebrow: 'Kurumsal Hafıza',
      title: 'Talep kapanınca bilginin kaybolmadığı yeni CRM katmanı',
      copy: 'Kurumsal hafıza, müşteri konuşmalarındaki tekrar eden sinyalleri ekiplerin kullanabileceği kalıcı bilgiye dönüştürür.',
      signalsTitle: 'Saule hangi sinyalleri hafızaya alır?',
      signals: [
        { title: 'Tekrar eden itirazlar', description: 'Satış ve fiyat bariyerlerini segment bazında görün.', icon: '💬' },
        { title: 'Müşteri kaybı sebepleri', description: 'Kayıp müşterilerin ortak karar sebeplerini hafızaya alın.', icon: '⚠️' },
        { title: 'Destek sorunları', description: 'En sık tekrar eden sorunları ve çözüm kalitesini izleyin.', icon: '🎫' },
        { title: 'Ürün geri bildirimi', description: 'Özellik taleplerini, hata bildirimlerini ve sürtünme noktalarını kalıcı örüntüye dönüştürün.', icon: '🧩' },
      ],
      outcomeTitle: 'Sonuç',
      outcomes: ['Daha hızlı başlangıç süreci', 'Daha tutarlı destek', 'Daha güçlü satış yanıtları', 'Daha net ürün öncelikleri', 'Daha az tekrar eden problem'],
    },
    pricing: {
      eyebrow: 'Paketler',
      title: "Yapay zeka ayrı eklenti değil, Saule'nin kendisi",
      copy: 'Bütün Adaptive CRM ve yapay zeka özellikleri her pakette standarttır. Paketler ekip büyüklüğüne ve AI kullanım kredisine göre ölçeklenir.',
    },
    security: {
      eyebrow: 'Güvenlik ve KVKK',
      title: 'Müşteri verisi ciddi bir mimari ister',
      copy: 'Saule, müşteri konuşmalarının ticari ve kişisel hassasiyetini dikkate alarak çalışma alanı izolasyonu, rol bazlı erişim ve denetlenebilirlik prensipleriyle tasarlanır.',
      principles: [
        { title: 'Çalışma alanı izolasyonu', description: 'CRM verisi çalışma alanı sınırları içinde ayrıştırılır.', icon: '🧱' },
        { title: 'Rol bazlı erişim', description: 'Kullanıcı, ekip ve yetki modeli kurumsal kullanım için olgunlaştırılır.', icon: '🔐' },
        { title: 'Denetim kayıtları', description: 'Kritik aksiyonlar ve veri hareketleri izlenebilirlik için kayıt altına alınır.', icon: '📄' },
        { title: "KVKK'ya hazır yaklaşım", description: 'Veri minimizasyonu, erişim kontrolü ve silme süreçleri ürün yaklaşımına dahil edilir.', icon: '⚖️' },
      ],
      noteTitle: 'Dürüst statü',
      noteCopy: 'Saule kurumsal ihtiyaçları dikkate alan bir güvenlik mimarisiyle ilerler. Gelişmiş yetki, denetim ve entegrasyon katmanları ürün olgunlaştıkça daha da güçlendirilecektir.',
    },
    resource: {
      eyebrow: 'Kaynak',
      title: 'Adaptive CRM nedir?',
      copy: 'Adaptive CRM, müşteri verisini sadece saklayan değil, bu veriden öğrenerek şirket davranışını geliştiren CRM yaklaşımıdır.',
      sections: [
        { title: 'Klasik CRM ne yapar?', body: 'Klasik CRM müşteri kayıtlarını, satış fırsatlarını, talepleri ve iletişim geçmişini düzenler. Bu gereklidir fakat tek başına şirketin öğrenmesini garanti etmez.' },
        { title: 'Adaptive CRM neyi değiştirir?', body: 'Adaptive CRM her müşteri temasından içgörü çıkarır, tekrar eden sinyalleri kurumsal hafızaya alır ve ekiplerin kullanacağı uygulama planı, yanıt metni ve aksiyonlar üretir.' },
        { title: 'Neden şimdi?', body: 'Şirketler artık çok kanallı müşteri verisine sahip. Çağrı, WhatsApp, e-posta, canlı destek ve satış notları birbirinden kopuk kaldığında gerçek öğrenme oluşmaz.' },
        { title: 'Saule yaklaşımı', body: 'Saule, CRM gövdesini öğrenen yapay zeka ile birleştirir. Amaç sadece veriyi göstermek değil; müşteri operasyonlarının daha iyi çalışmasını sağlamaktır.' },
      ],
    },
    legal: {
      eyebrow: 'Hukuki Bilgilendirme',
      title: 'KVKK Aydınlatma Metni ve Gizlilik Politikası',
      copy: 'Bu sayfa business evreni altında eski sitenin bilgi mimarisini koruyan bir placeholder sürümdür.',
      lastUpdated: 'Son güncelleme: Haziran 2026',
      sections: [
        { title: '1. Veri Sorumlusu', body: 'Pool IQ Teknoloji ve Saule platformuna ilişkin hukuki bilgiler bu alanda sunulacaktır.' },
        { title: '2. İşlenen Veriler', body: 'Kişisel veriler, hesap verileri, kullanım verileri ve ürün içeriğiyle ilgili açıklamalar bu sayfada yer alacaktır.' },
        { title: '3. Haklarınız', body: "KVKK kapsamındaki erişim, düzeltme, silme ve itiraz haklarına ilişkin detaylar burada devam edecektir." },
      ],
      contactTitle: 'Veri Sorumlusu İletişim',
      contactBody: 'Pool IQ Teknoloji\ninfo@pooliq.tech\nSaule Platformu',
    },
    login: {
      eyebrow: 'Dummy Giriş',
      title: "Saule Business giriş ekranı burada yaşayacak",
      copy: 'İstediğin akış korunuyor: business evreninin kendi login sayfası var. Şimdilik bu ekran görsel placeholder olarak duruyor.',
      cardTitle: 'Giriş Yap',
      cardCopy: 'Backend bağlantısını sonra ekleyeceğiz. Şu anda yalnızca sayfa ve bilgi mimarisi yerinde.',
      fields: ['E-posta', 'Şifre'],
    },
    demo: {
      eyebrow: 'Dummy Demo',
      title: 'Demo planlama akışı için ayrılmış ekran',
      copy: 'Demo Planla butonları artık business/crm evreninde kendi sayfasına akıyor. Şimdilik bu alan placeholder.',
      cardTitle: 'Demo Planla',
      cardCopy: 'Buraya daha sonra form, takvim ya da yönlendirme akışı bağlayabiliriz.',
      bullets: ['Takvim entegrasyonu', 'Ekip bilgisi formu', 'İhtiyaç seçimi', 'Satış yönlendirmesi'],
    },
  },
};

const enCopy: Copy = {
  nav: {
    product: 'Product',
    platform: 'Platform',
    solutions: 'Solutions',
    pricing: 'Pricing',
    resources: 'Resources',
    signIn: 'Sign In',
    demo: 'Book Demo',
    home: 'Core',
  },
  hero: [
    {
      eyebrow: 'Company Memory',
      title: 'A CRM that learns',
      accent: 'from every interaction',
      body: 'Saule turns customer conversations into insights, playbooks and actions.',
      kind: 'memory',
    },
    {
      eyebrow: 'Living Saule Assistant',
      title: 'A living assistant that',
      accent: 'knows your business',
      body: 'Answers questions, takes notes, learns your company and performs CRM actions with your approval.',
      kind: 'assistant',
    },
    {
      eyebrow: 'SLA and Revenue Protection',
      title: 'See the risk before',
      accent: 'your customer does',
      body: 'Saule continuously watches SLA breaches, overdue work and revenue risk for your team.',
      kind: 'risk',
    },
  ],
  productPanel: {
    title: 'Customer Memory Console',
    sideNav: ['Inbox', 'Tickets', 'Customers', 'Memory', 'Actions'],
    metrics: [
      { label: 'Insights', value: '18' },
      { label: 'Patterns', value: '7' },
      { label: 'Actions', value: '4' },
    ],
    patternLabel: 'Memory Pattern',
    memory: 'Repeated pricing objection: rising in SMB segment',
    trend: 'rising',
    insightLabel: 'Insight',
    insight: '6 new insights from 18 interactions in the last 30 days',
    actionLabel: 'Action',
    action: 'Suggested action: update the onboarding response script',
    teamLabel: 'Team memory',
    team: 'Support, sales and success teams work from the same memory',
    riskLabel: 'Risk signal',
    risk: 'Risk: unresolved recurring issue has become a churn signal',
    loopSteps: ['Interaction', 'Insight', 'Memory', 'Action', 'Learning'],
    recommendationsTitle: 'Recommended next steps',
    recommendations: [
      'Update the onboarding promise',
      'Create a pricing objection response',
      'Inform the customer success team',
      'Track the churn signal weekly',
    ],
  },
  problem: {
    eyebrow: 'Problem',
    title: 'Customer data accumulates. The company does not learn.',
    copy: 'Tickets close, calls end and notes get entered into the system. But the same issue, the same objection and the same churn reason keep returning to the team.',
    points: [
      'Conversations disappear inside operations.',
      'Teams see the same customer signal in different places.',
      'There are reports, but no behavior change.',
    ],
  },
  loop: {
    eyebrow: 'Saule Loop',
    title: 'From contact to insight, from insight to learning',
    copy: 'Saule ties every customer interaction into a lasting learning loop. It does not only show the past; it makes the needed behavior change visible.',
    steps: ['Interaction', 'Insight', 'Memory', 'Plan / Script / Action', 'Learning'],
  },
  crmBody: {
    eyebrow: 'CRM foundation',
    title: 'The product layer that runs the operation',
    copy: 'Saule brings the core CRM surfaces that advanced customer operations need into one clear, team-centered experience.',
    features: [
      { title: 'Omnichannel Inbox', description: 'Manage email, WhatsApp, live chat, calls, and social touches in a single stream.', status: 'Yakında', icon: '✉️' },
      { title: 'Ticket Management', description: 'Mature support operations with assignment, priority, status, internal notes, SLA, and follow-ups.', status: 'Mevcut', icon: '🎫' },
      { title: 'Customers', description: 'See customer history, interactions, risks, and open issues in a single profile.', status: 'Mevcut', icon: '👤' },
      { title: 'Companies', description: 'Manage company-based contacts, account health, and recurring patterns.', status: 'Mevcut', icon: '🏢' },
      { title: 'Customer 360', description: 'See history, sentiment, open actions, and recommended next steps for every customer.', status: 'Mevcut', icon: '🧭' },
      { title: 'Reports', description: 'Monitor operational, revenue, and learning metrics at the management level.', status: 'Yakında', icon: '📊' },
    ],
  },
  intelligence: {
    eyebrow: 'Adaptive Intelligence',
    title: 'The intelligence layer that makes Saule different from a classic CRM',
    copy: 'A classic CRM stores data. Saule learns from it; turning recurring signals into memory, plans and actions.',
    features: [
      { title: 'Insight Extraction', description: 'Extracts category, sentiment, evidence, and suggested actions from customer contacts.', status: 'Mevcut', icon: '✨' },
      { title: 'Company Memory', description: 'Turns recurring customer issues into permanent patterns.', status: 'Mevcut', icon: '🧠' },
      { title: 'Pattern Detection', description: 'Catches rise of churn, objections, support issues, and product friction.', status: 'Mevcut', icon: '📈' },
      { title: 'Playbook Generation', description: 'Generates playbooks and reply strategies from memory for the team to use.', status: 'Mevcut', icon: '📝' },
      { title: 'Revenue Intelligence', description: 'Makes sales objections, lost opportunities, and revenue risks visible.', status: 'Mevcut', icon: '💸' },
      { title: 'Closed-Loop Learning', description: 'Measures if taken actions successfully reduce the issues.', status: 'Yakında', icon: '🔁' },
    ],
  },
  memory: {
    eyebrow: 'Company Memory',
    title: 'Your organization’s customer memory',
    copy: 'Saule turns recurring objections, complaints, churn reasons, support issues, sales barriers and campaign feedback into durable company memory.',
    signals: ['Sales objections', 'Churn reasons', 'Support issues', 'Product friction', 'Campaign feedback', 'Customer success risks'],
  },
  useCases: {
    eyebrow: 'Use cases',
    title: 'For teams centered on people, learning and improvement',
    items: [
      { title: 'Customer Support', description: 'Go beyond closing tickets; reduce recurring issues.', icon: '🎧' },
      { title: 'Sales', description: 'See objections, loss reasons and the strongest response scripts.', icon: '🎯' },
      { title: 'Customer Success', description: 'Track churn risk and account health through company memory.', icon: '🤝' },
      { title: 'Marketing', description: 'Analyze campaign feedback through customer language and barriers.', icon: '📣' },
      { title: 'Product Teams', description: 'Prioritize feature requests, bugs and friction by recurrence.', icon: '🧩' },
      { title: 'Leadership', description: 'Tie operational improvement and revenue intelligence into one rhythm.', icon: '💼' },
    ],
  },
  roadmap: {
    eyebrow: 'Product journey',
    title: 'A customer operations platform that learns, from today into tomorrow',
    current: ['Manual CRM records', 'Customers', 'Companies', 'Tickets', 'Tasks', 'Interactions', 'AI insight extraction', 'Memory patterns', 'Playbooks', 'Scripts', 'Improvement actions', 'Company 360', 'Customer 360 view', 'SLA tracking', 'Revenue Intelligence'],
    coming: ['Living Saule Assistant', 'Role-based UX', 'Guided onboarding', 'Revenue action approvals', 'Operational bottleneck analysis', 'Closed-loop learning infrastructure'],
    planned: ['Email integration', 'WhatsApp integration', 'Web live chat', 'VoIP and call intelligence', 'HubSpot integration', 'Salesforce integration', 'Slack integration', 'API access'],
  },
  trust: {
    eyebrow: 'Trust',
    title: 'A serious and controlled architecture for customer data',
    copy: 'Saule treats customer operations data as sensitive. The architecture grows with workspace isolation, role-based access and enterprise readiness.',
    items: ['Workspace isolation', 'Role-based access', 'Audit logs', 'Privacy-ready architecture', 'Secure CRM data model', 'Enterprise readiness', 'Local support'],
  },
  pricingPreview: {
    eyebrow: 'Plans',
    title: 'AI is not an add-on. It is part of Saule itself.',
    copy: 'All Adaptive CRM and AI capabilities are standard in every plan. Plans scale by team size and AI credit usage.',
    note: 'Prices are shown as annual package prices. Unused credits roll over. Enterprise plans are shaped around integrations and onboarding needs.',
    plans: [
      { name: 'Starter', audience: '1-5 Users', price: '$2,400 / Year', description: 'Core platform features and baseline credit volume for early teams.', features: ['All CRM and AI capabilities', 'Up to 5 users', '100,000 AI credits', 'Standard support'], cta: 'Book Demo' },
      { name: 'Growth', audience: '6-20 Users', price: '$8,900 / Year', description: 'Expanded annual credits and user capacity for growing operations.', features: ['All CRM and AI capabilities', 'Up to 20 users', '500,000 AI credits', 'Priority support'], cta: 'Book Growth Demo', highlighted: true },
      { name: 'Scale', audience: '21-50 Users', price: '$21,900 / Year', description: 'A large credit pool for high-touch customer teams.', features: ['All CRM and AI capabilities', 'Up to 50 users', '1,500,000 AI credits', 'Dedicated account support'], cta: 'Book Scale Demo' },
      { name: 'Enterprise', audience: '50+ Users', price: 'Custom', description: 'Unlimited-user architecture, custom integrations and flexible credit models.', features: ['Unlimited users', 'Custom AI credit plan', 'Custom integrations and API', 'Enterprise security and support'], cta: 'Talk to Sales' },
    ],
  },
  finalCta: {
    title: 'Do more than store customer data.',
    copy: 'Move to a CRM experience that learns from every conversation, builds memory and creates improvement actions for your team.',
    crmCta: 'Explore Saule CRM',
    coreCta: 'Back to Core',
  },
  pages: {
    crm: {
      eyebrow: 'Saule Adaptive CRM',
      title: 'A CRM foundation for customer operations, and company memory for improvement',
      copy: 'Saule CRM brings inbox, ticketing, customer and company records, Customer 360, playbooks, scripts and actions into one learning loop.',
      pillars: [
        { title: 'Operational clarity', description: "Organizes teams' daily work with tickets, inbox, service levels, and tasks.", icon: '📋' },
        { title: 'Customer context', description: 'Brings together history, risk, sentiment, and open topics for every customer and company.', icon: '👥' },
        { title: 'Learning memory', description: 'Extracts patterns from interactions and generates actions that improve team behavior.', icon: '🧠' },
      ],
      workflowTitle: 'Saule CRM workflow',
      workflow: ['Customer contact is captured', 'It is attached to a ticket or interaction record', 'AI extracts insight', 'The pattern is written into company memory', 'A plan, script or action is generated', 'Results are followed up'],
    },
    adaptiveAi: {
      eyebrow: 'Adaptive AI',
      title: 'In Saule, AI is not an add-on; it is the product itself',
      copy: 'Saule’s intelligence layer reads customer interactions, catches recurring signals, recommends team behaviors and follows outcomes.',
      layers: [
        { title: 'Extract', description: 'Extracts sentiment, intent, objection, evidence, and suggested actions from conversations.', icon: '✨' },
        { title: 'Group', description: 'Groups similar customer signals into patterns.', icon: '🕸' },
        { title: 'Recommend', description: 'Suggests playbooks, response scripts, follow-ups, and improvement actions.', icon: '🪄' },
        { title: 'Measure', description: 'Monitors if the signal decreases after the action is taken.', icon: '📏' },
      ],
      noteTitle: 'A learning system adapts through context',
      noteCopy: 'Saule does not behave like a generic chatbot. It uses your real customer memory and shapes suggestions around patterns inside that memory.',
    },
    companyMemory: {
      eyebrow: 'Company Memory',
      title: 'A new CRM layer where knowledge does not disappear when the ticket closes',
      copy: 'Company memory turns recurring signals in customer conversations into durable knowledge teams can actually use.',
      signalsTitle: 'Which signals does Saule store in memory?',
      signals: [
        { title: 'Recurring objections', description: 'See sales and pricing barriers by segment.', icon: '💬' },
        { title: 'Churn reasons', description: 'Store common decision reasons of lost customers in memory.', icon: '⚠️' },
        { title: 'Support issues', description: 'Monitor the most frequent issues and solution quality.', icon: '🎫' },
        { title: 'Product feedback', description: 'Turn feature requests, bug reports, and friction points into permanent patterns.', icon: '🧩' },
      ],
      outcomeTitle: 'Outcome',
      outcomes: ['Faster onboarding', 'More consistent support', 'Stronger sales replies', 'Clearer product priorities', 'Fewer repeated issues'],
    },
    pricing: {
      eyebrow: 'Plans',
      title: 'AI is not an add-on. It is part of Saule itself.',
      copy: 'All Adaptive CRM and AI capabilities are standard in every package. Plans scale with team size and AI credit usage.',
    },
    security: {
      eyebrow: 'Security & Privacy',
      title: 'Customer data requires a serious architecture',
      copy: 'Saule is designed around workspace isolation, role-based access and auditability, with the commercial and personal sensitivity of customer conversations in mind.',
      principles: [
        { title: 'Workspace isolation', description: 'CRM data is segregated within workspace boundaries.', icon: '🧱' },
        { title: 'Role-based access', description: 'User, team, and permission models are matured for enterprise use.', icon: '🔐' },
        { title: 'Audit logs', description: 'Critical actions and data movements are logged for traceability.', icon: '📄' },
        { title: 'Privacy-ready approach', description: 'Data minimization, access control, and deletion processes are embedded in the product.', icon: '⚖️' },
      ],
      noteTitle: 'Honest status',
      noteCopy: 'Saule is evolving with an enterprise-aware security architecture. Advanced permissions, audits and integrations will keep getting stronger as the product matures.',
    },
    resource: {
      eyebrow: 'Resource',
      title: 'What is Adaptive CRM?',
      copy: 'Adaptive CRM is an approach that does not just store customer data, but learns from it to improve company behavior.',
      sections: [
        { title: 'What does classic CRM do?', body: 'Classic CRM organizes customer records, sales opportunities, tickets and communication history. That matters, but does not guarantee learning on its own.' },
        { title: 'What changes with Adaptive CRM?', body: 'Adaptive CRM extracts insight from every contact, stores recurring signals in company memory and generates plans, scripts and actions teams can use.' },
        { title: 'Why now?', body: 'Companies now have multi-channel customer data. When calls, WhatsApp, email, live support and sales notes stay fragmented, real learning does not emerge.' },
        { title: 'The Saule approach', body: 'Saule combines the CRM foundation with adaptive intelligence. The goal is not only to display data, but to make customer operations work better.' },
      ],
    },
    legal: {
      eyebrow: 'Legal',
      title: 'Privacy Notice and Policy',
      copy: 'This page is a placeholder version under the business universe, preserving the old site’s information architecture.',
      lastUpdated: 'Last updated: June 2026',
      sections: [
        { title: '1. Data Controller', body: 'Hukuki bilgiler bu alanda sunulacaktır.' },
        { title: '2. Processed Data', body: 'Kişisel veriler, hesap verileri ve kullanım verileri bu sayfada yer alacaktır.' },
        { title: '3. Your Rights', body: 'KVKK kapsamındaki haklarınıza ilişkin detaylar burada devam edecektir.' },
      ],
      contactTitle: 'Data Controller Contact',
      contactBody: 'Pool IQ Technology\ninfo@pooliq.tech\nSaule Platform',
    },
    login: {
      eyebrow: 'Sign In',
      title: 'The Saule Business sign-in screen will live here',
      copy: 'The flow is preserved: the business universe has its own sign-in page. For now this is a visual placeholder.',
      cardTitle: 'Sign In',
      cardCopy: 'We can connect the real backend later. Right now the page and information architecture are in place.',
      fields: ['Email', 'Password'],
    },
    demo: {
      eyebrow: 'Book Demo',
      title: 'Reserved screen for the demo booking flow',
      copy: 'Demo buttons now route inside the business/crm universe. For now this area is a placeholder.',
      cardTitle: 'Book Demo',
      cardCopy: 'We can later connect a form, calendar or routing flow here.',
      bullets: ['Calendar integration', 'Team information form', 'Needs selection', 'Sales routing'],
    },
  },
};

const ruCopy: Copy = {
  ...enCopy,
  nav: {
    product: 'Продукт',
    platform: 'Платформа',
    solutions: 'Решения',
    pricing: 'Тарифы',
    resources: 'Ресурсы',
    signIn: 'Вход',
    demo: 'Демо',
    home: 'Core',
  },
  hero: [
    {
      eyebrow: 'Память компании',
      title: 'CRM, который учится',
      accent: 'на каждом контакте',
      body: 'Saule превращает разговоры с клиентами в инсайты, сценарии и действия.',
      kind: 'memory',
    },
    {
      eyebrow: 'Живой ассистент Saule',
      title: 'Ассистент, который',
      accent: 'знает ваш бизнес',
      body: 'Отвечает на вопросы, сохраняет заметки, изучает вашу компанию и выполняет CRM-действия с вашим одобрением.',
      kind: 'assistant',
    },
    {
      eyebrow: 'SLA и защита выручки',
      title: 'Замечайте риск',
      accent: 'раньше клиента',
      body: 'Saule постоянно отслеживает нарушения SLA, просроченные задачи и риски для выручки.',
      kind: 'risk',
    },
  ],
  productPanel: {
    title: 'Панель Памяти Клиентов',
    sideNav: ['Входящие', 'Тикеты', 'Клиенты', 'Память', 'Действия'],
    metrics: [
      { label: 'Инсайты', value: '18' },
      { label: 'Шаблоны', value: '7' },
      { label: 'Действия', value: '4' },
    ],
    patternLabel: 'Шаблон памяти',
    memory: 'Повторяющееся возражение по цене: рост в сегменте малого бизнеса',
    trend: 'растет',
    insightLabel: 'Инсайт',
    insight: '6 новых инсайтов из 18 контактов за последние 30 дней',
    actionLabel: 'Действие',
    action: 'Рекомендуемое действие: обновить скрипт приветственного ответа',
    teamLabel: 'Память команды',
    team: 'Служба поддержки, продаж и работы с клиентами используют общую память',
    riskLabel: 'Сигнал риска',
    risk: 'Риск: нерешенная повторяющаяся проблема стала сигналом оттока',
    loopSteps: ['Контакт', 'Инсайт', 'Память', 'Действие', 'Обучение'],
    recommendationsTitle: 'Рекомендуемые следующие шаги',
    recommendations: [
      'Обновить приветственное обещание',
      'Создать ответ на возражение по цене',
      'Информировать команду успеха клиентов',
      'Еженедельно отслеживать сигнал оттока',
    ],
  },
  problem: {
    eyebrow: 'Проблема',
    title: 'Данные накапливаются. Компания не учится.',
    copy: 'Тикет закрывается, звонок завершается, заметки вносятся в базу. Но одна и та же проблема, возражение и причина ухода клиента возвращаются к команде снова и снова.',
    points: [
      'Разговоры теряются внутри рутинных операций.',
      'Команды видят один и тот же клиентский сигнал в разных местах.',
      'Отчеты есть, но поведение не меняется.',
    ],
  },
  loop: {
    eyebrow: 'Цикл Saule',
    title: 'От контакта к инсайту, от инсайта к обучению',
    copy: 'Saule объединяет каждый контакт с клиентом в непрерывный цикл обучения. Показывает не просто историю, а изменения поведения.',
    steps: ['Контакт', 'Инсайт', 'Память', 'План / Скрипт / Действие', 'Обучение'],
  },
  crmBody: {
    eyebrow: 'Основа CRM',
    title: 'Продуктовый слой, управляющий операциями',
    copy: 'Saule собирает ключевые поверхности CRM, необходимые для развитых клиентских операций, в единый удобный опыт.',
    features: [
      { title: 'Omnichannel Входящие', description: 'Управляйте почтой, WhatsApp, живым чатом, звонками и соцсетями в одном потоке.', status: 'Yakında', icon: '✉️' },
      { title: 'Управление Тикетами', description: 'Зрелая поддержка с назначением, приоритетом, статусом, внутренними заметками, SLA и контролем.', status: 'Mevcut', icon: '🎫' },
      { title: 'Клиенты', description: 'Просматривайте историю клиентов, взаимодействия, риски и открытые вопросы в едином профиле.', status: 'Mevcut', icon: '👤' },
      { title: 'Компании', description: 'Управляйте контактами компаний, здоровьем аккаунтов и повторяющимися шаблонами.', status: 'Mevcut', icon: '🏢' },
      { title: 'Клиент 360', description: 'Просматривайте историю, настроение, открытые действия и рекомендуемые шаги для каждого клиента.', status: 'Mevcut', icon: '🧭' },
      { title: 'Отчеты', description: 'Отслеживайте операционные, доходные и учебные показатели на уровне руководства.', status: 'Yakında', icon: '📊' },
    ],
  },
  intelligence: {
    eyebrow: 'Адаптивный ИИ',
    title: 'Интеллектуальный слой, отличающий Saule от классических CRM',
    copy: 'Классическая CRM хранит данные. Saule учится на них; превращая повторяющиеся сигналы в память, планы и действия.',
    features: [
      { title: 'Извлечение Инсайтов', description: 'Извлекает категорию, настроение, доказательства и рекомендуемые действия из контактов с клиентами.', status: 'Mevcut', icon: '✨' },
      { title: 'Память Компании', description: 'Превращает повторяющиеся проблемы клиентов в постоянные шаблоны.', status: 'Mevcut', icon: '🧠' },
      { title: 'Определение Шаблонов', description: 'Отслеживает рост оттока, возражений, проблем поддержки и трений с продуктом.', status: 'Mevcut', icon: '📈' },
      { title: 'Создание Сценариев', description: 'Генерирует плейбуки и стратегии ответов из памяти для использования командой.', status: 'Mevcut', icon: '📝' },
      { title: 'Анализ Выручки', description: 'Визуализирует возражения по продажам, упущенные возможности и риски для выручки.', status: 'Mevcut', icon: '💸' },
      { title: 'Замкнутый Цикл Обучения', description: 'Оценивает, снижают ли принятые действия остроту проблемы.', status: 'Yakında', icon: '🔁' },
    ],
  },
  memory: {
    eyebrow: 'Память Компании',
    title: 'Память о клиентах вашей организации',
    copy: 'Saule превращает повторяющиеся возражения, жалобы, причины оттока, проблемы поддержки и обратную связь в долгосрочную память компании.',
    signals: ['Возражения по продажам', 'Причины оттока', 'Проблемы поддержки', 'Трения с продуктом', 'Обратная связь', 'Риски успеха клиентов'],
  },
  useCases: {
    eyebrow: 'Применение',
    title: 'Для команд, сфокусированных на людях, обучении и улучшении',
    items: [
      { title: 'Служба поддержки', description: 'Выходите за рамки закрытия тикетов; сокращайте повторяющиеся проблемы.', icon: '🎧' },
      { title: 'Продажи', description: 'Видьте возражения, причины потерь и лучшие скрипты ответов.', icon: '🎯' },
      { title: 'Успех клиентов', description: 'Отслеживайте риск оттока и здоровье аккаунтов через память компании.', icon: '🤝' },
      { title: 'Маркетинг', description: 'Анализируйте отзывы о кампаниях через призму языка и барьеров клиентов.', icon: '📣' },
      { title: 'Продуктовые команды', description: 'Приоритезируйте запросы функций, баги и трения по их частоте.', icon: '🧩' },
      { title: 'Руководство', description: 'Связывайте операционные улучшения и аналитику выручки в единый ритм.', icon: '💼' },
    ],
  },
  roadmap: {
    eyebrow: 'Развитие продукта',
    title: 'Платформа клиентских операций, которая учится сегодня и завтра',
    current: ['Ручные записи CRM', 'Клиенты', 'Компании', 'Тикеты', 'Задачи', 'Взаимодействия', 'Извлечение инсайтов ИИ', 'Шаблоны памяти', 'Плейбуки', 'Скрипты', 'Действия по улучшению', 'Профиль Компании 360', 'Просмотр Клиента 360', 'Отслеживание SLA', 'Аналитика Выручки'],
    coming: ['Живой ассистент Saule', 'Ролевой интерфейс', 'Интерактивный онбординг', 'Одобрение финансовых действий', 'Анализ операционных узких мест', 'Инфраструктура закрытого цикла обучения'],
    planned: ['Интеграция с Email', 'Интеграция с WhatsApp', 'Живой чат на сайте', 'VoIP и аналитика звонков', 'Интеграция с HubSpot', 'Интеграция с Salesforce', 'Интеграция с Slack', 'Доступ к API'],
  },
  trust: {
    eyebrow: 'Доверие',
    title: 'Серьезная и контролируемая архитектура для данных клиентов',
    copy: 'Saule относится к данным клиентских операций как к чувствительным. Архитектура растет с изоляцией рабочих областей, доступом по ролям и готовностью к корпоративному использованию.',
    items: ['Изоляция рабочих областей', 'Доступ по ролям', 'Журналы аудита', 'Конфиденциальная архитектура', 'Безопасная модель данных CRM', 'Enterprise-готовность', 'Локальная поддержка'],
  },
  pricingPreview: {
    eyebrow: 'Тарифы',
    title: 'ИИ — это не дополнение. Это часть самого Saule.',
    copy: 'Все возможности Adaptive CRM и ИИ являются стандартными для каждого плана. Тарифы масштабируются по размеру команды и использованию кредитов.',
    note: 'Цены указаны за годовые пакеты. Неиспользованные кредиты переносятся. Корпоративные планы формируются под требования к интеграциям и онбордингу.',
    plans: [
      { name: 'Стартовый', audience: '1-5 Пользователей', price: '$2,400 / Год', description: 'Функции основной платформы и базовый объем кредитов для ранних команд.', features: ['Все возможности CRM и ИИ', 'До 5 пользователей', '100 000 ИИ-кредитов', 'Стандартная поддержка'], cta: 'Забронировать демо' },
      { name: 'Рост', audience: '6-20 Пользователей', price: '$8,900 / Год', description: 'Расширенные ежегодные кредиты и вместимость пользователей для растущих команд.', features: ['Все возможности CRM и ИИ', 'До 20 пользователей', '500 000 ИИ-кредитов', 'Приоритетная поддержка'], cta: 'Заказать Growth демо', highlighted: true },
      { name: 'Масштаб', audience: '21-50 Пользователей', price: '$21,900 / Year', description: 'Крупный пул кредитов для высокоактивных клиентских команд.', features: ['Все возможности CRM и ИИ', 'До 50 пользователей', '1 500 000 ИИ-кредитов', 'Выделенный менеджер поддержки'], cta: 'Заказать Scale демо' },
      { name: 'Корпоративный', audience: '50+ Пользователей', price: 'Индивидуально', description: 'Архитектура с неограниченным числом пользователей, кастомные интеграции и гибкие модели кредитов.', features: ['Неограниченно пользователей', 'Индивидуальный план ИИ-кредитов', 'Кастомные интеграции и API', 'Безопасность корпоративного класса'], cta: 'Связаться с отделом продаж' },
    ],
  },
  finalCta: {
    title: 'Делайте больше, чем просто хранить данные.',
    copy: 'Перейдите к CRM, который учится на каждом разговоре, строит память и создает улучшения для вашей команды.',
    crmCta: 'Изучить Saule CRM',
    coreCta: 'Назад в Core',
  },
  pages: {
    crm: {
      eyebrow: 'Saule Adaptive CRM',
      title: 'Основа CRM для клиентских операций и память компании для улучшений',
      copy: 'Saule CRM объединяет входящие, тикеты, записи клиентов и компаний, Клиент 360, плейбуки, скрипты и действия в единый цикл обучения.',
      pillars: [
        { title: 'Операционная ясность', description: 'Организует ежедневную работу команд с помощью тикетов, входящих, уровней обслуживания и задач.', icon: '📋' },
        { title: 'Контекст клиента', description: 'Объединяет историю, риски, настроение и открытые темы по каждому клиенту и компании.', icon: '👥' },
        { title: 'Обучающаяся память', description: 'Извлекает шаблоны из взаимодействий и создает действия, улучшающие работу команды.', icon: '🧠' },
      ],
      workflowTitle: 'Рабочий процесс Saule CRM',
      workflow: ['Клиентский контакт зафиксирован', 'Привязан к тикету или записи взаимодействия', 'ИИ извлекает инсайт', 'Шаблон записывается в память компании', 'Создается план, скрипт или действие', 'Результаты отслеживаются'],
    },
    adaptiveAi: {
      eyebrow: 'Адаптивный ИИ',
      title: 'В Saule искусственный интеллект — не аддон, а сам продукт',
      copy: 'Интеллектуальный слой Saule анализирует взаимодействия, улавливает повторяющиеся сигналы, рекомендует поведение команды и следит за результатами.',
      layers: [
        { title: 'Извлечение', description: 'Определяет настроение, намерения, возражения, доказательства и рекомендуемые действия из бесед.', icon: '✨' },
        { title: 'Группировка', description: 'Группирует похожие клиентские сигналы в шаблоны.', icon: '🕸' },
        { title: 'Рекомендация', description: 'Предлагает плейбуки, скрипты ответов, напоминания и действия по улучшению.', icon: '🪄' },
        { title: 'Измерение', description: 'Контролирует, снижается ли частота сигналов после предпринятого действия.', icon: '📏' },
      ],
      noteTitle: 'Обучающаяся система адаптируется через контекст',
      noteCopy: 'Saule не ведет себя как обычный чат-бот. Он использует реальную память о ваших клиентах и формирует предложения на основе шаблонов этой памяти.',
    },
    companyMemory: {
      eyebrow: 'Память Компании',
      title: 'Новый слой CRM, где знания не исчезают после закрытия тикета',
      copy: 'Память компании превращает повторяющиеся сигналы в клиентских беседах в устойчивые знания, которые реально могут использовать команды.',
      signalsTitle: 'Какие сигналы Saule сохраняет в памяти?',
      signals: [
        { title: 'Повторяющиеся возражения', description: 'Видьте барьеры продаж и ценообразования по сегментам.', icon: '💬' },
        { title: 'Причины оттока', description: 'Сохраняйте в памяти общие причины решений ушедших клиентов.', icon: '⚠️' },
        { title: 'Проблемы поддержки', description: 'Контролируйте наиболее частые вопросы и качество решений.', icon: '🎫' },
        { title: 'Отзывы о продукте', description: 'Превращайте запросы функций, отчеты о багах и точки трения в постоянные шаблоны.', icon: '🧩' },
      ],
      outcomeTitle: 'Результат',
      outcomes: ['Быстрый онбординг', 'Более стабильная поддержка', 'Убедительные ответы отдела продаж', 'Четкие приоритеты продукта', 'Меньше повторяющихся проблем'],
    },
    pricing: {
      eyebrow: 'Тарифы',
      title: 'ИИ — это не дополнение. Это часть самого Saule.',
      copy: 'Все возможности Adaptive CRM и ИИ являются стандартными для каждого пакета. Тарифы масштабируются по размеру команды и использованию кредитов.',
    },
    security: {
      eyebrow: 'Безопасность и Приватность',
      title: 'Клиентские данные требуют серьезной архитектуры',
      copy: 'Saule разработан с учетом коммерческой и личной конфиденциальности клиентских бесед на основе изоляции рабочих областей, доступа по ролям и аудита.',
      principles: [
        { title: 'Изоляция рабочих областей', description: 'Данные CRM разделены в границах рабочих областей.', icon: '🧱' },
        { title: 'Доступ по ролям', description: 'Модели пользователей, команд и разрешений доработаны для корпоративного использования.', icon: '🔐' },
        { title: 'Журналы аудита', description: 'Критические действия и перемещения данных логируются для прозрачности.', icon: '📄' },
        { title: 'Готовность к приватности', description: 'Процессы минимизации данных, контроля доступа и удаления встроены в продукт.', icon: '⚖️' },
      ],
      noteTitle: 'Честный статус',
      noteCopy: 'Saule развивается с корпоративной архитектурой безопасности. Расширенные разрешения, аудит и интеграции будут продолжать усиливаться по мере зрелости продукта.',
    },
    resource: {
      eyebrow: 'Ресурс',
      title: 'Что такое Adaptive CRM?',
      copy: 'Adaptive CRM — это подход, который не просто хранит клиентские данные, а учится на них для улучшения поведения компании.',
      sections: [
        { title: 'Что делает классическая CRM?', body: 'Классическая CRM упорядочивает записи клиентов, возможности продаж, тикеты и история коммуникаций. Это важно, но само по себе не гарантирует обучение.' },
        { title: 'Что меняется с Adaptive CRM?', body: 'Adaptive CRM извлекает инсайты из каждого контакта, сохраняет повторяющиеся сигналы в памяти компании и генерирует планы, сценарии и действия, которые могут использовать команды.' },
        { title: 'Почему сейчас?', body: 'Компании теперь имеют многоканальные данные о клиентах. Когда звонки, WhatsApp, почта, живая поддержка и заметки о продазах остаются разрозненными, реальное обучение не возникает.' },
        { title: 'Подход Saule', body: 'Saule сочетает основу CRM с адаптивным интеллектом. Цель состоит не только в отображении данных, но и в том, чтобы сделать клиентские операции более эффективными.' },
      ],
    },
    legal: {
      eyebrow: 'Юридическая информация',
      title: 'Уведомление и политика конфиденциальности',
      copy: 'Эта страница является плейсхолдером в бизнес-вселенной, сохраняя информационную архитектуру старого сайта.',
      lastUpdated: 'Последнее обновление: Июнь 2026',
      sections: [
        { title: '1. Контролер данных', body: 'Hukuki bilgiler bu alanda sunulacaktır.' },
        { title: '2. Обрабатываемые данные', body: 'Персональные данные, данные учетных записей и использования будут размещены на этой странице.' },
        { title: '3. Ваши права', body: 'Подробности о ваших правах в рамках законодательства о персональных данных будут продолжены здесь.' },
      ],
      contactTitle: 'Контакты контролера данных',
      contactBody: 'Pool IQ Technology\ninfo@pooliq.tech\nSaule Platform',
    },
    login: {
      eyebrow: 'Вход',
      title: 'Экран входа в Saule Business будет размещен здесь',
      copy: 'Поток сохранен: у бизнес-вселенной есть своя страница входа. На данный момент это визуальный плейсхолдер.',
      cardTitle: 'Вход',
      cardCopy: 'Мы сможем подключить реальный бэкенд позже. Сейчас готова страница и информационная архитектура.',
      fields: ['Email', 'Пароль'],
    },
    demo: {
      eyebrow: 'Заказ Демо',
      title: 'Зарезервированный экран для планирования демо',
      copy: 'Кнопки демо теперь ведут внутрь вселенной business/crm. Пока это плейсхолдер.',
      cardTitle: 'Забронировать демо',
      cardCopy: 'Позже мы сможем подключить сюда форму, календарь или поток перенаправления.',
      bullets: ['Интеграция календаря', 'Форма информации о команде', 'Выбор потребностей', 'Направление продаж'],
    },
  },
};

const pageSlugMap: Record<SitePage, string> = {
  home: '',
  crm: 'crm',
  'adaptive-ai': 'platform/adaptive-ai',
  'company-memory': 'features/company-memory',
  pricing: 'pricing',
  security: 'platform/security',
  resource: 'resources/adaptive-crm-nedir',
  legal: 'legal',
  login: 'login',
  demo: 'demo',
};

function getCopy(locale: string) {
  if (locale === 'en') return enCopy;
  if (locale === 'ru') return ruCopy;
  return trCopy;
}

function normalizeLocale(locale: string): LocaleCode {
  return locale === 'en' || locale === 'ru' ? locale : 'tr';
}

function hrefFor(locale: string, page: SitePage) {
  const base = `/${locale}/business/crm`;
  const slug = pageSlugMap[page];
  return slug ? `${base}/${slug}` : base;
}

function statusTone(status?: FeatureItem['status']) {
  if (status === 'Yakında') return 'border-[#f3d9a1] bg-[#fff4d8] text-[#855b05]';
  if (status === 'Planlandı') return 'border-[#d6dcea] bg-[#eef2f8] text-[#43546e]';
  return 'border-[#bfe3db] bg-[#eaf8f4] text-[#0f766e]';
}

function SectionHeader({
  eyebrow,
  title,
  copy,
  align = 'left',
}: {
  eyebrow: string;
  title: string;
  copy?: string;
  align?: 'left' | 'center';
}) {
  return (
    <div className={align === 'center' ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl'}>
      <p className="mb-3 text-xs font-black uppercase tracking-[0.16em] text-[#c97900]">{eyebrow}</p>
      <h2 className="text-balance text-3xl font-black tracking-tight text-[#101828] sm:text-4xl">{title}</h2>
      {copy ? <p className="mt-4 text-base leading-7 text-[#5b6472] sm:text-lg">{copy}</p> : null}
    </div>
  );
}

function FeatureGrid({ items, dark = false, locale }: { items: FeatureItem[]; dark?: boolean; locale: string }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <article
          key={item.title}
          className={`rounded-lg border p-5 ${dark ? 'border-white/12 bg-white/[0.04]' : 'border-[#e6e1d8] bg-white'} `}
        >
          <div className="mb-5 flex items-start justify-between gap-4">
            <div className="flex size-10 items-center justify-center rounded-md bg-[#fff3d6] text-lg">
              {item.icon ?? '•'}
            </div>
            {item.status ? (
              <span className={`rounded border px-2 py-1 text-[10px] font-black uppercase tracking-[0.11em] ${statusTone(item.status)}`}>
                {locale === 'tr' ? item.status : locale === 'ru' ? (item.status === 'Mevcut' ? 'Доступно' : item.status === 'Yakında' ? 'Скоро' : 'Запланировано') : (item.status === 'Mevcut' ? 'Available' : item.status === 'Yakında' ? 'Soon' : 'Planned')}
              </span>
            ) : null}
          </div>
          <h3 className={`text-base font-black tracking-tight ${dark ? 'text-white' : 'text-[#101828]'}`}>{item.title}</h3>
          <p className={`mt-2 text-sm leading-6 ${dark ? 'text-[#e8ddca]' : 'text-[#626b78]'}`}>{item.description}</p>
        </article>
      ))}
    </div>
  );
}

function PricingPreview({ copy, locale }: { copy: Copy; locale: string }) {
  return (
    <section className="bg-white px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeader eyebrow={copy.pricingPreview.eyebrow} title={copy.pricingPreview.title} copy={copy.pricingPreview.copy} align="center" />
        <div className="mt-10 grid gap-4 lg:grid-cols-4">
          {copy.pricingPreview.plans.map((plan) => (
            <article
              key={plan.name}
              className={`flex flex-col rounded-lg border p-5 ${plan.highlighted ? 'border-[#111827] bg-[#f7f8fb]' : 'border-[#e6e1d8] bg-white'}`}
            >
              <p className="text-xs font-black uppercase tracking-[0.12em] text-[#c97900]">{plan.audience}</p>
              <h3 className="mt-3 text-xl font-black text-[#101828]">{plan.name}</h3>
              <p className="mt-3 text-2xl font-black text-[#111827]">{plan.price}</p>
              <p className="mt-3 min-h-20 text-sm leading-6 text-[#626b78]">{plan.description}</p>
              <div className="mt-5 grow space-y-2">
                {plan.features.map((feature) => (
                  <p key={feature} className="flex items-center gap-2 text-sm font-semibold text-[#3f4756]">
                    <span className="text-[#c97900]">✓</span>
                    {feature}
                  </p>
                ))}
              </div>
              <Link
                href={hrefFor(locale, 'demo')}
                className={`mt-6 inline-flex h-10 w-full items-center justify-center rounded-md text-sm font-black transition-colors ${
                  plan.highlighted ? 'bg-[#111827] text-white hover:bg-[#0b1220]' : 'border border-[#d9d0c1] bg-white text-[#111827] hover:bg-[#fff3d6]'
                }`}
              >
                {plan.cta}
              </Link>
            </article>
          ))}
        </div>
        <p className="mx-auto mt-6 max-w-3xl text-center text-sm leading-6 text-[#626b78]">{copy.pricingPreview.note}</p>
      </div>
    </section>
  );
}

function FinalCta({ copy, locale }: { copy: Copy; locale: string }) {
  return (
    <section className="bg-[#111827] px-4 py-20 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl text-center">
        <p className="mb-4 text-xs font-black uppercase tracking-[0.16em] text-[#f4c35b]">Saule</p>
        <h2 className="text-balance text-4xl font-black tracking-tight sm:text-5xl">{copy.finalCta.title}</h2>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-[#f4e6ce]">{copy.finalCta.copy}</p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href={hrefFor(locale, 'demo')} className="inline-flex h-12 items-center rounded-md bg-white px-5 text-sm font-black text-[#111827] transition-colors hover:bg-[#fff5df]">
            {copy.nav.demo}
          </Link>
          <Link href={hrefFor(locale, 'crm')} className="inline-flex h-12 items-center rounded-md border border-white/22 px-5 text-sm font-black text-white transition-colors hover:bg-white/10">
            {copy.finalCta.crmCta}
          </Link>
        </div>
        <div className="mt-8">
          <Link href={`/${locale}`} className="text-sm font-bold text-[#f4e6ce] underline underline-offset-4 hover:text-white">
            {copy.finalCta.coreCta}
          </Link>
        </div>
      </div>
    </section>
  );
}

function ProductPanel({ copy }: { copy: Copy['productPanel'] }) {
  return (
    <div className="relative mx-auto mt-12 w-full max-w-6xl overflow-hidden rounded-lg border border-[#d9d0c1] bg-white shadow-[0_28px_80px_rgba(20,44,38,0.16)]">
      <div className="flex h-11 items-center justify-between border-b border-[#e8e2d8] bg-[#f7f8fb] px-4">
        <div className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-[#e45858]" />
          <span className="size-2.5 rounded-full bg-[#e4b458]" />
          <span className="size-2.5 rounded-full bg-[#4fb981]" />
        </div>
        <span className="text-xs font-black uppercase tracking-[0.16em] text-[#66756f]">{copy.title}</span>
        <span className="hidden min-w-16 text-right text-xs font-bold text-[#9a9288] sm:inline">Saule</span>
      </div>

      <div className="grid min-h-[430px] bg-[#fffdf8] lg:grid-cols-[240px_1fr_320px]">
        <aside className="hidden border-r border-[#e8e2d8] bg-[#f7f8fb] p-4 lg:block">
          <div className="mb-6 h-8 rounded bg-white" />
          {copy.sideNav.map((item, index) => (
            <div key={item} className={`mb-2 flex h-9 items-center gap-2 rounded-md px-3 text-xs font-black ${index === 3 ? 'bg-[#111827] text-white' : 'text-[#626b78]'}`}>
              <span className={`size-2 rounded-full ${index === 3 ? 'bg-[#f0b429]' : 'bg-[#cbd8d2]'}`} />
              {item}
            </div>
          ))}
        </aside>

        <main className="p-4 sm:p-6">
          <div className="mb-4 grid gap-3 sm:grid-cols-3">
            {copy.metrics.map((metric, index) => (
              <div key={metric.label} className="rounded-lg border border-[#e6e1d8] bg-white p-4">
                <p className="text-xs font-black uppercase tracking-[0.12em] text-[#9a9288]">{metric.label}</p>
                <p className={`mt-3 inline-flex rounded px-2 py-1 text-2xl font-black ${index === 0 ? 'bg-[#fff3d6] text-[#8a4f00]' : index === 1 ? 'bg-[#fff4d8] text-[#855b05]' : 'bg-[#eef2f8] text-[#43546e]'}`}>{metric.value}</p>
              </div>
            ))}
          </div>
          <div className="rounded-lg border border-[#e6e1d8] bg-white p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.12em] text-[#c97900]">{copy.patternLabel}</p>
                <h3 className="mt-1 text-lg font-black tracking-tight text-[#101828]">{copy.memory}</h3>
              </div>
              <span className="rounded border border-[#f3d9a1] bg-[#fff4d8] px-2 py-1 text-[10px] font-black uppercase tracking-[0.11em] text-[#855b05]">
                {copy.trend}
              </span>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <ConsoleLine title={copy.insightLabel} copy={copy.insight} />
              <ConsoleLine title={copy.actionLabel} copy={copy.action} />
              <ConsoleLine title={copy.teamLabel} copy={copy.team} />
              <ConsoleLine title={copy.riskLabel} copy={copy.risk} />
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-5">
            {copy.loopSteps.map((step, index) => (
              <div key={step} className="rounded-md border border-[#e6e1d8] bg-white p-3">
                <p className="mb-2 text-[10px] font-black uppercase tracking-[0.12em] text-[#9a9288]">0{index + 1}</p>
                <p className="text-xs font-black text-[#101828]">{step}</p>
              </div>
            ))}
          </div>
        </main>

        <aside className="border-t border-[#e8e2d8] bg-white p-4 lg:border-l lg:border-t-0">
          <p className="mb-3 text-xs font-black uppercase tracking-[0.12em] text-[#c97900]">{copy.recommendationsTitle}</p>
          {copy.recommendations.map((action, index) => (
            <div key={action} className="mb-3 flex items-start gap-3 rounded-md border border-[#e8e2d8] p-3">
              <span className="mt-0.5 flex size-5 items-center justify-center rounded bg-[#fff3d6] text-[10px] font-black text-[#8a4f00]">
                {index + 1}
              </span>
              <p className="text-sm font-bold leading-5 text-[#3f4756]">{action}</p>
            </div>
          ))}
        </aside>
      </div>
    </div>
  );
}

function ConsoleLine({ title, copy }: { title: string; copy: string }) {
  return (
    <div className="rounded-md border border-[#e8e2d8] bg-[#fffdf8] p-3">
      <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#9a9288]">{title}</p>
      <p className="mt-2 text-sm font-semibold leading-5 text-[#3f4756]">{copy}</p>
    </div>
  );
}

function StandardPageHero({
  locale,
  eyebrow,
  title,
  copy,
}: {
  locale: string;
  eyebrow: string;
  title: string;
  copy: string;
}) {
  return (
    <section className="relative overflow-hidden border-b border-[#e6e1d8] bg-[#fffdf8] px-4 py-20 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-[linear-gradient(#ebe7dd_1px,transparent_1px),linear-gradient(90deg,#ebe7dd_1px,transparent_1px)] bg-[size:44px_44px] opacity-35" />
      <div className="relative mx-auto max-w-7xl">
        <p className="mb-4 inline-flex rounded-md border border-[#f4cf87] bg-[#fff3d6] px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-[#8a4f00]">
          {eyebrow}
        </p>
        <h1 className="max-w-5xl text-balance text-5xl font-black tracking-tight text-[#101828] sm:text-6xl">{title}</h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-[#5b6472]">{copy}</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href={hrefFor(locale, 'demo')} className="inline-flex h-12 w-fit items-center rounded-md bg-[#111827] px-5 text-sm font-black text-white transition-colors hover:bg-[#0b1220]">
            Demo Planla
          </Link>
          <Link href={hrefFor(locale, 'home')} className="inline-flex h-12 w-fit items-center rounded-md border border-[#d9d0c1] bg-white px-5 text-sm font-black text-[#111827] transition-colors hover:bg-[#fff3d6]">
            Business Ana Sayfa
          </Link>
        </div>
      </div>
    </section>
  );
}

function HeroCarousel({ locale, copy }: { locale: string; copy: Copy }) {
  const slides = copy.hero;
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setActive((current) => (current + 1) % slides.length), 6500);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  const current = slides[active];

  return (
    <div className="relative min-h-[560px] overflow-hidden rounded-2xl border border-[#d9d0c1] bg-[#101828] shadow-[0_34px_90px_rgba(16,24,40,0.20)]">
      {current.kind === 'memory' ? (
        <>
          <Image src="/marketing/saule-human-hero-v1.png" alt="" fill priority sizes="100vw" className="object-cover object-[66%_center]" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(16,24,40,0.96)_0%,rgba(33,26,18,0.88)_36%,rgba(33,26,18,0.48)_58%,rgba(16,24,40,0.08)_100%)]" />
        </>
      ) : null}

      {current.kind === 'assistant' ? (
        <>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_40%,rgba(99,102,241,0.38),transparent_34%),linear-gradient(120deg,#0f172a_0%,#17152f_54%,#101828_100%)]" />
          <div className="absolute bottom-0 right-[5%] top-0 hidden w-[46%] lg:block">
            <Image src="/saule-avatar-v1.png" alt="" fill sizes="46vw" className="object-cover object-center opacity-95 [mask-image:linear-gradient(to_left,black_70%,transparent_100%)]" />
          </div>
          <div className="absolute right-[8%] top-[13%] hidden w-72 rounded-[26px] border border-white/15 bg-white/10 p-4 shadow-2xl backdrop-blur-xl xl:block">
            <div className="flex items-center gap-3">
              <div className="relative size-11 overflow-hidden rounded-full ring-2 ring-[#ffd15a]">
                <Image src="/saule-avatar-v1.png" alt="" fill className="object-cover" />
              </div>
              <div>
                <p className="text-sm font-black text-white">Saule</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-200">Dinliyor</p>
              </div>
            </div>
            <div className="mt-4 rounded-2xl rounded-tl-sm bg-white p-3 text-xs font-semibold leading-5 text-slate-700">
              Acme Corp şirketinde bir yenileme riski fark ettim. Bir takip eylemi hazırlamamı ister misiniz?
            </div>
            <div className="mt-3 flex items-center gap-2 text-[10px] font-bold text-amber-200">
              ✨ Bağlam duyarlı · Onayınız gerekiyor
            </div>
          </div>
        </>
      ) : null}

      {current.kind === 'risk' ? (
        <>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_45%,rgba(239,68,68,0.22),transparent_32%),linear-gradient(120deg,#0f172a_0%,#191827_52%,#231511_100%)]" />
          <div className="absolute right-[7%] top-1/2 hidden w-[39%] -translate-y-1/2 xl:block">
            <div className="rounded-[28px] border border-white/12 bg-white/[0.08] p-5 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Gelir Koruma Sinyali</p>
                  <p className="mt-1 text-lg font-black text-white">Acme Corp</p>
                </div>
                <div className="flex size-11 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-300">!</div>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3">
                {[
                  ['SLA İHLALİ', '1'],
                  ['GELİR RİSKİ', 'Yüksek'],
                  ['ACİL TAKİP', '3'],
                ].map(([label, value], i) => (
                  <div key={label} className={`rounded-2xl border p-3 ${i === 0 ? 'border-rose-400/25 bg-rose-500/10' : 'border-white/10 bg-white/5'}`}>
                    <p className="text-lg font-black text-white">{value}</p>
                    <p className="mt-2 text-[8px] font-black uppercase tracking-wider text-slate-400">{label}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4">
                <div className="flex items-center gap-2 text-xs font-black text-amber-200">✨ Saule fark etti</div>
                <p className="mt-2 text-xs leading-5 text-slate-200">Fiyatlandırma sürtünmesi ve açık bir SLA ihlali bu yenilemeyi riske atıyor. Saule bir yenileme riski tespit etti. Kurtarma planını inceleyin.</p>
                <div className="mt-3 inline-flex rounded-lg bg-[#ffd15a] px-3 py-2 text-[10px] font-black text-slate-900">Öneriyi incele</div>
              </div>
            </div>
          </div>
        </>
      ) : null}

      <div className="relative z-20 flex min-h-[560px] max-w-7xl flex-col justify-center px-6 py-14 sm:px-10 lg:px-16">
        <div className="max-w-3xl">
          <p className="mb-5 inline-flex rounded-md border border-[#f0bd4f]/45 bg-[#f0bd4f]/16 px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-[#ffd780]">{current.eyebrow}</p>
          <h1 className="text-balance text-5xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl">
            {current.title} <span className="text-[#ffd15a]">{current.accent}</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#f5ead8] sm:text-xl">{current.body}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href={hrefFor(locale, 'demo')} className="inline-flex h-12 w-fit items-center gap-2 rounded-md bg-[#f0b429] px-5 text-sm font-black text-[#111827] transition-colors hover:bg-[#ffd15a]">
              Demo Planla →
            </Link>
            <Link href={hrefFor(locale, 'adaptive-ai')} className="inline-flex h-12 w-fit items-center rounded-md border border-white/28 bg-white/10 px-5 text-sm font-black text-white backdrop-blur transition-colors hover:bg-white/18">
              Platformu İncele
            </Link>
          </div>
        </div>
      </div>

      <button type="button" onClick={() => setActive((active - 1 + slides.length) % slides.length)} className="absolute left-4 top-1/2 z-30 hidden -translate-y-1/2 rounded-full border border-white/15 bg-black/20 p-3 text-white/75 transition hover:bg-black/40 hover:text-white sm:block" aria-label="Previous slide">
        ‹
      </button>
      <button type="button" onClick={() => setActive((active + 1) % slides.length)} className="absolute right-4 top-1/2 z-30 hidden -translate-y-1/2 rounded-full border border-white/15 bg-black/20 p-3 text-white/75 transition hover:bg-black/40 hover:text-white sm:block" aria-label="Next slide">
        ›
      </button>

      <div className="absolute bottom-6 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2" role="tablist" aria-label="Select product highlight">
        {slides.map((slide, index) => (
          <button key={slide.kind} type="button" onClick={() => setActive(index)} className={`h-1.5 rounded-full transition-all ${active === index ? 'w-16 bg-[#ffd15a]' : 'w-7 bg-white/25 hover:bg-white/45'}`} aria-label={`Slide ${index + 1}`} />
        ))}
      </div>
    </div>
  );
}

function Header({ locale, page, copy }: { locale: string; page: SitePage; copy: Copy }) {
  const currentSlug = pageSlugMap[page];
  const localeLinks = useMemo(
    () => ['tr', 'en', 'ru'].map((lang) => ({ lang, href: currentSlug ? `/${lang}/business/crm/${currentSlug}` : `/${lang}/business/crm` })),
    [currentSlug],
  );

  return (
    <header className="sticky top-0 z-50 border-b border-[#e6e1d8] bg-[#fffdf8]/92 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-[1480px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href={hrefFor(locale, 'home')} className="flex items-center gap-2.5 animate-fade-in" aria-label="Saule home">
          <Image src="/saule-symbol.svg" alt="" width={36} height={36} priority />
          <div className="flex flex-col items-start leading-none">
            <span className="text-base font-black tracking-tight text-[#101828]">Saule</span>
            <span className="mt-0.5 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-gray-600 uppercase font-sans">
              Business
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 lg:flex">
          <Link href={hrefFor(locale, 'crm')} className="rounded-md px-3 py-2 text-sm font-semibold text-[#5b6472] transition-colors hover:bg-[#fff3d6] hover:text-[#101828]">{copy.nav.product}</Link>
          <Link href={hrefFor(locale, 'adaptive-ai')} className="rounded-md px-3 py-2 text-sm font-semibold text-[#5b6472] transition-colors hover:bg-[#fff3d6] hover:text-[#101828]">{copy.nav.platform}</Link>
          <Link href={`${hrefFor(locale, 'home')}#use-cases`} className="rounded-md px-3 py-2 text-sm font-semibold text-[#5b6472] transition-colors hover:bg-[#fff3d6] hover:text-[#101828]">{copy.nav.solutions}</Link>
          <Link href={hrefFor(locale, 'pricing')} className="rounded-md px-3 py-2 text-sm font-semibold text-[#5b6472] transition-colors hover:bg-[#fff3d6] hover:text-[#101828]">{copy.nav.pricing}</Link>
          <Link href={hrefFor(locale, 'resource')} className="rounded-md px-3 py-2 text-sm font-semibold text-[#5b6472] transition-colors hover:bg-[#fff3d6] hover:text-[#101828]">{copy.nav.resources}</Link>
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden items-center rounded-md border border-[#e6e1d8] bg-white p-1 sm:flex">
            {localeLinks.map((item) => (
              <Link
                key={item.lang}
                href={item.href}
                className={`min-w-8 rounded px-2 py-1 text-center text-xs font-black uppercase transition-colors ${item.lang === normalizeLocale(locale) ? 'bg-[#111827] text-white' : 'text-[#5f6d68] hover:bg-[#fff3d6] hover:text-[#101828]'}`}
                hrefLang={item.lang}
              >
                {item.lang}
              </Link>
            ))}
          </div>
          <Link href={hrefFor(locale, 'login')} className="hidden rounded-md px-3 py-2 text-sm font-bold text-[#5b6472] transition-colors hover:bg-[#fff3d6] hover:text-[#101828] sm:inline-flex">
            {copy.nav.signIn}
          </Link>
          <Link href={hrefFor(locale, 'demo')} className="inline-flex h-12 items-center gap-2 rounded-md bg-[#111827] px-5 text-sm font-black text-white shadow-sm transition-colors hover:bg-[#0b1220]">
            {copy.nav.demo} →
          </Link>
        </div>
      </div>
    </header>
  );
}

function Footer({ locale }: { locale: string }) {
  const f = footerDicts[locale] ?? footerDicts['en'];

  return (
    <footer className="border-t border-[#e6e1d8] bg-[#101828] text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:px-8">
        <div>
          <div className="mb-4 flex items-center gap-2.5">
            <Image src="/saule-symbol.svg" alt="" width={28} height={28} />
            <span className="text-base font-black tracking-tight">Saule</span>
          </div>
          <p className="max-w-md text-sm leading-6 text-[#e8ddca]">{f.description}</p>
        </div>
        <FooterGroup title={f.product} links={[{ label: f.adaptiveCrm, href: hrefFor(locale, 'crm') }, { label: f.companyMemory, href: hrefFor(locale, 'company-memory') }]} />
        <FooterGroup title={f.platform} links={[{ label: f.adaptiveAi, href: hrefFor(locale, 'adaptive-ai') }, { label: f.security, href: hrefFor(locale, 'security') }]} />
        <FooterGroup title={f.company} links={[{ label: f.resources, href: hrefFor(locale, 'resource') }, { label: f.pricing, href: hrefFor(locale, 'pricing') }, { label: f.bookDemo, href: hrefFor(locale, 'demo') }, { label: f.signIn, href: hrefFor(locale, 'login') }]} />
      </div>
      <div className="border-t border-white/10 px-4 py-5">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-xs font-semibold text-[#c8bda8]">{f.rights}</p>
          <div className="flex items-center gap-4">
            <Link href={hrefFor(locale, 'legal')} className="text-xs font-semibold text-[#c8bda8] transition-colors hover:text-white">{f.kvkk}</Link>
            <Link href={`/${locale}`} className="text-xs font-semibold text-[#c8bda8] transition-colors hover:text-white">{f.core}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

const footerDicts: Record<string, {
  description: string;
  product: string;
  adaptiveCrm: string;
  companyMemory: string;
  platform: string;
  adaptiveAi: string;
  security: string;
  company: string;
  resources: string;
  pricing: string;
  bookDemo: string;
  signIn: string;
  rights: string;
  kvkk: string;
  core: string;
}> = {
  tr: {
    description: 'Saule, müşteri temaslarını kurumsal hafızaya ve gelişim aksiyonlarına dönüştüren Adaptive CRM platformudur.',
    product: 'Ürün',
    adaptiveCrm: 'Adaptive CRM',
    companyMemory: 'Kurumsal Hafıza',
    platform: 'Platform',
    adaptiveAi: 'Öğrenen Yapay Zeka',
    security: 'Güvenlik',
    company: 'Şirket',
    resources: 'Kaynaklar',
    pricing: 'Fiyatlandırma',
    bookDemo: 'Demo Planla',
    signIn: 'Giriş Yap',
    rights: '© 2026 Saule. Tüm hakları saklıdır.',
    kvkk: 'KVKK',
    core: 'Core',
  },
  en: {
    description: 'Saule is the Adaptive CRM platform that turns customer contacts into company memory and improvement actions.',
    product: 'Product',
    adaptiveCrm: 'Adaptive CRM',
    companyMemory: 'Company Memory',
    platform: 'Platform',
    adaptiveAi: 'Adaptive AI',
    security: 'Security',
    company: 'Company',
    resources: 'Resources',
    pricing: 'Pricing',
    bookDemo: 'Book Demo',
    signIn: 'Sign In',
    rights: '© 2026 Saule. All rights reserved.',
    kvkk: 'Legal',
    core: 'Core',
  },
  ru: {
    description: 'Saule — это платформа Adaptive CRM, которая превращает контакты с клиентами в память компании и действия по улучшению.',
    product: 'Продукт',
    adaptiveCrm: 'Adaptive CRM',
    companyMemory: 'Память компании',
    platform: 'Платформа',
    adaptiveAi: 'Адаптивный ИИ',
    security: 'Безопасность',
    company: 'Компания',
    resources: 'Ресурсы',
    pricing: 'Тарифы',
    bookDemo: 'Заказать демо',
    signIn: 'Вход',
    rights: '© 2026 Saule. Все права защищены.',
    kvkk: 'Правовая информация',
    core: 'Core',
  },
};

function FooterGroup({ title, links }: { title: string; links: Array<{ label: string; href: string }> }) {
  return (
    <div>
      <h3 className="mb-3 text-xs font-black uppercase tracking-[0.14em] text-[#f0bd4f]">{title}</h3>
      <div className="space-y-2.5">
        {links.map((link) => (
          <Link key={link.label} href={link.href} className="block text-sm font-semibold text-[#e8ddca] transition-colors hover:text-white">
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

function HomePage({ locale, copy }: { locale: string; copy: Copy }) {
  return (
    <>
      <section className="relative overflow-hidden border-b border-[#e6e1d8] bg-[#fffdf8]">
        <div className="absolute inset-0 bg-[linear-gradient(#ebe7dd_1px,transparent_1px),linear-gradient(90deg,#ebe7dd_1px,transparent_1px)] bg-[size:44px_44px] opacity-30" />
        <div className="relative mx-auto max-w-[1480px] px-3 pb-14 pt-5 sm:px-5 sm:pb-16 lg:px-8">
          <HeroCarousel locale={locale} copy={copy} />
          <ProductPanel copy={copy.productPanel} />
        </div>
      </section>

      <section className="bg-white px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <SectionHeader eyebrow={copy.problem.eyebrow} title={copy.problem.title} copy={copy.problem.copy} />
          <div className="grid gap-3">
            {copy.problem.points.map((point, index) => (
              <div key={point} className="flex items-start gap-4 rounded-lg border border-[#e6e1d8] bg-[#fffdf8] p-5">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-[#101828] text-xs font-black text-white">0{index + 1}</span>
                <p className="text-base font-bold leading-7 text-[#3f4756]">{point}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-[#e6e1d8] bg-[#f7f8fb] px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeader eyebrow={copy.loop.eyebrow} title={copy.loop.title} copy={copy.loop.copy} align="center" />
          <div className="mt-10 grid gap-3 lg:grid-cols-5">
            {copy.loop.steps.map((step, index) => (
              <div key={step} className="rounded-lg border border-[#d9d0c1] bg-white p-5 text-center">
                <p className="mx-auto mb-4 flex size-9 items-center justify-center rounded-md bg-[#111827] text-sm font-black text-white">{index + 1}</p>
                <h3 className="text-sm font-black text-[#101828]">{step}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeader eyebrow={copy.crmBody.eyebrow} title={copy.crmBody.title} copy={copy.crmBody.copy} />
          <div className="mt-10">
            <FeatureGrid items={copy.crmBody.features} locale={locale} />
          </div>
        </div>
      </section>

      <section className="border-y border-[#e6e1d8] bg-[#101828] px-4 py-20 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="mb-3 text-xs font-black uppercase tracking-[0.16em] text-[#f4c35b]">{copy.intelligence.eyebrow}</p>
            <h2 className="text-balance text-3xl font-black tracking-tight sm:text-4xl">{copy.intelligence.title}</h2>
            <p className="mt-4 text-base leading-7 text-[#e8ddca] sm:text-lg">{copy.intelligence.copy}</p>
          </div>
          <div className="mt-10">
            <FeatureGrid items={copy.intelligence.features} dark locale={locale} />
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <SectionHeader eyebrow={copy.memory.eyebrow} title={copy.memory.title} copy={copy.memory.copy} />
          <div className="grid gap-3 sm:grid-cols-2">
            {copy.memory.signals.map((signal) => (
              <div key={signal} className="rounded-lg border border-[#e6e1d8] bg-[#fffdf8] p-4">
                <p className="text-sm font-black text-[#101828]">{signal}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="use-cases" className="border-y border-[#e6e1d8] bg-[#f7f8fb] px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeader eyebrow={copy.useCases.eyebrow} title={copy.useCases.title} align="center" />
          <div className="mt-10">
            <FeatureGrid items={copy.useCases.items} locale={locale} />
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeader eyebrow={copy.roadmap.eyebrow} title={copy.roadmap.title} align="center" />
          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            <RoadmapColumn title="Mevcut" items={copy.roadmap.current} tone="green" />
            <RoadmapColumn title="Yakında" items={copy.roadmap.coming} tone="amber" />
            <RoadmapColumn title="Planlandı" items={copy.roadmap.planned} tone="ink" />
          </div>
        </div>
      </section>

      <section className="border-y border-[#e6e1d8] bg-[#f7f8fb] px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <SectionHeader eyebrow={copy.trust.eyebrow} title={copy.trust.title} copy={copy.trust.copy} />
          <div className="grid gap-3 sm:grid-cols-2">
            {copy.trust.items.map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-lg border border-[#d9d0c1] bg-white p-4">
                <span className="text-[#c97900]">🛡️</span>
                <p className="text-sm font-black text-[#101828]">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PricingPreview copy={copy} locale={locale} />
      <FinalCta copy={copy} locale={locale} />
    </>
  );
}

function RoadmapColumn({ title, items, tone }: { title: string; items: string[]; tone: 'green' | 'amber' | 'ink' }) {
  const styles = tone === 'green'
    ? 'bg-[#eaf8f4] text-[#0f766e] border-[#bfe3db]'
    : tone === 'amber'
      ? 'bg-[#fff4d8] text-[#855b05] border-[#f3d9a1]'
      : 'bg-[#eef2f8] text-[#43546e] border-[#d6dcea]';

  return (
    <div className="rounded-lg border border-[#e6e1d8] bg-[#fffdf8] p-5">
      <h3 className={`mb-4 inline-flex rounded border px-2 py-1 text-xs font-black uppercase tracking-[0.12em] ${styles}`}>
        {title}
      </h3>
      <div className="grid gap-2">
        {items.map((item) => (
          <div key={item} className="flex items-center gap-2 text-sm font-semibold text-[#3f4756]">
            <span className="text-[#c97900]">✓</span>
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

function PlaceholderPage({
  locale,
  eyebrow,
  title,
  copy,
  cardTitle,
  cardCopy,
  items,
}: {
  locale: string;
  eyebrow: string;
  title: string;
  copy: string;
  cardTitle: string;
  cardCopy: string;
  items: string[];
}) {
  return (
    <>
      <StandardPageHero locale={locale} eyebrow={eyebrow} title={title} copy={copy} />
      <section className="bg-white px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl rounded-2xl border border-[#e6e1d8] bg-[#fffdf8] p-8 shadow-[0_18px_60px_rgba(16,24,40,0.08)]">
          <h2 className="text-2xl font-black tracking-tight text-[#101828]">{cardTitle}</h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[#5b6472]">{cardCopy}</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {items.map((item) => (
              <div key={item} className="rounded-lg border border-[#e6e1d8] bg-white p-4 text-sm font-bold text-[#3f4756]">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>
      <FinalCta copy={trCopy} locale={locale} />
    </>
  );
}

export default function BusinessCrmSite({
  locale,
  page,
}: {
  locale: string;
  page: SitePage;
}) {
  const copy = getCopy(locale);

  return (
    <div className="min-h-screen bg-[#fffdf8] text-[#101828]">
      <Header locale={locale} page={page} copy={copy} />
      <main>
        {page === 'home' ? <HomePage locale={locale} copy={copy} /> : null}

        {page === 'crm' ? (
          <>
            <StandardPageHero locale={locale} eyebrow={copy.pages.crm.eyebrow} title={copy.pages.crm.title} copy={copy.pages.crm.copy} />
            <section className="bg-white px-4 py-20 sm:px-6 lg:px-8">
              <div className="mx-auto max-w-7xl">
                <FeatureGrid items={copy.pages.crm.pillars} locale={locale} />
                <div className="mt-14 rounded-lg border border-[#e6e1d8] bg-[#f7f8fb] p-6 sm:p-8">
                  <h2 className="text-2xl font-black tracking-tight text-[#101828]">{copy.pages.crm.workflowTitle}</h2>
                  <div className="mt-6 grid gap-3 lg:grid-cols-6">
                    {copy.pages.crm.workflow.map((step, index) => (
                      <div key={step} className="rounded-md border border-[#d9d0c1] bg-white p-4">
                        <p className="mb-3 text-[10px] font-black uppercase tracking-[0.12em] text-[#c97900]">0{index + 1}</p>
                        <p className="text-sm font-black leading-5 text-[#101828]">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
            <FinalCta copy={copy} locale={locale} />
          </>
        ) : null}

        {page === 'adaptive-ai' ? (
          <>
            <StandardPageHero locale={locale} eyebrow={copy.pages.adaptiveAi.eyebrow} title={copy.pages.adaptiveAi.title} copy={copy.pages.adaptiveAi.copy} />
            <section className="bg-white px-4 py-20 sm:px-6 lg:px-8">
              <div className="mx-auto max-w-7xl">
                <FeatureGrid items={copy.pages.adaptiveAi.layers} locale={locale} />
                <div className="mt-12 rounded-lg border border-[#111827] bg-[#f7f8fb] p-6 sm:p-8">
                  <h2 className="text-2xl font-black tracking-tight text-[#101828]">{copy.pages.adaptiveAi.noteTitle}</h2>
                  <p className="mt-4 max-w-4xl text-base leading-7 text-[#5b6472]">{copy.pages.adaptiveAi.noteCopy}</p>
                </div>
              </div>
            </section>
            <FinalCta copy={copy} locale={locale} />
          </>
        ) : null}

        {page === 'company-memory' ? (
          <>
            <StandardPageHero locale={locale} eyebrow={copy.pages.companyMemory.eyebrow} title={copy.pages.companyMemory.title} copy={copy.pages.companyMemory.copy} />
            <section className="bg-white px-4 py-20 sm:px-6 lg:px-8">
              <div className="mx-auto max-w-7xl">
                <SectionHeader eyebrow={copy.pages.companyMemory.eyebrow} title={copy.pages.companyMemory.signalsTitle} />
                <div className="mt-10">
                  <FeatureGrid items={copy.pages.companyMemory.signals} locale={locale} />
                </div>
              </div>
            </section>
            <section className="border-y border-[#e6e1d8] bg-[#f7f8fb] px-4 py-20 sm:px-6 lg:px-8">
              <div className="mx-auto max-w-7xl">
                <SectionHeader eyebrow={locale === 'tr' ? 'Kazanım' : locale === 'ru' ? 'Результат' : 'Outcome'} title={copy.pages.companyMemory.outcomeTitle} align="center" />
                <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                  {copy.pages.companyMemory.outcomes.map((outcome) => (
                    <div key={outcome} className="rounded-lg border border-[#d9d0c1] bg-white p-4 text-center text-sm font-black text-[#101828]">
                      {outcome}
                    </div>
                  ))}
                </div>
              </div>
            </section>
            <FinalCta copy={copy} locale={locale} />
          </>
        ) : null}

        {page === 'pricing' ? (
          <>
            <StandardPageHero locale={locale} eyebrow={copy.pages.pricing.eyebrow} title={copy.pages.pricing.title} copy={copy.pages.pricing.copy} />
            <PricingPreview copy={copy} locale={locale} />
            <FinalCta copy={copy} locale={locale} />
          </>
        ) : null}

        {page === 'security' ? (
          <>
            <StandardPageHero locale={locale} eyebrow={copy.pages.security.eyebrow} title={copy.pages.security.title} copy={copy.pages.security.copy} />
            <section className="bg-white px-4 py-20 sm:px-6 lg:px-8">
              <div className="mx-auto max-w-7xl">
                <FeatureGrid items={copy.pages.security.principles} locale={locale} />
                <div className="mt-12 rounded-lg border border-[#f3d9a1] bg-[#fff9e8] p-6 sm:p-8">
                  <h2 className="text-2xl font-black tracking-tight text-[#101828]">{copy.pages.security.noteTitle}</h2>
                  <p className="mt-4 max-w-4xl text-base leading-7 text-[#5b6472]">{copy.pages.security.noteCopy}</p>
                </div>
              </div>
            </section>
            <FinalCta copy={copy} locale={locale} />
          </>
        ) : null}

        {page === 'resource' ? (
          <>
            <StandardPageHero locale={locale} eyebrow={copy.pages.resource.eyebrow} title={copy.pages.resource.title} copy={copy.pages.resource.copy} />
            <article className="bg-white px-4 py-20 sm:px-6 lg:px-8">
              <div className="mx-auto max-w-3xl space-y-10">
                {copy.pages.resource.sections.map((section) => (
                  <section key={section.title} className="border-b border-[#e6e1d8] pb-10 last:border-b-0">
                    <h2 className="text-2xl font-black tracking-tight text-[#101828]">{section.title}</h2>
                    <p className="mt-4 text-lg leading-8 text-[#5b6472]">{section.body}</p>
                  </section>
                ))}
              </div>
            </article>
            <FinalCta copy={copy} locale={locale} />
          </>
        ) : null}

        {page === 'legal' ? (
          <>
            <section className="relative overflow-hidden border-b border-[#e6e1d8] bg-[#fffdf8] px-4 py-16 sm:px-6 lg:px-8">
              <div className="absolute inset-0 bg-[linear-gradient(#ebe7dd_1px,transparent_1px),linear-gradient(90deg,#ebe7dd_1px,transparent_1px)] bg-[size:44px_44px] opacity-30" />
              <div className="relative mx-auto max-w-4xl">
                <p className="mb-4 inline-flex rounded-md border border-[#f4cf87] bg-[#fff3d6] px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-[#8a4f00]">
                  {copy.pages.legal.eyebrow}
                </p>
                <h1 className="text-balance text-4xl font-black tracking-tight text-[#101828] sm:text-5xl">{copy.pages.legal.title}</h1>
                <p className="mt-5 max-w-2xl text-base leading-7 text-[#5b6472]">{copy.pages.legal.copy}</p>
                <p className="mt-3 text-xs font-semibold text-[#9a9288]">{copy.pages.legal.lastUpdated}</p>
              </div>
            </section>
            <article className="bg-white px-4 py-16 sm:px-6 lg:px-8">
              <div className="mx-auto max-w-3xl">
                <div className="space-y-10">
                  {copy.pages.legal.sections.map((section) => (
                    <section key={section.title} className="border-b border-[#e6e1d8] pb-10 last:border-b-0">
                      <h2 className="text-xl font-black tracking-tight text-[#101828]">{section.title}</h2>
                      <div className="mt-4 whitespace-pre-line text-base leading-8 text-[#5b6472]">{section.body}</div>
                    </section>
                  ))}
                </div>
                <div className="mt-12 rounded-lg border border-[#e6e1d8] bg-[#f7f8fb] p-6">
                  <h2 className="text-lg font-black tracking-tight text-[#101828]">{copy.pages.legal.contactTitle}</h2>
                  <p className="mt-3 whitespace-pre-line text-sm font-semibold leading-6 text-[#5b6472]">{copy.pages.legal.contactBody}</p>
                </div>
              </div>
            </article>
          </>
        ) : null}

        {page === 'login' ? (
          <PlaceholderPage
            locale={locale}
            eyebrow={copy.pages.login.eyebrow}
            title={copy.pages.login.title}
            copy={copy.pages.login.copy}
            cardTitle={copy.pages.login.cardTitle}
            cardCopy={copy.pages.login.cardCopy}
            items={copy.pages.login.fields}
          />
        ) : null}

        {page === 'demo' ? (
          <PlaceholderPage
            locale={locale}
            eyebrow={copy.pages.demo.eyebrow}
            title={copy.pages.demo.title}
            copy={copy.pages.demo.copy}
            cardTitle={copy.pages.demo.cardTitle}
            cardCopy={copy.pages.demo.cardCopy}
            items={copy.pages.demo.bullets}
          />
        ) : null}
      </main>
      <Footer locale={locale} />
    </div>
  );
}
