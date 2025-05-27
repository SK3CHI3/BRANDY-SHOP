import React from 'react';
import ProtectedRoute from './ProtectedRoute';

interface AuthenticatedRouteProps {
  children: React.ReactNode;
}

const AuthenticatedRoute: React.FC<AuthenticatedRouteProps> = ({ children }) => {
  return (
    <ProtectedRoute requireAuth={true}>
      {children}
    </ProtectedRoute>
  );
};

export default AuthenticatedRoute;
