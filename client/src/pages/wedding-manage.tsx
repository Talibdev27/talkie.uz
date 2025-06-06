import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useParams, useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { formatDate } from '@/lib/utils';
import { ArrowLeft, Save, Eye, Edit, Camera, Heart, Settings, Calendar, MapPin, Trash2, Users, ExternalLink } from 'lucide-react';
import type { Wedding, Photo, Guest } from '@shared/schema';

export default function WeddingManage() {
  const { t } = useTranslation();
  const params = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const weddingUrl = params.uniqueUrl as string;
  
  const [editMode, setEditMode] = useState(false);
  const [weddingData, setWeddingData] = useState<Wedding | null>(null);

  // Check if user is logged in and owns this wedding
  const { data: currentUser } = useQuery({
    queryKey: ['/api/user/current'],
    queryFn: () => fetch('/api/user/current').then(res => res.json()),
  });

  // Fetch wedding details
  const { data: wedding, isLoading: weddingLoading } = useQuery<Wedding>({
    queryKey: [`/api/weddings/url/${weddingUrl}`],
    enabled: !!weddingUrl,
  });

  // Fetch photos for this wedding
  const { data: photos, isLoading: photosLoading } = useQuery({
    queryKey: [`/api/photos/wedding/${wedding?.id}`],
    enabled: !!wedding?.id,
  });

  // Fetch guests for this wedding
  const { data: guests, isLoading: guestsLoading } = useQuery<Guest[]>({
    queryKey: [`/api/guests/wedding/${wedding?.id}`],
    enabled: !!wedding?.id,
  });

  // Update wedding mutation
  const updateWeddingMutation = useMutation({
    mutationFn: async (updates: Partial<Wedding>) => {
      // Filter out non-updatable fields
      const { id, userId, uniqueUrl, createdAt, ...updateData } = updates;
      
      // Convert date string back to Date object if needed
      if (updateData.weddingDate && typeof updateData.weddingDate === 'string') {
        updateData.weddingDate = new Date(updateData.weddingDate);
      }
      
      const response = await apiRequest('PUT', `/api/weddings/${wedding?.id}`, updateData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Wedding Updated",
        description: "Your wedding details have been successfully updated.",
      });
      setEditMode(false);
      queryClient.invalidateQueries({ queryKey: [`/api/weddings/url/${weddingUrl}`] });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: "Failed to update wedding details. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete photo mutation
  const deletePhotoMutation = useMutation({
    mutationFn: async (photoId: number) => {
      const response = await apiRequest('DELETE', `/api/photos/${photoId}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Photo Deleted",
        description: "Photo has been successfully deleted.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/photos/wedding/${wedding?.id}`] });
    },
    onError: () => {
      toast({
        title: "Delete Failed",
        description: "Failed to delete photo. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    if (weddingData) {
      updateWeddingMutation.mutate(weddingData);
    }
  };

  // Initialize wedding data when wedding is loaded
  if (wedding && !weddingData) {
    setWeddingData(wedding);
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
            <p className="text-[#2C3338]/70 mb-4">The wedding you're looking for doesn't exist or you don't have access to manage it.</p>
            <Button onClick={() => setLocation('/dashboard')} className="wedding-button">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if current user owns this wedding
  if (currentUser && wedding.userId !== currentUser.id) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#F8F1F1] to-white flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold text-[#2C3338] mb-2">Access Denied</h2>
            <p className="text-[#2C3338]/70 mb-4">You don't have permission to manage this wedding.</p>
            <Button onClick={() => setLocation('/dashboard')} className="wedding-button">
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
                onClick={() => setLocation('/dashboard')}
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

      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs defaultValue="details" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-3">
            <TabsTrigger value="details">Wedding Details</TabsTrigger>
            <TabsTrigger value="guests">Guest Management</TabsTrigger>
            <TabsTrigger value="photos">Photo Management</TabsTrigger>
          </TabsList>

          {/* Wedding Details Tab */}
          <TabsContent value="details" className="space-y-6">
            <Card className="wedding-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-[#D4B08C]" />
                  Wedding Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="bride">Bride's Name</Label>
                    <Input
                      id="bride"
                      value={weddingData?.bride || ''}
                      onChange={(e) => setWeddingData(prev => prev ? {...prev, bride: e.target.value} : null)}
                      disabled={!editMode}
                      className="wedding-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="groom">Groom's Name</Label>
                    <Input
                      id="groom"
                      value={weddingData?.groom || ''}
                      onChange={(e) => setWeddingData(prev => prev ? {...prev, groom: e.target.value} : null)}
                      disabled={!editMode}
                      className="wedding-input"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weddingDate">Wedding Date</Label>
                  <Input
                    id="weddingDate"
                    type="date"
                    value={weddingData?.weddingDate ? new Date(weddingData.weddingDate).toISOString().split('T')[0] : ''}
                    onChange={(e) => setWeddingData(prev => prev ? {...prev, weddingDate: new Date(e.target.value)} : null)}
                    disabled={!editMode}
                    className="wedding-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weddingTime">Ceremony Time</Label>
                  <Input
                    id="weddingTime"
                    value={weddingData?.weddingTime || ''}
                    onChange={(e) => setWeddingData(prev => prev ? {...prev, weddingTime: e.target.value} : null)}
                    disabled={!editMode}
                    className="wedding-input"
                    placeholder="e.g., 4:00 PM, 16:00, 2:30 PM"
                  />
                </div>

                {/* Guest Welcome Message */}
                <div className="space-y-2">
                  <Label htmlFor="welcomeMessage">Guest Welcome Message (Optional)</Label>
                  <Textarea
                    id="welcomeMessage"
                    value={weddingData?.welcomeMessage || ''}
                    onChange={(e) => setWeddingData(prev => prev ? {...prev, welcomeMessage: e.target.value} : null)}
                    disabled={!editMode}
                    className="wedding-input min-h-[100px]"
                    placeholder="Write a special welcome message for your guests..."
                  />
                  <p className="text-sm text-gray-500">
                    This message will appear as a formal invitation section on your wedding website.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="venue">Venue</Label>
                    <Input
                      id="venue"
                      value={weddingData?.venue || ''}
                      onChange={(e) => setWeddingData(prev => prev ? {...prev, venue: e.target.value} : null)}
                      disabled={!editMode}
                      className="wedding-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="venueAddress">Venue Address</Label>
                    <Input
                      id="venueAddress"
                      value={weddingData?.venueAddress || ''}
                      onChange={(e) => setWeddingData(prev => prev ? {...prev, venueAddress: e.target.value} : null)}
                      disabled={!editMode}
                      className="wedding-input"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="story">Your Love Story</Label>
                  <Textarea
                    id="story"
                    value={weddingData?.story || ''}
                    onChange={(e) => setWeddingData(prev => prev ? {...prev, story: e.target.value} : null)}
                    disabled={!editMode}
                    className="wedding-input min-h-[100px]"
                    placeholder="Tell your love story..."
                  />
                </div>

                <div className="flex items-center gap-4">
                  <Label>Visibility:</Label>
                  <Badge variant={weddingData?.isPublic ? "default" : "secondary"}>
                    {weddingData?.isPublic ? 'Public' : 'Private'}
                  </Badge>
                  {editMode && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setWeddingData(prev => prev ? {...prev, isPublic: !prev.isPublic} : null)}
                    >
                      Toggle Visibility
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Guest Management Tab */}
          <TabsContent value="guests" className="space-y-6">
            <Card className="wedding-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-[#D4B08C]" />
                  Guest Management & RSVP Tracking
                </CardTitle>
                <CardDescription>
                  Manage your wedding guests, track real-time RSVPs, and view guest messages
                </CardDescription>
              </CardHeader>
              <CardContent>
                {guestsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4B08C] mx-auto mb-4"></div>
                    <p className="text-[#2C3338]/70">Loading guest information...</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Enhanced Guest Statistics */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200 hover:bg-green-100 transition-colors">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-2xl font-bold text-green-600">
                              {guests?.filter(guest => guest.rsvpStatus === 'confirmed').length || 0}
                            </div>
                            <div className="text-sm text-green-700 font-medium">Confirmed</div>
                          </div>
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        </div>
                        <div className="text-xs text-green-600 mt-1">
                          {guests?.length ? Math.round((guests.filter(g => g.rsvpStatus === 'confirmed').length / guests.length) * 100) : 0}% of total
                        </div>
                      </div>
                      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 hover:bg-yellow-100 transition-colors">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-2xl font-bold text-yellow-600">
                              {guests?.filter(guest => guest.rsvpStatus === 'pending').length || 0}
                            </div>
                            <div className="text-sm text-yellow-700 font-medium">Pending</div>
                          </div>
                          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        </div>
                        <div className="text-xs text-yellow-600 mt-1">Awaiting response</div>
                      </div>
                      <div className="bg-red-50 p-4 rounded-lg border border-red-200 hover:bg-red-100 transition-colors">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-2xl font-bold text-red-600">
                              {guests?.filter(guest => guest.rsvpStatus === 'declined').length || 0}
                            </div>
                            <div className="text-sm text-red-700 font-medium">Declined</div>
                          </div>
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        </div>
                        <div className="text-xs text-red-600 mt-1">Cannot attend</div>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-2xl font-bold text-blue-600">
                              {guests?.length || 0}
                            </div>
                            <div className="text-sm text-blue-700 font-medium">Total Guests</div>
                          </div>
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        </div>
                        <div className="text-xs text-blue-600 mt-1">
                          {guests?.reduce((acc, guest) => acc + (guest.additionalGuests || 0) + 1, 0) || 0} total attendees
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {guests && guests.length > 0 && (
                      <div className="bg-gray-100 rounded-full p-1">
                        <div className="flex h-4 rounded-full overflow-hidden">
                          <div 
                            className="bg-green-500 transition-all duration-500"
                            style={{ 
                              width: `${(guests.filter(g => g.rsvpStatus === 'confirmed').length / guests.length) * 100}%` 
                            }}
                          ></div>
                          <div 
                            className="bg-red-500 transition-all duration-500"
                            style={{ 
                              width: `${(guests.filter(g => g.rsvpStatus === 'declined').length / guests.length) * 100}%` 
                            }}
                          ></div>
                          <div 
                            className="bg-yellow-500 transition-all duration-500"
                            style={{ 
                              width: `${(guests.filter(g => g.rsvpStatus === 'pending').length / guests.length) * 100}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Guest List */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-[#2C3338]">Guest List</h3>
                        <div className="flex gap-2">
                          <select 
                            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                            defaultValue="all"
                          >
                            <option value="all">All Guests</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="pending">Pending</option>
                            <option value="declined">Declined</option>
                            <option value="maybe">Maybe</option>
                          </select>
                        </div>
                      </div>

                      {guests && guests.length > 0 ? (
                        <div className="space-y-3">
                          {guests.map((guest) => (
                            <div key={guest.id} className="bg-white border border-gray-200 rounded-lg p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3">
                                    <div className="flex-1">
                                      <h4 className="font-medium text-[#2C3338]">{guest.name}</h4>
                                      {guest.email && (
                                        <p className="text-sm text-gray-600">{guest.email}</p>
                                      )}
                                      {guest.phone && (
                                        <p className="text-sm text-gray-600">{guest.phone}</p>
                                      )}
                                    </div>
                                    <div className="text-right">
                                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        guest.rsvpStatus === 'confirmed' 
                                          ? 'bg-green-100 text-green-800'
                                          : guest.rsvpStatus === 'declined'
                                          ? 'bg-red-100 text-red-800'
                                          : guest.rsvpStatus === 'maybe'
                                          ? 'bg-blue-100 text-blue-800'
                                          : 'bg-yellow-100 text-yellow-800'
                                      }`}>
                                        {guest.rsvpStatus === 'confirmed' && 'Confirmed'}
                                        {guest.rsvpStatus === 'declined' && 'Declined'}
                                        {guest.rsvpStatus === 'maybe' && 'Maybe'}
                                        {guest.rsvpStatus === 'pending' && 'Pending'}
                                      </span>
                                      {guest.respondedAt && (
                                        <p className="text-xs text-gray-500 mt-1">
                                          {new Date(guest.respondedAt).toLocaleDateString()}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  
                                  {guest.message && (
                                    <div className="mt-3 p-3 bg-gray-50 rounded-md">
                                      <p className="text-sm text-gray-700">
                                        <span className="font-medium">Message: </span>
                                        {guest.message}
                                      </p>
                                    </div>
                                  )}
                                  
                                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-500">
                                    {guest.additionalGuests && guest.additionalGuests > 0 && (
                                      <span className="bg-gray-100 px-2 py-1 rounded">
                                        +{guest.additionalGuests} guests
                                      </span>
                                    )}
                                    {guest.dietaryRestrictions && (
                                      <span className="bg-gray-100 px-2 py-1 rounded">
                                        Dietary: {guest.dietaryRestrictions}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12 bg-gray-50 rounded-lg">
                          <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No Guests Yet</h3>
                          <p className="text-gray-500 mb-4">
                            Guests will appear here when they RSVP through your wedding website.
                          </p>
                          <Button
                            variant="outline"
                            onClick={() => window.open(`/wedding/${wedding?.uniqueUrl}`, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View Wedding Site
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Photo Management Tab */}
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
                        Memory Photos (Our Memories Gallery)
                      </h3>
                      
                      {/* Upload Section for Memory Photos */}
                      <div className="mb-4 p-4 border-2 border-dashed border-gray-300 rounded-lg">
                        <div className="text-center">
                          <Camera className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                          <h4 className="font-medium text-gray-700 mb-2">Upload Memory Photos</h4>
                          <p className="text-sm text-gray-500 mb-3">These photos will appear in the "Our Memories" gallery</p>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) => {
                              const files = e.target.files;
                              if (files) {
                                Array.from(files).forEach(file => {
                                  const formData = new FormData();
                                  formData.append('photo', file);
                                  formData.append('photoType', 'memory');
                                  formData.append('weddingId', wedding?.id?.toString() || '');
                                  
                                  fetch('/api/photos/upload', {
                                    method: 'POST',
                                    body: formData,
                                  }).then(() => {
                                    queryClient.invalidateQueries({ queryKey: ['/api/photos/wedding', wedding?.id] });
                                  });
                                });
                              }
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
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {photos && photos.filter((photo: any) => photo.photoType === 'memory').length > 0 ? (
                          photos.filter((photo: any) => photo.photoType === 'memory').map((photo: any) => (
                            <div key={photo.id} className="border rounded-lg p-2 space-y-2">
                              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                                <img 
                                  src={photo.url} 
                                  alt={photo.caption || "Memory photo"}
                                  className="w-full h-full object-cover"
                                />
                              </div>
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
                          ))
                        ) : (
                          <div className="col-span-full text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                            <Camera className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                            <p>No memory photos uploaded yet</p>
                            <p className="text-sm text-gray-400 mt-1">Upload photos to create your wedding gallery</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}