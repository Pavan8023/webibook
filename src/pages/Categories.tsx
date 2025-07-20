import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { db, auth } from '@/lib/firebase';

interface CategoryData {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

interface EventData {
  id: string;
  title: string;
  description: string;
  coverImageURL: string;
  date: string;
  time: string;
  duration: string;
  hostId: string;
  hostName: string;
  hostProfileImage?: string;
  category: string;
  dailyRoomUrl: string;
}

// Sample category data
const categories: CategoryData[] = [
  {
    id: "tech",
    name: "Technology",
    description: "Explore the latest advancements in technology, AI, and digital innovation.",
    icon: "💻",
    color: "bg-blue-100 text-blue-700",
  },
  {
    id: "business",
    name: "Business",
    description: "Learn about entrepreneurship, leadership, and business strategy.",
    icon: "💼",
    color: "bg-purple-100 text-purple-700",
  },
  {
    id: "marketing",
    name: "Marketing",
    description: "Discover digital marketing tactics, branding strategies, and customer acquisition.",
    icon: "📱",
    color: "bg-pink-100 text-pink-700",
  },
  {
    id: "finance",
    name: "Finance",
    description: "Learn about investment strategies, financial planning, and wealth management.",
    icon: "💰",
    color: "bg-green-100 text-green-700",
  },
  {
    id: "health",
    name: "Health",
    description: "Explore health and wellness topics, mental health, and workplace wellbeing.",
    icon: "🧠",
    color: "bg-red-100 text-red-700",
  },
  {
    id: "development",
    name: "Development",
    description: "Learn programming, web development, and software engineering skills.",
    icon: "⚙️",
    color: "bg-orange-100 text-orange-700",
  },
  {
    id: "design",
    name: "Design",
    description: "Explore UX/UI design, graphic design, and creative processes.",
    icon: "🎨",
    color: "bg-yellow-100 text-yellow-700",
  },
  {
    id: "education",
    name: "Education",
    description: "Discover teaching methods, e-learning, and educational technology.",
    icon: "📚",
    color: "bg-indigo-100 text-indigo-700",
  }
];

const Categories = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CategoryData | null>(null);
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      fetchEvents(selectedCategory.name);
    }
  }, [selectedCategory]);

  const fetchEvents = async (categoryName: string) => {
    setLoading(true);
    try {
      const eventsRef = collection(db, 'events');
      const q = query(eventsRef, where('category', '==', categoryName.toLowerCase()));
      const querySnapshot = await getDocs(q);
      
      const fetchedEvents: EventData[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedEvents.push({
          id: doc.id,
          title: data.title,
          description: data.description,
          coverImageURL: data.coverImageURL,
          date: data.date,
          time: data.time,
          duration: data.duration,
          hostId: data.hostId,
          hostName: data.hostName,
          hostProfileImage: data.hostProfileImage,
          category: data.category,
          dailyRoomUrl: data.dailyRoomUrl
        });
      });
      
      setEvents(fetchedEvents);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const selectCategory = (category: CategoryData) => {
    setSelectedCategory(category);
  };
  
  const backToCategories = () => {
    setSelectedCategory(null);
    setEvents([]);
  };

  const handleEventClick = () => {
    if (!user) {
      setShowLoginModal(true);
    } else {
      // For logged-in users, we would navigate to the event details
      // navigate(`/event/${eventId}`);
    }
  };

  const handleLoginRedirect = () => {
    setShowLoginModal(false);
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-7xl">
          {!selectedCategory ? (
            <>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12 text-center"
              >
                <h1 className="text-4xl font-bold mb-3 text-gray-900">Browse by Category</h1>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Explore webinars by topic and find exactly what you're looking for
                </p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="relative max-w-xl mx-auto mb-12"
              >
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search categories..."
                  className="pl-10 py-6 text-base rounded-xl shadow-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </motion.div>
              
              <motion.div 
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {filteredCategories.map((category, index) => (
                  <motion.button
                    key={category.id}
                    className="bg-white rounded-2xl border border-gray-200 p-7 text-left transition-all hover:shadow-lg hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    onClick={() => selectCategory(category)}
                    whileHover={{ y: -5 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className={`w-14 h-14 rounded-full ${category.color} flex items-center justify-center text-2xl mb-5`}>
                      {category.icon}
                    </div>
                    <h2 className="text-xl font-bold mb-3 text-gray-800">{category.name}</h2>
                    <p className="text-gray-600 text-base mb-5">{category.description}</p>
                    <p className="text-blue-600 font-semibold">Explore events</p>
                  </motion.button>
                ))}
              </motion.div>
            </>
          ) : (
            <>
              <motion.button
                onClick={backToCategories}
                className="flex items-center text-blue-600 font-medium mb-8 hover:underline"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                ← Back to all categories
              </motion.button>
              
              <motion.div 
                className="mb-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="flex items-center mb-6">
                  <div className={`w-16 h-16 rounded-full ${selectedCategory.color} flex items-center justify-center text-3xl mr-4`}>
                    {selectedCategory.icon}
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">{selectedCategory.name} Events</h1>
                    <p className="text-gray-600">
                      {selectedCategory.description}
                    </p>
                  </div>
                </div>
              </motion.div>
              
              {loading ? (
                <motion.div 
                  className="flex justify-center items-center h-64"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
                </motion.div>
              ) : (
                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  {events.length > 0 ? (
                    events.map((event, index) => (
                      <motion.div
                        key={event.id}
                        className="bg-white rounded-2xl overflow-hidden shadow-lg cursor-pointer transform transition-transform hover:scale-[1.02]"
                        onClick={handleEventClick}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ y: -5 }}
                      >
                        <div className="relative h-48 overflow-hidden">
                          {event.coverImageURL ? (
                            <img 
                              src={event.coverImageURL} 
                              alt={event.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-full flex items-center justify-center text-gray-500">
                              Event Image
                            </div>
                          )}
                          <div className="absolute bottom-3 left-3 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                            {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
                          </div>
                        </div>
                        
                        <div className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-bold text-gray-900">{event.title}</h3>
                            <div className="flex flex-col items-end">
                              <span className="text-sm text-gray-500">{event.date}</span>
                              <span className="text-sm text-gray-500">{event.time}</span>
                            </div>
                          </div>
                          
                          <p className="text-gray-600 mb-6 line-clamp-2">
                            {event.description}
                          </p>
                          
                          <div className="flex items-center">
                            {event.hostProfileImage ? (
                              <img 
                                src={event.hostProfileImage} 
                                alt={event.hostName}
                                className="w-10 h-10 rounded-full mr-3"
                              />
                            ) : (
                              <div className="bg-gray-200 border-2 border-dashed rounded-full w-10 h-10 mr-3" />
                            )}
                            <div>
                              <p className="font-medium text-gray-900">{event.hostName}</p>
                              <p className="text-sm text-gray-500">Host</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <motion.div 
                      className="col-span-full bg-gray-100 rounded-2xl p-12 text-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <h3 className="text-2xl font-medium mb-4 text-gray-800">No Events Found</h3>
                      <p className="text-gray-600 text-lg mb-6 max-w-2xl mx-auto">
                        We couldn't find any events in the {selectedCategory.name} category. 
                        Check back soon or explore other categories!
                      </p>
                      <button
                        onClick={backToCategories}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg hover:bg-blue-700 transition-colors"
                      >
                        Browse All Categories
                      </button>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </>
          )}
        </div>
      </main>
      
      <Footer />

      {/* Login Required Modal */}
      <AnimatePresence>
        {showLoginModal && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-white rounded-2xl max-w-md w-full p-8"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-2xl text-gray-900">Login Required</h3>
                <button 
                  className="text-gray-500 hover:text-gray-700"
                  onClick={handleLoginRedirect}
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <motion.div 
                className="mb-8"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <p className="text-gray-600 text-lg mb-4">
                  Please login to access this webinar content.
                </p>
                <p className="text-gray-600">
                  You need to be logged in to view webinar details, register for events, and access exclusive content.
                </p>
              </motion.div>
              
              <div className="flex justify-end">
                <motion.button
                  className="bg-blue-600 text-white px-6 py-3 rounded-xl text-base font-medium hover:bg-blue-700 transition-colors"
                  onClick={handleLoginRedirect}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Login Now
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Categories;