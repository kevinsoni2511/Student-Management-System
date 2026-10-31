import React, { useState, useEffect } from 'react';
import { permissionsApi } from '../../services/api';

export default function RolePermissionsPage() {
  const [matrix, setMatrix] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savingKey, setSavingKey] = useState(null);

  const loadPermissions = async () => {
    try {
      setLoading(true);
      const res = await permissionsApi.getPermissions();
      setMatrix(res.permissions_matrix || {});
      setError(null);
    } catch (err) {
      setError(err?.data?.message || err.message || 'Failed to load permissions matrix');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPermissions();
  }, []);

  const handleToggle = async (role, permissionKey, currentValue) => {
    const key = `${role}_${permissionKey}`;
    try {
      setSavingKey(key);
      const newValue = !currentValue;
      await permissionsApi.togglePermission({
        role,
        permission_key: permissionKey,
        is_allowed: newValue
      });

      setMatrix(prev => ({
        ...prev,
        [role]: {
          ...prev[role],
          [permissionKey]: newValue
        }
      }));
    } catch (err) {
      alert('Failed to update permission: ' + err.message);
    } finally {
      setSavingKey(null);
    }
  };

  if (loading) {
    return <div className="loading-state"><div className="spinner" /> Loading Access Control Matrix...</div>;
  }

  const roleTitles = {
    admin: 'School Admin',
    principal: 'Principal',
    teacher: 'Teacher',
    accountant: 'Accountant',
    receptionist: 'Receptionist',
    librarian: 'Librarian',
    transport_manager: 'Transport Manager',
    parent: 'Parent',
    student: 'Student'
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <span style={styles.tag}>GOVERNANCE & ACCESS CONTROL</span>
          <h1 style={styles.title}>Role & Permission Management</h1>
          <p style={styles.subtitle}>
            Dynamic Permission Assignment: Configure module access and administrative capabilities per user role.
          </p>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <h2 style={styles.cardTitle}>Dynamic RBAC Access Matrix</h2>
          <span style={styles.matrixHint}>Changes apply immediately across API middleware & UI</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>User Role</th>
                <th>Functional Scope</th>
                <th>Configured Capabilities</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(matrix).map(([roleKey, perms]) => (
                <tr key={roleKey}>
                  <td style={{ verticalAlign: 'top', minWidth: '180px' }}>
                    <div style={styles.roleName}>{roleTitles[roleKey] || roleKey}</div>
                    <code style={styles.roleKey}>role: {roleKey}</code>
                  </td>
                  <td style={{ verticalAlign: 'top', color: '#64748b', fontSize: '13px' }}>
                    {roleKey === 'admin' && 'Unrestricted school-wide governance'}
                    {roleKey === 'principal' && 'Academic leadership & faculty appraisals'}
                    {roleKey === 'teacher' && 'Classroom attendance, grading & syllabus'}
                    {roleKey === 'accountant' && 'Fee structures, billing & cashier receipts'}
                    {roleKey === 'receptionist' && 'Front desk walk-in leads & admissions'}
                    {roleKey === 'librarian' && 'Cataloging books, borrows & penalty fines'}
                    {roleKey === 'transport_manager' && 'Bus fleet, route mapping & student allocations'}
                    {roleKey === 'parent' && 'Own children dossier, marks & payments'}
                    {roleKey === 'student' && 'Own timetable, assignments & report cards'}
                  </td>
                  <td style={{ verticalAlign: 'top' }}>
                    <div style={styles.permsGrid}>
                      {Object.entries(perms).map(([permKey, isAllowed]) => {
                        const isSaving = savingKey === `${roleKey}_${permKey}`;
                        return (
                          <button
                            key={permKey}
                            onClick={() => handleToggle(roleKey, permKey, isAllowed)}
                            disabled={isSaving}
                            style={{
                              ...styles.permBadge,
                              ...(isAllowed ? styles.permAllowed : styles.permDenied)
                            }}
                            title={`Click to ${isAllowed ? 'Revoke' : 'Grant'}`}
                          >
                            <span>{isAllowed ? '✓' : '✕'}</span>
                            <span>{permKey.replace(/_/g, ' ')}</span>
                            {isSaving && <span style={{ fontSize: '10px' }}>...</span>}
                          </button>
                        );
                      })}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  tag: {
    display: 'inline-block',
    fontSize: '11px',
    fontWeight: '800',
    color: '#2563eb',
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
  matrixHint: {
    fontSize: '12px',
    color: '#64748b'
  },
  roleName: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#0f172a'
  },
  roleKey: {
    fontSize: '11px',
    color: '#2563eb',
    backgroundColor: '#eff6ff',
    padding: '2px 6px',
    borderRadius: '4px',
    marginTop: '4px',
    display: 'inline-block'
  },
  permsGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px'
  },
  permBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 10px',
    borderRadius: '6px',
    border: '1px solid transparent',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  permAllowed: {
    backgroundColor: '#ecfdf5',
    color: '#065f46',
    borderColor: '#a7f3d0'
  },
  permDenied: {
    backgroundColor: '#fef2f2',
    color: '#991b1b',
    borderColor: '#fecaca',
    opacity: 0.75
  }
};
