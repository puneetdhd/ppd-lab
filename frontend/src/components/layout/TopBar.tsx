import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Search, Bell, MessageSquare, ChevronDown, Moon, Sun } from 'lucide-react';

export const TopBar: React.FC = () => {
  const { user } = useAuth();

  // Basic theme toggle (would need external state/context for real app)
  const toggleDark = () => {
    document.documentElement.classList.toggle('dark');
  };

  return (
    <header className="h-20 bg-background/50 backdrop-blur-sm border-b border-border flex items-center justify-between px-8 sticky top-0 z-10 w-full">
      <div className="flex-1 flex items-center">
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="What do you want to find?"
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border-none rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm transition-shadow"
          />
        </div>
      </div>

      <div className="flex items-center space-x-6">
        <button onClick={toggleDark} className="text-slate-400 hover:text-primary transition-colors">
          <Moon className="w-5 h-5 hidden dark:block" />
          <Sun className="w-5 h-5 block dark:hidden" />
        </button>
        <button className="relative text-slate-400 hover:text-primary transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        <button className="text-slate-400 hover:text-primary transition-colors">
          <MessageSquare className="w-5 h-5" />
        </button>
        
        <div className="flex items-center space-x-3 pl-4 border-l border-border cursor-pointer group">
          <div className="flex flex-col items-end">
            <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{user?.name || 'User'}</span>
            <span className="text-xs text-slate-500 capitalize">{user?.role || 'Guest'}</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold overflow-hidden border border-primary/20">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
        </div>
      </div>
    </header>
  );
};
