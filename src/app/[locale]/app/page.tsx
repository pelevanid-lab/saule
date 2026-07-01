import { getDictionary } from '@/lib/dictionaries';
import RequireAuth from '@/components/auth/RequireAuth';
import TerminalUI from '@/components/TerminalUI';
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

        <TerminalUI dict={dict.app} locale={locale} />
      </div>
    </RequireAuth>
  );
}
