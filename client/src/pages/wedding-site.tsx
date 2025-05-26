import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useParams } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CountdownTimer } from '@/components/countdown-timer';
import { PhotoGallery } from '@/components/photo-gallery';
import { RSVPForm } from '@/components/rsvp-form';
import { LanguageToggle } from '@/components/language-toggle';
import { formatDate } from '@/lib/utils';
import { MapPin, Heart, MessageSquare, Calendar, Music } from 'lucide-react';
import type { Wedding, GuestBookEntry } from '@shared/schema';

export default function WeddingSite() {
  const { t } = useTranslation();
  const params = useParams();
  const uniqueUrl = params.uniqueUrl as string;

  const { data: wedding, isLoading, error } = useQuery<Wedding>({
    queryKey: ['/api/weddings/url', uniqueUrl],
    enabled: !!uniqueUrl,
  });

  const { data: guestBookEntries = [] } = useQuery<GuestBookEntry[]>({
    queryKey: ['/api/guest-book/wedding', wedding?.id],
    enabled: !!wedding?.id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-soft-white">
        <Skeleton className="h-96 w-full" />
        <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
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

  const customStyles = {
    '--primary': wedding.primaryColor,
    '--accent': wedding.accentColor,
  } as React.CSSProperties;

  return (
    <div className="min-h-screen bg-white" style={customStyles}>
      {/* Header with Language Toggle */}
      <div className="absolute top-4 right-4 z-50">
        <LanguageToggle />
      </div>

      {/* Hero Section */}
      <section className="relative h-screen overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080"
          alt="Wedding venue"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
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
      <section id="story" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-playfair font-bold text-charcoal mb-6">
              {t('wedding.ourStory')}
            </h2>
            {wedding.story && (
              <div className="prose prose-lg max-w-none text-charcoal opacity-80 leading-relaxed">
                <p>{wedding.story}</p>
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <img
                src="https://images.unsplash.com/photo-1606216794074-735e91aa2c92?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"
                alt="Couple's engagement photo"
                className="rounded-xl shadow-lg w-full h-auto"
              />
            </div>
            <div className="space-y-6">
              <div className="text-center">
                <Heart className="h-12 w-12 text-romantic-gold mx-auto mb-4" />
                <h3 className="text-xl font-playfair font-semibold text-charcoal mb-4">
                  How We Met
                </h3>
                <p className="text-charcoal opacity-70 leading-relaxed">
                  Every love story is special, and ours began in the most unexpected way...
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
              Capturing our journey together
            </p>
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
              We can't wait to celebrate with you!
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
                  When
                </h3>
                <p className="text-lg text-charcoal">
                  {formatDate(wedding.weddingDate)}
                </p>
                <p className="text-charcoal opacity-70 mt-2">
                  Ceremony begins at 4:00 PM
                </p>
              </CardContent>
            </Card>

            <Card className="wedding-card">
              <CardContent className="p-8 text-center">
                <MapPin className="h-12 w-12 text-romantic-gold mx-auto mb-4" />
                <h3 className="text-xl font-playfair font-semibold text-charcoal mb-2">
                  Where
                </h3>
                <p className="text-lg text-charcoal font-medium">
                  {wedding.venue}
                </p>
                <p className="text-charcoal opacity-70 mt-2">
                  {wedding.venueAddress}
                </p>
                <Button variant="outline" className="mt-4 wedding-button-outline">
                  View on Map
                </Button>
              </CardContent>
            </Card>
          </div>
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
              Leave us a message to make our day even more special
            </p>
          </div>

          <div className="space-y-8">
            {guestBookEntries.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xl font-playfair font-semibold text-charcoal">Messages from our loved ones</h3>
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
            Thank you for being part of our special day
          </p>
          <p className="text-gray-400 text-sm mt-4">
            Created with <Heart className="inline h-4 w-4 text-romantic-gold mx-1" /> using LoveStory
          </p>
        </div>
      </footer>
    </div>
  );
}
