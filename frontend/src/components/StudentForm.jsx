import React, { useState } from 'react';

/**
 * StudentForm Component
 * Controlled form inside a modal dialog to register or edit a student record.
 * Uses React useState hook to manage form field values and validation errors.
 */
export default function StudentForm({ isOpen, onClose, onSaveStudent, courses = [] }) {
  // Initial empty form state
  const initialFormState = {
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    gender: 'Male',
    date_of_birth: '',
    address: '',
    course_id: courses.length > 0 ? courses[0].id : '',
    admission_date: new Date().toISOString().split('T')[0],
    status: 'Active'
  };

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});

  // If modal is closed, render nothing
  if (!isOpen) return null;

  // Handle controlled input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    // Clear error for this field when user types
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null
      }));
    }
  };

  // Frontend validation before submission
  const validate = () => {
    const newErrors = {};

    if (!formData.first_name.trim()) newErrors.first_name = 'First name is required.';
    if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required.';

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email format.';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required.';
    } else if (formData.phone.trim().length < 8) {
      newErrors.phone = 'Phone number should be at least 8 digits.';
    }

    if (!formData.admission_date) {
      newErrors.admission_date = 'Admission date is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form submission handler
  const handleSubmit = (e) => {
    e.preventDefault();

    if (validate()) {
      if (onSaveStudent) {
        onSaveStudent(formData);
      }
      // Reset form and close
      setFormData(initialFormState);
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Register New Student</h3>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0 0' }}>
              Fill in student personal and academic admission details
            </p>
          </div>
          <button onClick={onClose} className="modal-close" aria-label="Close">
            &times;
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Row 1: First Name & Last Name */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  First Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  placeholder="e.g. Rahul"
                  className="form-control"
                  style={errors.first_name ? { borderColor: '#ef4444' } : {}}
                />
                {errors.first_name && <small style={styles.errorText}>{errors.first_name}</small>}
              </div>

              <div className="form-group">
                <label className="form-label">
                  Last Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  placeholder="e.g. Sharma"
                  className="form-control"
                  style={errors.last_name ? { borderColor: '#ef4444' } : {}}
                />
                {errors.last_name && <small style={styles.errorText}>{errors.last_name}</small>}
              </div>
            </div>

            {/* Row 2: Email & Phone */}
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
                  style={errors.email ? { borderColor: '#ef4444' } : {}}
                />
                {errors.email && <small style={styles.errorText}>{errors.email}</small>}
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
                  style={errors.phone ? { borderColor: '#ef4444' } : {}}
                />
                {errors.phone && <small style={styles.errorText}>{errors.phone}</small>}
              </div>
            </div>

            {/* Row 3: Gender & Date of Birth */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="form-control"
                >
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

            {/* Row 4: Course Selection & Status */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Enrolled Course</label>
                <select
                  name="course_id"
                  value={formData.course_id}
                  onChange={handleChange}
                  className="form-control"
                >
                  <option value="">Select Academic Course</option>
                  {courses.length > 0 ? (
                    courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.course_name} ({course.course_code})
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="1">Full Stack Web Development (CS-101)</option>
                      <option value="2">Data Science & AI (DS-201)</option>
                      <option value="3">Cyber Security Fundamentals (SEC-301)</option>
                    </>
                  )}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Student Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="form-control"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Graduated">Graduated</option>
                </select>
              </div>
            </div>

            {/* Row 5: Admission Date */}
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
            </div>

            {/* Row 6: Address */}
            <div className="form-group">
              <label className="form-label">Residential Address</label>
              <textarea
                name="address"
                rows="2"
                value={formData.address}
                onChange={handleChange}
                placeholder="House No, Street, City, State, PIN"
                className="form-control"
              />
            </div>
          </div>

          {/* Modal Footer Buttons */}
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Student Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  errorText: {
    color: '#ef4444',
    fontSize: '12px',
    marginTop: '4px',
    display: 'block',
    fontWeight: '500'
  }
};
