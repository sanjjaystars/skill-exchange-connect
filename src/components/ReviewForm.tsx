import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import StarRating from "./StarRating";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ReviewFormProps {
  sessionId: string;
  reviewerId: string;
  reviewedUserId: string;
  onSubmitted: () => void;
}

const ReviewForm = ({ sessionId, reviewerId, reviewedUserId, onSubmitted }: ReviewFormProps) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) { toast.error("Please select a rating"); return; }
    if (submitting) return;
    setSubmitting(true);

    try {
      const { error } = await supabase.from("reviews").insert({
        session_id: sessionId,
        reviewer_id: reviewerId,
        reviewed_user_id: reviewedUserId,
        rating,
        comment: comment.trim().slice(0, 500),
      });
      if (error) throw error;
      toast.success("Review submitted!");
      onSubmitted();
    } catch (err: any) {
      console.error("Review error:", err);
      toast.error(err.message?.includes("duplicate") ? "You already reviewed this session" : "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border p-4 space-y-3">
      <h4 className="text-sm font-semibold">Rate this session</h4>
      <StarRating rating={rating} onRate={setRating} interactive size="lg" />
      <Textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share your experience... (optional)"
        className="bg-secondary border-border min-h-[80px] text-sm"
        maxLength={500}
      />
      <Button
        onClick={handleSubmit}
        disabled={rating === 0 || submitting}
        size="sm"
        className="rounded-full"
      >
        {submitting ? "Submitting..." : "Submit Review"}
      </Button>
    </div>
  );
};

export default ReviewForm;
