import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('user' | 'admin' | 'guest_manager')[];
  redirectTo?: string;
  requireAuth?: boolean;
}

export function ProtectedRoute({ 
  children, 
  allowedRoles = ['user', 'admin'], 
  redirectTo = '/login',
  requireAuth = true 
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isLoading) return;

    // Redirect to login if authentication is required but user is not authenticated
    if (requireAuth && !isAuthenticated) {
      setLocation(redirectTo);
      return;
    }

    // Check role-based access if user is authenticated
    if (isAuthenticated && user && allowedRoles.length > 0) {
      if (!allowedRoles.includes(user.role)) {
        // Redirect based on user role
        if (user.role === 'guest_manager') {
          setLocation('/guest-manager');
        } else if (user.isAdmin || user.role === 'admin') {
          setLocation('/admin/dashboard');
        } else {
          setLocation('/dashboard');
        }
        return;
      }
    }
  }, [isAuthenticated, isLoading, redirectTo, requireAuth, setLocation, user?.role, user?.isAdmin, allowedRoles.join(',')]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-soft-white to-white flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-romantic-gold border-t-transparent rounded-full" />
      </div>
    );
  }

  // Don't render content if user doesn't have access
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  if (isAuthenticated && user && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}