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
import { GuestBookManager } from '@/components/guest-book-manager';
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

  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
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

  // Check access permissions - must be done before any conditional returns
  const isOwner = currentUser && wedding && wedding.userId === currentUser.id;
  const isAdmin = localStorage.getItem('isAdmin') === 'true' || (currentUser && (currentUser.isAdmin === true || currentUser.role === 'admin'));
  
  // Check if user has specific wedding access through wedding_access table
  const { data: userWeddingAccess } = useQuery({
    queryKey: ['/api/user/wedding-access', currentUser?.id, wedding?.id],
    queryFn: () => fetch(`/api/user/wedding-access/${currentUser?.id}/${wedding?.id}`).then(res => {
      if (res.status === 404) return null;
      return res.json();
    }),
    enabled: !!currentUser && !!wedding && currentUser.role === 'guest_manager' && !isAdmin,
  });

  const hasGuestManagerAccess = currentUser?.role === 'guest_manager' && userWeddingAccess;
  const hasAccess = isAdmin || (currentUser?.role !== 'guest_manager' && isOwner) || hasGuestManagerAccess;

  // Update wedding mutation
  const updateWeddingMutation = useMutation({
    mutationFn: async (updatedData: Partial<Wedding>) => {
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (localStorage.getItem('isAdmin') === 'true') {
        headers['x-admin'] = 'true';
      }
      
      const response = await fetch(`/api/weddings/${wedding!.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(updatedData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update wedding');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/weddings/url/${weddingUrl}`] });
      setEditMode(false);
      toast({
        title: "Wedding Updated",
        description: "Wedding details have been successfully updated.",
      });
    },
    onError: () => {
      toast({
        title: "Update Failed", 
        description: "Failed to update wedding details.",
        variant: "destructive",
      });
    },
  });

  // Determine the correct dashboard to return to based on user role and navigation context
  const getBackToDashboardPath = () => {
    if (!currentUser) return '/login';
    
    // Guest managers should go to the main landing page
    if (currentUser.role === 'guest_manager') {
      return '/';
    }
    
    // Check if user is admin by looking at localStorage (where admin status is stored)
    const isAdminLocal = localStorage.getItem('isAdmin') === 'true';
    const fromAdmin = sessionStorage.getItem('fromAdminDashboard');
    
    // SECURITY: Only return to admin dashboard if user is admin AND came from admin dashboard
    if (isAdminLocal && fromAdmin === 'true') {
      return '/system/dashboard';
    }
    
    // Default: Always return regular users to user dashboard
    return '/dashboard';
  };

  const handleBackToDashboard = () => {
    if (!currentUser) {
      setLocation('/login');
      return;
    }
    
    // Get the path BEFORE clearing the session flag
    const targetPath = getBackToDashboardPath();
    // Clear the admin dashboard flag after getting the path
    sessionStorage.removeItem('fromAdminDashboard');
    setLocation(targetPath);
  };

  const handleInputChange = (field: keyof Wedding, value: any) => {
    if (!weddingData) return;
    setWeddingData(prev => prev ? { ...prev, [field]: value } : null);
  };

  const handleEditToggle = () => {
    setEditMode(!editMode);
    if (wedding) setWeddingData(wedding);
  }

  const handleSave = () => {
    if (weddingData) {
      updateWeddingMutation.mutate(weddingData);
    }
  };

  // NOW WE CAN HAVE CONDITIONAL RETURNS AFTER ALL HOOKS
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

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#F8F1F1] to-white flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold text-[#2C3338] mb-2">Access Denied</h2>
            <p className="text-[#2C3338]/70 mb-4">You don't have permission to manage this wedding.</p>
            <Button onClick={() => {
              if (!currentUser) {
                setLocation('/login');
              } else if (currentUser.role === 'guest_manager') {
                setLocation('/guest-manager');
              } else if (localStorage.getItem('isAdmin') === 'true') {
                setLocation('/admin/dashboard');
              } else {
                setLocation('/dashboard');
              }
            }} className="wedding-button">
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
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={handleBackToDashboard}
                className="text-[#2C3338] hover:bg-[#F8F1F1]"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('manage.backToDashboard')}
              </Button>
              <div className="h-6 w-px bg-gray-200"></div>
              <div>
                <h1 className="text-2xl font-bold text-[#2C3338]">{t('manage.weddingManagement')}</h1>
                <p className="text-sm text-[#2C3338]/70">
                  {wedding.bride} & {wedding.groom} • {formatDate(wedding.weddingDate)}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <LanguageToggle />
              
              {currentUser && (
                <>
                  <span className="text-sm text-[#2C3338]/70">
                    {t('manage.welcome')}, {currentUser.name || currentUser.email}
                  </span>
                  
                  {(isOwner || isAdmin) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`/wedding/${wedding.uniqueUrl}`, '_blank')}
                      className="border-[#D4B08C] text-[#D4B08C] hover:bg-[#D4B08C] hover:text-white"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      {t('manage.viewSite')}
                    </Button>
                  )}
                </>
              )}

            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs defaultValue="guests" className="space-y-6">
          {/* For guest managers, show only Guest Management tab */}
          {currentUser?.role === 'guest_manager' ? (
            <TabsList className="grid w-full grid-cols-1">
              <TabsTrigger value="guests">{t('manage.guestManagement')}</TabsTrigger>
            </TabsList>
          ) : (
            <TabsList className="grid w-full grid-cols-5 lg:grid-cols-5">
              <TabsTrigger value="details">{t('manage.weddingDetails')}</TabsTrigger>
              <TabsTrigger value="guests">{t('manage.guestManagement')}</TabsTrigger>
              <TabsTrigger value="dashboard">{t('manage.guestDashboard')}</TabsTrigger>
              <TabsTrigger value="guestbook">{t('manage.guestBook')}</TabsTrigger>
              <TabsTrigger value="photos">{t('manage.photoManagement')}</TabsTrigger>
            </TabsList>
          )}

          {/* Wedding Details Tab - Only for non-guest managers */}
          {currentUser?.role !== 'guest_manager' && (
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
                      value={editMode ? weddingData?.bride || '' : wedding.bride}
                      onChange={(e) => handleInputChange('bride', e.target.value)}
                      disabled={!editMode}
                      className="wedding-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="groom">{t('manage.groomName')}</Label>
                    <Input
                      id="groom"
                      value={editMode ? weddingData?.groom || '' : wedding.groom}
                      onChange={(e) => handleInputChange('groom', e.target.value)}
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
                      value={editMode ? 
                        (weddingData?.weddingDate ? new Date(weddingData.weddingDate).toISOString().split('T')[0] : '') :
                        (wedding.weddingDate ? new Date(wedding.weddingDate).toISOString().split('T')[0] : '')
                      }
                      onChange={(e) => handleInputChange('weddingDate', e.target.value)}
                      disabled={!editMode}
                      className="wedding-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weddingTime">{t('manage.weddingTime')}</Label>
                    <Input
                      id="weddingTime"
                      value={editMode ? weddingData?.weddingTime || '' : wedding.weddingTime || ''}
                      onChange={(e) => handleInputChange('weddingTime', e.target.value)}
                      disabled={!editMode}
                      placeholder="e.g., 3:00 PM"
                      className="wedding-input"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="venue">{t('manage.venue')}</Label>
                  <Input
                    id="venue"
                    value={editMode ? weddingData?.venue || '' : wedding.venue}
                    onChange={(e) => handleInputChange('venue', e.target.value)}
                    disabled={!editMode}
                    className="wedding-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="venueAddress">{t('manage.venueAddress')}</Label>
                  <Input
                    id="venueAddress"
                    value={editMode ? weddingData?.venueAddress || '' : wedding.venueAddress}
                    onChange={(e) => handleInputChange('venueAddress', e.target.value)}
                    disabled={!editMode}
                    className="wedding-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="story">{t('manage.ourStory')}</Label>
                  <Textarea
                    id="story"
                    value={editMode ? weddingData?.story || '' : wedding.story || ''}
                    onChange={(e) => handleInputChange('story', e.target.value)}
                    disabled={!editMode}
                    rows={4}
                    className="wedding-input"
                    placeholder={t('manage.storyPlaceholder')}
                  />
                </div>

                <div className="flex items-center justify-between pt-4">
                  <div className="flex items-center space-x-2">
                    <Badge variant={wedding.isPublic ? "default" : "secondary"}>
                      {wedding.isPublic ? t('manage.public') : t('manage.private')}
                    </Badge>
                    <span className="text-sm text-[#2C3338]/70">
                      /{wedding.uniqueUrl}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {editMode ? (
                      <>
                        <Button
                          variant="outline"
                          onClick={handleEditToggle}
                          disabled={updateWeddingMutation.isPending}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSave}
                          disabled={updateWeddingMutation.isPending}
                          className="wedding-button"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          {updateWeddingMutation.isPending ? t('manage.saving') : t('manage.saveChanges')}
                        </Button>
                      </>
                    ) : (
                      <Button
                        onClick={handleEditToggle}
                        className="wedding-button"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        {t('manage.editDetails')}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          )}

          {/* Guest Management Tab */}
          <TabsContent value="guests" className="space-y-6">
            {guestsLoading ? (
              <Card>
                <CardContent className="p-8">
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4B08C] mx-auto mb-4"></div>
                    <p className="text-[#2C3338]/70">Loading guest information...</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              wedding && <EnhancedRSVPManager wedding={wedding} guests={guests || []} />
            )}
          </TabsContent>

          {/* Guest Dashboard Tab - Only for non-guest managers */}
          {currentUser?.role !== 'guest_manager' && (
            <TabsContent value="dashboard" className="space-y-6">
              {wedding && <PersonalizedGuestDashboard wedding={wedding} />}
            </TabsContent>
          )}

          {/* Photo Management Tab - Only for non-guest managers */}
          {currentUser?.role !== 'guest_manager' && (
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
          )}

          {/* Guest Book Tab - Only for non-guest managers */}
          {currentUser?.role !== 'guest_manager' && (
          <TabsContent value="guestbook" className="space-y-6">
            <Card className="wedding-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-[#D4B08C]" />
                  Guest Book Messages
                </CardTitle>
              </CardHeader>
              <CardContent>
                <GuestBookManager weddingId={wedding.id} readOnly={false} />
              </CardContent>
            </Card>
          </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}