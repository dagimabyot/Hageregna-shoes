import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Pencil, Trash2, Tag, Upload, X } from "lucide-react";

export default function CategoryManager() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ name: "", description: "", image: "", is_active: true, sort_order: 0 });
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const load = () => {
    base44.entities.Category.list("sort_order", 50)
      .then(setCategories)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { setEditItem(null); setForm({ name: "", description: "", image: "", is_active: true, sort_order: 0 }); setShowForm(true); };
  const openEdit = (item) => { setEditItem(item); setForm({ name: item.name, description: item.description || "", image: item.image || "", is_active: item.is_active !== false, sort_order: item.sort_order || 0 }); setShowForm(true); };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setForm(f => ({ ...f, image: file_url }));
    } catch { toast({ title: "Upload failed", variant: "destructive" }); }
    finally { setUploading(false); }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name) { toast({ title: "Name is required", variant: "destructive" }); return; }
    try {
      if (editItem) {
        await base44.entities.Category.update(editItem.id, form);
        toast({ title: "Category updated" });
      } else {
        await base44.entities.Category.create(form);
        toast({ title: "Category created" });
      }
      setShowForm(false);
      load();
    } catch { toast({ title: "Save failed", variant: "destructive" }); }
  };

  const handleDelete = async (id) => {
    await base44.entities.Category.delete(id);
    toast({ title: "Category deleted" });
    load();
  };

  if (loading) return <div className="animate-pulse h-48 bg-muted rounded-xl" />;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-muted-foreground">{categories.length} categories</p>
        <button onClick={openNew} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm tracking-widest uppercase hover:bg-primary/90 transition-colors shadow-soft">
          <Plus size={14} /> Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map(cat => (
          <div key={cat.id} className="rounded-xl border border-border/60 bg-card p-4 shadow-soft">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden shrink-0">
                {cat.image ? <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Tag size={18} className="text-muted-foreground/40" /></div>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{cat.name}</p>
                {cat.description && <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{cat.description}</p>}
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full mt-2 inline-block ${cat.is_active !== false ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>
                  {cat.is_active !== false ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
            <div className="flex gap-2 mt-3 pt-3 border-t border-border">
              <button onClick={() => openEdit(cat)} className="flex-1 flex items-center justify-center gap-1.5 text-xs py-1.5 rounded-lg hover:bg-muted transition-colors"><Pencil size={12} /> Edit</button>
              <button onClick={() => handleDelete(cat.id)} className="flex-1 flex items-center justify-center gap-1.5 text-xs py-1.5 rounded-lg text-destructive hover:bg-destructive/5 transition-colors"><Trash2 size={12} /> Delete</button>
            </div>
          </div>
        ))}
        {categories.length === 0 && (
          <div className="col-span-full text-center py-12 rounded-xl border border-border/60 bg-card">
            <Tag size={32} className="mx-auto text-muted-foreground/30 mb-2" />
            <p className="text-muted-foreground text-sm">No categories yet</p>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowForm(false)} />
          <form onSubmit={handleSave} className="relative bg-card rounded-xl border border-border shadow-soft-lg p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">{editItem ? "Edit Category" : "New Category"}</h3>
              <button type="button" onClick={() => setShowForm(false)}><X size={18} className="text-muted-foreground" /></button>
            </div>
            <div>
              <label className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground font-mono block mb-1.5">Name *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary" required />
            </div>
            <div>
              <label className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground font-mono block mb-1.5">Description</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} className="w-full border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary resize-none" />
            </div>
            <div>
              <label className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground font-mono block mb-1.5">Category Image</label>
              <div className="flex items-center gap-3">
                {form.image && <img src={form.image} alt="" className="w-12 h-12 rounded-lg object-cover" />}
                <label className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg text-sm cursor-pointer hover:bg-muted transition-colors">
                  <Upload size={14} /> {uploading ? "Uploading..." : "Upload"}
                  <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
                </label>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground font-mono block mb-1.5">Sort Order</label>
                <input type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: +e.target.value }))} className="w-full border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary" />
              </div>
              <div>
                <label className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground font-mono block mb-1.5">Status</label>
                <button type="button" onClick={() => setForm(f => ({ ...f, is_active: !f.is_active }))} className={`px-4 py-2.5 rounded-lg text-sm font-medium ${form.is_active ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>
                  {form.is_active ? "Active" : "Inactive"}
                </button>
              </div>
            </div>
            <button type="submit" className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
              {editItem ? "Save Changes" : "Create Category"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}