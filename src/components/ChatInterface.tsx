import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import ChatMessage from "./ChatMessage";
import { useToast } from "@/hooks/use-toast";

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
      text: "Hallo! Ich bin ChatGPT, wie kann ich dir helfen?",
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
    setInputValue("");
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: generateResponse(inputValue),
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1000 + Math.random() * 1000);
  };

  const generateResponse = (input: string): string => {
    const responses = [
      "Das ist eine interessante Frage! Als KI-Assistent kann ich dir dabei helfen, das zu verstehen.",
      "Gerne erkläre ich dir das genauer. Lass mich das für dich aufschlüsseln.",
      "Das ist ein wichtiges Thema. Hier sind einige Gedanken dazu:",
      "Ich verstehe deine Frage. Lass mich dir eine hilfreiche Antwort geben.",
      "Das kann ich gerne für dich beantworten. Hier ist was ich dazu weiß:",
    ];

    if (input.toLowerCase().includes("hallo") || input.toLowerCase().includes("hi")) {
      return "Hallo! Schön, dich kennenzulernen. Womit kann ich dir heute helfen?";
    }

    if (input.toLowerCase().includes("wie geht") || input.toLowerCase().includes("wie geht's")) {
      return "Danke der Nachfrage! Als KI habe ich keine Gefühle, aber ich bin bereit und freue mich darauf, dir zu helfen. Was beschäftigt dich heute?";
    }

    if (input.toLowerCase().includes("danke")) {
      return "Gern geschehen! Ich bin immer da, um zu helfen. Gibt es noch etwas anderes, womit ich dir behilflich sein kann?";
    }

    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-chat-background">
      {/* Header */}
      <div className="bg-card border-b px-6 py-4 shadow-sm">
        <h1 className="text-xl font-semibold text-chat-header">ChatGPT</h1>
        <p className="text-sm text-muted-foreground">Dein KI-Assistent</p>
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

      {/* Input */}
      <div className="border-t bg-card px-6 py-4 shadow-sm">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Stelle eine Frage..."
                className="min-h-[44px] bg-chat-input-bg resize-none border-border"
                disabled={isLoading}
              />
            </div>
            <Button
              onClick={handleSend}
              disabled={!inputValue.trim() || isLoading}
              size="icon"
              className="h-[44px] w-[44px] bg-primary hover:bg-primary/90"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            ChatGPT kann Fehler machen. Überprüfe wichtige Informationen.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;