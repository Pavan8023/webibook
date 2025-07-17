import { useEffect, useState } from 'react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Define types for our data
interface UserData {
  name?: string;
  displayName?: string;
  photoURL?: string;
  photolRL?: string; // For typo in some documents
}

interface EventData {
  id: string;
  title: string;
  date: string;
  time: string;
  duration: string;
  coverImageURL?: string;
  hostId: string;
  hostName: string;
  hostPhoto: string;
}

const CountdownTimer = ({ eventDate, eventTime }: { eventDate: string, eventTime: string }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const eventDateTime = new Date(`${eventDate}T${eventTime}`);
      const now = new Date();
      const difference = eventDateTime.getTime() - now.getTime();

      if (difference <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      return { days, hours, minutes, seconds };
    };

    // Update immediately
    setTimeLeft(calculateTimeLeft());

    // Update every second
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [eventDate, eventTime]);

  return (
    <div className="bg-webi-blue/10 rounded-lg p-2 mt-2">
      <p className="text-sm font-medium text-center">Starts in:</p>
      <div className="flex justify-center space-x-1">
        <div className="text-center">
          <span className="text-lg font-bold">{timeLeft.days.toString().padStart(2, '0')}</span>
          <span className="text-xs block">days</span>
        </div>
        <span className="text-lg font-bold">:</span>
        <div className="text-center">
          <span className="text-lg font-bold">{timeLeft.hours.toString().padStart(2, '0')}</span>
          <span className="text-xs block">hrs</span>
        </div>
        <span className="text-lg font-bold">:</span>
        <div className="text-center">
          <span className="text-lg font-bold">{timeLeft.minutes.toString().padStart(2, '0')}</span>
          <span className="text-xs block">min</span>
        </div>
        <span className="text-lg font-bold">:</span>
        <div className="text-center">
          <span className="text-lg font-bold">{timeLeft.seconds.toString().padStart(2, '0')}</span>
          <span className="text-xs block">sec</span>
        </div>
      </div>
    </div>
  );
};

const Attendee = () => {
  const [user] = useAuthState(auth);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<EventData[]>([]);
  const [activeTab, setActiveTab] = useState('upcoming');

  // Fetch events from Firestore
  useEffect(() => {
    const fetchEvents = async () => {
      if (!user) return;

      setLoading(true);

      try {
        // Fetch events from 'events' collection
        const eventsRef = collection(db, 'events');
        const eventsSnapshot = await getDocs(eventsRef);

        const eventsData = await Promise.all(eventsSnapshot.docs.map(async (eventDoc) => {
          const eventData = eventDoc.data();

          // Fetch host info from 'users' collection
          const hostDocRef = doc(db, 'users', eventData.hostId);
          const hostDoc = await getDoc(hostDocRef);
          const hostData = hostDoc.data() as UserData;

          // Handle different field names for name and photo URL
          const hostName = hostData?.name || hostData?.displayName || 'Unknown Host';
          const hostPhoto = hostData?.photoURL || hostData?.photolRL || '';

          return {
            id: eventDoc.id,
            title: eventData.title || '',
            date: eventData.date || '',
            time: eventData.time || '',
            duration: eventData.duration || '',
            coverImageURL: eventData.coverImageURL || '',
            hostId: eventData.hostId || '',
            hostName,
            hostPhoto,
          };
        }));

        setEvents(eventsData);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [user]);

  // Categorize events based on date
  const categorizeEvents = () => {
    const currentDate = new Date();

    return events.reduce((acc: { upcoming: EventData[]; past: EventData[] }, event) => {
      const eventDate = new Date(`${event.date}T${event.time}`);

      if (eventDate > currentDate) {
        acc.upcoming.push(event);
      } else {
        acc.past.push(event);
      }

      return acc;
    }, { upcoming: [], past: [] });
  };

  const { upcoming, past } = categorizeEvents();

  // Handle joining event with daily.co API
  const handleJoinEvent = (eventId: string) => {
    // This would be replaced with actual daily.co API integration
    console.log(`Joining event: ${eventId}`);
    alert(`Joining event: ${eventId}. Daily.co integration would go here.`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-grow pt-16 md:pt-20">
        <div className="container py-6 md:py-8">
          {/* Dashboard Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold">My Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back! Here are your upcoming webinars
            </p>
          </div>

          {/* My Events Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>My Events</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-2">
                  <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                  <TabsTrigger value="past">Past Events</TabsTrigger>
                </TabsList>

                <TabsContent value="upcoming">
                  {loading ? (
                    <div className="text-center py-8">
                      <p>Loading events...</p>
                    </div>
                  ) : upcoming.length === 0 ? (
                    <div className="text-center py-8">
                      <p>No upcoming events found</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                      {upcoming.map((event) => (
                        <div
                          key={event.id}
                          className="border rounded-lg overflow-hidden shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col"
                        >
                          {/* Event Image Section */}
                          {event.coverImageURL ? (
                            <div className="w-full h-48 overflow-hidden">
                              <img
                                src={event.coverImageURL}
                                alt={event.title}
                                className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.onerror = null;
                                  target.src = "https://via.placeholder.com/300x150?text=Event+Image";
                                }}
                              />
                            </div>
                          ) : (
                            <div className="bg-gray-100 w-full h-48 flex items-center justify-center">
                              <span className="text-gray-500">No image available</span>
                            </div>
                          )}

                          {/* Event Details Section */}
                          <div className="p-4 flex-grow flex flex-col">
                            <h3 className="font-bold text-lg mb-2">{event.title}</h3>
                            <div className="flex items-center mb-3">
                              {event.hostPhoto ? (
                                <img
                                  src={event.hostPhoto}
                                  alt={event.hostName}
                                  className="w-8 h-8 rounded-full mr-2 object-cover"
                                />
                              ) : (
                                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-8 h-8 mr-2" />
                              )}
                              <span className="text-sm">{event.hostName}</span>
                            </div>

                            <CountdownTimer
                              eventDate={event.date}
                              eventTime={event.time}
                            />

                            <div className="mt-2">
                              <p className="text-sm text-muted-foreground mb-1">
                                <span className="font-medium">Date:</span> {event.date}
                              </p>
                              <p className="text-sm text-muted-foreground mb-1">
                                <span className="font-medium">Time:</span> {event.time}
                              </p>
                              <p className="text-sm text-muted-foreground mb-3">
                                <span className="font-medium">Duration:</span> {event.duration} minutes
                              </p>
                              <div className="w-full">
                                <Button
                                  className="
                                      w-full 
                                      bg-gradient-to-r from-blue-500 to-blue-700 
                                      bg-[length:200%] bg-left 
                                      text-white font-bold 
                                      py-3 
                                      rounded-lg 
                                      transition-all duration-700 ease-in-out
                                      hover:bg-right
                                    "
                                  onClick={() => handleJoinEvent(event.id)}
                                >
                                  Join here
                                </Button>
                              </div>

                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="past">
                  {loading ? (
                    <div className="text-center py-8">
                      <p>Loading events...</p>
                    </div>
                  ) : past.length === 0 ? (
                    <div className="text-center py-8">
                      <p>No past events found</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                      {past.map((event) => (
                        <div
                          key={event.id}
                          className="border rounded-lg overflow-hidden shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col"
                        >
                          {/* Event Image Section */}
                          {event.coverImageURL ? (
                            <div className="w-full h-48 overflow-hidden">
                              <img
                                src={event.coverImageURL}
                                alt={event.title}
                                className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.onerror = null;
                                  target.src = "https://via.placeholder.com/300x150?text=Event+Image";
                                }}
                              />
                            </div>
                          ) : (
                            <div className="bg-gray-100 w-full h-48 flex items-center justify-center">
                              <span className="text-gray-500">No image available</span>
                            </div>
                          )}

                          {/* Event Details Section */}
                          <div className="p-4 flex-grow flex flex-col">
                            <h3 className="font-bold text-lg mb-2">{event.title}</h3>
                            <div className="flex items-center mb-3">
                              {event.hostPhoto ? (
                                <img
                                  src={event.hostPhoto}
                                  alt={event.hostName}
                                  className="w-8 h-8 rounded-full mr-2 object-cover"
                                />
                              ) : (
                                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-8 h-8 mr-2" />
                              )}
                              <span className="text-sm">{event.hostName}</span>
                            </div>
                            <div className="mt-auto">
                              <p className="text-sm text-muted-foreground mb-1">
                                <span className="font-medium">Date:</span> {event.date}
                              </p>
                              <p className="text-sm text-muted-foreground mb-1">
                                <span className="font-medium">Duration:</span> {event.duration} minutes
                              </p>
                              <div className="flex flex-wrap gap-2 justify-between items-center mt-3">
                                <Button size="sm">
                                  Watch Replay
                                </Button>
                                <Button variant="outline" size="sm">
                                  <span className="mr-2">Download</span>
                                  Certificate
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Attendee;