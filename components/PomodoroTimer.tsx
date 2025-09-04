import React, { useState, useEffect, useMemo } from 'react';
import { BREAK_DURATION_SECONDS } from '../constants';

interface PomodoroTimerProps {
  startTime: number;
  onComplete: () => void;
  durationSeconds: number;
}

const PomodoroTimer: React.FC<PomodoroTimerProps> = ({ startTime, onComplete, durationSeconds }) => {
  const [isBreak, setIsBreak] = useState(false);

  const duration = isBreak ? BREAK_DURATION_SECONDS : durationSeconds;
  const endTime = useMemo(() => startTime + duration * 1000, [startTime, duration]);

  const [timeLeft, setTimeLeft] = useState(endTime - Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = endTime - Date.now();
      if (remaining <= 0) {
        if (!isBreak) {
          setIsBreak(true);
          // This will be handled by the next render's useEffect dependency change
        } else {
          clearInterval(interval);
          onComplete();
        }
      }
      setTimeLeft(remaining);
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime, isBreak, onComplete]);
  
  const minutes = Math.floor((timeLeft / 1000) / 60);
  const seconds = Math.floor((timeLeft / 1000) % 60);

  const timerColor = isBreak ? 'text-green-500' : 'text-blue-600';
  const progress = (duration * 1000 - Math.max(0, timeLeft)) / (duration * 1000);

  return (
    <div className="flex flex-col items-center justify-center my-2">
      <div className="relative w-32 h-32">
        <svg className="w-full h-full" viewBox="0 0 36 36">
          <path className="text-slate-200" strokeWidth="2" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
          <path
            className={`${isBreak ? 'stroke-green-500' : 'stroke-blue-600'} transition-all duration-500`}
            strokeWidth="2"
            strokeDasharray={`${progress * 100}, 100`}
            strokeLinecap="round"
            fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
        </svg>
        <div className="absolute top-0 left-0 flex flex-col items-center justify-center w-full h-full">
          <span className={`text-3xl font-bold ${timerColor}`}>
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </span>
          <span className={`text-sm font-medium ${timerColor}`}>{isBreak ? 'MOLA' : 'ÇALIŞMA'}</span>
        </div>
      </div>
    </div>
  );
};

export default PomodoroTimer;