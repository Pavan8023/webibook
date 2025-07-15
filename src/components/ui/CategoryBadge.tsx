
import { cn } from '@/lib/utils';

type CategoryBadgeProps = {
  category: string;
  className?: string;
};

const categoryColors: Record<string, { bg: string; text: string }> = {
  Technology: { bg: 'bg-blue-100', text: 'text-blue-800' },
  Business: { bg: 'bg-green-100', text: 'text-green-800' },
  Design: { bg: 'bg-purple-100', text: 'text-purple-800' },
  Marketing: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  Finance: { bg: 'bg-emerald-100', text: 'text-emerald-800' },
  Health: { bg: 'bg-rose-100', text: 'text-rose-800' },
  Education: { bg: 'bg-indigo-100', text: 'text-indigo-800' },
  AI: { bg: 'bg-orange-100', text: 'text-orange-800' },
  'Data Science': { bg: 'bg-cyan-100', text: 'text-cyan-800' },
  Leadership: { bg: 'bg-amber-100', text: 'text-amber-800' },
  Development: { bg: 'bg-sky-100', text: 'text-sky-800' },
  'Personal Growth': { bg: 'bg-pink-100', text: 'text-pink-800' },
};

export const CategoryBadge = ({ category, className }: CategoryBadgeProps) => {
  const colors = categoryColors[category] || { bg: 'bg-gray-100', text: 'text-gray-800' };
  
  return (
    <span 
      className={cn(
        'badge text-xs font-medium', 
        colors.bg, 
        colors.text,
        className
      )}
    >
      {category}
    </span>
  );
};
