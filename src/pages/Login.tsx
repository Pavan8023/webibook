import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar, Mail, Lock, ArrowRight, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from '@/components/ui/use-toast';
import { 
  emailLogin, 
  providerSignIn,
  resetPassword
} from '@/services/auth';
import { RoleSelectionModal } from '@/components/ui/RoleSelectionModal';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { collection, doc, getDoc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { browserSessionPersistence, setPersistence } from 'firebase/auth';

// Updated form schema with role selection
const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(1, {
    message: "Password is required.",
  }),
  role: z.enum(["attendee", "hoster"], {
    required_error: "Please select a role.",
  }),
});

type FormValues = z.infer<typeof formSchema>;

const Login = () => {
  const navigate = useNavigate();
  const [user, loadingAuth] = useAuthState(auth);
  const [isLoading, setIsLoading] = useState(false);
  const [providerModalOpen, setProviderModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<'google' | 'twitter'>('google');
  const [userRole, setUserRole] = useState<string | null>(null);
  
  // Forgot password states
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [userType, setUserType] = useState<'email' | 'google' | 'twitter' | null>(null);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordResetSuccess, setPasswordResetSuccess] = useState(false);
  
  // Arithmetic CAPTCHA states
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [captchaError, setCaptchaError] = useState('');
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      role: "attendee",
    },
  });

  // Set session persistence
  useEffect(() => {
    setPersistence(auth, browserSessionPersistence)
      .catch((error) => {
        console.error("Error setting session persistence:", error);
      });
  }, []);

  // Fetch user role from Firestore
  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        // Get user from unified users collection
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          setUserRole(userDoc.data().role);
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserRole();
  }, [user]);

  // Redirect if user is already logged in
  useEffect(() => {
    if (userRole) {
      navigate(userRole === 'hoster' ? '/host' : '/attendee');
    }
  }, [userRole, navigate]);

  // Generate arithmetic CAPTCHA
  const generateCaptcha = () => {
    const n1 = Math.floor(Math.random() * 10) + 1; // 1-10
    const n2 = Math.floor(Math.random() * 10) + 1; // 1-10
    setNum1(n1);
    setNum2(n2);
    setCaptchaAnswer('');
    setCaptchaError('');
  };

  // Initialize CAPTCHA when needed
  useEffect(() => {
    if (forgotPasswordOpen && userType === 'email' && !captchaVerified) {
      generateCaptcha();
    }
  }, [forgotPasswordOpen, userType, captchaVerified]);

  const handleEmailLogin = async (values: FormValues) => {
    setIsLoading(true);
    try {
      // Set session persistence before login
      await setPersistence(auth, browserSessionPersistence);
      await emailLogin(values.email, values.password, values.role);
      
      toast({
        title: "Logged in successfully!",
        description: "Welcome back to Webibook.",
      });
      
      // Redirect based on role
      if (values.role === 'hoster') {
        navigate("/host");
      } else {
        navigate("/attendee");
      }
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Invalid email or password",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleProviderLogin = async (role: 'attendee' | 'hoster') => {
    setIsLoading(true);
    try {
      // Set session persistence before login
      await setPersistence(auth, browserSessionPersistence);
      await providerSignIn(selectedProvider, role);
      
      toast({
        title: "Logged in successfully!",
        description: `Welcome back via ${selectedProvider}`,
      });
      
      // Redirect based on role
      if (role === 'hoster') {
        navigate("/host");
      } else {
        navigate("/attendee");
      }
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Authentication error",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setProviderModalOpen(false);
    }
  };

  // Handle forgot password flow
  const handleForgotPassword = async () => {
    setEmailError('');
    if (!forgotEmail) {
      setEmailError('Please enter your email address');
      return;
    }
    
    try {
      // Check if user exists in Firestore
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', forgotEmail));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        setEmailError('This email is not registered or your account has been deleted');
        return;
      }
      
      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();
      setUserType(userData.type || 'email'); // Use 'type' field from Firestore
    } catch (error) {
      console.error('Error finding user:', error);
      setEmailError('Failed to find account. Please try again.');
    }
  };

  // Verify arithmetic CAPTCHA
  const verifyCaptcha = () => {
    const correctAnswer = num1 + num2;
    const userAnswer = parseInt(captchaAnswer, 10);
    
    if (isNaN(userAnswer)) {
      setCaptchaError('Please enter a valid number');
      return;
    }
    
    if (userAnswer === correctAnswer) {
      setCaptchaVerified(true);
      setCaptchaError('');
    } else {
      setCaptchaError('Incorrect answer. Please try again.');
      generateCaptcha();
    }
  };

  const handlePasswordReset = async () => {
    setPasswordError('');
    
    if (!newPassword || !confirmPassword) {
      setPasswordError('Please fill in both password fields');
      return;
    }
    
    if (newPassword.length < 6) {
      setPasswordError('Password should be at least 6 characters');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    
    try {
      // Find user by email
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', forgotEmail));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        setPasswordError('User not found. Please try again.');
        return;
      }
      
      const userDoc = querySnapshot.docs[0];
      const userId = userDoc.id;
      
      // Reset password
      await resetPassword(forgotEmail, newPassword);
      
      // Update user document
      await updateDoc(doc(db, 'users', userId), {
        password: newPassword
      });
      
      setPasswordResetSuccess(true);
      setPasswordError('');
    } catch (error) {
      console.error('Error resetting password:', error);
      setPasswordError('Failed to reset password. Please try again.');
    }
  };

  const closeForgotPassword = () => {
    setForgotPasswordOpen(false);
    setForgotEmail('');
    setUserType(null);
    setCaptchaVerified(false);
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
    setPasswordResetSuccess(false);
    setCaptchaAnswer('');
    setCaptchaError('');
  };

  if (loadingAuth || (user && !userRole)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-webi-blue"></div>
        <p className="mt-4 text-lg">Loading your account...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <RoleSelectionModal
        open={providerModalOpen}
        onClose={() => setProviderModalOpen(false)}
        onRoleSelect={handleProviderLogin}
        provider={selectedProvider}
      />
      
      {/* Forgot Password Modal */}
      {forgotPasswordOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6 animate-fade-in">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Reset Password</h2>
              <button 
                onClick={closeForgotPassword}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {!userType && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Email Address</label>
                  <Input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="Enter your email"
                  />
                  {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
                </div>
                
                <Button 
                  onClick={handleForgotPassword}
                  className="w-full"
                >
                  Continue
                </Button>
              </div>
            )}
            
            {userType === 'google' && (
              <div className="p-4 bg-blue-50 rounded-lg flex items-center gap-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <svg className="h-8 w-8 text-blue-600" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    <path d="M1 1h22v22H1z" fill="none" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Password Secured by Google</p>
                  <p className="text-sm text-muted-foreground">
                    Your account password is managed by Google. Please reset your password through Google.
                  </p>
                </div>
              </div>
            )}
            
            {userType === 'twitter' && (
              <div className="p-4 bg-blue-50 rounded-lg flex items-center gap-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <svg className="h-8 w-8 text-blue-600" viewBox="0 0 24 24">
                    <path d="M23.954 4.569a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.691 8.094 4.066 6.13 1.64 3.161a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.061a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.937 4.937 0 004.604 3.417 9.868 9.868 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.054 0 13.999-7.496 13.999-13.986 0-.209 0-.42-.015-.63a9.936 9.936 0 002.46-2.548l-.047-.02z" fill="#1DA1F2" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Password Secured by Twitter</p>
                  <p className="text-sm text-muted-foreground">
                    Your account password is managed by Twitter. Please reset your password through Twitter.
                  </p>
                </div>
              </div>
            )}
            
            {userType === 'email' && !captchaVerified && (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="font-medium">Verify you're human</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Solve this simple math problem to continue
                  </p>
                  
                  <div className="flex flex-col items-center space-y-4">
                    <div className="text-2xl font-bold bg-gray-100 px-6 py-4 rounded-lg">
                      What is {num1} + {num2}?
                    </div>
                    
                    <Input
                      type="number"
                      value={captchaAnswer}
                      onChange={(e) => setCaptchaAnswer(e.target.value)}
                      placeholder="Enter answer"
                      className="text-center w-32"
                    />
                    
                    {captchaError && <p className="text-red-500 text-sm">{captchaError}</p>}
                    
                    <Button 
                      onClick={verifyCaptcha}
                      className="w-32"
                    >
                      Verify
                    </Button>
                    
                    <button 
                      onClick={generateCaptcha}
                      className="text-sm text-webi-blue hover:underline"
                    >
                      Generate new problem
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {userType === 'email' && captchaVerified && !passwordResetSuccess && (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="font-medium">Create New Password</p>
                  <p className="text-sm text-muted-foreground">
                    Enter a new password for your account
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">New Password</label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter your new password"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Confirm New Password</label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your new password"
                  />
                </div>
                
                {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}
                
                <Button 
                  onClick={handlePasswordReset}
                  className="w-full"
                >
                  Reset Password
                </Button>
              </div>
            )}
            
            {passwordResetSuccess && (
              <div className="text-center py-6">
                <div className="bg-green-100 text-green-600 p-3 rounded-full inline-block mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Password Reset Successful!</h3>
                <p className="text-muted-foreground">
                  Your password has been updated successfully.
                </p>
                <Button 
                  onClick={closeForgotPassword}
                  className="mt-4 w-full"
                >
                  Back to Login
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
      
      <main className="flex-grow pt-16 md:pt-20">
        <div className="container-tight py-16 md:py-24">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8 animate-fade-down">
              <Link to="/" className="inline-flex items-center mb-8 text-2xl font-display font-bold text-webi-blue">
                <Calendar className="mr-2 h-6 w-6" />
                Webibook
              </Link>
              
              <h1 className="text-3xl font-bold mb-3">Welcome back</h1>
              <p className="text-muted-foreground">
                Sign in to continue your webinar journey
              </p>
            </div>
            
            <div className="animate-fade-up">
              <div className="bg-white p-8 rounded-xl border border-border shadow-sm">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleEmailLogin)} className="space-y-5">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel>Email</FormLabel>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <FormControl>
                              <Input
                                placeholder="name@example.com"
                                className="pl-10"
                                {...field}
                                disabled={isLoading}
                              />
                            </FormControl>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <div className="flex justify-between">
                            <FormLabel>Password</FormLabel>
                            <button 
                              type="button"
                              onClick={() => setForgotPasswordOpen(true)}
                              className="text-sm text-webi-blue hover:underline"
                            >
                              Forgot password?
                            </button>
                          </div>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="••••••••"
                                className="pl-10"
                                {...field}
                                disabled={isLoading}
                              />
                            </FormControl>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel>Login as</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex space-x-4"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="attendee" id="login-attendee" />
                                <label htmlFor="login-attendee" className="text-sm">Attendee</label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="hoster" id="login-hoster" />
                                <label htmlFor="login-hoster" className="text-sm">Hoster</label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full group"
                      disabled={isLoading}
                    >
                      {isLoading ? "Signing in..." : "Sign In"}
                      {!isLoading && <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />}
                    </Button>
                  </form>
                </Form>
                
                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="bg-white px-2 text-muted-foreground">
                        Or continue with
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <Button 
                      variant="outline" 
                      className="h-11"
                      onClick={() => {
                        setSelectedProvider('google');
                        setProviderModalOpen(true);
                      }}
                      disabled={isLoading}
                    >
                      <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        <path d="M1 1h22v22H1z" fill="none" />
                      </svg>
                      Google
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="h-11"
                      onClick={() => {
                        setSelectedProvider('twitter');
                        setProviderModalOpen(true);
                      }}
                      disabled={isLoading}
                    >
                      <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                        <path d="M23.954 4.569a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.691 8.094 4.066 6.13 1.64 3.161a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.061a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.937 4.937 0 004.604 3.417 9.868 9.868 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.054 0 13.999-7.496 13.999-13.986 0-.209 0-.42-.015-.63a9.936 9.936 0 002.46-2.548l-.047-.02z" fill="#1DA1F2" />
                      </svg>
                      Twitter
                    </Button>
                  </div>
                </div>
              </div>
              
              <p className="text-center mt-6 text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link to="/signup" className="text-webi-blue font-medium hover:underline">
                  Sign up for free
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Login;