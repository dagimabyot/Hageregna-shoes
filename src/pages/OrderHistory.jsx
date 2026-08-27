import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Package, Clock, ChevronRight, Receipt, MapPin, CreditCard } from "lucide-react";
import OrderTimeline from "@/components/shared/OrderTimeline";
import PageHero from "@/components/shared/PageHero";
import { STATUS_COLORS } from "@/lib/orderStatuses";

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    base44.entities.Order.list("-created_date", 50)
      .then(setOrders)
      .catch(() => {})
      .finally(() => setLoading(false));

    const unsub = base44.entities.Order.subscribe(() => {
      base44.entities.Order.list("-created_date", 50).then(setOrders).catch(() => {});
    });
    return unsub;
  }, []);

  if (loading) {
    return <div className="max-w-4xl mx-auto px-4 py-12"><div className="animate-pulse h-96 bg-muted rounded-xl" /></div>;
  }

  return (
    <div>
      <PageHero eyebrow="My Orders" title="Order History" subtitle="View your past orders, track current deliveries, and access receipts." />

      <section className="max-w-4xl mx-auto px-4 py-16">
        {orders.length === 0 ? (
          <div className="text-center py-16 rounded-xl border border-border/60 bg-card shadow-soft">
            <Package size={48} className="mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground mb-2">No orders yet</p>
            <Link to="/products" className="text-primary hover:underline text-sm">Start Shopping →</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => {
              const isOpen = expanded === order.id;
              return (
                <div key={order.id} className="rounded-xl border border-border/60 bg-card shadow-soft overflow-hidden">
                  <button
                    onClick={() => setExpanded(isOpen ? null : order.id)}
                    className="w-full p-5 text-left hover:bg-muted/20 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <p className="text-[10px] font-mono text-muted-foreground">#{order.id?.slice(-8).toUpperCase()}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <Clock size={11} /> {new Date(order.created_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-[10px] font-mono tracking-wider px-2.5 py-1 rounded-full ${STATUS_COLORS[order.status] || "bg-gray-100"}`}>
                          {order.status}
                        </span>
                        <ChevronRight size={16} className={`text-muted-foreground transition-transform ${isOpen ? "rotate-90" : ""}`} />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {order.items?.length} item{order.items?.length !== 1 ? "s" : ""} · {order.delivery_zone}
                        </p>
                        <p className="text-xs text-muted-foreground">{order.items?.map(i => i.name).join(", ")}</p>
                      </div>
                      <span className="font-bold font-tabular text-lg shrink-0 ml-4">{order.total_amount?.toLocaleString()} ETB</span>
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 border-t border-border bg-muted/10">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                        {/* Timeline */}
                        <div>
                          <h4 className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground font-mono mb-4">Tracking Timeline</h4>
                          <OrderTimeline order={order} />
                        </div>

                        {/* Receipt */}
                        <div>
                          <h4 className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground font-mono mb-4 flex items-center gap-1.5">
                            <Receipt size={12} /> Order Receipt
                          </h4>
                          <div className="rounded-lg border border-border/60 p-4 bg-card space-y-3">
                            <div className="space-y-1">
                              {order.items?.map((item, i) => (
                                <div key={i} className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">{item.name} × {item.quantity}</span>
                                  <span className="font-tabular">{(item.price * item.quantity).toLocaleString()} ETB</span>
                                </div>
                              ))}
                            </div>
                            <div className="border-t border-border pt-2 space-y-1 text-sm">
                              <div className="flex justify-between text-muted-foreground">
                                <span>Original Price</span>
                                <span className="font-tabular">{order.subtotal ? order.subtotal.toLocaleString() : (order.total_amount - (order.delivery_fee || 0) + (order.coupon_discount || 0)).toLocaleString()} ETB</span>
                              </div>
                              {order.coupon_discount > 0 && (
                                <div className="flex justify-between text-green-600">
                                  <span>Discount ({order.coupon_code})</span>
                                  <span className="font-tabular">-{Number(order.coupon_discount || 0).toLocaleString()} ETB</span>
                                </div>
                              )}
                              <div className="flex justify-between text-muted-foreground">
                                <span>Delivery</span>
                                <span className="font-tabular">{Number(order.delivery_fee || 0).toLocaleString()} ETB</span>
                              </div>
                              <div className="flex justify-between font-bold pt-1 border-t border-border">
                                <span>Final Price</span>
                                <span className="font-tabular">{order.total_amount?.toLocaleString()} ETB</span>
                              </div>
                            </div>
                            <div className="border-t border-border pt-2 space-y-1 text-xs text-muted-foreground">
                              <div className="flex items-center gap-2"><CreditCard size={11} /> {order.payment_method}</div>
                              {order.transaction_reference && <p className="font-mono">Ref: {order.transaction_reference}</p>}
                              {order.delivery_address && (
                                <div className="flex items-start gap-2"><MapPin size={11} className="mt-0.5" /> {order.delivery_address}</div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}