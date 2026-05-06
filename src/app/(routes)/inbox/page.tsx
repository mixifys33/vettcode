"use client";

import React from 'react';
import { MessageCircle } from 'lucide-react';

export default function InboxPage() {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <div className="w-20 h-20 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
          <MessageCircle className="w-10 h-10 text-blue-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Chat coming soon</h2>
        <p className="text-gray-500 text-sm">Messaging between buyers and sellers will be available shortly.</p>
      </div>
    </div>
  );
}

