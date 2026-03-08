import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Comment {
  id: string;
  user_id: string;
  comment_text: string;
  created_at: string;
  author_name: string;
}

interface PostCommentsProps {
  postId: string;
}

const PostComments = ({ postId }: PostCommentsProps) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("post_comments")
        .select("*")
        .eq("post_id", postId)
        .order("created_at", { ascending: true });
      if (error) throw error;

      const userIds = [...new Set((data ?? []).map((c: any) => c.user_id))];
      let nameMap: Record<string, string> = {};
      if (userIds.length > 0) {
        const { data: profiles } = await supabase.from("profiles").select("user_id, name").in("user_id", userIds);
        (profiles ?? []).forEach((p) => { nameMap[p.user_id] = p.name; });
      }

      setComments(
        (data ?? []).map((c: any) => ({
          id: c.id,
          user_id: c.user_id,
          comment_text: c.comment_text,
          created_at: c.created_at,
          author_name: nameMap[c.user_id] || "Unknown",
        }))
      );
    } catch (err) {
      console.error("Failed to load comments:", err);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => { fetchComments(); }, [fetchComments]);

  const handleSubmit = async () => {
    if (!user || !newComment.trim() || submitting) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from("post_comments").insert({
        user_id: user.id,
        post_id: postId,
        comment_text: newComment.trim().slice(0, 500),
      });
      if (error) throw error;
      setNewComment("");
      fetchComments();
    } catch (err) {
      console.error(err);
      toast.error("Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-5 space-y-3">
      {loading ? (
        <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
      ) : (
        <>
          {comments.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-1">No comments yet</p>
          )}
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {comments.map((c) => (
              <div key={c.id} className="flex gap-2">
                <div className="h-7 w-7 rounded-full bg-primary/15 flex items-center justify-center text-[10px] font-bold text-primary shrink-0 mt-0.5">
                  {c.author_name?.[0] ?? "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="bg-secondary rounded-xl px-3 py-2">
                    <p className="text-xs font-semibold">{c.author_name}</p>
                    <p className="text-xs text-foreground/80">{c.comment_text}</p>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5 ml-1">
                    {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="flex gap-2">
        <Input
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          className="bg-secondary border-border text-sm h-8"
          maxLength={500}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleSubmit())}
        />
        <Button size="sm" className="h-8 px-3" onClick={handleSubmit} disabled={!newComment.trim() || submitting}>
          <Send className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};

export default PostComments;
