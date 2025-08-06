import React, { useState } from 'react';
import ChatInterface from '@/components/ChatInterface';
import CookieBanner from '@/components/CookieBanner';
import AdminPanel from '@/components/AdminPanel';

const Index = () => {
  const [language, setLanguage] = useState<'en' | 'de'>('de');
  const [showAdmin, setShowAdmin] = useState(false);

  return (
    <div className="min-h-screen">
      {/* Fullscreen Chat Interface */}
      <ChatInterface language={language} onShowAdmin={() => setShowAdmin(true)} />

      {/* Cookie Banner */}
      <CookieBanner language={language} />

      {/* Admin Panel */}
      {showAdmin && (
        <AdminPanel 
          language={language} 
          onClose={() => setShowAdmin(false)} 
        />
      )}
    </div>
  );
};

export default Index;
