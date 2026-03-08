import Navbar from "@/components/Navbar";
import SkillTag from "@/components/SkillTag";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Clock, Edit3, Save, Plus, X } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const Profile = () => {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newTeachSkill, setNewTeachSkill] = useState("");
  const [newWantSkill, setNewWantSkill] = useState("");
  const [profile, setProfile] = useState({
    name: "",
    location: "",
    bio: "",
    teaches: [] as string[],
    wants: [] as string[],
    availability: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (data) {
        setProfile({
          name: data.name,
          location: data.location ?? "",
          bio: data.bio ?? "",
          teaches: data.teaches ?? [],
          wants: data.wants ?? [],
          availability: data.availability ?? "",
        });
      }
      setLoading(false);
    };
    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    const { error } = await supabase
      .from("profiles")
      .update({
        name: profile.name,
        location: profile.location,
        bio: profile.bio,
        teaches: profile.teaches,
        wants: profile.wants,
        availability: profile.availability,
      })
      .eq("user_id", user.id);

    if (error) {
      toast.error("Failed to save profile");
    } else {
      toast.success("Profile saved!");
      setEditing(false);
    }
  };

  const addSkill = (type: "teaches" | "wants", skill: string) => {
    if (!skill.trim()) return;
    if (profile[type].includes(skill.trim())) return;
    setProfile({ ...profile, [type]: [...profile[type], skill.trim()] });
    if (type === "teaches") setNewTeachSkill("");
    else setNewWantSkill("");
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
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-8">
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary/40 to-accent/40 flex items-center justify-center text-3xl font-display font-bold">
                {profile.name?.[0] ?? "?"}
              </div>
              <div>
                {editing ? (
                  <Input
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="bg-secondary border-border text-xl font-display font-bold mb-1"
                  />
                ) : (
                  <h1 className="text-2xl font-display font-bold">{profile.name}</h1>
                )}
                <div className="flex items-center gap-2 text-muted-foreground text-sm mt-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {editing ? (
                    <Input
                      value={profile.location}
                      onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                      className="bg-secondary border-border text-sm h-8"
                      placeholder="Your location"
                    />
                  ) : (
                    <span>{profile.location || "Not set"}</span>
                  )}
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => editing ? handleSave() : setEditing(true)}
              className="border-border hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
            >
              {editing ? <Save className="h-4 w-4 mr-1.5" /> : <Edit3 className="h-4 w-4 mr-1.5" />}
              {editing ? "Save" : "Edit"}
            </Button>
          </div>

          <div className="mb-8">
            <Label className="text-sm font-medium text-muted-foreground mb-2 block">About</Label>
            {editing ? (
              <Textarea
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                className="bg-secondary border-border min-h-[100px]"
                placeholder="Tell others about yourself..."
              />
            ) : (
              <p className="text-foreground/80 leading-relaxed">{profile.bio || "No bio yet"}</p>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-6 mb-8">
            <div>
              <Label className="text-sm font-medium text-muted-foreground mb-3 block">Skills I can teach</Label>
              <div className="flex flex-wrap gap-2">
                {profile.teaches.map((s) => (
                  <div key={s} className="flex items-center gap-1">
                    <SkillTag skill={s} variant="teach" />
                    {editing && (
                      <button onClick={() => removeSkill("teaches", s)} className="text-muted-foreground hover:text-destructive">
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {editing && (
                <div className="flex gap-2 mt-2">
                  <Input
                    value={newTeachSkill}
                    onChange={(e) => setNewTeachSkill(e.target.value)}
                    placeholder="Add skill..."
                    className="bg-secondary border-border text-sm h-8"
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill("teaches", newTeachSkill))}
                  />
                  <Button size="sm" variant="outline" onClick={() => addSkill("teaches", newTeachSkill)} className="h-8">
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground mb-3 block">Skills I want to learn</Label>
              <div className="flex flex-wrap gap-2">
                {profile.wants.map((s) => (
                  <div key={s} className="flex items-center gap-1">
                    <SkillTag skill={s} variant="learn" />
                    {editing && (
                      <button onClick={() => removeSkill("wants", s)} className="text-muted-foreground hover:text-destructive">
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {editing && (
                <div className="flex gap-2 mt-2">
                  <Input
                    value={newWantSkill}
                    onChange={(e) => setNewWantSkill(e.target.value)}
                    placeholder="Add skill..."
                    className="bg-secondary border-border text-sm h-8"
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill("wants", newWantSkill))}
                  />
                  <Button size="sm" variant="outline" onClick={() => addSkill("wants", newWantSkill)} className="h-8">
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium text-muted-foreground mb-2 block">
              <Clock className="h-3.5 w-3.5 inline mr-1.5" />
              Availability
            </Label>
            {editing ? (
              <Input
                value={profile.availability}
                onChange={(e) => setProfile({ ...profile, availability: e.target.value })}
                className="bg-secondary border-border"
                placeholder="e.g., Weekday evenings UTC"
              />
            ) : (
              <p className="text-foreground/80">{profile.availability || "Not set"}</p>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Profile;
