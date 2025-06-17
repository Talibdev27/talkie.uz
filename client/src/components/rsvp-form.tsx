import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Heart, CheckCircle } from 'lucide-react';
import { getRsvpTranslation } from '@/translations/rsvp';

interface RSVPFormProps {
  weddingId: number;
  currentLanguage?: string;
}

export function RSVPForm({ weddingId, currentLanguage = 'en' }: RSVPFormProps) {
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
  const rsvpText = getRsvpTranslation(currentLanguage);

  const rsvpMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await fetch('/api/guests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          weddingId,
          rsvpStatus: data.attendance,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit RSVP');
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
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2" style={{ color: '#8e4a49' }}>
          <Heart className="h-6 w-6" />
          {rsvpText.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="guestName" className="text-base font-medium">
              {rsvpText.guestName}
            </Label>
            <Input
              id="guestName"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder={rsvpText.guestName}
              className="text-base"
              required
            />
          </div>

          <div className="space-y-4">
            <Label className="text-base font-medium">
              {rsvpText.attendanceQuestion}
            </Label>
            <RadioGroup 
              value={formData.attendance} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, attendance: value }))} 
              className="space-y-3"
            >
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="yes" id="yes" />
                <Label htmlFor="yes" className="text-base cursor-pointer">
                  {rsvpText.options.yes}
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="withPartner" id="withPartner" />
                <Label htmlFor="withPartner" className="text-base cursor-pointer">
                  {rsvpText.options.withPartner}
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="no" id="no" />
                <Label htmlFor="no" className="text-base cursor-pointer">
                  {rsvpText.options.no}
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="maybe" id="maybe" />
                <Label htmlFor="maybe" className="text-base cursor-pointer">
                  {rsvpText.options.maybe}
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-base font-medium">
              Email (optional)
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="Email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-base font-medium">
              Phone (optional)
            </Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="Phone number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message" className="text-base font-medium">
              Message (optional)
            </Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              placeholder="Any special message or requests"
              rows={3}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={rsvpMutation.isPending}
            style={{ backgroundColor: '#8e4a49' }}
          >
            {rsvpMutation.isPending ? 'Submitting...' : rsvpText.confirmationTitle}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}