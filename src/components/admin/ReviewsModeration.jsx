import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import StarRating from "@/components/shared/StarRating";
import { Trash2, Search, Star, MessageSquare } from "lucide-react";

export default function ReviewsModeration() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState(0);
  const { toast } = useToast();

  const load = () => {
    setLoading(true);
    base44.entities.Review.list("-created_date", 100)
      .then(setReviews)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    const review = reviews.find(r => r.id === id);
    await base44.entities.Review.delete(id);
    toast({ title: "Review deleted" });
    if (review?.product_id) {
      recomputeProductRating(review.product_id);
    }
    load();
  };

  const recomputeProductRating = async (productId) => {
    try {
      const all = await base44.entities.Review.filter({ product_id: productId });
      const avg = all.length ? all.reduce((s, r) => s + (r.rating || 0), 0) / all.length : 0;
      await base44.entities.Product.update(productId, { rating: Math.round(avg * 10) / 10, review_count: all.length });
    } catch {}
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return reviews.filter(r => {
      const matchSearch = !q ||
        r.product_name?.toLowerCase().includes(q) ||
        r.reviewer_name?.toLowerCase().includes(q) ||
        r.comment?.toLowerCase().includes(q);
      const matchRating = ratingFilter === 0 || r.rating === ratingFilter;
      return matchSearch && matchRating;
    });
  }, [reviews, search, ratingFilter]);

  if (loading) {
    return <div className="animate-pulse h-64 bg-muted rounded-xl" />;
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search reviews..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-muted/40 rounded-lg outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-lg">
          <button onClick={() => setRatingFilter(0)} className={`px-3 py-1 rounded-md text-xs font-medium ${ratingFilter === 0 ? "bg-background shadow-soft" : "text-muted-foreground"}`}>All</button>
          {[5, 4, 3, 2, 1].map(r => (
            <button key={r} onClick={() => setRatingFilter(r)} className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1 ${ratingFilter === r ? "bg-background shadow-soft" : "text-muted-foreground"}`}>
              {r}<Star size={10} className={ratingFilter === r ? "fill-primary text-primary" : ""} />
            </button>
          ))}
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-4">{filtered.length} reviews</p>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-border/60 bg-card p-12 text-center shadow-soft">
          <MessageSquare size={40} className="mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground">No reviews found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(r => (
            <div key={r.id} className="rounded-xl border border-border/60 bg-card p-4 shadow-soft">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">{r.reviewer_name || "Customer"}</span>
                    {r.is_verified_purchase && (
                      <span className="text-[9px] font-mono uppercase tracking-wider bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">Verified</span>
                    )}
                  </div>
                  <StarRating rating={r.rating} showCount={false} size={12} />
                </div>
                <button onClick={() => handleDelete(r.id)} className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-muted rounded-lg transition-colors shrink-0">
                  <Trash2 size={14} />
                </button>
              </div>
              <p className="text-sm text-foreground/80 mb-1">{r.comment || "No written comment"}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{r.product_name || "Unknown product"}</span>
                <span>·</span>
                <span>{new Date(r.created_date).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}