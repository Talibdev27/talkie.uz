import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import type { Wedding } from '@shared/schema';

interface EpicTemplateProps {
  wedding: Wedding;
}

export function EpicTemplate({ wedding }: EpicTemplateProps) {
  const [timeLeft, setTimeLeft] = useState<{days: number, hours: number, minutes: number}>({days: 0, hours: 0, minutes: 0});

  // Early return check
  if (!wedding) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  useEffect(() => {
    if (!wedding?.weddingDate) return;
    
    const calculateTimeLeft = () => {
      const weddingDateTime = new Date(wedding.weddingDate);
      const now = new Date();
      const difference = weddingDateTime.getTime() - now.getTime();
      
      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        
        setTimeLeft({ days, hours, minutes });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 60000);
    return () => clearInterval(timer);
  }, [wedding?.weddingDate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">

      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
        <div className="w-full max-w-4xl h-[600px] bg-white rounded-[20px] shadow-2xl overflow-hidden flex flex-col">
          {/* Photo Section */}
          <div className="flex-1 bg-gradient-to-br from-blue-400 to-blue-500 relative flex items-center justify-center min-h-[350px] overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-5 left-5 w-16 h-16 bg-gradient-to-br from-blue-300 to-blue-400 rounded-full opacity-30 transform rotate-45"></div>
              <div className="absolute top-8 right-8 w-12 h-12 bg-gradient-to-br from-blue-200 to-blue-300 rounded-full opacity-30 transform -rotate-45"></div>
              <div className="absolute bottom-20 left-8 w-10 h-10 bg-gradient-to-br from-green-300 to-blue-300 rounded-full opacity-30 transform rotate-90"></div>
            </div>

            {wedding?.couplePhotoUrl ? (
              <img 
                src={wedding.couplePhotoUrl} 
                alt="Couple" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center border-2 border-dashed border-white/60 rounded-lg bg-white/15 backdrop-blur-sm mx-5 my-5">
                <div className="text-center text-white">
                  <div className="text-5xl mb-4">📷</div>
                  <p className="text-lg font-light">Beautiful memories await</p>
                </div>
              </div>
            )}
          </div>

          {/* Text Section */}
          <div className="bg-gradient-to-br from-gray-50 to-white p-10 text-center relative">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full"></div>
            
            <h1 className="text-4xl lg:text-5xl font-light bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent mb-4 tracking-wide">
              {wedding?.bride || 'Bride'} & {wedding?.groom || 'Groom'}
            </h1>
            
            <p className="text-lg text-gray-600 mb-8 italic font-light">
              {wedding?.weddingDate ? format(new Date(wedding.weddingDate), 'd MMMM yyyy') : 'Date TBD'} • {wedding?.weddingTime || '4:00 PM'}
            </p>

            {/* Countdown */}
            <div className="flex justify-center gap-5 mb-8">
              {[
                { value: timeLeft.days, label: 'DAYS' },
                { value: timeLeft.hours, label: 'HOURS' },
                { value: timeLeft.minutes, label: 'MINUTES' }
              ].map((item, index) => (
                <div key={index} className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-[15px] p-5 min-w-[80px] shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-white/5 rounded-[15px]"></div>
                  <div className="text-3xl font-bold text-white relative z-10">{item.value}</div>
                  <div className="text-xs text-white/90 uppercase tracking-wider font-medium mt-2 relative z-10">{item.label}</div>
                </div>
              ))}
            </div>

            <div className="inline-block bg-blue-50 text-gray-700 px-6 py-3 rounded-full border-2 border-blue-200 hover:bg-blue-100 hover:-translate-y-1 transition-all duration-300">
              📍 {wedding?.venue || 'Wedding Venue'}
            </div>

            {/* Dear Guest Message */}
            {wedding?.dearGuestMessage && (
              <div className="mt-8 p-6 bg-blue-50 rounded-2xl border border-blue-200">
                <h3 className="text-xl font-semibold text-blue-800 mb-3">Dear Guests</h3>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {wedding.dearGuestMessage}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}