import React from 'react';
import { Search, LogOut } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import NotificationBell from '../Notifications/NotificationBell';

export default function Header() {
  const { currentUser, logout } = useApp();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search products..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
            />
          </div>

          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <NotificationBell />

            {/* Logout Button */}
            <button
              onClick={logout}
              className="flex items-center space-x-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
            {/* Current Date & Time */}
            <div className="text-sm text-gray-600 text-right">
              <p className="font-medium">{currentUser?.name}</p>
              <p className="text-xs">
                {new Date().toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}