import { AuthProvider } from '@/components/auth/AuthProvider';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthProvider>{children}</AuthProvider>;
}
