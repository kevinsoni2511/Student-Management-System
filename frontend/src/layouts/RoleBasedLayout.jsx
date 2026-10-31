import React, { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLE_LABELS, getDashboardPath } from '../utils/roleRoutes';

export default function RoleBasedLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to sign out of the School ERP system?')) {
      await logout();
      navigate('/login');
    }
  };

  const role = user?.role || 'admin';
  const roleLabel = ROLE_LABELS[role] || 'User';

  // Role-specific navigation items
  const getNavLinks = () => {
    switch (role) {
      case 'super_admin':
        return [
          {
            to: '/super-admin/dashboard',
            label: 'Platform Overview',
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="9" /><rect x="14" y="3" width="7" height="5" /><rect x="14" y="12" width="7" height="9" /><rect x="3" y="16" width="7" height="5" />
              </svg>
            )
          },
          {
            to: '/super-admin/schools',
            label: 'School Tenants',
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 21h18" /><path d="M5 21V7l8-4 8 4v14" /><path d="M9 10h1" /><path d="M9 14h1" /><path d="M14 10h1" /><path d="M14 14h1" />
              </svg>
            )
          },
          {
            to: '/announcements',
            label: 'System Broadcasts',
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            )
          }
        ];

      case 'principal':
        return [
          {
            to: '/principal/dashboard',
            label: 'Principal Overview',
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2l9 4.9V17L12 22 3 17V6.9z" /><path d="M12 22V12" />
              </svg>
            )
          },
          {
            to: '/academics',
            label: 'Curriculum & Classes',
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            )
          },
          {
            to: '/teachers',
            label: 'Faculty & Teachers',
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
              </svg>
            )
          },
          {
            to: '/students',
            label: 'Student Directory',
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            )
          },
          {
            to: '/attendance',
            label: 'Attendance Monitor',
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /><path d="m9 16 2 2 4-4" />
              </svg>
            )
          },
          {
            to: '/examinations',
            label: 'Exam Results',
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
            )
          },
          {
            to: '/announcements',
            label: 'Announcements',
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            )
          }
        ];

      case 'teacher':
        return [
          {
            to: '/teacher/dashboard',
            label: 'Faculty Dashboard',
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="9" /><rect x="14" y="3" width="7" height="5" /><rect x="14" y="12" width="7" height="9" /><rect x="3" y="16" width="7" height="5" />
              </svg>
            )
          },
          {
            to: '/attendance',
            label: 'Mark Attendance',
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /><path d="m9 16 2 2 4-4" />
              </svg>
            )
          },
          {
            to: '/examinations',
            label: 'Enter Marks',
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
            )
          },
          {
            to: '/announcements',
            label: 'School Circulars',
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            )
          }
        ];

      case 'accountant':
        return [
          {
            to: '/accountant/dashboard',
            label: 'Accounts Dashboard',
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="9" /><rect x="14" y="3" width="7" height="5" /><rect x="14" y="12" width="7" height="9" /><rect x="3" y="16" width="7" height="5" />
              </svg>
            )
          },
          {
            to: '/fees',
            label: 'Fee Cashier & Dues',
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" /><line x1="2" y1="10" x2="22" y2="10" />
              </svg>
            )
          },
          {
            to: '/announcements',
            label: 'Staff Notices',
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            )
          }
        ];

      case 'receptionist':
        return [
          {
            to: '/receptionist/dashboard',
            label: 'Front Desk Overview',
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="9" /><rect x="14" y="3" width="7" height="5" /><rect x="14" y="12" width="7" height="9" /><rect x="3" y="16" width="7" height="5" />
              </svg>
            )
          },
          {
            to: '/announcements',
            label: 'Campus Notices',
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            )
          }
        ];

      case 'librarian':
        return [
          {
            to: '/librarian/dashboard',
            label: 'Library Dashboard',
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            )
          },
          {
            to: '/announcements',
            label: 'Notices',
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            )
          }
        ];

      case 'transport_manager':
        return [
          {
            to: '/transport/dashboard',
            label: 'Fleet & Routes',
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
              </svg>
            )
          },
          {
            to: '/announcements',
            label: 'Notices',
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            )
          }
        ];

      case 'parent':
        return [
          {
            to: '/parent/dashboard',
            label: 'My Children Portal',
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              </svg>
            )
          },
          {
            to: '/announcements',
            label: 'School Notices',
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            )
          }
        ];

      case 'student':
        return [
          {
            to: '/student/dashboard',
            label: 'Student Portal',
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" />
              </svg>
            )
          },
          {
            to: '/announcements',
            label: 'Student Circulars',
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            )
          }
        ];

      case 'admin':
      default:
        return [
          {
            to: '/admin/dashboard',
            label: 'School Dashboard',
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="9" /><rect x="14" y="3" width="7" height="5" /><rect x="14" y="12" width="7" height="9" /><rect x="3" y="16" width="7" height="5" />
              </svg>
            )
          },
          {
            to: '/academics',
            label: 'Academics Structure',
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            )
          },
          {
            to: '/students',
            label: 'Students & Admissions',
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            )
          },
          {
            to: '/teachers',
            label: 'Faculty & Teachers',
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
              </svg>
            )
          },
          {
            to: '/attendance',
            label: 'Attendance Sheet',
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /><path d="m9 16 2 2 4-4" />
              </svg>
            )
          },
          {
            to: '/fees',
            label: 'Fee Management',
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" /><line x1="2" y1="10" x2="22" y2="10" />
              </svg>
            )
          },
          {
            to: '/examinations',
            label: 'Examinations & Marks',
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
            )
          },
          {
            to: '/announcements',
            label: 'Noticeboard & Circulars',
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            )
          },
          {
            to: '/admin/permissions',
            label: 'Roles & Permissions',
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            )
          }
        ];
    }
  };

  const navLinks = getNavLinks();

  // Role Badge Color styling
  const getRoleBadgeStyle = (r) => {
    switch (r) {
      case 'super_admin': return { bg: '#581c87', color: '#f3e8ff', border: '#7e22ce' };
      case 'admin': return { bg: '#1e3a8a', color: '#dbeafe', border: '#3b82f6' };
      case 'principal': return { bg: '#831843', color: '#fce7f3', border: '#db2777' };
      case 'teacher': return { bg: '#064e3b', color: '#d1fae5', border: '#10b981' };
      case 'accountant': return { bg: '#14532d', color: '#dcfce7', border: '#22c55e' };
      case 'receptionist': return { bg: '#713f12', color: '#fef3c7', border: '#eab308' };
      case 'librarian': return { bg: '#1e293b', color: '#e2e8f0', border: '#64748b' };
      case 'transport_manager': return { bg: '#7c2d12', color: '#ffedd5', border: '#f97316' };
      case 'parent': return { bg: '#312e81', color: '#e0e7ff', border: '#6366f1' };
      case 'student': return { bg: '#0f766e', color: '#ccfbf1', border: '#14b8a6' };
      default: return { bg: '#1e293b', color: '#f1f5f9', border: '#475569' };
    }
  };

  const badgeStyle = getRoleBadgeStyle(role);

  return (
    <div style={styles.layout}>
      {/* Role-Specific Sidebar */}
      <aside style={{ ...styles.sidebar, ...(mobileMenuOpen ? styles.sidebarOpen : {}) }}>
        <div style={styles.sidebarHeader}>
          <div style={styles.brand}>
            <div style={styles.logoBadge}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
              </svg>
            </div>
            <div>
              <span style={styles.brandTitle}>EduPulse ERP</span>
              <span style={styles.brandSubtitle}>{roleLabel} Panel</span>
            </div>
          </div>
        </div>

        {/* User Identity pill */}
        <div style={styles.userProfilePill}>
          <div style={styles.userAvatar}>
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div style={styles.userInfo}>
            <div style={styles.userName}>{user?.name || 'Administrator'}</div>
            <div style={{ ...styles.roleTag, backgroundColor: badgeStyle.bg, color: badgeStyle.color, borderColor: badgeStyle.border }}>
              {roleLabel}
            </div>
          </div>
        </div>

        {/* Role Navigation */}
        <div style={styles.navSection}>
          <div style={styles.navSectionHeading}>AUTHORIZED MENU</div>
          <nav style={styles.nav}>
            {navLinks.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                style={({ isActive }) => ({
                  ...styles.navItem,
                  ...(isActive ? styles.navItemActive : {})
                })}
              >
                <span style={styles.navIcon}>{item.icon}</span>
                <span style={styles.navLabel}>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Sign Out Button in Sidebar Footer */}
        <div style={styles.sidebarFooter}>
          <button onClick={handleLogout} style={styles.logoutButton}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={styles.mainWrapper}>
        {/* Top Header */}
        <header style={styles.topbar}>
          <div style={styles.topbarLeft}>
            <button
              style={styles.mobileToggle}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              title="Toggle Menu"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <div style={styles.schoolBadge}>
              <span style={styles.schoolDot} />
              <span style={styles.schoolName}>{user?.school?.name || 'Delhi Public Global Academy'}</span>
            </div>
          </div>

          <div style={styles.topbarRight}>
            <div style={{ ...styles.topRoleBadge, backgroundColor: badgeStyle.bg, color: badgeStyle.color, border: `1px solid ${badgeStyle.border}` }}>
              Role: <strong>{roleLabel}</strong>
            </div>
            <div style={styles.userStatusPill}>
              <span style={styles.onlineStatusDot} />
              <span>{user?.email}</span>
            </div>
            <button onClick={handleLogout} style={styles.headerLogoutBtn} title="Sign Out">
              Sign Out
            </button>
          </div>
        </header>

        {/* Page Content View */}
        <main style={styles.content}>
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
    color: '#0f172a',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  },
  sidebar: {
    width: '260px',
    backgroundColor: '#0f172a',
    color: '#f8fafc',
    display: 'flex',
    flexDirection: 'column',
    position: 'sticky',
    top: 0,
    height: '100vh',
    zIndex: 50,
    transition: 'all 0.25s ease',
    borderRight: '1px solid #1e293b'
  },
  sidebarOpen: {
    position: 'fixed',
    left: 0,
    top: 0,
    bottom: 0,
    boxShadow: '10px 0 25px -5px rgba(0, 0, 0, 0.5)'
  },
  sidebarHeader: {
    padding: '20px',
    borderBottom: '1px solid #1e293b'
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  logoBadge: {
    width: '38px',
    height: '38px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #2563eb 0%, #38bdf8 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
  },
  brandTitle: {
    display: 'block',
    fontSize: '16px',
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: '-0.3px'
  },
  brandSubtitle: {
    display: 'block',
    fontSize: '11px',
    color: '#38bdf8',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  userProfilePill: {
    margin: '14px 16px',
    padding: '12px',
    backgroundColor: '#1e293b',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  userAvatar: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '14px'
  },
  userInfo: {
    flex: 1,
    overflow: 'hidden'
  },
  userName: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#ffffff',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  roleTag: {
    display: 'inline-block',
    fontSize: '10px',
    fontWeight: '700',
    padding: '2px 8px',
    borderRadius: '12px',
    marginTop: '3px',
    border: '1px solid transparent',
    letterSpacing: '0.3px'
  },
  navSection: {
    flex: 1,
    overflowY: 'auto',
    padding: '12px 14px'
  },
  navSectionHeading: {
    fontSize: '10px',
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    padding: '0 10px 8px 10px'
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 14px',
    color: '#94a3b8',
    textDecoration: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '500',
    transition: 'all 0.15s ease'
  },
  navItemActive: {
    backgroundColor: '#2563eb',
    color: '#ffffff',
    fontWeight: '600',
    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
  },
  navIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '20px'
  },
  navLabel: {
    flex: 1
  },
  sidebarFooter: {
    padding: '16px',
    borderTop: '1px solid #1e293b'
  },
  logoutButton: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '10px',
    backgroundColor: '#1e293b',
    color: '#f87171',
    border: '1px solid #334155',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  mainWrapper: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0
  },
  topbar: {
    height: '64px',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
    position: 'sticky',
    top: 0,
    zIndex: 40
  },
  topbarLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  mobileToggle: {
    display: 'none',
    background: 'none',
    border: 'none',
    color: '#0f172a',
    cursor: 'pointer'
  },
  schoolBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 12px',
    backgroundColor: '#f1f5f9',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#1e293b'
  },
  schoolDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#10b981'
  },
  schoolName: {
    letterSpacing: '-0.2px'
  },
  topbarRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px'
  },
  topRoleBadge: {
    padding: '4px 12px',
    borderRadius: '16px',
    fontSize: '12px'
  },
  userStatusPill: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    color: '#64748b'
  },
  onlineStatusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#10b981'
  },
  headerLogoutBtn: {
    padding: '6px 14px',
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    border: '1px solid #fca5a5',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  content: {
    flex: 1,
    padding: '24px',
    overflowY: 'auto'
  }
};
