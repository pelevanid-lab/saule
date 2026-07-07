import { getDictionary } from '@/lib/dictionaries';
import RequireAuth from '@/components/auth/RequireAuth';
import AppContainer from '@/components/AppContainer';
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
    <RequireAuth dict={dict}>
      <AppContainer dict={dict} locale={locale} />
    </RequireAuth>
  );
}
