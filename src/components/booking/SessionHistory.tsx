import { formatDistanceToNow, format } from "date-fns";
import { CheckCircle, Clock, XCircle, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface HistorySession {
  id: string;
  skill: string;
  status: string;
  created_at: string;
  completed_at: string | null;
  scheduled_date: string | null;
  start_time: string | null;
  end_time: string | null;
  duration_minutes: number | null;
  partner_name: string;
  is_teacher: boolean;
}

interface SessionHistoryProps {
  sessions: HistorySession[];
}

const statusConfig: Record<string, { icon: typeof CheckCircle; color: string; bg: string }> = {
  completed: { icon: CheckCircle, color: "text-accent", bg: "bg-accent/15" },
  cancelled: { icon: XCircle, color: "text-destructive", bg: "bg-destructive/15" },
  pending: { icon: Clock, color: "text-primary", bg: "bg-primary/15" },
  confirmed: { icon: Calendar, color: "text-primary", bg: "bg-primary/15" },
};

const SessionHistory = ({ sessions }: SessionHistoryProps) => {
  if (sessions.length === 0) {
    return (
      <div className="glass rounded-2xl p-5 sm:p-6">
        <h3 className="font-display text-lg font-bold mb-3">Session History</h3>
        <div className="text-center py-6">
          <Calendar className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No completed sessions yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-5 sm:p-6">
      <h3 className="font-display text-lg font-bold mb-3">Session History</h3>
      <div className="space-y-2">
        {sessions.map((s, i) => {
          const config = statusConfig[s.status] || statusConfig.pending;
          const Icon = config.icon;
          return (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="flex items-center gap-3 px-3 py-3 rounded-xl bg-secondary/60"
            >
              <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center shrink-0", config.bg)}>
                <Icon className={cn("h-4 w-4", config.color)} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {s.is_teacher ? "Teaching" : "Learning"}{" "}
                  <span className="text-primary">{s.skill || "General"}</span>{" "}
                  with {s.partner_name}
                </p>
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  {s.scheduled_date && (
                    <span>{format(new Date(s.scheduled_date), "MMM d, yyyy")}</span>
                  )}
                  {s.start_time && (
                    <span>· {s.start_time.slice(0, 5)} – {s.end_time?.slice(0, 5)}</span>
                  )}
                  {s.duration_minutes && (
                    <span>· {s.duration_minutes} min</span>
                  )}
                </div>
              </div>
              <span className={cn(
                "text-[10px] font-medium px-2 py-1 rounded-full shrink-0",
                config.bg, config.color
              )}>
                {s.status}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default SessionHistory;
