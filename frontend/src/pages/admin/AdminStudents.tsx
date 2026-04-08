import React, { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import api from '../../api/axios';
import { Plus, Search, Trash2, Edit, GraduationCap, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

const PAGE_SIZE = 10;

export const AdminStudents: React.FC = () => {
  const { data, loading, refetch } = useApi<any[]>('/students');
  const { data: batches }          = useApi<any[]>('/batches');
  const [search, setSearch]   = useState('');
  const [page, setPage]       = useState(1);
  const [showModal, setModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: 'student123', batch_id: '', semester: 1 });
  const [saving, setSaving] = useState(false);

  const students = (data || []).filter(s =>
    s.user_id?.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.user_id?.email?.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(students.length / PAGE_SIZE));
  const paged = students.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/students', form);
      setModal(false);
      setForm({ name: '', email: '', password: 'student123', batch_id: '', semester: 1 });
      refetch();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create student');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this student?')) return;
    try { await api.delete(`/students/${id}`); refetch(); }
    catch { alert('Failed to delete.'); }
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Students List</h1>
          <div className="page-breadcrumb">Home / <span>Students</span></div>
        </div>
        <button className="btn btn-primary" onClick={() => setModal(true)}>
          <Plus size={16} /> Add Students
        </button>
      </div>

      <div className="card">
        <div className="flex items-center justify-between px-6 py-4 gap-4 flex-wrap"
          style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>Students Information</div>
          <div className="flex items-center gap-3">
            <div className="search-box">
              <Search className="search-icon" size={16} />
              <input
                className="form-input"
                style={{ paddingLeft: 34, width: 220 }}
                placeholder="Search by name or email"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={28} className="animate-spin" style={{ color: 'var(--accent)' }} />
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th><input type="checkbox" className="rounded" /></th>
                  <th>Students Name</th>
                  <th>Email</th>
                  <th>Batch</th>
                  <th>Semester</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {paged.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-12" style={{ color: 'var(--text-muted)' }}>No students found.</td></tr>
                )}
                {paged.map((s: any) => (
                  <tr key={s._id}>
                    <td><input type="checkbox" className="rounded" /></td>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="avatar avatar-sm text-xs">{s.user_id?.name?.charAt(0) || 'S'}</div>
                        <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                          {s.user_id?.name || '—'}
                        </span>
                      </div>
                    </td>
                    <td>{s.user_id?.email || '—'}</td>
                    <td>
                      <span className="badge badge-info">
                        {s.batch_id?.branch_id?.branch_name || s.batch_id || '—'}
                      </span>
                    </td>
                    <td><span className="badge badge-accent">Sem {s.semester}</span></td>
                    <td>
                      <div className="flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                        <button className="btn btn-ghost btn-icon btn-sm" onClick={() => handleDelete(s._id)}>
                          <Trash2 size={15} style={{ color: 'var(--danger)' }} />
                        </button>
                        <button className="btn btn-ghost btn-icon btn-sm">
                          <Edit size={15} style={{ color: 'var(--info)' }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Showing {Math.min((page - 1) * PAGE_SIZE + 1, students.length)}–{Math.min(page * PAGE_SIZE, students.length)} of {students.length}
          </div>
          <div className="flex items-center gap-1">
            <button className="page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(n => (
              <button key={n} className={`page-btn ${page === n ? 'active' : ''}`} onClick={() => setPage(n)}>{n}</button>
            ))}
            {totalPages > 5 && <span style={{ color: 'var(--text-muted)' }}>···</span>}
            {totalPages > 5 && <button className={`page-btn ${page === totalPages ? 'active' : ''}`} onClick={() => setPage(totalPages)}>{totalPages}</button>}
            <button className="page-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Add Student Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="flex items-center gap-3">
                <div className="icon-box rounded-xl" style={{ background: 'var(--accent-light)', color: 'var(--accent)', width: 40, height: 40 }}>
                  <GraduationCap size={20} />
                </div>
                <div>
                  <div className="font-bold" style={{ color: 'var(--text-primary)' }}>Add Student</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Create a new student account</div>
                </div>
              </div>
              <button className="btn btn-ghost btn-icon" onClick={() => setModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body space-y-4">
                <div>
                  <label className="form-label">Full Name</label>
                  <input className="form-input" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="John Doe" />
                </div>
                <div>
                  <label className="form-label">Email</label>
                  <input type="email" className="form-input" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="student@ppd.edu" />
                </div>
                <div>
                  <label className="form-label">Password</label>
                  <input className="form-input" required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="student123" />
                </div>
                <div>
                  <label className="form-label">Batch</label>
                  <select className="form-input" required value={form.batch_id} onChange={e => setForm({ ...form, batch_id: e.target.value })}>
                    <option value="">Select a batch</option>
                    {batches?.map((b: any) => (
                      <option key={b._id} value={b._id}>
                        {b.branch_id?.branch_name || 'Unknown'} ({b.start_year}–{b.graduation_year})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">Semester</label>
                  <input type="number" min={1} max={8} className="form-input" required value={form.semester} onChange={e => setForm({ ...form, semester: Number(e.target.value) })} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <Loader2 size={14} className="animate-spin" /> : 'Create Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
