import React, { useState, useEffect } from 'react';
import { academicsApi } from '../../services/api';

export default function AcademicsPage() {
  const [activeTab, setActiveTab] = useState('classes');
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Modals state
  const [showClassModal, setShowClassModal] = useState(false);
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);

  // Form states
  const [classForm, setClassForm] = useState({ class_name: '', numeric_grade: 1, status: 'Active', section_names: 'A, B' });
  const [sectionForm, setSectionForm] = useState({ class_id: '', section_name: '', capacity: 40 });
  const [subjectForm, setSubjectForm] = useState({ subject_name: '', subject_code: '', subject_type: 'Theory', status: 'Active' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [clsRes, subRes, sesRes] = await Promise.all([
        academicsApi.getClasses(),
        academicsApi.getSubjects(),
        academicsApi.getSessions()
      ]);
      setClasses(clsRes?.data || []);
      setSubjects(subRes?.data || []);
      setSessions(sesRes?.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load academic records.');
    } finally {
      setLoading(false);
    }
  };

  const notify = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  // 1. Create Class
  const handleCreateClass = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const sectionsArray = classForm.section_names.split(',').map(s => s.trim()).filter(Boolean);
      await academicsApi.createClass({
        class_name: classForm.class_name,
        numeric_grade: parseInt(classForm.numeric_grade, 10),
        status: classForm.status,
        section_names: sectionsArray.length ? sectionsArray : ['A']
      });
      setShowClassModal(false);
      setClassForm({ class_name: '', numeric_grade: 1, status: 'Active', section_names: 'A, B' });
      notify('Class and sections registered successfully.');
      loadData();
    } catch (err) {
      alert(err.message || 'Error creating class');
    } finally {
      setSubmitting(false);
    }
  };

  // 2. Create Section
  const handleCreateSection = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await academicsApi.createSection({
        class_id: sectionForm.class_id,
        section_name: sectionForm.section_name,
        capacity: parseInt(sectionForm.capacity, 10) || 40
      });
      setShowSectionModal(false);
      setSectionForm({ class_id: '', section_name: '', capacity: 40 });
      notify('Section added successfully.');
      loadData();
    } catch (err) {
      alert(err.message || 'Error creating section');
    } finally {
      setSubmitting(false);
    }
  };

  // 3. Create Subject
  const handleCreateSubject = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await academicsApi.createSubject(subjectForm);
      setShowSubjectModal(false);
      setSubjectForm({ subject_name: '', subject_code: '', subject_type: 'Theory', status: 'Active' });
      notify('Subject created successfully.');
      loadData();
    } catch (err) {
      alert(err.message || 'Error creating subject');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px 0' }}>Academic Management</h1>
          <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>Configure class structures, sections, and curriculum subjects.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setShowClassModal(true)}
            style={btnPrimary}
          >
            + Add New Class
          </button>
          <button
            onClick={() => setShowSubjectModal(true)}
            style={btnSecondary}
          >
            + Add Subject
          </button>
        </div>
      </div>

      {successMsg && (
        <div style={{ padding: '12px 16px', backgroundColor: '#ecfdf5', border: '1px solid #10b981', color: '#065f46', borderRadius: '8px', marginBottom: '20px', fontWeight: 500 }}>
          {successMsg}
        </div>
      )}

      {error && (
        <div style={{ padding: '12px 16px', backgroundColor: '#fef2f2', border: '1px solid #ef4444', color: '#991b1b', borderRadius: '8px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e2e8f0', marginBottom: '24px' }}>
        <button
          onClick={() => setActiveTab('classes')}
          style={{ ...tabStyle, borderBottom: activeTab === 'classes' ? '2px solid #2563eb' : '2px solid transparent', color: activeTab === 'classes' ? '#2563eb' : '#64748b', fontWeight: activeTab === 'classes' ? 700 : 500 }}
        >
          Classes & Sections ({classes.length})
        </button>
        <button
          onClick={() => setActiveTab('subjects')}
          style={{ ...tabStyle, borderBottom: activeTab === 'subjects' ? '2px solid #2563eb' : '2px solid transparent', color: activeTab === 'subjects' ? '#2563eb' : '#64748b', fontWeight: activeTab === 'subjects' ? 700 : 500 }}
        >
          Subjects Curriculum ({subjects.length})
        </button>
        <button
          onClick={() => setActiveTab('sessions')}
          style={{ ...tabStyle, borderBottom: activeTab === 'sessions' ? '2px solid #2563eb' : '2px solid transparent', color: activeTab === 'sessions' ? '#2563eb' : '#64748b', fontWeight: activeTab === 'sessions' ? 700 : 500 }}
        >
          Academic Sessions ({sessions.length})
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>Loading academic structure...</div>
      ) : (
        <>
          {/* TAB 1: Classes & Sections */}
          {activeTab === 'classes' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
              {classes.map((cls) => (
                <div key={cls.id} style={cardStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>{cls.class_name}</h3>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>Grade Level: {cls.numeric_grade}</span>
                    </div>
                    <span style={{ padding: '4px 10px', borderRadius: '9999px', fontSize: '11px', fontWeight: 600, backgroundColor: cls.status === 'Active' ? '#ecfdf5' : '#f1f5f9', color: cls.status === 'Active' ? '#059669' : '#64748b' }}>
                      {cls.status}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '16px', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', marginBottom: '16px' }}>
                    <div style={{ flex: 1, textAlign: 'center' }}>
                      <div style={{ fontSize: '20px', fontWeight: '800', color: '#2563eb' }}>{cls.students_count || 0}</div>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Enrolled Students</div>
                    </div>
                    <div style={{ width: '1px', backgroundColor: '#e2e8f0' }} />
                    <div style={{ flex: 1, textAlign: 'center' }}>
                      <div style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>{cls.sections?.length || 0}</div>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Sections</div>
                    </div>
                  </div>

                  {/* Sections Chips */}
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>Active Sections:</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {cls.sections && cls.sections.length > 0 ? (
                        cls.sections.map((sec) => (
                          <span key={sec.id} style={{ padding: '4px 10px', backgroundColor: '#eff6ff', color: '#1e40af', borderRadius: '6px', fontSize: '12px', fontWeight: 600, border: '1px solid #bfdbfe' }}>
                            Sec {sec.section_name} <span style={{ opacity: 0.7, fontSize: '10px' }}>({sec.capacity} max)</span>
                          </span>
                        ))
                      ) : (
                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>No sections added yet</span>
                      )}
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => {
                        setSectionForm({ class_id: cls.id, section_name: '', capacity: 40 });
                        setShowSectionModal(true);
                      }}
                      style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}
                    >
                      + Add Section
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: Subjects */}
          {activeTab === 'subjects' && (
            <div style={tableContainer}>
              <table style={tableStyle}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={thStyle}>Code</th>
                    <th style={thStyle}>Subject Name</th>
                    <th style={thStyle}>Type</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Assigned Classes</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.map((sub) => (
                    <tr key={sub.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ ...tdStyle, fontWeight: 700, color: '#2563eb' }}>{sub.subject_code}</td>
                      <td style={{ ...tdStyle, fontWeight: 600, color: '#0f172a' }}>{sub.subject_name}</td>
                      <td style={tdStyle}>
                        <span style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, backgroundColor: '#f1f5f9', color: '#475569' }}>
                          {sub.subject_type}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <span style={{ padding: '3px 8px', borderRadius: '9999px', fontSize: '11px', fontWeight: 600, backgroundColor: sub.status === 'Active' ? '#ecfdf5' : '#f1f5f9', color: sub.status === 'Active' ? '#059669' : '#64748b' }}>
                          {sub.status}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {sub.classes && sub.classes.length > 0 ? (
                            sub.classes.map(c => (
                              <span key={c.id} style={{ fontSize: '11px', backgroundColor: '#e0e7ff', color: '#3730a3', padding: '2px 6px', borderRadius: '4px' }}>
                                {c.class_name}
                              </span>
                            ))
                          ) : (
                            <span style={{ color: '#94a3b8', fontSize: '12px' }}>All standard classes</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 3: Academic Sessions */}
          {activeTab === 'sessions' && (
            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>Active Academic Calendars</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {sessions.map((ses) => (
                  <div key={ses.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>Session: {ses.session_name}</div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                        Period: {ses.start_date} to {ses.end_date}
                      </div>
                    </div>
                    {ses.is_active ? (
                      <span style={{ padding: '4px 12px', backgroundColor: '#ecfdf5', color: '#059669', borderRadius: '9999px', fontSize: '12px', fontWeight: 700, border: '1px solid #a7f3d0' }}>
                        CURRENT ACTIVE
                      </span>
                    ) : (
                      <span style={{ color: '#94a3b8', fontSize: '12px' }}>Completed</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* MODAL 1: Add Class */}
      {showClassModal && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <div style={modalHeader}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Add New Class</h3>
              <button onClick={() => setShowClassModal(false)} style={closeBtn}>✕</button>
            </div>
            <form onSubmit={handleCreateClass} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Class Name (e.g. Class 11, Kindergarten)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Class 11"
                  value={classForm.class_name}
                  onChange={e => setClassForm({ ...classForm, class_name: e.target.value })}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Numeric Grade Level (1 - 12)</label>
                <input
                  type="number"
                  required
                  min="1"
                  max="12"
                  value={classForm.numeric_grade}
                  onChange={e => setClassForm({ ...classForm, numeric_grade: e.target.value })}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Initial Sections (comma separated)</label>
                <input
                  type="text"
                  placeholder="A, B, C"
                  value={classForm.section_names}
                  onChange={e => setClassForm({ ...classForm, section_names: e.target.value })}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Status</label>
                <select
                  value={classForm.status}
                  onChange={e => setClassForm({ ...classForm, status: e.target.value })}
                  style={inputStyle}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowClassModal(false)} style={btnCancel}>Cancel</button>
                <button type="submit" disabled={submitting} style={btnPrimary}>
                  {submitting ? 'Creating...' : 'Save Class'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Add Section */}
      {showSectionModal && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <div style={modalHeader}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Add Section</h3>
              <button onClick={() => setShowSectionModal(false)} style={closeBtn}>✕</button>
            </div>
            <form onSubmit={handleCreateSection} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Select Class</label>
                <select
                  required
                  value={sectionForm.class_id}
                  onChange={e => setSectionForm({ ...sectionForm, class_id: e.target.value })}
                  style={inputStyle}
                >
                  <option value="">-- Choose Class --</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.class_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Section Name (e.g. C, Lotus)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. C"
                  value={sectionForm.section_name}
                  onChange={e => setSectionForm({ ...sectionForm, section_name: e.target.value })}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Student Capacity</label>
                <input
                  type="number"
                  min="1"
                  max="150"
                  value={sectionForm.capacity}
                  onChange={e => setSectionForm({ ...sectionForm, capacity: e.target.value })}
                  style={inputStyle}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowSectionModal(false)} style={btnCancel}>Cancel</button>
                <button type="submit" disabled={submitting} style={btnPrimary}>
                  {submitting ? 'Adding...' : 'Add Section'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Add Subject */}
      {showSubjectModal && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <div style={modalHeader}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Add Curriculum Subject</h3>
              <button onClick={() => setShowSubjectModal(false)} style={closeBtn}>✕</button>
            </div>
            <form onSubmit={handleCreateSubject} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Subject Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Physics, Economics"
                  value={subjectForm.subject_name}
                  onChange={e => setSubjectForm({ ...subjectForm, subject_name: e.target.value })}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Subject Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PHY-101"
                  value={subjectForm.subject_code}
                  onChange={e => setSubjectForm({ ...subjectForm, subject_code: e.target.value })}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Subject Type</label>
                <select
                  value={subjectForm.subject_type}
                  onChange={e => setSubjectForm({ ...subjectForm, subject_type: e.target.value })}
                  style={inputStyle}
                >
                  <option value="Theory">Theory</option>
                  <option value="Practical">Practical</option>
                  <option value="Both">Theory + Practical</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowSubjectModal(false)} style={btnCancel}>Cancel</button>
                <button type="submit" disabled={submitting} style={btnPrimary}>
                  {submitting ? 'Saving...' : 'Save Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const tabStyle = {
  padding: '12px 18px',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontSize: '14px',
  transition: 'all 0.15s ease'
};

const cardStyle = {
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  border: '1px solid #e2e8f0',
  padding: '20px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
};

const tableContainer = {
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  border: '1px solid #e2e8f0',
  overflow: 'hidden',
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
  padding: '14px 18px',
  color: '#334155'
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

const btnSecondary = {
  padding: '10px 16px',
  backgroundColor: '#f1f5f9',
  color: '#0f172a',
  border: '1px solid #cbd5e1',
  borderRadius: '8px',
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer'
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
  maxWidth: '480px',
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
