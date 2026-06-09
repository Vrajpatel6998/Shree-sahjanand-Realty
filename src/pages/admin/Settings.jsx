import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FiSettings, FiGlobe, FiDatabase, FiSave, FiDownload, FiCloud } from 'react-icons/fi';
import './admin.css';

export default function Settings() {
  const { apiRequest, hasPermission, token } = useAuth();
  
  const [activeTab, setActiveTab] = useState('profile'); // profile, backups
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [backupLoading, setBackupLoading] = useState(false);

  // Form states
  const [companyName, setCompanyName] = useState('');
  const [tagline, setTagline] = useState('');
  const [subtagline, setSubtagline] = useState('');
  const [phone, setPhone] = useState('');
  const [phone2, setPhone2] = useState('');
  const [email, setEmail] = useState('');
  const [email2, setEmail2] = useState('');
  const [address, setAddress] = useState('');
  
  // Social links
  const [facebook, setFacebook] = useState('');
  const [instagram, setInstagram] = useState('');
  const [twitter, setTwitter] = useState('');
  const [youtube, setYoutube] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [whatsapp, setWhatsapp] = useState('');

  // Fetch settings keys
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await apiRequest('/api/settings');
        if (res.ok) {
          const data = await res.json();
          setCompanyName(data.name || '');
          setTagline(data.tagline || '');
          setSubtagline(data.subtagline || '');
          setPhone(data.phone || '');
          setPhone2(data.phone2 || '');
          setEmail(data.email || '');
          setEmail2(data.email2 || '');
          setAddress(data.address || '');
          setFacebook(data.social?.facebook || '');
          setInstagram(data.social?.instagram || '');
          setTwitter(data.social?.twitter || '');
          setYoutube(data.social?.youtube || '');
          setLinkedin(data.social?.linkedin || '');
          setWhatsapp(data.social?.whatsapp || '');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [apiRequest]);

  // Submit settings update
  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const body = {
      companyName,
      tagline,
      subtagline,
      phone,
      phone2,
      email,
      email2,
      address,
      facebook,
      instagram,
      twitter,
      youtube,
      linkedin,
      whatsapp,
    };

    try {
      const res = await apiRequest('/api/settings', {
        method: 'PUT',
        body: JSON.stringify(body),
      });

      if (res.ok) {
        alert('Website settings updated successfully! Changes will reflect on landing page.');
      } else {
        const data = await res.json();
        alert(data.message || 'Error updating settings');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Download DB Backup
  const handleDownloadBackup = () => {
    if (!hasPermission('manage_backups')) return;
    setBackupLoading(true);
    
    // Direct open backup endpoint (will trigger download)
    try {
      window.open(`/api/backups/export?token=${token}`, '_blank');
      alert('Generating database schema and data backup file. Check downloads folder.');
    } catch (err) {
      console.error(err);
    } finally {
      setBackupLoading(false);
    }
  };

  if (!hasPermission('manage_settings') && !hasPermission('manage_backups')) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: 'var(--admin-danger)' }}>
        🚫 Forbidden: You do not have permission to access settings.
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
        <div className="contact-loader" style={{ width: '32px', height: '32px' }}></div>
      </div>
    );
  }

  return (
    <div>
      <div className="admin-title-block">
        <div>
          <h2 className="admin-title-block__title">CRM & Website Settings</h2>
          <p className="admin-title-block__subtitle">Adjust metadata, social links, contact credentials, and maintain database backups.</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--admin-border)', marginBottom: '24px' }}>
        {hasPermission('manage_settings') && (
          <button
            className="admin-sidebar__link"
            style={{ padding: '12px 20px', borderRadius: 0, borderBottom: activeTab === 'profile' ? '2px solid var(--admin-primary)' : 'none', color: activeTab === 'profile' ? 'var(--admin-primary)' : 'var(--admin-text-secondary)', background: 'none', fontWeight: '600', cursor: 'pointer' }}
            onClick={() => setActiveTab('profile')}
          >
            <FiGlobe style={{ marginRight: '6px' }} /> Website Contact Profile
          </button>
        )}
        {hasPermission('manage_backups') && (
          <button
            className="admin-sidebar__link"
            style={{ padding: '12px 20px', borderRadius: 0, borderBottom: activeTab === 'backups' ? '2px solid var(--admin-primary)' : 'none', color: activeTab === 'backups' ? 'var(--admin-primary)' : 'var(--admin-text-secondary)', background: 'none', fontWeight: '600', cursor: 'pointer' }}
            onClick={() => setActiveTab('backups')}
          >
            <FiDatabase style={{ marginRight: '6px' }} /> Database Backup Tools
          </button>
        )}
      </div>

      {activeTab === 'profile' ? (
        <form onSubmit={handleSettingsSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Section 1: Company Profile */}
          <div className="admin-card" style={{ margin: 0 }}>
            <div className="admin-card__header">
              <span className="admin-card__title">Corporate Identity & Contacts</span>
            </div>
            <div className="admin-card__body">
              <div className="admin-form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="admin-form-group">
                  <label>Company Name *</label>
                  <input
                    className="admin-form-control"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                  />
                </div>

                <div className="admin-form-group">
                  <label>Phone Number (Primary) *</label>
                  <input
                    className="admin-form-control"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>

                <div className="admin-form-group">
                  <label>Phone Number (Alternate)</label>
                  <input
                    className="admin-form-control"
                    value={phone2}
                    onChange={(e) => setPhone2(e.target.value)}
                  />
                </div>

                <div className="admin-form-group">
                  <label>Email Address (Primary) *</label>
                  <input
                    type="email"
                    className="admin-form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="admin-form-group">
                  <label>Email Address (Alternate)</label>
                  <input
                    type="email"
                    className="admin-form-control"
                    value={email2}
                    onChange={(e) => setEmail2(e.target.value)}
                  />
                </div>

                <div className="admin-form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Headline Tagline</label>
                  <input
                    className="admin-form-control"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                  />
                </div>

                <div className="admin-form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Subheadline Text</label>
                  <input
                    className="admin-form-control"
                    value={subtagline}
                    onChange={(e) => setSubtagline(e.target.value)}
                  />
                </div>

                <div className="admin-form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Office Address *</label>
                  <textarea
                    className="admin-form-control"
                    rows="3"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Social Links */}
          <div className="admin-card" style={{ margin: 0 }}>
            <div className="admin-card__header">
              <span className="admin-card__title">Social Media & Call Integrations</span>
            </div>
            <div className="admin-card__body">
              <div className="admin-form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="admin-form-group">
                  <label>WhatsApp Link (e.g., https://wa.me/919909421050)</label>
                  <input
                    className="admin-form-control"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                  />
                </div>

                <div className="admin-form-group">
                  <label>Facebook URL</label>
                  <input
                    className="admin-form-control"
                    value={facebook}
                    onChange={(e) => setFacebook(e.target.value)}
                  />
                </div>

                <div className="admin-form-group">
                  <label>Instagram URL</label>
                  <input
                    className="admin-form-control"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                  />
                </div>

                <div className="admin-form-group">
                  <label>Twitter / X URL</label>
                  <input
                    className="admin-form-control"
                    value={twitter}
                    onChange={(e) => setTwitter(e.target.value)}
                  />
                </div>

                <div className="admin-form-group">
                  <label>Linkedin Company URL</label>
                  <input
                    className="admin-form-control"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                  />
                </div>

                <div className="admin-form-group">
                  <label>Youtube Channel URL</label>
                  <input
                    className="admin-form-control"
                    value={youtube}
                    onChange={(e) => setYoutube(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          <button type="submit" className="admin-btn admin-btn--primary" style={{ alignSelf: 'flex-start' }} disabled={saving}>
            <FiSave /> {saving ? 'Saving Changes...' : 'Save Settings'}
          </button>
        </form>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          
          {/* Local Backup Panel */}
          <div className="admin-card" style={{ margin: 0 }}>
            <div className="admin-card__header">
              <span className="admin-card__title">Local Database Dump</span>
            </div>
            <div className="admin-card__body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--admin-text-secondary)', lineHeight: '1.5' }}>
                Download a complete backup of the database as a single structured JSON file. This package contains full schemas, dynamic permission setups, user details, leads lifecycle history, follow-up logs, and activity records.
              </p>
              
              <button
                className="admin-btn admin-btn--primary"
                style={{ alignSelf: 'flex-start', padding: '12px 24px', display: 'flex', gap: '8px' }}
                onClick={handleDownloadBackup}
                disabled={backupLoading}
              >
                <FiDownload /> {backupLoading ? 'Exporting...' : 'Download Database Backup'}
              </button>
            </div>
          </div>

          {/* Cloud Backups placeholder */}
          <div className="admin-card" style={{ margin: 0 }}>
            <div className="admin-card__header">
              <span className="admin-card__title">Cloud Backups Scaffolding</span>
            </div>
            <div className="admin-card__body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '10px', backgroundColor: 'rgba(59, 130, 246, 0.04)', border: '1px dashed var(--admin-primary)', borderRadius: '8px', padding: '16px' }}>
                <FiCloud style={{ fontSize: '2.5rem', color: 'var(--admin-primary)', flexShrink: 0 }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.85rem' }}>
                  <strong style={{ color: 'var(--admin-text-primary)' }}>AWS S3 Storage Pipeline</strong>
                  <span style={{ color: 'var(--admin-text-muted)', lineHeight: '1.4' }}>
                    The backend routes contain structural code and hooks prepared for AWS S3 backups. Set AWS bucket credentials in the server configurations to unlock automated night database cloud backups.
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
