import React, { useState, useEffect } from 'react';
import { academicsApi, attendanceApi } from '../../services/api';

export default function AttendancePage() {
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);

  const [sheet, setSheet] = useState([]);
  const [sheetMeta, setSheetMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [error, setError] = useState(null);

  // Load Classes on mount
  useEffect(() => {
    academicsApi.getClasses().then(res => {
      const cls = res?.data || [];
      setClasses(cls);
      if (cls.length > 0) {
        setSelectedClassId(cls[0].id);
        if (cls[0].sections && cls[0].sections.length > 0) {
          setSections(cls[0].sections);
          setSelectedSectionId(cls[0].sections[0].id);
        }
      }
    }).catch(err => console.error(err));
  }, []);

  // Update sections when class selection changes
  const handleClassChange = (e) => {
    const cid = e.target.value;
    setSelectedClassId(cid);
    const sel = classes.find(c => String(c.id) === String(cid));
    if (sel && sel.sections && sel.sections.length > 0) {
      setSections(sel.sections);
      setSelectedSectionId(sel.sections[0].id);
    } else {
      setSections([]);
      setSelectedSectionId('');
    }
  };

  // Fetch Attendance Sheet
  useEffect(() => {
    if (!selectedClassId) return;

    setLoading(true);
    setError(null);
    attendanceApi.getStudentSheet({
      class_id: selectedClassId,
      section_id: selectedSectionId,
      date: attendanceDate
    }).then(res => {
      const data = res?.data;
      setSheetMeta(data);
      setSheet(data?.students || []);
    }).catch(err => {
      setError(err.message || 'Failed to fetch attendance sheet');
    }).finally(() => {
      setLoading(false);
    });
  }, [selectedClassId, selectedSectionId, attendanceDate]);

  // Bulk actions
  const markAll = (status) => {
    setSheet(prev => prev.map(item => ({ ...item, status })));
  };

  const updateStudentStatus = (studentId, status) => {
    setSheet(prev => prev.map(item => item.student_id === studentId ? { ...item, status } : item));
  };

  const updateRemarks = (studentId, remarks) => {
    setSheet(prev => prev.map(item => item.student_id === studentId ? { ...item, remarks } : item));
  };

  // Save Attendance to API
  const handleSaveAttendance = async () => {
    if (sheet.length === 0) return;
    setSaving(true);
    setError(null);
    try {
      await attendanceApi.bulkSaveStudent({
        class_id: selectedClassId,
        section_id: selectedSectionId || null,
        attendance_date: attendanceDate,
        records: sheet.map(s => ({
          student_id: s.student_id,
          status: s.status,
          remarks: s.remarks || null
        }))
      });
      setSuccessMsg(`Attendance saved successfully for ${sheet.length} students on ${attendanceDate}!`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      setError(err.message || 'Error saving attendance');
    } finally {
      setSaving(false);
    }
  };

  const presentCount = sheet.filter(s => s.status === 'Present').length;
  const absentCount = sheet.filter(s => s.status === 'Absent').length;
  const lateCount = sheet.filter(s => s.status === 'Late').length;
  const totalCount = sheet.length;
  const attendanceRate = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px 0' }}>Daily Attendance Sheet</h1>
          <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>Mark student attendance class-wise with instant status toggles and audit history.</p>
        </div>

        <button
          onClick={handleSaveAttendance}
          disabled={saving || sheet.length === 0}
          style={btnSave}
        >
          {saving ? 'Saving...' : '✓ Save Attendance'}
        </button>
      </div>

      {successMsg && (
        <div style={{ padding: '12px 16px', backgroundColor: '#ecfdf5', border: '1px solid #10b981', color: '#065f46', borderRadius: '8px', marginBottom: '20px', fontWeight: 600 }}>
          {successMsg}
        </div>
      )}

      {error && (
        <div style={{ padding: '12px 16px', backgroundColor: '#fef2f2', border: '1px solid #ef4444', color: '#991b1b', borderRadius: '8px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {/* Filter / Selector Bar */}
      <div style={selectorCard}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', flex: 1 }}>
          <div>
            <label style={labelStyle}>Select Class</label>
            <select value={selectedClassId} onChange={handleClassChange} style={selectStyle}>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.class_name}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Select Section</label>
            <select
              value={selectedSectionId}
              onChange={e => setSelectedSectionId(e.target.value)}
              style={selectStyle}
            >
              <option value="">All Sections</option>
              {sections.map(s => (
                <option key={s.id} value={s.id}>Section {s.section_name}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Attendance Date</label>
            <input
              type="date"
              value={attendanceDate}
              onChange={e => setAttendanceDate(e.target.value)}
              style={selectStyle}
            />
          </div>
        </div>

        {/* Quick Bulk Actions */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => markAll('Present')} style={btnPresentAll}>
            ✓ All Present
          </button>
          <button onClick={() => markAll('Absent')} style={btnAbsentAll}>
            ✕ All Absent
          </button>
        </div>
      </div>

      {/* Attendance Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px' }}>
        <div style={statCard}>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a' }}>{totalCount}</div>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Enrolled in Class</div>
        </div>
        <div style={statCard}>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#059669' }}>{presentCount}</div>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Present Today</div>
        </div>
        <div style={statCard}>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#dc2626' }}>{absentCount}</div>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Absent Today</div>
        </div>
        <div style={statCard}>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#2563eb' }}>{attendanceRate}%</div>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Attendance Rate</div>
        </div>
      </div>

      {/* Attendance Table */}
      <div style={tableContainer}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>Loading class roster...</div>
        ) : sheet.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
            No students found enrolled in this class and section.
          </div>
        ) : (
          <table style={tableStyle}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ ...thStyle, width: '70px' }}>Roll #</th>
                <th style={thStyle}>Admission #</th>
                <th style={thStyle}>Student Name</th>
                <th style={{ ...thStyle, width: '320px', textAlign: 'center' }}>Attendance Status</th>
                <th style={thStyle}>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {sheet.map((stu) => (
                <tr key={stu.student_id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ ...tdStyle, fontWeight: 700, color: '#0f172a' }}>
                    #{stu.roll_no || '-'}
                  </td>
                  <td style={{ ...tdStyle, color: '#2563eb', fontWeight: 600 }}>
                    {stu.admission_no}
                  </td>
                  <td style={{ ...tdStyle, fontWeight: 600, color: '#0f172a' }}>
                    {stu.student_name}
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => updateStudentStatus(stu.student_id, 'Present')}
                        style={{
                          ...pillBtn,
                          backgroundColor: stu.status === 'Present' ? '#10b981' : '#f1f5f9',
                          color: stu.status === 'Present' ? '#ffffff' : '#475569',
                          fontWeight: stu.status === 'Present' ? 700 : 500
                        }}
                      >
                        Present
                      </button>
                      <button
                        type="button"
                        onClick={() => updateStudentStatus(stu.student_id, 'Absent')}
                        style={{
                          ...pillBtn,
                          backgroundColor: stu.status === 'Absent' ? '#ef4444' : '#f1f5f9',
                          color: stu.status === 'Absent' ? '#ffffff' : '#475569',
                          fontWeight: stu.status === 'Absent' ? 700 : 500
                        }}
                      >
                        Absent
                      </button>
                      <button
                        type="button"
                        onClick={() => updateStudentStatus(stu.student_id, 'Late')}
                        style={{
                          ...pillBtn,
                          backgroundColor: stu.status === 'Late' ? '#f59e0b' : '#f1f5f9',
                          color: stu.status === 'Late' ? '#ffffff' : '#475569',
                          fontWeight: stu.status === 'Late' ? 700 : 500
                        }}
                      >
                        Late
                      </button>
                      <button
                        type="button"
                        onClick={() => updateStudentStatus(stu.student_id, 'Half Day')}
                        style={{
                          ...pillBtn,
                          backgroundColor: stu.status === 'Half Day' ? '#3b82f6' : '#f1f5f9',
                          color: stu.status === 'Half Day' ? '#ffffff' : '#475569',
                          fontWeight: stu.status === 'Half Day' ? 700 : 500
                        }}
                      >
                        Half Day
                      </button>
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <input
                      type="text"
                      placeholder="Optional remarks..."
                      value={stu.remarks || ''}
                      onChange={e => updateRemarks(stu.student_id, e.target.value)}
                      style={tableInput}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const selectorCard = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-end',
  backgroundColor: '#ffffff',
  padding: '16px 20px',
  borderRadius: '12px',
  border: '1px solid #e2e8f0',
  marginBottom: '20px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
};

const labelStyle = {
  display: 'block',
  fontSize: '12px',
  fontWeight: 600,
  color: '#475569',
  marginBottom: '6px'
};

const selectStyle = {
  padding: '9px 12px',
  borderRadius: '8px',
  border: '1px solid #cbd5e1',
  fontSize: '13px',
  color: '#0f172a',
  backgroundColor: '#ffffff',
  minWidth: '160px'
};

const statCard = {
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  border: '1px solid #e2e8f0',
  padding: '16px',
  textAlign: 'center',
  boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
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
  padding: '12px 18px',
  color: '#334155'
};

const pillBtn = {
  padding: '6px 12px',
  borderRadius: '6px',
  border: 'none',
  fontSize: '12px',
  cursor: 'pointer',
  transition: 'all 0.15s ease'
};

const tableInput = {
  width: '100%',
  padding: '6px 10px',
  borderRadius: '6px',
  border: '1px solid #e2e8f0',
  fontSize: '12px'
};

const btnSave = {
  padding: '10px 20px',
  backgroundColor: '#059669',
  color: '#ffffff',
  border: 'none',
  borderRadius: '8px',
  fontSize: '13.5px',
  fontWeight: 700,
  cursor: 'pointer',
  boxShadow: '0 2px 4px rgba(5,150,105,0.2)'
};

const btnPresentAll = {
  padding: '8px 12px',
  backgroundColor: '#ecfdf5',
  color: '#059669',
  border: '1px solid #a7f3d0',
  borderRadius: '6px',
  fontSize: '12px',
  fontWeight: 600,
  cursor: 'pointer'
};

const btnAbsentAll = {
  padding: '8px 12px',
  backgroundColor: '#fef2f2',
  color: '#dc2626',
  border: '1px solid #fecaca',
  borderRadius: '6px',
  fontSize: '12px',
  fontWeight: 600,
  cursor: 'pointer'
};
