import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import WebiBookLogo from '/images/WebiBook.png';
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
import { User, Mail, Lock, ArrowRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from '@/components/ui/use-toast';
import { emailSignUp } from '@/services/auth';

// Updated form schema with only attendee/hoster roles
const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: "Password must contain uppercase, lowercase, and numbers.",
  }),
  role: z.enum(["attendee", "hoster"], {
    required_error: "Please select a role.",
  }),
});

type FormValues = z.infer<typeof formSchema>;

const SignUp = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "attendee",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    try {
      await emailSignUp(values.email, values.password, values.name, values.role);
      
      toast({
        title: "Account created!",
        description: "You've successfully created your account.",
      });

      navigate("/login");
    } catch (error: any) {
      toast({
        title: "Signup failed",
        description: error.message || "An error occurred during signup",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-16 md:pt-20">
        <div className="container-tight py-8 md:py-16">
          <div className="max-w-xl mx-auto">
            <div className="text-center mb-8 animate-fade-down">
              <Link to="/signup" className="inline-flex items-center mb-8 text-2xl font-display font-bold">
                <img src={WebiBookLogo} className="h-16 w-16" alt="Webibook" />
                <span>
                  <span className="text-purple-600">Webi</span>
                  <span className="text-red-500">book</span>
                </span>
              </Link>
              <h1 className="text-3xl font-bold mb-3">Create your account</h1>
              <p className="text-muted-foreground">
                Join thousands of professionals exploring webinars that matter
              </p>
            </div>

            <div className="animate-fade-up">
              <div className="bg-white p-8 rounded-xl border border-border shadow-sm">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel>Full Name</FormLabel>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <FormControl>
                              <Input
                                placeholder="John Doe"
                                className="pl-10"
                                {...field}
                              />
                            </FormControl>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

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
                          <FormLabel>Password</FormLabel>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="Create a strong password"
                                className="pl-10"
                                {...field}
                              />
                            </FormControl>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Must be 8+ chars with uppercase, lowercase, and numbers
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel>I want to join as a</FormLabel>
                          <div className="flex flex-col space-y-1">
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="grid grid-cols-1 md:grid-cols-2 gap-2"
                              >
                                <div className="flex items-center space-x-2 border rounded-md p-3 hover:border-webi-blue cursor-pointer">
                                  <RadioGroupItem value="attendee" id="attendee" />
                                  <label htmlFor="attendee" className="font-medium text-sm cursor-pointer">Attendee</label>
                                </div>
                                <div className="flex items-center space-x-2 border rounded-md p-3 hover:border-webi-blue cursor-pointer">
                                  <RadioGroupItem value="hoster" id="hoster" />
                                  <label htmlFor="hoster" className="font-medium text-sm cursor-pointer">Hoster</label>
                                </div>
                              </RadioGroup>
                            </FormControl>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full group"
                      disabled={isLoading}
                    >
                      {isLoading ? "Creating account..." : "Create Account"}
                      {!isLoading && <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />}
                    </Button>

                    <p className="text-xs text-muted-foreground text-center">
                      By signing up, you agree to our{' '}
                      <Link to="/terms" className="text-webi-blue hover:underline">Terms</Link>
                      {' '}and{' '}
                      <Link to="/privacy" className="text-webi-blue hover:underline">Privacy Policy</Link>
                    </p>
                  </form>
                </Form>
              </div>

              <p className="text-center mt-6 text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link to="/login" className="text-webi-blue font-medium hover:underline">
                  Sign in
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

export default SignUp;