import React, { useEffect, useState, useCallback } from 'react';
import { studentsApi, academicsApi } from '../../services/api';
import StudentModal from './StudentModal';
import StudentDetailsModal from './StudentDetailsModal';

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0, per_page: 10 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Search & Pagination
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  // Load Form options (Classes and Sessions)
  useEffect(() => {
    Promise.all([
      academicsApi.getClasses(),
      academicsApi.getSessions()
    ]).then(([clsRes, sesRes]) => {
      setClasses(clsRes?.data || []);
      setSessions(sesRes?.data || []);
    }).catch(err => console.error('Error fetching academic options:', err));
  }, []);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await studentsApi.getAll({
        search,
        class_id: classFilter,
        gender: genderFilter,
        status: statusFilter,
        page,
        per_page: 10
      });

      setStudents(res?.data || []);
      if (res?.meta) {
        setMeta(res.meta);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch student directory.');
    } finally {
      setLoading(false);
    }
  }, [search, classFilter, genderFilter, statusFilter, page]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to remove student: ${name}?`)) {
      try {
        await studentsApi.delete(id);
        fetchStudents();
      } catch (err) {
        alert(err.message || 'Error deleting student');
      }
    }
  };

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px 0' }}>Students & Admissions</h1>
          <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>Enroll new candidates, track academic records, parent info, and attendance.</p>
        </div>
        <button
          onClick={() => {
            setStudentToEdit(null);
            setIsFormOpen(true);
          }}
          style={btnPrimary}
        >
          + New Student Admission
        </button>
      </div>

      {/* Filter / Search Toolbar */}
      <div style={toolbarStyle}>
        <div style={{ flex: 1, minWidth: '220px' }}>
          <input
            type="text"
            placeholder="Search by student name, admission #, parent name, phone..."
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setPage(1);
            }}
            style={inputStyle}
          />
        </div>

        <select
          value={classFilter}
          onChange={e => {
            setClassFilter(e.target.value);
            setPage(1);
          }}
          style={{ ...inputStyle, width: '160px' }}
        >
          <option value="">All Classes</option>
          {classes.map(c => (
            <option key={c.id} value={c.id}>{c.class_name}</option>
          ))}
        </select>

        <select
          value={genderFilter}
          onChange={e => {
            setGenderFilter(e.target.value);
            setPage(1);
          }}
          style={{ ...inputStyle, width: '140px' }}
        >
          <option value="">All Genders</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>

        <select
          value={statusFilter}
          onChange={e => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          style={{ ...inputStyle, width: '140px' }}
        >
          <option value="">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
          <option value="Alumni">Alumni</option>
          <option value="Suspended">Suspended</option>
        </select>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', backgroundColor: '#fef2f2', border: '1px solid #ef4444', color: '#991b1b', borderRadius: '8px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {/* Table Container */}
      <div style={tableContainer}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>Loading student records...</div>
        ) : students.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
            No students found matching your search and filter criteria.
          </div>
        ) : (
          <table style={tableStyle}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={thStyle}>Admission #</th>
                <th style={thStyle}>Student Name</th>
                <th style={thStyle}>Class & Section</th>
                <th style={thStyle}>Roll #</th>
                <th style={thStyle}>Parent / Guardian</th>
                <th style={thStyle}>Contact</th>
                <th style={thStyle}>Status</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((stu) => (
                <tr key={stu.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ ...tdStyle, fontWeight: 700, color: '#2563eb' }}>{stu.admission_no}</td>
                  <td style={{ ...tdStyle, fontWeight: 600, color: '#0f172a' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={smallAvatar}>{stu.first_name ? stu.first_name[0] : 'S'}</div>
                      <span>{stu.full_name}</span>
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <span style={{ padding: '3px 8px', borderRadius: '4px', backgroundColor: '#eff6ff', color: '#1e40af', fontSize: '12px', fontWeight: 600 }}>
                      {stu.school_class?.class_name || 'Class'} {stu.section ? `• Sec ${stu.section.section_name}` : ''}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>#{stu.roll_no || '-'}</td>
                  <td style={tdStyle}>
                    <div style={{ fontWeight: 600, color: '#334155' }}>{stu.parent_name}</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>{stu.parent_relation || 'Parent'}</div>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ color: '#0f172a' }}>{stu.parent_phone}</div>
                    {stu.phone && <div style={{ fontSize: '11px', color: '#64748b' }}>Stu: {stu.phone}</div>}
                  </td>
                  <td style={tdStyle}>
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: '9999px',
                      fontSize: '11px',
                      fontWeight: 700,
                      backgroundColor: stu.status === 'Active' ? '#ecfdf5' : '#fef2f2',
                      color: stu.status === 'Active' ? '#059669' : '#dc2626'
                    }}>
                      {stu.status}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                      <button
                        onClick={() => setSelectedStudentId(stu.id)}
                        style={btnActionView}
                        title="View Full Profile"
                      >
                        Profile
                      </button>
                      <button
                        onClick={() => {
                          setStudentToEdit(stu);
                          setIsFormOpen(true);
                        }}
                        style={btnActionEdit}
                        title="Edit Details"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(stu.id, stu.full_name)}
                        style={btnActionDelete}
                        title="Delete Student"
                      >
                        ✕
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', color: '#64748b', fontSize: '13px' }}>
        <div>
          Showing page <strong>{meta.current_page}</strong> of <strong>{meta.last_page}</strong> ({meta.total} enrolled students)
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            disabled={meta.current_page <= 1}
            onClick={() => setPage(prev => Math.max(1, prev - 1))}
            style={{ ...btnPagination, ...(meta.current_page <= 1 ? { opacity: 0.5, cursor: 'not-allowed' } : {}) }}
          >
            ← Previous
          </button>
          <button
            disabled={meta.current_page >= meta.last_page}
            onClick={() => setPage(prev => prev + 1)}
            style={{ ...btnPagination, ...(meta.current_page >= meta.last_page ? { opacity: 0.5, cursor: 'not-allowed' } : {}) }}
          >
            Next →
          </button>
        </div>
      </div>

      {/* Admissions / Edit Modal */}
      <StudentModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSaved={fetchStudents}
        studentToEdit={studentToEdit}
        classes={classes}
        sessions={sessions}
      />

      {/* Detailed Student Dossier Modal */}
      <StudentDetailsModal
        isOpen={Boolean(selectedStudentId)}
        onClose={() => setSelectedStudentId(null)}
        studentId={selectedStudentId}
      />
    </div>
  );
}

const toolbarStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '12px',
  marginBottom: '20px',
  backgroundColor: '#ffffff',
  padding: '14px',
  borderRadius: '10px',
  border: '1px solid #e2e8f0',
  boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
};

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: '8px',
  border: '1px solid #cbd5e1',
  fontSize: '13px',
  boxSizing: 'border-box'
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
  fontSize: '13.5px',
  minWidth: '900px'
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
  padding: '14px 18px',
  color: '#334155'
};

const smallAvatar = {
  width: '28px',
  height: '28px',
  borderRadius: '50%',
  backgroundColor: '#3b82f6',
  color: '#ffffff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '12px',
  fontWeight: 700
};

const btnPrimary = {
  padding: '10px 18px',
  backgroundColor: '#2563eb',
  color: '#ffffff',
  border: 'none',
  borderRadius: '8px',
  fontSize: '13.5px',
  fontWeight: 600,
  cursor: 'pointer',
  boxShadow: '0 2px 4px rgba(37,99,235,0.2)'
};

const btnActionView = {
  padding: '5px 10px',
  backgroundColor: '#eff6ff',
  border: '1px solid #bfdbfe',
  borderRadius: '6px',
  color: '#1d4ed8',
  fontSize: '12px',
  fontWeight: 600,
  cursor: 'pointer'
};

const btnActionEdit = {
  padding: '5px 10px',
  backgroundColor: '#f1f5f9',
  border: '1px solid #cbd5e1',
  borderRadius: '6px',
  color: '#334155',
  fontSize: '12px',
  fontWeight: 600,
  cursor: 'pointer'
};

const btnActionDelete = {
  padding: '5px 8px',
  backgroundColor: '#fef2f2',
  border: '1px solid #fecaca',
  borderRadius: '6px',
  color: '#dc2626',
  fontSize: '12px',
  fontWeight: 700,
  cursor: 'pointer'
};

const btnPagination = {
  padding: '8px 14px',
  backgroundColor: '#ffffff',
  border: '1px solid #cbd5e1',
  borderRadius: '6px',
  fontSize: '12.5px',
  fontWeight: 600,
  color: '#334155',
  cursor: 'pointer'
};
