import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import MatchCard from "@/components/MatchCard";
import PointsCounter from "@/components/PointsCounter";
import StreakIndicator from "@/components/StreakIndicator";
import AchievementPopup from "@/components/AchievementPopup";
import { Input } from "@/components/ui/input";
import { Search, Filter, TrendingUp, RefreshCw, Zap, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useGamification } from "@/hooks/useGamification";
import { calculateMatchPercentage } from "@/lib/matching";
import type { MatchUser } from "@/components/MatchCard";

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<MatchUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newBadge, setNewBadge] = useState<string | null>(null);
  const { user } = useAuth();
  const { stats, loading: gamLoading } = useGamification();

  const fetchProfiles = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const [myProfileRes, profilesRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", user.id).single(),
        supabase.from("profiles").select("*").neq("user_id", user.id),
      ]);
      if (myProfileRes.error) throw myProfileRes.error;
      if (profilesRes.error) throw profilesRes.error;

      const myProfile = myProfileRes.data;
      const profiles = profilesRes.data ?? [];
      const mapped: MatchUser[] = profiles.map((p) => ({
        id: p.id,
        user_id: p.user_id,
        name: p.name || "Unknown",
        location: p.location ?? "",
        bio: p.bio ?? "",
        avatar: p.avatar_url ?? "",
        teaches: p.teaches ?? [],
        wants: p.wants ?? [],
        matchPercentage: calculateMatchPercentage(myProfile, p),
        online: p.online ?? false,
      }));
      setUsers(mapped);
    } catch (err: any) {
      console.error("Failed to fetch profiles:", err);
      setError("Failed to load matches. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchProfiles(); }, [fetchProfiles]);

  const filteredUsers = users.filter((u) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.teaches.some((s) => s.toLowerCase().includes(q)) || u.wants.some((s) => s.toLowerCase().includes(q));
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => b.matchPercentage - a.matchPercentage);
  const onlineCount = users.filter((u) => u.online).length;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <AchievementPopup badge={newBadge} onDismiss={() => setNewBadge(null)} />

      <main className="container mx-auto pt-20 pb-12 px-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-display font-bold mb-1">Your Matches</h1>
              <p className="text-sm text-muted-foreground">
                <span className="text-primary font-medium">{onlineCount} learners</span> online now
              </p>
            </div>
            <div className="flex items-center gap-2">
              <PointsCounter points={stats.total_points} size="sm" />
              <StreakIndicator days={stats.streak_days} size="sm" />
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by skill or name..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 bg-secondary border-border focus:border-primary/50 h-10" />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Total Matches", value: users.length, icon: Filter },
            { label: "High Match (80%+)", value: users.filter((u) => u.matchPercentage >= 80).length, icon: TrendingUp },
            { label: "Online Now", value: onlineCount, icon: Search },
            { label: "Your Points", value: stats.total_points.toLocaleString(), icon: Zap },
          ].map((stat) => (
            <div key={stat.label} className="glass rounded-xl p-3 sm:p-4 flex items-center gap-3">
              <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <stat.icon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-display font-bold">{stat.value}</p>
                <p className="text-[11px] sm:text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {error && (
          <div className="text-center py-10">
            <p className="text-destructive mb-3">{error}</p>
            <Button variant="outline" size="sm" onClick={fetchProfiles}><RefreshCw className="h-4 w-4 mr-1.5" /> Retry</Button>
          </div>
        )}

        {loading ? (
          <div className="text-center py-20">
            <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading matches...</p>
          </div>
        ) : !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedUsers.map((user, i) => (
              <MatchCard key={user.id} user={user} index={i} />
            ))}
          </div>
        )}

        {!loading && !error && sortedUsers.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-base sm:text-lg">
              {searchQuery ? `No matches found for "${searchQuery}"` : "No other users yet. Invite someone to join!"}
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
