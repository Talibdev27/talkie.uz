import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { RestrictedAdminDashboard } from "@/components/restricted-admin-dashboard";
import type { User } from "@shared/schema";

export default function RestrictedGuestManagerDashboard() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<User | null>(null);

  // Check user authentication and role
  const { data: currentUser, isLoading } = useQuery<User>({
    queryKey: ['/api/user/current'],
  });

  useEffect(() => {
    if (!isLoading && currentUser) {
      // Check if user has guest_manager role
      if (currentUser.role !== 'guest_manager') {
        // Redirect based on user role
        if (currentUser.isAdmin) {
          setLocation('/admin/dashboard');
        } else {
          setLocation('/dashboard');
        }
        return;
      }
      setUser(currentUser);
    } else if (!isLoading && !currentUser) {
      // Not authenticated, redirect to login
      setLocation('/login');
    }
  }, [currentUser, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading restricted dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'guest_manager') {
    return null; // Will redirect
  }

  return <RestrictedAdminDashboard user={user} />;
}