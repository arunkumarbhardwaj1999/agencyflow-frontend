import { LANDING_FAQS } from "@/lib/seo";

export function FaqSection() {
  return (
    <section id="faq" className="bg-slate-50 py-24" aria-labelledby="faq-heading">
      <div className="mx-auto max-w-3xl px-6 lg:px-10">
        <p className="text-center text-xs font-bold uppercase tracking-[0.35em] text-indigo-500">
          FAQ
        </p>
        <h2
          id="faq-heading"
          className="mt-6 text-center text-3xl font-bold leading-tight text-slate-900 sm:text-4xl"
        >
          Common questions about AgencyFlow
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-slate-500">
          Clear answers for agencies comparing CRM, GST billing, and client portal tools.
        </p>

        <div className="mt-12 space-y-4">
          {LANDING_FAQS.map((item) => (
            <details
              key={item.question}
              className="group rounded-2xl border border-slate-200 bg-white p-5 open:shadow-sm"
            >
              <summary className="cursor-pointer list-none text-left text-base font-semibold text-slate-900 marker:content-none [&::-webkit-details-marker]:hidden">
                <span className="flex items-start justify-between gap-4">
                  {item.question}
                  <span className="mt-0.5 text-indigo-500 transition group-open:rotate-45">+</span>
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
