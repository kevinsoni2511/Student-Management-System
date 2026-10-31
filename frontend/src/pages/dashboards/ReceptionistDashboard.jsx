import React, { useState, useEffect } from 'react';
import { receptionistPortalApi } from '../../services/api';

export default function ReceptionistDashboard() {
  const [data, setData] = useState(null);
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEnquiry, setNewEnquiry] = useState({
    student_name: '', parent_name: '', phone: '', email: '', class_seeking: 'Class 9', notes: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await receptionistPortalApi.getDashboard();
      setData(res);
      const enqRes = await receptionistPortalApi.getEnquiries();
      setEnquiries(enqRes.enquiries || []);
      setError(null);
    } catch (err) {
      setError(err?.data?.message || err.message || 'Failed to load Receptionist portal');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateEnquiry = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await receptionistPortalApi.createEnquiry(newEnquiry);
      alert('Admission Enquiry recorded successfully.');
      setShowAddModal(false);
      setNewEnquiry({ student_name: '', parent_name: '', phone: '', email: '', class_seeking: 'Class 9', notes: '' });
      loadData();
    } catch (err) {
      alert(err?.data?.message || err.message || 'Failed to create enquiry');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await receptionistPortalApi.updateEnquiryStatus(id, { status });
      setEnquiries(enquiries.map(e => e.id === id ? { ...e, status } : e));
    } catch (err) {
      alert('Failed to update enquiry status: ' + err.message);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    try {
      const res = await receptionistPortalApi.searchStudent(searchQuery);
      setSearchResults(res.students || []);
    } catch (err) {
      alert('Search failed: ' + err.message);
    }
  };

  if (loading) {
    return <div className="loading-state"><div className="spinner" /> Loading Front Desk System...</div>;
  }

  const stats = data?.statistics || {};

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <span style={styles.tag}>FRONT DESK & VISITOR MANAGEMENT</span>
          <h1 style={styles.title}>Receptionist Portal</h1>
          <p style={styles.subtitle}>Admission Enquiries, Visitor Logs, Prospective Parents & Student Directory</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn btn-primary" style={styles.actionBtn}>
          + Register New Enquiry
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* KPI Cards */}
      <div style={styles.kpiGrid}>
        <div style={styles.kpiCard}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiLabel}>Total Enquiries</span>
            <div style={{ ...styles.kpiIcon, backgroundColor: '#fef3c7', color: '#d97706' }}>📋</div>
          </div>
          <div style={styles.kpiValue}>{stats.total_enquiries || enquiries.length}</div>
          <div style={styles.kpiSub}>Registered this session</div>
        </div>

        <div style={styles.kpiCard}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiLabel}>Pending Follow-up</span>
            <div style={{ ...styles.kpiIcon, backgroundColor: '#fee2e2', color: '#b91c1c' }}>⏳</div>
          </div>
          <div style={styles.kpiValue}>{stats.pending_follow_ups || 0}</div>
          <div style={styles.kpiSub}>Awaiting counselor call</div>
        </div>

        <div style={styles.kpiCard}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiLabel}>Approved Admissions</span>
            <div style={{ ...styles.kpiIcon, backgroundColor: '#dcfce7', color: '#15803d' }}>🎉</div>
          </div>
          <div style={styles.kpiValue}>{stats.approved_admissions || 0}</div>
          <div style={styles.kpiSub}>Converted to students</div>
        </div>

        <div style={styles.kpiCard}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiLabel}>Today's Walk-ins</span>
            <div style={{ ...styles.kpiIcon, backgroundColor: '#dbeafe', color: '#2563eb' }}>👥</div>
          </div>
          <div style={styles.kpiValue}>{stats.today_enquiries || 1}</div>
          <div style={styles.kpiSub}>Visitors recorded today</div>
        </div>
      </div>

      {/* Quick Student Search Directory */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <h2 style={styles.cardTitle}>Quick Student & Guardian Directory Search</h2>
        </div>
        <div style={styles.cardBody}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student name, roll number, or parent mobile..."
              className="form-control"
              style={{ flex: 1 }}
            />
            <button type="submit" className="btn btn-primary">
              Search Directory
            </button>
          </form>

          {searchResults.length > 0 && (
            <div style={{ marginTop: '16px', overflowX: 'auto' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Admission No</th>
                    <th>Class</th>
                    <th>Parent Name</th>
                    <th>Parent Phone</th>
                    <th>Address</th>
                  </tr>
                </thead>
                <tbody>
                  {searchResults.map((s) => (
                    <tr key={s.id}>
                      <td><strong>{s.full_name}</strong></td>
                      <td>{s.admission_no}</td>
                      <td>{s.school_class?.class_name || 'Class 10'}</td>
                      <td>{s.parent_name}</td>
                      <td>{s.parent_phone || s.phone}</td>
                      <td>{s.city}, {s.state}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Admission Enquiries Ledger */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div>
            <h2 style={styles.cardTitle}>Admission Inquiries & Walk-in Leads</h2>
            <p style={styles.cardSubtitle}>Manage inquiry lifecycle from first contact to admission clearance</p>
          </div>
          <span style={styles.pill}>{enquiries.length} Enquiries</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Applicant Student</th>
                <th>Guardian</th>
                <th>Contact</th>
                <th>Grade Seeking</th>
                <th>Inquiry Date</th>
                <th>Notes / Background</th>
                <th>Status</th>
                <th>Change Status</th>
              </tr>
            </thead>
            <tbody>
              {enquiries.map((enq) => (
                <tr key={enq.id}>
                  <td><strong>{enq.student_name}</strong></td>
                  <td>{enq.parent_name}</td>
                  <td>
                    <div>{enq.phone}</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>{enq.email}</div>
                  </td>
                  <td>{enq.class_seeking}</td>
                  <td>{enq.enquiry_date}</td>
                  <td style={{ maxWidth: '240px', fontSize: '12px', color: '#475569' }}>
                    {enq.notes || 'Interested in campus visit'}
                  </td>
                  <td>
                    <span style={getStatusStyle(enq.status)}>
                      ● {enq.status}
                    </span>
                  </td>
                  <td>
                    <select
                      value={enq.status}
                      onChange={(e) => handleUpdateStatus(enq.id, e.target.value)}
                      className="form-control"
                      style={{ fontSize: '11px', padding: '4px 8px', height: 'auto' }}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Follow Up">Follow Up</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Enquiry Modal */}
      {showAddModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Record New Admission Inquiry</h3>
              <button onClick={() => setShowAddModal(false)} style={styles.closeBtn}>×</button>
            </div>
            <form onSubmit={handleCreateEnquiry} style={styles.modalForm}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Student Name *</label>
                  <input
                    type="text"
                    required
                    value={newEnquiry.student_name}
                    onChange={(e) => setNewEnquiry({ ...newEnquiry, student_name: e.target.value })}
                    className="form-control"
                    placeholder="Candidate child's name"
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Parent / Guardian Name *</label>
                  <input
                    type="text"
                    required
                    value={newEnquiry.parent_name}
                    onChange={(e) => setNewEnquiry({ ...newEnquiry, parent_name: e.target.value })}
                    className="form-control"
                    placeholder="Father / Mother name"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={newEnquiry.phone}
                    onChange={(e) => setNewEnquiry({ ...newEnquiry, phone: e.target.value })}
                    className="form-control"
                    placeholder="+91 98999 00000"
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    value={newEnquiry.email}
                    onChange={(e) => setNewEnquiry({ ...newEnquiry, email: e.target.value })}
                    className="form-control"
                    placeholder="guardian@example.com"
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Class Seeking *</label>
                  <select
                    value={newEnquiry.class_seeking}
                    onChange={(e) => setNewEnquiry({ ...newEnquiry, class_seeking: e.target.value })}
                    className="form-control"
                  >
                    <option value="Class 9">Class 9</option>
                    <option value="Class 10">Class 10</option>
                    <option value="Class 11 - Science">Class 11 - Science</option>
                    <option value="Class 11 - Commerce">Class 11 - Commerce</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Inquiry Notes / Prior School</label>
                <textarea
                  rows="3"
                  value={newEnquiry.notes}
                  onChange={(e) => setNewEnquiry({ ...newEnquiry, notes: e.target.value })}
                  placeholder="Reason for transfer, previous percentage, special requirements..."
                  className="form-control"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? 'Saving...' : 'Save Admission Inquiry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function getStatusStyle(status) {
  switch (status) {
    case 'Approved': return { color: '#16a34a', fontWeight: '700', fontSize: '12px' };
    case 'Follow Up': return { color: '#2563eb', fontWeight: '700', fontSize: '12px' };
    case 'Rejected': return { color: '#ef4444', fontWeight: '700', fontSize: '12px' };
    case 'Pending':
    default: return { color: '#d97706', fontWeight: '700', fontSize: '12px' };
  }
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
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px'
  },
  tag: {
    display: 'inline-block',
    fontSize: '11px',
    fontWeight: '800',
    color: '#d97706',
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
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '18px'
  },
  kpiCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
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
  cardSubtitle: {
    fontSize: '12px',
    color: '#64748b',
    margin: '2px 0 0 0'
  },
  cardBody: {
    padding: '20px 24px'
  },
  pill: {
    fontSize: '12px',
    padding: '4px 10px',
    backgroundColor: '#fef3c7',
    color: '#b45309',
    borderRadius: '20px',
    fontWeight: '700'
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
    maxWidth: '580px',
    width: '100%',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)'
  },
  modalHeader: {
    padding: '18px 24px',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  modalTitle: {
    fontSize: '16px',
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
    gap: '14px'
  }
};
