import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface NotificationContextType {
  unreadCount: number;
  clearUnread: (userId?: string) => void;
}

const NotificationContext = createContext<NotificationContextType>({
  unreadCount: 0,
  clearUnread: () => {},
});

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [readMessageIds, setReadMessageIds] = useState<Set<string>>(new Set());

  const fetchUnread = useCallback(async () => {
    if (!user) return;
    try {
      const { count } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("receiver_id", user.id)
        .not("id", "in", `(${Array.from(readMessageIds).join(",") || "00000000-0000-0000-0000-000000000000"})`);
      setUnreadCount(count ?? 0);
    } catch {}
  }, [user, readMessageIds]);

  useEffect(() => {
    if (!user) return;
    fetchUnread();

    const channel = supabase
      .channel("notification-messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const msg = payload.new as any;
          if (msg.receiver_id === user.id && !readMessageIds.has(msg.id)) {
            setUnreadCount((prev) => prev + 1);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchUnread, readMessageIds]);

  const clearUnread = useCallback((userId?: string) => {
    if (!user) return;
    // Mark all current messages as read
    setUnreadCount(0);
    // We just reset the count — simple approach
  }, [user]);

  return (
    <NotificationContext.Provider value={{ unreadCount, clearUnread }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
