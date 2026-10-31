import React, { useEffect, useState, useCallback } from 'react';
import { attendanceApi, coursesApi } from '../../services/api';

export default function AttendancePage() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Mode: 'register' or 'history'
  const [activeView, setActiveView] = useState('register');

  // Register data
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  // History/Analytics data
  const [stats, setStats] = useState([]);
  const [statsLoading, setStatsLoading] = useState(false);

  // Fetch Courses list
  useEffect(() => {
    coursesApi.getAll().then((res) => {
      const list = res?.data || [];
      setCourses(list);
      if (list.length > 0 && !selectedCourse) {
        setSelectedCourse(String(list[0].id));
      }
    }).catch(() => {});
  }, [selectedCourse]);

  // Fetch Attendance for chosen date & course
  const fetchAttendanceRegister = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await attendanceApi.getAll({
        date: selectedDate,
        course_id: selectedCourse
      });
      setRecords(res?.data || []);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to load attendance.' });
    } finally {
      setLoading(false);
    }
  }, [selectedDate, selectedCourse]);

  // Fetch Attendance Statistics
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await attendanceApi.getStats({ course_id: selectedCourse });
      setStats(res?.data || []);
    } catch {
      // Ignore
    } finally {
      setStatsLoading(false);
    }
  }, [selectedCourse]);

  useEffect(() => {
    if (activeView === 'register') {
      fetchAttendanceRegister();
    } else {
      fetchStats();
    }
  }, [activeView, fetchAttendanceRegister, fetchStats]);

  // Handle local state status change
  const handleStatusChange = (studentId, status) => {
    setRecords((prev) =>
      prev.map((r) => (r.student_id === studentId ? { ...r, status } : r))
    );
  };

  const handleRemarksChange = (studentId, remarks) => {
    setRecords((prev) =>
      prev.map((r) => (r.student_id === studentId ? { ...r, remarks } : r))
    );
  };

  // Mark all as Present shortcut
  const markAll = (status) => {
    setRecords((prev) => prev.map((r) => ({ ...r, status })));
  };

  // Save to Laravel Backend
  const handleSaveAttendance = async () => {
    if (records.length === 0) return;

    try {
      setSaving(true);
      setMessage(null);

      await attendanceApi.save({
        attendance_date: selectedDate,
        course_id: selectedCourse ? Number(selectedCourse) : null,
        records: records.map((r) => ({
          student_id: r.student_id,
          status: r.status,
          remarks: r.remarks || null
        }))
      });

      setMessage({ type: 'success', text: `Attendance for ${selectedDate} saved successfully!` });
      fetchAttendanceRegister();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to save attendance.' });
    } finally {
      setSaving(false);
    }
  };

  // Quick summary counts for currently viewed date
  const presentCount = records.filter((r) => r.status === 'Present').length;
  const absentCount = records.filter((r) => r.status === 'Absent').length;
  const lateCount = records.filter((r) => r.status === 'Late').length;
  const dailyPercentage = records.length > 0 ? Math.round((presentCount / records.length) * 100) : 100;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Header */}
      <div style={styles.topBar}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
            Student Attendance Management
          </h2>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0 0' }}>
            Daily attendance roll call, verification, and percentage analytics
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div style={styles.viewTabs}>
          <button
            onClick={() => setActiveView('register')}
            style={{
              ...styles.tabBtn,
              ...(activeView === 'register' ? styles.tabBtnActive : {})
            }}
          >
            Daily Register
          </button>
          <button
            onClick={() => setActiveView('history')}
            style={{
              ...styles.tabBtn,
              ...(activeView === 'history' ? styles.tabBtnActive : {})
            }}
          >
            Attendance Percentage
          </button>
        </div>
      </div>

      {/* Date & Course Selection Bar */}
      <div className="card" style={{ padding: '16px 20px' }}>
        <div style={styles.controlsRow}>
          {/* Course Selector */}
          <div style={{ flex: '1', minWidth: '200px' }}>
            <label style={styles.controlLabel}>Select Course</label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="form-control"
            >
              <option value="">All Academic Courses</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.course_name} ({c.course_code})
                </option>
              ))}
            </select>
          </div>

          {/* Date Picker (Only relevant for register view) */}
          {activeView === 'register' && (
            <div style={{ width: '180px' }}>
              <label style={styles.controlLabel}>Attendance Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="form-control"
              />
            </div>
          )}

          {activeView === 'register' && records.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
              <button onClick={() => markAll('Present')} className="btn btn-secondary btn-sm" title="Mark all Present">
                All Present
              </button>
              <button onClick={() => markAll('Absent')} className="btn btn-secondary btn-sm" title="Mark all Absent">
                All Absent
              </button>
            </div>
          )}
        </div>
      </div>

      {message && (
        <div
          style={{
            padding: '12px 18px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: '500',
            backgroundColor: message.type === 'success' ? '#ecfdf5' : '#fef2f2',
            color: message.type === 'success' ? '#065f46' : '#991b1b',
            border: `1px solid ${message.type === 'success' ? '#a7f3d0' : '#fee2e2'}`
          }}
        >
          {message.text}
        </div>
      )}

      {/* Main Content Area */}
      {activeView === 'register' ? (
        <>
          {/* Daily Metric Cards */}
          <div style={styles.dailyStatsGrid}>
            <div className="card" style={{ padding: '14px 18px' }}>
              <span style={styles.statLabel}>Total Enrolled</span>
              <strong style={{ fontSize: '20px', color: '#0f172a' }}>{records.length}</strong>
            </div>
            <div className="card" style={{ padding: '14px 18px' }}>
              <span style={styles.statLabel}>Present Today</span>
              <strong style={{ fontSize: '20px', color: '#10b981' }}>{presentCount}</strong>
            </div>
            <div className="card" style={{ padding: '14px 18px' }}>
              <span style={styles.statLabel}>Absent Today</span>
              <strong style={{ fontSize: '20px', color: '#ef4444' }}>{absentCount}</strong>
            </div>
            <div className="card" style={{ padding: '14px 18px' }}>
              <span style={styles.statLabel}>Late Arrival</span>
              <strong style={{ fontSize: '20px', color: '#f59e0b' }}>{lateCount}</strong>
            </div>
            <div className="card" style={{ padding: '14px 18px' }}>
              <span style={styles.statLabel}>Session Turnout</span>
              <strong style={{ fontSize: '20px', color: '#2563eb' }}>{dailyPercentage}%</strong>
            </div>
          </div>

          {/* Roll Call Table */}
          <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
            {loading ? (
              <div style={{ padding: '48px', textAlign: 'center' }}>
                <div style={styles.spinner} />
                <p style={{ color: '#64748b', fontSize: '13px', marginTop: '12px' }}>
                  Loading enrolled students for attendance...
                </p>
              </div>
            ) : records.length === 0 ? (
              <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: '40px' }}>📋</div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', marginTop: '8px' }}>No Active Students Enrolled</h3>
                <p style={{ color: '#64748b', fontSize: '13px', maxWidth: '420px', margin: '4px auto 0 auto' }}>
                  No active students found in this course. Register or enroll students to take attendance.
                </p>
              </div>
            ) : (
              <>
                <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Code</th>
                        <th>Student Name</th>
                        <th>Course</th>
                        <th style={{ textAlign: 'center' }}>Attendance Status</th>
                        <th>Remarks / Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {records.map((r) => (
                        <tr key={r.student_id}>
                          <td>
                            <span style={styles.codeBadge}>{r.student_code}</span>
                          </td>
                          <td style={{ fontWeight: '600', color: '#0f172a' }}>{r.full_name}</td>
                          <td style={{ color: '#64748b' }}>{r.course_name}</td>
                          <td style={{ textAlign: 'center' }}>
                            <div style={styles.radioGroup}>
                              <label style={{ ...styles.radioLabel, ...(r.status === 'Present' ? styles.radioLabelPresent : {}) }}>
                                <input
                                  type="radio"
                                  name={`status_${r.student_id}`}
                                  value="Present"
                                  checked={r.status === 'Present'}
                                  onChange={() => handleStatusChange(r.student_id, 'Present')}
                                />
                                <span>Present</span>
                              </label>

                              <label style={{ ...styles.radioLabel, ...(r.status === 'Late' ? styles.radioLabelLate : {}) }}>
                                <input
                                  type="radio"
                                  name={`status_${r.student_id}`}
                                  value="Late"
                                  checked={r.status === 'Late'}
                                  onChange={() => handleStatusChange(r.student_id, 'Late')}
                                />
                                <span>Late</span>
                              </label>

                              <label style={{ ...styles.radioLabel, ...(r.status === 'Absent' ? styles.radioLabelAbsent : {}) }}>
                                <input
                                  type="radio"
                                  name={`status_${r.student_id}`}
                                  value="Absent"
                                  checked={r.status === 'Absent'}
                                  onChange={() => handleStatusChange(r.student_id, 'Absent')}
                                />
                                <span>Absent</span>
                              </label>
                            </div>
                          </td>
                          <td>
                            <input
                              type="text"
                              value={r.remarks}
                              onChange={(e) => handleRemarksChange(r.student_id, e.target.value)}
                              placeholder="e.g. Approved medical leave"
                              className="form-control"
                              style={{ padding: '6px 10px', fontSize: '13px' }}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Footer Save Action */}
                <div style={styles.footerSave}>
                  <div style={{ fontSize: '13px', color: '#64748b' }}>
                    Changes will be saved to MySQL table <code>attendances</code> for date <strong>{selectedDate}</strong>.
                  </div>
                  <button
                    onClick={handleSaveAttendance}
                    disabled={saving}
                    className="btn btn-primary"
                    style={{ padding: '10px 24px', fontSize: '14px' }}
                  >
                    {saving ? 'Recording Attendance...' : 'Save & Submit Attendance'}
                  </button>
                </div>
              </>
            )}
          </div>
        </>
      ) : (
        /* Percentage Analytics View */
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          {statsLoading ? (
            <div style={{ padding: '48px', textAlign: 'center' }}>
              <div style={styles.spinner} />
              <p style={{ color: '#64748b', fontSize: '13px', marginTop: '12px' }}>
                Computing attendance percentages...
              </p>
            </div>
          ) : stats.length === 0 ? (
            <div style={{ padding: '60px 20px', textAlign: 'center' }}>
              <p style={{ color: '#64748b', fontSize: '14px' }}>No attendance history recorded yet.</p>
            </div>
          ) : (
            <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Student Code</th>
                    <th>Full Name</th>
                    <th>Total Sessions</th>
                    <th>Present</th>
                    <th>Late</th>
                    <th>Absent</th>
                    <th>Attendance %</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.map((st) => (
                    <tr key={st.id}>
                      <td><span style={styles.codeBadge}>{st.student_code}</span></td>
                      <td style={{ fontWeight: '600' }}>{st.full_name}</td>
                      <td>{st.total_sessions}</td>
                      <td style={{ color: '#10b981', fontWeight: '600' }}>{st.present_sessions}</td>
                      <td style={{ color: '#f59e0b', fontWeight: '600' }}>{st.late_sessions}</td>
                      <td style={{ color: '#ef4444', fontWeight: '600' }}>{st.absent_sessions}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <strong style={{ color: st.percentage >= 75 ? '#10b981' : '#ef4444' }}>
                            {st.percentage}%
                          </strong>
                          <span className={`badge ${st.percentage >= 75 ? 'badge-active' : 'badge-inactive'}`}>
                            {st.percentage >= 75 ? 'Satisfactory' : 'Low Attendance'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
  viewTabs: {
    display: 'flex',
    backgroundColor: '#e2e8f0',
    padding: '3px',
    borderRadius: '8px'
  },
  tabBtn: {
    padding: '8px 16px',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#64748b',
    fontSize: '13px',
    fontWeight: '600',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  tabBtnActive: {
    backgroundColor: '#ffffff',
    color: '#0f172a',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  controlsRow: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px'
  },
  controlLabel: {
    display: 'block',
    fontSize: '12px',
    fontWeight: '600',
    color: '#475569',
    marginBottom: '4px'
  },
  dailyStatsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '12px'
  },
  statLabel: {
    display: 'block',
    fontSize: '11px',
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
    marginBottom: '2px'
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
    fontSize: '12px'
  },
  radioGroup: {
    display: 'inline-flex',
    gap: '8px'
  },
  radioLabel: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '6px 10px',
    borderRadius: '6px',
    border: '1px solid #e2e8f0',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    backgroundColor: '#ffffff',
    transition: 'all 0.15s ease'
  },
  radioLabelPresent: {
    backgroundColor: '#ecfdf5',
    borderColor: '#a7f3d0',
    color: '#065f46'
  },
  radioLabelLate: {
    backgroundColor: '#fffbeb',
    borderColor: '#fde68a',
    color: '#92400e'
  },
  radioLabelAbsent: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    color: '#991b1b'
  },
  footerSave: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 24px',
    backgroundColor: '#f8fafc',
    borderTop: '1px solid #e2e8f0',
    flexWrap: 'wrap',
    gap: '12px'
  }
};
