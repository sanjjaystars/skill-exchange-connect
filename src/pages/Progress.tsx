import Navbar from "@/components/Navbar";
import { useProgressDashboard } from "@/hooks/useProgressDashboard";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { BookOpen, GraduationCap, Flame, Zap, Trophy, Star, TrendingUp, Clock } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from "recharts";
import { formatDistanceToNow } from "date-fns";

const activityLabels: Record<string, string> = {
  daily_login: "Daily login",
  teaching_session: "Completed teaching session",
  learning_session: "Completed learning session",
  new_post: "Created a feed post",
  referral: "Friend joined via referral",
};

const CHART_COLORS = [
  "hsl(263, 60%, 55%)",
  "hsl(160, 50%, 45%)",
  "hsl(200, 60%, 50%)",
  "hsl(40, 80%, 55%)",
  "hsl(340, 60%, 55%)",
];

const StatCard = ({ icon: Icon, label, value, color, delay }: { icon: any; label: string; value: string | number; color: string; delay: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.35 }}
    className="glass rounded-xl p-4 sm:p-5 hover-lift group"
  >
    <div className="flex items-center gap-3">
      <div className={`h-10 w-10 rounded-xl ${color} flex items-center justify-center shrink-0 transition-transform group-hover:scale-110`}>
        <Icon className="h-5 w-5 text-primary-foreground" />
      </div>
      <div>
        <p className="text-2xl sm:text-3xl font-display font-bold">{value}</p>
        <p className="text-[11px] sm:text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  </motion.div>
);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg">
      <p className="text-xs font-medium mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-[11px]" style={{ color: p.color }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

const ProgressPage = () => {
  const { data, loading } = useProgressDashboard();

  const pieData = [
    { name: "Teaching", value: data.teachingSessionCount },
    { name: "Learning", value: data.learningSessionCount },
  ].filter(d => d.value > 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center pt-40">
          <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto pt-20 pb-12 px-4">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-display font-bold mb-1">My Skill Progress</h1>
          <p className="text-sm text-muted-foreground">
            Track your learning journey and teaching impact
          </p>
        </motion.div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <StatCard icon={BookOpen} label="Skills Learned" value={data.skillsLearned} color="bg-primary/80" delay={0} />
          <StatCard icon={GraduationCap} label="Sessions Done" value={data.sessionsCompleted} color="bg-accent/80" delay={0.05} />
          <StatCard icon={Flame} label="Day Streak" value={data.streakDays} color="bg-[hsl(40,80%,50%)]" delay={0.1} />
          <StatCard icon={Zap} label="Total Points" value={data.totalPoints.toLocaleString()} color="bg-[hsl(200,60%,50%)]" delay={0.15} />
        </div>

        <div className="grid lg:grid-cols-3 gap-4 mb-6">
          {/* Weekly Activity Chart */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 glass rounded-xl p-5"
          >
            <h3 className="font-display text-base font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Weekly Activity
            </h3>
            <div className="h-56 sm:h-64">
              {data.weeklyActivity.some(w => w.teaching > 0 || w.learning > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.weeklyActivity}>
                    <defs>
                      <linearGradient id="colorTeaching" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(263, 60%, 55%)" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="hsl(263, 60%, 55%)" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorLearning" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(160, 50%, 45%)" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="hsl(160, 50%, 45%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(228, 10%, 18%)" />
                    <XAxis dataKey="week" tick={{ fill: "hsl(220, 8%, 50%)", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "hsl(220, 8%, 50%)", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="teaching" name="Teaching" stroke="hsl(263, 60%, 55%)" fill="url(#colorTeaching)" strokeWidth={2} />
                    <Area type="monotone" dataKey="learning" name="Learning" stroke="hsl(160, 50%, 45%)" fill="url(#colorLearning)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                  Complete sessions to see your activity chart
                </div>
              )}
            </div>
            <div className="flex gap-4 mt-2 justify-center">
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <div className="h-2 w-2 rounded-full bg-primary" /> Teaching
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <div className="h-2 w-2 rounded-full bg-accent" /> Learning
              </div>
            </div>
          </motion.div>

          {/* Teaching vs Learning Pie */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="glass rounded-xl p-5"
          >
            <h3 className="font-display text-base font-bold mb-4 flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Session Split
            </h3>
            <div className="h-48">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                  No sessions yet
                </div>
              )}
            </div>
            <div className="flex gap-4 justify-center">
              <div className="text-center">
                <p className="text-lg font-display font-bold text-primary">{data.teachingSessionCount}</p>
                <p className="text-[11px] text-muted-foreground">Teaching</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-display font-bold text-accent">{data.learningSessionCount}</p>
                <p className="text-[11px] text-muted-foreground">Learning</p>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-2 gap-4 mb-6">
          {/* Skill Progress Bars */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-xl p-5"
          >
            <h3 className="font-display text-base font-bold mb-4 flex items-center gap-2">
              <Star className="h-4 w-4 text-primary" />
              Skill Progress
            </h3>
            {data.skillProgress.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                Complete sessions to track skill progress
              </p>
            ) : (
              <div className="space-y-4">
                {data.skillProgress.slice(0, 8).map((sp, i) => (
                  <motion.div
                    key={sp.skill}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.04 }}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium truncate mr-2">{sp.skill}</span>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {sp.sessions}/{sp.maxSessions} · {sp.percentage}%
                      </span>
                    </div>
                    <Progress value={sp.percentage} className="h-2" />
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Recent Activity + Badges */}
          <div className="space-y-4">
            {/* Badges */}
            {data.badges.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="glass rounded-xl p-5"
              >
                <h3 className="font-display text-base font-bold mb-3 flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-primary" />
                  Achievements
                </h3>
                <div className="flex flex-wrap gap-2">
                  {data.badges.map((badge, i) => (
                    <motion.div
                      key={badge}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.35 + i * 0.05 }}
                      className="px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-medium text-primary"
                    >
                      🏆 {badge}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass rounded-xl p-5"
            >
              <h3 className="font-display text-base font-bold mb-3">Recent Activity</h3>
              {data.recentActivity.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No activity yet.</p>
              ) : (
                <div className="space-y-1.5">
                  {data.recentActivity.slice(0, 8).map((a, i) => (
                    <motion.div
                      key={a.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + i * 0.03 }}
                      className="flex items-center justify-between px-3 py-2 rounded-lg bg-secondary/60"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">
                          {activityLabels[a.activity_type] || a.activity_type}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}
                        </p>
                      </div>
                      <span className="text-xs font-semibold text-primary shrink-0">+{a.points_earned}</span>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProgressPage;
