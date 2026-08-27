import React from "react";
import { Shield, Lock, Database, Eye, Mail } from "lucide-react";
import PageHero from "@/components/shared/PageHero";

const SECTIONS = [
  {
    icon: Database,
    title: "Information We Collect",
    content: [
      "When you place an order, we collect your name, phone number, email address, delivery zone, and delivery address. This information is necessary to process and deliver your order.",
      "When you create an account, we store your email address and encrypted password. Your account activity, including order history and wishlist items, is linked to your account.",
      "When you leave a product review, we store your name, rating, and comment alongside the product information.",
      "Payment information for mobile payments (Telebirr, CBE Birr) is processed through their respective secure platforms. We only store the transaction reference number you provide.",
    ],
  },
  {
    icon: Eye,
    title: "How We Use Your Information",
    content: [
      "To process and deliver your orders, and to communicate with you about order status updates.",
      "To provide customer support and respond to your inquiries.",
      "To improve our products, services, and website experience based on your feedback.",
      "To send you occasional promotional emails about new collections and special offers (only if you've opted in).",
    ],
  },
  {
    icon: Lock,
    title: "Data Storage & Security",
    content: [
      "Your personal data is stored securely using industry-standard encryption. Passwords are hashed and never stored in plain text.",
      "Access to your personal information is restricted to authorized personnel who need it to fulfill orders and provide support.",
      "We do not sell, rent, or share your personal data with third parties for marketing purposes.",
      "Payment data is handled entirely by trusted payment providers. We never store your full payment credentials.",
    ],
  },
  {
    icon: Shield,
    title: "Your Rights",
    content: [
      "You have the right to access, correct, or delete your personal information at any time through your account settings or by contacting us.",
      "You can opt out of promotional communications at any time by clicking the unsubscribe link in any email.",
      "You can request a copy of all data we hold about you by contacting our support team.",
      "If you believe your data has been mishandled, you have the right to file a complaint.",
    ],
  },
];

export default function PrivacyPolicy() {
  return (
    <div>
      <PageHero
        eyebrow="Legal"
        title="Privacy Policy"
        subtitle="Your privacy matters to us. This policy explains how we collect, use, and protect your personal information."
      />

      <section className="max-w-3xl mx-auto px-4 py-16">
        <div className="mb-8 p-4 rounded-lg bg-muted/30 text-sm text-muted-foreground">
          <p>Last updated: July 2026. This policy applies to all information collected through the Hageregna Shoes website and services.</p>
        </div>

        {SECTIONS.map((section, i) => (
          <div key={section.title} className={i > 0 ? "mt-10" : ""}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <section.icon size={18} className="text-primary" />
              </div>
              <h2 className="font-display text-xl font-bold">{section.title}</h2>
            </div>
            <div className="space-y-3 pl-1">
              {section.content.map((p, idx) => (
                <p key={idx} className="text-sm text-muted-foreground leading-relaxed">{p}</p>
              ))}
            </div>
          </div>
        ))}

        <div className="mt-12 p-6 rounded-xl border border-border/60 bg-card shadow-soft text-center">
          <Mail size={24} className="text-primary mx-auto mb-3" />
          <h3 className="font-semibold mb-2">Questions About Your Privacy?</h3>
          <p className="text-sm text-muted-foreground mb-4">We're happy to help with any privacy-related questions.</p>
          <a href="/contact" className="text-primary font-medium hover:underline text-sm">Contact us →</a>
        </div>
      </section>
    </div>
  );
}