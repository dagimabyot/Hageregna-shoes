import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Pencil, Trash2, Ticket, X, Percent, DollarSign, Truck } from "lucide-react";

const DISCOUNT_TYPES = [
  { value: "percentage", label: "Percentage", icon: Percent },
  { value: "fixed", label: "Fixed Amount", icon: DollarSign },
  { value: "free_shipping", label: "Free Shipping", icon: Truck },
];

export default function CouponManager() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ code: "", discount_type: "percentage", value: 0, minimum_order_amount: 0, expiration_date: "", usage_limit: 0, is_active: true });
  const { toast } = useToast();

  const load = () => {
    base44.entities.Coupon.list("-created_date", 50)
      .then(setCoupons)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { setEditItem(null); setForm({ code: "", discount_type: "percentage", value: 0, minimum_order_amount: 0, expiration_date: "", usage_limit: 0, is_active: true }); setShowForm(true); };
  const openEdit = (item) => { setEditItem(item); setForm({ code: item.code, discount_type: item.discount_type, value: item.value, minimum_order_amount: item.minimum_order_amount || 0, expiration_date: item.expiration_date || "", usage_limit: item.usage_limit || 0, is_active: item.is_active !== false }); setShowForm(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.code) { toast({ title: "Coupon code is required", variant: "destructive" }); return; }
    try {
      if (editItem) {
        await base44.entities.Coupon.update(editItem.id, form);
        toast({ title: "Coupon updated" });
      } else {
        await base44.entities.Coupon.create(form);
        await base44.entities.Notification.create({
          title: "Coupon Created",
          message: `Coupon code ${form.code} has been created.`,
          type: "account",
          is_read: false,
        }).catch(() => {});
        toast({ title: "Coupon created" });
      }
      setShowForm(false);
      load();
    } catch { toast({ title: "Save failed", variant: "destructive" }); }
  };

  const handleDelete = async (id) => {
    await base44.entities.Coupon.delete(id);
    toast({ title: "Coupon deleted" });
    load();
  };

  const isExpired = (date) => date && new Date(date) < new Date();

  if (loading) return <div className="animate-pulse h-48 bg-muted rounded-xl" />;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-muted-foreground">{coupons.length} coupons</p>
        <button onClick={openNew} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm tracking-widest uppercase hover:bg-primary/90 transition-colors shadow-soft">
          <Plus size={14} /> Add Coupon
        </button>
      </div>

      <div className="rounded-xl border border-border/60 bg-card shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-[10px] font-mono tracking-[0.2em] uppercase text-muted-foreground bg-muted/30">
                <th className="text-left p-3 font-medium">Code</th>
                <th className="text-left p-3 font-medium">Type</th>
                <th className="text-right p-3 font-medium">Value</th>
                <th className="text-right p-3 font-medium">Used / Limit</th>
                <th className="text-left p-3 font-medium">Min Order</th>
                <th className="text-left p-3 font-medium">Expires</th>
                <th className="text-center p-3 font-medium">Status</th>
                <th className="text-right p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map(c => (
                <tr key={c.id} className="border-b border-border/50 last:border-0 hover:bg-muted/20">
                  <td className="p-3"><span className="font-mono font-medium bg-muted px-2 py-1 rounded">{c.code}</span></td>
                  <td className="p-3 text-muted-foreground capitalize">{c.discount_type.replace("_", " ")}</td>
                  <td className="p-3 text-right font-tabular">{c.discount_type === "percentage" ? `${c.value}%` : c.discount_type === "fixed" ? `${c.value} ETB` : "—"}</td>
                  <td className="p-3 text-right font-tabular text-muted-foreground">{c.used_count || 0} / {c.usage_limit || "∞"}</td>
                  <td className="p-3 text-muted-foreground font-tabular">{c.minimum_order_amount ? `${Number(c.minimum_order_amount).toLocaleString()} ETB` : "—"}</td>
                <td className="p-3 text-muted-foreground">{c.expiration_date ? new Date(c.expiration_date).toLocaleDateString() : "—"}</td>
                  <td className="p-3 text-center">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${c.is_active === false || isExpired(c.expiration_date) ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                      {c.is_active === false ? "Inactive" : isExpired(c.expiration_date) ? "Expired" : "Active"}
                    </span>
                  </td>
                  <td className="p-3 text-right whitespace-nowrap">
                    <button onClick={() => openEdit(c)} className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg"><Pencil size={14} /></button>
                    <button onClick={() => handleDelete(c.id)} className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-muted rounded-lg ml-1"><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {coupons.length === 0 && (
          <div className="text-center py-12">
            <Ticket size={32} className="mx-auto text-muted-foreground/30 mb-2" />
            <p className="text-muted-foreground text-sm">No coupons yet</p>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowForm(false)} />
          <form onSubmit={handleSave} className="relative bg-card rounded-xl border border-border shadow-soft-lg p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">{editItem ? "Edit Coupon" : "New Coupon"}</h3>
              <button type="button" onClick={() => setShowForm(false)}><X size={18} className="text-muted-foreground" /></button>
            </div>
            <div>
              <label className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground font-mono block mb-1.5">Coupon Code *</label>
              <input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="SUMMER20" className="w-full border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary font-mono" required />
            </div>
            <div>
              <label className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground font-mono block mb-1.5">Discount Type</label>
              <div className="grid grid-cols-3 gap-2">
                {DISCOUNT_TYPES.map(t => (
                  <button key={t.value} type="button" onClick={() => setForm(f => ({ ...f, discount_type: t.value }))} className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border text-xs transition-all ${form.discount_type === t.value ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"}`}>
                    <t.icon size={16} className={form.discount_type === t.value ? "text-primary" : "text-muted-foreground"} />
                    <span className="text-center leading-tight">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>
            {form.discount_type !== "free_shipping" && (
              <div>
                <label className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground font-mono block mb-1.5">{form.discount_type === "percentage" ? "Discount Percentage" : "Discount Amount (ETB)"}</label>
                <input type="number" value={form.value} onChange={e => setForm(f => ({ ...f, value: +e.target.value }))} className="w-full border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary" required />
              </div>
            )}
            <div>
              <label className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground font-mono block mb-1.5">Minimum Order Amount (ETB)</label>
              <input type="number" min="0" value={form.minimum_order_amount} onChange={e => setForm(f => ({ ...f, minimum_order_amount: +e.target.value }))} placeholder="0 = no minimum" className="w-full border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground font-mono block mb-1.5">Expiration Date</label>
                <input type="date" value={form.expiration_date} onChange={e => setForm(f => ({ ...f, expiration_date: e.target.value }))} className="w-full border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary" />
              </div>
              <div>
                <label className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground font-mono block mb-1.5">Usage Limit (0 = ∞)</label>
                <input type="number" value={form.usage_limit} onChange={e => setForm(f => ({ ...f, usage_limit: +e.target.value }))} className="w-full border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary" />
              </div>
            </div>
            <div>
              <label className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground font-mono block mb-1.5">Status</label>
              <button type="button" onClick={() => setForm(f => ({ ...f, is_active: !f.is_active }))} className={`px-4 py-2.5 rounded-lg text-sm font-medium ${form.is_active ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>
                {form.is_active ? "Active" : "Inactive"}
              </button>
            </div>
            <button type="submit" className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
              {editItem ? "Save Changes" : "Create Coupon"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}