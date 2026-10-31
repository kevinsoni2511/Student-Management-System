import React, { useState, useEffect } from 'react';
import { transportPortalApi } from '../../services/api';

export default function TransportDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [showRouteModal, setShowRouteModal] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    vehicle_no: '', vehicle_model: '', capacity: 40, driver_name: '', driver_phone: '', driver_license: ''
  });
  const [newRoute, setNewRoute] = useState({
    route_name: '', start_point: '', end_point: '', vehicle_id: '', monthly_fare: 2000
  });
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await transportPortalApi.getDashboard();
      setData(res);
      setError(null);
    } catch (err) {
      setError(err?.data?.message || err.message || 'Failed to load Transport portal');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateVehicle = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await transportPortalApi.createVehicle(newVehicle);
      alert('Vehicle successfully registered in fleet.');
      setShowVehicleModal(false);
      setNewVehicle({ vehicle_no: '', vehicle_model: '', capacity: 40, driver_name: '', driver_phone: '', driver_license: '' });
      loadData();
    } catch (err) {
      alert('Failed: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateRoute = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await transportPortalApi.createRoute(newRoute);
      alert('Transport Route created successfully.');
      setShowRouteModal(false);
      setNewRoute({ route_name: '', start_point: '', end_point: '', vehicle_id: '', monthly_fare: 2000 });
      loadData();
    } catch (err) {
      alert('Failed: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="loading-state"><div className="spinner" /> Loading Transport Fleet System...</div>;
  }

  const stats = data?.statistics || {};
  const vehicles = data?.vehicles || [];
  const routes = data?.routes || [];
  const allocations = data?.recent_allocations || [];

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <span style={styles.tag}>FLEET & LOGISTICS MANAGEMENT</span>
          <h1 style={styles.title}>Transport Operations Portal</h1>
          <p style={styles.subtitle}>School Buses, Designated Routes, Pickup Stops & Student Bus Passes</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setShowVehicleModal(true)} className="btn btn-secondary" style={styles.actionBtn}>
            + Register Vehicle
          </button>
          <button onClick={() => setShowRouteModal(true)} className="btn btn-primary" style={styles.actionBtn}>
            + Add New Route
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* KPI Cards */}
      <div style={styles.kpiGrid}>
        <div style={styles.kpiCard}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiLabel}>Fleet Size</span>
            <div style={{ ...styles.kpiIcon, backgroundColor: '#ffedd5', color: '#c2410c' }}>🚌</div>
          </div>
          <div style={styles.kpiValue}>{stats.total_vehicles || vehicles.length}</div>
          <div style={styles.kpiSub}>Active School Buses</div>
        </div>

        <div style={styles.kpiCard}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiLabel}>Designated Routes</span>
            <div style={{ ...styles.kpiIcon, backgroundColor: '#dbeafe', color: '#2563eb' }}>🗺️</div>
          </div>
          <div style={styles.kpiValue}>{stats.active_routes || routes.length}</div>
          <div style={styles.kpiSub}>Covering NCR & suburbs</div>
        </div>

        <div style={styles.kpiCard}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiLabel}>Allocated Commuters</span>
            <div style={{ ...styles.kpiIcon, backgroundColor: '#dcfce7', color: '#15803d' }}>🎒</div>
          </div>
          <div style={styles.kpiValue}>{stats.allocated_students || 0}</div>
          <div style={styles.kpiSub}>Active bus passes</div>
        </div>

        <div style={styles.kpiCard}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiLabel}>Fleet Capacity</span>
            <div style={{ ...styles.kpiIcon, backgroundColor: '#f3e8ff', color: '#7e22ce' }}>💺</div>
          </div>
          <div style={styles.kpiValue}>{stats.total_bus_capacity || 72} Seats</div>
          <div style={styles.kpiSub}>Occupancy: {stats.occupancy_rate || 55}%</div>
        </div>
      </div>

      {/* Fleet Vehicles Table */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div>
            <h2 style={styles.cardTitle}>Bus Fleet & Driver Roster</h2>
            <p style={styles.cardSubtitle}>Vehicle registration, seating capacity and licensed driver details</p>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Vehicle Number</th>
                <th>Model / Make</th>
                <th>Capacity</th>
                <th>Assigned Driver</th>
                <th>Driver Phone</th>
                <th>License #</th>
                <th>Operational Status</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((v) => (
                <tr key={v.id}>
                  <td><code style={styles.code}>{v.vehicle_no}</code></td>
                  <td><strong>{v.vehicle_model}</strong></td>
                  <td>{v.capacity} Passengers</td>
                  <td>{v.driver_name}</td>
                  <td>{v.driver_phone}</td>
                  <td><small>{v.driver_license || 'DL Verified'}</small></td>
                  <td>
                    <span style={{ color: '#16a34a', fontWeight: '700', fontSize: '12px' }}>● {v.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Routes & Stops Table */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div>
            <h2 style={styles.cardTitle}>Transit Routes & Fares</h2>
            <p style={styles.cardSubtitle}>Starting points, terminal stops, assigned buses and monthly fares</p>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Route Name</th>
                <th>Start Location</th>
                <th>Terminus Point</th>
                <th>Assigned Bus</th>
                <th>Monthly Fare</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {routes.map((r) => (
                <tr key={r.id}>
                  <td><strong>{r.route_name}</strong></td>
                  <td>{r.start_point}</td>
                  <td>{r.end_point}</td>
                  <td>{r.vehicle?.vehicle_no || 'Unassigned'}</td>
                  <td><strong>₹{parseFloat(r.monthly_fare).toLocaleString()}</strong> / month</td>
                  <td>
                    <span style={{ color: '#16a34a', fontWeight: '700', fontSize: '12px' }}>● {r.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Vehicle Modal */}
      {showVehicleModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Register Fleet Vehicle</h3>
              <button onClick={() => setShowVehicleModal(false)} style={styles.closeBtn}>×</button>
            </div>
            <form onSubmit={handleCreateVehicle} style={styles.modalForm}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Vehicle Registration No *</label>
                  <input
                    type="text"
                    required
                    value={newVehicle.vehicle_no}
                    onChange={(e) => setNewVehicle({ ...newVehicle, vehicle_no: e.target.value })}
                    placeholder="DL-01-XX-1234"
                    className="form-control"
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Model / Bus Make *</label>
                  <input
                    type="text"
                    required
                    value={newVehicle.vehicle_model}
                    onChange={(e) => setNewVehicle({ ...newVehicle, vehicle_model: e.target.value })}
                    placeholder="Tata Starbus 40-Seater"
                    className="form-control"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Seating Capacity *</label>
                  <input
                    type="number"
                    min="10"
                    required
                    value={newVehicle.capacity}
                    onChange={(e) => setNewVehicle({ ...newVehicle, capacity: parseInt(e.target.value) || 40 })}
                    className="form-control"
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Driver Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newVehicle.driver_name}
                    onChange={(e) => setNewVehicle({ ...newVehicle, driver_name: e.target.value })}
                    placeholder="Driver's legal name"
                    className="form-control"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Driver Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={newVehicle.driver_phone}
                    onChange={(e) => setNewVehicle({ ...newVehicle, driver_phone: e.target.value })}
                    placeholder="+91 98111 00000"
                    className="form-control"
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Commercial License Number</label>
                  <input
                    type="text"
                    value={newVehicle.driver_license}
                    onChange={(e) => setNewVehicle({ ...newVehicle, driver_license: e.target.value })}
                    placeholder="DL-042019..."
                    className="form-control"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setShowVehicleModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? 'Registering...' : 'Register Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Route Modal */}
      {showRouteModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Add New Transport Route</h3>
              <button onClick={() => setShowRouteModal(false)} style={styles.closeBtn}>×</button>
            </div>
            <form onSubmit={handleCreateRoute} style={styles.modalForm}>
              <div className="form-group">
                <label className="form-label">Route Title / Identifier *</label>
                <input
                  type="text"
                  required
                  value={newRoute.route_name}
                  onChange={(e) => setNewRoute({ ...newRoute, route_name: e.target.value })}
                  placeholder="e.g. Route 3 - Dwarka & Janakpuri"
                  className="form-control"
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Origin Point *</label>
                  <input
                    type="text"
                    required
                    value={newRoute.start_point}
                    onChange={(e) => setNewRoute({ ...newRoute, start_point: e.target.value })}
                    placeholder="Dwarka Sector 10"
                    className="form-control"
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Destination (Campus) *</label>
                  <input
                    type="text"
                    required
                    value={newRoute.end_point}
                    onChange={(e) => setNewRoute({ ...newRoute, end_point: e.target.value })}
                    placeholder="School Campus Main Gate"
                    className="form-control"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Assign Vehicle</label>
                  <select
                    value={newRoute.vehicle_id}
                    onChange={(e) => setNewRoute({ ...newRoute, vehicle_id: e.target.value })}
                    className="form-control"
                  >
                    <option value="">Select Fleet Bus</option>
                    {vehicles.map(v => <option key={v.id} value={v.id}>{v.vehicle_no} ({v.vehicle_model})</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Monthly Bus Fare (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newRoute.monthly_fare}
                    onChange={(e) => setNewRoute({ ...newRoute, monthly_fare: parseFloat(e.target.value) || 0 })}
                    className="form-control"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setShowRouteModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? 'Creating...' : 'Create Route'}
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
    color: '#ea580c',
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
    fontSize: '13px',
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
  code: {
    padding: '3px 8px',
    backgroundColor: '#f1f5f9',
    borderRadius: '4px',
    fontSize: '12px',
    color: '#0284c7',
    fontFamily: 'monospace'
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
