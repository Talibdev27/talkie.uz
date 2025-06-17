import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useParams } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CountdownTimer } from '@/components/countdown-timer';
import { PhotoGallery } from '@/components/photo-gallery';
import { PhotoUpload } from '@/components/photo-upload';
import { SmartImageUpload } from '@/components/smart-image-upload';
import { GuestManagementDashboard } from '@/components/guest-management-dashboard';
import { RSVPForm } from '@/components/rsvp-form';
import { GuestBookForm } from '@/components/guest-book-form';
import { WeddingLanguageSwitcher } from '@/components/wedding-language-switcher';
import { EnhancedSocialShare } from '@/components/enhanced-social-share';
import { WeddingPageLoading } from '@/components/ui/loading';
import { SimpleWeddingTemplate } from '@/components/simple-wedding-template';
import { formatDate } from '@/lib/utils';
import { MapPin, Heart, MessageSquare, Calendar, Music, Clock, ExternalLink, MessageCircle } from 'lucide-react';
import type { Wedding, GuestBookEntry } from '@shared/schema';

export default function WeddingSite() {
  const { t, i18n } = useTranslation();
  const params = useParams();
  const uniqueUrl = params.uniqueUrl as string;
  
  // For now, assume user is guest by default - owners can access via special URL
  const isOwner = false;

  const { data: wedding, isLoading, error } = useQuery<Wedding>({
    queryKey: [`/api/weddings/url/${uniqueUrl}`],
    queryFn: () => fetch(`/api/weddings/url/${uniqueUrl}`).then(res => res.json()),
    enabled: !!uniqueUrl,
  });

  const { data: guestBookEntries = [] } = useQuery<GuestBookEntry[]>({
    queryKey: ['/api/guest-book/wedding', wedding?.id],
    queryFn: () => fetch(`/api/guest-book/wedding/${wedding?.id}`).then(res => res.json()),
    enabled: !!wedding?.id,
  });

  const { data: photos = [] } = useQuery({
    queryKey: ['/api/photos/wedding', wedding?.id],
    queryFn: () => fetch(`/api/photos/wedding/${wedding?.id}`).then(res => res.json()),
    enabled: !!wedding?.id,
  });

  if (isLoading) {
    return <WeddingPageLoading message={t('common.loading')} />;
  }

  if (error || !wedding) {
    return (
      <div className="min-h-screen bg-soft-white flex items-center justify-center">
        <Card className="wedding-card max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <div className="text-6xl mb-4">💔</div>
            <h2 className="text-xl font-playfair font-semibold text-charcoal mb-2">
              Wedding Not Found
            </h2>
            <p className="text-charcoal opacity-70">
              This wedding website doesn't exist or has been made private.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Template-specific configurations
  const templateConfigs = {
    gardenRomance: {
      heroImage: "https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080",
      bgGradient: "from-rose-50 to-green-50",
      primaryColor: "#D4B08C",
      accentColor: "#89916B",
      textColor: "text-emerald-900",
      cardBg: "bg-white/90 backdrop-blur-sm",
      overlayBg: "bg-emerald-900/40"
    },
    modernElegance: {
      heroImage: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080",
      bgGradient: "from-slate-50 to-gray-100",
      primaryColor: "#2C3338",
      accentColor: "#8B7355",
      textColor: "text-slate-900",
      cardBg: "bg-white shadow-2xl",
      overlayBg: "bg-slate-900/50"
    },
    rusticCharm: {
      heroImage: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080",
      bgGradient: "from-amber-50 to-orange-50",
      primaryColor: "#8B4513",
      accentColor: "#CD853F",
      textColor: "text-amber-900",
      cardBg: "bg-amber-50/95 border border-amber-200",
      overlayBg: "bg-amber-900/40"
    },
    beachBliss: {
      heroImage: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080",
      bgGradient: "from-cyan-50 to-blue-50",
      primaryColor: "#2E86AB",
      accentColor: "#A23B72",
      textColor: "text-cyan-900",
      cardBg: "bg-cyan-50/90 backdrop-blur-sm",
      overlayBg: "bg-cyan-900/40"
    },
    classicTradition: {
      heroImage: "https://images.unsplash.com/photo-1606800052052-a08af7148866?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080",
      bgGradient: "from-gray-50 to-stone-100",
      primaryColor: "#1F2937",
      accentColor: "#6B7280",
      textColor: "text-gray-900",
      cardBg: "bg-white border border-gray-200 shadow-lg",
      overlayBg: "bg-gray-900/50"
    },
    bohoChic: {
      heroImage: "https://images.unsplash.com/photo-1478146896981-b80fe463b330?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080",
      bgGradient: "from-orange-50 to-yellow-50",
      primaryColor: "#92400E",
      accentColor: "#F59E0B",
      textColor: "text-orange-900",
      cardBg: "bg-orange-50/95 border border-orange-200",
      overlayBg: "bg-orange-900/40"
    },
    standard: {
      heroImage: "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080",
      bgGradient: "from-slate-50 to-white",
      primaryColor: "#1F2937",
      accentColor: "#D4B08C",
      textColor: "text-gray-900",
      cardBg: "bg-white shadow-lg border border-gray-200",
      overlayBg: "bg-gray-900/40",
      headerBg: "bg-white/95 backdrop-blur-md",
      sectionSpacing: "py-16",
      containerWidth: "max-w-4xl"
    }
  };

  const currentTemplate = wedding.template || 'gardenRomance';
  const config = templateConfigs[currentTemplate as keyof typeof templateConfigs] || templateConfigs.gardenRomance;

  // Template photo styles for fallback
  const templatePhotos = {
    classic: "https://images.unsplash.com/photo-1606800052052-a08af7148866?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
    traditional: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
    modern: "https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
  };

  // Determine couple photo to display
  const getCouplePhoto = () => {
    if (wedding.couplePhotoUrl && !wedding.useTemplatePhoto) {
      return wedding.couplePhotoUrl;
    }
    if (wedding.useTemplatePhoto && wedding.templatePhotoStyle) {
      return templatePhotos[wedding.templatePhotoStyle as keyof typeof templatePhotos] || templatePhotos.classic;
    }
    // Fallback to uploaded couple photos
    const couplePhoto = photos.find((photo: any) => photo.photoType === 'couple');
    if (couplePhoto) return couplePhoto.url;
    
    return templatePhotos.classic; // Default fallback
  };

  // For Standard template, use the first uploaded photo as hero image
  const heroImage = currentTemplate === 'standard' && photos.length > 0 
    ? photos[0].url 
    : config.heroImage;

  const customStyles = {
    '--primary': config.primaryColor,
    '--accent': config.accentColor,
  } as React.CSSProperties;

  // Use standardized template for 'standard' template type
  if (currentTemplate === 'standard') {
    return (
      <div style={customStyles}>
        {/* Header with Wedding Language Switcher */}
        <div className="absolute top-4 right-4 z-50">
          <WeddingLanguageSwitcher wedding={wedding} />
        </div>
        <SimpleWeddingTemplate />
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${config.bgGradient}`} style={customStyles}>
      {/* Header with Wedding Language Switcher */}
      <div className="absolute top-4 right-4 z-50">
        <WeddingLanguageSwitcher wedding={wedding} />
      </div>

      {/* Hero Section */}
      <section className="relative h-screen overflow-hidden">
        <img
          src={heroImage}
          alt="Wedding couple"
          className={`w-full h-full ${currentTemplate === 'standard' ? 'object-cover object-center' : 'object-cover'}`}
          style={currentTemplate === 'standard' ? {
            filter: 'brightness(0.8) contrast(1.1)',
            objectPosition: 'center 30%'
          } : {}}
        />
        <div className={`absolute inset-0 ${currentTemplate === 'standard' ? 'bg-gradient-to-b from-black/20 via-black/30 to-black/50' : config.overlayBg}`}></div>
        <div className="absolute inset-0 flex items-center justify-center text-center text-white">
          <div className={`max-w-2xl px-4 ${currentTemplate === 'standard' ? 'bg-black/40 backdrop-blur-sm rounded-2xl py-8 px-8' : ''}`}>
            <h1 className={`text-4xl md:text-6xl font-playfair font-bold mb-4 ${currentTemplate === 'standard' ? 'text-white drop-shadow-2xl' : 'text-shadow'}`}>
              {wedding.bride} & {wedding.groom}
            </h1>
            <p className={`text-xl md:text-2xl font-cormorant mb-8 ${currentTemplate === 'standard' ? 'text-white/90 drop-shadow-xl' : 'text-shadow'}`}>
              {formatDate(wedding.weddingDate, i18n.language)}
            </p>
            
            {/* Ceremony Time */}
            <div className={`flex items-center justify-center mb-4 ${currentTemplate === 'standard' ? 'text-white/90' : 'text-white opacity-90'}`}>
              <Clock className="h-5 w-5 mr-2" />
              <span className="text-lg">{wedding.weddingTime}</span>
            </div>
            
            <CountdownTimer targetDate={wedding.weddingDate} className="mb-6" />
            
            {/* Location with Dialog */}
            <div className="flex justify-center">
              <Dialog>
                <DialogTrigger asChild>
                  <button className={`flex items-center justify-center hover:scale-105 transition-transform cursor-pointer ${currentTemplate === 'standard' ? 'text-white/90 hover:text-white' : 'text-white opacity-90 hover:opacity-100'}`}>
                    <MapPin className="h-5 w-5 mr-2" />
                    <span className="text-lg">{wedding.venue}</span>
                  </button>
                </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Wedding Location
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg">{wedding.venue}</h3>
                    <p className="text-gray-600">{wedding.venueAddress}</p>
                    <p className="text-gray-600 flex items-center gap-2 mt-2">
                      <Clock className="h-4 w-4" />
                      Ceremony begins at {wedding.weddingTime}
                    </p>
                  </div>
                  
                  {/* Map iframe */}
                  {wedding.venueCoordinates && (
                    <div className="space-y-3">
                      <div className="w-full h-96 rounded-lg overflow-hidden border">
                        <iframe
                          src={`https://www.openstreetmap.org/export/embed.html?bbox=${wedding.venueCoordinates.lng-0.01},${wedding.venueCoordinates.lat-0.01},${wedding.venueCoordinates.lng+0.01},${wedding.venueCoordinates.lat+0.01}&layer=mapnik&marker=${wedding.venueCoordinates.lat},${wedding.venueCoordinates.lng}`}
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          allowFullScreen
                          loading="lazy"
                        />
                      </div>
                      
                      {/* Action buttons */}
                      <div className="flex gap-2 flex-wrap">
                        <Button 
                          onClick={() => {
                            if (wedding.venueCoordinates) {
                              window.open(`https://www.google.com/maps/dir/?api=1&destination=${wedding.venueCoordinates.lat},${wedding.venueCoordinates.lng}`, '_blank');
                            }
                          }}
                          className="flex items-center gap-2"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Get Directions
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => {
                            if (wedding.venueCoordinates) {
                              window.open(`https://maps.apple.com/?daddr=${wedding.venueCoordinates.lat},${wedding.venueCoordinates.lng}`, '_blank');
                            }
                          }}
                          className="flex items-center gap-2"
                        >
                          <MapPin className="h-4 w-4" />
                          Open in Apple Maps
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {/* Fallback if no coordinates */}
                  {!wedding.venueCoordinates && (
                    <div className="text-center py-8">
                      <MapPin className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600 mb-4">Map coordinates not available</p>
                      <Button 
                        onClick={() => window.open(`https://www.google.com/maps/search/${encodeURIComponent(wedding.venueAddress)}`, '_blank')}
                        className="flex items-center gap-2 mx-auto"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Search on Google Maps
                      </Button>
                    </div>
                  )}
                </div>
              </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation */}
      <nav className="sticky top-0 bg-white shadow-md z-40">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex justify-center space-x-8 py-4">
            {/* Navigation items in proper order */}
            {(() => {
              const hasWelcomeMessage = wedding.welcomeMessage?.trim() || wedding.welcomeMessageUz?.trim() || wedding.welcomeMessageRu?.trim();
              return hasWelcomeMessage && (
                <a href="#welcome" className="text-charcoal hover:text-romantic-gold transition-colors font-medium">
                  {i18n.language === 'uz' ? 'Hurmatli mehmonlar' : i18n.language === 'ru' ? 'Дорогие гости' : 'Dear Guests'}
                </a>
              );
            })()}
            <a href="#about" className="text-charcoal hover:text-romantic-gold transition-colors font-medium">
              {i18n.language === 'uz' ? "To'y haqida" : i18n.language === 'ru' ? 'О свадьбе' : 'About Wedding'}
            </a>
            <a href="#rsvp" className="text-charcoal hover:text-romantic-gold transition-colors font-medium">
              {t('wedding.rsvp')}
            </a>
            <a href="#guestbook" className="text-charcoal hover:text-romantic-gold transition-colors font-medium">
              {i18n.language === 'uz' ? 'Izohlar' : i18n.language === 'ru' ? 'Комментарии' : 'Comments'}
            </a>
          </div>
        </div>
      </nav>

      {/* Hurmatli Mehmonlar / Dear Guests Section */}
      {(() => {
        const getCurrentWelcomeMessage = () => {
          if (i18n.language === 'uz' && wedding.welcomeMessageUz?.trim()) {
            return wedding.welcomeMessageUz;
          }
          if (i18n.language === 'ru' && wedding.welcomeMessageRu?.trim()) {
            return wedding.welcomeMessageRu;
          }
          if (wedding.welcomeMessage?.trim()) {
            return wedding.welcomeMessage;
          }
          return null;
        };
        
        const welcomeMessage = getCurrentWelcomeMessage();
        
        return welcomeMessage ? (
          <section id="welcome" className="py-20 bg-gradient-to-b from-white to-soft-white">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                {/* Couple Photo */}
                <div className="relative">
                  <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl">
                    <img
                      src={getCouplePhoto()}
                      alt={`${wedding.bride} & ${wedding.groom}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-romantic-gold/10 rounded-full blur-xl"></div>
                  <div className="absolute -top-6 -left-6 w-32 h-32 bg-sage-green/10 rounded-full blur-xl"></div>
                </div>

                {/* Welcome Message */}
                <div className="text-center lg:text-left">
                  <h2 className="text-4xl lg:text-5xl font-playfair font-bold text-romantic-gold mb-8">
                    {i18n.language === 'uz' ? 'HURMATLI MEHMONLAR!' : 
                     i18n.language === 'ru' ? 'ДОРОГИЕ ГОСТИ!' : 
                     'DEAR GUESTS!'}
                  </h2>
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 md:p-10 border border-romantic-gold/20">
                    <div className="prose prose-lg max-w-none text-charcoal leading-relaxed">
                      {welcomeMessage.split('\n').map((paragraph, index) => (
                        <p key={index} className="mb-4 last:mb-0 text-lg">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                    <div className="mt-8 flex justify-center">
                      <div className="w-24 h-0.5 bg-romantic-gold"></div>
                    </div>
                  </div>
                  <p className="mt-6 text-romantic-gold font-playfair font-semibold text-xl">
                    {wedding.bride} & {wedding.groom}
                  </p>
                </div>
              </div>
            </div>
          </section>
        ) : null;
      })()}

      {/* To'y haqida / About Wedding Section */}
      <section id="about" className="py-20 bg-gradient-to-b from-soft-white to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-playfair font-bold text-charcoal mb-6">
              {i18n.language === 'uz' ? "TO'Y HAQIDA" : 
               i18n.language === 'ru' ? 'О СВАДЬБЕ' : 
               'ABOUT WEDDING'}
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Wedding Story */}
            {wedding.story && wedding.story.trim() && (
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-romantic-gold/20">
                <h3 className="text-xl font-playfair font-semibold text-romantic-gold mb-4">
                  {i18n.language === 'uz' ? 'Bizning hikoyamiz' : 
                   i18n.language === 'ru' ? 'Наша история' : 
                   'Our Story'}
                </h3>
                <div className="prose prose-lg max-w-none text-charcoal leading-relaxed">
                  {wedding.story.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-4 last:mb-0">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Wedding Details */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-romantic-gold/20">
              <h3 className="text-xl font-playfair font-semibold text-romantic-gold mb-6">
                {i18n.language === 'uz' ? "To'y tafsilotlari" : 
                 i18n.language === 'ru' ? 'Детали свадьбы' : 
                 'Wedding Details'}
              </h3>
              <div className="space-y-4">
                <div className="flex items-center text-charcoal">
                  <Calendar className="h-5 w-5 mr-3 text-romantic-gold" />
                  <span>{formatDate(wedding.weddingDate, i18n.language)}</span>
                </div>
                {wedding.weddingTime && (
                  <div className="flex items-center text-charcoal">
                    <Clock className="h-5 w-5 mr-3 text-romantic-gold" />
                    <span>{wedding.weddingTime}</span>
                  </div>
                )}
                <div className="flex items-center text-charcoal">
                  <MapPin className="h-5 w-5 mr-3 text-romantic-gold" />
                  <span>{wedding.venue}</span>
                </div>
                {wedding.venueAddress && (
                  <div className="flex items-start text-charcoal">
                    <div className="h-5 w-5 mr-3 mt-0.5 text-romantic-gold"></div>
                    <span className="text-sm text-gray-600">{wedding.venueAddress}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Photos Section */}
      {((photos && photos.filter((photo: any) => photo.photoType === 'memory').length > 0) || isOwner) && (
        <section id="photos" className="py-20 bg-gradient-to-b from-white to-soft-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-playfair font-bold text-charcoal mb-6">
                {t('wedding.photos')}
              </h2>
            </div>
            
            {isOwner && (
              <div className="mb-8">
                <PhotoUpload weddingId={wedding.id} />
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {photos.filter((photo: any) => photo.photoType === 'memory').map((photo: any) => (
                <div key={photo.id} className="aspect-square rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                  <img
                    src={photo.url}
                    alt={`Wedding memory ${photo.id}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* RSVP Section */}
      <section id="rsvp" className="py-20 bg-gradient-to-b from-soft-white to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-playfair font-bold text-charcoal mb-6">
              {t('wedding.rsvp')}
            </h2>
            <p className="text-lg text-gray-600">
              {t('wedding.rsvpDescription')}
            </p>
          </div>
          <div className="max-w-2xl mx-auto">
            <RSVPForm weddingId={wedding.id} />
          </div>
        </div>
      </section>

      {/* Comments / Guest Book Section */}
      <section id="guestbook" className="py-20 bg-gradient-to-b from-white to-soft-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-playfair font-bold text-charcoal mb-6">
              {i18n.language === 'uz' ? 'IZOHLAR' : 
               i18n.language === 'ru' ? 'КОММЕНТАРИИ' : 
               'COMMENTS'}
            </h2>
            <p className="text-lg text-gray-600">
              {t('wedding.guestBookDescription')}
            </p>
          </div>

          {/* Guest Book Entries */}
          <div className="space-y-6">
            {guestBookEntries?.length > 0 ? (
              guestBookEntries.map((entry: any) => (
                <div key={entry.id} className="bg-white rounded-2xl shadow-lg p-6 border border-romantic-gold/20">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-romantic-gold/10 rounded-full flex items-center justify-center">
                        <span className="text-romantic-gold font-semibold">
                          {entry.guestName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-semibold text-charcoal">{entry.guestName}</h4>
                        <span className="text-sm text-gray-500">
                          {new Date(entry.createdAt).toLocaleDateString(i18n.language)}
                        </span>
                      </div>
                      <p className="text-charcoal leading-relaxed">{entry.message}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <Heart className="h-16 w-16 text-romantic-gold/50 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">
                  {t('wedding.noMessages')}
                </p>
              </div>
            )}
          </div>

          {/* Guest Book Form */}
          <div className="mt-12">
            <GuestBookForm weddingId={wedding.id} />
          </div>
        </div>
      </section>

      {/* Wedding Details Footer */}
      <footer className="bg-charcoal text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-2xl font-playfair font-bold mb-4">
            {wedding.bride} & {wedding.groom}
          </h3>
          <p className="text-lg mb-6">
            {formatDate(wedding.weddingDate, i18n.language)}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-6 text-white/80">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              <span>{wedding.weddingTime}</span>
            </div>
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2" />
              <span>{wedding.venue}</span>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-white/20">
            <p className="text-white/60 text-sm">
              {t('wedding.poweredBy')} Wedding Management Platform
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
