import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';

export function CountdownTimer({ targetDate, label }) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(targetDate));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate));
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  function calculateTimeLeft(target) {
    const difference = new Date(target) - new Date();
    
    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
      expired: false,
    };
  }

  const TimeBlock = ({ value, unit }) => (
    <motion.div
      key={value}
      initial={{ scale: 1.1 }}
      animate={{ scale: 1 }}
      className="flex flex-col items-center"
    >
      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-800 flex items-center justify-center shadow-lg">
        <span className="text-2xl font-bold text-white">{String(value).padStart(2, '0')}</span>
      </div>
      <span className="text-xs text-gray-400 mt-1 uppercase">{unit}</span>
    </motion.div>
  );

  if (timeLeft.expired) {
    return (
      <div className="flex items-center gap-2 text-amber-400">
        <Clock className="w-5 h-5" />
        <span className="font-medium">Hearing in progress or completed</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {label && <p className="text-sm text-gray-400">{label}</p>}
      <div className="flex items-center gap-3">
        <TimeBlock value={timeLeft.days} unit="Days" />
        <span className="text-2xl text-gray-500 mb-4">:</span>
        <TimeBlock value={timeLeft.hours} unit="Hours" />
        <span className="text-2xl text-gray-500 mb-4">:</span>
        <TimeBlock value={timeLeft.minutes} unit="Mins" />
        <span className="text-2xl text-gray-500 mb-4">:</span>
        <TimeBlock value={timeLeft.seconds} unit="Secs" />
      </div>
    </div>
  );
}
