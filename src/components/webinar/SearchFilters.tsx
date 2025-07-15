
import { useState, useEffect } from 'react';
import { Search, X, Calendar, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { WebinarType } from '@/components/ui/WebinarCard';
import { cn } from '@/lib/utils';

export type FilterType = {
  search: string;
  categories: string[];
  upcoming: boolean;
  paid: boolean;
  date: string;
  duration: [number, number];
};

interface SearchFiltersProps {
  webinars: WebinarType[];
  filters: FilterType;
  setFilters: React.Dispatch<React.SetStateAction<FilterType>>;
  durationRange: [number, number];
  setDurationRange: React.Dispatch<React.SetStateAction<[number, number]>>;
  categories: string[];
  handleDurationChange: (value: number[]) => void;
  handleClearFilters: () => void;
  handleRemoveFilter: (key: keyof FilterType) => void;
}

export const SearchFilters = ({
  webinars,
  filters,
  setFilters,
  durationRange,
  categories,
  handleDurationChange,
  handleClearFilters,
  handleRemoveFilter
}: SearchFiltersProps) => {
  const [searchInput, setSearchInput] = useState(filters.search);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  
  // Implement debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchInput }));
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [searchInput, setFilters]);

  // Count active filters
  const activeFiltersCount = 
    (filters.categories.length > 0 ? 1 : 0) + 
    (filters.upcoming ? 1 : 0) + 
    (filters.paid ? 1 : 0) + 
    (filters.date ? 1 : 0) + 
    (durationRange[0] !== 15 || durationRange[1] !== 120 ? 1 : 0);

  // Show active filters tags
  const renderActiveFilters = () => {
    if (!filters.search && activeFiltersCount === 0) return null;
    
    return (
      <div className="mt-4 flex flex-wrap gap-2 animate-fade-in">
        {filters.search && (
          <div className="badge bg-accent text-accent-foreground px-3 py-1 flex items-center gap-1.5">
            <span>Search: {filters.search}</span>
            <button 
              onClick={() => {
                setSearchInput('');
                handleRemoveFilter('search');
              }}
              className="hover:text-destructive transition-colors"
              aria-label="Remove search filter"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
        
        {filters.categories.length > 0 && (
          <div className="badge bg-accent text-accent-foreground px-3 py-1 flex items-center gap-1.5">
            <span>Categories: {filters.categories.join(', ')}</span>
            <button 
              onClick={() => handleRemoveFilter('categories')}
              className="hover:text-destructive transition-colors"
              aria-label="Remove categories filter"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
        
        {filters.upcoming && (
          <div className="badge bg-accent text-accent-foreground px-3 py-1 flex items-center gap-1.5">
            <span>Upcoming only</span>
            <button 
              onClick={() => handleRemoveFilter('upcoming')}
              className="hover:text-destructive transition-colors"
              aria-label="Remove upcoming filter"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
        
        {filters.paid && (
          <div className="badge bg-accent text-accent-foreground px-3 py-1 flex items-center gap-1.5">
            <span>Paid only</span>
            <button 
              onClick={() => handleRemoveFilter('paid')}
              className="hover:text-destructive transition-colors"
              aria-label="Remove paid filter"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
        
        {filters.date && (
          <div className="badge bg-accent text-accent-foreground px-3 py-1 flex items-center gap-1.5">
            <span>Date: {filters.date}</span>
            <button 
              onClick={() => handleRemoveFilter('date')}
              className="hover:text-destructive transition-colors"
              aria-label="Remove date filter"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
        
        {(durationRange[0] !== 15 || durationRange[1] !== 120) && (
          <div className="badge bg-accent text-accent-foreground px-3 py-1 flex items-center gap-1.5">
            <span>Duration: {durationRange[0]}-{durationRange[1]} min</span>
            <button 
              onClick={() => {
                handleDurationChange([15, 120]);
                handleRemoveFilter('duration');
              }}
              className="hover:text-destructive transition-colors"
              aria-label="Remove duration filter"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
        
        {(filters.search || activeFiltersCount > 0) && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs h-6"
            onClick={handleClearFilters}
          >
            Clear all
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className="mb-8 w-full bg-white/60 backdrop-blur-lg p-4 rounded-xl shadow-md border border-border/40">
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Search webinars..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            clearable={!!searchInput}
            onClear={() => {
              setSearchInput('');
              setFilters(prev => ({ ...prev, search: '' }));
            }}
            icon={<Search className="h-5 w-5" />}
            className="bg-white"
          />
        </div>
        
        <Popover open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              className={cn(
                "flex items-center gap-1 bg-white",
                activeFiltersCount > 0 && "border-primary text-primary"
              )}
            >
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
                  {activeFiltersCount}
                </span>
              )}
              {isFiltersOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4 animate-fade-in" align="end">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Categories</h3>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`category-${category}`}
                        checked={filters.categories.includes(category)}
                        onCheckedChange={(checked) => {
                          setFilters(prev => ({
                            ...prev,
                            categories: checked 
                              ? [...prev.categories, category]
                              : prev.categories.filter(c => c !== category)
                          }));
                        }}
                      />
                      <label 
                        htmlFor={`category-${category}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {category}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex flex-col space-y-2">
                <h3 className="text-sm font-medium">Duration (minutes)</h3>
                <div className="pt-2">
                  <Slider 
                    value={durationRange} 
                    onValueChange={handleDurationChange} 
                    min={15} 
                    max={120} 
                    step={15}
                    className="my-3"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{durationRange[0]} min</span>
                    <span>{durationRange[1]} min</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="upcoming-only"
                    checked={filters.upcoming}
                    onCheckedChange={(checked) => {
                      setFilters(prev => ({ ...prev, upcoming: !!checked }));
                    }}
                  />
                  <label 
                    htmlFor="upcoming-only"
                    className="text-sm font-medium leading-none flex items-center gap-1.5"
                  >
                    <Calendar className="h-3.5 w-3.5" />
                    Upcoming webinars only
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="paid-only"
                    checked={filters.paid}
                    onCheckedChange={(checked) => {
                      setFilters(prev => ({ ...prev, paid: !!checked }));
                    }}
                  />
                  <label 
                    htmlFor="paid-only"
                    className="text-sm font-medium leading-none flex items-center gap-1.5"
                  >
                    <Clock className="h-3.5 w-3.5" />
                    Paid webinars only
                  </label>
                </div>
              </div>
              
              <div className="pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={handleClearFilters}
                >
                  Reset filters
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      
      {renderActiveFilters()}
    </div>
  );
};
