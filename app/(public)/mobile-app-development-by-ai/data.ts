export const TAG_STYLES = {
  project:  { bg: 'rgba(34,197,94,0.12)',  color: '#4ade80', border: 'rgba(34,197,94,0.2)',   emoji: '🔨' },
  concept:  { bg: 'rgba(124,58,237,0.12)', color: '#a78bfa', border: 'rgba(124,58,237,0.2)',  emoji: '💡' },
  ai:       { bg: 'rgba(236,72,153,0.12)', color: '#f472b6', border: 'rgba(236,72,153,0.2)',  emoji: '🤖' },
  advanced: { bg: 'rgba(245,158,11,0.12)', color: '#fbbf24', border: 'rgba(245,158,11,0.2)',  emoji: '⚡' },
  bridge:   { bg: 'rgba(56,189,248,0.12)', color: '#38bdf8', border: 'rgba(56,189,248,0.2)',  emoji: '🔗' },
  business: { bg: 'rgba(34,197,94,0.12)',  color: '#4ade80', border: 'rgba(34,197,94,0.2)',   emoji: '💼' },
  ship:     { bg: 'rgba(6,182,212,0.12)',  color: '#22d3ee', border: 'rgba(6,182,212,0.2)',   emoji: '🚀' },
} as const;

export type TagStyleKey = keyof typeof TAG_STYLES;

export const CARD_GRADIENTS: Record<number, string> = {
  0: 'linear-gradient(90deg, #38bdf8, #0ea5e9)',
  1: 'linear-gradient(90deg, #7c3aed, #4f46e5)',
  2: 'linear-gradient(90deg, #06b6d4, #0284c7)',
  3: 'linear-gradient(90deg, #22c55e, #16a34a)',
  4: 'linear-gradient(90deg, #f59e0b, #d97706)',
  5: 'linear-gradient(90deg, #ec4899, #be185d)',
  6: 'linear-gradient(90deg, #8b5cf6, #06b6d4)',
};

export const CAPSTONE_FEATURES = [
  'Auth + Subscription',
  'Web Dashboard (Next.js)',
  'Mobile App (React Native)',
  'AI Feature Built-in',
  'Real-time Updates',
  'VPS তে Deploy করা',
  'Play Store + App Store',
];

export const STACK = [
  { label: 'MongoDB',                  bg: 'rgba(0,237,100,0.1)',    color: '#00ed64', border: 'rgba(0,237,100,0.2)' },
  { label: 'Express.js',               bg: 'rgba(255,255,255,0.06)', color: '#cbd5e1', border: 'rgba(255,255,255,0.1)' },
  { label: 'React / Next.js',          bg: 'rgba(6,182,212,0.1)',    color: '#06b6d4', border: 'rgba(6,182,212,0.2)' },
  { label: 'Node.js',                  bg: 'rgba(34,197,94,0.1)',    color: '#22c55e', border: 'rgba(34,197,94,0.2)' },
  { label: 'React Native',             bg: 'rgba(124,58,237,0.12)',  color: '#a78bfa', border: 'rgba(124,58,237,0.25)' },
  { label: 'Cursor AI',                bg: 'rgba(245,158,11,0.1)',   color: '#fbbf24', border: 'rgba(245,158,11,0.2)' },
  { label: 'Claude · GPT-4 · Gemini', bg: 'rgba(236,72,153,0.1)',   color: '#f472b6', border: 'rgba(236,72,153,0.2)' },
];

export interface CourseModule {
  num: string;
  title: string;
  subtitle: string;
  topics: string[];
  outcomes: string[];
  tag: string;
  tagStyle: TagStyleKey;
}

export interface CoursePhase {
  id: string;
  phaseNum: string;
  shortLabel: string;
  label: string;
  title: string;
  description: string;
  accent: string;
  cardClass: number;
  modules: CourseModule[];
}

export interface CourseData {
  phases: CoursePhase[];
  stack: typeof STACK;
  capstoneFeatures: typeof CAPSTONE_FEATURES;
  tagStyles: typeof TAG_STYLES;
  cardGradients: typeof CARD_GRADIENTS;
}

export const PHASES: CoursePhase[] = [
  {
    id: 'phase-1',
    phaseNum: '01',
    shortLabel: 'AI Mindset',
    label: 'Phase 01',
    title: 'AI Developer Mindset & AI Mastery',
    description: 'কোড লেখার আগে AI কে সঠিকভাবে ব্যবহার করতে শেখো। Code IDE, সঠিক model বেছে নেওয়া, আর ভালো prompt দেওয়া।',
    accent: '#7c3aed',
    cardClass: 1,
    modules: [
      {
        num: '01',
        title: 'Code IDE — একদম শূন্য থেকে সম্পূর্ণ ধারনা',
        subtitle: 'AI-powered IDE টা ঠিকমতো ব্যবহার না করতে পারলে তুমি অর্ধেক advantage হারাবে।',
        topics: [
          'Tab Autocomplete, Cmd+K, Composer — কোনটা কখন ব্যবহার করবে',
          'Agent mode — কখন চালু রাখবে, কখন বন্ধ',
          'AI কে কোন files দেখাবে — context ঠিকমতো দেওয়া',
          '.cursorrules দিয়ে তোমার project-এর নিজস্ব rules বানানো',
        ],
        outcomes: [
          'AI দিয়ে দ্রুত code লিখতে পারবে',
          'AI কে সঠিক context দিতে পারবে',
          'নিজের project-এ custom rules set করতে পারবে',
        ],
        tag: 'Concept',
        tagStyle: 'concept',
      },
      {
        num: '02',
        title: 'কোন AI Model কখন ব্যবহার করবে?',
        subtitle: 'সব কাজে একই model ব্যবহার করলে আপনার টোকেন নষ্ট হবে, সময় যাবে, output ও ভালো হবে না।',
        topics: [
          'Claude 3.5 Sonnet, GPT-4o, Gemini — কে কোন কাজে সেরা',
          'Reasoning model (o1, Claude Thinking) কখন দরকার পড়ে',
          'Cost আর quality-র মধ্যে balance কীভাবে রাখবে',
          'Code লেখা, debug করা, plan করা — আলাদা model কেন?',
        ],
        outcomes: [
          'কাজ অনুযায়ী সঠিক AI model বেছে নিতে পারবে',
          'অপ্রয়োজনীয় খরচ এড়াতে পারবে',
          'প্রতিটা model-এর শক্তি কাজে লাগাতে পারবে',
        ],
        tag: 'Concept',
        tagStyle: 'concept',
      },
      {
        num: '03',
        title: 'Developer-এর জন্য Prompt Engineering',
        subtitle: 'ভালো prompt মানে ভালো code — এটা একটা skill, practice করলে আসে।',
        topics: [
          'ভালো prompt আর খারাপ prompt-এর real example দেখবে',
          'System prompt দিয়ে AI কে তোমার developer বানানো',
          'Stack, pattern, constraint দিয়ে context-rich prompt লেখা',
          'বড় feature-কে ছোট ছোট step-এ ভাঙা',
          'Iterative refinement — একবারে perfect না হলে কী করবে',
        ],
        outcomes: [
          'AI থেকে কাজের code বের করে আনতে পারবে',
          'বড় feature ছোট ছোট prompt-এ ভাগ করে করতে পারবে',
          'Prompt দিয়ে AI কে guide করতে পারবে',
        ],
        tag: 'AI-Powered',
        tagStyle: 'ai',
      },
      {
        num: '04',
        title: 'AI দিয়ে Project Architecture Plan করা',
        subtitle: 'কোড লেখার আগে plan করা — এটাই professional developers করে।',
        topics: [
          'PRD (Product Requirement Doc) AI দিয়ে তৈরি করা',
          'Database schema AI-কে দিয়ে design করানো',
          'Folder structure আর code architecture ঠিক করা',
          'Tech stack decide করা — কী নেব, কী নেব না এবং কেন',
          'Cursor Composer দিয়ে পুরো project-এর scaffold বানানো',
        ],
        outcomes: [
          'যেকোনো project শুরু করার আগে solid plan বানাতে পারবে',
          'Database schema নিজে design করতে পারবে',
          'Cursor দিয়ে project boilerplate তৈরি করতে পারবে',
        ],
        tag: 'AI-Powered',
        tagStyle: 'ai',
      },
    ],
  },
  {
    id: 'bridge',
    phaseNum: '🔗',
    shortLabel: 'TypeScript',
    label: 'Bridge',
    title: 'TypeScript — JavaScript থেকে TypeScript-এ',
    description: 'তুমি JavaScript জানো? তাহলে TypeScript শেখা তোমার জন্য কঠিন না। এই bridge module-এ JS developer-দের জন্য TS শেখানো হবে — Cursor AI দিয়ে type error fix করতে করতে।',
    accent: '#38bdf8',
    cardClass: 0,
    modules: [
      {
        num: '05',
        title: 'TypeScript — JavaScript Developer-এর জন্য',
        subtitle: 'TypeScript না জানলে বড় project-এ কাজ করতে পারবে না — এটা এখন industry standard।',
        topics: [
          'TypeScript কেন দরকার — real project-এ কী সমস্যা solve করে',
          'Types, Interfaces, Enums — AI দিয়ে type লেখা আর বোঝা',
          'Generics — কখন লাগে, কীভাবে লিখতে হয়',
          'পুরনো JS codebase-কে TypeScript-এ নিয়ে যাওয়া',
          'tsconfig.json — strict mode, paths alias সেটআপ',
          'Node.js + Express-এ TypeScript — types, declaration files',
          'React + TypeScript — component props আর hooks type করা',
          'React Native + TypeScript — navigation types, API response types',
          'AI দিয়ে type error fix করা আর "any" trap এড়ানো',
        ],
        outcomes: [
          'TypeScript-এ নতুন project শুরু করতে পারবে',
          'JavaScript project-কে TypeScript-এ migrate করতে পারবে',
          'Type error দেখলে নিজে fix করতে পারবে',
        ],
        tag: 'JS → TS Bridge',
        tagStyle: 'bridge',
      },
    ],
  },
  {
    id: 'phase-2',
    phaseNum: '02',
    shortLabel: 'Backend',
    label: 'Phase 02',
    title: 'Backend — Node.js, Express আর MongoDB',
    description: 'Frontend সুন্দর হলেই হয় না — backend না জানলে real app বানানো সম্ভব না। এই phase-এ তুমি পুরো server-side শিখবে — database থেকে authentication, real-time পর্যন্ত।',
    accent: '#06b6d4',
    cardClass: 2,
    modules: [
      {
        num: '06',
        title: 'REST API তৈরি করা — AI দিয়ে',
        subtitle: 'প্রতিটা app-এর পেছনে একটা API থাকে — সেটা বানানো শেখো।',
        topics: [
          'Express.js project setup — AI দিয়ে boilerplate তৈরি করা',
          'Route, Controller, Service layer pattern বোঝা',
          'Mongoose schema আর validation AI দিয়ে লেখা',
          'CRUD endpoints — AI generate করবে, তুমি review করবে',
          'Error handling middleware কীভাবে সাজাবে',
        ],
        outcomes: [
          'নিজে REST API বানাতে পারবে',
          'Database-এর সাথে connect করতে পারবে',
          'Error সুন্দরভাবে handle করতে পারবে',
        ],
        tag: 'Mini Project',
        tagStyle: 'project',
      },
      {
        num: '07',
        title: 'Auth System — JWT + Refresh Token',
        subtitle: 'Login, logout, role — এগুলো ছাড়া কোনো real app চলে না।',
        topics: [
          'Register, Login, Logout-এর পুরো flow বানানো',
          'JWT access token + refresh token strategy',
          'Role-based access control (RBAC) implement করা',
          'AI দিয়ে auth middleware তৈরি আর review করা',
          'Google OAuth দিয়ে social login',
        ],
        outcomes: [
          'Secure auth system বানাতে পারবে',
          'JWT token কীভাবে কাজ করে বুঝতে পারবে',
          'Admin আর user-এর জন্য আলাদা permission দিতে পারবে',
        ],
        tag: 'Concept',
        tagStyle: 'concept',
      },
      {
        num: '08',
        title: 'Advanced MongoDB + Aggregation',
        subtitle: 'Simple find() জানলে হবে না — complex data query করতে হলে aggregation লাগে।',
        topics: [
          'Complex query AI দিয়ে লেখা আর বোঝা',
          'Aggregation pipeline — AI বুঝিয়ে দেবে, তুমি debug করবে',
          'Indexing দিয়ে database-এর speed বাড়ানো',
          'Population vs Lookup — কোন situation-এ কোনটা নেবে',
        ],
        outcomes: [
          'Complex database query নিজে লিখতে পারবে',
          'Database slow হলে কোথায় সমস্যা সেটা ধরতে পারবে',
          'Aggregation pipeline বুঝতে পারবে',
        ],
        tag: 'AI-Powered',
        tagStyle: 'ai',
      },
      {
        num: '09',
        title: 'File Upload, Email আর Third-party API',
        subtitle: 'Real app-এ photo upload, email পাঠানো, payment — এগুলো সব লাগে।',
        topics: [
          'Multer + Cloudinary দিয়ে image upload করা',
          'Nodemailer বা SendGrid দিয়ে email পাঠানো',
          'Payment gateway — SSLCommerz বা Stripe integration',
          'Webhook কীভাবে handle করে',
          'AI দিয়ে integration code draft করা আর fix করা',
        ],
        outcomes: [
          'File upload feature বানাতে পারবে',
          'Email notification পাঠাতে পারবে',
          'Payment integration করতে পারবে',
        ],
        tag: 'Mini Project',
        tagStyle: 'project',
      },
      {
        num: '10',
        title: 'Real-time Features — Socket.io',
        subtitle: 'Chat app, live notification — এগুলো যেভাবে কাজ করে সেটা জানবে।',
        topics: [
          'WebSocket আর HTTP-এর পার্থক্য — কোথায় কোনটা লাগে',
          'Real-time notification আর live update করা',
          'Chat feature-এর architecture কীভাবে সাজাবে',
          'Cursor AI দিয়ে socket event handler লেখা',
          'Scaling-এর জন্য Redis Pub/Sub — basic ধারণা',
        ],
        outcomes: [
          'Real-time feature যেকোনো app-এ add করতে পারবে',
          'Chat system-এর architecture বুঝতে পারবে',
          'Socket.io দিয়ে live data push করতে পারবে',
        ],
        tag: 'Advanced',
        tagStyle: 'advanced',
      },
    ],
  },
  {
    id: 'phase-3',
    phaseNum: '03',
    shortLabel: 'Frontend',
    label: 'Phase 03',
    title: 'Frontend — React আর Next.js',
    description: 'UI বানানো আর্ট — কিন্তু AI দিয়ে করলে সেই আর্টটা দ্রুত হয়। এই phase-এ React, Next.js, state management, আর modern UI বানানো শিখবে Cursor-এর সাহায্যে।',
    accent: '#22c55e',
    cardClass: 3,
    modules: [
      {
        num: '11',
        title: 'Cursor দিয়ে React Component বানানো',
        subtitle: 'Component-driven development মানে ছোট ছোট piece দিয়ে বড় app বানানো।',
        topics: [
          'AI দিয়ে component তৈরির সঠিক workflow',
          'Props, state, context — AI দিয়ে explain করিয়ে বোঝা',
          'Custom hooks — AI লিখবে, তুমি বুঝবে আর কাস্টমাইজ করবে',
          'Screenshot বা Figma থেকে সরাসরি component বানানো',
          'Component library দিয়ে দ্রুত UI তৈরি করা',
        ],
        outcomes: [
          'যেকোনো UI design দেখে component বানাতে পারবে',
          'Reusable component তৈরি করতে পারবে',
          'Custom hooks বুঝতে আর লিখতে পারবে',
        ],
        tag: 'AI-Powered',
        tagStyle: 'ai',
      },
      {
        num: '12',
        title: 'State Management — Zustand + React Query',
        subtitle: 'Data কোথায় রাখবে, কীভাবে share করবে — এটা বুঝলেই app structure clear হয়।',
        topics: [
          'Global state কখন দরকার, local state কখন যথেষ্ট',
          'Zustand দিয়ে store design করা — AI সাথে থাকবে',
          'React Query দিয়ে server data manage করা',
          'Optimistic update, caching, auto-refetch করা',
          'Complex state logic debug করা AI দিয়ে',
        ],
        outcomes: [
          'App-এর data flow সুন্দরভাবে সাজাতে পারবে',
          'API call-এর জন্য React Query ব্যবহার করতে পারবে',
          'State-related bug ধরতে পারবে',
        ],
        tag: 'Concept',
        tagStyle: 'concept',
      },
      {
        num: '13',
        title: 'Next.js — App Router আর Server Components',
        subtitle: 'Next.js জানলে তুমি একাই web app-এর frontend + backend দুটোই সামলাতে পারবে।',
        topics: [
          'App Router vs Pages Router — কোনটা কখন ব্যবহার করবে',
          'Server Component আর Client Component-এর পার্থক্য',
          'Server Action দিয়ে backend logic লেখা',
          'SEO, metadata, OG image — সব Next.js দিয়েই',
          'AI দিয়ে Next.js project scaffold করা',
        ],
        outcomes: [
          'Next.js দিয়ে full-stack web app বানাতে পারবে',
          'SSR, SSG, ISR-এর পার্থক্য বুঝতে পারবে',
          'SEO-friendly page তৈরি করতে পারবে',
        ],
        tag: 'Mini Project',
        tagStyle: 'project',
      },
      {
        num: '14',
        title: 'UI/UX — Tailwind, shadcn আর Animations',
        subtitle: 'সুন্দর UI বানাতে designer হতে হয় না — সঠিক tools জানলেই হয়।',
        topics: [
          'Design দেখে code করা: screenshot → Cursor → component',
          'shadcn/ui দিয়ে professional UI দ্রুত তৈরি করা',
          'Framer Motion দিয়ে smooth animation',
          'Responsive design-এর সমস্যা AI দিয়ে fix করা',
          'Dark mode implement করা',
        ],
        outcomes: [
          'Tailwind + shadcn দিয়ে professional UI বানাতে পারবে',
          'App-এ animation যোগ করতে পারবে',
          'Mobile আর desktop দুটোতেই সুন্দর design করতে পারবে',
        ],
        tag: 'AI-Powered',
        tagStyle: 'ai',
      },
    ],
  },
  {
    id: 'phase-4',
    phaseNum: '04',
    shortLabel: 'Mobile',
    label: 'Phase 04',
    title: 'Mobile App — React Native + Expo',
    description: 'Web developer হিসেবে তুমি React জানো — সেই knowledge দিয়েই এখন mobile app বানাও। React Native শিখলে একটাই code দিয়ে Android আর iOS দুটোতে app দেওয়া যায়।',
    accent: '#f59e0b',
    cardClass: 4,
    modules: [
      {
        num: '15',
        title: 'React Native-এর শুরু — Cursor দিয়ে',
        subtitle: 'React জানলে React Native শেখা অনেক সহজ — পার্থক্যটুকু বুঝলেই হয়।',
        topics: [
          'Expo setup + Cursor দিয়ে project scaffold করা',
          'React Native আর React-এর পার্থক্য — AI দিয়ে translate করা',
          'NativeWind দিয়ে Tailwind-এর মতো styling',
          'Expo Router দিয়ে navigation setup',
          'iOS আর Android-এর জন্য আলাদা code কখন লিখতে হয়',
        ],
        outcomes: [
          'React Native project শুরু করতে পারবে',
          'Web থেকে mobile-এ transition করতে পারবে',
          'Navigation বানাতে পারবে',
        ],
        tag: 'Concept',
        tagStyle: 'concept',
      },
      {
        num: '16',
        title: 'Mobile UI Pattern আর Native Features',
        subtitle: 'Mobile app মানে শুধু ছোট screen না — camera, notification, offline এগুলোও দরকার।',
        topics: [
          'Bottom tab, drawer, modal navigation বানানো',
          'Camera, gallery, file picker ব্যবহার করা',
          'Push notification implement করা — Expo দিয়ে',
          'Offline-first app — AsyncStorage বা MMKV দিয়ে',
          'AI দিয়ে RN component generate আর debug করা',
        ],
        outcomes: [
          'Native device feature app-এ add করতে পারবে',
          'Push notification পাঠাতে পারবে',
          'Offline-capable app বানাতে পারবে',
        ],
        tag: 'Mini Project',
        tagStyle: 'project',
      },
      {
        num: '17',
        title: 'Web + Mobile একসাথে — Monorepo',
        subtitle: 'একই backend, একই types, web আর mobile-এ — code duplication শূন্য।',
        topics: [
          'Turborepo বা Nx দিয়ে monorepo setup করা',
          'Shared API layer, types, utility — একবার লিখে দুই জায়গায় ব্যবহার',
          'Business logic share করা — শুধু UI আলাদা রাখা',
          'Cursor দিয়ে cross-platform refactoring করা',
        ],
        outcomes: [
          'Web আর mobile একই codebase থেকে maintain করতে পারবে',
          'Code duplication কমাতে পারবে',
          'Monorepo architecture বুঝতে পারবে',
        ],
        tag: 'Advanced',
        tagStyle: 'advanced',
      },
    ],
  },
  {
    id: 'phase-5',
    phaseNum: '05',
    shortLabel: 'AI + DevOps',
    label: 'Phase 05',
    title: 'AI Features + DevOps + Deployment',
    description: 'Code করা শিখলে — এবার সেটা deploy করো, publish করো, আর app-এর ভেতরেই AI বসাও। এই phase-এ তুমি একজন complete developer হিসেবে নিজেকে তৈরি করবে।',
    accent: '#ec4899',
    cardClass: 5,
    modules: [
      {
        num: '18',
        title: 'App-এর ভেতরে AI বসানো',
        subtitle: 'ChatGPT use করা আর app-এ AI integrate করা — দুটো সম্পূর্ণ আলাদা জিনিস।',
        topics: [
          'OpenAI, Anthropic, Gemini API app-এ integrate করা',
          'Streaming response — typewriter effect implement করা',
          'RAG (Retrieval Augmented Generation)-এর basic',
          'AI chatbot feature — backend + frontend দুটো মিলিয়ে',
          'Image generation API integration',
        ],
        outcomes: [
          'যেকোনো app-এ AI feature যোগ করতে পারবে',
          'Streaming chat UI বানাতে পারবে',
          'AI API-এর সাথে কাজ করতে পারবে',
        ],
        tag: 'AI-Powered',
        tagStyle: 'ai',
      },
      {
        num: '19',
        title: 'AI দিয়ে Testing করা',
        subtitle: 'Test লেখা boring মনে হয়? AI দিয়ে auto-generate করলে আর boring না।',
        topics: [
          'Unit test লেখা — AI দিয়ে automatically তৈরি করা',
          'Jest + React Testing Library ব্যবহার করা',
          'API test করা — Supertest দিয়ে',
          'AI দিয়ে bug reproduce করা আর সেটার জন্য test লেখা',
          'Test coverage বাড়ানোর কার্যকর strategy',
        ],
        outcomes: [
          'নিজের লেখা code-এর জন্য test লিখতে পারবে',
          'AI দিয়ে test auto-generate করতে পারবে',
          'Bug ধরার জন্য test-এর সাহায্য নিতে পারবে',
        ],
        tag: 'Concept',
        tagStyle: 'concept',
      },
      {
        num: '20',
        title: 'GitHub — Solo Developer-এর Workflow',
        subtitle: 'একা কাজ করলেও Git discipline থাকা দরকার — না হলে নিজেই নিজের code হারাবে।',
        topics: [
          'Git init থেকে GitHub push — পুরো solo workflow',
          'Branching strategy: feature branch, main, dev — একা কীভাবে manage করবে',
          'Conventional commit message — AI দিয়ে meaningful commit লেখা',
          'GitHub Issues দিয়ে নিজের task track করা',
          '.gitignore, secrets — কী কখনো push করবে না',
          'Merge conflict — Cursor দিয়ে resolve করা',
          'GitHub Pages বা Release দিয়ে demo deploy করা',
        ],
        outcomes: [
          'Version control ভালোভাবে use করতে পারবে',
          'নিজের project সুন্দরভাবে organize করতে পারবে',
          'GitHub-এ portfolio রাখতে পারবে',
        ],
        tag: 'Concept',
        tagStyle: 'concept',
      },
      {
        num: '21',
        title: 'GitHub — Team-এ কাজ করার Workflow',
        subtitle: 'Team-এ কাজ করা মানে chaos হবে না — সিস্টেম থাকবে।',
        topics: [
          'Organization + repo access management — roles, permissions',
          'Gitflow vs trunk-based — team-এ কোনটা কখন কাজে আসে',
          'Pull Request workflow: branch → PR → review → merge',
          'PR description আর review comment AI দিয়ে লেখা',
          'Protected branches, required reviewers, merge rules',
          'Code review করা আর constructive feedback দেওয়া',
          'GitHub Projects board দিয়ে team-এর task manage করা',
          'Multiple developer-এর conflict কীভাবে handle হয়',
        ],
        outcomes: [
          'Team-এর সাথে GitHub-এ collaborate করতে পারবে',
          'Pull Request properly তৈরি আর review করতে পারবে',
          'Conflict resolve করতে পারবে',
        ],
        tag: 'AI-Powered',
        tagStyle: 'ai',
      },
      {
        num: '22',
        title: 'Deployment — VPS, Docker আর CI/CD',
        subtitle: 'Local-এ কাজ করে তো সবাই — real developer হতে হলে deploy করতে জানতে হবে।',
        topics: [
          'VPS setup (Ubuntu) — Nginx, PM2, SSL certificate',
          'Docker + docker-compose — AI দিয়ে Dockerfile লেখা',
          'GitHub Actions দিয়ে CI/CD pipeline বানানো',
          'Environment variable আর secrets manage করা',
        ],
        outcomes: [
          'VPS-এ app deploy করতে পারবে',
          'Docker দিয়ে app containerize করতে পারবে',
          'Auto-deploy pipeline বানাতে পারবে',
        ],
        tag: 'Advanced',
        tagStyle: 'advanced',
      },
      {
        num: '23',
        title: 'Play Store + App Store-এ App Publish করা',
        subtitle: 'App বানানোর পরে সেটা store-এ publish করাটাও একটা skill।',
        topics: [
          'Expo EAS Build setup — cloud build configure করা',
          'Android: keystore, APK vs AAB — পার্থক্য আর কখন কোনটা',
          'Google Play Console — app create, store listing, screenshot',
          'Play Store review process — internal থেকে production পর্যন্ত',
          'iOS: Apple Developer Account, certificates, provisioning profile',
          'App Store Connect — submit, TestFlight দিয়ে beta test',
          'Reject হলে কী করবে — common issues আর fix',
          'OTA update — store review ছাড়াই JS update push করা',
          'Version bump, changelog, rollout strategy',
        ],
        outcomes: [
          'Android আর iOS দুটো store-এ app publish করতে পারবে',
          'Store rejection সামলাতে পারবে',
          'OTA update push করতে পারবে',
        ],
        tag: 'Ship It',
        tagStyle: 'ship',
      },
      {
        num: '24',
        title: 'Performance আর Security Audit — AI দিয়ে',
        subtitle: 'App slow হলে user চলে যায়, secure না হলে data যায় — দুটোই ঠিক রাখতে হবে।',
        topics: [
          'AI দিয়ে security vulnerability scan করা',
          'Rate limiting, CORS, Helmet.js implement করা',
          'Frontend performance — Lighthouse audit + AI দিয়ে fix',
          'Database query optimization',
          'Monitoring setup — Sentry, Logtail দিয়ে',
        ],
        outcomes: [
          'App-এর security hole ধরতে পারবে',
          'Performance bottleneck identify করতে পারবে',
          'Production-ready secure app deliver করতে পারবে',
        ],
        tag: 'Advanced',
        tagStyle: 'advanced',
      },
    ],
  },
  {
    id: 'phase-6',
    phaseNum: '06',
    shortLabel: 'Pro Workflow',
    label: 'Phase 06',
    title: 'Professional AI Developer Workflow',
    description: 'Technical skill শেখা হয়ে গেছে — এবার সেগুলো দিয়ে professional হিসেবে কাজ করার workflow শেখার পালা। এই phase তোমাকে freelancer থেকে expert developer-এ নিয়ে যাবে।',
    accent: '#8b5cf6',
    cardClass: 6,
    modules: [
      {
        num: '25',
        title: 'বড় Codebase-এ Navigate করা — AI দিয়ে',
        subtitle: 'Job করতে গেলে অন্যের code পড়তে হবে — সেটা AI ছাড়া করা কঠিন।',
        topics: [
          'Legacy code বোঝা — AI দিয়ে explain করিয়ে নেওয়া',
          'বড় file safely refactor করা',
          'Cursor-এর @codebase, @docs, @web — advanced context ব্যবহার',
          'AI দিয়ে technical debt identify করা',
          'JSDoc, README — documentation auto-generate করা',
        ],
        outcomes: [
          'অন্যের codebase-এ দ্রুত কাজ শুরু করতে পারবে',
          'Legacy code বুঝতে পারবে',
          'Documentation তৈরি করতে পারবে',
        ],
        tag: 'Advanced',
        tagStyle: 'advanced',
      },
      {
        num: '26',
        title: 'Debugging Mastery — AI দিয়ে',
        subtitle: 'Bug fix করতে পারা মানে তুমি সত্যিকারের developer।',
        topics: [
          'Error message → AI diagnosis → fix — এই loop-টা আয়ত্ত করা',
          'Console, Network tab, Breakpoints + AI — সব একসাথে',
          'Stack trace পড়া AI-এর সাহায্যে',
          'Rubber duck debugging 2.0 — AI-কে বলো, AI suggest করবে',
          'Production-এ bug hunt করার strategy',
        ],
        outcomes: [
          'যেকোনো error দ্রুত debug করতে পারবে',
          'Production bug ধরতে পারবে',
          'AI-কে debugging tool হিসেবে ব্যবহার করতে পারবে',
        ],
        tag: 'Concept',
        tagStyle: 'concept',
      },
      {
        num: '27',
        title: 'Multi-Agent আর MCP Tools',
        subtitle: 'Future of development — AI agent দিয়ে কাজ করানো।',
        topics: [
          'MCP (Model Context Protocol) কী আর কেন এটা important',
          'Cursor-এ MCP server connect করা',
          'Browser, Database, API — MCP দিয়ে direct access',
          'AI agent দিয়ে automated task করানো',
          'Agentic development-এর future কোথায় যাচ্ছে',
        ],
        outcomes: [
          'MCP server setup করতে পারবে',
          'AI agent দিয়ে repetitive task automate করতে পারবে',
          'Next-generation development workflow বুঝতে পারবে',
        ],
        tag: 'Advanced',
        tagStyle: 'advanced',
      },
      {
        num: '28',
        title: 'Freelancing আর Client Delivery — AI দিয়ে',
        subtitle: 'Skill আছে কিন্তু client নেই? এই module-এ সেটাও শেখানো হবে।',
        topics: [
          'AI দিয়ে project estimate করা — accurately',
          'Client requirement থেকে technical spec বানানো',
          'AI workflow দিয়ে delivery speed বাড়ানো',
          'Code handoff, documentation, client onboarding',
          'Pricing strategy — AI productivity factor কীভাবে কাজে লাগাবে',
        ],
        outcomes: [
          'Client-এর requirement বুঝে technical plan তৈরি করতে পারবে',
          'Project সময়মতো deliver করতে পারবে',
          'Freelancing career শুরু করার confidence পাবে',
        ],
        tag: 'Business',
        tagStyle: 'business',
      },
    ],
  },
];

export const COURSE_DATA: CourseData = {
  phases: PHASES,
  stack: STACK,
  capstoneFeatures: CAPSTONE_FEATURES,
  tagStyles: TAG_STYLES,
  cardGradients: CARD_GRADIENTS,
};
