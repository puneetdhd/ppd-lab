import React, { useState } from 'react';
import { Search, Bell, Sun, Moon, MessageSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const TopBar: React.FC = () => {
  const { user } = useAuth();
  const [dark, setDark] = useState(document.documentElement.classList.contains('dark'));

  const toggleTheme = () => {
    const isDark = !dark;
    setDark(isDark);
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  };

  return (
    <header
      className="flex items-center gap-4 px-8 h-[72px] shrink-0 sticky top-0 z-30"
      style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)' }}
    >
      {/* Search */}
      <div className="search-box flex-1 max-w-sm">
        <Search className="search-icon" />
        <input
          className="form-input"
          style={{ paddingLeft: 36 }}
          placeholder="What do you want to find?"
        />
      </div>

      <div className="flex-1" />

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button onClick={toggleTheme} className="btn btn-ghost btn-icon">
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button className="btn btn-ghost btn-icon relative">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-danger border-2 border-white dark:border-[var(--bg-card)]" />
        </button>
        <button className="btn btn-ghost btn-icon">
          <MessageSquare size={18} />
        </button>

        {/* Profile */}
        <div className="flex items-center gap-3 pl-3 ml-1 cursor-pointer"
          style={{ borderLeft: '1px solid var(--border)' }}>
          <div className="text-right">
            <div className="text-sm font-semibold leading-tight" style={{ color: 'var(--text-primary)' }}>
              {user?.name}
            </div>
            <div className="text-xs capitalize" style={{ color: 'var(--text-muted)' }}>{user?.role}</div>
          </div>
          <div className="avatar avatar-md text-sm font-bold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
};
