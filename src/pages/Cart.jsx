import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Ticket, X, Tag } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import PageHeader from "@/components/shared/PageHeader";

export default function Cart() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const loadItems = () => {
    base44.entities.CartItem.list()
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadItems();
    const savedCoupon = localStorage.getItem("hageregna_coupon");
    if (savedCoupon) {
      try { setAppliedCoupon(JSON.parse(savedCoupon)); } catch {}
    }
    const unsub = base44.entities.CartItem.subscribe(() => loadItems());
    return unsub;
  }, []);

  const updateQty = async (item, delta) => {
    const newQty = item.quantity + delta;
    if (newQty <= 0) {
      await base44.entities.CartItem.delete(item.id);
    } else {
      await base44.entities.CartItem.update(item.id, { quantity: newQty });
    }
    loadItems();
  };

  const removeItem = async (id) => {
    await base44.entities.CartItem.delete(id);
    loadItems();
    toast({ title: "Removed from cart" });
  };

  const clearCart = async () => {
    for (const item of items) {
      await base44.entities.CartItem.delete(item.id);
    }
    loadItems();
    toast({ title: "Cart cleared" });
  };

  const subtotal = items.reduce((sum, i) => sum + (i.price * i.quantity), 0);

  const couponDiscount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.discount_type === "percentage") return Math.round((subtotal * appliedCoupon.value) / 100);
    if (appliedCoupon.discount_type === "fixed") return Math.min(appliedCoupon.value, subtotal);
    return 0;
  }, [appliedCoupon, subtotal]);

  const finalTotal = subtotal - couponDiscount;

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
        toast({ title: "This coupon has expired.", variant: "destructive" });
        return;
      }
      if (coupon.usage_limit > 0 && (coupon.used_count || 0) >= coupon.usage_limit) {
        toast({ title: "This coupon has reached its usage limit.", variant: "destructive" });
        return;
      }
      if (coupon.minimum_order_amount && subtotal < coupon.minimum_order_amount) {
        toast({ title: "Minimum purchase amount not reached.", description: `Minimum order of ${coupon.minimum_order_amount.toLocaleString()} ETB required.`, variant: "destructive" });
        return;
      }
      setAppliedCoupon(coupon);
      localStorage.setItem("hageregna_coupon", JSON.stringify(coupon));
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

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-24 bg-[#0F0F0F]/5 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <ShoppingBag size={48} className="mx-auto text-[#0F0F0F]/20 mb-4" />
        <h1 className="font-display text-2xl font-bold text-[#0F0F0F] mb-2">Your cart is empty</h1>
        <p className="text-sm text-[#4A4A4A] mb-6">Browse our collection and add your favorite shoes.</p>
        <Link to="/products" className="inline-flex items-center gap-2 bg-[#0F0F0F] text-[#F7F5F0] px-8 py-3 text-sm tracking-widest uppercase rounded-xl hover:bg-[#0F0F0F]/90">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <PageHeader title="Shopping Cart" className="mb-8" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(item => (
            <div key={item.id} className="flex gap-4 p-4 rounded-xl border border-[#0F0F0F]/10 bg-white">
              <Link to={`/product/${item.product_id}`} className="w-24 h-24 shrink-0 bg-[#EDEBE6] overflow-hidden rounded-xl">
                {item.product_image ? (
                  <img src={item.product_image} alt={item.product_name} loading="lazy" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#4A4A4A]/30"><ShoppingBag size={24} /></div>
                )}
              </Link>
              <div className="flex-1 min-w-0">
                <Link to={`/product/${item.product_id}`} className="text-sm font-medium text-[#0F0F0F] hover:text-[#B34B2D] line-clamp-1">{item.product_name}</Link>
                <div className="flex items-center gap-2 mt-1 text-xs text-[#4A4A4A]">
                  {item.size && <span>Size: {item.size}</span>}
                  {item.color && <span>· {item.color}</span>}
                </div>
                <div className="flex items-center justify-between gap-2 mt-3 flex-wrap">
                  <div className="flex items-center border border-[#0F0F0F]/20 rounded-xl overflow-hidden">
                    <button onClick={() => updateQty(item, -1)} className="p-2 hover:bg-[#0F0F0F]/5"><Minus size={12} /></button>
                    <span className="w-8 text-center text-sm font-tabular">{item.quantity}</span>
                    <button onClick={() => updateQty(item, 1)} className="p-2 hover:bg-[#0F0F0F]/5"><Plus size={12} /></button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold font-tabular">{(item.price * item.quantity).toLocaleString()} ETB</span>
                    <button onClick={() => removeItem(item.id)} className="p-1 text-[#4A4A4A] hover:text-[#B34B2D]"><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="border border-[#0F0F0F]/10 rounded-xl p-6 bg-white sticky top-28">
            <h3 className="text-sm font-semibold tracking-widest uppercase mb-4">Order Summary</h3>

            {/* Coupon */}
            <div className="mb-4 pb-4 border-b border-[#0F0F0F]/10">
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
                    <Ticket size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4A4A4A]" />
                    <input
                      value={couponCode}
                      onChange={e => setCouponCode(e.target.value)}
                      placeholder="Coupon code"
                      className="w-full pl-9 pr-3 py-2 text-sm border border-[#0F0F0F]/20 rounded-lg outline-none focus:border-[#B34B2D] transition-colors"
                    />
                  </div>
                  <button type="submit" disabled={couponLoading || !couponCode.trim()} className="px-4 py-2 text-xs font-medium bg-[#0F0F0F] text-[#F7F5F0] rounded-lg hover:bg-[#0F0F0F]/90 transition-colors disabled:opacity-50">
                    {couponLoading ? "..." : "Apply"}
                  </button>
                </form>
              )}
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-[#4A4A4A]">Original Price</span>
                <span className="font-tabular">{subtotal.toLocaleString()} ETB</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount ({appliedCoupon?.code})</span>
                  <span className="font-tabular">-{couponDiscount.toLocaleString()} ETB</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-[#4A4A4A]">Delivery</span>
                <span className="text-xs text-[#4A4A4A]">Calculated at checkout</span>
              </div>
              <div className="border-t border-[#0F0F0F]/10 pt-3 flex justify-between">
                <span className="font-semibold">Total</span>
                <span className="font-bold text-lg font-tabular">{finalTotal.toLocaleString()} ETB</span>
              </div>
            </div>
            <Link to="/checkout" className="w-full flex items-center justify-center gap-2 bg-[#B34B2D] text-[#F7F5F0] py-3.5 text-sm tracking-widest uppercase font-medium rounded-xl hover:bg-[#9A3F25] transition-colors">
              Checkout <ArrowRight size={16} />
            </Link>
            <button onClick={clearCart} className="w-full text-center text-xs text-[#4A4A4A] hover:text-[#B34B2D] mt-3 transition-colors">Clear Cart</button>
            <Link to="/products" className="block text-center text-xs text-[#4A4A4A] mt-2 hover:text-[#0F0F0F]">Continue Shopping</Link>
          </div>
        </div>
      </div>
    </div>
  );
}