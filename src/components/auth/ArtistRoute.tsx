import React from 'react';
import ProtectedRoute from './ProtectedRoute';

interface ArtistRouteProps {
  children: React.ReactNode;
}

const ArtistRoute: React.FC<ArtistRouteProps> = ({ children }) => {
  return (
    <ProtectedRoute requiredRole="artist" requireAuth={true}>
      {children}
    </ProtectedRoute>
  );
};

export default ArtistRoute;
