
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CategoryBadge } from './CategoryBadge';
import { Calendar, Clock, User, ArrowRight } from 'lucide-react';
import { WebinarType } from './WebinarCard';

interface FeaturedWebinarProps {
  webinar: WebinarType;
}

export const FeaturedWebinar = ({ webinar }: FeaturedWebinarProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const formattedDate = new Date(webinar.date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="relative rounded-2xl overflow-hidden bg-black text-white h-[500px] md:h-[600px] lg:h-[650px]">
      <div className="absolute inset-0">
        <img
          src={webinar.imageUrl}
          alt={webinar.title}
          className={`object-cover w-full h-full opacity-50 transition-all duration-500 ${
            imageLoaded ? 'blur-0' : 'blur-sm'
          }`}
          onLoad={() => setImageLoaded(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/30" />
      </div>
      
      <div className="absolute inset-0 flex flex-col justify-end p-6 lg:p-10">
        <div className="container-tight mx-auto">
          <div className="animate-fade-up" style={{ animationDelay: '0.1s' }}>
            <CategoryBadge category={webinar.category} className="mb-3" />
          </div>
          
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 tracking-tight animate-fade-up" style={{ animationDelay: '0.2s' }}>
            {webinar.title}
          </h1>
          
          <p className="text-white/80 text-lg max-w-2xl mb-6 animate-fade-up" style={{ animationDelay: '0.3s' }}>
            {webinar.description}
          </p>
          
          <div className="flex flex-wrap gap-6 mb-8 text-white/80 animate-fade-up" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-webi-blue" />
              {formattedDate}
            </div>
            
            <div className="flex items-center">
              <Clock className="mr-2 h-5 w-5 text-webi-blue" />
              {webinar.time} · {webinar.duration}
            </div>
            
            <div className="flex items-center">
              <User className="mr-2 h-5 w-5 text-webi-blue" />
              {webinar.speaker.name}, {webinar.speaker.role} at {webinar.speaker.company}
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3 animate-fade-up" style={{ animationDelay: '0.5s' }}>
            <Link to={`/webinar/${webinar.id}`}>
              <Button size="lg" className="group">
                Register Now
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            
            <Link to={`/webinar/${webinar.id}`}>
              <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
