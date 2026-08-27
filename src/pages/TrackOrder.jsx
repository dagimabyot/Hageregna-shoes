import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Search, Package, MapPin, CreditCard, Phone, ArrowRight } from "lucide-react";
import OrderTimeline from "@/components/shared/OrderTimeline";
import PageHero from "@/components/shared/PageHero";
import { STATUS_COLORS } from "@/lib/orderStatuses";

export default function TrackOrder() {
  const [orderId, setOrderId] = useState("");
  const [order, setOrder] = useState(null);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!orderId.trim()) return;
    setSearching(true);
    setError("");
    setOrder(null);
    try {
      const result = await base44.entities.Order.get(orderId.trim());
      setOrder(result);
    } catch {
      setError("Order not found. Please check your Order ID and try again.");
    } finally {
      setSearching(false);
    }
  };

  return (
    <div>
      <PageHero
        eyebrow="Track Your Order"
        title="Track Order"
        subtitle="Enter your order ID below to see the current status and delivery timeline of your order."
      />

      <section className="max-w-2xl mx-auto px-4 py-16">
        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-3 mb-8">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={orderId}
              onChange={e => setOrderId(e.target.value)}
              placeholder="Enter your Order ID (e.g. 6a4e1d40...)"
              className="w-full pl-10 pr-4 py-3 border border-border rounded-lg text-sm outline-none focus:border-primary transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={searching}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            {searching ? "Searching..." : "Track"} <ArrowRight size={15} />
          </button>
        </form>

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
            <Package size={40} className="mx-auto text-destructive/40 mb-3" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Result */}
        {order && (
          <div className="space-y-6">
            {/* Order header */}
            <div className="rounded-xl border border-border/60 bg-card p-6 shadow-soft">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <p className="text-[10px] font-mono text-muted-foreground">ORDER #{order.id?.slice(-8).toUpperCase()}</p>
                  <p className="font-display text-xl font-bold mt-1">{order.customer_name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{new Date(order.created_date).toLocaleString()}</p>
                </div>
                <span className={`text-[11px] font-mono tracking-wider px-3 py-1.5 rounded-full ${STATUS_COLORS[order.status] || "bg-gray-100"}`}>
                  {order.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin size={14} className="text-muted-foreground" />
                  <span className="text-muted-foreground">{order.delivery_zone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CreditCard size={14} className="text-muted-foreground" />
                  <span className="text-muted-foreground">{order.payment_method}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone size={14} className="text-muted-foreground" />
                  <span className="text-muted-foreground">{order.customer_phone}</span>
                </div>
                <div className="text-sm text-right">
                  <span className="font-bold font-tabular">{order.total_amount?.toLocaleString()} ETB</span>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="rounded-xl border border-border/60 bg-card p-6 shadow-soft">
              <h3 className="text-sm font-semibold tracking-widest uppercase mb-6">Delivery Timeline</h3>
              <OrderTimeline order={order} />
            </div>

            {/* Items */}
            <div className="rounded-xl border border-border/60 bg-card p-6 shadow-soft">
              <h3 className="text-sm font-semibold tracking-widest uppercase mb-4">Items in Order</h3>
              <div className="space-y-2">
                {order.items?.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{item.name} × {item.quantity}</span>
                    <span className="font-tabular">{(item.price * item.quantity).toLocaleString()} ETB</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!order && !error && !searching && (
          <div className="text-center py-16 rounded-xl border border-border/60 bg-card shadow-soft">
            <Search size={48} className="mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">Enter your order ID to track your delivery</p>
            <p className="text-xs text-muted-foreground/60 mt-2">You can find your Order ID in your order confirmation or account dashboard</p>
          </div>
        )}
      </section>
    </div>
  );
}