import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { MapPin, CreditCard, Phone, Clock, Package, Receipt } from "lucide-react";
import OrderTimeline from "@/components/shared/OrderTimeline";
import { STATUS_COLORS } from "@/lib/orderStatuses";
import PageHeader from "@/components/shared/PageHeader";

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.Order.get(id).catch(() => null),
      base44.entities.Payment.filter({ order_id: id }, "-created_date", 1).catch(() => []),
    ]).then(([o, payments]) => {
      setOrder(o);
      setPayment(payments?.[0] || null);
    }).finally(() => setLoading(false));

    const unsub = base44.entities.Order.subscribe(() => {
      base44.entities.Order.get(id).then(setOrder).catch(() => {});
    });
    return unsub;
  }, [id]);

  if (loading) {
    return <div className="max-w-3xl mx-auto px-4 py-12"><div className="animate-pulse h-96 bg-muted rounded-xl" /></div>;
  }

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <Package size={48} className="mx-auto text-muted-foreground/30 mb-4" />
        <h1 className="font-display text-2xl font-bold mb-2">Order Not Found</h1>
        <p className="text-sm text-muted-foreground mb-6">This order doesn't exist or has been removed.</p>
        <Link to="/order-history" className="text-primary hover:underline text-sm">← Back to Orders</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <PageHeader title="Order Details" className="mb-6" />

      {/* Order Header */}
      <div className="rounded-xl border border-border/60 bg-card p-6 shadow-soft mb-6">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <p className="text-[10px] font-mono text-muted-foreground">ORDER #{order.id?.slice(-8).toUpperCase()}</p>
            <h1 className="font-display text-2xl font-bold mt-1">{order.customer_name}</h1>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <Clock size={11} /> {new Date(order.created_date).toLocaleString()}
            </p>
          </div>
          <span className={`text-[11px] font-mono tracking-wider px-3 py-1.5 rounded-full ${STATUS_COLORS[order.status] || "bg-gray-100"}`}>
            {order.status}
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2 text-sm">
            <MapPin size={14} className="text-muted-foreground shrink-0" />
            <span className="text-muted-foreground truncate">{order.delivery_zone}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CreditCard size={14} className="text-muted-foreground shrink-0" />
            <span className="text-muted-foreground">{order.payment_method}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Phone size={14} className="text-muted-foreground shrink-0" />
            <span className="text-muted-foreground">{order.customer_phone}</span>
          </div>
          <div className="text-sm text-right">
            <span className="font-bold font-tabular">{order.total_amount?.toLocaleString()} ETB</span>
          </div>
        </div>
      </div>

      {/* Tracking Timeline */}
      <div className="rounded-xl border border-border/60 bg-card p-6 shadow-soft mb-6">
        <h3 className="text-sm font-semibold tracking-widest uppercase mb-6">Delivery Timeline</h3>
        <OrderTimeline order={order} />
        {order.tracking_note && (
          <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/10 text-sm text-primary">
            {order.tracking_note}
          </div>
        )}
      </div>

      {/* Items + Receipt */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-border/60 bg-card p-6 shadow-soft">
          <h3 className="text-sm font-semibold tracking-widest uppercase mb-4">Items</h3>
          <div className="space-y-3">
            {order.items?.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.size && `Size: ${item.size} · `}
                    {item.color && `Color: ${item.color} · `}
                    Qty: {item.quantity}
                  </p>
                </div>
                <span className="font-tabular whitespace-nowrap">{(item.price * item.quantity).toLocaleString()} ETB</span>
              </div>
            ))}
          </div>
          {order.delivery_address && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground font-mono mb-1">Delivery Address</p>
              <p className="text-sm text-muted-foreground">{order.delivery_address}</p>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-border/60 bg-card p-6 shadow-soft">
          <h3 className="text-sm font-semibold tracking-widest uppercase mb-4 flex items-center gap-1.5">
            <Receipt size={14} /> Payment Receipt
          </h3>
          <div className="space-y-2 text-sm">
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
              <span>Delivery Fee</span>
              <span className="font-tabular">{Number(order.delivery_fee || 0).toLocaleString()} ETB</span>
            </div>
            <div className="flex justify-between font-bold pt-2 border-t border-border">
              <span>Final Price</span>
              <span className="font-tabular">{order.total_amount?.toLocaleString()} ETB</span>
            </div>
          </div>
          {payment && (
            <div className="mt-4 pt-4 border-t border-border space-y-2 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Payment Method</span>
                <span>{payment.payment_method}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment Status</span>
                <span className={`font-mono ${payment.payment_status === "Paid" ? "text-green-600" : "text-yellow-600"}`}>
                  {payment.payment_status}
                </span>
              </div>
              {payment.transaction_id && (
                <div className="flex justify-between">
                  <span>Transaction ID</span>
                  <span className="font-mono">{payment.transaction_id}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}