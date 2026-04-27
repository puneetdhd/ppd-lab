import React, { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import api from '../../api/axios';
import { Plus, Search, Trash2, Edit, Users, Loader2 } from 'lucide-react';

export const AdminTeachers: React.FC = () => {
  const { data, loading, refetch } = useApi<any[]>('/teachers');
  const [search, setSearch] = useState('');
  const [showModal, setModal] = useState(false);
  const [form, setForm] = useState({ name: '', regdNo: '' });
  const [saving, setSaving] = useState(false);

  const teachers = (data || []).filter(t =>
    t.user_id?.name?.toLowerCase().includes(search.toLowerCase()) ||
    t.user_id?.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      await api.post('/teachers', form);
      setModal(false);
      setForm({ name: '', regdNo: '' });
      refetch();
    } catch (err: any) { alert(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this teacher?')) return;
    try { await api.delete(`/teachers/${id}`); refetch(); }
    catch { alert('Failed to delete.'); }
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Teachers</h1>
          <div className="page-breadcrumb">Home / <span>Teachers</span></div>
        </div>
        <button className="btn btn-primary" onClick={() => setModal(true)}><Plus size={16} />Add Teacher</button>
      </div>

      <div className="card">
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>Faculty Members</div>
          <div className="search-box">
            <Search className="search-icon" size={16} />
            <input className="form-input" style={{ paddingLeft: 34, width: 220 }} placeholder="Search teachers..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16"><Loader2 size={28} className="animate-spin" style={{ color: 'var(--accent)' }} /></div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th><th>Email</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                {teachers.length === 0 && (
                  <tr><td colSpan={3} className="text-center py-12" style={{ color: 'var(--text-muted)' }}>No teachers found.</td></tr>
                )}
                {teachers.map((t: any) => (
                  <tr key={t._id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="avatar avatar-sm text-xs">{t.user_id?.name?.charAt(0) || 'T'}</div>
                        <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{t.user_id?.name}</span>
                      </div>
                    </td>
                    <td>{t.user_id?.email}</td>
                    <td>
                      <div className="flex gap-2">
                        <button className="btn btn-ghost btn-icon btn-sm" onClick={() => handleDelete(t._id)}>
                          <Trash2 size={15} style={{ color: 'var(--danger)' }} />
                        </button>
                        <button className="btn btn-ghost btn-icon btn-sm"><Edit size={15} style={{ color: 'var(--info)' }} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="flex items-center gap-3">
                <div className="icon-box rounded-xl" style={{ background: 'var(--accent-light)', color: 'var(--accent)', width: 40, height: 40 }}><Users size={20} /></div>
                <div><div className="font-bold" style={{ color: 'var(--text-primary)' }}>Add Teacher</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Create a new teacher account</div></div>
              </div>
              <button className="btn btn-ghost btn-icon" onClick={() => setModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body space-y-4">
                <div><label className="form-label">Full Name</label>
                  <input className="form-input" required value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="Dr. John Smith" /></div>
                <div><label className="form-label">Teacher ID / Regd No</label>
                  <input className="form-input" required value={form.regdNo}
                    onChange={e => setForm({ ...form, regdNo: e.target.value })}
                    placeholder="TCH2024001" /></div>
                {form.regdNo && (
                  <div className="text-xs p-3 rounded-xl" style={{ background: 'var(--bg)', color: 'var(--text-muted)' }}>
                    <strong style={{ color: 'var(--text-primary)' }}>Auto-generated credentials:</strong><br />
                    Email: <code>{form.regdNo}@edu.ppd</code> &nbsp;·&nbsp; Password: <code>{form.regdNo}</code>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <Loader2 size={14} className="animate-spin" /> : 'Create Teacher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
