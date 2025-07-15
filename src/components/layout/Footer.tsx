
import { Link } from 'react-router-dom';
import { Calendar, Mail, Twitter, Linkedin, Github, Instagram } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-secondary py-16 mt-20 border-t border-border">
      <div className="container-wide">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="space-y-4">
            <Link
              to="/"
              className="text-2xl font-display font-bold flex items-center text-webi-blue"
            >
              <Calendar className="mr-2 h-6 w-6" />
              Webibook
            </Link>
            <p className="text-muted-foreground max-w-xs">
              Discover, book, and manage webinars and online events with
              AI-powered recommendations and networking tools.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-base mb-4">Platform</h4>
            <ul className="space-y-3">
              <li><Link to="/discover" className="text-muted-foreground hover:text-foreground transition-colors">Discover Events</Link></li>
              <li><Link to="/categories" className="text-muted-foreground hover:text-foreground transition-colors">Browse Categories</Link></li>
              <li><Link to="/hosts" className="text-muted-foreground hover:text-foreground transition-colors">Event Hosts</Link></li>
              <li><Link to="/upcoming" className="text-muted-foreground hover:text-foreground transition-colors">Upcoming Webinars</Link></li>
              <li><Link to="/popular" className="text-muted-foreground hover:text-foreground transition-colors">Popular Events</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-base mb-4">Company</h4>
            <ul className="space-y-3">
              <li><Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors">About Us</Link></li>
              <li><Link to="/careers" className="text-muted-foreground hover:text-foreground transition-colors">Careers</Link></li>
              <li><Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors">Contact</Link></li>
              <li><Link to="/blog" className="text-muted-foreground hover:text-foreground transition-colors">Blog</Link></li>
              <li><Link to="/press" className="text-muted-foreground hover:text-foreground transition-colors">Press</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-base mb-4">Support</h4>
            <ul className="space-y-3">
              <li><Link to="/help" className="text-muted-foreground hover:text-foreground transition-colors">Help Center</Link></li>
              <li><Link to="/privacy" className="hover:underline">Privacy Policy</Link></li>
              <li><Link to="/tnc" className="hover:underline">Terms & Conditions</Link></li>
              <li><Link to="/faq" className="text-muted-foreground hover:text-foreground transition-colors">FAQ</Link></li>
              <li><a href="mailto:support@webibook.com" className="text-muted-foreground hover:text-foreground transition-colors flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                support@webibook.com
              </a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-10 pt-8 text-center md:flex md:justify-between md:text-left">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} Webibook. All rights reserved.
          </p>
          <p className="text-muted-foreground text-sm mt-2 md:mt-0">
            Designed with precision. Built with passion.
          </p>
        </div>
      </div>
    </footer>
  );
};
