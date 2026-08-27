import React, { useState } from "react";
import { ChevronRight, Phone, MapPin, CreditCard, ChevronDown, Package } from "lucide-react";
import OrderTimeline from "@/components/shared/OrderTimeline";
import { ORDER_STATUSES, STATUS_DOTS, STATUS_COLORS } from "@/lib/orderStatuses";

const STATUS_ACCENTS = {
  "Pending": "border-yellow-300/50 bg-yellow-50/40",
  "Approved": "border-blue-300/50 bg-blue-50/40",
  "Preparing": "border-purple-300/50 bg-purple-50/40",
  "Out for Delivery": "border-indigo-300/50 bg-indigo-50/40",
  "Delivered": "border-green-300/50 bg-green-50/40",
  "Cancelled": "border-red-300/50 bg-red-50/40",
};

export default function OrdersByStatusBoard({ orders, onStatusChange }) {
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [collapsedCols, setCollapsedCols] = useState({});

  const toggleCol = (status) => {
    setCollapsedCols(c => ({ ...c, [status]: !c[status] }));
  };

  return (
    <div className="space-y-3">
      {ORDER_STATUSES.map(status => {
        const columnOrders = orders.filter(o => o.status === status);
        const total = columnOrders.reduce((s, o) => s + (o.total_amount || 0), 0);
        const isCollapsed = collapsedCols[status];

        return (
          <div key={status} className={`rounded-xl border ${STATUS_ACCENTS[status] || "border-border/60 bg-card"} overflow-hidden transition-all`}>
            {/* Column Header — collapsible */}
            <button
              onClick={() => toggleCol(status)}
              className="w-full flex items-center justify-between gap-3 p-4 hover:bg-foreground/[0.02] transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className={`w-2.5 h-2.5 rounded-full ${STATUS_DOTS[status]}`} />
                <span className="text-sm font-semibold tracking-wide">{status}</span>
                <span className="text-[10px] font-mono bg-background/80 px-2 py-0.5 rounded-full border border-border/40">{columnOrders.length}</span>
              </div>
              <div className="flex items-center gap-3">
                {columnOrders.length > 0 && (
                  <span className="text-[11px] font-mono text-muted-foreground hidden sm:inline">{total.toLocaleString()} ETB</span>
                )}
                <ChevronDown size={18} className={`text-muted-foreground transition-transform ${isCollapsed ? "" : "rotate-180"}`} />
              </div>
            </button>

            {/* Cards */}
            {!isCollapsed && (
              <div className="px-4 pb-4">
                {columnOrders.length === 0 ? (
                  <p className="text-center py-6 text-xs text-muted-foreground/50">No orders</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {columnOrders.map(order => {
                      const isOpen = expandedOrder === order.id;
                      return (
                        <div key={order.id} className="rounded-lg border border-border/60 bg-card p-4 shadow-soft hover:shadow-soft-lg transition-all">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="min-w-0">
                              <p className="text-[9px] font-mono text-muted-foreground">#{order.id?.slice(-8).toUpperCase()}</p>
                              <p className="text-sm font-medium truncate mt-0.5">{order.customer_name}</p>
                            </div>
                            <span className="font-bold font-tabular text-sm whitespace-nowrap">{order.total_amount?.toLocaleString()}</span>
                          </div>

                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground mb-3">
                            {order.delivery_zone && (
                              <span className="flex items-center gap-1"><MapPin size={10} /> {order.delivery_zone}</span>
                            )}
                            <span className="flex items-center gap-1"><CreditCard size={10} /> {order.payment_method}</span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <select
                              value={order.status}
                              onChange={e => onStatusChange(order.id, e.target.value)}
                              className={`text-[10px] font-mono px-2 py-1 rounded-full border-none outline-none cursor-pointer flex-1 ${STATUS_COLORS[order.status] || "bg-gray-100"}`}
                            >
                              {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <button
                              onClick={() => setExpandedOrder(isOpen ? null : order.id)}
                              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                            >
                              <ChevronRight size={14} className={`transition-transform ${isOpen ? "rotate-90" : ""}`} />
                            </button>
                          </div>

                          {isOpen && (
                            <div className="mt-3 pt-3 border-t border-border space-y-3">
                              <OrderTimeline order={order} />
                              <div className="space-y-1 pt-2 border-t border-border/60">
                                {order.items?.map((item, i) => (
                                  <p key={i} className="text-xs text-muted-foreground">{item.name} × {item.quantity}</p>
                                ))}
                              </div>
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Phone size={11} /> {order.customer_phone}
                              </div>
                              {order.delivery_address && (
                                <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
                                  <MapPin size={11} className="mt-0.5" /> {order.delivery_address}
                                </div>
                              )}
                              {order.transaction_reference && (
                                <p className="text-[10px] font-mono text-muted-foreground">Ref: {order.transaction_reference}</p>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {orders.length === 0 && (
        <div className="text-center py-16 rounded-xl border border-border/60 bg-card">
          <Package size={40} className="mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground">No orders</p>
        </div>
      )}
    </div>
  );
}