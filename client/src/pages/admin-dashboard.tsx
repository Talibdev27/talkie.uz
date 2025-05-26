import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useParams, Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { formatDate, getInitials } from '@/lib/utils';
import { 
  Heart, Users, Calendar, Camera, Settings, Eye, Share2, 
  Upload, Edit, Trash2, MessageSquare, BarChart3, ExternalLink,
  Download, Plus, ArrowLeft
} from 'lucide-react';
import type { Wedding, Guest, Photo, GuestBookEntry } from '@shared/schema';

export default function AdminDashboard() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const params = useParams();
  const uniqueUrl = params.uniqueUrl as string;
  const [photoUploadOpen, setPhotoUploadOpen] = useState(false);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newPhotoCaption, setNewPhotoCaption] = useState('');

  // Fetch wedding data
  const { data: wedding, isLoading: weddingLoading } = useQuery<Wedding>({
    queryKey: ['/api/weddings/url', uniqueUrl],
    enabled: !!uniqueUrl,
  });

  // Fetch guests
  const { data: guests = [], isLoading: guestsLoading } = useQuery<Guest[]>({
    queryKey: ['/api/guests/wedding', wedding?.id],
    enabled: !!wedding?.id,
  });

  // Fetch photos
  const { data: photos = [], isLoading: photosLoading } = useQuery<Photo[]>({
    queryKey: ['/api/photos/wedding', wedding?.id],
    enabled: !!wedding?.id,
  });

  // Fetch guest book entries
  const { data: guestBookEntries = [] } = useQuery<GuestBookEntry[]>({
    queryKey: ['/api/guest-book/wedding', wedding?.id],
    enabled: !!wedding?.id,
  });

  // Fetch wedding stats
  const { data: stats } = useQuery({
    queryKey: ['/api/weddings', wedding?.id, 'stats'],
    enabled: !!wedding?.id,
  });

  // Add photo mutation
  const addPhoto = useMutation({
    mutationFn: async (photoData: { url: string; caption?: string }) => {
      const response = await apiRequest('POST', '/api/photos', {
        weddingId: wedding!.id,
        url: photoData.url,
        caption: photoData.caption,
        isHero: false,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Photo added!",
        description: "Your photo has been added to the gallery.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/photos/wedding', wedding?.id] });
      setPhotoUploadOpen(false);
      setNewPhotoUrl('');
      setNewPhotoCaption('');
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add photo. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete photo mutation
  const deletePhoto = useMutation({
    mutationFn: async (photoId: number) => {
      await apiRequest('DELETE', `/api/photos/${photoId}`);
    },
    onSuccess: () => {
      toast({
        title: "Photo deleted",
        description: "The photo has been removed from your gallery.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/photos/wedding', wedding?.id] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete photo. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (weddingLoading) {
    return (
      <div className="min-h-screen bg-soft-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-8 w-64 mb-8" />
          <div className="grid lg:grid-cols-4 gap-8">
            <div className="space-y-6">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
            <div className="lg:col-span-3">
              <Skeleton className="h-96 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!wedding) {
    return (
      <div className="min-h-screen bg-soft-white flex items-center justify-center">
        <Card className="wedding-card max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-xl font-playfair font-semibold text-charcoal mb-2">
              Wedding Not Found
            </h2>
            <p className="text-charcoal opacity-70">
              This wedding website doesn't exist or you don't have access to manage it.
            </p>
            <Link href="/">
              <Button className="mt-4 wedding-button">
                Go Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const confirmedGuests = guests.filter(g => g.rsvpStatus === 'confirmed');
  const pendingGuests = guests.filter(g => g.rsvpStatus === 'pending');
  const declinedGuests = guests.filter(g => g.rsvpStatus === 'declined');

  const handleAddPhoto = () => {
    if (!newPhotoUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a photo URL.",
        variant: "destructive",
      });
      return;
    }
    addPhoto.mutate({ url: newPhotoUrl, caption: newPhotoCaption });
  };

  return (
    <div className="min-h-screen bg-soft-white">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center text-romantic-gold hover:text-opacity-80 transition-colors">
                <ArrowLeft className="h-5 w-5 mr-2" />
                <Heart className="h-6 w-6 mr-2" />
                <span className="font-playfair font-semibold text-lg">LoveStory</span>
              </Link>
              <div className="h-6 border-l border-gray-300" />
              <h1 className="text-xl font-playfair font-semibold text-charcoal">
                {wedding.bride} & {wedding.groom} - {t('admin.dashboard')}
              </h1>
            </div>
            <div className="flex items-center space-x-3">
              <Link href={`/wedding/${wedding.uniqueUrl}`}>
                <Button variant="outline" className="wedding-button-outline">
                  <Eye className="h-4 w-4 mr-2" />
                  View Site
                </Button>
              </Link>
              <Button variant="outline" className="wedding-button-outline">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Wedding Overview Header */}
        <div className="bg-gradient-to-r from-romantic-gold to-sage-green rounded-2xl p-8 text-white mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-playfair font-bold mb-2">
                {wedding.bride} & {wedding.groom}'s Wedding
              </h2>
              <p className="text-white opacity-90 text-lg">
                {formatDate(wedding.weddingDate)} • {wedding.venue}
              </p>
              <p className="text-white opacity-75 text-sm mt-1">
                Wedding URL: lovestory.com/wedding/{wedding.uniqueUrl}
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{confirmedGuests.length}</div>
              <div className="text-white opacity-90">Confirmed Guests</div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar - Stats and Quick Actions */}
          <div className="space-y-6">
            {/* RSVP Stats */}
            <Card className="wedding-card">
              <CardHeader>
                <CardTitle className="text-lg font-playfair font-semibold text-charcoal flex items-center">
                  <Users className="h-5 w-5 mr-2 text-romantic-gold" />
                  {t('admin.rsvpStatus')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-charcoal">{t('admin.confirmed')}</span>
                  <Badge className="bg-sage-green text-white">{confirmedGuests.length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-charcoal">{t('admin.pending')}</span>
                  <Badge className="bg-romantic-gold text-white">{pendingGuests.length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-charcoal">{t('admin.declined')}</span>
                  <Badge variant="secondary">{declinedGuests.length}</Badge>
                </div>
                <div className="pt-2 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-charcoal">Total Guests</span>
                    <Badge variant="outline">{guests.length}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="wedding-card">
              <CardHeader>
                <CardTitle className="text-lg font-playfair font-semibold text-charcoal">
                  {t('admin.quickActions')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="ghost" className="w-full justify-start text-left">
                  <Edit className="h-4 w-4 mr-3 text-romantic-gold" />
                  {t('admin.editWebsite')}
                </Button>
                <Dialog open={photoUploadOpen} onOpenChange={setPhotoUploadOpen}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" className="w-full justify-start text-left">
                      <Camera className="h-4 w-4 mr-3 text-sage-green" />
                      {t('admin.uploadPhotos')}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Photo</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="photoUrl">Photo URL</Label>
                        <Input
                          id="photoUrl"
                          placeholder="https://example.com/photo.jpg"
                          value={newPhotoUrl}
                          onChange={(e) => setNewPhotoUrl(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="photoCaption">Caption (Optional)</Label>
                        <Input
                          id="photoCaption"
                          placeholder="Add a caption for this photo"
                          value={newPhotoCaption}
                          onChange={(e) => setNewPhotoCaption(e.target.value)}
                        />
                      </div>
                      <Button 
                        onClick={handleAddPhoto}
                        disabled={addPhoto.isPending}
                        className="w-full wedding-button"
                      >
                        {addPhoto.isPending ? 'Adding...' : 'Add Photo'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button variant="ghost" className="w-full justify-start text-left">
                  <Settings className="h-4 w-4 mr-3 text-romantic-gold" />
                  Website Settings
                </Button>
                <Button variant="ghost" className="w-full justify-start text-left">
                  <Download className="h-4 w-4 mr-3 text-sage-green" />
                  Export Guest List
                </Button>
              </CardContent>
            </Card>

            {/* Website Stats */}
            <Card className="wedding-card">
              <CardHeader>
                <CardTitle className="text-lg font-playfair font-semibold text-charcoal flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-romantic-gold" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-charcoal">Photos</span>
                  <span className="font-semibold">{photos.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-charcoal">Guest Book Entries</span>
                  <span className="font-semibold">{guestBookEntries.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-charcoal">Website Views</span>
                  <span className="font-semibold">--</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="rsvps" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="rsvps">RSVPs</TabsTrigger>
                <TabsTrigger value="photos">Photos</TabsTrigger>
                <TabsTrigger value="guestbook">Guest Book</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              {/* RSVPs Tab */}
              <TabsContent value="rsvps" className="space-y-6">
                <Card className="wedding-card">
                  <CardHeader>
                    <CardTitle className="text-xl font-playfair font-semibold text-charcoal">
                      {t('admin.recentRSVPs')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {guestsLoading ? (
                      <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                          <Skeleton key={i} className="h-16 w-full" />
                        ))}
                      </div>
                    ) : guests.length === 0 ? (
                      <div className="text-center py-12">
                        <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-lg font-medium text-charcoal mb-2">No RSVPs yet</p>
                        <p className="text-sm text-charcoal opacity-70">
                          Guest responses will appear here once they start RSVPing
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {guests
                          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                          .slice(0, 10)
                          .map((guest) => (
                          <div key={guest.id} className="flex items-center justify-between p-4 bg-soft-white rounded-lg">
                            <div className="flex items-center space-x-4">
                              <div className="w-10 h-10 bg-romantic-gold rounded-full flex items-center justify-center">
                                <span className="text-white font-semibold text-sm">
                                  {getInitials(guest.name)}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-charcoal">{guest.name}</p>
                                {guest.email && (
                                  <p className="text-sm text-charcoal opacity-70">{guest.email}</p>
                                )}
                                <p className="text-xs text-charcoal opacity-60">
                                  {guest.respondedAt ? formatDate(guest.respondedAt) : 'Not responded'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              {guest.plusOne && (
                                <Badge variant="outline" className="text-xs">+1</Badge>
                              )}
                              <Badge 
                                className={
                                  guest.rsvpStatus === 'confirmed' 
                                    ? 'bg-sage-green text-white' 
                                    : guest.rsvpStatus === 'declined'
                                    ? 'bg-gray-500 text-white'
                                    : 'bg-romantic-gold text-white'
                                }
                              >
                                {guest.rsvpStatus}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Photos Tab */}
              <TabsContent value="photos" className="space-y-6">
                <Card className="wedding-card">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-xl font-playfair font-semibold text-charcoal">
                      Photo Gallery Management
                    </CardTitle>
                    <Dialog open={photoUploadOpen} onOpenChange={setPhotoUploadOpen}>
                      <DialogTrigger asChild>
                        <Button className="wedding-button">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Photo
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add New Photo</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="photoUrl">Photo URL</Label>
                            <Input
                              id="photoUrl"
                              placeholder="https://example.com/photo.jpg"
                              value={newPhotoUrl}
                              onChange={(e) => setNewPhotoUrl(e.target.value)}
                            />
                          </div>
                          <div>
                            <Label htmlFor="photoCaption">Caption (Optional)</Label>
                            <Input
                              id="photoCaption"
                              placeholder="Add a caption for this photo"
                              value={newPhotoCaption}
                              onChange={(e) => setNewPhotoCaption(e.target.value)}
                            />
                          </div>
                          <Button 
                            onClick={handleAddPhoto}
                            disabled={addPhoto.isPending}
                            className="w-full wedding-button"
                          >
                            {addPhoto.isPending ? 'Adding...' : 'Add Photo'}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardHeader>
                  <CardContent>
                    {photosLoading ? (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[...Array(8)].map((_, i) => (
                          <Skeleton key={i} className="aspect-square rounded-lg" />
                        ))}
                      </div>
                    ) : photos.length === 0 ? (
                      <div className="text-center py-12">
                        <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-lg font-medium text-charcoal mb-2">No photos uploaded</p>
                        <p className="text-sm text-charcoal opacity-70 mb-4">
                          Add photos to create a beautiful gallery for your guests
                        </p>
                        <Button onClick={() => setPhotoUploadOpen(true)} className="wedding-button">
                          <Upload className="h-4 w-4 mr-2" />
                          Upload First Photo
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {photos.map((photo) => (
                          <div key={photo.id} className="relative group">
                            <img
                              src={photo.url}
                              alt={photo.caption || 'Wedding photo'}
                              className="w-full aspect-square object-cover rounded-lg shadow-sm"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center">
                              <Button
                                size="icon"
                                variant="destructive"
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => deletePhoto.mutate(photo.id)}
                                disabled={deletePhoto.isPending}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            {photo.caption && (
                              <p className="text-xs text-charcoal opacity-70 mt-1 truncate">
                                {photo.caption}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Guest Book Tab */}
              <TabsContent value="guestbook" className="space-y-6">
                <Card className="wedding-card">
                  <CardHeader>
                    <CardTitle className="text-xl font-playfair font-semibold text-charcoal">
                      Guest Book Messages
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {guestBookEntries.length === 0 ? (
                      <div className="text-center py-12">
                        <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-lg font-medium text-charcoal mb-2">No messages yet</p>
                        <p className="text-sm text-charcoal opacity-70">
                          Guest messages will appear here when they leave notes in your guest book
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {guestBookEntries.map((entry) => (
                          <div key={entry.id} className="p-4 bg-soft-white rounded-lg">
                            <div className="flex items-start space-x-3">
                              <MessageSquare className="h-5 w-5 text-romantic-gold mt-1 flex-shrink-0" />
                              <div className="flex-1">
                                <p className="text-charcoal italic leading-relaxed">
                                  "{entry.message}"
                                </p>
                                <div className="flex items-center justify-between mt-3">
                                  <p className="text-romantic-gold font-medium">
                                    — {entry.guestName}
                                  </p>
                                  <p className="text-xs text-charcoal opacity-60">
                                    {formatDate(entry.createdAt)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Analytics Tab */}
              <TabsContent value="analytics" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="wedding-card">
                    <CardHeader>
                      <CardTitle className="text-lg font-playfair font-semibold text-charcoal">
                        RSVP Overview
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span>Response Rate</span>
                          <span className="font-bold">
                            {guests.length > 0 ? Math.round(((guests.length - pendingGuests.length) / guests.length) * 100) : 0}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-romantic-gold h-2 rounded-full" 
                            style={{ 
                              width: guests.length > 0 ? `${((guests.length - pendingGuests.length) / guests.length) * 100}%` : '0%' 
                            }}
                          ></div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <div className="text-2xl font-bold text-sage-green">{confirmedGuests.length}</div>
                            <div className="text-xs text-charcoal opacity-70">Confirmed</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-romantic-gold">{pendingGuests.length}</div>
                            <div className="text-xs text-charcoal opacity-70">Pending</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-gray-500">{declinedGuests.length}</div>
                            <div className="text-xs text-charcoal opacity-70">Declined</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="wedding-card">
                    <CardHeader>
                      <CardTitle className="text-lg font-playfair font-semibold text-charcoal">
                        Content Stats
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="flex items-center">
                            <Camera className="h-4 w-4 mr-2 text-romantic-gold" />
                            Photos
                          </span>
                          <span className="font-bold">{photos.length}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="flex items-center">
                            <MessageSquare className="h-4 w-4 mr-2 text-sage-green" />
                            Guest Book
                          </span>
                          <span className="font-bold">{guestBookEntries.length}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="flex items-center">
                            <Users className="h-4 w-4 mr-2 text-romantic-gold" />
                            Total RSVPs
                          </span>
                          <span className="font-bold">{guests.length}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="wedding-card">
                  <CardHeader>
                    <CardTitle className="text-lg font-playfair font-semibold text-charcoal">
                      Website Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-lg font-medium text-charcoal mb-2">Analytics Coming Soon</p>
                      <p className="text-sm text-charcoal opacity-70">
                        Detailed website analytics and visitor insights will be available in future updates
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
