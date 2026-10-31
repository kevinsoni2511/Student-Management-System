import React, { useState, useEffect } from 'react';
import { librarianPortalApi } from '../../services/api';

export default function LibrarianDashboard() {
  const [data, setData] = useState(null);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddBook, setShowAddBook] = useState(false);
  const [newBook, setNewBook] = useState({
    title: '', author: '', isbn: '', category: 'Literature', publisher: '', rack_no: '', total_copies: 5
  });
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await librarianPortalApi.getDashboard();
      setData(res);
      const bRes = await librarianPortalApi.getBooks();
      setBooks(bRes.books || []);
      setError(null);
    } catch (err) {
      setError(err?.data?.message || err.message || 'Failed to load Library portal');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateBook = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await librarianPortalApi.createBook(newBook);
      alert('Book cataloged successfully.');
      setShowAddBook(false);
      setNewBook({ title: '', author: '', isbn: '', category: 'Literature', publisher: '', rack_no: '', total_copies: 5 });
      loadData();
    } catch (err) {
      alert(err?.data?.message || err.message || 'Failed to add book');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReturnBook = async (issueId) => {
    const fine = prompt('Enter fine amount if overdue (₹):', '0.00');
    if (fine === null) return;
    try {
      await librarianPortalApi.returnBook(issueId, { fine_amount: parseFloat(fine) || 0.00 });
      alert('Book returned and copy count restored.');
      loadData();
    } catch (err) {
      alert('Failed to return book: ' + err.message);
    }
  };

  if (loading) {
    return <div className="loading-state"><div className="spinner" /> Loading Library Information System...</div>;
  }

  const stats = data?.statistics || {};
  const recentIssues = data?.recent_issues || [];

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <span style={styles.tag}>KNOWLEDGE REPOSITORY CONSOLE</span>
          <h1 style={styles.title}>Librarian Management Portal</h1>
          <p style={styles.subtitle}>Library Catalog, Circulation Ledger, Due Dates & Student Fine Records</p>
        </div>
        <button onClick={() => setShowAddBook(true)} className="btn btn-primary" style={styles.actionBtn}>
          + Catalog New Book
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* KPI Cards */}
      <div style={styles.kpiGrid}>
        <div style={styles.kpiCard}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiLabel}>Total Volumes</span>
            <div style={{ ...styles.kpiIcon, backgroundColor: '#dbeafe', color: '#2563eb' }}>📚</div>
          </div>
          <div style={styles.kpiValue}>{stats.total_books || 0}</div>
          <div style={styles.kpiSub}>Cataloged physical copies</div>
        </div>

        <div style={styles.kpiCard}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiLabel}>Available in Racks</span>
            <div style={{ ...styles.kpiIcon, backgroundColor: '#dcfce7', color: '#15803d' }}>📖</div>
          </div>
          <div style={styles.kpiValue}>{stats.available_books || 0}</div>
          <div style={styles.kpiSub}>Ready for borrowing</div>
        </div>

        <div style={styles.kpiCard}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiLabel}>Active Issues</span>
            <div style={{ ...styles.kpiIcon, backgroundColor: '#fef3c7', color: '#d97706' }}>🔄</div>
          </div>
          <div style={styles.kpiValue}>{stats.issued_books || 0}</div>
          <div style={styles.kpiSub}>In student possession</div>
        </div>

        <div style={styles.kpiCard}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiLabel}>Collected Fines</span>
            <div style={{ ...styles.kpiIcon, backgroundColor: '#fee2e2', color: '#b91c1c' }}>💸</div>
          </div>
          <div style={styles.kpiValue}>₹{(stats.fines_collected || 0).toLocaleString()}</div>
          <div style={styles.kpiSub}>Overdue recovery</div>
        </div>
      </div>

      {/* Circulation Ledger Table */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div>
            <h2 style={styles.cardTitle}>Circulation & Book Issue Ledger</h2>
            <p style={styles.cardSubtitle}>Active student borrows and due date tracking</p>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Book Title</th>
                <th>Student Borrower</th>
                <th>Class</th>
                <th>Issue Date</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentIssues.map((iss) => (
                <tr key={iss.id}>
                  <td><strong>{iss.book?.title}</strong></td>
                  <td>{iss.student?.full_name}</td>
                  <td>{iss.student?.school_class?.class_name || 'Class 10'}</td>
                  <td>{iss.issue_date}</td>
                  <td>
                    <span style={{ fontWeight: '700', color: iss.status === 'Issued' ? '#d97706' : '#64748b' }}>
                      {iss.due_date}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: iss.status === 'Returned' ? '#15803d' : '#b45309' }}>
                      ● {iss.status}
                    </span>
                  </td>
                  <td>
                    {iss.status === 'Issued' && (
                      <button
                        onClick={() => handleReturnBook(iss.id)}
                        className="btn btn-primary"
                        style={{ fontSize: '11px', padding: '4px 10px' }}
                      >
                        Process Return
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Books Catalog */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div>
            <h2 style={styles.cardTitle}>Library Catalog Inventory</h2>
            <p style={styles.cardSubtitle}>Search by title, author, or rack placement</p>
          </div>
          <span style={styles.pill}>{books.length} Titles</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Title & ISBN</th>
                <th>Author</th>
                <th>Category</th>
                <th>Rack #</th>
                <th>Total Copies</th>
                <th>Available</th>
                <th>Stock Status</th>
              </tr>
            </thead>
            <tbody>
              {books.map((b) => (
                <tr key={b.id}>
                  <td>
                    <strong>{b.title}</strong>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>ISBN: {b.isbn || 'N/A'}</div>
                  </td>
                  <td>{b.author}</td>
                  <td><span style={styles.catBadge}>{b.category}</span></td>
                  <td><strong>{b.rack_no || 'R-01'}</strong></td>
                  <td>{b.total_copies}</td>
                  <td><strong>{b.available_copies}</strong></td>
                  <td>
                    <span style={{ color: b.available_copies > 0 ? '#16a34a' : '#ef4444', fontWeight: '700', fontSize: '12px' }}>
                      ● {b.available_copies > 0 ? 'In Stock' : 'Checked Out'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Book Modal */}
      {showAddBook && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Add Book to Library Catalog</h3>
              <button onClick={() => setShowAddBook(false)} style={styles.closeBtn}>×</button>
            </div>
            <form onSubmit={handleCreateBook} style={styles.modalForm}>
              <div className="form-group">
                <label className="form-label">Book Title *</label>
                <input
                  type="text"
                  required
                  value={newBook.title}
                  onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                  placeholder="e.g. NCERT Science Exemplar Class 10"
                  className="form-control"
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Author Name *</label>
                  <input
                    type="text"
                    required
                    value={newBook.author}
                    onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                    className="form-control"
                    placeholder="e.g. Dr. H. C. Verma"
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">ISBN Code</label>
                  <input
                    type="text"
                    value={newBook.isbn}
                    onChange={(e) => setNewBook({ ...newBook, isbn: e.target.value })}
                    className="form-control"
                    placeholder="978-0123456789"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Category *</label>
                  <select
                    value={newBook.category}
                    onChange={(e) => setNewBook({ ...newBook, category: e.target.value })}
                    className="form-control"
                  >
                    <option value="Literature">Literature</option>
                    <option value="Science">Science</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Social Science">Social Science</option>
                    <option value="Biography">Biography</option>
                    <option value="Computer Science">Computer Science</option>
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Rack Number</label>
                  <input
                    type="text"
                    value={newBook.rack_no}
                    onChange={(e) => setNewBook({ ...newBook, rack_no: e.target.value })}
                    className="form-control"
                    placeholder="e.g. Rack A-4"
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Total Copies *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newBook.total_copies}
                    onChange={(e) => setNewBook({ ...newBook, total_copies: parseInt(e.target.value) || 1 })}
                    className="form-control"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setShowAddBook(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? 'Saving...' : 'Add Book'}
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
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px'
  },
  tag: {
    display: 'inline-block',
    fontSize: '11px',
    fontWeight: '800',
    color: '#0284c7',
    letterSpacing: '1px',
    marginBottom: '4px'
  },
  title: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#0f172a',
    margin: 0
  },
  subtitle: {
    fontSize: '14px',
    color: '#64748b',
    marginTop: '4px'
  },
  actionBtn: {
    padding: '10px 18px',
    fontSize: '14px',
    fontWeight: '600'
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
  pill: {
    fontSize: '12px',
    padding: '4px 10px',
    backgroundColor: '#f1f5f9',
    color: '#334155',
    borderRadius: '20px',
    fontWeight: '700'
  },
  catBadge: {
    padding: '3px 8px',
    backgroundColor: '#f0fdf4',
    color: '#166534',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '600'
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
