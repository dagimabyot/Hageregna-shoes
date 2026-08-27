import React, { useState, useEffect } from "react";
import { Banknote, Smartphone, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";

const ALL_METHODS = [
  {
    id: "Cash on Delivery",
    icon: Banknote,
    title: "Cash on Delivery",
    desc: "Pay with cash when your order arrives.",
    tag: "Available now",
    setting: "enable_cod",
  },
  {
    id: "Telebirr",
    icon: Smartphone,
    title: "Telebirr",
    desc: "Pay instantly via Telebirr mobile wallet.",
    tag: "Instant",
    setting: "enable_telebirr",
  },
  {
    id: "CBE Birr",
    icon: Smartphone,
    title: "CBE Birr",
    desc: "Pay instantly via CBE Birr mobile wallet.",
    tag: "Instant",
    setting: "enable_cbe_birr",
  },
];

export default function PaymentMethodSelector({ value, onChange }) {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    base44.entities.StoreSettings.list().then(items => {
      if (items.length > 0) setSettings(items[0]);
    }).catch(() => {});
  }, []);

  const methods = ALL_METHODS.filter(m => {
    if (!settings) return true;
    return settings[m.setting] !== false;
  });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {methods.map((m) => {
        const selected = value === m.id;
        return (
          <button
            key={m.id}
            type="button"
            onClick={() => onChange(m.id)}
            className={`relative flex flex-col items-start gap-3 p-5 rounded-xl border-2 text-left transition-all duration-200 ${
              selected
                ? "border-primary bg-primary/5 shadow-soft"
                : "border-border hover:border-foreground/25 hover:bg-muted/40"
            }`}
          >
            <div className={`p-3 rounded-xl transition-colors ${selected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
              <m.icon size={22} strokeWidth={1.5} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-foreground">{m.title}</p>
                {selected && <Check size={14} className="text-primary" />}
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">{m.desc}</p>
              <span className="inline-block mt-2 text-[10px] font-mono uppercase tracking-wider text-muted-foreground/70">{m.tag}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}