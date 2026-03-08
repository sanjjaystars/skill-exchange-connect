import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, ArrowRightLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Tables } from "@/integrations/supabase/types";

type Message = Tables<"messages">;
type Profile = Tables<"profiles">;

const Chat = () => {
  const { userId } = useParams();
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Profile[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(userId ?? null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [showSidebar, setShowSidebar] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch contacts (people we've messaged or connected with)
  useEffect(() => {
    if (!user) return;

    const fetchContacts = async () => {
      // Get unique user IDs from messages
      const { data: sentMessages } = await supabase
        .from("messages")
        .select("receiver_id")
        .eq("sender_id", user.id);
      const { data: receivedMessages } = await supabase
        .from("messages")
        .select("sender_id")
        .eq("receiver_id", user.id);

      // Get connected users
      const { data: connections } = await supabase
        .from("connections")
        .select("requester_id, receiver_id")
        .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`);

      const userIds = new Set<string>();
      sentMessages?.forEach((m) => userIds.add(m.receiver_id));
      receivedMessages?.forEach((m) => userIds.add(m.sender_id));
      connections?.forEach((c) => {
        if (c.requester_id !== user.id) userIds.add(c.requester_id);
        if (c.receiver_id !== user.id) userIds.add(c.receiver_id);
      });

      // If we have a userId param, add it
      if (userId) userIds.add(userId);

      if (userIds.size === 0) return;

      const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .in("user_id", Array.from(userIds));

      if (profiles) setContacts(profiles);
    };

    fetchContacts();
  }, [user, userId]);

  // Fetch messages for selected conversation
  useEffect(() => {
    if (!user || !selectedUserId) return;

    const fetchMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .or(
          `and(sender_id.eq.${user.id},receiver_id.eq.${selectedUserId}),and(sender_id.eq.${selectedUserId},receiver_id.eq.${user.id})`
        )
        .order("created_at", { ascending: true });

      if (data) setMessages(data);
    };

    fetchMessages();

    // Subscribe to real-time messages
    const channel = supabase
      .channel(`messages-${selectedUserId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const msg = payload.new as Message;
          // Only add if it's part of this conversation
          if (
            (msg.sender_id === user.id && msg.receiver_id === selectedUserId) ||
            (msg.sender_id === selectedUserId && msg.receiver_id === user.id)
          ) {
            setMessages((prev) => [...prev, msg]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, selectedUserId]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !user || !selectedUserId) return;

    const { error } = await supabase.from("messages").insert({
      sender_id: user.id,
      receiver_id: selectedUserId,
      text: newMessage.trim(),
    });

    if (!error) {
      setNewMessage("");
    }
  };

  const formatTime = (dateStr: string) =>
    new Date(dateStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const selectedContact = contacts.find((c) => c.user_id === selectedUserId);

  return (
    <div className="h-screen bg-background flex flex-col">
      <Navbar />

      <div className="flex flex-1 pt-16 overflow-hidden">
        {/* Contacts sidebar */}
        <div
          className={cn(
            "w-80 border-r border-border/50 bg-card/30 flex-shrink-0 flex flex-col",
            "max-md:absolute max-md:inset-y-16 max-md:left-0 max-md:z-40 max-md:w-72",
            !showSidebar && "max-md:hidden"
          )}
        >
          <div className="p-4 border-b border-border/50">
            <h2 className="font-display font-semibold text-sm text-muted-foreground mb-3">Conversations</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {contacts.length === 0 && (
              <div className="p-4 text-sm text-muted-foreground text-center">
                No conversations yet. Connect with someone from the Dashboard!
              </div>
            )}
            {contacts.map((contact) => (
              <button
                key={contact.user_id}
                onClick={() => {
                  setSelectedUserId(contact.user_id);
                  setShowSidebar(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 p-3 transition-all duration-150 text-left",
                  selectedUserId === contact.user_id
                    ? "bg-primary/10 border-r-2 border-primary"
                    : "hover:bg-secondary/50"
                )}
              >
                <div className="relative shrink-0">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/40 to-accent/40 flex items-center justify-center text-sm font-display font-bold">
                    {contact.name[0]}
                  </div>
                  {contact.online && (
                    <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-success border-2 border-card" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{contact.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {(contact.teaches ?? []).slice(0, 2).join(", ")}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col min-w-0">
          {selectedContact ? (
            <>
              <div className="h-14 border-b border-border/50 flex items-center justify-between px-4 bg-card/20">
                <div className="flex items-center gap-3">
                  <button onClick={() => setShowSidebar(!showSidebar)} className="md:hidden text-muted-foreground">
                    <ArrowRightLeft className="h-4 w-4" />
                  </button>
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/40 to-accent/40 flex items-center justify-center text-xs font-display font-bold">
                    {selectedContact.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{selectedContact.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {selectedContact.online ? "Online" : "Offline"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg, i) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.02, 0.5) }}
                    className={cn("flex", msg.sender_id === user?.id ? "justify-end" : "justify-start")}
                  >
                    <div
                      className={cn(
                        "max-w-[70%] rounded-2xl px-4 py-2.5 text-sm",
                        msg.sender_id === user?.id
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-secondary text-secondary-foreground rounded-bl-md"
                      )}
                    >
                      <p>{msg.text}</p>
                      <p className={cn("text-[10px] mt-1", msg.sender_id === user?.id ? "text-primary-foreground/60" : "text-muted-foreground")}>
                        {formatTime(msg.created_at)}
                      </p>
                    </div>
                  </motion.div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 border-t border-border/50 bg-card/20">
                <form
                  onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                  className="flex gap-2"
                >
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="bg-secondary border-border focus:border-primary/50"
                  />
                  <Button type="submit" size="icon" className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0">
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-muted-foreground">Select a conversation to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
