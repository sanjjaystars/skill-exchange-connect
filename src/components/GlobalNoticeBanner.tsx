import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { X, Megaphone, AlertTriangle, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface Notice {
  id: string;
  title: string;
  priority: string;
  category: string;
}

const GlobalNoticeBanner = () => {
  const { user } = useAuth();
  const [notice, setNotice] = useState<Notice | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchLatest = async () => {
      const now = new Date().toISOString();
      // Get latest published non-expired notice
      const { data } = await supabase
        .from("notices")
        .select("id, title, priority, category")
        .eq("status", "published")
        .or(`expires_at.is.null,expires_at.gt.${now}`)
        .order("is_pinned", { ascending: false })
        .order("published_at", { ascending: false })
        .limit(1)
        .single();

      if (!data) return;

      // Check if dismissed
      const { data: dismissal } = await supabase
        .from("notice_dismissals")
        .select("id")
        .eq("notice_id", data.id)
        .eq("user_id", user.id)
        .maybeSingle();

      if (!dismissal) setNotice(data as any);
    };
    fetchLatest();
  }, [user]);

  const handleDismiss = async () => {
    if (!notice || !user) return;
    setDismissed(true);
    await supabase.from("notice_dismissals").insert({
      notice_id: notice.id,
      user_id: user.id,
    } as any);
  };

  const icon = notice?.category.includes("Feature") ? <Sparkles className="h-4 w-4" /> :
    notice?.priority === "critical" ? <AlertTriangle className="h-4 w-4" /> :
    <Megaphone className="h-4 w-4" />;

  const bgClass = notice?.priority === "critical"
    ? "bg-destructive/90 text-destructive-foreground"
    : notice?.priority === "important"
    ? "bg-amber-600/90 text-white"
    : "bg-primary/90 text-primary-foreground";

  return (
    <AnimatePresence>
      {notice && !dismissed && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className={cn("fixed top-14 left-0 right-0 z-40", bgClass)}
        >
          <div className="container mx-auto px-4 py-2 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {icon}
              <span className="text-sm font-medium truncate">{notice.title}</span>
              <Link
                to="/announcements"
                className="text-xs underline underline-offset-2 opacity-80 hover:opacity-100 shrink-0"
              >
                View Details
              </Link>
            </div>
            <button onClick={handleDismiss} className="shrink-0 opacity-70 hover:opacity-100 transition-opacity">
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GlobalNoticeBanner;
