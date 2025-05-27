
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Smartphone, Building2, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
}

export function PaymentPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [selectedMethod, setSelectedMethod] = useState<string>('uzcard');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const planId = searchParams.get('plan');
  const amount = parseInt(searchParams.get('amount') || '0');

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'uzcard',
      name: 'UzCard',
      icon: <CreditCard className="w-6 h-6" />,
      description: 'To\'g\'ridan-to\'g\'ri UzCard bilan to\'lash'
    },
    {
      id: 'humo',
      name: 'Humo',
      icon: <CreditCard className="w-6 h-6" />,
      description: 'Humo kartasi bilan to\'lash'
    },
    {
      id: 'payme',
      name: 'Payme',
      icon: <Smartphone className="w-6 h-6" />,
      description: 'Payme ilovasi orqali to\'lash'
    },
    {
      id: 'click',
      name: 'Click',
      icon: <Smartphone className="w-6 h-6" />,
      description: 'Click ilovasi orqali to\'lash'
    },
    {
      id: 'paycom',
      name: 'Paycom',
      icon: <Building2 className="w-6 h-6" />,
      description: 'Paycom tizimi orqali to\'lash'
    }
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('uz-UZ', {
      style: 'currency',
      currency: 'UZS',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handlePayment = async () => {
    setLoading(true);
    
    try {
      const paymentData = {
        planId,
        amount,
        method: selectedMethod,
        cardNumber: selectedMethod.includes('card') || selectedMethod.includes('humo') ? cardNumber : undefined,
        expiryDate: selectedMethod.includes('card') || selectedMethod.includes('humo') ? expiryDate : undefined,
        cvv: selectedMethod.includes('card') || selectedMethod.includes('humo') ? cvv : undefined,
        phoneNumber: ['payme', 'click'].includes(selectedMethod) ? phoneNumber : undefined,
      };

      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      const result = await response.json();

      if (result.success) {
        // Redirect to payment provider
        if (result.redirectUrl) {
          window.location.href = result.redirectUrl;
        } else {
          // Handle success
          navigate(`/payment-success?order=${result.orderId}`);
        }
      } else {
        alert('To\'lovda xatolik yuz berdi. Iltimos, qayta urinib ko\'ring.');
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('To\'lovda xatolik yuz berdi. Iltimos, qayta urinib ko\'ring.');
    } finally {
      setLoading(false);
    }
  };

  if (!planId || !amount) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Noto'g'ri so'rov</h1>
        <Button onClick={() => navigate('/')}>Bosh sahifaga qaytish</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-20">
      <div className="max-w-2xl mx-auto">
        <Button 
          variant="ghost" 
          className="mb-6"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Orqaga
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>To'lovni amalga oshirish</CardTitle>
            <CardDescription>
              {planId} rejasi uchun to'lov: {formatPrice(amount)}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Payment Method Selection */}
            <div>
              <Label className="text-base font-semibold mb-4 block">To'lov usulini tanlang</Label>
              <div className="grid gap-3">
                {paymentMethods.map((method) => (
                  <Card 
                    key={method.id}
                    className={`cursor-pointer transition-colors ${
                      selectedMethod === method.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedMethod(method.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="text-blue-600">{method.icon}</div>
                        <div>
                          <div className="font-semibold">{method.name}</div>
                          <div className="text-sm text-gray-600">{method.description}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <Separator />

            {/* Payment Details */}
            {(selectedMethod === 'uzcard' || selectedMethod === 'humo') && (
              <div className="space-y-4">
                <Label className="text-base font-semibold">Karta ma'lumotlari</Label>
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="cardNumber">Karta raqami</Label>
                    <Input
                      id="cardNumber"
                      placeholder="8600 0000 0000 0000"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      maxLength={19}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiry">Amal qilish muddati</Label>
                      <Input
                        id="expiry"
                        placeholder="MM/YY"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(e.target.value)}
                        maxLength={5}
                      />
                    </div>
                    <div>
                      <Label htmlFor="cvv">CVV</Label>
                      <Input
                        id="cvv"
                        placeholder="123"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value)}
                        maxLength={3}
                        type="password"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {(selectedMethod === 'payme' || selectedMethod === 'click') && (
              <div className="space-y-4">
                <Label className="text-base font-semibold">Telefon raqami</Label>
                <div>
                  <Label htmlFor="phone">Telefon raqamingiz</Label>
                  <Input
                    id="phone"
                    placeholder="+998 90 123 45 67"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </div>
              </div>
            )}

            <Separator />

            {/* Payment Summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Jami to'lov:</span>
                <span className="text-xl font-bold text-blue-600">{formatPrice(amount)}</span>
              </div>
            </div>

            <Button 
              className="w-full"
              onClick={handlePayment}
              disabled={loading}
            >
              {loading ? 'To\'lov amalga oshirilmoqda...' : `${formatPrice(amount)} to'lash`}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
