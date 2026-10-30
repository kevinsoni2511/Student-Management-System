import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.password_confirmation) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    try {
      setLoading(true);
      await register(formData);
      navigate('/dashboard');
    } catch (err) {
      const msg = err?.data?.message || (err?.data?.errors ? Object.values(err.data.errors).flat().join(' ') : null) || err.message;
      setError(msg || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.brandIcon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <line x1="19" y1="8" x2="19" y2="14" />
              <line x1="22" y1="11" x2="16" y2="11" />
            </svg>
          </div>
          <h2 style={styles.title}>Create Admin Account</h2>
          <p style={styles.subtitle}>Register as an authorized institute administrator</p>
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
            <label className="form-label">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Dr. Rajesh Kumar"
              className="form-control"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="admin@institute.edu"
              className="form-control"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Minimum 6 characters"
              className="form-control"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input
              type="password"
              name="password_confirmation"
              value={formData.password_confirmation}
              onChange={handleChange}
              placeholder="Re-enter password"
              className="form-control"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', fontSize: '15px' }}
          >
            {loading ? 'Registering Account...' : 'Complete Registration'}
          </button>
        </form>

        <div style={styles.footer}>
          <span>Already registered as administrator? </span>
          <Link to="/login" style={styles.link}>Sign In</Link>
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
    maxWidth: '460px',
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
