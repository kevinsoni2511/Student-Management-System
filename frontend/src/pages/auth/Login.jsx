import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getDashboardPath } from '../../utils/roleRoutes';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide both email address and password.');
      return;
    }

    try {
      setLoading(true);
      const user = await login(email, password);
      navigate(getDashboardPath(user.role));
    } catch (err) {
      setError(err?.data?.message || err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (acc) => {
    setEmail(acc.email);
    setPassword(acc.pass);
    setError('');
    try {
      setLoading(true);
      const user = await login(acc.email, acc.pass);
      navigate(getDashboardPath(user.role));
    } catch (err) {
      setError(err?.data?.message || err.message || 'Quick login failed');
    } finally {
      setLoading(false);
    }
  };

  const demoAccounts = [
    { label: 'Super Admin', email: 'superadmin@example.com', pass: 'admin123', color: '#7e22ce' },
    { label: 'School Admin', email: 'admin@example.com', pass: 'admin123', color: '#2563eb' },
    { label: 'Principal', email: 'principal@example.com', pass: 'principal123', color: '#db2777' },
    { label: 'Teacher', email: 'teacher@example.com', pass: 'teacher123', color: '#059669' },
    { label: 'Accountant', email: 'accountant@example.com', pass: 'account123', color: '#16a34a' },
    { label: 'Receptionist', email: 'receptionist@example.com', pass: 'recept123', color: '#d97706' },
    { label: 'Librarian', email: 'librarian@example.com', pass: 'library123', color: '#0284c7' },
    { label: 'Transport Mgr', email: 'transport@example.com', pass: 'transport123', color: '#ea580c' },
    { label: 'Parent', email: 'parent@example.com', pass: 'parent123', color: '#4f46e5' },
    { label: 'Student', email: 'student@example.com', pass: 'student123', color: '#0d9488' },
  ];

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.brandIcon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
          </div>
          <h2 style={styles.title}>EduPulse ERP Portal</h2>
          <p style={styles.subtitle}>Unified Role-Based Authentication Gateway</p>
        </div>

        {error && (
          <div style={styles.errorBox}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="form-control"
              autoComplete="username"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="form-control"
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', fontSize: '15px', fontWeight: '700' }}
          >
            {loading ? 'Authenticating...' : 'Sign In to Portal'}
          </button>
        </form>

        {/* 10 Roles Quick Demo Switcher */}
        <div style={styles.demoSection}>
          <div style={styles.demoHeading}>Instant 1-Click Role Direct Logins:</div>
          <div style={styles.rolesGrid}>
            {demoAccounts.map((acc) => (
              <button
                key={acc.email}
                type="button"
                disabled={loading}
                onClick={() => handleQuickLogin(acc)}
                style={{
                  ...styles.roleChip,
                  borderColor: email === acc.email ? acc.color : '#cbd5e1',
                  backgroundColor: email === acc.email ? '#f1f5f9' : '#ffffff'
                }}
                title={`Click to login directly as ${acc.label}`}
              >
                <span style={{ ...styles.chipDot, backgroundColor: acc.color }} />
                <span>{acc.label}</span>
              </button>
            ))}
          </div>
          <p style={styles.demoHelp}>Click any role above to instantly authenticate into its dedicated panel.</p>
        </div>

        <div style={styles.footer}>
          <span>Delhi Public Global Academy • ERP Cloud v2.5</span>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f172a',
    padding: '24px'
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '32px',
    maxWidth: '520px',
    width: '100%',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.45)'
  },
  header: {
    textAlign: 'center',
    marginBottom: '24px'
  },
  brandIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #2563eb 0%, #38bdf8 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 12px auto',
    boxShadow: '0 8px 16px rgba(37, 99, 235, 0.3)'
  },
  title: {
    fontSize: '22px',
    fontWeight: '800',
    color: '#0f172a',
    margin: 0
  },
  subtitle: {
    fontSize: '13px',
    color: '#64748b',
    marginTop: '4px'
  },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 14px',
    backgroundColor: '#fef2f2',
    border: '1px solid #fee2e2',
    borderRadius: '8px',
    color: '#b91c1c',
    fontSize: '13px',
    marginBottom: '18px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  demoSection: {
    marginTop: '22px',
    padding: '14px',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '10px'
  },
  demoHeading: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: '0.6px',
    marginBottom: '10px'
  },
  rolesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
    gap: '6px'
  },
  roleChip: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '7px 10px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '11px',
    fontWeight: '600',
    color: '#334155',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.15s ease'
  },
  chipDot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    flexShrink: 0
  },
  demoHelp: {
    fontSize: '11px',
    color: '#94a3b8',
    marginTop: '8px',
    marginBottom: 0,
    textAlign: 'center'
  },
  footer: {
    marginTop: '20px',
    textAlign: 'center',
    fontSize: '12px',
    color: '#94a3b8'
  }
};
