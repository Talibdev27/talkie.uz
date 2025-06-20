
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Star } from 'lucide-react';

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  period: string;
  features: string[];
  popular?: boolean;
  buttonText: string;
}

export function PricingSection() {
  const { t } = useTranslation();

  const plans: PricingPlan[] = [
    {
      id: 'basic',
      name: t('pricing.basic'),
      price: 299000,
      currency: 'UZS',
      period: t('pricing.perYear'),
      features: [
        'Basic website template',
        'Up to 50 guests',
        'RSVP management',
        'Photo gallery (10 photos)'
      ],
      buttonText: t('pricing.chooseBasic'),
    },
    {
      id: 'premium',
      name: t('pricing.premium'),
      price: 599000,
      currency: 'UZS',
      period: t('pricing.perYear'),
      features: [
        'All Basic features',
        'Unlimited guests',
        'Premium templates',
        'Unlimited photos',
        'Custom domain',
        'Background music'
      ],
      popular: true,
      buttonText: t('pricing.choosePremium'),
    },
    {
      id: 'deluxe',
      name: t('pricing.deluxe'),
      price: 999000,
      currency: 'UZS',
      period: t('pricing.perYear'),
      features: [
        'All Premium features',
        'Advanced customization',
        'Priority support',
        'Guest messaging',
        'Analytics dashboard'
      ],
      buttonText: t('pricing.chooseDeluxe'),
    },
  ];

  const handlePayment = (planId: string, price: number) => {
    // Redirect to payment page with plan details
    window.location.href = `/payment?plan=${planId}&amount=${price}`;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('uz-UZ', {
      style: 'currency',
      currency: 'UZS',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">{t('pricing.title')}</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">{t('pricing.subtitle')}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card key={plan.id} className={`relative ${plan.popular ? 'border-2 border-blue-500 shadow-lg' : ''}`}>
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500">
                  <Star className="w-4 h-4 mr-1" />
                  {t('pricing.mostPopular')}
                </Badge>
              )}
              
              <CardHeader className="text-center">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{formatPrice(plan.price)}</span>
                  <span className="text-gray-500">{plan.period}</span>
                </div>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3">
                  {(plan.features || []).map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button 
                  className={`w-full ${plan.popular ? 'bg-blue-500 hover:bg-blue-600' : ''}`}
                  onClick={() => handlePayment(plan.id, plan.price)}
                >
                  {plan.buttonText}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
