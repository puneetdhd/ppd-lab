import React, { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { Loader2, Calendar } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend
} from 'recharts';

export const AdminPerformanceBatch: React.FC = () => {
  const { data: batches, loading: loadingBatches } = useApi<any[]>('/batches');
  const [selectedBatchId, setSelectedBatchId] = useState<string>('');

  const { data: chartData, loading: loadingChart } = useApi<any[]>(
    selectedBatchId ? `/reports/batch-teachers-performance/${selectedBatchId}` : null
  );

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Batch — All Teachers Performance</h1>
          <div className="page-breadcrumb">Home / Performance / <span>By Batch</span></div>
        </div>
      </div>

      <div className="card p-5 sticky top-0 z-10" style={{ background: 'var(--bg)' }}>
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1 w-full relative">
            <label className="form-label flex items-center gap-2">
              <Calendar size={16} style={{ color: 'var(--accent)' }}/> Select Batch
            </label>
            <select 
              className="form-input" 
              value={selectedBatchId} 
              onChange={e => setSelectedBatchId(e.target.value)}
            >
              <option value="">-- Choose a Batch --</option>
              {!loadingBatches && batches?.map(b => (
                <option key={b._id} value={b._id}>
                  {b.branch_id?.branch_name || 'Unknown'} — {b.start_year}–{b.graduation_year}
                </option>
              ))}
            </select>
            {loadingBatches && <Loader2 size={16} className="absolute right-3 top-9 animate-spin text-gray-400" />}
          </div>
        </div>
      </div>

      {selectedBatchId && (
        <div className="card p-6 min-h-[400px]">
          <div className="font-semibold mb-6 flex justify-between items-center" style={{ color: 'var(--text-primary)' }}>
            <span>Grade Distribution by Teacher</span>
            {chartData && chartData.length > 0 && (
              <span className="text-sm font-normal" style={{ color: 'var(--text-muted)' }}>
                {chartData.length} teacher{chartData.length !== 1 ? 's' : ''} in this batch
              </span>
            )}
          </div>
          
          {loadingChart ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 size={28} className="animate-spin" style={{ color: 'var(--accent)' }} />
            </div>
          ) : !chartData || chartData.length === 0 ? (
            <div className="flex items-center justify-center h-48" style={{ color: 'var(--text-muted)' }}>
              No performance data found for this batch (no assignments or marks entered yet).
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={Math.max(360, chartData.length * 60)}>
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis 
                  dataKey="teacher" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: 'var(--text-muted)' }} 
                  dy={10}
                  interval={0}
                  angle={chartData.length > 4 ? -30 : 0}
                  textAnchor={chartData.length > 4 ? 'end' : 'middle'}
                  height={chartData.length > 4 ? 80 : 40}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: 'var(--text-muted)' }} 
                  allowDecimals={false} 
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  cursor={false}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                
                <Bar dataKey="gradeO" name="O (90-100)" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={36} />
                <Bar dataKey="gradeA" name="A (80-89)"  fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={36} />
                <Bar dataKey="gradeB" name="B (70-79)"  fill="#8b5cf6" radius={[4, 4, 0, 0]} maxBarSize={36} />
                <Bar dataKey="gradeC" name="C (60-69)"  fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={36} />
                <Bar dataKey="gradeD" name="D (50-59)"  fill="#f97316" radius={[4, 4, 0, 0]} maxBarSize={36} />
                <Bar dataKey="gradeE" name="E (40-49)"  fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={36} />
                <Bar dataKey="gradeF" name="F (<40)"    fill="#6b7280" radius={[4, 4, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          )}

          {/* Summary Table */}
          {chartData && chartData.length > 0 && (
            <div className="mt-6 overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Teacher</th>
                    <th>Total</th>
                    <th style={{ color: '#10b981' }}>O</th>
                    <th style={{ color: '#3b82f6' }}>A</th>
                    <th style={{ color: '#8b5cf6' }}>B</th>
                    <th style={{ color: '#f59e0b' }}>C</th>
                    <th style={{ color: '#f97316' }}>D</th>
                    <th style={{ color: '#ef4444' }}>E</th>
                    <th style={{ color: '#6b7280' }}>F</th>
                  </tr>
                </thead>
                <tbody>
                  {chartData.map((row: any) => (
                    <tr key={row.teacher}>
                      <td className="font-medium" style={{ color: 'var(--text-primary)' }}>{row.teacher}</td>
                      <td>{row.totalMarksCount}</td>
                      <td>{row.gradeO}</td>
                      <td>{row.gradeA}</td>
                      <td>{row.gradeB}</td>
                      <td>{row.gradeC}</td>
                      <td>{row.gradeD}</td>
                      <td>{row.gradeE}</td>
                      <td>{row.gradeF}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
