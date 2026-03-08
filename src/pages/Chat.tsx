import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import ChatContactItem from "@/components/chat/ChatContactItem";
import ChatMessage from "@/components/chat/ChatMessage";
import ChatInput from "@/components/chat/ChatInput";
import { ArrowLeft, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import type { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;

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

const Chat = () => {
  const { userId } = useParams();
  const { user } = useAuth();
  const { clearUnread } = useNotifications();
  const [contacts, setContacts] = useState<Profile[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(userId ?? null);
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [reactions, setReactions] = useState<Record<string, Reaction[]>>({});
  const [showSidebar, setShowSidebar] = useState(!userId);
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedUserId) clearUnread(selectedUserId);
  }, [selectedUserId, clearUnread]);

  // Fetch contacts
  const fetchContacts = useCallback(async () => {
    if (!user) return;
    try {
      const [sentRes, receivedRes, connectionsRes] = await Promise.all([
        supabase.from("messages").select("receiver_id").eq("sender_id", user.id),
        supabase.from("messages").select("sender_id").eq("receiver_id", user.id),
        supabase.from("connections").select("requester_id, receiver_id").or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`),
      ]);

      const userIds = new Set<string>();
      sentRes.data?.forEach((m) => userIds.add(m.receiver_id));
      receivedRes.data?.forEach((m) => userIds.add(m.sender_id));
      connectionsRes.data?.forEach((c) => {
        if (c.requester_id !== user.id) userIds.add(c.requester_id);
        if (c.receiver_id !== user.id) userIds.add(c.receiver_id);
      });
      if (userId) userIds.add(userId);
      if (userIds.size === 0) return;

      const { data: profiles } = await supabase.from("profiles").select("*").in("user_id", Array.from(userIds));
      if (profiles) setContacts(profiles);
    } catch (err) {
      console.error("Failed to fetch contacts:", err);
    }
  }, [user, userId]);

  useEffect(() => { fetchContacts(); }, [fetchContacts]);

  // Fetch messages + reactions
  const fetchMessages = useCallback(async () => {
    if (!user || !selectedUserId) return;
    try {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${selectedUserId}),and(sender_id.eq.${selectedUserId},receiver_id.eq.${user.id})`)
        .order("created_at", { ascending: true });

      const msgs = (data ?? []).map((m: any) => ({
        id: m.id,
        sender_id: m.sender_id,
        receiver_id: m.receiver_id,
        text: m.text,
        message_type: m.message_type || "text",
        file_url: m.file_url || null,
        file_name: m.file_name || null,
        read_at: m.read_at || null,
        created_at: m.created_at,
      }));
      setMessages(msgs);

      // Mark unread messages as read
      const unreadIds = msgs.filter((m: MessageData) => m.receiver_id === user.id && !m.read_at).map((m: MessageData) => m.id);
      if (unreadIds.length > 0) {
        await supabase.from("messages").update({ read_at: new Date().toISOString() } as any).in("id", unreadIds);
      }

      // Fetch reactions
      if (msgs.length > 0) {
        const msgIds = msgs.map((m: MessageData) => m.id);
        const { data: reactData } = await supabase.from("message_reactions").select("*").in("message_id", msgIds);
        const grouped: Record<string, Reaction[]> = {};
        (reactData ?? []).forEach((r: any) => {
          if (!grouped[r.message_id]) grouped[r.message_id] = [];
          const existing = grouped[r.message_id].find((e) => e.emoji === r.emoji);
          if (existing) {
            existing.count++;
            if (r.user_id === user.id) existing.reacted_by_me = true;
          } else {
            grouped[r.message_id].push({ emoji: r.emoji, count: 1, reacted_by_me: r.user_id === user.id });
          }
        });
        setReactions(grouped);
      }
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    }
  }, [user, selectedUserId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Real-time subscription
  useEffect(() => {
    if (!user || !selectedUserId) return;

    const channel = supabase
      .channel(`chat-${selectedUserId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        const msg = payload.new as any;
        if (
          (msg.sender_id === user.id && msg.receiver_id === selectedUserId) ||
          (msg.sender_id === selectedUserId && msg.receiver_id === user.id)
        ) {
          setMessages((prev) => {
            if (prev.some((m) => m.id === msg.id)) return prev;
            return [...prev, {
              id: msg.id,
              sender_id: msg.sender_id,
              receiver_id: msg.receiver_id,
              text: msg.text,
              message_type: msg.message_type || "text",
              file_url: msg.file_url || null,
              file_name: msg.file_name || null,
              read_at: msg.read_at || null,
              created_at: msg.created_at,
            }];
          });
          // Auto mark as read if we're the receiver
          if (msg.sender_id === selectedUserId) {
            supabase.from("messages").update({ read_at: new Date().toISOString() } as any).eq("id", msg.id).then();
          }
        }
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "messages" }, (payload) => {
        const updated = payload.new as any;
        setMessages((prev) => prev.map((m) => m.id === updated.id ? { ...m, read_at: updated.read_at } : m));
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "message_reactions" }, () => {
        fetchMessages(); // Refresh reactions
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, selectedUserId, fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleReact = async (messageId: string, emoji: string) => {
    if (!user) return;
    const existing = reactions[messageId]?.find((r) => r.emoji === emoji && r.reacted_by_me);
    try {
      if (existing) {
        await supabase.from("message_reactions").delete().eq("message_id", messageId).eq("user_id", user.id).eq("emoji", emoji);
      } else {
        await supabase.from("message_reactions").insert({ message_id: messageId, user_id: user.id, emoji } as any);
      }
    } catch (err) {
      console.error("Reaction failed:", err);
    }
  };

  const selectedContact = contacts.find((c) => c.user_id === selectedUserId);
  const filteredContacts = contacts.filter((c) =>
    !searchQuery || c.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-screen bg-background flex flex-col">
      <Navbar />

      <div className="flex flex-1 pt-14 overflow-hidden">
        {/* Contacts sidebar */}
        <div
          className={cn(
            "w-full sm:w-72 md:w-80 border-r border-border/50 bg-card/30 flex-shrink-0 flex flex-col",
            selectedUserId && !showSidebar ? "hidden sm:flex" : "flex"
          )}
        >
          <div className="p-3 border-b border-border/50 space-y-2">
            <h2 className="font-display font-semibold text-sm text-muted-foreground">Conversations</h2>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="pl-8 h-8 text-xs bg-secondary border-border"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredContacts.length === 0 && (
              <div className="p-4 text-sm text-muted-foreground text-center">
                {searchQuery ? "No matches" : "No conversations yet. Connect with someone!"}
              </div>
            )}
            {filteredContacts.map((contact) => (
              <ChatContactItem
                key={contact.user_id}
                contact={contact}
                isSelected={selectedUserId === contact.user_id}
                onSelect={() => { setSelectedUserId(contact.user_id); setShowSidebar(false); }}
              />
            ))}
          </div>
        </div>

        {/* Chat area */}
        <div
          className={cn(
            "flex-1 flex flex-col min-w-0",
            showSidebar && !selectedUserId ? "hidden sm:flex" : "flex",
            selectedUserId && showSidebar ? "hidden sm:flex" : ""
          )}
        >
          {selectedContact ? (
            <>
              {/* Chat header */}
              <div className="h-14 border-b border-border/50 flex items-center gap-3 px-4 bg-card/20">
                <button onClick={() => setShowSidebar(true)} className="sm:hidden text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div className="relative">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center text-xs font-display font-bold">
                    {selectedContact.name?.[0] ?? "?"}
                  </div>
                  {selectedContact.online && (
                    <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-card" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">{selectedContact.name}</p>
                  <p className="text-[11px] text-muted-foreground">{selectedContact.online ? "Online" : "Offline"}</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {messages.length === 0 && (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-sm text-muted-foreground">Send a message to start the conversation</p>
                  </div>
                )}
                {messages.map((msg) => (
                  <ChatMessage
                    key={msg.id}
                    msg={msg}
                    isOwn={msg.sender_id === user?.id}
                    reactions={reactions[msg.id] || []}
                    onReact={(emoji) => handleReact(msg.id, emoji)}
                  />
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <ChatInput selectedUserId={selectedUserId!} onMessageSent={() => {}} />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="text-center">
                <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Search className="h-7 w-7 text-primary/50" />
                </div>
                <p className="text-muted-foreground text-sm">Select a conversation to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
