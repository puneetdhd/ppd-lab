import React, { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { Loader2, Users } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend, Cell
} from 'recharts';

export const AdminPerformanceTeacher: React.FC = () => {
  const { data: teachers, loading: loadingTeachers } = useApi<any[]>('/teachers');
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');

  const { data: chartData, loading: loadingChart } = useApi<any[]>(
    selectedTeacherId ? `/reports/teacher-performance/${selectedTeacherId}` : null
  );

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Teacher Performance Analytics</h1>
          <div className="page-breadcrumb">Home / Performance / <span>Teacher</span></div>
        </div>
      </div>

      <div className="card p-5 sticky top-0 z-10" style={{ background: 'var(--bg)' }}>
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1 w-full relative">
            <label className="form-label flex items-center gap-2">
              <Users size={16} style={{ color: 'var(--accent)' }}/> Select Teacher
            </label>
            <select 
              className="form-input" 
              value={selectedTeacherId} 
              onChange={e => setSelectedTeacherId(e.target.value)}
            >
              <option value="">-- Choose a Faculty Member --</option>
              {!loadingTeachers && teachers?.map(t => (
                <option key={t._id} value={t._id}>
                  {t.user_id?.name} ({t.user_id?.email})
                </option>
              ))}
            </select>
            {loadingTeachers && <Loader2 size={16} className="absolute right-3 top-9 animate-spin text-gray-400" />}
          </div>
        </div>
      </div>

      {selectedTeacherId && (
        <div className="card p-6 min-h-[400px]">
          <div className="font-semibold mb-6 flex justify-between items-center" style={{ color: 'var(--text-primary)' }}>
            <span>Grade Outcomes Comparison (O/A vs F)</span>
          </div>
          
          {loadingChart ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 size={28} className="animate-spin" style={{ color: 'var(--accent)' }} />
            </div>
          ) : !chartData || chartData.length === 0 ? (
            <div className="flex items-center justify-center h-48" style={{ color: 'var(--text-muted)' }}>
              No performance data found for the selected teacher (they might not have assignments).
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={360}>
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis 
                  dataKey="batch" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: 'var(--text-muted)' }} 
                  dy={10} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: 'var(--text-muted)' }} 
                  allowDecimals={false} 
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  cursor={{ fill: 'var(--bg-hover)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                
                <Bar dataKey="beyondA" name="Scored O or A" fill="#50cd89" radius={[4, 4, 0, 0]} maxBarSize={60} />
                <Bar dataKey="belowF" name="Failed (F)" fill="#f1416c" radius={[4, 4, 0, 0]} maxBarSize={60} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      )}
    </div>
  );
};
