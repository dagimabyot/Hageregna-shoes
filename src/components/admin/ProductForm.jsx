import React, { useState } from "react";
import { X, Upload } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";

const CATEGORIES = ["Men", "Women", "Kids", "Formal", "Casual", "Leather"];
const COMFORT_TYPES = ["Walking", "Formal", "Sports", "Casual", "All-Purpose"];
const emptyProduct = { name: "", description: "", price: 0, discount_price: 0, category: "Men", sizes: [], colors: [], material: "", comfort_type: "Casual", stock: 0, images: [], is_featured: false, is_flash_deal: false, is_trending: false };

const inputClass = "w-full border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors bg-background";

export default function ProductForm({ initialProduct, onClose, onSaved }) {
  const [product, setProduct] = useState(initialProduct || { ...emptyProduct });
  const [saving, setSaving] = useState(false);
  const [sizeInput, setSizeInput] = useState("");
  const [colorInput, setColorInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const isEdit = !!product.id;

  const save = async () => {
    if (!product.name) return;
    setSaving(true);
    try {
      if (isEdit) {
        const { id, created_date, updated_date, created_by_id, ...data } = product;
        await base44.entities.Product.update(id, data);
        toast({ title: "Product updated" });
      } else {
        await base44.entities.Product.create(product);
        toast({ title: "Product created" });
      }
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setProduct(p => ({ ...p, images: [...(p.images || []), file_url] }));
    } finally {
      setUploading(false);
    }
  };

  const addSize = () => {
    if (sizeInput && !product.sizes?.includes(sizeInput)) {
      setProduct(p => ({ ...p, sizes: [...(p.sizes || []), sizeInput] }));
      setSizeInput("");
    }
  };
  const addColor = () => {
    if (colorInput && !product.colors?.includes(colorInput)) {
      setProduct(p => ({ ...p, colors: [...(p.colors || []), colorInput] }));
      setColorInput("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 px-4 overflow-y-auto">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-background w-full max-w-2xl rounded-2xl shadow-soft-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl font-bold">{isEdit ? "Edit Product" : "New Product"}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors"><X size={20} /></button>
        </div>

        <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-2">
          <div>
            <label className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground font-mono block mb-1">Product Name</label>
            <input value={product.name} onChange={e => setProduct(p => ({...p, name: e.target.value}))} className={inputClass} />
          </div>
          <div>
            <label className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground font-mono block mb-1">Description</label>
            <textarea value={product.description} onChange={e => setProduct(p => ({...p, description: e.target.value}))} rows={3} className={`${inputClass} resize-none`} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground font-mono block mb-1">Price (ETB)</label>
              <input type="number" value={product.price} onChange={e => setProduct(p => ({...p, price: +e.target.value}))} className={inputClass} />
            </div>
            <div>
              <label className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground font-mono block mb-1">Discount Price</label>
              <input type="number" value={product.discount_price} onChange={e => setProduct(p => ({...p, discount_price: +e.target.value}))} className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground font-mono block mb-1">Category</label>
              <select value={product.category} onChange={e => setProduct(p => ({...p, category: e.target.value}))} className={inputClass}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground font-mono block mb-1">Stock</label>
              <input type="number" value={product.stock} onChange={e => setProduct(p => ({...p, stock: +e.target.value}))} className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground font-mono block mb-1">Material</label>
              <input value={product.material} onChange={e => setProduct(p => ({...p, material: e.target.value}))} className={inputClass} placeholder="e.g. Genuine Leather" />
            </div>
            <div>
              <label className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground font-mono block mb-1">Comfort Type</label>
              <select value={product.comfort_type} onChange={e => setProduct(p => ({...p, comfort_type: e.target.value}))} className={inputClass}>
                {COMFORT_TYPES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground font-mono block mb-1">Sizes</label>
            <div className="flex flex-wrap gap-1 mb-2">
              {product.sizes?.map(s => (
                <span key={s} className="bg-foreground text-background text-xs px-2 py-1 rounded-full flex items-center gap-1">
                  {s} <button type="button" onClick={() => setProduct(p => ({...p, sizes: p.sizes.filter(x => x !== s)}))}><X size={10} /></button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={sizeInput} onChange={e => setSizeInput(e.target.value)} onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addSize())} placeholder="e.g. 42" className={inputClass} />
              <button type="button" onClick={addSize} className="px-4 py-2 bg-muted rounded-lg text-sm hover:bg-muted/70">Add</button>
            </div>
          </div>

          <div>
            <label className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground font-mono block mb-1">Colors</label>
            <div className="flex flex-wrap gap-1 mb-2">
              {product.colors?.map(c => (
                <span key={c} className="bg-foreground text-background text-xs px-2 py-1 rounded-full flex items-center gap-1">
                  {c} <button type="button" onClick={() => setProduct(p => ({...p, colors: p.colors.filter(x => x !== c)}))}><X size={10} /></button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={colorInput} onChange={e => setColorInput(e.target.value)} onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addColor())} placeholder="e.g. Black" className={inputClass} />
              <button type="button" onClick={addColor} className="px-4 py-2 bg-muted rounded-lg text-sm hover:bg-muted/70">Add</button>
            </div>
          </div>

          <div>
            <label className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground font-mono block mb-1">Images</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {product.images?.map((img, i) => (
                <div key={i} className="relative w-20 h-20 bg-muted rounded-lg overflow-hidden">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => setProduct(p => ({...p, images: p.images.filter((_, j) => j !== i)}))} className="absolute top-0.5 right-0.5 p-0.5 bg-background/80 rounded-full"><X size={10} /></button>
                </div>
              ))}
            </div>
            <label className="inline-flex items-center gap-2 px-4 py-2 border border-dashed border-border rounded-lg text-sm text-muted-foreground cursor-pointer hover:border-primary hover:text-primary transition-colors">
              <Upload size={14} /> {uploading ? "Uploading..." : "Upload Image"}
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
            </label>
          </div>

          <div className="flex flex-wrap gap-4">
            {[{key: "is_featured", label: "Featured"}, {key: "is_flash_deal", label: "Flash Deal"}, {key: "is_trending", label: "Trending"}].map(f => (
              <label key={f.key} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={product[f.key]} onChange={e => setProduct(p => ({...p, [f.key]: e.target.checked}))} className="accent-primary w-4 h-4 rounded" />
                <span className="text-sm">{f.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
          <button onClick={onClose} className="px-6 py-2.5 text-sm border border-border rounded-lg hover:bg-muted transition-colors">Cancel</button>
          <button onClick={save} disabled={saving || !product.name} className="px-6 py-2.5 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors">
            {saving ? "Saving..." : isEdit ? "Update" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}