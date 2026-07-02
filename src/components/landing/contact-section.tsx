"use client";

import { useState } from "react";
import { Reveal } from "@/components/ui/reveal";

export function ContactSection() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <section id="contact" className="relative overflow-hidden bg-white py-24 lg:py-32">
      <div className="pointer-events-none absolute -right-32 top-10 h-96 w-96 rounded-full bg-indigo-100/60 blur-3xl" />
      <div className="relative mx-auto max-w-6xl px-6 lg:px-10">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <div className="mx-auto mb-6 h-12 w-px bg-gradient-to-b from-indigo-500 to-violet-500" />
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-indigo-500">
              Contact us
            </p>
            <h2 className="mt-6 text-3xl font-bold leading-tight text-slate-900 sm:text-4xl lg:text-5xl">
              Reach out for a new workspace or just say hello
            </h2>
          </div>
        </Reveal>

        <div className="mt-20 grid gap-12 lg:grid-cols-2">
          <Reveal delay={80}>
            <div className="surface-card p-8">
              <h3 className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500">
                Send us a message
              </h3>
              {submitted ? (
                <p className="mt-8 text-lg font-medium text-indigo-600">
                  Thanks! We&apos;ll get back to you soon.
                </p>
              ) : (
                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                  {["Your Name", "Your Email", "Subject"].map((label) => (
                    <div key={label}>
                      <label className="text-xs font-medium uppercase tracking-wider text-slate-400">
                        {label}
                      </label>
                      <input
                        required
                        type={label.includes("Email") ? "email" : "text"}
                        className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                      />
                    </div>
                  ))}
                  <div>
                    <label className="text-xs font-medium uppercase tracking-wider text-slate-400">
                      Your Message
                    </label>
                    <textarea
                      required
                      rows={4}
                      className="mt-2 w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 py-4 text-sm font-bold uppercase tracking-widest text-white transition hover:brightness-110"
                  >
                    Submit
                  </button>
                </form>
              )}
            </div>
          </Reveal>

          <Reveal delay={160}>
            <div className="p-2 lg:p-8">
              <h3 className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500">
                Contact info
              </h3>
              <div className="mt-8 space-y-8">
                <div>
                  <p className="text-sm font-bold text-indigo-600">Where to find us</p>
                  <p className="mt-2 text-slate-500">
                    1600 Amphitheatre Parkway
                    <br />
                    Mountain View, CA 94043
                  </p>
                </div>
                <div>
                  <p className="text-sm font-bold text-indigo-600">Email us at</p>
                  <p className="mt-2 text-slate-500">hello@agencyflow.in</p>
                  <p className="text-slate-500">support@agencyflow.in</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-indigo-600">Call us at</p>
                  <p className="mt-2 text-slate-500">Phone: +91 98765 43210</p>
                  <p className="text-slate-500">Mon – Fri, 9am – 6pm IST</p>
                </div>
              </div>

              <div className="mt-10 flex gap-3">
                {["Fb", "Tw", "Ig", "Li"].map((s) => (
                  <span
                    key={s}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-500 transition hover:bg-indigo-600 hover:text-white"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
