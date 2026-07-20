'use client';

import { ShoppingCart, Plane, Store, Check } from 'lucide-react';
import type { IconType } from '@/app/ai-for-developers/_landing/content';
import { Container, GradientText, Reveal, SectionHeading } from '../ui';

/**
 * The three real projects built during the course, as specified by the course
 * owner. Feature bullets stay within what the Curriculum actually teaches (auth,
 * CRUD, API integration, security, deploy, mobile) — this is a sales page, so
 * don't add third-party integrations the course doesn't cover.
 *
 * The reference design shows app screenshots; we have none, so each card leads
 * with its feature list and tech badges instead. Drop real shots in later.
 */
const PROJECTS: {
  icon: IconType;
  eyebrow: string;
  title: string;
  desc: string;
  points: string[];
  stack: string[];
  /** The flagship build — rendered full-width at the end of the grid. */
  featured?: boolean;
}[] = [
  {
    icon: ShoppingCart,
    eyebrow: 'প্রজেক্ট ০১',
    title: 'সম্পূর্ণ ই-কমার্স ওয়েবসাইট',
    desc: 'প্রোডাক্ট ক্যাটালগ থেকে অর্ডার ম্যানেজমেন্ট — একটা পূর্ণাঙ্গ অনলাইন স্টোর।',
    points: [
      'প্রোডাক্ট ক্যাটালগ, ক্যাটাগরি আর সার্চ',
      'কার্ট ও চেকআউট ফ্লো',
      'ইউজার অথেনটিকেশন আর অর্ডার হিস্টোরি',
      'অ্যাডমিন ড্যাশবোর্ড — প্রোডাক্ট ও অর্ডার ম্যানেজমেন্ট',
    ],
    stack: ['Next.js', 'Node.js', 'MongoDB'],
  },
  {
    icon: Plane,
    eyebrow: 'প্রজেক্ট ০২',
    title: 'ফ্লাইট ট্র্যাকার অ্যাপ্লিকেশন',
    desc: 'বাইরের API থেকে রিয়েল ডেটা এনে সেটা দিয়ে কাজের অ্যাপ বানানো শিখবেন।',
    points: [
      'থার্ড-পার্টি API ইন্টিগ্রেশন করে লাইভ ফ্লাইট ডেটা',
      'ফ্লাইট সার্চ, রুট আর স্ট্যাটাস ভিউ',
      'ডেটা ভিজুয়ালাইজেশন আর ম্যাপ ভিউ',
      'ক্যাশিং, রেট লিমিট আর এরর হ্যান্ডলিং',
    ],
    stack: ['Next.js', 'REST API', 'MongoDB'],
  },
  {
    icon: Store,
    eyebrow: 'প্রজেক্ট ০৩ — সবচেয়ে বড়',
    title: 'বেচাকেনার মার্কেটপ্লেস (Bikroy-এর মতো)',
    desc: 'কোর্সের সবচেয়ে বড় প্রজেক্ট — একটা পূর্ণাঙ্গ মাল্টি-ইউজার মার্কেটপ্লেস, ওয়েব থেকে মোবাইল অ্যাপ পর্যন্ত।',
    points: [
      'মাল্টি-ইউজার লিস্টিং — যেকোনো ইউজার অ্যাড পোস্ট করতে পারবে',
      'ক্যাটাগরি, লোকেশন আর অ্যাডভান্সড ফিল্টার সহ সার্চ',
      'ছবি আপলোড, ইউজার প্রোফাইল আর কনটাক্ট সিস্টেম',
      'অ্যাডমিন মডারেশন প্যানেল',
      'সিকিউরিটি হার্ডেনিং + VPS/AWS-এ লাইভ ডিপ্লয়',
      'একই প্রজেক্ট থেকে মোবাইল অ্যাপ — Play Store আর App Store-এ পাবলিশ',
    ],
    stack: ['Next.js', 'Node.js', 'MongoDB', 'React Native (Expo)', 'GitHub Actions'],
    featured: true,
  },
];

export function Projects() {
  return (
    <section id="projects" className="py-16 sm:py-24">
      <Container>
        <SectionHeading eyebrow="হাতে-কলমে" sub="শুধু টিউটোরিয়াল দেখা নয় — ৩টি সম্পূর্ণ অ্যাপ্লিকেশন নিজের হাতে বানাবেন, যা পোর্টফোলিওতে দেখানোর মতো।">
          যেসব <GradientText>রিয়েল প্রজেক্ট</GradientText> বানাবেন
        </SectionHeading>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {PROJECTS.map((p, i) => (
            <Reveal key={p.title} delay={i * 100} className={p.featured ? 'lg:col-span-2' : ''}>
              <div
                className={`flex h-full flex-col rounded-3xl p-7 sm:p-8 ${
                  p.featured ? 'bg-[#0b1220] ring-2 ring-[rgb(var(--seg-accent)/0.45)]' : 'bg-[#0f172a]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="grid h-12 w-12 shrink-0 place-items-center rounded-xl"
                    style={{ background: 'rgb(var(--seg-accent) / 0.18)', color: 'rgb(var(--seg-accent))' }}
                  >
                    <p.icon size={24} />
                  </div>
                  <span
                    className="text-xs font-bold uppercase tracking-widest"
                    style={{ color: 'rgb(var(--seg-accent))' }}
                  >
                    {p.eyebrow}
                  </span>
                </div>

                <h3 className="mt-5 text-xl font-black leading-tight text-white sm:text-2xl">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{p.desc}</p>

                <ul className={`mt-5 space-y-2.5 ${p.featured ? 'sm:grid sm:grid-cols-2 sm:gap-x-8 sm:space-y-0 sm:gap-y-2.5' : ''}`}>
                  {p.points.map((point) => (
                    <li key={point} className="flex items-start gap-2.5 text-sm leading-relaxed text-slate-300">
                      <Check size={16} className="mt-0.5 shrink-0" style={{ color: 'rgb(var(--seg-accent))' }} />
                      {point}
                    </li>
                  ))}
                </ul>

                <div className="mt-6 flex flex-wrap gap-2 border-t border-white/10 pt-5">
                  {p.stack.map((tech) => (
                    <span
                      key={tech}
                      className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
