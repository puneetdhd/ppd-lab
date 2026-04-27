import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { RoleRoute } from './components/RoleRoute';
import { AppLayout } from './components/layout/AppLayout';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';

import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminBranches } from './pages/admin/AdminBranches';
import { AdminBatches } from './pages/admin/AdminBatches';
import { AdminSubjects } from './pages/admin/AdminSubjects';
import { AdminTeachers } from './pages/admin/AdminTeachers';
import { AdminStudents } from './pages/admin/AdminStudents';
import { AdminStudentsAdd } from './pages/admin/AdminStudentsAdd';
import { AdminAssignments } from './pages/admin/AdminAssignments';
import { AdminAnalytics } from './pages/admin/AdminAnalytics';
import { AdminFeedback } from './pages/admin/AdminFeedback';
import { AdminCreateAdmin } from './pages/admin/AdminCreateAdmin';
import { AdminPerformanceTeacher } from './pages/admin/AdminPerformanceTeacher';
import { AdminPerformanceBranch } from './pages/admin/AdminPerformanceBranch';
import { AdminPerformanceBatch } from './pages/admin/AdminPerformanceBatch';

import { TeacherMarks } from './pages/teacher/TeacherMarks';
import { TeacherAnalytics } from './pages/teacher/TeacherAnalytics';
import { TeacherFeedback } from './pages/teacher/TeacherFeedback';

import { StudentDashboard } from './pages/student/StudentDashboard';
import { StudentFeedback } from './pages/student/StudentFeedback';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Protected Routes Wrapper */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          {/* Admin Routes */}
          <Route element={<RoleRoute allowedRoles={['admin']} />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/branches" element={<AdminBranches />} />
            <Route path="/admin/batches" element={<AdminBatches />} />
            <Route path="/admin/subjects" element={<AdminSubjects />} />
            <Route path="/admin/teachers" element={<AdminTeachers />} />
            <Route path="/admin/students" element={<AdminStudents />} />
            <Route path="/admin/students/new" element={<AdminStudentsAdd />} />
            <Route path="/admin/assignments" element={<AdminAssignments />} />
            <Route path="/admin/analytics" element={<AdminAnalytics />} />
            <Route path="/admin/performance/teacher" element={<AdminPerformanceTeacher />} />
            <Route path="/admin/performance/branch" element={<AdminPerformanceBranch />} />
            <Route path="/admin/performance/batch" element={<AdminPerformanceBatch />} />
            <Route path="/admin/feedback" element={<AdminFeedback />} />
            <Route path="/admin/create-admin" element={<AdminCreateAdmin />} />
          </Route>

          {/* Teacher Routes */}
          <Route element={<RoleRoute allowedRoles={['teacher']} />}>
            <Route path="/teacher" element={<TeacherAnalytics />} />
            <Route path="/teacher/marks" element={<TeacherMarks />} />
            <Route path="/teacher/analytics" element={<TeacherAnalytics />} />
            <Route path="/teacher/feedback" element={<TeacherFeedback />} />
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
