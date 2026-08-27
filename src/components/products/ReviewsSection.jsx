import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import StarRating from "@/components/shared/StarRating";
import { Star, CheckCircle2, MessageSquare } from "lucide-react";

const SORT_OPTIONS = [
  { key: "newest", label: "Newest" },
  { key: "highest", label: "Highest Rating" },
  { key: "lowest", label: "Lowest Rating" },
];

export default function ReviewsSection({ product }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("newest");
  const [form, setForm] = useState({ rating: 5, comment: "" });
  const [submitting, setSubmitting] = useState(false);

  const loadReviews = () => {
    base44.entities.Review.filter({ product_id: product.id })
      .then(setReviews)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    setLoading(true);
    loadReviews();
  }, [product.id]);

  const sorted = useMemo(() => {
    const copy = [...reviews];
    if (sort === "newest") return copy.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    if (sort === "highest") return copy.sort((a, b) => b.rating - a.rating);
    if (sort === "lowest") return copy.sort((a, b) => a.rating - b.rating);
    return copy;
  }, [reviews, sort]);

  const avgRating = reviews.length ? reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length : 0;

  const recomputeProductRating = async () => {
    try {
      const all = await base44.entities.Review.filter({ product_id: product.id });
      const avg = all.length ? all.reduce((s, r) => s + (r.rating || 0), 0) / all.length : 0;
      await base44.entities.Product.update(product.id, {
        rating: Math.round(avg * 10) / 10,
        review_count: all.length,
      });
    } catch {}
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Please sign in to leave a review", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      await base44.entities.Review.create({
        product_id: product.id,
        product_name: product.name,
        user_id: user?.id,
        reviewer_name: user?.full_name || user?.email || "Customer",
        rating: form.rating,
        comment: form.comment,
        is_verified_purchase: true,
      });
      setForm({ rating: 5, comment: "" });
      loadReviews();
      recomputeProductRating();
      toast({ title: "Review submitted successfully" });
    } catch {
      toast({ title: "Failed to submit review", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mt-16 pt-12 border-t border-foreground/10">
      <h2 className="font-display text-2xl font-bold text-foreground mb-6">Customer Reviews</h2>

      {/* Summary */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8 p-5 rounded-xl bg-muted/30 border border-border/60">
        <div className="text-center sm:text-left">
          <p className="text-4xl font-bold font-tabular text-foreground">{avgRating.toFixed(1)}</p>
          <StarRating rating={avgRating} showCount={false} size={16} className="mt-1" />
          <p className="text-xs text-muted-foreground mt-1">{reviews.length} review{reviews.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex-1 w-full space-y-1.5">
          {[5, 4, 3, 2, 1].map(star => {
            const count = reviews.filter(r => Math.round(r.rating) === star).length;
            const pct = reviews.length ? (count / reviews.length) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-2 text-xs">
                <span className="w-3 text-muted-foreground">{star}</span>
                <Star size={10} className="fill-primary text-primary" />
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-6 text-right text-muted-foreground font-tabular">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sort */}
      {reviews.length > 0 && (
        <div className="flex items-center gap-2 mb-6">
          <span className="text-xs text-muted-foreground">Sort by:</span>
          <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-lg">
            {SORT_OPTIONS.map(o => (
              <button
                key={o.key}
                onClick={() => setSort(o.key)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${sort === o.key ? "bg-background text-foreground shadow-soft" : "text-muted-foreground hover:text-foreground"}`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Reviews list */}
      {loading ? (
        <div className="space-y-4 mb-8">
          {[1, 2, 3].map(i => <div key={i} className="animate-pulse h-20 bg-muted/40 rounded-lg" />)}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 mb-8">
          <MessageSquare size={40} className="mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground">No reviews yet. Be the first to review this product.</p>
        </div>
      ) : (
        <div className="space-y-5 mb-10">
          {sorted.map(r => (
            <div key={r.id} className="border-b border-border/60 pb-5">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold shrink-0">
                  {(r.reviewer_name || "C").charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{r.reviewer_name || "Customer"}</span>
                    {r.is_verified_purchase && (
                      <span className="flex items-center gap-0.5 text-[9px] font-mono uppercase tracking-wider bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">
                        <CheckCircle2 size={9} /> Verified Buyer
                      </span>
                    )}
                  </div>
                  <StarRating rating={r.rating} showCount={false} size={11} />
                </div>
                <span className="text-xs text-muted-foreground ml-auto">{new Date(r.created_date).toLocaleDateString()}</span>
              </div>
              {r.comment && <p className="text-sm text-foreground/80 leading-relaxed">{r.comment}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Review form — shown to logged-in users without any restriction messages */}
      {user && (
        <div className="max-w-lg">
          <form onSubmit={submit} className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground mb-2">Your Rating</p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(s => (
                  <button key={s} type="button" onClick={() => setForm(f => ({ ...f, rating: s }))}>
                    <Star size={24} className={s <= form.rating ? "fill-primary text-primary" : "text-foreground/20"} />
                  </button>
                ))}
              </div>
            </div>
            <textarea
              value={form.comment}
              onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
              placeholder="Share your experience with this product..."
              rows={3}
              className="w-full border border-border p-3 text-sm outline-none resize-none focus:border-primary rounded-lg transition-colors"
            />
            <button type="submit" disabled={submitting} className="bg-foreground text-background px-6 py-2.5 text-sm tracking-widest uppercase font-medium hover:bg-foreground/90 disabled:opacity-50 rounded-lg transition-colors">
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        </div>
      )}
    </section>
  );
}