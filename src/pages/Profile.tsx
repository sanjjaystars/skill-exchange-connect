import Navbar from "@/components/Navbar";
import SkillTag from "@/components/SkillTag";
import StarRating from "@/components/StarRating";
import ReputationBadge from "@/components/ReputationBadge";
import ReviewCard from "@/components/ReviewCard";
import PointsCounter from "@/components/PointsCounter";
import StreakIndicator from "@/components/StreakIndicator";
import BadgeDisplay from "@/components/BadgeDisplay";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Clock, Edit3, Save, Plus, X, Star, Trophy } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useGamification } from "@/hooks/useGamification";
import { toast } from "sonner";

interface Review {
  id: string;
  reviewer_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

interface Reputation {
  average_rating: number;
  total_reviews: number;
  completed_sessions: number;
}

const Profile = () => {
  const { user } = useAuth();
  const { stats: gamification, loading: gamLoading } = useGamification();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newTeachSkill, setNewTeachSkill] = useState("");
  const [newWantSkill, setNewWantSkill] = useState("");
  const [reputation, setReputation] = useState<Reputation>({ average_rating: 0, total_reviews: 0, completed_sessions: 0 });
  const [reviews, setReviews] = useState<Review[]>([]);
  const [profile, setProfile] = useState({
    name: "",
    location: "",
    bio: "",
    teaches: [] as string[],
    wants: [] as string[],
    availability: "",
  });

  const fetchProfile = useCallback(async () => {
    if (!user) return;
    try {
      const [profileRes, repRes, reviewsRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", user.id).single(),
        supabase.rpc("get_user_reputation", { target_user_id: user.id }),
        supabase.from("reviews").select("id, reviewer_id, rating, comment, created_at").eq("reviewed_user_id", user.id).order("created_at", { ascending: false }).limit(10),
      ]);

      if (profileRes.error) throw profileRes.error;
      if (profileRes.data) {
        setProfile({
          name: profileRes.data.name || "",
          location: profileRes.data.location ?? "",
          bio: profileRes.data.bio ?? "",
          teaches: profileRes.data.teaches ?? [],
          wants: profileRes.data.wants ?? [],
          availability: profileRes.data.availability ?? "",
        });
      }

      if (repRes.data) {
        const rep = repRes.data as any;
        setReputation({
          average_rating: Number(rep.average_rating) || 0,
          total_reviews: Number(rep.total_reviews) || 0,
          completed_sessions: Number(rep.completed_sessions) || 0,
        });
      }

      if (reviewsRes.data && reviewsRes.data.length > 0) {
        const reviewerIds = [...new Set(reviewsRes.data.map((r: any) => r.reviewer_id))];
        const { data: reviewerProfiles } = await supabase.from("profiles").select("user_id, name").in("user_id", reviewerIds);
        const nameMap: Record<string, string> = {};
        (reviewerProfiles ?? []).forEach(p => { nameMap[p.user_id] = p.name; });
        setReviews(reviewsRes.data.map((r: any) => ({ id: r.id, reviewer_name: nameMap[r.reviewer_id] || "Anonymous", rating: r.rating, comment: r.comment || "", created_at: r.created_at })));
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const handleSave = async () => {
    if (!user || saving) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("profiles").update({ name: profile.name, location: profile.location, bio: profile.bio, teaches: profile.teaches, wants: profile.wants, availability: profile.availability }).eq("user_id", user.id);
      if (error) throw error;
      toast.success("Profile saved!");
      setEditing(false);
    } catch (err) {
      console.error("Failed to save profile:", err);
      toast.error("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const addSkill = (type: "teaches" | "wants", skill: string) => {
    if (!skill.trim() || profile[type].includes(skill.trim())) return;
    setProfile({ ...profile, [type]: [...profile[type], skill.trim()] });
    if (type === "teaches") setNewTeachSkill(""); else setNewWantSkill("");
  };

  const removeSkill = (type: "teaches" | "wants", skill: string) => {
    setProfile({ ...profile, [type]: profile[type].filter((s) => s !== skill) });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center pt-32">
          <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto pt-24 pb-12 px-4 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary/40 to-accent/40 flex items-center justify-center text-3xl font-display font-bold">
                {profile.name?.[0] ?? "?"}
              </div>
              <div>
                {editing ? (
                  <Input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className="bg-secondary border-border text-xl font-display font-bold mb-1" />
                ) : (
                  <h1 className="text-2xl font-display font-bold">{profile.name}</h1>
                )}
                <div className="flex items-center gap-2 text-muted-foreground text-sm mt-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {editing ? (
                    <Input value={profile.location} onChange={(e) => setProfile({ ...profile, location: e.target.value })} className="bg-secondary border-border text-sm h-8" placeholder="Your location" />
                  ) : (
                    <span>{profile.location || "Not set"}</span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <ReputationBadge averageRating={reputation.average_rating} totalReviews={reputation.total_reviews} completedSessions={reputation.completed_sessions} />
                  <StreakIndicator days={gamification.streak_days} size="sm" />
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => (editing ? handleSave() : setEditing(true))} disabled={saving} className="border-border hover:border-primary/50 hover:bg-primary/10 hover:text-primary">
              {editing ? <Save className="h-4 w-4 mr-1.5" /> : <Edit3 className="h-4 w-4 mr-1.5" />}
              {saving ? "Saving..." : editing ? "Save" : "Edit"}
            </Button>
          </div>

          {/* Gamification Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="bg-secondary/50 rounded-xl border border-border p-3 text-center">
              <PointsCounter points={gamification.total_points} size="sm" />
              <p className="text-[11px] text-muted-foreground mt-1">Total Points</p>
            </div>
            <div className="bg-secondary/50 rounded-xl border border-border p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-0.5">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="text-lg font-display font-bold">{reputation.average_rating}</span>
              </div>
              <p className="text-[11px] text-muted-foreground">Avg Rating</p>
            </div>
            <div className="bg-secondary/50 rounded-xl border border-border p-3 text-center">
              <span className="text-lg font-display font-bold">{reputation.total_reviews}</span>
              <p className="text-[11px] text-muted-foreground">Reviews</p>
            </div>
            <div className="bg-secondary/50 rounded-xl border border-border p-3 text-center">
              <div className="flex items-center justify-center gap-1">
                <Trophy className="h-4 w-4 text-primary" />
                <span className="text-lg font-display font-bold">#{gamification.rank ?? "–"}</span>
              </div>
              <p className="text-[11px] text-muted-foreground">Rank</p>
            </div>
          </div>

          {/* Badges */}
          <div className="mb-6">
            <Label className="text-sm font-medium text-muted-foreground mb-2 block">Badges Earned</Label>
            <BadgeDisplay badges={gamification.badges} />
          </div>

          {/* Bio */}
          <div className="mb-6">
            <Label className="text-sm font-medium text-muted-foreground mb-2 block">About</Label>
            {editing ? (
              <Textarea value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} className="bg-secondary border-border min-h-[100px]" placeholder="Tell others about yourself..." />
            ) : (
              <p className="text-foreground/80 leading-relaxed">{profile.bio || "No bio yet"}</p>
            )}
          </div>

          {/* Skills */}
          <div className="grid sm:grid-cols-2 gap-6 mb-6">
            <div>
              <Label className="text-sm font-medium text-muted-foreground mb-3 block">Skills I can teach</Label>
              <div className="flex flex-wrap gap-2">
                {profile.teaches.map((s) => (
                  <div key={s} className="flex items-center gap-1">
                    <SkillTag skill={s} variant="teach" />
                    {editing && <button onClick={() => removeSkill("teaches", s)} className="text-muted-foreground hover:text-destructive"><X className="h-3 w-3" /></button>}
                  </div>
                ))}
              </div>
              {editing && (
                <div className="flex gap-2 mt-2">
                  <Input value={newTeachSkill} onChange={(e) => setNewTeachSkill(e.target.value)} placeholder="Add skill..." className="bg-secondary border-border text-sm h-8" onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill("teaches", newTeachSkill))} />
                  <Button size="sm" variant="outline" onClick={() => addSkill("teaches", newTeachSkill)} className="h-8"><Plus className="h-3 w-3" /></Button>
                </div>
              )}
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground mb-3 block">Skills I want to learn</Label>
              <div className="flex flex-wrap gap-2">
                {profile.wants.map((s) => (
                  <div key={s} className="flex items-center gap-1">
                    <SkillTag skill={s} variant="learn" />
                    {editing && <button onClick={() => removeSkill("wants", s)} className="text-muted-foreground hover:text-destructive"><X className="h-3 w-3" /></button>}
                  </div>
                ))}
              </div>
              {editing && (
                <div className="flex gap-2 mt-2">
                  <Input value={newWantSkill} onChange={(e) => setNewWantSkill(e.target.value)} placeholder="Add skill..." className="bg-secondary border-border text-sm h-8" onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill("wants", newWantSkill))} />
                  <Button size="sm" variant="outline" onClick={() => addSkill("wants", newWantSkill)} className="h-8"><Plus className="h-3 w-3" /></Button>
                </div>
              )}
            </div>
          </div>

          {/* Availability */}
          <div className="mb-8">
            <Label className="text-sm font-medium text-muted-foreground mb-2 block">
              <Clock className="h-3.5 w-3.5 inline mr-1.5" />Availability
            </Label>
            {editing ? (
              <Input value={profile.availability} onChange={(e) => setProfile({ ...profile, availability: e.target.value })} className="bg-secondary border-border" placeholder="e.g., Weekday evenings UTC" />
            ) : (
              <p className="text-foreground/80">{profile.availability || "Not set"}</p>
            )}
          </div>

          {/* Reviews */}
          {reviews.length > 0 && (
            <div>
              <h2 className="text-lg font-display font-bold mb-3">Recent Reviews</h2>
              <div className="space-y-3">
                {reviews.map((r) => (
                  <ReviewCard key={r.id} reviewerName={r.reviewer_name} rating={r.rating} comment={r.comment} createdAt={r.created_at} />
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default Profile;
