import React, { useState, useEffect } from 'react';
import { Clock, Sparkles } from 'lucide-react';

interface CountdownTimerProps {
  endTime: string;
  className?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ endTime, className = '' }) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isEnded, setIsEnded] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(endTime).getTime() - new Date().getTime();
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
        setIsEnded(false);
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        setIsEnded(true);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  if (isEnded) {
    return (
      <div className={`bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl p-8 text-center shadow-lg ${className}`}>
        <Clock className="w-10 h-10 text-gray-500 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Giveaway Ended</h3>
        <p className="text-gray-600 text-lg">This magical giveaway has concluded. Check back for winner announcements!</p>
      </div>
    );
  }

  const timeUnits = [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hours', value: timeLeft.hours },
    { label: 'Minutes', value: timeLeft.minutes },
    { label: 'Seconds', value: timeLeft.seconds },
  ];

  return (
    <div className={`bg-gradient-to-br from-pink-50 via-rose-50 to-maroon-50 rounded-2xl p-8 shadow-xl border border-pink-200 ${className}`}>
      <div className="flex items-center justify-center mb-6">
        <div className="bg-gradient-to-r from-maroon-600 to-pink-600 p-2 rounded-xl mr-3">
          <Clock className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-2xl font-bold bg-gradient-to-r from-maroon-700 to-pink-600 bg-clip-text text-transparent">
          Time Remaining
        </h3>
        <Sparkles className="w-5 h-5 text-pink-500 ml-2 animate-pulse" />
      </div>
      
      <div className="grid grid-cols-4 gap-4">
        {timeUnits.map((unit, index) => (
          <div key={unit.label} className="text-center">
            <div className="bg-white rounded-xl p-4 shadow-lg mb-3 border border-pink-100 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="text-3xl font-bold bg-gradient-to-r from-maroon-600 to-pink-600 bg-clip-text text-transparent">
                {unit.value.toString().padStart(2, '0')}
              </div>
            </div>
            <div className="text-sm font-semibold text-gray-700">{unit.label}</div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 bg-white/50 rounded-lg px-4 py-2 inline-block">
          ✨ Don't miss out on this magical opportunity!
        </p>
      </div>
    </div>
  );
};