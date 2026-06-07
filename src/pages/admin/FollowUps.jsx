import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FiCalendar, FiPhone, FiAlertCircle, FiClock, FiCheck, FiBookOpen } from 'react-icons/fi';
import './admin.css';

export default function FollowUps() {
  const { apiRequest, hasPermission } = useAuth();
  
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  
  // Follow up edit states
  const [followUpDate, setFollowUpDate] = useState('');
  const [status, setStatus] = useState('');
  const [notes, setNotes] = useState('');

  const loadLeads = async () => {
    setLoading(true);
    try {
      // Fetch all leads that have a follow-up date
      const res = await apiRequest('/api/leads?limit=100');
      if (res.ok) {
        const data = await res.json();
        // Filter leads with follow-up dates
        const filtered = data.leads.filter((l) => !!l.followUpDate);
        setLeads(filtered);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, [apiRequest]);

  const handleOpenAction = (lead) => {
    setSelectedLead(lead);
    setFollowUpDate(lead.followUpDate ? lead.followUpDate.split('T')[0] : '');
    setStatus(lead.status);
    setNotes('');
    setDetailOpen(true);
  };

  const handleSubmitAction = async (e) => {
    e.preventDefault();

    try {
      const res = await apiRequest(`/api/leads/${selectedLead.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          followUpDate: followUpDate || null,
          status,
          notes: notes ? `Action taken during follow-up: ${notes}` : undefined
        })
      });

      if (res.ok) {
        setDetailOpen(false);
        alert('Follow-up schedule updated successfully');
        loadLeads();
      } else {
        const data = await res.json();
        alert(data.message || 'Error updating follow-up');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Organize leads categories
  const todayStr = new Date().toISOString().split('T')[0];
  const today = new Date();
  today.setHours(0,0,0,0);

  const getCategories = () => {
    const todayList = [];
    const upcomingList = [];
    const missedList = [];

    leads.forEach((l) => {
      if (l.status === 'CLOSED_WON' || l.status === 'CLOSED_LOST') return; // Exclude resolved leads
      
      const fDate = new Date(l.followUpDate);
      fDate.setHours(0,0,0,0);
      const fDateStr = l.followUpDate.split('T')[0];

      if (fDateStr === todayStr) {
        todayList.push(l);
      } else if (fDate > today) {
        upcomingList.push(l);
      } else if (fDate < today) {
        missedList.push(l);
      }
    });

    return { todayList, upcomingList, missedList };
  };

  const { todayList, upcomingList, missedList } = getCategories();

  if (!hasPermission('view_leads')) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: 'var(--admin-danger)' }}>
        🚫 Forbidden: You do not have permission to view follow-up panels.
      </div>
    );
  }

  const RenderCard = ({ lead }) => (
    <div
      className="admin-card"
      onClick={() => handleOpenAction(lead)}
      style={{
        padding: '16px 20px',
        cursor: 'pointer',
        transition: 'transform 0.2s ease, border-color 0.2s ease',
        margin: 0,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <strong style={{ fontSize: '0.9rem', color: 'var(--admin-text-primary)' }}>
          {lead.firstName} {lead.lastName}
        </strong>
        <span className={`status-tag status-tag--${lead.status.toLowerCase().replace(/_/g, '')}`} style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
          {lead.status.replace(/_/g, ' ')}
        </span>
      </div>
      <p style={{ fontSize: '0.8rem', color: 'var(--admin-text-secondary)', marginTop: '4px' }}>
        {lead.interestedService}
      </p>
      
      <div style={{ display: 'flex', gap: '6px', alignItems: 'center', fontSize: '0.75rem', color: 'var(--admin-text-muted)', marginTop: '12px' }}>
        <FiPhone /> <span>{lead.contactNumber}</span>
      </div>

      <div style={{ display: 'flex', gap: '6px', alignItems: 'center', fontSize: '0.75rem', color: 'var(--admin-text-muted)', marginTop: '4px' }}>
        <FiCalendar /> <span>Follow-Up: {new Date(lead.followUpDate).toLocaleDateString()}</span>
      </div>

      {lead.notes && (
        <p style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', backgroundColor: 'var(--admin-bg-tertiary)', padding: '6px 8px', borderRadius: '4px', marginTop: '10px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {lead.notes}
        </p>
      )}
    </div>
  );

  return (
    <div>
      <div className="admin-title-block">
        <div>
          <h2 className="admin-title-block__title">Outreach & Follow-Up Management</h2>
          <p className="admin-title-block__subtitle">Organize and execute follow-up schedules. Outbox client reminders.</p>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '40vh' }}>
          <div className="contact-loader" style={{ width: '32px', height: '32px' }}></div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          
          {/* Columns 1: Missed */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--admin-danger)', paddingBottom: '8px' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--admin-danger)', display: 'flex', gap: '6px', alignItems: 'center' }}>
                <FiAlertCircle /> Missed Reminders
              </h3>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', backgroundColor: 'rgba(239,68,68,0.1)', color: 'var(--admin-danger)', padding: '2px 8px', borderRadius: '10px' }}>
                {missedList.length}
              </span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', maxHeight: '70vh' }}>
              {missedList.length === 0 ? (
                <div style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)', padding: '16px', textAlign: 'center' }}>No missed follow-ups.</div>
              ) : (
                missedList.map((l) => <RenderCard key={l.id} lead={l} />)
              )}
            </div>
          </div>

          {/* Column 2: Today */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--admin-warning)', paddingBottom: '8px' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--admin-warning)', display: 'flex', gap: '6px', alignItems: 'center' }}>
                <FiClock /> Scheduled Today
              </h3>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', backgroundColor: 'rgba(245,158,11,0.1)', color: 'var(--admin-warning)', padding: '2px 8px', borderRadius: '10px' }}>
                {todayList.length}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', maxHeight: '70vh' }}>
              {todayList.length === 0 ? (
                <div style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)', padding: '16px', textAlign: 'center' }}>No follow-ups for today.</div>
              ) : (
                todayList.map((l) => <RenderCard key={l.id} lead={l} />)
              )}
            </div>
          </div>

          {/* Column 3: Upcoming */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--admin-success)', paddingBottom: '8px' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--admin-success)', display: 'flex', gap: '6px', alignItems: 'center' }}>
                <FiCalendar /> Upcoming Outreaches
              </h3>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', backgroundColor: 'rgba(16,185,129,0.1)', color: 'var(--admin-success)', padding: '2px 8px', borderRadius: '10px' }}>
                {upcomingList.length}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', maxHeight: '70vh' }}>
              {upcomingList.length === 0 ? (
                <div style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)', padding: '16px', textAlign: 'center' }}>No upcoming follow-ups scheduled.</div>
              ) : (
                upcomingList.map((l) => <RenderCard key={l.id} lead={l} />)
              )}
            </div>
          </div>

        </div>
      )}

      {/* --- QUICK ACTION OVERLAY MODAL --- */}
      {detailOpen && selectedLead && (
        <div className="admin-modal-overlay">
          <div className="admin-modal" style={{ maxWidth: '450px' }}>
            <div className="admin-modal__header">
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Outreach Action: {selectedLead.firstName}</h3>
              <button className="admin-header__btn" style={{ border: 'none', background: 'none', fontSize: '1.25rem' }} onClick={() => setDetailOpen(false)}>×</button>
            </div>
            
            <form onSubmit={handleSubmitAction}>
              <div className="admin-modal__body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', backgroundColor: 'var(--admin-bg-tertiary)', padding: '12px', borderRadius: '8px', border: '1px solid var(--admin-border)', fontSize: '0.85rem' }}>
                  <div><strong>Full Name:</strong> {selectedLead.firstName} {selectedLead.lastName}</div>
                  <div><strong>Mobile:</strong> {selectedLead.contactNumber}</div>
                  <div><strong>Interested Service:</strong> {selectedLead.interestedService}</div>
                  {selectedLead.notes && <div><strong>Last Note:</strong> {selectedLead.notes}</div>}
                </div>

                <div className="admin-form-group">
                  <label>Update Lead Status</label>
                  <select className="admin-form-control" value={status} onChange={(e) => setStatus(e.target.value)}>
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
                  <label>Reschedule Follow-Up Date</label>
                  <input
                    type="date"
                    className="admin-form-control"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>Leave blank to clear the follow-up reminder.</span>
                </div>

                <div className="admin-form-group">
                  <label>Outreach Action Notes</label>
                  <textarea
                    className="admin-form-control"
                    rows="3"
                    placeholder="e.g. Call completed. Customer asked to call back next week."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>

              <div className="admin-modal__footer">
                <button type="button" className="admin-btn admin-btn--secondary" onClick={() => setDetailOpen(false)}>Cancel</button>
                <button type="submit" className="admin-btn admin-btn--primary">
                  <FiCheck /> Log Action
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
