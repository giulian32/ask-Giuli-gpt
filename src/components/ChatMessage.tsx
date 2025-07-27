import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: string;
  isUser: boolean;
  timestamp: Date;
}

const ChatMessage = ({ message, isUser, timestamp }: ChatMessageProps) => {
  return (
    <div className={cn("flex w-full mb-6 animate-fade-in", isUser ? "justify-end" : "justify-start")}>
      <div className="flex flex-col max-w-[85%] md:max-w-[75%]">
        <div
          className={cn(
            "rounded-2xl px-5 py-4 shadow-soft transition-all duration-500 hover:shadow-premium hover:scale-[1.02] backdrop-blur-sm relative overflow-hidden group",
            isUser
              ? "text-white border border-white/20 shadow-glow ml-auto"
              : "text-foreground border border-white/10"
          )}
          style={isUser ? { background: 'var(--gradient-primary)' } : { background: 'var(--chat-ai-bubble)' }}
        >
          {/* Subtle shimmer effect on hover */}
          <div className={cn(
            "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500",
            isUser 
              ? "bg-gradient-to-r from-transparent via-white/10 to-transparent"
              : "bg-gradient-to-r from-transparent via-primary/5 to-transparent"
          )}></div>
          
          <div className="relative z-10">
            <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium tracking-wide">{message}</p>
          </div>
        </div>
        <span
          className={cn(
            "text-xs mt-3 opacity-60 font-medium tracking-wider",
            isUser ? "text-white/70 text-right" : "text-muted-foreground/80 text-left"
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