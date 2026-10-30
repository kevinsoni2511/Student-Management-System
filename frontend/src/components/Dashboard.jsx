import React from 'react';

/**
 * Dashboard Component
 * Displays system overview metrics, statistics cards, and quick navigation shortcuts
 */
export default function Dashboard({ setActiveTab, onOpenAddStudent }) {
  // Statistics cards data (Initial demo stats before API integration in Phase 6/10)
  const stats = [
    {
      title: 'Total Students',
      value: '248',
      change: '+12% from last month',
      color: '#2563eb',
      bgColor: '#eff6ff',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      )
    },
    {
      title: 'Active Students',
      value: '215',
      change: '86.7% active rate',
      color: '#10b981',
      bgColor: '#ecfdf5',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      )
    },
    {
      title: 'Total Courses',
      value: '8',
      change: 'Full-time & Part-time',
      color: '#8b5cf6',
      bgColor: '#f5f3ff',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      )
    },
    {
      title: 'New Admissions',
      value: '34',
      change: 'Current academic cycle',
      color: '#f59e0b',
      bgColor: '#fffbeb',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      )
    }
  ];

  return (
    <div style={styles.container}>
      {/* Welcome Banner */}
      <div style={styles.welcomeBanner}>
        <div>
          <h2 style={styles.bannerTitle}>Welcome to EduPulse Admin Panel 👋</h2>
          <p style={styles.bannerText}>
            You have full administrative privileges to manage student admissions, courses, and attendance records.
          </p>
        </div>
        <button onClick={onOpenAddStudent} className="btn" style={styles.bannerBtn}>
          + Register New Student
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div style={styles.statsGrid}>
        {stats.map((stat, index) => (
          <div key={index} className="card" style={styles.statCard}>
            <div style={styles.statHeader}>
              <span style={styles.statTitle}>{stat.title}</span>
              <div style={{ ...styles.statIconBox, backgroundColor: stat.bgColor }}>
                {stat.icon}
              </div>
            </div>
            <div style={styles.statBody}>
              <h3 style={styles.statValue}>{stat.value}</h3>
              <p style={{ ...styles.statChange, color: stat.color }}>{stat.change}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions & System Info Section */}
      <div style={styles.twoColumnGrid}>
        {/* Quick Navigation Cards */}
        <div className="card" style={styles.sectionCard}>
          <h3 style={styles.cardHeading}>Quick Management Actions</h3>
          <p style={styles.cardSub}>Direct access to frequently used administrative tasks</p>

          <div style={styles.actionList}>
            <button
              onClick={() => setActiveTab('students')}
              style={styles.actionItem}
            >
              <div style={{ ...styles.actionIcon, background: '#eff6ff', color: '#2563eb' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                </svg>
              </div>
              <div style={styles.actionText}>
                <h4>Browse Student Directory</h4>
                <p>View, search, edit, or filter registered students</p>
              </div>
              <span style={styles.arrowIcon}>&rarr;</span>
            </button>

            <button
              onClick={() => setActiveTab('courses')}
              style={styles.actionItem}
            >
              <div style={{ ...styles.actionIcon, background: '#f5f3ff', color: '#8b5cf6' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
              </div>
              <div style={styles.actionText}>
                <h4>Academic Courses</h4>
                <p>Add new courses or update tuition fees and duration</p>
              </div>
              <span style={styles.arrowIcon}>&rarr;</span>
            </button>

            <button
              onClick={() => setActiveTab('attendance')}
              style={styles.actionItem}
            >
              <div style={{ ...styles.actionIcon, background: '#ecfdf5', color: '#10b981' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                </svg>
              </div>
              <div style={styles.actionText}>
                <h4>Daily Attendance Register</h4>
                <p>Mark attendance for classes and review attendance percentage</p>
              </div>
              <span style={styles.arrowIcon}>&rarr;</span>
            </button>
          </div>
        </div>

        {/* Database & Architecture Summary Card */}
        <div className="card" style={styles.sectionCard}>
          <h3 style={styles.cardHeading}>Full-Stack Architecture Status</h3>
          <p style={styles.cardSub}>Current live connection details</p>

          <div style={styles.infoBoxList}>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Frontend Layer</span>
              <span style={styles.infoValue}>React 19 + Vite (Port 5173)</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Backend API</span>
              <span style={styles.infoValue}>Core PHP 8.2 (REST JSON)</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Database Storage</span>
              <span style={styles.infoValue}>MySQL InnoDB (student_management)</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Communication</span>
              <span style={styles.infoValue}>Fetch API with JSON Payloads</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  welcomeBanner: {
    background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
    color: '#ffffff',
    padding: '24px 30px',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '16px',
    boxShadow: '0 10px 20px -5px rgba(37, 99, 235, 0.3)'
  },
  bannerTitle: {
    fontSize: '20px',
    fontWeight: '700',
    margin: 0,
    lineHeight: 1.3
  },
  bannerText: {
    fontSize: '14px',
    color: '#bfdbfe',
    margin: '6px 0 0 0',
    maxWidth: '550px'
  },
  bannerBtn: {
    backgroundColor: '#ffffff',
    color: '#1e3a8a',
    fontWeight: '600',
    padding: '10px 20px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '20px'
  },
  statCard: {
    padding: '20px'
  },
  statHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '12px'
  },
  statTitle: {
    fontSize: '13px',
    color: '#64748b',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  statIconBox: {
    width: '44px',
    height: '44px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  statBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  statValue: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#0f172a',
    margin: 0
  },
  statChange: {
    fontSize: '12px',
    fontWeight: '600',
    margin: 0
  },
  twoColumnGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
    gap: '24px'
  },
  sectionCard: {
    padding: '24px'
  },
  cardHeading: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#0f172a',
    margin: 0
  },
  cardSub: {
    fontSize: '13px',
    color: '#64748b',
    margin: '4px 0 18px 0'
  },
  actionList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  actionItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '12px 14px',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    backgroundColor: '#ffffff',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.15s ease'
  },
  actionIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  actionText: {
    flex: 1
  },
  arrowIcon: {
    fontSize: '18px',
    color: '#94a3b8'
  },
  infoBoxList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '12px 14px',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    border: '1px solid #e2e8f0'
  },
  infoLabel: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#475569'
  },
  infoValue: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#2563eb'
  }
};
