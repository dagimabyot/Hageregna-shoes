import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { Boxes, Search, AlertTriangle, Package } from "lucide-react";

export default function InventoryManager({ products, onRefresh }) {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [editStockValue, setEditStockValue] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter(p =>
      p.name?.toLowerCase().includes(q) ||
      p.sku?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q)
    );
  }, [products, search]);

  const lowStock = filtered.filter(p => (p.stock || 0) <= 5);
  const outOfStock = filtered.filter(p => (p.stock || 0) === 0);
  const totalUnits = filtered.reduce((sum, p) => sum + (p.stock || 0), 0);
  const totalValue = filtered.reduce((sum, p) => sum + (p.stock || 0) * (p.price || 0), 0);

  const updateStock = async (product) => {
    const newStock = Number(editStockValue);
    if (isNaN(newStock)) {
      toast({ title: "Please enter a valid number", variant: "destructive" });
      return;
    }
    try {
      await base44.entities.Product.update(product.id, { stock: newStock });
      toast({ title: `Stock updated for ${product.name}`, description: `${newStock} units in stock` });
      setEditing(null);
      setEditStockValue("");
      onRefresh();
    } catch {
      toast({ title: "Failed to update stock", variant: "destructive" });
    }
  };

  const startEdit = (product) => {
    setEditing(product.id);
    setEditStockValue(String(product.stock || 0));
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Boxes size={20} className="text-primary" /> Inventory
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Manage product stock levels</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="rounded-xl border border-border/60 bg-card p-4 shadow-soft">
          <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-mono">Total Products</p>
          <p className="text-2xl font-bold mt-1">{filtered.length}</p>
        </div>
        <div className="rounded-xl border border-border/60 bg-card p-4 shadow-soft">
          <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-mono">Total Units</p>
          <p className="text-2xl font-bold mt-1">{totalUnits.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
          <p className="text-[10px] tracking-[0.2em] uppercase text-yellow-700 font-mono">Low Stock</p>
          <p className="text-2xl font-bold mt-1 text-yellow-700">{lowStock.length}</p>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-[10px] tracking-[0.2em] uppercase text-red-700 font-mono">Out of Stock</p>
          <p className="text-2xl font-bold mt-1 text-red-700">{outOfStock.length}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4 max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search products..."
          className="w-full pl-10 pr-4 py-2.5 text-sm border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/30 transition-all"
        />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border/60 bg-card shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-[10px] font-mono tracking-[0.2em] uppercase text-muted-foreground bg-muted/30">
                <th className="text-left p-3 font-medium">Product</th>
                <th className="text-left p-3 font-medium">Category</th>
                <th className="text-left p-3 font-medium">SKU</th>
                <th className="text-right p-3 font-medium">Price</th>
                <th className="text-center p-3 font-medium">Stock</th>
                <th className="text-center p-3 font-medium">Status</th>
                <th className="text-right p-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(product => {
                const stock = product.stock || 0;
                const isLow = stock <= 5 && stock > 0;
                const isOut = stock === 0;
                return (
                  <tr key={product.id} className="border-b last:border-0 hover:bg-muted/20">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {product.images?.[0] ? (
                          <img src={product.images[0]} alt={product.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                            <Package size={14} className="text-muted-foreground" />
                          </div>
                        )}
                        <span className="font-medium truncate max-w-[200px]">{product.name}</span>
                      </div>
                    </td>
                    <td className="p-3 text-xs text-muted-foreground">{product.category}</td>
                    <td className="p-3 text-xs font-mono text-muted-foreground">{product.sku || "—"}</td>
                    <td className="p-3 text-right font-tabular">{Number(product.price).toLocaleString()} ETB</td>
                    <td className="p-3 text-center">
                      {editing === product.id ? (
                        <input
                          type="number"
                          value={editStockValue}
                          onChange={e => setEditStockValue(e.target.value)}
                          onKeyDown={e => { if (e.key === "Enter") updateStock(product); }}
                          className="w-20 text-center border border-border rounded-lg px-2 py-1 text-sm outline-none focus:border-primary"
                          autoFocus
                        />
                      ) : (
                        <span className={`font-tabular font-semibold ${isOut ? "text-red-600" : isLow ? "text-yellow-600" : ""}`}>
                          {stock}
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      {isOut ? (
                        <span className="text-[10px] font-mono px-2 py-1 rounded-full bg-red-100 text-red-700">Out of Stock</span>
                      ) : isLow ? (
                        <span className="text-[10px] font-mono px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 flex items-center gap-1 justify-center">
                          <AlertTriangle size={10} /> Low
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono px-2 py-1 rounded-full bg-green-100 text-green-700">In Stock</span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      {editing === product.id ? (
                        <div className="flex items-center gap-1 justify-end">
                          <button onClick={() => updateStock(product)} className="text-xs font-medium text-primary hover:underline">Save</button>
                          <button onClick={() => { setEditing(null); setEditStockValue(""); }} className="text-xs text-muted-foreground hover:underline">Cancel</button>
                        </div>
                      ) : (
                        <button onClick={() => startEdit(product)} className="text-xs font-medium text-primary hover:underline">Edit Stock</button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}