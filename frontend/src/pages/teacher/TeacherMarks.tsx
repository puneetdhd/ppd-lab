import React, { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import api from '../../api/axios';
import { Plus, Loader2, Search, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

const GRADE_COLORS: Record<string, string> = {
  O: 'badge-success', E: 'badge-info', A: 'badge-accent',
  B: 'badge-warning', C: 'badge-warning', D: 'badge-warning',
  F: 'badge-danger',
};

const PAGE_SIZE = 10;

export const TeacherMarks: React.FC = () => {
  const { data: assignments, loading: aLoading } = useApi<any[]>('/assignments/my/assignments');
  const [selectedAssignment, setSelectedAssignment] = useState('');
  const [marks, setMarks]   = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage]     = useState(1);
  const [showModal, setModal] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [form, setForm] = useState({ student_id: '', mid: 0, quiz: 0, assignment: 0, attendance: 0 });
  const [saving, setSaving] = useState(false);

  const fetchMarks = async (assignmentId: string) => {
    setLoading(true);
    try {
      const res = await api.get(`/marks/assignment/${assignmentId}`);
      setMarks(res.data.data || []);
    } catch { setMarks([]); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (selectedAssignment) fetchMarks(selectedAssignment);
    else setMarks([]);
  }, [selectedAssignment]);

  // Load students for selected batch when opening modal
  const openModal = async () => {
    const asn = assignments?.find(a => a._id === selectedAssignment);
    if (asn?.batch_id?._id) {
      try {
        const res = await api.get(`/students/batch/${asn.batch_id._id}`);
        setStudents(res.data.data || []);
      } catch { setStudents([]); }
    }
    setModal(true);
  };

  const handleSaveMark = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      await api.post('/marks', { ...form, assignment_id: selectedAssignment });
      setModal(false);
      setForm({ student_id: '', mid: 0, quiz: 0, assignment: 0, attendance: 0 });
      fetchMarks(selectedAssignment);
    } catch (err: any) { alert(err.response?.data?.message || 'Failed to save mark'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this mark?')) return;
    try { await api.delete(`/marks/${id}`); fetchMarks(selectedAssignment); }
    catch { alert('Failed.'); }
  };

  const filtered = marks.filter(m =>
    m.student_id?.user_id?.name?.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Student Marks List</h1>
          <div className="page-breadcrumb">Home / Teacher / <span>Marks</span></div>
        </div>
        {selectedAssignment && (
          <button className="btn btn-primary" onClick={openModal} disabled={!selectedAssignment}>
            <Plus size={16} /> Enter Mark
          </button>
        )}
      </div>

      {/* Assignment picker */}
      <div className="card p-5">
        <label className="form-label">Select Assignment / Subject</label>
        {aLoading ? (
          <div className="flex items-center gap-2 mt-1" style={{ color: 'var(--text-muted)' }}><Loader2 size={16} className="animate-spin" /> Loading assignments…</div>
        ) : (
          <select
            className="form-input"
            style={{ maxWidth: 480 }}
            value={selectedAssignment}
            onChange={e => { setSelectedAssignment(e.target.value); setPage(1); }}
          >
            <option value="">-- Select an assignment --</option>
            {(assignments || []).map((a: any) => (
              <option key={a._id} value={a._id}>
                {a.subject_id?.subject_name} — {a.batch_id?.branch_id?.branch_name} (Sem {a.semester})
              </option>
            ))}
          </select>
        )}
      </div>

      {selectedAssignment && (
        <div className="card">
          <div className="flex items-center justify-between px-6 py-4 gap-4 flex-wrap"
            style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>Students Information</div>
            <div className="flex items-center gap-3">
              <div className="search-box">
                <Search className="search-icon" size={16} />
                <input className="form-input" style={{ paddingLeft: 34, width: 220 }} placeholder="Search by name"
                  value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-16"><Loader2 size={28} className="animate-spin" style={{ color: 'var(--accent)' }} /></div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th><input type="checkbox" className="rounded" /></th>
                    <th>Students Name</th>
                    <th>Mid (60)</th><th>Quiz (15)</th><th>Assg (15)</th><th>Attn (10)</th>
                    <th>Total / Grade</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.length === 0 && (
                    <tr><td colSpan={8} className="text-center py-12" style={{ color: 'var(--text-muted)' }}>No marks entered yet. Click "Enter Mark" to add.</td></tr>
                  )}
                  {paged.map((m: any) => (
                    <tr key={m._id}>
                      <td><input type="checkbox" className="rounded" /></td>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="avatar avatar-sm text-xs">{m.student_id?.user_id?.name?.charAt(0) || 'S'}</div>
                          <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{m.student_id?.user_id?.name || '—'}</span>
                        </div>
                      </td>
                      <td>{m.mid}</td><td>{m.quiz}</td><td>{m.assignment}</td><td>{m.attendance}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{m.total}</span>
                          <span className={`badge ${GRADE_COLORS[m.grade] || 'badge-muted'}`}>{m.grade}</span>
                        </div>
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <button className="btn btn-ghost btn-icon btn-sm" onClick={() => handleDelete(m._id)}><Trash2 size={15} style={{ color: 'var(--danger)' }} /></button>
                          <button className="btn btn-ghost btn-icon btn-sm"><Edit size={15} style={{ color: 'var(--info)' }} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="flex items-center justify-between px-6 py-4" style={{ borderTop: '1px solid var(--border)' }}>
            <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {filtered.length} record{filtered.length !== 1 ? 's' : ''}
            </div>
            <div className="flex items-center gap-1">
              <button className="page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}><ChevronLeft size={16} /></button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(n => (
                <button key={n} className={`page-btn ${page === n ? 'active' : ''}`} onClick={() => setPage(n)}>{n}</button>
              ))}
              <button className="page-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}><ChevronRight size={16} /></button>
            </div>
          </div>
        </div>
      )}

      {/* Enter mark modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="font-bold" style={{ color: 'var(--text-primary)' }}>Enter Student Mark</div>
              <button className="btn btn-ghost btn-icon" onClick={() => setModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSaveMark}>
              <div className="modal-body space-y-4">
                <div><label className="form-label">Student</label>
                  <select className="form-input" required value={form.student_id} onChange={e => setForm({ ...form, student_id: e.target.value })}>
                    <option value="">Select student</option>
                    {students.map((s: any) => <option key={s._id} value={s._id}>{s.user_id?.name}</option>)}
                  </select></div>
                <div className="grid grid-cols-2 gap-4">
                  {([['mid', 60], ['quiz', 15], ['assignment', 15], ['attendance', 10]] as [keyof typeof form, number][]).map(([field, max]) => (
                    <div key={field}><label className="form-label capitalize">{field} (max {max})</label>
                      <input type="number" min={0} max={max} className="form-input" required value={form[field]} onChange={e => setForm({ ...form, [field]: Number(e.target.value) })} /></div>
                  ))}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? <Loader2 size={14} className="animate-spin" /> : 'Save Mark'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
