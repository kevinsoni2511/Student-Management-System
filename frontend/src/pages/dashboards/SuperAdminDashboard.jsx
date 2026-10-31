import React, { useState, useEffect } from 'react';
import { superAdminApi } from '../../services/api';

export default function SuperAdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSchool, setNewSchool] = useState({
    name: '',
    code: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    admin_name: '',
    admin_email: '',
    admin_password: 'admin' + Math.floor(100 + Math.random() * 900)
  });
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await superAdminApi.getOverview();
      setData(res);
      setError(null);
    } catch (err) {
      setError(err?.data?.message || err.message || 'Failed to load Super Admin metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateSchool = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await superAdminApi.createSchool(newSchool);
      setSuccessMsg(`School Tenant "${newSchool.name}" registered successfully.`);
      setShowAddModal(false);
      setNewSchool({
        name: '', code: '', email: '', phone: '', address: '', city: '', state: '',
        admin_name: '', admin_email: '', admin_password: 'admin' + Math.floor(100 + Math.random() * 900)
      });
      loadData();
    } catch (err) {
      alert(err?.data?.message || err.message || 'Failed to create school');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="loading-state"><div className="spinner" /> Loading Super Admin Platform...</div>;
  }

  const stats = data?.statistics || {};
  const schools = data?.recent_schools || [];

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <span style={styles.tag}>SUPER ADMIN CONSOLE</span>
          <h1 style={styles.title}>Multi-Tenant System Overview</h1>
          <p style={styles.subtitle}>Enterprise Platform Oversight, School Tenants & Central Cloud Infrastructure</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn btn-primary" style={styles.actionBtn}>
          + Register New School Tenant
        </button>
      </div>

      {successMsg && (
        <div style={styles.successAlert}>
          <span>✓ {successMsg}</span>
          <button onClick={() => setSuccessMsg('')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>×</button>
        </div>
      )}

      {error && <div className="alert alert-danger">{error}</div>}

      {/* KPI Cards */}
      <div style={styles.kpiGrid}>
        <div style={styles.kpiCard}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiLabel}>Total Schools</span>
            <div style={{ ...styles.kpiIcon, backgroundColor: '#f3e8ff', color: '#7e22ce' }}>🏫</div>
          </div>
          <div style={styles.kpiValue}>{stats.total_schools || 1}</div>
          <div style={styles.kpiSub}>Active Platform Tenants</div>
        </div>

        <div style={styles.kpiCard}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiLabel}>Total Enrolled Students</span>
            <div style={{ ...styles.kpiIcon, backgroundColor: '#dbeafe', color: '#2563eb' }}>👨‍🎓</div>
          </div>
          <div style={styles.kpiValue}>{stats.total_students || 0}</div>
          <div style={styles.kpiSub}>Across all active branches</div>
        </div>

        <div style={styles.kpiCard}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiLabel}>Total Faculty</span>
            <div style={{ ...styles.kpiIcon, backgroundColor: '#d1fae5', color: '#059669' }}>👨‍🏫</div>
          </div>
          <div style={styles.kpiValue}>{stats.total_teachers || 0}</div>
          <div style={styles.kpiSub}>Certified educators</div>
        </div>

        <div style={styles.kpiCard}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiLabel}>Platform Revenue</span>
            <div style={{ ...styles.kpiIcon, backgroundColor: '#fef3c7', color: '#d97706' }}>💳</div>
          </div>
          <div style={styles.kpiValue}>₹{(stats.total_platform_revenue || 0).toLocaleString()}</div>
          <div style={styles.kpiSub}>Processed transactions</div>
        </div>
      </div>

      {/* System Metrics Strip */}
      <div style={styles.systemStrip}>
        <div style={styles.stripItem}>
          <span style={styles.stripLabel}>Server Status:</span>
          <span style={styles.stripValueGreen}>● {stats.server_status || 'Operational'}</span>
        </div>
        <div style={styles.stripItem}>
          <span style={styles.stripLabel}>Subscription Tier:</span>
          <span style={styles.stripValue}>{stats.active_subscription_plan}</span>
        </div>
        <div style={styles.stripItem}>
          <span style={styles.stripLabel}>Database Engine:</span>
          <span style={styles.stripValue}>{stats.database_version}</span>
        </div>
        <div style={styles.stripItem}>
          <span style={styles.stripLabel}>Data Isolation:</span>
          <span style={styles.stripValue}>Row-Level Multi-Tenant (`school_id`)</span>
        </div>
      </div>

      {/* Schools Directory */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <h2 style={styles.cardTitle}>Managed School Institutions</h2>
          <span style={styles.badge}>{schools.length} Active Institutions</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>School Name</th>
                <th>Tenant Code</th>
                <th>Location</th>
                <th>Students</th>
                <th>Faculty</th>
                <th>Status</th>
                <th>Registered On</th>
              </tr>
            </thead>
            <tbody>
              {schools.map((school) => (
                <tr key={school.id}>
                  <td>
                    <strong>{school.name}</strong>
                  </td>
                  <td><code style={styles.codeBadge}>{school.code}</code></td>
                  <td>{school.city || 'Delhi'}</td>
                  <td>{school.students_count || 0} Students</td>
                  <td>{school.teachers_count || 0} Teachers</td>
                  <td>
                    <span style={styles.statusActive}>● {school.status}</span>
                  </td>
                  <td>{school.created_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for adding new school */}
      {showAddModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Register New School Tenant</h3>
              <button onClick={() => setShowAddModal(false)} style={styles.closeBtn}>×</button>
            </div>
            <form onSubmit={handleCreateSchool} style={styles.modalForm}>
              <div style={styles.formRow}>
                <div className="form-group" style={{ flex: 2 }}>
                  <label className="form-label">School Name *</label>
                  <input
                    type="text"
                    required
                    value={newSchool.name}
                    onChange={(e) => setNewSchool({ ...newSchool, name: e.target.value })}
                    className="form-control"
                    placeholder="e.g. St. Xavier International Academy"
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Code (Unique) *</label>
                  <input
                    type="text"
                    required
                    value={newSchool.code}
                    onChange={(e) => setNewSchool({ ...newSchool, code: e.target.value })}
                    className="form-control"
                    placeholder="e.g. SXIA-01"
                  />
                </div>
              </div>

              <div style={styles.formRow}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Official Email *</label>
                  <input
                    type="email"
                    required
                    value={newSchool.email}
                    onChange={(e) => setNewSchool({ ...newSchool, email: e.target.value })}
                    className="form-control"
                    placeholder="info@stxavier.edu"
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Phone Contact *</label>
                  <input
                    type="text"
                    required
                    value={newSchool.phone}
                    onChange={(e) => setNewSchool({ ...newSchool, phone: e.target.value })}
                    className="form-control"
                    placeholder="+91 98111 00000"
                  />
                </div>
              </div>

              <div style={styles.formRow}>
                <div className="form-group" style={{ flex: 2 }}>
                  <label className="form-label">Campus Address *</label>
                  <input
                    type="text"
                    required
                    value={newSchool.address}
                    onChange={(e) => setNewSchool({ ...newSchool, address: e.target.value })}
                    className="form-control"
                    placeholder="Plot 10, Knowledge Park III"
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">City *</label>
                  <input
                    type="text"
                    required
                    value={newSchool.city}
                    onChange={(e) => setNewSchool({ ...newSchool, city: e.target.value })}
                    className="form-control"
                    placeholder="Greater Noida"
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">State *</label>
                  <input
                    type="text"
                    required
                    value={newSchool.state}
                    onChange={(e) => setNewSchool({ ...newSchool, state: e.target.value })}
                    className="form-control"
                    placeholder="Uttar Pradesh"
                  />
                </div>
              </div>

              <div style={styles.sectionDivider}>
                <span>Initial School Administrator Credentials</span>
              </div>

              <div style={styles.formRow}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Admin Name *</label>
                  <input
                    type="text"
                    required
                    value={newSchool.admin_name}
                    onChange={(e) => setNewSchool({ ...newSchool, admin_name: e.target.value })}
                    className="form-control"
                    placeholder="Fr. Thomas D'Souza"
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Admin Email *</label>
                  <input
                    type="email"
                    required
                    value={newSchool.admin_email}
                    onChange={(e) => setNewSchool({ ...newSchool, admin_email: e.target.value })}
                    className="form-control"
                    placeholder="admin.xavier@example.com"
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Password *</label>
                  <input
                    type="text"
                    required
                    value={newSchool.admin_password}
                    onChange={(e) => setNewSchool({ ...newSchool, admin_password: e.target.value })}
                    className="form-control"
                  />
                </div>
              </div>

              <div style={styles.modalActions}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? 'Creating Tenant...' : 'Deploy School Tenant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: '16px'
  },
  tag: {
    display: 'inline-block',
    fontSize: '11px',
    fontWeight: '800',
    color: '#7e22ce',
    letterSpacing: '1px',
    marginBottom: '4px'
  },
  title: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#0f172a',
    margin: 0
  },
  subtitle: {
    fontSize: '14px',
    color: '#64748b',
    marginTop: '4px'
  },
  actionBtn: {
    padding: '10px 18px',
    fontSize: '14px',
    fontWeight: '600'
  },
  successAlert: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 18px',
    backgroundColor: '#ecfdf5',
    border: '1px solid #a7f3d0',
    borderRadius: '10px',
    color: '#065f46',
    fontSize: '14px'
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '18px'
  },
  kpiCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
    border: '1px solid #e2e8f0'
  },
  kpiHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px'
  },
  kpiLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#64748b'
  },
  kpiIcon: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '15px'
  },
  kpiValue: {
    fontSize: '26px',
    fontWeight: '800',
    color: '#0f172a'
  },
  kpiSub: {
    fontSize: '12px',
    color: '#94a3b8',
    marginTop: '4px'
  },
  systemStrip: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '24px',
    padding: '14px 20px',
    backgroundColor: '#0f172a',
    borderRadius: '10px',
    color: '#ffffff'
  },
  stripItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px'
  },
  stripLabel: {
    color: '#94a3b8'
  },
  stripValue: {
    fontWeight: '600',
    color: '#e2e8f0'
  },
  stripValueGreen: {
    fontWeight: '600',
    color: '#4ade80'
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
    overflow: 'hidden'
  },
  cardHeader: {
    padding: '18px 24px',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#0f172a',
    margin: 0
  },
  badge: {
    fontSize: '12px',
    padding: '4px 10px',
    backgroundColor: '#f1f5f9',
    borderRadius: '20px',
    color: '#475569',
    fontWeight: '600'
  },
  codeBadge: {
    padding: '3px 8px',
    backgroundColor: '#f1f5f9',
    borderRadius: '6px',
    fontSize: '12px',
    color: '#2563eb',
    fontFamily: 'monospace'
  },
  statusActive: {
    color: '#16a34a',
    fontSize: '12px',
    fontWeight: '600'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    padding: '20px'
  },
  modal: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    maxWidth: '680px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)'
  },
  modalHeader: {
    padding: '20px 24px',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  modalTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#0f172a',
    margin: 0
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '22px',
    cursor: 'pointer',
    color: '#64748b'
  },
  modalForm: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  formRow: {
    display: 'flex',
    gap: '14px',
    flexWrap: 'wrap'
  },
  sectionDivider: {
    textAlign: 'center',
    margin: '12px 0',
    position: 'relative',
    fontSize: '12px',
    fontWeight: '700',
    color: '#2563eb',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '12px'
  }
};
