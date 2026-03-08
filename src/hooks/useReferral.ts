import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface ReferralStats {
  total_referrals: number;
  total_points: number;
  referral_code: string | null;
  recent_referrals: Array<{
    created_at: string;
    reward_points: number;
    status: string;
    name: string;
    avatar_url: string | null;
  }>;
  top_referrers: Array<{
    user_id: string;
    name: string;
    avatar_url: string | null;
    invite_count: number;
    total_points: number;
  }>;
}

const defaultStats: ReferralStats = {
  total_referrals: 0,
  total_points: 0,
  referral_code: null,
  recent_referrals: [],
  top_referrers: [],
};

export const useReferral = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<ReferralStats>(defaultStats);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase.rpc("get_referral_stats", {
        p_user_id: user.id,
      });
      if (error) throw error;
      if (data) setStats(data as unknown as ReferralStats);
    } catch (err) {
      console.error("Failed to fetch referral stats:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const processReferral = useCallback(
    async (referralCode: string) => {
      if (!user) return { success: false, message: "Not authenticated" };
      try {
        const { data, error } = await supabase.rpc("process_referral", {
          p_referral_code: referralCode,
          p_new_user_id: user.id,
        });
        if (error) throw error;
        return data as unknown as { success: boolean; message: string };
      } catch (err: any) {
        return { success: false, message: err.message };
      }
    },
    [user]
  );

  const getReferralLink = useCallback(() => {
    if (!stats.referral_code) return "";
    return `${window.location.origin}/login?ref=${stats.referral_code}`;
  }, [stats.referral_code]);

  return { stats, loading, fetchStats, processReferral, getReferralLink };
};
