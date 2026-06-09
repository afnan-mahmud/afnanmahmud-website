import Hero from '@/components/home/Hero';
import TrustedBy from '@/components/home/TrustedBy';
import Experience from '@/components/home/Experience';
import TechStack from '@/components/home/TechStack';
import FeaturedProjects from '@/components/home/FeaturedProjects';
import FeaturedCourse from '@/components/home/FeaturedCourse';
import WhyAfnan from '@/components/home/WhyAfnan';
import Testimonials from '@/components/home/Testimonials';
import CtaBanner from '@/components/home/CtaBanner';
import { PROJECTS } from '@/lib/home-data';
import { connectDB } from '@/lib/db';
import { Course } from '@/models/Course';

export const metadata = {
  title: 'Afnan Mahmud — Senior Full-Stack Engineer & MERN Educator',
  description:
    'Senior Full-Stack Engineer (5+ years). I build production web & mobile products and teach MERN + mobile development in Bangla. Explore courses or hire me.',
  openGraph: {
    title: 'Afnan Mahmud — Senior Full-Stack Engineer & MERN Educator',
    description: 'Build real products and learn full-stack development in Bangla with Afnan Mahmud.',
    type: 'website',
  },
};

export default async function HomePage() {
  await connectDB();

  const featured = await Course.findOne({ slug: 'ai-for-developers' })
    .select('thumbnail')
    .lean<{ thumbnail?: string }>();

  const agg = await Course.aggregate<{ total: number }>([
    { $match: { isPublished: true } },
    { $group: { _id: null, total: { $sum: '$enrolledCount' } } },
  ]);
  const studentCount = agg[0]?.total ?? 0;

  return (
    <>
      <Hero studentCount={studentCount} projectCount={PROJECTS.length} />
      <TrustedBy />
      <Experience />
      <TechStack />
      <FeaturedProjects />
      <FeaturedCourse thumbnail={featured?.thumbnail} />
      <WhyAfnan />
      <Testimonials />
      <CtaBanner />
    </>
  );
}
