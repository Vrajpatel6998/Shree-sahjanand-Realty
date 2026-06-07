import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiUser, FiLock, FiAlertCircle } from 'react-icons/fi';
import './admin.css';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lockMsg, setLockMsg] = useState('');
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotUsername, setForgotUsername] = useState('');
  const [forgotMsg, setForgotMsg] = useState('');
  
  const { login, user } = useAuth();
  const navigate = useNavigate();

  // If already logged in, redirect to admin
  useEffect(() => {
    if (user) {
      navigate('/admin/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Username and password are required');
      return;
    }

    setError('');
    setLockMsg('');
    setLoading(true);

    try {
      await login(username, password);
      navigate('/admin/dashboard');
    } catch (err) {
      console.error(err);
      const msg = err.message || 'Login failed';
      if (msg.includes('locked')) {
        setLockMsg(msg);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (!forgotUsername) return;
    setForgotMsg('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: forgotUsername }),
      });
      const data = await res.json();
      setForgotMsg(data.message);
    } catch (err) {
      setForgotMsg('Error connecting to authentication service.');
    }
  };

  return (
    <div className="admin-body-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'radial-gradient(circle at 10% 20%, rgba(9, 13, 22, 1) 0%, rgba(26, 40, 70, 1) 90.1%)' }}>
      
      {/* Background elements */}
      <div style={{ position: 'absolute', width: '300px', height: '300px', borderRadius: '50%', background: 'var(--admin-primary)', opacity: '0.15', filter: 'blur(80px)', top: '10%', left: '10%', pointerEvents: 'none' }}></div>
      <div style={{ position: 'absolute', width: '350px', height: '350px', borderRadius: '50%', background: 'var(--admin-accent)', opacity: '0.1', filter: 'blur(90px)', bottom: '10%', right: '10%', pointerEvents: 'none' }}></div>

      <div className="admin-card" style={{ maxWidth: '420px', width: '100%', margin: '16px', background: 'rgba(17, 24, 39, 0.75)', border: '1px solid rgba(255, 255, 255, 0.08)', backdropFilter: 'blur(16px)' }}>
        <div className="admin-card__body" style={{ padding: '40px 32px' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <span style={{ fontSize: '2.5rem' }}>🏢</span>
            <h1 style={{ fontSize: '1.6rem', fontWeight: '700', color: '#fff', marginTop: '12px' }}>Shree Sahjanand Realty</h1>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', marginTop: '6px' }}>Staff & Administration CRM Portal</p>
          </div>

          {(error || lockMsg) && (
            <div style={{ display: 'flex', gap: '8px', padding: '12px 16px', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#f87171', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '20px' }}>
              <FiAlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>{error || lockMsg}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="admin-form-group">
              <label htmlFor="login-username" style={{ color: 'rgba(255,255,255,0.7)' }}>Username</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-username"
                  className="admin-form-control"
                  style={{ width: '100%', paddingLeft: '44px', backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }}
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                />
                <FiUser style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
              </div>
            </div>

            <div className="admin-form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label htmlFor="login-password" style={{ color: 'rgba(255,255,255,0.7)' }}>Password</label>
                <button
                  type="button"
                  onClick={() => setForgotOpen(true)}
                  style={{ background: 'none', border: 'none', color: 'var(--admin-primary)', fontSize: '0.8rem', fontWeight: '500', cursor: 'pointer' }}
                >
                  Forgot Password?
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-password"
                  type="password"
                  className="admin-form-control"
                  style={{ width: '100%', paddingLeft: '44px', backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
                <FiLock style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
              </div>
            </div>

            <button
              type="submit"
              className="admin-btn admin-btn--primary"
              style={{ width: '100%', marginTop: '8px', padding: '14px' }}
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal" style={{ maxWidth: '400px' }}>
            <div className="admin-modal__header">
              <h3 style={{ fontSize: '1.1rem', fontWeight: '600' }}>Password Reset Support</h3>
              <button onClick={() => { setForgotOpen(false); setForgotMsg(''); setForgotUsername(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
            </div>
            <form onSubmit={handleForgotSubmit}>
              <div className="admin-modal__body">
                <p style={{ fontSize: '0.85rem', color: 'var(--admin-text-secondary)', marginBottom: '16px' }}>
                  Enter your system username. Reset instructions will be registered, or you can contact your system administrator to unlock/reset your account credentials directly.
                </p>
                <div className="admin-form-group">
                  <label>Username</label>
                  <input
                    className="admin-form-control"
                    placeholder="e.g. reception"
                    value={forgotUsername}
                    onChange={(e) => setForgotUsername(e.target.value)}
                    required
                  />
                </div>
                {forgotMsg && (
                  <div style={{ marginTop: '16px', padding: '10px 12px', backgroundColor: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '6px', fontSize: '0.8rem', color: 'var(--admin-primary)' }}>
                    {forgotMsg}
                  </div>
                )}
              </div>
              <div className="admin-modal__footer">
                <button type="button" className="admin-btn admin-btn--secondary" onClick={() => { setForgotOpen(false); setForgotMsg(''); setForgotUsername(''); }}>Close</button>
                <button type="submit" className="admin-btn admin-btn--primary">Send Request</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
