import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Permission } from '../types';

interface ProtectedRouteProps {
  children: ReactNode;
  permission?: Permission;
  adminOnly?: boolean;
}

const ProtectedRoute = ({ children, permission, adminOnly }: ProtectedRouteProps) => {
  const { user, loading, hasPermission } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/access-denied" replace />;
  }

  if (permission && !hasPermission(permission)) {
    return <Navigate to="/access-denied" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
