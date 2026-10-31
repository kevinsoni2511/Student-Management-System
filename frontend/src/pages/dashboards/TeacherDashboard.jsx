import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { teacherPortalApi } from '../../services/api';

export default function TeacherDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [homeworkList, setHomeworkList] = useState([]);
  const [showHomeworkModal, setShowHomeworkModal] = useState(false);
  const [newHw, setNewHw] = useState({
    title: '',
    class_id: '',
    subject_id: '',
    due_date: '',
    description: ''
  });
  const [submittingHw, setSubmittingHw] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await teacherPortalApi.getDashboard();
      setData(res);
      const hwRes = await teacherPortalApi.getHomework();
      setHomeworkList(hwRes.homework || []);
      setError(null);
    } catch (err) {
      setError(err?.data?.message || err.message || 'Failed to load Teacher portal');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateHomework = async (e) => {
    e.preventDefault();
    try {
      setSubmittingHw(true);
      await teacherPortalApi.createHomework(newHw);
      alert('Homework assigned to class successfully!');
      setShowHomeworkModal(false);
      setNewHw({ title: '', class_id: '', subject_id: '', due_date: '', description: '' });
      loadData();
    } catch (err) {
      alert(err?.data?.message || err.message || 'Failed to assign homework');
    } finally {
      setSubmittingHw(false);
    }
  };

  if (loading) {
    return <div className="loading-state"><div className="spinner" /> Loading Teacher Workspace...</div>;
  }

  const teacher = data?.teacher || {};
  const stats = data?.statistics || {};
  const classes = data?.classes || [];
  const subjects = data?.subjects || [];
  const timetable = data?.timetable || [];
  const announcements = data?.announcements || [];

  return (
    <div style={styles.container}>
      {/* Teacher Profile Card */}
      <div style={styles.profileBanner}>
        <div style={styles.profileAvatar}>
          {teacher.name ? teacher.name.charAt(0) : 'T'}
        </div>
        <div style={styles.profileDetails}>
          <span style={styles.teacherRoleTag}>CERTIFIED FACULTY MEMBER</span>
          <h1 style={styles.teacherName}>{teacher.name || 'Dr. Rajesh Sharma'}</h1>
          <p style={styles.teacherBio}>
            {teacher.qualification || 'M.Sc, B.Ed, Ph.D'} • {teacher.experience || '12 Years'} Experience • Employee ID: <strong>{teacher.employee_id || 'TCH-2026-001'}</strong>
          </p>
        </div>
        <div style={styles.quickActionGroup}>
          <Link to="/attendance" className="btn btn-primary" style={styles.actionButton}>
            Mark Daily Attendance
          </Link>
          <button onClick={() => setShowHomeworkModal(true)} className="btn btn-secondary" style={styles.actionButton}>
            + Assign Homework
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* KPI Cards */}
      <div style={styles.kpiGrid}>
        <div style={styles.kpiCard}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiLabel}>Assigned Classes</span>
            <div style={{ ...styles.kpiIcon, backgroundColor: '#d1fae5', color: '#059669' }}>📚</div>
          </div>
          <div style={styles.kpiValue}>{stats.assigned_classes_count || classes.length}</div>
          <div style={styles.kpiSub}>Active curriculum standards</div>
        </div>

        <div style={styles.kpiCard}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiLabel}>My Enrolled Students</span>
            <div style={{ ...styles.kpiIcon, backgroundColor: '#dbeafe', color: '#2563eb' }}>👨‍🎓</div>
          </div>
          <div style={styles.kpiValue}>{stats.total_students || 0}</div>
          <div style={styles.kpiSub}>Under academic guidance</div>
        </div>

        <div style={styles.kpiCard}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiLabel}>Teaching Subjects</span>
            <div style={{ ...styles.kpiIcon, backgroundColor: '#fef3c7', color: '#d97706' }}>📖</div>
          </div>
          <div style={styles.kpiValue}>{stats.assigned_subjects_count || subjects.length}</div>
          <div style={styles.kpiSub}>Primary & Practical labs</div>
        </div>

        <div style={styles.kpiCard}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiLabel}>Today's Attendance</span>
            <div style={{ ...styles.kpiIcon, backgroundColor: stats.attendance_marked_today ? '#dcfce7' : '#fee2e2', color: stats.attendance_marked_today ? '#15803d' : '#b91c1c' }}>
              {stats.attendance_marked_today ? '✓' : '!'}
            </div>
          </div>
          <div style={styles.kpiValue}>{stats.attendance_marked_today ? 'Completed' : 'Pending'}</div>
          <div style={styles.kpiSub}>{stats.attendance_marked_today ? 'Roll call registered' : 'Submit roll call'}</div>
        </div>
      </div>

      {/* Timetable & Active Homework Grid */}
      <div style={styles.twoColGrid}>
        {/* Weekly Timetable */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <h2 style={styles.cardTitle}>My Weekly Teaching Schedule</h2>
              <p style={styles.cardSubtitle}>Periods, assigned lecture halls, and practical lab slots</p>
            </div>
          </div>
          <div style={styles.cardBody}>
            {timetable.map((slot, index) => (
              <div key={index} style={styles.timetableItem}>
                <div style={styles.slotDay}>{slot.day}</div>
                <div style={styles.slotInfo}>
                  <div style={styles.slotSubject}>{slot.subject} ({slot.class})</div>
                  <div style={styles.slotTime}>{slot.period} • <span style={styles.slotRoom}>{slot.room}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Homework Manager */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <h2 style={styles.cardTitle}>Assigned Homework & Practice Sets</h2>
              <p style={styles.cardSubtitle}>Review student submission progress</p>
            </div>
            <button onClick={() => setShowHomeworkModal(true)} className="btn btn-primary" style={{ fontSize: '12px', padding: '6px 12px' }}>
              + New Task
            </button>
          </div>
          <div style={styles.cardBody}>
            {homeworkList.map((hw) => (
              <div key={hw.id} style={styles.hwItem}>
                <div style={styles.hwDetails}>
                  <div style={styles.hwTitle}>{hw.title}</div>
                  <div style={styles.hwMeta}>{hw.class} • {hw.subject} • Due: <strong>{hw.due_date}</strong></div>
                </div>
                <div style={styles.hwProgress}>
                  <span style={styles.hwSubmitted}>{hw.submissions_count} / {hw.total_students}</span>
                  <span style={styles.hwSubmittedLabel}>Turned In</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* School Announcements */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <h2 style={styles.cardTitle}>Faculty Notices & Campus Circulars</h2>
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

      {/* Homework Creation Modal */}
      {showHomeworkModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Assign Homework to Class</h3>
              <button onClick={() => setShowHomeworkModal(false)} style={styles.closeBtn}>×</button>
            </div>
            <form onSubmit={handleCreateHomework} style={styles.modalForm}>
              <div className="form-group">
                <label className="form-label">Homework Title *</label>
                <input
                  type="text"
                  required
                  value={newHw.title}
                  onChange={(e) => setNewHw({ ...newHw, title: e.target.value })}
                  placeholder="e.g. Chapter 4 Trigonometry Problem Set"
                  className="form-control"
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Target Class *</label>
                  <select
                    required
                    value={newHw.class_id}
                    onChange={(e) => setNewHw({ ...newHw, class_id: e.target.value })}
                    className="form-control"
                  >
                    <option value="">Select Class</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.class_name}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Subject *</label>
                  <select
                    required
                    value={newHw.subject_id}
                    onChange={(e) => setNewHw({ ...newHw, subject_id: e.target.value })}
                    className="form-control"
                  >
                    <option value="">Select Subject</option>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.subject_name}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Submission Due Date *</label>
                  <input
                    type="date"
                    required
                    value={newHw.due_date}
                    onChange={(e) => setNewHw({ ...newHw, due_date: e.target.value })}
                    className="form-control"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Instructions / Description *</label>
                <textarea
                  required
                  rows="3"
                  value={newHw.description}
                  onChange={(e) => setNewHw({ ...newHw, description: e.target.value })}
                  placeholder="Provide instructions, textbook exercise questions or submission guidelines..."
                  className="form-control"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setShowHomeworkModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={submittingHw} className="btn btn-primary">
                  {submittingHw ? 'Assigning...' : 'Assign Homework'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  profileBanner: {
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
  profileAvatar: {
    width: '64px',
    height: '64px',
    borderRadius: '16px',
    background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
    color: '#ffffff',
    fontSize: '28px',
    fontWeight: '800',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 8px 16px rgba(16, 185, 129, 0.25)'
  },
  profileDetails: {
    flex: 1,
    minWidth: '240px'
  },
  teacherRoleTag: {
    fontSize: '11px',
    fontWeight: '800',
    color: '#059669',
    letterSpacing: '0.5px'
  },
  teacherName: {
    fontSize: '22px',
    fontWeight: '800',
    color: '#0f172a',
    margin: '2px 0 4px 0'
  },
  teacherBio: {
    fontSize: '13px',
    color: '#64748b',
    margin: 0
  },
  quickActionGroup: {
    display: 'flex',
    gap: '12px'
  },
  actionButton: {
    padding: '10px 18px',
    fontSize: '13px',
    fontWeight: '600',
    textDecoration: 'none'
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
  kpiHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px'
  },
  kpiLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#64748b'
  },
  kpiIcon: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '15px'
  },
  kpiValue: {
    fontSize: '26px',
    fontWeight: '800',
    color: '#0f172a'
  },
  kpiSub: {
    fontSize: '12px',
    color: '#94a3b8',
    marginTop: '4px'
  },
  twoColGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
    gap: '24px'
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
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#0f172a',
    margin: 0
  },
  cardSubtitle: {
    fontSize: '12px',
    color: '#64748b',
    margin: '2px 0 0 0'
  },
  cardBody: {
    padding: '20px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px'
  },
  timetableItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '12px 14px',
    backgroundColor: '#f8fafc',
    borderRadius: '10px',
    border: '1px solid #e2e8f0'
  },
  slotDay: {
    width: '90px',
    fontSize: '12px',
    fontWeight: '700',
    color: '#2563eb',
    textTransform: 'uppercase'
  },
  slotInfo: {
    flex: 1
  },
  slotSubject: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#0f172a'
  },
  slotTime: {
    fontSize: '12px',
    color: '#64748b',
    marginTop: '2px'
  },
  slotRoom: {
    color: '#059669',
    fontWeight: '600'
  },
  hwItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px',
    backgroundColor: '#f8fafc',
    borderRadius: '10px',
    border: '1px solid #e2e8f0'
  },
  hwDetails: {
    flex: 1
  },
  hwTitle: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#0f172a'
  },
  hwMeta: {
    fontSize: '12px',
    color: '#64748b',
    marginTop: '3px'
  },
  hwProgress: {
    textAlign: 'right'
  },
  hwSubmitted: {
    display: 'block',
    fontSize: '16px',
    fontWeight: '800',
    color: '#2563eb'
  },
  hwSubmittedLabel: {
    fontSize: '10px',
    color: '#94a3b8',
    textTransform: 'uppercase'
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
  },
  modalOverlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    padding: '20px'
  },
  modal: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    maxWidth: '560px',
    width: '100%',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)'
  },
  modalHeader: {
    padding: '18px 24px',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  modalTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#0f172a',
    margin: 0
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '22px',
    cursor: 'pointer',
    color: '#64748b'
  },
  modalForm: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px'
  }
};
