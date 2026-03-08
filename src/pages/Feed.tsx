import { useState, useEffect, useCallback, useRef } from "react";
import Navbar from "@/components/Navbar";
import CreatePostForm from "@/components/feed/CreatePostForm";
import PostCard, { type PostData } from "@/components/feed/PostCard";
import { Newspaper } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const PAGE_SIZE = 20;

const Feed = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const observerRef = useRef<HTMLDivElement>(null);

  const fetchPosts = useCallback(async (pageNum: number, append = false) => {
    if (!user) return;
    try {
      const from = pageNum * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data: postsData, error } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) throw error;
      const postsArr = postsData ?? [];
      if (postsArr.length < PAGE_SIZE) setHasMore(false);

      // Get author profiles
      const userIds = [...new Set(postsArr.map((p: any) => p.user_id))];
      let profileMap: Record<string, { name: string; avatar_url: string | null }> = {};
      if (userIds.length > 0) {
        const { data: profiles } = await supabase.from("profiles").select("user_id, name, avatar_url").in("user_id", userIds);
        (profiles ?? []).forEach((p) => { profileMap[p.user_id] = { name: p.name, avatar_url: p.avatar_url }; });
      }

      // Get like counts
      const postIds = postsArr.map((p: any) => p.id);
      let likeCounts: Record<string, number> = {};
      let myLikes: Set<string> = new Set();
      let commentCounts: Record<string, number> = {};

      if (postIds.length > 0) {
        const [likesRes, myLikesRes, commentsRes] = await Promise.all([
          supabase.from("post_likes").select("post_id").in("post_id", postIds),
          supabase.from("post_likes").select("post_id").in("post_id", postIds).eq("user_id", user.id),
          supabase.from("post_comments").select("post_id").in("post_id", postIds),
        ]);

        (likesRes.data ?? []).forEach((l: any) => { likeCounts[l.post_id] = (likeCounts[l.post_id] || 0) + 1; });
        (myLikesRes.data ?? []).forEach((l: any) => myLikes.add(l.post_id));
        (commentsRes.data ?? []).forEach((c: any) => { commentCounts[c.post_id] = (commentCounts[c.post_id] || 0) + 1; });
      }

      const mapped: PostData[] = postsArr.map((p: any) => ({
        id: p.id,
        user_id: p.user_id,
        content: p.content,
        image_url: p.image_url,
        post_type: p.post_type,
        created_at: p.created_at,
        author_name: profileMap[p.user_id]?.name || "Unknown",
        author_avatar: profileMap[p.user_id]?.avatar_url || null,
        like_count: likeCounts[p.id] || 0,
        comment_count: commentCounts[p.id] || 0,
        liked_by_me: myLikes.has(p.id),
      }));

      setPosts(append ? (prev) => [...prev, ...mapped] : mapped);
    } catch (err) {
      console.error("Failed to fetch posts:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchPosts(0); }, [fetchPosts]);

  // Infinite scroll
  useEffect(() => {
    if (!observerRef.current || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage((prev) => {
            const next = prev + 1;
            fetchPosts(next, true);
            return next;
          });
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading, fetchPosts]);

  const handleRefresh = () => {
    setPage(0);
    setHasMore(true);
    setLoading(true);
    fetchPosts(0);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto pt-20 pb-12 px-4 max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-display font-bold flex items-center gap-2">
            <Newspaper className="h-6 w-6 text-primary" /> Community Feed
          </h1>
          <p className="text-sm text-muted-foreground">Share your learning journey with the community</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6">
          <CreatePostForm onPostCreated={handleRefresh} />
        </motion.div>

        {loading && posts.length === 0 ? (
          <div className="text-center py-16">
            <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16">
            <Newspaper className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No posts yet. Be the first to share!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.3) }}
              >
                <PostCard post={post} onRefresh={handleRefresh} />
              </motion.div>
            ))}
            {hasMore && (
              <div ref={observerRef} className="py-8 text-center">
                <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Feed;
