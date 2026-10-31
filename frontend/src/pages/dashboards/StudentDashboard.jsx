import React, { useState, useEffect } from 'react';
import { studentPortalApi } from '../../services/api';

export default function StudentDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('academics'); // 'academics', 'timetable', 'homework', 'attendance'
  const [homeworkList, setHomeworkList] = useState([]);
  const [submittingHwId, setSubmittingHwId] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await studentPortalApi.getDashboard();
      setData(res);
      setHomeworkList(res.homework || []);
      setError(null);
    } catch (err) {
      setError(err?.data?.message || err.message || 'Failed to load Student workspace');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmitHomework = async (hwId) => {
    try {
      setSubmittingHwId(hwId);
      await studentPortalApi.submitHomework(hwId);
      setHomeworkList(homeworkList.map(h => h.id === hwId ? { ...h, status: 'Submitted' } : h));
      alert('Homework submitted to faculty successfully.');
    } catch (err) {
      alert('Submission failed: ' + err.message);
    } finally {
      setSubmittingHwId(null);
    }
  };

  if (loading) {
    return <div className="loading-state"><div className="spinner" /> Loading Student Portal...</div>;
  }

  const student = data?.student || {};
  const stats = data?.statistics || {};
  const timetable = data?.timetable || [];
  const marks = data?.marks || [];
  const announcements = data?.announcements || [];

  return (
    <div style={styles.container}>
      {/* Student Profile Card */}
      <div style={styles.profileCard}>
        <div style={styles.avatar}>
          {student.first_name ? student.first_name.charAt(0) : 'S'}
        </div>
        <div style={styles.profileDetails}>
          <span style={styles.roleTag}>STUDENT LEARNER PORTAL</span>
          <h1 style={styles.studentName}>{student.full_name || 'Aarav Mehta'}</h1>
          <p style={styles.subtext}>
            {student.school_class?.class_name || 'Class 10'} • Section {student.section?.section_name || 'A'} • Roll No: <strong>{student.roll_no || '101'}</strong> • Adm: {student.admission_no || 'ADM-2026-0001'}
          </p>
        </div>
        <div style={styles.statusBadge}>
          <span style={styles.dot} /> Enrolled & Active
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* KPI Stats */}
      <div style={styles.kpiGrid}>
        <div style={styles.kpiCard}>
          <span style={styles.kpiLabel}>My Attendance Rate</span>
          <div style={styles.kpiValue}>{stats.attendance_percentage || 96.5}%</div>
          <span style={{ fontSize: '11px', color: '#10b981' }}>Eligible for evaluations</span>
        </div>

        <div style={styles.kpiCard}>
          <span style={styles.kpiLabel}>Academic Average</span>
          <div style={styles.kpiValue}>{stats.academic_average || 88.0}%</div>
          <span style={{ fontSize: '11px', color: '#0284c7' }}>High Distinction</span>
        </div>

        <div style={styles.kpiCard}>
          <span style={styles.kpiLabel}>Enrolled Subjects</span>
          <div style={styles.kpiValue}>{stats.enrolled_subjects || 5} Subjects</div>
          <span style={{ fontSize: '11px', color: '#64748b' }}>CBSE Allotted Curriculum</span>
        </div>

        <div style={styles.kpiCard}>
          <span style={styles.kpiLabel}>Pending Homework</span>
          <div style={{ ...styles.kpiValue, color: homeworkList.filter(h => h.status === 'Pending').length > 0 ? '#ea580c' : '#15803d' }}>
            {homeworkList.filter(h => h.status === 'Pending').length} Due
          </div>
          <span style={{ fontSize: '11px', color: '#64748b' }}>Check assignments tab</span>
        </div>
      </div>

      {/* Main Student Workspace Card */}
      <div style={styles.card}>
        <div style={styles.tabNav}>
          <button
            onClick={() => setActiveTab('academics')}
            style={{ ...styles.tabBtn, ...(activeTab === 'academics' ? styles.tabBtnActive : {}) }}
          >
            My Exam Grades
          </button>
          <button
            onClick={() => setActiveTab('homework')}
            style={{ ...styles.tabBtn, ...(activeTab === 'homework' ? styles.tabBtnActive : {}) }}
          >
            Homework & Tasks ({homeworkList.filter(h => h.status === 'Pending').length})
          </button>
          <button
            onClick={() => setActiveTab('timetable')}
            style={{ ...styles.tabBtn, ...(activeTab === 'timetable' ? styles.tabBtnActive : {}) }}
          >
            Daily Timetable
          </button>
        </div>

        <div style={styles.tabContent}>
          {/* TAB: ACADEMICS / MARKS */}
          {activeTab === 'academics' && (
            <div>
              <h3 style={styles.tabTitle}>Official Examination Report Card</h3>
              <table className="table">
                <thead>
                  <tr>
                    <th>Examination</th>
                    <th>Subject</th>
                    <th>Max Marks</th>
                    <th>Passing</th>
                    <th>My Score</th>
                    <th>Letter Grade</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {marks.map((m) => (
                    <tr key={m.id}>
                      <td><strong>{m.examination?.exam_name || 'Mid-Term Evaluation'}</strong></td>
                      <td>{m.subject?.subject_name}</td>
                      <td>{m.max_marks}</td>
                      <td>{m.passing_marks}</td>
                      <td><strong style={{ fontSize: '16px', color: '#0284c7' }}>{m.obtained_marks}</strong></td>
                      <td>
                        <span style={{ padding: '3px 8px', borderRadius: '4px', backgroundColor: '#ecfdf5', color: '#059669', fontWeight: '800' }}>
                          {m.grade}
                        </span>
                      </td>
                      <td>{m.remarks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB: HOMEWORK */}
          {activeTab === 'homework' && (
            <div>
              <h3 style={styles.tabTitle}>Assigned Homework & Exercises</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {homeworkList.map((hw) => (
                  <div key={hw.id} style={styles.hwRow}>
                    <div style={{ flex: 1 }}>
                      <span style={styles.hwSubjectTag}>{hw.subject}</span>
                      <h4 style={styles.hwTitle}>{hw.title}</h4>
                      <p style={styles.hwDue}>Due Date: <strong>{hw.due_date}</strong></p>
                    </div>
                    <div>
                      {hw.status === 'Submitted' ? (
                        <span style={styles.submittedPill}>✓ Submitted to Teacher</span>
                      ) : (
                        <button
                          onClick={() => handleSubmitHomework(hw.id)}
                          disabled={submittingHwId === hw.id}
                          className="btn btn-primary"
                          style={{ padding: '8px 16px', fontSize: '12px' }}
                        >
                          {submittingHwId === hw.id ? 'Submitting...' : 'Turn In Assignment'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: TIMETABLE */}
          {activeTab === 'timetable' && (
            <div>
              <h3 style={styles.tabTitle}>Today's Class Schedule</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {timetable.map((slot, idx) => (
                  <div key={idx} style={styles.periodRow}>
                    <div style={styles.periodTime}>{slot.period}</div>
                    <div style={styles.periodSubject}>{slot.subject}</div>
                    <div style={styles.periodTeacher}>Faculty: {slot.teacher}</div>
                    <div style={styles.periodRoom}>{slot.room}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Student Announcements */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <h2 style={styles.cardTitle}>Student Circulars & Notices</h2>
        </div>
        <div style={styles.cardBody}>
          {announcements.map((a) => (
            <div key={a.id} style={styles.noticeItem}>
              <div style={styles.noticeDate}>{a.publish_date}</div>
              <div style={styles.noticeTitle}>{a.title}</div>
              <div style={styles.noticeSnippet}>{a.content}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  profileCard: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
    flexWrap: 'wrap'
  },
  avatar: {
    width: '64px',
    height: '64px',
    borderRadius: '16px',
    background: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)',
    color: '#ffffff',
    fontSize: '28px',
    fontWeight: '800',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 8px 16px rgba(2, 132, 199, 0.25)'
  },
  profileDetails: {
    flex: 1,
    minWidth: '220px'
  },
  roleTag: {
    fontSize: '11px',
    fontWeight: '800',
    color: '#0284c7',
    letterSpacing: '0.5px'
  },
  studentName: {
    fontSize: '22px',
    fontWeight: '800',
    color: '#0f172a',
    margin: '2px 0 4px 0'
  },
  subtext: {
    fontSize: '13px',
    color: '#64748b',
    margin: 0
  },
  statusBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 14px',
    backgroundColor: '#ecfdf5',
    color: '#059669',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '700'
  },
  dot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#10b981'
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '18px'
  },
  kpiCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
  },
  kpiLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#64748b'
  },
  kpiValue: {
    fontSize: '26px',
    fontWeight: '800',
    color: '#0f172a',
    margin: '4px 0'
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
    overflow: 'hidden'
  },
  cardHeader: {
    padding: '18px 24px',
    borderBottom: '1px solid #e2e8f0'
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#0f172a',
    margin: 0
  },
  cardBody: {
    padding: '20px 24px'
  },
  tabNav: {
    display: 'flex',
    borderBottom: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc'
  },
  tabBtn: {
    padding: '14px 20px',
    background: 'none',
    border: 'none',
    borderBottom: '2px solid transparent',
    fontSize: '13px',
    fontWeight: '600',
    color: '#64748b',
    cursor: 'pointer'
  },
  tabBtnActive: {
    color: '#0284c7',
    borderBottomColor: '#0284c7',
    backgroundColor: '#ffffff'
  },
  tabContent: {
    padding: '24px'
  },
  tabTitle: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#0f172a',
    margin: '0 0 16px 0'
  },
  hwRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 18px',
    backgroundColor: '#f8fafc',
    borderRadius: '10px',
    border: '1px solid #e2e8f0'
  },
  hwSubjectTag: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#0284c7',
    textTransform: 'uppercase'
  },
  hwTitle: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#0f172a',
    margin: '2px 0 4px 0'
  },
  hwDue: {
    fontSize: '12px',
    color: '#64748b',
    margin: 0
  },
  submittedPill: {
    padding: '6px 12px',
    backgroundColor: '#dcfce7',
    color: '#15803d',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '700'
  },
  periodRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '12px 16px',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    border: '1px solid #e2e8f0'
  },
  periodTime: {
    width: '180px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#64748b'
  },
  periodSubject: {
    flex: 1,
    fontSize: '14px',
    fontWeight: '700',
    color: '#0f172a'
  },
  periodTeacher: {
    fontSize: '13px',
    color: '#475569'
  },
  periodRoom: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#0284c7',
    backgroundColor: '#f0f9ff',
    padding: '3px 8px',
    borderRadius: '4px'
  },
  noticeItem: {
    paddingBottom: '12px',
    borderBottom: '1px solid #f1f5f9'
  },
  noticeDate: {
    fontSize: '11px',
    color: '#94a3b8',
    fontWeight: '600'
  },
  noticeTitle: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#0f172a',
    marginTop: '2px'
  },
  noticeSnippet: {
    fontSize: '12px',
    color: '#64748b',
    marginTop: '4px'
  }
};
