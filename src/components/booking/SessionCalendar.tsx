import { useMemo } from "react";
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, addMonths, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface CalendarSession {
  id: string;
  scheduled_date: string;
  start_time: string | null;
  end_time: string | null;
  skill: string;
  status: string;
  partner_name: string;
  is_teacher: boolean;
}

interface SessionCalendarProps {
  sessions: CalendarSession[];
  currentMonth: Date;
  onMonthChange: (d: Date) => void;
  onSelectDate: (d: Date) => void;
  selectedDate: Date | null;
}

const SessionCalendar = ({ sessions, currentMonth, onMonthChange, onSelectDate, selectedDate }: SessionCalendarProps) => {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const sessionsByDate = useMemo(() => {
    const map = new Map<string, CalendarSession[]>();
    sessions.forEach(s => {
      if (s.scheduled_date) {
        const key = s.scheduled_date;
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(s);
      }
    });
    return map;
  }, [sessions]);

  const today = new Date();

  return (
    <div className="glass rounded-2xl p-5 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg font-bold">
          {format(currentMonth, "MMMM yyyy")}
        </h3>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onMonthChange(subMonths(currentMonth, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onMonthChange(addMonths(currentMonth, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => (
          <div key={d} className="text-center text-[11px] font-medium text-muted-foreground py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map(day => {
          const dateKey = format(day, "yyyy-MM-dd");
          const daySessions = sessionsByDate.get(dateKey) || [];
          const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
          const isToday = isSameDay(day, today);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const hasSessions = daySessions.length > 0;

          return (
            <button
              key={dateKey}
              onClick={() => onSelectDate(day)}
              className={cn(
                "relative h-10 sm:h-12 rounded-lg text-sm transition-all duration-150 flex flex-col items-center justify-center",
                !isCurrentMonth && "opacity-30",
                isToday && "ring-1 ring-primary/40",
                isSelected
                  ? "bg-primary/15 text-primary font-semibold"
                  : "hover:bg-secondary/60",
                hasSessions && "font-medium"
              )}
            >
              <span className={cn("text-xs sm:text-sm", !isCurrentMonth && "text-muted-foreground")}>
                {format(day, "d")}
              </span>
              {hasSessions && (
                <div className="flex gap-0.5 mt-0.5">
                  {daySessions.slice(0, 3).map((_, i) => (
                    <div key={i} className="h-1 w-1 rounded-full bg-primary" />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected date sessions */}
      {selectedDate && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-4 border-t border-border/40 pt-4"
        >
          <p className="text-xs font-medium text-muted-foreground mb-2">
            {format(selectedDate, "EEEE, MMMM d")}
          </p>
          {(sessionsByDate.get(format(selectedDate, "yyyy-MM-dd")) || []).length === 0 ? (
            <p className="text-xs text-muted-foreground">No sessions on this day.</p>
          ) : (
            <div className="space-y-1.5">
              {(sessionsByDate.get(format(selectedDate, "yyyy-MM-dd")) || []).map(s => (
                <div key={s.id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/60">
                  <div className={cn(
                    "h-2 w-2 rounded-full shrink-0",
                    s.status === "completed" ? "bg-accent" :
                    s.status === "cancelled" ? "bg-destructive" : "bg-primary"
                  )} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {s.is_teacher ? "Teaching" : "Learning"} <span className="text-primary">{s.skill}</span> with {s.partner_name}
                    </p>
                    {s.start_time && (
                      <p className="text-[11px] text-muted-foreground">
                        {s.start_time.slice(0, 5)} – {s.end_time?.slice(0, 5) || ""}
                      </p>
                    )}
                  </div>
                  <span className={cn(
                    "text-[10px] font-medium px-1.5 py-0.5 rounded-full",
                    s.status === "completed" ? "bg-accent/15 text-accent" :
                    s.status === "cancelled" ? "bg-destructive/15 text-destructive" :
                    s.status === "confirmed" ? "bg-primary/15 text-primary" :
                    "bg-muted text-muted-foreground"
                  )}>
                    {s.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default SessionCalendar;
