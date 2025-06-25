import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Search, User, Heart, CheckCircle } from 'lucide-react';
import type { Guest } from '@shared/schema';

interface EnhancedRSVPFormProps {
  weddingId: number;
  className?: string;
}

export function EnhancedRSVPForm({ weddingId, className = '' }: EnhancedRSVPFormProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [rsvpStatus, setRsvpStatus] = useState<'confirmed' | 'declined' | 'maybe'>('confirmed');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Fetch guests for this wedding (public endpoint)
  const { data: guests = [], isLoading } = useQuery<Guest[]>({
    queryKey: [`/api/guests/public/${weddingId}`],
    queryFn: () => fetch(`/api/guests/public/${weddingId}`).then(res => res.json()),
    enabled: !!weddingId,
  });

  // Filter guests based on search term
  const filteredGuests = guests.filter(guest => 
    guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guest.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const updateRSVP = useMutation({
    mutationFn: async (data: { guestId: number; rsvpStatus: string; message?: string }) => {
      const response = await fetch(`/api/guests/${data.guestId}/rsvp`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rsvpStatus: data.rsvpStatus,
          message: data.message,
          respondedAt: new Date(),
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update RSVP');
      }
      
      return response.json();
    },
    onSuccess: () => {
      setIsSubmitted(true);
      toast({
        title: "RSVP Updated!",
        description: "Thank you for your response!",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/guests/public/${weddingId}`] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update RSVP. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGuest) {
      toast({
        title: "Please select your name",
        description: "Find and select your name from the guest list first.",
        variant: "destructive",
      });
      return;
    }

    updateRSVP.mutate({
      guestId: selectedGuest.id,
      rsvpStatus,
      message,
    });
  };

  if (isSubmitted) {
    return (
      <Card className={`max-w-md mx-auto ${className}`}>
        <CardContent className="pt-6 text-center">
          <div className="text-6xl mb-4">💝</div>
          <h3 className="text-xl font-playfair font-semibold text-charcoal mb-2">
            {t('rsvp.thankYou')}
          </h3>
          <p className="text-charcoal opacity-70">
            We've received your RSVP and can't wait to celebrate with you!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`max-w-lg mx-auto ${className} shadow-2xl rounded-2xl`}>
      <CardHeader className="text-center bg-gray-50 p-8 rounded-t-2xl">
        <CardTitle className="font-playfair text-4xl text-gray-800">{t('rsvp.title')}</CardTitle>
        <p className="text-gray-600 font-cormorant text-lg">Let us know if you can make it!</p>
      </CardHeader>
      <CardContent className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Guest Search */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold text-gray-700">Find Your Name</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Guest List */}
            {searchTerm && (
              <div className="max-h-40 overflow-y-auto border rounded-lg">
                {isLoading ? (
                  <div className="p-4 text-center text-gray-500">Loading guests...</div>
                ) : filteredGuests.length > 0 ? (
                  filteredGuests.map((guest) => (
                    <button
                      key={guest.id}
                      type="button"
                      onClick={() => {
                        setSelectedGuest(guest);
                        setSearchTerm(guest.name);
                      }}
                      className={`w-full text-left p-3 hover:bg-gray-50 border-b last:border-b-0 transition-colors ${
                        selectedGuest?.id === guest.id ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="font-medium">{guest.name}</div>
                          {guest.email && (
                            <div className="text-sm text-gray-500">{guest.email}</div>
                          )}
                        </div>
                        {selectedGuest?.id === guest.id && (
                          <CheckCircle className="h-4 w-4 text-blue-600 ml-auto" />
                        )}
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    No guests found. Try a different search term.
                  </div>
                )}
              </div>
            )}
            
            {selectedGuest && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-800">
                  <CheckCircle className="h-4 w-4" />
                  <span className="font-medium">Selected: {selectedGuest.name}</span>
                </div>
              </div>
            )}
          </div>

          {/* RSVP Status */}
          {selectedGuest && (
            <>
              <div className="space-y-4">
                <Label className="text-lg font-semibold text-gray-700">Will you be attending?</Label>
                <RadioGroup
                  value={rsvpStatus}
                  onValueChange={(value: 'confirmed' | 'declined' | 'maybe') => setRsvpStatus(value)}
                  className="flex flex-col space-y-3"
                >
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="confirmed" id="confirmed" />
                    <Label htmlFor="confirmed" className="text-base font-medium text-gray-700">
                      Yes, I'll be there! 🎉
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="declined" id="declined" />
                    <Label htmlFor="declined" className="text-base font-medium text-gray-700">
                      Sorry, can't make it 😢
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="maybe" id="maybe" />
                    <Label htmlFor="maybe" className="text-base font-medium text-gray-700">
                      I'm not sure yet 🤔
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Message */}
              <div className="space-y-2">
                <Label htmlFor="message">Leave a message (optional)</Label>
                <Textarea
                  id="message"
                  placeholder="Share a message with the couple..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="resize-none"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
                disabled={updateRSVP.isPending}
              >
                {updateRSVP.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Heart className="h-4 w-4 mr-2" />
                    Confirm RSVP
                  </>
                )}
              </Button>
            </>
          )}
        </form>
      </CardContent>
    </Card>
  );
} 