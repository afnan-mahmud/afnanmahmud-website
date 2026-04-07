import Hero from '@/components/home/Hero';
import FeaturedCourse from '@/components/home/FeaturedCourse';
import WhyAfnan from '@/components/home/WhyAfnan';
import Testimonials from '@/components/home/Testimonials';
import CtaBanner from '@/components/home/CtaBanner';

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

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedCourse />
      <WhyAfnan />
      <Testimonials />
      <CtaBanner />
    </>
  );
}
