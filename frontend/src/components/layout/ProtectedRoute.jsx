import React, { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ROUTES, toHashPath } from '../../utils/routes';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.hash = toHashPath(ROUTES.LOGIN);
    }
  }, [loading, isAuthenticated]);

  if (loading) {
    return (
      <div className="section-transition" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <div className="loading-spinner"></div>
        <span style={{ marginLeft: '1rem', color: 'var(--c-text-muted)' }}>Validating session...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return children;
};

export default ProtectedRoute;
