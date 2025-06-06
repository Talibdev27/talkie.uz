import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CountdownTimer } from '@/components/countdown-timer';
import { PhotoGallery } from '@/components/photo-gallery';
import { RSVPForm } from '@/components/rsvp-form';
import { LanguageToggle } from '@/components/language-toggle';
import { SocialShare } from '@/components/social-share';
import { WeddingPageLoading } from '@/components/ui/loading';
import { GuestBookForm } from '@/components/guest-book-form';
import { formatDate } from '@/lib/utils';
import { MapPin, Heart, MessageSquare, Calendar } from 'lucide-react';
import type { Wedding, GuestBookEntry } from '@shared/schema';

export default function GuestWeddingView() {
  const { t } = useTranslation();
  const params = useParams();
  const uniqueUrl = params.uniqueUrl as string;

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
              {t('wedding.notFound')}
            </h2>
            <p className="text-charcoal/70">{t('wedding.notFoundDesc')}</p>
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
    bohoGarden: {
      heroImage: "https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080",
      bgGradient: "from-teal-50 to-cyan-50",
      primaryColor: "#0D9488",
      accentColor: "#F59E0B",
      textColor: "text-teal-900",
      cardBg: "bg-teal-50/95 border border-teal-200",
      overlayBg: "bg-teal-900/40"
    }
  };

  const config = templateConfigs[wedding.template as keyof typeof templateConfigs] || templateConfigs.gardenRomance;

  return (
    <div className={`min-h-screen bg-gradient-to-br ${config.bgGradient}`}>
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-50 p-6">
        <div className="flex justify-between items-center">
          <div className="text-white">
            <h1 className="text-2xl font-playfair font-bold">
              {wedding.bride.split(' ')[0]} & {wedding.groom.split(' ')[0]}
            </h1>
          </div>
          <LanguageToggle />
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${config.heroImage})` }}
        />
        <div className={`absolute inset-0 ${config.overlayBg}`} />
        
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-5xl lg:text-7xl font-playfair font-bold mb-4">
            {wedding.bride} & {wedding.groom}
          </h1>
          <p className="text-xl lg:text-2xl mb-8 opacity-90">
            {formatDate(wedding.weddingDate)}
          </p>
          <p className="text-lg lg:text-xl mb-12 opacity-80">
            {wedding.venue}
          </p>
          
          <CountdownTimer targetDate={wedding.weddingDate} className="mb-8" />
          
          <Button 
            size="lg" 
            className="wedding-button text-lg px-8 py-4"
            onClick={() => document.getElementById('rsvp')?.scrollIntoView({ behavior: 'smooth' })}
          >
            {t('wedding.rsvpNow')}
          </Button>
        </div>
      </section>

      {/* Our Story Section */}
      <section id="story" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-playfair font-bold text-charcoal">
              {t('wedding.ourStory')}
            </h2>
            <p className="mt-4 text-lg text-charcoal opacity-70">
              {t('wedding.ourStorySubtitle')}
            </p>
          </div>

          {wedding.story && (
            <div className={`prose prose-lg max-w-none ${config.textColor} opacity-80 leading-relaxed text-center`}>
              <p className="text-lg">{wedding.story}</p>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-12 items-center mt-12">
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
              <div className={`${config.cardBg} p-6 rounded-xl`}>
                <h3 className="font-playfair font-semibold text-xl text-charcoal mb-4">
                  {t('wedding.ceremony')}
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center text-charcoal opacity-80">
                    <Calendar className="h-5 w-5 mr-3 text-romantic-gold" />
                    <span>{formatDate(wedding.weddingDate)}</span>
                  </div>
                  <div className="flex items-center text-charcoal opacity-80">
                    <MapPin className="h-5 w-5 mr-3 text-romantic-gold" />
                    <span>{wedding.venue}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Photo Gallery Section */}
      <section id="photos" className={`py-20 bg-gradient-to-br ${config.bgGradient}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-playfair font-bold text-charcoal">
              {t('wedding.ourMemories')}
            </h2>
            <p className="mt-4 text-lg text-charcoal opacity-70">
              {t('wedding.capturingJourney')}
            </p>
          </div>
          
          <PhotoGallery weddingId={wedding.id} />
        </div>
      </section>

      {/* Wedding Details Section */}
      <section id="details" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-playfair font-bold text-charcoal">
              {t('wedding.details')}
            </h2>
            <p className="mt-4 text-lg text-charcoal opacity-70">
              {t('wedding.detailsSubtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className={`${config.cardBg} border-0`}>
              <CardContent className="p-8">
                <div className="text-center">
                  <MapPin className="h-12 w-12 text-romantic-gold mx-auto mb-4" />
                  <h3 className="text-xl font-playfair font-semibold text-charcoal mb-4">
                    {t('wedding.venue')}
                  </h3>
                  <p className="text-charcoal font-medium text-lg mb-2">{wedding.venue}</p>
                  <p className="text-charcoal opacity-70 mb-6">{wedding.venueAddress}</p>
                  <Button variant="outline" className="mt-4 wedding-button-outline">
                    {t('wedding.viewOnMap')}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className={`${config.cardBg} border-0`}>
              <CardContent className="p-8">
                <div className="text-center">
                  <Calendar className="h-12 w-12 text-romantic-gold mx-auto mb-4" />
                  <h3 className="text-xl font-playfair font-semibold text-charcoal mb-4">
                    {t('wedding.dateTime')}
                  </h3>
                  <p className="text-charcoal font-medium text-lg mb-2">
                    {formatDate(wedding.weddingDate)}
                  </p>
                  <p className="text-charcoal opacity-70 mb-6">
                    {t('wedding.ceremonyTime')}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
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
              {t('wedding.rsvpSubtitle')}
            </p>
          </div>
          
          <RSVPForm weddingId={wedding.id} />
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

          {/* Guest Book Form */}
          <div className="mb-12">
            <GuestBookForm 
              weddingId={wedding.id} 
              coupleName={`${wedding.bride} & ${wedding.groom}`}
            />
          </div>

          {/* Guest Book Messages Display */}
          <div className="space-y-6">
            {guestBookEntries.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="h-16 w-16 text-romantic-gold mx-auto mb-4" />
                <p className="text-charcoal opacity-70 text-lg">
                  {t('wedding.noMessagesYet')}
                </p>
              </div>
            ) : (
              guestBookEntries.map((entry) => (
                <Card key={entry.id} className={`${config.cardBg} border-0`}>
                  <CardContent className="p-6">
                    <p className="text-charcoal mb-4 italic">"{entry.message}"</p>
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium text-charcoal">{entry.guestName}</span>
                      <span className="text-charcoal opacity-60">
                        {formatDate(entry.createdAt)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}