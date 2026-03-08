import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImagePlus, X, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface CreatePostFormProps {
  onPostCreated: () => void;
}

const postTypes = [
  { value: "general", label: "General Update" },
  { value: "skill_learned", label: "Skill Learned 🎓" },
  { value: "project", label: "Project Completed 🚀" },
  { value: "tutorial", label: "Tutorial / Tip 💡" },
  { value: "achievement", label: "Achievement 🏆" },
];

const CreatePostForm = ({ onPostCreated }: CreatePostFormProps) => {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [postType, setPostType] = useState("general");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!user || !content.trim() || submitting) return;
    setSubmitting(true);

    try {
      let imageUrl: string | null = null;

      if (imageFile) {
        const ext = imageFile.name.split(".").pop();
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from("post-images")
          .upload(path, imageFile);
        if (uploadErr) throw uploadErr;
        const { data: urlData } = supabase.storage.from("post-images").getPublicUrl(path);
        imageUrl = urlData.publicUrl;
      }

      const { error } = await supabase.from("posts").insert({
        user_id: user.id,
        content: content.trim().slice(0, 2000),
        post_type: postType,
        image_url: imageUrl,
      });
      if (error) throw error;

      // Award points for posting
      await supabase.rpc("record_activity", {
        p_user_id: user.id,
        p_activity_type: "community_post",
        p_points: 10,
      });

      toast.success("Post shared! +10 points");
      setContent("");
      setPostType("general");
      setImageFile(null);
      setImagePreview(null);
      onPostCreated();
    } catch (err) {
      console.error("Failed to create post:", err);
      toast.error("Failed to share post");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-card rounded-2xl border border-border p-4 sm:p-5">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Share what you learned, built, or taught today..."
        className="bg-secondary border-border min-h-[80px] text-sm resize-none mb-3"
        maxLength={2000}
      />

      {imagePreview && (
        <div className="relative mb-3 inline-block">
          <img src={imagePreview} alt="Preview" className="max-h-48 rounded-xl border border-border object-cover" />
          <button
            onClick={() => { setImageFile(null); setImagePreview(null); }}
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-xs"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Select value={postType} onValueChange={setPostType}>
            <SelectTrigger className="bg-secondary border-border h-8 text-xs w-auto min-w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {postTypes.map((t) => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => fileRef.current?.click()}>
            <ImagePlus className="h-3.5 w-3.5 mr-1" /> Image
          </Button>
        </div>

        <Button
          size="sm"
          className="rounded-full h-8"
          onClick={handleSubmit}
          disabled={!content.trim() || submitting}
        >
          <Send className="h-3.5 w-3.5 mr-1" />
          {submitting ? "Posting..." : "Share"}
        </Button>
      </div>
    </div>
  );
};

export default CreatePostForm;
