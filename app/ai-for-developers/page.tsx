import type { Metadata } from 'next';
import { Hind_Siliguri } from 'next/font/google';
import { lightGlobalStyles } from './_light/globalStyles';
import { LightLandingPage } from './_light/LightLandingPage';

// The light landing is set in Hind Siliguri, not the app-wide Geist. Loaded here
// so the variable only exists on this route; `.cl-light` consumes it.
const bangla = Hind_Siliguri({
  variable: '--font-bangla',
  subsets: ['bengali', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'AI for Developers — টিউটোরিয়াল হেল থেকে প্রোডাকশন অ্যাপ | Afnan Mahmud',
  description:
    'ফ্রি AI টুল দিয়ে রিয়েল, প্রোডাকশন-গ্রেড অ্যাপ বানানো শিখুন — ওয়েবসাইট থেকে মোবাইল অ্যাপ, জিরো থেকে লাইভ ডিপ্লয় পর্যন্ত। ৮ মডিউল, ৪০+ লেসন, ৩টি রিয়েল প্রজেক্ট।',
  openGraph: {
    title: 'AI for Developers — Afnan Mahmud',
    description:
      'ফ্রি AI টুল দিয়ে রিয়েল, প্রোডাকশন-গ্রেড অ্যাপ বানানো শিখুন — জিরো থেকে লাইভ ডিপ্লয় পর্যন্ত।',
    type: 'website',
  },
};

export default function AiForDevelopersPage() {
  return (
    <div className={`${bangla.variable} cl-light`}>
      <style>{lightGlobalStyles}</style>
      <LightLandingPage />
    </div>
  );
}
