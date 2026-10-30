import React from 'react';

/**
 * Sidebar Component
 * Provides clean navigation between Dashboard, Students, Courses, and Attendance
 */
export default function Sidebar({ activeTab, setActiveTab }) {
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="9" />
          <rect x="14" y="3" width="7" height="5" />
          <rect x="14" y="12" width="7" height="9" />
          <rect x="3" y="16" width="7" height="5" />
        </svg>
      )
    },
    {
      id: 'students',
      label: 'Students',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      )
    },
    {
      id: 'courses',
      label: 'Courses',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      )
    },
    {
      id: 'attendance',
      label: 'Attendance',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
          <path d="m9 16 2 2 4-4" />
        </svg>
      )
    }
  ];

  return (
    <aside style={styles.sidebar}>
      {/* Brand Logo & Name */}
      <div style={styles.brand}>
        <div style={styles.logoIcon}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
            <path d="M6 12v5c3 3 9 3 12 0v-5" />
          </svg>
        </div>
        <div>
          <h2 style={styles.brandTitle}>EduPulse</h2>
          <span style={styles.brandSubtitle}>Student Management</span>
        </div>
      </div>

      {/* Navigation List */}
      <nav style={styles.nav}>
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                ...styles.navButton,
                ...(isActive ? styles.navButtonActive : {})
              }}
            >
              <span style={{ ...styles.iconWrap, color: isActive ? '#38bdf8' : '#94a3b8' }}>
                {item.icon}
              </span>
              <span style={{ fontWeight: isActive ? 600 : 500 }}>{item.label}</span>
              {isActive && <div style={styles.activeIndicator} />}
            </button>
          );
        })}
      </nav>

      {/* Footer / System Status */}
      <div style={styles.footer}>
        <div style={styles.statusDot} />
        <div>
          <p style={styles.statusText}>System Status: Online</p>
          <small style={styles.statusSub}>PHP 8.2 • MySQL</small>
        </div>
      </div>
    </aside>
  );
}

const styles = {
  sidebar: {
    width: '260px',
    backgroundColor: '#0f172a',
    color: '#f8fafc',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    borderRight: '1px solid #1e293b',
    padding: '24px 16px',
    height: '100vh',
    position: 'sticky',
    top: 0
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '0 8px 24px 8px',
    borderBottom: '1px solid #1e293b',
    marginBottom: '20px'
  },
  logoIcon: {
    width: '42px',
    height: '42px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #2563eb 0%, #38bdf8 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
  },
  brandTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: '-0.3px',
    lineHeight: 1.2
  },
  brandSubtitle: {
    fontSize: '11px',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    fontWeight: '600'
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    flex: 1
  },
  navButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    width: '100%',
    padding: '12px 14px',
    borderRadius: '8px',
    background: 'transparent',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    fontSize: '14px',
    position: 'relative',
    transition: 'all 0.18s ease'
  },
  navButtonActive: {
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    color: '#ffffff'
  },
  iconWrap: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  activeIndicator: {
    position: 'absolute',
    right: '0',
    width: '3px',
    height: '20px',
    backgroundColor: '#38bdf8',
    borderRadius: '4px'
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '14px',
    backgroundColor: '#1e293b',
    borderRadius: '10px',
    border: '1px solid #334155'
  },
  statusDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: '#10b981',
    boxShadow: '0 0 8px #10b981'
  },
  statusText: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#e2e8f0',
    margin: 0
  },
  statusSub: {
    fontSize: '11px',
    color: '#94a3b8'
  }
};
