import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FiSearch, FiPlus, FiEdit, FiTrash2, FiDownload, FiUser, FiMapPin, FiCalendar, FiClock, FiFileText } from 'react-icons/fi';
import './admin.css';

export default function Leads() {
  const { apiRequest, user, hasPermission } = useAuth();
  
  // Lists and stats states
  const [leads, setLeads] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Filters state
  const [search, setSearch] = useState('');
  const [source, setSource] = useState('');
  const [status, setStatus] = useState('');
  const [service, setService] = useState('');
  const [staffId, setStaffId] = useState('');
  
  // Modals state
  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [detailLead, setDetailLead] = useState(null);
  const [activeTab, setActiveTab] = useState('profile'); // profile, timeline, followups

  // Form states
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    contactNumber: '',
    alternateNumber: '',
    interestedService: 'Residential Property',
    occupation: 'Business Owner',
    budget: 'Under ₹25 Lakhs',
    inquiryType: 'Real Buyer',
    interestedArea: '',
    allocatedStaffId: '',
    interestedForSiteVisit: 'No',
    reference: '',
    notes: '',
    followUpDate: '',
    status: 'NEW_LEAD',
  });

  const [followUpForm, setFollowUpForm] = useState({
    date: '',
    notes: '',
  });

  const isReceptionist = user?.role === 'Receptionist';

  // Load staff list
  useEffect(() => {
    const fetchStaff = async () => {
      if (!hasPermission('view_leads')) return;
      try {
        const res = await apiRequest('/api/staff');
        if (res.ok) {
          const data = await res.json();
          setStaffList(data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchStaff();
  }, [apiRequest, hasPermission]);

  // Load leads
  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...(search && { search }),
        ...(source && { source }),
        ...(status && { status }),
        ...(service && { service }),
        ...(staffId && { staffId }),
      });
      const res = await apiRequest(`/api/leads?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLeads(data.leads);
        setTotal(data.pagination.total);
        setPages(data.pagination.pages);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [apiRequest, currentPage, search, source, status, service, staffId]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Export handlers
  const handleExport = async (format) => {
    if (!hasPermission('export_leads')) return;
    try {
      const params = new URLSearchParams({
        format,
        ...(source && { source }),
        ...(status && { status }),
        ...(service && { service }),
        ...(staffId && { staffId }),
      });
      window.open(`/api/leads/export?${params.toString()}`, '_blank');
    } catch (err) {
      console.error('Export error:', err);
    }
  };

  // Open single lead details
  const handleViewDetails = async (lead) => {
    setSelectedLead(lead);
    setDetailOpen(true);
    setActiveTab('profile');
    try {
      const res = await apiRequest(`/api/leads/${lead.id}`);
      if (res.ok) {
        const data = await res.json();
        setDetailLead(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Edit click
  const handleEditClick = (lead, e) => {
    e.stopPropagation();
    setIsEditing(true);
    setSelectedLead(lead);
    setFormData({
      firstName: lead.firstName,
      lastName: lead.lastName,
      contactNumber: lead.contactNumber,
      alternateNumber: lead.alternateNumber || '',
      interestedService: lead.interestedService,
      occupation: lead.occupation,
      budget: lead.budget,
      inquiryType: lead.inquiryType,
      interestedArea: lead.interestedArea || '',
      allocatedStaffId: lead.allocatedStaffId || '',
      interestedForSiteVisit: lead.interestedForSiteVisit ? 'Yes' : 'No',
      reference: lead.reference || '',
      notes: lead.notes || '',
      followUpDate: lead.followUpDate ? lead.followUpDate.split('T')[0] : '',
      status: lead.status,
    });
    setFormOpen(true);
  };

  // Handle Delete click
  const handleDeleteClick = async (leadId, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to permanently delete this lead?')) return;

    try {
      const res = await apiRequest(`/api/leads/${leadId}`, { method: 'DELETE' });
      if (res.ok) {
        fetchLeads();
      } else {
        const errData = await res.json();
        alert(errData.message || 'Failed to delete');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Submit Lead Form
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    const body = {
      ...formData,
      interestedForSiteVisit: formData.interestedForSiteVisit === 'Yes',
      allocatedStaffId: formData.allocatedStaffId ? parseInt(formData.allocatedStaffId) : null,
      source: isEditing ? selectedLead.source : 'RECEPTION'
    };

    try {
      const url = isEditing ? `/api/leads/${selectedLead.id}` : '/api/leads';
      const method = isEditing ? 'PUT' : 'POST';
      const res = await apiRequest(url, {
        method,
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setFormOpen(false);
        setIsEditing(false);
        fetchLeads();
      } else {
        const data = await res.json();
        alert(data.message || 'Error saving lead');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Submit Follow-Up
  const handleFollowUpSubmit = async (e) => {
    e.preventDefault();
    if (!followUpForm.date) return;

    try {
      const res = await apiRequest(`/api/leads/${detailLead.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          followUpDate: followUpForm.date,
          notes: `Added follow-up action note: ${followUpForm.notes}`,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        // Refresh details
        const detailsRes = await apiRequest(`/api/leads/${detailLead.id}`);
        if (detailsRes.ok) {
          const detailData = await detailsRes.json();
          setDetailLead(detailData);
        }
        setFollowUpForm({ date: '', notes: '' });
        alert('Follow-up scheduled successfully');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusLabel = (s) => s.replace(/_/g, ' ');

  return (
    <div className={isReceptionist ? 'reception-lock' : ''} style={isReceptionist ? { userSelect: 'none' } : {}}>
      
      {/* Page Header */}
      <div className="admin-title-block">
        <div>
          <h2 className="admin-title-block__title">Lead & CRM Workflow Manager</h2>
          <p className="admin-title-block__subtitle">
            {isReceptionist ? 'View and assign incoming reception and site client leads.' : 'Manage website and reception leads, assign staff, and track workflow.'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {!isReceptionist && hasPermission('export_leads') && (
            <>
              <button className="admin-btn admin-btn--secondary" onClick={() => handleExport('xlsx')}>
                <FiDownload /> Export XLSX
              </button>
              <button className="admin-btn admin-btn--secondary" onClick={() => handleExport('csv')}>
                <FiDownload /> Export CSV
              </button>
            </>
          )}
          {hasPermission('create_leads') && (
            <button className="admin-btn admin-btn--primary" onClick={() => { setIsEditing(false); setFormOpen(true); }}>
              <FiPlus /> Add New Lead
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="filters-bar">
        <div className="filters-bar__search">
          <FiSearch className="filters-bar__search-icon" />
          <input
            className="admin-form-control"
            placeholder="Search by name, phone, area, service..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          />
        </div>

        <div className="filters-bar__selects">
          <select className="admin-form-control" value={source} onChange={(e) => { setSource(e.target.value); setCurrentPage(1); }}>
            <option value="">All Sources</option>
            <option value="WEBSITE">Website Leads</option>
            <option value="RECEPTION">Reception Leads</option>
          </select>

          <select className="admin-form-control" value={status} onChange={(e) => { setStatus(e.target.value); setCurrentPage(1); }}>
            <option value="">All Statuses</option>
            <option value="NEW_LEAD">New Lead</option>
            <option value="CONTACTED">Contacted</option>
            <option value="INTERESTED">Interested</option>
            <option value="SITE_VISIT_SCHEDULED">Site Visit Scheduled</option>
            <option value="NEGOTIATION">Negotiation</option>
            <option value="CLOSED_WON">Closed Won</option>
            <option value="CLOSED_LOST">Closed Lost</option>
          </select>

          <select className="admin-form-control" value={service} onChange={(e) => { setService(e.target.value); setCurrentPage(1); }}>
            <option value="">All Services</option>
            <option value="Residential Property">Residential Property</option>
            <option value="Commercial Property">Commercial Property</option>
            <option value="Industrial Property">Industrial Property</option>
            <option value="Land Property">Land Property</option>
            <option value="Real Estate Loans">Real Estate Loans</option>
            <option value="Interior Solution">Interior Solution</option>
          </select>

          {!isReceptionist && (
            <select className="admin-form-control" value={staffId} onChange={(e) => { setStaffId(e.target.value); setCurrentPage(1); }}>
              <option value="">All Staff</option>
              {staffList.map(s => <option key={s.id} value={s.id}>{s.fullName}</option>)}
            </select>
          )}
        </div>
      </div>

      {/* Main Leads Card */}
      <div className="admin-card">
        <div className="admin-card__body" style={{ padding: 0 }}>
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Lead ID</th>
                  <th>Client Name</th>
                  <th>Contact</th>
                  <th>Service</th>
                  <th>Staff Allocated</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '40px' }}>
                      <div className="contact-loader" style={{ margin: '0 auto', width: '32px', height: '32px' }}></div>
                    </td>
                  </tr>
                ) : leads.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '32px', color: 'var(--admin-text-muted)' }}>
                      No leads matching filters found.
                    </td>
                  </tr>
                ) : (
                  leads.map((l) => (
                    <tr key={l.id} style={{ cursor: 'pointer' }} onClick={() => handleViewDetails(l)}>
                      <td style={{ fontWeight: '700' }}>L-{l.id}</td>
                      <td style={{ fontWeight: '600' }}>{l.firstName} {l.lastName}</td>
                      <td>{l.contactNumber}</td>
                      <td>{l.interestedService}</td>
                      <td>{l.allocatedStaff ? l.allocatedStaff.fullName : <span style={{ color: 'var(--admin-text-muted)' }}>Unallocated</span>}</td>
                      <td>
                        <span className={`status-tag status-tag--${l.status.toLowerCase().replace(/_/g, '')}`}>
                          {getStatusLabel(l.status)}
                        </span>
                      </td>
                      <td>{new Date(l.createdAt).toLocaleDateString()}</td>
                      <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          {hasPermission('edit_leads') && (
                            <button className="admin-btn admin-btn--secondary" style={{ padding: '6px 12px' }} onClick={(e) => handleEditClick(l, e)}>
                              <FiEdit size={14} />
                            </button>
                          )}
                          {!isReceptionist && hasPermission('delete_leads') && (
                            <button className="admin-btn admin-btn--danger" style={{ padding: '6px 12px' }} onClick={(e) => handleDeleteClick(l.id, e)}>
                              <FiTrash2 size={14} />
                            </button>
                          )}
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

      {/* Pagination Controls */}
      {pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '10px' }}>
          <button
            className="admin-btn admin-btn--secondary"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          >
            Previous
          </button>
          <span style={{ display: 'flex', alignItems: 'center', padding: '0 12px', fontSize: '0.9rem' }}>
            Page {currentPage} of {pages} ({total} total)
          </span>
          <button
            className="admin-btn admin-btn--secondary"
            disabled={currentPage === pages}
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, pages))}
          >
            Next
          </button>
        </div>
      )}

      {/* --- ADD / EDIT LEAD MODAL --- */}
      {formOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal" style={{ maxWidth: '650px' }}>
            <div className="admin-modal__header">
              <h3 style={{ fontSize: '1.15rem', fontWeight: '700' }}>
                {isEditing ? `Edit Lead L-${selectedLead.id}` : 'Register New Receptionist Lead'}
              </h3>
              <button className="admin-header__btn" style={{ border: 'none', background: 'none', fontSize: '1.25rem' }} onClick={() => setFormOpen(false)}>×</button>
            </div>
            
            <form onSubmit={handleFormSubmit}>
              <div className="admin-modal__body">
                <div className="admin-form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  
                  <div className="admin-form-group">
                    <label>First Name *</label>
                    <input
                      className="admin-form-control"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Last Name *</label>
                    <input
                      className="admin-form-control"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Contact Number *</label>
                    <input
                      className="admin-form-control"
                      value={formData.contactNumber}
                      onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                      required
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Alternative Contact Number</label>
                    <input
                      className="admin-form-control"
                      value={formData.alternateNumber}
                      onChange={(e) => setFormData({ ...formData, alternateNumber: e.target.value })}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Interested Service *</label>
                    <select
                      className="admin-form-control"
                      value={formData.interestedService}
                      onChange={(e) => setFormData({ ...formData, interestedService: e.target.value })}
                      required
                    >
                      <option value="Residential Property">Residential Property</option>
                      <option value="Commercial Property">Commercial Property</option>
                      <option value="Industrial Property">Industrial Property</option>
                      <option value="Land Property">Land Property</option>
                      <option value="Real Estate Loans">Real Estate Loans</option>
                      <option value="Interior Solution">Interior Solution</option>
                    </select>
                  </div>

                  <div className="admin-form-group">
                    <label>Occupation *</label>
                    <input
                      className="admin-form-control"
                      value={formData.occupation}
                      onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                      required
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Budget *</label>
                    <input
                      className="admin-form-control"
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                      required
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Inquiry Type *</label>
                    <select
                      className="admin-form-control"
                      value={formData.inquiryType}
                      onChange={(e) => setFormData({ ...formData, inquiryType: e.target.value })}
                      required
                    >
                      <option value="Investor">Investor</option>
                      <option value="Real Buyer">Real Buyer</option>
                    </select>
                  </div>

                  <div className="admin-form-group">
                    <label>Interested Area *</label>
                    <input
                      className="admin-form-control"
                      value={formData.interestedArea}
                      onChange={(e) => setFormData({ ...formData, interestedArea: e.target.value })}
                      required
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Interested For Site Visit? *</label>
                    <div style={{ display: 'flex', gap: '20px', marginTop: '12px' }}>
                      <label style={{ display: 'flex', gap: '6px', cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name="siteVisit"
                          value="Yes"
                          checked={formData.interestedForSiteVisit === 'Yes'}
                          onChange={() => setFormData({ ...formData, interestedForSiteVisit: 'Yes' })}
                        /> Yes
                      </label>
                      <label style={{ display: 'flex', gap: '6px', cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name="siteVisit"
                          value="No"
                          checked={formData.interestedForSiteVisit === 'No'}
                          onChange={() => setFormData({ ...formData, interestedForSiteVisit: 'No' })}
                        /> No
                      </label>
                    </div>
                  </div>

                  {!isReceptionist && (
                    <div className="admin-form-group">
                      <label>Allocated Staff</label>
                      <select
                        className="admin-form-control"
                        value={formData.allocatedStaffId}
                        onChange={(e) => setFormData({ ...formData, allocatedStaffId: e.target.value })}
                      >
                        <option value="">Unallocated</option>
                        {staffList.map(s => <option key={s.id} value={s.id}>{s.fullName}</option>)}
                      </select>
                    </div>
                  )}

                  <div className="admin-form-group">
                    <label>Reference</label>
                    <input
                      className="admin-form-control"
                      placeholder="e.g. Newspaper, Google"
                      value={formData.reference}
                      onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Lead Status *</label>
                    <select
                      className="admin-form-control"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      required
                    >
                      <option value="NEW_LEAD">New Lead</option>
                      <option value="CONTACTED">Contacted</option>
                      <option value="INTERESTED">Interested</option>
                      <option value="SITE_VISIT_SCHEDULED">Site Visit Scheduled</option>
                      <option value="NEGOTIATION">Negotiation</option>
                      <option value="CLOSED_WON">Closed Won</option>
                      <option value="CLOSED_LOST">Closed Lost</option>
                    </select>
                  </div>

                  <div className="admin-form-group">
                    <label>Follow-Up Date</label>
                    <input
                      type="date"
                      className="admin-form-control"
                      value={formData.followUpDate}
                      onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                    />
                  </div>

                  <div className="admin-form-group" style={{ gridColumn: '1 / -1' }}>
                    <label>Notes / Requirements</label>
                    <textarea
                      className="admin-form-control"
                      rows="3"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    />
                  </div>

                </div>
              </div>
              
              <div className="admin-modal__footer">
                <button type="button" className="admin-btn admin-btn--secondary" onClick={() => setFormOpen(false)}>Cancel</button>
                <button type="submit" className="admin-btn admin-btn--primary">Save Lead</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- LEAD DETAIL / WORKFLOW TIMELINE MODAL --- */}
      {detailOpen && selectedLead && (
        <div className="admin-modal-overlay">
          <div className="admin-modal" style={{ maxWidth: '750px' }}>
            <div className="admin-modal__header">
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>
                  {selectedLead.firstName} {selectedLead.lastName}
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)' }}>Lead Record: L-{selectedLead.id}</span>
              </div>
              <button className="admin-header__btn" style={{ border: 'none', background: 'none', fontSize: '1.25rem' }} onClick={() => { setDetailOpen(false); setDetailLead(null); }}>×</button>
            </div>

            {/* Detail Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--admin-border)', padding: '0 24px' }}>
              <button
                className={`admin-sidebar__link`}
                style={{ padding: '12px 16px', borderRadius: 0, borderBottom: activeTab === 'profile' ? '2px solid var(--admin-primary)' : 'none', color: activeTab === 'profile' ? 'var(--admin-primary)' : 'var(--admin-text-secondary)', background: 'none', fontWeight: '600', cursor: 'pointer' }}
                onClick={() => setActiveTab('profile')}
              >
                <FiUser style={{ marginRight: '6px' }} /> Client Profile
              </button>
              <button
                className={`admin-sidebar__link`}
                style={{ padding: '12px 16px', borderRadius: 0, borderBottom: activeTab === 'timeline' ? '2px solid var(--admin-primary)' : 'none', color: activeTab === 'timeline' ? 'var(--admin-primary)' : 'var(--admin-text-secondary)', background: 'none', fontWeight: '600', cursor: 'pointer' }}
                onClick={() => setActiveTab('timeline')}
              >
                <FiClock style={{ marginRight: '6px' }} /> Workflow Timeline
              </button>
              <button
                className={`admin-sidebar__link`}
                style={{ padding: '12px 16px', borderRadius: 0, borderBottom: activeTab === 'followups' ? '2px solid var(--admin-primary)' : 'none', color: activeTab === 'followups' ? 'var(--admin-primary)' : 'var(--admin-text-secondary)', background: 'none', fontWeight: '600', cursor: 'pointer' }}
                onClick={() => setActiveTab('followups')}
              >
                <FiCalendar style={{ marginRight: '6px' }} /> Follow-Ups ({detailLead?.followUps?.length || 0})
              </button>
            </div>

            <div className="admin-modal__body">
              {activeTab === 'profile' ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: '600', marginBottom: '12px', color: 'var(--admin-primary)' }}>Contact Information</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
                      <div><strong>Primary Mobile:</strong> {selectedLead.contactNumber}</div>
                      <div><strong>Alternate Mobile:</strong> {selectedLead.alternateNumber || '-'}</div>
                      <div><strong>Occupation:</strong> {selectedLead.occupation}</div>
                      <div><strong>Reference:</strong> {selectedLead.reference || '-'}</div>
                      <div><strong>Created Date:</strong> {new Date(selectedLead.createdAt).toLocaleString()}</div>
                    </div>
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: '600', marginBottom: '12px', color: 'var(--admin-primary)' }}>Requirements</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
                      <div><strong>Interested Service:</strong> {selectedLead.interestedService}</div>
                      <div><strong>Budget Range:</strong> {selectedLead.budget}</div>
                      <div><strong>Inquiry Type:</strong> {selectedLead.inquiryType}</div>
                      <div><strong>Interested Area:</strong> {selectedLead.interestedArea || '-'}</div>
                      <div><strong>Site Visit Scheduled:</strong> {selectedLead.interestedForSiteVisit ? 'Yes' : 'No'}</div>
                    </div>
                  </div>
                  <div style={{ gridColumn: '1 / -1', borderTop: '1px solid var(--admin-border)', paddingTop: '16px' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: '600', marginBottom: '8px', color: 'var(--admin-primary)' }}>Notes & Requirements</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--admin-text-secondary)', lineHeight: '1.5' }}>
                      {selectedLead.notes || 'No notes added for this lead.'}
                    </p>
                  </div>
                </div>
              ) : activeTab === 'timeline' ? (
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: '600', marginBottom: '16px' }}>Lead Lifecycle Log</h4>
                  <div className="timeline">
                    {!detailLead ? (
                      <div className="contact-loader" style={{ width: '20px', height: '20px' }}></div>
                    ) : detailLead.history.length === 0 ? (
                      <div style={{ fontSize: '0.85rem', color: 'var(--admin-text-muted)' }}>No logs tracked.</div>
                    ) : (
                      detailLead.history.map((hist) => (
                        <div key={hist.id} className="timeline-item">
                          <div className="timeline-dot"></div>
                          <div className="timeline-header">
                            <span className="timeline-user">{hist.user ? hist.user.fullName : 'System / Website'}</span>
                            <span>{new Date(hist.createdAt).toLocaleString()}</span>
                          </div>
                          <span className="timeline-action">{hist.action}</span>
                          {hist.details && <p className="timeline-details">{hist.details}</p>}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: '600', marginBottom: '16px' }}>Scheduled Reminders</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '20px' }}>
                    
                    {/* List follow ups */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {!detailLead ? (
                        <div className="contact-loader"></div>
                      ) : detailLead.followUps.length === 0 ? (
                        <div style={{ fontSize: '0.85rem', color: 'var(--admin-text-muted)' }}>No follow-ups scheduled for this client.</div>
                      ) : (
                        detailLead.followUps.map((fu) => (
                          <div key={fu.id} style={{ display: 'flex', gap: '10px', backgroundColor: 'var(--admin-bg-tertiary)', padding: '12px', borderRadius: '8px', border: '1px solid var(--admin-border)' }}>
                            <span style={{ fontSize: '1.2rem', marginTop: '2px' }}>📅</span>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '0.8rem' }}>
                              <strong style={{ fontSize: '0.85rem' }}>{new Date(fu.date).toLocaleDateString()}</strong>
                              <span style={{ color: 'var(--admin-text-secondary)' }}>{fu.notes}</span>
                              <span style={{ fontSize: '0.7rem', color: 'var(--admin-text-muted)', marginTop: '4px' }}>
                                Scheduled {new Date(fu.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Schedule new follow up */}
                    <form onSubmit={handleFollowUpSubmit} style={{ borderLeft: '1px solid var(--admin-border)', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: '600' }}>New Follow-Up</h4>
                      <div className="admin-form-group">
                        <label>Date *</label>
                        <input
                          type="date"
                          className="admin-form-control"
                          value={followUpForm.date}
                          onChange={(e) => setFollowUpForm({ ...followUpForm, date: e.target.value })}
                          required
                        />
                      </div>
                      <div className="admin-form-group">
                        <label>Reminder Note</label>
                        <textarea
                          className="admin-form-control"
                          rows="3"
                          placeholder="e.g. Call to discuss budget details"
                          value={followUpForm.notes}
                          onChange={(e) => setFollowUpForm({ ...followUpForm, notes: e.target.value })}
                        />
                      </div>
                      <button type="submit" className="admin-btn admin-btn--primary">Schedule</button>
                    </form>

                  </div>
                </div>
              )}
            </div>
            
            <div className="admin-modal__footer">
              <button className="admin-btn admin-btn--secondary" onClick={() => { setDetailOpen(false); setDetailLead(null); }}>Close</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
