import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Pin, Megaphone, AlertTriangle, Info, Sparkles, Shield, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface Notice {
  id: string;
  title: string;
  content: string;
  category: string;
  priority: string;
  is_pinned: boolean;
  published_at: string | null;
  created_at: string;
}

const categoryIcon = (cat: string) => {
  if (cat.includes("Feature")) return <Sparkles className="h-4 w-4" />;
  if (cat.includes("Maintenance")) return <AlertTriangle className="h-4 w-4" />;
  if (cat.includes("Security")) return <Shield className="h-4 w-4" />;
  if (cat.includes("Event")) return <Calendar className="h-4 w-4" />;
  return <Megaphone className="h-4 w-4" />;
};

const priorityStyles = (p: string) => {
  if (p === "critical") return "border-destructive/40 bg-destructive/5";
  if (p === "important") return "border-amber-500/40 bg-amber-500/5";
  return "border-border/50";
};

const priorityBadge = (p: string) => {
  if (p === "critical") return "bg-destructive/10 text-destructive border-destructive/30";
  if (p === "important") return "bg-amber-500/10 text-amber-400 border-amber-500/30";
  return "bg-secondary text-muted-foreground border-border";
};

const Announcements = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const now = new Date().toISOString();
      const { data } = await supabase
        .from("notices")
        .select("*")
        .eq("status", "published")
        .or(`expires_at.is.null,expires_at.gt.${now}`)
        .order("is_pinned", { ascending: false })
        .order("published_at", { ascending: false });
      if (data) setNotices(data as any);
      setLoading(false);
    };
    fetch();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-20 pb-10 max-w-3xl">
        <div className="flex items-center gap-3 mb-6">
          <Megaphone className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Announcements</h1>
        </div>

        {loading ? (
          <div className="space-y-4">{[1, 2, 3].map((i) => <div key={i} className="h-32 bg-card rounded-xl animate-pulse" />)}</div>
        ) : notices.length === 0 ? (
          <div className="text-center py-16">
            <Megaphone className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No announcements right now.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notices.map((n) => (
              <div key={n.id} className={cn("bg-card border rounded-xl p-5 transition-colors", priorityStyles(n.priority))}>
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "h-10 w-10 rounded-xl flex items-center justify-center shrink-0",
                    n.priority === "critical" ? "bg-destructive/10 text-destructive" :
                    n.priority === "important" ? "bg-amber-500/10 text-amber-400" :
                    "bg-primary/10 text-primary"
                  )}>
                    {categoryIcon(n.category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {n.is_pinned && <Pin className="h-3.5 w-3.5 text-primary" />}
                      <h2 className="font-semibold text-foreground">{n.title}</h2>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline" className="text-[10px]">{n.category}</Badge>
                      <Badge variant="outline" className={cn("text-[10px] capitalize", priorityBadge(n.priority))}>{n.priority}</Badge>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(n.published_at || n.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{n.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Announcements;
