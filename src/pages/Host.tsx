// src/pages/Host.tsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { DashboardNavbar } from '@/components/layout/DashboardNavbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, X, Edit, Save, Trash, Pencil, Eye, Copy } from 'lucide-react';
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
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { toast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

declare global {
  interface Window {
    cloudinary: any;
  }
}

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
  eventType: string;
}

const Host = () => {
  const [user] = useAuthState(auth);
  const location = useLocation();
  const [showForm, setShowForm] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [eventType, setEventType] = useState('seminar');
  const [hostedEvents, setHostedEvents] = useState<Event[]>([]);
  const [totalEvents, setTotalEvents] = useState(0);
  const [averageAttendance, setAverageAttendance] = useState(0);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    photoURL: '',
    role: ''
  });
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [viewingEvent, setViewingEvent] = useState<Event | null>(null);
  const navigate = useNavigate();
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Initialize formData as state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    duration: '60',
    category: 'technology',
    maxAttendees: '100',
    coverImageURL: ''
  });

  // Load Cloudinary script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://upload-widget.cloudinary.com/global/all.js';
    script.async = true;
    document.body.appendChild(script);
    
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Handle hash changes for profile/settings
  useEffect(() => {
    const hash = location.hash;
    if (hash === '#profile') {
      setShowProfile(true);
      setShowSettings(false);
    } else if (hash === '#settings') {
      setShowSettings(true);
      setShowProfile(false);
    } else {
      setShowProfile(false);
      setShowSettings(false);
    }
  }, [location]);

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
          const eventData = doc.data();
          events.push({ 
            id: doc.id,
            title: eventData.title,
            description: eventData.description,
            date: eventData.date,
            time: eventData.time,
            duration: eventData.duration,
            category: eventData.category,
            maxAttendees: eventData.maxAttendees,
            coverImageURL: eventData.coverImageURL,
            hostId: eventData.hostId,
            hostName: eventData.hostName,
            createdAt: eventData.createdAt.toDate(),
            status: eventData.status,
            attendees: eventData.attendees,
            eventType: eventData.eventType
          });
          
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
        toast({
          title: "Error loading events",
          description: "Failed to fetch your hosted events",
          variant: "destructive"
        });
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

  // Cloudinary upload function
  const openCloudinaryWidget = () => {
    if (!window.cloudinary) {
      toast({
        title: "Cloudinary not loaded",
        description: "Please try again later",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: cloudName,
        uploadPreset: uploadPreset,
        sources: ['local', 'url', 'camera'],
        multiple: false,
        cropping: true,
        croppingAspectRatio: 16 / 9,
        showAdvancedOptions: false,
        clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
        maxImageFileSize: 5000000, // 5MB
        maxImageWidth: 2000,
        maxImageHeight: 2000,
        theme: 'minimal',
        styles: {
          palette: {
            window: '#FFFFFF',
            sourceBg: '#F4F4F5',
            windowBorder: '#90A0B3',
            tabIcon: '#000000',
            inactiveTabIcon: '#555A5F',
            menuIcons: '#555A5F',
            link: '#0433FF',
            action: '#339933',
            inProgress: '#0433FF',
            complete: '#339933',
            error: '#cc0000',
            textDark: '#000000',
            textLight: '#FCFFFD'
          },
          fonts: {
            default: null,
            "'Fira Sans', sans-serif": {
              url: 'https://fonts.googleapis.com/css?family=Fira+Sans',
              active: true
            }
          }
        }
      },
      (error: any, result: any) => {
        setIsUploading(false);
        
        if (!error && result && result.event === "success") {
          const imageUrl = result.info.secure_url;
          setUploadedImageUrl(imageUrl);
          toast({
            title: "Image uploaded!",
            description: "Your image has been successfully uploaded to Cloudinary",
          });
        } else if (error) {
          console.error("Cloudinary widget error:", error);
          toast({
            title: "Upload failed",
            description: "Could not upload your image",
            variant: "destructive"
          });
        }
      }
    );

    widget.open();
  };

  // Copy image URL to clipboard
  const copyImageUrlToClipboard = () => {
    if (!uploadedImageUrl) return;
    
    navigator.clipboard.writeText(uploadedImageUrl)
      .then(() => {
        toast({
          title: "Copied!",
          description: "Image URL copied to clipboard",
        });
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
        toast({
          title: "Copy failed",
          description: "Could not copy image URL",
          variant: "destructive"
        });
      });
  };

  // Apply image URL to form
  const applyImageUrlToForm = () => {
    if (!uploadedImageUrl) return;
    
    setFormData(prev => ({ ...prev, coverImageURL: uploadedImageUrl }));
    toast({
      title: "Image applied!",
      description: "Image URL has been added to your event",
    });
  };

  const updateUserProfile = async () => {
    if (!user) return;
    
    try {
      // Determine user collection
      const provider = user.providerData[0]?.providerId;
      let collectionName = 'signupfromusers';
      
      if (provider === 'google.com') collectionName = 'googleauthusers';
      if (provider === 'twitter.com') collectionName = 'twitterauthusers';

      // Update profile in Firestore
      const q = query(collection(db, collectionName), where('email', '==', user.email));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const docRef = doc(db, collectionName, querySnapshot.docs[0].id);
        await updateDoc(docRef, {
          name: profileData.name,
          updatedAt: serverTimestamp()
        });
      }
      
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
      // Create event in Firestore
      const eventsRef = collection(db, 'events');
      const eventData = {
        title: formData.title,
        description: formData.description,
        date: formData.date,
        time: formData.time,
        duration: formData.duration,
        category: formData.category,
        maxAttendees: formData.maxAttendees,
        eventType,
        hostId: user.uid,
        hostName: profileData.name || user.displayName || 'Host',
        createdAt: serverTimestamp(),
        status: 'upcoming',
        attendees: [],
        coverImageURL: formData.coverImageURL
      };

      const docRef = await addDoc(eventsRef, eventData);

      // Add to local state immediately
      const newEvent = {
        id: docRef.id,
        ...eventData,
        createdAt: new Date()
      } as Event;
      
      setHostedEvents(prev => [...prev, newEvent]);
      setTotalEvents(prev => prev + 1);

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
        coverImageURL: ''
      });
      setUploadedImageUrl('');

    } catch (error) {
      console.error("Error creating event:", error);
      toast({
        title: "Error creating event",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  const handleUpdateEvent = async () => {
    if (!user || !editingEvent) return;
    
    try {
      // Update event in Firestore
      const eventRef = doc(db, 'events', editingEvent.id);
      await updateDoc(eventRef, {
        title: formData.title,
        description: formData.description,
        date: formData.date,
        time: formData.time,
        duration: formData.duration,
        category: formData.category,
        maxAttendees: formData.maxAttendees,
        eventType,
        coverImageURL: formData.coverImageURL
      });

      // Update local state
      setHostedEvents(prev => 
        prev.map(event => 
          event.id === editingEvent.id 
            ? { 
                ...event, 
                ...formData, 
                eventType,
                status: event.status // Preserve status
              } 
            : event
        )
      );

      toast({
        title: "Event updated!",
        description: "Your event has been successfully updated",
      });

      setEditingEvent(null);
      setUploadedImageUrl('');

    } catch (error) {
      console.error("Error updating event:", error);
      toast({
        title: "Error updating event",
        description: "Please try again later",
        variant: "destructive"
      });
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
      console.error("Error deleting event:", error);
      toast({
        title: "Error deleting event",
        description: "Please try again later",
        variant: "destructive"
      });
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
        try {
          await deleteDoc(doc(db, 'events', event.id));
        } catch (error) {
          console.error("Error deleting expired event:", error);
        }
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

  const closeProfileSection = () => {
    setShowProfile(false);
    navigate('/host');
  };

  const closeSettingsSection = () => {
    setShowSettings(false);
    navigate('/host');
  };

  const openEditEvent = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      duration: event.duration,
      category: event.category,
      maxAttendees: event.maxAttendees,
      coverImageURL: event.coverImageURL || ''
    });
    setEventType(event.eventType);
    setUploadedImageUrl('');
  };

  const openViewEvent = (event: Event) => {
    setViewingEvent(event);
  };

  const closeEventModal = () => {
    setEditingEvent(null);
    setViewingEvent(null);
    setUploadedImageUrl('');
  };

  const handleEventSubmit = async () => {
    if (editingEvent) {
      await handleUpdateEvent();
    } else {
      await handleCreateEvent();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <DashboardNavbar userType="host" />

      <main className="flex-grow pt-16">
        <div className="container py-6 md:py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">Host Dashboard</h1>
              <p className="text-muted-foreground">
                Manage your webinars, seminars, and events
              </p>
            </div>
            <Button onClick={() => {
              setEditingEvent(null);
              setShowForm(true);
              setFormData({
                title: '',
                description: '',
                date: '',
                time: '',
                duration: '60',
                category: 'technology',
                maxAttendees: '100',
                coverImageURL: ''
              });
              setUploadedImageUrl('');
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Create New Event
            </Button>
          </div>

          {/* Event Creation/Edit Form */}
          {(showForm || editingEvent) && (
            <Card className="mb-8">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>
                    {editingEvent ? "Edit Event" : "Create New Event"}
                  </CardTitle>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => {
                      setShowForm(false);
                      setEditingEvent(null);
                    }}
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
                      <label className="block text-sm font-medium mb-1">Cover Image URL</label>
                      <Input 
                        name="coverImageURL"
                        value={formData.coverImageURL}
                        onChange={handleInputChange}
                        placeholder="Paste image URL here"
                      />
                    </div>
                    
                    {/* Cloudinary image upload section */}
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-medium mb-3 text-center">Image Upload Tool</h3>
                      
                      <div className="grid grid-cols-3 gap-4">
                        {/* Upload Section */}
                        <div 
                          className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-4 cursor-pointer bg-white min-h-[120px]"
                          onClick={openCloudinaryWidget}
                        >
                          {isUploading ? (
                            <div className="text-center py-4">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                              <p className="text-sm text-muted-foreground">Uploading to Cloudinary...</p>
                            </div>
                          ) : uploadedImageUrl ? (
                            <img 
                              src={uploadedImageUrl} 
                              alt="Uploaded preview" 
                              className="h-24 w-full object-contain mb-2"
                            />
                          ) : (
                            <div className="text-center">
                              <p className="text-sm text-muted-foreground">
                                Click to upload
                              </p>
                              <Button variant="outline" className="mt-2">
                                Upload to Cloudinary
                              </Button>
                            </div>
                          )}
                        </div>
                        
                        {/* Copy Button */}
                        <div className="flex items-center justify-center">
                          <Button 
                            onClick={copyImageUrlToClipboard}
                            disabled={!uploadedImageUrl || isUploading}
                            className="w-full h-12"
                          >
                            <Copy className="mr-2 h-4 w-4" /> Copy URL
                          </Button>
                        </div>
                        
                        {/* Apply Button */}
                        <div className="flex items-center justify-center">
                          <Button 
                            onClick={applyImageUrlToForm}
                            disabled={!uploadedImageUrl || isUploading}
                            className="w-full h-12"
                          >
                            <Save className="mr-2 h-4 w-4" /> Apply to Form
                          </Button>
                        </div>
                      </div>
                      
                      {uploadedImageUrl && (
                        <div className="mt-3 text-center">
                          <p className="text-xs text-muted-foreground break-all">
                            {uploadedImageUrl.substring(0, 40)}...
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => {
                  setShowForm(false);
                  setEditingEvent(null);
                }}>
                  Cancel
                </Button>
                <Button onClick={handleEventSubmit}>
                  {editingEvent ? "Update Event" : "Create Event"}
                </Button>
              </CardFooter>
            </Card>
          )}

          {/* Event View Modal */}
          {viewingEvent && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>{viewingEvent.title}</CardTitle>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => setViewingEvent(null)}
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
                        <p className="text-sm">{viewingEvent.eventType}</p>
                      </div>
                      
                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <p className="text-sm">{viewingEvent.description}</p>
                      </div>
                      
                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Category</label>
                        <p className="text-sm capitalize">{viewingEvent.category}</p>
                      </div>
                    </div>
                    
                    <div>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Date</label>
                          <p className="text-sm">
                            {format(new Date(viewingEvent.date), 'MMM dd, yyyy')}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Time</label>
                          <p className="text-sm">{viewingEvent.time}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Duration</label>
                          <p className="text-sm">{viewingEvent.duration} minutes</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Max Attendees</label>
                          <p className="text-sm">{viewingEvent.maxAttendees}</p>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Cover Image</label>
                        {viewingEvent.coverImageURL ? (
                          <img 
                            src={viewingEvent.coverImageURL} 
                            alt="Event cover" 
                            className="w-full h-48 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-32 bg-gray-100 rounded-lg">
                            <p className="text-sm text-muted-foreground">No cover image</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setViewingEvent(null);
                      openEditEvent(viewingEvent);
                    }}
                  >
                    <Pencil className="mr-2 h-4 w-4" /> Edit
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={() => {
                      deleteEvent(viewingEvent.id);
                      setViewingEvent(null);
                    }}
                  >
                    <Trash className="mr-2 h-4 w-4" /> Delete
                  </Button>
                </CardFooter>
              </Card>
            </div>
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
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => openViewEvent(event)}
                          >
                            <Eye size={16} className="mr-1" /> View
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => openEditEvent(event)}
                          >
                            <Pencil size={16} className="mr-1" /> Edit
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

          {/* Profile Section - Only shown when active */}
          {showProfile && (
            <div className="pt-8">
              <Card className="my-8 relative">
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="absolute top-4 right-4"
                  onClick={closeProfileSection}
                >
                  <X className="h-4 w-4" />
                </Button>
                <CardHeader>
                  <CardTitle>Profile Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-6">
                    <div className="relative">
                      <img 
                        src={profileData.photoURL || '/placeholder-user.jpg'} 
                        alt="Profile" 
                        className="w-24 h-24 rounded-full object-cover border-2 border-blue-500"
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
          )}

          {/* Settings Section - Only shown when active */}
          {showSettings && (
            <div className="pt-8">
              <Card className="my-8 relative">
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="absolute top-4 right-4"
                  onClick={closeSettingsSection}
                >
                  <X className="h-4 w-4" />
                </Button>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-medium mb-3">Notification Preferences</h3>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <input type="checkbox" id="email-notifications" className="mr-2" defaultChecked />
                          <label htmlFor="email-notifications">Email notifications</label>
                        </div>
                        <div className="flex items-center">
                          <input type="checkbox" id="push-notifications" className="mr-2" defaultChecked />
                          <label htmlFor="push-notifications">Push notifications</label>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-3">Security</h3>
                      <div className="space-y-3">
                        <div>
                          <Button variant="outline">Change Password</Button>
                        </div>
                        <div>
                          <Button variant="outline">Two-Factor Authentication</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Host;