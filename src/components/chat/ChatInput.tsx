import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Paperclip, Code2, Smile, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";

const EMOJI_LIST = ["😀", "😂", "😍", "🤔", "👍", "👏", "🔥", "🚀", "❤️", "💯", "🎉", "✨", "😊", "🙏", "💪", "🤝"];

interface ChatInputProps {
  selectedUserId: string;
  onMessageSent: () => void;
}

const ChatInput = ({ selectedUserId, onMessageSent }: ChatInputProps) => {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [codeMode, setCodeMode] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pendingFile, setPendingFile] = useState<{ url: string; name: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const sendMessage = async (text: string, type: string = "text", fileUrl?: string, fileName?: string) => {
    if (!user || !text.trim() && !fileUrl) return;
    setSending(true);
    try {
      const { error } = await supabase.from("messages").insert({
        sender_id: user.id,
        receiver_id: selectedUserId,
        text: text.trim() || (fileName || "File"),
        message_type: type,
        file_url: fileUrl || null,
        file_name: fileName || null,
      } as any);
      if (error) throw error;
      setMessage("");
      setCodeMode(false);
      setPendingFile(null);
      onMessageSent();
    } catch (err) {
      console.error("Send failed:", err);
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File must be under 10MB");
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("chat-files").upload(path, file);
      if (error) throw error;
      const { data: urlData } = supabase.storage.from("chat-files").getPublicUrl(path);
      await sendMessage(message.trim() || file.name, "file", urlData.publicUrl, file.name);
    } catch (err) {
      console.error("Upload failed:", err);
      toast.error("Failed to upload file");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleSend = () => {
    if (codeMode) {
      sendMessage(message, "code");
    } else {
      sendMessage(message);
    }
  };

  const insertEmoji = (emoji: string) => {
    setMessage((prev) => prev + emoji);
  };

  return (
    <div className="p-3 sm:p-4 border-t border-border/50 bg-card/20">
      {codeMode && (
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-[10px] text-primary font-mono flex items-center gap-1">
            <Code2 className="h-3 w-3" /> Code mode
          </span>
          <button onClick={() => setCodeMode(false)} className="text-muted-foreground hover:text-foreground">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
      <form
        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
        className="flex gap-2 items-end"
      >
        <input ref={fileRef} type="file" className="hidden" onChange={handleFileUpload} accept="image/*,.pdf,.doc,.docx,.txt,.js,.py,.ts,.tsx,.css,.html,.json,.csv" />

        <div className="flex gap-1 shrink-0">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-10 w-10 text-muted-foreground hover:text-foreground"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={`h-10 w-10 ${codeMode ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
            onClick={() => setCodeMode(!codeMode)}
          >
            <Code2 className="h-4 w-4" />
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button type="button" variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-foreground">
                <Smile className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2" side="top" align="start">
              <div className="grid grid-cols-8 gap-1">
                {EMOJI_LIST.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => insertEmoji(emoji)}
                    className="h-8 w-8 flex items-center justify-center rounded hover:bg-secondary text-lg"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex-1">
          {codeMode ? (
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Paste or type code..."
              className="bg-secondary border-border font-mono text-xs min-h-[60px] resize-none"
            />
          ) : (
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={uploading ? "Uploading..." : "Type a message..."}
              className="bg-secondary border-border focus:border-primary/50 h-10"
              disabled={uploading}
            />
          )}
        </div>

        <Button
          type="submit"
          size="icon"
          disabled={sending || uploading || !message.trim()}
          className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0 h-10 w-10"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
};

export default ChatInput;
