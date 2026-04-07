import type { Metadata } from 'next';
import CourseOutlineClient from './CourseOutlineClient';
import { COURSE_DATA } from './data';

export const metadata: Metadata = {
  title: 'AI দিয়ে Full-Stack Mobile App and Website Development | Afnan Mahmud',
  description:
    'AI দিয়ে MERN Stack (Website) + React Native (Mobile App Android & iOS) শিখে real-world production app বানাও। ৬টি Phase, ২৮টি Module, ৫টির বেশি Live Project — শূন্য থেকে শুরু করে professional developer হও।',
  openGraph: {
    title: 'AI দিয়ে Full-Stack Mobile App and Website Development | Afnan Mahmud',
    description: 'AI দিয়ে MERN Stack (Website) + React Native (Mobile App Android & iOS) শিখুন।',
    url: '/mobile-app-development-by-ai',
    type: 'website',
  },
};

export default function CourseOutlinePage() {
  return <CourseOutlineClient data={COURSE_DATA} />;
}
