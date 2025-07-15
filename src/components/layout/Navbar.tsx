
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, Search, Calendar, User, Video } from 'lucide-react';

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      setIsScrolled(offset > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/90 backdrop-blur-md shadow-sm' : 'bg-transparent'
      }`}
    >
      <div className="container-wide flex items-center justify-between h-16 md:h-20 py-2">
        <Link 
          to="/" 
          className="text-2xl font-display font-bold flex items-center text-webi-blue transition-opacity hover:opacity-90"
        >
          <Calendar className="mr-2 h-6 w-6" />
          Webibook
        </Link>
        
        <nav className="hidden md:flex items-center space-x-1">
          <Link to="/" className="px-4 py-2 text-foreground/80 hover:text-foreground font-medium button-transition">
            Home
          </Link>
          <Link to="/discover" className="px-4 py-2 text-foreground/80 hover:text-foreground font-medium button-transition">
            Discover
          </Link>
          <Link to="/categories" className="px-4 py-2 text-foreground/80 hover:text-foreground font-medium button-transition">
            Categories
          </Link>
          <Link to="/hosts" className="px-4 py-2 text-foreground/80 hover:text-foreground font-medium button-transition">
            Hosts
          </Link>
          <Link to="/host-webinar" className="px-4 py-2 text-foreground/80 hover:text-foreground font-medium button-transition">
            Host a Webinar
          </Link>
        </nav>

        <div className="hidden md:flex items-center space-x-4">
          <Button variant="outline" size="icon" className="rounded-full">
            <Search className="h-4 w-4" />
          </Button>
          <Link to="/login">
            <Button variant="outline" className="font-medium">
              Sign In
            </Button>
          </Link>
          <Link to="/signup">
            <Button className="font-medium">
              Get Started
            </Button>
          </Link>
        </div>

        <button 
          className="md:hidden p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile menu */}
      <div 
        className={`md:hidden fixed inset-0 bg-white z-40 transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full pt-20 p-6 space-y-6">
          <Link 
            to="/" 
            className="text-lg font-medium px-4 py-2"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Home
          </Link>
          <Link 
            to="/discover" 
            className="text-lg font-medium px-4 py-2"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Discover
          </Link>
          <Link 
            to="/categories" 
            className="text-lg font-medium px-4 py-2"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Categories
          </Link>
          <Link 
            to="/hosts" 
            className="text-lg font-medium px-4 py-2"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Hosts
          </Link>
          <Link 
            to="/host-webinar" 
            className="text-lg font-medium px-4 py-2"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Host a Webinar
          </Link>
          
          <div className="flex flex-col space-y-4 mt-6">
            <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
              <Button variant="outline" className="w-full">
                Sign In
              </Button>
            </Link>
            <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)}>
              <Button className="w-full">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};
