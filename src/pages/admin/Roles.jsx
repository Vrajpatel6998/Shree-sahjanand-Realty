import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FiPlus, FiEdit, FiTrash2, FiShield, FiCheckSquare, FiSquare } from 'react-icons/fi';
import './admin.css';

export default function Roles() {
  const { apiRequest, hasPermission } = useAuth();
  
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState(null);

  // Modals state
  const [formOpen, setFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Form states
  const [roleName, setRoleName] = useState('');
  const [roleDesc, setRoleDesc] = useState('');
  const [checkedPerms, setCheckedPerms] = useState({});

  const loadData = async () => {
    setLoading(true);
    try {
      const rolesRes = await apiRequest('/api/roles');
      const permsRes = await apiRequest('/api/roles/permissions');

      if (rolesRes.ok) {
        const rolesData = await rolesRes.json();
        setRoles(rolesData);
        // Default select first role
        if (rolesData.length > 0 && !selectedRole) {
          handleSelectRole(rolesData[0]);
        } else if (selectedRole) {
          const current = rolesData.find((r) => r.id === selectedRole.id);
          if (current) handleSelectRole(current);
        }
      }

      if (permsRes.ok) {
        const permsData = await permsRes.json();
        setPermissions(permsData);
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

  const handleSelectRole = (role) => {
    setSelectedRole(role);
    // Build checked state for permissions
    const checked = {};
    role.permissions.forEach((p) => {
      checked[p.permissionId] = true;
    });
    setCheckedPerms(checked);
  };

  // Checkbox toggle
  const handleTogglePerm = (permId) => {
    if (selectedRole?.name === 'Admin') return; // Cannot edit Admin permissions (always has all)
    setCheckedPerms((prev) => ({
      ...prev,
      [permId]: !prev[permId],
    }));
  };

  // Save current role permissions
  const handleSavePermissions = async () => {
    if (selectedRole?.name === 'Admin') return;
    const permIds = Object.keys(checkedPerms).filter((k) => checkedPerms[k]);

    try {
      const res = await apiRequest(`/api/roles/${selectedRole.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: selectedRole.name,
          description: selectedRole.description,
          permissionIds: permIds,
        }),
      });

      if (res.ok) {
        alert('Permission mappings saved successfully!');
        loadData();
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to save permissions');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Submit role info creation/update
  const handleRoleSubmit = async (e) => {
    e.preventDefault();
    if (!roleName) return;

    try {
      const url = isEditing ? `/api/roles/${selectedRole.id}` : '/api/roles';
      const method = isEditing ? 'PUT' : 'POST';
      
      // If editing, preserve checked permissions, else seed empty array
      const permIds = isEditing 
        ? Object.keys(checkedPerms).filter((k) => checkedPerms[k])
        : [];

      const res = await apiRequest(url, {
        method,
        body: JSON.stringify({
          name: roleName,
          description: roleDesc,
          permissionIds: permIds,
        }),
      });

      if (res.ok) {
        setFormOpen(false);
        setRoleName('');
        setRoleDesc('');
        loadData();
      } else {
        const data = await res.json();
        alert(data.message || 'Error processing role metadata');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditClick = (role, e) => {
    e.stopPropagation();
    setIsEditing(true);
    setRoleName(role.name);
    setRoleDesc(role.description || '');
    setFormOpen(true);
  };

  const handleDeleteClick = async (role, e) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to permanently delete user authorization role "${role.name}"?`)) return;

    try {
      const res = await apiRequest(`/api/roles/${role.id}`, { method: 'DELETE' });
      if (res.ok) {
        setSelectedRole(null);
        loadData();
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to delete role');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!hasPermission('manage_roles')) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: 'var(--admin-danger)' }}>
        🚫 Forbidden: You do not have permission to view roles directory.
      </div>
    );
  }

  return (
    <div>
      <div className="admin-title-block">
        <div>
          <h2 className="admin-title-block__title">Dynamic Roles & Permissions</h2>
          <p className="admin-title-block__subtitle">Define custom roles and adjust checkbox authorization matrix rules without coding.</p>
        </div>
        <button className="admin-btn admin-btn--primary" onClick={() => { setIsEditing(false); setRoleName(''); setRoleDesc(''); setFormOpen(true); }}>
          <FiPlus /> Add Custom Role
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '24px' }}>
        
        {/* Left Side: Roles List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--admin-text-muted)' }}>Security Roles</h3>
          
          {loading && roles.length === 0 ? (
            <div className="contact-loader" style={{ width: '24px', height: '24px' }}></div>
          ) : (
            roles.map((r) => (
              <div
                key={r.id}
                onClick={() => handleSelectRole(r)}
                className="admin-card"
                style={{
                  padding: '16px 20px',
                  cursor: 'pointer',
                  borderWidth: '1px',
                  borderColor: selectedRole?.id === r.id ? 'var(--admin-primary)' : 'var(--admin-border)',
                  backgroundColor: selectedRole?.id === r.id ? 'rgba(26,60,142,0.03)' : 'var(--admin-bg-secondary)',
                  margin: 0,
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <FiShield style={{ color: selectedRole?.id === r.id ? 'var(--admin-primary)' : 'var(--admin-text-muted)' }} />
                    <strong style={{ fontSize: '0.9rem' }}>{r.name}</strong>
                  </div>
                  {r.name !== 'Admin' && r.name !== 'Receptionist' && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--admin-text-muted)', display: 'inline-flex', padding: '4px' }} onClick={(e) => handleEditClick(r, e)} aria-label="Edit role"><FiEdit size={14} /></button>
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--admin-danger)', display: 'inline-flex', padding: '4px' }} onClick={(e) => handleDeleteClick(r, e)} aria-label="Delete role"><FiTrash2 size={14} /></button>
                    </div>
                  )}
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', marginTop: '6px', lineHeight: '1.4' }}>
                  {r.description || 'No description provided.'}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Right Side: Permissions Mapping Grid */}
        {selectedRole && (
          <div className="admin-card" style={{ margin: 0 }}>
            <div className="admin-card__header">
              <div>
                <span className="admin-card__title">Permission Mapping: {selectedRole.name}</span>
                <p style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)', marginTop: '4px' }}>
                  {selectedRole.name === 'Admin' 
                    ? 'The Administrator role always inherits all access rights and cannot be edited.' 
                    : 'Select checkbox options below to adjust access rights for this role.'}
                </p>
              </div>
              {selectedRole.name !== 'Admin' && (
                <button className="admin-btn admin-btn--primary" onClick={handleSavePermissions}>
                  Save Authorization Grid
                </button>
              )}
            </div>

            <div className="admin-card__body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                {permissions.map((perm) => {
                  const isChecked = selectedRole.name === 'Admin' || !!checkedPerms[perm.id];
                  return (
                    <div
                      key={perm.id}
                      onClick={() => handleTogglePerm(perm.id)}
                      style={{
                        padding: '14px 16px',
                        border: '1px solid var(--admin-border)',
                        borderRadius: '8px',
                        display: 'flex',
                        gap: '12px',
                        cursor: selectedRole.name === 'Admin' ? 'not-allowed' : 'pointer',
                        backgroundColor: isChecked ? 'rgba(16, 185, 129, 0.02)' : 'var(--admin-bg-secondary)',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div style={{ fontSize: '1.2rem', color: isChecked ? 'var(--admin-success)' : 'var(--admin-text-muted)', marginTop: '2px' }}>
                        {isChecked ? <FiCheckSquare /> : <FiSquare />}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '0.85rem' }}>
                        <strong style={{ color: isChecked ? 'var(--admin-text-primary)' : 'var(--admin-text-secondary)' }}>{perm.name}</strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', lineHeight: '1.3' }}>{perm.description}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* --- ADD / EDIT ROLE METADATA MODAL --- */}
      {formOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal" style={{ maxWidth: '400px' }}>
            <div className="admin-modal__header">
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>
                {isEditing ? `Edit Role Info: ${selectedRole.name}` : 'Create New Security Role'}
              </h3>
              <button className="admin-header__btn" style={{ border: 'none', background: 'none', fontSize: '1.25rem' }} onClick={() => setFormOpen(false)}>×</button>
            </div>

            <form onSubmit={handleRoleSubmit}>
              <div className="admin-modal__body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="admin-form-group">
                  <label>Role Name *</label>
                  <input
                    className="admin-form-control"
                    placeholder="e.g. Sales Director"
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
                    required
                  />
                </div>

                <div className="admin-form-group">
                  <label>Role Description</label>
                  <textarea
                    className="admin-form-control"
                    rows="3"
                    placeholder="Describe access responsibilities..."
                    value={roleDesc}
                    onChange={(e) => setRoleDesc(e.target.value)}
                  />
                </div>
              </div>

              <div className="admin-modal__footer">
                <button type="button" className="admin-btn admin-btn--secondary" onClick={() => setFormOpen(false)}>Cancel</button>
                <button type="submit" className="admin-btn admin-btn--primary">Save Role</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
