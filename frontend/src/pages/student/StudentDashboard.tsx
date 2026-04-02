import React from 'react';
import { Card, CardContent } from '../../components/ui/Card';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../context/AuthContext';
import { Loader2, Award, BookOpen, Calendar } from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const { data: marksData, loading, error } = useApi<any[]>('/marks/student/me');

  if (loading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  if (error) {
    return <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>;
  }

  const marks = marksData || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Welcome, {user?.name}</h1>
          <p className="text-sm text-slate-500 mt-1">Here is the overview of your academic performance</p>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-x-4">
              <div>
                <p className="text-sm font-medium text-slate-500">Subjects Enrolled</p>
                <div className="flex items-baseline space-x-2 mt-2">
                  <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{marks.length}</h2>
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-xl flex justify-center items-center">
                <BookOpen className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-x-4">
              <div>
                <p className="text-sm font-medium text-slate-500">Overall Status</p>
                <div className="flex items-baseline space-x-2 mt-2">
                  {marks.some(m => m.grade === 'F') ? (
                    <h2 className="text-xl font-bold tracking-tight text-red-500">Needs Improvement</h2>
                  ) : marks.length > 0 ? (
                    <h2 className="text-xl font-bold tracking-tight text-emerald-500">Excellent</h2>
                  ) : (
                    <h2 className="text-xl font-bold tracking-tight text-slate-500">Pending</h2>
                  )}
                </div>
              </div>
              <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 rounded-xl flex justify-center items-center">
                <Award className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-0 border-t-2 border-t-primary rounded-t-xl overflow-hidden mt-6">
        <div className="flex justify-between items-center p-6 border-b border-border bg-card">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Academic Results</h3>
        </div>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 dark:bg-slate-800/50 border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-medium">SUBJECT</th>
                  <th className="px-6 py-4 font-medium">TEACHER</th>
                  <th className="px-6 py-4 font-medium">SEMESTER</th>
                  <th className="px-6 py-4 font-medium">MID (60)</th>
                  <th className="px-6 py-4 font-medium">QUIZ (15)</th>
                  <th className="px-6 py-4 font-medium">ASSG (15)</th>
                  <th className="px-6 py-4 font-medium">ATTN (10)</th>
                  <th className="px-6 py-4 font-medium">TOTAL / GRADE</th>
                </tr>
              </thead>
              <tbody>
                {marks.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-10 text-center text-slate-500">
                      No results published yet.
                    </td>
                  </tr>
                ) : marks.map((mark) => (
                  <tr key={mark._id} className="table-row-hover border-b border-slate-100 dark:border-slate-800/50">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">
                      {mark.assignment_id?.subject_id?.subject_name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      {mark.assignment_id?.teacher_id?.user_id?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      Semester {mark.assignment_id?.semester || '-'}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{mark.mid}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{mark.quiz}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{mark.assignment}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{mark.attendance}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold">{mark.total}</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium 
                          ${mark.grade === 'F' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                          {mark.grade}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
