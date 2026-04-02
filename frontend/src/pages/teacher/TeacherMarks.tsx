import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/Card';
import { Search, Loader2, Edit, Trash2, CheckCircle2 } from 'lucide-react';
import api from '../../api/axios';

// Interfaces based on backend models
interface Student {
  _id: string;
  user_id: { _id: string; name: string; email: string };
  batch_id: string;
  semester: number;
}

interface Mark {
  _id: string;
  student_id: Student;
  assignment_id: string;
  mid: number;
  quiz: number;
  assignment: number;
  attendance: number;
  total: number;
  grade: string;
}

export const TeacherMarks: React.FC = () => {
  const [marks, setMarks] = useState<Mark[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock fetching marks for a specific given assignment
  // For UI testing, we will mock API if it fails, or show what we get.
  useEffect(() => {
    // In a real flow, the teacher selects an assignment first. 
    // Here we'll try to fetch any marks they are associated with (would need a specific route, or we mock)
    // We'll use mock data for the UI demonstration matched to the inspiration image
    setTimeout(() => {
      setMarks([
        { _id: '1', student_id: { _id: 's1', user_id: { _id: 'u1', name: 'Eleanor Pena', email: 'e@p.com' }, batch_id: 'b1', semester: 1 }, assignment_id: 'a1', mid: 50, quiz: 10, assignment: 12, attendance: 8, total: 80, grade: 'E' },
        { _id: '2', student_id: { _id: 's2', user_id: { _id: 'u2', name: 'Jessia Rose', email: 'j@r.com' }, batch_id: 'b1', semester: 1 }, assignment_id: 'a1', mid: 58, quiz: 14, assignment: 15, attendance: 10, total: 97, grade: 'O' },
        { _id: '3', student_id: { _id: 's3', user_id: { _id: 'u3', name: 'Jenny Wilson', email: 'j@w.com' }, batch_id: 'b1', semester: 1 }, assignment_id: 'a1', mid: 40, quiz: 12, assignment: 10, attendance: 7, total: 69, grade: 'B' },
        { _id: '4', student_id: { _id: 's4', user_id: { _id: 'u4', name: 'Guy Hawkins', email: 'g@h.com' }, batch_id: 'b1', semester: 1 }, assignment_id: 'a1', mid: 25, quiz: 5, assignment: 8, attendance: 4, total: 42, grade: 'D' },
        { _id: '5', student_id: { _id: 's5', user_id: { _id: 'u5', name: 'Jacob Jones', email: 'j@j.com' }, batch_id: 'b1', semester: 1 }, assignment_id: 'a1', mid: 30, quiz: 8, assignment: 9, attendance: 6, total: 53, grade: 'C' },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Student Marks List</h1>
          <p className="text-sm text-slate-500 mt-1">Home / Teacher / Marks</p>
        </div>
        <button className="bg-primary hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm shadow-primary/20 flex items-center">
          <span className="mr-2 text-lg leading-none">+</span> Enter Mark
        </button>
      </div>

      <Card className="shadow-sm border-0 border-t-2 border-t-primary rounded-t-xl overflow-hidden mt-6">
        <div className="flex justify-between items-center p-6 border-b border-border">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Students Information</h3>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search by name..."
                className="pl-4 pr-10 py-1.5 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary w-64"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>
            <select className="bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-primary text-slate-600 dark:text-slate-300">
              <option>Object Oriented Prog</option>
              <option>Database Management</option>
            </select>
          </div>
        </div>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 dark:bg-slate-800/50 border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-medium flex items-center">
                    <input type="checkbox" className="rounded border-slate-300 text-primary focus:ring-primary mr-3" />
                    STUDENT NAME
                  </th>
                  <th className="px-6 py-4 font-medium">MID (60)</th>
                  <th className="px-6 py-4 font-medium">QUIZ (15)</th>
                  <th className="px-6 py-4 font-medium">ASSG (15)</th>
                  <th className="px-6 py-4 font-medium">ATTN (10)</th>
                  <th className="px-6 py-4 font-medium">TOTAL / GRADE</th>
                  <th className="px-6 py-4 font-medium">ACTION</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-slate-500">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                    </td>
                  </tr>
                ) : marks.map((mark, idx) => (
                  <tr key={mark._id} className="table-row-hover border-b border-slate-100 dark:border-slate-800/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <input type="checkbox" className="rounded border-slate-300 text-primary focus:ring-primary mr-3" defaultChecked={idx === 1} />
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center mr-3">
                          {mark.student_id.user_id.name.charAt(0)}
                        </div>
                        <div className="font-medium text-slate-900 dark:text-slate-100">
                          {mark.student_id.user_id.name}
                        </div>
                      </div>
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
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3 text-slate-400">
                        <button className="hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                        <button className="hover:text-blue-500 transition-colors"><Edit className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-center py-4 space-x-1 border-t border-border">
            <button className="w-8 h-8 flex items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">&lt;</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-md bg-primary text-white font-medium shadow-sm">1</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800">2</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800">3</button>
            <span className="px-2 text-slate-400">...</span>
            <button className="w-8 h-8 flex items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800">10</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">&gt;</button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
