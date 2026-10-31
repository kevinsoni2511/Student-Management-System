import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { accountantPortalApi, feesApi } from '../../services/api';

export default function AccountantDashboard() {
  const [data, setData] = useState(null);
  const [pendingRecords, setPendingRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeReceipt, setActiveReceipt] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await accountantPortalApi.getDashboard();
      setData(res);
      const pendingRes = await accountantPortalApi.getPendingDues();
      setPendingRecords(pendingRes.pending_records?.data || []);
      setError(null);
    } catch (err) {
      setError(err?.data?.message || err.message || 'Failed to load Accountant dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const viewReceipt = async (receiptNo) => {
    try {
      const res = await feesApi.getReceipt(receiptNo);
      setActiveReceipt(res.receipt);
    } catch (err) {
      alert('Unable to load receipt: ' + err.message);
    }
  };

  if (loading) {
    return <div className="loading-state"><div className="spinner" /> Loading Finance Ledger...</div>;
  }

  const stats = data?.statistics || {};
  const recentPayments = data?.recent_payments || [];
  const feeStructures = data?.fee_structures || [];

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <span style={styles.tag}>TREASURY & ACCOUNTS CONSOLE</span>
          <h1 style={styles.title}>Finance & Fee Management</h1>
          <p style={styles.subtitle}>Student Fee Billing, Cashier Collections, Dues Recovery & Official Receipts</p>
        </div>
        <Link to="/fees" className="btn btn-primary" style={styles.actionBtn}>
          + Open Fee Collection Cashier
        </Link>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* KPI Cards */}
      <div style={styles.kpiGrid}>
        <div style={styles.kpiCard}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiLabel}>Total Fees Billed</span>
            <div style={{ ...styles.kpiIcon, backgroundColor: '#dbeafe', color: '#2563eb' }}>💳</div>
          </div>
          <div style={styles.kpiValue}>₹{(stats.total_billed || 0).toLocaleString()}</div>
          <div style={styles.kpiSub}>Session 2026-2027 Invoiced</div>
        </div>

        <div style={styles.kpiCard}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiLabel}>Total Collected</span>
            <div style={{ ...styles.kpiIcon, backgroundColor: '#dcfce7', color: '#15803d' }}>💰</div>
          </div>
          <div style={styles.kpiValue}>₹{(stats.total_collected || 0).toLocaleString()}</div>
          <div style={styles.kpiSub}>Recovery Rate: <strong>{stats.collection_rate}%</strong></div>
        </div>

        <div style={styles.kpiCard}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiLabel}>Outstanding Dues</span>
            <div style={{ ...styles.kpiIcon, backgroundColor: '#fee2e2', color: '#b91c1c' }}>⚠️</div>
          </div>
          <div style={styles.kpiValue}>₹{(stats.total_pending || 0).toLocaleString()}</div>
          <div style={styles.kpiSub}>Follow-up required</div>
        </div>

        <div style={styles.kpiCard}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiLabel}>Today's Cashier Total</span>
            <div style={{ ...styles.kpiIcon, backgroundColor: '#fef3c7', color: '#d97706' }}>🧾</div>
          </div>
          <div style={styles.kpiValue}>₹{(stats.today_collected || 0).toLocaleString()}</div>
          <div style={styles.kpiSub}>Deposited to treasury</div>
        </div>
      </div>

      {/* Recent Collections Table */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div>
            <h2 style={styles.cardTitle}>Recent Fee Collections & Receipts</h2>
            <p style={styles.cardSubtitle}>Audit trail of authenticated payment transactions</p>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Receipt #</th>
                <th>Student</th>
                <th>Class</th>
                <th>Amount Paid</th>
                <th>Payment Mode</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentPayments.map((p) => (
                <tr key={p.id}>
                  <td><code style={styles.receiptCode}>{p.receipt_no}</code></td>
                  <td><strong>{p.student?.full_name || 'Aarav Mehta'}</strong></td>
                  <td>{p.student?.school_class?.class_name || 'Class 10'}</td>
                  <td><strong>₹{parseFloat(p.amount_paid).toLocaleString()}</strong></td>
                  <td>
                    <span style={styles.paymentBadge}>{p.payment_method}</span>
                  </td>
                  <td>{p.payment_date}</td>
                  <td>
                    <button
                      onClick={() => viewReceipt(p.receipt_no)}
                      className="btn btn-secondary"
                      style={{ fontSize: '11px', padding: '4px 10px' }}
                    >
                      Print Receipt
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Outstanding Dues List */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div>
            <h2 style={styles.cardTitle}>Pending Dues Attention List</h2>
            <p style={styles.cardSubtitle}>Accounts with overdue balance requiring parent notice</p>
          </div>
          <span style={styles.pendingPill}>{pendingRecords.length} Defaulters</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Admission No</th>
                <th>Fee Head</th>
                <th>Total Billed</th>
                <th>Paid</th>
                <th>Outstanding Due</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {pendingRecords.map((r) => (
                <tr key={r.id}>
                  <td><strong>{r.student?.full_name}</strong></td>
                  <td>{r.student?.admission_no}</td>
                  <td>{r.fee_structure?.fee_type?.fee_name || 'Tuition Fee'}</td>
                  <td>₹{parseFloat(r.total_amount).toLocaleString()}</td>
                  <td>₹{parseFloat(r.paid_amount).toLocaleString()}</td>
                  <td><strong style={{ color: '#ef4444' }}>₹{parseFloat(r.due_amount).toLocaleString()}</strong></td>
                  <td>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#f59e0b' }}>● {r.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Receipt Modal */}
      {activeReceipt && (
        <div style={styles.modalOverlay}>
          <div style={styles.receiptModal}>
            <div style={styles.receiptHeader}>
              <div>
                <h3 style={styles.receiptTitle}>OFFICIAL PAYMENT RECEIPT</h3>
                <div style={styles.receiptSubtitle}>Delhi Public Global Academy</div>
              </div>
              <button onClick={() => setActiveReceipt(null)} style={styles.closeBtn}>×</button>
            </div>
            <div style={styles.receiptBody}>
              <div style={styles.receiptRow}>
                <span>Receipt Number:</span>
                <strong>{activeReceipt.receipt_no}</strong>
              </div>
              <div style={styles.receiptRow}>
                <span>Student Name:</span>
                <strong>{activeReceipt.student?.full_name}</strong>
              </div>
              <div style={styles.receiptRow}>
                <span>Admission No:</span>
                <span>{activeReceipt.student?.admission_no}</span>
              </div>
              <div style={styles.receiptRow}>
                <span>Payment Date:</span>
                <span>{activeReceipt.payment_date}</span>
              </div>
              <div style={styles.receiptRow}>
                <span>Method / Ref:</span>
                <span>{activeReceipt.payment_method} ({activeReceipt.transaction_ref || 'Counter Cash'})</span>
              </div>
              <div style={{ ...styles.receiptRow, borderTop: '2px dashed #cbd5e1', paddingTop: '10px', marginTop: '10px' }}>
                <span style={{ fontSize: '16px', fontWeight: '700' }}>Amount Collected:</span>
                <span style={{ fontSize: '18px', fontWeight: '800', color: '#15803d' }}>
                  ₹{parseFloat(activeReceipt.amount_paid).toLocaleString()}
                </span>
              </div>
            </div>
            <div style={styles.receiptFooter}>
              <button onClick={() => window.print()} className="btn btn-primary" style={{ flex: 1 }}>
                🖨️ Print Receipt
              </button>
              <button onClick={() => setActiveReceipt(null)} className="btn btn-secondary">
                Close
              </button>
            </div>
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
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px'
  },
  tag: {
    display: 'inline-block',
    fontSize: '11px',
    fontWeight: '800',
    color: '#15803d',
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
    fontWeight: '600',
    textDecoration: 'none'
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
  pendingPill: {
    fontSize: '12px',
    padding: '4px 10px',
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    borderRadius: '20px',
    fontWeight: '700'
  },
  receiptCode: {
    padding: '3px 6px',
    backgroundColor: '#f1f5f9',
    borderRadius: '4px',
    fontSize: '12px',
    color: '#2563eb',
    fontFamily: 'monospace'
  },
  paymentBadge: {
    padding: '3px 8px',
    backgroundColor: '#ecfdf5',
    color: '#059669',
    borderRadius: '4px',
    fontSize: '11px',
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
  receiptModal: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    maxWidth: '460px',
    width: '100%',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
    overflow: 'hidden'
  },
  receiptHeader: {
    padding: '20px 24px',
    backgroundColor: '#0f172a',
    color: '#ffffff',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  receiptTitle: {
    fontSize: '16px',
    fontWeight: '800',
    margin: 0
  },
  receiptSubtitle: {
    fontSize: '12px',
    color: '#94a3b8',
    marginTop: '2px'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '22px',
    cursor: 'pointer',
    color: '#cbd5e1'
  },
  receiptBody: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  receiptRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '14px',
    color: '#334155'
  },
  receiptFooter: {
    padding: '16px 24px',
    backgroundColor: '#f8fafc',
    borderTop: '1px solid #e2e8f0',
    display: 'flex',
    gap: '12px'
  }
};
