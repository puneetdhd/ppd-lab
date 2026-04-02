import React, { createContext, useContext, useState, useEffect } from 'react';

export type Role = 'admin' | 'teacher' | 'student';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null, token: null, login: () => {}, logout: () => {}, loading: true,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser]   = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [dark, setDark]   = useState(false);

  useEffect(() => {
    const t = localStorage.getItem('token');
    const u = localStorage.getItem('user');
    const d = localStorage.getItem('theme') === 'dark';
    if (t && u) { try { setToken(t); setUser(JSON.parse(u)); } catch {} }
    setDark(d);
    document.documentElement.classList.toggle('dark', d);
    setLoading(false);
  }, []);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken); setUser(newUser);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
  };
  const logout = () => {
    setToken(null); setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
