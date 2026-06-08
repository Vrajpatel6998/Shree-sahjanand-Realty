import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FiBookOpen, FiUpload, FiImage, FiCheck, FiTrash2, FiAlertCircle, FiHome, FiBriefcase, FiActivity, FiMap, FiDollarSign, FiLayers } from 'react-icons/fi';
import './admin.css';

export default function Services() {
  const { apiRequest, hasPermission } = useAuth();
  
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState(null);

  // Form states
  const [title, setTitle] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [description, setDescription] = useState('');
  const [featuresText, setFeaturesText] = useState('');
  
  // Upload states
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');

  const loadServices = async () => {
    setLoading(true);
    try {
      const res = await apiRequest('/api/services');
      if (res.ok) {
        const data = await res.json();
        setServices(data);
        if (data.length > 0 && !selectedService) {
          handleSelectService(data[0]);
        } else if (selectedService) {
          const current = data.find(s => s.id === selectedService.id);
          if (current) handleSelectService(current);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, [apiRequest]);

  const handleSelectService = (s) => {
    setSelectedService(s);
    setTitle(s.title);
    setShortDesc(s.shortDesc || '');
    setDescription(s.description || '');
    setFeaturesText(s.features ? s.features.join('\n') : '');
    setUploadError('');
    setUploadSuccess('');
  };

  // Submit Text details update
  const handleUpdateText = async (e) => {
    e.preventDefault();
    if (!title) return;

    const features = featuresText
      .split('\n')
      .map((f) => f.trim())
      .filter((f) => f.length > 0);

    try {
      const res = await apiRequest(`/api/services/${selectedService.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          title,
          shortDesc,
          description,
          features,
        }),
      });

      if (res.ok) {
        alert('Service content updated successfully!');
        loadServices();
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to update content');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Client-Side Image Validation & Upload
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadError('');
    setUploadSuccess('');

    // 1. Format Validation
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Invalid format. Only JPG, JPEG, PNG, or WEBP images are supported.');
      return;
    }

    // 2. Size Validation (2MB limit)
    if (file.size > 2 * 1024 * 1024) {
      setUploadError('File is too large. Maximum size allowed is 2MB.');
      return;
    }

    // 3. Dimension Validation (1200 x 800 px)
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    
    img.onload = async () => {
      URL.revokeObjectURL(objectUrl);
      
      if (img.width !== 1200 || img.height !== 800) {
        setUploadError(`Dimension mismatch: Image must be exactly 1200 x 800 pixels. Got ${img.width} x ${img.height} px.`);
        return;
      }

      // Validated! Proceed with upload.
      setUploading(true);
      const formData = new FormData();
      formData.append('image', file);

      try {
        const res = await fetch(`/api/services/${selectedService.id}/image`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken') || ''}` // AuthContext will handle token headers but since it's Multipart Form-Data fetch, we send manually or via request wrapper. In AuthContext we have apiRequest.
            // Note: Since we are passing FormData, we shouldn't manually set Content-Type in request wrapper as it prevents boundary headers. Let's do it manually using standard fetch with auth headers.
          },
          body: formData
        });

        // Let's retry with token if needed or read token from localStorage.
        // Wait, in AuthContext our token is in memory. But we can fetch it, let's look at the implementation. Since apiRequest injects token automatically, let's adjust apiRequest or send it using standard fetch.
        // Let's read token from context or fetch token. Wait! Our context token is in state. We can pass Auth token to standard fetch. Since we are in AuthContext, we can also modify apiRequest to support FormData.
        // Actually, in AuthContext: headers: { 'Content-Type': 'application/json', ...options.headers }
        // If we pass a FormData body, we want to delete 'Content-Type' header!
        // Let's use fetch manually with current token from memory.
        const token = localStorage.getItem('adminToken') || ''; // We will make sure context sets token in localStorage or cookies, or we can use the apiRequest helper!
        // To use apiRequest helper, we can pass null or delete the Content-Type. Let's do a manual fetch with authorization header.
        
        // Wait, how does our AuthContext store token?
        // Let's check: our AuthContext has `token` in state. Since we have apiRequest inside useAuth(), we can call it. But wait, apiRequest has:
        // const headers = { 'Content-Type': 'application/json', ...options.headers };
        // This forces 'Content-Type: application/json' even for FormData!
        // Let's write a standard manual fetch where we retrieve token from context state. In our AuthContext we set `token` in memory, but we also saved it? No, in memory only.
        // Wait! We can get the `token` from `useAuth()` directly!
        // Yes, we destructure `token` from `useAuth()`.
        // Let's do that: const { token } = useAuth();
        // And then: headers: { 'Authorization': `Bearer ${token}` }
        // Let's write this.
        
        const uploadRes = await fetch(`/api/services/${selectedService.id}/image`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken') || ''}` // Wait, if the token is only in state, we can use the state token!
          },
          body: formData
        });
        
        // Let's check: did we save the token to localStorage? In AuthContext.jsx we didn't write it to localStorage, only memory and HttpOnly cookies.
        // Wait! If the token is only in state, how can we access it? We can pass it or read it.
        // Wait! Let's check `AuthContext.jsx`. The token state is returned in the value: `value = { token, ... }`.
        // So we can destructure `token` in our component!
        // `const { token, apiRequest } = useAuth();`
        // Then we can run fetch using `token`!
        // Let's do that, it is clean and correct.
      } catch (err) {
        console.error(err);
      }
    };
    img.src = objectUrl;
  };

  // Upload runner using state token
  const { token, apiRequest: authApiRequest } = useAuth();
  
  const handleUploadTrigger = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadError('');
    setUploadSuccess('');

    // 1. Format Check
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Invalid format. Only JPG, JPEG, PNG, or WEBP images are supported.');
      return;
    }

    // 2. Size Check (2MB limit)
    if (file.size > 2 * 1024 * 1024) {
      setUploadError('File is too large. Maximum size allowed is 2MB.');
      return;
    }

    // 3. Dimension Check (1200 x 800 px)
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    
    img.onload = async () => {
      URL.revokeObjectURL(objectUrl);
      
      if (img.width !== 1200 || img.height !== 800) {
        setUploadError(`Dimension mismatch: Image must be exactly 1200 x 800 pixels. Got ${img.width} x ${img.height} px.`);
        return;
      }

      setUploading(true);
      const formData = new FormData();
      formData.append('image', file);

      try {
        const res = await fetch(`/api/services/${selectedService.id}/image`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });

        const data = await res.json();
        if (res.ok) {
          setUploadSuccess('Image uploaded and updated successfully!');
          loadServices();
        } else {
          setUploadError(data.message || 'Image upload failed.');
        }
      } catch (err) {
        setUploadError('Network error uploading image.');
      } finally {
        setUploading(false);
      }
    };
    img.src = objectUrl;
  };

  // Revert custom image back to default unsplash
  const handleRevertImage = async () => {
    if (!window.confirm('Are you sure you want to revert this service image back to the default placeholder?')) return;
    try {
      const res = await authApiRequest(`/api/services/${selectedService.id}/image`, {
        method: 'DELETE',
      });
      if (res.ok) {
        alert('Image reverted to default.');
        loadServices();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!hasPermission('manage_content')) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: 'var(--admin-danger)' }}>
        🚫 Forbidden: You do not have permission to edit website services content.
      </div>
    );
  }

  return (
    <div>
      <div className="admin-title-block">
        <div>
          <h2 className="admin-title-block__title">Website Content & Services Editor</h2>
          <p className="admin-title-block__subtitle">Edit titles, text bullet features, and service landing page custom images.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '24px' }}>
        
        {/* Left column: Services list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--admin-text-muted)' }}>Service Categories</h3>
          
          {loading && services.length === 0 ? (
            <div className="contact-loader" style={{ width: '24px', height: '24px' }}></div>
          ) : (
            services.map((s) => (
              <div
                key={s.id}
                onClick={() => handleSelectService(s)}
                className="admin-card"
                style={{
                  padding: '16px 20px',
                  cursor: 'pointer',
                  borderWidth: '1px',
                  borderColor: selectedService?.id === s.id ? 'var(--admin-primary)' : 'var(--admin-border)',
                  backgroundColor: selectedService?.id === s.id ? 'rgba(26,60,142,0.03)' : 'var(--admin-bg-secondary)',
                  margin: 0,
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                <span style={{ fontSize: '1.2rem', display: 'inline-flex' }}>
                  {s.id === 'residential' ? <FiHome /> : s.id === 'commercial' ? <FiBriefcase /> : s.id === 'industrial' ? <FiActivity /> : s.id === 'land' ? <FiMap /> : s.id === 'loans' ? <FiDollarSign /> : <FiLayers />}
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <strong style={{ fontSize: '0.9rem', color: selectedService?.id === s.id ? 'var(--admin-primary)' : 'var(--admin-text-primary)' }}>{s.title}</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>ID: {s.id}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right column: Editor fields */}
        {selectedService && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Editor card */}
            <div className="admin-card" style={{ margin: 0 }}>
              <div className="admin-card__header">
                <span className="admin-card__title">Edit Service Details: {selectedService.title}</span>
              </div>
              <div className="admin-card__body">
                <form onSubmit={handleUpdateText} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="admin-form-group">
                    <label>Service Category Title</label>
                    <input
                      className="admin-form-control"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Short Description (Displays in card summaries)</label>
                    <input
                      className="admin-form-control"
                      value={shortDesc}
                      onChange={(e) => setShortDesc(e.target.value)}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Detailed Overview (Displays in details view)</label>
                    <textarea
                      className="admin-form-control"
                      rows="4"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Bullet Features list (One feature per line)</label>
                    <textarea
                      className="admin-form-control"
                      rows="6"
                      placeholder="e.g. 2, 3 & 4 BHK Apartments&#10;Ready-to-Move&#10;RERA Approved"
                      value={featuresText}
                      onChange={(e) => setFeaturesText(e.target.value)}
                    />
                  </div>

                  <button type="submit" className="admin-btn admin-btn--primary" style={{ alignSelf: 'flex-start' }}>
                    Save Text Details
                  </button>
                </form>
              </div>
            </div>

            {/* Image Manager card */}
            <div className="admin-card" style={{ margin: 0 }}>
              <div className="admin-card__header">
                <span className="admin-card__title">Landing Page Image Management</span>
              </div>
              <div className="admin-card__body">
                <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '24px' }}>
                  
                  {/* Current image preview */}
                  <div>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--admin-text-muted)', marginBottom: '8px' }}>Active Preview</h4>
                    <div style={{ width: '100%', height: '200px', border: '1px solid var(--admin-border)', borderRadius: '8px', overflow: 'hidden', backgroundColor: 'var(--admin-bg-tertiary)', position: 'relative' }}>
                      <img
                        src={selectedService.image}
                        alt="Service category"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  </div>

                  {/* Upload controls */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.04)', border: '1px dashed var(--admin-primary)', borderRadius: '8px', padding: '16px 20px' }}>
                      <h5 style={{ fontSize: '0.9rem', fontWeight: '700', display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <FiImage style={{ color: 'var(--admin-primary)' }} /> Upload Requirements
                      </h5>
                      <ul style={{ fontSize: '0.8rem', color: 'var(--admin-text-secondary)', paddingLeft: '16px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <li><strong>Recommended Size:</strong> exactly 1200 x 800 px</li>
                        <li><strong>File Size Limit:</strong> under 2MB</li>
                        <li><strong>Supported Formats:</strong> JPG, JPEG, PNG, WEBP</li>
                      </ul>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      {hasPermission('manage_images') && (
                        <>
                          <label className="admin-btn admin-btn--primary" style={{ margin: 0, display: 'flex', gap: '8px', cursor: 'pointer' }}>
                            <FiUpload /> {uploading ? 'Processing Image...' : 'Upload Image'}
                            <input
                              type="file"
                              accept="image/*"
                              style={{ display: 'none' }}
                              onChange={handleUploadTrigger}
                              disabled={uploading}
                            />
                          </label>

                          {selectedService.image.startsWith('/uploads/') && (
                            <button className="admin-btn admin-btn--danger" onClick={handleRevertImage} disabled={uploading}>
                              <FiTrash2 /> Revert default
                            </button>
                          )}
                        </>
                      )}
                    </div>

                    {uploadError && (
                      <div style={{ display: 'flex', gap: '8px', padding: '10px 12px', backgroundColor: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', color: 'var(--admin-danger)', borderRadius: '6px', fontSize: '0.8rem' }}>
                        <FiAlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span>{uploadError}</span>
                      </div>
                    )}

                    {uploadSuccess && (
                      <div style={{ display: 'flex', gap: '8px', padding: '10px 12px', backgroundColor: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', color: 'var(--admin-success)', borderRadius: '6px', fontSize: '0.8rem' }}>
                        <FiCheck size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span>{uploadSuccess}</span>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            </div>

          </div>
        )}
      </div>

    </div>
  );
}
