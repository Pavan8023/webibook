import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where
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
import { DashboardNavbar } from '@/components/layout/DashboardNavbar';
import { Footer } from '@/components/layout/Footer';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

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
  dailyRoomUrl?: string;
  status?: string;
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

    setTimeLeft(calculateTimeLeft());
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

const EventsSection = ({ events, loading }: { events: EventData[], loading: boolean }) => {
  const [activeTab, setActiveTab] = useState('upcoming');

  const categorizeEvents = () => {
    const currentDate = new Date();
    
    return events.reduce((acc: { upcoming: EventData[]; past: EventData[] }, event) => {
      const eventDateObj = new Date(`${event.date}T${event.time}`);
      const durationInMinutes = parseInt(event.duration, 10);
      const endTime = new Date(eventDateObj.getTime() + durationInMinutes * 60000);
      
      if (currentDate < eventDateObj) {
        acc.upcoming.push(event);
      } else if (currentDate >= eventDateObj && currentDate <= endTime) {
        acc.upcoming.push(event);
      } else {
        acc.past.push(event);
      }
      
      return acc;
    }, { upcoming: [], past: [] });
  };

  const { upcoming, past } = categorizeEvents();

  const handleJoinEvent = (event: EventData) => {
    if (!event.dailyRoomUrl) {
      alert("This event doesn't have a meeting room configured");
      return;
    }
    
    window.open(event.dailyRoomUrl, '_blank', 'noopener,noreferrer');
  };

  return (
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
                {upcoming.map((event) => {
                  const eventDateObj = new Date(`${event.date}T${event.time}`);
                  const durationInMinutes = parseInt(event.duration, 10);
                  const endTime = new Date(eventDateObj.getTime() + durationInMinutes * 60000);
                  const isLive = new Date() >= eventDateObj && new Date() <= endTime;
                  
                  return (
                    <div
                      key={event.id}
                      className="border rounded-lg overflow-hidden shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col"
                    >
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
                        
                        {isLive ? (
                          <div className="mb-3">
                            <Badge variant="default" className="w-full text-center py-1 bg-red-100 text-red-800">
                              LIVE NOW
                            </Badge>
                          </div>
                        ) : (
                          <CountdownTimer
                            eventDate={event.date}
                            eventTime={event.time}
                          />
                        )}

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
                              className={`w-full bg-gradient-to-r text-white font-bold py-3 rounded-lg ${
                                isLive 
                                  ? 'from-red-500 to-red-700' 
                                  : 'from-blue-500 to-blue-700'
                              }`}
                              onClick={() => handleJoinEvent(event)}
                            >
                              {isLive ? 'Join Meeting' : 'Join Meeting'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
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
  );
};

const ProfileSection = ({ user, userData }: { user: any, userData: UserData }) => {
  const [formData, setFormData] = useState<UserData>({
    name: '',
    email: '',
    bio: '',
    phone: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

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
  const [error, setError] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [deleteEmail, setDeleteEmail] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

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

const Attendee = () => {
  const [user] = useAuthState(auth);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [events, setEvents] = useState<EventData[]>([]);
  const [userData, setUserData] = useState<UserData | null>(null);
  const location = useLocation();
  
  // Determine active section based on URL hash
  const activeSection = location.hash.substring(1) || 'events';

  // Fetch events from Firestore
  useEffect(() => {
    const fetchEvents = async () => {
      if (!user) return;

      setLoadingEvents(true);

      try {
        const eventsRef = collection(db, 'events');
        const eventsSnapshot = await getDocs(eventsRef);

        const eventsData = await Promise.all(eventsSnapshot.docs.map(async (eventDoc) => {
          const eventData = eventDoc.data();
          const hostDocRef = doc(db, 'users', eventData.hostId);
          const hostDoc = await getDoc(hostDocRef);
          const hostData = hostDoc.data() as UserData;

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
            dailyRoomUrl: eventData.dailyRoomUrl || '',
            status: eventData.status || 'upcoming'
          };
        }));

        setEvents(eventsData);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoadingEvents(false);
      }
    };

    fetchEvents();
  }, [user]);

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      
      try {
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          setUserData(userDoc.data() as UserData);
        } else {
          setUserData({
            name: user.displayName || '',
            email: user.email || '',
            photoURL: user.photoURL || ''
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    
    fetchUserData();
  }, [user]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <DashboardNavbar userType="attendee" />

      <main className="flex-grow pt-16 md:pt-20">
        <div className="container py-6 md:py-8">
          {/* Section Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold">
              {activeSection === 'events' && 'My Dashboard'}
              {activeSection === 'profile' && 'My Profile'}
              {activeSection === 'settings' && 'Account Settings'}
            </h1>
            <p className="text-muted-foreground">
              {activeSection === 'events' && 'Welcome back! Here are your upcoming webinars'}
              {activeSection === 'profile' && 'Manage your personal information'}
              {activeSection === 'settings' && 'Configure your account preferences'}
            </p>
          </div>

          {/* Conditional Rendering Based on Hash */}
          {activeSection === 'events' && (
            <EventsSection events={events} loading={loadingEvents} />
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

export default Attendee;