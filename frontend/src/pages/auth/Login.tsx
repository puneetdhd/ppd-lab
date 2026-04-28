import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { Eye, EyeOff, Loader2, Mail } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token, user } = res.data.data;
      login(token, user);
      if (user.role === 'admin')   navigate('/admin');
      else if (user.role === 'teacher') navigate('/teacher');
      else navigate('/student');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6" style={{ fontFamily: "'Inter', sans-serif" }}>
      
      {/* Brand */}
      <div className="flex items-center gap-3 mb-10">
        <div className="bg-[#9dce58] text-white p-2.5 rounded shadow-sm" style={{ borderBottomLeftRadius: 0 }}>
          <Mail size={22} strokeWidth={3} />
        </div>
        <span className="text-3xl font-bold tracking-tight text-gray-900">ia Academy</span>
      </div>

      {/* Header */}
      <h1 className="text-[44px] font-bold text-gray-900 mb-8 max-w-[280px] text-center leading-[1.15]">
        Welcome back
      </h1>

      <form onSubmit={handleLogin} className="w-full max-w-[420px] space-y-5">
        {error && (
          <div className="bg-red-50 text-red-600 px-5 py-3 rounded-xl text-base text-center font-medium">
            {error}
          </div>
        )}

        <div>
          <input
            type="email"
            required
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-6 py-4 rounded-full border border-gray-200 text-base focus:outline-none focus:border-[#9dce58] focus:ring-2 focus:ring-[#9dce58]/20 transition-all font-medium placeholder:text-gray-400"
          />
        </div>
        <div className="relative">
          <input
            type={showPass ? "text" : "password"}
            required
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-6 py-4 rounded-full border border-gray-200 text-base focus:outline-none focus:border-[#9dce58] focus:ring-2 focus:ring-[#9dce58]/20 transition-all font-medium placeholder:text-gray-400 pr-14"
          />
          <button
            type="button"
            className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            onClick={() => setShowPass(!showPass)}
          >
            {showPass ? <Eye size={20} strokeWidth={2.5} /> : <EyeOff size={20} strokeWidth={2.5} />}
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#9dce58] hover:bg-[#8cc63e] text-gray-900 font-bold py-4 rounded-full mt-4 transition-colors flex items-center justify-center text-[17px] shadow-sm"
        >
          {loading ? <Loader2 size={24} className="animate-spin" /> : 'Log in'}
        </button>
      </form>

      <div className="w-full max-w-[420px] mt-8 text-center">
        {/* Quick login buttons for demo */}
        <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-3">Quick Demo Login</div>
        <div className="grid grid-cols-3 gap-3">
          <button type="button" onClick={() => { setEmail('admin@ppd.edu'); setPassword('admin123'); }} className="text-xs bg-gray-100 py-2.5 rounded-lg font-bold uppercase tracking-wider text-gray-500 hover:bg-gray-200 transition-colors">Admin</button>
          <button type="button" onClick={() => { setEmail('teacher26@ppd.edu'); setPassword('teacher26'); }} className="text-xs bg-gray-100 py-2.5 rounded-lg font-bold uppercase tracking-wider text-gray-500 hover:bg-gray-200 transition-colors">Teacher</button>
          <button type="button" onClick={() => { setEmail('student5@ppd.edu'); setPassword('student5'); }} className="text-xs bg-gray-100 py-2.5 rounded-lg font-bold uppercase tracking-wider text-gray-500 hover:bg-gray-200 transition-colors">Student</button>
        </div>
      </div>

      <div className="mt-auto pb-8 text-[15px] font-medium text-gray-500">
        Don't have an account? <Link to="/register" className="text-[#8cc63e] hover:underline ml-1 font-bold">Sign up</Link>
      </div>
    </div>
  );
};
