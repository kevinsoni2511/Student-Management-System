import React, { useEffect, useState, useCallback } from 'react';
import { studentsApi, coursesApi } from '../../services/api';
import StudentModal from './StudentModal';
import StudentDetailsModal from './StudentDetailsModal';

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0, per_page: 10 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Search & Pagination
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState(null);
  const [studentToView, setStudentToView] = useState(null);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch courses list for filters & modals
  useEffect(() => {
    coursesApi.getAll().then((res) => {
      setCourses(res?.data || []);
    }).catch(() => {});
  }, []);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await studentsApi.getAll({
        search,
        course_id: courseFilter,
        gender: genderFilter,
        status: statusFilter,
        sort_by: sortBy,
        sort_order: sortOrder,
        page,
        per_page: perPage
      });

      setStudents(res?.data || []);
      if (res?.meta) {
        setMeta(res.meta);
      } else {
        setMeta({
          current_page: res?.current_page || 1,
          last_page: res?.last_page || 1,
          total: res?.total || res?.data?.length || 0,
          per_page: res?.per_page || perPage
        });
      }
    } catch (err) {
      setError(err.message || 'Failed to load students.');
    } finally {
      setLoading(false);
    }
  }, [search, courseFilter, genderFilter, statusFilter, sortBy, sortOrder, page, perPage]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleOpenAdd = () => {
    setStudentToEdit(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (student) => {
    setStudentToEdit(student);
    setIsFormOpen(true);
  };

  const handleDelete = async () => {
    if (!studentToDelete) return;
    try {
      setDeleting(true);
      await studentsApi.delete(studentToDelete.id);
      setStudentToDelete(null);
      fetchStudents();
    } catch (err) {
      alert(err.message || 'Failed to delete student.');
    } finally {
      setDeleting(false);
    }
  };

  const resetFilters = () => {
    setSearch('');
    setCourseFilter('');
    setGenderFilter('');
    setStatusFilter('');
    setPage(1);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Header & Actions */}
      <div style={styles.topBar}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
            Student Management
          </h2>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0 0' }}>
            Browse, search, and manage student admission records
          </p>
        </div>
        <button onClick={handleOpenAdd} className="btn btn-primary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>Add New Student</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '18px 20px' }}>
        <div style={styles.filterGrid}>
          {/* Search Box */}
          <div style={{ flex: '2', minWidth: '220px' }}>
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by name, code, email, phone..."
              className="form-control"
            />
          </div>

          {/* Course Filter */}
          <div style={{ flex: '1', minWidth: '160px' }}>
            <select
              value={courseFilter}
              onChange={(e) => {
                setCourseFilter(e.target.value);
                setPage(1);
              }}
              className="form-control"
            >
              <option value="">All Courses</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.course_name}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div style={{ flex: '1', minWidth: '130px' }}>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="form-control"
            >
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Graduated">Graduated</option>
            </select>
          </div>

          {/* Gender Filter */}
          <div style={{ flex: '1', minWidth: '120px' }}>
            <select
              value={genderFilter}
              onChange={(e) => {
                setGenderFilter(e.target.value);
                setPage(1);
              }}
              className="form-control"
            >
              <option value="">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Reset Button */}
          <button onClick={resetFilters} className="btn btn-secondary btn-sm" title="Clear Filters">
            Reset
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center' }}>
            <div style={styles.spinner} />
            <p style={{ color: '#64748b', fontSize: '13px', marginTop: '12px' }}>Loading student records...</p>
          </div>
        ) : error ? (
          <div style={{ padding: '36px', textAlign: 'center', color: '#b91c1c' }}>
            <p>{error}</p>
            <button onClick={fetchStudents} className="btn btn-secondary btn-sm" style={{ marginTop: '10px' }}>
              Retry
            </button>
          </div>
        ) : students.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: '40px' }}>🎓</div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', marginTop: '8px' }}>No Students Found</h3>
            <p style={{ color: '#64748b', fontSize: '13px', maxWidth: '400px', margin: '4px auto 16px auto' }}>
              No student records matched your search or filters. Try adjusting your query or register a new student.
            </p>
            <button onClick={handleOpenAdd} className="btn btn-primary btn-sm">
              Register First Student
            </button>
          </div>
        ) : (
          <>
            <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Student Code</th>
                    <th>Full Name</th>
                    <th>Email Address</th>
                    <th>Phone</th>
                    <th>Course</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.id}>
                      <td>
                        <span style={styles.codeBadge}>{student.student_code}</span>
                      </td>
                      <td style={{ fontWeight: '600', color: '#0f172a' }}>
                        {student.full_name}
                      </td>
                      <td>{student.email}</td>
                      <td>{student.phone}</td>
                      <td>
                        <span style={styles.courseBadge}>
                          {student.course?.course_name || 'N/A'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge badge-${(student.status || 'Active').toLowerCase()}`}>
                          {student.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            onClick={() => setStudentToView(student)}
                            className="btn btn-secondary btn-sm"
                            title="View Profile"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleOpenEdit(student)}
                            className="btn btn-secondary btn-sm"
                            title="Edit Record"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setStudentToDelete(student)}
                            className="btn btn-danger btn-sm"
                            title="Delete Student"
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

            {/* Pagination Controls */}
            <div style={styles.paginationBar}>
              <div style={styles.perPageWrap}>
                <span style={{ fontSize: '13px', color: '#64748b' }}>Rows per page:</span>
                <select
                  value={perPage}
                  onChange={(e) => {
                    setPerPage(Number(e.target.value));
                    setPage(1);
                  }}
                  className="form-control"
                  style={{ width: '70px', padding: '4px 8px', height: '32px' }}
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <span style={{ fontSize: '13px', color: '#64748b' }}>
                  Showing {students.length} of {meta.total} records
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="btn btn-secondary btn-sm"
                >
                  &larr; Prev
                </button>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>
                  Page {meta.current_page} of {meta.last_page || 1}
                </span>
                <button
                  disabled={page >= meta.last_page}
                  onClick={() => setPage((p) => p + 1)}
                  className="btn btn-secondary btn-sm"
                >
                  Next &rarr;
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Add / Edit Modal */}
      <StudentModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSaved={fetchStudents}
        studentToEdit={studentToEdit}
        courses={courses}
      />

      {/* View Details Modal */}
      <StudentDetailsModal
        isOpen={Boolean(studentToView)}
        onClose={() => setStudentToView(null)}
        student={studentToView}
        onEdit={(st) => {
          setStudentToView(null);
          handleOpenEdit(st);
        }}
      />

      {/* Confirm Delete Dialog */}
      {studentToDelete && (
        <div className="modal-overlay" onClick={() => setStudentToDelete(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ color: '#ef4444' }}>Confirm Student Deletion</h3>
              <button onClick={() => setStudentToDelete(null)} className="modal-close">&times;</button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '14px', color: '#475569', margin: 0 }}>
                Are you sure you want to permanently delete student{' '}
                <strong>{studentToDelete.full_name}</strong> (<code>{studentToDelete.student_code}</code>)?
              </p>
              <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '8px', fontWeight: '500' }}>
                This will delete the student and their associated attendance history. This action cannot be undone.
              </p>
            </div>
            <div className="modal-footer">
              <button onClick={() => setStudentToDelete(null)} className="btn btn-secondary" disabled={deleting}>
                Cancel
              </button>
              <button onClick={handleDelete} className="btn btn-danger" disabled={deleting}>
                {deleting ? 'Deleting...' : 'Delete Student'}
              </button>
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
  filterGrid: {
    display: 'flex',
    alignItems: 'center',
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
    backgroundColor: '#eff6ff',
    color: '#2563eb',
    borderRadius: '6px',
    fontWeight: '600',
    fontSize: '12px',
    letterSpacing: '0.3px'
  },
  courseBadge: {
    fontSize: '13px',
    color: '#334155'
  },
  paginationBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 20px',
    backgroundColor: '#f8fafc',
    borderTop: '1px solid #e2e8f0',
    flexWrap: 'wrap',
    gap: '12px'
  },
  perPageWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  }
};
