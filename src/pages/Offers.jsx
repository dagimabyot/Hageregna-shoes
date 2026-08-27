import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Flame, TrendingUp, Tag, Sparkles } from "lucide-react";
import ProductCard from "@/components/products/ProductCard";
import PageHero from "@/components/shared/PageHero";

export default function Offers() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("flash");

  useEffect(() => {
    base44.entities.Product.list("-created_date", 100)
      .then(all => {
        setProducts(all.filter(p => p.is_flash_deal || p.is_trending || (p.discount_price && p.discount_price < p.price)));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const tabs = [
    { key: "flash", label: "Flash Deals", icon: Flame, filter: p => p.is_flash_deal },
    { key: "trending", label: "Trending", icon: TrendingUp, filter: p => p.is_trending },
    { key: "discount", label: "On Sale", icon: Tag, filter: p => p.discount_price && p.discount_price < p.price },
  ];

  const activeFilter = tabs.find(t => t.key === activeTab)?.filter || (() => true);
  const filtered = products.filter(activeFilter);

  return (
    <div>
      <PageHero
        eyebrow="Save Big"
        title="Special Offers"
        subtitle="Don't miss out on our flash deals, trending picks, and seasonal discounts — updated regularly."
      />

      <section className="max-w-7xl mx-auto px-4 py-16">
        {/* Tabs */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.key
                  ? "bg-primary text-primary-foreground shadow-soft"
                  : "bg-muted/50 text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon size={15} /> {tab.label}
            </button>
          ))}
        </div>

        {/* Products */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square bg-muted rounded-xl" />
                <div className="h-3 bg-muted rounded mt-3 w-2/3" />
                <div className="h-3 bg-muted rounded mt-2 w-1/3" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 rounded-xl border border-border/60 bg-card shadow-soft">
            <Sparkles size={48} className="mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">No active offers in this category right now.</p>
            <p className="text-sm text-muted-foreground/60 mt-2">Check back soon — new deals are added regularly!</p>
            <Link to="/products" className="text-primary hover:underline text-sm mt-4 inline-block">Browse all products →</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filtered.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>
    </div>
  );
}