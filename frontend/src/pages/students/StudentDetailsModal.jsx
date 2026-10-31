import React, { useState, useEffect } from 'react';
import { studentsApi } from '../../services/api';

export default function StudentDetailsModal({ isOpen, onClose, studentId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    if (isOpen && studentId) {
      setLoading(true);
      studentsApi.getById(studentId)
        .then(res => setData(res?.data))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [isOpen, studentId]);

  if (!isOpen) return null;

  const stu = data?.student;
  const attSummary = data?.attendance_summary;

  return (
    <div style={modalOverlay}>
      <div style={modalContainer}>
        {/* Header */}
        <div style={modalHeader}>
          <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
            <div style={avatarStyle}>
              {stu?.first_name ? stu.first_name[0] : 'S'}
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                {stu?.full_name || 'Student Profile'}
              </h2>
              <div style={{ display: 'flex', gap: '8px', fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                <span>Admission No: <strong style={{ color: '#2563eb' }}>{stu?.admission_no}</strong></span>
                <span>•</span>
                <span>Class: <strong>{stu?.school_class?.class_name || 'N/A'} {stu?.section ? `(Sec ${stu.section.section_name})` : ''}</strong></span>
                <span>•</span>
                <span>Roll: <strong>#{stu?.roll_no || 'N/A'}</strong></span>
              </div>
            </div>
          </div>
          <button onClick={onClose} style={closeBtn}>✕</button>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '6px', padding: '0 24px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
          {['profile', 'attendance', 'fees', 'academics'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '12px 16px',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === tab ? '2px solid #2563eb' : '2px solid transparent',
                color: activeTab === tab ? '#2563eb' : '#64748b',
                fontWeight: activeTab === tab ? 700 : 500,
                fontSize: '13px',
                cursor: 'pointer',
                textTransform: 'capitalize'
              }}
            >
              {tab === 'profile' ? 'Profile Details' : tab === 'attendance' ? 'Attendance Record' : tab === 'fees' ? 'Fee Ledger' : 'Marks & Exams'}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div style={{ padding: '24px', overflowY: 'auto', maxHeight: '65vh' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>Loading student file...</div>
          ) : !stu ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#ef4444' }}>Record not found.</div>
          ) : (
            <>
              {/* TAB 1: Profile Details */}
              {activeTab === 'profile' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={sectionBox}>
                    <h4 style={sectionHeader}>Personal & Contact Details</h4>
                    <div style={gridStyle}>
                      <div><span style={fieldLabel}>Gender:</span> <strong>{stu.gender}</strong></div>
                      <div><span style={fieldLabel}>Date of Birth:</span> <strong>{stu.date_of_birth}</strong></div>
                      <div><span style={fieldLabel}>Blood Group:</span> <strong>{stu.blood_group || 'N/A'}</strong></div>
                      <div><span style={fieldLabel}>Admission Date:</span> <strong>{stu.admission_date}</strong></div>
                      <div><span style={fieldLabel}>Student Phone:</span> <strong>{stu.phone || 'N/A'}</strong></div>
                      <div><span style={fieldLabel}>Student Email:</span> <strong>{stu.email || 'N/A'}</strong></div>
                      <div><span style={fieldLabel}>City / State:</span> <strong>{stu.city || 'N/A'}</strong></div>
                      <div><span style={fieldLabel}>Status:</span> <span style={{ color: '#059669', fontWeight: 700 }}>{stu.status}</span></div>
                    </div>
                  </div>

                  <div style={sectionBox}>
                    <h4 style={sectionHeader}>Parent / Guardian Information</h4>
                    <div style={gridStyle}>
                      <div><span style={fieldLabel}>Parent Name:</span> <strong>{stu.parent_name}</strong></div>
                      <div><span style={fieldLabel}>Relationship:</span> <strong>{stu.parent_relation}</strong></div>
                      <div><span style={fieldLabel}>Parent Phone:</span> <strong>{stu.parent_phone}</strong></div>
                      <div><span style={fieldLabel}>Occupation:</span> <strong>{stu.parent_occupation || 'N/A'}</strong></div>
                      <div><span style={fieldLabel}>Emergency Contact:</span> <strong>{stu.emergency_contact || stu.parent_phone}</strong></div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Attendance */}
              {activeTab === 'attendance' && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
                    <div style={kpiBox}>
                      <div style={{ fontSize: '24px', fontWeight: 800, color: '#2563eb' }}>{attSummary?.attendance_rate}%</div>
                      <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Attendance Percentage</div>
                    </div>
                    <div style={kpiBox}>
                      <div style={{ fontSize: '24px', fontWeight: 800, color: '#059669' }}>{attSummary?.present_days}</div>
                      <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Days Present</div>
                    </div>
                    <div style={kpiBox}>
                      <div style={{ fontSize: '24px', fontWeight: 800, color: '#ef4444' }}>{attSummary?.absent_days}</div>
                      <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Days Absent</div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: Fee Ledger */}
              {activeTab === 'fees' && (
                <div>
                  {stu.fees && stu.fees.length > 0 ? (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                          <th style={{ padding: '10px' }}>Fee Type</th>
                          <th style={{ padding: '10px' }}>Total Amount</th>
                          <th style={{ padding: '10px' }}>Paid</th>
                          <th style={{ padding: '10px' }}>Remaining Due</th>
                          <th style={{ padding: '10px' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stu.fees.map(f => (
                          <tr key={f.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '10px', fontWeight: 600 }}>{f.fee_structure?.fee_type?.fee_name || 'Standard Tuition'}</td>
                            <td style={{ padding: '10px' }}>${Number(f.total_amount).toLocaleString()}</td>
                            <td style={{ padding: '10px', color: '#059669', fontWeight: 600 }}>${Number(f.paid_amount).toLocaleString()}</td>
                            <td style={{ padding: '10px', color: '#dc2626', fontWeight: 600 }}>${Number(f.due_amount).toLocaleString()}</td>
                            <td style={{ padding: '10px' }}>
                              <span style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, backgroundColor: f.status === 'Paid' ? '#ecfdf5' : '#fef2f2', color: f.status === 'Paid' ? '#059669' : '#dc2626' }}>
                                {f.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>No fee records assigned yet.</div>
                  )}
                </div>
              )}

              {/* TAB 4: Academics & Marks */}
              {activeTab === 'academics' && (
                <div>
                  {stu.marks && stu.marks.length > 0 ? (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                          <th style={{ padding: '10px' }}>Examination</th>
                          <th style={{ padding: '10px' }}>Subject</th>
                          <th style={{ padding: '10px' }}>Max Marks</th>
                          <th style={{ padding: '10px' }}>Obtained</th>
                          <th style={{ padding: '10px' }}>Grade</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stu.marks.map(m => (
                          <tr key={m.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '10px', fontWeight: 600 }}>{m.examination?.exam_name || 'Exam'}</td>
                            <td style={{ padding: '10px' }}>{m.subject?.subject_name || 'Subject'}</td>
                            <td style={{ padding: '10px' }}>{m.max_marks}</td>
                            <td style={{ padding: '10px', fontWeight: 700, color: '#2563eb' }}>{m.is_absent ? 'Absent' : m.marks_obtained}</td>
                            <td style={{ padding: '10px', fontWeight: 700 }}>{m.grade}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>No examination scores posted yet.</div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <div style={{ padding: '16px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', backgroundColor: '#f8fafc' }}>
          <button onClick={onClose} style={closeBtnStyle}>Close</button>
        </div>
      </div>
    </div>
  );
}

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

const modalContainer = {
  backgroundColor: '#ffffff',
  borderRadius: '14px',
  width: '100%',
  maxWidth: '740px',
  maxHeight: '90vh',
  display: 'flex',
  flexDirection: 'column',
  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  overflow: 'hidden'
};

const modalHeader = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '18px 24px',
  borderBottom: '1px solid #e2e8f0',
  backgroundColor: '#ffffff'
};

const avatarStyle = {
  width: '44px',
  height: '44px',
  borderRadius: '50%',
  backgroundColor: '#2563eb',
  color: '#ffffff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: '800',
  fontSize: '18px'
};

const closeBtn = {
  background: 'none',
  border: 'none',
  fontSize: '18px',
  color: '#64748b',
  cursor: 'pointer'
};

const closeBtnStyle = {
  padding: '8px 18px',
  backgroundColor: '#f1f5f9',
  color: '#475569',
  border: '1px solid #cbd5e1',
  borderRadius: '6px',
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer'
};

const sectionBox = {
  backgroundColor: '#f8fafc',
  borderRadius: '10px',
  border: '1px solid #e2e8f0',
  padding: '16px'
};

const sectionHeader = {
  margin: '0 0 12px 0',
  fontSize: '13px',
  fontWeight: 700,
  color: '#2563eb',
  textTransform: 'uppercase',
  letterSpacing: '0.4px'
};

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '10px',
  fontSize: '13px'
};

const fieldLabel = {
  color: '#64748b',
  marginRight: '6px'
};

const kpiBox = {
  backgroundColor: '#f8fafc',
  padding: '16px',
  borderRadius: '10px',
  border: '1px solid #e2e8f0',
  textAlign: 'center'
};
