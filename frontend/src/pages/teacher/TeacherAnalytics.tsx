import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { useApi } from '../../hooks/useApi';
import { Loader2, PieChart as PieChartIcon } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

export const TeacherAnalytics: React.FC = () => {
  const { data: analysisData, loading, error } = useApi<any[]>('/analysis/teacher');

  if (loading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  if (error) {
    return <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>;
  }

  if (!analysisData || analysisData.length === 0) {
    return <div className="text-slate-500 text-center mt-10">No analytics data available. Assure marks are entered for your assignments.</div>;
  }

  // Use the first assignment's data for the detailed view, or summarize. 
  // For UI demonstration we'll just map the assignments cleanly.
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Class Analytics</h1>
        <p className="text-sm text-slate-500 mt-1">Performance breakdown for your assigned cohorts</p>
      </div>

      {analysisData.map((analysis, index) => {
        // Transform the grade record into an array for Recharts
        const gradeChartData = Object.keys(analysis.grade_distribution).map((grade) => ({
          name: grade,
          value: analysis.grade_distribution[grade]
        })).filter(d => d.value > 0);

        const COLORS = ['#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#f97316', '#eab308'];

        const bucketData = [
          { name: '>90% (Outstanding)', value: analysis.above_90, fill: '#10b981' },
          { name: '50-90% (Passing)', value: analysis.between_50_90, fill: '#3b82f6' },
          { name: '<50% (Failing)', value: analysis.failed, fill: '#ef4444' }
        ].filter(d => d.value > 0);

        return (
          <div key={index} className="space-y-6 bg-slate-50/50 dark:bg-slate-800/30 p-6 rounded-2xl border border-border">
            <div className="flex justify-between items-center bg-white dark:bg-card p-4 rounded-xl shadow-sm border border-border">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white text-primary">{analysis.subject}</h3>
                <p className="text-sm text-slate-500">{analysis.batch} • Sem {analysis.semester}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-500">Average Total</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{analysis.average_total} / 100</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center"><PieChartIcon className="w-5 h-5 mr-2 text-slate-400" /> Grade Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={gradeChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={100}
                          innerRadius={60}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {gradeChartData.map((entry, idx) => (
                            <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Buckets</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={bucketData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} allowDecimals={false} />
                        <Tooltip cursor={{fill: '#f8fafc'}} />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40}>
                           {bucketData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      })}
    </div>
  );
};
