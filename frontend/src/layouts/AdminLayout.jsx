import React from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to log out of the admin panel?')) {
      await logout();
      navigate('/login');
    }
  };

  const navLinks = [
    {
      to: '/dashboard',
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
      to: '/students',
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
      to: '/courses',
      label: 'Courses',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      )
    },
    {
      to: '/attendance',
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

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="app-layout">
      {/* Sidebar Navigation */}
      <aside style={styles.sidebar}>
        <div style={styles.brand}>
          <div style={styles.logoIcon}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
          </div>
          <div>
            <h2 style={styles.brandTitle}>EduPulse</h2>
            <span style={styles.brandSubtitle}>Laravel 12 + React SMS</span>
          </div>
        </div>

        <nav style={styles.nav}>
          {navLinks.map((link) => {
            const isActive = location.pathname.startsWith(link.to);
            return (
              <NavLink
                key={link.to}
                to={link.to}
                style={{
                  ...styles.navItem,
                  ...(isActive ? styles.navItemActive : {})
                }}
              >
                <span style={{ color: isActive ? '#38bdf8' : '#94a3b8' }}>{link.icon}</span>
                <span style={{ fontWeight: isActive ? 600 : 500 }}>{link.label}</span>
                {isActive && <div style={styles.activeBar} />}
              </NavLink>
            );
          })}
        </nav>

        <div style={styles.sidebarFooter}>
          <div style={styles.userCard}>
            <div style={styles.userAvatar}>
              {(user?.name || 'Admin')[0].toUpperCase()}
            </div>
            <div style={styles.userInfo}>
              <span style={styles.userName}>{user?.name || 'Administrator'}</span>
              <span style={styles.userEmail}>{user?.email || 'admin@example.com'}</span>
            </div>
          </div>
          <button onClick={handleLogout} style={styles.logoutBtn} title="Sign Out">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Layout */}
      <div className="main-wrapper">
        <header style={styles.navbar}>
          <div style={styles.navTitleBox}>
            <span style={styles.portalTag}>SaaS Administration Portal</span>
          </div>

          <div style={styles.navRight}>
            <div style={styles.dateBadge}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
              </svg>
              <span>{currentDate}</span>
            </div>

            <div style={styles.adminBadge}>
              <span style={styles.adminDot} />
              <span>Sanctum Verified</span>
            </div>
          </div>
        </header>

        <main className="content-area">
          <Outlet />
        </main>
      </div>
    </div>
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
    lineHeight: 1.2
  },
  brandSubtitle: {
    fontSize: '11px',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.6px',
    fontWeight: '600'
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    flex: 1
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 14px',
    borderRadius: '8px',
    color: '#94a3b8',
    textDecoration: 'none',
    fontSize: '14px',
    position: 'relative',
    transition: 'all 0.18s ease'
  },
  navItemActive: {
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    color: '#ffffff'
  },
  activeBar: {
    position: 'absolute',
    right: 0,
    width: '3px',
    height: '20px',
    backgroundColor: '#38bdf8',
    borderRadius: '4px'
  },
  sidebarFooter: {
    paddingTop: '16px',
    borderTop: '1px solid #1e293b',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  userCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px',
    backgroundColor: '#1e293b',
    borderRadius: '8px'
  },
  userAvatar: {
    width: '34px',
    height: '34px',
    borderRadius: '50%',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '14px'
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  userName: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#f8fafc',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden'
  },
  userEmail: {
    fontSize: '11px',
    color: '#94a3b8',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden'
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: '100%',
    padding: '9px',
    backgroundColor: 'transparent',
    border: '1px solid #334155',
    color: '#f87171',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
    transition: 'all 0.15s ease'
  },
  navbar: {
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    padding: '16px 32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)'
  },
  navTitleBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  portalTag: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#2563eb',
    backgroundColor: '#eff6ff',
    padding: '4px 10px',
    borderRadius: '9999px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  navRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  dateBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    color: '#64748b',
    backgroundColor: '#f8fafc',
    padding: '6px 12px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    fontWeight: 500
  },
  adminBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#059669',
    backgroundColor: '#ecfdf5',
    padding: '6px 12px',
    borderRadius: '8px',
    border: '1px solid #a7f3d0'
  },
  adminDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#10b981'
  }
};
