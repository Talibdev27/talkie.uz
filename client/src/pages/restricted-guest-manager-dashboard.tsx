import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { RestrictedAdminDashboard } from "@/components/restricted-admin-dashboard";
import type { User } from "@shared/schema";

export default function RestrictedGuestManagerDashboard() {
  const [, setLocation] = useLocation();
  const [hasRedirected, setHasRedirected] = useState(false);

  // Check if user is authenticated and has guest manager role
  const { data: currentUser, isLoading, error } = useQuery<User>({
    queryKey: ['/api/user/current'],
  });

  useEffect(() => {
    if (isLoading || hasRedirected) return;
    
    if (error || !currentUser) {
      // Redirect to login if not authenticated
      setHasRedirected(true);
      setLocation('/login');
      return;
    }

    if (currentUser.role !== 'guest_manager') {
      // Redirect regular users to user dashboard, admins to admin dashboard
      setHasRedirected(true);
      if (currentUser.isAdmin) {
        setLocation('/admin/dashboard');
      } else {
        setLocation('/dashboard');
      }
      return;
    }
  }, [currentUser, isLoading, error, setLocation, hasRedirected]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking access permissions...</p>
        </div>
      </div>
    );
  }

  if (error || !currentUser || currentUser.role !== 'guest_manager') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">You don't have permission to access this page.</p>
          <button
            onClick={() => setLocation('/login')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return <RestrictedAdminDashboard user={currentUser} />;
}