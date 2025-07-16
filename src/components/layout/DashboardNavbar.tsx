import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db, logout } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

interface DashboardNavbarProps {
  userType: 'host' | 'attendee';
}

export const DashboardNavbar = ({ userType }: DashboardNavbarProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, loadingAuth] = useAuthState(auth);
  const [userData, setUserData] = useState<any>(null);
  const [loadingUserData, setLoadingUserData] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      setIsScrolled(offset > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch user data from Firestore
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        setLoadingUserData(false);
        return;
      }
      
      setLoadingUserData(true);
      try {
        // Check all possible collections
        const collections = ['googleauthusers', 'twitterauthusers', 'signupfromusers'];
        let userDoc = null;
        
        for (const collection of collections) {
          const docRef = doc(db, collection, user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            userDoc = docSnap.data();
            break;
          }
        }
        
        if (userDoc) {
          setUserData({
            name: userDoc.name || user.displayName,
            email: user.email,
            role: userDoc.role,
            provider: userDoc.provider || 'email',
            photoURL: userDoc.photoURL || user.photoURL
          });
        } else {
          // Fallback to basic user info
          setUserData({
            name: user.displayName || user.email?.split('@')[0],
            email: user.email,
            role: 'attendee',
            provider: 'unknown',
            photoURL: user.photoURL
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoadingUserData(false);
      }
    };

    fetchUserData();
  }, [user]);

  const handleLogout = async () => {
    await logout();
    setIsMobileMenuOpen(false);
    navigate('/');
  };

  const getDashboardLink = () => {
    return userType === 'host' ? '/host' : '/attendee';
  };

  const isActive = (hash: string) => {
    return location.hash === hash;
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/90 backdrop-blur-md shadow-sm' : 'bg-transparent'
      }`}
    >
      <div className="container-wide flex items-center justify-between h-16 md:h-20 py-2">
        <Link 
          to={getDashboardLink()} 
          className="text-2xl font-display font-bold flex items-center text-webi-blue transition-opacity hover:opacity-90"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-6 w-6 mr-2">
            <path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/>
            <path fill="currentColor" d="M8 8h8v2H8zm0 4h8v2H8zm0 4h5v2H8z"/>
          </svg>
          Webibook
        </Link>
        
        <nav className="hidden md:flex items-center space-x-1">
          <Link 
            to={getDashboardLink()} 
            className={`px-4 py-2 font-medium button-transition ${isActive('') ? 'text-blue-600 border-b-2 border-blue-600' : 'text-foreground/80 hover:text-foreground'}`}
          >
            Dashboard
          </Link>
          <Link 
            to={`${getDashboardLink()}#profile`} 
            className={`px-4 py-2 font-medium button-transition ${isActive('#profile') ? 'text-blue-600 border-b-2 border-blue-600' : 'text-foreground/80 hover:text-foreground'}`}
          >
            Profile
          </Link>
          <Link 
            to={`${getDashboardLink()}#settings`} 
            className={`px-4 py-2 font-medium button-transition ${isActive('#settings') ? 'text-blue-600 border-b-2 border-blue-600' : 'text-foreground/80 hover:text-foreground'}`}
          >
            Settings
          </Link>
        </nav>

        <div className="hidden md:flex items-center space-x-4">
          {loadingAuth || loadingUserData ? (
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-24 rounded-md" />
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
          ) : user ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-10 w-10 rounded-full p-0">
                    <Avatar>
                      <AvatarImage src={userData?.photoURL || undefined} />
                      <AvatarFallback className="bg-webi-blue text-white">
                        {userData?.name?.charAt(0) || user.email?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="px-4 py-2">
                    <p className="font-medium">{userData?.name || user.email}</p>
                    <p className="text-sm text-muted-foreground truncate max-w-[180px]">
                      {user.email}
                    </p>
                    <p className="text-xs mt-1">
                      <Badge variant="secondary">
                        {userData?.role || 'attendee'} • {userData?.provider || 'email'}
                      </Badge>
                    </p>
                  </div>
                  <DropdownMenuItem onClick={() => navigate(`${getDashboardLink()}#profile`)}>
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
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
            </>
          )}
        </div>

        <button 
          className="md:hidden p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
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
            to={getDashboardLink()} 
            className={`text-lg font-medium px-4 py-2 ${isActive('') ? 'text-blue-600' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Dashboard
          </Link>
          <Link 
            to={`${getDashboardLink()}#profile`} 
            className={`text-lg font-medium px-4 py-2 ${isActive('#profile') ? 'text-blue-600' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Profile
          </Link>
          <Link 
            to={`${getDashboardLink()}#settings`} 
            className={`text-lg font-medium px-4 py-2 ${isActive('#settings') ? 'text-blue-600' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Settings
          </Link>

          <div className="flex flex-col space-y-4 mt-6">
            {user ? (
              <>
                {loadingUserData ? (
                  <>
                    <Skeleton className="h-10 w-full rounded-md" />
                    <Skeleton className="h-10 w-full rounded-md" />
                  </>
                ) : (
                  <>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        navigate(`${getDashboardLink()}#profile`);
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      Profile
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={handleLogout}
                    >
                      Logout
                    </Button>
                  </>
                )}
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};