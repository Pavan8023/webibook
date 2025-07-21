import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Search, X, Calendar, Clock, User } from 'lucide-react';
import { collection, query, orderBy, limit, getDocs, onSnapshot } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';

interface Webinar {
  id: string;
  title: string;
  description: string;
  coverImageURL: string;
  date: string;
  time: string;
  duration: string;
  hostId: string;
  hostName: string;
  hostProfileImage: string;
  category: string;
  createdAt: Date;
  dailyRoomUrl: string;
  status: 'upcoming' | 'live' | 'completed';
}

const Discover = () => {
  const [webinars, setWebinars] = useState<Webinar[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showWaitingModal, setShowWaitingModal] = useState(false);
  const [selectedWebinar, setSelectedWebinar] = useState<Webinar | null>(null);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [hostImages, setHostImages] = useState<Record<string, string>>({});
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Update current time every minute
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Format date to readable format
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Format time to AM/PM
  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const period = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${period}`;
  };

  // Check if event has started
  const hasEventStarted = (webinar: Webinar) => {
    const eventDate = new Date(`${webinar.date}T${webinar.time}`);
    return currentTime >= eventDate;
  };

  // Fetch host profile images
  useEffect(() => {
    const fetchHostImages = async () => {
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);
      
      const images: Record<string, string> = {};
      usersSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.photoURL) {
          images[doc.id] = data.photoURL;
        }
      });
      
      setHostImages(images);
    };

    fetchHostImages();
  }, []);

  // Fetch latest webinars in real-time
  useEffect(() => {
    setLoading(true);
    const webinarsRef = collection(db, 'events');
    const q = query(webinarsRef, orderBy('createdAt', 'desc'), limit(8));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const latestWebinars: Webinar[] = [];
      
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const eventDate = new Date(`${data.date}T${data.time}`);
        
        // Determine status based on current time
        let status: 'upcoming' | 'live' | 'completed' = 'upcoming';
        if (currentTime >= eventDate) {
          const endTime = new Date(eventDate);
          endTime.setMinutes(endTime.getMinutes() + parseInt(data.duration || '60'));
          status = currentTime <= endTime ? 'live' : 'completed';
        }
        
        latestWebinars.push({
          id: doc.id,
          title: data.title,
          description: data.description,
          coverImageURL: data.coverImageURL || data['cover.ImageURL'] || '',
          date: data.date,
          time: data.time,
          duration: data.duration,
          hostId: data.hostId,
          hostName: data.hostName,
          hostProfileImage: hostImages[data.hostId] || '',
          category: data.category,
          createdAt: data.createdAt?.toDate() || new Date(),
          dailyRoomUrl: data.dailyRoomUrl,
          status
        });
      });
      
      setWebinars(latestWebinars);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [hostImages, currentTime]);

  // Track auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe;
  }, []);

  const handleBookClick = (webinar: Webinar) => {
    setSelectedWebinar(webinar);
    setShowWaitingModal(true);
  };

  const handleJoinClick = (webinar: Webinar) => {
    if (!user) {
      setShowLoginModal(true);
    } else {
      // For logged-in users, navigate to the webinar room
      window.open(webinar.dailyRoomUrl, '_blank');
    }
  };

  const handleLoginRedirect = () => {
    setShowLoginModal(false);
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-16">
        {/* Hero Section */}
        <div className="relative bg-white py-10 px-4">
          <div className="absolute inset-0 bg-grid-white/[0.05]"></div>
          <div className="container mx-auto relative z-10 max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <h1 className="text-4xl md:text-6xl font-bold text-black mb-4">
                Discover Latest Webinars
              </h1>
              <p className="text-xl text-gray-900 max-w-2xl mx-auto">
                Explore the newest and most exciting webinars happening now. 
                Join live sessions or register for upcoming events.
              </p>
            </motion.div>
          </div>
        </div>
        
        {/* Latest Webinars */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <motion.h2 
              className="text-3xl font-bold text-gray-900 mb-10 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              Latest Webinars
            </motion.h2>
            
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : webinars.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {webinars.map((webinar, index) => (
                  <motion.div
                    key={webinar.id}
                    className="h-[400px]"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <div 
                      className="flip-card h-full w-full"
                    >
                      <motion.div
                        className="flip-card-inner w-full h-full"
                        whileHover={{ rotateY: 180 }}
                        transition={{ duration: 0.6 }}
                        style={{ transformStyle: 'preserve-3d' }}
                      >
                        {/* Front of Card */}
                        <div 
                          className="flip-card-front w-full h-full absolute" 
                          style={{ backfaceVisibility: 'hidden' }}
                        >
                          <div className="h-full flex flex-col">
                            <div className="relative h-48 overflow-hidden rounded-t-xl">
                              {webinar.coverImageURL ? (
                                <img 
                                  src={webinar.coverImageURL} 
                                  alt={webinar.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="bg-gradient-to-r from-blue-400 to-indigo-500 w-full h-full flex items-center justify-center">
                                  <span className="text-white text-xl font-bold">{webinar.title}</span>
                                </div>
                              )}
                              <div className="absolute bottom-3 left-3 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                                {webinar.category.charAt(0).toUpperCase() + webinar.category.slice(1)}
                              </div>
                              <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-bold ${
                                webinar.status === 'live' 
                                  ? 'bg-green-500 text-white' 
                                  : webinar.status === 'upcoming'
                                    ? 'bg-yellow-500 text-black'
                                    : 'bg-gray-500 text-white'
                              }`}>
                                {webinar.status}
                              </div>
                            </div>
                            
                            <div className="p-5 flex-grow bg-white">
                              <h3 className="font-bold text-gray-900 mb-3 line-clamp-2">{webinar.title}</h3>
                              
                              <div className="flex items-center mb-4">
                                <Calendar className="text-gray-500 mr-2" size={16} />
                                <span className="text-gray-600">{formatDate(webinar.date)}</span>
                              </div>
                              
                              <div className="flex items-center mb-6">
                                <Clock className="text-gray-500 mr-2" size={16} />
                                <span className="text-gray-600">{formatTime(webinar.time)}</span>
                              </div>
                              
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
                            </div>
                          </div>
                        </div>
                        
                        {/* Back of Card */}
                        <div 
                          className="flip-card-back w-full h-full absolute" 
                          style={{ 
                            backfaceVisibility: 'hidden',
                            transform: 'rotateY(180deg)'
                          }}
                        >
                          <div className="h-full bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-xl flex flex-col">
                            <h3 className="font-bold text-gray-900 mb-3">{webinar.title}</h3>
                            
                            <p className="text-gray-600 mb-4 flex-grow line-clamp-4">
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
                              
                              <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                                {webinar.category}
                              </div>
                            </div>
                            
                            <div className="mt-4 flex justify-between items-center">
                              <div>
                                <div className="flex items-center text-gray-600 mb-1">
                                  <Calendar size={16} className="mr-2" />
                                  <span>{formatDate(webinar.date)}</span>
                                </div>
                                <div className="flex items-center text-gray-600">
                                  <Clock size={16} className="mr-2" />
                                  <span>{formatTime(webinar.time)}</span>
                                </div>
                              </div>
                              
                              {hasEventStarted(webinar) ? (
                                <Button 
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleJoinClick(webinar);
                                  }}
                                >
                                  Join Now
                                </Button>
                              ) : (
                                <Button 
                                  size="sm"
                                  className="bg-blue-600 hover:bg-blue-700"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleBookClick(webinar);
                                  }}
                                >
                                  Book Now
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-100 rounded-2xl p-12 text-center">
                <h3 className="text-2xl font-medium mb-4 text-gray-800">No Webinars Available</h3>
                <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                  Check back soon for the latest webinars from industry experts.
                </p>
              </div>
            )}
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-10 px-4 bg-white">
          <div className="container mx-auto max-w-4xl text-center">
            <motion.h2 
              className="text-3xl md:text-4xl font-bold text-black mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              Ready to Host Your Own Webinar?
            </motion.h2>
            <motion.p 
              className="text-xl text-gray-900 mb-10 max-w-2xl mx-auto"
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
              <Button onClick={() => {window.location.href = '/login';}} className="bg-white text-gray-900 hover:bg-gray-600 hover:text-white px-8 py-6 text-lg font-bold rounded-xl shadow-lg">
                Start Hosting Today
              </Button>
            </motion.div>
          </div>
        </section>
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

      {/* Waiting Modal */}
      <AnimatePresence>
        {showWaitingModal && selectedWebinar && (
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
                <h3 className="font-bold text-2xl text-gray-900">Event Not Started</h3>
                <button 
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => setShowWaitingModal(false)}
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
                  Please wait until the event time to join.
                </p>
                <div className="bg-blue-50 rounded-xl p-4 mb-4">
                  <p className="text-gray-800 font-medium">{selectedWebinar.title}</p>
                  <div className="flex items-center mt-2">
                    <Calendar className="text-gray-600 mr-2" size={16} />
                    <span className="text-gray-600">{formatDate(selectedWebinar.date)}</span>
                    <Clock className="text-gray-600 ml-4 mr-2" size={16} />
                    <span className="text-gray-600">{formatTime(selectedWebinar.time)}</span>
                  </div>
                </div>
                <p className="text-gray-600">
                  The webinar will start at the scheduled time. You'll be able to join when it begins.
                </p>
              </motion.div>
              
              <div className="flex justify-end">
                <motion.button
                  className="bg-blue-600 text-white px-6 py-3 rounded-xl text-base font-medium hover:bg-blue-700 transition-colors"
                  onClick={() => setShowWaitingModal(false)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  OK
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Discover;