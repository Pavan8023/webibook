
import { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Mail, Briefcase, Tag, Settings, Bell, Calendar, Lock } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface UserProfileData {
  name: string;
  email: string;
  bio: string;
  jobTitle: string;
  company: string;
  location: string;
  profileImage: string;
  interests: string[];
}

const UserProfile = () => {
  const [profileData, setProfileData] = useState<UserProfileData>({
    name: 'Alex Johnson',
    email: 'alex.johnson@example.com',
    bio: 'Product designer and developer with a passion for user experience and accessible design. Always looking to learn new technologies and improve my skills.',
    jobTitle: 'Senior Product Designer',
    company: 'TechCorp',
    location: 'San Francisco, CA',
    profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=2070&auto=format&fit=crop',
    interests: ['UX Design', 'Technology', 'Business', 'Marketing']
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<UserProfileData>(profileData);
  
  const allInterests = ['Technology', 'Business', 'Marketing', 'Finance', 'Health', 'UX Design', 'Development', 'AI', 'Data Science', 'Leadership'];
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditedData({
      ...editedData,
      [e.target.name]: e.target.value,
    });
  };
  
  const toggleInterest = (interest: string) => {
    if (editedData.interests.includes(interest)) {
      setEditedData({
        ...editedData,
        interests: editedData.interests.filter(i => i !== interest)
      });
    } else {
      setEditedData({
        ...editedData,
        interests: [...editedData.interests, interest]
      });
    }
  };
  
  const handleSave = () => {
    setProfileData(editedData);
    setIsEditing(false);
    toast({
      title: "Profile updated",
      description: "Your profile has been successfully updated.",
    });
  };
  
  const handleCancel = () => {
    setEditedData(profileData);
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-16">
        <div className="container-tight">
          <div className="mb-10">
            <h1 className="text-3xl font-bold mb-2">My Profile</h1>
            <p className="text-muted-foreground">
              Manage your personal information and preferences
            </p>
          </div>
          
          <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
            <Tabs defaultValue="profile" className="w-full">
              <div className="px-6 pt-6 border-b border-border">
                <TabsList className="w-full max-w-md justify-start bg-transparent border-b border-border rounded-none space-x-6 px-0">
                  <TabsTrigger 
                    value="profile" 
                    className="flex items-center data-[state=active]:border-b-2 data-[state=active]:border-webi-blue rounded-none pb-3 px-2"
                  >
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </TabsTrigger>
                  <TabsTrigger 
                    value="settings" 
                    className="flex items-center data-[state=active]:border-b-2 data-[state=active]:border-webi-blue rounded-none pb-3 px-2"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="profile" className="p-0">
                <div className="p-6">
                  <div className="flex flex-col md:flex-row gap-8 md:gap-12">
                    <div className="md:w-1/3">
                      <div className="flex flex-col items-center">
                        <Avatar className="w-32 h-32 border-2 border-border">
                          <AvatarImage src={profileData.profileImage} alt={profileData.name} />
                          <AvatarFallback>{profileData.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        {isEditing && (
                          <Button variant="outline" className="mt-4 text-sm">
                            Change Photo
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div className="md:w-2/3">
                      {!isEditing ? (
                        <>
                          <h2 className="text-2xl font-bold mb-1">{profileData.name}</h2>
                          <p className="text-muted-foreground mb-4">{profileData.jobTitle} at {profileData.company}</p>
                          
                          <div className="space-y-6">
                            <div>
                              <h3 className="text-sm uppercase tracking-wide text-muted-foreground font-medium mb-2">
                                About
                              </h3>
                              <p>{profileData.bio}</p>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h3 className="text-sm uppercase tracking-wide text-muted-foreground font-medium mb-2">
                                  Contact Information
                                </h3>
                                <div className="space-y-2">
                                  <div className="flex items-center">
                                    <Mail className="text-muted-foreground mr-2 h-4 w-4" />
                                    <span>{profileData.email}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <Briefcase className="text-muted-foreground mr-2 h-4 w-4" />
                                    <span>{profileData.company}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <User className="text-muted-foreground mr-2 h-4 w-4" />
                                    <span>{profileData.location}</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div>
                                <h3 className="text-sm uppercase tracking-wide text-muted-foreground font-medium mb-2">
                                  Interests
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                  {profileData.interests.map(interest => (
                                    <span 
                                      key={interest}
                                      className="bg-webi-lightblue/30 text-webi-blue text-xs font-medium px-2.5 py-1 rounded-full"
                                    >
                                      {interest}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <Button 
                            onClick={() => setIsEditing(true)} 
                            className="mt-8"
                          >
                            Edit Profile
                          </Button>
                        </>
                      ) : (
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="name">Full Name</Label>
                              <Input 
                                id="name" 
                                name="name" 
                                value={editedData.name} 
                                onChange={handleChange} 
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="email">Email</Label>
                              <Input 
                                id="email" 
                                name="email"
                                type="email" 
                                value={editedData.email} 
                                onChange={handleChange} 
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="jobTitle">Job Title</Label>
                              <Input 
                                id="jobTitle" 
                                name="jobTitle" 
                                value={editedData.jobTitle} 
                                onChange={handleChange} 
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="company">Company</Label>
                              <Input 
                                id="company" 
                                name="company" 
                                value={editedData.company} 
                                onChange={handleChange} 
                              />
                            </div>
                            
                            <div className="space-y-2 md:col-span-2">
                              <Label htmlFor="location">Location</Label>
                              <Input 
                                id="location" 
                                name="location" 
                                value={editedData.location} 
                                onChange={handleChange} 
                              />
                            </div>
                            
                            <div className="space-y-2 md:col-span-2">
                              <Label htmlFor="bio">Bio</Label>
                              <Textarea 
                                id="bio" 
                                name="bio" 
                                rows={4} 
                                value={editedData.bio} 
                                onChange={handleChange} 
                              />
                            </div>
                          </div>
                          
                          <div>
                            <Label className="mb-2 block">Interests</Label>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {allInterests.map(interest => (
                                <button
                                  key={interest}
                                  type="button"
                                  onClick={() => toggleInterest(interest)}
                                  className={`text-xs font-medium px-2.5 py-1 rounded-full border transition-colors ${
                                    editedData.interests.includes(interest)
                                      ? 'bg-webi-blue text-white border-webi-blue'
                                      : 'bg-transparent text-muted-foreground border-muted hover:bg-webi-lightblue/20'
                                  }`}
                                >
                                  {interest}
                                </button>
                              ))}
                            </div>
                          </div>
                          
                          <div className="flex gap-4 mt-4">
                            <Button onClick={handleSave}>
                              Save Changes
                            </Button>
                            <Button variant="outline" onClick={handleCancel}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="settings" className="p-0">
                <div className="p-6 space-y-8">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Notification Preferences</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium">Email Notifications</h4>
                          <p className="text-sm text-muted-foreground">Receive emails about webinar updates and reminders</p>
                        </div>
                        <Switch id="email-notifications" defaultChecked />
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium">Promotional Emails</h4>
                          <p className="text-sm text-muted-foreground">Receive emails about special offers and new features</p>
                        </div>
                        <Switch id="promotional-emails" />
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium">Webinar Reminders</h4>
                          <p className="text-sm text-muted-foreground">Get reminded before webinars you've registered for</p>
                        </div>
                        <Switch id="webinar-reminders" defaultChecked />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Privacy Settings</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium">Profile Visibility</h4>
                          <p className="text-sm text-muted-foreground">Allow others to see your profile and activity</p>
                        </div>
                        <Switch id="profile-visibility" defaultChecked />
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium">Data Collection</h4>
                          <p className="text-sm text-muted-foreground">Allow us to collect usage data to improve our services</p>
                        </div>
                        <Switch id="data-collection" defaultChecked />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Account Settings</h3>
                    <div className="space-y-4">
                      <Button variant="outline" className="space-x-2">
                        <Lock className="h-4 w-4" />
                        <span>Change Password</span>
                      </Button>
                      
                      <Button variant="destructive" className="space-x-2">
                        <span>Delete Account</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default UserProfile;
