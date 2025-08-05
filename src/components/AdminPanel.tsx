import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { createClient } from '@supabase/supabase-js';

interface AdminPanelProps {
  language: 'en' | 'de';
  onClose: () => void;
}

interface Visitor {
  id: number;
  ip_address: string;
  user_agent: string;
  accept_language: string;
  visited_at: string;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ language, onClose }) => {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const authenticate = () => {
    if (password === 'admin123') {
      setIsAuthenticated(true);
      setError('');
      loadVisitors();
    } else {
      setError(language === 'de' ? 'Falsches Passwort!' : 'Wrong password!');
    }
  };

  const loadVisitors = async () => {
    setLoading(true);
    try {
      const response = await fetch('/functions/v1/admin-visitors', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load visitors');
      }

      const data = await response.json();
      setVisitors(data || []);
    } catch (err) {
      console.error('Error loading visitors:', err);
      setError(language === 'de' ? 'Fehler beim Laden der Daten' : 'Error loading data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString(language === 'de' ? 'de-DE' : 'en-US');
  };

  const getCountryFlag = (acceptLanguage: string) => {
    if (!acceptLanguage) return '🌍';
    const lang = acceptLanguage.split(',')[0].toLowerCase();
    const flags: Record<string, string> = {
      'de': '🇩🇪',
      'en': '🇺🇸',
      'fr': '🇫🇷',
      'es': '🇪🇸',
      'it': '🇮🇹',
      'ja': '🇯🇵',
      'zh': '🇨🇳',
      'ru': '🇷🇺',
    };
    return flags[lang.split('-')[0]] || '🌍';
  };

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <Card className="w-full max-w-md mx-4">
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center gap-2">
              🔒 {language === 'de' ? 'Admin-Bereich' : 'Admin Area'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={language === 'de' ? 'Admin-Passwort eingeben...' : 'Enter admin password...'}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    authenticate();
                  }
                }}
              />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="flex gap-2">
              <Button onClick={onClose} variant="outline" className="flex-1">
                {language === 'de' ? 'Abbrechen' : 'Cancel'}
              </Button>
              <Button onClick={authenticate} className="flex-1">
                {language === 'de' ? 'Anmelden' : 'Login'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              👨‍💼 {language === 'de' ? 'Admin-Panel - IP-Tracking' : 'Admin Panel - IP Tracking'}
              <Badge variant="destructive">LIVE</Badge>
            </CardTitle>
            <Button onClick={onClose} variant="outline" size="sm">
              ✕ {language === 'de' ? 'Schließen' : 'Close'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="overflow-auto max-h-[70vh]">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-green-600">
                📊 {visitors.length} {language === 'de' ? 'Besucher' : 'Visitors'}
              </Badge>
              <Badge variant="outline" className="text-blue-600">
                🔒 {language === 'de' ? 'Sicherheitsüberwachung aktiv' : 'Security monitoring active'}
              </Badge>
            </div>
            <Button onClick={loadVisitors} disabled={loading} size="sm">
              🔄 {loading ? (language === 'de' ? 'Lädt...' : 'Loading...') : (language === 'de' ? 'Aktualisieren' : 'Refresh')}
            </Button>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">
                    {language === 'de' ? 'Land' : 'Country'}
                  </TableHead>
                  <TableHead>
                    {language === 'de' ? 'IP-Adresse' : 'IP Address'}
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                    {language === 'de' ? 'Browser/Gerät' : 'Browser/Device'}
                  </TableHead>
                  <TableHead>
                    {language === 'de' ? 'Besuchszeit' : 'Visit Time'}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visitors.map((visitor) => (
                  <TableRow key={visitor.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getCountryFlag(visitor.accept_language)}</span>
                        <span className="text-xs text-muted-foreground">
                          {visitor.accept_language?.split(',')[0] || 'unknown'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono text-xs">
                          {visitor.ip_address}
                        </Badge>
                        {visitor.ip_address.includes('127.0.0.1') || visitor.ip_address.includes('localhost') ? (
                          <Badge variant="secondary" className="text-xs">LOCAL</Badge>
                        ) : (
                          <Badge variant="destructive" className="text-xs">EXTERN</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell max-w-[300px]">
                      <div className="truncate text-xs text-muted-foreground">
                        {visitor.user_agent}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {formatDate(visitor.visited_at)}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {visitors.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      {language === 'de' ? 'Noch keine Besucher erfasst' : 'No visitors tracked yet'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 text-xs text-muted-foreground text-center">
            <p>
              {language === 'de' 
                ? '⚖️ Rechtlicher Hinweis: IP-Adressen werden zu Sicherheitszwecken erfasst und können bei missbräuchlicher Nutzung zur Strafverfolgung verwendet werden.'
                : '⚖️ Legal Notice: IP addresses are collected for security purposes and may be used for prosecution in case of abuse.'
              }
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPanel;