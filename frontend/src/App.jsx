import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import RoleRoute from './components/RoleRoute';
import RoleBasedLayout from './layouts/RoleBasedLayout';
import { getDashboardPath } from './utils/roleRoutes';

// Public Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Role-Specific Dashboards
import SuperAdminDashboard from './pages/dashboards/SuperAdminDashboard';
import SchoolAdminDashboard from './pages/dashboards/SchoolAdminDashboard';
import PrincipalDashboard from './pages/dashboards/PrincipalDashboard';
import TeacherDashboard from './pages/dashboards/TeacherDashboard';
import AccountantDashboard from './pages/dashboards/AccountantDashboard';
import ReceptionistDashboard from './pages/dashboards/ReceptionistDashboard';
import LibrarianDashboard from './pages/dashboards/LibrarianDashboard';
import TransportDashboard from './pages/dashboards/TransportDashboard';
import ParentDashboard from './pages/dashboards/ParentDashboard';
import StudentDashboard from './pages/dashboards/StudentDashboard';

// Module Pages
import AcademicsPage from './pages/academics/AcademicsPage';
import StudentsPage from './pages/students/StudentsPage';
import TeachersPage from './pages/teachers/TeachersPage';
import AttendancePage from './pages/attendance/AttendancePage';
import FeeCollectionPage from './pages/fees/FeeCollectionPage';
import ExamsPage from './pages/examinations/ExamsPage';
import AnnouncementsPage from './pages/announcements/AnnouncementsPage';
import RolePermissionsPage from './pages/admin/RolePermissionsPage';

/**
 * Root/Dashboard Dynamic Redirector
 */
function RoleDashboardRedirect() {
  const { user } = useAuth();
  const target = getDashboardPath(user?.role);
  return <Navigate to={target} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Role-Based ERP Environment */}
          <Route element={<ProtectedRoute />}>
            <Route element={<RoleBasedLayout />}>
              {/* Dynamic Role Dashboard Redirects */}
              <Route path="/" element={<RoleDashboardRedirect />} />
              <Route path="/dashboard" element={<RoleDashboardRedirect />} />

              {/* 1. Super Admin Panel */}
              <Route element={<RoleRoute allowedRoles={['super_admin']} />}>
                <Route path="/super-admin/dashboard" element={<SuperAdminDashboard />} />
                <Route path="/super-admin/schools" element={<SuperAdminDashboard />} />
              </Route>

              {/* 2. School Admin Panel */}
              <Route element={<RoleRoute allowedRoles={['admin', 'super_admin']} />}>
                <Route path="/admin/dashboard" element={<SchoolAdminDashboard />} />
                <Route path="/admin/permissions" element={<RolePermissionsPage />} />
              </Route>

              {/* 3. Principal Panel */}
              <Route element={<RoleRoute allowedRoles={['principal', 'admin', 'super_admin']} />}>
                <Route path="/principal/dashboard" element={<PrincipalDashboard />} />
              </Route>

              {/* 4. Teacher Panel */}
              <Route element={<RoleRoute allowedRoles={['teacher', 'admin', 'super_admin']} />}>
                <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
              </Route>

              {/* 5. Accountant Panel */}
              <Route element={<RoleRoute allowedRoles={['accountant', 'admin', 'super_admin']} />}>
                <Route path="/accountant/dashboard" element={<AccountantDashboard />} />
              </Route>

              {/* 6. Receptionist Panel */}
              <Route element={<RoleRoute allowedRoles={['receptionist', 'admin', 'super_admin']} />}>
                <Route path="/receptionist/dashboard" element={<ReceptionistDashboard />} />
              </Route>

              {/* 7. Librarian Panel */}
              <Route element={<RoleRoute allowedRoles={['librarian', 'admin', 'super_admin']} />}>
                <Route path="/librarian/dashboard" element={<LibrarianDashboard />} />
              </Route>

              {/* 8. Transport Manager Panel */}
              <Route element={<RoleRoute allowedRoles={['transport_manager', 'admin', 'super_admin']} />}>
                <Route path="/transport/dashboard" element={<TransportDashboard />} />
              </Route>

              {/* 9. Parent Portal */}
              <Route element={<RoleRoute allowedRoles={['parent', 'super_admin']} />}>
                <Route path="/parent/dashboard" element={<ParentDashboard />} />
              </Route>

              {/* 10. Student Portal */}
              <Route element={<RoleRoute allowedRoles={['student', 'super_admin']} />}>
                <Route path="/student/dashboard" element={<StudentDashboard />} />
              </Route>

              {/* Authorized Operations Modules */}
              <Route element={<RoleRoute allowedRoles={['admin', 'principal', 'super_admin']} />}>
                <Route path="/academics" element={<AcademicsPage />} />
                <Route path="/teachers" element={<TeachersPage />} />
              </Route>

              <Route element={<RoleRoute allowedRoles={['admin', 'principal', 'receptionist', 'super_admin']} />}>
                <Route path="/students" element={<StudentsPage />} />
              </Route>

              <Route element={<RoleRoute allowedRoles={['admin', 'principal', 'teacher', 'super_admin']} />}>
                <Route path="/attendance" element={<AttendancePage />} />
                <Route path="/examinations" element={<ExamsPage />} />
              </Route>

              <Route element={<RoleRoute allowedRoles={['admin', 'accountant', 'super_admin']} />}>
                <Route path="/fees" element={<FeeCollectionPage />} />
              </Route>

              {/* Shared Notices for all authenticated users */}
              <Route path="/announcements" element={<AnnouncementsPage />} />
            </Route>
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<RoleDashboardRedirect />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
