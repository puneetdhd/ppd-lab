import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';
import { 
  LayoutDashboard, Users, BookOpen, GraduationCap, 
  Calendar, FileLineChart, LogOut, Settings, ClipboardList
} from 'lucide-react';

interface SidebarProps {
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const { user, logout } = useAuth();
  const role = user?.role || 'student';

  const navLinks = {
    admin: [
      { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
      { name: 'Branches & Batches', path: '/admin/branches', icon: Calendar },
      { name: 'Subjects', path: '/admin/subjects', icon: BookOpen },
      { name: 'Teachers', path: '/admin/teachers', icon: Users },
      { name: 'Students', path: '/admin/students', icon: GraduationCap },
      { name: 'Assignments', path: '/admin/assignments', icon: ClipboardList },
    ],
    teacher: [
      { name: 'Dashboard', path: '/teacher', icon: LayoutDashboard },
      { name: 'Enter Marks', path: '/teacher/marks', icon: FileLineChart },
      { name: 'Analytics', path: '/teacher/analytics', icon: Settings },
    ],
    student: [
      { name: 'Dashboard', path: '/student', icon: LayoutDashboard },
      { name: 'My Results', path: '/student/results', icon: FileLineChart },
      { name: 'Feedback', path: '/student/feedback', icon: BookOpen },
    ]
  };

  const links = navLinks[role];

  return (
    <aside className={cn("flex flex-col w-64 bg-card border-r border-border shadow-sm h-screen sticky top-0", className)}>
      <div className="p-6 flex items-center space-x-3">
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold">
          P
        </div>
        <span className="text-xl font-bold tracking-tight text-foreground">
          ia Academy
        </span>
      </div>

      <nav className="flex-1 px-4 space-y-1 mt-4">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group",
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300")} />
                  <span>{link.name}</span>
                  {isActive && (
                    <div className="absolute left-0 w-1 h-8 bg-primary rounded-r-md" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <button 
          onClick={logout}
          className="flex items-center space-x-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
