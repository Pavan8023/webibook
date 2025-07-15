
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { submitWebinar } from '@/services/webinarService';
import { WebinarType } from '@/components/ui/WebinarCard';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, Hourglass, User } from 'lucide-react';

// Define the validation schema
const webinarSchema = z.object({
  title: z.string().min(5, { message: 'Title must be at least 5 characters' }),
  description: z.string().min(20, { message: 'Description must be at least 20 characters' }),
  imageUrl: z.string().url({ message: 'Please enter a valid URL for the image' }).optional().or(z.literal('')),
  date: z.string().min(1, { message: 'Date is required' }),
  time: z.string().min(1, { message: 'Time is required' }),
  duration: z.string().min(1, { message: 'Duration is required' }),
  speakerName: z.string().min(1, { message: 'Speaker name is required' }),
  speakerRole: z.string().min(1, { message: 'Speaker role is required' }),
  speakerCompany: z.string().min(1, { message: 'Speaker company is required' }),
  category: z.string().min(1, { message: 'Category is required' }),
  isPaid: z.boolean().default(false),
  price: z.string().optional(),
});

type WebinarFormValues = z.infer<typeof webinarSchema>;

const HostWebinar = () => {
  const navigate = useNavigate();
  const [isPaid, setIsPaid] = useState(false);
  
  // Initialize form
  const form = useForm<WebinarFormValues>({
    resolver: zodResolver(webinarSchema),
    defaultValues: {
      title: '',
      description: '',
      imageUrl: '',
      date: new Date().toISOString().split('T')[0],
      time: '10:00 AM',
      duration: '60 mins',
      speakerName: '',
      speakerRole: '',
      speakerCompany: '',
      category: '',
      isPaid: false,
      price: '',
    },
  });
  
  // Set up mutation for submitting the webinar
  const submitMutation = useMutation({
    mutationFn: (data: WebinarFormValues) => {
      // Transform form data to WebinarType
      const webinarData: Omit<WebinarType, 'id'> = {
        title: data.title,
        description: data.description,
        imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1591115765373-5207764f72e4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        date: data.date,
        time: data.time,
        duration: data.duration,
        speaker: {
          name: data.speakerName,
          role: data.speakerRole,
          company: data.speakerCompany,
        },
        category: data.category,
        isUpcoming: new Date(data.date) > new Date(),
        isPaid: data.isPaid,
        price: data.isPaid ? data.price : undefined,
      };
      
      return submitWebinar(webinarData);
    },
    onSuccess: () => {
      toast.success('Webinar created successfully!');
      navigate('/discover');
    },
    onError: (error) => {
      toast.error('Failed to create webinar. Please try again.');
      console.error(error);
    },
  });
  
  const onSubmit = (data: WebinarFormValues) => {
    submitMutation.mutate(data);
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-white">
      <Navbar />
      
      <main className="flex-grow pt-28 pb-16 px-4 md:px-0">
        <div className="container-wide max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Host Your Own Webinar
            </h1>
            <p className="text-lg text-muted-foreground">
              Share your knowledge and expertise with our community by hosting a webinar.
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Webinar Details Section */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Webinar Details</h2>
                  
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Introduction to React Hooks" {...field} />
                        </FormControl>
                        <FormDescription>
                          The title of your webinar (5+ characters).
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Learn the basics of React Hooks and how they can simplify your React components."
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Describe what attendees will learn (20+ characters).
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cover Image URL (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/image.jpg" {...field} />
                        </FormControl>
                        <FormDescription>
                          A URL to an image for your webinar. If left blank, a default image will be used.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>Date</span>
                            </div>
                          </FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            <div className="flex items-center gap-2">
                              <span>Time</span>
                            </div>
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="10:00 AM" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            <div className="flex items-center gap-2">
                              <Hourglass className="h-4 w-4" />
                              <span>Duration</span>
                            </div>
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="60 mins" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                          <Input placeholder="React, JavaScript, UI/UX, etc." {...field} />
                        </FormControl>
                        <FormDescription>
                          The main category for your webinar.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Speaker Information Section */}
                <div className="space-y-4 pt-4 border-t">
                  <h2 className="text-xl font-semibold">Speaker Information</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="speakerName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              <span>Name</span>
                            </div>
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Jane Smith" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="speakerRole"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Role</FormLabel>
                          <FormControl>
                            <Input placeholder="Senior Developer" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="speakerCompany"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company</FormLabel>
                          <FormControl>
                            <Input placeholder="React Experts" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                {/* Pricing Section */}
                <div className="space-y-4 pt-4 border-t">
                  <h2 className="text-xl font-semibold">Pricing</h2>
                  
                  <FormField
                    control={form.control}
                    name="isPaid"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={(checked) => {
                              field.onChange(checked);
                              setIsPaid(!!checked);
                            }}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>This is a paid webinar</FormLabel>
                          <FormDescription>
                            Check this if you want to charge for attendance.
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  {isPaid && (
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price</FormLabel>
                          <FormControl>
                            <Input placeholder="$29.99" {...field} />
                          </FormControl>
                          <FormDescription>
                            The price to attend this webinar.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
                
                <div className="pt-6 flex justify-end">
                  <Button 
                    type="submit" 
                    size="lg"
                    disabled={submitMutation.isPending}
                  >
                    {submitMutation.isPending ? 'Creating...' : 'Create Webinar'}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default HostWebinar;
