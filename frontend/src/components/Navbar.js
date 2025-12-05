import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { apiService } from '../services/api';
import { Button } from './ui/button';
import { 
  Menu, 
  X, 
  User, 
  Settings,
  LogOut,
  Bell,
  Clock,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

const NavLink = ({ to, children, className = "", onClick, currentHash }) => {
  const location = useLocation();
  // For /events route - only active when on /events page
  const isActive = location.pathname === to && location.pathname !== '/';
  
  return (
    <Link
      to={to}
      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
        isActive 
          ? 'bg-orange-600/20 text-orange-500' 
          : 'text-gray-300 hover:text-orange-500 hover:bg-orange-600/10'
      } ${className}`}
      onClick={onClick}
    >
      {children}
    </Link>
  );
};

const HashLink = ({ to, children, className = "", onClick, currentHash, setCurrentHash }) => {
  const location = useLocation();

  const hash = to.replace('/', '');
  // Only active if on home page AND this hash matches current hash
  const isActive = location.pathname === '/' && currentHash === hash;

  const handleClick = (e) => {
    e.preventDefault();
    const element = document.querySelector(hash);
    
    if (location.pathname !== '/') {
      // Navigate to home first, then scroll
      window.location.href = to;
    } else if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      window.history.pushState(null, '', hash);
      setCurrentHash(hash);
    }
    
    if (onClick) onClick();
  };

  return (
    <a
      href={to}
      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
        isActive 
          ? 'bg-orange-600/20 text-orange-500' 
          : 'text-gray-300 hover:text-orange-500 hover:bg-orange-600/10'
      } ${className}`}
      onClick={handleClick}
    >
      {children}
    </a>
  );
};

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentHash, setCurrentHash] = useState(window.location.hash || '#home');
  const navigate = useNavigate();
  const location = useLocation();
  const defaultRoute = isAuthenticated ? '/dashboard' : '/auth';

  // Notifications state
  const [notifications, setNotifications] = useState([]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Helper function to format time ago
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hour${Math.floor(diffInSeconds / 3600) > 1 ? 's' : ''} ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} day${Math.floor(diffInSeconds / 86400) > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  // Fetch notifications from backend
  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const data = await apiService.getNotifications(user.id);
      setNotifications(data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  }, [user?.id]);

  // Fetch notifications on mount and when user changes
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchNotifications();
      
      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, user?.id, fetchNotifications]);

  const markAsRead = async (id) => {
    try {
      await apiService.markNotificationAsRead(id);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user?.id) return;
    
    try {
      await apiService.markAllNotificationsAsRead(user.id);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const clearAllNotifications = async () => {
    if (!user?.id) return;
    
    try {
      await apiService.deleteAllNotifications(user.id);
      setNotifications([]);
    } catch (error) {
      console.error('Failed to delete all notifications:', error);
    }
  };

  const removeNotification = async (id) => {
    try {
      await apiService.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  // Listen for hash changes and sync state
  useEffect(() => {
    const handleHashChange = () => {
      setCurrentHash(window.location.hash || '#home');
    };
    
    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('popstate', handleHashChange);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('popstate', handleHashChange);
    };
  }, []);

  // When navigating to home page without hash, default to #home
  useEffect(() => {
    if (location.pathname === '/' && !location.hash) {
      setCurrentHash('#home');
    } else if (location.pathname !== '/') {
      setCurrentHash(''); // Clear hash when not on home page
    } else {
      setCurrentHash(location.hash);
    }
  }, [location]);

  // Scroll spy - update active section based on scroll position
  useEffect(() => {
    if (location.pathname !== '/') return;

    const sections = [
      { id: 'home', hash: '#home' },
      { id: 'why-qrush', hash: '#why-qrush' },
      { id: 'built-for-everyone', hash: '#why-qrush' }, // Maps to About Us
      { id: 'contact', hash: '#contact' }
    ];

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100; // Offset for navbar height

      // Find which section is currently in view
      let activeHash = '#home';
      
      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetHeight = element.offsetHeight;
          
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            activeHash = section.hash;
          }
        }
      }

      // Check if we're at the bottom of the page (for contact/footer)
      const scrolledToBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 100;
      if (scrolledToBottom) {
        activeHash = '#contact';
      }

      if (activeHash !== currentHash) {
        setCurrentHash(activeHash);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Run once on mount

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [location.pathname, currentHash]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getUserMenuItems = React.useCallback(() => {
    if (!user) return [];
    
    return [
      { icon: User, label: 'Profile', onClick: () => navigate('/profile') },
      { icon: Settings, label: 'Settings', onClick: () => navigate('/settings') },
    ];
  }, [user, navigate]);

  return (
    <nav className="bg-black/50 backdrop-blur-md shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to={defaultRoute} className="flex items-center space-x-3">
            <img 
              src="/logo.png" 
              alt="QRush" 
              className="w-10 h-10 rounded-lg"
            />
            <span className="text-2xl font-bold text-white">
              Q<span className="text-orange-500">Rush</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {isAuthenticated ? (
              <>
                <NavLink to="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>Dashboard</NavLink>
                <NavLink to="/events" onClick={() => setIsMobileMenuOpen(false)}>Events</NavLink>
              </>
            ) : (
              <>
                <HashLink to="/#home" onClick={() => setIsMobileMenuOpen(false)} currentHash={currentHash} setCurrentHash={setCurrentHash}>Home</HashLink>
                <HashLink to="/#why-qrush" onClick={() => setIsMobileMenuOpen(false)} currentHash={currentHash} setCurrentHash={setCurrentHash}>About Us</HashLink>
                <HashLink to="/#contact" onClick={() => setIsMobileMenuOpen(false)} currentHash={currentHash} setCurrentHash={setCurrentHash}>Contact Us</HashLink>
                <NavLink to="/events" onClick={() => setIsMobileMenuOpen(false)}>Events</NavLink>
              </>
            )}
          </div>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* Notification Bell Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="relative hover:bg-orange-600/10"
                      aria-label="Notifications"
                    >
                      <Bell className="w-5 h-5 text-gray-300 hover:text-orange-500" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-black text-xs font-bold rounded-full flex items-center justify-center">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80 bg-gray-900 border-orange-600/20 max-h-96 overflow-y-auto">
                    <DropdownMenuLabel className="flex items-center justify-between">
                      <span className="text-white font-semibold">Notifications</span>
                      {notifications.length > 0 && (
                        <div className="flex items-center space-x-2">
                          {unreadCount > 0 && (
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                markAllAsRead();
                              }}
                              className="text-xs text-orange-500 hover:text-orange-400"
                            >
                              Mark all read
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              clearAllNotifications();
                            }}
                            className="text-xs text-gray-400 hover:text-red-500"
                          >
                            Clear all
                          </button>
                        </div>
                      )}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-orange-600/20" />
                    
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center">
                        <Bell className="w-10 h-10 text-gray-600 mx-auto mb-2" />
                        <p className="text-gray-400 text-sm">No notifications</p>
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`px-3 py-3 hover:bg-orange-600/10 cursor-pointer border-b border-gray-800 last:border-b-0 ${
                            !notification.isRead ? 'bg-orange-600/5' : ''
                          }`}
                          onClick={() => markAsRead(notification.id)}
                        >
                          <div className="flex items-start space-x-3">
                            <div className="mt-0.5">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className={`text-sm font-medium ${!notification.isRead ? 'text-white' : 'text-gray-300'}`}>
                                  {notification.title}
                                </p>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeNotification(notification.id);
                                  }}
                                  className="text-gray-500 hover:text-red-500 ml-2"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                              <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">
                                {notification.message}
                              </p>
                              <div className="flex items-center mt-1 text-xs text-gray-500">
                                <Clock className="w-3 h-3 mr-1" />
                                {formatTimeAgo(notification.createdAt)}
                                {!notification.isRead && (
                                  <span className="ml-2 w-2 h-2 bg-orange-500 rounded-full"></span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                    
                    {notifications.length > 0 && (
                      <>
                        <DropdownMenuSeparator className="bg-orange-600/20" />
                        <DropdownMenuItem
                          onClick={() => navigate('/settings')}
                          className="text-center text-orange-500 hover:text-orange-400 hover:bg-orange-600/10 justify-center cursor-pointer"
                        >
                          <Settings className="w-4 h-4 mr-2" />
                          Notification Settings
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2 hover:bg-orange-600/10">
                    <div className="w-8 h-8 bg-orange-600/20 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-orange-500" />
                    </div>
                    <span className="font-medium text-gray-300">{user.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-gray-900 border-orange-600/20">
                  <DropdownMenuLabel>
                    <div>
                      <p className="font-medium text-white">{user.name}</p>
                      <p className="text-sm text-gray-400 capitalize">{user.role}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-orange-600/20" />
                  {getUserMenuItems().map((item, index) => (
                    <DropdownMenuItem
                      key={index}
                      onClick={item.onClick}
                      className="flex items-center space-x-2 cursor-pointer text-gray-300 hover:text-orange-500 hover:bg-orange-600/10"
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator className="bg-orange-600/20" />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="flex items-center space-x-2 cursor-pointer text-red-500 hover:bg-red-600/10"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              </>
            ) : (
              <Button 
                onClick={() => navigate('/auth')}
                className="gradient-orange text-black hover:opacity-90"
              >
                Sign In
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-300" />
              ) : (
                <Menu className="w-6 h-6 text-gray-300" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-black/80 backdrop-blur-md border-t border-orange-600/20 py-4">
            <div className="flex flex-col space-y-2">
              {isAuthenticated ? (
                <>
                  <NavLink to="/dashboard" className="block" onClick={() => setIsMobileMenuOpen(false)}>Dashboard</NavLink>
                  <NavLink to="/events" className="block" onClick={() => setIsMobileMenuOpen(false)}>Events</NavLink>
                </>
              ) : (
                <>
                  <HashLink to="/#home" className="block" onClick={() => setIsMobileMenuOpen(false)} currentHash={currentHash} setCurrentHash={setCurrentHash}>Home</HashLink>
                  <HashLink to="/#why-qrush" className="block" onClick={() => setIsMobileMenuOpen(false)} currentHash={currentHash} setCurrentHash={setCurrentHash}>About Us</HashLink>
                  <HashLink to="/#contact" className="block" onClick={() => setIsMobileMenuOpen(false)} currentHash={currentHash} setCurrentHash={setCurrentHash}>Contact Us</HashLink>
                  <NavLink to="/events" className="block" onClick={() => setIsMobileMenuOpen(false)}>Events</NavLink>
                </>
              )}
              
              <hr className="my-4 border-orange-600/20" />
              
              {isAuthenticated ? (
                <div className="space-y-2">
                  <div className="px-4 py-2">
                    <p className="font-medium text-white">{user.name}</p>
                    <p className="text-sm text-gray-400 capitalize">{user.role}</p>
                  </div>
                  <button
                    onClick={() => {
                      navigate('/settings');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-gray-300 hover:text-orange-500 hover:bg-orange-600/10 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-2">
                      <Bell className="w-4 h-4" />
                      <span>Notifications</span>
                    </div>
                    {unreadCount > 0 && (
                      <span className="w-5 h-5 bg-orange-500 text-black text-xs font-bold rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>
                  {getUserMenuItems().map((item, index) => (
                    <button
                      key={index}
                      onClick={item.onClick}
                      className="w-full text-left px-4 py-2 text-gray-300 hover:text-orange-500 hover:bg-orange-600/10 flex items-center space-x-2"
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  ))}
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-red-500 hover:bg-red-600/10 flex items-center space-x-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2 px-4">
                  <Button 
                    onClick={() => {
                      navigate('/auth');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full gradient-orange text-black"
                  >
                    Sign In
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;