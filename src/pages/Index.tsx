import React, { useState } from 'react';
import ChatInterface from '@/components/ChatInterface';
import CookieBanner from '@/components/CookieBanner';
import AdminPanel from '@/components/AdminPanel';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const Index = () => {
  const [language, setLanguage] = useState<'en' | 'de'>('de');
  const [showAdmin, setShowAdmin] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="p-4 border-b border-white/10 backdrop-blur-sm bg-black/20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              🎮 Game Hub
            </h1>
            <Badge variant="outline" className="text-green-400 border-green-400">
              LIVE
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLanguage(language === 'de' ? 'en' : 'de')}
              className="border-white/20 text-white hover:bg-white/10"
            >
              {language === 'de' ? '🇺🇸 EN' : '🇩🇪 DE'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdmin(true)}
              className="border-yellow-400/50 text-yellow-400 hover:bg-yellow-400/10"
            >
              👨‍💼 Admin
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto py-8">
        <ChatInterface />
      </main>

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
