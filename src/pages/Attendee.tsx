import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Calendar, Clock, Award, MessageSquare, Bookmark, Download, Settings, Bell, User } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

const Attendee = () => {
  const [user] = useAuthState(auth);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>({});
  const [hostData, setHostData] = useState<any>({});
  const [activeTab, setActiveTab] = useState('upcoming');

  // Fetch attendee data from Firestore
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      setLoading(true);
      
      try {
        // Fetch attendee data
        const attendeesRef = collection(db, 'attendees');
        const q = query(attendeesRef, where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const attendeeData = querySnapshot.docs[0].data();
          setDashboardData(attendeeData);
          
          // Fetch host data for events
          if (attendeeData.upcomingEvents?.length > 0) {
            const hostId = attendeeData.upcomingEvents[0].hostId;
            const hostDoc = await getDoc(doc(db, 'hosts', hostId));
            if (hostDoc.exists()) {
              setHostData(hostDoc.data());
            }
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Mock data for UI demonstration
  const mockDashboardData = {
    totalEvents: 12,
    upcomingEvents: 3,
    certificatesCount: 5, // Changed from certificates to avoid conflict
    engagementScore: 87,
    timeSpent: 42,
    categories: ['Technology', 'Business', 'Marketing'],
    streak: 7,
    progress: 65,
    events: {
      upcoming: [
        { 
          id: '1', 
          title: 'AI in Modern Business', 
          date: '2023-10-15', 
          time: '14:00 - 16:00', 
          host: 'Tech Innovations Inc.', 
          status: 'Registered' 
        },
        { 
          id: '2', 
          title: 'Digital Marketing Strategies', 
          date: '2023-10-20', 
          time: '10:00 - 12:00', 
          host: 'Marketing Pros', 
          status: 'Registered' 
        }
      ],
      attended: [
        { 
          id: '3', 
          title: 'Blockchain Fundamentals', 
          date: '2023-09-10', 
          host: 'Crypto Experts', 
          status: 'Attended',
          certificate: true 
        }
      ],
      past: [
        { 
          id: '4', 
          title: 'Startup Funding 101', 
          date: '2023-08-22', 
          host: 'Venture Capital Group', 
          status: 'Missed',
          replay: true 
        }
      ]
    },
    comments: [
      { 
        id: '1', 
        event: 'AI in Modern Business', 
        text: 'This completely changed my perspective on AI implementation!', 
        upvotes: 24 
      }
    ],
    recommendations: [
      { 
        id: '1', 
        title: 'Data Science for Beginners', 
        reason: 'Based on your interest in AI and Technology', 
        date: '2023-11-05' 
      }
    ],
    certificatesList: [ // Changed from certificates to avoid conflict
      { 
        id: '1', 
        title: 'AI Fundamentals Certification', 
        date: '2023-09-10', 
        skills: ['AI', 'Machine Learning'] 
      }
    ],
    forums: [
      { 
        id: '1', 
        name: 'Tech Innovators Forum', 
        posts: 5 
      }
    ]
  };

  // Use mock data if Firestore data not loaded yet
  const data = loading ? mockDashboardData : dashboardData;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-grow pt-16 md:pt-20">
        <div className="container py-6 md:py-8">
          {/* Dashboard Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold">My Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back! Here's your webinar activity and progress
            </p>
          </div>
          
          {/* Dashboard Overview Widgets */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium">Total Events Attended</CardTitle>
                <Calendar className="h-5 w-5 text-webi-blue" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{data.totalEvents || 0}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
                <Clock className="h-5 w-5 text-webi-blue" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{data.upcomingEvents || 0}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium">Certificates Earned</CardTitle>
                <Award className="h-5 w-5 text-webi-blue" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{data.certificatesCount || 0}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium">Engagement Score</CardTitle>
                <MessageSquare className="h-5 w-5 text-webi-blue" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{data.engagementScore || 0}/100</div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Analytics Panel */}
            <div className="lg:col-span-2">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Analytics & Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-2">Time Spent in Webinars</h3>
                      <p className="text-2xl font-bold">{data.timeSpent || 0} hours</p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-2">Categories Explored</h3>
                      <div className="flex flex-wrap gap-2">
                        {data.categories?.map((category: string, index: number) => (
                          <Badge key={index} variant="outline">{category}</Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-2">Engagement Heatmap</h3>
                      <div className="bg-gray-100 rounded-lg p-4">
                        <p className="text-muted-foreground text-center py-8">
                          Heatmap visualization will appear here
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Learning Streak & Gamification */}
            <div>
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Learning Streak</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-4xl font-bold mb-2">{data.streak || 0}</div>
                      <p className="text-muted-foreground">Days in a row</p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-2">Progress to Next Badge</h3>
                      <Progress value={data.progress || 0} className="h-3" />
                      <p className="text-sm text-muted-foreground mt-1">
                        {data.progress || 0}% complete
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-2">Your Badges</h3>
                      <div className="flex gap-2">
                        <Badge variant="secondary">Active Learner</Badge>
                        <Badge variant="secondary">Comment Contributor</Badge>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-2">Leaderboard Position</h3>
                      <div className="bg-gray-100 rounded-lg p-4">
                        <p className="text-muted-foreground text-center py-4">
                          Top 15% of learners
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* My Events Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>My Events</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-3">
                  <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                  <TabsTrigger value="attended">Attended</TabsTrigger>
                  <TabsTrigger value="past">Past with Replays</TabsTrigger>
                </TabsList>
                
                <TabsContent value="upcoming">
                  <div className="space-y-4 mt-4">
                    {data.events?.upcoming?.map((event: any) => (
                      <div key={event.id} className="border rounded-lg p-4 flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">{event.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {event.date} • {event.time}
                          </p>
                          <p className="text-sm mt-1">Host: {event.host}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant="secondary">{event.status}</Badge>
                          <Button variant="outline" size="sm">
                            Add to Calendar
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="attended">
                  <div className="space-y-4 mt-4">
                    {data.events?.attended?.map((event: any) => (
                      <div key={event.id} className="border rounded-lg p-4 flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">{event.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {event.date} • Host: {event.host}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant="secondary">Attended</Badge> {/* Changed from success to secondary */}
                          {event.certificate && (
                            <Button variant="outline" size="sm">
                              <Download className="mr-2 h-4 w-4" />
                              Certificate
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="past">
                  <div className="space-y-4 mt-4">
                    {data.events?.past?.map((event: any) => (
                      <div key={event.id} className="border rounded-lg p-4 flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">{event.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {event.date} • Host: {event.host}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={event.status === 'Missed' ? 'destructive' : 'secondary'}>
                            {event.status}
                          </Badge>
                          {event.replay && (
                            <Button size="sm">
                              Watch Replay
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Top Comments & Interactions */}
            <Card>
              <CardHeader>
                <CardTitle>Top Comments & Interactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.comments?.map((comment: any) => (
                    <div key={comment.id} className="border rounded-lg p-4">
                      <div className="flex justify-between">
                        <h4 className="font-medium">{comment.event}</h4>
                        <div className="flex items-center">
                          <span className="text-sm text-muted-foreground mr-2">{comment.upvotes} upvotes</span>
                          <Button variant="ghost" size="icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                              <polyline points="16 6 12 2 8 6"></polyline>
                              <line x1="12" y1="2" x2="12" y2="15"></line>
                            </svg>
                          </Button>
                        </div>
                      </div>
                      <p className="mt-2">"{comment.text}"</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Recommended Webinars */}
            <Card>
              <CardHeader>
                <CardTitle>Recommended Webinars</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.recommendations?.map((rec: any) => (
                    <div key={rec.id} className="border rounded-lg p-4">
                      <h4 className="font-medium">{rec.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        <span className="font-medium">Why recommended:</span> {rec.reason}
                      </p>
                      <p className="text-sm mt-2">Date: {rec.date}</p>
                      <div className="flex justify-between mt-4">
                        <Button variant="outline" size="sm">
                          <Bookmark className="mr-2 h-4 w-4" />
                          Save
                        </Button>
                        <Button size="sm">
                          Register
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* My Certificates & Skills */}
            <Card>
              <CardHeader>
                <CardTitle>My Certificates & Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.certificatesList?.map((cert: any) => ( // Changed to certificatesList
                    <div key={cert.id} className="border rounded-lg p-4 flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">{cert.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Completed on {cert.date}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {cert.skills?.map((skill: string, index: number) => (
                            <Badge key={index} variant="secondary">{skill}</Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </Button>
                        <Button variant="secondary" size="sm">
                          Share to LinkedIn
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Community Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Community Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.forums?.map((forum: any) => (
                    <div key={forum.id} className="border rounded-lg p-4">
                      <h4 className="font-medium">{forum.name}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {forum.posts} posts
                      </p>
                      <Button variant="link" className="mt-2 pl-0">
                        View Activity
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Account Quick Links */}
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" className="flex-col h-auto py-4">
                  <User className="mb-2 h-6 w-6" />
                  <span>Profile</span>
                </Button>
                
                <Button variant="outline" className="flex-col h-auto py-4">
                  <Calendar className="mb-2 h-6 w-6" />
                  <span>Calendar Sync</span>
                </Button>
                
                <Button variant="outline" className="flex-col h-auto py-4">
                  <Bell className="mb-2 h-6 w-6" />
                  <span>Notifications</span>
                </Button>
                
                <Button variant="outline" className="flex-col h-auto py-4">
                  <Settings className="mb-2 h-6 w-6" />
                  <span>Switch to Host</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Attendee;