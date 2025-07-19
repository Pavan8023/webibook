import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { DashboardNavbar } from '@/components/layout/DashboardNavbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, X, Edit, Save, Trash, Pencil, Eye, Copy, Video } from 'lucide-react';
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
  serverTimestamp,
  getDoc
} from 'firebase/firestore';
import { 
  getAuth, 
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword,
  deleteUser,
  signOut
} from 'firebase/auth';
import { db, auth } from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { toast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';

// Define types
interface FormData {
  title: string;
  description: string;
  date: string;
  time: string;
  duration: string;
  category: string;
  maxAttendees: string;
  coverImageURL: string;
}

interface UserData {
  name?: string;
  displayName?: string;
  photoURL?: string;
  photolRL?: string;
  email?: string;
  bio?: string;
  phone?: string;
  provider?: string;
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
  dailyRoomUrl?: string;
}

// DAILY.CO API
const DAILY_API_KEY = import.meta.env.VITE_DAILY_API_KEY;
const DAILY_API_URL = 'https://api.daily.co/v1';

declare global {
  interface Window {
    cloudinary: any;
  }
}

// Error mapping to natural English
const getFriendlyError = (errorCode: string) => {
  const errors: Record<string, string> = {
    'auth/email-already-in-use': 'This email is already in use by another account',
    'auth/invalid-email': 'Please enter a valid email address',
    'auth/operation-not-allowed': 'This operation is not allowed',
    'auth/weak-password': 'Password should be at least 6 characters',
    'auth/user-disabled': 'Your account has been disabled',
    'auth/user-not-found': 'No account found with this email',
    'auth/wrong-password': 'Incorrect password',
    'auth/too-many-requests': 'Too many attempts. Please try again later',
    'auth/requires-recent-login': 'This operation requires recent authentication. Please log in again',
    'auth/account-exists-with-different-credential': 'An account already exists with the same email but different sign-in method',
    'auth/popup-closed-by-user': 'Login popup was closed before completing authentication',
    'auth/cancelled-popup-request': 'Login process was cancelled',
    'auth/network-request-failed': 'Network error. Please check your internet connection',
    'auth/expired-action-code': 'The action code has expired',
    'auth/invalid-action-code': 'The action code is invalid',
    'auth/user-mismatch': 'The provided credential does not match the signed-in user',
    'auth/provider-already-linked': 'This provider is already linked to your account',
    'auth/credential-already-in-use': 'This credential is already associated with another account',
    'auth/unauthorized-domain': 'This domain is not authorized for authentication',
    'auth/invalid-verification-code': 'The verification code is invalid',
    'auth/invalid-verification-id': 'The verification ID is invalid',
    'auth/missing-verification-code': 'Verification code is missing',
    'auth/missing-verification-id': 'Verification ID is missing',
    'auth/invalid-credential': 'The credential is malformed or has expired',
    'auth/invalid-custom-token': 'The custom token format is incorrect',
    'auth/custom-token-mismatch': 'The custom token does not match the project',
    'auth/invalid-user-token': "The user's credential is no longer valid",
    'auth/user-token-expired': "The user's credential has expired",
    'auth/null-user': 'No user is currently signed in',
    'auth/app-deleted': 'The Firebase app has been deleted',
    'auth/app-not-authorized': 'This app is not authorized to use Firebase Authentication',
    'auth/argument-error': 'An invalid argument was provided',
    'auth/invalid-api-key': 'The provided API key is invalid',
    'auth/operation-not-supported': 'This operation is not supported',
    'auth/web-storage-unsupported': 'This browser does not support web storage',
    'default': 'An unexpected error occurred. Please try again'
  };
  
  return errors[errorCode] || errors['default'];
};

const ErrorPopup = ({ message, onClose }: { message: string, onClose: () => void }) => {
  return (
    <div className="fixed top-4 right-4 animate-fadeInDown z-50">
      <div className="bg-red-500 text-white p-4 rounded-lg shadow-lg max-w-md">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="font-bold">Error</h3>
            <p>{message}</p>
          </div>
          <button 
            onClick={onClose}
            className="ml-4 text-white hover:text-gray-200 focus:outline-none"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};

const Host = () => {
  const [user] = useAuthState(auth);
  const location = useLocation();
  const [showForm, setShowForm] = useState(false);
  const [eventType, setEventType] = useState('seminar');
  const [hostedEvents, setHostedEvents] = useState<Event[]>([]);
  const [totalEvents, setTotalEvents] = useState(0);
  const [averageAttendance, setAverageAttendance] = useState(0);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [viewingEvent, setViewingEvent] = useState<Event | null>(null);
  const navigate = useNavigate();
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const { toast } = useToast();
  
  // Determine active section based on URL hash
  const activeSection = location.hash.substring(1) || 'events';

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

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      
      try {
        // Get user from unified users collection
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData({
            name: data?.name || user.displayName || '',
            email: user.email || '',
            photoURL: data?.photoURL || user.photoURL || '',
            bio: data?.bio || '',
            phone: data?.phone || '',
            provider: data?.provider || 'email'
          });
        } else {
          // Fallback to basic user info
          setUserData({
            name: user.displayName || '',
            email: user.email || '',
            photoURL: user.photoURL || '',
            bio: '',
            phone: '',
            provider: user.providerData[0]?.providerId || 'email'
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
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
            eventType: eventData.eventType,
            hostId: eventData.hostId,
            hostName: eventData.hostName,
            createdAt: eventData.createdAt.toDate(),
            status: eventData.status || 'upcoming',
            attendees: eventData.attendees || [],
            coverImageURL: eventData.coverImageURL || '',
            dailyRoomUrl: eventData.dailyRoomUrl || ''
          });
          
          if (eventData.attendees && eventData.maxAttendees) {
            totalAttendees += eventData.attendees.length;
            totalCapacity += parseInt(eventData.maxAttendees);
          }
        });
        
        setHostedEvents(events);
        setTotalEvents(events.length);
        
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

  // Create Daily.co room (frontend implementation)
  const createDailyRoom = async (eventTitle: string) => {
    try {
      const response = await fetch(`${DAILY_API_URL}/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DAILY_API_KEY}`
        },
        body: JSON.stringify({
          name: `${eventTitle.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}`,
          privacy: 'public',
          properties: {
            enable_prejoin_ui: true,
            enable_knocking: true,
            enable_screenshare: true,
            enable_chat: true,
            start_video_off: false,
            start_audio_off: false
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create Daily.co room');
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Error creating Daily.co room:', error);
      toast({
        title: "Error creating video room",
        description: "Could not create Daily.co meeting room",
        variant: "destructive"
      });
      return null;
    }
  };

  // Input change handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Cloudinary upload
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
        maxImageFileSize: 5000000,
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

  // Image URL helpers
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

  const applyImageUrlToForm = () => {
    if (!uploadedImageUrl) return;
    
    setFormData(prev => ({ ...prev, coverImageURL: uploadedImageUrl }));
    toast({
      title: "Image applied!",
      description: "Image URL has been added to your event",
    });
  };

  // Form data with proper type
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    date: '',
    time: '',
    duration: '60',
    category: 'technology',
    maxAttendees: '100',
    coverImageURL: ''
  });

  // Create event
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
      // Create Daily.co room
      const dailyRoomUrl = await createDailyRoom(formData.title);
      
      if (!dailyRoomUrl) {
        toast({
          title: "Error creating event",
          description: "Could not create video conference room",
          variant: "destructive"
        });
        return;
      }

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
        hostName: userData?.name || user.displayName || 'Host',
        createdAt: serverTimestamp(),
        status: 'upcoming',
        attendees: [],
        coverImageURL: formData.coverImageURL,
        dailyRoomUrl
      };

      const docRef = await addDoc(eventsRef, eventData);

      // Add to local state
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
      // Reset form data properly
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

      setHostedEvents(prev => 
        prev.map(event => 
          event.id === editingEvent.id 
            ? { 
                ...event, 
                ...formData, 
                eventType,
                status: event.status
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

  // Delete event
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

  // Cleanup past events
  useEffect(() => {
    const cleanupPastEvents = async () => {
      const now = new Date();
      const eventsToDelete = hostedEvents.filter(event => {
        const eventDate = new Date(`${event.date}T${event.time}`);
        const durationInMinutes = parseInt(event.duration, 10);
        const endTime = new Date(eventDate.getTime() + durationInMinutes * 60000);
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

    const interval = setInterval(cleanupPastEvents, 600000);
    return () => clearInterval(interval);
  }, [hostedEvents]);

  // UI helpers
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

  const handleEventSubmit = async () => {
    if (editingEvent) {
      await handleUpdateEvent();
    } else {
      await handleCreateEvent();
    }
  };

  // Start meeting handler
  const startMeeting = (event: Event) => {
    if (event.dailyRoomUrl) {
      window.open(event.dailyRoomUrl, '_blank');
    } else {
      toast({
        title: "Meeting room not available",
        description: "This event doesn't have a meeting room configured",
        variant: "destructive"
      });
    }
  };

  // Profile Section
  const ProfileSection = ({ user, userData }: { user: any, userData: UserData }) => {
    const [formData, setFormData] = useState<UserData>({
      name: '',
      email: '',
      bio: '',
      phone: ''
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
  
    useEffect(() => {
      if (userData) {
        setFormData({
          name: userData.name || '',
          email: userData.email || '',
          bio: userData.bio || '',
          phone: userData.phone || ''
        });
        setIsLoading(false);
      }
    }, [userData]);
  
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
    };
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSaving(true);
      
      try {
        if (user) {
          const userRef = doc(db, 'users', user.uid);
          await updateDoc(userRef, {
            name: formData.name,
            bio: formData.bio,
            phone: formData.phone
          });
          
          toast({
            title: "Profile Updated",
            description: "Your profile has been successfully updated.",
          });
        }
      } catch (error) {
        console.error("Error updating profile:", error);
        toast({
          title: "Update Failed",
          description: "There was an error updating your profile.",
          variant: "destructive"
        });
      } finally {
        setIsSaving(false);
      }
    };
  
    if (isLoading) {
      return (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Loading your profile...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      );
    }
  
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Manage your personal information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled
                  placeholder="Your email address"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell us about yourself"
                rows={4}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 (555) 000-0000"
              />
            </div>
            
            <div className="flex justify-end">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Profile"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  };

  // Settings Section
  const SettingsSection = ({ user }: { user: any }) => {
    const [notifications, setNotifications] = useState({
      email: true,
      push: true,
      reminders: true
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [changePasswordOpen, setChangePasswordOpen] = useState(false);
    const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [deleteEmail, setDeleteEmail] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
  
    useEffect(() => {
      const loadSettings = async () => {
        if (user) {
          try {
            const userRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userRef);
            
            if (userDoc.exists()) {
              const data = userDoc.data();
              setNotifications({
                email: data?.notifications?.email ?? true,
                push: data?.notifications?.push ?? true,
                reminders: data?.notifications?.reminders ?? true
              });
            }
          } catch (error) {
            console.error("Error loading settings:", error);
          } finally {
            setIsLoading(false);
          }
        }
      };
      
      loadSettings();
    }, [user]);
  
    const handleNotificationChange = (key: keyof typeof notifications) => {
      setNotifications(prev => ({
        ...prev,
        [key]: !prev[key]
      }));
    };
  
    const handleSaveSettings = async () => {
      setIsSaving(true);
      
      try {
        if (user) {
          const userRef = doc(db, 'users', user.uid);
          await updateDoc(userRef, {
            notifications
          });
          
          toast({
            title: "Settings Updated",
            description: "Your preferences have been saved.",
          });
        }
      } catch (error: any) {
        console.error("Error updating settings:", error);
        setError(getFriendlyError(error.code));
      } finally {
        setIsSaving(false);
      }
    };
  
    const handleChangePassword = async () => {
      if (newPassword !== confirmPassword) {
        setError("New passwords don't match");
        return;
      }
      
      if (newPassword.length < 6) {
        setError("Password should be at least 6 characters");
        return;
      }
      
      setIsChangingPassword(true);
      setError(null);
      
      try {
        if (user) {
          const credential = EmailAuthProvider.credential(user.email, currentPassword);
          await reauthenticateWithCredential(user, credential);
          await updatePassword(user, newPassword);
          
          toast({
            title: "Password Updated",
            description: "Your password has been changed successfully.",
          });
          
          // Reset form
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
          setChangePasswordOpen(false);
        }
      } catch (error: any) {
        console.error("Error changing password:", error);
        setError(getFriendlyError(error.code));
      } finally {
        setIsChangingPassword(false);
      }
    };
  
    const handleDeleteAccount = async () => {
      if (!deleteEmail) {
        setError("Please enter your email address");
        return;
      }
      
      if (deleteEmail !== user.email) {
        setError("Email does not match your account");
        return;
      }
      
      setIsDeleting(true);
      setError(null);
      
      try {
        // Delete user data from Firestore
        const userRef = doc(db, 'users', user.uid);
        await deleteDoc(userRef);
        
        // Delete events hosted by this user
        const eventsRef = collection(db, 'events');
        const q = query(eventsRef, where('hostId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        
        querySnapshot.forEach(async (doc) => {
          await deleteDoc(doc.ref);
        });
        
        // Delete user from Firebase Auth
        await deleteUser(user);
        
        // Sign out and redirect
        await signOut(auth);
        navigate('/');
      } catch (error: any) {
        console.error("Error deleting account:", error);
        setError(getFriendlyError(error.code));
      } finally {
        setIsDeleting(false);
      }
    };
  
    if (isLoading) {
      return (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>Loading your preferences...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-6 w-1/2 mt-8" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-6 w-1/2 mt-8" />
              <Skeleton className="h-4 w-full" />
            </div>
          </CardContent>
        </Card>
      );
    }
  
    return (
      <Card className="mb-8">
        {error && (
          <ErrorPopup 
            message={error} 
            onClose={() => setError(null)} 
          />
        )}
        
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>Manage your account preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-medium mb-4">Notification Preferences</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Receive updates via email
                    </p>
                  </div>
                  <Button 
                    variant={notifications.email ? "default" : "outline"}
                    onClick={() => handleNotificationChange('email')}
                  >
                    {notifications.email ? "Enabled" : "Disabled"}
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Push Notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Get alerts on your device
                    </p>
                  </div>
                  <Button 
                    variant={notifications.push ? "default" : "outline"}
                    onClick={() => handleNotificationChange('push')}
                  >
                    {notifications.push ? "Enabled" : "Disabled"}
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Event Reminders</p>
                    <p className="text-sm text-muted-foreground">
                      Receive reminders before events
                    </p>
                  </div>
                  <Button 
                    variant={notifications.reminders ? "default" : "outline"}
                    onClick={() => handleNotificationChange('reminders')}
                  >
                    {notifications.reminders ? "Enabled" : "Disabled"}
                  </Button>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-4">Password</h3>
              {changePasswordOpen ? (
                <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                  {userData?.provider === 'email' ? (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input
                          id="currentPassword"
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Enter your current password"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Enter your new password"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm your new password"
                        />
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          onClick={handleChangePassword}
                          disabled={isChangingPassword}
                        >
                          {isChangingPassword ? "Updating..." : "Update Password"}
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => setChangePasswordOpen(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="p-4 bg-blue-50 rounded-lg flex items-center gap-4">
                      <div className="bg-blue-100 p-3 rounded-full">
                        {userData?.provider === 'google.com' ? (
                          <svg className="h-8 w-8 text-blue-600" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            <path d="M1 1h22v22H1z" fill="none" />
                          </svg>
                        ) : (
                          <svg className="h-8 w-8 text-blue-600" viewBox="0 0 24 24">
                            <path d="M23.954 4.569a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.691 8.094 4.066 6.13 1.64 3.161a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.061a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.937 4.937 0 004.604 3.417 9.868 9.868 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.054 0 13.999-7.496 13.999-13.986 0-.209 0-.42-.015-.63a9.936 9.936 0 002.46-2.548l-.047-.02z" fill="#1DA1F2" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">
                          Password Secured by {userData?.provider === 'google.com' ? 'Google' : 'Twitter'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Your password is managed by your {userData?.provider === 'google.com' ? 'Google' : 'Twitter'} account
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setChangePasswordOpen(true)}
                >
                  Change Password
                </Button>
              )}
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-4">Account Management</h3>
              <div className="space-y-4">
                {deleteAccountOpen ? (
                  <div className="p-4 border border-red-300 rounded-lg bg-red-50">
                    <div className="space-y-3">
                      <p className="text-red-700 font-medium">
                        This action is permanent and cannot be undone. All your data will be deleted immediately.
                      </p>
                      
                      <div className="space-y-2">
                        <Label htmlFor="deleteEmail" className="text-red-700">
                          To confirm, please enter your email address:
                        </Label>
                        <Input
                          id="deleteEmail"
                          type="email"
                          value={deleteEmail}
                          onChange={(e) => setDeleteEmail(e.target.value)}
                          placeholder="Your email address"
                          className="border-red-300"
                        />
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          variant="destructive" 
                          onClick={handleDeleteAccount}
                          disabled={isDeleting}
                        >
                          {isDeleting ? "Deleting..." : "Permanently Delete Account"}
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => setDeleteAccountOpen(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-end">
                    <Button 
                      variant="destructive" 
                      onClick={() => setDeleteAccountOpen(true)}
                    >
                      Delete Account
                    </Button>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-end pt-4">
              <Button onClick={handleSaveSettings} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Preferences"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <DashboardNavbar userType="host" />

      <main className="flex-grow pt-16">
        <div className="container py-6 md:py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">
              {activeSection === 'events' && 'Host Dashboard'}
              {activeSection === 'profile' && 'My Profile'}
              {activeSection === 'settings' && 'Account Settings'}
            </h1>
            <p className="text-muted-foreground">
              {activeSection === 'events' && 'Manage your webinars, seminars, and events'}
              {activeSection === 'profile' && 'Manage your personal information'}
              {activeSection === 'settings' && 'Configure your account preferences'}
            </p>
          </div>

          {/* Conditional Rendering Based on Section */}
          {activeSection === 'events' && (
            <>
              <div className="flex justify-end mb-8">
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
                        
                        {/* Cloudinary image upload */}
                        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                          <h3 className="font-medium mb-3 text-center">Image Upload Tool</h3>
                          
                          <div className="grid grid-cols-3 gap-4">
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
                            
                            <div className="flex items-center justify-center">
                              <Button 
                                onClick={copyImageUrlToClipboard}
                                disabled={!uploadedImageUrl || isUploading}
                                className="w-full h-12"
                              >
                                <Copy className="mr-2 h-4 w-4" /> Copy URL
                              </Button>
                            </div>
                            
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
<Card className="mb-8">
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
        hostedEvents.map(event => {
          const now = new Date();
          const eventDate = new Date(`${event.date}T${event.time}`);
          const durationInMinutes = parseInt(event.duration, 10);
          const endTime = new Date(eventDate.getTime() + durationInMinutes * 60000);
          
          // Calculate status
          let status = 'upcoming';
          if (now >= eventDate && now <= endTime) {
            status = 'live';
          } else if (now > endTime) {
            status = 'past';
          }
          
          return (
            <div 
              key={event.id} 
              className="border rounded-lg p-4 flex flex-col sm:flex-row justify-between gap-4 sm:gap-0"
            >
              {/* Event Info */}
              <div className="flex flex-1 min-w-0">
                <div className="flex items-center space-x-4 min-w-0">
                  {event.coverImageURL ? (
                    <div className="flex-shrink-0">
                      <img 
                        src={event.coverImageURL} 
                        alt={event.title} 
                        className="w-16 h-16 rounded-md object-cover"
                      />
                    </div>
                  ) : null}
                  <div className="min-w-0">
                    <h3 className="font-medium truncate">{event.title}</h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {event.date} at {event.time}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Stats and Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                {/* Attendees and Status */}
                <div className="flex items-center gap-4 sm:gap-6">
                  <div className="text-center sm:text-left">
                    <div className="font-medium">{event.attendees.length}</div>
                    <div className="text-xs text-muted-foreground">Attendees</div>
                  </div>
                  <Badge variant={
                    status === 'upcoming' ? 'secondary' : 
                    status === 'live' ? 'default' : 'outline'
                  }>
                    {status}
                  </Badge>
                </div>
                
                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  {status === 'live' && (
                    <Button 
                      variant="default" 
                      size="sm"
                      className="flex-1 sm:flex-initial"
                      onClick={() => startMeeting(event)}
                    >
                      <Video size={16} className="mr-1 sm:mr-2" /> 
                      <span className="hidden sm:inline">Start</span>
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex-1 sm:flex-initial"
                    onClick={() => openViewEvent(event)}
                  >
                    <Eye size={16} className="mr-1 sm:mr-2" /> 
                    <span className="hidden sm:inline">View</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex-1 sm:flex-initial"
                    onClick={() => openEditEvent(event)}
                  >
                    <Pencil size={16} className="mr-1 sm:mr-2" /> 
                    <span className="hidden sm:inline">Edit</span>
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    className="flex-1 sm:flex-initial"
                    onClick={() => deleteEvent(event.id)}
                  >
                    <Trash size={16} className="sm:mr-2" /> 
                    <span className="hidden sm:inline">Delete</span>
                  </Button>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  </CardContent>
</Card>

              {/* Analytics Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            </>
          )}
          
          {activeSection === 'profile' && userData && (
            <ProfileSection user={user} userData={userData} />
          )}
          
          {activeSection === 'settings' && (
            <SettingsSection user={user} />
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Host;