import React, { useState, useEffect } from 'react';
import { parentPortalApi } from '../../services/api';

export default function ParentDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedChildId, setSelectedChildId] = useState(null);
  const [childDetails, setChildDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'attendance', 'fees', 'academics', 'timetable'

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await parentPortalApi.getDashboard();
      setData(res);
      if (res.children && res.children.length > 0) {
        const firstId = res.children[0].id;
        setSelectedChildId(firstId);
        loadChildOverview(firstId);
      }
      setError(null);
    } catch (err) {
      setError(err?.data?.message || err.message || 'Failed to load Parent portal');
    } finally {
      setLoading(false);
    }
  };

  const loadChildOverview = async (studentId) => {
    try {
      setLoadingDetails(true);
      const res = await parentPortalApi.getChildOverview(studentId);
      setChildDetails(res);
    } catch (err) {
      alert(err?.data?.message || err.message || 'Forbidden: Cannot access child record');
    } finally {
      setLoadingDetails(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleSelectChild = (id) => {
    setSelectedChildId(id);
    loadChildOverview(id);
  };

  if (loading) {
    return <div className="loading-state"><div className="spinner" /> Loading Parent Ward Portal...</div>;
  }

  const parent = data?.parent || {};
  const children = data?.children || [];
  const announcements = data?.announcements || [];
  const student = childDetails?.student || {};

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <span style={styles.tag}>GUARDIAN & FAMILY PORTAL</span>
          <h1 style={styles.title}>Parent Dashboard</h1>
          <p style={styles.subtitle}>Welcome, {parent.name || 'Parent'}. Monitor your ward's school progress, attendance & fees.</p>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Children Selector Cards */}
      <div style={styles.childrenSection}>
        <div style={styles.childrenLabel}>LINKED WARDS / CHILDREN ({children.length})</div>
        <div style={styles.childrenGrid}>
          {children.map((child) => {
            const isSelected = selectedChildId === child.id;
            return (
              <div
                key={child.id}
                onClick={() => handleSelectChild(child.id)}
                style={{
                  ...styles.childCard,
                  ...(isSelected ? styles.childCardSelected : {})
                }}
              >
                <div style={styles.childAvatar}>
                  {child.first_name ? child.first_name.charAt(0) : 'S'}
                </div>
                <div style={styles.childMeta}>
                  <div style={styles.childName}>{child.full_name}</div>
                  <div style={styles.childClass}>
                    {child.school_class?.class_name || 'Class 10'} • Section {child.section?.section_name || 'A'}
                  </div>
                  <div style={styles.childRoll}>Roll No: {child.roll_no} • Adm #{child.admission_no}</div>
                </div>
                {isSelected && <span style={styles.selectedPill}>● Active View</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Ward Details View */}
      {loadingDetails ? (
        <div className="loading-state"><div className="spinner" /> Loading ward academic dossier...</div>
      ) : childDetails ? (
        <div style={styles.card}>
          {/* Tabs */}
          <div style={styles.tabNav}>
            <button
              onClick={() => setActiveTab('overview')}
              style={{ ...styles.tabBtn, ...(activeTab === 'overview' ? styles.tabBtnActive : {}) }}
            >
              Academic Summary
            </button>
            <button
              onClick={() => setActiveTab('attendance')}
              style={{ ...styles.tabBtn, ...(activeTab === 'attendance' ? styles.tabBtnActive : {}) }}
            >
              Attendance Record ({childDetails.attendance_rate}%)
            </button>
            <button
              onClick={() => setActiveTab('fees')}
              style={{ ...styles.tabBtn, ...(activeTab === 'fees' ? styles.tabBtnActive : {}) }}
            >
              Fee Invoices & Receipts
            </button>
            <button
              onClick={() => setActiveTab('academics')}
              style={{ ...styles.tabBtn, ...(activeTab === 'academics' ? styles.tabBtnActive : {}) }}
            >
              Examination Marks
            </button>
            <button
              onClick={() => setActiveTab('timetable')}
              style={{ ...styles.tabBtn, ...(activeTab === 'timetable' ? styles.tabBtnActive : {}) }}
            >
              Weekly Schedule
            </button>
          </div>

          <div style={styles.tabContent}>
            {/* TAB: OVERVIEW */}
            {activeTab === 'overview' && (
              <div style={styles.overviewTab}>
                <div style={styles.kpiGrid}>
                  <div style={styles.kpiCard}>
                    <span style={styles.kpiLabel}>Cumulative Attendance</span>
                    <div style={styles.kpiVal}>{childDetails.attendance_rate}%</div>
                    <span style={{ fontSize: '11px', color: '#16a34a' }}>Good Regularity</span>
                  </div>
                  <div style={styles.kpiCard}>
                    <span style={styles.kpiLabel}>Current Grade Average</span>
                    <div style={styles.kpiVal}>88.4%</div>
                    <span style={{ fontSize: '11px', color: '#2563eb' }}>Grade A Distinction</span>
                  </div>
                  <div style={styles.kpiCard}>
                    <span style={styles.kpiLabel}>Fee Dues Outstanding</span>
                    <div style={{ ...styles.kpiVal, color: childDetails.fee_ledger?.some(f => f.due_amount > 0) ? '#dc2626' : '#16a34a' }}>
                      ₹{(childDetails.fee_ledger?.reduce((acc, f) => acc + parseFloat(f.due_amount || 0), 0) || 0).toLocaleString()}
                    </div>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>Account in Good Standing</span>
                  </div>
                </div>

                <div style={styles.infoBox}>
                  <h3 style={styles.infoBoxTitle}>Ward Dossier Information</h3>
                  <div style={styles.infoGrid}>
                    <div><strong>Date of Birth:</strong> {student.date_of_birth || '2011-04-12'}</div>
                    <div><strong>Blood Group:</strong> {student.blood_group || 'O+'}</div>
                    <div><strong>Gender:</strong> {student.gender || 'Male'}</div>
                    <div><strong>Emergency Contact:</strong> {student.parent_phone || '+91 98234 00000'}</div>
                    <div><strong>Home Address:</strong> {student.address || 'Rohini Sector 14, Delhi'}</div>
                    <div><strong>School Branch:</strong> Delhi Public Global Academy</div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: ATTENDANCE */}
            {activeTab === 'attendance' && (
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '14px' }}>Recent Session Attendance History</h3>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Class & Section</th>
                      <th>Status</th>
                      <th>Teacher Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(childDetails.recent_attendance || []).map((att) => (
                      <tr key={att.id}>
                        <td><strong>{att.attendance_date}</strong></td>
                        <td>Class 10 - Section A</td>
                        <td>
                          <span style={{
                            padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700',
                            backgroundColor: att.status === 'Present' ? '#dcfce7' : (att.status === 'Late' ? '#fef3c7' : '#fee2e2'),
                            color: att.status === 'Present' ? '#15803d' : (att.status === 'Late' ? '#b45309' : '#b91c1c')
                          }}>
                            {att.status}
                          </span>
                        </td>
                        <td>{att.remarks || 'Regular presence in lectures'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB: FEES */}
            {activeTab === 'fees' && (
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '14px' }}>Student Fee Invoices & Payment Ledger</h3>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Fee Type</th>
                      <th>Total Invoiced</th>
                      <th>Concession</th>
                      <th>Paid</th>
                      <th>Balance Due</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(childDetails.fee_ledger || []).map((fee) => (
                      <tr key={fee.id}>
                        <td><strong>{fee.fee_structure?.fee_type?.fee_name || 'Quarterly Tuition Fee'}</strong></td>
                        <td>₹{parseFloat(fee.total_amount).toLocaleString()}</td>
                        <td>₹{parseFloat(fee.discount || 0).toLocaleString()}</td>
                        <td>₹{parseFloat(fee.paid_amount).toLocaleString()}</td>
                        <td><strong style={{ color: fee.due_amount > 0 ? '#ef4444' : '#16a34a' }}>₹{parseFloat(fee.due_amount).toLocaleString()}</strong></td>
                        <td>
                          <span style={{ fontSize: '12px', fontWeight: '700', color: fee.status === 'Paid' ? '#16a34a' : '#f59e0b' }}>
                            ● {fee.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <h4 style={{ fontSize: '14px', fontWeight: '700', marginTop: '24px', marginBottom: '10px' }}>Historical Cashier Receipts</h4>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Receipt #</th>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Method</th>
                      <th>Transaction Reference</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(childDetails.recent_payments || []).map((p) => (
                      <tr key={p.id}>
                        <td><code>{p.receipt_no}</code></td>
                        <td>{p.payment_date}</td>
                        <td><strong>₹{parseFloat(p.amount_paid).toLocaleString()}</strong></td>
                        <td>{p.payment_method}</td>
                        <td>{p.transaction_ref}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB: ACADEMICS & MARKS */}
            {activeTab === 'academics' && (
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '14px' }}>Examination Evaluation & Subject Scores</h3>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Examination</th>
                      <th>Subject</th>
                      <th>Max Marks</th>
                      <th>Marks Obtained</th>
                      <th>Grade</th>
                      <th>Teacher Feedback</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(childDetails.exam_marks || []).map((m) => (
                      <tr key={m.id}>
                        <td><strong>{m.examination?.exam_name || 'Mid-Term 2026'}</strong></td>
                        <td>{m.subject?.subject_name}</td>
                        <td>{m.max_marks}</td>
                        <td><strong style={{ color: '#2563eb', fontSize: '15px' }}>{m.obtained_marks}</strong></td>
                        <td>
                          <span style={{ padding: '3px 8px', borderRadius: '4px', backgroundColor: '#ecfdf5', color: '#059669', fontWeight: '700', fontSize: '12px' }}>
                            {m.grade}
                          </span>
                        </td>
                        <td>{m.remarks}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB: TIMETABLE */}
            {activeTab === 'timetable' && (
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '14px' }}>Class 10 Weekly Timetable</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {(childDetails.timetable || []).map((t, idx) => (
                    <div key={idx} style={styles.scheduleRow}>
                      <div style={styles.scheduleDay}>{t.day}</div>
                      <div style={styles.schedulePeriods}>
                        {t.periods.map((p, pIdx) => (
                          <span key={pIdx} style={styles.periodPill}>{p}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* School Circulars for Parents */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <h2 style={styles.cardTitle}>Parent Notices & Circulars</h2>
        </div>
        <div style={styles.cardBody}>
          {announcements.map((a) => (
            <div key={a.id} style={styles.noticeItem}>
              <div style={styles.noticeDate}>{a.publish_date}</div>
              <div style={styles.noticeTitle}>{a.title}</div>
              <div style={styles.noticeSnippet}>{a.content}</div>
            </div>
          ))}
        </div>
      </div>
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
    alignItems: 'center'
  },
  tag: {
    display: 'inline-block',
    fontSize: '11px',
    fontWeight: '800',
    color: '#4f46e5',
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
  childrenSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  childrenLabel: {
    fontSize: '11px',
    fontWeight: '800',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.8px'
  },
  childrenGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '16px'
  },
  childCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '16px',
    border: '2px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    cursor: 'pointer',
    position: 'relative',
    transition: 'all 0.15s ease'
  },
  childCardSelected: {
    borderColor: '#4f46e5',
    backgroundColor: '#f5f3ff',
    boxShadow: '0 4px 12px rgba(79, 70, 229, 0.15)'
  },
  childAvatar: {
    width: '44px',
    height: '44px',
    borderRadius: '10px',
    backgroundColor: '#4f46e5',
    color: '#ffffff',
    fontSize: '18px',
    fontWeight: '800',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  childMeta: {
    flex: 1
  },
  childName: {
    fontSize: '15px',
    fontWeight: '800',
    color: '#0f172a'
  },
  childClass: {
    fontSize: '12px',
    color: '#4f46e5',
    fontWeight: '600',
    marginTop: '2px'
  },
  childRoll: {
    fontSize: '11px',
    color: '#94a3b8',
    marginTop: '2px'
  },
  selectedPill: {
    position: 'absolute',
    top: '10px',
    right: '12px',
    fontSize: '10px',
    fontWeight: '700',
    color: '#4f46e5'
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
    borderBottom: '1px solid #e2e8f0'
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#0f172a',
    margin: 0
  },
  cardBody: {
    padding: '20px 24px'
  },
  tabNav: {
    display: 'flex',
    borderBottom: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc',
    overflowX: 'auto'
  },
  tabBtn: {
    padding: '14px 20px',
    background: 'none',
    border: 'none',
    borderBottom: '2px solid transparent',
    fontSize: '13px',
    fontWeight: '600',
    color: '#64748b',
    cursor: 'pointer',
    whiteSpace: 'nowrap'
  },
  tabBtnActive: {
    color: '#4f46e5',
    borderBottomColor: '#4f46e5',
    backgroundColor: '#ffffff'
  },
  tabContent: {
    padding: '24px'
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '20px'
  },
  kpiCard: {
    padding: '16px',
    backgroundColor: '#f8fafc',
    borderRadius: '10px',
    border: '1px solid #e2e8f0'
  },
  kpiLabel: {
    fontSize: '12px',
    color: '#64748b',
    fontWeight: '600',
    display: 'block'
  },
  kpiVal: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#0f172a',
    margin: '4px 0'
  },
  infoBox: {
    padding: '20px',
    backgroundColor: '#f8fafc',
    borderRadius: '10px',
    border: '1px solid #e2e8f0'
  },
  infoBoxTitle: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#0f172a',
    margin: '0 0 14px 0'
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '12px',
    fontSize: '13px',
    color: '#334155'
  },
  scheduleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '12px',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    border: '1px solid #e2e8f0'
  },
  scheduleDay: {
    width: '100px',
    fontSize: '13px',
    fontWeight: '700',
    color: '#4f46e5'
  },
  schedulePeriods: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap'
  },
  periodPill: {
    padding: '4px 10px',
    backgroundColor: '#ffffff',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '12px',
    color: '#334155'
  },
  noticeItem: {
    paddingBottom: '12px',
    borderBottom: '1px solid #f1f5f9'
  },
  noticeDate: {
    fontSize: '11px',
    color: '#94a3b8',
    fontWeight: '600'
  },
  noticeTitle: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#0f172a',
    marginTop: '2px'
  },
  noticeSnippet: {
    fontSize: '12px',
    color: '#64748b',
    marginTop: '4px'
  }
};
