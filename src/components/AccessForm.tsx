'use client';

import { useState } from 'react';
import { submitAccessForm } from '@/app/actions/submitAccess';

interface AccessFormProps {
  dict: any;
}

export default function AccessForm({ dict }: AccessFormProps) {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    reason: '',
    struggle: '',
    takeaway: '',
    feedback: false,
    consent: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.consent) {
      setError('Lütfen zorunlu alanları doldurun ve onayı işaretleyin.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await submitAccessForm(formData);
      if (result.success) {
        setSubmitted(true);
      } else {
        setError(result.error || 'Gönderim sırasında bir hata oluştu. Lütfen tekrar deneyin.');
      }
    } catch (err: any) {
      console.error('Error submitting form:', err);
      setError('Gönderim sırasında bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <section className="bg-sage/10 border border-sage/30 rounded p-6 sm:p-8 space-y-6 max-w-2xl mx-auto text-center">
        <h2 className="font-serif text-2xl font-bold text-sage-dark pb-2">
          Başvurunuz Alındı
        </h2>
        <p className="font-sans text-sm text-charcoal-muted leading-relaxed">
          Erken erişim talebiniz başarıyla bize ulaştı. Süreç başladığında verdiğiniz e-posta adresi üzerinden sizinle iletişime geçeceğiz.
        </p>
      </section>
    );
  }

  return (
    <section className="bg-sand-200/20 border border-sand-300/30 rounded p-6 sm:p-8 space-y-6 max-w-2xl mx-auto">
      <h2 className="font-serif text-xl font-bold text-charcoal pb-2 border-b border-sand-300/20">
        {dict.title}
      </h2>
      
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded font-sans">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-sm">

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="font-sans font-bold text-xs text-charcoal-muted uppercase">
              {dict.form_name}
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-sand-100 border border-sand-300 rounded text-charcoal-muted focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage"
            />
          </div>
          <div className="space-y-1.5">
            <label className="font-sans font-bold text-xs text-charcoal-muted uppercase">
              {dict.form_email}
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 bg-sand-100 border border-sand-300 rounded text-charcoal-muted focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="font-sans font-bold text-xs text-charcoal-muted uppercase">
            {dict.form_reason}
          </label>
          <textarea
            rows={3}
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            className="w-full px-3 py-2 bg-sand-100 border border-sand-300 rounded text-charcoal-muted focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage resize-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="font-sans font-bold text-xs text-charcoal-muted uppercase">
            {dict.form_struggle}
          </label>
          <input
            type="text"
            value={formData.struggle}
            onChange={(e) => setFormData({ ...formData, struggle: e.target.value })}
            className="w-full px-3 py-2 bg-sand-100 border border-sand-300 rounded text-charcoal-muted focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage"
          />
        </div>

        <div className="space-y-1.5">
          <label className="font-sans font-bold text-xs text-charcoal-muted uppercase">
            {dict.form_takeaway}
          </label>
          <textarea
            rows={3}
            value={formData.takeaway}
            onChange={(e) => setFormData({ ...formData, takeaway: e.target.value })}
            className="w-full px-3 py-2 bg-sand-100 border border-sand-300 rounded text-charcoal-muted focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage resize-none"
          />
        </div>

        <div className="flex items-start space-x-2 pt-2">
          <input
            type="checkbox"
            id="feedback-opt"
            checked={formData.feedback}
            onChange={(e) => setFormData({ ...formData, feedback: e.target.checked })}
            className="mt-1"
          />
          <label htmlFor="feedback-opt" className="text-xs text-charcoal-muted select-none cursor-pointer">
            {dict.form_feedback}
          </label>
        </div>

        <div className="flex items-start space-x-2">
          <input
            type="checkbox"
            id="consent-check"
            required
            checked={formData.consent}
            onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
            className="mt-1"
          />
          <label htmlFor="consent-check" className="text-xs text-charcoal-muted font-semibold select-none cursor-pointer">
            {dict.form_consent}
          </label>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading || !formData.consent || !formData.name || !formData.email}
            className="w-full px-5 py-3 bg-sage text-sand-100 hover:bg-sage-dark font-sans font-bold text-xs uppercase tracking-widest rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-center"
          >
            {loading ? 'Gönderiliyor...' : dict.form_submit}
          </button>
        </div>
      </form>
    </section>
  );
}
