
import { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FeaturedWebinar } from '@/components/ui/FeaturedWebinar';
import { WebinarType } from '@/components/ui/WebinarCard';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

// Sample data
const featuredWebinar: WebinarType = {
  id: "1",
  title: "The Future of AI in Business: Trends and Predictions",
  description: "Join leading AI researchers and business leaders as they explore how artificial intelligence is transforming industries and what to expect in the coming years.",
  imageUrl: "https://images.unsplash.com/photo-1591453089816-0fbb971b454c?q=80&w=2070&auto=format&fit=crop",
  date: "2023-12-15",
  time: "2:00 PM EST",
  duration: "90 min",
  speaker: {
    name: "Dr. Sarah Chen",
    role: "Head of AI Research",
    company: "TechFuture Labs"
  },
  category: "Technology",
  isFeatured: true,
  isPaid: true,
  price: "$49"
};

export const FeaturedWebinars = () => {
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
    <section className="py-16 md:py-24" ref={sectionRef}>
      <div className="container-wide">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="animate-item text-3xl md:text-4xl font-bold tracking-tight">
              Featured Webinars
            </h2>
            <p className="animate-item text-muted-foreground mt-3 max-w-xl">
              Curated selection of high-quality webinars from industry experts and thought leaders.
            </p>
          </div>
          
          <Link to="/featured" className="animate-item hidden md:flex">
            <Button variant="outline" className="group">
              View All 
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
        
        <div className="animate-item">
          <FeaturedWebinar webinar={featuredWebinar} />
        </div>
        
        <div className="animate-item mt-6 md:hidden text-center">
          <Link to="/featured">
            <Button variant="outline" className="group">
              View All Featured
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
