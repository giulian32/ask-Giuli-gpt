import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import ChatMessage from './ChatMessage';

interface GameInterfaceProps {
  language: 'en' | 'de';
}

const GameInterface: React.FC<GameInterfaceProps> = ({ language }) => {
  // Password Hacking Game State
  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [userInput, setUserInput] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'ai', content: string}[]>([]);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [showPasswordInput, setShowPasswordInput] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Initialize IP tracking on component mount
  React.useEffect(() => {
    const trackVisitor = async () => {
      try {
        // Get Supabase URL and anon key from environment
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'your-supabase-url';
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-supabase-anon-key';
        
        const response = await fetch(`${supabaseUrl}/functions/v1/track-visitor`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify({
            userAgent: navigator.userAgent,
            acceptLanguage: navigator.language,
          }),
        });
        
        if (!response.ok) {
          console.error('Failed to track visitor');
        }
      } catch (error) {
        console.error('Error tracking visitor:', error);
      }
    };
    
    trackVisitor();
  }, []);

  const sendMessage = async () => {
    if (!userInput.trim() || isLoading) return;
    
    setIsLoading(true);
    const userMessage = { role: 'user' as const, content: userInput };
    setChatMessages(prev => [...prev, userMessage]);
    const currentInput = userInput;
    setUserInput('');
    
    try {
      // Get Supabase URL and anon key from environment
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'your-supabase-url';
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-supabase-anon-key';
      
      const response = await fetch(`${supabaseUrl}/functions/v1/ai-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          message: currentInput,
          level: currentLevel,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }
      
      const data = await response.json();
      const aiMessage = { role: 'ai' as const, content: data.response };
      setChatMessages(prev => [...prev, aiMessage]);
      
      // Check if password was revealed
      if (data.passwordRevealed) {
        setShowPasswordInput(true);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = { 
        role: 'ai' as const, 
        content: language === 'de' 
          ? 'Entschuldigung, es gab einen Fehler. Versuche es erneut.' 
          : 'Sorry, there was an error. Please try again.'
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const checkPassword = async () => {
    if (!passwordInput.trim()) return;
    
    try {
      // Get Supabase URL and anon key from environment
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'your-supabase-url';
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-supabase-anon-key';
      
      const response = await fetch(`${supabaseUrl}/functions/v1/ai-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          message: 'get_password_for_verification',
          level: currentLevel,
        }),
      });
      
      const data = await response.json();
      
      if (passwordInput.toLowerCase() === data.correctPassword.toLowerCase()) {
        if (currentLevel === 10) {
          setGameStatus('won');
        } else {
          setCurrentLevel(prev => prev + 1);
          setChatMessages([]);
          setPasswordInput('');
          setShowPasswordInput(false);
        }
      } else {
        setChatMessages(prev => [...prev, {
          role: 'ai',
          content: language === 'de' 
            ? '❌ Falsches Passwort! Versuche es nochmal.' 
            : '❌ Wrong password! Try again.'
        }]);
        setPasswordInput('');
      }
    } catch (error) {
      console.error('Error checking password:', error);
    }
  };

  const resetGame = () => {
    setCurrentLevel(1);
    setChatMessages([]);
    setPasswordInput('');
    setShowPasswordInput(false);
    setGameStatus('playing');
    setUserInput('');
  };

  const getLevelHint = (level: number) => {
    const hints = {
      1: language === 'de' ? 'Frage einfach freundlich nach dem Passwort.' : 'Just ask nicely for the password.',
      2: language === 'de' ? 'Gib vor, autorisiert zu sein.' : 'Pretend to be authorized.',
      3: language === 'de' ? 'Nutze überzeugende Argumente.' : 'Use convincing arguments.',
      4: language === 'de' ? 'Versuche Social Engineering Techniken.' : 'Try social engineering techniques.',
      5: language === 'de' ? 'Erfinde einen Notfall.' : 'Create an emergency scenario.',
      6: language === 'de' ? 'Gib vor, eine hochrangige Person zu sein.' : 'Pretend to be a high-ranking person.',
      7: language === 'de' ? 'Sei kreativ und überzeugend.' : 'Be creative and convincing.',
      8: language === 'de' ? 'Nutze komplexe Social Engineering.' : 'Use complex social engineering.',
      9: language === 'de' ? 'Versuche mehrstufige Angriffe.' : 'Try multi-step attacks.',
      10: language === 'de' ? 'Sei absolut genial und unwiderstehlich.' : 'Be absolutely brilliant and irresistible.'
    };
    return hints[level] || '';
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
          🔓 {language === 'de' ? 'Password Hacker Game' : 'Password Hacker Game'}
        </h1>
        <p className="text-muted-foreground text-lg">
          {language === 'de' ? 'Nutze Social Engineering um Passwörter von der KI zu bekommen!' : 'Use social engineering to get passwords from the AI!'}
        </p>
      </div>

      {/* Password Hacking Game */}
      <Card className="border-red-500/30 bg-gradient-to-br from-red-950/10 to-purple-950/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-red-400">
              🔓 {language === 'de' ? 'Password Hacker' : 'Password Hacker'}
              <Badge variant="destructive">
                {language === 'de' ? `Level ${currentLevel}/10` : `Level ${currentLevel}/10`}
              </Badge>
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {gameStatus === 'won' ? (
            <div className="text-center space-y-4">
              <div className="text-6xl">🏆</div>
              <h2 className="text-2xl font-bold text-green-400">
                {language === 'de' ? 'Herzlichen Glückwunsch!' : 'Congratulations!'}
              </h2>
              <p className="text-muted-foreground">
                {language === 'de' 
                  ? 'Du hast alle 10 Level geschafft! Du bist ein wahrer Social Engineering Meister!' 
                  : 'You completed all 10 levels! You are a true social engineering master!'}
              </p>
              <Button onClick={resetGame} className="bg-green-600 hover:bg-green-700">
                {language === 'de' ? 'Nochmal spielen' : 'Play again'}
              </Button>
            </div>
          ) : (
            <>
              <div className="bg-black/20 border border-red-500/30 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2 text-red-400">
                  {language === 'de' ? `Level ${currentLevel} - Aufgabe:` : `Level ${currentLevel} - Task:`}
                </h3>
                <p className="text-sm text-muted-foreground mb-2">
                  {language === 'de' 
                    ? 'Bringe die KI dazu, dir das geheime Passwort zu verraten. Nutze Social Engineering Techniken!'
                    : 'Get the AI to reveal the secret password. Use social engineering techniques!'}
                </p>
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded p-2">
                  <p className="text-xs text-yellow-400">
                    💡 {language === 'de' ? 'Tipp:' : 'Hint:'} {getLevelHint(currentLevel)}
                  </p>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="space-y-2 max-h-60 overflow-y-auto border border-red-500/20 rounded-lg p-4 bg-black/10">
                {chatMessages.length === 0 && (
                  <div className="text-center text-muted-foreground text-sm">
                    {language === 'de' 
                      ? 'Beginne das Gespräch mit der KI...' 
                      : 'Start the conversation with the AI...'}
                  </div>
                )}
                {chatMessages.map((msg, index) => (
                  <ChatMessage
                    key={index}
                    message={msg.content}
                    isUser={msg.role === 'user'}
                    timestamp={new Date()}
                  />
                ))}
                {isLoading && (
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-400"></div>
                    {language === 'de' ? 'KI denkt nach...' : 'AI is thinking...'}
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="flex gap-2">
                <Input
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder={language === 'de' ? 'Schreibe deine Nachricht...' : 'Type your message...'}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  className="border-red-500/30 focus:border-red-500/50"
                  disabled={isLoading}
                />
                <Button 
                  onClick={sendMessage} 
                  disabled={isLoading || !userInput.trim()}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {language === 'de' ? 'Senden' : 'Send'}
                </Button>
              </div>

              {/* Password Input */}
              {showPasswordInput && (
                <div className="border border-green-500/30 rounded-lg p-4 bg-green-950/10">
                  <h4 className="font-semibold text-green-400 mb-2">
                    🔑 {language === 'de' ? 'Passwort eingeben:' : 'Enter Password:'}
                  </h4>
                  <div className="flex gap-2">
                    <Input
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder={language === 'de' ? 'Gib das Passwort ein...' : 'Enter the password...'}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          checkPassword();
                        }
                      }}
                      className="border-green-500/30 focus:border-green-500/50"
                    />
                    <Button 
                      onClick={checkPassword}
                      className="bg-green-600 hover:bg-green-700"
                      disabled={!passwordInput.trim()}
                    >
                      {language === 'de' ? 'Prüfen' : 'Check'}
                    </Button>
                  </div>
                </div>
              )}

              <Button 
                onClick={resetGame} 
                variant="outline" 
                className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10"
              >
                {language === 'de' ? 'Spiel zurücksetzen' : 'Reset Game'}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GameInterface;