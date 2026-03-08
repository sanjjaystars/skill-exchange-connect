import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface GamificationStats {
  total_points: number;
  streak_days: number;
  badges: string[];
  rank: number | null;
}

export function useGamification() {
  const { user } = useAuth();
  const [stats, setStats] = useState<GamificationStats>({
    total_points: 0,
    streak_days: 0,
    badges: [],
    rank: null,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("user_gamification")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        // Get rank
        const { count } = await supabase
          .from("user_gamification")
          .select("*", { count: "exact", head: true })
          .gt("total_points", data.total_points);

        setStats({
          total_points: data.total_points ?? 0,
          streak_days: data.streak_days ?? 0,
          badges: (data.badges as string[]) ?? [],
          rank: (count ?? 0) + 1,
        });
      } else {
        // Create initial row
        await supabase.from("user_gamification").insert({ user_id: user.id });
      }
    } catch (err) {
      console.error("Failed to fetch gamification:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const recordActivity = useCallback(
    async (activityType: string, points: number) => {
      if (!user) return null;
      try {
        const { data, error } = await supabase.rpc("record_activity", {
          p_user_id: user.id,
          p_activity_type: activityType,
          p_points: points,
        });
        if (error) throw error;
        await fetchStats();
        return data;
      } catch (err) {
        console.error("Failed to record activity:", err);
        return null;
      }
    },
    [user, fetchStats]
  );

  // Daily login points on mount
  useEffect(() => {
    if (!user) return;
    const key = `daily_login_${user.id}_${new Date().toISOString().slice(0, 10)}`;
    if (!localStorage.getItem(key)) {
      recordActivity("daily_login", 5).then(() => localStorage.setItem(key, "1"));
    }
  }, [user, recordActivity]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, recordActivity, refreshStats: fetchStats };
}
