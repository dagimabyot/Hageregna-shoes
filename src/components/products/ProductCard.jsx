import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Heart, Star, ShoppingBag } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";

export default function ProductCard({ product }) {
  const { toast } = useToast();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistId, setWishlistId] = useState(null);
  const hasDiscount = product.discount_price && product.discount_price < product.price;
  const discountPercent = hasDiscount ? Math.round((1 - product.discount_price / product.price) * 100) : 0;
  const lowStock = product.stock !== undefined && product.stock <= 3 && product.stock > 0;

  useEffect(() => {
    base44.entities.Wishlist.filter({ product_id: product.id })
      .then(items => {
        if (items.length > 0) {
          setIsWishlisted(true);
          setWishlistId(items[0].id);
        }
      })
      .catch(() => {});
  }, [product.id]);

  const toggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isWishlisted && wishlistId) {
      await base44.entities.Wishlist.delete(wishlistId);
      setIsWishlisted(false);
      setWishlistId(null);
      toast({ title: "Removed from Wishlist ❤️", description: product.name });
    } else {
      const item = await base44.entities.Wishlist.create({
        product_id: product.id,
        product_name: product.name,
        product_image: product.images?.[0] || "",
        product_price: hasDiscount ? product.discount_price : product.price
      });
      setIsWishlisted(true);
      setWishlistId(item.id);
      toast({ title: "Added to Wishlist ❤️", description: product.name });
    }
  };

  return (
    <Link to={`/product/${product.id}`} className="group block rounded-xl overflow-hidden bg-card border border-border/60 hover:shadow-soft-lg hover:-translate-y-1 transition-all duration-300">
      <div className="relative overflow-hidden bg-[#EDEBE6] aspect-square">
        {product.images?.[0] ? (
          <img src={product.images[0]} alt={product.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#4A4A4A]/30">
            <ShoppingBag size={40} />
          </div>
        )}

        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {hasDiscount && (
            <span className="bg-primary text-primary-foreground text-[10px] font-mono tracking-wider px-2.5 py-1 rounded-full">-{discountPercent}%</span>
          )}
          {product.material && (
            <span className="bg-foreground/80 text-background text-[9px] font-mono tracking-wider px-2.5 py-1 rounded-full backdrop-blur-sm">{product.material}</span>
          )}
        </div>

        <button
          onClick={toggleWishlist}
          className={`absolute top-3 right-3 p-2 bg-background/80 backdrop-blur rounded-xl transition-all hover:scale-110 ${isWishlisted ? "text-red-500" : "text-foreground"}`}
        >
          <Heart size={14} strokeWidth={1.5} className={isWishlisted ? "fill-red-500 text-red-500" : ""} />
        </button>

        {lowStock && (
          <div className="absolute bottom-3 left-3">
            <span className="text-[10px] font-mono tracking-wider text-primary bg-background/90 backdrop-blur px-2.5 py-1 rounded-full">Only {product.stock} left</span>
          </div>
        )}
      </div>

      <div className="p-3.5">
        <p className="text-[11px] tracking-widest uppercase text-muted-foreground font-mono mb-1">{product.category}</p>
        <h3 className="text-sm font-medium text-foreground leading-snug mb-2 line-clamp-2">{product.name}</h3>
        <div className="flex items-center gap-2">
          <span className="text-base font-bold font-tabular text-foreground">
            {(hasDiscount ? product.discount_price : product.price)?.toLocaleString()} ETB
          </span>
          {hasDiscount && (
            <span className="text-xs text-muted-foreground line-through font-tabular">{product.price?.toLocaleString()} ETB</span>
          )}
        </div>
        {product.rating > 0 && (
          <div className="flex items-center gap-1 mt-1.5">
            <Star size={12} className="fill-primary text-primary" />
            <span className="text-xs text-muted-foreground font-tabular">{product.rating.toFixed(1)}</span>
            {product.review_count > 0 && <span className="text-xs text-muted-foreground/70">({product.review_count})</span>}
          </div>
        )}
      </div>
    </Link>
  );
}