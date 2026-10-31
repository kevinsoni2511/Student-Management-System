import React from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to sign out of the School ERP system?')) {
      await logout();
      navigate('/login');
    }
  };

  const navLinks = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="9" />
          <rect x="14" y="3" width="7" height="5" />
          <rect x="14" y="12" width="7" height="9" />
          <rect x="3" y="16" width="7" height="5" />
        </svg>
      )
    },
    {
      to: '/academics',
      label: 'Academics',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      )
    },
    {
      to: '/students',
      label: 'Students & Admissions',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      )
    },
    {
      to: '/teachers',
      label: 'Faculty & Teachers',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      )
    },
    {
      to: '/attendance',
      label: 'Attendance Sheet',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
          <path d="m9 16 2 2 4-4" />
        </svg>
      )
    },
    {
      to: '/fees',
      label: 'Fee Collection & Dues',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <line x1="2" y1="10" x2="22" y2="10" />
        </svg>
      )
    },
    {
      to: '/examinations',
      label: 'Examinations & Marks',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 11 12 14 22 4" />
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
      )
    },
    {
      to: '/announcements',
      label: 'Noticeboard & Circulars',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
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

  const schoolName = user?.school?.name || user?.school?.school_name || 'Greenwood High School';

  return (
    <div className="app-layout" style={styles.layout}>
      {/* Sidebar Navigation */}
      <aside style={styles.sidebar}>
        <div style={styles.brand}>
          <div style={styles.logoIcon}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
          </div>
          <div style={{ overflow: 'hidden' }}>
            <h2 style={styles.brandTitle}>EduERP Pro</h2>
            <span style={styles.brandSubtitle}>School Management System</span>
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
                <span style={{ fontWeight: isActive ? 600 : 500, fontSize: '13.5px' }}>{link.label}</span>
                {isActive && <div style={styles.activeBar} />}
              </NavLink>
            );
          })}
        </nav>

        <div style={styles.sidebarFooter}>
          <div style={styles.userCard}>
            <div style={styles.userAvatar}>
              {(user?.name || 'A')[0].toUpperCase()}
            </div>
            <div style={styles.userInfo}>
              <span style={styles.userName}>{user?.name || 'Administrator'}</span>
              <span style={styles.userRoleBadge}>{user?.role ? user.role.toUpperCase() : 'ADMIN'}</span>
            </div>
          </div>
          <button onClick={handleLogout} style={styles.logoutBtn} title="Sign Out">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="main-wrapper" style={styles.mainWrapper}>
        <header style={styles.navbar}>
          <div style={styles.navTitleBox}>
            <div style={styles.schoolBadge}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                <path d="M3 21h18" />
                <path d="M5 21V7l8-4 8 4v14" />
              </svg>
              <span style={styles.schoolNameText}>{schoolName}</span>
            </div>
            <span style={styles.portalTag}>Academic Year 2026-2027</span>
          </div>

          <div style={styles.navRight}>
            <div style={styles.dateBadge}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
              </svg>
              <span>{currentDate}</span>
            </div>

            <div style={styles.liveBadge}>
              <span style={styles.liveDot} />
              <span>ERP Live Server</span>
            </div>
          </div>
        </header>

        <main className="content-area" style={styles.contentArea}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

const styles = {
  layout: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
  },
  sidebar: {
    width: '260px',
    backgroundColor: '#0f172a',
    color: '#f8fafc',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    borderRight: '1px solid #1e293b',
    padding: '20px 14px',
    height: '100vh',
    position: 'sticky',
    top: 0
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '0 8px 18px 8px',
    borderBottom: '1px solid #1e293b',
    marginBottom: '16px'
  },
  logoIcon: {
    width: '38px',
    height: '38px',
    borderRadius: '8px',
    background: 'linear-gradient(135deg, #2563eb 0%, #38bdf8 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 10px rgba(37, 99, 235, 0.3)',
    flexShrink: 0
  },
  brandTitle: {
    fontSize: '17px',
    fontWeight: '700',
    color: '#ffffff',
    lineHeight: 1.2
  },
  brandSubtitle: {
    fontSize: '11px',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
    fontWeight: '600'
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    flex: 1,
    overflowY: 'auto'
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 12px',
    borderRadius: '8px',
    color: '#94a3b8',
    textDecoration: 'none',
    position: 'relative',
    transition: 'all 0.15s ease'
  },
  navItemActive: {
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    color: '#ffffff'
  },
  activeBar: {
    position: 'absolute',
    right: 0,
    width: '3px',
    height: '18px',
    backgroundColor: '#38bdf8',
    borderRadius: '4px'
  },
  sidebarFooter: {
    paddingTop: '14px',
    borderTop: '1px solid #1e293b',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  userCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 10px',
    backgroundColor: '#1e293b',
    borderRadius: '8px'
  },
  userAvatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '13px',
    flexShrink: 0
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  userName: {
    fontSize: '12.5px',
    fontWeight: '600',
    color: '#f8fafc',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden'
  },
  userRoleBadge: {
    fontSize: '10px',
    color: '#38bdf8',
    fontWeight: '700',
    letterSpacing: '0.5px'
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    width: '100%',
    padding: '8px',
    backgroundColor: 'transparent',
    border: '1px solid #334155',
    color: '#f87171',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '12.5px',
    fontWeight: '600',
    transition: 'all 0.15s ease'
  },
  mainWrapper: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    overflowX: 'hidden'
  },
  navbar: {
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    padding: '14px 28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
    position: 'sticky',
    top: 0,
    zIndex: 10
  },
  navTitleBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap'
  },
  schoolBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontWeight: '700',
    fontSize: '14px',
    color: '#0f172a'
  },
  schoolNameText: {
    color: '#0f172a'
  },
  portalTag: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#2563eb',
    backgroundColor: '#eff6ff',
    padding: '3px 8px',
    borderRadius: '6px',
    border: '1px solid #bfdbfe'
  },
  navRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  dateBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12.5px',
    color: '#64748b',
    backgroundColor: '#f8fafc',
    padding: '5px 10px',
    borderRadius: '6px',
    border: '1px solid #e2e8f0',
    fontWeight: 500
  },
  liveBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '11.5px',
    fontWeight: '600',
    color: '#059669',
    backgroundColor: '#ecfdf5',
    padding: '5px 10px',
    borderRadius: '6px',
    border: '1px solid #a7f3d0'
  },
  liveDot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    backgroundColor: '#10b981'
  },
  contentArea: {
    padding: '24px 28px',
    flex: 1
  }
};
