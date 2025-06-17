import { useState, useEffect } from 'react';
import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Clock, MapPin, MessageSquare, Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';


interface Wedding {
  id: number;
  bride: string;
  groom: string;
  weddingDate: string | Date;
  weddingTime?: string;
  venue?: string;
  venueAddress?: string;
}

interface GuestBookEntry {
  id: number;
  guestName: string;
  message: string;
  createdAt: string;
}

function GuestBookForm({ weddingId }: { weddingId: number }) {
  const [guestName, setGuestName] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !message.trim()) {
      toast({
        title: "Xatolik",
        description: "Iltimos, barcha maydonlarni to'ldiring",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/guest-book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          weddingId,
          guestName: guestName.trim(),
          message: message.trim()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit message');
      }

      toast({
        title: "Muvaffaqiyat",
        description: "Xabaringiz qo'shildi!",
      });

      setGuestName('');
      setMessage('');
      
      // Refresh the page to show new entry
      window.location.reload();
    } catch (error) {
      toast({
        title: "Xatolik",
        description: "Xabar yuborishda xatolik yuz berdi",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              placeholder="Ismingiz"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          <div>
            <Textarea
              placeholder="Xabar yozing..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={isSubmitting}
              rows={4}
            />
          </div>
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Yuborilmoqda...' : 'Yuborish'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

interface SimpleWeddingTemplateProps {
  wedding?: Wedding;
}

export function SimpleWeddingTemplate({ wedding: passedWedding }: SimpleWeddingTemplateProps = {}) {
  const { weddingUrl } = useParams();

  const { data: fetchedWedding, isLoading: weddingLoading } = useQuery<Wedding>({
    queryKey: ['/api/weddings/url', weddingUrl],
    enabled: !passedWedding && !!weddingUrl,
  });

  const wedding = passedWedding || fetchedWedding;

  const { data: guestBookEntries = [], isLoading: entriesLoading } = useQuery<GuestBookEntry[]>({
    queryKey: ['/api/guest-book/wedding', wedding?.id],
    enabled: !!wedding?.id,
  });

  if (!passedWedding && weddingLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Yuklanmoqda...</div>
      </div>
    );
  }

  if (!wedding) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">To'y topilmadi</div>
      </div>
    );
  }

  const formatDate = (dateStr: string | Date) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('uz-UZ', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* 1. Couple Photo Header */}
      <header className="text-center py-10 px-6" style={{ backgroundColor: '#f9f5f2' }}>
        <div className="max-w-4xl mx-auto">
          <img
            src="/uploads/couple-photo.jpg"
            alt={`${wedding.bride} va ${wedding.groom}`}
            className="w-full max-h-96 object-cover rounded-lg mb-5"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      </header>

      {/* 2. Custom Welcome Message */}
      <section className="py-10 px-6 border-b border-gray-200">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8" style={{ color: '#8e4a49' }}>
            Aziz mehmonlar!
          </h2>
          <div className="text-center text-gray-700 leading-relaxed">
            <p>Sizni {wedding.bride} va {wedding.groom}ning nikoh to'yiga taklif qilamiz...</p>
            <p>Qalblar ezguliklarga to'la bo'lgan ushbu qutlug' kunda do'stlar yonida bo'ling!</p>
          </div>
        </div>
      </section>

      {/* 3. Wedding Details with Countdown */}
      <section className="py-10 px-6 border-b border-gray-200">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8" style={{ color: '#8e4a49' }}>
            To'y haqida
          </h2>
          
          <div className="space-y-6">
            <div>
              <strong className="text-gray-800">To'y egalari:</strong>
              <p className="mt-1">{wedding.bride} va {wedding.groom}</p>
            </div>
            
            <div>
              <strong className="text-gray-800">Bayramni boshlash vaqti:</strong>
              <p className="mt-1">{formatDate(wedding.weddingDate)} / soat {wedding.weddingTime || '19:00'}</p>
            </div>
            
            <div>
              <strong className="text-gray-800">To'y manzili:</strong>
              <p className="mt-1">{wedding.venue}</p>
              {wedding.venueAddress && <p className="text-gray-600">{wedding.venueAddress}</p>}
              <button 
                className="mt-3 px-6 py-2 rounded text-white font-medium"
                style={{ backgroundColor: '#8e4a49' }}
              >
                Karta orqali ochish
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Optional Photo Gallery - Hidden for now */}
      {false && (
        <section className="py-10 px-6 border-b border-gray-200">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8" style={{ color: '#8e4a49' }}>
              Fotoalbom
            </h2>
            <div id="gallery-content"></div>
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
              <img
                src="/uploads/groom-photo.jpg"
                alt={wedding.groom}
                className="w-30 h-30 rounded-full object-cover mx-auto mb-3 border-4 border-white shadow-lg"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <h3 className="font-bold text-lg">{wedding.groom}</h3>
            </div>
            <div className="text-center">
              <img
                src="/uploads/bride-photo.jpg"
                alt={wedding.bride}
                className="w-30 h-30 rounded-full object-cover mx-auto mb-3 border-4 border-white shadow-lg"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <h3 className="font-bold text-lg">{wedding.bride}</h3>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Guest Book Section (replaces RSVP) */}
      <section className="py-10 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8" style={{ color: '#8e4a49' }}>
            Mehmonlar kitobi
          </h2>
          
          {/* Guest book form */}
          <div className="mb-12">
            <GuestBookForm weddingId={wedding.id} />
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