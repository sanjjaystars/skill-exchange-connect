import StarRating from "./StarRating";
import { formatDistanceToNow } from "date-fns";

interface ReviewCardProps {
  reviewerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

const ReviewCard = ({ reviewerName, rating, comment, createdAt }: ReviewCardProps) => (
  <div className="bg-secondary/50 rounded-xl border border-border p-4">
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-2">
        <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
          {reviewerName?.[0] ?? "?"}
        </div>
        <span className="text-sm font-medium">{reviewerName}</span>
      </div>
      <span className="text-[10px] text-muted-foreground">
        {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
      </span>
    </div>
    <StarRating rating={rating} size="sm" />
    {comment && <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{comment}</p>}
  </div>
);

export default ReviewCard;
