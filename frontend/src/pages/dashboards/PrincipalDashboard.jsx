import React, { useState, useEffect } from 'react';
import { principalApi } from '../../services/api';

export default function PrincipalDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [approvals, setApprovals] = useState([]);
  const [processingId, setProcessingId] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await principalApi.getOverview();
      setData(res);
      setApprovals(res.approvals || []);
      setError(null);
    } catch (err) {
      setError(err?.data?.message || err.message || 'Failed to load Principal overview');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = async (id) => {
    try {
      setProcessingId(id);
      await principalApi.approveRequest(id);
      setApprovals(approvals.map(a => a.id === id ? { ...a, status: 'Approved' } : a));
    } catch (err) {
      alert(err?.data?.message || err.message || 'Approval failed');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return <div className="loading-state"><div className="spinner" /> Loading Principal Academic Cockpit...</div>;
  }

  const stats = data?.statistics || {};
  const classesBreakdown = data?.classes_breakdown || [];
  const teachers = data?.teachers || [];
  const announcements = data?.announcements || [];

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <span style={styles.tag}>ACADEMIC LEADERSHIP CONSOLE</span>
          <h1 style={styles.title}>Principal Dashboard</h1>
          <p style={styles.subtitle}>Academic Oversight, Faculty Evaluations, Attendance Trends & Institutional Approvals</p>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* KPI Stats */}
      <div style={styles.kpiGrid}>
        <div style={styles.kpiCard}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiLabel}>Total Student Strength</span>
            <div style={{ ...styles.kpiIcon, backgroundColor: '#fce7f3', color: '#db2777' }}>🎓</div>
          </div>
          <div style={styles.kpiValue}>{stats.total_students || 0}</div>
          <div style={styles.kpiSub}>Across {stats.total_classes || 2} Active Classes</div>
        </div>

        <div style={styles.kpiCard}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiLabel}>Teaching Staff</span>
            <div style={{ ...styles.kpiIcon, backgroundColor: '#dbeafe', color: '#2563eb' }}>👨‍🏫</div>
          </div>
          <div style={styles.kpiValue}>{stats.total_teachers || 0}</div>
          <div style={styles.kpiSub}>100% Certified Faculty</div>
        </div>

        <div style={styles.kpiCard}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiLabel}>Campus Attendance Today</span>
            <div style={{ ...styles.kpiIcon, backgroundColor: '#d1fae5', color: '#059669' }}>📈</div>
          </div>
          <div style={styles.kpiValue}>{stats.attendance_rate}%</div>
          <div style={styles.kpiSub}>Above 90% benchmark</div>
        </div>

        <div style={styles.kpiCard}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiLabel}>Academic Index Avg</span>
            <div style={{ ...styles.kpiIcon, backgroundColor: '#fef3c7', color: '#d97706' }}>⭐</div>
          </div>
          <div style={styles.kpiValue}>{stats.latest_exam_avg} / 100</div>
          <div style={styles.kpiSub}>Mid-Term Evaluation</div>
        </div>
      </div>

      {/* Grid: Academic Breakdown & Pending Approvals */}
      <div style={styles.twoColumnGrid}>
        {/* Left: Pending Administrative Approvals */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <h2 style={styles.cardTitle}>Institutional Approvals & Requisitions</h2>
              <p style={styles.cardSubtitle}>Faculty leaves and department expenditure authorization</p>
            </div>
            <span style={styles.badgePending}>{approvals.filter(a => a.status === 'Pending').length} Pending</span>
          </div>
          <div style={styles.cardBody}>
            {approvals.map((req) => (
              <div key={req.id} style={styles.approvalItem}>
                <div style={styles.approvalMeta}>
                  <div style={styles.applicantName}>{req.applicant}</div>
                  <div style={styles.approvalType}>{req.type} • <span style={{ color: '#64748b' }}>{req.dates}</span></div>
                  <div style={styles.approvalReason}>"{req.reason}"</div>
                </div>
                <div style={styles.approvalAction}>
                  {req.status === 'Approved' ? (
                    <span style={styles.badgeApproved}>✓ Approved</span>
                  ) : (
                    <button
                      onClick={() => handleApprove(req.id)}
                      disabled={processingId === req.id}
                      className="btn btn-primary"
                      style={styles.approveBtn}
                    >
                      {processingId === req.id ? 'Approving...' : 'Approve'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Class Enrollment & Performance */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <h2 style={styles.cardTitle}>Class-wise Distribution</h2>
              <p style={styles.cardSubtitle}>Current enrollment across academic standards</p>
            </div>
          </div>
          <div style={styles.cardBody}>
            {classesBreakdown.map((c) => (
              <div key={c.id} style={styles.classRow}>
                <div style={styles.classInfo}>
                  <span style={styles.className}>{c.name}</span>
                  <span style={styles.classStudents}>{c.students_count} Students Enrolled</span>
                </div>
                <div style={styles.progressBarBg}>
                  <div
                    style={{
                      ...styles.progressBarFill,
                      width: `${Math.min(100, (c.students_count / 10) * 100)}%`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Faculty Directory Summary & School Notices */}
      <div style={styles.twoColumnGrid}>
        {/* Faculty Roster */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>Faculty Members</h2>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Faculty Name</th>
                  <th>Qualification</th>
                  <th>Experience</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <strong>{t.name}</strong>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{t.email}</div>
                    </td>
                    <td>{t.qualification}</td>
                    <td>{t.experience}</td>
                    <td><span style={styles.statusActive}>● Active</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* School Announcements */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>Principal Circulars & Notices</h2>
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
    color: '#be185d',
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
  twoColumnGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
    gap: '24px'
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
    marginTop: '2px',
    margin: 0
  },
  cardBody: {
    padding: '20px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  badgePending: {
    fontSize: '11px',
    fontWeight: '700',
    padding: '4px 10px',
    backgroundColor: '#fef3c7',
    color: '#b45309',
    borderRadius: '20px'
  },
  badgeApproved: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#16a34a'
  },
  approvalItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px',
    backgroundColor: '#f8fafc',
    borderRadius: '10px',
    border: '1px solid #e2e8f0'
  },
  approvalMeta: {
    flex: 1
  },
  applicantName: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#0f172a'
  },
  approvalType: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#2563eb',
    marginTop: '2px'
  },
  approvalReason: {
    fontSize: '12px',
    color: '#64748b',
    fontStyle: 'italic',
    marginTop: '4px'
  },
  approvalAction: {
    marginLeft: '16px'
  },
  approveBtn: {
    padding: '6px 14px',
    fontSize: '12px',
    fontWeight: '600'
  },
  classRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  classInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px'
  },
  className: {
    fontWeight: '700',
    color: '#0f172a'
  },
  classStudents: {
    color: '#64748b'
  },
  progressBarBg: {
    height: '8px',
    backgroundColor: '#f1f5f9',
    borderRadius: '4px',
    overflow: 'hidden'
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#db2777',
    borderRadius: '4px'
  },
  statusActive: {
    color: '#16a34a',
    fontSize: '12px',
    fontWeight: '600'
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
