import React, { useState, useMemo } from "react";
import { Search, Package, ChevronLeft, ChevronRight, Trash2, X } from "lucide-react";
import { ORDER_STATUSES, STATUS_COLORS } from "@/lib/orderStatuses";
import OrderTimeline from "@/components/shared/OrderTimeline";
import ViewToggle from "@/components/admin/ViewToggle";

const PAGE_SIZE = 10;

export default function OrdersView({ orders, onStatusChange, updateTrackingNote, onBulkStatusChange, onBulkDelete }) {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [view, setView] = useState("list");
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState(new Set());
  const [bulkStatus, setBulkStatus] = useState("Processing");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return orders;
    return orders.filter(o =>
      o.customer_name?.toLowerCase().includes(q) ||
      o.customer_phone?.includes(q) ||
      o.id?.toLowerCase().includes(q)
    );
  }, [orders, search]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const allOnPageSelected = paged.length > 0 && paged.every(o => selected.has(o.id));
  const toggleAll = () => {
    const next = new Set(selected);
    if (allOnPageSelected) paged.forEach(o => next.delete(o.id));
    else paged.forEach(o => next.add(o.id));
    setSelected(next);
  };
  const toggleOne = (id) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };
  const clearSelection = () => setSelected(new Set());

  const applyBulkStatus = async () => {
    const ids = [...selected];
    if (ids.length === 0) return;
    await onBulkStatusChange(ids, bulkStatus);
    clearSelection();
  };
  const confirmDelete = async () => {
    const ids = [...selected];
    if (!window.confirm(`Delete ${ids.length} selected order${ids.length > 1 ? "s" : ""}? This cannot be undone.`)) return;
    await onBulkDelete(ids);
    clearSelection();
  };

  const showBar = selected.size > 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="relative max-w-md flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }}
            placeholder="Search by name, phone, or order ID..."
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/30 transition-all"
          />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground hidden sm:inline">{filtered.length} orders</span>
          <ViewToggle view={view} onViewChange={setView} />
        </div>
      </div>

      {/* Bulk action bar */}
      {showBar && (
        <div className="sticky top-2 z-20 flex flex-wrap items-center gap-2 p-3 rounded-xl border bg-indigo-50 shadow-soft" style={{ borderColor: "#C7D2FE" }}>
          <span className="text-sm font-medium text-indigo-900 mr-2">{selected.size} selected</span>
          <div className="flex items-center gap-2">
            <select value={bulkStatus} onChange={e => setBulkStatus(e.target.value)} className="text-xs border border-border rounded-xl px-2.5 py-1.5 outline-none bg-white">
              {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <button onClick={applyBulkStatus} className="px-3 py-1.5 rounded-xl text-xs font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors">
              Set Status
            </button>
          </div>
          <button onClick={confirmDelete} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-white text-red-600 border border-red-200 hover:bg-red-50 transition-colors">
            <Trash2 size={13} /> Delete
          </button>
          <button onClick={clearSelection} className="ml-auto p-1.5 rounded-xl text-slate-500 hover:bg-white transition-colors">
            <X size={15} />
          </button>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-border/60 bg-card p-12 text-center shadow-soft">
          <Package size={40} className="mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground">{orders.length === 0 ? "No orders yet" : "No orders match your search"}</p>
        </div>
      ) : view === "grid" ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paged.map(order => {
              const isOpen = expanded === order.id;
              const checked = selected.has(order.id);
              return (
                <div key={order.id} className={`rounded-xl border border-border/60 bg-card p-5 shadow-soft transition-all ${checked ? "ring-2 ring-indigo-400" : ""}`}>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-start gap-2 min-w-0">
                      <input type="checkbox" checked={checked} onChange={() => toggleOne(order.id)} className="w-4 h-4 rounded accent-indigo-600 cursor-pointer mt-1 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[10px] font-mono text-muted-foreground">ORDER #{order.id?.slice(-8).toUpperCase()} · {new Date(order.created_date).toLocaleDateString()}</p>
                        <p className="text-sm font-medium mt-1">{order.customer_name}</p>
                        <p className="text-xs text-muted-foreground">{order.customer_phone} · {order.delivery_zone}</p>
                      </div>
                    </div>
                    <select value={order.status} onChange={e => onStatusChange(order.id, e.target.value)} className={`text-[10px] font-mono px-2.5 py-1.5 rounded-full border-none outline-none cursor-pointer ${STATUS_COLORS[order.status]}`}>
                      {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1 mb-3">
                    {order.items?.map((item, i) => (
                      <p key={i} className="text-sm text-muted-foreground">{item.name} × {item.quantity}</p>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 mb-3 text-xs">
                    <span className="bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-mono">{order.payment_method}</span>
                    {order.transaction_reference && (
                      <span className="text-muted-foreground">Ref: <span className="font-mono text-foreground">{order.transaction_reference}</span></span>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-3 pt-3 border-t border-border">
                    <input
                      placeholder="Add tracking note..."
                      defaultValue={order.tracking_note || ""}
                      onBlur={e => { if (e.target.value !== (order.tracking_note || "")) updateTrackingNote(order.id, e.target.value); }}
                      className="text-xs text-muted-foreground outline-none border-b border-transparent focus:border-border flex-1 mr-4 bg-transparent"
                    />
                    <span className="font-bold font-tabular whitespace-nowrap">{order.total_amount?.toLocaleString()} ETB</span>
                  </div>
                  <button
                    onClick={() => setExpanded(isOpen ? null : order.id)}
                    className="mt-3 text-xs text-primary hover:underline"
                  >
                    {isOpen ? "Hide tracking timeline" : "View tracking timeline"}
                  </button>
                  {isOpen && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <OrderTimeline order={order} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} className="p-2 rounded-xl border border-border disabled:opacity-30 hover:bg-muted">
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm text-muted-foreground">Page {page + 1} of {totalPages}</span>
              <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1} className="p-2 rounded-xl border border-border disabled:opacity-30 hover:bg-muted">
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="rounded-xl border border-border/60 bg-card shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-[10px] font-mono tracking-[0.2em] uppercase text-muted-foreground bg-muted/30">
                    <th className="text-left p-3 w-10">
                      <input type="checkbox" checked={allOnPageSelected} onChange={toggleAll} className="w-4 h-4 rounded accent-indigo-600 cursor-pointer" />
                    </th>
                    <th className="text-left p-3 font-medium">Order ID</th>
                    <th className="text-left p-3 font-medium">Customer</th>
                    <th className="text-left p-3 font-medium">Date</th>
                    <th className="text-left p-3 font-medium">Items</th>
                    <th className="text-left p-3 font-medium">Payment</th>
                    <th className="text-left p-3 font-medium">Status</th>
                    <th className="text-right p-3 font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map(order => {
                    const checked = selected.has(order.id);
                    return (
                      <tr key={order.id} className={`border-b last:border-0 hover:bg-muted/20 ${checked ? "bg-indigo-50/50" : ""}`}>
                        <td className="p-3">
                          <input type="checkbox" checked={checked} onChange={() => toggleOne(order.id)} className="w-4 h-4 rounded accent-indigo-600 cursor-pointer" />
                        </td>
                        <td className="p-3 font-mono text-xs">#{order.id?.slice(-8).toUpperCase()}</td>
                        <td className="p-3">
                          <p className="font-medium">{order.customer_name}</p>
                          <p className="text-xs text-muted-foreground">{order.customer_phone}</p>
                        </td>
                        <td className="p-3 text-xs text-muted-foreground">{new Date(order.created_date).toLocaleDateString()}</td>
                        <td className="p-3 text-xs text-muted-foreground">{order.items?.length || 0} items</td>
                        <td className="p-3 text-xs">{order.payment_method}</td>
                        <td className="p-3">
                          <select value={order.status} onChange={e => onStatusChange(order.id, e.target.value)} className={`text-[10px] font-mono px-2.5 py-1.5 rounded-full border-none outline-none cursor-pointer ${STATUS_COLORS[order.status]}`}>
                            {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </td>
                        <td className="p-3 text-right font-tabular font-medium">{order.total_amount?.toLocaleString()} ETB</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} className="p-2 rounded-xl border border-border disabled:opacity-30 hover:bg-muted">
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm text-muted-foreground">Page {page + 1} of {totalPages}</span>
              <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1} className="p-2 rounded-xl border border-border disabled:opacity-30 hover:bg-muted">
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}