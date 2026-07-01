import { getDictionary } from '@/lib/dictionaries';
import RequireAuth from '@/components/auth/RequireAuth';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  return {
    title: dict.app.title,
    description: dict.app.subtitle,
  };
}

export default async function AppPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  return (
    <RequireAuth dict={dict.auth}>
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12 min-h-[80vh] flex flex-col">
        <header className="mb-8 border-b border-sand-300/40 pb-4">
          <h1 className="font-serif text-3xl font-bold text-charcoal">{dict.app.title}</h1>
          <p className="font-sans text-sm text-charcoal-muted mt-2">{dict.app.subtitle}</p>
        </header>

        {/* Chat History Area */}
        <div className="flex-1 overflow-y-auto mb-6 bg-sand-50/50 rounded-lg border border-sand-300/30 p-6 flex flex-col">
          <div className="flex-1 flex items-center justify-center text-charcoal-muted text-sm font-sans italic opacity-70">
            {dict.app.empty_state}
          </div>
        </div>

        {/* Input Area */}
        <div className="relative">
          <textarea
            className="w-full bg-white border border-sand-300 rounded-lg pl-4 pr-24 py-4 text-sm font-sans text-charcoal focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent resize-none h-24 shadow-sm"
            placeholder={dict.app.input_placeholder}
          />
          <button
            className="absolute right-3 bottom-3 bg-sage-dark text-white px-4 py-1.5 rounded text-xs font-bold hover:bg-sage transition-colors"
          >
            {dict.app.send}
          </button>
        </div>
      </div>
    </RequireAuth>
  );
}
