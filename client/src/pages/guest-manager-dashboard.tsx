import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, Calendar, Heart, MapPin, LogOut, Shield,
  UserCheck, UserX, Clock, UserPlus
} from "lucide-react";
import { EnhancedRSVPManager } from "@/components/enhanced-rsvp-manager";
import type { Wedding, Guest, User } from "@shared/schema";

export default function GuestManagerDashboard() {
  const [, setLocation] = useLocation();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedWeddingId, setSelectedWeddingId] = useState<number | null>(null);

  // Check guest manager authentication
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      setLocation('/auth');
      return;
    }
    
    const user = JSON.parse(userStr);
    if (user.role !== 'guest_manager') {
      setLocation('/dashboard');
      return;
    }
    
    setCurrentUser(user);
  }, [setLocation]);

  // Fetch weddings that this guest manager has access to
  const { data: accessibleWeddings = [], isLoading: weddingsLoading } = useQuery<Wedding[]>({
    queryKey: ['/api/guest-manager/weddings'],
    enabled: !!currentUser,
  });

  // Fetch guests for selected wedding
  const { data: guests = [], isLoading: guestsLoading } = useQuery<Guest[]>({
    queryKey: [`/api/weddings/${selectedWeddingId}/guests`],
    enabled: !!selectedWeddingId,
  });

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('isAdmin');
    setLocation('/auth');
  };

  const selectedWedding = accessibleWeddings.find(w => w.id === selectedWeddingId);

  if (!currentUser) {
    return null;
  }

  const confirmedGuests = guests.filter(g => g.rsvpStatus === 'confirmed').length;
  const pendingGuests = guests.filter(g => g.rsvpStatus === 'pending').length;
  const declinedGuests = guests.filter(g => g.rsvpStatus === 'declined').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F7FA] to-[#C3CFE2]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-[#D4B08C] mr-3" />
              <div>
                <h1 className="text-xl font-semibold text-[#2C3338]">Guest Manager</h1>
                <p className="text-sm text-gray-600">Welcome, {currentUser.name}</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {weddingsLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4B08C] mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading weddings...</p>
          </div>
        ) : accessibleWeddings.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No Wedding Access</h2>
              <p className="text-gray-600">
                You don't have access to any weddings yet. Contact your administrator to get assigned to wedding guest management.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Wedding Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Your Assigned Weddings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {accessibleWeddings.map((wedding) => (
                    <div
                      key={wedding.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedWeddingId === wedding.id
                          ? 'border-[#D4B08C] bg-[#D4B08C]/5'
                          : 'border-gray-200 hover:border-[#D4B08C]/50'
                      }`}
                      onClick={() => setSelectedWeddingId(wedding.id)}
                    >
                      <h3 className="font-semibold text-lg mb-2">
                        {wedding.bride} & {wedding.groom}
                      </h3>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {new Date(wedding.weddingDate).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {wedding.venue}
                        </div>
                      </div>
                      <Badge 
                        variant={selectedWeddingId === wedding.id ? "default" : "outline"}
                        className="mt-3"
                      >
                        {selectedWeddingId === wedding.id ? "Selected" : "Click to Select"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Guest Management for Selected Wedding */}
            {selectedWedding && (
              <>
                {/* Guest Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Users className="h-8 w-8 text-[#89916B] mx-auto mb-2" />
                      <p className="text-2xl font-bold text-[#2C3338]">{guests.length}</p>
                      <p className="text-[#2C3338]/70 text-sm">Total Guests</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6 text-center">
                      <UserCheck className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-[#2C3338]">{confirmedGuests}</p>
                      <p className="text-[#2C3338]/70 text-sm">Confirmed</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6 text-center">
                      <Clock className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-[#2C3338]">{pendingGuests}</p>
                      <p className="text-[#2C3338]/70 text-sm">Pending</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6 text-center">
                      <UserX className="h-8 w-8 text-red-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-[#2C3338]">{declinedGuests}</p>
                      <p className="text-[#2C3338]/70 text-sm">Declined</p>
                    </CardContent>
                  </Card>
                </div>

                {/* RSVP Manager */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UserPlus className="h-5 w-5" />
                      Guest Management - {selectedWedding.bride} & {selectedWedding.groom}
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                      Manage guest RSVPs and contact information. You have restricted access to guest management only.
                    </p>
                  </CardHeader>
                  <CardContent>
                    <EnhancedRSVPManager wedding={selectedWedding} />
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}