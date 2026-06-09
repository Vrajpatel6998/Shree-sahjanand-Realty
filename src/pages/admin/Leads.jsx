import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FiSearch, FiPlus, FiEdit, FiTrash2, FiDownload, FiUser, FiMapPin, FiCalendar, FiClock, FiFileText } from 'react-icons/fi';
import './admin.css';

export default function Leads() {
  const { apiRequest, user, hasPermission, token } = useAuth();
  
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
  const [formStep, setFormStep] = useState(1);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState(null);
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
        token,
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
    setFormStep(1);
    setSelectedLead(lead);
    setFormData({
      firstName: lead.firstName || '',
      lastName: lead.lastName || '',
      contactNumber: lead.contactNumber || '',
      alternateNumber: lead.alternateNumber || '',
      interestedService: lead.interestedService || 'Residential Property',
      occupation: lead.occupation || 'Other',
      budget: lead.budget || 'Under ₹25 Lakhs',
      inquiryType: lead.inquiryType || 'Real Buyer',
      interestedArea: lead.interestedArea || '',
      allocatedStaffId: lead.allocatedStaffId || '',
      interestedForSiteVisit: lead.interestedForSiteVisit ? 'Yes' : 'No',
      reference: lead.reference || '',
      notes: lead.notes || '',
      followUpDate: lead.followUpDate ? lead.followUpDate.split('T')[0] : '',
      status: lead.status || 'NEW_LEAD',
    });
    setFormOpen(true);
  };

  const validateStep = (step) => {
    if (step === 1) {
      if (!String(formData.firstName || '').trim()) return "First name is required";
      if (!String(formData.lastName || '').trim()) return "Last name is required";
      if (!String(formData.contactNumber || '').trim()) return "Contact number is required";
      if (!String(formData.occupation || '').trim()) return "Occupation is required";
    }
    if (step === 2) {
      if (!formData.interestedService) return "Interested service is required";
      if (!String(formData.budget || '').trim()) return "Budget is required";
      if (!formData.inquiryType) return "Inquiry type is required";
      if (!String(formData.interestedArea || '').trim()) return "Interested area is required";
    }
    return null;
  };

  const handleNextStep = () => {
    const error = validateStep(formStep);
    if (error) {
      alert(error);
      return;
    }
    setFormStep(prev => prev + 1);
  };

  const handleBackStep = () => {
    setFormStep(prev => Math.max(prev - 1, 1));
  };

  // Handle Delete click
  const handleDeleteClick = (lead, e) => {
    e.stopPropagation();
    setLeadToDelete(lead);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!leadToDelete) return;
    try {
      const res = await apiRequest(`/api/leads/${leadToDelete.id}`, { method: 'DELETE' });
      if (res.ok) {
        setDeleteConfirmOpen(false);
        setLeadToDelete(null);
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
    
    // If hitting Enter on Step 1 or 2, redirect to handleNextStep
    if (formStep < 3) {
      handleNextStep();
      return;
    }
    
    // Final step validations
    const step1Err = validateStep(1);
    if (step1Err) { setFormStep(1); alert(step1Err); return; }
    const step2Err = validateStep(2);
    if (step2Err) { setFormStep(2); alert(step2Err); return; }

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
            <button className="admin-btn admin-btn--primary" onClick={() => { setIsEditing(false); setFormStep(1); setFormData({ firstName: '', lastName: '', contactNumber: '', alternateNumber: '', interestedService: 'Residential Property', occupation: 'Business Owner', budget: 'Under ₹25 Lakhs', inquiryType: 'Real Buyer', interestedArea: '', allocatedStaffId: '', interestedForSiteVisit: 'No', reference: '', notes: '', followUpDate: '', status: 'NEW_LEAD' }); setFormOpen(true); }}>
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
                            <button className="admin-btn admin-btn--danger" style={{ padding: '6px 12px' }} onClick={(e) => handleDeleteClick(l, e)}>
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
            
            <form onSubmit={handleFormSubmit} noValidate>
              <div className="admin-modal__body">
                {/* Stepper Progress Bar */}
                <div className="form-stepper">
                  <div className={`step-item ${formStep >= 1 ? 'active' : ''} ${formStep > 1 ? 'completed' : ''}`}>
                    <span className="step-number">1</span>
                    <span className="step-label">Client Info</span>
                  </div>
                  <div className="step-connector"></div>
                  <div className={`step-item ${formStep >= 2 ? 'active' : ''} ${formStep > 2 ? 'completed' : ''}`}>
                    <span className="step-number">2</span>
                    <span className="step-label">Requirements</span>
                  </div>
                  <div className="step-connector"></div>
                  <div className={`step-item ${formStep >= 3 ? 'active' : ''}`}>
                    <span className="step-number">3</span>
                    <span className="step-label">Workflow</span>
                  </div>
                </div>

                {/* Step 1: Client Info */}
                {formStep === 1 && (
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

                    <div className="admin-form-group" style={{ gridColumn: '1 / -1' }}>
                      <label>Occupation *</label>
                      <input
                        className="admin-form-control"
                        value={formData.occupation}
                        onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Step 2: Requirements */}
                {formStep === 2 && (
                  <div className="admin-form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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
                      <label>Budget Range *</label>
                      <input
                        className="admin-form-control"
                        value={formData.budget}
                        onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                        required
                      />
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

                    <div className="admin-form-group" style={{ gridColumn: '1 / -1' }}>
                      <label>Interested For Site Visit? *</label>
                      <div style={{ display: 'flex', gap: '20px', marginTop: '12px' }}>
                        <label style={{ display: 'flex', gap: '6px', cursor: 'pointer', alignItems: 'center' }}>
                          <input
                            type="radio"
                            name="siteVisit"
                            value="Yes"
                            checked={formData.interestedForSiteVisit === 'Yes'}
                            onChange={() => setFormData({ ...formData, interestedForSiteVisit: 'Yes' })}
                          /> Yes
                        </label>
                        <label style={{ display: 'flex', gap: '6px', cursor: 'pointer', alignItems: 'center' }}>
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
                  </div>
                )}

                {/* Step 3: Workflow Details */}
                {formStep === 3 && (
                  <div className="admin-form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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
                      <label>Reference</label>
                      <input
                        className="admin-form-control"
                        placeholder="e.g. Newspaper, Google"
                        value={formData.reference}
                        onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                      />
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
                )}
              </div>
              
              <div className="admin-modal__footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  {formStep > 1 && (
                    <button type="button" className="admin-btn admin-btn--secondary" onClick={handleBackStep}>
                      Back
                    </button>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="button" className="admin-btn admin-btn--secondary" onClick={() => setFormOpen(false)}>Cancel</button>
                  {formStep < 3 ? (
                    <button key="btn-next-step" type="button" className="admin-btn admin-btn--primary" onClick={handleNextStep}>Next</button>
                  ) : (
                    <button key="btn-save-lead" type="submit" className="admin-btn admin-btn--primary">Save Lead</button>
                  )}
                </div>
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

      {/* --- CUSTOM DELETE CONFIRMATION MODAL --- */}
      {deleteConfirmOpen && leadToDelete && (
        <div className="admin-modal-overlay">
          <div className="admin-modal" style={{ maxWidth: '450px' }}>
            <div className="admin-modal__header">
              <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--admin-danger)' }}>⚠️ Confirm Hard Delete</h3>
              <button className="admin-header__btn" style={{ border: 'none', background: 'none', fontSize: '1.25rem' }} onClick={() => { setDeleteConfirmOpen(false); setLeadToDelete(null); }}>×</button>
            </div>
            <div className="admin-modal__body" style={{ padding: '24px' }}>
              <p style={{ fontSize: '0.95rem', lineHeight: '1.5', color: 'var(--admin-text-primary)' }}>
                Are you sure you want to permanently delete lead <strong>L-{leadToDelete.id} ({leadToDelete.firstName} {leadToDelete.lastName})</strong>?
              </p>
              <div style={{ marginTop: '16px', padding: '12px', borderRadius: '8px', backgroundColor: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--admin-danger)', fontWeight: '600' }}>
                  🚨 WARNING: This is a hard delete. All history logs, follow-ups, and records associated with this lead will be permanently erased. This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="admin-modal__footer" style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button type="button" className="admin-btn admin-btn--secondary" onClick={() => { setDeleteConfirmOpen(false); setLeadToDelete(null); }}>Cancel</button>
              <button type="button" className="admin-btn admin-btn--danger" onClick={handleConfirmDelete}>Confirm Delete</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
