import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: string;
  isUser: boolean;
  timestamp: Date;
}

const ChatMessage = ({ message, isUser, timestamp }: ChatMessageProps) => {
  return (
    <div className={cn("flex w-full mb-4", isUser ? "justify-end" : "justify-start")}>
      <div className="flex flex-col max-w-[80%] md:max-w-[70%]">
        <div
          className={cn(
            "rounded-2xl px-4 py-3 shadow-sm",
            isUser
              ? "bg-chat-user-bubble text-chat-user-text ml-auto"
              : "bg-chat-ai-bubble text-chat-ai-text border"
          )}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message}</p>
        </div>
        <span
          className={cn(
            "text-xs text-muted-foreground mt-1",
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