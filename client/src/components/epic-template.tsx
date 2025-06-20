import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { PhotoUpload } from '@/components/photo-upload';
import { EpicRSVPForm } from '@/components/epic-rsvp-form';
import { GuestBookForm } from '@/components/guest-book-form';
import { EnhancedSocialShare } from '@/components/enhanced-social-share';
import { MapPin, Heart, MessageSquare, Calendar, Music, Clock, Camera, Users } from 'lucide-react';
import type { Wedding, Photo, GuestBookEntry } from '@shared/schema';

interface EpicTemplateProps {
  wedding: Wedding;
}

export function EpicTemplate({ wedding }: EpicTemplateProps) {
  const { t, i18n } = useTranslation();
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });

  // Force language based on wedding settings
  useEffect(() => {
    if (wedding?.defaultLanguage && i18n.language !== wedding.defaultLanguage) {
      console.log('Epic template: Setting language to', wedding.defaultLanguage);
      i18n.changeLanguage(wedding.defaultLanguage);
    }
  }, [wedding?.defaultLanguage, i18n]);

  const { data: photos = [] } = useQuery<Photo[]>({
    queryKey: ['/api/photos/wedding', wedding?.id],
    queryFn: () => fetch(`/api/photos/wedding/${wedding?.id}`).then(res => res.json()),
    enabled: !!wedding?.id,
  });

  const { data: guestBookEntries = [] } = useQuery<GuestBookEntry[]>({
    queryKey: ['/api/guest-book/wedding', wedding?.id],
    queryFn: () => fetch(`/api/guest-book/wedding/${wedding?.id}`).then(res => res.json()),
    enabled: !!wedding?.id,
  });

  useEffect(() => {
    if (!wedding?.weddingDate) return;
    
    const calculateTimeLeft = () => {
      const weddingDateTime = new Date(wedding.weddingDate);
      const now = new Date();
      const difference = weddingDateTime.getTime() - now.getTime();
      
      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        
        setTimeLeft({ days, hours, minutes });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 60000);
    return () => clearInterval(timer);
  }, [wedding?.weddingDate]);

  if (!wedding) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen">
      {/* Navigation - Fixed at top */}
      <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm shadow-lg z-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-center space-x-8 py-4">
            {[
              { id: 'home', label: t('nav.home'), icon: Heart },
              { id: 'rsvp', label: t('nav.rsvp'), icon: Users },
              { id: 'details', label: t('nav.details'), icon: Calendar },
              { id: 'guestbook', label: t('nav.guestbook'), icon: MessageSquare }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => scrollToSection(id)}
                className="flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-300 text-blue-600 hover:bg-blue-50 text-sm font-medium"
              >
                <Icon className="w-4 h-4" />
                <span className="hidden md:inline">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Hero Section - Epic template with card layout */}
      <section id="home" className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-20">
        <div className="w-full max-w-4xl bg-white rounded-[20px] shadow-2xl overflow-hidden">
          
          {/* Photo Section */}
          <div className="h-96 bg-gradient-to-br from-blue-400 to-blue-500 relative flex items-center justify-center overflow-hidden">
            
            {/* Decorative elements */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-5 left-5 w-16 h-16 bg-gradient-to-br from-blue-300 to-blue-400 rounded-full opacity-30 transform rotate-45"></div>
              <div className="absolute top-8 right-8 w-12 h-12 bg-gradient-to-br from-blue-200 to-blue-300 rounded-full opacity-30 transform -rotate-45"></div>
              <div className="absolute bottom-20 left-8 w-10 h-10 bg-gradient-to-br from-green-300 to-blue-300 rounded-full opacity-30 transform rotate-90"></div>
            </div>

            {wedding?.couplePhotoUrl ? (
              <img 
                src={wedding.couplePhotoUrl} 
                alt="Couple" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center border-2 border-dashed border-white/60 rounded-lg bg-white/15 backdrop-blur-sm mx-5 my-5">
                <div className="text-center text-white">
                  <div className="text-5xl mb-4">📷</div>
                  <p className="text-lg font-light">Beautiful memories await</p>
                </div>
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="bg-gradient-to-br from-gray-50 to-white p-10 text-center relative">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full"></div>
            
            <h1 className="text-4xl lg:text-5xl font-light bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent mb-4 tracking-wide">
              {wedding?.bride || 'Bride'} & {wedding?.groom || 'Groom'}
            </h1>
            
            <p className="text-lg text-gray-600 mb-2 italic font-light">
              {wedding?.weddingDate ? format(new Date(wedding.weddingDate), 'd MMMM yyyy') : t('details.dateTBD')}
            </p>

            <div className="flex items-center justify-center mb-8 text-gray-600">
              <Clock className="w-5 h-5 mr-2" />
              {wedding?.weddingTime || '4:00 PM'}
            </div>

            {/* Countdown */}
            <div className="flex justify-center gap-5 mb-8">
              {[
                { value: timeLeft.days, label: t('countdown.days') },
                { value: timeLeft.hours, label: t('countdown.hours') },
                { value: timeLeft.minutes, label: t('countdown.minutes') }
              ].map((item, index) => (
                <div key={index} className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-[15px] p-5 min-w-[80px] shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-white/5 rounded-[15px]"></div>
                  <div className="text-3xl font-bold text-white relative z-10">{item.value}</div>
                  <div className="text-xs text-white/90 uppercase tracking-wider font-medium mt-2 relative z-10">{item.label}</div>
                </div>
              ))}
            </div>

            <div className="inline-block bg-blue-50 text-gray-700 px-6 py-3 rounded-full border-2 border-blue-200 hover:bg-blue-100 hover:-translate-y-1 transition-all duration-300">
              <MapPin className="inline w-4 h-4 mr-2" />
              {wedding?.venue || t('wedding.venue')}
            </div>
          </div>
        </div>
      </section>

      {/* Dear Guests Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-light mb-8 text-gray-800">{t('sections.dearGuests')}</h2>
          
          {wedding?.dearGuestMessage && (
            <div className="max-w-3xl mx-auto">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-blue-100">
                <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-wrap">
                  {wedding.dearGuestMessage}
                </p>
                <div className="mt-6 text-right">
                  <p className="text-blue-600 font-medium">
                    {wedding?.bride} & {wedding?.groom}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* RSVP Section */}
      <section id="rsvp" className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-light mb-4 bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
              {t('rsvp.title')}
            </h2>
            <p className="text-gray-700 max-w-2xl mx-auto text-lg">
              {t('rsvp.subtitle')}
            </p>
          </div>
          
          <div className="max-w-2xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-blue-100">
              <EpicRSVPForm weddingId={wedding.id} />
            </div>
          </div>
        </div>
      </section>

      {/* Wedding Details Section */}
      <section id="details" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-light text-center mb-16 bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
            {t('sections.weddingDetails')}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
            {/* When */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 text-center shadow-lg border border-blue-100">
              <Calendar className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-4 text-gray-800">{t('details.when')}</h3>
              <p className="text-gray-700 text-lg mb-2">
                {wedding?.weddingDate ? format(new Date(wedding.weddingDate), 'd MMMM yyyy') : t('details.dateTBD')}
              </p>
              <p className="text-gray-600">
                {t('details.ceremonyBegins')} {wedding?.weddingTime || '4:00 PM'}
              </p>
            </div>

            {/* Where */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 text-center shadow-lg border border-blue-100">
              <MapPin className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-4 text-gray-800">{t('details.where')}</h3>
              <p className="text-gray-700 text-lg mb-2">{wedding?.venue || t('wedding.venue')}</p>
              <p className="text-gray-600 mb-4">{wedding?.venueAddress}</p>
              <button className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors">
                {t('details.showOnMap')}
              </button>
            </div>
          </div>

          {/* Social Share */}
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-6 text-gray-800">{t('share.title')}</h3>
            <p className="text-gray-600 mb-8">
              {t('share.subtitle')}
            </p>
            <div className="max-w-lg mx-auto">
              <EnhancedSocialShare 
                weddingUrl={`${window.location.origin}/wedding/${wedding.uniqueUrl}`}
                coupleNames={`${wedding.bride} & ${wedding.groom}`}
                weddingDate={format(new Date(wedding.weddingDate), 'MMMM d, yyyy')}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Guest Book Section */}
      <section id="guestbook" className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-light mb-4 bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
              {t('sections.guestBook')}
            </h2>
            <p className="text-gray-700 max-w-2xl mx-auto text-lg">
              {t('guestBook.subtitle')}
            </p>
          </div>
          
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-blue-100">
                <h3 className="text-xl font-semibold mb-6 text-gray-800">{t('guestBook.leaveMessage')}</h3>
                <GuestBookForm weddingId={wedding.id} />
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-blue-100">
                <h3 className="text-xl font-semibold mb-6 text-gray-800">{t('guestBook.messages')}</h3>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {guestBookEntries.length > 0 ? (
                    guestBookEntries.map((entry) => (
                      <div key={entry.id} className="bg-blue-50/80 p-6 rounded-2xl border border-blue-100">
                        <p className="text-gray-700 mb-3">{entry.message}</p>
                        <p className="text-blue-600 font-medium">— {entry.guestName}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 italic">{t('guestBook.noMessages')}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <Heart className="w-8 h-8 text-blue-400 mx-auto mb-4" />
          <h3 className="text-2xl font-light mb-2">
            {wedding?.bride} & {wedding?.groom}
          </h3>
          <p className="text-gray-300 mb-8">
            {t('wedding.thankYouGuests')}
          </p>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 max-w-md mx-auto mb-8">
            <h4 className="text-lg font-medium mb-4">{t('ad.orderInvitation')}</h4>
            <div className="flex justify-center space-x-4">
              <button className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-full transition-colors flex items-center space-x-2">
                <span>Telegram</span>
              </button>
              <button className="bg-pink-600 hover:bg-pink-700 px-6 py-3 rounded-full transition-colors flex items-center space-x-2">
                <span>Instagram</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-center text-gray-400 text-sm">
            <span>{t('footer.poweredBy')}</span>
            <Heart className="inline h-4 w-4 text-blue-400 mx-2" />
            <span className="font-semibold text-blue-400">Taklif</span>
          </div>
        </div>
      </footer>
    </div>
  );
}