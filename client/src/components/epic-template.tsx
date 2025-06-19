import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { PhotoUpload } from '@/components/photo-upload';
import { RSVPForm } from '@/components/rsvp-form';
import { GuestBookForm } from '@/components/guest-book-form';
import { EnhancedSocialShare } from '@/components/enhanced-social-share';
import { MapPin, Heart, MessageSquare, Calendar, Music, Clock, Camera, Users } from 'lucide-react';
import type { Wedding, Photo, GuestBookEntry } from '@shared/schema';

interface EpicTemplateProps {
  wedding: Wedding;
}

export function EpicTemplate({ wedding }: EpicTemplateProps) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });

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
              { id: 'home', label: 'Дорогие гости', icon: Heart },
              { id: 'rsvp', label: 'Пожалуйста, подтвердите ваше присутствие', icon: Users },
              { id: 'details', label: 'Детали свадьбы', icon: Calendar },
              { id: 'guestbook', label: 'Книга гостей', icon: MessageSquare }
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

      {/* Hero Section - Full screen with couple photo and countdown */}
      <section id="home" className="min-h-screen relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          {wedding?.couplePhotoUrl ? (
            <div className="relative w-full h-full">
              <img 
                src={wedding.couplePhotoUrl} 
                alt="Couple" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70"></div>
            </div>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900"></div>
          )}
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 flex items-center justify-center min-h-screen text-center text-white px-4">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-light mb-4 tracking-wide">
              {wedding?.bride || 'Bride'} & {wedding?.groom || 'Groom'}
            </h1>
            
            <p className="text-lg md:text-xl mb-8 opacity-90 font-light">
              {wedding?.weddingDate ? format(new Date(wedding.weddingDate), 'd MMMM yyyy г.') : 'Date TBD'}
            </p>

            <div className="flex items-center justify-center mb-8 text-lg opacity-90">
              <Clock className="w-5 h-5 mr-2" />
              {wedding?.weddingTime || '4:00 PM'}
            </div>

            {/* Countdown */}
            <div className="flex justify-center gap-6 mb-8">
              {[
                { value: timeLeft.days, label: 'DAYS' },
                { value: timeLeft.hours, label: 'HOURS' },
                { value: timeLeft.minutes, label: 'MINUTES' }
              ].map((item, index) => (
                <div key={index} className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 min-w-[80px] border border-white/30">
                  <div className="text-3xl font-bold">{item.value}</div>
                  <div className="text-xs uppercase tracking-wider opacity-80 mt-1">{item.label}</div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center text-lg opacity-90">
              <MapPin className="w-5 h-5 mr-2" />
              {wedding?.venue || 'Wedding Venue'}
            </div>
          </div>
        </div>
      </section>

      {/* Dear Guests Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-light mb-8 text-gray-800">Дорогие гости</h2>
          
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
      <section id="rsvp" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-light mb-4 text-gray-800">
              Пожалуйста, подтвердите ваше присутствие
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Мы не можем дождаться празднования с вами!
            </p>
          </div>
          
          <div className="max-w-2xl mx-auto">
            <RSVPForm weddingId={wedding.id} />
          </div>
        </div>
      </section>

      {/* Wedding Details Section */}
      <section id="details" className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-light text-center mb-16 text-gray-800">
            Детали свадьбы
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
            {/* When */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 text-center shadow-lg border border-blue-100">
              <Calendar className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Когда</h3>
              <p className="text-gray-700 text-lg mb-2">
                {wedding?.weddingDate ? format(new Date(wedding.weddingDate), 'd MMMM yyyy г.') : 'Date TBD'}
              </p>
              <p className="text-gray-600">
                wedding.ceremony begins {wedding?.weddingTime || '4:00 PM'}
              </p>
            </div>

            {/* Where */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 text-center shadow-lg border border-blue-100">
              <MapPin className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Где</h3>
              <p className="text-gray-700 text-lg mb-2">{wedding?.venue || 'Wedding Venue'}</p>
              <p className="text-gray-600 mb-4">{wedding?.venueAddress}</p>
              <button className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors">
                Показать на карте
              </button>
            </div>
          </div>

          {/* Social Share */}
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-6 text-gray-800">Поделитесь нашей свадьбой</h3>
            <p className="text-gray-600 mb-8">
              Расскажите друзьям и семье о нашем особенном дне
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
      <section id="guestbook" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-light mb-4 text-gray-800">
              Книга гостей
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Оставьте нам сообщение, чтобы сделать наш день еще более особенным
            </p>
          </div>
          
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div>
                <GuestBookForm weddingId={wedding.id} />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-6">Сообщения от близких</h3>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {guestBookEntries.length > 0 ? (
                    guestBookEntries.map((entry) => (
                      <div key={entry.id} className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                        <p className="text-gray-700 mb-3">{entry.message}</p>
                        <p className="text-blue-600 font-medium">— {entry.guestName}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 italic">Пока нет сообщений. Станьте первым!</p>
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
            Спасибо за участие в нашем особенном дне
          </p>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 max-w-md mx-auto mb-8">
            <h4 className="text-lg font-medium mb-4">Order a website invitation</h4>
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
            <span>Powered by</span>
            <Heart className="inline h-4 w-4 text-blue-400 mx-2" />
            <span className="font-semibold text-blue-400">Taklif</span>
          </div>
        </div>
      </footer>
    </div>
  );
}