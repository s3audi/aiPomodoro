import React, { useEffect } from 'react';
import { CheckCircleIcon, AlertTriangleIcon, XCircleIcon } from './icons';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000); // Auto-dismiss after 5 seconds

    return () => {
      clearTimeout(timer);
    };
  }, [onClose]);

  const successClasses = 'bg-green-50 border-green-500 text-green-800';
  const errorClasses = 'bg-red-50 border-red-500 text-red-800';
  const themeClasses = type === 'success' ? successClasses : errorClasses;
  
  const Icon = type === 'success' ? CheckCircleIcon : AlertTriangleIcon;
  const iconClasses = type === 'success' ? 'text-green-500' : 'text-red-500';

  return (
    <div className="fixed top-5 right-5 z-50 w-full max-w-sm">
      <div className={`relative flex items-center gap-4 p-4 rounded-lg border-l-4 shadow-lg ${themeClasses}`} role="alert">
        <Icon className={`w-6 h-6 flex-shrink-0 ${iconClasses}`} />
        <p className="text-base font-medium flex-1">{message}</p>
        <button onClick={onClose} className="p-1 rounded-full hover:bg-black/10 transition-colors">
          <XCircleIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default Toast;
