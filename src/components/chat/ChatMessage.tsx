import { useState } from "react";
import { cn } from "@/lib/utils";
import { Check, CheckCheck, FileText, Image as ImageIcon, Code2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface MessageData {
  id: string;
  sender_id: string;
  receiver_id: string;
  text: string;
  message_type: string;
  file_url: string | null;
  file_name: string | null;
  read_at: string | null;
  created_at: string;
}

interface Reaction {
  emoji: string;
  count: number;
  reacted_by_me: boolean;
}

interface ChatMessageProps {
  msg: MessageData;
  isOwn: boolean;
  reactions: Reaction[];
  onReact: (emoji: string) => void;
}

const QUICK_EMOJIS = ["👍", "❤️", "🔥", "🚀", "😂", "👏"];

const ChatMessage = ({ msg, isOwn, reactions, onReact }: ChatMessageProps) => {
  const [showReactions, setShowReactions] = useState(false);

  const renderContent = () => {
    if (msg.message_type === "code") {
      return (
        <div className="bg-background/50 rounded-lg p-3 font-mono text-xs overflow-x-auto border border-border/50">
          <div className="flex items-center gap-1.5 text-muted-foreground mb-2 text-[10px]">
            <Code2 className="h-3 w-3" /> Code
          </div>
          <pre className="whitespace-pre-wrap break-words">{msg.text}</pre>
        </div>
      );
    }

    if (msg.message_type === "file" && msg.file_url) {
      const isImage = msg.file_name?.match(/\.(jpg|jpeg|png|gif|webp)$/i);
      if (isImage) {
        return (
          <div>
            <img
              src={msg.file_url}
              alt={msg.file_name || "Image"}
              className="max-w-full max-h-64 rounded-lg object-cover cursor-pointer"
              loading="lazy"
              onClick={() => window.open(msg.file_url!, "_blank")}
            />
            {msg.text && <p className="break-words mt-1.5">{msg.text}</p>}
          </div>
        );
      }
      return (
        <a
          href={msg.file_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-background/30 rounded-lg px-3 py-2 hover:bg-background/50 transition-colors"
        >
          <FileText className="h-5 w-5 shrink-0 text-primary" />
          <div className="min-w-0">
            <p className="text-xs font-medium truncate">{msg.file_name || "File"}</p>
            <p className="text-[10px] text-muted-foreground">Click to open</p>
          </div>
        </a>
      );
    }

    return <p className="break-words whitespace-pre-wrap">{msg.text}</p>;
  };

  return (
    <div
      className={cn("flex group", isOwn ? "justify-end" : "justify-start")}
      onMouseEnter={() => setShowReactions(true)}
      onMouseLeave={() => setShowReactions(false)}
    >
      <div className="relative max-w-[80%] sm:max-w-[70%]">
        <div
          className={cn(
            "rounded-2xl px-3.5 py-2 text-sm",
            isOwn
              ? "bg-primary text-primary-foreground rounded-br-md"
              : "bg-secondary text-secondary-foreground rounded-bl-md"
          )}
        >
          {renderContent()}
          <div className={cn("flex items-center gap-1 mt-0.5", isOwn ? "justify-end" : "")}>
            <span className={cn("text-[10px]", isOwn ? "text-primary-foreground/60" : "text-muted-foreground")}>
              {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
            {isOwn && (
              msg.read_at
                ? <CheckCheck className="h-3 w-3 text-primary-foreground/80" />
                : <Check className="h-3 w-3 text-primary-foreground/40" />
            )}
          </div>
        </div>

        {/* Reactions display */}
        {reactions.length > 0 && (
          <div className={cn("flex gap-0.5 mt-0.5", isOwn ? "justify-end" : "justify-start")}>
            {reactions.map((r) => (
              <button
                key={r.emoji}
                onClick={() => onReact(r.emoji)}
                className={cn(
                  "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] border transition-colors",
                  r.reacted_by_me
                    ? "bg-primary/10 border-primary/30"
                    : "bg-secondary border-border hover:bg-secondary/80"
                )}
              >
                {r.emoji} {r.count > 1 && r.count}
              </button>
            ))}
          </div>
        )}

        {/* Quick reactions popup */}
        {showReactions && (
          <div className={cn(
            "absolute -top-8 flex gap-0.5 bg-card border border-border rounded-full px-1.5 py-1 shadow-lg z-10",
            isOwn ? "right-0" : "left-0"
          )}>
            {QUICK_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => onReact(emoji)}
                className="h-6 w-6 flex items-center justify-center rounded-full hover:bg-secondary text-sm transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
