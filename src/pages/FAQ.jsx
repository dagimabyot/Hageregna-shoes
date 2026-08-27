import React, { useState } from "react";
import { ChevronDown, Truck, RotateCcw, Smartphone } from "lucide-react";
import PageHero from "@/components/shared/PageHero";

const FAQ_SECTIONS = [
  {
    icon: Truck,
    title: "Delivery in Addis Ababa",
    questions: [
      { q: "How long does delivery take within Addis Ababa?", a: "For most areas in Addis Ababa, delivery takes 1–2 business days. Bole and nearby areas qualify for same-day delivery if you order before 2 PM. Outer districts like Jemo, Lebu, and Ayat may take up to 2 days." },
      { q: "Do you deliver outside Addis Ababa?", a: "Yes! We deliver to Adama (2–3 days), Bishoftu (1–2 days), and other major cities. Delivery fees and times vary by zone — you'll see the exact fee and estimated time when selecting your delivery zone at checkout." },
      { q: "Is delivery free?", a: "Delivery is free in the Bole area. For other zones, a delivery fee applies based on distance. The fee is automatically calculated and shown at checkout before you place your order." },
      { q: "Can I track my order?", a: "Absolutely. Once your order is approved, you can track its real-time status from your account dashboard or our Track Order page using your order ID." },
    ],
  },
  {
    icon: RotateCcw,
    title: "Returns & Refunds",
    questions: [
      { q: "What is your return policy?", a: "We offer a 7-day return guarantee. If your shoes don't fit or you're not satisfied, return them unworn within 7 days of delivery for a full refund or exchange." },
      { q: "How do I request a return?", a: "Visit our Returns & Refunds page, fill out the return request form with your order ID and reason, and our team will contact you within 24 hours with instructions." },
      { q: "When will I get my refund?", a: "Refunds are processed within 3–5 business days after we receive and inspect the returned item. Mobile payments are refunded to the original payment method." },
      { q: "Can I exchange for a different size?", a: "Yes, exchanges for a different size or color are free within the 7-day window, subject to stock availability. Just indicate your preferred size in the return form." },
    ],
  },
  {
    icon: Smartphone,
    title: "Mobile Payments",
    questions: [
      { q: "Which mobile payment methods do you accept?", a: "We accept Telebirr and CBE Birr, as well as Cash on Delivery for all zones." },
      { q: "How do I pay with Telebirr?", a: "Select Telebirr at checkout, transfer the total amount to our merchant number (+251 911 000 000) via the Telebirr app, then enter your transaction reference in the checkout form to complete your order." },
      { q: "How do I pay with CBE Birr?", a: "Select CBE Birr at checkout, transfer the total to our merchant number (+251 911 000 000) via the CBE Birr app, then enter your transaction reference. Your order will be confirmed once payment is verified." },
      { q: "Is Cash on Delivery available?", a: "Yes, Cash on Delivery is available in all delivery zones. Simply pay with cash when your order arrives. No pre-payment needed." },
    ],
  },
];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border/60">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 py-4 text-left"
      >
        <span className="text-sm font-medium">{q}</span>
        <ChevronDown size={18} className={`shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <p className="pb-4 text-sm text-muted-foreground leading-relaxed">{a}</p>}
    </div>
  );
}

export default function FAQ() {
  return (
    <div>
      <PageHero
        eyebrow="Help Center"
        title="Frequently Asked Questions"
        subtitle="Find answers to common questions about delivery, returns, and payments."
      />

      <section className="max-w-3xl mx-auto px-4 py-16">
        {FAQ_SECTIONS.map((section, i) => (
          <div key={section.title} className={i > 0 ? "mt-12" : ""}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <section.icon size={18} className="text-primary" />
              </div>
              <h2 className="font-display text-xl font-bold">{section.title}</h2>
            </div>
            <div className="rounded-xl border border-border/60 bg-card px-5 shadow-soft">
              {section.questions.map((item, idx) => (
                <FAQItem key={idx} {...item} />
              ))}
            </div>
          </div>
        ))}

        <div className="mt-16 text-center rounded-xl bg-muted/30 p-8">
          <p className="text-muted-foreground mb-2">Still have questions?</p>
          <a href="/contact" className="text-primary font-medium hover:underline">Contact our support team →</a>
        </div>
      </section>
    </div>
  );
}