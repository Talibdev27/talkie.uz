import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Heart, MessageSquare, Calendar, Clock, ExternalLink } from 'lucide-react';
import { RSVPForm } from '@/components/rsvp-form';
import { GuestBookForm } from '@/components/guest-book-form';
import { PhotoGallery } from '@/components/photo-gallery';
import { EnhancedSocialShare } from '@/components/enhanced-social-share';
import { formatDate } from '@/lib/utils';
import type { Wedding, GuestBookEntry } from '@shared/schema';

interface StandardWeddingTemplateProps {
  wedding: Wedding;
  photos: any[];
  guestBookEntries: GuestBookEntry[];
  isOwner: boolean;
}

interface TemplateConfig {
  couple: {
    names: string;
    photo: string;
    enableGallery: boolean;
    enableSocial: boolean;
    enableGiftRegistry: boolean;
    enableAccommodation: boolean;
    enableTransportation: boolean;
  };
  wedding: {
    date: string;
    location: {
      name: string;
      address: string;
      mapLink: string;
    };
  };
}

export function StandardWeddingTemplate({ 
  wedding, 
  photos, 
  guestBookEntries, 
  isOwner 
}: StandardWeddingTemplateProps) {
  const { t, i18n } = useTranslation();

  // Template configuration - can be customized per wedding
  const templateConfig: TemplateConfig = {
    couple: {
      names: `${wedding.bride} & ${wedding.groom}`,
      photo: wedding.couplePhotoUrl || photos.find(p => p.photoType === 'couple')?.url || '',
      enableGallery: true,
      enableSocial: false,
      enableGiftRegistry: false,
      enableAccommodation: false,
      enableTransportation: false
    },
    wedding: {
      date: formatDate(wedding.weddingDate, i18n.language),
      location: {
        name: wedding.venue,
        address: wedding.venueAddress,
        mapLink: wedding.venueCoordinates 
          ? `https://maps.google.com/?q=${wedding.venueCoordinates.lat},${wedding.venueCoordinates.lng}`
          : '#'
      }
    }
  };

  // Get couple photo with elegant fallback
  const getCouplePhoto = () => {
    if (templateConfig.couple.photo) {
      return templateConfig.couple.photo;
    }
    // Elegant geometric pattern fallback
    return "data:image/svg+xml,%3Csvg width='800' height='450' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3ClinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23D4B08C;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%2389916B;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='800' height='450' fill='url(%23grad)'/%3E%3Cpath d='M0 225 L400 0 L800 225 L400 450 Z' fill='%23fff' opacity='0.1'/%3E%3C/svg%3E";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white font-open-sans">
      
      {/* MANDATORY SECTION 1: Header with Large Couple Photo */}
      <header className="relative h-screen w-full overflow-hidden">
        <img
          src={getCouplePhoto()}
          alt={templateConfig.couple.names}
          className="w-full h-full object-cover object-center"
          style={{ aspectRatio: '16/9' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/50"></div>
        
        {/* Centered content */}
        <div className="absolute inset-0 flex items-center justify-center text-center text-white">
          <div className="max-w-4xl px-6 bg-black/40 backdrop-blur-sm rounded-3xl py-12 px-12">
            {/* Couple Names (h1) */}
            <h1 className="text-5xl md:text-7xl font-playfair font-bold mb-6 text-white drop-shadow-2xl tracking-wide">
              {templateConfig.couple.names}
            </h1>
            
            {/* Wedding Date & Time */}
            <div className="text-2xl md:text-3xl font-light mb-4 text-white/95 drop-shadow-xl">
              <div className="flex items-center justify-center gap-3 mb-2">
                <Calendar className="w-6 h-6" />
                <span>{templateConfig.wedding.date}</span>
              </div>
              <div className="flex items-center justify-center gap-3">
                <Clock className="w-6 h-6" />
                <span>{wedding.weddingTime || '4:00 PM'}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* MANDATORY SECTION 2: Welcome Message */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white shadow-lg border border-gray-200 rounded-2xl p-12">
            <div className="max-w-3xl mx-auto">
              {/* Formal invitation text */}
              <div className="text-gray-900 text-lg md:text-xl leading-relaxed font-light">
                {wedding.welcomeMessage || 
                 wedding.welcomeMessageUz || 
                 `${t('wedding.welcomeDefault', { 
                   bride: wedding.bride, 
                   groom: wedding.groom 
                 })}`}
              </div>
              
              {/* Decorative divider */}
              <div className="flex items-center justify-center my-8">
                <div className="text-3xl text-gray-400 font-light tracking-wider">
                  ⚭⚭⚭
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MANDATORY SECTION 3: Wedding Details */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white shadow-lg border border-gray-200 rounded-2xl p-12">
            {/* Section title */}
            <h2 className="text-3xl md:text-4xl font-playfair font-bold text-gray-900 text-center mb-12">
              {t('wedding.aboutTitle')}
            </h2>
            
            <div className="grid md:grid-cols-2 gap-12">
              {/* Family names */}
              <div className="text-center">
                <h3 className="text-2xl font-playfair font-semibold text-gray-800 mb-4">
                  {t('wedding.families')}
                </h3>
                <div className="space-y-2 text-lg text-gray-700">
                  <p className="font-medium">{wedding.bride}</p>
                  <p className="text-gray-500">&</p>
                  <p className="font-medium">{wedding.groom}</p>
                </div>
              </div>
              
              {/* Date & time confirmation + Location */}
              <div className="text-center">
                <h3 className="text-2xl font-playfair font-semibold text-gray-800 mb-4">
                  {t('wedding.whenWhere')}
                </h3>
                <div className="space-y-4 text-lg text-gray-700">
                  <div className="flex items-center justify-center gap-2">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <span>{templateConfig.wedding.date}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Clock className="w-5 h-5 text-gray-500" />
                    <span>{wedding.weddingTime || '4:00 PM'}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <MapPin className="w-5 h-5 text-gray-500" />
                    <div className="text-center">
                      <div className="font-medium">{templateConfig.wedding.location.name}</div>
                      <div className="text-sm text-gray-600">{templateConfig.wedding.location.address}</div>
                    </div>
                  </div>
                  {/* Map link */}
                  <a
                    href={templateConfig.wedding.location.mapLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors mt-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    {t('wedding.viewMap')}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MANDATORY SECTION 4: RSVP Section */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white shadow-lg border border-gray-200 rounded-2xl p-12">
            <h2 className="text-3xl md:text-4xl font-playfair font-bold text-gray-900 text-center mb-12">
              {t('wedding.rsvpTitle')}
            </h2>
            <RSVPForm weddingId={wedding.id} />
          </div>
        </div>
      </section>

      {/* OPTIONAL SECTION: Photo Gallery */}
      {templateConfig.couple.enableGallery && photos.length > 0 && (
        <section className="py-16 px-6 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-playfair font-bold text-gray-900 text-center mb-12">
              {t('wedding.gallery')}
            </h2>
            <PhotoGallery weddingId={wedding.id} />
          </div>
        </section>
      )}

      {/* OPTIONAL SECTION: Social Media Sharing */}
      {templateConfig.couple.enableSocial && (
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-playfair font-bold text-gray-900 mb-8">
              {t('wedding.shareJoy')}
            </h2>
            <div className="flex justify-center gap-4">
              <Button variant="outline" className="flex items-center gap-2">
                <Heart className="w-4 h-4" />
                Share on Facebook
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Share on WhatsApp
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* MANDATORY SECTION 5: Comments (Guest Book) */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white shadow-lg border border-gray-200 rounded-2xl p-12">
            <h2 className="text-3xl md:text-4xl font-playfair font-bold text-gray-900 text-center mb-12">
              {t('wedding.guestBook')}
            </h2>
            
            {/* Guest book form */}
            <div className="mb-12">
              <GuestBookForm weddingId={wedding.id} />
            </div>
            
            {/* Guest book entries */}
            {guestBookEntries.length > 0 && (
              <div className="space-y-6">
                <h3 className="text-xl font-playfair font-semibold text-gray-800 text-center mb-8">
                  {t('wedding.messages')}
                </h3>
                <div className="space-y-6">
                  {guestBookEntries.map((entry) => (
                    <Card key={entry.id} className="border border-gray-200">
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <MessageSquare className="w-5 h-5 text-gray-600" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 mb-1">{entry.guestName}</div>
                            <p className="text-gray-700 leading-relaxed">{entry.message}</p>
                            <div className="text-sm text-gray-500 mt-2">
                              {new Date(entry.createdAt).toLocaleDateString(i18n.language)}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-gray-900 text-white text-center">
        <div className="max-w-4xl mx-auto">
          <div className="text-2xl font-playfair font-light mb-4">
            {templateConfig.couple.names}
          </div>
          <div className="text-gray-400">
            {templateConfig.wedding.date} • {templateConfig.wedding.location.name}
          </div>
        </div>
      </footer>
    </div>
  );
}