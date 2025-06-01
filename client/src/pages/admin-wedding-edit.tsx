import { useLocation, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft,
  Edit,
  Trash2,
  Save,
  Users,
  Heart,
  Calendar,
  MapPin,
  Eye,
  Settings
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useState, useEffect } from "react";
import type { User, Wedding, Guest } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function AdminWeddingEdit() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const weddingUrl = params.weddingUrl;

  const [isAdmin, setIsAdmin] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [weddingData, setWeddingData] = useState<Wedding | null>(null);

  useEffect(() => {
    const adminStatus = localStorage.getItem('isAdmin');
    if (adminStatus !== 'true') {
      setLocation('/admin');
      return;
    }
    setIsAdmin(true);
  }, [setLocation]);

  // Fetch wedding details
  const { data: wedding, isLoading: weddingLoading } = useQuery({
    queryKey: ['/api/weddings/url', weddingUrl],
    enabled: isAdmin && !!weddingUrl,
  });

  // Fetch guests for this wedding
  const { data: guests, isLoading: guestsLoading } = useQuery({
    queryKey: ['/api/admin/guests', wedding?.id],
    enabled: isAdmin && !!wedding?.id,
  });

  // Update wedding mutation
  const updateWeddingMutation = useMutation({
    mutationFn: async (updates: Partial<Wedding>) => {
      return apiRequest(`/api/admin/weddings/${wedding.id}`, {
        method: 'PUT',
        body: updates,
      });
    },
    onSuccess: () => {
      toast({
        title: "Wedding Updated",
        description: "Wedding details have been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/weddings/url', weddingUrl] });
      setEditMode(false);
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update wedding details.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (wedding && !weddingData) {
      setWeddingData(wedding);
    }
  }, [wedding, weddingData]);

  const handleSave = () => {
    if (weddingData) {
      updateWeddingMutation.mutate(weddingData);
    }
  };

  const handleInputChange = (field: keyof Wedding, value: string) => {
    setWeddingData(prev => prev ? { ...prev, [field]: value } : null);
  };

  if (!isAdmin) {
    return null;
  }

  if (weddingLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#F8F1F1] to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4B08C] mx-auto mb-4"></div>
          <p className="text-[#2C3338]">Loading wedding details...</p>
        </div>
      </div>
    );
  }

  if (!wedding) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#F8F1F1] to-white flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold text-[#2C3338] mb-2">Wedding Not Found</h2>
            <p className="text-[#2C3338]/70 mb-4">The wedding you're looking for doesn't exist.</p>
            <Button onClick={() => setLocation('/admin/dashboard')} className="wedding-button">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F8F1F1] to-white">
      <header className="bg-white shadow-sm border-b border-[#D4B08C]/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => setLocation('/admin/dashboard')}
                className="border-gray-200"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-[#2C3338]">
                  Manage Wedding: {wedding.bride} & {wedding.groom}
                </h1>
                <p className="text-[#2C3338]/70">
                  {wedding.isPublic ? 'Public' : 'Private'} • {wedding.uniqueUrl}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => window.open(`/wedding/${wedding.uniqueUrl}`, '_blank')}
                className="border-gray-200"
              >
                <Eye className="w-4 h-4 mr-2" />
                View Site
              </Button>
              {editMode ? (
                <>
                  <Button
                    onClick={handleSave}
                    disabled={updateWeddingMutation.isPending}
                    className="wedding-button"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditMode(false);
                      setWeddingData(wedding);
                    }}
                    className="border-gray-200"
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => setEditMode(true)}
                  className="wedding-button"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Wedding
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <Tabs defaultValue="details" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Wedding Details</TabsTrigger>
            <TabsTrigger value="guests">Guest Management</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            <Card className="wedding-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-[#D4B08C]" />
                  Wedding Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[#2C3338] mb-2">
                        Bride's Name
                      </label>
                      {editMode ? (
                        <Input
                          value={weddingData?.bride || ''}
                          onChange={(e) => handleInputChange('bride', e.target.value)}
                          className="wedding-input"
                        />
                      ) : (
                        <p className="p-3 bg-gray-50 rounded-lg">{wedding.bride}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#2C3338] mb-2">
                        Groom's Name
                      </label>
                      {editMode ? (
                        <Input
                          value={weddingData?.groom || ''}
                          onChange={(e) => handleInputChange('groom', e.target.value)}
                          className="wedding-input"
                        />
                      ) : (
                        <p className="p-3 bg-gray-50 rounded-lg">{wedding.groom}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#2C3338] mb-2">
                        Wedding Date
                      </label>
                      {editMode ? (
                        <Input
                          type="date"
                          value={weddingData?.weddingDate?.split('T')[0] || ''}
                          onChange={(e) => handleInputChange('weddingDate', e.target.value)}
                          className="wedding-input"
                        />
                      ) : (
                        <p className="p-3 bg-gray-50 rounded-lg">
                          {new Date(wedding.weddingDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[#2C3338] mb-2">
                        Venue
                      </label>
                      {editMode ? (
                        <Input
                          value={weddingData?.venue || ''}
                          onChange={(e) => handleInputChange('venue', e.target.value)}
                          className="wedding-input"
                        />
                      ) : (
                        <p className="p-3 bg-gray-50 rounded-lg">{wedding.venue}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#2C3338] mb-2">
                        Venue Address
                      </label>
                      {editMode ? (
                        <Input
                          value={weddingData?.venueAddress || ''}
                          onChange={(e) => handleInputChange('venueAddress', e.target.value)}
                          className="wedding-input"
                        />
                      ) : (
                        <p className="p-3 bg-gray-50 rounded-lg">{wedding.venueAddress}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#2C3338] mb-2">
                        Privacy Status
                      </label>
                      {editMode ? (
                        <select
                          value={weddingData?.isPublic ? 'public' : 'private'}
                          onChange={(e) => handleInputChange('isPublic', e.target.value === 'public' ? 'true' : 'false')}
                          className="w-full p-3 border border-gray-200 rounded-lg bg-white"
                        >
                          <option value="public">Public</option>
                          <option value="private">Private</option>
                        </select>
                      ) : (
                        <p className="p-3 bg-gray-50 rounded-lg">
                          {wedding.isPublic ? 'Public' : 'Private'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="guests" className="space-y-6">
            <Card className="wedding-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-[#D4B08C]" />
                  Guest List ({guests?.length || 0} guests)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {guestsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4B08C] mx-auto mb-4"></div>
                    <p className="text-[#2C3338]/70">Loading guests...</p>
                  </div>
                ) : guests && guests.length > 0 ? (
                  <div className="space-y-3">
                    {guests.map((guest: Guest) => (
                      <div key={guest.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium text-[#2C3338]">{guest.name}</p>
                          <p className="text-sm text-[#2C3338]/70">{guest.email}</p>
                        </div>
                        <Badge variant={guest.rsvp === 'confirmed' ? 'default' : 'secondary'}>
                          {guest.rsvp || 'pending'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-[#2C3338]/70">
                    No guests added yet
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card className="wedding-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-[#D4B08C]" />
                  Wedding Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium text-[#2C3338]">Unique URL</h3>
                      <p className="text-sm text-[#2C3338]/70">Wedding website address</p>
                    </div>
                    <code className="bg-gray-100 px-3 py-1 rounded text-sm">
                      /wedding/{wedding.uniqueUrl}
                    </code>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium text-[#2C3338]">Template</h3>
                      <p className="text-sm text-[#2C3338]/70">Current design template</p>
                    </div>
                    <Badge variant="outline">{wedding.template || 'Default'}</Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium text-[#2C3338]">Created</h3>
                      <p className="text-sm text-[#2C3338]/70">Wedding creation date</p>
                    </div>
                    <span className="text-sm text-[#2C3338]/70">
                      {new Date(wedding.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}