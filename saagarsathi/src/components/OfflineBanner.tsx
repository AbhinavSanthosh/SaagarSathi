import React from 'react';
import { WifiOff, MessageSquare } from 'lucide-react';

export default function OfflineBanner() {
  return (
    <div className="bg-danger text-white px-4 py-3 flex flex-col sm:flex-row items-center justify-between z-50 relative">
      <div className="flex items-center space-x-2 mb-2 sm:mb-0">
        <WifiOff size={20} />
        <span className="font-medium text-sm">Offline. Showing last synced data from 10:00 AM.</span>
      </div>
      <button className="flex items-center space-x-2 bg-white text-danger px-4 py-1.5 rounded-full text-sm font-semibold hover:bg-gray-100 transition-colors">
        <MessageSquare size={16} />
        <span>Send SMS Query instead</span>
      </button>
    </div>
  );
}
