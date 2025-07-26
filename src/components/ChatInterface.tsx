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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

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
    <div className="flex flex-col h-screen" style={{ background: 'var(--chat-background)' }}>
      {/* Header with beautiful gradient */}
      <div 
        className="px-6 py-4 shadow-elegant border-b border-border/50 backdrop-blur-sm"
        style={{ background: 'var(--chat-header)' }}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center shadow-glow">
            <span className="text-sm font-bold text-white">🤖</span>
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">GiuliGPT</h1>
            <p className="text-sm text-muted-foreground">Dein KI-Assistent • Powered by DeepSeek</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="max-w-4xl mx-auto">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message.text}
              isUser={message.isUser}
              timestamp={message.timestamp}
            />
          ))}
          {isLoading && (
            <div className="flex justify-start mb-4">
              <div className="bg-chat-ai-bubble border rounded-2xl px-4 py-3 max-w-[80%] md:max-w-[70%]">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input with beautiful styling */}
      <div className="border-t border-border/50 backdrop-blur-sm px-6 py-4" style={{ background: 'var(--chat-header)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Stelle eine Frage..."
                className="min-h-[50px] bg-chat-input-bg resize-none border-border/50 rounded-xl shadow-sm transition-all duration-300 focus:shadow-elegant focus:border-primary/50"
                disabled={isLoading}
              />
            </div>
            <Button
              onClick={handleSend}
              disabled={!inputValue.trim() || isLoading}
              size="icon"
              className="h-[50px] w-[50px] rounded-xl shadow-elegant transition-all duration-300 hover:shadow-glow"
              style={{ background: 'var(--gradient-primary)' }}
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-3 text-center opacity-70">
            GiuliGPT kann Fehler machen. Überprüfe wichtige Informationen.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
