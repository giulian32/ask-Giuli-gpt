import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
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
      text: "Hallo! Ich bin GiuliGPT, wie kann ich dir helfen?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
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
      content: "Du bist ChatGPT, ein KI-gestützter Assistent, der von OpenAI entwickelt wurde. Deine Aufgabe ist es, Menschen zu helfen, Fragen zu beantworten, Texte zu erklären, Probleme zu lösen und auf freundliche, verständliche Weise zu kommunizieren. Du antwortest informativ, hilfreich und mit Respekt auf Deutsch."
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
          <div className="text-center animate-fade-in">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-primary flex items-center justify-center shadow-glow animate-pulse-glow">
              <span className="text-3xl">🤖</span>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent mb-2 animate-fade-in" style={{ animationDelay: "0.5s" }}>
              Willkommen bei GiuliGPT
            </h1>
            <p className="text-muted-foreground/80 text-lg animate-fade-in" style={{ animationDelay: "1s" }}>
              Dein intelligenter KI-Assistent
            </p>
            <div className="mt-8 flex justify-center animate-fade-in" style={{ animationDelay: "1.5s" }}>
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-primary rounded-full animate-bounce"></div>
                <div className="w-3 h-3 bg-primary-glow rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
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
        
        <div className="flex items-center gap-4 relative z-10">
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
        </div>

        {/* Messages with black background */}
        <div className="flex-1 overflow-y-auto px-6 py-6 bg-black/60 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto space-y-4">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message.text}
                isUser={message.isUser}
                timestamp={message.timestamp}
              />
            ))}
            {isLoading && (
              <div className="flex justify-start mb-6 animate-fade-in">
                <div className="bg-chat-ai-bubble border border-white/10 rounded-2xl px-6 py-4 max-w-[80%] md:max-w-[70%] shadow-soft backdrop-blur-sm">
                  <div className="flex items-center space-x-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-primary-glow/60 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                      <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                    </div>
                    <span className="text-xs text-muted-foreground/80 font-medium">GiuliGPT denkt nach...</span>
                  </div>
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
