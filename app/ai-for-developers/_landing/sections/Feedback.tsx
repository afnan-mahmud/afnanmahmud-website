import { MessagesSquare } from 'lucide-react';
import { Reveal } from '../../LandingClient';
import type { Testimonial } from '../content';

export function Feedback({ heading, sub, items }: { heading: string; sub: string; items: Testimonial[] }) {
  return (
    <section id="feedback" className="scroll-mt-24 py-24 relative overflow-hidden border-t border-slate-800/50">
      <div
        className="absolute left-1/4 top-1/3 w-80 h-80 rounded-full blur-[110px] pointer-events-none"
        style={{ background: 'rgb(var(--seg-accent) / 0.1)' }}
      ></div>
      <div
        className="absolute right-1/4 bottom-1/4 w-80 h-80 rounded-full blur-[110px] pointer-events-none"
        style={{ background: 'rgb(var(--seg-accent-2) / 0.1)' }}
      ></div>

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <Reveal>
          <div className="text-center mb-14">
            <div
              className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 border"
              style={{
                background: 'rgb(var(--seg-accent) / 0.2)',
                color: 'rgb(var(--seg-accent))',
                borderColor: 'rgb(var(--seg-accent) / 0.3)',
                boxShadow: '0 0 20px rgb(var(--seg-accent) / 0.2)',
              }}
            >
              <MessagesSquare size={32} />
            </div>
            <h2 className="text-3xl md:text-5xl font-black mb-6 text-white">
              {heading}
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              {sub}
            </p>
          </div>
        </Reveal>

        <div className="grid sm:grid-cols-2 gap-6">
          {items.map((r, i) => (
            <Reveal key={r.initials} delay={i * 100}>
              <div className="h-full flex flex-col gap-4 rounded-2xl glass-panel border border-slate-700/70 p-6 shadow-[0_0_25px_rgb(var(--seg-accent-2)/0.1)] hover:border-[rgb(var(--seg-accent-2)/0.4)] hover:shadow-[0_0_30px_rgb(var(--seg-accent-2)/0.25)] transition-all">
                <div className="text-amber-400 text-lg tracking-wide" aria-label="৫ তারকা রেটিং">★★★★★</div>
                <p className="text-slate-300 leading-relaxed [text-wrap:pretty] flex-1">“{r.text}”</p>
                <div className="flex items-center gap-3 pt-2 border-t border-slate-800/70">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br ${r.gradient} text-sm font-bold text-white shadow-lg`}>
                    {r.initials}
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm leading-tight">{r.name}</p>
                    {r.role && <p className="text-slate-400 text-xs">{r.role}</p>}
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={200}>
          <p className="mt-8 text-center text-base sm:text-lg font-semibold text-slate-400">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[rgb(var(--seg-accent))] to-[rgb(var(--seg-accent-2))] font-black">+৫২ জন</span> আরো ফিডব্যাক দিয়েছেন
          </p>
        </Reveal>
      </div>
    </section>
  );
}
