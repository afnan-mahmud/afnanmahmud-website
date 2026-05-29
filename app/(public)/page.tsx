import Hero from '@/components/home/Hero';
import FeaturedCourse from '@/components/home/FeaturedCourse';
import WhyAfnan from '@/components/home/WhyAfnan';
import Testimonials from '@/components/home/Testimonials';
import CtaBanner from '@/components/home/CtaBanner';
import { connectDB } from '@/lib/db';
import { Course } from '@/models/Course';

export const metadata = {
  title: 'Afnan Mahmud — Learn MERN & Mobile App Development',
  description:
    'Learn full-stack web and mobile app development with Afnan Mahmud. Real projects, Bangla explanation.',
  openGraph: {
    title: 'Afnan Mahmud — Learn MERN & Mobile App Development',
    description: 'Learn full-stack web and mobile app development with Afnan Mahmud. Real projects, Bangla explanation.',
    type: 'website',
  },
};

export default async function HomePage() {
  await connectDB();
  const featured = await Course.findOne({ slug: 'ai-for-developers' })
    .select('thumbnail')
    .lean<{ thumbnail?: string }>();

  return (
    <>
      <Hero />
      <FeaturedCourse thumbnail={featured?.thumbnail} />
      <WhyAfnan />
      <Testimonials />
      <CtaBanner />
    </>
  );
}
