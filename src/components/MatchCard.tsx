import SkillTag from "./SkillTag";
import MatchBadge from "./MatchBadge";
import { Button } from "@/components/ui/button";
import { MessageSquare, UserPlus, Check } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useState, memo, useCallback } from "react";
import { toast } from "sonner";

export interface MatchUser {
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

interface MatchCardProps {
  user: MatchUser;
  index?: number;
}

const MatchCard = memo(({ user, index = 0 }: MatchCardProps) => {
  const { user: authUser } = useAuth();
  const [connected, setConnected] = useState(false);

  const handleConnect = useCallback(async () => {
    if (!authUser) return;
    const { error } = await supabase.from("connections").insert({
      requester_id: authUser.id,
      receiver_id: user.user_id,
    });
    if (error) {
      if (error.code === "23505") toast.info("Already connected!");
      else toast.error("Failed to connect");
    } else {
      setConnected(true);
      toast.success(`Connection request sent to ${user.name}!`);
    }
  }, [authUser, user.user_id, user.name]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.06, 0.3), duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
      className="glass rounded-xl p-5 group hover-lift"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/40 to-accent/40 flex items-center justify-center text-lg font-display font-bold transition-transform duration-200 group-hover:scale-105">
              {user.name[0]}
            </div>
            {user.online && (
              <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-success border-2 border-card" />
            )}
          </div>
          <div>
            <h3 className="font-display font-semibold text-foreground">{user.name}</h3>
            <p className="text-xs text-muted-foreground">{user.location}</p>
          </div>
        </div>
        <MatchBadge percentage={user.matchPercentage} />
      </div>

      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{user.bio}</p>

      <div className="space-y-3 mb-4">
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1.5">Can teach</p>
          <div className="flex flex-wrap gap-1.5">
            {user.teaches.map((s) => (
              <SkillTag key={s} skill={s} variant="teach" size="sm" />
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1.5">Wants to learn</p>
          <div className="flex flex-wrap gap-1.5">
            {user.wants.map((s) => (
              <SkillTag key={s} skill={s} variant="learn" size="sm" />
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 border-border hover:border-primary/50 hover:bg-primary/10 hover:text-primary btn-press"
          onClick={handleConnect}
          disabled={connected}
        >
          {connected ? <Check className="h-3.5 w-3.5 mr-1.5" /> : <UserPlus className="h-3.5 w-3.5 mr-1.5" />}
          {connected ? "Sent" : "Connect"}
        </Button>
        <Button size="sm" className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 btn-press" asChild>
          <Link to={`/chat/${user.user_id}`}>
            <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
            Chat
          </Link>
        </Button>
      </div>
    </motion.div>
  );
});

MatchCard.displayName = "MatchCard";

export default MatchCard;
