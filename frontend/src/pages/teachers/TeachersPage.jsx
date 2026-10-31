import React, { useState, useEffect } from 'react';
import { teachersApi } from '../../services/api';

export default function TeachersPage() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    gender: 'Male',
    date_of_birth: '1988-05-15',
    qualification: '',
    experience: '',
    joining_date: '2024-06-01',
    salary: 50000,
    status: 'Active'
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTeachers();
  }, [search, statusFilter]);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const res = await teachersApi.getAll({ search, status: statusFilter });
      setTeachers(res?.data || []);
    } catch (err) {
      setError(err.message || 'Error fetching teachers');
    } finally {
      setLoading(false);
    }
  };

  const notify = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleOpenAdd = () => {
    setEditingTeacher(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      gender: 'Male',
      date_of_birth: '1988-05-15',
      qualification: '',
      experience: '',
      joining_date: new Date().toISOString().split('T')[0],
      salary: 55000,
      status: 'Active'
    });
    setShowModal(true);
  };

  const handleOpenEdit = (tch) => {
    setEditingTeacher(tch);
    setFormData({
      name: tch.name || '',
      email: tch.email || '',
      phone: tch.phone || '',
      gender: tch.gender || 'Male',
      date_of_birth: tch.date_of_birth ? tch.date_of_birth.substring(0, 10) : '',
      qualification: tch.qualification || '',
      experience: tch.experience || '',
      joining_date: tch.joining_date ? tch.joining_date.substring(0, 10) : '',
      salary: tch.salary || 0,
      status: tch.status || 'Active'
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingTeacher) {
        await teachersApi.update(editingTeacher.id, formData);
        notify('Teacher details updated successfully.');
      } else {
        await teachersApi.create(formData);
        notify('New teacher registered successfully.');
      }
      setShowModal(false);
      fetchTeachers();
    } catch (err) {
      alert(err.message || 'Failed to save teacher');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to remove faculty record: ${name}?`)) {
      try {
        await teachersApi.delete(id);
        notify('Faculty record removed successfully.');
        fetchTeachers();
      } catch (err) {
        alert(err.message || 'Error deleting faculty record');
      }
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Page Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px 0' }}>Faculty & Teachers</h1>
          <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>Manage teaching staff profiles, qualifications, and payroll details.</p>
        </div>
        <button onClick={handleOpenAdd} style={btnPrimary}>
          + Register New Faculty
        </button>
      </div>

      {successMsg && (
        <div style={{ padding: '12px 16px', backgroundColor: '#ecfdf5', border: '1px solid #10b981', color: '#065f46', borderRadius: '8px', marginBottom: '20px', fontWeight: 500 }}>
          {successMsg}
        </div>
      )}

      {/* Filter / Search Bar */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', backgroundColor: '#ffffff', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
        <input
          type="text"
          placeholder="Search by name, employee ID, qualification, phone..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ ...inputStyle, flex: 1 }}
        />
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          style={{ ...inputStyle, width: '180px' }}
        >
          <option value="">All Statuses</option>
          <option value="Active">Active</option>
          <option value="On Leave">On Leave</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      {/* Teachers Directory */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>Loading faculty records...</div>
      ) : teachers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <p style={{ color: '#64748b', margin: 0 }}>No faculty members found matching your search.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
          {teachers.map(tch => (
            <div key={tch.id} style={teacherCard}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '14px' }}>
                <div style={avatarStyle}>
                  {tch.name ? tch.name.replace('Dr. ', '').charAt(0) : 'T'}
                </div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                      {tch.name}
                    </h3>
                  </div>
                  <div style={{ fontSize: '12px', color: '#2563eb', fontWeight: 600, marginTop: '2px' }}>
                    ID: {tch.employee_id}
                  </div>
                </div>
                <span style={{ padding: '3px 8px', borderRadius: '9999px', fontSize: '11px', fontWeight: 600, backgroundColor: tch.status === 'Active' ? '#ecfdf5' : '#fffbeb', color: tch.status === 'Active' ? '#059669' : '#d97706' }}>
                  {tch.status}
                </span>
              </div>

              <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '6px', color: '#475569', marginBottom: '16px', backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
                <div><strong>Qualification:</strong> {tch.qualification || 'N/A'}</div>
                <div><strong>Experience:</strong> {tch.experience || 'N/A'}</div>
                <div><strong>Phone:</strong> {tch.phone}</div>
                <div><strong>Email:</strong> {tch.email || 'N/A'}</div>
                <div><strong>Salary:</strong> ${Number(tch.salary).toLocaleString()}/month</div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  onClick={() => handleOpenEdit(tch)}
                  style={{ padding: '6px 12px', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px', fontWeight: 600, color: '#334155', cursor: 'pointer' }}
                >
                  Edit Profile
                </button>
                <button
                  onClick={() => handleDelete(tch.id, tch.name)}
                  style={{ padding: '6px 12px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', fontSize: '12px', fontWeight: 600, color: '#dc2626', cursor: 'pointer' }}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={modalOverlay}>
          <div style={{ ...modalContent, maxWidth: '580px' }}>
            <div style={modalHeader}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>
                {editingTeacher ? 'Edit Faculty Details' : 'Register New Faculty Member'}
              </h3>
              <button onClick={() => setShowModal(false)} style={closeBtn}>✕</button>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '80vh', overflowY: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Rajesh Sharma"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Phone Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Email Address</label>
                  <input
                    type="email"
                    placeholder="teacher@school.edu"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Gender *</label>
                  <select
                    value={formData.gender}
                    onChange={e => setFormData({ ...formData, gender: e.target.value })}
                    style={inputStyle}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Qualification</label>
                  <input
                    type="text"
                    placeholder="e.g. M.Sc, B.Ed, Ph.D"
                    value={formData.qualification}
                    onChange={e => setFormData({ ...formData, qualification: e.target.value })}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Teaching Experience</label>
                  <input
                    type="text"
                    placeholder="e.g. 8 Years"
                    value={formData.experience}
                    onChange={e => setFormData({ ...formData, experience: e.target.value })}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Joining Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.joining_date}
                    onChange={e => setFormData({ ...formData, joining_date: e.target.value })}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Monthly Salary ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.salary}
                    onChange={e => setFormData({ ...formData, salary: e.target.value })}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Status</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                    style={inputStyle}
                  >
                    <option value="Active">Active</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={btnCancel}>Cancel</button>
                <button type="submit" disabled={submitting} style={btnPrimary}>
                  {submitting ? 'Saving...' : editingTeacher ? 'Update Faculty' : 'Register Faculty'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const teacherCard = {
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  border: '1px solid #e2e8f0',
  padding: '20px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
};

const avatarStyle = {
  width: '44px',
  height: '44px',
  borderRadius: '50%',
  backgroundColor: '#3b82f6',
  color: '#ffffff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: '700',
  fontSize: '18px',
  flexShrink: 0
};

const btnPrimary = {
  padding: '10px 16px',
  backgroundColor: '#2563eb',
  color: '#ffffff',
  border: 'none',
  borderRadius: '8px',
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer',
  boxShadow: '0 2px 4px rgba(37,99,235,0.2)'
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

const modalOverlay = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(15, 23, 42, 0.6)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 100
};

const modalContent = {
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  width: '100%',
  overflow: 'hidden',
  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
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
  fontSize: '16px',
  color: '#64748b',
  cursor: 'pointer'
};

const labelStyle = {
  display: 'block',
  fontSize: '12px',
  fontWeight: 600,
  color: '#334155',
  marginBottom: '6px'
};

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: '8px',
  border: '1px solid #cbd5e1',
  fontSize: '13px',
  boxSizing: 'border-box'
};
