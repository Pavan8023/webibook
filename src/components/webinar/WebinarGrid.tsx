
import { Search } from 'lucide-react';
import { WebinarCard, WebinarType } from "@/components/ui/WebinarCard";

interface WebinarGridProps {
  webinars: WebinarType[];
  isLoading: boolean;
}

export const WebinarGrid = ({ webinars, isLoading }: WebinarGridProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <div 
            key={index} 
            className="rounded-2xl overflow-hidden shadow-sm animate-pulse"
          >
            <div className="aspect-[16/9] bg-muted"></div>
            <div className="p-5 bg-white space-y-3">
              <div className="h-4 bg-muted rounded w-1/4"></div>
              <div className="h-6 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-full"></div>
              <div className="flex gap-4 pt-2">
                <div className="h-4 bg-muted rounded w-1/3"></div>
                <div className="h-4 bg-muted rounded w-1/3"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (webinars.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4">
          <Search className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-medium mb-2">No webinars found</h3>
        <p className="text-muted-foreground">
          Try adjusting your search or filter criteria
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {webinars.map((webinar) => (
        <div 
          key={webinar.id} 
          className="group hover:scale-[1.03] transform transition-all duration-300 hover:shadow-xl rounded-2xl overflow-hidden"
        >
          <WebinarCard 
            webinar={webinar} 
            className="h-full bg-gradient-to-br from-white to-secondary/30 border-none"
          />
        </div>
      ))}
    </div>
  );
};
