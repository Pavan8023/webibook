
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { WebinarCard, WebinarType } from '@/components/ui/WebinarCard';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface CategoryData {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  webinarCount: number;
}

// Sample category data
const categories: CategoryData[] = [
  {
    id: "tech",
    name: "Technology",
    description: "Explore the latest advancements in technology, AI, and digital innovation.",
    icon: "💻",
    color: "bg-blue-100 text-blue-700",
    webinarCount: 42
  },
  {
    id: "business",
    name: "Business",
    description: "Learn about entrepreneurship, leadership, and business strategy.",
    icon: "💼",
    color: "bg-purple-100 text-purple-700",
    webinarCount: 35
  },
  {
    id: "marketing",
    name: "Marketing",
    description: "Discover digital marketing tactics, branding strategies, and customer acquisition.",
    icon: "📱",
    color: "bg-pink-100 text-pink-700",
    webinarCount: 28
  },
  {
    id: "finance",
    name: "Finance",
    description: "Learn about investment strategies, financial planning, and wealth management.",
    icon: "💰",
    color: "bg-green-100 text-green-700",
    webinarCount: 23
  },
  {
    id: "health",
    name: "Health",
    description: "Explore health and wellness topics, mental health, and workplace wellbeing.",
    icon: "🧠",
    color: "bg-red-100 text-red-700",
    webinarCount: 19
  },
  {
    id: "development",
    name: "Development",
    description: "Learn programming, web development, and software engineering skills.",
    icon: "⚙️",
    color: "bg-orange-100 text-orange-700",
    webinarCount: 31
  },
  {
    id: "design",
    name: "Design",
    description: "Explore UX/UI design, graphic design, and creative processes.",
    icon: "🎨",
    color: "bg-yellow-100 text-yellow-700",
    webinarCount: 26
  },
  {
    id: "education",
    name: "Education",
    description: "Discover teaching methods, e-learning, and educational technology.",
    icon: "📚",
    color: "bg-indigo-100 text-indigo-700",
    webinarCount: 17
  }
];

// Sample webinar data for Technology category
const technologyWebinars: WebinarType[] = [
  {
    id: "1",
    title: "The Future of AI in Business: Trends and Predictions",
    description: "Join leading AI researchers and business leaders as they explore how artificial intelligence is transforming industries and what to expect in the coming years.",
    imageUrl: "https://images.unsplash.com/photo-1591453089816-0fbb971b454c?q=80&w=2070&auto=format&fit=crop",
    date: "2025-04-15",
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
  },
  {
    id: "7",
    title: "Blockchain Technology: Beyond Cryptocurrency",
    description: "Explore the applications of blockchain technology beyond cryptocurrency and how it's revolutionizing various industries.",
    imageUrl: "https://images.unsplash.com/photo-1639762681057-408e52192e55?q=80&w=2070&auto=format&fit=crop",
    date: "2025-04-30",
    time: "1:00 PM EST",
    duration: "75 min",
    speaker: {
      name: "Daniel Wilson",
      role: "Blockchain Specialist",
      company: "ChainInnovate"
    },
    category: "Technology",
    isTrending: true
  },
  {
    id: "8",
    title: "Cybersecurity in the Age of Remote Work",
    description: "Learn about the latest cybersecurity threats and how to protect your organization in an increasingly remote work environment.",
    imageUrl: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=2070&auto=format&fit=crop",
    date: "2025-05-05",
    time: "10:00 AM EST",
    duration: "60 min",
    speaker: {
      name: "Jennifer Lee",
      role: "Chief Security Officer",
      company: "SecureNet"
    },
    category: "Technology",
    isUpcoming: true
  },
  {
    id: "9",
    title: "Cloud Computing: Strategies for Efficient Deployment",
    description: "Discover best practices for cloud deployment and optimization across different platforms and service models.",
    imageUrl: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=2070&auto=format&fit=crop",
    date: "2025-05-08",
    time: "3:00 PM EST",
    duration: "60 min",
    speaker: {
      name: "Marcus Johnson",
      role: "Cloud Solutions Architect",
      company: "CloudTech"
    },
    category: "Technology"
  }
];

const Categories = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CategoryData | null>(null);
  
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const selectCategory = (category: CategoryData) => {
    setSelectedCategory(category);
  };
  
  const backToCategories = () => {
    setSelectedCategory(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-16">
        <div className="container-wide">
          {!selectedCategory ? (
            <>
              <div className="mb-10">
                <h1 className="text-3xl font-bold mb-2">Browse by Category</h1>
                <p className="text-muted-foreground">
                  Explore webinars by topic and find exactly what you're looking for
                </p>
              </div>
              
              <div className="relative max-w-xl mb-10">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search categories..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredCategories.map(category => (
                  <button
                    key={category.id}
                    className="bg-white rounded-xl border border-border p-6 text-left transition-all hover:shadow-md hover:border-webi-blue/30 focus:outline-none focus:ring-2 focus:ring-webi-blue/20"
                    onClick={() => selectCategory(category)}
                  >
                    <div className={`w-12 h-12 rounded-full ${category.color} flex items-center justify-center text-2xl mb-4`}>
                      {category.icon}
                    </div>
                    <h2 className="text-xl font-semibold mb-2">{category.name}</h2>
                    <p className="text-muted-foreground text-sm mb-4">{category.description}</p>
                    <p className="text-webi-blue font-medium">{category.webinarCount} webinars</p>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <button
                onClick={backToCategories}
                className="flex items-center text-webi-blue font-medium mb-6 hover:underline"
              >
                ← Back to all categories
              </button>
              
              <div className="mb-10">
                <div className={`w-16 h-16 rounded-full ${selectedCategory.color} flex items-center justify-center text-3xl mb-4`}>
                  {selectedCategory.icon}
                </div>
                <h1 className="text-3xl font-bold mb-2">{selectedCategory.name}</h1>
                <p className="text-muted-foreground max-w-3xl">
                  {selectedCategory.description}
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {selectedCategory.id === "tech" ? (
                  technologyWebinars.map(webinar => (
                    <WebinarCard key={webinar.id} webinar={webinar} />
                  ))
                ) : (
                  <div className="md:col-span-2 lg:col-span-3 bg-muted/30 rounded-xl p-10 text-center">
                    <h3 className="text-lg font-medium mb-2">Coming Soon</h3>
                    <p className="text-muted-foreground mb-4">
                      We're adding webinars to this category. Check back soon!
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Categories;
