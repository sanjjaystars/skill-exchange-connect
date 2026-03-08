import { useState } from "react";
import { Heart, MessageCircle, Share2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import PostComments from "./PostComments";

const typeEmoji: Record<string, string> = {
  skill_learned: "🎓",
  project: "🚀",
  tutorial: "💡",
  achievement: "🏆",
  general: "",
};

export interface PostData {
  id: string;
  user_id: string;
  content: string;
  image_url: string | null;
  post_type: string;
  created_at: string;
  author_name: string;
  author_avatar: string | null;
  like_count: number;
  comment_count: number;
  liked_by_me: boolean;
}

interface PostCardProps {
  post: PostData;
  onRefresh: () => void;
}

const PostCard = ({ post, onRefresh }: PostCardProps) => {
  const { user } = useAuth();
  const [liked, setLiked] = useState(post.liked_by_me);
  const [likeCount, setLikeCount] = useState(post.like_count);
  const [showComments, setShowComments] = useState(false);
  const [liking, setLiking] = useState(false);

  const toggleLike = async () => {
    if (!user || liking) return;
    setLiking(true);
    try {
      if (liked) {
        await supabase.from("post_likes").delete().eq("user_id", user.id).eq("post_id", post.id);
        setLiked(false);
        setLikeCount((c) => c - 1);
      } else {
        await supabase.from("post_likes").insert({ user_id: user.id, post_id: post.id });
        setLiked(true);
        setLikeCount((c) => c + 1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLiking(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/feed?post=${post.id}`);
      toast.success("Link copied!");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleDelete = async () => {
    if (!user || user.id !== post.user_id) return;
    try {
      await supabase.from("posts").delete().eq("id", post.id);
      toast.success("Post deleted");
      onRefresh();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete post");
    }
  };

  const emoji = typeEmoji[post.post_type] || "";

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 pb-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center text-sm font-bold shrink-0">
              {post.author_name?.[0] ?? "?"}
            </div>
            <div>
              <p className="text-sm font-semibold">{post.author_name}</p>
              <p className="text-[11px] text-muted-foreground">
                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                {emoji && ` · ${emoji}`}
              </p>
            </div>
          </div>
          {user?.id === post.user_id && (
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive" onClick={handleDelete}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>

        {/* Content */}
        <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap mb-3">{post.content}</p>
      </div>

      {/* Image */}
      {post.image_url && (
        <div className="px-4 sm:px-5 pb-3">
          <img
            src={post.image_url}
            alt="Post image"
            className="w-full max-h-96 object-cover rounded-xl border border-border"
            loading="lazy"
          />
        </div>
      )}

      {/* Actions */}
      <div className="px-4 sm:px-5 pb-3 pt-1 flex items-center gap-1 border-t border-border/50 mt-1">
        <Button
          variant="ghost"
          size="sm"
          className={`h-8 text-xs gap-1.5 ${liked ? "text-rose-500" : "text-muted-foreground"}`}
          onClick={toggleLike}
        >
          <Heart className={`h-3.5 w-3.5 ${liked ? "fill-rose-500" : ""}`} />
          {likeCount > 0 && likeCount}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-xs gap-1.5 text-muted-foreground"
          onClick={() => setShowComments(!showComments)}
        >
          <MessageCircle className="h-3.5 w-3.5" />
          {post.comment_count > 0 && post.comment_count}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-xs gap-1.5 text-muted-foreground"
          onClick={handleShare}
        >
          <Share2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Comments */}
      {showComments && (
        <div className="border-t border-border/50">
          <PostComments postId={post.id} />
        </div>
      )}
    </div>
  );
};

export default PostCard;
