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
import { ArrowLeft, Save, Eye, Edit, Camera, Heart, Settings, Calendar, MapPin, Trash2, Users, ExternalLink, MessageSquare } from 'lucide-react';
import { LanguageToggle } from '@/components/language-toggle';
import { PersonalizedGuestDashboard } from '@/components/personalized-guest-dashboard';
import { EnhancedRSVPManager } from '@/components/enhanced-rsvp-manager';
import { MobileGuestManager } from '@/components/mobile-guest-manager';
import { CouplePhotoUpload } from '@/components/couple-photo-upload';
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
  const { data: photos = [], isLoading: photosLoading } = useQuery<Photo[]>({
    queryKey: [`/api/photos/wedding/${wedding?.id}`],
    enabled: !!wedding?.id,
  });

  // Fetch guests for this wedding
  const { data: guests = [], isLoading: guestsLoading } = useQuery<Guest[]>({
    queryKey: wedding?.id ? [`/api/guests/wedding/${wedding.id}`] : [],
    enabled: !!wedding?.id,
  });

  // Update wedding mutation
  const updateWeddingMutation = useMutation({
    mutationFn: async (updatedData: Partial<Wedding>) => {
      const response = await fetch(`/api/weddings/${wedding?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });
      if (!response.ok) throw new Error('Failed to update wedding');
      return response.json();
    },
    onSuccess: (updatedWedding) => {
      queryClient.invalidateQueries({ queryKey: [`/api/weddings/url/${weddingUrl}`] });
      setEditMode(false);
      setWeddingData(null);
      toast({
        title: "Wedding Updated!",
        description: "Your wedding details have been saved successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update wedding details. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Initialize form data when wedding loads
  if (wedding && !weddingData) {
    setWeddingData(wedding);
  }

  const handleSave = () => {
    if (weddingData) {
      updateWeddingMutation.mutate(weddingData);
    }
  };

  if (weddingLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#F8F1F1] to-white flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4B08C] mx-auto mb-4"></div>
            <p className="text-[#2C3338]/70">Loading wedding details...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!wedding) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#F8F1F1] to-white flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold text-[#2C3338] mb-2">Wedding Not Found</h2>
            <p className="text-[#2C3338]/70 mb-4">The wedding you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => setLocation('/dashboard')} className="wedding-button">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if current user owns this wedding or is a guest manager
  const canAccess = currentUser && (
    wedding.userId === currentUser.id || 
    currentUser.role === 'guest_manager' ||
    currentUser.isAdmin
  );
  
  if (currentUser && !canAccess) {
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
                {t('manage.backToDashboard')}
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-[#2C3338]">
                  {t('manage.manageWedding')}: {wedding.bride} & {wedding.groom}
                </h1>
                <p className="text-[#2C3338]/70">
                  {wedding.isPublic ? t('dashboard.public') : t('dashboard.private')} • {wedding.uniqueUrl}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <LanguageToggle />
              <Button
                variant="outline"
                onClick={() => window.open(`/wedding/${wedding.uniqueUrl}`, '_blank')}
                className="border-gray-200"
              >
                <Eye className="w-4 h-4 mr-2" />
                {t('manage.viewSite')}
              </Button>
              {editMode ? (
                <>
                  <Button
                    onClick={handleSave}
                    disabled={updateWeddingMutation.isPending}
                    className="wedding-button"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {t('manage.saveChanges')}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditMode(false);
                      setWeddingData(wedding);
                    }}
                    className="border-gray-200"
                  >
                    {t('manage.cancel')}
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => setEditMode(true)}
                  className="wedding-button"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  {t('manage.editWeddingButton')}
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs defaultValue="details" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:grid-cols-5">
            <TabsTrigger value="details">{t('manage.weddingDetails')}</TabsTrigger>
            <TabsTrigger value="guests">{t('manage.guestManagement')}</TabsTrigger>
            <TabsTrigger value="dashboard">Guest Dashboard</TabsTrigger>
            <TabsTrigger value="photos">{t('manage.photoManagement')}</TabsTrigger>
            <TabsTrigger value="guestbook">{t('manage.guestBook')}</TabsTrigger>
          </TabsList>

          {/* Wedding Details Tab */}
          <TabsContent value="details" className="space-y-6">
            <Card className="wedding-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-[#D4B08C]" />
                  {t('manage.weddingInformation')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="bride">{t('manage.brideName')}</Label>
                    <Input
                      id="bride"
                      value={weddingData?.bride || ''}
                      onChange={(e) => setWeddingData(prev => prev ? {...prev, bride: e.target.value} : null)}
                      disabled={!editMode}
                      className="wedding-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="groom">{t('manage.groomName')}</Label>
                    <Input
                      id="groom"
                      value={weddingData?.groom || ''}
                      onChange={(e) => setWeddingData(prev => prev ? {...prev, groom: e.target.value} : null)}
                      disabled={!editMode}
                      className="wedding-input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="weddingDate">{t('manage.weddingDate')}</Label>
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
                    <Label htmlFor="weddingTime">{t('manage.weddingTime')}</Label>
                    <Input
                      id="weddingTime"
                      value={weddingData?.weddingTime || ''}
                      onChange={(e) => setWeddingData(prev => prev ? {...prev, weddingTime: e.target.value} : null)}
                      disabled={!editMode}
                      className="wedding-input"
                      placeholder="16:00, 4:00 PM"
                    />
                  </div>
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

                {/* Couple Photo Upload Section */}
                <div className="space-y-2">
                  <Label className="text-base font-medium flex items-center gap-2">
                    <Heart className="h-4 w-4 text-red-500" />
                    Couple Photo
                  </Label>
                  <p className="text-sm text-gray-600 mb-4">
                    Upload a beautiful photo of you both that will appear in your wedding site's hero section
                  </p>
                  <CouplePhotoUpload 
                    weddingId={wedding.id}
                    currentPhotoUrl={wedding.couplePhotoUrl || undefined}
                    onSuccess={() => {
                      queryClient.invalidateQueries({ queryKey: [`/api/weddings/url/${weddingUrl}`] });
                    }}
                  />
                </div>

                <div className="flex items-center gap-2">
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
            {guestsLoading ? (
              <Card className="wedding-card">
                <CardContent className="p-8">
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4B08C] mx-auto mb-4"></div>
                    <p className="text-[#2C3338]/70">Loading guest information...</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              wedding && (
                <MobileGuestManager 
                  weddingId={wedding.id}
                  weddingTitle={`${wedding.bride} & ${wedding.groom}`}
                />
              )
            )}
          </TabsContent>

          {/* Personalized Guest Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {wedding && <PersonalizedGuestDashboard wedding={wedding} />}
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
                  <div className="text-center py-8 text-gray-500">
                    <Camera className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Photo management features coming soon</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Guest Book Tab */}
          <TabsContent value="guestbook" className="space-y-6">
            <Card className="wedding-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-[#D4B08C]" />
                  Guest Book Messages
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Guest book messages will appear here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}