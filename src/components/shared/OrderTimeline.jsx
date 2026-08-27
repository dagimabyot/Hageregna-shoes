import React from "react";
import { Clock, Check, Truck, Package, CheckCircle2, X, CreditCard, Box, Send } from "lucide-react";
import { ORDER_STEPS } from "@/lib/orderStatuses";

const STEP_ICONS = {
  "Order Placed": Clock,
  "Payment Confirmed": CreditCard,
  "Processing": Package,
  "Packed": Box,
  "Shipped": Send,
  "Out for Delivery": Truck,
  "Delivered": CheckCircle2,
};

export default function OrderTimeline({ order }) {
  const history = order.status_history || [];
  const isCancelled = order.status === "Cancelled";
  const isReturned = order.status === "Returned";
  const isTerminal = isCancelled || isReturned;

  const timestamps = {};
  history.forEach(h => {
    if (!timestamps[h.status]) timestamps[h.status] = h.timestamp;
  });
  if (!timestamps["Order Placed"] && order.created_date) {
    timestamps["Order Placed"] = order.created_date;
  }

  const currentIndex = ORDER_STEPS.indexOf(order.status);

  if (isTerminal) {
    return (
      <div className={`rounded-lg border p-4 ${isCancelled ? "border-red-200 bg-red-50" : "border-slate-200 bg-slate-50"}`}>
        <div className={`flex items-center gap-2 ${isCancelled ? "text-red-700" : "text-slate-700"}`}>
          <X size={16} />
          <span className="text-sm font-medium">Order {order.status}</span>
        </div>
        {timestamps[order.status] && (
          <p className={`text-xs mt-1 ${isCancelled ? "text-red-600/70" : "text-slate-600/70"}`}>
            {new Date(timestamps[order.status]).toLocaleString()}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      {ORDER_STEPS.map((step, i) => {
        const Icon = STEP_ICONS[step] || Clock;
        const reached = i <= currentIndex && currentIndex >= 0;
        const isCurrent = i === currentIndex;
        const ts = timestamps[step];
        const isLast = i === ORDER_STEPS.length - 1;
        return (
          <div key={step} className="flex gap-3 pb-6 last:pb-0 relative">
            {!isLast && (
              <div className={`absolute left-[15px] top-8 bottom-0 w-0.5 ${i < currentIndex ? "bg-primary" : "bg-border"}`} />
            )}
            <div
              className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all ${
                reached
                  ? isCurrent
                    ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                    : "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {reached && !isCurrent ? <Check size={14} /> : <Icon size={14} />}
            </div>
            <div className="pt-1">
              <p
                className={`text-sm font-medium ${
                  isCurrent
                    ? "text-primary"
                    : reached
                    ? "text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {step}
                {isCurrent && (
                  <span className="ml-2 text-[10px] font-mono tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                    CURRENT
                  </span>
                )}
              </p>
              {ts ? (
                <p className="text-xs text-muted-foreground mt-0.5">{new Date(ts).toLocaleString()}</p>
              ) : (
                <p className="text-xs text-muted-foreground/40 mt-0.5">Pending</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}