
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CategoryBadge } from './CategoryBadge';
import { Calendar, Clock, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export type WebinarType = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  date: string;
  time: string;
  duration: string;
  speaker: {
    name: string;
    role: string;
    company: string;
  };
  category: string;
  isFeatured?: boolean;
  isTrending?: boolean;
  isUpcoming?: boolean;
  isPaid?: boolean;
  price?: string;
};

interface WebinarCardProps {
  webinar: WebinarType;
  className?: string;
  variant?: 'default' | 'minimal' | 'horizontal';
}

export const WebinarCard = ({
  webinar,
  className,
  variant = 'default'
}: WebinarCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const formattedDate = new Date(webinar.date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const cardClass = cn(
    'overflow-hidden transition-all duration-300 hover-scale group',
    {
      'rounded-2xl shadow-sm': variant === 'default',
      'rounded-xl': variant === 'minimal',
      'rounded-xl shadow-sm flex': variant === 'horizontal',
    },
    className
  );

  return (
    <Link to={`/webinar/${webinar.id}`} className={cardClass}>
      <div 
        className={cn(
          'relative overflow-hidden',
          {
            'aspect-[16/9]': variant === 'default' || variant === 'minimal',
            'flex-shrink-0 w-1/3': variant === 'horizontal',
          }
        )}
      >
        <img
          src={webinar.imageUrl}
          alt={webinar.title}
          className={cn(
            'object-cover w-full h-full transition-all duration-500',
            imageLoaded ? 'blur-0' : 'blur-sm'
          )}
          onLoad={() => setImageLoaded(true)}
        />
        
        {(webinar.isFeatured || webinar.isTrending) && (
          <div className="absolute top-3 left-3 flex gap-2">
            {webinar.isFeatured && (
              <span className="badge bg-webi-blue text-white">
                Featured
              </span>
            )}
            {webinar.isTrending && (
              <span className="badge bg-orange-500 text-white">
                Trending
              </span>
            )}
          </div>
        )}
        
        {webinar.isPaid && (
          <div className="absolute top-3 right-3">
            <span className="badge bg-black/70 text-white backdrop-blur-sm">
              {webinar.price}
            </span>
          </div>
        )}
      </div>

      <div 
        className={cn(
          'p-5',
          {
            'bg-white border-t border-border': variant === 'default',
            'pt-3 px-0': variant === 'minimal',
            'flex-1': variant === 'horizontal',
          }
        )}
      >
        <div className="flex items-center gap-2 mb-2">
          <CategoryBadge category={webinar.category} />
          
          {webinar.isUpcoming && (
            <span className="badge bg-emerald-100 text-emerald-800">
              Upcoming
            </span>
          )}
        </div>
        
        <h3 
          className={cn(
            'font-medium tracking-tight group-hover:text-webi-blue transition-colors',
            {
              'text-xl': variant === 'default' || variant === 'horizontal',
              'text-lg': variant === 'minimal',
            }
          )}
        >
          {webinar.title}
        </h3>
        
        {variant !== 'minimal' && (
          <p className="mt-2 text-muted-foreground line-clamp-2">
            {webinar.description}
          </p>
        )}
        
        <div className="mt-4 flex flex-wrap text-sm text-muted-foreground gap-x-4 gap-y-2">
          <div className="flex items-center">
            <Calendar className="mr-1 h-4 w-4 text-webi-blue" />
            {formattedDate}
          </div>
          
          <div className="flex items-center">
            <Clock className="mr-1 h-4 w-4 text-webi-blue" />
            {webinar.time} · {webinar.duration}
          </div>
          
          <div className="flex items-center">
            <User className="mr-1 h-4 w-4 text-webi-blue" />
            {webinar.speaker.name}
          </div>
        </div>
      </div>
    </Link>
  );
};
