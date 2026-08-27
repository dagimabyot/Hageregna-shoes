import React, { useMemo } from "react";
import { FileText, TrendingUp, ShoppingBag, DollarSign, Users, Package } from "lucide-react";

export default function Reports({ products, orders, users }) {
  const stats = useMemo(() => {
    const totalRevenue = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
    const pendingOrders = orders.filter(o => o.status === "Order Placed" || o.status === "Pending").length;
    const deliveredOrders = orders.filter(o => o.status === "Delivered").length;
    const cancelledOrders = orders.filter(o => o.status === "Cancelled").length;
    const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
    const totalProductsSold = orders.reduce((sum, o) => sum + (o.items?.reduce((s, i) => s + (i.quantity || 0), 0) || 0), 0);
    const lowStockProducts = products.filter(p => (p.stock || 0) <= 5).length;
    const outOfStock = products.filter(p => (p.stock || 0) === 0).length;

    // Revenue by category
    const revenueByCategory = {};
    orders.forEach(o => {
      o.items?.forEach(item => {
        const product = products.find(p => p.id === item.product_id);
        const cat = product?.category || "Other";
        revenueByCategory[cat] = (revenueByCategory[cat] || 0) + (item.price * item.quantity || 0);
      });
    });

    // Top selling products
    const productSales = {};
    orders.forEach(o => {
      o.items?.forEach(item => {
        const name = item.name || item.product_name || "Unknown";
        productSales[name] = (productSales[name] || 0) + (item.quantity || 0);
      });
    });
    const topProducts = Object.entries(productSales)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return {
      totalRevenue,
      pendingOrders,
      deliveredOrders,
      cancelledOrders,
      avgOrderValue,
      totalProductsSold,
      lowStockProducts,
      outOfStock,
      revenueByCategory,
      topProducts,
    };
  }, [products, orders, users]);

  const STAT_CARDS = [
    { label: "Total Revenue", value: `${stats.totalRevenue.toLocaleString()} ETB`, icon: DollarSign, color: "text-green-600", bg: "bg-green-50" },
    { label: "Total Orders", value: orders.length, icon: ShoppingBag, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Avg Order Value", value: `${Math.round(stats.avgOrderValue).toLocaleString()} ETB`, icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Products Sold", value: stats.totalProductsSold, icon: Package, color: "text-orange-600", bg: "bg-orange-50" },
    { label: "Pending Orders", value: stats.pendingOrders, icon: ShoppingBag, color: "text-yellow-600", bg: "bg-yellow-50" },
    { label: "Delivered", value: stats.deliveredOrders, icon: Package, color: "text-green-600", bg: "bg-green-50" },
    { label: "Low Stock Items", value: stats.lowStockProducts, icon: Package, color: "text-red-600", bg: "bg-red-50" },
    { label: "Total Customers", value: users.length, icon: Users, color: "text-indigo-600", bg: "bg-indigo-50" },
  ];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <FileText size={20} className="text-primary" /> Reports
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Business performance overview</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {STAT_CARDS.map((card, i) => (
          <div key={i} className="rounded-xl border border-border/60 bg-card p-4 shadow-soft">
            <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center mb-3`}>
              <card.icon size={18} className={card.color} />
            </div>
            <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-mono">{card.label}</p>
            <p className="text-xl font-bold mt-1">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Category */}
        <div className="rounded-xl border border-border/60 bg-card p-6 shadow-soft">
          <h3 className="text-sm font-semibold tracking-widest uppercase mb-4">Revenue by Category</h3>
          {Object.keys(stats.revenueByCategory).length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No sales data yet</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(stats.revenueByCategory)
                .sort((a, b) => b[1] - a[1])
                .map(([cat, rev]) => {
                  const maxRev = Math.max(...Object.values(stats.revenueByCategory));
                  const pct = maxRev > 0 ? (rev / maxRev) * 100 : 0;
                  return (
                    <div key={cat}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">{cat}</span>
                        <span className="font-tabular text-muted-foreground">{rev.toLocaleString()} ETB</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* Top Selling Products */}
        <div className="rounded-xl border border-border/60 bg-card p-6 shadow-soft">
          <h3 className="text-sm font-semibold tracking-widest uppercase mb-4">Top Selling Products</h3>
          {stats.topProducts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No sales data yet</p>
          ) : (
            <div className="space-y-3">
              {stats.topProducts.map(([name, qty], i) => (
                <div key={name} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-sm font-medium truncate flex-1">{name}</span>
                  <span className="text-sm font-tabular text-muted-foreground shrink-0">{qty} sold</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Order Status Breakdown */}
        <div className="rounded-xl border border-border/60 bg-card p-6 shadow-soft lg:col-span-2">
          <h3 className="text-sm font-semibold tracking-widest uppercase mb-4">Order Status Breakdown</h3>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {[
              { label: "Pending", count: stats.pendingOrders, color: "bg-yellow-50 text-yellow-700 border-yellow-200" },
              { label: "Delivered", count: stats.deliveredOrders, color: "bg-green-50 text-green-700 border-green-200" },
              { label: "Cancelled", count: stats.cancelledOrders, color: "bg-red-50 text-red-700 border-red-200" },
              { label: "Total Orders", count: orders.length, color: "bg-blue-50 text-blue-700 border-blue-200" },
              { label: "Low Stock", count: stats.lowStockProducts, color: "bg-orange-50 text-orange-700 border-orange-200" },
              { label: "Out of Stock", count: stats.outOfStock, color: "bg-red-50 text-red-700 border-red-200" },
            ].map((item, i) => (
              <div key={i} className={`rounded-lg border p-3 text-center ${item.color}`}>
                <p className="text-2xl font-bold">{item.count}</p>
                <p className="text-[10px] font-mono tracking-wider uppercase mt-1">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}