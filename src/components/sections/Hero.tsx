
import { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Search, Calendar, TrendingUp, Users, Globe, ArrowRight } from 'lucide-react';

export const Hero = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('opacity-100', 'translate-y-0');
          entry.target.classList.remove('opacity-0', 'translate-y-8');
        }
      });
    }, { threshold: 0.1 });
    
    const children = heroRef.current?.querySelectorAll('.animate-item');
    children?.forEach(child => {
      observer.observe(child);
      child.classList.add('transition-all', 'duration-700', 'ease-out', 'opacity-0', 'translate-y-8');
    });
    
    return () => observer.disconnect();
  }, []);

  return (
    <div className="bg-gradient-to-b from-webi-lightblue/40 to-white pt-32 md:pt-40 pb-20">
      <div className="container-tight text-center" ref={heroRef}>
        <div className="animate-item">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-webi-lightblue border border-webi-blue/20 text-webi-blue font-medium text-sm mb-6">
            <span className="mr-2">✨</span>
            The smarter way to discover and join webinars
          </div>
        </div>
        
        <h1 className="animate-item text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tighter">
          Elevate Your Learning<br />Through Expert Webinars
        </h1>
        
        <p className="animate-item text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
          Discover, book, and manage webinars and online events with AI-powered recommendations, networking tools, and seamless booking integration.
        </p>
        
        <div className="animate-item space-y-4 sm:space-y-0 sm:flex sm:justify-center sm:space-x-4 mb-16">
          <Link to="/signup">
            <Button size="lg" className="w-full sm:w-auto group">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          
          <Link to="/discover">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              Browse Webinars
            </Button>
          </Link>
        </div>
        
        <div className="animate-item grid md:grid-cols-4 sm:grid-cols-2 gap-6 max-w-4xl mx-auto text-center">
          <div className="bg-white/50 backdrop-blur-sm p-6 rounded-xl border border-border flex flex-col items-center transition-all hover:shadow-md hover:bg-white/80">
            <div className="h-12 w-12 rounded-full bg-webi-lightblue flex items-center justify-center mb-4">
              <Calendar className="h-6 w-6 text-webi-blue" />
            </div>
            <h3 className="font-medium mb-2">One-Click Booking</h3>
            <p className="text-muted-foreground text-sm">Seamless registration and calendar integration</p>
          </div>
          
          <div className="bg-white/50 backdrop-blur-sm p-6 rounded-xl border border-border flex flex-col items-center transition-all hover:shadow-md hover:bg-white/80">
            <div className="h-12 w-12 rounded-full bg-webi-lightblue flex items-center justify-center mb-4">
              <TrendingUp className="h-6 w-6 text-webi-blue" />
            </div>
            <h3 className="font-medium mb-2">AI-Powered</h3>
            <p className="text-muted-foreground text-sm">Personalized webinar recommendations</p>
          </div>
          
          <div className="bg-white/50 backdrop-blur-sm p-6 rounded-xl border border-border flex flex-col items-center transition-all hover:shadow-md hover:bg-white/80">
            <div className="h-12 w-12 rounded-full bg-webi-lightblue flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-webi-blue" />
            </div>
            <h3 className="font-medium mb-2">Networking</h3>
            <p className="text-muted-foreground text-sm">Connect with speakers and attendees</p>
          </div>
          
          <div className="bg-white/50 backdrop-blur-sm p-6 rounded-xl border border-border flex flex-col items-center transition-all hover:shadow-md hover:bg-white/80">
            <div className="h-12 w-12 rounded-full bg-webi-lightblue flex items-center justify-center mb-4">
              <Globe className="h-6 w-6 text-webi-blue" />
            </div>
            <h3 className="font-medium mb-2">Global Events</h3>
            <p className="text-muted-foreground text-sm">Access webinars from around the world</p>
          </div>
        </div>
      </div>
    </div>
  );
};
