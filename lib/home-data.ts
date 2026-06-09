// lib/home-data.ts
// Single source of truth for homepage profile content. Edit here, not in components.

export const PROFILE = {
  name: 'Afnan Mahmud',
  title: 'Senior Full-Stack Engineer',
  yearsExperience: 5, // "5+ years"
  github: 'https://github.com/afnan-mahmud',
  tagline:
    'I build production web & mobile products — and teach you to do the same, in Bangla.',
} as const;

export const COMPANIES: { name: string }[] = [
  { name: 'Grameenphone' },
  { name: 'Cholo Bohudur' },
  { name: 'Thaka Jabe' },
  { name: 'Gowaay' },
];

export type TechCategory = {
  key: string;
  label: string;
  items: string[];
  color: string;
};

export const TECH_STACK: TechCategory[] = [
  { key: 'frontend', label: 'Frontend', items: ['React', 'Next.js', 'TypeScript', 'Tailwind'], color: '#61dafb' },
  { key: 'backend', label: 'Backend', items: ['Node.js', 'Express', 'NestJS', 'Python'], color: '#68d391' },
  { key: 'database', label: 'Database', items: ['MongoDB', 'PostgreSQL'], color: '#4ade80' },
  { key: 'devops', label: 'DevOps', items: ['Docker', 'AWS', 'VPS'], color: '#fbbf24' },
  { key: 'mobile', label: 'Mobile', items: ['React Native', 'Flutter'], color: '#a78bfa' },
];

export type Project = {
  name: string;
  description: string;
  stack: string[];
  color: string;
};

export const PROJECTS: Project[] = [
  {
    name: 'Grameenphone',
    description: 'Contributed to large-scale customer-facing web features for the leading telecom operator in Bangladesh.',
    stack: ['React', 'Next.js', 'Node.js'],
    color: '#6366f1',
  },
  {
    name: 'Cholo Bohudur',
    description: 'Founder & lead engineer of the agency — delivering full-stack web & mobile products for clients.',
    stack: ['Next.js', 'NestJS', 'PostgreSQL'],
    color: '#22d3ee',
  },
  {
    name: 'Thaka Jabe',
    description: 'Built and shipped the platform end-to-end, from API design to a polished responsive frontend.',
    stack: ['React', 'Node.js', 'MongoDB'],
    color: '#a78bfa',
  },
  {
    name: 'Gowaay',
    description: 'Engineered core product features with a focus on performance and clean, maintainable architecture.',
    stack: ['React Native', 'Express', 'MongoDB'],
    color: '#4ade80',
  },
];

// The 3D orbit badges (kept short for performance).
export const ORBIT_TECH: { label: string; color: string }[] = [
  { label: 'React', color: '#61dafb' },
  { label: 'Node', color: '#68d391' },
  { label: 'Mongo', color: '#4ade80' },
  { label: 'Next', color: '#ffffff' },
  { label: 'Docker', color: '#38bdf8' },
  { label: 'TS', color: '#3178c6' },
];
