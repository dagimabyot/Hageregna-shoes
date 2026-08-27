export const ORDER_STATUSES = [
  "Order Placed",
  "Payment Confirmed",
  "Processing",
  "Packed",
  "Shipped",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
  "Returned",
];

export const STATUS_COLORS = {
  "Order Placed": "bg-yellow-100 text-yellow-800",
  "Payment Confirmed": "bg-blue-100 text-blue-800",
  "Processing": "bg-purple-100 text-purple-800",
  "Packed": "bg-cyan-100 text-cyan-800",
  "Shipped": "bg-indigo-100 text-indigo-800",
  "Out for Delivery": "bg-orange-100 text-orange-800",
  "Delivered": "bg-green-100 text-green-800",
  "Cancelled": "bg-red-100 text-red-800",
  "Returned": "bg-slate-100 text-slate-800",
};

export const STATUS_DOTS = {
  "Order Placed": "bg-yellow-500",
  "Payment Confirmed": "bg-blue-500",
  "Processing": "bg-purple-500",
  "Packed": "bg-cyan-500",
  "Shipped": "bg-indigo-500",
  "Out for Delivery": "bg-orange-500",
  "Delivered": "bg-green-500",
  "Cancelled": "bg-red-500",
  "Returned": "bg-slate-500",
};

export const STATUS_BARS = {
  "Order Placed": "bg-yellow-400",
  "Payment Confirmed": "bg-blue-400",
  "Processing": "bg-purple-400",
  "Packed": "bg-cyan-400",
  "Shipped": "bg-indigo-400",
  "Out for Delivery": "bg-orange-400",
  "Delivered": "bg-green-400",
  "Cancelled": "bg-red-400",
  "Returned": "bg-slate-400",
};

// Linear progression for the visual tracking timeline
export const ORDER_STEPS = [
  "Order Placed",
  "Payment Confirmed",
  "Processing",
  "Packed",
  "Shipped",
  "Out for Delivery",
  "Delivered",
];

// Terminal statuses that stop the timeline
export const TERMINAL_STATUSES = ["Cancelled", "Returned"];

export const PAYMENT_METHODS = ["Cash on Delivery", "Telebirr", "CBE Birr"];

export function getStatusColor(status) {
  return STATUS_COLORS[status] || "bg-gray-100 text-gray-800";
}