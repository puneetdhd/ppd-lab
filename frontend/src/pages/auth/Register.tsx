import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { Eye, EyeOff, Loader2, Mail } from 'lucide-react';

export const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/register', { name, email, password, role });
      const { token, user } = res.data.data;
      login(token, user);
      if (user.role === 'teacher') navigate('/teacher');
      else navigate('/student');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed.');
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
        Create account
      </h1>

      <form onSubmit={handleRegister} className="w-full max-w-[420px] space-y-5">
        {error && (
          <div className="bg-red-50 text-red-600 px-5 py-3 rounded-xl text-base text-center font-medium">
            {error}
          </div>
        )}
        
        {/* Role Switcher */}
        <div className="flex p-1 bg-gray-100 rounded-full mb-2">
          <button
            type="button"
            onClick={() => setRole('student')}
            className={`flex-1 py-3 text-[15px] font-bold rounded-full transition-colors ${role === 'student' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            I'm a Student
          </button>
          <button
            type="button"
            onClick={() => setRole('teacher')}
            className={`flex-1 py-3 text-[15px] font-bold rounded-full transition-colors ${role === 'teacher' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            I'm a Teacher
          </button>
        </div>

        <div>
          <input
            type="text"
            required
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-6 py-4 rounded-full border border-gray-200 text-base focus:outline-none focus:border-[#9dce58] focus:ring-2 focus:ring-[#9dce58]/20 transition-all font-medium placeholder:text-gray-400"
          />
        </div>
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
          {loading ? <Loader2 size={24} className="animate-spin" /> : 'Create account'}
        </button>
      </form>

      <div className="w-full max-w-[420px] mt-10 text-center">
        <div className="text-gray-400 text-sm font-medium mb-6">or sign up with</div>
        <div className="flex items-center justify-center gap-5">
          <button className="w-[54px] h-[54px] rounded-full bg-[#f4faeb] hover:bg-[#e7f4d4] flex items-center justify-center text-gray-900 transition-colors shadow-sm">
            <span className="font-bold text-xl">G</span>
          </button>
          <button className="w-[54px] h-[54px] rounded-full bg-[#f4faeb] hover:bg-[#e7f4d4] flex items-center justify-center text-gray-900 transition-colors shadow-sm">
            <svg viewBox="0 0 21 21" width="22" height="22" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="m0 0h10v10h-10z" />
              <path d="m11 0h10v10h-10z" />
              <path d="m0 11h10v10h-10z" />
              <path d="m11 11h10v10h-10z" />
            </svg>
          </button>
          <button className="w-[54px] h-[54px] rounded-full bg-[#f4faeb] hover:bg-[#e7f4d4] flex items-center justify-center text-gray-900 transition-colors shadow-sm">
            <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
          </button>
        </div>

        <p className="text-[13px] font-medium text-gray-400 mt-10 mb-14 leading-relaxed px-4">
          By creating an account you agree to ia Academy's <br/>
          <a href="#" className="text-[#8cc63e] hover:underline">Terms of Services</a> and <a href="#" className="text-[#8cc63e] hover:underline">Privacy Policy</a>.
        </p>
      </div>

      <div className="mt-auto pb-8 text-[15px] font-medium text-gray-500">
        Have an account? <Link to="/login" className="text-[#8cc63e] hover:underline ml-1 font-bold">Log in</Link>
      </div>
    </div>
  );
};
