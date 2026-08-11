import { Bell, Search, User, LogOut, Moon, Sun, CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function Topbar() {
  const { user, logout } = useAuth();
  
  // Dropdowns
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Notifications
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Fetch notifications
    const fetchNotifications = async () => {
      try {
        const res = await api.get('/notifications');
        if (res.data.success) {
          setNotifications(res.data.data);
          setUnreadCount(res.data.data.length); // simple assumption for now
        }
      } catch (err) {
        console.error('Failed to fetch notifications', err);
      }
    };
    
    if (user) fetchNotifications();
  }, [user]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (document.documentElement.classList.contains('dark') || localStorage.getItem('theme') === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDarkMode(true);
    }
  };

  const getNotifIcon = (type: string) => {
    if (type === 'success') return <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />;
    if (type === 'error') return <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />;
    if (type === 'warning') return <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />;
    return <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />;
  };

  return (
    <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 h-16 flex items-center justify-between px-6 z-10 shadow-sm relative">
      <div className="flex-1 flex items-center">
        <div className="relative w-96 hidden md:block">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-5 w-5 text-slate-400" />
          </span>
          <input
            type="text"
            className="block w-full rounded-md border-0 py-2 pl-10 pr-3 text-slate-900 dark:text-slate-100 ring-1 ring-inset ring-slate-300 dark:ring-slate-600 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
            placeholder="Search anything..."
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => {
              setNotifDropdownOpen(!notifDropdownOpen);
              if (!notifDropdownOpen) setUnreadCount(0); // Mark as read on open
            }}
            className="text-slate-500 hover:text-slate-700 dark:text-slate-300 relative p-1 rounded-full hover:bg-slate-100 dark:bg-slate-700/50 focus:outline-none"
          >
            <Bell className="h-6 w-6" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 ring-2 ring-white"></span>
              </span>
            )}
          </button>
          
          {notifDropdownOpen && (
            <div className="absolute right-0 top-12 mt-2 w-80 bg-white dark:bg-slate-800 rounded-md shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Notifications</h3>
                <span className="text-xs bg-slate-200 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full">{notifications.length} New</span>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-6 text-center text-sm text-slate-500">
                    No new notifications.
                  </div>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} className="px-4 py-3 border-b border-slate-100 hover:bg-slate-50 dark:bg-slate-900/50 flex items-start gap-3 transition-colors">
                      {getNotifIcon(n.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{n.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{n.message}</p>
                        <p className="text-[10px] text-slate-400 mt-1">{new Date(n.time).toLocaleString()}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="flex items-center space-x-3 border-l border-slate-200 dark:border-slate-700 pl-4 relative" ref={profileRef}>
          <div className="flex flex-col text-right cursor-pointer" onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{user?.name || 'Loading...'}</span>
            <span className="text-xs text-slate-500">{user?.role || ''}</span>
          </div>
          <button 
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold hover:bg-blue-200 transition-colors focus:outline-none"
            title="Profile"
          >
            <User className="h-5 w-5" />
          </button>

          {profileDropdownOpen && (
            <div className="absolute right-0 top-12 mt-2 w-48 bg-white dark:bg-slate-800 rounded-md shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-50">
              <button 
                onClick={toggleTheme}
                className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:bg-slate-700/50 flex items-center"
              >
                {isDarkMode ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
                {isDarkMode ? 'Light Theme' : 'Dark Theme'}
              </button>
              <div className="border-t border-slate-100 my-1"></div>
              <button 
                onClick={logout}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center font-medium"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
