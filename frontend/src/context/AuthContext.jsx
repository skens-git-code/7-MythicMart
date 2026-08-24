import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { STORAGE_KEYS } from '../utils/constants';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleLogout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    setUser(null);
    setError(null);
  }, []);

  const updateUser = useCallback((updates) => {
    setUser((current) => (current ? { ...current, ...updates } : current));
  }, []);

  // Initialize session
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      if (token) {
        try {
          const response = await api.get('/auth/me');
          if (response.success) {
            setUser(response.data);
          } else {
            handleLogout();
          }
        } catch (err) {
          console.error('Session validation failed:', err);
          handleLogout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, [handleLogout]);

  const handleLogin = async (email, password) => {
    try {
      setError(null);
      const response = await api.post('/auth/login', { email, password });
      if (response.success && response.data.token) {
        localStorage.setItem(STORAGE_KEYS.TOKEN, response.data.token);
        setUser(response.data.user);
        return { success: true };
      }
      return { success: false, error: 'Login failed unexpectedly.' };
    } catch (err) {
      const msg = err.error === 'Database is temporarily unavailable'
        ? 'The account service is unavailable because the database is offline. Start MongoDB and try again.'
        : err.error || err.message || 'Login failed';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  const handleRegister = async (name, email, password) => {
    try {
      setError(null);
      const response = await api.post('/auth/register', { name, email, password });
      if (response.success && response.data.token) {
        localStorage.setItem(STORAGE_KEYS.TOKEN, response.data.token);
        setUser(response.data.user);
        return { success: true };
      }
      return { success: false, error: 'Registration failed unexpectedly.' };
    } catch (err) {
      const msg = err.error === 'Database is temporarily unavailable'
        ? 'The account service is unavailable because the database is offline. Start MongoDB and try again.'
        : err.error || err.message || 'Registration failed';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        error,
        login: handleLogin,
        register: handleRegister,
        logout: handleLogout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
