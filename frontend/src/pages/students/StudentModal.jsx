import React, { useState, useEffect } from 'react';
import { studentsApi } from '../../services/api';

export default function StudentModal({ isOpen, onClose, onSaved, studentToEdit, classes = [], sessions = [] }) {
  const isEditing = Boolean(studentToEdit);

  const initialFormState = {
    academic_session_id: sessions[0]?.id || 1,
    class_id: classes[0]?.id || 1,
    section_id: '',
    roll_no: '',
    first_name: '',
    last_name: '',
    gender: 'Male',
    date_of_birth: '2012-05-10',
    blood_group: 'O+',
    phone: '',
    email: '',
    address: '',
    city: 'Bangalore',
    admission_date: new Date().toISOString().split('T')[0],
    previous_school: '',
    parent_name: '',
    parent_relation: 'Father',
    parent_phone: '',
    parent_occupation: 'Professional',
    status: 'Active'
  };

  const [formData, setFormData] = useState(initialFormState);
  const [selectedClassSections, setSelectedClassSections] = useState([]);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    if (studentToEdit) {
      setFormData({
        academic_session_id: studentToEdit.academic_session_id || sessions[0]?.id || 1,
        class_id: studentToEdit.class_id || classes[0]?.id || 1,
        section_id: studentToEdit.section_id || '',
        roll_no: studentToEdit.roll_no || '',
        first_name: studentToEdit.first_name || '',
        last_name: studentToEdit.last_name || '',
        gender: studentToEdit.gender || 'Male',
        date_of_birth: studentToEdit.date_of_birth ? studentToEdit.date_of_birth.substring(0, 10) : '2012-05-10',
        blood_group: studentToEdit.blood_group || 'O+',
        phone: studentToEdit.phone || '',
        email: studentToEdit.email || '',
        address: studentToEdit.address || '',
        city: studentToEdit.city || 'Bangalore',
        admission_date: studentToEdit.admission_date ? studentToEdit.admission_date.substring(0, 10) : new Date().toISOString().split('T')[0],
        previous_school: studentToEdit.previous_school || '',
        parent_name: studentToEdit.parent_name || '',
        parent_relation: studentToEdit.parent_relation || 'Father',
        parent_phone: studentToEdit.parent_phone || '',
        parent_occupation: studentToEdit.parent_occupation || 'Professional',
        status: studentToEdit.status || 'Active'
      });
    } else {
      setFormData({
        ...initialFormState,
        academic_session_id: sessions[0]?.id || 1,
        class_id: classes[0]?.id || 1
      });
    }
    setErrors({});
    setServerError('');
  }, [studentToEdit, isOpen, classes, sessions]);

  // Update available sections when class changes
  useEffect(() => {
    const selClass = classes.find(c => String(c.id) === String(formData.class_id));
    if (selClass && selClass.sections) {
      setSelectedClassSections(selClass.sections);
      if (!isEditing && selClass.sections.length > 0 && !formData.section_id) {
        setFormData(prev => ({ ...prev, section_id: selClass.sections[0].id }));
      }
    } else {
      setSelectedClassSections([]);
    }
  }, [formData.class_id, classes, isEditing]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
    if (serverError) setServerError('');
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.first_name.trim()) newErrors.first_name = 'First name is required.';
    if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required.';
    if (!formData.date_of_birth) newErrors.date_of_birth = 'Date of birth is required.';
    if (!formData.admission_date) newErrors.admission_date = 'Admission date is required.';
    if (!formData.parent_name.trim()) newErrors.parent_name = 'Parent/Guardian name is required.';
    if (!formData.parent_phone.trim()) newErrors.parent_phone = 'Parent phone is required.';
    if (!formData.class_id) newErrors.class_id = 'Class selection is required.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    setServerError('');

    try {
      if (isEditing) {
        await studentsApi.update(studentToEdit.id, formData);
      } else {
        await studentsApi.create(formData);
      }
      onSaved();
      onClose();
    } catch (err) {
      setServerError(err.message || 'Failed to save student admission.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={modalOverlay}>
      <div style={modalContainer}>
        <div style={modalHeader}>
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
              {isEditing ? `Edit Student: ${studentToEdit.full_name}` : 'New Student Admission'}
            </h2>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              {isEditing ? `Admission No: ${studentToEdit.admission_no}` : 'Auto-generates unique admission number & assigns class fee schedule.'}
            </span>
          </div>
          <button onClick={onClose} style={closeBtn}>✕</button>
        </div>

        {serverError && (
          <div style={{ margin: '16px 24px 0 24px', padding: '12px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: '8px', fontSize: '13px' }}>
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} style={formStyle}>
          {/* SECTION 1: Academic Enrollment */}
          <div style={formSection}>
            <h4 style={sectionHeading}>1. Academic Enrollment</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px' }}>
              <div>
                <label style={labelStyle}>Academic Session *</label>
                <select name="academic_session_id" value={formData.academic_session_id} onChange={handleChange} style={inputStyle}>
                  {sessions.map(s => (
                    <option key={s.id} value={s.id}>{s.session_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Class *</label>
                <select name="class_id" value={formData.class_id} onChange={handleChange} style={inputStyle}>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.class_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Section</label>
                <select name="section_id" value={formData.section_id} onChange={handleChange} style={inputStyle}>
                  <option value="">-- None --</option>
                  {selectedClassSections.map(sec => (
                    <option key={sec.id} value={sec.id}>Section {sec.section_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Roll Number</label>
                <input
                  type="text"
                  name="roll_no"
                  placeholder="e.g. 15"
                  value={formData.roll_no}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: Student Personal Info */}
          <div style={formSection}>
            <h4 style={sectionHeading}>2. Student Personal Information</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={labelStyle}>First Name *</label>
                <input
                  type="text"
                  name="first_name"
                  placeholder="e.g. Aarav"
                  value={formData.first_name}
                  onChange={handleChange}
                  style={{ ...inputStyle, ...(errors.first_name ? { borderColor: '#ef4444' } : {}) }}
                />
                {errors.first_name && <span style={errorText}>{errors.first_name}</span>}
              </div>

              <div>
                <label style={labelStyle}>Last Name *</label>
                <input
                  type="text"
                  name="last_name"
                  placeholder="e.g. Sharma"
                  value={formData.last_name}
                  onChange={handleChange}
                  style={{ ...inputStyle, ...(errors.last_name ? { borderColor: '#ef4444' } : {}) }}
                />
                {errors.last_name && <span style={errorText}>{errors.last_name}</span>}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={labelStyle}>Gender *</label>
                <select name="gender" value={formData.gender} onChange={handleChange} style={inputStyle}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>Date of Birth *</label>
                <input
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Blood Group</label>
                <select name="blood_group" value={formData.blood_group} onChange={handleChange} style={inputStyle}>
                  {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Admission Date *</label>
                <input
                  type="date"
                  name="admission_date"
                  value={formData.admission_date}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={labelStyle}>Student Phone</label>
                <input
                  type="text"
                  name="phone"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Student Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="student@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: Parent & Guardian Details */}
          <div style={formSection}>
            <h4 style={sectionHeading}>3. Parent / Guardian Details</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={labelStyle}>Parent / Guardian Name *</label>
                <input
                  type="text"
                  name="parent_name"
                  placeholder="e.g. Ramesh Sharma"
                  value={formData.parent_name}
                  onChange={handleChange}
                  style={{ ...inputStyle, ...(errors.parent_name ? { borderColor: '#ef4444' } : {}) }}
                />
                {errors.parent_name && <span style={errorText}>{errors.parent_name}</span>}
              </div>

              <div>
                <label style={labelStyle}>Relationship</label>
                <select name="parent_relation" value={formData.parent_relation} onChange={handleChange} style={inputStyle}>
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Guardian">Guardian</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>Parent Phone *</label>
                <input
                  type="text"
                  name="parent_phone"
                  placeholder="+91 98111 22233"
                  value={formData.parent_phone}
                  onChange={handleChange}
                  style={{ ...inputStyle, ...(errors.parent_phone ? { borderColor: '#ef4444' } : {}) }}
                />
                {errors.parent_phone && <span style={errorText}>{errors.parent_phone}</span>}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <div>
                <label style={labelStyle}>Parent Occupation</label>
                <input
                  type="text"
                  name="parent_occupation"
                  placeholder="e.g. Engineer, Business"
                  value={formData.parent_occupation}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>City</label>
                <input
                  type="text"
                  name="city"
                  placeholder="e.g. Bangalore"
                  value={formData.city}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Enrollment Status</label>
                <select name="status" value={formData.status} onChange={handleChange} style={inputStyle}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Alumni">Alumni</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>
            </div>
          </div>

          <div style={modalFooter}>
            <button type="button" onClick={onClose} style={btnCancel}>Cancel</button>
            <button type="submit" disabled={saving} style={btnSubmit}>
              {saving ? 'Processing...' : isEditing ? 'Update Student Record' : 'Enroll & Admit Student'}
            </button>
          </div>
        </form>
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
  maxWidth: '780px',
  maxHeight: '92vh',
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
  backgroundColor: '#f8fafc'
};

const closeBtn = {
  background: 'none',
  border: 'none',
  fontSize: '18px',
  color: '#64748b',
  cursor: 'pointer'
};

const formStyle = {
  padding: '24px',
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
  gap: '20px'
};

const formSection = {
  backgroundColor: '#f8fafc',
  padding: '16px',
  borderRadius: '10px',
  border: '1px solid #e2e8f0'
};

const sectionHeading = {
  margin: '0 0 14px 0',
  fontSize: '13px',
  fontWeight: 700,
  color: '#2563eb',
  textTransform: 'uppercase',
  letterSpacing: '0.5px'
};

const labelStyle = {
  display: 'block',
  fontSize: '11.5px',
  fontWeight: 600,
  color: '#475569',
  marginBottom: '4px'
};

const inputStyle = {
  width: '100%',
  padding: '9px 12px',
  borderRadius: '6px',
  border: '1px solid #cbd5e1',
  fontSize: '13px',
  backgroundColor: '#ffffff',
  boxSizing: 'border-box'
};

const errorText = {
  color: '#ef4444',
  fontSize: '11px',
  marginTop: '2px',
  display: 'block'
};

const modalFooter = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '12px',
  paddingTop: '12px',
  borderTop: '1px solid #e2e8f0'
};

const btnCancel = {
  padding: '10px 18px',
  backgroundColor: '#f1f5f9',
  color: '#475569',
  border: '1px solid #cbd5e1',
  borderRadius: '8px',
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer'
};

const btnSubmit = {
  padding: '10px 22px',
  backgroundColor: '#2563eb',
  color: '#ffffff',
  border: 'none',
  borderRadius: '8px',
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer',
  boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)'
};
