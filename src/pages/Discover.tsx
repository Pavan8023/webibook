
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { getWebinars, WebinarFilters } from '@/services/webinarService';
import { WebinarType } from '@/components/ui/WebinarCard';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { SearchFilters, FilterType } from '@/components/webinar/SearchFilters';
import { WebinarGrid } from '@/components/webinar/WebinarGrid';

const Discover = () => {
  // State for the filters
  const [filters, setFilters] = useState<FilterType>({
    search: "",
    categories: [],
    upcoming: false,
    paid: false,
    date: "",
    duration: [15, 120]
  });
  
  // State for duration range slider
  const [durationRange, setDurationRange] = useState<[number, number]>([15, 120]);
  
  // Handler function to convert from number[] to [number, number]
  const handleDurationChange = (value: number[]) => {
    // Ensure we always have exactly two values for our tuple
    if (value.length === 2) {
      setDurationRange([value[0], value[1]]);
    }
  };

  // Use the useQuery hook to fetch webinars
  const { data: webinars, isLoading } = useQuery({
    queryKey: ['webinars'],
    queryFn: () => getWebinars({}),
  });

  // Filter webinars based on the current filters
  const filteredWebinars = webinars ? filterWebinars(webinars, filters, durationRange) : [];
  
  // Extract unique categories from webinars
  const categories = webinars 
    ? [...new Set(webinars.map(webinar => webinar.category))] as string[]
    : [];

  // Clear all filters
  const handleClearFilters = () => {
    setFilters({
      search: "",
      categories: [],
      upcoming: false,
      paid: false,
      date: "",
      duration: [15, 120]
    });
    setDurationRange([15, 120]);
  };

  // Remove a specific filter
  const handleRemoveFilter = (key: keyof FilterType) => {
    if (key === 'categories') {
      setFilters(prev => ({ ...prev, categories: [] }));
    } else if (key === 'duration') {
      setFilters(prev => ({ ...prev, duration: [15, 120] }));
      setDurationRange([15, 120]);
    } else {
      setFilters(prev => ({ ...prev, [key]: key === 'search' ? '' : false }));
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-white">
      <Navbar />
      
      <main className="flex-grow pt-20 pb-16 relative">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-pink-100/30 blur-3xl transform -translate-x-1/2" />
          <div className="absolute top-40 right-10 w-96 h-96 rounded-full bg-blue-100/40 blur-3xl transform translate-x-1/3" />
          <div className="absolute bottom-20 left-1/2 w-80 h-80 rounded-full bg-purple-100/30 blur-3xl transform -translate-x-1/2" />
        </div>
        
        <div className="container-wide">
          <div className="max-w-2xl mx-auto mb-8 text-center">
            <h1 className="text-4xl font-bold mb-4 tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Discover Webinars
            </h1>
            <p className="text-lg text-muted-foreground">
              Explore our collection of expert-led webinars on various topics and enhance your knowledge.
            </p>
          </div>
          
          <SearchFilters
            webinars={webinars || []}
            filters={filters}
            setFilters={setFilters}
            durationRange={durationRange}
            setDurationRange={setDurationRange}
            categories={categories}
            handleDurationChange={handleDurationChange}
            handleClearFilters={handleClearFilters}
            handleRemoveFilter={handleRemoveFilter}
          />
          
          <WebinarGrid 
            webinars={filteredWebinars} 
            isLoading={isLoading} 
          />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

// Helper function to filter webinars based on filters
const filterWebinars = (
  webinars: WebinarType[], 
  filters: FilterType,
  durationRange: [number, number]
): WebinarType[] => {
  return webinars.filter(webinar => {
    // Search filter
    if (filters.search && 
        !webinar.title.toLowerCase().includes(filters.search.toLowerCase()) &&
        !webinar.description.toLowerCase().includes(filters.search.toLowerCase()) &&
        !webinar.speaker.name.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    
    // Categories filter
    if (filters.categories.length > 0 && !filters.categories.includes(webinar.category)) {
      return false;
    }
    
    // Upcoming filter
    if (filters.upcoming && !webinar.isUpcoming) {
      return false;
    }
    
    // Paid filter
    if (filters.paid && !webinar.isPaid) {
      return false;
    }
    
    // Duration filter
    const duration = parseInt(webinar.duration.split(' ')[0]);
    if (duration < durationRange[0] || duration > durationRange[1]) {
      return false;
    }
    
    return true;
  });
};

export default Discover;
