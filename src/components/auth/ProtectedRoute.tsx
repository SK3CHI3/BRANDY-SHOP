import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/lib/supabase';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Shield, Lock, UserX } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  requireAuth?: boolean;
  fallbackPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  requireAuth = true,
  fallbackPath = '/'
}) => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  // Show loading state while auth is being determined
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Verifying access...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Check if authentication is required
  if (requireAuth && !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if specific role is required
  if (requiredRole && (!profile || profile.role !== requiredRole)) {
    const getAccessDeniedContent = () => {
      switch (requiredRole) {
        case 'admin':
          return {
            icon: <Shield className="h-16 w-16 text-red-400 mx-auto mb-4" />,
            title: 'Administrator Access Required',
            description: 'This page is only accessible to administrators.',
            buttonText: 'Go to Dashboard',
            buttonPath: '/dashboard'
          };
        case 'artist':
          return {
            icon: <UserX className="h-16 w-16 text-purple-400 mx-auto mb-4" />,
            title: 'Artist Access Required',
            description: 'This page is only available for verified artists.',
            buttonText: 'Become an Artist',
            buttonPath: '/artists'
          };
        case 'customer':
          return {
            icon: <Lock className="h-16 w-16 text-blue-400 mx-auto mb-4" />,
            title: 'Customer Access Required',
            description: 'This page is only available for customers.',
            buttonText: 'Go to Marketplace',
            buttonPath: '/marketplace'
          };
        default:
          return {
            icon: <Lock className="h-16 w-16 text-gray-400 mx-auto mb-4" />,
            title: 'Access Denied',
            description: 'You do not have permission to access this page.',
            buttonText: 'Go Home',
            buttonPath: '/'
          };
      }
    };

    const content = getAccessDeniedContent();

    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md mx-auto px-4">
            {content.icon}
            <h1 className="text-2xl font-bold text-gray-900 mb-4">{content.title}</h1>
            <p className="text-gray-600 mb-6">{content.description}</p>
            {user && profile && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  Current role: <span className="font-semibold">{profile.role}</span>
                </p>
              </div>
            )}
            <Button 
              onClick={() => window.location.href = content.buttonPath}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {content.buttonText}
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // If all checks pass, render the protected content
  return <>{children}</>;
};

export default ProtectedRoute;
