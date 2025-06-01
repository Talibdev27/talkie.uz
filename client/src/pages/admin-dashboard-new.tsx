import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, Calendar, Camera, MessageSquare, Settings,
  TrendingUp, Heart, MapPin, Mail, Shield, Search,
  Eye, Trash2, Edit, BarChart3, Globe, LogOut
} from "lucide-react";
import type { Wedding, User } from "@shared/schema";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [weddingToDelete, setWeddingToDelete] = useState<number | null>(null);
  const { toast } = useToast();

  // Check admin authentication
  useEffect(() => {
    const adminStatus = localStorage.getItem('isAdmin');
    if (adminStatus !== 'true') {
      setLocation('/system/auth');
      return;
    }
    setIsAdmin(true);
  }, [setLocation]);

  const { data: weddings, isLoading: weddingsLoading } = useQuery({
    queryKey: ['/api/admin/weddings'],
    enabled: isAdmin,
  });

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['/api/admin/users'],
    enabled: isAdmin,
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/admin/stats'],
    enabled: isAdmin,
  });

  // Delete wedding mutation
  const deleteWeddingMutation = useMutation({
    mutationFn: async (weddingId: number) => {
      const response = await fetch(`/api/admin/weddings/${weddingId}`, {
        method: 'DELETE',
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Wedding Deleted",
        description: "Wedding has been successfully deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/weddings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      setWeddingToDelete(null);
    },
    onError: () => {
      toast({
        title: "Delete Failed",
        description: "Failed to delete wedding.",
        variant: "destructive",
      });
    },
  });

  const handleDeleteWedding = (weddingId: number) => {
    if (confirm("Are you sure you want to delete this wedding? This action cannot be undone.")) {
      deleteWeddingMutation.mutate(weddingId);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('adminUser');
    setLocation('/');
  };

  if (!isAdmin) {
    return null; // Redirecting to login
  }

  const filteredWeddings = weddings?.filter((wedding: Wedding) => 
    wedding.bride.toLowerCase().includes(searchTerm.toLowerCase()) ||
    wedding.groom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    wedding.venue.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const filteredUsers = users?.filter((user: User) => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F8F1F1] to-white">
      <header className="bg-white shadow-sm border-b border-[#D4B08C]/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#D4B08C] rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-playfair font-bold text-[#2C3338]">
                  Admin Dashboard
                </h1>
                <p className="text-[#2C3338]/70">Wedding Platform Management</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="text-[#2C3338] border-[#2C3338] hover:bg-[#2C3338] hover:text-white"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* System Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="wedding-card">
            <CardContent className="p-6 text-center">
              <Globe className="h-8 w-8 text-[#D4B08C] mx-auto mb-2" />
              <p className="text-2xl font-bold text-[#2C3338]">{stats?.totalWeddings || 0}</p>
              <p className="text-[#2C3338]/70 text-sm">Total Weddings</p>
            </CardContent>
          </Card>
          
          <Card className="wedding-card">
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 text-[#89916B] mx-auto mb-2" />
              <p className="text-2xl font-bold text-[#2C3338]">{stats?.totalUsers || 0}</p>
              <p className="text-[#2C3338]/70 text-sm">Real Users</p>
              <p className="text-xs text-[#2C3338]/50">({stats?.guestUsers || 0} guest accounts)</p>
            </CardContent>
          </Card>
          
          <Card className="wedding-card">
            <CardContent className="p-6 text-center">
              <Heart className="h-8 w-8 text-[#D4B08C] mx-auto mb-2" />
              <p className="text-2xl font-bold text-[#2C3338]">{stats?.publicWeddings || 0}</p>
              <p className="text-[#2C3338]/70 text-sm">Public Weddings</p>
            </CardContent>
          </Card>
          
          <Card className="wedding-card">
            <CardContent className="p-6 text-center">
              <BarChart3 className="h-8 w-8 text-[#89916B] mx-auto mb-2" />
              <p className="text-2xl font-bold text-[#2C3338]">
                {weddings?.filter((w: Wedding) => 
                  new Date(w.weddingDate) > new Date()
                ).length || 0}
              </p>
              <p className="text-[#2C3338]/70 text-sm">Upcoming Weddings</p>
            </CardContent>
          </Card>
        </div>

        {/* Management Tabs */}
        <Tabs defaultValue="weddings" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="weddings">Wedding Management</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="create">Create Wedding</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Weddings Management */}
          <TabsContent value="weddings" className="space-y-6">
            <Card className="wedding-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-[#2C3338]">
                    <Globe className="h-5 w-5 text-[#D4B08C]" />
                    All Weddings
                  </CardTitle>
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Search weddings..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {weddingsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse flex space-x-4 p-4 border rounded-lg">
                        <div className="w-12 h-12 bg-gray-200 rounded"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredWeddings.map((wedding: Wedding) => (
                      <div key={wedding.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-[#D4B08C] rounded-full flex items-center justify-center">
                            <Heart className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-[#2C3338]">
                              {wedding.bride} & {wedding.groom}
                            </h3>
                            <p className="text-sm text-[#2C3338]/70">
                              {wedding.venue} • {new Date(wedding.weddingDate).toLocaleDateString()}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant={wedding.isPublic ? "default" : "secondary"}>
                                {wedding.isPublic ? 'Public' : 'Private'}
                              </Badge>
                              <span className="text-xs text-[#2C3338]/50">
                                /{wedding.uniqueUrl}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(`/wedding/${wedding.uniqueUrl}`, '_blank')}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(`/wedding/${wedding.uniqueUrl}`, '_blank')}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteWedding(wedding.id)}
                            disabled={deleteWeddingMutation.isPending}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {filteredWeddings.length === 0 && (
                      <div className="text-center py-8 text-[#2C3338]/70">
                        {searchTerm ? 'No weddings found matching your search.' : 'No weddings created yet.'}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Management */}
          <TabsContent value="users" className="space-y-6">
            <Card className="wedding-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-[#2C3338]">
                    <Users className="h-5 w-5 text-[#89916B]" />
                    All Users
                  </CardTitle>
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="animate-pulse flex space-x-4 p-4 border rounded-lg">
                        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredUsers.map((user: User) => (
                      <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-[#89916B] rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-[#2C3338]">{user.name}</h3>
                            <p className="text-sm text-[#2C3338]/70">{user.email}</p>
                            <p className="text-xs text-[#2C3338]/50">
                              Joined {new Date(user.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {weddings?.filter((w: Wedding) => w.userId === user.id).length || 0} weddings
                          </Badge>
                        </div>
                      </div>
                    ))}
                    {filteredUsers.length === 0 && (
                      <div className="text-center py-8 text-[#2C3338]/70">
                        {searchTerm ? 'No users found matching your search.' : 'No users registered yet.'}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="wedding-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[#2C3338]">
                    <BarChart3 className="h-5 w-5 text-[#D4B08C]" />
                    Wedding Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[#2C3338]/70">This Month</span>
                    <Badge className="bg-blue-100 text-blue-800">
                      {weddings?.filter((w: Wedding) => {
                        const weddingMonth = new Date(w.createdAt).getMonth();
                        const currentMonth = new Date().getMonth();
                        return weddingMonth === currentMonth;
                      }).length || 0} new
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#2C3338]/70">Public Weddings</span>
                    <Badge className="bg-green-100 text-green-800">
                      {Math.round(((weddings?.filter((w: Wedding) => w.isPublic).length || 0) / (weddings?.length || 1)) * 100)}%
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#2C3338]/70">Average per User</span>
                    <Badge className="bg-purple-100 text-purple-800">
                      {((weddings?.length || 0) / (users?.length || 1)).toFixed(1)}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="wedding-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[#2C3338]">
                    <Calendar className="h-5 w-5 text-[#89916B]" />
                    Upcoming Events
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {weddings?.filter((w: Wedding) => new Date(w.weddingDate) > new Date())
                    .sort((a: Wedding, b: Wedding) => new Date(a.weddingDate).getTime() - new Date(b.weddingDate).getTime())
                    .slice(0, 3)
                    .map((wedding: Wedding) => (
                      <div key={wedding.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-[#2C3338] text-sm">
                            {wedding.bride} & {wedding.groom}
                          </p>
                          <p className="text-xs text-[#2C3338]/70">
                            {new Date(wedding.weddingDate).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {Math.ceil((new Date(wedding.weddingDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                        </Badge>
                      </div>
                    )) || (
                    <div className="text-center py-4 text-[#2C3338]/70 text-sm">
                      No upcoming weddings
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Create Wedding Tab */}
          <TabsContent value="create" className="space-y-6">
            <Card className="wedding-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-[#D4B08C]" />
                  Create New Wedding
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[#2C3338] mb-2">
                        Select User
                      </label>
                      <select className="w-full p-3 border border-gray-200 rounded-lg bg-white">
                        <option value="">Choose a user...</option>
                        {users?.filter((u: User) => !u.email.includes('guest_')).map((user: User) => (
                          <option key={user.id} value={user.id}>
                            {user.name} ({user.email})
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-[#2C3338] mb-2">
                        Bride's Name
                      </label>
                      <Input placeholder="Enter bride's name" className="wedding-input" />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-[#2C3338] mb-2">
                        Groom's Name
                      </label>
                      <Input placeholder="Enter groom's name" className="wedding-input" />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-[#2C3338] mb-2">
                        Wedding Date
                      </label>
                      <Input type="date" className="wedding-input" />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[#2C3338] mb-2">
                        Venue
                      </label>
                      <Input placeholder="Wedding venue" className="wedding-input" />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-[#2C3338] mb-2">
                        Venue Address
                      </label>
                      <Input placeholder="Full venue address" className="wedding-input" />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-[#2C3338] mb-2">
                        Template
                      </label>
                      <select className="w-full p-3 border border-gray-200 rounded-lg bg-white">
                        <option value="gardenRomance">Garden Romance</option>
                        <option value="modernMinimal">Modern Minimal</option>
                        <option value="vintageChic">Vintage Chic</option>
                        <option value="beachBliss">Beach Bliss</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-[#2C3338] mb-2">
                        Love Story (Optional)
                      </label>
                      <textarea 
                        className="w-full p-3 border border-gray-200 rounded-lg bg-white resize-none" 
                        rows={3}
                        placeholder="Tell their love story..."
                      ></textarea>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex gap-4">
                  <Button className="wedding-button">
                    <Calendar className="w-4 h-4 mr-2" />
                    Create Wedding
                  </Button>
                  <Button variant="outline" className="border-gray-200">
                    Reset Form
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}