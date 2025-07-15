
import { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { WebinarCard, WebinarType } from '@/components/ui/WebinarCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, BookOpen, Clock, Bell } from 'lucide-react';

const Dashboard = () => {
  // Sample webinar data
  const upcomingWebinars: WebinarType[] = [
    {
      id: "101",
      title: "Introduction to React Hooks",
      description: "Learn the fundamentals of React Hooks and how they can simplify your code.",
      imageUrl: "https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?q=80&w=2070&auto=format&fit=crop",
      date: "2025-04-10",
      time: "11:00 AM EST",
      duration: "60 min",
      speaker: {
        name: "Alex Johnson",
        role: "Senior Developer",
        company: "ReactMasters"
      },
      category: "Development",
      isUpcoming: true
    },
    {
      id: "102",
      title: "Digital Marketing Trends 2025",
      description: "Explore the latest trends in digital marketing and how to leverage them for your business.",
      imageUrl: "https://images.unsplash.com/photo-1611162616475-46b635cb6868?q=80&w=2074&auto=format&fit=crop",
      date: "2025-04-15",
      time: "2:00 PM EST",
      duration: "75 min",
      speaker: {
        name: "Emily Parker",
        role: "Marketing Director",
        company: "DigitalGrowth"
      },
      category: "Marketing",
      isUpcoming: true
    }
  ];
  
  const recommendedWebinars: WebinarType[] = [
    {
      id: "201",
      title: "AI in Business: Practical Applications",
      description: "Discover how businesses are implementing AI solutions for real-world problems.",
      imageUrl: "https://images.unsplash.com/photo-1581092921461-7d65ca45e4af?q=80&w=2070&auto=format&fit=crop",
      date: "2025-04-18",
      time: "1:00 PM EST",
      duration: "90 min",
      speaker: {
        name: "Dr. Sarah Chen",
        role: "Head of AI Research",
        company: "TechFuture Labs"
      },
      category: "Technology",
      isFeatured: true
    },
    {
      id: "202",
      title: "Building Sustainable Business Models",
      description: "Learn strategies for creating environmentally and economically sustainable business models.",
      imageUrl: "https://images.unsplash.com/photo-1569950044272-a3bcc7cd7750?q=80&w=2071&auto=format&fit=crop",
      date: "2025-04-22",
      time: "10:00 AM EST",
      duration: "60 min",
      speaker: {
        name: "Michael Green",
        role: "Sustainability Consultant",
        company: "EcoVentures"
      },
      category: "Business",
      isTrending: true
    }
  ];
  
  const pastWebinars: WebinarType[] = [
    {
      id: "301",
      title: "Financial Planning for Entrepreneurs",
      description: "Essential financial planning strategies for startup founders and entrepreneurs.",
      imageUrl: "https://images.unsplash.com/photo-1551260627-fd1b6daa6224?q=80&w=2070&auto=format&fit=crop",
      date: "2025-03-15",
      time: "3:00 PM EST",
      duration: "60 min",
      speaker: {
        name: "Robert Smith",
        role: "Financial Advisor",
        company: "Startup Capital"
      },
      category: "Finance"
    },
    {
      id: "302",
      title: "Health and Wellness in the Workplace",
      description: "Strategies for maintaining physical and mental health in demanding work environments.",
      imageUrl: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?q=80&w=2070&auto=format&fit=crop",
      date: "2025-03-10",
      time: "12:00 PM EST",
      duration: "45 min",
      speaker: {
        name: "Dr. Lisa Wong",
        role: "Wellness Specialist",
        company: "HealthWorks"
      },
      category: "Health"
    }
  ];
  
  // Notifications state
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Webinar Starting Soon",
      message: "Introduction to React Hooks starts in 30 minutes.",
      time: "10:30 AM",
      isRead: false
    },
    {
      id: 2,
      title: "New Recommendation",
      message: "Based on your interests: AI in Business: Practical Applications",
      time: "Yesterday",
      isRead: true
    },
    {
      id: 3,
      title: "Speaker Added",
      message: "New speaker added to Digital Marketing Trends 2025",
      time: "2 days ago",
      isRead: true
    }
  ]);
  
  const markAsRead = (id: number) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, isRead: true } : notification
    ));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-16">
        <div className="container-wide">
          <div className="mb-10">
            <h1 className="text-3xl font-bold mb-2">My Dashboard</h1>
            <p className="text-muted-foreground">Manage your webinars and discover personalized recommendations</p>
          </div>
          
          <Tabs defaultValue="upcoming" className="space-y-8">
            <TabsList className="grid grid-cols-4 max-w-lg">
              <TabsTrigger value="upcoming" className="flex items-center">
                <Calendar className="mr-2 h-4 w-4" />
                Upcoming
              </TabsTrigger>
              <TabsTrigger value="recommended" className="flex items-center">
                <BookOpen className="mr-2 h-4 w-4" />
                For You
              </TabsTrigger>
              <TabsTrigger value="past" className="flex items-center">
                <Clock className="mr-2 h-4 w-4" />
                Past
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center">
                <Bell className="mr-2 h-4 w-4" />
                Alerts
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="upcoming" className="mt-6">
              <h2 className="text-xl font-semibold mb-6">Upcoming Webinars</h2>
              {upcomingWebinars.length === 0 ? (
                <div className="bg-muted/30 rounded-xl p-10 text-center">
                  <h3 className="text-lg font-medium mb-2">No upcoming webinars</h3>
                  <p className="text-muted-foreground mb-4">You don't have any webinars scheduled.</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {upcomingWebinars.map((webinar) => (
                    <WebinarCard key={webinar.id} webinar={webinar} />
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="recommended" className="mt-6">
              <h2 className="text-xl font-semibold mb-6">Recommended For You</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {recommendedWebinars.map((webinar) => (
                  <WebinarCard key={webinar.id} webinar={webinar} />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="past" className="mt-6">
              <h2 className="text-xl font-semibold mb-6">Past Webinars</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {pastWebinars.map((webinar) => (
                  <WebinarCard key={webinar.id} webinar={webinar} />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="notifications" className="mt-6">
              <h2 className="text-xl font-semibold mb-6">Notifications</h2>
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`p-4 rounded-lg border ${notification.isRead ? 'bg-white' : 'bg-webi-lightblue/20 border-webi-blue/30'}`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium">{notification.title}</h3>
                      <span className="text-xs text-muted-foreground">{notification.time}</span>
                    </div>
                    <p className="text-muted-foreground mt-1">{notification.message}</p>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
