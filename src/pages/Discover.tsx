import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowRight, Star, Flame, Calendar, Clock, User } from 'lucide-react';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

interface Webinar {
  id: string;
  title: string;
  description: string;
  coverImageURL: string;
  date: string;
  time: string;
  duration: string;
  hostName: string;
  hostProfileImage?: string;
  category: string;
  isFeatured: boolean;
  isTrending: boolean;
  attendeesCount: number;
}

const Discover = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredWebinars, setFeaturedWebinars] = useState<Webinar[]>([]);
  const [trendingWebinars, setTrendingWebinars] = useState<Webinar[]>([]);
  const [categories, setCategories] = useState<{name: string, count: number}[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [filteredWebinars, setFilteredWebinars] = useState<Webinar[]>([]);

  // Format date to readable format
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Fetch all webinars in real-time
  useEffect(() => {
    setLoading(true);
    const webinarsRef = collection(db, 'events');
    
    const unsubscribe = onSnapshot(webinarsRef, (snapshot) => {
      const allWebinars: Webinar[] = [];
      const categoriesMap: Record<string, number> = {};
      
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const webinar = {
          id: doc.id,
          title: data.title,
          description: data.description,
          coverImageURL: data.coverImageURL,
          date: data.date,
          time: data.time,
          duration: data.duration,
          hostName: data.hostName,
          hostProfileImage: data.hostProfileImage,
          category: data.category,
          isFeatured: data.isFeatured || false,
          isTrending: data.isTrending || false,
          attendeesCount: data.attendeesCount || 0
        };
        
        allWebinars.push(webinar);
        
        // Count categories
        if (categoriesMap[data.category]) {
          categoriesMap[data.category]++;
        } else {
          categoriesMap[data.category] = 1;
        }
      });
      
      // Set featured webinars (first 3 featured)
      setFeaturedWebinars(allWebinars
        .filter(w => w.isFeatured)
        .slice(0, 3));
      
      // Set trending webinars (first 6 trending by attendees)
      setTrendingWebinars(allWebinars
        .filter(w => w.isTrending)
        .sort((a, b) => b.attendeesCount - a.attendeesCount)
        .slice(0, 6));
      
      // Set categories with counts
      const categoriesData = Object.entries(categoriesMap).map(([name, count]) => ({
        name,
        count
      }));
      setCategories([{ name: 'All', count: allWebinars.length }, ...categoriesData]);
      
      // Set initial filtered webinars (all)
      setFilteredWebinars(allWebinars);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Filter webinars based on search and category
  useEffect(() => {
    let result = [...filteredWebinars];
    
    if (activeCategory !== 'All') {
      result = result.filter(webinar => webinar.category === activeCategory);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(webinar => 
        webinar.title.toLowerCase().includes(query) ||
        webinar.description.toLowerCase().includes(query) ||
        webinar.hostName.toLowerCase().includes(query) ||
        webinar.category.toLowerCase().includes(query)
      );
    }
    
    setFilteredWebinars(result);
  }, [searchQuery, activeCategory]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-16">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 py-20 px-4">
          <div className="absolute inset-0 bg-grid-white/[0.05]"></div>
          <div className="container mx-auto relative z-10 max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                Discover Amazing Webinars
              </h1>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                Explore thousands of live and upcoming webinars across all topics. 
                Learn from industry experts and grow your skills.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="relative max-w-2xl mx-auto"
            >
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search webinars by topic, host, or keyword..."
                className="pl-12 py-6 text-base rounded-xl shadow-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-500 hover:bg-blue-400">
                Search
              </Button>
            </motion.div>
          </div>
        </div>
        
        {/* Featured Webinars */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="flex items-center justify-between mb-10">
              <motion.h2 
                className="text-3xl font-bold text-gray-900 flex items-center"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Star className="text-yellow-500 mr-3" size={28} />
                Featured Webinars
              </motion.h2>
              <Button variant="link" className="text-blue-600 hover:text-blue-800 text-lg">
                View All
                <ArrowRight className="ml-2" size={18} />
              </Button>
            </div>
            
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : featuredWebinars.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {featuredWebinars.map((webinar, index) => (
                  <motion.div
                    key={webinar.id}
                    className="bg-white rounded-2xl overflow-hidden shadow-xl"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -10 }}
                  >
                    <div className="relative h-48 overflow-hidden">
                      {webinar.coverImageURL ? (
                        <img 
                          src={webinar.coverImageURL} 
                          alt={webinar.title}
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                        />
                      ) : (
                        <div className="bg-gradient-to-r from-blue-400 to-indigo-500 w-full h-full flex items-center justify-center">
                          <span className="text-white text-xl font-bold">{webinar.title}</span>
                        </div>
                      )}
                      <div className="absolute top-4 right-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                        Featured
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <div className="flex items-center mb-4">
                        <Calendar className="text-gray-500 mr-2" size={16} />
                        <span className="text-gray-600">{formatDate(webinar.date)}</span>
                        <Clock className="text-gray-500 ml-4 mr-2" size={16} />
                        <span className="text-gray-600">{webinar.time}</span>
                      </div>
                      
                      <h3 className="text-xl font-bold text-gray-900 mb-3">{webinar.title}</h3>
                      <p className="text-gray-600 mb-6 line-clamp-2">
                        {webinar.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {webinar.hostProfileImage ? (
                            <img 
                              src={webinar.hostProfileImage} 
                              alt={webinar.hostName}
                              className="w-10 h-10 rounded-full mr-3"
                            />
                          ) : (
                            <div className="bg-gray-200 border-2 border-dashed rounded-full w-10 h-10 mr-3" />
                          )}
                          <div>
                            <p className="font-medium text-gray-900">{webinar.hostName}</p>
                            <p className="text-sm text-gray-500">Host</p>
                          </div>
                        </div>
                        
                        <Button className="bg-blue-600 hover:bg-blue-700">
                          Join Now
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-100 rounded-2xl p-12 text-center">
                <h3 className="text-2xl font-medium mb-4 text-gray-800">No Featured Webinars</h3>
                <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                  Check back soon for featured webinars from industry experts.
                </p>
              </div>
            )}
          </div>
        </section>
        
        {/* Trending Webinars */}
        <section className="py-16 px-4 bg-gray-50">
          <div className="container mx-auto max-w-6xl">
            <div className="flex items-center justify-between mb-10">
              <motion.h2 
                className="text-3xl font-bold text-gray-900 flex items-center"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Flame className="text-orange-500 mr-3" size={28} />
                Trending Now
              </motion.h2>
              <Button variant="link" className="text-blue-600 hover:text-blue-800 text-lg">
                View All
                <ArrowRight className="ml-2" size={18} />
              </Button>
            </div>
            
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : trendingWebinars.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {trendingWebinars.map((webinar, index) => (
                  <motion.div
                    key={webinar.id}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.03 }}
                  >
                    <div className="p-6">
                      <div className="flex items-center mb-4">
                        <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium mr-3">
                          Trending
                        </div>
                        <div className="flex items-center text-gray-500">
                          <User size={16} className="mr-1" />
                          <span>{webinar.attendeesCount} attending</span>
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-bold text-gray-900 mb-3">{webinar.title}</h3>
                      <p className="text-gray-600 mb-6 line-clamp-3">
                        {webinar.description}
                      </p>
                      
                      <div className="flex items-center mb-6">
                        {webinar.hostProfileImage ? (
                          <img 
                            src={webinar.hostProfileImage} 
                            alt={webinar.hostName}
                            className="w-10 h-10 rounded-full mr-3"
                          />
                        ) : (
                          <div className="bg-gray-200 border-2 border-dashed rounded-full w-10 h-10 mr-3" />
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{webinar.hostName}</p>
                          <p className="text-sm text-gray-500">Host</p>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="flex items-center text-gray-600 mb-1">
                            <Calendar size={16} className="mr-2" />
                            <span>{formatDate(webinar.date)}</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <Clock size={16} className="mr-2" />
                            <span>{webinar.time} ({webinar.duration})</span>
                          </div>
                        </div>
                        
                        <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                          Details
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
                <h3 className="text-2xl font-medium mb-4 text-gray-800">Nothing Trending Yet</h3>
                <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                  Be the first to join upcoming webinars and make them trend!
                </p>
              </div>
            )}
          </div>
        </section>
        
        {/* Browse Categories */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <motion.h2 
              className="text-3xl font-bold text-gray-900 mb-10 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              Browse by Category
            </motion.h2>
            
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <>
                <div className="flex flex-wrap justify-center gap-4 mb-12">
                  {categories.map((category, index) => (
                    <motion.button
                      key={category.name}
                      className={`px-6 py-3 rounded-full font-medium transition-all ${
                        activeCategory === category.name 
                          ? 'bg-blue-600 text-white shadow-lg' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      onClick={() => setActiveCategory(category.name)}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {category.name} 
                      <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded-full">
                        {category.count}
                      </span>
                    </motion.button>
                  ))}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {filteredWebinars.length > 0 ? (
                    filteredWebinars.map((webinar, index) => (
                      <motion.div
                        key={webinar.id}
                        className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="flex items-center mb-4">
                          <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium mr-2">
                            {webinar.category}
                          </div>
                          <div className="text-gray-500 text-sm">
                            {webinar.date}
                          </div>
                        </div>
                        
                        <h3 className="font-bold text-gray-900 mb-3 line-clamp-2">{webinar.title}</h3>
                        
                        <div className="flex items-center mb-4">
                          {webinar.hostProfileImage ? (
                            <img 
                              src={webinar.hostProfileImage} 
                              alt={webinar.hostName}
                              className="w-8 h-8 rounded-full mr-2"
                            />
                          ) : (
                            <div className="bg-gray-200 border-2 border-dashed rounded-full w-8 h-8 mr-2" />
                          )}
                          <span className="text-sm text-gray-600">{webinar.hostName}</span>
                        </div>
                        
                        <div className="flex items-center text-gray-500 text-sm">
                          <Clock size={14} className="mr-1" />
                          <span className="mr-3">{webinar.time}</span>
                          <User size={14} className="mr-1" />
                          <span>{webinar.attendeesCount} attending</span>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="col-span-full bg-gray-50 rounded-xl p-10 text-center">
                      <h3 className="text-xl font-medium mb-3 text-gray-800">No Webinars Found</h3>
                      <p className="text-gray-600 mb-6">
                        We couldn't find any webinars matching your criteria.
                      </p>
                      <Button 
                        onClick={() => {
                          setSearchQuery('');
                          setActiveCategory('All');
                        }}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Reset Filters
                      </Button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-indigo-700">
          <div className="container mx-auto max-w-4xl text-center">
            <motion.h2 
              className="text-3xl md:text-4xl font-bold text-white mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              Ready to Host Your Own Webinar?
            </motion.h2>
            <motion.p 
              className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Join thousands of hosts who are sharing their knowledge and growing their audience.
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Button onClick={() => {window.location.href = '/login'}} className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-6 text-lg font-bold rounded-xl shadow-lg">
                Start Hosting Today
              </Button>
            </motion.div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Discover;