'use client';

import { MessagesSquare } from 'lucide-react';
import { Container, Reveal } from '../ui';

export function SocialProof({ enrolledLabel }: { enrolledLabel: string }) {
  const avatars = [
    { initials: 'RH', gradient: 'from-[rgb(var(--seg-accent))] to-[rgb(var(--seg-accent-2))]' },
    { initials: 'SA', gradient: 'from-slate-400 to-slate-600' },
    { initials: 'TK', gradient: 'from-slate-500 to-slate-700' },
  ];
  return (
    <section className="py-6 sm:py-8">
      <Container>
        <Reveal>
          <div className="mx-auto flex max-w-2xl flex-col items-center justify-center gap-4 rounded-2xl border border-[var(--line)] bg-white px-5 py-4 shadow-sm sm:flex-row sm:gap-6">
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                {avatars.map((a) => (
                  <span
                    key={a.initials}
                    className={`grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br ${a.gradient} text-sm font-bold text-white ring-2 ring-white`}
                  >
                    {a.initials}
                  </span>
                ))}
              </div>
              <p className="text-left text-sm font-semibold leading-snug text-[var(--ink-soft)] sm:text-base">
                <span className="accent-gradient font-black">{enrolledLabel}</span> স্টুডেন্ট আমাদের সেশনে জয়েন করেছেন
              </p>
            </div>
            <a
              href="#feedback"
              className="btn-accent inline-flex items-center gap-2 whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-bold"
            >
              <MessagesSquare size={16} /> ফিডব্যাক দেখুন
            </a>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
