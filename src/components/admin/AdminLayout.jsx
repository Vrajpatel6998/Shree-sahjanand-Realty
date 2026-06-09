import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FiGrid,
  FiUsers,
  FiShield,
  FiDatabase,
  FiSettings,
  FiLogOut,
  FiBell,
  FiMoon,
  FiSun,
  FiCheckCircle,
  FiMenu,
  FiBookOpen,
  FiBriefcase,
  FiCalendar
} from 'react-icons/fi';
import '../../pages/admin/admin.css';

export default function AdminLayout() {
  const { user, logout, hasPermission, apiRequest } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [theme, setTheme] = useState(localStorage.getItem('adminTheme') || 'dark');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const notifRef = useRef(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/admin/login');
    }
  }, [user, navigate]);

  // Set theme on load / theme state change
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('adminTheme', theme);
  }, [theme]);

  // Handle clicking outside notifications to close
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const res = await apiRequest('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  }, [user, apiRequest]);

  useEffect(() => {
    fetchNotifications();
    // Poll notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await apiRequest('/api/notifications/mark-read', { method: 'PUT' });
      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotifClick = async (notif) => {
    if (!notif.isRead) {
      try {
        await apiRequest(`/api/notifications/${notif.id}/read`, { method: 'PUT' });
        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
      } catch (err) {
        console.error(err);
      }
    }
    setNotifOpen(false);
    navigate('/admin/leads'); // In a complex setup, redirect dynamically based on payload
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (!user) return null;

  return (
    <div className="admin-body-wrapper">
      <div className="admin-layout">
        
        {/* SIDEBAR */}
        <aside className={`admin-sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
          <div className="admin-sidebar__logo">
            <span className="admin-sidebar__logo-text">Shree Sahajanand Realty</span>
          </div>

          <nav className="admin-sidebar__menu">
            <NavLink
              to="/admin/dashboard"
              className={({ isActive }) => `admin-sidebar__link ${isActive ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              <FiGrid className="admin-sidebar__link-icon" />
              <span>Dashboard</span>
            </NavLink>

            {hasPermission('view_leads') && (
              <NavLink
                to="/admin/leads"
                className={({ isActive }) => `admin-sidebar__link ${isActive ? 'active' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                <FiUsers className="admin-sidebar__link-icon" />
                <span>Leads Manager</span>
              </NavLink>
            )}

            {hasPermission('view_leads') && (
              <NavLink
                to="/admin/followups"
                className={({ isActive }) => `admin-sidebar__link ${isActive ? 'active' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                <FiCalendar className="admin-sidebar__link-icon" />
                <span>Follow-Ups</span>
              </NavLink>
            )}

            {hasPermission('manage_staff') && (
              <NavLink
                to="/admin/staff"
                className={({ isActive }) => `admin-sidebar__link ${isActive ? 'active' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                <FiUsers className="admin-sidebar__link-icon" />
                <span>Staff Management</span>
              </NavLink>
            )}

            {hasPermission('manage_roles') && (
              <NavLink
                to="/admin/roles"
                className={({ isActive }) => `admin-sidebar__link ${isActive ? 'active' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                <FiShield className="admin-sidebar__link-icon" />
                <span>Roles & Permissions</span>
              </NavLink>
            )}

            {hasPermission('manage_content') && (
              <NavLink
                to="/admin/services"
                className={({ isActive }) => `admin-sidebar__link ${isActive ? 'active' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                <FiBookOpen className="admin-sidebar__link-icon" />
                <span>Services Content</span>
              </NavLink>
            )}

            {hasPermission('view_logs') && (
              <NavLink
                to="/admin/logs"
                className={({ isActive }) => `admin-sidebar__link ${isActive ? 'active' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                <FiDatabase className="admin-sidebar__link-icon" />
                <span>Activity Logs</span>
              </NavLink>
            )}

            {hasPermission('manage_settings') && (
              <NavLink
                to="/admin/settings"
                className={({ isActive }) => `admin-sidebar__link ${isActive ? 'active' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                <FiSettings className="admin-sidebar__link-icon" />
                <span>CRM Settings</span>
              </NavLink>
            )}
          </nav>

          <div className="admin-sidebar__footer">
            <button className="admin-sidebar__logout" onClick={logout}>
              <FiLogOut className="admin-sidebar__link-icon" />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* MAIN BODY */}
        <div className="admin-main">
          
          {/* TOP HEADER */}
          <header className="admin-header">
            <button
              className="admin-header__btn"
              style={{ display: 'none' /* toggle dynamically in CSS for mobile */ }}
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <FiMenu />
            </button>

            <div className="admin-header__search">
              <span style={{ fontSize: '1.25rem', fontWeight: '500', color: 'var(--admin-text-secondary)' }}>
                Welcome, {user.fullName}
              </span>
            </div>

            <div className="admin-header__actions">
              {/* Theme toggle */}
              <button className="admin-header__btn" onClick={toggleTheme} aria-label="Toggle Theme">
                {theme === 'light' ? <FiMoon /> : <FiSun />}
              </button>

              {/* Notifications bell */}
              <div className="admin-header__btn-wrapper" style={{ position: 'relative' }} ref={notifRef}>
                <button className="admin-header__btn" onClick={() => setNotifOpen(!notifOpen)} aria-label="Notifications">
                  <FiBell />
                  {unreadCount > 0 && <span className="admin-header__badge">{unreadCount}</span>}
                </button>

                {/* Dropdown panel */}
                {notifOpen && (
                  <div className="notification-dropdown">
                    <div className="notification-dropdown__header">
                      <span className="notification-dropdown__title">Alert Notifications</span>
                      {unreadCount > 0 && (
                        <button className="notification-dropdown__mark-all" onClick={handleMarkAllRead}>
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="notification-dropdown__list">
                      {notifications.length === 0 ? (
                        <div style={{ padding: '20px', textAlignment: 'center', fontSize: '0.8rem', color: 'var(--admin-text-muted)' }}>
                          No notifications received.
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif.id}
                            className={`notification-item ${!notif.isRead ? 'unread' : ''}`}
                            onClick={() => handleNotifClick(notif)}
                          >
                            <span className="notification-item__title">{notif.title}</span>
                            <span className="notification-item__message">{notif.message}</span>
                            <span className="notification-item__time">
                              {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User profile info */}
              <div className="admin-header__profile" onClick={() => navigate('/admin/settings')}>
                <div className="admin-header__avatar">
                  {user.fullName.charAt(0)}
                </div>
                <div className="admin-header__profile-info" style={{ display: 'none' /* toggle dynamically in CSS */ }}>
                  <span className="admin-header__profile-name">{user.fullName}</span>
                  <span className="admin-header__profile-role">{user.role}</span>
                </div>
              </div>
            </div>
          </header>

          {/* VIEWPORT CONTENT */}
          <main className="admin-content">
            <Outlet />
          </main>

        </div>
      </div>
    </div>
  );
}
