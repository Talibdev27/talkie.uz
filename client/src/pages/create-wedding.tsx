import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
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
import { insertWeddingSchema } from '@shared/schema';
import { formatDateForInput } from '@/lib/utils';
import { ArrowLeft, Heart } from 'lucide-react';
import { Link } from 'wouter';

const createWeddingSchema = insertWeddingSchema.extend({
  userId: z.number().optional(),
});

type CreateWeddingFormData = z.infer<typeof createWeddingSchema>;

export default function CreateWedding() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const form = useForm<CreateWeddingFormData>({
    resolver: zodResolver(createWeddingSchema),
    defaultValues: {
      bride: '',
      groom: '',
      weddingDate: formatDateForInput(new Date()),
      venue: '',
      venueAddress: '',
      story: '',
      template: 'garden-romance',
      primaryColor: '#D4B08C',
      accentColor: '#89916B',
      backgroundMusicUrl: '',
      isPublic: true,
    },
  });

  const createWedding = useMutation({
    mutationFn: async (data: CreateWeddingFormData) => {
      // In a real app, userId would come from authentication
      const weddingData = { ...data, userId: 1 };
      const response = await apiRequest('POST', '/api/weddings', weddingData);
      return response.json();
    },
    onSuccess: (wedding) => {
      toast({
        title: "Wedding website created!",
        description: "Your beautiful wedding website is ready to share.",
      });
      setLocation(`/wedding/${wedding.uniqueUrl}`);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateWeddingFormData) => {
    createWedding.mutate(data);
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const templates = [
    { id: 'garden-romance', name: 'Garden Romance', preview: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200' },
    { id: 'modern-elegance', name: 'Modern Elegance', preview: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200' },
    { id: 'rustic-charm', name: 'Rustic Charm', preview: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=300&h=200' },
    { id: 'beach-bliss', name: 'Beach Bliss', preview: 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200' },
  ];

  return (
    <div className="min-h-screen bg-soft-white">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center text-romantic-gold hover:text-opacity-80 transition-colors">
              <ArrowLeft className="h-5 w-5 mr-2" />
              <Heart className="h-6 w-6 mr-2" />
              <span className="font-playfair font-semibold text-lg">LoveStory</span>
            </Link>
            <div className="text-sm text-charcoal opacity-70">
              Step {currentStep} of {totalSteps}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-8">
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
                  step <= currentStep
                    ? 'bg-romantic-gold text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {step}
              </div>
              {step < totalSteps && (
                <div
                  className={`flex-1 h-2 mx-4 rounded ${
                    step < currentStep ? 'bg-romantic-gold' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <Card className="wedding-card">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl font-playfair font-bold text-charcoal">
                    Tell Us About Your Special Day
                  </CardTitle>
                  <p className="text-charcoal opacity-70">
                    Let's start with the basic details about your wedding
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="bride"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bride's Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter bride's full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="groom"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Groom's Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter groom's full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="weddingDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Wedding Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="venue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Venue Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter venue name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="venueAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Venue Address</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter full venue address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            )}

            {/* Step 2: Your Story */}
            {currentStep === 2 && (
              <Card className="wedding-card">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl font-playfair font-bold text-charcoal">
                    Share Your Love Story
                  </CardTitle>
                  <p className="text-charcoal opacity-70">
                    Tell your guests about your journey together
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="story"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Love Story</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Share how you met, your proposal story, or any special moments you'd like guests to know about..."
                            className="min-h-32 resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="backgroundMusicUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Background Music (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter YouTube or Spotify URL for your special song" 
                            {...field} 
                          />
                        </FormControl>
                        <p className="text-sm text-charcoal opacity-60">
                          Add a special song that will play softly in the background
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            )}

            {/* Step 3: Design & Template */}
            {currentStep === 3 && (
              <Card className="wedding-card">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl font-playfair font-bold text-charcoal">
                    Choose Your Design
                  </CardTitle>
                  <p className="text-charcoal opacity-70">
                    Select a template and customize your colors
                  </p>
                </CardHeader>
                <CardContent className="space-y-8">
                  <FormField
                    control={form.control}
                    name="template"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website Template</FormLabel>
                        <div className="grid md:grid-cols-2 gap-4">
                          {templates.map((template) => (
                            <div
                              key={template.id}
                              className={`relative cursor-pointer rounded-xl overflow-hidden border-2 transition-all ${
                                field.value === template.id
                                  ? 'border-romantic-gold shadow-lg'
                                  : 'border-gray-200 hover:border-romantic-gold'
                              }`}
                              onClick={() => field.onChange(template.id)}
                            >
                              <img
                                src={template.preview}
                                alt={template.name}
                                className="w-full h-32 object-cover"
                              />
                              <div className="p-3 bg-white">
                                <h4 className="font-medium text-charcoal">{template.name}</h4>
                              </div>
                              {field.value === template.id && (
                                <div className="absolute top-2 right-2 w-6 h-6 bg-romantic-gold rounded-full flex items-center justify-center">
                                  <div className="w-2 h-2 bg-white rounded-full" />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="primaryColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Primary Color</FormLabel>
                          <div className="flex items-center space-x-3">
                            <FormControl>
                              <Input type="color" className="w-12 h-12 rounded-lg border" {...field} />
                            </FormControl>
                            <FormControl>
                              <Input placeholder="#D4B08C" {...field} />
                            </FormControl>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="accentColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Accent Color</FormLabel>
                          <div className="flex items-center space-x-3">
                            <FormControl>
                              <Input type="color" className="w-12 h-12 rounded-lg border" {...field} />
                            </FormControl>
                            <FormControl>
                              <Input placeholder="#89916B" {...field} />
                            </FormControl>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Navigation */}
            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="wedding-button-outline"
              >
                Previous
              </Button>

              {currentStep < totalSteps ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="wedding-button"
                >
                  Next Step
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={createWedding.isPending}
                  className="wedding-button"
                >
                  {createWedding.isPending ? 'Creating...' : 'Create Website'}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
