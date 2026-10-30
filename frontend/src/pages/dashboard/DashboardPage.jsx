import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardApi } from '../../services/api';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [recentStudents, setRecentStudents] = useState([]);
  const [attendanceSummary, setAttendanceSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, studentsRes, attRes] = await Promise.all([
        dashboardApi.getStats(),
        dashboardApi.getRecentStudents(),
        dashboardApi.getAttendanceSummary()
      ]);

      setStats(statsRes?.data || statsRes);
      setRecentStudents(studentsRes?.data || []);
      setAttendanceSummary(attRes?.data || attRes);
    } catch (err) {
      setError(err.message || 'Failed to fetch real-time dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div style={styles.loadingWrap}>
        <div style={styles.spinner} />
        <p style={{ color: '#64748b', fontSize: '14px', marginTop: '12px' }}>
          Loading real-time database statistics from Laravel API...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card" style={{ padding: '36px', textAlign: 'center' }}>
        <div style={{ color: '#ef4444', fontSize: '40px' }}>⚠️</div>
        <h3 style={{ fontSize: '18px', fontWeight: '700', marginTop: '12px' }}>Dashboard API Connection</h3>
        <p style={{ color: '#64748b', maxWidth: '500px', margin: '8px auto 20px auto', fontSize: '14px' }}>
          {error}
        </p>
        <button onClick={fetchDashboardData} className="btn btn-primary">
          Retry Connecting
        </button>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Students',
      value: stats?.total_students ?? 0,
      sub: `${stats?.active_students ?? 0} currently active`,
      color: '#2563eb',
      bgColor: '#eff6ff',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      )
    },
    {
      title: 'Active Students',
      value: stats?.active_students ?? 0,
      sub: 'Enrolled in active batches',
      color: '#10b981',
      bgColor: '#ecfdf5',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      )
    },
    {
      title: 'Total Courses',
      value: stats?.total_courses ?? 0,
      sub: 'Approved academic offerings',
      color: '#8b5cf6',
      bgColor: '#f5f3ff',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2.2">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      )
    },
    {
      title: 'New Admissions',
      value: stats?.new_admissions ?? 0,
      sub: 'Enrolled in last 30 days',
      color: '#f59e0b',
      bgColor: '#fffbeb',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      )
    },
    {
      title: 'Graduated Students',
      value: stats?.graduated_students ?? 0,
      sub: 'Alumni records archived',
      color: '#06b6d4',
      bgColor: '#ecfeff',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2.2">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
          <path d="M6 12v5c3 3 9 3 12 0v-5" />
        </svg>
      )
    },
    {
      title: 'Inactive Students',
      value: stats?.inactive_students ?? 0,
      sub: 'On leave or suspended',
      color: '#ef4444',
      bgColor: '#fef2f2',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.2">
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Welcome Banner */}
      <div style={styles.banner}>
        <div>
          <h2 style={styles.bannerHeading}>Institute Management Overview</h2>
          <p style={styles.bannerSubtitle}>
            Live operational statistics backed by Laravel 12 Sanctum and MySQL database.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link to="/students" className="btn" style={styles.bannerBtnPrimary}>
            Manage Students
          </Link>
          <Link to="/attendance" className="btn" style={styles.bannerBtnSecondary}>
            Daily Attendance
          </Link>
        </div>
      </div>

      {/* Dynamic Metric Cards Grid */}
      <div style={styles.grid}>
        {statCards.map((card, idx) => (
          <div key={idx} className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={styles.cardTitle}>{card.title}</span>
              <div style={{ ...styles.cardIconBox, backgroundColor: card.bgColor }}>
                {card.icon}
              </div>
            </div>
            <div style={{ marginTop: '10px' }}>
              <h3 style={styles.cardValue}>{card.value}</h3>
              <p style={{ ...styles.cardSub, color: card.color }}>{card.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Two Column Section: Recent Admissions + Attendance Summary */}
      <div style={styles.twoCol}>
        {/* Recent Admissions Table */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0 }}>Recent Student Admissions</h3>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0 0' }}>Latest enrollments in system</p>
            </div>
            <Link to="/students" style={{ fontSize: '13px', color: '#2563eb', fontWeight: '600', textDecoration: 'none' }}>
              View All &rarr;
            </Link>
          </div>

          {recentStudents.length === 0 ? (
            <p style={{ fontSize: '13px', color: '#94a3b8', textAlign: 'center', padding: '24px' }}>
              No student admissions recorded yet.
            </p>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Name</th>
                    <th>Course</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentStudents.map((st) => (
                    <tr key={st.id}>
                      <td style={{ fontSize: '12px', fontWeight: '600', color: '#2563eb' }}>{st.student_code}</td>
                      <td style={{ fontWeight: '600' }}>{st.full_name}</td>
                      <td>{st.course?.course_name || 'N/A'}</td>
                      <td>
                        <span className={`badge badge-${(st.status || 'Active').toLowerCase()}`}>
                          {st.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Attendance Summary */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0 }}>Attendance Health</h3>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0 0' }}>Overall student attendance records</p>
            </div>
            <Link to="/attendance" style={{ fontSize: '13px', color: '#2563eb', fontWeight: '600', textDecoration: 'none' }}>
              Take Attendance &rarr;
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={styles.metricRow}>
              <div>
                <span style={{ fontSize: '13px', color: '#64748b' }}>Overall Attendance Rate</span>
                <h4 style={{ fontSize: '24px', fontWeight: '800', color: '#10b981', margin: '2px 0 0 0' }}>
                  {attendanceSummary?.attendance_percentage ?? '100'}%
                </h4>
              </div>
              <div style={styles.progressBarBg}>
                <div
                  style={{
                    ...styles.progressBarFill,
                    width: `${Math.min(100, Math.max(0, attendanceSummary?.attendance_percentage ?? 100))}%`
                  }}
                />
              </div>
            </div>

            <div style={styles.attGrid}>
              <div style={styles.attBox}>
                <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>Total Entries</span>
                <strong style={{ fontSize: '18px', color: '#0f172a' }}>{attendanceSummary?.total_records ?? 0}</strong>
              </div>
              <div style={styles.attBox}>
                <span style={{ fontSize: '11px', color: '#10b981', textTransform: 'uppercase', fontWeight: '700' }}>Present</span>
                <strong style={{ fontSize: '18px', color: '#10b981' }}>{attendanceSummary?.present_count ?? 0}</strong>
              </div>
              <div style={styles.attBox}>
                <span style={{ fontSize: '11px', color: '#ef4444', textTransform: 'uppercase', fontWeight: '700' }}>Absent</span>
                <strong style={{ fontSize: '18px', color: '#ef4444' }}>{attendanceSummary?.absent_count ?? 0}</strong>
              </div>
              <div style={styles.attBox}>
                <span style={{ fontSize: '11px', color: '#f59e0b', textTransform: 'uppercase', fontWeight: '700' }}>Late</span>
                <strong style={{ fontSize: '18px', color: '#f59e0b' }}>{attendanceSummary?.late_count ?? 0}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  loadingWrap: {
    height: '60vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  spinner: {
    width: '38px',
    height: '38px',
    border: '3px solid #e2e8f0',
    borderTopColor: '#2563eb',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite'
  },
  banner: {
    background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
    color: '#ffffff',
    padding: '24px 28px',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '16px',
    boxShadow: '0 10px 20px -5px rgba(37, 99, 235, 0.3)'
  },
  bannerHeading: {
    fontSize: '20px',
    fontWeight: '700',
    margin: 0
  },
  bannerSubtitle: {
    fontSize: '13px',
    color: '#bfdbfe',
    marginTop: '4px',
    margin: 0
  },
  bannerBtnPrimary: {
    backgroundColor: '#ffffff',
    color: '#1e3a8a',
    fontWeight: '600',
    fontSize: '13px',
    padding: '9px 16px'
  },
  bannerBtnSecondary: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    color: '#ffffff',
    fontWeight: '600',
    fontSize: '13px',
    padding: '9px 16px',
    border: '1px solid rgba(255, 255, 255, 0.3)'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '18px'
  },
  cardTitle: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.4px'
  },
  cardIconBox: {
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  cardValue: {
    fontSize: '26px',
    fontWeight: '800',
    color: '#0f172a',
    margin: 0
  },
  cardSub: {
    fontSize: '12px',
    fontWeight: '500',
    marginTop: '4px',
    margin: 0
  },
  twoCol: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '20px'
  },
  metricRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  progressBarBg: {
    width: '100%',
    height: '10px',
    backgroundColor: '#e2e8f0',
    borderRadius: '9999px',
    overflow: 'hidden'
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: '9999px',
    transition: 'width 0.4s ease'
  },
  attGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px'
  },
  attBox: {
    padding: '12px',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  }
};
