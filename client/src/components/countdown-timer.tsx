import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { calculateTimeUntil } from '@/lib/utils';

interface CountdownTimerProps {
  targetDate: Date | string;
  className?: string;
  isStandardTemplate?: boolean;
}

export function CountdownTimer({ targetDate, className = '', isStandardTemplate = false }: CountdownTimerProps) {
  const { t } = useTranslation();
  const [timeLeft, setTimeLeft] = useState(calculateTimeUntil(targetDate));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeUntil(targetDate));
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (timeLeft.isExpired) {
    return (
      <div className={`text-center ${className}`}>
        <div className={`text-2xl font-playfair font-bold ${isStandardTemplate ? 'text-pink-300 bg-gradient-to-r from-pink-300 to-purple-300 bg-clip-text text-transparent' : 'text-romantic-gold'}`}>
          🎉 {t('wedding.weddingDayIsHere')} 🎉
        </div>
      </div>
    );
  }

  return (
    <div className={`flex justify-center gap-6 ${className}`}>
      <div className={`text-center transform hover:scale-105 transition-transform duration-300 ${isStandardTemplate ? 'bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-md border border-white/20 rounded-2xl px-6 py-4 shadow-lg' : 'bg-white bg-opacity-20 rounded-xl px-3 py-2'}`}>
        <div className={`font-bold ${isStandardTemplate ? 'text-3xl text-white mb-1' : 'text-lg'}`}>
          {timeLeft.days}
        </div>
        <div className={`${isStandardTemplate ? 'text-white/80 text-sm uppercase tracking-wide font-medium' : 'text-sm'}`}>
          {t('time.days')}
        </div>
      </div>
      <div className={`text-center transform hover:scale-105 transition-transform duration-300 ${isStandardTemplate ? 'bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-md border border-white/20 rounded-2xl px-6 py-4 shadow-lg' : 'bg-white bg-opacity-20 rounded-xl px-3 py-2'}`}>
        <div className={`font-bold ${isStandardTemplate ? 'text-3xl text-white mb-1' : 'text-lg'}`}>
          {timeLeft.hours}
        </div>
        <div className={`${isStandardTemplate ? 'text-white/80 text-sm uppercase tracking-wide font-medium' : 'text-sm'}`}>
          {t('time.hours')}
        </div>
      </div>
      <div className={`text-center transform hover:scale-105 transition-transform duration-300 ${isStandardTemplate ? 'bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-md border border-white/20 rounded-2xl px-6 py-4 shadow-lg' : 'bg-white bg-opacity-20 rounded-xl px-3 py-2'}`}>
        <div className={`font-bold ${isStandardTemplate ? 'text-3xl text-white mb-1' : 'text-lg'}`}>
          {timeLeft.minutes}
        </div>
        <div className={`${isStandardTemplate ? 'text-white/80 text-sm uppercase tracking-wide font-medium' : 'text-sm'}`}>
          {t('time.minutes')}
        </div>
      </div>
    </div>
  );
}
