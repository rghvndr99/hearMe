import { useState, useEffect, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

/**
 * Custom hook for authentication state management
 * @returns {Object} Auth state and methods
 */
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  /**
   * Load user from token
   */
  const loadUser = useCallback(async () => {
    const storedToken = localStorage.getItem('hm-token');
    
    if (!storedToken) {
      setLoading(false);
      return;
    }

    setToken(storedToken);

    try {
      const response = await fetch(`${API_URL}/api/users/me`, {
        headers: {
          'Authorization': `Bearer ${storedToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data?.user || data);
      } else {
        // Token is invalid
        localStorage.removeItem('hm-token');
        setToken(null);
      }
    } catch (error) {
      console.error('Error loading user:', error);
      localStorage.removeItem('hm-token');
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Login user
   */
  const login = useCallback((newToken, userData) => {
    localStorage.setItem('hm-token', newToken);
    try { sessionStorage.removeItem('hm-anon-token'); } catch {}
    setToken(newToken);
    setUser(userData);
  }, []);

  /**
   * Logout user
   */
  const logout = useCallback(() => {
    localStorage.removeItem('hm-token');
    try { sessionStorage.removeItem('hm-anon-token'); } catch {}
    try { Object.keys(localStorage).forEach((k) => { if (k && k.startsWith('hm-anon-usedMs-')) localStorage.removeItem(k); }); } catch {}
    try { window.dispatchEvent(new Event('hm-auth-changed')); } catch {}
    setToken(null);
    setUser(null);
  }, []);

  /**
   * Update user data
   */
  const updateUser = useCallback((userData) => {
    setUser(userData);
  }, []);

  /**
   * Check if user is authenticated
   */
  const isAuthenticated = useCallback(() => {
    return !!token && !!user;
  }, [token, user]);

  // Load user on mount
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return {
    user,
    token,
    loading,
    isAuthenticated: isAuthenticated(),
    login,
    logout,
    updateUser,
    loadUser,
  };
};

