import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { insertGuestSchema } from '@shared/schema';

const rsvpFormSchema = insertGuestSchema.extend({
  email: z.string().email().optional().or(z.literal('')),
});

type RSVPFormData = z.infer<typeof rsvpFormSchema>;

interface EpicRSVPFormProps {
  weddingId: number;
}

export function EpicRSVPForm({ weddingId }: EpicRSVPFormProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<RSVPFormData>({
    resolver: zodResolver(rsvpFormSchema),
    defaultValues: {
      weddingId,
      name: '',
      email: '',
      phone: '',
      rsvpStatus: 'pending',
      additionalGuests: 0,
      dietaryRestrictions: '',
      notes: '',
    },
  });

  const submitRSVP = useMutation({
    mutationFn: async (data: RSVPFormData) => {
      const response = await apiRequest('POST', '/api/guests', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: t('rsvp.thankYou'),
        description: t('rsvp.thankYouMessage'),
      });
      setIsSubmitted(true);
      queryClient.invalidateQueries({ queryKey: ['/api/guests/wedding', weddingId] });
    },
    onError: (error: any) => {
      toast({
        title: t('common.error'),
        description: error.message || t('rsvp.errorMessage'),
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: RSVPFormData) => {
    submitRSVP.mutate(data);
  };

  if (isSubmitted) {
    return (
      <div className="text-center p-8">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-white text-2xl">✓</span>
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">{t('rsvp.thankYou')}</h3>
        <p className="text-gray-600">{t('rsvp.thankYouMessage')}</p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700 font-medium">{t('rsvp.guestName')}</FormLabel>
              <FormControl>
                <Input 
                  placeholder={t('rsvp.enterFullName')} 
                  {...field} 
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="rsvpStatus"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700 font-medium">{t('rsvp.willYouAttend')}</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-3"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="attending" id="attending" className="border-blue-500 text-blue-600" />
                    <Label htmlFor="attending" className="text-gray-700">{t('rsvp.attendingOption')}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="attending_with_guest" id="attending_with_guest" className="border-blue-500 text-blue-600" />
                    <Label htmlFor="attending_with_guest" className="text-gray-700">{t('rsvp.attendingWithGuestOption')}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="not_attending" id="not_attending" className="border-blue-500 text-blue-600" />
                    <Label htmlFor="not_attending" className="text-gray-700">{t('rsvp.notAttendingOption')}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="pending" id="pending" className="border-blue-500 text-blue-600" />
                    <Label htmlFor="pending" className="text-gray-700">{t('rsvp.pendingOption')}</Label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700 font-medium">{t('rsvp.message')}</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder={t('rsvp.shareMessage')} 
                  {...field} 
                  value={field.value || ''}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 min-h-[80px]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          disabled={submitRSVP.isPending}
        >
          {submitRSVP.isPending ? t('common.loading') : t('rsvp.submit')}
        </Button>
      </form>
    </Form>
  );
}