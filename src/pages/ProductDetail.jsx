import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Heart, ShoppingBag, Star, Truck, Shield, ChevronLeft, ChevronRight, Minus, Plus, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import ProductCard from "@/components/products/ProductCard";
import ReviewsSection from "@/components/products/ReviewsSection";
import BackButton from "@/components/shared/BackButton";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [related, setRelated] = useState([]);
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    setLoading(true);
    base44.entities.Product.get(id)
      .then(p => {
        setProduct(p);
        setSelectedSize("");
        setSelectedColor(p.colors?.[0] || "");
        // Track recently viewed in localStorage for dashboard
        try {
          const viewed = JSON.parse(localStorage.getItem("recently_viewed") || "[]");
          const filtered = viewed.filter(item => item.id !== p.id);
          const updated = [{ id: p.id, name: p.name, price: p.discount_price || p.price, image: p.images?.[0] }, ...filtered].slice(0, 8);
          localStorage.setItem("recently_viewed", JSON.stringify(updated));
        } catch {}
        base44.entities.Product.filter({ category: p.category }, '-created_date', 5)
          .then(items => setRelated(items.filter(x => x.id !== id).slice(0, 4)))
          .catch(() => {});
        base44.entities.Wishlist.filter({ product_id: p.id })
          .then(items => setIsWishlisted(items.length > 0))
          .catch(() => {});
      })
      .catch(() => navigate("/products"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-pulse">
          <div className="aspect-square bg-[#0F0F0F]/5" />
          <div className="space-y-4">
            <div className="h-6 bg-[#0F0F0F]/5 w-1/3" />
            <div className="h-8 bg-[#0F0F0F]/5 w-2/3" />
            <div className="h-6 bg-[#0F0F0F]/5 w-1/4" />
          </div>
        </div>
      </div>
    );
  }

  const hasDiscount = product.discount_price && product.discount_price < product.price;
  const currentPrice = hasDiscount ? product.discount_price : product.price;
  const noSize = product.sizes?.length > 0 && !selectedSize;

  const addToCart = async () => {
    if (noSize) {
      toast({ title: "Please select a size first", variant: "destructive" });
      return false;
    }
    await base44.entities.CartItem.create({
      product_id: product.id,
      product_name: product.name,
      product_image: product.images?.[0] || "",
      price: currentPrice,
      size: selectedSize,
      color: selectedColor,
      quantity
    });
    toast({ title: "Added to cart", description: `${product.name} × ${quantity}` });
    return true;
  };

  const buyNow = async () => {
    const ok = await addToCart();
    if (!ok) return;
    navigate("/cart");
  };

  const toggleWishlist = async () => {
    try {
      if (isWishlisted) {
        const items = await base44.entities.Wishlist.filter({ product_id: product.id });
        if (items[0]) await base44.entities.Wishlist.delete(items[0].id);
        setIsWishlisted(false);
        toast({ title: "Removed from wishlist" });
      } else {
        await base44.entities.Wishlist.create({
          product_id: product.id,
          product_name: product.name,
          product_image: product.images?.[0] || "",
          product_price: currentPrice
        });
        setIsWishlisted(true);
        toast({ title: "Added to wishlist" });
      }
    } catch {
      toast({ title: "Failed to update wishlist", variant: "destructive" });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Back + Breadcrumb */}
      <div className="mb-8 flex items-center gap-3 flex-wrap">
        <BackButton />
        <nav className="text-xs text-[#4A4A4A] flex items-center min-w-0 flex-1 overflow-hidden">
          {/* Desktop full breadcrumb */}
          <div className="hidden sm:flex items-center gap-2 whitespace-nowrap overflow-hidden">
            <Link to="/" className="hover:text-[#0F0F0F] shrink-0">Home</Link>
            <span className="text-[#4A4A4A]/40">/</span>
            <Link to="/products" className="hover:text-[#0F0F0F] shrink-0">Shop</Link>
            <span className="text-[#4A4A4A]/40">/</span>
            <Link to={`/products?category=${product.category}`} className="hover:text-[#0F0F0F] shrink-0">{product.category}</Link>
            <span className="text-[#4A4A4A]/40">/</span>
            <span className="text-[#0F0F0F] truncate">{product.name}</span>
          </div>
          {/* Mobile compact breadcrumb */}
          <div className="sm:hidden flex items-center gap-1.5 whitespace-nowrap overflow-hidden">
            <Link to={`/products?category=${product.category}`} className="hover:text-[#0F0F0F] shrink-0">{product.category}</Link>
            <ChevronRight size={12} className="shrink-0 text-[#4A4A4A]/50" />
            <span className="text-[#0F0F0F] truncate">{product.name}</span>
          </div>
        </nav>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Images */}
        <div>
          <div className="aspect-square overflow-hidden rounded-xl bg-[#EDEBE6] mb-3">
            {product.images?.[selectedImage] ? (
              <img src={product.images[selectedImage]} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#4A4A4A]/30"><ShoppingBag size={60} /></div>
            )}
          </div>
          {product.images?.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setSelectedImage(i)} className={`w-20 h-20 shrink-0 overflow-hidden rounded-xl border-2 transition-colors ${i === selectedImage ? "border-[#0F0F0F]" : "border-transparent"}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product info */}
        <div>
          <span className="text-[11px] tracking-[0.3em] uppercase text-[#B34B2D] font-mono">{product.category}</span>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-[#0F0F0F] mt-2 mb-4">{product.name}</h1>

          {/* Rating */}
          {product.rating > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(s => <Star key={s} size={14} className={s <= product.rating ? "fill-[#B34B2D] text-[#B34B2D]" : "text-[#0F0F0F]/20"} />)}
              </div>
              <span className="text-sm text-[#4A4A4A]">{product.rating.toFixed(1)} ({product.review_count || 0} reviews)</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-6 pb-6 border-b border-[#0F0F0F]/10">
            <span className="text-3xl font-bold font-tabular text-[#0F0F0F]">{currentPrice?.toLocaleString()} ETB</span>
            {hasDiscount && (
              <>
                <span className="text-lg text-[#4A4A4A]/50 line-through font-tabular">{product.price?.toLocaleString()} ETB</span>
                <span className="bg-[#B34B2D] text-white text-[10px] font-mono px-2 py-0.5 rounded-lg">-{Math.round((1 - product.discount_price / product.price) * 100)}%</span>
              </>
            )}
          </div>

          {/* Description */}
          {product.description && <p className="text-sm text-[#4A4A4A] leading-relaxed mb-6">{product.description}</p>}

          {/* Material & Comfort */}
          <div className="grid grid-cols-2 gap-4 mb-6 p-4 rounded-xl border border-[#0F0F0F]/10 bg-white">
            <div>
              <p className="text-[10px] tracking-[0.2em] uppercase text-[#4A4A4A]/60 font-mono mb-1">Material</p>
              <p className="text-sm font-medium">{product.material || "—"}</p>
            </div>
            <div>
              <p className="text-[10px] tracking-[0.2em] uppercase text-[#4A4A4A]/60 font-mono mb-1">Comfort Type</p>
              <p className="text-sm font-medium">{product.comfort_type || "—"}</p>
            </div>
          </div>

          {/* Size */}
          {product.sizes?.length > 0 && (
            <div className="mb-6">
              <p className="text-[11px] tracking-[0.2em] uppercase text-[#4A4A4A] font-mono mb-3">Size (EU)</p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map(s => (
                  <button key={s} onClick={() => setSelectedSize(s)} className={`w-12 h-12 text-sm border rounded-xl transition-colors ${selectedSize === s ? "bg-[#0F0F0F] text-[#F7F5F0] border-[#0F0F0F]" : "border-[#0F0F0F]/20 hover:border-[#0F0F0F]"}`}>
                    {s}
                  </button>
                ))}
              </div>
              {noSize && <p className="text-xs text-[#B34B2D] mt-2">Please select a size to continue.</p>}
            </div>
          )}

          {/* Color */}
          {product.colors?.length > 0 && (
            <div className="mb-6">
              <p className="text-[11px] tracking-[0.2em] uppercase text-[#4A4A4A] font-mono mb-3">Color: {selectedColor}</p>
              <div className="flex flex-wrap gap-2">
                {product.colors.map(c => (
                  <button key={c} onClick={() => setSelectedColor(c)} className={`px-4 py-2 text-sm border rounded-xl transition-colors ${selectedColor === c ? "bg-[#0F0F0F] text-[#F7F5F0] border-[#0F0F0F]" : "border-[#0F0F0F]/20 hover:border-[#0F0F0F]"}`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity & Like */}
          <div className="mb-6">
            <p className="text-[11px] tracking-[0.2em] uppercase text-[#4A4A4A] font-mono mb-3">Quantity</p>
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-[#0F0F0F]/20 rounded-xl overflow-hidden">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 hover:bg-[#0F0F0F]/5"><Minus size={14} /></button>
                <span className="w-12 text-center text-sm font-tabular">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="p-3 hover:bg-[#0F0F0F]/5"><Plus size={14} /></button>
              </div>
              <button onClick={toggleWishlist} className={`flex items-center justify-center w-12 h-12 border rounded-xl transition-colors shrink-0 ${isWishlisted ? "border-red-500 bg-red-50 hover:bg-red-100" : "border-[#0F0F0F]/20 hover:border-[#0F0F0F] hover:bg-[#0F0F0F]/5"}`} aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}>
                <Heart size={18} className={isWishlisted ? "fill-red-500 text-red-500" : "text-[#0F0F0F]"} />
              </button>
            </div>
          </div>

          {/* Stock */}
          <div className="mb-6">
            {product.stock > 0 ? (
              <div className="flex items-center gap-2 text-sm">
                <Check size={14} className="text-green-600" />
                <span className="text-green-700">In stock</span>
                {product.stock <= 5 && <span className="text-[#B34B2D] text-xs font-mono">· Only {product.stock} left</span>}
              </div>
            ) : (
              <span className="text-sm text-[#B34B2D]">Out of stock</span>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <button onClick={addToCart} disabled={product.stock <= 0} className={`flex-1 flex items-center justify-center gap-2 bg-[#0F0F0F] text-[#F7F5F0] py-4 text-sm tracking-widest uppercase font-medium rounded-xl transition-colors disabled:opacity-40 ${noSize ? "opacity-40 cursor-not-allowed hover:bg-[#0F0F0F]" : "hover:bg-[#0F0F0F]/90"}`}>
              <ShoppingBag size={16} /> Add to Cart
            </button>
            <button onClick={buyNow} disabled={product.stock <= 0} className={`flex-1 flex items-center justify-center gap-2 bg-[#B34B2D] text-[#F7F5F0] py-4 text-sm tracking-widest uppercase font-medium rounded-xl transition-colors disabled:opacity-40 ${noSize ? "opacity-40 cursor-not-allowed hover:bg-[#B34B2D]" : "hover:bg-[#9A3F25]"}`}>
              Buy Now
            </button>
          </div>

          {/* Delivery info */}
          <div className="border border-[#0F0F0F]/10 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-3">
              <Truck size={16} className="text-[#B34B2D]" />
              <div>
                <p className="text-sm font-medium">Delivery in Addis Ababa</p>
                <p className="text-xs text-[#4A4A4A]">Same-day in Bole · 1-2 days citywide</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Shield size={16} className="text-[#B34B2D]" />
              <div>
                <p className="text-sm font-medium">Quality Guarantee</p>
                <p className="text-xs text-[#4A4A4A]">Verified genuine materials · 7-day returns</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ReviewsSection product={product} />

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-16 pt-12 border-t border-[#0F0F0F]/10">
          <h2 className="font-display text-2xl font-bold text-[#0F0F0F] mb-8">You Might Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {related.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}