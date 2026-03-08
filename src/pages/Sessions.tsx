import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import SessionCard from "@/components/SessionCard";
import ReviewForm from "@/components/ReviewForm";
import SessionCalendar from "@/components/booking/SessionCalendar";
import AvailabilityManager from "@/components/booking/AvailabilityManager";
import BookingModal from "@/components/booking/BookingModal";
import SessionHistory from "@/components/booking/SessionHistory";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, BookOpen, CalendarDays, Clock, History } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useGamification } from "@/hooks/useGamification";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface SessionRow {
  id: string;
  teacher_id: string;
  learner_id: string;
  skill: string;
  status: string;
  created_at: string;
  completed_at: string | null;
  scheduled_date: string | null;
  start_time: string | null;
  end_time: string | null;
  duration_minutes: number | null;
  notes: string | null;
}

const Sessions = () => {
  const { user } = useAuth();
  const { recordActivity } = useGamification();
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [reviewedSessionIds, setReviewedSessionIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<Record<string, string>>({});
  const [reviewSessionId, setReviewSessionId] = useState<string | null>(null);
  const [connections, setConnections] = useState<{ user_id: string; name: string }[]>([]);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data: sessData, error: sessErr } = await supabase
        .from("sessions")
        .select("*")
        .or(`teacher_id.eq.${user.id},learner_id.eq.${user.id}`)
        .order("created_at", { ascending: false });
      if (sessErr) throw sessErr;
      const sessionList = (sessData ?? []) as SessionRow[];
      setSessions(sessionList);

      const { data: myReviews } = await supabase
        .from("reviews")
        .select("session_id")
        .eq("reviewer_id", user.id);
      setReviewedSessionIds(new Set((myReviews ?? []).map((r: any) => r.session_id)));

      const partnerIds = [...new Set(sessionList.flatMap(s => [s.teacher_id, s.learner_id]).filter(id => id !== user.id))];
      if (partnerIds.length > 0) {
        const { data: profs } = await supabase
          .from("profiles")
          .select("user_id, name")
          .in("user_id", partnerIds);
        const map: Record<string, string> = {};
        (profs ?? []).forEach(p => { map[p.user_id] = p.name; });
        setProfiles(map);
      }

      const { data: conns } = await supabase
        .from("connections")
        .select("requester_id, receiver_id")
        .eq("status", "accepted")
        .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`);
      const connUserIds = [...new Set((conns ?? []).map(c => c.requester_id === user.id ? c.receiver_id : c.requester_id))];
      if (connUserIds.length > 0) {
        const { data: connProfiles } = await supabase
          .from("profiles")
          .select("user_id, name")
          .in("user_id", connUserIds);
        setConnections((connProfiles ?? []).map(p => ({ user_id: p.user_id, name: p.name })));
      }
    } catch (err) {
      console.error("Failed to fetch sessions:", err);
      toast.error("Failed to load sessions");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const completeSession = async (sessionId: string) => {
    try {
      const session = sessions.find(s => s.id === sessionId);
      const { error } = await supabase
        .from("sessions")
        .update({ status: "completed", completed_at: new Date().toISOString() })
        .eq("id", sessionId);
      if (error) throw error;
      const isTeacher = session?.teacher_id === user?.id;
      await recordActivity(isTeacher ? "teaching_session" : "learning_session", isTeacher ? 50 : 30);
      toast.success(`Session completed! +${isTeacher ? 50 : 30} points`);
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to complete session");
    }
  };

  const cancelSession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from("sessions")
        .update({ status: "cancelled" })
        .eq("id", sessionId);
      if (error) throw error;
      toast.success("Session cancelled");
      fetchData();
    } catch (err) {
      toast.error("Failed to cancel session");
    }
  };

  const confirmSession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from("sessions")
        .update({ status: "confirmed" })
        .eq("id", sessionId);
      if (error) throw error;
      toast.success("Session confirmed!");
      fetchData();
    } catch (err) {
      toast.error("Failed to confirm session");
    }
  };

  const activeSessions = sessions.filter(s => s.status === "pending" || s.status === "confirmed");
  const completedSessions = sessions.filter(s => s.status === "completed");
  const cancelledSessions = sessions.filter(s => s.status === "cancelled");

  const calendarSessions = sessions.map(s => {
    const isTeacher = s.teacher_id === user?.id;
    const partnerId = isTeacher ? s.learner_id : s.teacher_id;
    return {
      id: s.id,
      scheduled_date: s.scheduled_date || s.created_at.split("T")[0],
      start_time: s.start_time,
      end_time: s.end_time,
      skill: s.skill,
      status: s.status,
      partner_name: profiles[partnerId] || "Unknown",
      is_teacher: isTeacher,
    };
  });

  const historySessions = completedSessions.map(s => {
    const isTeacher = s.teacher_id === user?.id;
    const partnerId = isTeacher ? s.learner_id : s.teacher_id;
    return {
      ...s,
      partner_name: profiles[partnerId] || "Unknown",
      is_teacher: isTeacher,
    };
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <BookingModal
        open={bookingOpen}
        onOpenChange={setBookingOpen}
        partnerId=""
        partnerName=""
        connections={connections}
        onBooked={fetchData}
      />

      <main className="container mx-auto pt-20 pb-12 px-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold">Sessions</h1>
            <p className="text-sm text-muted-foreground">
              {activeSessions.length} upcoming · {completedSessions.length} completed
            </p>
          </div>
          <Button size="sm" className="rounded-full" onClick={() => setBookingOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> Book Session
          </Button>
        </motion.div>

        <Tabs defaultValue="upcoming" className="space-y-4">
          <TabsList className="bg-secondary/60 border border-border/40">
            <TabsTrigger value="upcoming" className="text-xs sm:text-sm">
              <CalendarDays className="h-3.5 w-3.5 mr-1.5" />
              Upcoming
            </TabsTrigger>
            <TabsTrigger value="calendar" className="text-xs sm:text-sm">
              <CalendarDays className="h-3.5 w-3.5 mr-1.5" />
              Calendar
            </TabsTrigger>
            <TabsTrigger value="history" className="text-xs sm:text-sm">
              <History className="h-3.5 w-3.5 mr-1.5" />
              History
            </TabsTrigger>
            <TabsTrigger value="availability" className="text-xs sm:text-sm">
              <Clock className="h-3.5 w-3.5 mr-1.5" />
              Availability
            </TabsTrigger>
          </TabsList>

          {/* Upcoming sessions */}
          <TabsContent value="upcoming">
            {loading ? (
              <div className="text-center py-20">
                <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              </div>
            ) : activeSessions.length === 0 ? (
              <div className="text-center py-20">
                <BookOpen className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">No upcoming sessions. Book one with a connection!</p>
              </div>
            ) : (
              <div className="space-y-3 max-w-3xl">
                {activeSessions.map(s => {
                  const isTeacher = s.teacher_id === user?.id;
                  const partnerId = isTeacher ? s.learner_id : s.teacher_id;
                  return (
                    <motion.div key={s.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
                      <div className="bg-card rounded-xl border border-border p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
                              s.status === "confirmed" ? "bg-accent/15" : "bg-primary/15"
                            }`}>
                              {s.status === "confirmed"
                                ? <CalendarDays className="h-4 w-4 text-accent" />
                                : <Clock className="h-4 w-4 text-primary" />
                              }
                            </div>
                            <div>
                              <p className="text-sm font-medium">
                                {isTeacher ? "Teaching" : "Learning"}{" "}
                                <span className="text-primary">{s.skill || "General"}</span>{" "}
                                with <span className="font-semibold">{profiles[partnerId] || "Unknown"}</span>
                              </p>
                              <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                                {s.scheduled_date && <span>{new Date(s.scheduled_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>}
                                {s.start_time && <span>· {s.start_time.slice(0, 5)} – {s.end_time?.slice(0, 5)}</span>}
                                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
                                  s.status === "confirmed" ? "bg-accent/15 text-accent" : "bg-muted text-muted-foreground"
                                }`}>
                                  {s.status}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 ml-12 sm:ml-0">
                            {s.status === "pending" && (
                              <Button size="sm" variant="outline" className="rounded-full text-xs" onClick={() => confirmSession(s.id)}>
                                Confirm
                              </Button>
                            )}
                            <Button size="sm" variant="outline" className="rounded-full text-xs" onClick={() => completeSession(s.id)}>
                              Complete
                            </Button>
                            <Button size="sm" variant="ghost" className="rounded-full text-xs text-destructive hover:text-destructive" onClick={() => cancelSession(s.id)}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                        {s.notes && (
                          <p className="mt-2 ml-12 text-xs text-muted-foreground italic">"{s.notes}"</p>
                        )}
                      </div>

                      {reviewSessionId === s.id && user && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-2">
                          <ReviewForm
                            sessionId={s.id}
                            reviewerId={user.id}
                            reviewedUserId={partnerId}
                            onSubmitted={() => { setReviewSessionId(null); fetchData(); }}
                          />
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Calendar view */}
          <TabsContent value="calendar">
            <div className="max-w-2xl">
              <SessionCalendar
                sessions={calendarSessions}
                currentMonth={currentMonth}
                onMonthChange={setCurrentMonth}
                onSelectDate={setSelectedDate}
                selectedDate={selectedDate}
              />
            </div>
          </TabsContent>

          {/* History */}
          <TabsContent value="history">
            <div className="max-w-3xl">
              <SessionHistory sessions={historySessions} />
            </div>
          </TabsContent>

          {/* Availability */}
          <TabsContent value="availability">
            <div className="max-w-md">
              <AvailabilityManager />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Sessions;
