import React from 'react';

/**
 * Header Component
 * Top bar displaying current page title, date, quick action button, and admin profile
 */
export default function Header({ activeTab, onOpenAddStudent }) {
  const getPageInfo = () => {
    switch (activeTab) {
      case 'dashboard':
        return { title: 'Dashboard Overview', subtitle: 'Real-time performance and system statistics' };
      case 'students':
        return { title: 'Student Directory', subtitle: 'Manage student records, admissions, and profiles' };
      case 'courses':
        return { title: 'Academic Courses', subtitle: 'Manage institute courses, duration, and fee structures' };
      case 'attendance':
        return { title: 'Attendance Register', subtitle: 'Track student daily attendance and calculate percentages' };
      default:
        return { title: 'Student Management System', subtitle: 'Institute Administration Portal' };
    }
  };

  const pageInfo = getPageInfo();
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <header style={styles.header}>
      {/* Title & Subtitle */}
      <div>
        <h1 style={styles.title}>{pageInfo.title}</h1>
        <p style={styles.subtitle}>{pageInfo.subtitle}</p>
      </div>

      {/* Right Controls: Date, Quick Add, Profile */}
      <div style={styles.rightActions}>
        {/* Date Display */}
        <div style={styles.dateBox}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span>{currentDate}</span>
        </div>

        {/* Quick Add Student Button */}
        <button
          onClick={onOpenAddStudent}
          className="btn btn-primary"
          style={styles.addBtn}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>Add Student</span>
        </button>

        {/* Admin Profile Avatar */}
        <div style={styles.profileBox}>
          <div style={styles.avatar}>
            <span>A</span>
          </div>
          <div style={styles.profileMeta}>
            <span style={styles.adminName}>Admin User</span>
            <span style={styles.adminRole}>Administrator</span>
          </div>
        </div>
      </div>
    </header>
  );
}

const styles = {
  header: {
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    padding: '18px 32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '20px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)'
  },
  title: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: '-0.3px',
    margin: 0
  },
  subtitle: {
    fontSize: '13px',
    color: '#64748b',
    marginTop: '3px',
    margin: 0
  },
  rightActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  dateBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    color: '#64748b',
    backgroundColor: '#f8fafc',
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    fontWeight: 500
  },
  addBtn: {
    padding: '8px 16px',
    fontSize: '13px',
    fontWeight: 600
  },
  profileBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    paddingLeft: '12px',
    borderLeft: '1px solid #e2e8f0'
  },
  avatar: {
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '15px'
  },
  profileMeta: {
    display: 'flex',
    flexDirection: 'column'
  },
  adminName: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#0f172a',
    lineHeight: 1.2
  },
  adminRole: {
    fontSize: '11px',
    color: '#10b981',
    fontWeight: '600'
  }
};
