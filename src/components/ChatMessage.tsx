import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: string;
  isUser: boolean;
  timestamp: Date;
}

const ChatMessage = ({ message, isUser, timestamp }: ChatMessageProps) => {
  return (
    <div className={cn("flex w-full mb-6", isUser ? "justify-end" : "justify-start")}>
      <div className="flex flex-col max-w-[80%] md:max-w-[70%]">
        <div
          className={cn(
            "rounded-2xl px-5 py-4 shadow-sm transition-all duration-300 hover:shadow-md",
            isUser
              ? "text-chat-user-text ml-auto shadow-elegant"
              : "bg-chat-ai-bubble text-chat-ai-text border border-border/50 backdrop-blur-sm"
          )}
          style={isUser ? { background: 'var(--gradient-primary)' } : {}}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message}</p>
        </div>
        <span
          className={cn(
            "text-xs text-muted-foreground/70 mt-2",
            isUser ? "text-right" : "text-left"
          )}
        >
          {timestamp.toLocaleTimeString("de-DE", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </div>
  );
};

export default ChatMessage;