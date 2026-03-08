import { Star } from "lucide-react";
import { useState } from "react";

interface StarRatingProps {
  rating: number;
  onRate?: (rating: number) => void;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
}

const sizeMap = { sm: "h-3.5 w-3.5", md: "h-5 w-5", lg: "h-6 w-6" };

const StarRating = ({ rating, onRate, size = "md", interactive = false }: StarRatingProps) => {
  const [hover, setHover] = useState(0);
  const cls = sizeMap[size];

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= (hover || rating);
        return (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            className={`transition-colors ${interactive ? "cursor-pointer" : "cursor-default"}`}
            onClick={() => interactive && onRate?.(star)}
            onMouseEnter={() => interactive && setHover(star)}
            onMouseLeave={() => interactive && setHover(0)}
          >
            <Star
              className={`${cls} transition-colors ${
                filled ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;
