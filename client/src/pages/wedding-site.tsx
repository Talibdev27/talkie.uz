import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useParams } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CountdownTimer } from '@/components/countdown-timer';
import { PhotoGallery } from '@/components/photo-gallery';
import { PhotoUpload } from '@/components/photo-upload';
import { SmartImageUpload } from '@/components/smart-image-upload';
import { GuestManagementDashboard } from '@/components/guest-management-dashboard';
import { RSVPForm } from '@/components/rsvp-form';
import { LanguageToggle } from '@/components/language-toggle';
import { SocialShare } from '@/components/social-share';
import { WeddingPageLoading } from '@/components/ui/loading';
import { formatDate } from '@/lib/utils';
import { MapPin, Heart, MessageSquare, Calendar, Music } from 'lucide-react';
import type { Wedding, GuestBookEntry } from '@shared/schema';

export default function WeddingSite() {
  const { t } = useTranslation();
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
    }
  };

  const currentTemplate = wedding.template || 'gardenRomance';
  const config = templateConfigs[currentTemplate as keyof typeof templateConfigs] || templateConfigs.gardenRomance;

  const customStyles = {
    '--primary': config.primaryColor,
    '--accent': config.accentColor,
  } as React.CSSProperties;

  return (
    <div className={`min-h-screen bg-gradient-to-br ${config.bgGradient}`} style={customStyles}>
      {/* Header with Language Toggle */}
      <div className="absolute top-4 right-4 z-50">
        <LanguageToggle />
      </div>

      {/* Hero Section */}
      <section className="relative h-screen overflow-hidden">
        <img
          src={config.heroImage}
          alt="Wedding venue"
          className="w-full h-full object-cover"
        />
        <div className={`absolute inset-0 ${config.overlayBg}`}></div>
        <div className="absolute inset-0 flex items-center justify-center text-center text-white">
          <div className="max-w-2xl px-4">
            <h1 className="text-4xl md:text-6xl font-playfair font-bold mb-4 text-shadow">
              {wedding.bride} & {wedding.groom}
            </h1>
            <p className="text-xl md:text-2xl font-cormorant mb-8 text-shadow">
              {formatDate(wedding.weddingDate)}
            </p>
            <CountdownTimer targetDate={wedding.weddingDate} className="mb-8" />
            <div className="flex items-center justify-center text-white opacity-90">
              <MapPin className="h-5 w-5 mr-2" />
              <span className="text-lg">{wedding.venue}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation */}
      <nav className="sticky top-0 bg-white shadow-md z-40">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex justify-center space-x-8 py-4">
            <a href="#story" className="text-charcoal hover:text-romantic-gold transition-colors font-medium">
              {t('wedding.ourStory')}
            </a>
            <a href="#photos" className="text-charcoal hover:text-romantic-gold transition-colors font-medium">
              {t('wedding.photos')}
            </a>
            <a href="#rsvp" className="text-charcoal hover:text-romantic-gold transition-colors font-medium">
              {t('wedding.rsvp')}
            </a>
            <a href="#details" className="text-charcoal hover:text-romantic-gold transition-colors font-medium">
              {t('wedding.weddingDetails')}
            </a>
            <a href="#guestbook" className="text-charcoal hover:text-romantic-gold transition-colors font-medium">
              {t('wedding.guestBook')}
            </a>
          </div>
        </div>
      </nav>

      {/* Our Story Section */}
      <section id="story" className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`text-3xl lg:text-4xl font-playfair font-bold ${config.textColor} mb-6`}>
              {t('wedding.ourStory')}
            </h2>
            {wedding.story && (
              <div className={`prose prose-lg max-w-none ${config.textColor} opacity-80 leading-relaxed`}>
                <p>{wedding.story}</p>
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="rounded-xl shadow-lg w-full aspect-[4/3] bg-sage-green/10 flex items-center justify-center">
                <div className="text-center p-8">
                  <Heart className="h-16 w-16 text-romantic-gold mx-auto mb-4" />
                  <p className="text-charcoal opacity-70">
                    {wedding.bride.split(' ')[0]} & {wedding.groom.split(' ')[0]}
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="text-center">
                <Heart className="h-12 w-12 text-romantic-gold mx-auto mb-4" />
                <h3 className="text-xl font-playfair font-semibold text-charcoal mb-4">
                  {t('demo.howWeMet')}
                </h3>
                <p className="text-charcoal opacity-70 leading-relaxed">
                  {t('demo.howWeMetText')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Photo Gallery Section */}
      <section id="photos" className="py-20 bg-soft-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-playfair font-bold text-charcoal">
              {t('wedding.photos')}
            </h2>
            <p className="mt-4 text-lg text-charcoal opacity-70">
              {t('wedding.capturingJourney')}
            </p>
            
            {/* Enhanced Photo Upload Options - Only visible to wedding owners */}
            {isOwner && (
              <div className="mt-6 flex gap-3 justify-center">
                <PhotoUpload 
                  weddingId={wedding.id} 
                  isOwner={true}
                  onSuccess={() => {
                    // Photos will automatically refresh via React Query
                  }}
                />
                <SmartImageUpload 
                  weddingId={wedding.id} 
                  isOwner={true}
                  onSuccess={() => {
                    // Photos will automatically refresh via React Query
                  }}
                />
              </div>
            )}
          </div>
          
          <PhotoGallery weddingId={wedding.id} />
        </div>
      </section>

      {/* RSVP Section */}
      <section id="rsvp" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-playfair font-bold text-charcoal">
              {t('wedding.rsvp')}
            </h2>
            <p className="mt-4 text-lg text-charcoal opacity-70">
              {t('wedding.cantWaitToCelebrate')}
            </p>
          </div>
          
          <RSVPForm weddingId={wedding.id} />
        </div>
      </section>

      {/* Wedding Details Section */}
      <section id="details" className="py-20 bg-soft-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-playfair font-bold text-charcoal">
              {t('wedding.weddingDetails')}
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="wedding-card">
              <CardContent className="p-8 text-center">
                <Calendar className="h-12 w-12 text-romantic-gold mx-auto mb-4" />
                <h3 className="text-xl font-playfair font-semibold text-charcoal mb-2">
                  {t('wedding.when')}
                </h3>
                <p className="text-lg text-charcoal">
                  {formatDate(wedding.weddingDate)}
                </p>
                <p className="text-charcoal opacity-70 mt-2">
                  {t('wedding.ceremonyTime')}
                </p>
              </CardContent>
            </Card>

            <Card className="wedding-card">
              <CardContent className="p-8 text-center">
                <MapPin className="h-12 w-12 text-romantic-gold mx-auto mb-4" />
                <h3 className="text-xl font-playfair font-semibold text-charcoal mb-2">
                  {t('wedding.where')}
                </h3>
                <p className="text-lg text-charcoal font-medium">
                  {wedding.venue}
                </p>
                <p className="text-charcoal opacity-70 mt-2">
                  {wedding.venueAddress}
                </p>
                <Button variant="outline" className="mt-4 wedding-button-outline">
                  {t('wedding.viewOnMap')}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Social Share Section */}
      <section className="py-16 bg-sage-green/5">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <SocialShare
            title={`${wedding.bride.split(' ')[0]} & ${wedding.groom.split(' ')[0]}'s Wedding`}
            url={`/wedding/${wedding.uniqueUrl}`}
            description={`Join us for our special day on ${formatDate(wedding.weddingDate)} at ${wedding.venue}. We can't wait to celebrate with you!`}
          />
        </div>
      </section>

      {/* Guest Book Section */}
      <section id="guestbook" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-playfair font-bold text-charcoal">
              {t('wedding.guestBook')}
            </h2>
            <p className="mt-4 text-lg text-charcoal opacity-70">
              {t('wedding.guestBookSubtitle')}
            </p>
          </div>

          <div className="space-y-8">
            {guestBookEntries.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xl font-playfair font-semibold text-charcoal">{t('wedding.messagesFromLovedOnes')}</h3>
                {guestBookEntries.slice(0, 5).map((entry) => (
                  <Card key={entry.id} className="wedding-card">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <MessageSquare className="h-6 w-6 text-romantic-gold mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-charcoal italic leading-relaxed">
                            "{entry.message}"
                          </p>
                          <p className="text-romantic-gold font-medium mt-2">
                            — {entry.guestName}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Background Music */}
      {wedding.backgroundMusicUrl && (
        <div className="fixed bottom-4 right-4 z-50">
          <Button size="icon" className="rounded-full bg-romantic-gold hover:bg-opacity-90 shadow-lg">
            <Music className="h-5 w-5" />
          </Button>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-charcoal text-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <Heart className="h-8 w-8 text-romantic-gold mr-2" />
            <span className="text-2xl font-playfair font-semibold">
              {wedding.bride} & {wedding.groom}
            </span>
          </div>
          <p className="text-gray-300">
            {t('wedding.thankYouGuests')}
          </p>
          <p className="text-gray-400 text-sm mt-4">
            {t('wedding.createdWith')} <Heart className="inline h-4 w-4 text-romantic-gold mx-1" /> {t('wedding.using')}
          </p>
        </div>
      </footer>
    </div>
  );
}
