import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Zap, ArrowRight, Flame } from "lucide-react";
import { base44 } from "@/api/base44Client";
import ProductCard from "@/components/products/ProductCard";

function useCountdown(targetTs) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const diff = Math.max(0, targetTs - now);
  const h = String(Math.floor(diff / 3600000)).padStart(2, "0");
  const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, "0");
  const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, "0");
  return { h, m, s, expired: diff === 0 };
}

export default function FlashDeals() {
  const [deals, setDeals] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch active flash deals from the FlashDeal entity (admin-managed)
    base44.entities.FlashDeal.filter({ is_active: true })
      .then(async (allDeals) => {
        const now = new Date();
        // Only show deals that have started and haven't ended
        const active = allDeals.filter(d => {
          const start = new Date(d.start_date);
          const end = new Date(d.end_date);
          return start <= now && end > now;
        });

        // Auto-expire ended deals: update is_active to false and remove discount from product
        const expired = allDeals.filter(d => d.is_active && new Date(d.end_date) <= now);
        if (expired.length > 0) {
          for (const d of expired) {
            await base44.entities.FlashDeal.update(d.id, { is_active: false }).catch(() => {});
            // Restore original price (remove discount_price) on the product
            if (d.original_price) {
              await base44.entities.Product.update(d.product_id, {
                discount_price: null,
                is_flash_deal: false,
              }).catch(() => {});
            }
          }
        }

        // Build product objects with deal pricing applied
        const productIds = active.map(d => d.product_id);
        let productRecords = [];
        if (productIds.length > 0) {
          productRecords = await base44.entities.Product.list("-created_date", 50).catch(() => []);
          productRecords = productRecords.filter(p => productIds.includes(p.id));
        }

        // Merge deal info into product for display
        const merged = productRecords.map(p => {
          const deal = active.find(d => d.product_id === p.id);
          if (deal) {
            return {
              ...p,
              price: deal.original_price || p.price,
              discount_price: deal.deal_price,
              is_flash_deal: true,
            };
          }
          return p;
        }).filter(p => active.find(d => d.product_id === p.id));

        setDeals(active);
        setProducts(merged);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Use the soonest-ending deal's end time for the countdown
  const nextEnd = deals.length > 0
    ? Math.min(...deals.map(d => new Date(d.end_date).getTime()))
    : 0;
  const { h, m, s, expired } = useCountdown(nextEnd);

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-br from-[#0F0820] via-[#1A0B3D] to-[#0D1B3E]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="animate-pulse aspect-square bg-white/5 rounded-2xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Hide section if no active deals or countdown expired
  if (products.length === 0 || expired) return null;

  return (
    <section className="py-16 bg-gradient-to-br from-[#0F0820] via-[#1A0B3D] to-[#0D1B3E] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
              <Flame size={14} className="text-orange-400 animate-pulse" />
              <span className="text-[10px] tracking-[0.3em] uppercase text-white font-mono">Limited Time</span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white">Flash Deals</h2>
            <p className="text-white/70 text-sm mt-1">Grab them before they're gone</p>
          </div>

          <div className="flex items-center gap-3">
            <Zap size={16} className="text-amber-400" />
            <div className="flex items-center gap-2">
              {[
                { val: h, label: "HRS" },
                { val: m, label: "MIN" },
                { val: s, label: "SEC" },
              ].map((unit, i) => (
                <React.Fragment key={i}>
                  <div className="bg-white/10 backdrop-blur-md rounded-xl px-4 py-2.5 text-center min-w-[60px] border border-white/20 shadow-lg">
                    <p className="text-white font-bold text-xl font-tabular leading-none">{unit.val}</p>
                    <p className="text-white/50 text-[9px] font-mono mt-1">{unit.label}</p>
                  </div>
                  {i < 2 && <span className="text-white/60 font-bold text-lg">:</span>}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map(p => (
            <div key={p.id} className="rounded-xl overflow-hidden bg-white shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300">
              <ProductCard product={p} />
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link to="/products?filter=flash_deal" className="inline-flex items-center gap-2 bg-white text-[#1A0B3D] px-8 py-3 rounded-full text-sm tracking-widest uppercase font-medium hover:bg-white/90 hover:scale-105 transition-all shadow-lg">
            View All Deals <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}