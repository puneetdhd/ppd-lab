import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Users, GraduationCap, Building2, BookOpen, Clock } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';

// Mock data (would fetch from API in real implementation)
const enrollmentData = [
  { name: 'Jan', students: 400 }, { name: 'Feb', students: 300 },
  { name: 'Mar', students: 500 }, { name: 'Apr', students: 280 },
  { name: 'May', students: 590 }, { name: 'Jun', students: 800 },
];

const performanceData = [
  { batch: 'IT 2024', passRate: 85 },
  { batch: 'CSE 2024', passRate: 92 },
  { batch: 'ECE 2024', passRate: 78 },
  { batch: 'IT 2023', passRate: 88 },
];

export const AdminDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Admin Analytics</h1>
          <p className="text-sm text-slate-500 mt-1">Overview of academy management</p>
        </div>
        <div className="flex items-center space-x-2 bg-white dark:bg-slate-800 border border-border px-3 py-1.5 rounded-lg text-sm font-medium">
          <Clock className="w-4 h-4 text-slate-400 mr-2" />
          <span>Spring Semester 2026</span>
        </div>
      </div>

      {/* KPI Stats Row identical to inspiration's top row cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-x-4">
              <div>
                <p className="text-sm font-medium text-slate-500">Total Students</p>
                <div className="flex items-baseline space-x-2 mt-2">
                  <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">4,890</h2>
                  <span className="text-xs font-medium text-emerald-500 flex items-center">
                    ↑ 12% <span className="text-slate-400 ml-1 font-normal">vs last month</span>
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-xl flex justify-center items-center">
                <GraduationCap className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-x-4">
              <div>
                <p className="text-sm font-medium text-slate-500">Total Teachers</p>
                <div className="flex items-baseline space-x-2 mt-2">
                  <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">142</h2>
                  <span className="text-xs font-medium text-emerald-500 flex items-center">
                    ↑ 3.4% <span className="text-slate-400 ml-1 font-normal">vs last month</span>
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex justify-center items-center">
                <Users className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-x-4">
              <div>
                <p className="text-sm font-medium text-slate-500">Active Branches</p>
                <div className="flex items-baseline space-x-2 mt-2">
                  <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">8</h2>
                </div>
              </div>
              <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 text-amber-500 rounded-xl flex justify-center items-center">
                <Building2 className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-x-4">
              <div>
                <p className="text-sm font-medium text-slate-500">Subjects</p>
                <div className="flex items-baseline space-x-2 mt-2">
                  <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">45</h2>
                </div>
              </div>
              <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 text-purple-500 rounded-xl flex justify-center items-center">
                <BookOpen className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="col-span-1 border-t-4 border-t-primary">
          <CardHeader>
            <CardTitle>Enrollment Dynamics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={enrollmentData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                  />
                  <Bar dataKey="students" fill="#7c3aed" radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Overall Pass Rates by Batch</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="batch" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                  />
                  <Line type="monotone" dataKey="passRate" stroke="#d946ef" strokeWidth={3} dot={{r: 6, fill: '#d946ef', strokeWidth: 0}} activeDot={{r: 8}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
