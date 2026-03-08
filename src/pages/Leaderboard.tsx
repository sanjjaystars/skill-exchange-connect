import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import PointsCounter from "@/components/PointsCounter";
import StreakIndicator from "@/components/StreakIndicator";
import BadgeDisplay from "@/components/BadgeDisplay";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Medal, Crown } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface LeaderboardEntry {
  user_id: string;
  name: string;
  avatar_url: string | null;
  points: number;
  streak_days: number;
  badges: string[];
}

const rankIcons = [Crown, Trophy, Medal];
const rankColors = ["text-amber-400", "text-muted-foreground", "text-orange-700"];

const Leaderboard = () => {
  const { user } = useAuth();
  const [period, setPeriod] = useState("week");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.rpc("get_leaderboard", { p_period: period });
        if (error) throw error;
        setEntries((data as unknown as LeaderboardEntry[]) ?? []);
      } catch (err) {
        console.error("Failed to fetch leaderboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [period]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto pt-20 pb-12 px-4 max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-display font-bold flex items-center gap-2">
            <Trophy className="h-6 w-6 text-amber-500" /> Leaderboard
          </h1>
          <p className="text-sm text-muted-foreground">Top performers on SkillSwap</p>
        </motion.div>

        <Tabs value={period} onValueChange={setPeriod}>
          <TabsList className="mb-6 bg-secondary">
            <TabsTrigger value="week">This Week</TabsTrigger>
            <TabsTrigger value="month">This Month</TabsTrigger>
            <TabsTrigger value="all">All Time</TabsTrigger>
          </TabsList>

          <TabsContent value={period}>
            {loading ? (
              <div className="text-center py-16">
                <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : entries.length === 0 ? (
              <div className="text-center py-16">
                <Trophy className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">No activity yet this period. Be the first!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {entries.map((entry, i) => {
                  const isMe = entry.user_id === user?.id;
                  const RankIcon = i < 3 ? rankIcons[i] : null;
                  return (
                    <motion.div
                      key={entry.user_id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className={`flex items-center gap-3 rounded-xl border p-3 sm:p-4 transition-colors ${
                        isMe ? "bg-primary/5 border-primary/20" : "bg-card border-border"
                      }`}
                    >
                      {/* Rank */}
                      <div className="w-8 text-center shrink-0">
                        {RankIcon ? (
                          <RankIcon className={`h-5 w-5 mx-auto ${rankColors[i]}`} />
                        ) : (
                          <span className="text-sm font-bold text-muted-foreground">#{i + 1}</span>
                        )}
                      </div>

                      {/* Avatar */}
                      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center text-sm font-bold shrink-0">
                        {entry.name?.[0] ?? "?"}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">
                          {entry.name} {isMe && <span className="text-xs text-primary">(You)</span>}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <StreakIndicator days={entry.streak_days} size="sm" />
                          {entry.badges.length > 0 && (
                            <span className="text-[10px] text-muted-foreground">{entry.badges.length} badge{entry.badges.length !== 1 ? "s" : ""}</span>
                          )}
                        </div>
                      </div>

                      {/* Points */}
                      <PointsCounter points={entry.points} size="sm" />
                    </motion.div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Leaderboard;
