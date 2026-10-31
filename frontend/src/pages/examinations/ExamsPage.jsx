import React, { useState, useEffect } from 'react';
import { examsApi, academicsApi, studentsApi } from '../../services/api';

export default function ExamsPage() {
  const [activeTab, setActiveTab] = useState('list');
  const [exams, setExams] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // New Exam Modal
  const [showExamModal, setShowExamModal] = useState(false);
  const [examForm, setExamForm] = useState({
    academic_session_id: 1,
    exam_name: '',
    exam_type: 'Terminal',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    status: 'Scheduled'
  });

  // Marks Entry State
  const [selectedExamId, setSelectedExamId] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [marksSheet, setMarksSheet] = useState([]);
  const [maxMarks, setMaxMarks] = useState(100);
  const [loadingSheet, setLoadingSheet] = useState(false);
  const [savingMarks, setSavingMarks] = useState(false);

  // Report Card State
  const [reportStudentId, setReportStudentId] = useState('');
  const [reportCardData, setReportCardData] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);

  useEffect(() => {
    loadPrerequisites();
  }, []);

  const loadPrerequisites = async () => {
    setLoading(true);
    try {
      const [exRes, clsRes, subRes, sesRes, stuRes] = await Promise.all([
        examsApi.getAll(),
        academicsApi.getClasses(),
        academicsApi.getSubjects(),
        academicsApi.getSessions(),
        studentsApi.getAll({ per_page: 100 })
      ]);

      const ex = exRes?.data || [];
      const cls = clsRes?.data || [];
      const subs = subRes?.data || [];
      const sess = sesRes?.data || [];

      setExams(ex);
      setClasses(cls);
      setSubjects(subs);
      setSessions(sess);
      setStudents(stuRes?.data || []);

      if (ex.length > 0) setSelectedExamId(ex[0].id);
      if (cls.length > 0) setSelectedClassId(cls[0].id);
      if (subs.length > 0) setSelectedSubjectId(subs[0].id);
      if (sess.length > 0) setExamForm(prev => ({ ...prev, academic_session_id: sess[0].id }));
    } catch (err) {
      setError(err.message || 'Error loading examination dependencies');
    } finally {
      setLoading(false);
    }
  };

  const notify = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  // Create Exam
  const handleCreateExam = async (e) => {
    e.preventDefault();
    try {
      await examsApi.create(examForm);
      setShowExamModal(false);
      notify('Examination scheduled successfully.');
      const res = await examsApi.getAll();
      setExams(res?.data || []);
    } catch (err) {
      alert(err.message || 'Error scheduling exam');
    }
  };

  // Load Marks Sheet
  const handleFetchMarksSheet = async () => {
    if (!selectedExamId || !selectedClassId || !selectedSubjectId) return;

    setLoadingSheet(true);
    try {
      const res = await examsApi.getMarksSheet({
        examination_id: selectedExamId,
        class_id: selectedClassId,
        subject_id: selectedSubjectId
      });
      setMarksSheet(res?.data?.students || []);
    } catch (err) {
      alert(err.message || 'Error loading marks sheet');
    } finally {
      setLoadingSheet(false);
    }
  };

  const updateMarkRow = (studentId, field, value) => {
    setMarksSheet(prev => prev.map(row => {
      if (row.student_id !== studentId) return row;
      const updated = { ...row, [field]: value };
      if (field === 'is_absent' && value) {
        updated.marks_obtained = 0;
        updated.grade = 'AB';
      } else if (field === 'marks_obtained') {
        const pct = (parseFloat(value) || 0) / (parseFloat(maxMarks) || 100) * 100;
        updated.grade = pct >= 90 ? 'A+' : pct >= 80 ? 'A' : pct >= 70 ? 'B+' : pct >= 60 ? 'B' : pct >= 50 ? 'C' : pct >= 40 ? 'D' : 'F';
      }
      return updated;
    }));
  };

  // Save Marks to API
  const handleSaveMarks = async () => {
    if (marksSheet.length === 0) return;
    setSavingMarks(true);
    try {
      await examsApi.saveMarks({
        examination_id: selectedExamId,
        subject_id: selectedSubjectId,
        max_marks: maxMarks,
        records: marksSheet.map(s => ({
          student_id: s.student_id,
          marks_obtained: s.marks_obtained,
          is_absent: s.is_absent,
          remarks: s.remarks || null
        }))
      });
      notify('Examination marks saved successfully!');
    } catch (err) {
      alert(err.message || 'Error saving marks');
    } finally {
      setSavingMarks(false);
    }
  };

  // Generate Report Card
  const handleGenerateReport = async () => {
    if (!reportStudentId) return;
    setLoadingReport(true);
    try {
      const res = await examsApi.getReportCard(reportStudentId, { examination_id: selectedExamId });
      setReportCardData(res?.data);
    } catch (err) {
      alert(err.message || 'Error generating report card');
    } finally {
      setLoadingReport(false);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px 0' }}>Examinations & Report Cards</h1>
          <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>Schedule exams, record subject-wise test marks, and generate official student grade cards.</p>
        </div>
        <button onClick={() => setShowExamModal(true)} style={btnPrimary}>
          + Schedule New Exam
        </button>
      </div>

      {successMsg && (
        <div style={{ padding: '12px 16px', backgroundColor: '#ecfdf5', border: '1px solid #10b981', color: '#065f46', borderRadius: '8px', marginBottom: '20px', fontWeight: 600 }}>
          {successMsg}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e2e8f0', marginBottom: '20px' }}>
        <button
          onClick={() => setActiveTab('list')}
          style={{ ...tabBtn, borderBottom: activeTab === 'list' ? '2px solid #2563eb' : '2px solid transparent', color: activeTab === 'list' ? '#2563eb' : '#64748b', fontWeight: activeTab === 'list' ? 700 : 500 }}
        >
          Scheduled Examinations ({exams.length})
        </button>
        <button
          onClick={() => {
            setActiveTab('marks');
            handleFetchMarksSheet();
          }}
          style={{ ...tabBtn, borderBottom: activeTab === 'marks' ? '2px solid #2563eb' : '2px solid transparent', color: activeTab === 'marks' ? '#2563eb' : '#64748b', fontWeight: activeTab === 'marks' ? 700 : 500 }}
        >
          Marks Entry Sheet
        </button>
        <button
          onClick={() => setActiveTab('report')}
          style={{ ...tabBtn, borderBottom: activeTab === 'report' ? '2px solid #2563eb' : '2px solid transparent', color: activeTab === 'report' ? '#2563eb' : '#64748b', fontWeight: activeTab === 'report' ? 700 : 500 }}
        >
          Generate Report Card
        </button>
      </div>

      {/* TAB 1: Exams List */}
      {activeTab === 'list' && (
        <div style={tableContainer}>
          <table style={tableStyle}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={thStyle}>Exam Name</th>
                <th style={thStyle}>Type</th>
                <th style={thStyle}>Academic Session</th>
                <th style={thStyle}>Start Date</th>
                <th style={thStyle}>End Date</th>
                <th style={thStyle}>Status</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {exams.map(ex => (
                <tr key={ex.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ ...tdStyle, fontWeight: 700, color: '#0f172a' }}>{ex.exam_name}</td>
                  <td style={tdStyle}>
                    <span style={{ padding: '3px 8px', borderRadius: '4px', backgroundColor: '#f1f5f9', fontSize: '11px', fontWeight: 600 }}>
                      {ex.exam_type}
                    </span>
                  </td>
                  <td style={tdStyle}>{ex.academic_session?.session_name || '2026-2027'}</td>
                  <td style={tdStyle}>{ex.start_date}</td>
                  <td style={tdStyle}>{ex.end_date}</td>
                  <td style={tdStyle}>
                    <span style={{ padding: '3px 8px', borderRadius: '9999px', fontSize: '11px', fontWeight: 700, backgroundColor: ex.status === 'Ongoing' ? '#ecfdf5' : ex.status === 'Completed' ? '#f1f5f9' : '#eff6ff', color: ex.status === 'Ongoing' ? '#059669' : '#1e40af' }}>
                      {ex.status}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>
                    <button
                      onClick={() => {
                        setSelectedExamId(ex.id);
                        setActiveTab('marks');
                        handleFetchMarksSheet();
                      }}
                      style={btnEnterMarks}
                    >
                      Enter Marks
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 2: Marks Entry Sheet */}
      {activeTab === 'marks' && (
        <div>
          <div style={filterBar}>
            <div>
              <label style={labelStyle}>Select Exam</label>
              <select value={selectedExamId} onChange={e => setSelectedExamId(e.target.value)} style={inputStyle}>
                {exams.map(e => (
                  <option key={e.id} value={e.id}>{e.exam_name}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Class</label>
              <select value={selectedClassId} onChange={e => setSelectedClassId(e.target.value)} style={inputStyle}>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.class_name}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Subject</label>
              <select value={selectedSubjectId} onChange={e => setSelectedSubjectId(e.target.value)} style={inputStyle}>
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.subject_name} ({s.subject_code})</option>
                ))}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Max Marks</label>
              <input
                type="number"
                value={maxMarks}
                onChange={e => setMaxMarks(e.target.value)}
                style={{ ...inputStyle, width: '100px' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
              <button onClick={handleFetchMarksSheet} style={btnSecondary}>
                Load Roster
              </button>
              <button
                onClick={handleSaveMarks}
                disabled={savingMarks || marksSheet.length === 0}
                style={btnPrimary}
              >
                {savingMarks ? 'Saving...' : '✓ Save Marks'}
              </button>
            </div>
          </div>

          <div style={tableContainer}>
            {loadingSheet ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>Loading students...</div>
            ) : marksSheet.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
                Select an examination, class, and subject, then click "Load Roster".
              </div>
            ) : (
              <table style={tableStyle}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ ...thStyle, width: '70px' }}>Roll #</th>
                    <th style={thStyle}>Admission #</th>
                    <th style={thStyle}>Student Name</th>
                    <th style={{ ...thStyle, width: '140px' }}>Marks Obtained</th>
                    <th style={{ ...thStyle, width: '100px' }}>Absent?</th>
                    <th style={{ ...thStyle, width: '90px' }}>Grade</th>
                    <th style={thStyle}>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {marksSheet.map(stu => (
                    <tr key={stu.student_id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ ...tdStyle, fontWeight: 700 }}>#{stu.roll_no || '-'}</td>
                      <td style={{ ...tdStyle, color: '#2563eb', fontWeight: 600 }}>{stu.admission_no}</td>
                      <td style={{ ...tdStyle, fontWeight: 600 }}>{stu.student_name}</td>
                      <td style={tdStyle}>
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          max={maxMarks}
                          disabled={stu.is_absent}
                          value={stu.marks_obtained ?? ''}
                          onChange={e => updateMarkRow(stu.student_id, 'marks_obtained', e.target.value)}
                          placeholder="Score"
                          style={{ ...inputStyle, width: '90px' }}
                        />
                      </td>
                      <td style={tdStyle}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={Boolean(stu.is_absent)}
                            onChange={e => updateMarkRow(stu.student_id, 'is_absent', e.target.checked)}
                          />
                          Absent
                        </label>
                      </td>
                      <td style={tdStyle}>
                        <span style={{ fontWeight: 800, color: stu.grade === 'F' ? '#dc2626' : '#2563eb', fontSize: '14px' }}>
                          {stu.grade || '-'}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <input
                          type="text"
                          placeholder="Teacher remarks..."
                          value={stu.remarks || ''}
                          onChange={e => updateMarkRow(stu.student_id, 'remarks', e.target.value)}
                          style={{ ...inputStyle, width: '100%' }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: Report Card */}
      {activeTab === 'report' && (
        <div>
          <div style={{ ...filterBar, alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Select Student</label>
              <select
                value={reportStudentId}
                onChange={e => setReportStudentId(e.target.value)}
                style={inputStyle}
              >
                <option value="">-- Choose Student --</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.full_name} ({s.admission_no}) - Class {s.school_class?.class_name || ''}
                  </option>
                ))}
              </select>
            </div>

            <button onClick={handleGenerateReport} disabled={loadingReport || !reportStudentId} style={btnPrimary}>
              {loadingReport ? 'Generating...' : 'View Report Card'}
            </button>
          </div>

          {reportCardData && (
            <div style={reportCardWrapper} id="printableReportCard">
              {/* Header */}
              <div style={{ textAlign: 'center', borderBottom: '2px solid #0f172a', paddingBottom: '16px', marginBottom: '20px' }}>
                <h2 style={{ margin: '0 0 4px 0', fontSize: '22px', fontWeight: 800, color: '#0f172a' }}>
                  {reportCardData.school?.name}
                </h2>
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  {reportCardData.school?.affiliation} • {reportCardData.school?.address}
                </div>
                <div style={{ display: 'inline-block', marginTop: '12px', padding: '6px 20px', backgroundColor: '#0f172a', color: '#ffffff', borderRadius: '4px', fontSize: '13px', fontWeight: 800, letterSpacing: '1px' }}>
                  OFFICIAL ACADEMIC PROGRESS REPORT CARD
                </div>
              </div>

              {/* Student Bio */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', fontSize: '13px', backgroundColor: '#f8fafc', padding: '14px', borderRadius: '8px', marginBottom: '20px' }}>
                <div><strong>Student Name:</strong> {reportCardData.student?.name}</div>
                <div><strong>Admission No:</strong> <span style={{ color: '#2563eb' }}>{reportCardData.student?.admission_no}</span></div>
                <div><strong>Roll No:</strong> #{reportCardData.student?.roll_no}</div>
                <div><strong>Class & Sec:</strong> {reportCardData.student?.class} (Sec {reportCardData.student?.section})</div>
                <div><strong>Examination:</strong> {reportCardData.exam?.name}</div>
                <div><strong>Session:</strong> {reportCardData.exam?.session}</div>
              </div>

              {/* Subject Scores Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', marginBottom: '20px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '2px solid #cbd5e1', textAlign: 'left' }}>
                    <th style={{ padding: '10px' }}>Subject</th>
                    <th style={{ padding: '10px' }}>Type</th>
                    <th style={{ padding: '10px' }}>Max Marks</th>
                    <th style={{ padding: '10px' }}>Marks Obtained</th>
                    <th style={{ padding: '10px' }}>Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {reportCardData.subjects?.map((sub, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '10px', fontWeight: 600 }}>{sub.subject_name}</td>
                      <td style={{ padding: '10px', color: '#64748b' }}>{sub.subject_type}</td>
                      <td style={{ padding: '10px' }}>{sub.max_marks}</td>
                      <td style={{ padding: '10px', fontWeight: 700, color: '#2563eb' }}>
                        {sub.is_absent ? 'Absent' : sub.marks_obtained}
                      </td>
                      <td style={{ padding: '10px', fontWeight: 800 }}>{sub.grade}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Summary Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', textAlign: 'center', marginBottom: '30px' }}>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: 800 }}>{reportCardData.totals?.total_max}</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Total Max Marks</div>
                </div>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#2563eb' }}>{reportCardData.totals?.total_obtained}</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Total Obtained</div>
                </div>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#059669' }}>{reportCardData.totals?.percentage}%</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Aggregate Percentage</div>
                </div>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: reportCardData.totals?.grade === 'F' ? '#dc2626' : '#2563eb' }}>
                    {reportCardData.totals?.grade} ({reportCardData.totals?.result})
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Overall Assessment</div>
                </div>
              </div>

              {/* Signatures */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px', paddingTop: '20px', borderTop: '1px dashed #cbd5e1', fontSize: '12px' }}>
                <div style={{ borderTop: '1px solid #94a3b8', paddingTop: '4px', width: '160px', textAlign: 'center' }}>
                  Class Teacher
                </div>
                <div style={{ borderTop: '1px solid #94a3b8', paddingTop: '4px', width: '160px', textAlign: 'center' }}>
                  Controller of Exams
                </div>
                <div style={{ borderTop: '1px solid #94a3b8', paddingTop: '4px', width: '160px', textAlign: 'center' }}>
                  Principal Signature
                </div>
              </div>

              <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={() => window.print()} style={btnPrimary}>
                  🖨️ Print Report Card
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal: Schedule Exam */}
      {showExamModal && (
        <div style={modalOverlay}>
          <div style={modalBox}>
            <div style={modalHeader}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Schedule New Examination</h3>
              <button onClick={() => setShowExamModal(false)} style={closeBtn}>✕</button>
            </div>
            <form onSubmit={handleCreateExam} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={labelStyle}>Academic Session *</label>
                <select
                  value={examForm.academic_session_id}
                  onChange={e => setExamForm({ ...examForm, academic_session_id: e.target.value })}
                  style={inputStyle}
                >
                  {sessions.map(s => (
                    <option key={s.id} value={s.id}>{s.session_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Exam Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mid-Term Examination 2026"
                  value={examForm.exam_name}
                  onChange={e => setExamForm({ ...examForm, exam_name: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Exam Type</label>
                <select
                  value={examForm.exam_type}
                  onChange={e => setExamForm({ ...examForm, exam_type: e.target.value })}
                  style={inputStyle}
                >
                  <option value="Terminal">Terminal</option>
                  <option value="Mid-Term">Mid-Term</option>
                  <option value="Unit Test">Unit Test</option>
                  <option value="Final">Final</option>
                  <option value="Practical">Practical</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Start Date *</label>
                  <input
                    type="date"
                    required
                    value={examForm.start_date}
                    onChange={e => setExamForm({ ...examForm, start_date: e.target.value })}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>End Date *</label>
                  <input
                    type="date"
                    required
                    value={examForm.end_date}
                    onChange={e => setExamForm({ ...examForm, end_date: e.target.value })}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Status</label>
                <select
                  value={examForm.status}
                  onChange={e => setExamForm({ ...examForm, status: e.target.value })}
                  style={inputStyle}
                >
                  <option value="Scheduled">Scheduled</option>
                  <option value="Ongoing">Ongoing</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowExamModal(false)} style={btnCancel}>Cancel</button>
                <button type="submit" style={btnPrimary}>Schedule Exam</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const tabBtn = {
  padding: '12px 18px',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontSize: '14px'
};

const filterBar = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '14px',
  marginBottom: '20px',
  backgroundColor: '#ffffff',
  padding: '16px',
  borderRadius: '12px',
  border: '1px solid #e2e8f0',
  boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
};

const labelStyle = {
  display: 'block',
  fontSize: '12px',
  fontWeight: 600,
  color: '#475569',
  marginBottom: '4px'
};

const inputStyle = {
  padding: '9px 12px',
  borderRadius: '8px',
  border: '1px solid #cbd5e1',
  fontSize: '13px',
  backgroundColor: '#ffffff'
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

const btnPrimary = {
  padding: '9px 16px',
  backgroundColor: '#2563eb',
  color: '#ffffff',
  border: 'none',
  borderRadius: '8px',
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer'
};

const btnSecondary = {
  padding: '9px 16px',
  backgroundColor: '#f1f5f9',
  color: '#334155',
  border: '1px solid #cbd5e1',
  borderRadius: '8px',
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer'
};

const btnEnterMarks = {
  padding: '5px 12px',
  backgroundColor: '#eff6ff',
  color: '#1d4ed8',
  border: '1px solid #bfdbfe',
  borderRadius: '6px',
  fontSize: '12px',
  fontWeight: 600,
  cursor: 'pointer'
};

const reportCardWrapper = {
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  border: '1px solid #e2e8f0',
  padding: '30px',
  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
};

const modalOverlay = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(15, 23, 42, 0.65)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 100,
  padding: '16px'
};

const modalBox = {
  backgroundColor: '#ffffff',
  borderRadius: '14px',
  width: '100%',
  maxWidth: '500px',
  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  overflow: 'hidden'
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
  fontSize: '18px',
  color: '#64748b',
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
