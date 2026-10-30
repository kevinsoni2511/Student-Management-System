import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute Component
 * Guards private admin routes. Redirects unauthenticated users to /login.
 */
export default function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={styles.loaderContainer}>
        <div style={styles.spinner} />
        <p style={styles.loaderText}>Verifying Authentication...</p>
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
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
    color: '#64748b',
    fontWeight: '500'
  }
};
