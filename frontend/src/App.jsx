import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import StudentForm from './components/StudentForm';

/**
 * App Component
 * Root component that orchestrates layout, navigation tabs, and modal states
 */
export default function App() {
  // Navigation State ('dashboard', 'students', 'courses', 'attendance')
  const [activeTab, setActiveTab] = useState('dashboard');

  // Modal State for Adding Student
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);

  // Initial student records (in React state, before API integration in Phase 6)
  const [students, setStudents] = useState([
    {
      id: 1,
      student_code: 'STU-2026-0001',
      first_name: 'Rahul',
      last_name: 'Sharma',
      email: 'rahul.sharma@example.com',
      phone: '+91 98765 43210',
      gender: 'Male',
      course_name: 'Full Stack Web Development',
      admission_date: '2026-01-15',
      status: 'Active'
    },
    {
      id: 2,
      student_code: 'STU-2026-0002',
      first_name: 'Priya',
      last_name: 'Patel',
      email: 'priya.patel@example.com',
      phone: '+91 98123 45678',
      gender: 'Female',
      course_name: 'Data Science & AI',
      admission_date: '2026-02-10',
      status: 'Active'
    },
    {
      id: 3,
      student_code: 'STU-2026-0003',
      first_name: 'Amit',
      last_name: 'Verma',
      email: 'amit.verma@example.com',
      phone: '+91 97654 32109',
      gender: 'Male',
      course_name: 'Cyber Security Fundamentals',
      admission_date: '2025-08-20',
      status: 'Graduated'
    }
  ]);

  // Handler for adding a new student to state
  const handleSaveStudent = (newStudentData) => {
    const newStudent = {
      id: students.length + 1,
      student_code: `STU-2026-000${students.length + 1}`,
      first_name: newStudentData.first_name,
      last_name: newStudentData.last_name,
      email: newStudentData.email,
      phone: newStudentData.phone,
      gender: newStudentData.gender,
      course_name: 'Full Stack Web Development',
      admission_date: newStudentData.admission_date,
      status: newStudentData.status
    };

    // Immutably add new student to the top of list
    setStudents([newStudent, ...students]);
    setActiveTab('students'); // Switch to students tab to see the newly added student
  };

  return (
    <div className="app-layout">
      {/* 1. Left Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* 2. Main Content Area */}
      <div className="main-wrapper">
        {/* Top Header */}
        <Header
          activeTab={activeTab}
          onOpenAddStudent={() => setIsAddStudentOpen(true)}
        />

        {/* Dynamic Page Views */}
        <main className="content-area">
          {activeTab === 'dashboard' && (
            <Dashboard
              setActiveTab={setActiveTab}
              onOpenAddStudent={() => setIsAddStudentOpen(true)}
            />
          )}

          {activeTab === 'students' && (
            <div className="card">
              <div style={styles.tableHeader}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>Registered Students</h3>
                  <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>
                    Showing {students.length} students enrolled in institute
                  </p>
                </div>
                <button
                  onClick={() => setIsAddStudentOpen(true)}
                  className="btn btn-primary"
                >
                  + Add New Student
                </button>
              </div>

              <div className="table-container" style={{ marginTop: '16px' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Student Code</th>
                      <th>Full Name</th>
                      <th>Email Address</th>
                      <th>Phone</th>
                      <th>Gender</th>
                      <th>Course</th>
                      <th>Admission Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => (
                      <tr key={student.id}>
                        <td>
                          <span style={styles.codeBadge}>{student.student_code}</span>
                        </td>
                        <td style={{ fontWeight: '600' }}>
                          {student.first_name} {student.last_name}
                        </td>
                        <td>{student.email}</td>
                        <td>{student.phone}</td>
                        <td>{student.gender}</td>
                        <td>{student.course_name}</td>
                        <td>{student.admission_date}</td>
                        <td>
                          <span className={`badge badge-${student.status.toLowerCase()}`}>
                            {student.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'courses' && (
            <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={styles.placeholderIcon}>📚</div>
              <h3 style={{ fontSize: '20px', fontWeight: '700', marginTop: '12px' }}>Course Management Module</h3>
              <p style={{ color: '#64748b', maxWidth: '480px', margin: '8px auto 0 auto' }}>
                This module will be connected in Phase 8 to create, edit, and assign courses to students using MySQL foreign keys.
              </p>
            </div>
          )}

          {activeTab === 'attendance' && (
            <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={styles.placeholderIcon}>📅</div>
              <h3 style={{ fontSize: '20px', fontWeight: '700', marginTop: '12px' }}>Attendance Register Module</h3>
              <p style={{ color: '#64748b', maxWidth: '480px', margin: '8px auto 0 auto' }}>
                This module will be connected in Phase 9 for marking daily attendance (Present/Absent/Late) and calculating percentages.
              </p>
            </div>
          )}
        </main>
      </div>

      {/* 3. Reusable Student Modal Form */}
      <StudentForm
        isOpen={isAddStudentOpen}
        onClose={() => setIsAddStudentOpen(false)}
        onSaveStudent={handleSaveStudent}
      />
    </div>
  );
}

const styles = {
  tableHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '12px'
  },
  codeBadge: {
    display: 'inline-block',
    padding: '3px 8px',
    backgroundColor: '#eff6ff',
    color: '#2563eb',
    borderRadius: '6px',
    fontWeight: '600',
    fontSize: '12px',
    letterSpacing: '0.3px'
  },
  placeholderIcon: {
    fontSize: '48px',
    lineHeight: 1
  }
};
