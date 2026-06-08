import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper to make API requests with automatic JWT bearer token injection and token refresh on expiry
  const apiRequest = useCallback(async (url, options = {}) => {
    let currentToken = token;
    
    // Inject auth header if token exists
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    
    if (currentToken) {
      headers['Authorization'] = `Bearer ${currentToken}`;
    }

    let response = await fetch(url, { ...options, headers });

    // Handle token expiration
    if (response.status === 401) {
      try {
        // Try to refresh token
        const refreshResponse = await fetch('/api/auth/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });

        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          setToken(data.accessToken);
          currentToken = data.accessToken;

          // Retry the request with new token
          headers['Authorization'] = `Bearer ${currentToken}`;
          response = await fetch(url, { ...options, headers });
        } else {
          // Refresh token expired or invalid, log out
          setUser(null);
          setToken(null);
        }
      } catch (err) {
        console.error('Failed to refresh session:', err);
        setUser(null);
        setToken(null);
      }
    }

    return response;
  }, [token]);

  // Check session on load
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Attempt to refresh token directly
        const refreshResponse = await fetch('/api/auth/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });

        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          setToken(data.accessToken);
          
          // Fetch user profile
          const profileResponse = await fetch('/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${data.accessToken}`,
              'Content-Type': 'application/json'
            }
          });

          if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            setUser(profileData.user);
          }
        }
      } catch (err) {
        console.warn('Silent login check skipped or offline:', err);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = async (username, password) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      let data = null;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      }

      if (!response.ok) {
        throw new Error(data?.message || `Failed to connect to the server (Status: ${response.status})`);
      }

      if (!data) {
        throw new Error('Invalid server response format');
      }

      setToken(data.accessToken);
      setUser(data.user);
      return data.user;
    } catch (err) {
      if (err.message === 'Failed to fetch') {
        throw new Error('Failed to connect to backend server. Please make sure the backend is running.');
      }
      throw err;
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (err) {
      console.error('Error logging out on server:', err);
    } finally {
      setUser(null);
      setToken(null);
    }
  };

  const hasPermission = (permission) => {
    if (!user) return false;
    if (user.role === 'Admin') return true;
    return user.permissions.includes(permission);
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    hasPermission,
    apiRequest,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
