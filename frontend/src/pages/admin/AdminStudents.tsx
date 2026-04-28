import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { usePaginatedApi } from '../../hooks/usePaginatedApi';
import api from '../../api/axios';
import {
  Plus, Search, Trash2, GraduationCap, Loader2,
  ChevronLeft, ChevronRight, Upload, X, BookOpen,
  TrendingUp, Award, Mail
} from 'lucide-react';

const PAGE_SIZE = 20;

const GRADE_COLORS: Record<string, { bg: string; text: string }> = {
  O: { bg: '#f6fff9', text: '#50cd89' },
  E: { bg: '#f1faff', text: '#009ef7' },
  A: { bg: '#f4f0ff', text: '#7c3aed' },
  B: { bg: '#fff8dd', text: '#ffc700' },
  C: { bg: '#fff4de', text: '#fb923c' },
  D: { bg: '#fff0eb', text: '#f97316' },
  F: { bg: '#fff0f3', text: '#f1416c' },
};

interface StudentDetailModalProps {
  student: any;
  onClose: () => void;
}

/** Aug of startYear = Sem 1. Each 6 months = 1 sem. Returns all sem numbers up to and including current. */
function computeAllSems(startYear: number): number[] {
  const now   = new Date();
  const elapsed = (now.getFullYear() - startYear) * 12 + (now.getMonth() + 1 - 8);
  if (elapsed <= 0) return [1];
  const currentSem = Math.min(Math.floor(elapsed / 6) + 1, 8);
  return Array.from({ length: currentSem }, (_, i) => i + 1);
}

const StudentDetailModal: React.FC<StudentDetailModalProps> = ({ student, onClose }) => {
  const startYear   = student.batch_id?.start_year;
  const allSems     = startYear ? computeAllSems(startYear) : [student.semester || 1];
  const currentSem  = allSems[allSems.length - 1];

  const [selectedSem, setSelectedSem] = React.useState(currentSem);
  const [marks, setMarks]             = React.useState<any[]>([]);
  const [loading, setLoading]         = React.useState(true);

  React.useEffect(() => {
    setLoading(true);
    setMarks([]);
    const batchId = student.batch_id?._id || student.batch_id;

    api.get(`/assignments/batch/${batchId}/semester/${selectedSem}`)
      .then(async res => {
        const asnList = res.data.data || [];
        const results: any[] = [];
        await Promise.all(asnList.map(async (asn: any) => {
          try {
            const mRes   = await api.get(`/marks/assignment/${asn._id}`);
            const myMark = (mRes.data.data || []).find(
              (m: any) => m.student_id?._id === student._id
            );
            if (myMark) results.push({ ...myMark, _subject: asn.subject_id?.subject_name });
          } catch { /* skip */ }
        }));
        setMarks(results);
      })
      .catch(() => setMarks([]))
      .finally(() => setLoading(false));
  }, [student._id, student.batch_id, selectedSem]);

  const avgTotal = marks.length > 0
    ? marks.reduce((s, m) => s + (m.total || 0), 0) / marks.length
    : null;

  const bestGrade = marks.length > 0
    ? [...marks].sort((a, b) => (b.total || 0) - (a.total || 0))[0]?.grade || '—'
    : '—';

  const branch     = student.batch_id?.branch_id?.branch_name || '—';
  const batchLabel = student.batch_id
    ? `${student.batch_id.start_year}–${student.batch_id.graduation_year}`
    : '—';

  const isCompleted = (sem: number) => sem < currentSem;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 680 }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="flex items-center gap-4">
            <div className="avatar" style={{ width: 52, height: 52, fontSize: 22 }}>
              {student.user_id?.name?.charAt(0) || 'S'}
            </div>
            <div>
              <div className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
                {student.user_id?.name}
              </div>
              <div className="flex items-center gap-2 flex-wrap text-xs" style={{ color: 'var(--text-muted)' }}>
                <span className="flex items-center gap-1"><Mail size={11} /> {student.user_id?.email}</span>
                <span className="badge badge-info">{branch}</span>
                <span className="badge badge-muted">{batchLabel}</span>
              </div>
            </div>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="modal-body space-y-4">
          {/* ── Semester tab strip ──────────────────────────────────────── */}
          {allSems.length > 1 && (
            <div>
              <div className="text-xs font-semibold uppercase mb-2"
                style={{ color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                Select Semester
              </div>
              <div className="flex flex-wrap gap-1.5">
                {allSems.map(sem => (
                  <button
                    key={sem}
                    onClick={() => setSelectedSem(sem)}
                    className="btn btn-sm"
                    style={{
                      minWidth: 64,
                      background: selectedSem === sem ? 'var(--accent)' : 'var(--bg)',
                      color:      selectedSem === sem ? '#fff' : 'var(--text-secondary)',
                      border:     `1px solid ${selectedSem === sem ? 'var(--accent)' : 'var(--border)'}`,
                      fontWeight: selectedSem === sem ? 700 : 400,
                      fontSize:   12,
                      borderRadius: 8,
                      padding: '4px 10px',
                      cursor: 'pointer',
                    }}
                  >
                    Sem {sem}
                    {isCompleted(sem) && (
                      <span style={{
                        marginLeft: 4,
                        fontSize: 9,
                        background: selectedSem === sem ? 'rgba(255,255,255,0.25)' : 'var(--success-light)',
                        color: selectedSem === sem ? '#fff' : 'var(--success)',
                        borderRadius: 4,
                        padding: '1px 4px',
                      }}>✓</span>
                    )}
                    {sem === currentSem && (
                      <span style={{
                        marginLeft: 4,
                        fontSize: 9,
                        background: selectedSem === sem ? 'rgba(255,255,255,0.25)' : '#fff8dd',
                        color: selectedSem === sem ? '#fff' : '#ffc700',
                        borderRadius: 4,
                        padding: '1px 4px',
                      }}>now</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={24} className="animate-spin" style={{ color: 'var(--accent)' }} />
            </div>
          ) : (
            <>
              {/* KPI strip */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Subjects',  value: marks.length,                               icon: BookOpen,  color: '#009ef7', bg: '#f1faff' },
                  { label: 'Avg Score', value: avgTotal !== null ? `${avgTotal.toFixed(1)}%` : '—', icon: TrendingUp, color: '#7c3aed', bg: '#f4f0ff' },
                  { label: 'Best Grade',value: bestGrade,                                  icon: Award,     color: '#50cd89', bg: '#f6fff9' },
                ].map(stat => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.label} className="rounded-xl p-4 flex items-center gap-3"
                      style={{ background: stat.bg, border: '1px solid var(--border)' }}>
                      <div className="icon-box rounded-lg shrink-0"
                        style={{ background: `${stat.color}20`, color: stat.color, width: 36, height: 36 }}>
                        <Icon size={16} />
                      </div>
                      <div>
                        <div className="text-2xl font-extrabold" style={{ color: stat.color }}>{stat.value}</div>
                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{stat.label}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Marks table */}
              {marks.length > 0 ? (
                <div>
                  <div className="text-xs font-semibold uppercase mb-2"
                    style={{ color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                    Semester {selectedSem} Results {isCompleted(selectedSem) ? '(Completed)' : '(Ongoing)'}
                  </div>
                  <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid var(--border)' }}>
                    <table className="data-table" style={{ fontSize: 12 }}>
                      <thead>
                        <tr>
                          <th>Subject</th>
                          <th>Midsem /20</th>
                          <th>Endsem /60</th>
                          <th>Quiz /10</th>
                          <th>Assg /10</th>
                          <th>Total /100</th>
                          <th>Grade</th>
                        </tr>
                      </thead>
                      <tbody>
                        {marks.map((m: any, i) => {
                          const gc = GRADE_COLORS[m.grade] || { bg: '#f5f5f5', text: '#888' };
                          return (
                            <tr key={i}>
                              <td className="font-medium" style={{ color: 'var(--text-primary)' }}>
                                {m._subject || '—'}
                              </td>
                              <td>{m.midsem ?? '—'}</td>
                              <td>{m.endsem ?? '—'}</td>
                              <td>{m.quiz ?? '—'}</td>
                              <td>{m.assignment ?? '—'}</td>
                              <td><strong style={{ color: 'var(--text-primary)' }}>{m.total?.toFixed(1) ?? '—'}</strong></td>
                              <td>
                                <span className="font-bold px-2 py-0.5 rounded-md text-xs"
                                  style={{ background: gc.bg, color: gc.text }}>
                                  {m.grade || '—'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-sm" style={{ color: 'var(--text-muted)' }}>
                  No marks found for Semester {selectedSem}.
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export const AdminStudents: React.FC = () => {
  const navigate = useNavigate();
  const {
    data: students, total, page, totalPages,
    loading, setPage, setSearch, refetch,
  } = usePaginatedApi<any>('/students', PAGE_SIZE);

  const { data: batches } = useApi<any[]>('/batches');
  const [showModal, setModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: 'student123', batch_id: '', semester: 1 });
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState<any | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      await api.post('/students', form);
      setModal(false);
      setForm({ name: '', email: '', password: 'student123', batch_id: '', semester: 1 });
      refetch();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create student');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
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
        <div className="flex items-center gap-2">
          <button className="btn btn-outline" onClick={() => navigate('/admin/students/new')}>
            <Upload size={16} /> Add via CSV
          </button>
          <button className="btn btn-primary" onClick={() => setModal(true)}>
            <Plus size={16} /> Add Student
          </button>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between px-6 py-4 gap-4 flex-wrap"
          style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>
            Students Information
            <span className="ml-2 text-xs font-normal" style={{ color: 'var(--text-muted)' }}>
              ({total} total · click a row to view profile &amp; marks)
            </span>
          </div>
          <div className="search-box">
            <Search className="search-icon" size={16} />
            <input className="form-input" style={{ paddingLeft: 34, width: 220 }}
              placeholder="Search by name or email"
              onChange={e => { setSearch(e.target.value); setPage(1); }} />
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
                  <th>Name</th>
                  <th>Email</th>
                  <th>Branch</th>
                  <th>Batch</th>
                  <th>Semester</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {students.length === 0 && (
                  <tr><td colSpan={7} className="text-center py-12" style={{ color: 'var(--text-muted)' }}>No students found.</td></tr>
                )}
                {students.map((s: any) => (
                  <tr key={s._id}
                    onClick={() => setSelected(s)}
                    style={{ cursor: 'pointer' }}
                    className="hover:bg-accent-light transition-colors">
                    <td onClick={e => e.stopPropagation()}><input type="checkbox" className="rounded" /></td>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="avatar avatar-sm text-xs">{s.user_id?.name?.charAt(0) || 'S'}</div>
                        <div>
                          <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                            {s.user_id?.name || '—'}
                          </div>
                          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Click to view profile</div>
                        </div>
                      </div>
                    </td>
                    <td>{s.user_id?.email || '—'}</td>
                    <td>
                      <span className="badge badge-info">
                        {s.batch_id?.branch_id?.branch_name || '—'}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-muted" style={{ fontSize: 11 }}>
                        {s.batch_id?.start_year}–{s.batch_id?.graduation_year}
                      </span>
                    </td>
                    <td><span className="badge badge-accent">Sem {s.semester}</span></td>
                    <td>
                      <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                        <button className="btn btn-ghost btn-icon btn-sm" onClick={e => handleDelete(s._id, e)}>
                          <Trash2 size={15} style={{ color: 'var(--danger)' }} />
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
            Showing {Math.min((page - 1) * PAGE_SIZE + 1, total)}–{Math.min(page * PAGE_SIZE, total)} of {total}
          </div>
          <div className="flex items-center gap-1">
            <button className="page-btn" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              // Show pages around current page
              const start = Math.max(1, Math.min(page - 2, totalPages - 4));
              return start + i;
            }).map(n => (
              <button key={n} className={`page-btn ${page === n ? 'active' : ''}`} onClick={() => setPage(n)}>{n}</button>
            ))}
            {totalPages > 5 && page < totalPages - 2 && <span style={{ color: 'var(--text-muted)' }}>···</span>}
            {totalPages > 5 && page < totalPages - 2 && (
              <button className={`page-btn ${page === totalPages ? 'active' : ''}`} onClick={() => setPage(totalPages)}>
                {totalPages}
              </button>
            )}
            <button className="page-btn" onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Student detail popup */}
      {selected && <StudentDetailModal student={selected} onClose={() => setSelected(null)} />}

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
              <button className="btn btn-ghost btn-icon" onClick={() => setModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body space-y-4">
                <div><label className="form-label">Full Name</label>
                  <input className="form-input" required value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })} placeholder="John Doe" /></div>
                <div><label className="form-label">Email</label>
                  <input type="email" className="form-input" required value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })} placeholder="student@ppd.edu" /></div>
                <div><label className="form-label">Password</label>
                  <input className="form-input" required value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })} /></div>
                <div><label className="form-label">Batch</label>
                  <select className="form-input" required value={form.batch_id}
                    onChange={e => setForm({ ...form, batch_id: e.target.value })}>
                    <option value="">Select a batch</option>
                    {batches?.map((b: any) => (
                      <option key={b._id} value={b._id}>
                        {b.branch_id?.branch_name || 'Unknown'} ({b.start_year}–{b.graduation_year})
                      </option>
                    ))}
                  </select></div>
                <div><label className="form-label">Semester</label>
                  <input type="number" min={1} max={8} className="form-input" required value={form.semester}
                    onChange={e => setForm({ ...form, semester: Number(e.target.value) })} /></div>
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
