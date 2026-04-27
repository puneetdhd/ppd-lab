import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, GraduationCap, Users,
  BarChart3, LogOut,
  ChevronRight, School, Award, ShieldCheck
} from 'lucide-react';

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  children?: { label: string; path: string }[];
}

const NAV: Record<string, NavItem[]> = {
  admin: [
    { label: 'Home',       path: '/admin',             icon: LayoutDashboard },
    { label: 'Students',   path: '/admin/students',    icon: GraduationCap },
    { label: 'Teachers',   path: '/admin/teachers',    icon: Users },
    { label: 'Subjects',   path: '/admin/subjects',    icon: School },
    { label: 'Analytics',  path: '/admin/analytics',   icon: BarChart3 },
    {
      label: 'Performance', path: '/admin/performance', icon: BarChart3,
      children: [
        { label: 'By Teacher', path: '/admin/performance/teacher' },
        { label: 'By Branch',  path: '/admin/performance/branch' },
        { label: 'By Batch',   path: '/admin/performance/batch' },
      ]
    },
    { label: 'Create Admin', path: '/admin/create-admin', icon: ShieldCheck },
  ],
  teacher: [
    { label: 'Home',           path: '/teacher',           icon: LayoutDashboard },
    { label: 'Enter Marks',    path: '/teacher/marks',     icon: ClipboardList },
    { label: 'Analytics',      path: '/teacher/analytics', icon: BarChart3 },
    { label: 'My Feedback',    path: '/teacher/feedback',  icon: MessageSquare },
  ],
  student: [
    { label: 'Home',       path: '/student',          icon: LayoutDashboard },
    { label: 'My Results', path: '/student/results',  icon: Award },
    { label: 'Feedback',   path: '/student/feedback', icon: MessageSquare },
  ],
};

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const role = user?.role ?? 'student';
  const links = NAV[role] ?? [];
  const [expanded, setExpanded] = useState<string | null>(null);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside
      className="flex flex-col h-screen sticky top-0 shrink-0"
      style={{ width: 'var(--sidebar-w)', background: 'var(--bg-sidebar)', borderRight: '1px solid var(--border)' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center justify-center w-9 h-9 rounded-xl text-white font-bold text-lg shadow-md"
          style={{ background: 'var(--accent)' }}>
          ia
        </div>
        <span className="font-bold text-lg tracking-tight" style={{ color: 'var(--text-primary)' }}>ia Academy</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {links.map((item) => {
          const Icon = item.icon;
          const hasChildren = !!item.children?.length;
          const isExpanded = expanded === item.label;

          if (hasChildren) {
            return (
              <div key={item.label}>
                <button
                  onClick={() => setExpanded(isExpanded ? null : item.label)}
                  className="sidebar-link w-full"
                >
                  <Icon className="shrink-0" size={18} />
                  <span className="flex-1 text-left">{item.label}</span>
                  <ChevronRight
                    size={14}
                    className="transition-transform duration-200"
                    style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0)' }}
                  />
                </button>
                {isExpanded && (
                  <div className="ml-8 mt-0.5 space-y-0.5">
                    {item.children!.map(ch => (
                      <NavLink
                        key={ch.path}
                        to={ch.path}
                        end
                        className={({ isActive }) => `sidebar-link text-xs py-2 ${isActive ? 'active' : ''}`}
                      >
                        {ch.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path.split('/').length <= 2}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Icon className="shrink-0" size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User section */}
      <div className="p-4" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl mb-2"
          style={{ background: 'var(--bg)' }}>
          <div className="avatar avatar-sm font-bold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{user?.name}</div>
            <div className="text-xs capitalize" style={{ color: 'var(--text-muted)' }}>{user?.role}</div>
          </div>
        </div>
        <button onClick={handleLogout} className="sidebar-link w-full text-sm">
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  );
};
