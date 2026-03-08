import { useState, useRef, useEffect, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X, Send, MessageSquare, Trash2, Plus, History, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Conversation {
  id: string;
  title: string;
  created_at: string;
}

const QUICK_ACTIONS = [
  { label: "Explain Concept", prompt: "Explain the concept of " },
  { label: "Debug Code", prompt: "Help me debug this code:\n```\n\n```" },
  { label: "Suggest Project", prompt: "Suggest a beginner project for " },
  { label: "Learning Roadmap", prompt: "Give me a learning roadmap for " },
];

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/skillbot-chat`;

const SkillBotMessage = memo(({ msg }: { msg: Message }) => (
  <div className={cn("flex gap-2.5", msg.role === "user" ? "justify-end" : "justify-start")}>
    {msg.role === "assistant" && (
      <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
        <Bot className="h-4 w-4 text-primary" />
      </div>
    )}
    <div
      className={cn(
        "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm",
        msg.role === "user"
          ? "bg-primary text-primary-foreground rounded-br-md"
          : "bg-secondary text-secondary-foreground rounded-bl-md"
      )}
    >
      {msg.role === "assistant" ? (
        <div className="prose prose-sm prose-invert max-w-none [&_pre]:bg-background/50 [&_pre]:rounded-lg [&_pre]:p-3 [&_pre]:text-xs [&_pre]:overflow-x-auto [&_code]:text-primary [&_code]:text-xs [&_p]:mb-2 [&_p:last-child]:mb-0 [&_ul]:mb-2 [&_ol]:mb-2 [&_li]:mb-0.5">
          <ReactMarkdown>{msg.content}</ReactMarkdown>
        </div>
      ) : (
        <p className="whitespace-pre-wrap break-words">{msg.content}</p>
      )}
    </div>
  </div>
));
SkillBotMessage.displayName = "SkillBotMessage";

const SkillBot = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"chat" | "history">("chat");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const loadConversations = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("ai_chat_conversations")
      .select("id, title, created_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(20);
    if (data) setConversations(data);
  }, [user]);

  useEffect(() => {
    if (open && user) loadConversations();
  }, [open, user, loadConversations]);

  const loadConversation = async (convId: string) => {
    const { data } = await supabase
      .from("ai_chat_messages")
      .select("role, content")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true });
    if (data) {
      setMessages(data as Message[]);
      setConversationId(convId);
      setView("chat");
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setConversationId(null);
    setView("chat");
  };

  const saveMessages = async (convId: string, newMsgs: { role: string; content: string }[]) => {
    for (const msg of newMsgs) {
      await supabase.from("ai_chat_messages").insert({
        conversation_id: convId,
        role: msg.role,
        content: msg.content,
      } as any);
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading || !user) return;
    const userMsg: Message = { role: "user", content: text.trim() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    let currentConvId = conversationId;

    // Create conversation if needed
    if (!currentConvId) {
      const title = text.trim().slice(0, 60) || "New Chat";
      const { data } = await supabase
        .from("ai_chat_conversations")
        .insert({ user_id: user.id, title } as any)
        .select("id")
        .single();
      if (data) {
        currentConvId = data.id;
        setConversationId(data.id);
      }
    } else {
      await supabase
        .from("ai_chat_conversations")
        .update({ updated_at: new Date().toISOString() } as any)
        .eq("id", currentConvId);
    }

    // Save user message
    if (currentConvId) {
      await saveMessages(currentConvId, [userMsg]);
    }

    // Stream AI response
    let assistantContent = "";
    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Request failed" }));
        throw new Error(err.error || `Error ${resp.status}`);
      }

      const reader = resp.body!.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantContent } : m));
                }
                return [...prev, { role: "assistant", content: assistantContent }];
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Save assistant message
      if (currentConvId && assistantContent) {
        await saveMessages(currentConvId, [{ role: "assistant", content: assistantContent }]);
        loadConversations();
      }
    } catch (err: any) {
      console.error("SkillBot error:", err);
      toast.error(err.message || "Failed to get response");
      // Remove empty assistant message on error
      setMessages((prev) => (prev[prev.length - 1]?.role === "assistant" && !prev[prev.length - 1].content ? prev.slice(0, -1) : prev));
    } finally {
      setIsLoading(false);
    }
  };

  const deleteConversation = async (convId: string) => {
    await supabase.from("ai_chat_conversations").delete().eq("id", convId);
    if (conversationId === convId) startNewChat();
    loadConversations();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  if (!user) return null;

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-5 right-5 z-50 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 flex items-center justify-center hover:bg-primary/90 transition-colors"
          >
            <Bot className="h-6 w-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-5 right-5 z-50 w-[380px] max-w-[calc(100vw-2.5rem)] h-[560px] max-h-[calc(100vh-6rem)] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-card">
              <div className="flex items-center gap-2.5">
                {view === "history" && (
                  <button onClick={() => setView("chat")} className="text-muted-foreground hover:text-foreground transition-colors">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                )}
                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <Bot className="h-4.5 w-4.5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">SkillBot</h3>
                  <p className="text-[10px] text-muted-foreground">AI Mentor Assistant</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => setView(view === "history" ? "chat" : "history")}>
                  <History className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={startNewChat}>
                  <Plus className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => setOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {view === "history" ? (
              /* History view */
              <ScrollArea className="flex-1 p-3">
                {conversations.length === 0 ? (
                  <div className="text-center text-muted-foreground text-sm py-12">No conversations yet</div>
                ) : (
                  <div className="space-y-1">
                    {conversations.map((c) => (
                      <div
                        key={c.id}
                        className={cn(
                          "flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-colors group",
                          c.id === conversationId ? "bg-primary/10 text-primary" : "hover:bg-secondary text-foreground"
                        )}
                        onClick={() => loadConversation(c.id)}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{c.title}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {new Date(c.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteConversation(c.id); }}
                          className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            ) : (
              /* Chat view */
              <>
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center px-4">
                      <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                        <Bot className="h-7 w-7 text-primary" />
                      </div>
                      <h4 className="text-sm font-semibold text-foreground mb-1">Hey! I'm SkillBot 👋</h4>
                      <p className="text-xs text-muted-foreground mb-4">
                        Your AI mentor. Ask me anything about coding, learning paths, or debugging.
                      </p>
                      <div className="grid grid-cols-2 gap-1.5 w-full">
                        {QUICK_ACTIONS.map((action) => (
                          <button
                            key={action.label}
                            onClick={() => setInput(action.prompt)}
                            className="text-xs px-3 py-2 rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors text-left"
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <>
                      {messages.map((msg, i) => (
                        <SkillBotMessage key={i} msg={msg} />
                      ))}
                      {isLoading && messages[messages.length - 1]?.role === "user" && (
                        <div className="flex gap-2.5">
                          <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                            <Bot className="h-4 w-4 text-primary" />
                          </div>
                          <div className="bg-secondary rounded-2xl rounded-bl-md px-3.5 py-2.5">
                            <div className="flex gap-1">
                              <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:0ms]" />
                              <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:150ms]" />
                              <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:300ms]" />
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Input */}
                <div className="p-3 border-t border-border/50">
                  <form
                    onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
                    className="flex gap-2 items-end"
                  >
                    <Textarea
                      ref={textareaRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Ask SkillBot anything..."
                      className="bg-secondary border-border text-sm min-h-[40px] max-h-[120px] resize-none py-2.5"
                      rows={1}
                    />
                    <Button
                      type="submit"
                      size="icon"
                      disabled={!input.trim() || isLoading}
                      className="h-10 w-10 shrink-0 bg-primary text-primary-foreground"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SkillBot;
