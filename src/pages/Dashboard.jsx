import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Package, Heart, Star, User, ChevronRight, Clock, ShoppingBag, Truck, CheckCircle, MapPin, Bell, ArrowRight, X, LayoutDashboard } from "lucide-react";
import OrderTimeline from "@/components/shared/OrderTimeline";
import StarRating from "@/components/shared/StarRating";
import { STATUS_COLORS } from "@/lib/orderStatuses";
import PageHeader from "@/components/shared/PageHeader";

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-5 shadow-soft">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-foreground">{label}</p>
        <div className={`p-2 rounded-lg ${accent || "bg-primary/10"}`}>
          <Icon size={16} className="text-primary" />
        </div>
      </div>
      <p className="text-2xl font-bold font-tabular text-foreground">{value}</p>
    </div>
  );
}

function QuickAction({ to, icon: Icon, label }) {
  return (
    <Link to={to} className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border/60 bg-card shadow-soft hover:shadow-soft-lg hover:border-primary/30 transition-all">
      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
        <Icon size={18} className="text-primary" />
      </div>
      <span className="text-[11px] tracking-widest uppercase font-medium">{label}</span>
    </Link>
  );
}

export default function Dashboard() {
  const [tab, setTab] = useState("overview");
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  useEffect(() => {
    Promise.all([
      base44.auth.me().catch(() => null),
      base44.entities.Order.list("-created_date", 50).catch(() => []),
      base44.entities.Wishlist.list().catch(() => []),
      base44.entities.Review.list("-created_date", 20).catch(() => []),
      base44.entities.Notification.list("-created_date", 10).catch(() => []),
    ]).then(([u, o, w, r, n]) => {
      setUser(u);
      setOrders(o);
      setWishlist(w);
      setReviews(r);
      setNotifications(n);
      setLoading(false);
    });

    try {
      const viewed = JSON.parse(localStorage.getItem("recently_viewed") || "[]");
      setRecentlyViewed(viewed.slice(0, 4));
    } catch { setRecentlyViewed([]); }

    const unsub = base44.entities.Order.subscribe(() => {
      base44.entities.Order.list("-created_date", 50).then(setOrders).catch(() => {});
    });
    const unsubNotif = base44.entities.Notification.subscribe(() => {
      base44.entities.Notification.list("-created_date", 10).then(setNotifications).catch(() => {});
    });
    return () => { unsub(); unsubNotif(); };
  }, []);

  const markNotificationRead = async (id) => {
    await base44.entities.Notification.update(id, { is_read: true });
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const TABS = [
    { key: "overview", label: "Overview", icon: LayoutDashboard },
    { key: "orders", label: "Orders", icon: Package, count: orders.length },
    { key: "wishlist", label: "Wishlist", icon: Heart, count: wishlist.length },
    { key: "reviews", label: "Reviews", icon: Star, count: reviews.length },
    { key: "profile", label: "Profile", icon: User },
  ];

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === "Pending").length;
  const deliveredOrders = orders.filter(o => o.status === "Delivered").length;
  const wishlistCount = wishlist.length;
  const addressesCount = user?.addresses?.length || (user?.address ? 1 : 0);
  const unreadNotifications = notifications.filter(n => !n.is_read);

  if (loading) {
    return <div className="max-w-4xl mx-auto px-4 py-12"><div className="animate-pulse h-96 bg-foreground/5 rounded-xl" /></div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <PageHeader title="My Account" subtitle={`Welcome back, ${user?.full_name || user?.email?.split("@")[0] || "Guest"}.`}>
        {unreadNotifications.length > 0 && (
          <span className="flex items-center gap-1.5 text-xs text-primary font-medium bg-primary/10 px-3 py-1.5 rounded-full ml-auto">
            <Bell size={13} /> {unreadNotifications.length} new
          </span>
        )}
      </PageHeader>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6 mt-6">
        <StatCard icon={Package} label="Total Orders" value={totalOrders} />
        <StatCard icon={Clock} label="Pending" value={pendingOrders} accent="bg-yellow-100" />
        <StatCard icon={CheckCircle} label="Delivered" value={deliveredOrders} accent="bg-green-100" />
        <StatCard icon={Heart} label="Wishlist" value={wishlistCount} accent="bg-red-100" />
        <StatCard icon={MapPin} label="Addresses" value={addressesCount} accent="bg-blue-100" />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <QuickAction to="/products" icon={ShoppingBag} label="Shop Now" />
        <QuickAction to="/cart" icon={ShoppingBag} label="View Cart" />
        <QuickAction to="/track-order" icon={Truck} label="Track Orders" />
        <QuickAction to="/profile" icon={User} label="Edit Profile" />
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="rounded-xl border border-border/60 bg-card p-5 shadow-soft mb-8">
          <h3 className="text-sm font-semibold tracking-widest uppercase mb-4 flex items-center gap-2">
            <Bell size={15} className="text-primary" /> Notifications
            {unreadNotifications.length > 0 && <span className="text-[10px] bg-primary text-primary-foreground px-2 py-0.5 rounded-full">{unreadNotifications.length} new</span>}
          </h3>
          <div className="space-y-2">
            {notifications.slice(0, 4).map(n => (
              <div key={n.id} className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${n.is_read ? "bg-muted/20" : "bg-primary/5 border border-primary/10"}`}>
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.is_read ? "bg-muted-foreground/30" : "bg-primary"}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{n.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                  <p className="text-[10px] text-muted-foreground/50 mt-1">{new Date(n.created_date).toLocaleString()}</p>
                </div>
                {!n.is_read && (
                  <button onClick={() => markNotificationRead(n.id)} className="p-1 text-muted-foreground hover:text-foreground">
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-4 mb-8 border-b border-border">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`flex items-center gap-2 px-4 py-2 text-[12px] tracking-widest uppercase font-medium whitespace-nowrap transition-colors rounded-lg ${tab === t.key ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}>
            <t.icon size={14} />
            {t.label}
            {t.count !== undefined && <span className="text-[10px] opacity-60">({t.count})</span>}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {tab === "overview" && (
        <div className="space-y-6">
          {/* Recent Orders */}
          <div className="rounded-xl border border-border/60 bg-card p-6 shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold tracking-widest uppercase">Recent Orders</h3>
              <Link to="/order-history" className="text-xs text-primary hover:underline flex items-center gap-1">View All <ArrowRight size={12} /></Link>
            </div>
            {orders.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No orders yet. <Link to="/products" className="text-primary hover:underline">Start shopping →</Link></p>
            ) : (
              <div className="space-y-3">
                {orders.slice(0, 3).map(order => (
                  <Link key={order.id} to={`/order/${order.id}`} className="flex items-center justify-between gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors">
                    <div className="min-w-0">
                      <p className="text-[10px] font-mono text-muted-foreground">#{order.id?.slice(-8).toUpperCase()}</p>
                      <p className="text-sm font-medium truncate">{order.items?.length} items · {order.delivery_zone}</p>
                      <p className="text-xs text-muted-foreground">{new Date(order.created_date).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-sm font-bold font-tabular">{order.total_amount?.toLocaleString()} ETB</span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${STATUS_COLORS[order.status] || "bg-gray-100"}`}>{order.status}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Recently Viewed */}
          {recentlyViewed.length > 0 && (
            <div className="rounded-xl border border-border/60 bg-card p-6 shadow-soft">
              <h3 className="text-sm font-semibold tracking-widest uppercase mb-4">Recently Viewed</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {recentlyViewed.map(p => (
                  <Link key={p.id} to={`/product/${p.id}`} className="group block">
                    <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                      {p.image && <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
                    </div>
                    <p className="text-sm mt-2 line-clamp-1">{p.name}</p>
                    <p className="text-sm font-bold font-tabular">{p.price?.toLocaleString()} ETB</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Latest Reviews */}
          {reviews.length > 0 && (
            <div className="rounded-xl border border-border/60 bg-card p-6 shadow-soft">
              <h3 className="text-sm font-semibold tracking-widest uppercase mb-4">Latest Reviews</h3>
              <div className="space-y-3">
                {reviews.slice(0, 3).map(r => (
                  <div key={r.id} className="p-3 rounded-lg bg-muted/20">
                    <p className="text-sm font-medium">{r.product_name}</p>
                    <div className="my-1"><StarRating rating={r.rating} showCount={false} size={12} /></div>
                    {r.comment && <p className="text-xs text-muted-foreground line-clamp-2">{r.comment}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Orders Tab */}
      {tab === "orders" && (
        <div>
          {orders.length === 0 ? (
            <div className="text-center py-16">
              <Package size={40} className="mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">No orders yet</p>
              <Link to="/products" className="text-sm text-primary hover:underline mt-2 inline-block">Start Shopping</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map(order => {
                const isOpen = expandedOrder === order.id;
                return (
                  <div key={order.id} className="rounded-xl border border-border/60 bg-card shadow-soft overflow-hidden">
                    <button onClick={() => setExpandedOrder(isOpen ? null : order.id)} className="w-full p-5 text-left hover:bg-muted/20 transition-colors">
                      <div className="flex items-start justify-between mb-3 gap-3">
                        <div className="min-w-0">
                          <p className="text-[10px] font-mono text-muted-foreground">ORDER #{order.id?.slice(-8).toUpperCase()}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1"><Clock size={11} /> {new Date(order.created_date).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`text-[10px] font-mono tracking-wider px-2.5 py-1 rounded-full ${STATUS_COLORS[order.status] || "bg-gray-100"}`}>{order.status}</span>
                          <ChevronRight size={16} className={`text-muted-foreground transition-transform ${isOpen ? "rotate-90" : ""}`} />
                        </div>
                      </div>
                      <div className="space-y-1 mb-3">
                        {order.items?.map((item, i) => (
                          <p key={i} className="text-sm text-muted-foreground">{item.name} × {item.quantity} — {(item.price * item.quantity).toLocaleString()} ETB</p>
                        ))}
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-border">
                        <span className="text-sm text-muted-foreground">{order.delivery_zone}</span>
                        <span className="font-bold font-tabular">{order.total_amount?.toLocaleString()} ETB</span>
                      </div>
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 pt-1 border-t border-border bg-muted/10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                          <div>
                            <h4 className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground font-mono mb-4">Order Timeline</h4>
                            <OrderTimeline order={order} />
                          </div>
                          <div>
                            <h4 className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground font-mono mb-4">Details</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between"><span className="text-muted-foreground">Customer</span><span>{order.customer_name}</span></div>
                              <div className="flex justify-between"><span className="text-muted-foreground">Phone</span><span>{order.customer_phone}</span></div>
                              <div className="flex justify-between"><span className="text-muted-foreground">Payment</span><span>{order.payment_method}</span></div>
                              <div className="flex justify-between"><span className="text-muted-foreground">Delivery Fee</span><span className="font-tabular">{Number(order.delivery_fee || 0).toLocaleString()} ETB</span></div>
                              {order.delivery_address && <div className="pt-2 border-t border-border"><span className="text-muted-foreground text-xs">Address: </span><span className="text-xs">{order.delivery_address}</span></div>}
                              {order.tracking_note && <div className="mt-2 p-2 rounded-lg bg-primary/5 border border-primary/10 text-xs text-primary">{order.tracking_note}</div>}
                              <Link to={`/order/${order.id}`} className="block text-xs text-primary hover:underline mt-3">View Full Details →</Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Wishlist Tab */}
      {tab === "wishlist" && (
        <div>
          {wishlist.length === 0 ? (
            <div className="text-center py-16">
              <Heart size={40} className="mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">Your wishlist is empty</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {wishlist.map(item => (
                <Link key={item.id} to={`/product/${item.product_id}`} className="group block">
                  <div className="aspect-square bg-muted overflow-hidden rounded-xl">
                    {item.product_image && <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
                  </div>
                  <p className="text-sm mt-2 line-clamp-1">{item.product_name}</p>
                  <p className="text-sm font-bold font-tabular">{item.product_price?.toLocaleString()} ETB</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Reviews Tab */}
      {tab === "reviews" && (
        <div>
          {reviews.length === 0 ? (
            <div className="text-center py-16">
              <Star size={40} className="mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">No reviews yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map(r => (
                <div key={r.id} className="rounded-xl border border-border/60 p-5 bg-card shadow-soft">
                  <p className="text-sm font-medium">{r.product_name}</p>
                  <div className="my-2"><StarRating rating={r.rating} showCount={false} size={12} /></div>
                  {r.comment && <p className="text-sm text-muted-foreground">{r.comment}</p>}
                  <p className="text-xs text-muted-foreground/60 mt-2">{new Date(r.created_date).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Profile Tab */}
      {tab === "profile" && (
        <div className="rounded-xl border border-border/60 p-6 bg-card max-w-md shadow-soft">
          <h3 className="text-sm font-semibold tracking-widest uppercase mb-4">Profile</h3>
          <div className="space-y-4">
            <div>
              <p className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground font-mono mb-1">Name</p>
              <p className="text-sm">{user?.full_name || "—"}</p>
            </div>
            <div>
              <p className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground font-mono mb-1">Email</p>
              <p className="text-sm">{user?.email || "—"}</p>
            </div>
            <div>
              <p className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground font-mono mb-1">Phone</p>
              <p className="text-sm">{user?.phone || "—"}</p>
            </div>
            <div>
              <p className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground font-mono mb-1">Role</p>
              <p className="text-sm capitalize">{user?.role || "—"}</p>
            </div>
            <Link to="/profile" className="block text-center text-sm text-primary hover:underline border border-primary/30 rounded-lg py-2.5 mt-4 hover:bg-primary/5 transition-colors">
              Edit Full Profile →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}