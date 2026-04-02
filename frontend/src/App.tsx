import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { RoleRoute } from './components/RoleRoute';
import { AppLayout } from './components/layout/AppLayout';
import { Login } from './pages/auth/Login';

// Mock empty pages for initial routing outline
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminBranches } from './pages/admin/AdminBranches';
import { TeacherMarks } from './pages/teacher/TeacherMarks';
import { TeacherAnalytics } from './pages/teacher/TeacherAnalytics';
import { StudentDashboard } from './pages/student/StudentDashboard';
import { StudentFeedback } from './pages/student/StudentFeedback';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Protected Routes Wrapper */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          {/* Admin Routes */}
          <Route element={<RoleRoute allowedRoles={['admin']} />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/branches" element={<AdminBranches />} />
            <Route path="/admin/*" element={
              <div className="flex items-center justify-center h-64 text-slate-500">
                To be implemented. Please use Branches for now.
              </div>
            } />
          </Route>

          {/* Teacher Routes */}
          <Route element={<RoleRoute allowedRoles={['teacher']} />}>
            <Route path="/teacher" element={
              <div className="flex items-center justify-center h-64 text-slate-500">
                Welcome to Teacher Portal. Navigate to Marks or Analytics.
              </div>
            } />
            <Route path="/teacher/marks" element={<TeacherMarks />} />
            <Route path="/teacher/analytics" element={<TeacherAnalytics />} />
          </Route>

          {/* Student Routes */}
          <Route element={<RoleRoute allowedRoles={['student']} />}>
            <Route path="/student" element={<StudentDashboard />} />
            <Route path="/student/results" element={<StudentDashboard />} />
            <Route path="/student/feedback" element={<StudentFeedback />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
