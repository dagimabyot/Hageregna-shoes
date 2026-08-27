import React, { useState, useMemo } from "react";
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight, X, Star, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import ViewToggle from "@/components/admin/ViewToggle";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "name", label: "Name A–Z" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "stock_low", label: "Low Stock First" },
];

const PAGE_SIZE = 10;

export default function ProductsManager({ products, onAdd, onEdit, onDelete, onBulkDelete, onBulkUpdate }) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [view, setView] = useState("list");
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState(new Set());
  const { toast } = useToast();

  const filtered = useMemo(() => {
    let result = [...products];
    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter(p =>
        p.name?.toLowerCase().includes(q) ||
        p.sku?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q)
      );
    }
    if (sortBy === "newest") result.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    else if (sortBy === "name") result.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    else if (sortBy === "price_asc") result.sort((a, b) => (a.price || 0) - (b.price || 0));
    else if (sortBy === "price_desc") result.sort((a, b) => (b.price || 0) - (a.price || 0));
    else if (sortBy === "stock_low") result.sort((a, b) => (a.stock || 0) - (b.stock || 0));
    return result;
  }, [products, search, sortBy]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const allOnPageSelected = paged.length > 0 && paged.every(p => selected.has(p.id));
  const toggleAll = () => {
    const next = new Set(selected);
    if (allOnPageSelected) paged.forEach(p => next.delete(p.id));
    else paged.forEach(p => next.add(p.id));
    setSelected(next);
  };
  const toggleOne = (id) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };
  const clearSelection = () => setSelected(new Set());

  const confirmDelete = async () => {
    const ids = [...selected];
    if (!window.confirm(`Delete ${ids.length} selected product${ids.length > 1 ? "s" : ""}? This cannot be undone.`)) return;
    await onBulkDelete(ids);
    clearSelection();
  };
  const applyUpdate = async (changes, label) => {
    const ids = [...selected];
    await onBulkUpdate(ids, changes);
    toast(label);
    clearSelection();
  };

  const showBar = selected.size > 0;

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 justify-between mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="text-sm border border-border rounded-xl px-3 py-2.5 outline-none bg-white">
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground hidden sm:inline">{filtered.length} products</span>
          <ViewToggle view={view} onViewChange={setView} />
          <button onClick={onAdd} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition-colors" style={{ background: "#4F46E5" }}>
            <Plus size={14} /> Add Product
          </button>
        </div>
      </div>

      {/* Bulk action bar */}
      {showBar && (
        <div className="sticky top-2 z-20 flex flex-wrap items-center gap-2 mb-4 p-3 rounded-xl border bg-indigo-50 shadow-soft" style={{ borderColor: "#C7D2FE" }}>
          <span className="text-sm font-medium text-indigo-900 mr-2">{selected.size} selected</span>
          <button onClick={() => applyUpdate({ is_active: true }, "Activated")} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50 transition-colors">
            <Eye size={13} /> Activate
          </button>
          <button onClick={() => applyUpdate({ is_active: false }, "Deactivated")} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 transition-colors">
            <EyeOff size={13} /> Deactivate
          </button>
          <button onClick={() => applyUpdate({ is_featured: true }, "Featured")} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-white text-amber-700 border border-amber-200 hover:bg-amber-50 transition-colors">
            <Star size={13} /> Feature
          </button>
          <button onClick={() => applyUpdate({ is_featured: false }, "Unfeatured")} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 transition-colors">
            <Star size={13} /> Unfeature
          </button>
          <button onClick={confirmDelete} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-white text-red-600 border border-red-200 hover:bg-red-50 transition-colors">
            <Trash2 size={13} /> Delete
          </button>
          <button onClick={clearSelection} className="ml-auto p-1.5 rounded-xl text-slate-500 hover:bg-white transition-colors">
            <X size={15} />
          </button>
        </div>
      )}

      {view === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {paged.map(p => {
            const checked = selected.has(p.id);
            return (
              <div key={p.id} className={`rounded-xl border bg-white p-4 shadow-sm transition-all ${checked ? "ring-2 ring-indigo-400" : ""}`} style={{ borderColor: "#E2E8F0" }}>
                <div className="flex gap-3">
                  <label className="flex items-center pt-1 cursor-pointer shrink-0">
                    <input type="checkbox" checked={checked} onChange={() => toggleOne(p.id)} className="w-4 h-4 rounded accent-indigo-600 cursor-pointer" />
                  </label>
                  <div className="w-16 h-16 bg-slate-100 rounded-lg shrink-0 overflow-hidden">
                    {p.images?.[0] ? <img src={p.images[0]} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{p.name}</p>
                    <p className="text-xs text-slate-500">{p.category} · {p.brand}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-bold font-tabular">{p.price?.toLocaleString()} ETB</span>
                      <span className="text-xs text-slate-400">Stock: {p.stock}</span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-1 mt-3">
                  <button onClick={() => onEdit(p)} className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"><Pencil size={14} /></button>
                  <button onClick={() => onDelete(p.id)} className="p-1.5 text-slate-500 hover:text-white hover:bg-red-500 rounded-lg transition-colors"><Trash2 size={14} /></button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border bg-white shadow-sm overflow-hidden" style={{ borderColor: "#E2E8F0" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-[10px] font-mono tracking-[0.2em] uppercase text-slate-500" style={{ background: "#F1F5F9", borderColor: "#E2E8F0" }}>
                  <th className="text-left p-3 w-10">
                    <input type="checkbox" checked={allOnPageSelected} onChange={toggleAll} className="w-4 h-4 rounded accent-indigo-600 cursor-pointer" />
                  </th>
                  <th className="text-left p-3 font-medium">Product</th>
                  <th className="text-left p-3 font-medium">Category</th>
                  <th className="text-right p-3 font-medium">Price</th>
                  <th className="text-right p-3 font-medium">Stock</th>
                  <th className="text-right p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paged.map(p => {
                  const checked = selected.has(p.id);
                  return (
                    <tr key={p.id} className={`border-b last:border-0 hover:bg-slate-50 ${checked ? "bg-indigo-50/50" : ""}`} style={{ borderColor: "#E2E8F0" }}>
                      <td className="p-3">
                        <input type="checkbox" checked={checked} onChange={() => toggleOne(p.id)} className="w-4 h-4 rounded accent-indigo-600 cursor-pointer" />
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-100 rounded-lg shrink-0 overflow-hidden">
                            {p.images?.[0] && <img src={p.images[0]} alt="" className="w-full h-full object-cover" />}
                          </div>
                          <div>
                            <span className="font-medium line-clamp-1">{p.name}</span>
                            {p.sku && <span className="text-xs text-slate-400 block font-mono">{p.sku}</span>}
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-slate-500">{p.category}</td>
                      <td className="p-3 text-right font-tabular">{p.price?.toLocaleString()} ETB</td>
                      <td className="p-3 text-right font-tabular">
                        <span className={p.stock <= 5 ? "text-red-500 font-medium" : ""}>{p.stock}</span>
                      </td>
                      <td className="p-3 text-right whitespace-nowrap">
                        <button onClick={() => onEdit(p)} className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"><Pencil size={14} /></button>
                        <button onClick={() => onDelete(p.id)} className="p-1.5 text-slate-500 hover:text-white hover:bg-red-500 rounded-lg transition-colors ml-1"><Trash2 size={14} /></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} className="p-2 rounded-xl border disabled:opacity-30 hover:bg-muted" style={{ borderColor: "#E2E8F0" }}>
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm text-muted-foreground">Page {page + 1} of {totalPages}</span>
          <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1} className="p-2 rounded-xl border disabled:opacity-30 hover:bg-muted" style={{ borderColor: "#E2E8F0" }}>
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}