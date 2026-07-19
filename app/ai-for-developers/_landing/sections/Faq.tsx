'use client';

import { useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { Reveal, GradientText } from '../../LandingClient';
import type { FaqItem } from '../content';

function FaqAccordion({ title, children }: { title: ReactNode; children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={`border rounded-2xl overflow-hidden transition-all duration-300 ease-out ${
        isOpen
          ? 'border-[rgb(var(--seg-accent)/0.5)] shadow-[0_0_20px_rgb(var(--seg-accent)/0.15)] bg-slate-900/80'
          : 'border-slate-800 bg-slate-900/30 hover:border-[rgb(var(--seg-accent)/0.3)] hover:bg-slate-800/50'
      }`}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 md:p-6 text-left focus:outline-none group"
      >
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 group-hover:border-[rgb(var(--seg-accent)/0.5)] group-hover:text-[rgb(var(--seg-accent))] transition-colors">
            <span className="text-xs font-bold uppercase tracking-wider">FAQ</span>
            <span className="text-lg font-black leading-none">Q</span>
          </div>
          <h3 className={`font-bold text-lg md:text-xl transition-colors duration-300 ${isOpen ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
            {title}
          </h3>
        </div>
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
            isOpen
              ? 'bg-[rgb(var(--seg-accent)/0.2)] text-[rgb(var(--seg-accent))]'
              : 'bg-slate-800 text-slate-500 group-hover:bg-slate-700 group-hover:text-white'
          }`}
        >
          <ChevronDown className={`transition-transform duration-500 ease-in-out ${isOpen ? 'rotate-180' : ''}`} size={20} />
        </div>
      </button>
      <div
        className={`transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
        style={{ overflow: 'hidden' }}
      >
        <div className="p-5 md:p-6 pt-0 text-slate-400 border-t border-slate-800/50 mt-2">
          {children}
        </div>
      </div>
    </div>
  );
}

export function Faq({ heading, items }: { heading: string; items: FaqItem[] }) {
  return (
    <section id="faq" className="py-24 border-t border-slate-800/50 bg-[#060b19] scroll-mt-24">
      <div className="max-w-3xl mx-auto px-4">
        <Reveal>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black mb-6 text-white">
              <GradientText>{heading}</GradientText>
            </h2>
          </div>
        </Reveal>

        <div className="space-y-4">
          {items.map((faq, idx) => (
            <Reveal key={idx} delay={idx * 100}>
              <FaqAccordion title={faq.q}>
                <p className="text-slate-400 leading-relaxed">{faq.a}</p>
              </FaqAccordion>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
