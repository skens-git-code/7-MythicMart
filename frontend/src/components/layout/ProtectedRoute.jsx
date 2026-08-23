import React, { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ROUTES, toHashPath } from '../../utils/routes';

const ProtectedRoute = ({ children, roles }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const isAuthorized = isAuthenticated && (!roles?.length || roles.includes(user?.role));

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.hash = toHashPath(ROUTES.LOGIN);
    }
    if (!loading && isAuthenticated && !isAuthorized) {
      window.location.hash = toHashPath(ROUTES.DASHBOARD);
    }
  }, [loading, isAuthenticated, isAuthorized]);

  if (loading) {
    return (
      <div className="section-transition" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <div className="loading-spinner"></div>
        <span style={{ marginLeft: '1rem', color: 'var(--c-text-muted)' }}>Validating session...</span>
      </div>
    );
  }

  if (!isAuthenticated || !isAuthorized) {
    return null;
  }

  return children;
};

export default ProtectedRoute;
