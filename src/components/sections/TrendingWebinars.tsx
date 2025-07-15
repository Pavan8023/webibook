
import { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { WebinarCard, WebinarType } from '@/components/ui/WebinarCard';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

// Sample data
const trendingWebinars: WebinarType[] = [
  {
    id: "2",
    title: "Mastering Digital Marketing in 2024",
    description: "Learn cutting-edge digital marketing strategies to grow your audience, increase conversions, and maximize ROI in today's competitive landscape.",
    imageUrl: "https://images.unsplash.com/photo-1533750349088-cd871a92f312?q=80&w=2070&auto=format&fit=crop",
    date: "2023-12-10",
    time: "11:00 AM EST",
    duration: "60 min",
    speaker: {
      name: "Jessica Thompson",
      role: "Marketing Director",
      company: "GrowthLab"
    },
    category: "Marketing",
    isTrending: true,
  },
  {
    id: "3",
    title: "Blockchain Technology: Beyond Cryptocurrency",
    description: "Explore practical applications of blockchain technology across various industries and discover how it's revolutionizing business processes.",
    imageUrl: "https://images.unsplash.com/photo-1639762681057-408e52192e55?q=80&w=2232&auto=format&fit=crop",
    date: "2023-12-18",
    time: "1:00 PM EST",
    duration: "75 min",
    speaker: {
      name: "Michael Reynolds",
      role: "Blockchain Consultant",
      company: "Chain Innovations"
    },
    category: "Technology",
    isTrending: true,
    isPaid: true,
    price: "$39"
  },
  {
    id: "4",
    title: "Leading Remote Teams: Best Practices",
    description: "Discover effective strategies for managing distributed teams, boosting productivity, and maintaining company culture in remote work environments.",
    imageUrl: "https://images.unsplash.com/photo-1603201667141-5a2d4c673378?q=80&w=2096&auto=format&fit=crop",
    date: "2023-12-20",
    time: "3:30 PM EST",
    duration: "60 min",
    speaker: {
      name: "David Liu",
      role: "COO",
      company: "RemoteFirst"
    },
    category: "Leadership",
    isTrending: true,
  },
  {
    id: "5",
    title: "Financial Planning for Entrepreneurs",
    description: "Learn essential financial strategies for entrepreneurs, from bootstrapping and raising capital to managing cash flow and planning for growth.",
    imageUrl: "https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?q=80&w=2187&auto=format&fit=crop",
    date: "2023-12-22",
    time: "12:00 PM EST",
    duration: "90 min",
    speaker: {
      name: "Sophia Martinez",
      role: "Financial Advisor",
      company: "Founder Capital"
    },
    category: "Finance",
    isTrending: true,
    isPaid: true,
    price: "$45"
  },
];

export const TrendingWebinars = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('opacity-100', 'translate-y-0');
          entry.target.classList.remove('opacity-0', 'translate-y-8');
        }
      });
    }, { threshold: 0.1 });
    
    const children = sectionRef.current?.querySelectorAll('.animate-item');
    children?.forEach(child => {
      observer.observe(child);
      child.classList.add('transition-all', 'duration-700', 'ease-out', 'opacity-0', 'translate-y-8');
    });
    
    return () => observer.disconnect();
  }, []);

  return (
    <section className="py-16 md:py-24 bg-secondary/50" ref={sectionRef}>
      <div className="container-wide">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="animate-item text-3xl md:text-4xl font-bold tracking-tight">
              Trending Webinars
            </h2>
            <p className="animate-item text-muted-foreground mt-3 max-w-xl">
              Discover the most popular webinars that are making waves right now.
            </p>
          </div>
          
          <Link to="/trending" className="animate-item hidden md:flex">
            <Button variant="outline" className="group">
              View All 
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
        
        <div className="animate-item grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {trendingWebinars.map((webinar) => (
            <WebinarCard key={webinar.id} webinar={webinar} />
          ))}
        </div>
        
        <div className="animate-item mt-10 md:hidden text-center">
          <Link to="/trending">
            <Button variant="outline" className="group">
              View All Trending
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
