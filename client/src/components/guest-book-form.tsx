import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { MessageSquare, Heart } from 'lucide-react';

const guestBookSchema = z.object({
  weddingId: z.number(),
  guestName: z.string().min(1, 'Name is required'),
  message: z.string().min(1, 'Message is required').max(500, 'Message too long'),
});

type GuestBookFormData = z.infer<typeof guestBookSchema>;

interface GuestBookFormProps {
  weddingId: number;
  coupleName: string;
}

export function GuestBookForm({ weddingId, coupleName }: GuestBookFormProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<GuestBookFormData>({
    resolver: zodResolver(guestBookSchema),
    defaultValues: {
      weddingId,
      guestName: '',
      message: '',
    },
  });

  const submitGuestBookMutation = useMutation({
    mutationFn: async (data: GuestBookFormData) => {
      const response = await apiRequest('POST', '/api/guest-book', data);
      return response.json();
    },
    onSuccess: () => {
      setIsSubmitted(true);
      toast({
        title: t('guestBook.success'),
        description: t('guestBook.thankYou'),
      });
      queryClient.invalidateQueries({ queryKey: [`/api/guest-book/wedding/${weddingId}`] });
      form.reset();
    },
    onError: () => {
      toast({
        title: t('guestBook.error'),
        description: t('guestBook.tryAgain'),
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: GuestBookFormData) => {
    submitGuestBookMutation.mutate(data);
  };

  if (isSubmitted) {
    return (
      <Card className="border-[#D4B08C]/20 bg-gradient-to-r from-white to-[#F8F1F1]/30">
        <CardContent className="p-8 text-center">
          <Heart className="h-12 w-12 text-[#D4B08C] mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-[#2C3338] mb-2">
            {t('guestBook.thankYouTitle')}
          </h3>
          <p className="text-[#2C3338]/70">
            {t('guestBook.messageSaved')}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-[#D4B08C]/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[#2C3338]">
          <MessageSquare className="h-5 w-5 text-[#D4B08C]" />
          {t('guestBook.leaveMessage')}
        </CardTitle>
        <p className="text-sm text-[#2C3338]/70">
          {t('guestBook.shareThoughts', { couple: coupleName })}
        </p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="guestName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('guestBook.yourName')}</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder={t('guestBook.namePlaceholder')} 
                      {...field} 
                      className="border-[#D4B08C]/30 focus:border-[#D4B08C]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('guestBook.yourMessage')}</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder={t('guestBook.messagePlaceholder')}
                      className="border-[#D4B08C]/30 focus:border-[#D4B08C] min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full bg-[#D4B08C] hover:bg-[#C09E7A] text-white"
              disabled={submitGuestBookMutation.isPending}
            >
              {submitGuestBookMutation.isPending ? t('common.sending') : t('guestBook.submit')}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}