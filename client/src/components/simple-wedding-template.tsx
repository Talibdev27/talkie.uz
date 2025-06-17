import { useState } from 'react';
import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Clock, MapPin, Heart, Camera, Upload } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { PhotoGallery } from './photo-gallery';
import { RSVPForm } from './rsvp-form';
import { useWeddingLanguage } from '@/hooks/useWeddingLanguage';
import type { Wedding, GuestBookEntry, Photo } from '@shared/schema';

interface SimpleWeddingTemplateProps {
  wedding?: Wedding;
}

export function SimpleWeddingTemplate({ wedding: propWedding }: SimpleWeddingTemplateProps = {}) {
  const params = useParams();
  const weddingUrl = params.uniqueUrl as string;
  const { toast } = useToast();
  
  const [guestName, setGuestName] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch wedding data - use prop if provided, otherwise fetch from API
  const { data: fetchedWedding, isLoading } = useQuery<Wedding>({
    queryKey: [`/api/weddings/url/${weddingUrl}`],
    enabled: !!weddingUrl && !propWedding,
  });

  const wedding = propWedding || fetchedWedding;
  
  // Language system
  const { currentLanguage, availableLanguages, changeLanguage, t } = useWeddingLanguage(wedding);

  // Fetch guest book entries
  const { data: guestBookEntries = [] } = useQuery<GuestBookEntry[]>({
    queryKey: [`/api/guestbook/${wedding?.id}`],
    enabled: !!wedding?.id,
  });

  // Fetch photos for this wedding
  const { data: photos = [] } = useQuery<Photo[]>({
    queryKey: [`/api/photos/wedding/${wedding?.id}`],
    enabled: !!wedding?.id,
  });

  if (isLoading && !propWedding) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!wedding) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Wedding Not Found</h1>
          <p className="text-gray-600">Wedding not found at this URL.</p>
        </div>
      </div>
    );
  }

  const handleGuestBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !message.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/guest-book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          weddingId: wedding.id,
          guestName: guestName.trim(),
          message: message.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit message');
      }

      toast({
        title: "Success",
        description: "Message added successfully!",
      });

      setGuestName('');
      setMessage('');
      
      window.location.reload();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit message",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateStr: string | Date) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('uz-UZ', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Get couple photo from photos
  const couplePhoto = photos.find(photo => photo.photoType === 'couple');
  const memoryPhotos = photos.filter(photo => photo.photoType === 'memory');

  return (
    <div className="min-h-screen bg-white">
      {/* Language Switcher */}
      {availableLanguages.length > 1 && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-white rounded-lg shadow-lg border p-2">
            <select
              value={currentLanguage}
              onChange={(e) => changeLanguage(e.target.value)}
              className="border-0 bg-transparent text-sm font-medium focus:outline-none cursor-pointer"
            >
              {availableLanguages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang === 'uz' && 'O\'zbek'}
                  {lang === 'ru' && 'Русский'}
                  {lang === 'kz' && 'Қазақ'}
                  {lang === 'kaa' && 'Qaraqalpaq'}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
      
      {/* 1. Couple Photo Header - Only show if photo exists */}
      {couplePhoto && (
        <header className="text-center py-10 px-6" style={{ backgroundColor: '#f9f5f2' }}>
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <img
                src={couplePhoto.url}
                alt={`${wedding.bride} va ${wedding.groom}`}
                className="w-full max-h-96 object-cover rounded-lg shadow-lg"
              />
            </div>
          </div>
        </header>
      )}

      {/* 2. Custom Welcome Message */}
      <section className="py-10 px-6 border-b border-gray-200">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8" style={{ color: '#8e4a49' }}>
            {t('welcome_guests')}
          </h2>
          <div className="text-center text-gray-700 leading-relaxed">
            <p>{t('welcome_message_line1')}</p>
            <p>{t('welcome_message_line2')}</p>
          </div>
        </div>
      </section>

      {/* 3. Wedding Details - Centered */}
      <section className="py-10 px-6 border-b border-gray-200">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8" style={{ color: '#8e4a49' }}>
            {t('wedding_details')}
          </h2>
          
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <div>
              <strong className="text-gray-800 block mb-2">{t('couple_names')}</strong>
              <p className="text-lg">{wedding.bride} {t('and_connector')} {wedding.groom}</p>
            </div>
            
            <div>
              <strong className="text-gray-800 block mb-2">{t('wedding_time')}</strong>
              <p className="text-lg">{formatDate(wedding.weddingDate)} / {t('time_at')} {wedding.weddingTime || '19:00'}</p>
            </div>
            
            <div>
              <strong className="text-gray-800 block mb-2">{t('wedding_venue')}</strong>
              <p className="text-lg">{wedding.venue}</p>
              {wedding.venueAddress && <p className="text-gray-600">{wedding.venueAddress}</p>}
              <button 
                className="mt-4 px-6 py-2 rounded text-white font-medium"
                style={{ backgroundColor: '#8e4a49' }}
              >
                {t('open_map')}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Photo Gallery - Only show if photos exist */}
      {memoryPhotos.length > 0 && (
        <section className="py-10 px-6 border-b border-gray-200">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8" style={{ color: '#8e4a49' }}>
              {t('photo_gallery')}
            </h2>
            
            <PhotoGallery weddingId={wedding.id} />
          </div>
        </section>
      )}

      {/* 5. Couple Profiles */}
      <section className="py-10 px-6 border-b border-gray-200">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-gray-700 leading-relaxed">
              Hurmatli mehmon, hayotimizning eng baxtli kunlaridan biri yaqin orada keladi!
            </p>
            <p className="text-gray-700 leading-relaxed">
              Sizni o'sha baxtli kunda biz bilan birga ko'rishni va quvonchimizni baham ko'rishni istaymiz!
            </p>
          </div>
          
          <div className="flex justify-center gap-10 mt-8">
            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-gray-200 mx-auto mb-3 flex items-center justify-center">
                <Heart className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="font-bold text-lg">{wedding.groom}</h3>
            </div>
            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-gray-200 mx-auto mb-3 flex items-center justify-center">
                <Heart className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="font-bold text-lg">{wedding.bride}</h3>
            </div>
          </div>
        </div>
      </section>

      {/* 6. RSVP Section */}
      <section className="py-10 px-6 border-b border-gray-200" style={{ backgroundColor: '#f9f5f2' }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8" style={{ color: '#8e4a49' }}>
            {t('confirmation')}
          </h2>
          
          <RSVPForm weddingId={wedding.id} currentLanguage={currentLanguage} t={t} />
        </div>
      </section>

      {/* 7. Guest Book Section */}
      <section className="py-10 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8" style={{ color: '#8e4a49' }}>
            {t('guest_book')}
          </h2>
          
          {/* Guest book form */}
          <div className="mb-12">
            <Card className="max-w-md mx-auto">
              <CardContent className="pt-6">
                <form onSubmit={handleGuestBookSubmit} className="space-y-4">
                  <div>
                    <Input
                      type="text"
                      placeholder={t('your_name')}
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Textarea
                      placeholder={t('your_message')}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={4}
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full"
                    style={{ backgroundColor: '#8e4a49' }}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? t('submitting') : t('submit')}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
          
          {/* Guest book entries */}
          {guestBookEntries.length > 0 && (
            <div className="space-y-6">
              {guestBookEntries.map((entry) => (
                <Card key={entry.id} className="border border-gray-200 bg-white">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Heart className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 mb-1">{entry.guestName}</div>
                        <p className="text-gray-700 leading-relaxed">{entry.message}</p>
                        <div className="text-sm text-gray-500 mt-2">
                          {new Date(entry.createdAt).toLocaleDateString('uz-UZ')}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}