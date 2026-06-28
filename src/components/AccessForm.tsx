'use client';

interface AccessFormProps {
  dict: any;
}

export default function AccessForm({ dict }: AccessFormProps) {
  return (
    <section className="bg-sand-200/20 border border-sand-300/30 rounded p-6 sm:p-8 space-y-6 max-w-2xl mx-auto">
      <h2 className="font-serif text-xl font-bold text-charcoal pb-2 border-b border-sand-300/20">
        {dict.title}
      </h2>
      <form onSubmit={(e) => e.preventDefault()} className="space-y-4 text-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="font-sans font-bold text-xs text-charcoal-muted uppercase">
              {dict.form_name}
            </label>
            <input
              type="text"
              disabled
              placeholder="..."
              className="w-full px-3 py-2 bg-sand-100 border border-sand-300 rounded text-charcoal-muted focus:outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="font-sans font-bold text-xs text-charcoal-muted uppercase">
              {dict.form_email}
            </label>
            <input
              type="email"
              disabled
              placeholder="..."
              className="w-full px-3 py-2 bg-sand-100 border border-sand-300 rounded text-charcoal-muted focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="font-sans font-bold text-xs text-charcoal-muted uppercase">
            {dict.form_reason}
          </label>
          <textarea
            disabled
            rows={3}
            placeholder="..."
            className="w-full px-3 py-2 bg-sand-100 border border-sand-300 rounded text-charcoal-muted focus:outline-none resize-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="font-sans font-bold text-xs text-charcoal-muted uppercase">
            {dict.form_struggle}
          </label>
          <input
            type="text"
            disabled
            placeholder="..."
            className="w-full px-3 py-2 bg-sand-100 border border-sand-300 rounded text-charcoal-muted focus:outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="font-sans font-bold text-xs text-charcoal-muted uppercase">
            {dict.form_takeaway}
          </label>
          <textarea
            disabled
            rows={3}
            placeholder="..."
            className="w-full px-3 py-2 bg-sand-100 border border-sand-300 rounded text-charcoal-muted focus:outline-none resize-none"
          />
        </div>

        <div className="flex items-start space-x-2 pt-2">
          <input
            type="checkbox"
            id="feedback-opt"
            disabled
            className="mt-1"
          />
          <label htmlFor="feedback-opt" className="text-xs text-charcoal-muted select-none">
            {dict.form_feedback}
          </label>
        </div>

        <div className="flex items-start space-x-2">
          <input
            type="checkbox"
            id="consent-check"
            disabled
            className="mt-1"
          />
          <label htmlFor="consent-check" className="text-xs text-charcoal-muted font-semibold select-none">
            {dict.form_consent}
          </label>
        </div>

        <div className="pt-4">
          <button
            type="button"
            disabled
            className="w-full px-5 py-3 bg-sand-300 border border-sand-400 text-charcoal-muted font-sans font-bold text-xs uppercase tracking-widest rounded cursor-not-allowed text-center"
          >
            {dict.form_submit_disabled}
          </button>
        </div>
      </form>
    </section>
  );
}
