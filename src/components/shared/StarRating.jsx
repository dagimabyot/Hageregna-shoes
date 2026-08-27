import { Star } from "lucide-react";

export default function StarRating({ rating = 0, count, size = 14, showCount = true, className = "" }) {
  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(s => (
          <Star
            key={s}
            size={size}
            className={s <= Math.round(rating) ? "fill-primary text-primary" : "text-foreground/15"}
          />
        ))}
      </div>
      {rating > 0 && <span className="text-xs text-muted-foreground font-tabular">{rating.toFixed(1)}</span>}
      {showCount && count !== undefined && count > 0 && (
        <span className="text-xs text-muted-foreground/70">({count})</span>
      )}
    </div>
  );
}