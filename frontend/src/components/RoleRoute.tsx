import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth, type Role } from '../context/AuthContext';

interface RoleRouteProps {
  allowedRoles: Role[];
}

export const RoleRoute: React.FC<RoleRouteProps> = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user || !allowedRoles.includes(user.role)) {
    // If not allowed, redirect to their home based on role
    if (user?.role === 'admin') return <Navigate to="/admin" replace />;
    if (user?.role === 'teacher') return <Navigate to="/teacher" replace />;
    if (user?.role === 'student') return <Navigate to="/student" replace />;
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
