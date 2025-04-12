"use client";

import { FC, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, Users, LogOut, User, Settings, CreditCard, Star, Youtube } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import ARVRNavButton from "../arvrButton/ArVrButton";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  getAuth, 
  onAuthStateChanged, 
  signOut 
} from "firebase/auth";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import { auth } from '@/lib/firebaseConfig';

interface NavigationProps {}

const Navigation: FC<NavigationProps> = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isStarAnimating, setIsStarAnimating] = useState(false);
  const [isButtonClicked, setIsButtonClicked] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  
  // Check if current route is /arvr
  const isARVRPage = pathname === '/arvr';

  useEffect(() => {
    // Check authentication state
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        // User is signed in
        setUser(currentUser);
        
        // Optional: Retrieve additional user data from local storage
        const storedUserData = localStorage.getItem('user');
        if (storedUserData) {
          const parsedUserData = JSON.parse(storedUserData);
          setUser((prevUser: any) => ({
            ...prevUser,
            displayName: parsedUserData.displayName || prevUser.displayName
          }));
        }
      } else {
        // User is signed out
        setUser(null);
      }
    });

    // Check initial dark mode state from document
    setIsDarkMode(document.documentElement.classList.contains("dark"));

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [auth]);

  // Reset button click animation after it completes
  useEffect(() => {
    if (isButtonClicked) {
      const timer = setTimeout(() => {
        setIsButtonClicked(false);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [isButtonClicked]);

  const toggleTheme = () => {
    const newDarkModeState = !isDarkMode;
    setIsDarkMode(newDarkModeState);
    document.documentElement.classList.toggle("dark");
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      
      // Clear user data from local storage
      localStorage.removeItem('user');
      
      // Show logout toast
      toast.success("Logged out successfully", {
        description: "You have been signed out of your account."
      });
      
      // Redirect to home page
      router.push('/');
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed", {
        description: "An error occurred while logging out."
      });
    }
  };

  const handlePricingClick = () => {
    setIsButtonClicked(true);
    setIsStarAnimating(true);
    
    // Actually navigate to subscriptions page
    setTimeout(() => {
      router.push('/subscriptions');
    }, 300);
  };

  const renderAuthButtons = () => {
    if (!user) {
      return (
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" className={`${isARVRPage ? 'text-amber-900 hover:text-amber-800' : ''}`}>
              Login
            </Button>
          </Link>
          <Link href="/signup">
            <Button className="bg-purple-500 hover:bg-purple-600 text-white">
              Sign Up
            </Button>
          </Link>
        </div>
      );
    }

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            {user.photoURL ? (
              <Image
                src={user.photoURL}
                alt={user.displayName || 'User avatar'}
                fill
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center">
                {user.displayName ? user.displayName[0].toUpperCase() : 
                 user.email ? user.email[0].toUpperCase() : 'U'}
              </div>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.displayName || 'User'}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email || 'No email'}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/dashboard">Dashboard</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/settings">Settings</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  // Animation for the star icon
  const starAnimation = {
    animate: {
      rotate: [0, 20, -20, 10, -10, 0],
      scale: [1, 1.2, 1],
      filter: ["drop-shadow(0 0 0 rgba(255, 215, 0, 0))", "drop-shadow(0 0 5px rgba(255, 215, 0, 0.8))", "drop-shadow(0 0 0 rgba(255, 215, 0, 0))"],
      transition: { duration: 1.5, repeat: 0 }
    },
    initial: {
      rotate: 0,
      scale: 1,
      filter: "drop-shadow(0 0 0 rgba(255, 215, 0, 0))"
    },
    // New click animation for the star
    click: {
      rotate: [0, 180],
      scale: [1, 1.5, 1],
      filter: ["drop-shadow(0 0 0 rgba(255, 215, 0, 0))", "drop-shadow(0 0 10px rgba(255, 215, 0, 1))", "drop-shadow(0 0 15px rgba(255, 255, 0, 1))", "drop-shadow(0 0 0 rgba(255, 215, 0, 0))"],
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  // Get current star animation based on state
  const getCurrentStarAnimation = () => {
    if (isButtonClicked) return starAnimation.click;
    if (isStarAnimating) return starAnimation.animate;
    return starAnimation.initial;
  };

  const renderMenuItems = () => {
    return (
      <>
       <Link
          href="/contact"
          >
          <span>Contact Us</span>
        </Link>
        <Link
          href="/explore"
          >
          <span>Explore</span>
        </Link>
        <Link
          href="/allgames"
          >
          <span>Labs</span>
        </Link>
        <ARVRNavButton isARVRPage={isARVRPage} />
        
        <Link
          href="/communities"
          className={`flex items-center space-x-1 font-medium ${isARVRPage
            ? 'text-amber-800 hover:text-amber-900'
            : 'text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300'}`}
        >
          <Users className="h-4 w-4" />
          <span>Communities</span>
        </Link>
        
        <Link
          href="/youtube-learning"
          className={`flex items-center space-x-1 font-medium ${isARVRPage
            ? 'text-amber-800 hover:text-amber-900'
            : 'text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300'}`}
        >
          <Youtube className="h-4 w-4" />
          <span>YouTube Learning</span>
        </Link>
        
        <div className="relative group">
          <motion.div
            whileHover={{ 
              y: [0, -5, 0], 
              transition: { duration: 0.5, ease: "easeInOut" } 
            }}
            whileTap={{ 
              scale: 0.95,
              boxShadow: "0 0 15px rgba(255, 215, 0, 0.5)",
              transition: { duration: 0.1 }
            }}
            animate={isButtonClicked ? {
              scale: [1, 0.95, 1.05, 1],
              rotate: [0, -2, 2, 0],
              boxShadow: ["0 4px 6px rgba(0, 0, 0, 0.1)", "0 10px 15px rgba(255, 215, 0, 0.3)", "0 4px 6px rgba(0, 0, 0, 0.1)"],
              background: ["linear-gradient(to right, #fbbf24, #f59e0b)", "linear-gradient(to right, #fcd34d, #f59e0b)", "linear-gradient(to right, #fbbf24, #f59e0b)"],
              transition: { duration: 0.6 }
            } : {}}
            onHoverStart={() => setIsStarAnimating(true)}
            onHoverEnd={() => !isButtonClicked && setIsStarAnimating(false)}
            onClick={handlePricingClick}
            className={`font-medium px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center space-x-2 cursor-pointer ${
              isARVRPage 
                ? "bg-gradient-to-r from-amber-300 to-yellow-400 hover:from-amber-400 hover:to-yellow-500 text-amber-900 border border-amber-300 shadow-amber-200/50"
                : "bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-gray-900 border border-amber-300"
            }`}
          >
            <motion.div
              animate={getCurrentStarAnimation()}
              initial={starAnimation.initial}
            >
              <Star className={`h-4 w-4 ${isARVRPage ? "text-amber-900" : "text-white"}`} />
            </motion.div>
            <span>Pricing</span>
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-1.5 rounded-full">
              Pro
            </span>
          </motion.div>
        </div>
      </>
    );
  };

  // Golden premium style for ARVR page
  const navbarStyles = isARVRPage 
    ? {
        background: "linear-gradient(135deg, #f7e8c3 0%, #ffd700 50%, #edc967 100%)",
        boxShadow: "0 4px 15px rgba(255, 215, 0, 0.3)",
        borderBottom: "1px solid rgba(255, 215, 0, 0.5)"
      }
    : {};

  return (
    <nav 
      className={`${isARVRPage ? 'bg-gradient-to-r from-amber-100 to-yellow-200 dark:from-amber-800 dark:to-yellow-900' : 'bg-white dark:bg-gray-800'} shadow-md py-4 px-6 sticky top-0 z-50`}
      style={navbarStyles}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <div className="relative">
              {isDarkMode ? (
                <Image
                  src="/learnit logo.png"
                  alt="LearnIt.com Dark Logo"
                  width={150}
                  height={50}
                  className="h-auto"
                />
              ) : (
                <Image
                  src="/learnit logo.png"
                  alt="LearnIt.com Logo"
                  width={150}
                  height={50}
                  className="h-auto"
                />
              )}
              {isARVRPage && (
                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-900 text-xs font-bold px-2 py-0.5 rounded-full border border-amber-300 shadow-sm">
                  AR/VR
                </div>
              )}
            </div>
          </Link>
        </div>

        <div className="hidden md:flex items-center space-x-8">
          {renderMenuItems()}
          <div className="flex items-center space-x-4">
            {renderAuthButtons()}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className={`rounded-full h-10 w-10 p-0 flex items-center justify-center ${
                isARVRPage ? "text-amber-800 hover:text-amber-900 hover:bg-amber-100/30" : ""
              }`}
            >
              {isDarkMode ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={isARVRPage ? "text-amber-800" : "text-yellow-400"}
                >
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={isARVRPage ? "text-amber-800" : "text-indigo-600"}
                >
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </Button>
          </div>
        </div>

        <div className="md:hidden flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2"
          >
            {isMenuOpen ? (
              <X className={`h-6 w-6 ${isARVRPage ? "text-amber-900" : "text-gray-800 dark:text-white"}`} />
            ) : (
              <Menu className={`h-6 w-6 ${isARVRPage ? "text-amber-900" : "text-gray-800 dark:text-white"}`} />
            )}
          </Button>
        </div>
      </div>

      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className={`md:hidden mt-4 py-2 ${isARVRPage ? "bg-amber-100 dark:bg-amber-900" : "bg-white dark:bg-gray-800"}`}
        >
          <div className="flex flex-col space-y-3 px-6">
          
            <a
              href="#how-it-works"
              className={`font-medium py-2 ${isARVRPage 
                ? "text-amber-800 hover:text-amber-900" 
                : "text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"}`}
            >
              How it Works
            </a>
            
            <div className="py-2">
              <motion.button
                className={`font-medium w-full py-2 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 relative ${
                  isARVRPage 
                    ? "bg-gradient-to-r from-amber-300 to-yellow-400 hover:from-amber-400 hover:to-yellow-500 text-amber-900 border border-amber-300 shadow-amber-200/50"
                    : "bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-gray-900 border border-amber-300"
                }`}
                whileHover={{ 
                  y: [0, -3, 0],
                  transition: { duration: 0.5, ease: "easeInOut" }
                }}
                whileTap={{ 
                  scale: 0.95,
                  boxShadow: "0 0 15px rgba(255, 215, 0, 0.5)",
                  transition: { duration: 0.1 }
                }}
                animate={isButtonClicked ? {
                  scale: [1, 0.95, 1.05, 1],
                  rotate: [0, -2, 2, 0],
                  boxShadow: ["0 4px 6px rgba(0, 0, 0, 0.1)", "0 10px 15px rgba(255, 215, 0, 0.3)", "0 4px 6px rgba(0, 0, 0, 0.1)"],
                  background: ["linear-gradient(to right, #fbbf24, #f59e0b)", "linear-gradient(to right, #fcd34d, #f59e0b)", "linear-gradient(to right, #fbbf24, #f59e0b)"],
                  transition: { duration: 0.6 }
                } : {}}
                onHoverStart={() => setIsStarAnimating(true)}
                onHoverEnd={() => !isButtonClicked && setIsStarAnimating(false)}
                onClick={handlePricingClick}
              >
                <motion.div
                  animate={getCurrentStarAnimation()}
                  initial={starAnimation.initial}
                >
                  <Star className={`h-4 w-4 ${isARVRPage ? "text-amber-900" : "text-white"}`} />
                </motion.div>
                <span>Pricing</span>
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-1.5 rounded-full">
                  Pro
                </span>
              </motion.button>
            </div>
            
            <Link
              href="/communities"
              className={`flex items-center space-x-1 font-medium py-2 ${isARVRPage
                ? "text-amber-800 hover:text-amber-900"
                : "text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"}`}
            >
              <Users className="h-4 w-4" />
              <span>Communities</span>
            </Link>
            
            <Link
              href="/youtube-learning"
              className={`flex items-center space-x-1 font-medium py-2 ${isARVRPage
                ? "text-amber-800 hover:text-amber-900"
                : "text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"}`}
            >
              <Youtube className="h-4 w-4" />
              <span>YouTube Learning</span>
            </Link>
            
            <div className="flex flex-col space-y-2 pt-2">
              {user ? (
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-2 mb-2">
                    {user.photoURL ? (
                      <Image 
                        src={user.photoURL} 
                        alt="Profile" 
                        width={32} 
                        height={32} 
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center">
                        {user.displayName ? user.displayName[0].toUpperCase() : user.email[0].toUpperCase()}
                      </div>
                    )}
                    <span className={`text-sm font-medium ${isARVRPage ? 'text-amber-900' : ''}`}>
                      {user.displayName || user.email.split('@')[0]}
                    </span>
                  </div>
                  <Button 
                    onClick={() => router.push('/dashboard')}
                    className={`w-full ${isARVRPage 
                      ? "bg-amber-200 hover:bg-amber-300 text-amber-900" 
                      : ""}`}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                  <Button 
                    onClick={() => router.push('/settings')}
                    className={`w-full ${isARVRPage 
                      ? "bg-amber-200 hover:bg-amber-300 text-amber-900" 
                      : ""}`}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                  <Button 
                    onClick={() => router.push('/quizzes')}
                    className={`w-full ${isARVRPage 
                      ? "bg-amber-200 hover:bg-amber-300 text-amber-900" 
                      : ""}`}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    My Quizzes
                  </Button>
                  <Button 
                    onClick={() => router.push('/subscription')}
                    className={`w-full ${isARVRPage 
                      ? "bg-amber-200 hover:bg-amber-300 text-amber-900" 
                      : ""}`}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Subscription
                  </Button>
                  <Button 
                    onClick={handleLogout}
                    className={`w-full ${isARVRPage 
                      ? "text-red-600 hover:text-red-700 border border-red-300 hover:border-red-400 bg-amber-100 hover:bg-amber-200" 
                      : "text-red-500 hover:text-red-600 border border-red-300 hover:border-red-400"}`}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              ) : (
                <>
                  <Link href="/login">
                    <Button className={`w-full ${isARVRPage 
                      ? "bg-gradient-to-r from-amber-300 to-yellow-500 hover:from-amber-400 hover:to-yellow-600 text-amber-900 font-semibold border border-amber-300 shadow-lg hover:shadow-amber-200/50" 
                      : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"}`}>
                      Login
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button
                      variant="outline"
                      className={`w-full ${isARVRPage
                        ? "text-amber-800 hover:text-amber-900 border-amber-400 hover:border-amber-500 hover:bg-amber-100/30"
                        : "text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 border-purple-600 hover:border-purple-700 dark:border-purple-400 dark:hover:border-purple-300"}`}
                    >
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </nav>
  );
};

export default Navigation;