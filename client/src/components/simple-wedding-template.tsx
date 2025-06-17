import { useState, useEffect } from 'react';
import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Clock, MapPin, MessageSquare, Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface Wedding {
  id: number;
  bride: string;
  groom: string;
  weddingDate: string;
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

export function SimpleWeddingTemplate() {
  const { weddingUrl } = useParams();

  const { data: wedding, isLoading: weddingLoading } = useQuery<Wedding>({
    queryKey: ['/api/weddings/url', weddingUrl],
  });

  const { data: guestBookEntries = [], isLoading: entriesLoading } = useQuery<GuestBookEntry[]>({
    queryKey: ['/api/guest-book/wedding', wedding?.id],
    enabled: !!wedding?.id,
  });

  if (weddingLoading) {
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

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Geometric Background */}
      <section className="relative h-screen w-full overflow-hidden">
        {/* Geometric Pattern Background */}
        <div 
          className="absolute inset-0 w-full h-full bg-gradient-to-br from-amber-100 via-amber-200 to-amber-300"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0L50 50L100 0L50 50L100 100L50 50L0 100L50 50Z' fill='%23A67C5A' fill-opacity='0.15'/%3E%3C/svg%3E")`,
            backgroundSize: '100px 100px'
          }}
        />
        
        {/* Overlay with couple names */}
        <div className="absolute inset-0 flex items-center justify-center px-6">
          <div className="bg-black/70 backdrop-blur-sm text-white text-center px-8 md:px-12 py-12 md:py-16 rounded-2xl max-w-2xl w-full mx-auto">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-6 tracking-wide">
              {wedding.bride} & {wedding.groom}
            </h1>
            <div className="space-y-3 text-base md:text-lg">
              <div className="flex items-center justify-center gap-3">
                <Calendar className="w-5 h-5" />
                <span>
                  {new Date(wedding.weddingDate).toLocaleDateString('uz-UZ', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
              <div className="flex items-center justify-center gap-3">
                <Clock className="w-5 h-5" />
                <span>{wedding.weddingTime || '4:00 PM'}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Wedding Details Section */}
      <section className="py-16 md:py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 text-center mb-12">
            wedding.aboutTitle
          </h2>
          
          <div className="grid md:grid-cols-2 gap-12">
            {/* Family names */}
            <div className="text-center">
              <h3 className="text-xl md:text-2xl font-serif font-semibold text-gray-800 mb-6">
                wedding.families
              </h3>
              <div className="space-y-3 text-lg text-gray-700">
                <p className="font-medium">{wedding.bride}</p>
                <p className="text-gray-500 text-xl">&</p>
                <p className="font-medium">{wedding.groom}</p>
              </div>
            </div>
            
            {/* Date & Location */}
            <div className="text-center">
              <h3 className="text-xl md:text-2xl font-serif font-semibold text-gray-800 mb-6">
                wedding.whenWhere
              </h3>
              <div className="space-y-4 text-base md:text-lg text-gray-700">
                <div className="flex items-center justify-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <span>
                    {new Date(wedding.weddingDate).toLocaleDateString('uz-UZ', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-center gap-3">
                  <Clock className="w-5 h-5 text-gray-500" />
                  <span>{wedding.weddingTime || '4:00 PM'}</span>
                </div>
                {wedding.venue && (
                  <div className="flex items-center justify-center gap-3">
                    <MapPin className="w-5 h-5 text-gray-500" />
                    <div className="text-center">
                      <div className="font-medium">{wedding.venue}</div>
                      {wedding.venueAddress && (
                        <div className="text-sm text-gray-600">{wedding.venueAddress}</div>
                      )}
                    </div>
                  </div>
                )}
                <a
                  href="#"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors mt-4"
                >
                  wedding.viewMap
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Guest Book Section */}
      <section className="py-16 md:py-20 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 text-center mb-12">
            Mehmonlar kitobi
          </h2>
          
          {/* Guest book form */}
          <div className="mb-16">
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