import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Heart, CheckCircle } from 'lucide-react';

interface RSVPFormProps {
  weddingId: number;
}

export function RSVPForm({ weddingId }: RSVPFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    attendance: '',
    guestCount: 1,
    message: '',
    address: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const rsvpMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await fetch('/api/guests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weddingId,
          name: data.name,
          email: data.email,
          phone: data.phone,
          address: data.address,
          message: data.message,
          rsvpStatus: data.attendance,
          guestCount: data.guestCount
        }),
      });
      
      if (!response.ok) {
        throw new Error('RSVP submission failed');
      }
      
      return response.json();
    },
    onSuccess: () => {
      setSubmitted(true);
      toast({
        title: "RSVP Submitted",
        description: "Thank you for your response!",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/guests/wedding/${weddingId}`] });
    },
    onError: () => {
      toast({
        title: "Submission Failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.attendance) {
      toast({
        title: "Required Fields",
        description: "Please fill in your name and attendance status.",
        variant: "destructive",
      });
      return;
    }
    rsvpMutation.mutate(formData);
  };

  if (submitted) {
    return (
      <Card className="max-w-md mx-auto bg-green-50 border-green-200">
        <CardContent className="pt-6 text-center">
          <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-600" />
          <h3 className="font-semibold text-green-800 mb-2">RSVP Submitted!</h3>
          <p className="text-green-700">Thank you for your response. We look forward to celebrating with you!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <p className="text-gray-700 mb-4">
              Hurmatli mehmon, iltimos to'yga tashrif buyurishingizni tasdiqlang:
            </p>
            
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="attendance"
                  value="confirmed"
                  checked={formData.attendance === 'confirmed'}
                  onChange={(e) => setFormData(prev => ({ ...prev, attendance: e.target.value }))}
                  className="text-blue-600"
                />
                <span>Ha, men boraman!</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="attendance"
                  value="with-partner"
                  checked={formData.attendance === 'with-partner'}
                  onChange={(e) => setFormData(prev => ({ ...prev, attendance: e.target.value }))}
                  className="text-blue-600"
                />
                <span>Turmush o'rtog'im bilan boraman</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="attendance"
                  value="declined"
                  checked={formData.attendance === 'declined'}
                  onChange={(e) => setFormData(prev => ({ ...prev, attendance: e.target.value }))}
                  className="text-blue-600"
                />
                <span>Afsuski, kela olmayman</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ismingiz va manzilingiz:
            </label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ismingiz"
              required
            />
          </div>

          <div>
            <Input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              placeholder="Manzilingiz"
            />
          </div>

          <div>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="Email (ixtiyoriy)"
            />
          </div>

          <div>
            <Input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="Telefon raqam (ixtiyoriy)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              To'y egalariga tilaklaringiz:
            </label>
            <Textarea
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              placeholder="Tilaklaringizni yozing..."
              rows={4}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full"
            style={{ backgroundColor: '#8e4a49' }}
            disabled={rsvpMutation.isPending}
          >
            {rsvpMutation.isPending ? 'Yuborilmoqda...' : 'Yuborish'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}