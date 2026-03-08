import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import SessionCard from "@/components/SessionCard";
import ReviewForm from "@/components/ReviewForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useGamification } from "@/hooks/useGamification";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface SessionRow {
  id: string;
  teacher_id: string;
  learner_id: string;
  skill: string;
  status: string;
  created_at: string;
  completed_at: string | null;
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
  const [newSessionPartner, setNewSessionPartner] = useState("");
  const [newSessionSkill, setNewSessionSkill] = useState("");
  const [creating, setCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Fetch sessions
      const { data: sessData, error: sessErr } = await supabase
        .from("sessions")
        .select("*")
        .or(`teacher_id.eq.${user.id},learner_id.eq.${user.id}`)
        .order("created_at", { ascending: false });
      if (sessErr) throw sessErr;
      const sessionList = (sessData ?? []) as SessionRow[];
      setSessions(sessionList);

      // Fetch which sessions I've already reviewed
      const { data: myReviews } = await supabase
        .from("reviews")
        .select("session_id")
        .eq("reviewer_id", user.id);
      setReviewedSessionIds(new Set((myReviews ?? []).map((r: any) => r.session_id)));

      // Fetch profile names for partners
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

      // Fetch accepted connections for new session creation
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
      const { error } = await supabase
        .from("sessions")
        .update({ status: "completed", completed_at: new Date().toISOString() })
        .eq("id", sessionId);
      if (error) throw error;
      toast.success("Session marked as completed!");
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to complete session");
    }
  };

  const createSession = async () => {
    if (!user || !newSessionPartner || creating) return;
    setCreating(true);
    try {
      const { error } = await supabase.from("sessions").insert({
        teacher_id: user.id,
        learner_id: newSessionPartner,
        skill: newSessionSkill.trim() || "General",
        status: "pending",
      });
      if (error) throw error;
      toast.success("Session created!");
      setNewSessionPartner("");
      setNewSessionSkill("");
      setDialogOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to create session");
    } finally {
      setCreating(false);
    }
  };

  const reviewingSession = sessions.find(s => s.id === reviewSessionId);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto pt-20 pb-12 px-4 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold">Sessions</h1>
            <p className="text-sm text-muted-foreground">{sessions.length} total sessions</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="rounded-full">
                <Plus className="h-4 w-4 mr-1" /> New Session
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create a Skill Session</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1 block">Partner</label>
                  <Select value={newSessionPartner} onValueChange={setNewSessionPartner}>
                    <SelectTrigger className="bg-secondary border-border">
                      <SelectValue placeholder="Select a connection" />
                    </SelectTrigger>
                    <SelectContent>
                      {connections.map(c => (
                        <SelectItem key={c.user_id} value={c.user_id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {connections.length === 0 && (
                    <p className="text-xs text-muted-foreground mt-1">No accepted connections yet. Connect with someone first!</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1 block">Skill</label>
                  <Input
                    value={newSessionSkill}
                    onChange={e => setNewSessionSkill(e.target.value)}
                    placeholder="e.g., Python, UI Design"
                    className="bg-secondary border-border"
                  />
                </div>
                <Button onClick={createSession} disabled={!newSessionPartner || creating} className="w-full rounded-full">
                  {creating ? "Creating..." : "Create Session"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>

        {loading ? (
          <div className="text-center py-20">
            <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No sessions yet. Start one with a connection!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map(s => {
              const isTeacher = s.teacher_id === user?.id;
              const partnerId = isTeacher ? s.learner_id : s.teacher_id;
              return (
                <motion.div key={s.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
                  <SessionCard
                    session={{
                      id: s.id,
                      skill: s.skill,
                      status: s.status,
                      created_at: s.created_at,
                      partner_name: profiles[partnerId] || "Unknown",
                      is_teacher: isTeacher,
                    }}
                    onComplete={completeSession}
                    onReview={(id) => setReviewSessionId(id)}
                    hasReviewed={reviewedSessionIds.has(s.id)}
                  />
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
      </main>
    </div>
  );
};

export default Sessions;
