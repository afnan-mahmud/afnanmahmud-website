import { MessagesSquare } from 'lucide-react';
import { Reveal } from '../../LandingClient';

export function SocialProof({ enrolledLabel }: { enrolledLabel: string }) {
  const avatars = [
    { initials: 'RH', gradient: 'from-[rgb(var(--seg-accent))] to-[rgb(var(--seg-accent-2))]' },
    { initials: 'SA', gradient: 'from-pink-500 to-purple-600' },
    { initials: 'TK', gradient: 'from-emerald-500 to-teal-600' },
  ];
  return (
    <section className="relative py-10 sm:py-12">
      <div className="max-w-6xl mx-auto px-4">
        <Reveal>
          <div className="mx-auto flex max-w-2xl flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 rounded-2xl glass-panel border border-slate-700/70 px-5 py-4 shadow-[0_0_25px_rgb(var(--seg-accent-2)/0.15)]">
            <a
              href="#feedback"
              className="order-2 sm:order-1 group inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-gradient-to-r from-[rgb(var(--seg-accent))] to-[rgb(var(--seg-accent-2))] px-5 py-2.5 text-sm font-bold text-white shadow-[0_0_20px_rgb(var(--seg-accent-2)/0.35)] hover:shadow-[0_0_28px_rgb(var(--seg-accent-2)/0.55)] hover:-translate-y-0.5 active:scale-95 transition-all"
            >
              <MessagesSquare size={16} className="group-hover:scale-110 transition-transform" />
              স্টুডেন্টদের ফিডব্যাক দেখুন
            </a>
            <div className="order-1 sm:order-2 flex items-center gap-4">
              <div className="flex -space-x-3">
                {avatars.map((a) => (
                  <div
                    key={a.initials}
                    className={`flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br ${a.gradient} text-sm font-bold text-white ring-2 ring-slate-900 shadow-lg`}
                  >
                    {a.initials}
                  </div>
                ))}
              </div>
              <p className="text-left text-sm sm:text-base font-semibold leading-snug text-slate-200">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[rgb(var(--seg-accent))] to-[rgb(var(--seg-accent-2))] font-black">{enrolledLabel}</span> স্টুডেন্ট আমাদের এই সেশনে জয়েন করেছেন
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
