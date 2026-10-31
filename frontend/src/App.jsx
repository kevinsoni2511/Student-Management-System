import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './layouts/AdminLayout';

// Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import DashboardPage from './pages/dashboard/DashboardPage';
import AcademicsPage from './pages/academics/AcademicsPage';
import StudentsPage from './pages/students/StudentsPage';
import TeachersPage from './pages/teachers/TeachersPage';
import AttendancePage from './pages/attendance/AttendancePage';
import FeeCollectionPage from './pages/fees/FeeCollectionPage';
import ExamsPage from './pages/examinations/ExamsPage';
import AnnouncementsPage from './pages/announcements/AnnouncementsPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected School ERP Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/academics" element={<AcademicsPage />} />
              <Route path="/students" element={<StudentsPage />} />
              <Route path="/teachers" element={<TeachersPage />} />
              <Route path="/attendance" element={<AttendancePage />} />
              <Route path="/fees" element={<FeeCollectionPage />} />
              <Route path="/examinations" element={<ExamsPage />} />
              <Route path="/announcements" element={<AnnouncementsPage />} />
            </Route>
          </Route>

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
