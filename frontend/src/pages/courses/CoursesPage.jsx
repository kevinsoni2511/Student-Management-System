import React, { useEffect, useState } from 'react';
import { coursesApi } from '../../services/api';

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [courseToEdit, setCourseToEdit] = useState(null);
  const [formData, setFormData] = useState({
    course_name: '',
    course_code: '',
    duration: '',
    fees: '',
    description: '',
    status: 'Active'
  });
  const [formErrors, setFormErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [saving, setSaving] = useState(false);

  // Delete State
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const fetchCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await coursesApi.getAll();
      setCourses(res?.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load courses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleOpenAdd = () => {
    setCourseToEdit(null);
    setFormData({
      course_name: '',
      course_code: '',
      duration: '',
      fees: '',
      description: '',
      status: 'Active'
    });
    setFormErrors({});
    setServerError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (course) => {
    setCourseToEdit(course);
    setFormData({
      course_name: course.course_name || '',
      course_code: course.course_code || '',
      duration: course.duration || '',
      fees: course.fees || '',
      description: course.description || '',
      status: course.status || 'Active'
    });
    setFormErrors({});
    setServerError('');
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: null }));
    if (serverError) setServerError('');
  };

  const validate = () => {
    const errs = {};
    if (!formData.course_name.trim()) errs.course_name = 'Course name is required.';
    if (!formData.course_code.trim()) errs.course_code = 'Course code is required.';
    if (formData.fees === '' || Number(formData.fees) < 0) errs.fees = 'Valid fee is required.';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSaving(true);
      setServerError('');
      if (courseToEdit) {
        await coursesApi.update(courseToEdit.id, formData);
      } else {
        await coursesApi.create(formData);
      }
      setIsModalOpen(false);
      fetchCourses();
    } catch (err) {
      const msg = err?.data?.message || (err?.data?.errors ? Object.values(err.data.errors).flat().join(' ') : null) || err.message;
      setServerError(msg || 'Failed to save course.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!courseToDelete) return;
    try {
      setDeleting(true);
      setDeleteError('');
      await coursesApi.delete(courseToDelete.id);
      setCourseToDelete(null);
      fetchCourses();
    } catch (err) {
      setDeleteError(err?.data?.message || err.message || 'Cannot delete course.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Bar */}
      <div style={styles.topBar}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
            Academic Course Management
          </h2>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0 0' }}>
            Manage curriculum programs, tuition fees, and student enrollments
          </p>
        </div>
        <button onClick={handleOpenAdd} className="btn btn-primary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>Add New Course</span>
        </button>
      </div>

      {/* Courses List Table */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center' }}>
            <div style={styles.spinner} />
            <p style={{ color: '#64748b', fontSize: '13px', marginTop: '12px' }}>Loading courses...</p>
          </div>
        ) : error ? (
          <div style={{ padding: '36px', textAlign: 'center', color: '#b91c1c' }}>
            <p>{error}</p>
            <button onClick={fetchCourses} className="btn btn-secondary btn-sm" style={{ marginTop: '10px' }}>
              Retry
            </button>
          </div>
        ) : courses.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: '40px' }}>📚</div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', marginTop: '8px' }}>No Courses Found</h3>
            <p style={{ color: '#64748b', fontSize: '13px', maxWidth: '400px', margin: '4px auto 16px auto' }}>
              Create your institute's first academic course to begin enrolling students.
            </p>
            <button onClick={handleOpenAdd} className="btn btn-primary btn-sm">
              Add Course Now
            </button>
          </div>
        ) : (
          <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Course Code</th>
                  <th>Course Name</th>
                  <th>Duration</th>
                  <th>Tuition Fees</th>
                  <th>Enrolled Students</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course.id}>
                    <td>
                      <span style={styles.codeBadge}>{course.course_code}</span>
                    </td>
                    <td>
                      <strong style={{ color: '#0f172a' }}>{course.course_name}</strong>
                      {course.description && (
                        <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
                          {course.description}
                        </p>
                      )}
                    </td>
                    <td>{course.duration || 'Flexible'}</td>
                    <td>
                      <strong style={{ color: '#059669' }}>
                        ${Number(course.fees).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </strong>
                    </td>
                    <td>
                      <span style={styles.studentBadge}>
                        {course.students_count ?? 0} Students
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-${(course.status || 'Active').toLowerCase()}`}>
                        {course.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          onClick={() => handleOpenEdit(course)}
                          className="btn btn-secondary btn-sm"
                          title="Edit Course"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setDeleteError('');
                            setCourseToDelete(course);
                          }}
                          className="btn btn-danger btn-sm"
                          title="Delete Course"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Course Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h3 className="modal-title">
                {courseToEdit ? `Edit Course: ${courseToEdit.course_code}` : 'Add New Academic Course'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="modal-close">&times;</button>
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
                    Course Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="course_name"
                    value={formData.course_name}
                    onChange={handleChange}
                    placeholder="e.g. Full Stack Web Development"
                    className="form-control"
                  />
                  {formErrors.course_name && <small style={styles.error}>{formErrors.course_name}</small>}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">
                      Course Code <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      name="course_code"
                      value={formData.course_code}
                      onChange={handleChange}
                      placeholder="e.g. CS-101"
                      className="form-control"
                    />
                    {formErrors.course_code && <small style={styles.error}>{formErrors.course_code}</small>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Duration</label>
                    <input
                      type="text"
                      name="duration"
                      value={formData.duration}
                      onChange={handleChange}
                      placeholder="e.g. 6 Months"
                      className="form-control"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">
                      Tuition Fees ($) <span className="required">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      name="fees"
                      value={formData.fees}
                      onChange={handleChange}
                      placeholder="1200.00"
                      className="form-control"
                    />
                    {formErrors.fees && <small style={styles.error}>{formErrors.fees}</small>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Course Status</label>
                    <select name="status" value={formData.status} onChange={handleChange} className="form-control">
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Course Description</label>
                  <textarea
                    name="description"
                    rows="3"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Summary of course curriculum and outcomes..."
                    className="form-control"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary" disabled={saving}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : courseToEdit ? 'Update Course' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {courseToDelete && (
        <div className="modal-overlay" onClick={() => setCourseToDelete(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ color: '#ef4444' }}>Delete Academic Course</h3>
              <button onClick={() => setCourseToDelete(null)} className="modal-close">&times;</button>
            </div>
            <div className="modal-body">
              {deleteError ? (
                <div style={{ padding: '12px', backgroundColor: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '8px', color: '#b91c1c', fontSize: '13px' }}>
                  <strong>Deletion Blocked:</strong> {deleteError}
                </div>
              ) : (
                <>
                  <p style={{ fontSize: '14px', color: '#475569', margin: 0 }}>
                    Are you sure you want to delete course <strong>{courseToDelete.course_name}</strong> (<code>{courseToDelete.course_code}</code>)?
                  </p>
                  {courseToDelete.students_count > 0 && (
                    <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '6px', fontSize: '12px', color: '#92400e' }}>
                      ⚠️ <strong>Warning:</strong> {courseToDelete.students_count} students are currently enrolled in this course. You must reassign them before deletion.
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="modal-footer">
              <button onClick={() => setCourseToDelete(null)} className="btn btn-secondary" disabled={deleting}>
                {deleteError ? 'Close' : 'Cancel'}
              </button>
              {!deleteError && (
                <button onClick={handleDelete} className="btn btn-danger" disabled={deleting}>
                  {deleting ? 'Deleting...' : 'Delete Course'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  topBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '12px'
  },
  spinner: {
    width: '32px',
    height: '32px',
    border: '3px solid #e2e8f0',
    borderTopColor: '#2563eb',
    borderRadius: '50%',
    margin: '0 auto',
    animation: 'spin 0.8s linear infinite'
  },
  codeBadge: {
    display: 'inline-block',
    padding: '3px 8px',
    backgroundColor: '#f5f3ff',
    color: '#8b5cf6',
    borderRadius: '6px',
    fontWeight: '600',
    fontSize: '12px'
  },
  studentBadge: {
    display: 'inline-block',
    padding: '3px 8px',
    backgroundColor: '#eff6ff',
    color: '#2563eb',
    borderRadius: '6px',
    fontWeight: '600',
    fontSize: '12px'
  },
  error: {
    color: '#ef4444',
    fontSize: '12px',
    marginTop: '4px',
    display: 'block'
  }
};
