import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { base44 } from "@/api/base44Client";
import ProductCard from "@/components/products/ProductCard";
import ProductSlider from "@/components/home/ProductSlider";

export default function BestSellers() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Product.list("-created_date", 50)
      .then((res) => {
        const sorted = (res || []).sort((a, b) => (b.sold_quantity || 0) - (a.sold_quantity || 0));
        const best = sorted.filter(p => p.is_best_seller && p.is_active !== false).slice(0, 8);
        setProducts(best.length >= 4 ? best : sorted.filter(p => p.is_active !== false).slice(0, 8));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="max-w-[1500px] mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="animate-pulse">
              <div className="aspect-square bg-[#0F0F0F]/5 rounded-sm" />
              <div className="h-3 bg-[#0F0F0F]/5 rounded mt-3 w-2/3" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="max-w-[1500px] mx-auto px-4 py-12 md:py-16">
      <div className="flex items-end justify-between mb-8 md:mb-10">
        <div>
          <span className="text-[11px] tracking-[0.3em] uppercase text-[#B34B2D] font-mono block mb-2">Most Loved</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-[#0F0F0F]">Best Sellers</h2>
        </div>
        <Link to="/products?sort=best_selling" className="text-[12px] tracking-widest uppercase text-[#4A4A4A] hover:text-[#B34B2D] transition-colors flex items-center gap-1 whitespace-nowrap">
          See All <ArrowUpRight size={14} />
        </Link>
      </div>

      <ProductSlider>
        {products.map(p => <ProductCard key={p.id} product={p} />)}
      </ProductSlider>
    </section>
  );
}