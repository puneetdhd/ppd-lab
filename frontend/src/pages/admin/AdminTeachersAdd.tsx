import React, { useState, useRef } from 'react';
import api from '../../api/axios';
import {
  Upload, FileSpreadsheet, CheckCircle2, AlertCircle,
  Loader2, Download, Trash2, Users
} from 'lucide-react';

interface CsvRow {
  name: string;
  regdNo: string;
}

interface ResultRow {
  name: string;
  email: string;
  status: string;
}

export const AdminTeachersAdd: React.FC = () => {
  const [rows, setRows] = useState<CsvRow[]>([]);
  const [fileName, setFileName] = useState('');
  const [results, setResults] = useState<ResultRow[] | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    setResults(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      setError('Please upload a .csv file');
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split(/\r?\n/).filter(l => l.trim());

      const first = lines[0]?.toLowerCase() || '';
      const startIdx = (first.includes('name') || first.includes('reg') || first.includes('id')) ? 1 : 0;

      const parsed: CsvRow[] = [];
      for (let i = startIdx; i < lines.length; i++) {
        const cols = lines[i].split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
        if (cols.length >= 2 && (cols[0] || cols[1])) {
          // Support both column orders:
          //   Col1=Name, Col2=TeacherID  (original)
          //   Col1=TeacherID, Col2=Name  (if col1 looks like an ID: no spaces, shorter)
          let name   = cols[0];
          let regdNo = cols[1];
          // Heuristic: if col2 has no spaces and col1 has spaces, likely Name,ID format
          // If neither has spaces, default to col1=name, col2=regdNo
          // If col1 looks like an ID code (no spaces, all caps/digits), swap
          const col1LooksLikeId = /^[A-Za-z0-9_-]+$/.test(cols[0]) && !/\s/.test(cols[0]) && cols[0].length < 20;
          const col2LooksLikeName = /\s/.test(cols[1]) || /^[A-Z][a-z]/.test(cols[1]);
          if (col1LooksLikeId && col2LooksLikeName && cols[1].trim()) {
            // Swap: col1=ID, col2=Name
            regdNo = cols[0];
            name   = cols[1];
          }
          if (name && regdNo) {
            parsed.push({ name, regdNo });
          }
        }
      }

      if (parsed.length === 0) {
        setError('No valid rows found. CSV should have Name in column 1 and Teacher ID in column 2.');
        return;
      }

      setRows(parsed);
    };
    reader.readAsText(file);
  };

  const handleUpload = async () => {
    if (rows.length === 0) { setError('No rows to upload'); return; }

    setUploading(true);
    setError('');
    try {
      const res = await api.post('/teachers/bulk', { rows });
      setResults(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Bulk upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setRows([]);
    setFileName('');
    setResults(null);
    setError('');
    if (fileRef.current) fileRef.current.value = '';
  };

  const downloadSample = () => {
    const csv = [
      'Teacher ID,Name',
      'TCH2024001,Dr. Priya Sharma',
      'TCH2024002,Mr. Rahul Verma',
      'TCH2024003,Ms. Anjali Singh',
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_teachers.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const createdCount = results?.filter(r => r.status === 'Created').length || 0;
  const skippedCount = results ? results.length - createdCount : 0;

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Add Teachers (CSV Upload)</h1>
          <div className="page-breadcrumb">Home / Teachers / <span>Add Teachers</span></div>
        </div>
        <button className="btn btn-outline" onClick={downloadSample}>
          <Download size={16} /> Download Sample CSV
        </button>
      </div>

      {/* Instructions */}
      <div className="card p-6">
        <div className="flex items-start gap-4">
          <div className="icon-box rounded-xl shrink-0"
            style={{ background: 'var(--accent-light)', color: 'var(--accent)', width: 44, height: 44 }}>
            <FileSpreadsheet size={22} />
          </div>
          <div className="flex-1">
            <div className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>CSV Format</div>
            <div className="text-sm leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>
              Upload a <code style={{ background: 'var(--bg)', padding: '2px 6px', borderRadius: 4, fontSize: 12 }}>.csv</code> file.
              Supported column orders:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Format 1 */}
              <div className="rounded-xl p-3 text-sm" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
                <div className="font-semibold mb-1" style={{ color: 'var(--text-primary)', fontSize: 12 }}>Format A</div>
                <code style={{ fontSize: 12, color: 'var(--accent)' }}>Teacher ID, Name</code>
                <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>TCH2024001, Dr. Priya Sharma</div>
              </div>
              {/* Format 2 */}
              <div className="rounded-xl p-3 text-sm" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
                <div className="font-semibold mb-1" style={{ color: 'var(--text-primary)', fontSize: 12 }}>Format B</div>
                <code style={{ fontSize: 12, color: 'var(--accent)' }}>Name, Teacher ID</code>
                <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Dr. Priya Sharma, TCH2024001</div>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-4 text-sm">
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Email generated as: </span>
                <code style={{ background: 'var(--accent-light)', color: 'var(--accent)', padding: '2px 8px', borderRadius: 4, fontSize: 12 }}>
                  TeacherID@edu.ppd
                </code>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Password set to: </span>
                <code style={{ background: 'var(--accent-light)', color: 'var(--accent)', padding: '2px 8px', borderRadius: 4, fontSize: 12 }}>
                  TeacherID
                </code>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* File Upload */}
      <div className="card p-6 space-y-5">
        {/* Drop Zone */}
        <div>
          <label className="form-label">Upload CSV File</label>
          <label
            className="flex flex-col items-center justify-center gap-3 rounded-xl py-10 px-6 cursor-pointer transition-all"
            style={{
              border: '2px dashed var(--border)',
              background: rows.length > 0 ? 'var(--success-light)' : 'var(--bg)',
              color: rows.length > 0 ? 'var(--success)' : 'var(--text-muted)',
            }}
            onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
            onDrop={e => {
              e.preventDefault();
              const file = e.dataTransfer.files?.[0];
              if (file && fileRef.current) {
                const dt = new DataTransfer();
                dt.items.add(file);
                fileRef.current.files = dt.files;
                fileRef.current.dispatchEvent(new Event('change', { bubbles: true }));
              }
            }}
          >
            {rows.length > 0 ? <CheckCircle2 size={32} /> : <Upload size={32} />}
            <div className="text-sm font-medium">
              {rows.length > 0
                ? `${fileName} — ${rows.length} teacher${rows.length !== 1 ? 's' : ''} parsed`
                : 'Click to browse or drag & drop a CSV file'
              }
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl text-sm"
            style={{ background: 'var(--danger-light)', color: 'var(--danger)' }}>
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {/* Preview Table */}
        {rows.length > 0 && !results && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                Preview ({rows.length} teachers)
              </div>
              <button className="btn btn-ghost btn-sm text-xs" onClick={handleReset} style={{ color: 'var(--danger)' }}>
                <Trash2 size={14} /> Clear
              </button>
            </div>
            <div className="overflow-x-auto" style={{ maxHeight: 320 }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Teacher ID</th>
                    <th>Email (auto-generated)</th>
                    <th>Password</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, 50).map((r, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td className="font-medium" style={{ color: 'var(--text-primary)' }}>{r.name}</td>
                      <td><code style={{ fontSize: 12 }}>{r.regdNo}</code></td>
                      <td>
                        <span className="badge badge-accent" style={{ fontSize: 11, fontWeight: 500 }}>
                          {r.regdNo}@edu.ppd
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-muted" style={{ fontSize: 11 }}>
                          {r.regdNo}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {rows.length > 50 && (
                    <tr>
                      <td colSpan={5} className="text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                        … and {rows.length - 50} more
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {rows.length > 0 && !results && (
          <div className="flex items-center gap-3 pt-2">
            <button
              className="btn btn-primary"
              onClick={handleUpload}
              disabled={uploading}
            >
              {uploading ? <Loader2 size={16} className="animate-spin" /> : <Users size={16} />}
              {uploading ? 'Creating teachers…' : `Upload ${rows.length} Teachers`}
            </button>
            <button className="btn btn-outline" onClick={handleReset}>Cancel</button>
          </div>
        )}
      </div>

      {/* Results */}
      {results && (
        <div className="card p-6 space-y-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>Upload Results</div>
            <span className="badge badge-success">{createdCount} Created</span>
            {skippedCount > 0 && <span className="badge badge-warning">{skippedCount} Skipped/Failed</span>}
          </div>

          <div className="overflow-x-auto" style={{ maxHeight: 400 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td className="font-medium" style={{ color: 'var(--text-primary)' }}>{r.name}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{r.email}</td>
                    <td>
                      <span
                        className={`badge ${r.status === 'Created' ? 'badge-success' : 'badge-warning'}`}
                        style={{ fontSize: 11 }}
                      >
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button className="btn btn-primary" onClick={handleReset}>
            <Upload size={16} /> Upload Another Batch
          </button>
        </div>
      )}
    </div>
  );
};
