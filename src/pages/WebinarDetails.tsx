
import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CategoryBadge } from '@/components/ui/CategoryBadge';
import { Calendar, Clock, User, MessageSquare, Calendar as CalendarIcon, Share2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import CheckCircle2 from '@/components/ui/CheckCircle2';
import { RegistrationModal } from '@/components/webinar/RegistrationModal';
import { isRegisteredForWebinar, getWebinarRegistrationCount } from '@/services/webinarService';

// In a real app, this would come from an API
const webinarData = {
  "101": {
    id: "101",
    title: "Introduction to React Hooks",
    description: "Learn the fundamentals of React Hooks and how they can simplify your code. This comprehensive webinar will cover useState, useEffect, useContext, and custom hooks with practical examples and best practices for production applications.",
    longDescription: "React Hooks revolutionized how we build React components, enabling function components to use state and other React features without writing classes. In this in-depth session, we'll explore the entire hooks ecosystem, from basic state management to complex side effects. You'll learn how to refactor class components to function components, implement custom hooks to share logic across your application, and understand the rules and best practices for using hooks effectively. By the end of this webinar, you'll be equipped with the knowledge to build cleaner, more maintainable React applications.",
    imageUrl: "https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?q=80&w=2070&auto=format&fit=crop",
    date: "2025-04-10",
    time: "11:00 AM EST",
    duration: "60 min",
    speaker: {
      name: "Alex Johnson",
      role: "Senior Developer",
      company: "ReactMasters",
      bio: "Alex has been working with React for over 6 years and has contributed to several popular open-source libraries. He specializes in performance optimization and state management solutions.",
      imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80"
    },
    category: "Development",
    topics: ["React", "JavaScript", "Web Development", "Hooks API"],
    attendees: 256,
    isFree: false,
    price: 29.99,
    agenda: [
      {
        time: "11:00 AM",
        title: "Introduction to React Hooks",
        description: "Overview of the hooks API and its advantages"
      },
      {
        time: "11:15 AM",
        title: "Basic Hooks",
        description: "Deep dive into useState, useEffect, and useContext"
      },
      {
        time: "11:35 AM",
        title: "Advanced Hooks",
        description: "Exploring useReducer, useMemo, and useCallback"
      },
      {
        time: "11:50 AM",
        title: "Custom Hooks",
        description: "Creating reusable logic with custom hooks"
      },
      {
        time: "12:00 PM",
        title: "Q&A Session",
        description: "Live questions and answers"
      }
    ],
    isUpcoming: true
  },
  "102": {
    id: "102",
    title: "Digital Marketing Trends 2025",
    description: "Explore the latest trends in digital marketing and how to leverage them for your business.",
    longDescription: "The digital marketing landscape is constantly evolving with new technologies, platforms, and consumer behaviors. This webinar will examine the most significant trends shaping the industry in 2025 and provide actionable strategies for implementing them in your marketing campaigns. From AI-powered personalization to immersive content experiences, we'll cover everything you need to stay ahead of the competition.",
    imageUrl: "https://images.unsplash.com/photo-1611162616475-46b635cb6868?q=80&w=2074&auto=format&fit=crop",
    date: "2025-04-15",
    time: "2:00 PM EST",
    duration: "75 min",
    speaker: {
      name: "Emily Parker",
      role: "Marketing Director",
      company: "DigitalGrowth",
      bio: "Emily is a seasoned marketing professional with experience working with Fortune 500 companies. She specializes in digital transformation and emerging marketing technologies.",
      imageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80"
    },
    category: "Marketing",
    topics: ["Digital Marketing", "Social Media", "Content Strategy", "Analytics"],
    attendees: 189,
    isFree: true,
    price: 0,
    agenda: [
      {
        time: "2:00 PM",
        title: "2025 Marketing Landscape",
        description: "Overview of changes in consumer behavior and technology"
      },
      {
        time: "2:15 PM",
        title: "AI in Marketing",
        description: "How artificial intelligence is transforming customer engagement"
      },
      {
        time: "2:35 PM",
        title: "Content Evolution",
        description: "New formats and distribution channels gaining traction"
      },
      {
        time: "2:55 PM",
        title: "Measurement & Analytics",
        description: "Advanced approaches to tracking marketing effectiveness"
      },
      {
        time: "3:15 PM",
        title: "Q&A Session",
        description: "Interactive discussion with attendees"
      }
    ],
    isUpcoming: true
  }
};

const WebinarDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [registered, setRegistered] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [attendeeCount, setAttendeeCount] = useState(0);
  
  // If id doesn't exist in our data, we could redirect to a 404 page
  const webinar = webinarData[id as keyof typeof webinarData];
  
  useEffect(() => {
    if (id) {
      // Check if user is already registered
      const isRegistered = isRegisteredForWebinar(id);
      setRegistered(isRegistered);
      
      // Get attendee count
      const attendeeCount = webinar ? (webinar.attendees || 0) + getWebinarRegistrationCount(id) : 0;
      setAttendeeCount(attendeeCount);
    }
  }, [id, webinar]);
  
  if (!webinar) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Webinar Not Found</h1>
            <p className="mb-6 text-muted-foreground">The webinar you're looking for doesn't exist or has been removed.</p>
            <Button asChild>
              <Link to="/discover">Browse Webinars</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  const handleRegister = () => {
    setShowRegistrationModal(true);
  };
  
  const handleRegistrationComplete = () => {
    setRegistered(true);
    // Update the attendee count after registration
    setAttendeeCount(prev => prev + 1);
  };
  
  const handleAddToCalendar = () => {
    // Create calendar event data
    const eventTitle = webinar.title;
    const eventDescription = webinar.description;
    const eventDate = new Date(webinar.date);
    const eventTime = webinar.time;
    const durationMinutes = parseInt(webinar.duration);
    
    // Format for Google Calendar
    const startDate = encodeURIComponent(eventDate.toISOString());
    const endDate = encodeURIComponent(
      new Date(eventDate.getTime() + durationMinutes * 60000).toISOString()
    );
    
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventTitle)}&dates=${startDate}/${endDate}&details=${encodeURIComponent(eventDescription)}`;
    
    // Open in a new tab
    window.open(googleCalendarUrl, '_blank');
    
    toast({
      title: "Added to calendar",
      description: "This event has been added to your Google Calendar.",
    });
  };
  
  const handleShare = () => {
    // Use Web Share API if available
    if (navigator.share) {
      navigator.share({
        title: webinar.title,
        text: webinar.description,
        url: window.location.href,
      })
      .then(() => console.log('Successful share'))
      .catch((error) => console.log('Error sharing:', error));
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied",
        description: "Webinar link copied to clipboard",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-16">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="mb-6">
                <CategoryBadge category={webinar.category} className="mb-3" />
                <h1 className="text-3xl md:text-4xl font-bold mb-4">{webinar.title}</h1>
                
                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="mr-1.5 h-4 w-4" />
                    {webinar.date}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="mr-1.5 h-4 w-4" />
                    {webinar.time} ({webinar.duration})
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <User className="mr-1.5 h-4 w-4" />
                    {attendeeCount} registered
                  </div>
                </div>
                
                <div className="aspect-[16/9] rounded-lg overflow-hidden bg-muted mb-8">
                  <img 
                    src={webinar.imageUrl} 
                    alt={webinar.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              
              <Tabs defaultValue="details" className="mb-10">
                <TabsList className="grid grid-cols-3 w-full max-w-md">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="agenda">Agenda</TabsTrigger>
                  <TabsTrigger value="discussion">Discussion</TabsTrigger>
                </TabsList>
                
                <TabsContent value="details" className="mt-6">
                  <div className="prose max-w-none">
                    <h3 className="text-xl font-semibold mb-3">About This Webinar</h3>
                    <p className="mb-4">{webinar.longDescription}</p>
                    
                    <h3 className="text-xl font-semibold mb-3 mt-8">Topics Covered</h3>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {webinar.topics.map((topic) => (
                        <span key={topic} className="px-3 py-1 bg-slate-100 rounded-full text-sm">
                          {topic}
                        </span>
                      ))}
                    </div>
                    
                    <h3 className="text-xl font-semibold mb-3 mt-8">What You'll Learn</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                        <span>Comprehensive understanding of the latest industry trends</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                        <span>Practical strategies you can implement immediately</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                        <span>Insights from industry experts with real-world experience</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                        <span>Access to exclusive resources and tools</span>
                      </li>
                    </ul>
                  </div>
                </TabsContent>
                
                <TabsContent value="agenda" className="mt-6">
                  <h3 className="text-xl font-semibold mb-4">Webinar Agenda</h3>
                  <div className="space-y-4">
                    {webinar.agenda.map((item, index) => (
                      <div key={index} className="border-l-2 border-webi-blue pl-4 pb-4">
                        <div className="font-semibold flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-webi-blue" />
                          {item.time}
                        </div>
                        <h4 className="font-medium mt-1">{item.title}</h4>
                        <p className="text-muted-foreground text-sm mt-1">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="discussion" className="mt-6">
                  <div className="bg-slate-50 rounded-xl p-8 text-center">
                    <MessageSquare className="h-10 w-10 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Join the conversation</h3>
                    <p className="text-muted-foreground mb-4">
                      Discussion will be available after you register for this webinar.
                    </p>
                    {!registered && (
                      <Button onClick={handleRegister}>Register to participate</Button>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
            
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl border border-border shadow-sm p-6 sticky top-24">
                {webinar.isFree ? (
                  <div className="mb-6">
                    <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
                      Free
                    </span>
                  </div>
                ) : (
                  <div className="mb-6">
                    <div className="text-3xl font-bold">${webinar.price}</div>
                    <p className="text-muted-foreground text-sm">One-time purchase</p>
                  </div>
                )}
                
                {!registered ? (
                  <Button onClick={handleRegister} className="w-full mb-4 h-12 text-base">
                    Register Now
                  </Button>
                ) : (
                  <div className="bg-green-50 text-green-700 p-3 rounded-lg mb-4 flex items-center">
                    <CheckCircle2 className="h-5 w-5 mr-2" />
                    You're registered for this webinar
                  </div>
                )}
                
                <Button variant="outline" className="w-full mb-4 flex items-center justify-center" onClick={handleAddToCalendar}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  Add to Calendar
                </Button>
                
                <Button variant="outline" className="w-full mb-6 flex items-center justify-center" onClick={handleShare}>
                  <Share2 className="mr-2 h-4 w-4" />
                  Share Webinar
                </Button>
                
                <div className="border-t border-border pt-6 mb-6">
                  <h3 className="font-semibold mb-4">Speaker</h3>
                  <div className="flex items-center mb-4">
                    <div className="mr-3">
                      <img 
                        src={webinar.speaker.imageUrl} 
                        alt={webinar.speaker.name}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-medium">{webinar.speaker.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {webinar.speaker.role}, {webinar.speaker.company}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {webinar.speaker.bio}
                  </p>
                </div>
                
                <div className="border-t border-border pt-6">
                  <h3 className="font-semibold mb-3">Requirements</h3>
                  <ul className="text-sm space-y-2">
                    <li className="flex items-start">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 mr-2" />
                      <span>Stable internet connection</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 mr-2" />
                      <span>Modern web browser</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 mr-2" />
                      <span>No special software needed</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
      
      {/* Registration Modal */}
      <RegistrationModal
        isOpen={showRegistrationModal}
        onClose={() => setShowRegistrationModal(false)}
        webinarId={id || ""}
        webinarTitle={webinar.title}
        webinarDate={webinar.date}
        webinarTime={webinar.time}
      />
    </div>
  );
};

export default WebinarDetails;
