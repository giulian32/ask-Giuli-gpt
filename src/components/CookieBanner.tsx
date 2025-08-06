import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface CookieBannerProps {
  language: 'en' | 'de';
}

const CookieBanner: React.FC<CookieBannerProps> = ({ language }) => {
  const [showBanner, setShowBanner] = useState(false);
  const [isTracking, setIsTracking] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setShowBanner(true);
    } else if (consent === 'accepted') {
      trackVisitor();
    }
  }, []);

  const trackVisitor = async () => {
    if (isTracking) return;
    setIsTracking(true);
    
    try {
      const { createClient } = await import('@supabase/supabase-js');
      
      const supabaseClient = createClient(
        'https://vfkzqmhbbgppjhgkqhzl.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZma3pxbWhiYmdwcGpoZ2txaHpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0MDA0MjMsImV4cCI6MjA2OTk3NjQyM30.yCgjVVR7nWSlA0ITYX6A2J1eObp3lQFbXgUQCzg7bKo'
      );

      const { error } = await supabaseClient
        .from('visitors')
        .insert({
          ip_address: 'Unknown', // IP will be set by server-side function
          user_agent: navigator.userAgent,
          accept_language: navigator.language,
          visited_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Error tracking visitor:', error);
        throw error;
      }

      console.log('Visitor tracked successfully');
    } catch (error) {
      console.error('Error tracking visitor:', error);
    }
  };

  const acceptCookies = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setShowBanner(false);
    trackVisitor();
  };

  const declineCookies = () => {
    localStorage.setItem('cookie-consent', 'declined');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50">
      <Card className="bg-card/95 backdrop-blur-sm border-2">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold">
                  {language === 'de' ? '🍪 Cookies & Tracking' : '🍪 Cookies & Tracking'}
                </h3>
                <Badge variant="destructive" className="text-xs">
                  {language === 'de' ? 'SICHERHEIT' : 'SECURITY'}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {language === 'de' 
                  ? 'Wir verwenden Cookies und sammeln IP-Adressen zu Sicherheitszwecken. Ihre Daten werden legal für die Überwachung und Sicherheit der Website verwendet. Bei missbräuchlicher Nutzung können wir Ihre IP-Adresse verfolgen.'
                  : 'We use cookies and collect IP addresses for security purposes. Your data is legally used for website monitoring and security. In case of abuse, we can trace your IP address.'
                }
              </p>
              <div className="mt-2 text-xs text-muted-foreground">
                <p>
                  {language === 'de' 
                    ? '📍 IP-Tracking aktiv | 🛡️ Rechtlicher Schutz | ⚖️ DSGVO-konform'
                    : '📍 IP tracking active | 🛡️ Legal protection | ⚖️ GDPR compliant'
                  }
                </p>
              </div>
            </div>
            <div className="flex gap-2 md:flex-col lg:flex-row">
              <Button 
                onClick={declineCookies}
                variant="outline" 
                size="sm"
                className="min-w-[100px]"
              >
                {language === 'de' ? 'Ablehnen' : 'Decline'}
              </Button>
              <Button 
                onClick={acceptCookies}
                size="sm"
                className="min-w-[100px] bg-green-600 hover:bg-green-700"
              >
                {language === 'de' ? 'Akzeptieren' : 'Accept'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CookieBanner;