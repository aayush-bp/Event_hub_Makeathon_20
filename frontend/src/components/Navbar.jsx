import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Menu, LogOut, User, Moon, Sun } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useTheme } from '../context/ThemeContext';

export const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const { isDark, toggleDarkMode } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = React.useState(false);
  const profileMenuRef = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsProfileMenuOpen(false);
    navigate('/login');
  };

  const userData = user?.user || user;
  const userRole = userData?.role;

  return (
    <nav className="bg-gradient-to-r from-primary via-blue-600 to-blue-700 text-white shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1
              className="text-2xl font-bold cursor-pointer hover:text-blue-100 transition-colors duration-300"
              onClick={() => navigate('/dashboard')}
            >
              Event Hub
            </h1>
          </div>

          <div className="hidden lg:flex items-center gap-6">
            <button
              onClick={() => navigate('/dashboard')}
              className="hover:text-blue-100 transition-colors duration-300 font-medium px-3 py-1 bg-blue-500 rounded-lg hover:bg-blue-700"
            >
              Events
            </button>
            <button
              onClick={() => navigate('/create-event')}
              className="hover:text-blue-100 transition-colors duration-300 font-medium px-3 py-1 bg-green-600 rounded-lg hover:bg-green-800"
            >
              Create Event
            </button>
            {(userRole === 'ADMIN' || userRole === 'ORGANIZER' || userRole === 'SPEAKER') && (
              <button
                onClick={() => navigate('/admin')}
                className="hover:text-blue-100 transition-colors duration-300 font-medium px-3 py-1 bg-blue-600 rounded-lg hover:bg-blue-800"
              >
                {userRole === 'SPEAKER' ? 'My Pending Events' : 'Approve Events'}
              </button>
            )}
            {userRole === 'ADMIN' && (
              <button
                onClick={() => navigate('/admin/users')}
                className="hover:text-blue-100 transition-colors duration-300 font-medium px-3 py-1 bg-purple-600 rounded-lg hover:bg-purple-800"
              >
                Manage Users
              </button>
            )}
            <div className="relative">
              <button
                onClick={() => navigate('/notifications')}
                className="relative hover:text-blue-100 transition-colors duration-300"
              >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>
            <button
              onClick={toggleDarkMode}
              className="hover:text-blue-100 transition-colors duration-300 p-2 rounded-lg hover:bg-blue-600"
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
            </button>
            <div className="relative">
              <button 
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2 hover:text-blue-100 transition-colors duration-300 px-3 py-2 rounded-lg hover:bg-blue-600 font-medium"
              >
                <User className="w-5 h-5" />
                {userData?.name}
              </button>
              <div 
                ref={profileMenuRef}
                className={`absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-lg shadow-2xl z-50 transition-all duration-200 dark:border dark:border-gray-700 ${
                  isProfileMenuOpen ? 'block opacity-100 scale-100' : 'hidden opacity-0 scale-95'
                }`}
              >
                <button
                  onClick={() => navigate('/profile')}
                  className="block w-full text-left px-4 py-2 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors duration-200 font-medium"
                >
                  Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 hover:bg-red-50 dark:hover:bg-gray-700 transition-colors duration-200 flex items-center gap-2 font-medium text-red-600 dark:text-red-400"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden pb-4">
            <button
              onClick={() => {
                navigate('/dashboard');
                setIsMenuOpen(false);
              }}
              className="block w-full text-left px-4 py-2 hover:bg-blue-800 bg-blue-700 font-medium rounded mb-2"
            >
              Events
            </button>
            <button
              onClick={() => {
                navigate('/create-event');
                setIsMenuOpen(false);
              }}
              className="block w-full text-left px-4 py-2 hover:bg-green-800 bg-green-700 font-medium rounded mb-2"
            >
              Create Event
            </button>
            {(userRole === 'ADMIN' || userRole === 'ORGANIZER' || userRole === 'SPEAKER') && (
              <button
                onClick={() => {
                  navigate('/admin');
                  setIsMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-2 hover:bg-blue-800 bg-blue-700 font-medium"
              >
                {userRole === 'SPEAKER' ? 'My Pending Events' : 'Approve Events'}
              </button>
            )}
            {userRole === 'ADMIN' && (
              <button
                onClick={() => {
                  navigate('/admin/users');
                  setIsMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-2 hover:bg-purple-800 bg-purple-700 font-medium"
              >
                Manage Users
              </button>
            )}
            <button
              onClick={() => {
                navigate('/notifications');
                setIsMenuOpen(false);
              }}
              className="block w-full text-left px-4 py-2 hover:bg-blue-600"
            >
              Notifications
            </button>
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-2 hover:bg-blue-600 flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};
