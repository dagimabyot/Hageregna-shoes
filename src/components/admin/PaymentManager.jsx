import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { CreditCard, Search, Download } from "lucide-react";
import { STATUS_COLORS as ORDER_STATUS_COLORS } from "@/lib/orderStatuses";

const PAYMENT_STATUS_COLORS = {
  "Pending": "bg-yellow-100 text-yellow-800",
  "Paid": "bg-green-100 text-green-800",
  "Failed": "bg-red-100 text-red-800",
  "Refunded": "bg-blue-100 text-blue-800",
};

export default function PaymentManager() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    base44.entities.Payment.list("-created_date", 100)
      .then(setPayments)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = payments.filter(p => {
    const q = search.trim().toLowerCase();
    const matchSearch = !q || p.customer_name?.toLowerCase().includes(q) || p.order_id?.toLowerCase().includes(q) || p.transaction_id?.toLowerCase().includes(q);
    const matchStatus = !statusFilter || p.payment_status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalRevenue = payments.filter(p => p.payment_status === "Paid").reduce((s, p) => s + (p.amount || 0), 0);
  const pendingCount = payments.filter(p => p.payment_status === "Pending").length;
  const paidCount = payments.filter(p => p.payment_status === "Paid").length;

  if (loading) return <div className="animate-pulse h-48 bg-muted rounded-xl" />;

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl border border-border/60 bg-card p-4 shadow-soft">
          <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-foreground">Total Revenue</p>
          <p className="text-xl font-bold font-tabular mt-1">{totalRevenue.toLocaleString()} ETB</p>
        </div>
        <div className="rounded-xl border border-border/60 bg-card p-4 shadow-soft">
          <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-foreground">Paid</p>
          <p className="text-xl font-bold font-tabular mt-1 text-green-600">{paidCount}</p>
        </div>
        <div className="rounded-xl border border-border/60 bg-card p-4 shadow-soft">
          <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-foreground">Pending</p>
          <p className="text-xl font-bold font-tabular mt-1 text-yellow-600">{pendingCount}</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by customer, order ID, or transaction..." className="w-full pl-9 pr-3 py-2 text-sm bg-muted/40 rounded-lg outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="text-sm border border-border rounded-lg px-3 py-2 outline-none bg-card">
          <option value="">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Paid">Paid</option>
          <option value="Failed">Failed</option>
          <option value="Refunded">Refunded</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border/60 bg-card shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-[10px] font-mono tracking-[0.2em] uppercase text-muted-foreground bg-muted/30">
                <th className="text-left p-3 font-medium">Payment ID</th>
                <th className="text-left p-3 font-medium">Customer</th>
                <th className="text-left p-3 font-medium">Order</th>
                <th className="text-right p-3 font-medium">Amount</th>
                <th className="text-left p-3 font-medium">Method</th>
                <th className="text-center p-3 font-medium">Status</th>
                <th className="text-left p-3 font-medium">Transaction</th>
                <th className="text-left p-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="border-b border-border/50 last:border-0 hover:bg-muted/20">
                  <td className="p-3 font-mono text-[10px] text-muted-foreground">#{p.id?.slice(-8).toUpperCase()}</td>
                  <td className="p-3 font-medium">{p.customer_name}</td>
                  <td className="p-3 font-mono text-[10px] text-muted-foreground">#{p.order_id?.slice(-8).toUpperCase()}</td>
                  <td className="p-3 text-right font-tabular font-semibold">{p.amount?.toLocaleString()} ETB</td>
                  <td className="p-3 text-muted-foreground">{p.payment_method}</td>
                  <td className="p-3 text-center">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${PAYMENT_STATUS_COLORS[p.payment_status] || "bg-gray-100"}`}>{p.payment_status}</span>
                  </td>
                  <td className="p-3 font-mono text-[10px] text-muted-foreground">{p.transaction_id || "—"}</td>
                  <td className="p-3 text-muted-foreground text-xs">{new Date(p.created_date).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <CreditCard size={32} className="mx-auto text-muted-foreground/30 mb-2" />
            <p className="text-muted-foreground text-sm">No payments found</p>
          </div>
        )}
      </div>
    </div>
  );
}