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

interface UserData {
  name?: string;
  email?: string;
  role?: string;
  type?: string;
  photoURL?: string;
}

export const DashboardNavbar = ({ userType }: DashboardNavbarProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, loadingAuth] = useAuthState(auth);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loadingUserData, setLoadingUserData] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
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
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData({
            name: data.name || user.displayName || user.email?.split('@')[0],
            email: user.email || undefined,
            role: data.role || 'attendee',
            type: data.type || 'email',
            photoURL: data.photoURL || user.photoURL || undefined
          });
        } else {
          setUserData({
            name: user.displayName || user.email?.split('@')[0],
            email: user.email || undefined,
            role: 'attendee',
            type: 'unknown',
            photoURL: user.photoURL || undefined
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

  const isActive = (section: string) => {
    return location.hash === `#${section}`;
  };

  const getProviderIcon = () => {
    switch (userData?.type) {
      case 'google':
        return (
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            <path d="M1 1h22v22H1z" fill="none" />
          </svg>
        );
      case 'twitter':
        return (
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path d="M23.954 4.569a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.691 8.094 4.066 6.13 1.64 3.161a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.061a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.937 4.937 0 004.604 3.417 9.868 9.868 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.054 0 13.999-7.496 13.999-13.986 0-.209 0-.42-.015-.63a9.936 9.936 0 002.46-2.548l-.047-.02z" fill="#1DA1F2" />
          </svg>
        );
      default:
        return (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        );
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/90 backdrop-blur-md shadow-sm' : 'bg-transparent'
        }`}
    >
      <div className="container-wide flex items-center justify-between h-16 md:h-20 py-2 px-4 sm:px-6">
        <Link
          to={getDashboardLink()}
          className="text-2xl font-display font-bold flex items-center text-webi-blue transition-opacity hover:opacity-90"
        >
          <img src="./dist/images/Webibook.png" className='h-16 w-16 z-50' alt="" />
          <span>
            <span className="text-purple-600">Webi</span>
            <span className="text-red-500">book</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center space-x-1">
          <Link
            to={getDashboardLink()}
            className={`px-4 py-2 font-medium transition-colors ${location.pathname === getDashboardLink() && location.hash === ''
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-foreground/80 hover:text-foreground'
              }`}
          >
            Dashboard
          </Link>
          <Link
            to={`${getDashboardLink()}#profile`}
            className={`px-4 py-2 font-medium transition-colors ${isActive('profile')
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-foreground/80 hover:text-foreground'
              }`}
          >
            Profile
          </Link>
          <Link
            to={`${getDashboardLink()}#settings`}
            className={`px-4 py-2 font-medium transition-colors ${isActive('settings')
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-foreground/80 hover:text-foreground'
              }`}
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
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="flex items-center gap-1">
                  {getProviderIcon()}
                  <span className="capitalize">{userData?.type || 'email'}</span>
                </Badge>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-10 w-10 rounded-full p-0">
                    <Avatar>
                      <AvatarImage src={userData?.photoURL} />
                      <AvatarFallback className="bg-webi-blue text-white">
                        {userData?.name?.charAt(0) || user.email?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-4 py-2">
                    <p className="font-medium truncate">{userData?.name || user.email}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {user.email}
                    </p>
                    <p className="text-xs mt-1 flex items-center gap-2">
                      <Badge variant="secondary" className="flex items-center gap-1">
                        {getProviderIcon()}
                        <span className="capitalize">{userData?.type || 'email'}</span>
                      </Badge>
                      <Badge variant="outline">
                        {userData?.role || 'attendee'}
                      </Badge>
                    </p>
                  </div>
                  <DropdownMenuItem onClick={() => navigate(`${getDashboardLink()}#profile`)}>
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate(`${getDashboardLink()}#settings`)}>
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-3">
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
          )}
        </div>

        <button
          className={`md:hidden p-2 z-50 ${isMobileMenuOpen ? 'fixed top-4 right-4' : 'relative'}`}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6 text-red-500"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6"
            >
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden fixed inset-0 bg-white z-40 transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        <div className="flex flex-col h-full pt-20 p-6 space-y-6">
          <Link
                    to={getDashboardLink()}
                    className="text-2xl font-display font-bold flex items-center text-webi-blue transition-opacity hover:opacity-90"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-6 w-6 mr-2">
                      <path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z" />
                      <path fill="currentColor" d="M8 8h8v2H8zm0 4h8v2H8zm0 4h5v2H8z" />
                    </svg>
                    Webibook
                  </Link>
          <Link
            to={getDashboardLink()}
            className={`text-lg font-medium px-4 py-2 rounded-lg text-blue-900 ${location.pathname === getDashboardLink() && location.hash === ''
                ? 'bg-blue-50 text-blue-600'
                : 'hover:bg-gray-100'
              }`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Dashboard
          </Link>
          <Link
            to={`${getDashboardLink()}#profile`}
            className={`text-lg font-medium px-4 py-2 rounded-lg text-white-900 ${isActive('profile')
                ? 'bg-blue-50 text-blue-600'
                : 'hover:bg-gray-100'
              }`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Profile
          </Link>
          <Link
            to={`${getDashboardLink()}#settings`}
            className={`text-lg font-medium px-4 py-2 rounded-lg text-black ${isActive('settings')
                ? 'bg-blue-50 text-blue-600'
                : 'hover:bg-gray-100'
              }`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Settings
          </Link>

          {user && (
            <div className="flex items-center gap-3 px-4 py-2 mt-8">
              <div className="flex items-center bg-black text-white rounded-md shadow-sm">
                {getProviderIcon()}
                <span className="text-sm capitalize">{userData?.type || 'email'}</span>
              </div>
              <span className="text-sm">•</span>
              <span className="text-base text-black font-semibold capitalize">{userData?.role || 'attendee'}</span>
            </div>
          )}

          <div className="flex flex-col space-y-4 mt-6">
            {user ? (
              <>
                {loadingUserData ? (
                  <>
                    <Skeleton className="h-12 w-full rounded-lg" />
                    <Skeleton className="h-12 w-full rounded-lg" />
                    <Skeleton className="h-12 w-full rounded-lg" />
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      className="w-full py-4 text-base text-blue-900"
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
                  <Button variant="outline" className="w-full py-4 text-base text-blue-900">
                    Sign In
                  </Button>
                </Link>
                <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full py-4 text-base">
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