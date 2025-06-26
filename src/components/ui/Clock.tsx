import React, { useEffect, useState } from 'react';

interface ClockProps {
  language: string;
}

export const Clock: React.FC<ClockProps> = ({ language }) => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Dátum formázás a kiválasztott nyelv szerint
  const dateOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  };
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  };

  const formattedDate = now.toLocaleDateString(language === 'hu' ? 'hu-HU' : 'en-US', dateOptions);
  const formattedTime = now.toLocaleTimeString(language === 'hu' ? 'hu-HU' : 'en-US', timeOptions);

  return (
    <div className="flex flex-col items-center justify-center py-2 select-none">
      <div className="text-lg font-semibold text-gray-700 dark:text-gray-200">
        {formattedDate}
      </div>
      <div className="text-4xl font-mono font-bold text-primary-600 dark:text-primary-400 tracking-widest">
        {formattedTime}
      </div>
    </div>
  );
}; 