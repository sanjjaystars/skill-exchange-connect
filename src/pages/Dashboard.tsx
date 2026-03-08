import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import MatchCard from "@/components/MatchCard";
import { Input } from "@/components/ui/input";
import { Search, Filter, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { calculateMatchPercentage } from "@/lib/matching";
import type { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;

export interface MatchUserData {
  id: string;
  user_id: string;
  name: string;
  location: string;
  bio: string;
  avatar: string;
  teaches: string[];
  wants: string[];
  matchPercentage: number;
  online: boolean;
}

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<MatchUserData[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchProfiles = async () => {
      if (!user) return;

      // Get my profile
      const { data: myProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      // Get all other profiles
      const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .neq("user_id", user.id);

      if (profiles && myProfile) {
        const mapped: MatchUserData[] = profiles.map((p) => ({
          id: p.id,
          user_id: p.user_id,
          name: p.name,
          location: p.location ?? "",
          bio: p.bio ?? "",
          avatar: p.avatar_url ?? "",
          teaches: p.teaches ?? [],
          wants: p.wants ?? [],
          matchPercentage: calculateMatchPercentage(myProfile, p),
          online: p.online ?? false,
        }));
        setUsers(mapped);
      }
      setLoading(false);
    };

    fetchProfiles();
  }, [user]);

  const filteredUsers = users.filter((u) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.teaches.some((s) => s.toLowerCase().includes(q)) ||
      u.wants.some((s) => s.toLowerCase().includes(q))
    );
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => b.matchPercentage - a.matchPercentage);
  const onlineCount = users.filter((u) => u.online).length;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto pt-24 pb-12 px-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-display font-bold mb-2">Your Matches</h1>
          <p className="text-muted-foreground">
            <span className="text-primary font-medium">{onlineCount} learners</span> online right now
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex gap-3 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by skill or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-secondary border-border focus:border-primary/50"
            />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total Matches", value: users.length, icon: Filter },
            { label: "High Match (80%+)", value: users.filter((u) => u.matchPercentage >= 80).length, icon: TrendingUp },
            { label: "Online Now", value: onlineCount, icon: Search },
          ].map((stat) => (
            <div key={stat.label} className="glass rounded-xl p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <stat.icon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-display font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {loading ? (
          <div className="text-center py-20">
            <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading matches...</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {sortedUsers.map((user, i) => (
              <MatchCard key={user.id} user={user} index={i} />
            ))}
          </div>
        )}

        {!loading && sortedUsers.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">
              {searchQuery ? `No matches found for "${searchQuery}"` : "No other users yet. Invite someone to join!"}
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
