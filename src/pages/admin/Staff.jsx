import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FiPlus, FiEdit, FiTrash2, FiKey, FiUserCheck, FiUserX } from 'react-icons/fi';
import './admin.css';

export default function Staff() {
  const { apiRequest, hasPermission } = useAuth();
  
  // Lists and states
  const [staff, setStaff] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [formOpen, setFormOpen] = useState(false);
  const [pwdOpen, setPwdOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    email: '',
    mobileNumber: '',
    roleId: '',
  });

  const [newPwd, setNewPwd] = useState('');

  // Fetch staff and roles lists
  const loadData = async () => {
    setLoading(true);
    try {
      const staffRes = await apiRequest('/api/staff');
      const rolesRes = await apiRequest('/api/roles');
      
      if (staffRes.ok) {
        const staffData = await staffRes.json();
        setStaff(staffData);
      }
      if (rolesRes.ok) {
        const rolesData = await rolesRes.json();
        setRoles(rolesData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [apiRequest]);

  // Open edit modal
  const handleEditClick = (s) => {
    setIsEditing(true);
    setSelectedStaff(s);
    setFormData({
      username: s.username,
      password: '', // Hidden in edits
      fullName: s.fullName,
      email: s.email,
      mobileNumber: s.mobileNumber || '',
      roleId: s.roleId.toString(),
    });
    setFormOpen(true);
  };

  // Open password reset modal
  const handlePwdClick = (s) => {
    setSelectedStaff(s);
    setNewPwd('');
    setPwdOpen(true);
  };

  // Toggle profile status (Active / Inactive)
  const handleToggleStatus = async (s) => {
    const nextState = !s.isActive;
    try {
      const res = await apiRequest(`/api/staff/${s.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          isActive: nextState
        }),
      });

      if (res.ok) {
        loadData();
      } else {
        const data = await res.json();
        alert(data.message || 'Status toggle failed');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete staff profile
  const handleDeleteStaff = async (s) => {
    if (!window.confirm(`Are you sure you want to permanently delete staff user "${s.username}"?`)) return;

    try {
      const res = await apiRequest(`/api/staff/${s.id}`, { method: 'DELETE' });
      if (res.ok) {
        loadData();
      } else {
        const data = await res.json();
        alert(data.message || 'Deletion failed');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Submit profile forms
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const body = {
      fullName: formData.fullName,
      email: formData.email,
      mobileNumber: formData.mobileNumber,
      roleId: parseInt(formData.roleId),
      ...(isEditing ? {} : { username: formData.username, password: formData.password })
    };

    try {
      const url = isEditing ? `/api/staff/${selectedStaff.id}` : '/api/staff';
      const method = isEditing ? 'PUT' : 'POST';
      const res = await apiRequest(url, {
        method,
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setFormOpen(false);
        setIsEditing(false);
        loadData();
      } else {
        const data = await res.json();
        alert(data.message || 'Error processing profile');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Submit Password override
  const handlePwdSubmit = async (e) => {
    e.preventDefault();
    if (!newPwd) return;

    try {
      const res = await apiRequest(`/api/staff/${selectedStaff.id}/reset-password`, {
        method: 'POST',
        body: JSON.stringify({ newPassword: newPwd }),
      });

      if (res.ok) {
        setPwdOpen(false);
        alert(`Password for ${selectedStaff.username} updated successfully.`);
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to update password');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!hasPermission('manage_staff')) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: 'var(--admin-danger)' }}>
        🚫 Forbidden: You do not have permission to view staff directories.
      </div>
    );
  }

  return (
    <div>
      {/* Title */}
      <div className="admin-title-block">
        <div>
          <h2 className="admin-title-block__title">Staff Management</h2>
          <p className="admin-title-block__subtitle">Manage credentials, permissions roles, and access status of corporate profiles.</p>
        </div>
        <button className="admin-btn admin-btn--primary" onClick={() => { setIsEditing(false); setFormData({ username: '', password: '', fullName: '', email: '', mobileNumber: '', roleId: roles[0]?.id?.toString() || '' }); setFormOpen(true); }}>
          <FiPlus /> Register Staff
        </button>
      </div>

      {/* Staff Table */}
      <div className="admin-card">
        <div className="admin-card__body" style={{ padding: 0 }}>
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Full Name</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Mobile Number</th>
                  <th>User Role</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>
                      <div className="contact-loader" style={{ margin: '0 auto', width: '32px', height: '32px' }}></div>
                    </td>
                  </tr>
                ) : staff.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: 'var(--admin-text-muted)' }}>
                      No staff users registered.
                    </td>
                  </tr>
                ) : (
                  staff.map((s) => (
                    <tr key={s.id}>
                      <td style={{ fontWeight: '600' }}>{s.fullName}</td>
                      <td>{s.username}</td>
                      <td>{s.email}</td>
                      <td>{s.mobileNumber || '-'}</td>
                      <td>
                        <span style={{ fontSize: '0.8rem', padding: '4px 10px', borderRadius: '12px', backgroundColor: 'var(--admin-bg-tertiary)', fontWeight: '600', border: '1px solid var(--admin-border)' }}>
                          {s.role ? s.role.name : 'Unknown'}
                        </span>
                      </td>
                      <td>
                        <span className={`status-tag ${s.isActive ? 'status-tag--won' : 'status-tag--lost'}`}>
                          {s.isActive ? 'Active' : 'Deactivated'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button className="admin-btn admin-btn--secondary" style={{ padding: '6px 12px' }} title="Toggle Profile Status" onClick={() => handleToggleStatus(s)}>
                            {s.isActive ? <FiUserX size={14} style={{ color: 'var(--admin-danger)' }} /> : <FiUserCheck size={14} style={{ color: 'var(--admin-success)' }} />}
                          </button>
                          <button className="admin-btn admin-btn--secondary" style={{ padding: '6px 12px' }} title="Reset Password" onClick={() => handlePwdClick(s)}>
                            <FiKey size={14} />
                          </button>
                          <button className="admin-btn admin-btn--secondary" style={{ padding: '6px 12px' }} title="Edit Profile Details" onClick={() => handleEditClick(s)}>
                            <FiEdit size={14} />
                          </button>
                          <button className="admin-btn admin-btn--danger" style={{ padding: '6px 12px' }} title="Delete Account" onClick={() => handleDeleteStaff(s)}>
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* --- STAFF REGISTER / EDIT MODAL --- */}
      {formOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal" style={{ maxWidth: '500px' }}>
            <div className="admin-modal__header">
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>
                {isEditing ? `Edit Staff Profile: ${selectedStaff.username}` : 'Register New Corporate Staff Account'}
              </h3>
              <button className="admin-header__btn" style={{ border: 'none', background: 'none', fontSize: '1.25rem' }} onClick={() => setFormOpen(false)}>×</button>
            </div>
            
            <form onSubmit={handleFormSubmit}>
              <div className="admin-modal__body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                {!isEditing && (
                  <>
                    <div className="admin-form-group">
                      <label>Username *</label>
                      <input
                        className="admin-form-control"
                        placeholder="e.g. jsmith"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        required
                      />
                    </div>

                    <div className="admin-form-group">
                      <label>Password *</label>
                      <input
                        type="password"
                        className="admin-form-control"
                        placeholder="Set account password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                      />
                    </div>
                  </>
                )}

                <div className="admin-form-group">
                  <label>Full Name *</label>
                  <input
                    className="admin-form-control"
                    placeholder="e.g. John Smith"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    required
                  />
                </div>

                <div className="admin-form-group">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    className="admin-form-control"
                    placeholder="e.g. jsmith@domain.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="admin-form-group">
                  <label>Mobile Number</label>
                  <input
                    className="admin-form-control"
                    placeholder="e.g. +91 98765 43210"
                    value={formData.mobileNumber}
                    onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <label>System Authorization Role *</label>
                  <select
                    className="admin-form-control"
                    value={formData.roleId}
                    onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                    required
                  >
                    <option value="">Select Role</option>
                    {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </div>

              </div>

              <div className="admin-modal__footer">
                <button type="button" className="admin-btn admin-btn--secondary" onClick={() => setFormOpen(false)}>Cancel</button>
                <button type="submit" className="admin-btn admin-btn--primary">Register Profile</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- RESET PASSWORD OVERRIDE MODAL --- */}
      {pwdOpen && selectedStaff && (
        <div className="admin-modal-overlay">
          <div className="admin-modal" style={{ maxWidth: '400px' }}>
            <div className="admin-modal__header">
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Override Password: {selectedStaff.username}</h3>
              <button className="admin-header__btn" style={{ border: 'none', background: 'none', fontSize: '1.25rem' }} onClick={() => setPwdOpen(false)}>×</button>
            </div>
            
            <form onSubmit={handlePwdSubmit}>
              <div className="admin-modal__body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--admin-text-secondary)' }}>
                  Override password for user <strong>{selectedStaff.fullName}</strong>. Existing token sessions will be terminated and user must log in with new credentials.
                </p>
                <div className="admin-form-group">
                  <label>New Password *</label>
                  <input
                    type="password"
                    className="admin-form-control"
                    placeholder="Enter new credentials"
                    value={newPwd}
                    onChange={(e) => setNewPwd(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="admin-modal__footer">
                <button type="button" className="admin-btn admin-btn--secondary" onClick={() => setPwdOpen(false)}>Cancel</button>
                <button type="submit" className="admin-btn admin-btn--primary">Save New Password</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
