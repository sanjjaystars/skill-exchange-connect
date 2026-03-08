import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import type { Tables } from "@/integrations/supabase/types";

type Message = Tables<"messages">;
type Profile = Tables<"profiles">;

const ChatContactItem = ({
  contact,
  isSelected,
  onSelect,
}: {
  contact: Profile;
  isSelected: boolean;
  onSelect: () => void;
}) => (
  <button
    onClick={onSelect}
    className={cn(
      "w-full flex items-center gap-3 p-3 transition-all duration-150 text-left",
      isSelected
        ? "bg-primary/10 border-l-2 border-primary"
        : "hover:bg-secondary/50 border-l-2 border-transparent"
    )}
  >
    <div className="relative shrink-0">
      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/40 to-accent/40 flex items-center justify-center text-sm font-display font-bold">
        {contact.name?.[0] ?? "?"}
      </div>
      {contact.online && (
        <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-success border-2 border-card" />
      )}
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-sm font-medium truncate">{contact.name}</p>
      <p className="text-xs text-muted-foreground truncate">
        {(contact.teaches ?? []).slice(0, 2).join(", ") || "No skills listed"}
      </p>
    </div>
  </button>
);

const ChatMessage = ({
  msg,
  isOwn,
}: {
  msg: Message;
  isOwn: boolean;
}) => (
  <div className={cn("flex", isOwn ? "justify-end" : "justify-start")}>
    <div
      className={cn(
        "max-w-[80%] sm:max-w-[70%] rounded-2xl px-3.5 py-2 text-sm",
        isOwn
          ? "bg-primary text-primary-foreground rounded-br-md"
          : "bg-secondary text-secondary-foreground rounded-bl-md"
      )}
    >
      <p className="break-words">{msg.text}</p>
      <p
        className={cn(
          "text-[10px] mt-0.5",
          isOwn ? "text-primary-foreground/60" : "text-muted-foreground"
        )}
      >
        {new Date(msg.created_at).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </p>
    </div>
  </div>
);

const Chat = () => {
  const { userId } = useParams();
  const { user } = useAuth();
  const { clearUnread } = useNotifications();
  const [contacts, setContacts] = useState<Profile[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(
    userId ?? null
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [showSidebar, setShowSidebar] = useState(!userId);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Clear notifications when viewing chat
  useEffect(() => {
    if (selectedUserId) clearUnread(selectedUserId);
  }, [selectedUserId, clearUnread]);

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

      const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .in("user_id", Array.from(userIds));
      if (profiles) setContacts(profiles);
    } catch (err) {
      console.error("Failed to fetch contacts:", err);
    }
  }, [user, userId]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  useEffect(() => {
    if (!user || !selectedUserId) return;
    let isMounted = true;

    const fetchMessages = async () => {
      try {
        const { data } = await supabase
          .from("messages")
          .select("*")
          .or(
            `and(sender_id.eq.${user.id},receiver_id.eq.${selectedUserId}),and(sender_id.eq.${selectedUserId},receiver_id.eq.${user.id})`
          )
          .order("created_at", { ascending: true });
        if (data && isMounted) setMessages(data);
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      }
    };

    fetchMessages();

    const channel = supabase
      .channel(`messages-${selectedUserId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const msg = payload.new as Message;
          if (
            (msg.sender_id === user.id && msg.receiver_id === selectedUserId) ||
            (msg.sender_id === selectedUserId && msg.receiver_id === user.id)
          ) {
            setMessages((prev) => {
              if (prev.some((m) => m.id === msg.id)) return prev;
              return [...prev, msg];
            });
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [user, selectedUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !user || !selectedUserId || sending) return;
    setSending(true);
    try {
      const { error } = await supabase.from("messages").insert({
        sender_id: user.id,
        receiver_id: selectedUserId,
        text: newMessage.trim(),
      });
      if (!error) setNewMessage("");
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setSending(false);
    }
  };

  const selectedContact = contacts.find((c) => c.user_id === selectedUserId);

  return (
    <div className="h-screen bg-background flex flex-col">
      <Navbar />

      <div className="flex flex-1 pt-14 overflow-hidden">
        {/* Contacts sidebar — full screen on mobile when no chat selected */}
        <div
          className={cn(
            "w-full sm:w-72 md:w-80 border-r border-border/50 bg-card/30 flex-shrink-0 flex flex-col",
            // On mobile: show sidebar when showSidebar is true, hide when chat is selected
            selectedUserId && !showSidebar ? "hidden sm:flex" : "flex"
          )}
        >
          <div className="p-4 border-b border-border/50">
            <h2 className="font-display font-semibold text-sm text-muted-foreground">
              Conversations
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {contacts.length === 0 && (
              <div className="p-4 text-sm text-muted-foreground text-center">
                No conversations yet. Connect with someone from the Dashboard!
              </div>
            )}
            {contacts.map((contact) => (
              <ChatContactItem
                key={contact.user_id}
                contact={contact}
                isSelected={selectedUserId === contact.user_id}
                onSelect={() => {
                  setSelectedUserId(contact.user_id);
                  setShowSidebar(false);
                }}
              />
            ))}
          </div>
        </div>

        {/* Chat area — hidden on mobile when sidebar is showing */}
        <div
          className={cn(
            "flex-1 flex flex-col min-w-0",
            showSidebar && !selectedUserId ? "hidden sm:flex" : "flex",
            selectedUserId && showSidebar ? "hidden sm:flex" : ""
          )}
        >
          {selectedContact ? (
            <>
              <div className="h-14 border-b border-border/50 flex items-center gap-3 px-4 bg-card/20">
                <button
                  onClick={() => setShowSidebar(true)}
                  className="sm:hidden text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/40 to-accent/40 flex items-center justify-center text-xs font-display font-bold">
                  {selectedContact.name?.[0] ?? "?"}
                </div>
                <div>
                  <p className="text-sm font-medium">{selectedContact.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedContact.online ? "Online" : "Offline"}
                  </p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {messages.map((msg) => (
                  <ChatMessage
                    key={msg.id}
                    msg={msg}
                    isOwn={msg.sender_id === user?.id}
                  />
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-3 sm:p-4 border-t border-border/50 bg-card/20">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend();
                  }}
                  className="flex gap-2"
                >
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="bg-secondary border-border focus:border-primary/50 h-10"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={sending || !newMessage.trim()}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0 h-10 w-10"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-4">
              <p className="text-muted-foreground text-center">
                Select a conversation to start chatting
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
