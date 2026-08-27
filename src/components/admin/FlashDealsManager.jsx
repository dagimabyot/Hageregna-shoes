import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { Zap, Plus, Edit2, Trash2, X, Power } from "lucide-react";

export default function FlashDealsManager() {
  const { toast } = useToast();
  const [deals, setDeals] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editDeal, setEditDeal] = useState(null);
  const [form, setForm] = useState({
    title: "",
    product_id: "",
    discount_percentage: 10,
    start_date: "",
    end_date: "",
    is_active: true,
  });

  const loadData = async () => {
    setLoading(true);
    const [d, p] = await Promise.all([
      base44.entities.FlashDeal.list("-created_date", 50).catch(() => []),
      base44.entities.Product.list("-created_date", 100).catch(() => []),
    ]);
    setDeals(d);
    setProducts(p);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const openNew = () => {
    setEditDeal(null);
    setForm({
      title: "",
      product_id: "",
      discount_percentage: 10,
      start_date: new Date().toISOString().slice(0, 16),
      end_date: "",
      is_active: true,
    });
    setShowForm(true);
  };

  const openEdit = (deal) => {
    setEditDeal(deal);
    setForm({
      title: deal.title || "",
      product_id: deal.product_id,
      discount_percentage: deal.discount_percentage,
      start_date: new Date(deal.start_date).toISOString().slice(0, 16),
      end_date: new Date(deal.end_date).toISOString().slice(0, 16),
      is_active: deal.is_active,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.product_id || !form.end_date) {
      toast({ title: "Please select a product and set an end date", variant: "destructive" });
      return;
    }
    const product = products.find(p => p.id === form.product_id);
    if (!product) {
      toast({ title: "Product not found", variant: "destructive" });
      return;
    }
    const originalPrice = product.discount_price && product.discount_price < product.price ? product.price : product.price;
    const dealPrice = Math.round(originalPrice * (1 - form.discount_percentage / 100));

    const dealData = {
      title: form.title || `${form.discount_percentage}% Off — ${product.name}`,
      product_id: form.product_id,
      product_name: product.name,
      product_image: product.images?.[0] || "",
      original_price: originalPrice,
      discount_percentage: form.discount_percentage,
      deal_price: dealPrice,
      start_date: new Date(form.start_date).toISOString(),
      end_date: new Date(form.end_date).toISOString(),
      is_active: form.is_active,
    };

    try {
      if (editDeal) {
        await base44.entities.FlashDeal.update(editDeal.id, dealData);
        toast({ title: "Flash deal updated" });
      } else {
        await base44.entities.FlashDeal.create(dealData);
        toast({ title: "Flash deal created" });
      }
      // Apply the discount to the product
      await base44.entities.Product.update(form.product_id, {
        discount_price: dealPrice,
        is_flash_deal: true,
      });
      setShowForm(false);
      loadData();
    } catch (err) {
      toast({ title: "Failed to save flash deal", variant: "destructive" });
    }
  };

  const toggleActive = async (deal) => {
    await base44.entities.FlashDeal.update(deal.id, { is_active: !deal.is_active });
    if (deal.is_active) {
      // Disabling: remove discount from product
      await base44.entities.Product.update(deal.product_id, {
        discount_price: null,
        is_flash_deal: false,
      }).catch(() => {});
    }
    toast({ title: `Deal ${!deal.is_active ? "enabled" : "disabled"}` });
    loadData();
  };

  const deleteDeal = async (deal) => {
    // Restore product price before deleting
    await base44.entities.Product.update(deal.product_id, {
      discount_price: null,
      is_flash_deal: false,
    }).catch(() => {});
    await base44.entities.FlashDeal.delete(deal.id);
    toast({ title: "Flash deal deleted" });
    loadData();
  };

  const isExpired = (deal) => new Date(deal.end_date) < new Date();
  const isUpcoming = (deal) => new Date(deal.start_date) > new Date();

  if (loading) {
    return <div className="animate-pulse h-96 rounded-xl bg-muted" />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Zap size={20} className="text-primary" /> Flash Deals
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Create time-limited discount deals for your products</p>
        </div>
        <button onClick={openNew} className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
          <Plus size={16} /> New Deal
        </button>
      </div>

      {deals.length === 0 ? (
        <div className="rounded-xl border border-border/60 bg-card p-12 text-center shadow-soft">
          <Zap size={40} className="mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground">No flash deals yet. Create one to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {deals.map(deal => {
            const product = products.find(p => p.id === deal.product_id);
            const expired = isExpired(deal);
            const upcoming = isUpcoming(deal);
            const status = expired ? "Expired" : upcoming ? "Upcoming" : deal.is_active ? "Active" : "Disabled";
            const statusColor = expired ? "bg-red-100 text-red-700" : upcoming ? "bg-blue-100 text-blue-700" : deal.is_active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-700";
            return (
              <div key={deal.id} className="rounded-xl border border-border/60 bg-card p-5 shadow-soft">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted shrink-0">
                    {deal.product_image ? (
                      <img src={deal.product_image} alt={deal.product_name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground/30 text-xs">No img</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{deal.product_name}</p>
                        <p className="text-xs text-muted-foreground truncate">{deal.title}</p>
                      </div>
                      <span className={`text-[10px] font-mono px-2 py-1 rounded-full shrink-0 ${statusColor}`}>{status}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-xs">
                      <span className="font-bold text-primary">{deal.discount_percentage}% OFF</span>
                      <span className="text-muted-foreground line-through">{Number(deal.original_price).toLocaleString()} ETB</span>
                      <span className="font-semibold">{Number(deal.deal_price).toLocaleString()} ETB</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-[11px] text-muted-foreground">
                      <span>Start: {new Date(deal.start_date).toLocaleString()}</span>
                      <span>·</span>
                      <span>End: {new Date(deal.end_date).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
                  <button onClick={() => openEdit(deal)} className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors">
                    <Edit2 size={13} /> Edit
                  </button>
                  <button onClick={() => toggleActive(deal)} className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors">
                    <Power size={13} /> {deal.is_active ? "Disable" : "Enable"}
                  </button>
                  <button onClick={() => deleteDeal(deal)} className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/5 transition-colors ml-auto">
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Form Dialog */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowForm(false)}>
          <div className="bg-card rounded-xl shadow-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold">{editDeal ? "Edit Flash Deal" : "New Flash Deal"}</h3>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-muted">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground font-mono block mb-1.5">Product *</label>
                <select
                  value={form.product_id}
                  onChange={e => {
                    const p = products.find(x => x.id === e.target.value);
                    setForm(f => ({ ...f, product_id: e.target.value, title: f.title || (p ? `${f.discount_percentage}% Off — ${p.name}` : "") }));
                  }}
                  required
                  className="w-full border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary bg-card"
                >
                  <option value="">Select a product...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} — {Number(p.price).toLocaleString()} ETB</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground font-mono block mb-1.5">Title</label>
                <input
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Weekend Flash Sale"
                  className="w-full border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground font-mono block mb-1.5">Discount Percentage * ({form.discount_percentage}%)</label>
                <input
                  type="range"
                  min="5"
                  max="80"
                  step="5"
                  value={form.discount_percentage}
                  onChange={e => setForm(f => ({ ...f, discount_percentage: Number(e.target.value) }))}
                  className="w-full accent-primary"
                />
                {form.product_id && (() => {
                  const p = products.find(x => x.id === form.product_id);
                  if (!p) return null;
                  const dealPrice = Math.round(p.price * (1 - form.discount_percentage / 100));
                  return (
                    <p className="text-xs text-muted-foreground mt-1">
                      Deal price: <span className="font-bold text-primary">{dealPrice.toLocaleString()} ETB</span> (was {p.price.toLocaleString()} ETB)
                    </p>
                  );
                })()}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground font-mono block mb-1.5">Start Date *</label>
                  <input
                    type="datetime-local"
                    value={form.start_date}
                    onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
                    required
                    className="w-full border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground font-mono block mb-1.5">End Date *</label>
                  <input
                    type="datetime-local"
                    value={form.end_date}
                    onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))}
                    required
                    className="w-full border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))}
                  className="accent-primary w-4 h-4"
                />
                <span className="text-sm">Active (visible on homepage)</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-primary text-primary-foreground py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                  {editDeal ? "Update Deal" : "Create Deal"}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="px-4 border border-border rounded-lg text-sm hover:bg-muted transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}