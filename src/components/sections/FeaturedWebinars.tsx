// components/sections/FeaturedWebinars.tsx
import { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { FeaturedWebinar } from '@/components/ui/FeaturedWebinar';
import { WebinarType } from '@/components/ui/WebinarCard';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { Timestamp } from 'firebase/firestore';

export const FeaturedWebinars = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [featuredWebinar, setFeaturedWebinar] = useState<WebinarType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedWebinar = async () => {
      try {
        setLoading(true);
        const eventsRef = collection(db, 'events');
        
        // Query for the latest event by date
        const q = query(
          eventsRef,
          orderBy('date', 'desc'), // Order by date descending
          limit(1) // Get only the latest
        );
        
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          const data = doc.data();
          
          // Convert Firestore Timestamp to Date if needed
          const date = data.date instanceof Timestamp 
            ? data.date.toDate().toISOString()
            : data.date;
          
          // Create speaker object with host name
          const speaker = {
            name: data.hostName || 'Unknown Host',
            role: '',
            company: ''
          };
          
          setFeaturedWebinar({
            id: doc.id,
            title: data.title || 'Untitled Webinar',
            description: data.description || 'No description available',
            imageUrl: data.coverImageURL || 'https://via.placeholder.com/800x450',
            date: date || new Date().toISOString(),
            time: data.time || 'TBD',
            duration: data.duration ? `${data.duration} min` : 'Duration not specified',
            speaker,
            category: data.category || 'General',
            isFeatured: true,
            isPaid: data.isPaid || false,
            price: data.price || 'Free'
          });
        } else {
          setError('No featured webinar found');
        }
      } catch (err) {
        console.error('Error fetching featured webinar:', err);
        setError('Failed to load featured webinar');
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedWebinar();
  }, []);

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

  const SkeletonFeaturedWebinar = () => (
    <div className="relative rounded-2xl overflow-hidden bg-gray-200 animate-pulse h-[500px] md:h-[600px] lg:h-[650px]">
      <div className="absolute inset-0 flex flex-col justify-end p-6 lg:p-10">
        <div className="container-tight mx-auto">
          <Skeleton className="h-6 w-32 mb-3" />
          <Skeleton className="h-10 w-3/4 mb-4" />
          <Skeleton className="h-20 w-full max-w-2xl mb-6" />
          <div className="flex gap-6 mb-8">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-6 w-48" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-12 w-36" />
            <Skeleton className="h-12 w-36" />
          </div>
        </div>
      </div>
    </div>
  );

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
        </div>
        
        <div className="animate-item">
          {loading ? (
            <SkeletonFeaturedWebinar />
          ) : error ? (
            <div className="bg-gray-100 rounded-2xl h-[500px] md:h-[600px] lg:h-[650px] flex items-center justify-center">
              <p className="text-lg text-center p-4">{error}</p>
            </div>
          ) : featuredWebinar ? (
            <FeaturedWebinar webinar={featuredWebinar} />
          ) : (
            <div className="bg-gray-100 rounded-2xl h-[500px] md:h-[600px] lg:h-[650px] flex items-center justify-center">
              <p className="text-lg">No featured webinar available</p>
            </div>
          )}
        </div>
        
        <div className="animate-item mt-6 md:hidden text-center">
          <Button variant="outline" className="group">
            View All Featured
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </div>
    </section>
  );
};