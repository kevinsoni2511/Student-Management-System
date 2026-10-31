import React, { useState, useEffect } from 'react';
import { feesApi, academicsApi } from '../../services/api';

export default function FeeCollectionPage() {
  const [activeTab, setActiveTab] = useState('accounts');
  const [feeAccounts, setFeeAccounts] = useState([]);
  const [payments, setPayments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [summary, setSummary] = useState({ total_billed: 0, total_paid: 0, total_due: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Collect Payment Modal
  const [collectModalOpen, setCollectModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    amount_paid: '',
    payment_method: 'Cash',
    transaction_ref: '',
    remarks: 'Tuition Fee Payment'
  });
  const [submittingPayment, setSubmittingPayment] = useState(false);

  // Printable Receipt Modal
  const [receiptData, setReceiptData] = useState(null);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);

  useEffect(() => {
    academicsApi.getClasses().then(res => setClasses(res?.data || []));
    fetchFeeAccounts();
  }, [search, classFilter, statusFilter]);

  const fetchFeeAccounts = async () => {
    setLoading(true);
    try {
      const res = await feesApi.getStudentFees({
        search,
        class_id: classFilter,
        status: statusFilter
      });
      setFeeAccounts(res?.data || []);
      if (res?.summary) {
        setSummary(res.summary);
      }
    } catch (err) {
      setError(err.message || 'Error loading fee accounts');
    } finally {
      setLoading(false);
    }
  };

  const fetchPayments = async () => {
    try {
      const res = await feesApi.getPayments();
      setPayments(res?.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenCollect = (account) => {
    setSelectedAccount(account);
    setPaymentForm({
      amount_paid: account.due_amount,
      payment_method: 'Cash',
      transaction_ref: '',
      remarks: `Payment for ${account.fee_structure?.fee_type?.fee_name || 'Tuition Fee'}`
    });
    setCollectModalOpen(true);
  };

  const handleProcessPayment = async (e) => {
    e.preventDefault();
    if (!selectedAccount) return;

    setSubmittingPayment(true);
    try {
      const res = await feesApi.collectPayment({
        student_fee_id: selectedAccount.id,
        amount_paid: parseFloat(paymentForm.amount_paid),
        payment_method: paymentForm.payment_method,
        transaction_ref: paymentForm.transaction_ref || null,
        remarks: paymentForm.remarks || null
      });

      setCollectModalOpen(false);
      fetchFeeAccounts();

      // Show receipt modal
      if (res?.data) {
        setReceiptData(res.data);
        setReceiptModalOpen(true);
      }
    } catch (err) {
      alert(err.message || 'Payment processing error');
    } finally {
      setSubmittingPayment(false);
    }
  };

  const handleViewReceipt = async (receiptNo) => {
    try {
      const res = await feesApi.getReceipt(receiptNo);
      if (res?.data) {
        setReceiptData(res.data);
        setReceiptModalOpen(true);
      }
    } catch (err) {
      alert('Error loading receipt: ' + err.message);
    }
  };

  const collectionRate = summary.total_billed > 0
    ? Math.round((summary.total_paid / summary.total_billed) * 100)
    : 0;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px 0' }}>Fee Collection & Billing</h1>
          <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>Collect student fee payments, manage outstanding balances, and issue official receipts.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div style={kpiCard}>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>${summary.total_billed.toLocaleString()}</div>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Total Billed</div>
        </div>
        <div style={kpiCard}>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#059669' }}>${summary.total_paid.toLocaleString()}</div>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Total Collected</div>
        </div>
        <div style={kpiCard}>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#dc2626' }}>${summary.total_due.toLocaleString()}</div>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Outstanding Dues</div>
        </div>
        <div style={kpiCard}>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#2563eb' }}>{collectionRate}%</div>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Collection Efficiency</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e2e8f0', marginBottom: '20px' }}>
        <button
          onClick={() => setActiveTab('accounts')}
          style={{ ...tabBtn, borderBottom: activeTab === 'accounts' ? '2px solid #2563eb' : '2px solid transparent', color: activeTab === 'accounts' ? '#2563eb' : '#64748b', fontWeight: activeTab === 'accounts' ? 700 : 500 }}
        >
          Student Fee Accounts
        </button>
        <button
          onClick={() => {
            setActiveTab('transactions');
            fetchPayments();
          }}
          style={{ ...tabBtn, borderBottom: activeTab === 'transactions' ? '2px solid #2563eb' : '2px solid transparent', color: activeTab === 'transactions' ? '#2563eb' : '#64748b', fontWeight: activeTab === 'transactions' ? 700 : 500 }}
        >
          Payment Transactions & Receipts
        </button>
      </div>

      {activeTab === 'accounts' && (
        <>
          {/* Filters */}
          <div style={filterBar}>
            <input
              type="text"
              placeholder="Search by student name or admission #..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ ...inputStyle, flex: 1 }}
            />
            <select
              value={classFilter}
              onChange={e => setClassFilter(e.target.value)}
              style={{ ...inputStyle, width: '160px' }}
            >
              <option value="">All Classes</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.class_name}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              style={{ ...inputStyle, width: '150px' }}
            >
              <option value="">All Statuses</option>
              <option value="Unpaid">Unpaid Only</option>
              <option value="Partial">Partial Dues</option>
              <option value="Paid">Fully Paid</option>
            </select>
          </div>

          {/* Table */}
          <div style={tableContainer}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>Loading fee accounts...</div>
            ) : feeAccounts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>No fee accounts found.</div>
            ) : (
              <table style={tableStyle}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={thStyle}>Admission #</th>
                    <th style={thStyle}>Student Name</th>
                    <th style={thStyle}>Class</th>
                    <th style={thStyle}>Fee Type</th>
                    <th style={thStyle}>Total Fee</th>
                    <th style={thStyle}>Paid</th>
                    <th style={thStyle}>Remaining Due</th>
                    <th style={thStyle}>Status</th>
                    <th style={{ ...thStyle, textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {feeAccounts.map(fa => (
                    <tr key={fa.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ ...tdStyle, fontWeight: 700, color: '#2563eb' }}>{fa.student?.admission_no}</td>
                      <td style={{ ...tdStyle, fontWeight: 600, color: '#0f172a' }}>
                        {fa.student?.first_name} {fa.student?.last_name}
                      </td>
                      <td style={tdStyle}>{fa.student?.school_class?.class_name || 'Class'}</td>
                      <td style={tdStyle}>{fa.fee_structure?.fee_type?.fee_name || 'Tuition Fee'}</td>
                      <td style={{ ...tdStyle, fontWeight: 600 }}>${Number(fa.total_amount).toLocaleString()}</td>
                      <td style={{ ...tdStyle, color: '#059669', fontWeight: 600 }}>${Number(fa.paid_amount).toLocaleString()}</td>
                      <td style={{ ...tdStyle, color: fa.due_amount > 0 ? '#dc2626' : '#64748b', fontWeight: 700 }}>
                        ${Number(fa.due_amount).toLocaleString()}
                      </td>
                      <td style={tdStyle}>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '9999px',
                          fontSize: '11px',
                          fontWeight: 700,
                          backgroundColor: fa.status === 'Paid' ? '#ecfdf5' : fa.status === 'Partial' ? '#fffbeb' : '#fef2f2',
                          color: fa.status === 'Paid' ? '#059669' : fa.status === 'Partial' ? '#d97706' : '#dc2626'
                        }}>
                          {fa.status}
                        </span>
                      </td>
                      <td style={{ ...tdStyle, textAlign: 'right' }}>
                        {fa.due_amount > 0 ? (
                          <button
                            onClick={() => handleOpenCollect(fa)}
                            style={btnCollect}
                          >
                            + Collect Fee
                          </button>
                        ) : (
                          <span style={{ fontSize: '12px', color: '#059669', fontWeight: 600 }}>Cleared</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {activeTab === 'transactions' && (
        <div style={tableContainer}>
          <table style={tableStyle}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={thStyle}>Receipt #</th>
                <th style={thStyle}>Payment Date</th>
                <th style={thStyle}>Student Name</th>
                <th style={thStyle}>Fee Category</th>
                <th style={thStyle}>Method</th>
                <th style={thStyle}>Amount Paid</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Receipt</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ ...tdStyle, fontWeight: 700, color: '#2563eb' }}>{p.receipt_no}</td>
                  <td style={tdStyle}>{p.payment_date}</td>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>
                    {p.student?.first_name} {p.student?.last_name}
                  </td>
                  <td style={tdStyle}>{p.student_fee?.fee_structure?.fee_type?.fee_name || 'Tuition Fee'}</td>
                  <td style={tdStyle}>
                    <span style={{ padding: '2px 8px', borderRadius: '4px', backgroundColor: '#f1f5f9', fontSize: '11px', fontWeight: 600 }}>
                      {p.payment_method}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, color: '#059669', fontWeight: 700 }}>
                    ${Number(p.amount_paid).toLocaleString()}
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>
                    <button
                      onClick={() => handleViewReceipt(p.receipt_no)}
                      style={btnPrintReceipt}
                    >
                      Print Receipt
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL 1: Collect Payment */}
      {collectModalOpen && selectedAccount && (
        <div style={modalOverlay}>
          <div style={modalBox}>
            <div style={modalHeader}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Collect Fee Payment</h3>
              <button onClick={() => setCollectModalOpen(false)} style={closeBtn}>✕</button>
            </div>
            <form onSubmit={handleProcessPayment} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ backgroundColor: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }}>
                <div style={{ fontWeight: 700, fontSize: '15px', color: '#0f172a' }}>
                  {selectedAccount.student?.first_name} {selectedAccount.student?.last_name} ({selectedAccount.student?.admission_no})
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', color: '#475569' }}>
                  <span>Class: <strong>{selectedAccount.student?.school_class?.class_name || 'N/A'}</strong></span>
                  <span>Total Fee: <strong>${selectedAccount.total_amount}</strong></span>
                  <span>Outstanding Due: <strong style={{ color: '#dc2626' }}>${selectedAccount.due_amount}</strong></span>
                </div>
              </div>

              <div>
                <label style={labelStyle}>Payment Amount ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  min="1"
                  max={selectedAccount.due_amount}
                  value={paymentForm.amount_paid}
                  onChange={e => setPaymentForm({ ...paymentForm, amount_paid: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Payment Mode *</label>
                  <select
                    value={paymentForm.payment_method}
                    onChange={e => setPaymentForm({ ...paymentForm, payment_method: e.target.value })}
                    style={inputStyle}
                  >
                    <option value="Cash">Cash</option>
                    <option value="Online">Online / Card</option>
                    <option value="UPI">UPI / Digital Wallet</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Reference / Cheque #</label>
                  <input
                    type="text"
                    placeholder="e.g. TXN-894103"
                    value={paymentForm.transaction_ref}
                    onChange={e => setPaymentForm({ ...paymentForm, transaction_ref: e.target.value })}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Remarks</label>
                <input
                  type="text"
                  placeholder="e.g. Paid in full for term"
                  value={paymentForm.remarks}
                  onChange={e => setPaymentForm({ ...paymentForm, remarks: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setCollectModalOpen(false)} style={btnCancel}>Cancel</button>
                <button type="submit" disabled={submittingPayment} style={btnSavePayment}>
                  {submittingPayment ? 'Processing...' : 'Confirm Payment & Generate Receipt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Official Printable Receipt */}
      {receiptModalOpen && receiptData && (
        <div style={modalOverlay}>
          <div style={{ ...modalBox, maxWidth: '640px' }}>
            <div style={{ padding: '24px', backgroundColor: '#ffffff' }} id="printableReceipt">
              {/* School Header */}
              <div style={{ textAlign: 'center', borderBottom: '2px solid #0f172a', paddingBottom: '16px', marginBottom: '16px' }}>
                <h2 style={{ margin: '0 0 4px 0', fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>
                  {receiptData.school?.name}
                </h2>
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  {receiptData.school?.address}, {receiptData.school?.city} • Tel: {receiptData.school?.phone}
                </div>
                <div style={{ display: 'inline-block', marginTop: '10px', padding: '4px 16px', backgroundColor: '#0f172a', color: '#ffffff', borderRadius: '4px', fontSize: '11px', fontWeight: 700, letterSpacing: '1px' }}>
                  OFFICIAL FEE PAYMENT RECEIPT
                </div>
              </div>

              {/* Receipt Details Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12.5px', marginBottom: '16px', backgroundColor: '#f8fafc', padding: '12px', borderRadius: '6px' }}>
                <div><strong>Receipt No:</strong> <span style={{ color: '#2563eb' }}>{receiptData.receipt_no}</span></div>
                <div><strong>Date:</strong> {receiptData.payment_date}</div>
                <div><strong>Student Name:</strong> {receiptData.student?.name}</div>
                <div><strong>Admission #:</strong> {receiptData.student?.admission_no}</div>
                <div><strong>Class / Section:</strong> {receiptData.student?.class} (Sec {receiptData.student?.section})</div>
                <div><strong>Payment Mode:</strong> {receiptData.payment_method}</div>
              </div>

              {/* Breakdown */}
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', marginBottom: '16px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #cbd5e1', textAlign: 'left' }}>
                    <th style={{ padding: '8px' }}>Description</th>
                    <th style={{ padding: '8px', textAlign: 'right' }}>Amount Paid</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '10px 8px' }}>
                      <strong>{receiptData.fee_details?.fee_type}</strong>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{receiptData.remarks || 'Standard tuition fee installment'}</div>
                    </td>
                    <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 700, fontSize: '15px' }}>
                      ${Number(receiptData.amount_paid).toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#475569', marginBottom: '24px' }}>
                <div>Remaining Account Balance: <strong>${Number(receiptData.fee_details?.remaining_due).toFixed(2)}</strong></div>
                <div>Status: <strong style={{ color: '#059669' }}>{receiptData.fee_details?.status}</strong></div>
              </div>

              {/* Signatures */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px', paddingTop: '20px', borderTop: '1px dashed #cbd5e1', fontSize: '12px' }}>
                <div>Cashier: <strong>{receiptData.cashier}</strong></div>
                <div style={{ borderTop: '1px solid #94a3b8', paddingTop: '4px', width: '160px', textAlign: 'center' }}>
                  Authorized Signatory
                </div>
              </div>
            </div>

            {/* Modal Controls */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', padding: '14px 20px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
              <button onClick={() => setReceiptModalOpen(false)} style={btnCancel}>Close</button>
              <button
                onClick={() => window.print()}
                style={btnSavePayment}
              >
                🖨️ Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const tabBtn = {
  padding: '12px 18px',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontSize: '14px'
};

const kpiCard = {
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  border: '1px solid #e2e8f0',
  padding: '16px',
  textAlign: 'center',
  boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
};

const filterBar = {
  display: 'flex',
  gap: '12px',
  marginBottom: '20px',
  backgroundColor: '#ffffff',
  padding: '14px',
  borderRadius: '10px',
  border: '1px solid #e2e8f0'
};

const inputStyle = {
  padding: '9px 12px',
  borderRadius: '8px',
  border: '1px solid #cbd5e1',
  fontSize: '13px',
  backgroundColor: '#ffffff'
};

const tableContainer = {
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  border: '1px solid #e2e8f0',
  overflowX: 'auto',
  boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
};

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  textAlign: 'left',
  fontSize: '13.5px'
};

const thStyle = {
  padding: '14px 18px',
  fontWeight: 600,
  color: '#475569',
  fontSize: '12px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px'
};

const tdStyle = {
  padding: '12px 18px',
  color: '#334155'
};

const btnCollect = {
  padding: '6px 14px',
  backgroundColor: '#2563eb',
  color: '#ffffff',
  border: 'none',
  borderRadius: '6px',
  fontSize: '12px',
  fontWeight: 600,
  cursor: 'pointer'
};

const btnPrintReceipt = {
  padding: '5px 12px',
  backgroundColor: '#eff6ff',
  color: '#1d4ed8',
  border: '1px solid #bfdbfe',
  borderRadius: '6px',
  fontSize: '12px',
  fontWeight: 600,
  cursor: 'pointer'
};

const modalOverlay = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(15, 23, 42, 0.65)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 100,
  padding: '16px'
};

const modalBox = {
  backgroundColor: '#ffffff',
  borderRadius: '14px',
  width: '100%',
  maxWidth: '520px',
  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  overflow: 'hidden'
};

const modalHeader = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '16px 20px',
  borderBottom: '1px solid #e2e8f0',
  backgroundColor: '#f8fafc'
};

const closeBtn = {
  background: 'none',
  border: 'none',
  fontSize: '18px',
  color: '#64748b',
  cursor: 'pointer'
};

const labelStyle = {
  display: 'block',
  fontSize: '12px',
  fontWeight: 600,
  color: '#475569',
  marginBottom: '4px'
};

const btnCancel = {
  padding: '9px 14px',
  backgroundColor: '#f1f5f9',
  color: '#475569',
  border: '1px solid #cbd5e1',
  borderRadius: '8px',
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer'
};

const btnSavePayment = {
  padding: '9px 18px',
  backgroundColor: '#059669',
  color: '#ffffff',
  border: 'none',
  borderRadius: '8px',
  fontSize: '13px',
  fontWeight: 700,
  cursor: 'pointer'
};
