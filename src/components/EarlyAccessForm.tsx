'use client';

import { useState } from 'react';

interface EarlyAccessFormProps {
  dict: {
    title: string;
    description: string;
    placeholder: string;
    button: string;
    success_title: string;
    success_desc: string;
  };
}

export default function EarlyAccessForm({ dict }: EarlyAccessFormProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setError('');
    setStatus('submitting');

    setTimeout(() => {
      setStatus('success');
      setEmail('');
    }, 1000);
  };

  if (status === 'success') {
    return (
      <div className="p-6 md:p-8 bg-sand-200 border border-sand-300/60 rounded text-center transition-all duration-300">
        <div className="w-12 h-12 bg-sage/10 text-sage rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h4 className="font-serif text-lg text-charcoal font-semibold mb-2">
          {dict.success_title}
        </h4>
        <p className="text-sm text-charcoal-muted max-w-sm mx-auto">
          {dict.success_desc}
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 bg-sand-50 border border-sand-300/40 rounded shadow-sm">
      <h3 className="font-serif text-xl md:text-2xl text-charcoal mb-2 font-medium">
        {dict.title}
      </h3>
      <p className="text-xs sm:text-sm text-charcoal-muted mb-6 max-w-md">
        {dict.description}
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status === 'submitting'}
            placeholder={dict.placeholder}
            className="w-full px-4 py-2.5 rounded border border-sand-300 bg-sand-100/50 text-charcoal placeholder-charcoal-muted/40 focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage text-sm transition-all"
            required
          />
          {error && <p className="text-xs text-clay mt-1.5">{error}</p>}
        </div>
        <button
          type="submit"
          disabled={status === 'submitting'}
          className="px-6 py-2.5 rounded bg-sage hover:bg-sage-dark text-white font-sans text-sm font-medium tracking-wide transition-all shadow-sm flex items-center justify-center min-w-[140px] cursor-pointer"
        >
          {status === 'submitting' ? (
            <svg
              className="animate-spin h-5 w-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          ) : (
            dict.button
          )}
        </button>
      </form>
    </div>
  );
}
