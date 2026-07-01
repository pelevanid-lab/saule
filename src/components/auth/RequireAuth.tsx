'use client';

import { useAuth } from './AuthProvider';
import LoginForm from './LoginForm';

export default function RequireAuth({ children, dict }: { children: React.ReactNode, dict: any }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-6 h-6 border-2 border-sage border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm dict={dict} />;
  }

  return <>{children}</>;
}
