import { Bell, Search, User } from 'lucide-react';

import { useAuth } from '../context/AuthContext';

export default function Topbar() {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 z-10 shadow-sm">
      <div className="flex-1 flex items-center">
        <div className="relative w-96">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-5 w-5 text-slate-400" />
          </span>
          <input
            type="text"
            className="block w-full rounded-md border-0 py-2 pl-10 pr-3 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
            placeholder="Search anything..."
          />
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <button className="text-slate-500 hover:text-slate-700 relative p-1 rounded-full hover:bg-slate-100">
          <Bell className="h-6 w-6" />
          <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
        </button>
        <div className="flex items-center space-x-3 border-l border-slate-200 pl-4">
          <div className="flex flex-col text-right">
            <span className="text-sm font-semibold text-slate-700">{user?.name || 'Loading...'}</span>
            <span className="text-xs text-slate-500">{user?.role || ''}</span>
          </div>
          <button 
            onClick={logout}
            className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold hover:bg-blue-200 transition-colors"
            title="Logout"
          >
            <User className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
