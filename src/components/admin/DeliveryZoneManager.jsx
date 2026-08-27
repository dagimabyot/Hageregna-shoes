import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Pencil, Trash2, MapPin, Clock, X } from "lucide-react";

const EMPTY = { zone_name: "", delivery_fee: 0, estimated_time: "", is_active: true };

export default function DeliveryZoneManager() {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const load = () => {
    setLoading(true);
    base44.entities.DeliveryZone.list("-created_date", 100)
      .then(setZones)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm(EMPTY); setShowForm(true); };
  const openEdit = (z) => { setEditing(z); setForm({ zone_name: z.zone_name, delivery_fee: z.delivery_fee, estimated_time: z.estimated_time || "", is_active: z.is_active !== false }); setShowForm(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.zone_name || form.delivery_fee === "") {
      toast({ title: "Zone name and fee are required", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, delivery_fee: Number(form.delivery_fee) };
      if (editing) {
        await base44.entities.DeliveryZone.update(editing.id, payload);
        toast({ title: "Delivery zone updated" });
      } else {
        await base44.entities.DeliveryZone.create(payload);
        toast({ title: "Delivery zone added" });
      }
      setShowForm(false);
      setEditing(null);
      load();
    } catch {
      toast({ title: "Failed to save zone", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    await base44.entities.DeliveryZone.delete(id);
    toast({ title: "Delivery zone deleted" });
    load();
  };

  if (loading) {
    return <div className="animate-pulse h-64 bg-muted rounded-xl" />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">{zones.length} delivery zones</p>
        <button onClick={openNew} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm tracking-widest uppercase hover:bg-primary/90 transition-colors shadow-soft">
          <Plus size={14} /> Add Zone
        </button>
      </div>

      {zones.length === 0 ? (
        <div className="rounded-xl border border-border/60 bg-card p-12 text-center shadow-soft">
          <MapPin size={40} className="mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground">No delivery zones yet</p>
          <button onClick={openNew} className="text-sm text-primary hover:underline mt-2">Add your first zone</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {zones.map(z => (
            <div key={z.id} className="rounded-xl border border-border/60 bg-card p-5 shadow-soft hover:shadow-soft-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <MapPin size={16} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{z.zone_name}</p>
                    {z.is_active === false && <span className="text-[10px] text-muted-foreground">Inactive</span>}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(z)} className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"><Pencil size={14} /></button>
                  <button onClick={() => handleDelete(z.id)} className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-muted rounded-lg transition-colors"><Trash2 size={14} /></button>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-bold font-tabular text-lg">{Number(z.delivery_fee).toLocaleString()} ETB</span>
                {z.estimated_time && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock size={12} /> {z.estimated_time}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowForm(false)} />
          <div className="relative w-full max-w-md bg-background rounded-xl shadow-soft-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-semibold tracking-widest uppercase">{editing ? "Edit Zone" : "Add Delivery Zone"}</h3>
              <button onClick={() => setShowForm(false)} className="p-1.5 hover:bg-muted rounded-md"><X size={16} /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground font-mono block mb-1.5">Zone Name *</label>
                <input
                  value={form.zone_name}
                  onChange={e => setForm(f => ({ ...f, zone_name: e.target.value }))}
                  placeholder="e.g. Addis Ababa, Adama, Bishoftu"
                  className="w-full border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground font-mono block mb-1.5">Delivery Fee (ETB) *</label>
                <input
                  type="number"
                  min="0"
                  value={form.delivery_fee}
                  onChange={e => setForm(f => ({ ...f, delivery_fee: e.target.value }))}
                  className="w-full border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground font-mono block mb-1.5">Estimated Delivery Time</label>
                <input
                  value={form.estimated_time}
                  onChange={e => setForm(f => ({ ...f, estimated_time: e.target.value }))}
                  placeholder="e.g. Same day, 1-2 days"
                  className="w-full border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors"
                />
              </div>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} className="w-4 h-4 accent-primary" />
                Active (available at checkout)
              </label>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-border py-2.5 rounded-lg text-sm font-medium hover:bg-muted transition-colors">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 bg-primary text-primary-foreground py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
                  {saving ? "Saving..." : editing ? "Update" : "Add Zone"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}