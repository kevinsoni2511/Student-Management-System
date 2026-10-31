import React from 'react';
import { Navigate, Outlet, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDashboardPath, ROLE_LABELS } from '../utils/roleRoutes';

/**
 * RoleRoute Component
 * Restricts access strictly to authorized user roles.
 * Unauthorized attempts cannot access the panel and are redirected to their own portal.
 */
export default function RoleRoute({ allowedRoles = [] }) {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={styles.loaderContainer}>
        <div style={styles.spinner} />
        <p style={styles.loaderText}>Checking permissions...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Super admin has global system-level access
  const isSuperAdmin = user.role === 'super_admin';
  const hasAccess = allowedRoles.length === 0 || allowedRoles.includes(user.role) || isSuperAdmin;

  if (!hasAccess) {
    const userRoleLabel = ROLE_LABELS[user.role] || user.role;
    const designatedDashboard = getDashboardPath(user.role);

    return (
      <div style={styles.unauthorizedContainer}>
        <div style={styles.card}>
          <div style={styles.iconCircle}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h2 style={styles.title}>403 — Unauthorized Access</h2>
          <p style={styles.description}>
            Your role <strong>({userRoleLabel})</strong> is not authorized to access this panel or resource.
          </p>
          <div style={styles.roleBadge}>
            Current Account Role: <strong>{user.role}</strong>
          </div>
          <div style={styles.actions}>
            <Link to={designatedDashboard} className="btn btn-primary" style={styles.button}>
              Go to Your Authorized Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <Outlet />;
}

const styles = {
  loaderContainer: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    gap: '16px'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid #e2e8f0',
    borderTopColor: '#2563eb',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite'
  },
  loaderText: {
    fontSize: '14px',
    color: '#64748b'
  },
  unauthorizedContainer: {
    minHeight: '80vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px'
  },
  card: {
    maxWidth: '480px',
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '36px',
    textAlign: 'center',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
    border: '1px solid #fee2e2'
  },
  iconCircle: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    backgroundColor: '#fef2f2',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px auto'
  },
  title: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#0f172a',
    margin: '0 0 10px 0'
  },
  description: {
    fontSize: '14px',
    color: '#64748b',
    lineHeight: 1.5,
    margin: '0 0 18px 0'
  },
  roleBadge: {
    display: 'inline-block',
    padding: '6px 14px',
    backgroundColor: '#f1f5f9',
    borderRadius: '20px',
    fontSize: '12px',
    color: '#334155',
    marginBottom: '24px'
  },
  actions: {
    display: 'flex',
    justifyContent: 'center'
  },
  button: {
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: '600',
    textDecoration: 'none'
  }
};
