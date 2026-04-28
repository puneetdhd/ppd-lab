import React, { useState, useMemo } from 'react';
import { useApi } from '../../hooks/useApi';
import { usePaginatedApi } from '../../hooks/usePaginatedApi';
import api from '../../api/axios';
import {
  Plus, Trash2, Loader2, UserCheck, Search,
  ChevronRight, Building2, BookOpen, X, CheckCircle2
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────────── */
/*  Teacher assignment panel — shown on the right when a teacher  */
/*  is selected.                                                   */
/* ─────────────────────────────────────────────────────────────── */
interface AssignPanelProps {
  teacher: any;
  onClose: () => void;
}

const AssignPanel: React.FC<AssignPanelProps> = ({ teacher, onClose }) => {
  const { data: batches  } = useApi<any[]>('/batches');
  const { data: subjects } = useApi<any[]>('/subjects');
  const { data: allAssignments, loading: lAsn, refetch } = useApi<any[]>('/assignments');

  // Filter assignments for this teacher
  const myAssignments = useMemo(
    () => (allAssignments || []).filter((a: any) => a.teacher_id?._id === teacher._id),
    [allAssignments, teacher._id]
  );

  // Derive unique branch names
  const branches = useMemo(() => {
    if (!batches) return [];
    return [...new Set(batches.map((b: any) => b.branch_id?.branch_name).filter(Boolean))].sort() as string[];
  }, [batches]);

  // ── Form state ────────────────────────────────────────────────
  const [selBranch,  setSelBranch]  = useState('');
  const [selBatch,   setSelBatch]   = useState('');
  const [selSubject, setSelSubject] = useState('');
  const [semester,   setSemester]   = useState('1');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const filteredBatches = useMemo(() => {
    if (!batches || !selBranch) return [];
    return batches.filter((b: any) => b.branch_id?.branch_name === selBranch);
  }, [batches, selBranch]);

  const handleBranchChange = (v: string) => { setSelBranch(v); setSelBatch(''); setSelSubject(''); setMsg(null); };
  const handleBatchChange  = (v: string) => { setSelBatch(v);  setSelSubject(''); setMsg(null); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selBatch || !selSubject) { setMsg({ type: 'err', text: 'Select batch and subject.' }); return; }
    setSaving(true); setMsg(null);
    try {
      await api.post('/assignments', {
        teacher_id: teacher._id,
        subject_id: selSubject,
        batch_id: selBatch,
        semester: Number(semester),
      });
      setMsg({ type: 'ok', text: 'Assignment added!' });
      setSelBatch(''); setSelBranch(''); setSelSubject(''); setSemester('1');
      refetch();
    } catch (err: any) {
      setMsg({ type: 'err', text: err.response?.data?.message || 'Failed' });
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this assignment?')) return;
    try { await api.delete(`/assignments/${id}`); refetch(); }
    catch { alert('Failed to delete.'); }
  };

  return (
    <div className="flex flex-col h-full" style={{ minHeight: 0 }}>
      {/* Panel header */}
      <div className="flex items-center justify-between p-5 shrink-0"
        style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-3">
          <div className="avatar" style={{ width: 44, height: 44, fontSize: 18 }}>
            {teacher.user_id?.name?.charAt(0) || 'T'}
          </div>
          <div>
            <div className="font-bold" style={{ color: 'var(--text-primary)' }}>
              {teacher.user_id?.name}
            </div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {teacher.user_id?.email}
            </div>
          </div>
        </div>
        <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">

        {/* ── Add assignment form ─────────────────────────────── */}
        <div>
          <div className="font-semibold text-sm mb-3 flex items-center gap-2"
            style={{ color: 'var(--text-primary)' }}>
            <Plus size={15} style={{ color: 'var(--accent)' }} /> Add New Assignment
          </div>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              {/* Branch */}
              <div>
                <label className="form-label">Branch</label>
                <select className="form-input" value={selBranch} onChange={e => handleBranchChange(e.target.value)}>
                  <option value="">— Branch —</option>
                  {branches.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              {/* Batch */}
              <div>
                <label className="form-label">Batch</label>
                <select className="form-input" value={selBatch} onChange={e => handleBatchChange(e.target.value)}
                  disabled={!selBranch}>
                  <option value="">— Batch —</option>
                  {filteredBatches.map((b: any) => (
                    <option key={b._id} value={b._id}>
                      {b.start_year}–{b.graduation_year}
                    </option>
                  ))}
                </select>
              </div>
              {/* Semester */}
              <div>
                <label className="form-label">Semester</label>
                <select className="form-input" value={semester} onChange={e => setSemester(e.target.value)}>
                  {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>Semester {n}</option>)}
                </select>
              </div>
              {/* Subject */}
              <div>
                <label className="form-label">Subject</label>
                <select className="form-input" value={selSubject} onChange={e => setSelSubject(e.target.value)}
                  disabled={!selBatch}>
                  <option value="">— Subject —</option>
                  {(subjects || []).map((s: any) => (
                    <option key={s._id} value={s._id}>{s.subject_name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Feedback */}
            {msg && (
              <div className="mb-3 p-3 rounded-xl text-sm flex items-center gap-2"
                style={{
                  background: msg.type === 'ok' ? 'var(--success-light)' : 'var(--danger-light)',
                  color: msg.type === 'ok' ? 'var(--success)' : 'var(--danger)',
                }}>
                {msg.type === 'ok' ? <CheckCircle2 size={15} /> : null}
                {msg.text}
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-sm" disabled={saving || !selBatch || !selSubject}>
              {saving ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
              {saving ? 'Saving…' : 'Assign'}
            </button>
          </form>
        </div>

        {/* ── Current assignments ─────────────────────────────── */}
        <div>
          <div className="font-semibold text-sm mb-3 flex items-center gap-2"
            style={{ color: 'var(--text-primary)' }}>
            <Building2 size={15} style={{ color: 'var(--info)' }} />
            Current Assignments
            <span className="badge badge-muted" style={{ fontSize: 11 }}>{myAssignments.length}</span>
          </div>

          {lAsn ? (
            <div className="flex items-center gap-2 py-4" style={{ color: 'var(--text-muted)' }}>
              <Loader2 size={16} className="animate-spin" /> Loading…
            </div>
          ) : myAssignments.length === 0 ? (
            <div className="text-sm py-4 text-center" style={{ color: 'var(--text-muted)' }}>
              No assignments yet.
            </div>
          ) : (
            <div className="space-y-2">
              {myAssignments.map((a: any) => (
                <div key={a._id}
                  className="flex items-center justify-between px-4 py-3 rounded-xl"
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                      {a.subject_id?.subject_name || '—'}
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="badge badge-info" style={{ fontSize: 10 }}>
                        {a.batch_id?.branch_id?.branch_name}
                      </span>
                      <span className="badge badge-muted" style={{ fontSize: 10 }}>
                        {a.batch_id?.start_year}–{a.batch_id?.graduation_year}
                      </span>
                      <span className="badge badge-accent" style={{ fontSize: 10 }}>
                        Sem {a.semester}
                      </span>
                    </div>
                  </div>
                  <button className="btn btn-ghost btn-icon btn-sm ml-2 shrink-0"
                    onClick={() => handleDelete(a._id)}>
                    <Trash2 size={14} style={{ color: 'var(--danger)' }} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────── */
/*  Main page                                                       */
/* ─────────────────────────────────────────────────────────────── */
export const AdminAssignTeacher: React.FC = () => {
  const {
    data: teachers, total, page, totalPages,
    loading, setPage, setSearch,
  } = usePaginatedApi<any>('/teachers', 25);

  const { data: allAssignments } = useApi<any[]>('/assignments');

  const [selected, setSelected] = useState<any | null>(null);

  // Count assignments per teacher for the list
  const assignmentCount = useMemo(() => {
    const map = new Map<string, number>();
    for (const a of allAssignments || []) {
      const id = a.teacher_id?._id;
      if (id) map.set(id, (map.get(id) || 0) + 1);
    }
    return map;
  }, [allAssignments]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Assign Teachers</h1>
          <div className="page-breadcrumb">Home / <span>Assign Teachers</span></div>
        </div>
      </div>

      {/* Split layout */}
      <div className="flex gap-5" style={{ alignItems: 'flex-start' }}>

        {/* ── Left: teacher list ───────────────────────────────── */}
        <div className="card flex-shrink-0" style={{ width: 340 }}>
          <div className="px-4 py-3 flex items-center gap-3"
            style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="search-box flex-1">
              <Search className="search-icon" size={15} />
              <input className="form-input" style={{ paddingLeft: 32, fontSize: 13 }}
                placeholder="Search teachers…"
                onChange={e => { setSearch(e.target.value); setPage(1); }} />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={24} className="animate-spin" style={{ color: 'var(--accent)' }} />
            </div>
          ) : (
            <>
              <div>
                {teachers.map((t: any) => {
                  const count = assignmentCount.get(t._id) || 0;
                  const isSelected = selected?._id === t._id;
                  return (
                    <button key={t._id}
                      onClick={() => setSelected(isSelected ? null : t)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
                      style={{
                        borderBottom: '1px solid var(--border)',
                        background: isSelected ? 'var(--accent-light)' : 'transparent',
                        color: 'inherit',
                      }}>
                      <div className="avatar avatar-sm text-xs shrink-0"
                        style={isSelected ? { background: 'var(--accent)', color: '#fff' } : {}}>
                        {t.user_id?.name?.charAt(0) || 'T'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate"
                          style={{ color: isSelected ? 'var(--accent)' : 'var(--text-primary)' }}>
                          {t.user_id?.name}
                        </div>
                        <div className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                          {t.user_id?.email}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {count > 0 && (
                          <span className="badge badge-accent" style={{ fontSize: 10 }}>
                            <BookOpen size={9} /> {count}
                          </span>
                        )}
                        <ChevronRight size={14}
                          style={{ color: isSelected ? 'var(--accent)' : 'var(--text-muted)',
                            transform: isSelected ? 'rotate(90deg)' : 'none',
                            transition: 'transform .2s' }} />
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3"
                  style={{ borderTop: '1px solid var(--border)' }}>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {total} teachers
                  </span>
                  <div className="flex items-center gap-1">
                    <button className="page-btn" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>‹</button>
                    <span className="text-xs px-2" style={{ color: 'var(--text-muted)' }}>{page}/{totalPages}</span>
                    <button className="page-btn" onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}>›</button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Right: assignment panel ──────────────────────────── */}
        {selected ? (
          <div className="card flex-1" style={{ minHeight: 500, display: 'flex', flexDirection: 'column' }}>
            <AssignPanel teacher={selected} onClose={() => setSelected(null)} />
          </div>
        ) : (
          <div className="card flex-1 flex flex-col items-center justify-center py-24"
            style={{ color: 'var(--text-muted)' }}>
            <UserCheck size={48} style={{ opacity: .25, marginBottom: 12 }} />
            <div className="text-sm font-medium">Select a teacher</div>
            <div className="text-xs mt-1">to view and manage their branch/batch/subject assignments</div>
          </div>
        )}
      </div>
    </div>
  );
};
