import Navbar from "@/components/Navbar";
import SkillTag from "@/components/SkillTag";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Clock, Edit3, Save } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

const Profile = () => {
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: "Alex Johnson",
    location: "London, UK",
    bio: "Passionate developer who loves learning new technologies. Currently focused on systems programming and ML. I believe in learning by teaching — the best way to master something is to explain it to someone else.",
    teaches: ["Python", "Machine Learning", "Django", "SQL"],
    wants: ["Rust", "Go", "Systems Design", "WebAssembly"],
    availability: "Weekday evenings (UTC), Weekends",
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto pt-24 pb-12 px-4 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-8"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary/40 to-accent/40 flex items-center justify-center text-3xl font-display font-bold">
                {profile.name[0]}
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
                    />
                  ) : (
                    <span>{profile.location}</span>
                  )}
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditing(!editing)}
              className="border-border hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
            >
              {editing ? <Save className="h-4 w-4 mr-1.5" /> : <Edit3 className="h-4 w-4 mr-1.5" />}
              {editing ? "Save" : "Edit"}
            </Button>
          </div>

          {/* Bio */}
          <div className="mb-8">
            <Label className="text-sm font-medium text-muted-foreground mb-2 block">About</Label>
            {editing ? (
              <Textarea
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                className="bg-secondary border-border min-h-[100px]"
              />
            ) : (
              <p className="text-foreground/80 leading-relaxed">{profile.bio}</p>
            )}
          </div>

          {/* Skills */}
          <div className="grid sm:grid-cols-2 gap-6 mb-8">
            <div>
              <Label className="text-sm font-medium text-muted-foreground mb-3 block">Skills I can teach</Label>
              <div className="flex flex-wrap gap-2">
                {profile.teaches.map((s) => (
                  <SkillTag key={s} skill={s} variant="teach" />
                ))}
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground mb-3 block">Skills I want to learn</Label>
              <div className="flex flex-wrap gap-2">
                {profile.wants.map((s) => (
                  <SkillTag key={s} skill={s} variant="learn" />
                ))}
              </div>
            </div>
          </div>

          {/* Availability */}
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
              />
            ) : (
              <p className="text-foreground/80">{profile.availability}</p>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Profile;
