
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Hero } from '@/components/sections/Hero';
import { FeaturedWebinars } from '@/components/sections/FeaturedWebinars';
import { TrendingWebinars } from '@/components/sections/TrendingWebinars';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <FeaturedWebinars />
        <TrendingWebinars />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
