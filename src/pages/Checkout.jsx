import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { Shield, Truck, Check, ShoppingBag, MapPin, Ticket, X, Tag } from "lucide-react";
import PaymentMethodSelector from "@/components/checkout/PaymentMethodSelector";
import { generateOrderConfirmationEmail, sendEmailWithLog } from "@/lib/emailTemplates";
import PageHeader from "@/components/shared/PageHeader";

const ADMIN_EMAIL = "info@hageregna.com";
const MERCHANT_PHONE = "+251 911 000 000";

export default function Checkout() {
  const [items, setItems] = useState([]);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState(null);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    zone: "",
    address: "",
    payment: "Cash on Delivery",
    transaction_reference: ""
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Full name is required";
    else if (form.name.trim().length < 2) e.name = "Enter a valid name";
    if (!form.phone.trim()) e.phone = "Phone number is required";
    else if (!/^[0-9+\s-]{7,15}$/.test(form.phone.trim())) e.phone = "Enter a valid phone number";
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = "Enter a valid email address";
    if (!form.zone) e.zone = "Please select a delivery zone";
    if (!form.address.trim()) e.address = "Delivery address is required";
    if (form.payment !== "Cash on Delivery" && !form.transaction_reference.trim()) e.transaction_reference = "Transaction reference is required for mobile payment";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  useEffect(() => {
    Promise.all([
      base44.entities.CartItem.list().catch(() => []),
      base44.entities.DeliveryZone.list("-created_date", 50).catch(() => []),
      base44.auth.me().catch(() => null),
    ]).then(([cartItems, z, u]) => {
      setItems(cartItems);
      setZones(z.filter(x => x.is_active !== false));
      if (u) {
        setForm(f => ({
          ...f,
          name: u.full_name || f.name,
          phone: u.phone || f.phone,
          email: u.email || f.email,
          address: u.address || u.addresses?.[0]?.detail || f.address,
        }));
      }
      // Auto-apply coupon saved from cart
      const savedCoupon = localStorage.getItem("hageregna_coupon");
      if (savedCoupon) {
        try { setAppliedCoupon(JSON.parse(savedCoupon)); } catch {}
      }
    }).finally(() => setLoading(false));
  }, []);

  const selectedZone = zones.find(z => z.zone_name === form.zone);
  const subtotal = items.reduce((sum, i) => sum + (i.price * i.quantity), 0);
  const deliveryFee = selectedZone?.delivery_fee || 0;

  // Coupon discount calculation
  const couponDiscount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.discount_type === "percentage") {
      return Math.round((subtotal * appliedCoupon.value) / 100);
    }
    if (appliedCoupon.discount_type === "fixed") {
      return Math.min(appliedCoupon.value, subtotal);
    }
    return 0;
  }, [appliedCoupon, subtotal]);

  const isFreeShipping = appliedCoupon?.discount_type === "free_shipping";
  const finalDeliveryFee = isFreeShipping ? 0 : deliveryFee;
  const total = subtotal - couponDiscount + finalDeliveryFee;

  const applyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const coupons = await base44.entities.Coupon.filter({ code: couponCode.trim().toUpperCase() });
      if (coupons.length === 0) {
        toast({ title: "Invalid coupon code", description: "This coupon does not exist.", variant: "destructive" });
        setAppliedCoupon(null);
        return;
      }
      const coupon = coupons[0];
      if (coupon.is_active === false) {
        toast({ title: "Invalid coupon", description: "This coupon is no longer active.", variant: "destructive" });
        return;
      }
      if (coupon.expiration_date && new Date(coupon.expiration_date) < new Date()) {
        toast({ title: "Invalid coupon", description: "This coupon has expired.", variant: "destructive" });
        return;
      }
      if (coupon.usage_limit > 0 && (coupon.used_count || 0) >= coupon.usage_limit) {
        toast({ title: "Invalid coupon", description: "This coupon has reached its usage limit.", variant: "destructive" });
        return;
      }
      if (coupon.minimum_order_amount && subtotal < coupon.minimum_order_amount) {
        toast({ title: "Invalid coupon", description: `Minimum order amount of ${coupon.minimum_order_amount.toLocaleString()} ETB required.`, variant: "destructive" });
        return;
      }
      setAppliedCoupon(coupon);
      toast({ title: "Coupon applied!", description: `${coupon.code} — ${coupon.discount_type === "percentage" ? coupon.value + "%" : coupon.discount_type === "fixed" ? coupon.value + " ETB off" : "Free shipping"}` });
    } catch {
      toast({ title: "Failed to apply coupon", variant: "destructive" });
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    localStorage.removeItem("hageregna_coupon");
  };

  const sendOrderEmail = async (order) => {
    // 1. Send branded confirmation email to the customer
    if (form.email) {
      try {
        const settings = await base44.entities.StoreSettings.list().catch(() => []);
        const { subject, html } = generateOrderConfirmationEmail(order, settings[0] || {});
        await sendEmailWithLog({
          to: form.email,
          subject,
          body: html,
          email_type: "order_confirmation",
          order_id: order.id,
        });
      } catch (e) {
        console.error("Customer confirmation email failed", e);
      }
    }

    // 2. Send plain-text admin notification
    const itemsList = items.map(i => `• ${i.product_name} (Size: ${i.size || "-"}, Color: ${i.color || "-"}) × ${i.quantity} — ${(i.price * i.quantity).toLocaleString()} ETB`).join("\n");
    const adminBody = [
      "🛒 NEW ORDER — Hageregna Shoes",
      "",
      `Order ID: #${order.id?.slice(-8).toUpperCase()}`,
      `Date: ${new Date().toLocaleString()}`,
      "",
      "CUSTOMER",
      `Name: ${form.name}`,
      `Phone: ${form.phone}`,
      `Email: ${form.email || "—"}`,
      "",
      "DELIVERY",
      `Zone: ${form.zone}`,
      `Est. Time: ${selectedZone?.estimated_time || "—"}`,
      `Address: ${form.address || "—"}`,
      "",
      "PAYMENT",
      `Method: ${form.payment}`,
      form.transaction_reference ? `Transaction Ref: ${form.transaction_reference}` : "",
      "",
      "ITEMS",
      itemsList,
      "",
      "TOTALS",
      `Subtotal: ${subtotal.toLocaleString()} ETB`,
      appliedCoupon ? `Coupon (${appliedCoupon.code}): -${couponDiscount.toLocaleString()} ETB` : "",
      `Delivery Fee: ${finalDeliveryFee.toLocaleString()} ETB`,
      `Total: ${total.toLocaleString()} ETB`,
    ].join("\n");

    try {
      await base44.integrations.Core.SendEmail({
        to: ADMIN_EMAIL,
        subject: `New Order #${order.id?.slice(-8).toUpperCase()} — ${form.name}`,
        body: adminBody
      });
    } catch (e) {
      console.error("Admin order email failed", e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast({ title: "Please correct the highlighted fields", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      // Calculate estimated delivery date (2 days from now)
      const estDelivery = new Date();
      estDelivery.setDate(estDelivery.getDate() + 2);
      const estDeliveryDate = estDelivery.toISOString().split("T")[0];

      const order = await base44.entities.Order.create({
        customer_name: form.name,
        customer_email: form.email,
        customer_phone: form.phone,
        items: items.map(i => ({ product_id: i.product_id, name: i.product_name, size: i.size, color: i.color, quantity: i.quantity, price: i.price })),
        subtotal: subtotal,
        total_amount: total,
        delivery_fee: finalDeliveryFee,
        coupon_code: appliedCoupon?.code || "",
        coupon_discount: couponDiscount,
        delivery_zone: form.zone,
        delivery_address: form.address,
        payment_method: form.payment,
        transaction_reference: form.transaction_reference,
        estimated_delivery_date: estDeliveryDate,
        status: "Order Placed",
        status_history: [{ status: "Order Placed", timestamp: new Date().toISOString() }]
      });

      // Increment coupon usage
      if (appliedCoupon) {
        await base44.entities.Coupon.update(appliedCoupon.id, {
          used_count: (appliedCoupon.used_count || 0) + 1
        }).catch(() => {});
      }

      await base44.entities.Payment.create({
        order_id: order.id,
        customer_name: form.name,
        amount: total,
        payment_method: form.payment,
        payment_status: "Pending",
        transaction_id: form.transaction_reference || "",
      }).catch(() => {});

      await base44.entities.Notification.create({
        title: "Order Placed Successfully",
        message: `Your order #${order.id?.slice(-8).toUpperCase()} for ${total.toLocaleString()} ETB has been placed. We'll notify you when it's approved.`,
        type: "order",
        order_id: order.id,
        is_read: false,
      }).catch(() => {});

      await sendOrderEmail(order);

      for (const item of items) {
        await base44.entities.CartItem.delete(item.id);
      }
      setCreatedOrderId(order.id);
      setSuccess(true);
      localStorage.removeItem("hageregna_coupon");
    } catch (err) {
      toast({ title: "Order failed. Please try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="max-w-4xl mx-auto px-4 py-12"><div className="animate-pulse h-96 bg-muted rounded-xl" /></div>;
  }

  if (success) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check size={32} className="text-green-600" />
        </div>
        <h1 className="font-display text-3xl font-bold text-foreground mb-3">Order Confirmed!</h1>
        <p className="text-muted-foreground mb-2">Your order has been placed successfully.</p>
        <p className="text-sm text-muted-foreground mb-8">We'll deliver your shoes to {form.zone}. A confirmation email has been sent to your inbox with your order details.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {createdOrderId && <Link to={`/order/${createdOrderId}`} className="bg-foreground text-background px-8 py-3 rounded-xl text-sm tracking-widest uppercase hover:bg-foreground/90 transition-colors">Track Order</Link>}
          <Link to="/products" className="border border-border px-8 py-3 rounded-xl text-sm tracking-widest uppercase hover:bg-muted transition-colors">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    navigate("/cart");
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <PageHeader title="Checkout" className="mb-8" />

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Contact */}
          <div className="rounded-xl border border-border/60 bg-card p-6 shadow-soft">
            <h3 className="text-sm font-semibold tracking-widest uppercase mb-4">Contact Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground font-mono block mb-1.5">Full Name *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={`w-full border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors ${errors.name ? "border-destructive" : "border-border"}`} placeholder="Your full name" />
                {errors.name && <p className="text-xs text-destructive mt-1.5">{errors.name}</p>}
              </div>
              <div>
                <label className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground font-mono block mb-1.5">Phone *</label>
                <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className={`w-full border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors ${errors.phone ? "border-destructive" : "border-border"}`} placeholder="+251 911 000 000" />
                {errors.phone && <p className="text-xs text-destructive mt-1.5">{errors.phone}</p>}
              </div>
              <div className="sm:col-span-2">
                <label className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground font-mono block mb-1.5">Email (optional)</label>
                <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className={`w-full border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors ${errors.email ? "border-destructive" : "border-border"}`} placeholder="you@example.com" />
                {errors.email && <p className="text-xs text-destructive mt-1.5">{errors.email}</p>}
              </div>
            </div>
          </div>

          {/* Delivery Zone */}
          <div className="rounded-xl border border-border/60 bg-card p-6 shadow-soft">
            <h3 className="text-sm font-semibold tracking-widest uppercase mb-4">Delivery Zone</h3>
            {zones.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No delivery zones available. Please contact us.</p>
            ) : (
              <div className="mb-4">
                <label className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground font-mono block mb-1.5">Select your area *</label>
                <select
                  value={form.zone}
                  onChange={e => setForm(f => ({ ...f, zone: e.target.value }))}
                  className={`w-full border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors bg-white ${errors.zone ? "border-destructive" : "border-border"}`}
                >
                  <option value="" disabled>Select a delivery zone…</option>
                  {zones.map(z => (
                    <option key={z.id} value={z.zone_name}>
                      {z.zone_name} — {z.delivery_fee === 0 ? "Free delivery" : `${Number(z.delivery_fee).toLocaleString()} ETB`}{z.estimated_time ? ` · ${z.estimated_time}` : ""}
                    </option>
                  ))}
                </select>
                {errors.zone && <p className="text-xs text-destructive mt-1.5">{errors.zone}</p>}
                {selectedZone && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {selectedZone.estimated_time ? `Estimated time: ${selectedZone.estimated_time}` : ""}{selectedZone.delivery_fee === 0 ? " · Free delivery" : ""}
                  </p>
                )}
              </div>
            )}
            <div>
              <label className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground font-mono block mb-1.5">Delivery Address / Landmark *</label>
              <textarea value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} rows={2} className={`w-full border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors resize-none ${errors.address ? "border-destructive" : "border-border"}`} placeholder="Building name, floor, nearby landmark..." />
              {errors.address && <p className="text-xs text-destructive mt-1.5">{errors.address}</p>}
            </div>
          </div>

          {/* Payment */}
          <div className="rounded-xl border border-border/60 bg-card p-6 shadow-soft">
            <h3 className="text-sm font-semibold tracking-widest uppercase mb-4">Payment Method</h3>
            <PaymentMethodSelector value={form.payment} onChange={(v) => setForm(f => ({ ...f, payment: v }))} />

            {form.payment !== "Cash on Delivery" && (
              <div className="mt-4 p-4 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-sm font-medium text-foreground mb-1">Send payment via {form.payment}</p>
                <p className="text-sm text-muted-foreground mb-3">
                  Transfer <span className="font-semibold text-foreground">{total.toLocaleString()} ETB</span> to{" "}
                  <span className="font-mono font-semibold text-foreground">{MERCHANT_PHONE}</span> using {form.payment}, then enter your transaction reference below.
                </p>
                <input
                  value={form.transaction_reference}
                  onChange={e => setForm(f => ({ ...f, transaction_reference: e.target.value }))}
                  placeholder="Transaction ID / Reference (e.g. TP123456789)"
                  className={`w-full border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors ${errors.transaction_reference ? "border-destructive" : "border-border"}`}
                />
                {errors.transaction_reference && <p className="text-xs text-destructive mt-1.5">{errors.transaction_reference}</p>}
              </div>
            )}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-border/60 bg-card p-6 shadow-soft sticky top-28">
            <h3 className="text-sm font-semibold tracking-widest uppercase mb-4">Order Summary</h3>
            <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
              {items.map(item => (
                <div key={item.id} className="flex justify-between text-sm gap-2">
                  <span className="text-muted-foreground truncate">{item.product_name} × {item.quantity}</span>
                  <span className="font-tabular whitespace-nowrap">{(item.price * item.quantity).toLocaleString()} ETB</span>
                </div>
              ))}
            </div>

            {/* Coupon Input */}
            <div className="border-t border-border pt-4 mb-4">
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <Tag size={14} className="text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-green-700">{appliedCoupon.code}</p>
                      <p className="text-[10px] text-green-600">{appliedCoupon.discount_type === "percentage" ? `${appliedCoupon.value}% off` : appliedCoupon.discount_type === "fixed" ? `${appliedCoupon.value} ETB off` : "Free shipping"}</p>
                    </div>
                  </div>
                  <button type="button" onClick={removeCoupon} className="p-1 text-green-600 hover:text-red-500">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <form onSubmit={applyCoupon} className="flex gap-2">
                  <div className="relative flex-1">
                    <Ticket size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      value={couponCode}
                      onChange={e => setCouponCode(e.target.value)}
                      placeholder="Coupon code"
                      className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  <button type="submit" disabled={couponLoading || !couponCode.trim()} className="px-4 py-2 text-xs font-medium bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors disabled:opacity-50">
                    {couponLoading ? "..." : "Apply"}
                  </button>
                </form>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Original Price</span>
                <span className="font-tabular">{subtotal.toLocaleString()} ETB</span>
              </div>
              {couponDiscount > 0 && (
                <>
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount ({appliedCoupon?.code})</span>
                    <span className="font-tabular">-{couponDiscount.toLocaleString()} ETB</span>
                  </div>
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Amount Saved</span>
                    <span className="font-tabular">{couponDiscount.toLocaleString()} ETB</span>
                  </div>
                </>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery {form.zone && `(${form.zone})`}</span>
                <span className="font-tabular">{finalDeliveryFee === 0 ? "Free" : `${finalDeliveryFee.toLocaleString()} ETB`}</span>
              </div>
              <div className="border-t border-border pt-3 flex justify-between">
                <span className="font-semibold">Final Price</span>
                <span className="font-bold text-lg font-tabular">{total.toLocaleString()} ETB</span>
              </div>
            </div>
            <button type="submit" disabled={submitting} className="w-full mt-6 bg-primary text-primary-foreground py-3.5 rounded-xl text-sm tracking-widest uppercase font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
              {submitting ? "Placing Order..." : "Place Order"}
            </button>

            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Shield size={12} className="text-primary" /> Verified Hageregna Quality
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Truck size={12} className="text-primary" /> Pay on Delivery Available
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}