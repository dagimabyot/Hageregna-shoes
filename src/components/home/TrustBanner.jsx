import React from "react";
import { Shield, Truck, CreditCard, Award } from "lucide-react";

const TRUST_ITEMS = [
  { icon: Shield, label: "Verified Quality", desc: "Every shoe inspected" },
  { icon: Truck, label: "Addis Delivery", desc: "Same-day in Bole area" },
  { icon: CreditCard, label: "Cash on Delivery", desc: "Pay when you receive" },
  { icon: Award, label: "Genuine Leather", desc: "Premium materials only" },
];

export default function TrustBanner() {
  return (
    <section className="border-y border-[#0F0F0F]/10 bg-[#F7F5F0]">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {TRUST_ITEMS.map(({ icon: Icon, label, desc }) => (
            <div key={label} className="flex items-start gap-3">
              <div className="p-2 border border-[#0F0F0F]/10 rounded-lg">
                <Icon size={20} strokeWidth={1.5} className="text-[#B34B2D]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#0F0F0F]">{label}</p>
                <p className="text-xs text-[#4A4A4A]">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}