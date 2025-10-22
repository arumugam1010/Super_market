import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { Notification } from '../../types';

interface NotificationToastProps {
  notification: Notification;
  onClose: () => void;
  duration?: number;
}

const iconMap = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info
};

const bgColorMap = {
  success: 'bg-green-50 border-green-200',
  error: 'bg-red-50 border-red-200',
  warning: 'bg-yellow-50 border-yellow-200',
  info: 'bg-blue-50 border-blue-200'
};

const textColorMap = {
  success: 'text-green-800',
  error: 'text-red-800',
  warning: 'text-yellow-800',
  info: 'text-blue-800'
};

const iconColorMap = {
  success: 'text-green-400',
  error: 'text-red-400',
  warning: 'text-yellow-400',
  info: 'text-blue-400'
};

export default function NotificationToast({ notification, onClose, duration = 5000 }: NotificationToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const IconComponent = iconMap[notification.type];

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <div className={`
      fixed top-4 right-4 z-50 transform transition-all duration-300 ease-in-out
      ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      min-w-80 max-w-md border rounded-lg shadow-lg p-4
      ${bgColorMap[notification.type]}
    `}>
      <div className="flex items-start space-x-3">
        <IconComponent className={`w-5 h-5 mt-0.5 flex-shrink-0 ${iconColorMap[notification.type]}`} />
        <div className="flex-1 min-w-0">
          <h4 className={`font-medium text-sm ${textColorMap[notification.type]}`}>
            {notification.title}
          </h4>
          <p className={`text-sm mt-1 ${textColorMap[notification.type]}`}>
            {notification.message}
          </p>
        </div>
        <button
          onClick={handleClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
