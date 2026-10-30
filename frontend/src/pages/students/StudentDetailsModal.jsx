import React from 'react';

export default function StudentDetailsModal({ isOpen, onClose, student, onEdit }) {
  if (!isOpen || !student) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={styles.avatar}>
              {(student.full_name || 'S')[0].toUpperCase()}
            </div>
            <div>
              <h3 className="modal-title">{student.full_name}</h3>
              <span style={styles.codeBadge}>{student.student_code}</span>
            </div>
          </div>
          <button onClick={onClose} className="modal-close">&times;</button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Status Bar */}
          <div style={styles.statusBar}>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>Academic Enrollment Status</span>
            <span className={`badge badge-${(student.status || 'Active').toLowerCase()}`}>
              {student.status}
            </span>
          </div>

          {/* Contact Details */}
          <div style={styles.section}>
            <h4 style={styles.sectionTitle}>Contact & Personal Details</h4>
            <div style={styles.grid}>
              <div style={styles.item}>
                <span style={styles.label}>Email Address</span>
                <span style={styles.value}>{student.email || 'N/A'}</span>
              </div>
              <div style={styles.item}>
                <span style={styles.label}>Phone Number</span>
                <span style={styles.value}>{student.phone || 'N/A'}</span>
              </div>
              <div style={styles.item}>
                <span style={styles.label}>Gender</span>
                <span style={styles.value}>{student.gender || 'Not specified'}</span>
              </div>
              <div style={styles.item}>
                <span style={styles.label}>Date of Birth</span>
                <span style={styles.value}>{student.date_of_birth || 'Not recorded'}</span>
              </div>
            </div>

            <div style={{ marginTop: '12px' }}>
              <span style={styles.label}>Residential Address</span>
              <p style={{ ...styles.value, margin: '4px 0 0 0' }}>{student.address || 'No physical address provided'}</p>
            </div>
          </div>

          {/* Academic Information */}
          <div style={styles.section}>
            <h4 style={styles.sectionTitle}>Academic Information</h4>
            <div style={styles.grid}>
              <div style={styles.item}>
                <span style={styles.label}>Enrolled Course</span>
                <strong style={{ ...styles.value, color: '#2563eb' }}>
                  {student.course?.course_name || 'Unassigned'}
                </strong>
              </div>
              <div style={styles.item}>
                <span style={styles.label}>Course Code</span>
                <span style={styles.value}>{student.course?.course_code || 'N/A'}</span>
              </div>
              <div style={styles.item}>
                <span style={styles.label}>Admission Date</span>
                <span style={styles.value}>{student.admission_date || 'N/A'}</span>
              </div>
              <div style={styles.item}>
                <span style={styles.label}>Registration Timestamp</span>
                <span style={styles.value}>
                  {student.created_at ? new Date(student.created_at).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" onClick={onClose} className="btn btn-secondary">
            Close
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onEdit(student);
            }}
            className="btn btn-primary"
          >
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  avatar: {
    width: '46px',
    height: '46px',
    borderRadius: '12px',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '800',
    fontSize: '20px'
  },
  codeBadge: {
    display: 'inline-block',
    fontSize: '12px',
    fontWeight: '600',
    color: '#2563eb',
    backgroundColor: '#eff6ff',
    padding: '2px 8px',
    borderRadius: '4px',
    marginTop: '2px'
  },
  statusBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    border: '1px solid #e2e8f0'
  },
  section: {
    padding: '16px',
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    border: '1px solid #e2e8f0'
  },
  sectionTitle: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#0f172a',
    margin: '0 0 12px 0',
    borderBottom: '1px solid #f1f5f9',
    paddingBottom: '8px'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px'
  },
  item: {
    display: 'flex',
    flexDirection: 'column'
  },
  label: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.4px'
  },
  value: {
    fontSize: '13px',
    color: '#0f172a',
    fontWeight: '500',
    marginTop: '2px'
  }
};
