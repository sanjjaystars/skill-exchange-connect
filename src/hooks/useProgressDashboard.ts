import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface SkillProgress {
  skill: string;
  sessions: number;
  maxSessions: number;
  percentage: number;
}

interface WeeklyActivity {
  week: string;
  teaching: number;
  learning: number;
}

interface RecentActivity {
  id: string;
  activity_type: string;
  points_earned: number;
  created_at: string;
  metadata: any;
}

export interface ProgressData {
  skillsLearned: number;
  skillsTaught: number;
  sessionsCompleted: number;
  teachingSessionCount: number;
  learningSessionCount: number;
  totalPoints: number;
  streakDays: number;
  skillProgress: SkillProgress[];
  weeklyActivity: WeeklyActivity[];
  recentActivity: RecentActivity[];
  badges: string[];
}

const defaultData: ProgressData = {
  skillsLearned: 0,
  skillsTaught: 0,
  sessionsCompleted: 0,
  teachingSessionCount: 0,
  learningSessionCount: 0,
  totalPoints: 0,
  streakDays: 0,
  skillProgress: [],
  weeklyActivity: [],
  recentActivity: [],
  badges: [],
};

export function useProgressDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<ProgressData>(defaultData);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      // Fetch completed sessions
      const { data: sessions } = await supabase
        .from("sessions")
        .select("*")
        .or(`teacher_id.eq.${user.id},learner_id.eq.${user.id}`)
        .eq("status", "completed");

      const completedSessions = sessions ?? [];
      const teachingSessions = completedSessions.filter(s => s.teacher_id === user.id);
      const learningSessions = completedSessions.filter(s => s.learner_id === user.id);

      // Unique skills
      const skillsTaught = new Set(teachingSessions.map(s => s.skill)).size;
      const skillsLearned = new Set(learningSessions.map(s => s.skill)).size;

      // Skill progress (learning) - sessions per skill, max 10 for 100%
      const skillMap = new Map<string, number>();
      learningSessions.forEach(s => {
        skillMap.set(s.skill, (skillMap.get(s.skill) || 0) + 1);
      });
      // Also include teaching skills
      teachingSessions.forEach(s => {
        const key = `${s.skill} (teaching)`;
        skillMap.set(key, (skillMap.get(key) || 0) + 1);
      });

      const skillProgress: SkillProgress[] = Array.from(skillMap.entries())
        .map(([skill, count]) => ({
          skill,
          sessions: count,
          maxSessions: 10,
          percentage: Math.min(Math.round((count / 10) * 100), 100),
        }))
        .sort((a, b) => b.percentage - a.percentage);

      // Weekly activity (last 8 weeks)
      const weeklyActivity: WeeklyActivity[] = [];
      for (let i = 7; i >= 0; i--) {
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - weekStart.getDay() - i * 7);
        weekStart.setHours(0, 0, 0, 0);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 7);

        const teaching = completedSessions.filter(s => {
          const d = new Date(s.completed_at || s.created_at);
          return s.teacher_id === user.id && d >= weekStart && d < weekEnd;
        }).length;

        const learning = completedSessions.filter(s => {
          const d = new Date(s.completed_at || s.created_at);
          return s.learner_id === user.id && d >= weekStart && d < weekEnd;
        }).length;

        weeklyActivity.push({
          week: `W${8 - i}`,
          teaching,
          learning,
        });
      }

      // Recent activity
      const { data: activityData } = await supabase
        .from("activity_log")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      // Gamification stats
      const { data: gamData } = await supabase
        .from("user_gamification")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      setData({
        skillsLearned,
        skillsTaught,
        sessionsCompleted: completedSessions.length,
        teachingSessionCount: teachingSessions.length,
        learningSessionCount: learningSessions.length,
        totalPoints: gamData?.total_points ?? 0,
        streakDays: gamData?.streak_days ?? 0,
        skillProgress,
        weeklyActivity,
        recentActivity: (activityData ?? []) as RecentActivity[],
        badges: (gamData?.badges as string[]) ?? [],
      });
    } catch (err) {
      console.error("Failed to fetch progress data:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, refresh: fetchData };
}
