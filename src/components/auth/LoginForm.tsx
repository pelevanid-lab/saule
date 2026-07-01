'use client';

import { useAuth } from './AuthProvider';

export default function LoginForm({ dict }: { dict: any }) {
  const { signInWithGoogle, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-6 h-6 border-2 border-sage border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-md mx-auto px-4 text-center">
      <div className="bg-sand-50/80 backdrop-blur-sm p-10 rounded-2xl border border-sand-300/50 shadow-sm w-full space-y-8">
        <div className="space-y-3">
          <span className="text-[10px] font-sans font-bold tracking-widest text-clay uppercase">
            Saule SML
          </span>
          <h2 className="font-serif text-3xl font-bold text-charcoal">
            {dict.login_title || 'Sign In'}
          </h2>
          <p className="font-sans text-sm text-charcoal-muted leading-relaxed">
            {dict.login_subtitle || 'Authenticate to access your memory.'}
          </p>
        </div>

        <button
          onClick={signInWithGoogle}
          className="w-full flex items-center justify-center space-x-3 bg-white border border-sand-300 hover:bg-sand-100 text-charcoal font-sans text-sm font-semibold py-3 px-4 rounded-lg transition-colors shadow-sm"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          <span>{dict.sign_in_google || 'Sign in with Google'}</span>
        </button>
      </div>
    </div>
  );
}
