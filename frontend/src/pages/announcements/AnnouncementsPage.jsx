import React, { useState, useEffect } from 'react';
import { announcementsApi } from '../../services/api';

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [targetFilter, setTargetFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    title: '',
    content: '',
    target_role: 'All',
    publish_date: new Date().toISOString().split('T')[0],
    is_active: true
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAnnouncements();
  }, [targetFilter]);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await announcementsApi.getAll({ target: targetFilter });
      setAnnouncements(res?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await announcementsApi.create(form);
      setShowModal(false);
      setForm({
        title: '',
        content: '',
        target_role: 'All',
        publish_date: new Date().toISOString().split('T')[0],
        is_active: true
      });
      fetchAnnouncements();
    } catch (err) {
      alert(err.message || 'Error publishing notice');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`Delete notice: "${title}"?`)) {
      try {
        await announcementsApi.delete(id);
        fetchAnnouncements();
      } catch (err) {
        alert(err.message || 'Error deleting notice');
      }
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px 0' }}>Noticeboard & Circulars</h1>
          <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>Publish official bulletins, circulars, and notifications for staff, parents, and students.</p>
        </div>
        <button onClick={() => setShowModal(true)} style={btnPrimary}>
          + New Announcement
        </button>
      </div>

      {/* Target Audience Filter */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {['', 'All', 'Teachers', 'Students', 'Parents', 'Staff'].map(role => (
          <button
            key={role}
            onClick={() => setTargetFilter(role)}
            style={{
              padding: '7px 14px',
              borderRadius: '20px',
              border: '1px solid #cbd5e1',
              backgroundColor: targetFilter === role ? '#2563eb' : '#ffffff',
              color: targetFilter === role ? '#ffffff' : '#475569',
              fontSize: '12.5px',
              fontWeight: targetFilter === role ? 700 : 500,
              cursor: 'pointer'
            }}
          >
            {role === '' ? 'All Announcements' : role}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>Loading bulletins...</div>
      ) : announcements.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', color: '#64748b' }}>
          No announcements found.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {announcements.map(notice => (
            <div key={notice.id} style={noticeCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{
                    padding: '3px 10px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: 700,
                    backgroundColor: notice.target_role === 'All' ? '#eff6ff' : notice.target_role === 'Teachers' ? '#ecfdf5' : '#fffbeb',
                    color: notice.target_role === 'All' ? '#1d4ed8' : notice.target_role === 'Teachers' ? '#059669' : '#d97706'
                  }}>
                    AUDIENCE: {notice.target_role.toUpperCase()}
                  </span>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>
                    Published: {notice.publish_date}
                  </span>
                </div>
                <button
                  onClick={() => handleDelete(notice.id, notice.title)}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '13px' }}
                  title="Delete Notice"
                >
                  ✕
                </button>
              </div>

              <h3 style={{ margin: '0 0 10px 0', fontSize: '17px', fontWeight: 700, color: '#0f172a' }}>
                {notice.title}
              </h3>

              <p style={{ margin: 0, fontSize: '14px', color: '#334155', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                {notice.content}
              </p>

              {notice.author && (
                <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid #f1f5f9', fontSize: '12px', color: '#64748b' }}>
                  Posted by: <strong>{notice.author.name}</strong>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={modalOverlay}>
          <div style={modalBox}>
            <div style={modalHeader}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Post New Announcement</h3>
              <button onClick={() => setShowModal(false)} style={closeBtn}>✕</button>
            </div>
            <form onSubmit={handleCreate} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={labelStyle}>Announcement Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Annual Sports Meet 2026 Scheduled"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Target Audience *</label>
                  <select
                    value={form.target_role}
                    onChange={e => setForm({ ...form, target_role: e.target.value })}
                    style={inputStyle}
                  >
                    <option value="All">All School (Staff, Parents, Students)</option>
                    <option value="Teachers">Faculty & Teachers Only</option>
                    <option value="Staff">Non-Teaching Staff Only</option>
                    <option value="Parents">Parents Only</option>
                    <option value="Students">Students Only</option>
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Publish Date *</label>
                  <input
                    type="date"
                    required
                    value={form.publish_date}
                    onChange={e => setForm({ ...form, publish_date: e.target.value })}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Notice Body / Content *</label>
                <textarea
                  required
                  rows={5}
                  placeholder="Type the full circular text here..."
                  value={form.content}
                  onChange={e => setForm({ ...form, content: e.target.value })}
                  style={{ ...inputStyle, fontFamily: 'inherit', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={btnCancel}>Cancel</button>
                <button type="submit" disabled={submitting} style={btnPrimary}>
                  {submitting ? 'Publishing...' : 'Publish Announcement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const noticeCard = {
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  border: '1px solid #e2e8f0',
  padding: '20px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
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
  maxWidth: '540px',
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

const labelStyle = {
  display: 'block',
  fontSize: '12px',
  fontWeight: 600,
  color: '#475569',
  marginBottom: '4px'
};

const inputStyle = {
  width: '100%',
  padding: '9px 12px',
  borderRadius: '8px',
  border: '1px solid #cbd5e1',
  fontSize: '13px',
  boxSizing: 'border-box'
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
