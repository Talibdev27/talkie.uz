import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Heart, MessageSquare } from 'lucide-react';

const guestBookSchema = z.object({
  guestName: z.string().min(1, 'Guest name is required').max(100, 'Name too long'),
  message: z.string().min(1, 'Message is required').max(500, 'Message too long'),
});

type GuestBookFormData = z.infer<typeof guestBookSchema>;

interface GuestBookFormProps {
  weddingId: number;
}

export function GuestBookForm({ weddingId }: GuestBookFormProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<GuestBookFormData>({
    resolver: zodResolver(guestBookSchema),
    defaultValues: {
      guestName: '',
      message: '',
    },
  });

  const createEntryMutation = useMutation({
    mutationFn: (data: GuestBookFormData) =>
      apiRequest(`/api/guest-book`, {
        method: 'POST',
        body: JSON.stringify({
          ...data,
          weddingId,
        }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/guest-book/wedding', weddingId] });
      form.reset();
      setIsSubmitting(false);
      toast({
        title: t('guestBook.success'),
        description: t('guestBook.messageAdded'),
      });
    },
    onError: (error: any) => {
      setIsSubmitting(false);
      toast({
        title: t('common.error'),
        description: error.message || t('guestBook.errorSubmitting'),
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: GuestBookFormData) => {
    setIsSubmitting(true);
    createEntryMutation.mutate(data);
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardContent className="p-8">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-4">
            <Heart className="h-8 w-8 text-romantic-gold mr-2" />
            <MessageSquare className="h-8 w-8 text-romantic-gold" />
          </div>
          <h3 className="text-2xl font-playfair font-bold text-charcoal mb-2">
            {t('guestBook.leaveMessage')}
          </h3>
          <p className="text-gray-600">
            {t('guestBook.shareWishes')}
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="guestName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-charcoal font-medium">
                    {t('guestBook.yourName')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('guestBook.namePlaceholder')}
                      {...field}
                      className="border-romantic-gold/30 focus:border-romantic-gold"
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
                  <FormLabel className="text-charcoal font-medium">
                    {t('guestBook.yourMessage')}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t('guestBook.messagePlaceholder')}
                      rows={4}
                      {...field}
                      className="border-romantic-gold/30 focus:border-romantic-gold resize-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-romantic-gold hover:bg-romantic-gold/90 text-white font-medium py-3"
            >
              {isSubmitting ? t('common.submitting') : t('guestBook.submitMessage')}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}