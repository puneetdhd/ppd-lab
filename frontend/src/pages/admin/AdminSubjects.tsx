import React, { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import api from '../../api/axios';
import { Loader2, Plus, Search, Edit, Trash2 } from 'lucide-react';

export const AdminSubjects: React.FC = () => {
  const { data, loading, refetch } = useApi<any[]>('/subjects');
  const [search, setSearch] = useState('');
  const [showModal, setModal] = useState(false);
  const [form, setForm] = useState({ subject_name: '', credits: 3 });
  const [saving, setSaving] = useState(false);

  const subjects = (data || []).filter(s =>
    s.subject_name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try { await api.post('/subjects', form); setModal(false); setForm({ subject_name: '', credits: 3 }); refetch(); }
    catch (err: any) { alert(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this subject?')) return;
    try { await api.delete(`/subjects/${id}`); refetch(); }
    catch { alert('Failed.'); }
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Subjects</h1>
          <div className="page-breadcrumb">Home / <span>Subjects</span></div>
        </div>
        <button className="btn btn-primary" onClick={() => setModal(true)}><Plus size={16} />Add Subject</button>
      </div>

      <div className="card">
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>Course Subjects</div>
          <div className="search-box">
            <Search className="search-icon" size={16} />
            <input className="form-input" style={{ paddingLeft: 34, width: 220 }} placeholder="Search subjects..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16"><Loader2 size={28} className="animate-spin" style={{ color: 'var(--accent)' }} /></div>
          ) : (
            <table className="data-table">
              <thead><tr><th>Subject Name</th><th>Credits</th><th>Action</th></tr></thead>
              <tbody>
                {subjects.length === 0 && <tr><td colSpan={3} className="text-center py-12" style={{ color: 'var(--text-muted)' }}>No subjects found.</td></tr>}
                {subjects.map((s: any) => (
                  <tr key={s._id}>
                    <td><span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{s.subject_name}</span></td>
                    <td><span className="badge badge-accent">{s.credits} Credits</span></td>
                    <td>
                      <div className="flex gap-2">
                        <button className="btn btn-ghost btn-icon btn-sm" onClick={() => handleDelete(s._id)}><Trash2 size={15} style={{ color: 'var(--danger)' }} /></button>
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
              <div className="font-bold" style={{ color: 'var(--text-primary)' }}>Add Subject</div>
              <button className="btn btn-ghost btn-icon" onClick={() => setModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body space-y-4">
                <div><label className="form-label">Subject Name</label>
                  <input className="form-input" required value={form.subject_name} onChange={e => setForm({ ...form, subject_name: e.target.value })} placeholder="Object Oriented Programming" /></div>
                <div><label className="form-label">Credits</label>
                  <input type="number" min={1} max={6} className="form-input" required value={form.credits} onChange={e => setForm({ ...form, credits: Number(e.target.value) })} /></div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? <Loader2 size={14} className="animate-spin" /> : 'Save Subject'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
