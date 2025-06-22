import { useLocation, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  Settings,
  Camera
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
  const { data: wedding, isLoading: weddingLoading } = useQuery<Wedding>({
    queryKey: [`/api/weddings/url/${weddingUrl}`],
    enabled: isAdmin && !!weddingUrl,
    queryFn: () => apiRequest('GET', `/api/weddings/url/${weddingUrl}`).then(res => res.json())
  });

  // Fetch guests for this wedding
  const { data: guests, isLoading: guestsLoading } = useQuery<Guest[]>({
    queryKey: ['/api/admin/guests', wedding?.id],
    enabled: isAdmin && !!wedding?.id,
    queryFn: () => apiRequest('GET', `/api/admin/guests?weddingId=${wedding?.id}`).then(res => res.json())
  });

  // Fetch photos for this wedding
  const { data: photos, isLoading: photosLoading } = useQuery<any[]>({
    queryKey: [`/api/photos/wedding/${wedding?.id}`],
    enabled: isAdmin && !!wedding?.id,
    queryFn: () => apiRequest('GET', `/api/photos/wedding/${wedding?.id}`).then(res => res.json())
  });

  // Update wedding mutation
  const updateWeddingMutation = useMutation({
    mutationFn: async (updates: Partial<Wedding>) => {
      // Filter out non-updatable fields
      const { id, userId, uniqueUrl, createdAt, ...updateData } = updates;
      
      // Convert date string back to Date object if it exists
      if (updateData.weddingDate && typeof updateData.weddingDate === 'string') {
        updateData.weddingDate = new Date(updateData.weddingDate);
      }
      
      console.log('Updating wedding with filtered data:', updateData);
      console.log('Wedding ID:', wedding?.id);
      
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/weddings/${wedding?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update wedding: ${response.statusText}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Wedding Updated",
        description: "Wedding details have been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/weddings/url/${weddingUrl}`] });
      setEditMode(false);
    },
    onError: (error: any) => {
      console.error('Wedding update error:', error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update wedding details.",
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

  // Photo management mutations
  const deletePhotoMutation = useMutation({
    mutationFn: async (photoId: number) => {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/photos/${photoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Photo Deleted",
        description: "Photo has been successfully deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/photos/wedding', wedding?.id] });
    },
    onError: () => {
      toast({
        title: "Delete Failed",
        description: "Failed to delete photo.",
        variant: "destructive",
      });
    },
  });

  const addPhotoMutation = useMutation({
    mutationFn: async (photoData: any) => {
      const response = await fetch('/api/photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(photoData),
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Photo Added",
        description: "Photo has been successfully added.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/photos/wedding', wedding?.id] });
    },
    onError: () => {
      toast({
        title: "Upload Failed",
        description: "Failed to add photo.",
        variant: "destructive",
      });
    },
  });

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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">Wedding Details</TabsTrigger>
            <TabsTrigger value="photos">Photo Management</TabsTrigger>
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
                          value={weddingData?.weddingDate ? new Date(weddingData.weddingDate).toISOString().split('T')[0] : ''}
                          onChange={(e) => handleInputChange('weddingDate', e.target.value)}
                          className="wedding-input"
                        />
                      ) : (
                        <p className="p-3 bg-gray-50 rounded-lg">
                          {wedding.weddingDate ? new Date(wedding.weddingDate).toLocaleDateString() : 'No date set'}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#2C3338] mb-2">
                        Ceremony Time
                      </label>
                      {editMode ? (
                        <Input
                          value={weddingData?.weddingTime || ''}
                          onChange={(e) => handleInputChange('weddingTime', e.target.value)}
                          className="wedding-input"
                          placeholder="e.g., 4:00 PM, 16:00, 2:30 PM"
                        />
                      ) : (
                        <p className="p-3 bg-gray-50 rounded-lg">
                          {wedding.weddingTime || '4:00 PM'}
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
                          placeholder="Full venue address"
                        />
                      ) : (
                        <p className="p-3 bg-gray-50 rounded-lg">{wedding.venueAddress}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#2C3338] mb-2">
                        Map Pin URL (Optional)
                      </label>
                      <p className="text-sm text-gray-600 mb-3">
                        Custom map link for the "Show on Map" button. If empty, will use venue address.
                      </p>
                      {editMode ? (
                        <Input
                          value={weddingData?.mapPinUrl || ''}
                          onChange={(e) => handleInputChange('mapPinUrl', e.target.value)}
                          className="wedding-input"
                          placeholder="https://maps.app.goo.gl/example or Google Maps URL"
                        />
                      ) : (
                        <p className="p-3 bg-gray-50 rounded-lg">
                          {wedding.mapPinUrl || 'Not set - using venue address'}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#2C3338] mb-2">
                        Template
                      </label>
                      {editMode ? (
                        <select
                          value={weddingData?.template || 'standard'}
                          onChange={(e) => handleInputChange('template', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="standard">Standard</option>
                          <option value="modern">Modern</option>
                          <option value="classic">Classic</option>
                          <option value="epic">Epic</option>
                        </select>
                      ) : (
                        <p className="p-3 bg-gray-50 rounded-lg capitalize">{wedding.template}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#2C3338] mb-2">
                        Default Language
                      </label>
                      {editMode ? (
                        <select
                          value={weddingData?.defaultLanguage || 'uz'}
                          onChange={(e) => handleInputChange('defaultLanguage', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="en">English</option>
                          <option value="ru">Russian</option>
                          <option value="uz">O'zbekcha</option>
                        </select>
                      ) : (
                        <p className="p-3 bg-gray-50 rounded-lg capitalize">{wedding.defaultLanguage}</p>
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

                {/* Love Story Section */}
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-[#2C3338] mb-4 flex items-center gap-2">
                    <Heart className="h-5 w-5 text-[#D4B08C]" />
                    Dear Guest Message
                  </h3>
                  <div>
                    <label className="block text-sm font-medium text-[#2C3338] mb-2">
                      Welcome Message for Guests
                    </label>
                    <p className="text-sm text-gray-600 mb-3">
                      This message will appear in the 'Dear Guests' section of the wedding website.
                    </p>
                    {editMode ? (
                      <Textarea
                        value={weddingData?.dearGuestMessage || ''}
                        onChange={(e) => handleInputChange('dearGuestMessage', e.target.value)}
                        className="wedding-input min-h-[120px]"
                        placeholder="Write a welcome message for your guests..."
                      />
                    ) : (
                      <div className="p-4 bg-gray-50 rounded-lg min-h-[120px]">
                        {wedding.dearGuestMessage ? (
                          <p className="text-gray-800 leading-relaxed">{wedding.dearGuestMessage}</p>
                        ) : (
                          <p className="text-gray-500 italic">No dear guest message added yet.</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-[#2C3338] mb-4 flex items-center gap-2">
                    <Heart className="h-5 w-5 text-[#D4B08C]" />
                    Love Story
                  </h3>
                  <div>
                    <label className="block text-sm font-medium text-[#2C3338] mb-2">
                      Your Love Story (Optional)
                    </label>
                    <p className="text-sm text-gray-600 mb-3">
                      Tell your unique love story. If left empty, the website will show a beautiful photo layout instead.
                    </p>
                    {editMode ? (
                      <Textarea
                        value={weddingData?.story || ''}
                        onChange={(e) => handleInputChange('story', e.target.value)}
                        className="wedding-input min-h-[120px]"
                        placeholder="Write your love story here... How did you meet? What makes your relationship special?"
                      />
                    ) : (
                      <div className="p-4 bg-gray-50 rounded-lg min-h-[120px]">
                        {wedding.story ? (
                          <p className="text-gray-800 leading-relaxed">{wedding.story}</p>
                        ) : (
                          <p className="text-gray-500 italic">No love story added yet. The website will display a beautiful photo layout.</p>
                        )}
                      </div>
                    )}
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
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <th className="p-3 text-left">Name</th>
                      <th className="p-3 text-left">Email</th>
                      <th className="p-3 text-left">Status</th>
                      <th className="p-3 text-left">Message</th>
                      <th className="p-3 text-left">Responded At</th>
                    </div>
                    <tbody>
                      {guests.map(guest => (
                        <tr key={guest.id} className="border-b border-gray-200">
                          <td className="p-3">{guest.name}</td>
                          <td className="p-3">{guest.email || '-'}</td>
                          <td className="p-3">
                            <Badge 
                              variant={
                                guest.rsvpStatus === 'confirmed' ? 'default' :
                                guest.rsvpStatus === 'declined' ? 'destructive' : 'secondary'
                              }
                              className="capitalize"
                            >
                              {guest.rsvpStatus}
                            </Badge>
                          </td>
                          <td className="p-3">{guest.message || '-'}</td>
                          <td className="p-3">
                            {guest.respondedAt ? new Date(guest.respondedAt).toLocaleString() : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </div>
                ) : (
                  <div className="text-center py-8 text-[#2C3338]/70">
                    No guests added yet
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="photos" className="space-y-6">
            <Card className="wedding-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5 text-[#D4B08C]" />
                  Photo Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                {photosLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4B08C] mx-auto mb-4"></div>
                    <p className="text-[#2C3338]/70">Loading photos...</p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {/* Couple Photo Section */}
                    <div>
                      <h3 className="font-semibold text-[#2C3338] mb-4 flex items-center gap-2">
                        <Heart className="h-4 w-4" />
                        Couple Photo (How We Met Section)
                      </h3>
                      
                      {/* Upload Section for Couple Photo */}
                      <div className="mb-4 p-4 border-2 border-dashed border-gray-300 rounded-lg">
                        <div className="text-center">
                          <Heart className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                          <h4 className="font-medium text-gray-700 mb-2">Upload Couple Photo</h4>
                          <p className="text-sm text-gray-500 mb-3">This photo will appear next to the "How We Met" section</p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const formData = new FormData();
                                formData.append('photo', file);
                                formData.append('photoType', 'couple');
                                formData.append('weddingId', wedding?.id?.toString() || '');
                                
                                // Upload photo
                                fetch('/api/photos/upload', {
                                  method: 'POST',
                                  body: formData,
                                }).then(() => {
                                  queryClient.invalidateQueries({ queryKey: ['/api/photos/wedding', wedding?.id] });
                                });
                              }
                            }}
                            className="hidden"
                            id="couple-photo-upload"
                          />
                          <label
                            htmlFor="couple-photo-upload"
                            className="inline-flex items-center px-4 py-2 bg-[#D4B08C] text-white rounded-lg hover:bg-[#C19B75] cursor-pointer"
                          >
                            <Camera className="h-4 w-4 mr-2" />
                            Choose Couple Photo
                          </label>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {photos && photos.filter((photo: any) => photo.photoType === 'couple').length > 0 ? (
                          photos.filter((photo: any) => photo.photoType === 'couple').map((photo: any) => (
                            <div key={photo.id} className="border rounded-lg p-4 space-y-3">
                              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                                <img 
                                  src={photo.url} 
                                  alt={photo.caption || "Couple photo"}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="space-y-2">
                                {photo.caption && (
                                  <p className="text-sm text-gray-600">{photo.caption}</p>
                                )}
                                <div className="flex justify-between items-center">
                                  <span className="text-xs text-gray-500">
                                    {new Date(photo.uploadedAt).toLocaleDateString()}
                                  </span>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => deletePhotoMutation.mutate(photo.id)}
                                    disabled={deletePhotoMutation.isPending}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="col-span-2 text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                            <Heart className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                            <p>No couple photo uploaded yet</p>
                            <p className="text-sm text-gray-400 mt-1">This photo will appear next to the "How We Met" section</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Memory Photos Section */}
                    <div>
                      <h3 className="font-semibold text-[#2C3338] mb-4 flex items-center gap-2">
                        <Camera className="h-4 w-4" />
                        Our Memories Gallery
                      </h3>
                      
                      {/* Upload Section for Memory Photos */}
                      <div className="mb-4 p-4 border-2 border-dashed border-gray-300 rounded-lg">
                        <div className="text-center">
                          <Camera className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                          <h4 className="font-medium text-gray-700 mb-2">Upload Memory Photos</h4>
                          <p className="text-sm text-gray-500 mb-3">These photos will appear in the "Our Memories" gallery section</p>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) => {
                              const files = Array.from(e.target.files || []);
                              files.forEach(file => {
                                const formData = new FormData();
                                formData.append('photo', file);
                                formData.append('photoType', 'memory');
                                formData.append('weddingId', wedding?.id?.toString() || '');
                                
                                // Upload photo
                                fetch('/api/photos/upload', {
                                  method: 'POST',
                                  body: formData,
                                }).then(() => {
                                  queryClient.invalidateQueries({ queryKey: ['/api/photos/wedding', wedding?.id] });
                                });
                              });
                            }}
                            className="hidden"
                            id="memory-photos-upload"
                          />
                          <label
                            htmlFor="memory-photos-upload"
                            className="inline-flex items-center px-4 py-2 bg-[#D4B08C] text-white rounded-lg hover:bg-[#C19B75] cursor-pointer"
                          >
                            <Camera className="h-4 w-4 mr-2" />
                            Choose Memory Photos
                          </label>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {photos && photos.filter((photo: any) => photo.photoType === 'memory').length > 0 ? (
                          photos.filter((photo: any) => photo.photoType === 'memory').map((photo: any) => (
                            <div key={photo.id} className="border rounded-lg p-3 space-y-2">
                              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                                <img 
                                  src={photo.url} 
                                  alt={photo.caption || "Memory photo"}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="space-y-1">
                                {photo.caption && (
                                  <p className="text-xs text-gray-600 truncate">{photo.caption}</p>
                                )}
                                <div className="flex justify-between items-center">
                                  <span className="text-xs text-gray-500">
                                    {new Date(photo.uploadedAt).toLocaleDateString()}
                                  </span>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => deletePhotoMutation.mutate(photo.id)}
                                    disabled={deletePhotoMutation.isPending}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="col-span-4 text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                            <Camera className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                            <p>No memory photos uploaded yet</p>
                            <p className="text-sm text-gray-400 mt-1">These photos will appear in the "Our Memories" gallery section</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Photo Statistics */}
                    {photos && photos.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t">
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Heart className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-700">Couple Photos</span>
                          </div>
                          <p className="text-2xl font-bold text-blue-600 mt-1">
                            {photos.filter((photo: any) => photo.photoType === 'couple').length}
                          </p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Camera className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium text-green-700">Memory Photos</span>
                          </div>
                          <p className="text-2xl font-bold text-green-600 mt-1">
                            {photos.filter((photo: any) => photo.photoType === 'memory').length}
                          </p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Camera className="h-4 w-4 text-purple-600" />
                            <span className="text-sm font-medium text-purple-700">Total Photos</span>
                          </div>
                          <p className="text-2xl font-bold text-purple-600 mt-1">
                            {photos.length}
                          </p>
                        </div>
                      </div>
                    )}
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