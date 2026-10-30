import React, { useState, useEffect } from 'react';
import { studentsApi } from '../../services/api';

export default function StudentModal({ isOpen, onClose, onSaved, studentToEdit, courses = [] }) {
  const isEditing = Boolean(studentToEdit);

  const initialFormState = {
    full_name: '',
    email: '',
    phone: '',
    gender: 'Male',
    date_of_birth: '',
    address: '',
    course_id: '',
    admission_date: new Date().toISOString().split('T')[0],
    status: 'Active'
  };

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    if (studentToEdit) {
      setFormData({
        full_name: studentToEdit.full_name || '',
        email: studentToEdit.email || '',
        phone: studentToEdit.phone || '',
        gender: studentToEdit.gender || 'Male',
        date_of_birth: studentToEdit.date_of_birth || '',
        address: studentToEdit.address || '',
        course_id: studentToEdit.course_id || (courses[0]?.id ?? ''),
        admission_date: studentToEdit.admission_date || '',
        status: studentToEdit.status || 'Active'
      });
    } else {
      setFormData({
        ...initialFormState,
        course_id: courses[0]?.id ?? ''
      });
    }
    setErrors({});
    setServerError('');
  }, [studentToEdit, isOpen, courses]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
    if (serverError) setServerError('');
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.full_name.trim()) newErrors.full_name = 'Full name is required.';
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Enter a valid email address.';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required.';
    }
    if (!formData.admission_date) {
      newErrors.admission_date = 'Admission date is required.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSaving(true);
      setServerError('');
      if (isEditing) {
        await studentsApi.update(studentToEdit.id, formData);
      } else {
        await studentsApi.create(formData);
      }
      onSaved();
      onClose();
    } catch (err) {
      const msg = err?.data?.message || (err?.data?.errors ? Object.values(err.data.errors).flat().join(' ') : null) || err.message;
      setServerError(msg || 'Failed to save student record.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title">
              {isEditing ? `Edit Student: ${studentToEdit.student_code}` : 'Register New Student'}
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0 0' }}>
              {isEditing ? 'Update student profile information in MySQL' : 'Add new student admission with unique student code'}
            </p>
          </div>
          <button onClick={onClose} className="modal-close">&times;</button>
        </div>

        {serverError && (
          <div style={{ margin: '16px 24px 0 24px', padding: '12px', backgroundColor: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '8px', color: '#b91c1c', fontSize: '13px' }}>
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">
                Full Name <span className="required">*</span>
              </label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="e.g. Rahul Sharma"
                className="form-control"
              />
              {errors.full_name && <small style={styles.error}>{errors.full_name}</small>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  Email Address <span className="required">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="rahul@example.com"
                  className="form-control"
                />
                {errors.email && <small style={styles.error}>{errors.email}</small>}
              </div>

              <div className="form-group">
                <label className="form-label">
                  Phone Number <span className="required">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  className="form-control"
                />
                {errors.phone && <small style={styles.error}>{errors.phone}</small>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange} className="form-control">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Date of Birth</label>
                <input
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Course</label>
                <select name="course_id" value={formData.course_id} onChange={handleChange} className="form-control">
                  <option value="">Select Enrolled Course</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.course_name} ({c.course_code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Student Status</label>
                <select name="status" value={formData.status} onChange={handleChange} className="form-control">
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Graduated">Graduated</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Admission Date <span className="required">*</span>
              </label>
              <input
                type="date"
                name="admission_date"
                value={formData.admission_date}
                onChange={handleChange}
                className="form-control"
              />
              {errors.admission_date && <small style={styles.error}>{errors.admission_date}</small>}
            </div>

            <div className="form-group">
              <label className="form-label">Residential Address</label>
              <textarea
                name="address"
                rows="2"
                value={formData.address}
                onChange={handleChange}
                placeholder="Residential address details"
                className="form-control"
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary" disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : isEditing ? 'Update Student Record' : 'Save Student Admission'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  error: {
    color: '#ef4444',
    fontSize: '12px',
    marginTop: '4px',
    display: 'block',
    fontWeight: '500'
  }
};
