import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { TrendingUp, TrendingDown, DollarSign, Truck } from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

const COLORS = ["#4F46E5", "#F59E0B", "#10B981", "#EF4444", "#8B5CF6", "#EC4899", "#06B6D4", "#F97316"];

export default function AdminAnalytics({ products, orders, users }) {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    base44.entities.Payment.list("-created_date", 200).then(setPayments).catch(() => {});
  }, []);

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // Monthly revenue (last 6 months)
  const monthlyData = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const month = d.getMonth();
    const year = d.getFullYear();
    const monthOrders = orders.filter(o => new Date(o.created_date).getMonth() === month && new Date(o.created_date).getFullYear() === year);
    const revenue = monthOrders.filter(o => o.status === "Delivered").reduce((s, o) => s + (o.total_amount || 0), 0);
    monthlyData.push({ name: monthNames[month], revenue, orders: monthOrders.length });
  }

  // Weekly sales (last 7 days)
  const weeklyData = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dayStr = d.toDateString();
    const dayOrders = orders.filter(o => new Date(o.created_date).toDateString() === dayStr);
    const revenue = dayOrders.reduce((s, o) => s + (o.total_amount || 0), 0);
    const dayLabel = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()];
    weeklyData.push({ name: dayLabel, revenue, orders: dayOrders.length });
  }

  // Best-selling products
  const bestSellers = [...products].sort((a, b) => (b.sold_quantity || 0) - (a.sold_quantity || 0)).slice(0, 8);
  const maxSold = Math.max(...bestSellers.map(p => p.sold_quantity || 0), 1);

  // Category performance
  const CATEGORIES = ["Men", "Women", "Kids", "Formal", "Casual", "Leather"];
  const categoryData = CATEGORIES.map(c => ({
    name: c,
    count: products.filter(p => p.category === c).length,
    revenue: orders
      .filter(o => o.items?.some(i => products.find(p => p.id === i.product_id)?.category === c))
      .filter(o => o.status === "Delivered")
      .reduce((s, o) => s + (o.total_amount || 0), 0),
  })).filter(c => c.count > 0);

  // Payment method usage
  const paymentMethods = ["Cash on Delivery", "Telebirr", "CBE Birr"];
  const paymentData = paymentMethods.map(m => ({
    name: m,
    value: orders.filter(o => o.payment_method === m).length,
  })).filter(p => p.value > 0);

  // Delivery zone statistics
  const zoneStats = [];
  orders.forEach(o => {
    const zone = o.delivery_zone || "Unknown";
    const existing = zoneStats.find(z => z.name === zone);
    if (existing) {
      existing.orders++;
      existing.revenue += o.total_amount || 0;
    } else {
      zoneStats.push({ name: zone, orders: 1, revenue: o.total_amount || 0 });
    }
  });
  zoneStats.sort((a, b) => b.orders - a.orders);

  // Customer growth
  const customerGrowth = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const month = d.getMonth();
    const year = d.getFullYear();
    const count = users.filter(u => new Date(u.created_date).getMonth() === month && new Date(u.created_date).getFullYear() === year).length;
    customerGrowth.push({ name: monthNames[month], customers: count });
  }

  // Order trend (by status)
  const orderTrendData = [
    { name: "Pending", value: orders.filter(o => o.status === "Pending").length },
    { name: "Approved", value: orders.filter(o => o.status === "Approved").length },
    { name: "Preparing", value: orders.filter(o => o.status === "Preparing").length },
    { name: "Out for Delivery", value: orders.filter(o => o.status === "Out for Delivery").length },
    { name: "Delivered", value: orders.filter(o => o.status === "Delivered").length },
    { name: "Cancelled", value: orders.filter(o => o.status === "Cancelled").length },
  ].filter(d => d.value > 0);

  // Conversion stats
  const totalOrders = orders.length;
  const deliveredOrders = orders.filter(o => o.status === "Delivered").length;
  const cancelledOrders = orders.filter(o => o.status === "Cancelled").length;
  const conversionRate = totalOrders > 0 ? ((deliveredOrders / totalOrders) * 100).toFixed(1) : 0;
  const cancelRate = totalOrders > 0 ? ((cancelledOrders / totalOrders) * 100).toFixed(1) : 0;

  // Total revenue
  const totalRevenue = orders.filter(o => o.status === "Delivered").reduce((s, o) => s + (o.total_amount || 0), 0);
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-border/60 bg-card p-5 shadow-soft">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-foreground">Total Revenue</p>
            <DollarSign size={16} className="text-green-600" />
          </div>
          <p className="text-2xl font-bold font-tabular">{totalRevenue.toLocaleString()} ETB</p>
        </div>
        <div className="rounded-xl border border-border/60 bg-card p-5 shadow-soft">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-foreground">Avg Order Value</p>
            <TrendingUp size={16} className="text-blue-600" />
          </div>
          <p className="text-2xl font-bold font-tabular">{avgOrderValue.toLocaleString()} ETB</p>
        </div>
        <div className="rounded-xl border border-border/60 bg-card p-5 shadow-soft">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-foreground">Conversion Rate</p>
            <TrendingUp size={16} className="text-green-600" />
          </div>
          <p className="text-2xl font-bold font-tabular">{conversionRate}%</p>
        </div>
        <div className="rounded-xl border border-border/60 bg-card p-5 shadow-soft">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-foreground">Cancel Rate</p>
            <TrendingDown size={16} className="text-red-600" />
          </div>
          <p className="text-2xl font-bold font-tabular">{cancelRate}%</p>
        </div>
      </div>

      {/* Revenue Trends */}
      <div className="rounded-xl border border-border/60 bg-card p-6 shadow-soft">
        <h3 className="text-sm font-semibold tracking-widest uppercase mb-4">Revenue Trends (6 Months)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="revenue" stroke="#4F46E5" strokeWidth={2} name="Revenue (ETB)" />
            <Line type="monotone" dataKey="orders" stroke="#F59E0B" strokeWidth={2} name="Orders" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Weekly Sales + Payment Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-border/60 bg-card p-6 shadow-soft">
          <h3 className="text-sm font-semibold tracking-widest uppercase mb-4">Weekly Sales Chart</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="revenue" fill="#4F46E5" name="Revenue (ETB)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-border/60 bg-card p-6 shadow-soft">
          <h3 className="text-sm font-semibold tracking-widest uppercase mb-4">Payment Method Usage</h3>
          {paymentData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={paymentData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {paymentData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">No payment data yet</div>
          )}
        </div>
      </div>

      {/* Best-selling Products */}
      <div className="rounded-xl border border-border/60 bg-card p-6 shadow-soft">
        <h3 className="text-sm font-semibold tracking-widest uppercase mb-4">Best-Selling Products</h3>
        {bestSellers.some(p => p.sold_quantity > 0) ? (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={bestSellers.map(p => ({ name: p.name?.substring(0, 15), sold: p.sold_quantity || 0 }))} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={100} />
              <Tooltip />
              <Bar dataKey="sold" fill="#F59E0B" name="Units Sold" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">No sales data yet</div>
        )}
      </div>

      {/* Category Performance + Customer Growth */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-border/60 bg-card p-6 shadow-soft">
          <h3 className="text-sm font-semibold tracking-widest uppercase mb-4">Category Performance</h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#10B981" name="Products" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">No data yet</div>
          )}
        </div>

        <div className="rounded-xl border border-border/60 bg-card p-6 shadow-soft">
          <h3 className="text-sm font-semibold tracking-widest uppercase mb-4">Customer Growth</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={customerGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="customers" stroke="#8B5CF6" strokeWidth={2} name="New Customers" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Order Trends + Delivery Zone Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-border/60 bg-card p-6 shadow-soft">
          <h3 className="text-sm font-semibold tracking-widest uppercase mb-4">Order Trends by Status</h3>
          {orderTrendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={orderTrendData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {orderTrendData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">No orders yet</div>
          )}
        </div>

        <div className="rounded-xl border border-border/60 bg-card p-6 shadow-soft">
          <h3 className="text-sm font-semibold tracking-widest uppercase mb-4">Delivery Zone Statistics</h3>
          {zoneStats.length > 0 ? (
            <div className="space-y-3">
              {zoneStats.slice(0, 6).map((z, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Truck size={14} className="text-muted-foreground shrink-0" />
                  <span className="text-sm text-foreground flex-1 truncate">{z.name}</span>
                  <span className="text-xs font-mono text-muted-foreground">{z.orders} orders</span>
                  <span className="text-xs font-tabular font-semibold w-24 text-right">{z.revenue.toLocaleString()} ETB</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">No delivery data yet</div>
          )}
        </div>
      </div>
    </div>
  );
}