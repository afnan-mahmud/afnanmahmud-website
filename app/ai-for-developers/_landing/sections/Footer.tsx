import Image from 'next/image';
import { Send, AtSign, Mail } from 'lucide-react';
import { GradientText } from '../../LandingClient';

// Invariant across all segments — same footer for every audience.
export function Footer() {
  return (
    <footer className="bg-[#020617] text-slate-400 py-16 border-t border-slate-800 relative overflow-hidden">
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[rgb(var(--seg-accent))] to-[rgb(var(--seg-accent-2))]"></div>

      <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-4 gap-12 relative z-10">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 font-black text-2xl text-white mb-6 hover:opacity-80 transition-opacity cursor-pointer inline-flex">
            <Image src="/afnan-logo.png" alt="Afnan Mahmud" width={40} height={40} className="w-10 h-10 rounded-full object-cover shadow-[0_0_10px_rgb(var(--seg-accent)/0.3)]" />
            <span>Afnan <GradientText>Mahmud</GradientText></span>
          </div>
          <p className="mb-6 max-w-sm leading-relaxed text-slate-400">
            টিউটোরিয়াল হেল থেকে বেরিয়ে এসে ফ্রি AI টুল দিয়ে রিয়েল, প্রোডাকশন-গ্রেড অ্যাপ বানানো শিখুন — ওয়েবসাইট থেকে মোবাইল অ্যাপ পর্যন্ত।
          </p>
          <div className="flex items-center gap-4">
            <a href="#" aria-label="Telegram" className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-slate-800 hover:text-[rgb(var(--seg-accent))] transition-all duration-300 hover:-translate-y-1"><Send size={18} aria-hidden="true" /></a>
            <a href="#" aria-label="X (Twitter)" className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-slate-800 hover:text-[rgb(var(--seg-accent-2))] transition-all duration-300 hover:-translate-y-1"><AtSign size={18} aria-hidden="true" /></a>
            <a href="#" aria-label="Email" className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-slate-800 hover:text-pink-400 transition-all duration-300 hover:-translate-y-1"><Mail size={18} aria-hidden="true" /></a>
          </div>
        </div>

        <div>
          <h4 className="text-white font-bold mb-6 tracking-wide uppercase text-sm">Navigation</h4>
          <ul className="space-y-3">
            <li><a href="#journey" className="hover:text-[rgb(var(--seg-accent))] hover:translate-x-1 transition-all inline-block">Curriculum</a></li>
            <li><a href="#instructor" className="hover:text-[rgb(var(--seg-accent))] hover:translate-x-1 transition-all inline-block">Instructor</a></li>
            <li><a href="#pricing" className="hover:text-[rgb(var(--seg-accent))] hover:translate-x-1 transition-all inline-block">Pricing</a></li>
            <li><a href="#faq" className="hover:text-[rgb(var(--seg-accent))] hover:translate-x-1 transition-all inline-block">FAQ</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-6 tracking-wide uppercase text-sm">System</h4>
          <ul className="space-y-3">
            <li><a href="/terms" className="hover:text-[rgb(var(--seg-accent))] hover:translate-x-1 transition-all inline-block">Terms of Service</a></li>
            <li><a href="/privacy" className="hover:text-[rgb(var(--seg-accent))] hover:translate-x-1 transition-all inline-block">Privacy Policy</a></li>
            <li><a href="/refund" className="hover:text-[rgb(var(--seg-accent))] hover:translate-x-1 transition-all inline-block">Refund Policy</a></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 mt-16 pt-8 border-t border-slate-900 text-center text-sm relative z-10 text-slate-400">
        <p>&copy; {new Date().getFullYear()} Afnan Mahmud. System Online.</p>
      </div>
    </footer>
  );
}
