import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { ShoppingBag, Package, Users, Clock, AlertTriangle, XCircle, Bell, Calendar, TrendingUp } from "lucide-react";
import { ORDER_STATUSES, STATUS_COLORS } from "@/lib/orderStatuses";

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-4 shadow-soft">
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-foreground">{label}</p>
        <div className={`p-1.5 rounded-lg ${accent || "bg-primary/10"}`}><Icon size={14} className="text-primary" /></div>
      </div>
      <p className="text-xl font-bold font-tabular">{value}</p>
    </div>
  );
}

export default function AdminDashboard({ products, orders, users }) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    base44.entities.Notification.list("-created_date", 5).then(setNotifications).catch(() => {});
  }, []);

  const pendingOrders = orders.filter(o => o.status === "Pending").length;
  const preparingOrders = orders.filter(o => o.status === "Preparing").length;
  const outForDelivery = orders.filter(o => o.status === "Out for Delivery").length;
  const lowStock = products.filter(p => p.stock > 0 && p.stock <= 5);
  const outOfStock = products.filter(p => !p.stock || p.stock === 0);

  const today = new Date().toDateString();
  const todaySales = orders.filter(o => new Date(o.created_date).toDateString() === today).reduce((s, o) => s + (o.total_amount || 0), 0);
  const todayOrders = orders.filter(o => new Date(o.created_date).toDateString() === today).length;

  const thisMonth = new Date().getMonth();
  const monthlyRevenue = orders.filter(o => o.status === "Delivered" && new Date(o.created_date).getMonth() === thisMonth).reduce((s, o) => s + (o.total_amount || 0), 0);

  const pendingPayments = orders.filter(o => o.status !== "Cancelled" && o.payment_method !== "Cash on Delivery" && !o.transaction_reference).length;

  return (
    <div className="space-y-6">
      {/* Quick Overview Stats */}
      <div>
        <h2 className="text-sm font-semibold tracking-widest uppercase mb-3">Quick Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          <StatCard icon={ShoppingBag} label="Products" value={products.length} />
          <StatCard icon={Users} label="Customers" value={users.length} />
          <StatCard icon={Package} label="Total Orders" value={orders.length} />
          <StatCard icon={Calendar} label="This Month" value={`${monthlyRevenue.toLocaleString()} ETB`} accent="bg-blue-100" />
          <StatCard icon={TrendingUp} label="Today's Sales" value={`${todaySales.toLocaleString()} ETB`} accent="bg-purple-100" />
          <StatCard icon={Package} label="Today's Orders" value={todayOrders} accent="bg-indigo-100" />
          <StatCard icon={Clock} label="Pending Orders" value={pendingOrders} accent="bg-yellow-100" />
          <StatCard icon={AlertTriangle} label="Low Stock" value={lowStock.length} accent="bg-orange-100" />
        </div>
      </div>

      {/* Pending Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="rounded-xl border border-border/60 bg-card p-6 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold tracking-widest uppercase">Recent Orders</h3>
            <span className="text-xs text-muted-foreground">{orders.length} total</span>
          </div>
          <div className="space-y-3">
            {orders.slice(0, 6).map(order => (
              <div key={order.id} className="flex items-center justify-between gap-3 pb-3 border-b border-border last:border-0 last:pb-0">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{order.customer_name}</p>
                  <p className="text-xs text-muted-foreground">{order.delivery_zone} · {order.items?.length} items</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-tabular font-semibold">{order.total_amount?.toLocaleString()} ETB</p>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${STATUS_COLORS[order.status]}`}>{order.status}</span>
                </div>
              </div>
            ))}
            {orders.length === 0 && <p className="text-sm text-muted-foreground">No orders yet.</p>}
          </div>
        </div>

        {/* Low Stock + Out of Stock */}
        <div className="space-y-6">
          {lowStock.length > 0 && (
            <div className="rounded-xl border border-yellow-300/50 bg-yellow-50/40 p-6">
              <h3 className="text-sm font-semibold tracking-widest uppercase mb-3 flex items-center gap-2 text-yellow-800"><AlertTriangle size={15} /> Low Stock Alert</h3>
              <div className="space-y-1.5">
                {lowStock.slice(0, 5).map(p => (
                  <div key={p.id} className="flex items-center justify-between text-sm">
                    <span className="truncate">{p.name}</span>
                    <span className="font-mono text-yellow-700 text-xs">{p.stock} left</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {outOfStock.length > 0 && (
            <div className="rounded-xl border border-red-300/50 bg-red-50/40 p-6">
              <h3 className="text-sm font-semibold tracking-widest uppercase mb-3 flex items-center gap-2 text-red-800"><XCircle size={15} /> Out of Stock</h3>
              <div className="space-y-1.5">
                {outOfStock.slice(0, 5).map(p => (
                  <div key={p.id} className="flex items-center justify-between text-sm">
                    <span className="truncate">{p.name}</span>
                    <span className="font-mono text-red-700 text-xs">0 units</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {notifications.length > 0 && (
            <div className="rounded-xl border border-border/60 bg-card p-6 shadow-soft">
              <h3 className="text-sm font-semibold tracking-widest uppercase mb-4 flex items-center gap-2"><Bell size={15} className="text-primary" /> Recent Notifications</h3>
              <div className="space-y-2">
                {notifications.slice(0, 4).map(n => (
                  <div key={n.id} className={`p-2.5 rounded-lg ${n.is_read ? "bg-muted/20" : "bg-primary/5 border border-primary/10"}`}>
                    <p className="text-sm font-medium">{n.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{n.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Orders by Status — management view */}
      <div className="rounded-xl border border-border/60 bg-card p-6 shadow-soft">
        <h3 className="text-sm font-semibold tracking-widest uppercase mb-4">Orders by Status</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {ORDER_STATUSES.map(s => {
            const count = orders.filter(o => o.status === s).length;
            return (
              <div key={s} className="text-center p-3 rounded-lg border border-border/60">
                <p className={`text-[10px] font-mono px-2 py-0.5 rounded-full inline-block mb-2 ${STATUS_COLORS[s]}`}>{s}</p>
                <p className="text-2xl font-bold font-tabular">{count}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}