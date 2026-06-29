import { getDictionary } from '@/lib/dictionaries';
import Link from 'next/link';

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  return (
    <div className="space-y-16 py-12 max-w-4xl mx-auto px-4">
      {/* 1. HEADER SECTION */}
      <section className="text-center space-y-6">
        <h1 className="font-serif text-5xl md:text-6xl font-bold tracking-tight text-charcoal">
          {dict.business_page?.title || 'Saule Business'}
        </h1>
        <p className="font-serif text-xl md:text-2xl italic text-sage-dark font-medium">
          {dict.business_page?.subtitle || 'Adaptive intelligence for business.'}
        </p>
        <p className="font-sans text-base text-charcoal-muted max-w-2xl mx-auto leading-relaxed">
          {dict.business_page?.positioning || 'A learning CRM and customer intelligence system that helps companies turn customer interactions into memory, patterns, playbooks, scripts, tasks, and improvement actions.'}
        </p>
      </section>

      {/* 2. LOGIN BUTTON (MOVED UP & ENLARGED) */}
      <div className="text-center py-4">
        <Link
          href={`/${locale}/business/crm`}
          className="inline-block px-12 py-5 bg-clay text-sand-100 font-sans font-bold text-sm uppercase tracking-widest rounded shadow-lg hover:bg-clay/90 hover:shadow-xl transition-all duration-300 cursor-pointer"
        >
          {dict.business_page?.cta || "Saule Business'a Giriş Yap"}
        </Link>
      </div>

      {/* 3. CAPABILITIES */}
      <section className="bg-sand-50/50 border border-sand-300/40 p-8 rounded-lg max-w-2xl mx-auto space-y-6">
        <h2 className="font-serif text-2xl font-bold text-clay">
          {dict.business_page?.capabilities_title || 'Capabilities'}
        </h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(dict.business_page?.features || [
            'Customer 360', 'Company 360', 'Omnichannel Inbox', 'Tickets',
            'Insights', 'Pattern Memory', 'Playbooks', 'Scripts', 'Tasks',
            'SLA learning', 'Continuous improvement CRM'
          ]).map((feature: string, idx: number) => (
            <li key={idx} className="flex items-center space-x-2 text-sm font-sans text-charcoal-muted">
              <span className="text-clay">▹</span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
