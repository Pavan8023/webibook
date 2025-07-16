import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow flex items-center justify-center">
        <div className="text-center py-16">
          <h1 className="text-9xl font-bold text-webi-blue">404</h1>
          <h2 className="text-2xl font-semibold mt-4">Oops! Page not found</h2>
          <p className="mt-2 text-muted-foreground">
            The page you are looking for doesn't exist or has been moved.
          </p>
          <Button asChild className="mt-6">
            <Link to="/">Return to Home</Link>
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;