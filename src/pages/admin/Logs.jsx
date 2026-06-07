import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FiSearch, FiDatabase } from 'react-icons/fi';
import './admin.css';

export default function Logs() {
  const { apiRequest, hasPermission } = useAuth();
  
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: 20,
        ...(search && { search }),
      });
      const res = await apiRequest(`/api/activities?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs);
        setTotal(data.pagination.total);
        setPages(data.pagination.pages);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [apiRequest, currentPage, search]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  if (!hasPermission('view_logs')) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: 'var(--admin-danger)' }}>
        🚫 Forbidden: You do not have permission to view activity audit logs.
      </div>
    );
  }

  return (
    <div>
      <div className="admin-title-block">
        <div>
          <h2 className="admin-title-block__title">System Activity Logs</h2>
          <p className="admin-title-block__subtitle">Chronological audit ledger tracking logins, password updates, lead CRUD, and settings adjustments.</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="filters-bar">
        <div className="filters-bar__search">
          <FiSearch className="filters-bar__search-icon" />
          <input
            className="admin-form-control"
            placeholder="Search by action, details, operator, or IP..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          />
        </div>
      </div>

      {/* Logs Card */}
      <div className="admin-card">
        <div className="admin-card__body" style={{ padding: 0 }}>
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Operator</th>
                  <th>Operation Type</th>
                  <th>Details</th>
                  <th>IP Address</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>
                      <div className="contact-loader" style={{ margin: '0 auto', width: '32px', height: '32px' }}></div>
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '32px', color: 'var(--admin-text-muted)' }}>
                      No activity logs found.
                    </td>
                  </tr>
                ) : (
                  logs.map((l) => (
                    <tr key={l.id}>
                      <td>{new Date(l.createdAt).toLocaleString()}</td>
                      <td style={{ fontWeight: '600' }}>
                        {l.user ? l.user.fullName : 'System'} ({l.user ? l.user.username : 'cron'})
                      </td>
                      <td>
                        <span style={{ fontSize: '0.8rem', padding: '4px 10px', borderRadius: '4px', backgroundColor: 'var(--admin-bg-tertiary)', border: '1px solid var(--admin-border)', fontWeight: '600' }}>
                          {l.action}
                        </span>
                      </td>
                      <td style={{ whiteSpace: 'normal', minWidth: '250px' }}>{l.details}</td>
                      <td><code>{l.ipAddress || '-'}</code></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Pagination */}
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

    </div>
  );
}
