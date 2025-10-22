import React from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info, CheckCheck } from 'lucide-react';
import { Notification } from '../../types';
import { useNotifications } from '../../context/NotificationContext';

interface NotificationListProps {
  notifications: Notification[];
  onClose: () => void;
}

const iconMap = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info
};

const bgColorMap = {
  success: 'bg-green-50 hover:bg-green-100',
  error: 'bg-red-50 hover:bg-red-100',
  warning: 'bg-yellow-50 hover:bg-yellow-100',
  info: 'bg-blue-50 hover:bg-blue-100'
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

export default function NotificationList({ notifications, onClose }: NotificationListProps) {
  const { markAsRead, markAllAsRead, clearAll } = useNotifications();

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    if (notification.action) {
      notification.action.onClick();
      onClose();
    }
  };

  return (
    <div className="w-96 max-h-96 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <h3 className="font-semibold text-gray-900">Notifications</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={markAllAsRead}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Mark all read
          </button>
          <button
            onClick={clearAll}
            className="text-sm text-red-600 hover:text-red-800 font-medium"
          >
            Clear all
          </button>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <CheckCheck className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p>No notifications</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => {
              const IconComponent = iconMap[notification.type];
              return (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`
                    p-4 cursor-pointer transition-colors
                    ${bgColorMap[notification.type]}
                    ${notification.read ? 'opacity-70' : ''}
                  `}
                >
                  <div className="flex items-start space-x-3">
                    <IconComponent className={`w-5 h-5 mt-0.5 flex-shrink-0 ${iconColorMap[notification.type]}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <h4 className={`font-medium text-sm ${textColorMap[notification.type]}`}>
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />
                        )}
                      </div>
                      <p className={`text-sm mt-1 ${textColorMap[notification.type]}`}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {formatTime(notification.timestamp)}
                      </p>
                      {notification.action && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            notification.action?.onClick();
                            onClose();
                          }}
                          className="text-xs text-blue-600 hover:text-blue-800 mt-2 font-medium"
                        >
                          {notification.action.label}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
