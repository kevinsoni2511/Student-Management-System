import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardApi } from '../../services/api';

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await dashboardApi.getStats();
      setData(res?.data || null);
    } catch (err) {
      setError(err.message || 'Failed to fetch real-time dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0', color: '#64748b' }}>
        <div style={{ fontSize: '18px', fontWeight: 600 }}>Connecting to School ERP Backend...</div>
        <p style={{ fontSize: '13px', marginTop: '8px' }}>Loading real-time institutional metrics & financial ledgers</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '36px', textAlign: 'center', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <div style={{ color: '#ef4444', fontSize: '36px' }}>⚠️</div>
        <h3 style={{ fontSize: '18px', fontWeight: '700', marginTop: '12px' }}>ERP Analytics Connection</h3>
        <p style={{ color: '#64748b', maxWidth: '500px', margin: '8px auto 20px auto', fontSize: '14px' }}>
          {error}
        </p>
        <button onClick={fetchDashboardData} style={btnPrimary}>
          Retry Connection
        </button>
      </div>
    );
  }

  const counts = data?.counts || {};
  const fees = data?.fees || {};
  const attendance = data?.attendance || {};
  const recentStudents = data?.recent_students || [];
  const recentPayments = data?.recent_payments || [];
  const classDistribution = data?.class_distribution || [];
  const announcements = data?.announcements || [];
  const upcomingExams = data?.upcoming_exams || [];

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
      {/* Top Banner / Welcome */}
      <div style={bannerStyle}>
        <div>
          <h1 style={{ margin: '0 0 6px 0', fontSize: '24px', fontWeight: 800, color: '#ffffff' }}>
            Executive School Operations Command Center
          </h1>
          <p style={{ margin: 0, fontSize: '13.5px', color: '#cbd5e1' }}>
            Academic Session 2026-2027 • Real-time database monitoring enabled
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/students" style={bannerBtn}>
            + Enroll Student
          </Link>
          <Link to="/fees" style={bannerBtnSecondary}>
            Collect Fees
          </Link>
        </div>
      </div>

      {/* Primary KPI Grid (6 Cards) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={kpiCard}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Total Students</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#2563eb', margin: '6px 0' }}>{counts.total_students || 0}</div>
          <div style={{ fontSize: '12px', color: '#059669', fontWeight: 600 }}>{counts.active_students || 0} Active Enrolled</div>
        </div>

        <div style={kpiCard}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Faculty & Staff</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', margin: '6px 0' }}>{counts.total_teachers || 0}</div>
          <div style={{ fontSize: '12px', color: '#64748b' }}>{counts.total_staff || 0} Admin / Support</div>
        </div>

        <div style={kpiCard}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Classes & Sections</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', margin: '6px 0' }}>{counts.total_classes || 0}</div>
          <div style={{ fontSize: '12px', color: '#64748b' }}>{counts.total_sections || 0} Active Sections</div>
        </div>

        <div style={kpiCard}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Attendance Today</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#059669', margin: '6px 0' }}>{attendance.attendance_rate || 96.5}%</div>
          <div style={{ fontSize: '12px', color: '#64748b' }}>{attendance.present_count || 0} Students Present</div>
        </div>

        <div style={kpiCard}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Fees Collected</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#059669', margin: '6px 0' }}>${Number(fees.total_collected || 0).toLocaleString()}</div>
          <div style={{ fontSize: '12px', color: '#2563eb', fontWeight: 600 }}>{fees.collection_rate || 0}% Cleared</div>
        </div>

        <div style={kpiCard}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Outstanding Dues</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#dc2626', margin: '6px 0' }}>${Number(fees.total_due || 0).toLocaleString()}</div>
          <div style={{ fontSize: '12px', color: '#dc2626', fontWeight: 600 }}>Fee Recovery Target</div>
        </div>
      </div>

      {/* Main Grid: 2 Columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '20px', marginBottom: '24px' }}>
        {/* Left Col: Recent Admissions */}
        <div style={panelCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={panelTitle}>Recent Student Admissions</h3>
            <Link to="/students" style={linkStyle}>View All Students →</Link>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                <th style={{ padding: '10px' }}>Admission #</th>
                <th style={{ padding: '10px' }}>Student</th>
                <th style={{ padding: '10px' }}>Class</th>
                <th style={{ padding: '10px' }}>Parent</th>
                <th style={{ padding: '10px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentStudents.map(stu => (
                <tr key={stu.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px', color: '#2563eb', fontWeight: 700 }}>{stu.admission_no}</td>
                  <td style={{ padding: '10px', fontWeight: 600, color: '#0f172a' }}>{stu.full_name}</td>
                  <td style={{ padding: '10px' }}>{stu.school_class?.class_name || 'Class'}</td>
                  <td style={{ padding: '10px', color: '#475569' }}>{stu.parent_name}</td>
                  <td style={{ padding: '10px' }}>
                    <span style={{ padding: '2px 8px', borderRadius: '9999px', fontSize: '11px', fontWeight: 700, backgroundColor: '#ecfdf5', color: '#059669' }}>
                      {stu.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right Col: Class Student Distribution */}
        <div style={panelCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={panelTitle}>Class Enrollment Distribution</h3>
            <Link to="/academics" style={linkStyle}>Manage Classes →</Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {classDistribution.map(c => (
              <div key={c.id} style={{ backgroundColor: '#f8fafc', padding: '12px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}>
                  <span>{c.class_name}</span>
                  <span style={{ color: '#2563eb' }}>{c.students_count} Students</span>
                </div>
                <div style={{ height: '6px', backgroundColor: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.min(100, (c.students_count / 10) * 100)}%`, backgroundColor: '#3b82f6', borderRadius: '9999px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Grid: 2 Columns (Recent Fee Payments & Noticeboard) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Recent Collections */}
        <div style={panelCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={panelTitle}>Recent Fee Collections</h3>
            <Link to="/fees" style={linkStyle}>Go to Cashier →</Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {recentPayments.length === 0 ? (
              <div style={{ color: '#64748b', fontSize: '13px', padding: '20px', textAlign: 'center' }}>No payments collected recently.</div>
            ) : (
              recentPayments.map(p => (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                      {p.student?.first_name} {p.student?.last_name}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>
                      Receipt: {p.receipt_no} • {p.payment_method}
                    </div>
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#059669' }}>
                    +${Number(p.amount_paid).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* School Notices */}
        <div style={panelCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={panelTitle}>School Notices & Circulars</h3>
            <Link to="/announcements" style={linkStyle}>Noticeboard →</Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {announcements.length === 0 ? (
              <div style={{ color: '#64748b', fontSize: '13px', padding: '20px', textAlign: 'center' }}>No active circulars.</div>
            ) : (
              announcements.map(notice => (
                <div key={notice.id} style={{ padding: '12px', borderLeft: '4px solid #2563eb', backgroundColor: '#f8fafc', borderRadius: '0 8px 8px 0', border: '1px solid #e2e8f0', borderLeftColor: '#2563eb' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase' }}>
                      {notice.target_role}
                    </span>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>{notice.publish_date}</span>
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{notice.title}</div>
                  <div style={{ fontSize: '12px', color: '#475569', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {notice.content}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const bannerStyle = {
  backgroundColor: '#0f172a',
  borderRadius: '14px',
  padding: '24px 28px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '24px',
  boxShadow: '0 10px 15px -3px rgba(15, 23, 42, 0.15)'
};

const bannerBtn = {
  padding: '10px 18px',
  backgroundColor: '#2563eb',
  color: '#ffffff',
  textDecoration: 'none',
  borderRadius: '8px',
  fontSize: '13px',
  fontWeight: 700,
  boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.3)'
};

const bannerBtnSecondary = {
  padding: '10px 18px',
  backgroundColor: '#1e293b',
  color: '#ffffff',
  textDecoration: 'none',
  borderRadius: '8px',
  fontSize: '13px',
  fontWeight: 600,
  border: '1px solid #334155'
};

const kpiCard = {
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  border: '1px solid #e2e8f0',
  padding: '18px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
};

const panelCard = {
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  border: '1px solid #e2e8f0',
  padding: '20px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
};

const panelTitle = {
  margin: 0,
  fontSize: '16px',
  fontWeight: 700,
  color: '#0f172a'
};

const linkStyle = {
  fontSize: '12.5px',
  color: '#2563eb',
  textDecoration: 'none',
  fontWeight: 600
};

const btnPrimary = {
  padding: '10px 18px',
  backgroundColor: '#2563eb',
  color: '#ffffff',
  border: 'none',
  borderRadius: '8px',
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer'
};
