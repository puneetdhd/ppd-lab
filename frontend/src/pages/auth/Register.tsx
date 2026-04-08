import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import axios from 'axios';
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

  // Student-specific fields
  const [branches, setBranches] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('');
  const [semester, setSemester] = useState(1);

  // Fetch branches on mount (public endpoint)
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/branches');
        setBranches(res.data.data || []);
      } catch {}
    };
    fetchBranches();
  }, []);

  // Fetch batches when branch changes (public endpoint)
  useEffect(() => {
    if (!selectedBranch) { setBatches([]); setSelectedBatch(''); return; }
    const fetchBatches = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/batches/branch/${selectedBranch}`);
        setBatches(res.data.data || []);
        setSelectedBatch('');
      } catch {}
    };
    fetchBatches();
  }, [selectedBranch]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (role === 'student' && !selectedBatch) {
      setError('Please select a branch and batch.');
      return;
    }

    setLoading(true);
    try {
      let res;
      if (role === 'student') {
        res = await api.post('/auth/register/student', {
          name, email, password,
          batch_id: selectedBatch,
          semester,
        });
      } else {
        res = await api.post('/auth/register/teacher', { name, email, password });
      }
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
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-[#9dce58] text-white p-2.5 rounded shadow-sm" style={{ borderBottomLeftRadius: 0 }}>
          <Mail size={22} strokeWidth={3} />
        </div>
        <span className="text-3xl font-bold tracking-tight text-gray-900">ia Academy</span>
      </div>

      {/* Header */}
      <h1 className="text-[38px] font-bold text-gray-900 mb-6 text-center leading-[1.15]">
        Create account
      </h1>

      <form onSubmit={handleRegister} className="w-full max-w-[440px] space-y-4">
        {error && (
          <div className="bg-red-50 text-red-600 px-5 py-3 rounded-xl text-sm text-center font-medium">
            {error}
          </div>
        )}
        
        {/* Role Switcher */}
        <div className="flex p-1 bg-gray-100 rounded-full mb-1">
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
            className="w-full px-6 py-3.5 rounded-full border border-gray-200 text-base focus:outline-none focus:border-[#9dce58] focus:ring-2 focus:ring-[#9dce58]/20 transition-all font-medium placeholder:text-gray-400"
          />
        </div>
        <div>
          <input
            type="email"
            required
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-6 py-3.5 rounded-full border border-gray-200 text-base focus:outline-none focus:border-[#9dce58] focus:ring-2 focus:ring-[#9dce58]/20 transition-all font-medium placeholder:text-gray-400"
          />
        </div>
        <div className="relative">
          <input
            type={showPass ? "text" : "password"}
            required
            placeholder="Password (min 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-6 py-3.5 rounded-full border border-gray-200 text-base focus:outline-none focus:border-[#9dce58] focus:ring-2 focus:ring-[#9dce58]/20 transition-all font-medium placeholder:text-gray-400 pr-14"
          />
          <button
            type="button"
            className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            onClick={() => setShowPass(!showPass)}
          >
            {showPass ? <Eye size={20} strokeWidth={2.5} /> : <EyeOff size={20} strokeWidth={2.5} />}
          </button>
        </div>

        {/* Student-specific fields */}
        {role === 'student' && (
          <div className="space-y-3 bg-gray-50 rounded-2xl p-4">
            <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Academic Details</div>
            <select
              required
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#9dce58] focus:ring-2 focus:ring-[#9dce58]/20 bg-white font-medium"
            >
              <option value="">Select Branch</option>
              {branches.map((b: any) => (
                <option key={b._id} value={b._id}>{b.branch_name}</option>
              ))}
            </select>
            
            <select
              required
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              disabled={!selectedBranch}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#9dce58] focus:ring-2 focus:ring-[#9dce58]/20 bg-white font-medium disabled:bg-gray-100 disabled:text-gray-400"
            >
              <option value="">Select Batch (Year Range)</option>
              {batches.map((b: any) => (
                <option key={b._id} value={b._id}>
                  {b.branch_id?.branch_name || 'Unknown'} ({b.start_year}–{b.graduation_year})
                </option>
              ))}
            </select>

            <select
              required
              value={semester}
              onChange={(e) => setSemester(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#9dce58] focus:ring-2 focus:ring-[#9dce58]/20 bg-white font-medium"
            >
              {[1,2,3,4,5,6,7,8].map(s => (
                <option key={s} value={s}>Semester {s}</option>
              ))}
            </select>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#9dce58] hover:bg-[#8cc63e] text-gray-900 font-bold py-3.5 rounded-full mt-2 transition-colors flex items-center justify-center text-[17px] shadow-sm"
        >
          {loading ? <Loader2 size={24} className="animate-spin" /> : 'Create account'}
        </button>
      </form>

      <div className="mt-8 pb-8 text-[15px] font-medium text-gray-500">
        Have an account? <Link to="/login" className="text-[#8cc63e] hover:underline ml-1 font-bold">Log in</Link>
      </div>
    </div>
  );
};
