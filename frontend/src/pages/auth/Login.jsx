import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide both email address and password.');
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err?.data?.message || err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAdmin = () => {
    setEmail('admin@example.com');
    setPassword('admin123');
  };

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
          <h2 style={styles.title}>EduPulse Portal</h2>
          <p style={styles.subtitle}>Sign in with your Administrator credentials</p>
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
              placeholder="admin@example.com"
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
            style={{ width: '100%', padding: '12px', fontSize: '15px' }}
          >
            {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
          </button>
        </form>

        <div style={styles.demoBox} onClick={fillDemoAdmin} title="Click to auto-fill">
          <span style={styles.demoTag}>Quick Demo Login</span>
          <p style={styles.demoText}>Click to fill: <strong>admin@example.com</strong> / <strong>admin123</strong></p>
        </div>

        <div style={styles.footer}>
          <span>Need a new administrator account? </span>
          <Link to="/register" style={styles.link}>Register Here</Link>
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
    padding: '20px'
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '36px',
    maxWidth: '440px',
    width: '100%',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.45)'
  },
  header: {
    textAlign: 'center',
    marginBottom: '28px'
  },
  brandIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #2563eb 0%, #38bdf8 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 14px auto',
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
    marginTop: '6px'
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
    marginBottom: '20px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  demoBox: {
    marginTop: '20px',
    padding: '12px',
    backgroundColor: '#f8fafc',
    border: '1px dashed #cbd5e1',
    borderRadius: '8px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  demoTag: {
    display: 'inline-block',
    fontSize: '11px',
    fontWeight: '700',
    color: '#2563eb',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  demoText: {
    fontSize: '12px',
    color: '#475569',
    marginTop: '4px',
    margin: 0
  },
  footer: {
    marginTop: '24px',
    textAlign: 'center',
    fontSize: '13px',
    color: '#64748b'
  },
  link: {
    color: '#2563eb',
    fontWeight: '600',
    textDecoration: 'none'
  }
};
