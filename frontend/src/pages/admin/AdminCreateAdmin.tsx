import React, { useState } from 'react';
import api from '../../api/axios';
import { Loader2, ShieldCheck, UserPlus } from 'lucide-react';

export const AdminCreateAdmin: React.FC = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setResult(null);
    try {
      const res = await api.post('/auth/create-admin', form);
      setResult(res.data.data);
      setForm({ name: '', email: '', password: '' });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create admin');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Create Admin</h1>
          <div className="page-breadcrumb">Home / <span>Create Admin</span></div>
        </div>
      </div>

      <div className="card max-w-lg">
        <div className="flex items-center gap-3 px-6 py-5" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="icon-box rounded-xl" style={{ background: 'var(--danger-light)', color: 'var(--danger)', width: 40, height: 40 }}>
            <ShieldCheck size={20} />
          </div>
          <div>
            <div className="font-bold" style={{ color: 'var(--text-primary)' }}>New Admin Account</div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Only existing admins can create new admin accounts</div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5 space-y-4">
            {error && (
              <div className="p-3 rounded-lg text-sm font-medium" style={{ background: 'var(--danger-light)', color: 'var(--danger)' }}>{error}</div>
            )}
            {result && (
              <div className="p-4 rounded-lg text-sm" style={{ background: 'var(--success-light)', color: 'var(--success)' }}>
                <div className="font-bold mb-1">✓ Admin created successfully!</div>
                <div>Name: {result.name}</div>
                <div>Email: {result.email}</div>
                <div>Role: {result.role}</div>
              </div>
            )}
            <div>
              <label className="form-label">Full Name</label>
              <input className="form-input" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Admin Name" />
            </div>
            <div>
              <label className="form-label">Email</label>
              <input type="email" className="form-input" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="admin@ppd.edu" />
            </div>
            <div>
              <label className="form-label">Password</label>
              <input type="password" className="form-input" required minLength={6} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Min 6 characters" />
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 px-6 pb-6">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <Loader2 size={14} className="animate-spin" /> : <><UserPlus size={16} /> Create Admin</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
