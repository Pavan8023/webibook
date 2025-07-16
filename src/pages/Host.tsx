import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, X, Edit, Trash, Import } from 'lucide-react';
import { DashboardNavbar } from "@/components/layout/DashNavbar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { 
  addDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  deleteDoc, 
  doc, 
  updateDoc 
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, auth } from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { toast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';

// Define event type
interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  duration: string;
  category: string;
  maxAttendees: string;
  coverImageURL?: string;
  hostId: string;
  hostName: string;
  createdAt: Date;
  status: string;
  attendees: string[];
}

const Host = () => {
  const [user] = useAuthState(auth);
  const [showForm, setShowForm] = useState(false);
  const [eventType, setEventType] = useState('seminar');
  const [hostedEvents, setHostedEvents] = useState<Event[]>([]);
  const [totalEvents, setTotalEvents] = useState(0);
  const [averageAttendance, setAverageAttendance] = useState(0);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    photoURL: '',
    role: ''
  });
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Initialize formData as state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    duration: '60',
    category: 'technology',
    maxAttendees: '100',
  });

  // Refs for scrolling to sections
  const profileRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);

  // Scroll to section when route changes
  useEffect(() => {
    const hash = window.location.hash;
    if (hash === '#profile' && profileRef.current) {
      profileRef.current.scrollIntoView({ behavior: 'smooth' });
    } else if (hash === '#settings' && settingsRef.current) {
      settingsRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;
      
      // Determine user collection based on sign-in method
      const provider = user.providerData[0]?.providerId;
      let collectionName = 'signupfromusers';
      
      if (provider === 'google.com') collectionName = 'googleauthusers';
      if (provider === 'twitter.com') collectionName = 'twitterauthusers';

      try {
        const q = query(collection(db, collectionName), where('email', '==', user.email));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const docData = querySnapshot.docs[0].data();
          setProfileData({
            name: docData.name || user.displayName || '',
            email: user.email || '',
            photoURL: docData.photoURL || user.photoURL || '',
            role: docData.role || ''
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchUserProfile();
  }, [user]);

  // Fetch hosted events
  useEffect(() => {
    const fetchEvents = async () => {
      if (!user) return;
      
      try {
        const eventsRef = collection(db, 'events');
        const q = query(eventsRef, where('hostId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        
        const events: Event[] = [];
        let totalAttendees = 0;
        let totalCapacity = 0;
        
        querySnapshot.forEach(doc => {
          const eventData = doc.data() as Event;
          events.push({ ...eventData, id: doc.id });
          
          // Calculate attendance for analytics
          if (eventData.attendees && eventData.maxAttendees) {
            totalAttendees += eventData.attendees.length;
            totalCapacity += parseInt(eventData.maxAttendees);
          }
        });
        
        setHostedEvents(events);
        setTotalEvents(events.length);
        
        // Calculate average attendance percentage
        if (totalCapacity > 0) {
          setAverageAttendance(Math.round((totalAttendees / totalCapacity) * 100));
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchEvents();
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfileFile(e.target.files[0]);
    }
  };

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCoverImage(e.target.files[0]);
    }
  };

  const updateUserProfile = async () => {
    if (!user) return;
    
    try {
      // Determine user collection
      const provider = user.providerData[0]?.providerId;
      let collectionName = 'signupfromusers';
      
      if (provider === 'google.com') collectionName = 'googleauthusers';
      if (provider === 'twitter.com') collectionName = 'twitterauthusers';

      // Upload profile image if selected
      let photoURL = profileData.photoURL;
      if (profileFile) {
        const storage = getStorage();
        const storageRef = ref(storage, `profile_photos/${user.uid}`);
        await uploadBytes(storageRef, profileFile);
        photoURL = await getDownloadURL(storageRef);
      }

      // Update profile in Firestore
      const q = query(collection(db, collectionName), where('email', '==', user.email));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const docRef = doc(db, collectionName, querySnapshot.docs[0].id);
        await updateDoc(docRef, {
          name: profileData.name,
          photoURL: photoURL,
          updatedAt: new Date()
        });
      }

      // Update local state
      setProfileData(prev => ({ ...prev, photoURL }));
      setIsEditingProfile(false);
      setProfileFile(null);
      
      toast({
        title: "Profile updated!",
        description: "Your profile has been successfully updated",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update failed",
        description: "Could not update your profile",
        variant: "destructive"
      });
    }
  };

  const handleCreateEvent = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create events",
        variant: "destructive"
      });
      return;
    }

    try {
      let coverImageURL = '';
      
      // Upload cover image if selected
      if (coverImage) {
        const storage = getStorage();
        const storageRef = ref(storage, `event_covers/${user.uid}/${Date.now()}_${coverImage.name}`);
        await uploadBytes(storageRef, coverImage);
        coverImageURL = await getDownloadURL(storageRef);
      }

      // Create event in Firestore
      const eventsRef = collection(db, 'events');
      const eventData = {
        ...formData,
        hostId: user.uid,
        hostName: profileData.name,
        createdAt: new Date(),
        status: 'upcoming',
        attendees: [],
        coverImageURL,
        eventType
      };

      await addDoc(eventsRef, eventData);

      toast({
        title: "Event created!",
        description: "Your event has been successfully created",
      });

      setShowForm(false);
      setFormData({
        title: '',
        description: '',
        date: '',
        time: '',
        duration: '60',
        category: 'technology',
        maxAttendees: '100',
      });
      setCoverImage(null);

      // Redirect to event management page
      navigate('/host');

    } catch (error) {
      toast({
        title: "Error creating event",
        description: "Please try again later",
        variant: "destructive"
      });
      console.error('Error creating event:', error);
    }
  };

  const deleteEvent = async (eventId: string) => {
    try {
      await deleteDoc(doc(db, 'events', eventId));
      setHostedEvents(prev => prev.filter(event => event.id !== eventId));
      setTotalEvents(prev => prev - 1);
      
      toast({
        title: "Event deleted",
        description: "Your event has been removed",
      });
    } catch (error) {
      toast({
        title: "Error deleting event",
        description: "Please try again later",
        variant: "destructive"
      });
      console.error('Error deleting event:', error);
    }
  };

  // Automatically delete past events
  useEffect(() => {
    const cleanupPastEvents = async () => {
      const now = new Date();
      const eventsToDelete = hostedEvents.filter(event => {
        const eventDate = new Date(`${event.date}T${event.time}`);
        const endTime = new Date(eventDate.getTime() + parseInt(event.duration) * 60000);
        return now > endTime;
      });

      for (const event of eventsToDelete) {
        await deleteDoc(doc(db, 'events', event.id));
      }

      if (eventsToDelete.length > 0) {
        setHostedEvents(prev => 
          prev.filter(event => !eventsToDelete.some(e => e.id === event.id))
        );
        setTotalEvents(prev => prev - eventsToDelete.length);
      }
    };

    // Run cleanup every 10 minutes
    const interval = setInterval(cleanupPastEvents, 600000);
    return () => clearInterval(interval);
  }, [hostedEvents]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <DashboardNavbar />

      <main className="flex-grow pt-16">
        <div className="container py-6 md:py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">Host Dashboard</h1>
              <p className="text-muted-foreground">
                Manage your webinars, seminars, and events
              </p>
            </div>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create New Event
            </Button>
          </div>

          {/* Event Creation Form */}
          {showForm && (
            <Card className="mb-8">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Create New Event</CardTitle>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setShowForm(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-1">Event Type</label>
                      <Select value={eventType} onValueChange={setEventType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select event type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="seminar">Seminar</SelectItem>
                          <SelectItem value="workshop">Workshop</SelectItem>
                          <SelectItem value="conference">Conference</SelectItem>
                          <SelectItem value="webinar">Webinar</SelectItem>
                          <SelectItem value="training">Training Session</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-1">Event Title</label>
                      <Input 
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="Enter event title"
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-1">Description</label>
                      <Textarea 
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Describe your event"
                        rows={4}
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-1">Category</label>
                      <Select 
                        value={formData.category}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="technology">Technology</SelectItem>
                          <SelectItem value="business">Business</SelectItem>
                          <SelectItem value="marketing">Marketing</SelectItem>
                          <SelectItem value="design">Design</SelectItem>
                          <SelectItem value="health">Health & Wellness</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Date</label>
                        <Input 
                          type="date"
                          name="date"
                          value={formData.date}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Time</label>
                        <Input 
                          type="time"
                          name="time"
                          value={formData.time}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Duration (min)</label>
                        <Select 
                          value={formData.duration}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, duration: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select duration" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="30">30 minutes</SelectItem>
                            <SelectItem value="60">60 minutes</SelectItem>
                            <SelectItem value="90">90 minutes</SelectItem>
                            <SelectItem value="120">120 minutes</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Max Attendees</label>
                        <Input 
                          type="number"
                          name="maxAttendees"
                          value={formData.maxAttendees}
                          onChange={handleInputChange}
                          min="1"
                        />
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-1">Cover Image</label>
                      <div 
                        className="flex items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {coverImage ? (
                          <img 
                            src={URL.createObjectURL(coverImage)} 
                            alt="Cover preview" 
                            className="h-full w-full object-cover rounded-lg"
                          />
                        ) : (
                          <div className="text-center">
                            <p className="text-sm text-muted-foreground">
                              Drag & drop or click to upload
                            </p>
                            <Button variant="outline" className="mt-2">
                              Select Image
                            </Button>
                          </div>
                        )}
                      </div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleCoverImageChange}
                        accept="image/*"
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateEvent}>
                  Create Event
                </Button>
              </CardFooter>
            </Card>
          )}

          {/* Hosted Events List */}
          <Card>
            <CardHeader>
              <CardTitle>Your Hosted Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {hostedEvents.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">You haven't hosted any events yet</p>
                    <Button className="mt-4" onClick={() => setShowForm(true)}>
                      Create Your First Event
                    </Button>
                  </div>
                ) : (
                  hostedEvents.map(event => (
                    <div key={event.id} className="border rounded-lg p-4 flex justify-between items-center">
                      <div className="flex items-center space-x-4">
                        {event.coverImageURL && (
                          <img 
                            src={event.coverImageURL} 
                            alt={event.title} 
                            className="w-16 h-16 rounded-md object-cover"
                          />
                        )}
                        <div>
                          <h3 className="font-medium">{event.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {event.date} at {event.time}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <div className="font-medium">{event.attendees.length}</div>
                          <div className="text-xs text-muted-foreground">Attendees</div>
                        </div>
                        <Badge variant={event.status === 'upcoming' ? 'secondary' : 'default'}>
                          {event.status}
                        </Badge>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            Manage
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => deleteEvent(event.id)}
                          >
                            <Trash size={16} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Analytics Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Total Events Hosted</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{totalEvents}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Average Attendance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{averageAttendance}%</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Attendee Rating</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">4.7/5</div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Section */}
          <div ref={profileRef} className="pt-20 -mt-20">
            <Card className="my-8">
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <img 
                      src={
                        profileFile ? URL.createObjectURL(profileFile) : 
                        profileData.photoURL || '/placeholder-user.jpg'
                      } 
                      alt="Profile" 
                      className="w-24 h-24 rounded-full object-cover border-2 border-blue-500"
                    />
                    <Button 
                      variant="outline"
                      className="absolute -bottom-2 -right-2"
                      onClick={() => coverInputRef.current?.click()}
                    >
                      <Edit size={16} />
                    </Button>
                    <input
                      type="file"
                      ref={coverInputRef}
                      onChange={handleProfileFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-1">Full Name</label>
                      <Input 
                        value={profileData.name}
                        onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Email</label>
                      <Input 
                        value={profileData.email}
                        disabled
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={updateUserProfile}>Save Changes</Button>
              </CardFooter>
            </Card>
          </div>

        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Host;