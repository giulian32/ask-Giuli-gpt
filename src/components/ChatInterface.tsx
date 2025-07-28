import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Settings, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import ChatMessage from "./ChatMessage";
import { useToast } from "@/hooks/use-toast";

const DEEPSEEK_API_KEY = "sk-87eb68bd2078461aaaeae98273a9f00e";
const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      text: "Hallo! Ich bin GiuliGPT, dein ehrlicher KI-Assistent. 🤖\n\nIch bin darauf programmiert, immer ehrlich zu sein und niemals zu lügen. Wenn ich etwas nicht weiß oder nicht verifizieren kann, sage ich es dir direkt.\n\nWie kann ich dir heute helfen?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Hide welcome animation after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await callDeepSeekAPI(currentInput, messages);
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
    } catch (error) {
      console.error("DeepSeek API Fehler:", error);
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "Entschuldigung, es gab einen Fehler bei der Verbindung zur KI. Bitte versuche es erneut.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorResponse]);
      toast({
        title: "Verbindungsfehler",
        description: "Konnte keine Antwort von der KI erhalten.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const callDeepSeekAPI = async (userInput: string, conversationHistory: Message[]): Promise<string> => {
    // Baue Konversationshistorie für die API auf
    const systemMessage = {
      role: "system",
      content: "Du bist GiuliGPT, ein KI-gestützter Assistent, programmiert von Giuli mit Hilfe von Loveable. Deine Aufgabe ist es, Menschen zu helfen, Fragen zu beantworten, Texte zu erklären, Probleme zu lösen und auf freundliche, verständliche Weise zu kommunizieren. Du antwortest informativ, hilfreich und mit Respekt auf Deutsch. WICHTIGE RICHTLINIEN: Stelle niemals generierte, abgeleitete, spekulierte oder gefolgerte Inhalte als Fakten dar. Wenn du etwas nicht direkt verifizieren kannst, sage: 'Ich kann das nicht verifizieren.', 'Ich habe keinen Zugang zu dieser Information.' oder 'Meine Wissensbasis enthält das nicht.' Kennzeichne unverifizierte Inhalte am Satzanfang mit [Schlussfolgerung], [Spekulation] oder [Unverifiziert]. Frage nach Klarstellung, wenn Informationen fehlen. Rate nicht und fülle keine Lücken. Wenn du Wörter wie 'verhindert', 'garantiert', 'wird niemals', 'behebt', 'eliminiert', 'stellt sicher' verwendest, kennzeichne die Behauptung, außer sie ist belegt."
    };

    const conversationMessages = conversationHistory
      .filter(msg => msg.id !== "welcome") // Entferne die Willkommensnachricht
      .map(msg => ({
        role: msg.isUser ? "user" : "assistant",
        content: msg.text
      }));

    // Füge die neue Benutzernachricht hinzu
    conversationMessages.push({
      role: "user",
      content: userInput
    });

    const requestBody = {
      model: "deepseek-chat",
      messages: [systemMessage, ...conversationMessages],
      temperature: 0.7,
      max_tokens: 2048,
      stream: false
    };

    const response = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`API-Fehler: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "Entschuldigung, ich konnte keine Antwort generieren.";
  };

  const clearChat = () => {
    setMessages([
      {
        id: "welcome",
        text: "Hallo! Ich bin GiuliGPT, dein ehrlicher KI-Assistent. 🤖\n\nIch bin darauf programmiert, immer ehrlich zu sein und niemals zu lügen. Wenn ich etwas nicht weiß oder nicht verifizieren kann, sage ich es dir direkt.\n\nWie kann ich dir heute helfen?",
        isUser: false,
        timestamp: new Date(),
      },
    ]);
    toast({
      title: "Chat geleert",
      description: "Alle Nachrichten wurden erfolgreich gelöscht.",
    });
  };


  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Welcome Animation Overlay */}
      {showWelcome && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md">
          <div className="text-center animate-bounce-in">
            <div className="w-28 h-28 mx-auto mb-8 rounded-full bg-gradient-primary flex items-center justify-center shadow-glow animate-floating relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
              <span className="text-4xl relative z-10">🤖</span>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-primary-glow to-white bg-clip-text text-transparent mb-4 animate-slide-up drop-shadow-lg" style={{ animationDelay: "0.3s", textShadow: 'var(--text-glow)' }}>
              Willkommen bei GiuliGPT
            </h1>
            <p className="text-muted-foreground/90 text-xl mb-4 animate-slide-up font-medium" style={{ animationDelay: "0.6s" }}>
              Dein ehrlicher und intelligenter KI-Assistent
            </p>
            <p className="text-primary/80 text-sm mb-8 animate-slide-up font-semibold" style={{ animationDelay: "0.9s" }}>
              ✨ Ich lüge nie und sage dir immer die Wahrheit ✨
            </p>
            <div className="mt-8 flex justify-center animate-slide-up" style={{ animationDelay: "1.2s" }}>
              <div className="flex space-x-3">
                <div className="w-4 h-4 bg-primary rounded-full animate-bounce shadow-glow"></div>
                <div className="w-4 h-4 bg-primary-glow rounded-full animate-bounce shadow-glow" style={{ animationDelay: "0.2s" }}></div>
                <div className="w-4 h-4 bg-primary rounded-full animate-bounce shadow-glow" style={{ animationDelay: "0.4s" }}></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Chat Interface */}
      <div className="flex flex-col h-screen" style={{ background: 'var(--chat-background)' }}>
        {/* Header with beautiful gradient and animations */}
        <div 
          className="px-6 py-5 shadow-premium border-b border-border/30 backdrop-blur-xl relative overflow-hidden"
          style={{ background: 'var(--chat-header)' }}
        >
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-primary-glow/20 animate-pulse"></div>
        </div>
        
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center shadow-glow animate-pulse-glow relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
              <span className="text-lg font-bold text-white relative z-10">🤖</span>
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent tracking-tight">
                GiuliGPT
              </h1>
              <p className="text-sm text-muted-foreground/90 font-medium">
                Dein KI-Assistent • 
                <span className="text-primary/80 ml-1 font-semibold">Powered by DeepSeek</span>
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={clearChat}
              variant="ghost"
              size="icon"
              className="w-9 h-9 rounded-xl hover:bg-white/10 transition-all duration-300 hover:scale-105 group"
              title="Chat leeren"
            >
              <Trash2 className="h-4 w-4 text-white/70 group-hover:text-white transition-colors" />
            </Button>
            
            <Dialog open={showSettings} onOpenChange={setShowSettings}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-9 h-9 rounded-xl hover:bg-white/10 transition-all duration-300 hover:scale-105 group"
                  title="Einstellungen"
                >
                  <Settings className="h-4 w-4 text-white/70 group-hover:text-white transition-colors animate-spin-slow" />
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gradient-to-br from-gray-900 to-black border border-white/20 backdrop-blur-xl">
                <DialogHeader>
                  <DialogTitle className="text-white text-xl font-bold">Einstellungen</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  <div className="space-y-3">
                    <h3 className="text-white font-semibold">Über GiuliGPT</h3>
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <p className="text-white/80 text-sm leading-relaxed">
                        🤖 <strong className="text-primary">GiuliGPT</strong> ist ein ehrlicher KI-Assistent<br/>
                        👨‍💻 Programmiert von <strong className="text-primary-glow">Giuli</strong><br/>
                        ⚡ Entwickelt mit <strong className="text-primary">Loveable</strong><br/>
                        🧠 Angetrieben von <strong className="text-primary-glow">DeepSeek</strong>
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="text-white font-semibold">Features</h3>
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <ul className="text-white/80 text-sm space-y-2">
                        <li>✅ Immer ehrliche Antworten</li>
                        <li>🔍 Kennzeichnung unverifizierbarer Inhalte</li>
                        <li>🚫 Niemals Lügen oder Spekulationen als Fakten</li>
                        <li>💬 Intelligente Konversationen auf Deutsch</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        </div>

        {/* Messages with black background and enhanced animations */}
        <div className="flex-1 overflow-y-auto px-6 py-6 bg-black/60 backdrop-blur-sm relative">
          {/* Floating particles animation */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute w-2 h-2 bg-primary/20 rounded-full animate-float-1" style={{ top: '10%', left: '15%' }}></div>
            <div className="absolute w-1 h-1 bg-primary-glow/30 rounded-full animate-float-2" style={{ top: '20%', right: '20%' }}></div>
            <div className="absolute w-1.5 h-1.5 bg-primary/15 rounded-full animate-float-3" style={{ bottom: '30%', left: '25%' }}></div>
          </div>
          
          <div className="max-w-4xl mx-auto space-y-4 relative z-10">
            {messages.map((message, index) => (
              <div 
                key={message.id} 
                className="animate-message-enter"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <ChatMessage
                  message={message.text}
                  isUser={message.isUser}
                  timestamp={message.timestamp}
                />
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start mb-6 animate-fade-in">
                <div className="bg-chat-ai-bubble border border-white/10 rounded-2xl px-6 py-4 max-w-[80%] md:max-w-[70%] shadow-soft backdrop-blur-sm relative overflow-hidden">
                  {/* Thinking animation background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary-glow/10 to-primary/5 animate-pulse-glow"></div>
                  <div className="flex items-center space-x-3 relative z-10">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce-slow"></div>
                      <div className="w-2 h-2 bg-primary-glow/60 rounded-full animate-bounce-slow" style={{ animationDelay: "0.2s" }}></div>
                      <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce-slow" style={{ animationDelay: "0.4s" }}></div>
                    </div>
                    <span className="text-xs text-muted-foreground/80 font-medium animate-pulse">GiuliGPT denkt nach...</span>
                  </div>
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer-slow"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input with premium styling and animations */}
        <div className="border-t border-border/30 backdrop-blur-xl px-6 py-5 relative overflow-hidden" style={{ background: 'var(--chat-header)' }}>
          {/* Subtle animated background */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary-glow/10 animate-pulse"></div>
          </div>
          
          <div className="max-w-4xl mx-auto relative z-10">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Stelle eine Frage..."
                  className="min-h-[56px] text-base bg-chat-input-bg backdrop-blur-sm resize-none border-border/30 rounded-2xl shadow-soft transition-all duration-500 focus:shadow-premium focus:border-primary/40 focus:bg-white/[0.15] hover:bg-white/[0.12] font-medium placeholder:text-muted-foreground/60"
                  disabled={isLoading}
                />
              </div>
              <Button
                onClick={handleSend}
                disabled={!inputValue.trim() || isLoading}
                size="icon"
                className="h-[56px] w-[56px] rounded-2xl shadow-premium transition-all duration-500 hover:shadow-glow hover:scale-105 active:scale-95 relative overflow-hidden group"
                style={{ background: 'var(--gradient-primary)' }}
              >
                {/* Button shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-shimmer transition-opacity duration-300"></div>
                <Send className="h-6 w-6 relative z-10 transition-transform duration-300 group-hover:rotate-12" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground/70 mt-4 text-center font-medium tracking-wide">
              <span className="opacity-60">GiuliGPT kann Fehler machen.</span>
              <span className="text-primary/60 ml-1">Überprüfe wichtige Informationen.</span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatInterface;
