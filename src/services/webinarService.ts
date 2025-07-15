// Interface for a webinar registration
export interface WebinarRegistration {
  id: string;
  webinarId: string;
  name: string;
  email: string;
  company?: string;
  jobTitle?: string;
  questions?: string;
  marketingConsent: boolean;
  registrationDate: string;
}

// Interface for webinar filters
export interface WebinarFilters {
  search?: string;
  categories?: string[];
  upcoming?: boolean;
  paid?: boolean;
  date?: string;
  duration?: [number, number];
}

// Local storage keys
const REGISTRATIONS_KEY = 'webinar_registrations';
const USER_REGISTRATIONS_KEY = 'user_webinar_registrations';
const HOSTED_WEBINARS_KEY = 'hosted_webinars';

// Sample webinar data
import { WebinarType } from "@/components/ui/WebinarCard";

const sampleWebinars: WebinarType[] = [
  {
    id: "1",
    title: "Introduction to React Hooks",
    description: "Learn the basics of React Hooks and how they can simplify your React components.",
    imageUrl: "https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    date: "2023-11-15",
    time: "10:00 AM",
    duration: "60 mins",
    speaker: {
      name: "Jane Smith",
      role: "Senior Developer",
      company: "React Experts",
    },
    category: "React",
    isFeatured: true,
    isUpcoming: true,
    isPaid: false,
  },
  {
    id: "2",
    title: "Advanced TypeScript Patterns",
    description: "Dive into advanced TypeScript patterns and techniques for large-scale applications.",
    imageUrl: "https://images.unsplash.com/photo-1565106430482-8f6e74349ca1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    date: "2023-11-20",
    time: "2:00 PM",
    duration: "90 mins",
    speaker: {
      name: "John Doe",
      role: "TypeScript Architect",
      company: "TypeScript Wizards",
    },
    category: "TypeScript",
    isTrending: true,
    isUpcoming: true,
    isPaid: true,
    price: "$29.99",
  },
  {
    id: "3",
    title: "Building with Next.js",
    description: "Learn how to build fast, SEO-friendly applications with Next.js and React.",
    imageUrl: "https://images.unsplash.com/photo-1619410283995-43d9134e7656?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    date: "2023-11-25",
    time: "11:00 AM",
    duration: "120 mins",
    speaker: {
      name: "Sarah Johnson",
      role: "Full-Stack Developer",
      company: "NextGen Web",
    },
    category: "Next.js",
    isUpcoming: true,
    isPaid: false,
  },
  {
    id: "4",
    title: "State Management with Redux",
    description: "Master global state management with Redux in React applications.",
    imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    date: "2023-10-15",
    time: "1:00 PM",
    duration: "75 mins",
    speaker: {
      name: "Michael Chen",
      role: "Lead Developer",
      company: "State Solutions",
    },
    category: "React",
    isUpcoming: false,
    isPaid: false,
  },
  {
    id: "5",
    title: "CSS Grid and Flexbox Mastery",
    description: "Learn how to create complex layouts with CSS Grid and Flexbox.",
    imageUrl: "https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    date: "2023-10-10",
    time: "9:00 AM",
    duration: "60 mins",
    speaker: {
      name: "Lisa Wang",
      role: "UI Designer",
      company: "LayoutMasters",
    },
    category: "CSS",
    isUpcoming: false,
    isPaid: true,
    price: "$19.99",
  },
  {
    id: "6",
    title: "JavaScript Performance Optimization",
    description: "Techniques to optimize your JavaScript code for better performance.",
    imageUrl: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    date: "2023-12-05",
    time: "3:00 PM",
    duration: "90 mins",
    speaker: {
      name: "David Wilson",
      role: "Performance Engineer",
      company: "OptimizeJS",
    },
    category: "JavaScript",
    isUpcoming: true,
    isFeatured: true,
    isPaid: true,
    price: "$24.99",
  },
  {
    id: "7",
    title: "Getting Started with GraphQL",
    description: "Introduction to GraphQL and how it compares to REST APIs.",
    imageUrl: "https://images.unsplash.com/photo-1618477388954-7852f32655ec?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    date: "2023-11-30",
    time: "10:30 AM",
    duration: "45 mins",
    speaker: {
      name: "Emma Davis",
      role: "API Specialist",
      company: "GraphQL Connect",
    },
    category: "GraphQL",
    isUpcoming: true,
    isPaid: false,
  },
  {
    id: "8",
    title: "UI Animation Fundamentals",
    description: "Learn the principles of creating smooth and meaningful UI animations.",
    imageUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    date: "2023-10-25",
    time: "2:00 PM",
    duration: "60 mins",
    speaker: {
      name: "Alex Turner",
      role: "Motion Designer",
      company: "AnimateUI",
    },
    category: "UI/UX",
    isUpcoming: false,
    isPaid: false,
  },
  {
    id: "9",
    title: "Secure Authentication in Web Apps",
    description: "Best practices for implementing secure authentication in web applications.",
    imageUrl: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    date: "2023-12-10",
    time: "11:00 AM",
    duration: "90 mins",
    speaker: {
      name: "Ryan Martinez",
      role: "Security Engineer",
      company: "SecureWeb",
    },
    category: "Security",
    isUpcoming: true,
    isTrending: true,
    isPaid: true,
    price: "$29.99",
  },
];

// Function to get all webinars
export const getWebinars = (filters: WebinarFilters = {}): Promise<WebinarType[]> => {
  return new Promise((resolve) => {
    // Get any user-hosted webinars
    const hostedWebinarsJSON = localStorage.getItem(HOSTED_WEBINARS_KEY);
    const hostedWebinars: WebinarType[] = hostedWebinarsJSON 
      ? JSON.parse(hostedWebinarsJSON) 
      : [];
    
    // Combine with sample webinars
    const allWebinars = [...sampleWebinars, ...hostedWebinars];
    
    // Simulate API delay
    setTimeout(() => {
      resolve(allWebinars);
    }, 800);
  });
};

// Generate a simple ID
const generateId = () => Math.random().toString(36).substring(2, 15);

// Save a registration
export const registerForWebinar = (
  webinarId: string, 
  name: string, 
  email: string, 
  company?: string, 
  jobTitle?: string, 
  questions?: string, 
  marketingConsent: boolean = false
): WebinarRegistration => {
  // Create the registration object
  const registration: WebinarRegistration = {
    id: generateId(),
    webinarId,
    name,
    email,
    company,
    jobTitle,
    questions,
    marketingConsent,
    registrationDate: new Date().toISOString(),
  };

  // Get existing registrations from localStorage
  const registrationsJSON = localStorage.getItem(REGISTRATIONS_KEY);
  const registrations: WebinarRegistration[] = registrationsJSON 
    ? JSON.parse(registrationsJSON) 
    : [];

  // Add the new registration
  registrations.push(registration);

  // Save back to localStorage
  localStorage.setItem(REGISTRATIONS_KEY, JSON.stringify(registrations));

  // Save to user registrations as well (to keep track of which webinars the current user is registered for)
  const userRegistrationsJSON = localStorage.getItem(USER_REGISTRATIONS_KEY);
  const userRegistrations: string[] = userRegistrationsJSON 
    ? JSON.parse(userRegistrationsJSON) 
    : [];

  if (!userRegistrations.includes(webinarId)) {
    userRegistrations.push(webinarId);
    localStorage.setItem(USER_REGISTRATIONS_KEY, JSON.stringify(userRegistrations));
  }

  return registration;
};

// Check if a user is registered for a specific webinar
export const isRegisteredForWebinar = (webinarId: string): boolean => {
  const userRegistrationsJSON = localStorage.getItem(USER_REGISTRATIONS_KEY);
  if (!userRegistrationsJSON) return false;

  const userRegistrations: string[] = JSON.parse(userRegistrationsJSON);
  return userRegistrations.includes(webinarId);
};

// Get all registrations for a webinar
export const getWebinarRegistrations = (webinarId: string): WebinarRegistration[] => {
  const registrationsJSON = localStorage.getItem(REGISTRATIONS_KEY);
  if (!registrationsJSON) return [];

  const registrations: WebinarRegistration[] = JSON.parse(registrationsJSON);
  return registrations.filter(reg => reg.webinarId === webinarId);
};

// Get the number of registrations for a webinar
export const getWebinarRegistrationCount = (webinarId: string): number => {
  return getWebinarRegistrations(webinarId).length;
};

// Submit a new webinar
export const submitWebinar = (webinar: Omit<WebinarType, 'id'>): Promise<WebinarType> => {
  return new Promise((resolve) => {
    // Generate ID for the new webinar
    const newWebinar: WebinarType = {
      ...webinar,
      id: generateId(),
    };

    // Get existing hosted webinars
    const hostedWebinarsJSON = localStorage.getItem(HOSTED_WEBINARS_KEY);
    const hostedWebinars: WebinarType[] = hostedWebinarsJSON 
      ? JSON.parse(hostedWebinarsJSON) 
      : [];

    // Add the new webinar
    hostedWebinars.push(newWebinar);

    // Save back to localStorage
    localStorage.setItem(HOSTED_WEBINARS_KEY, JSON.stringify(hostedWebinars));

    // Simulate API delay
    setTimeout(() => {
      resolve(newWebinar);
    }, 800);
  });
};

// Get all categories
export const getAllCategories = (): string[] => {
  const allWebinars = getWebinars();
  const categories = [...new Set(sampleWebinars.map(webinar => webinar.category))];
  return categories;
};
