import React, { useState } from "react";
import { Mail, CheckCircle, Send } from "lucide-react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
    setEmail("");
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <section className="bg-foreground text-background relative overflow-hidden mb-16">
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: "radial-gradient(circle at 20% 50%, #B34B2D 1px, transparent 1px), radial-gradient(circle at 80% 30%, #B34B2D 1px, transparent 1px)",
        backgroundSize: "40px 40px"
      }} />

      <div className="relative max-w-[650px] mx-auto px-4 py-20 md:py-24 text-center">
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-6">
          <Mail size={30} className="text-primary-foreground" />
        </div>

        {/* Eyebrow */}
        <span className="text-[11px] tracking-[0.3em] uppercase text-primary font-mono block mb-3">
          Stay Connected
        </span>

        {/* Heading */}
        <h2 className="font-display text-3xl md:text-4xl font-bold text-background mb-4 leading-tight text-balance">
          Join Our Newsletter
        </h2>

        {/* Description */}
        <p className="text-background/60 text-sm md:text-base leading-relaxed mb-8 max-w-md mx-auto">
          Subscribe to receive exclusive offers, early access to new arrivals, and updates from Hageregna Shoes.
        </p>

        {/* Form */}
        {submitted ? (
          <div className="flex items-center justify-center gap-3 bg-green-500/15 border border-green-500/30 text-green-400 px-6 py-5 rounded-2xl max-w-md mx-auto">
            <CheckCircle size={24} className="shrink-0" />
            <div className="text-left">
              <p className="text-sm font-semibold">Thank you for subscribing!</p>
              <p className="text-xs text-green-400/70 mt-0.5">Check your inbox for exclusive offers.</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-3">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              className="w-full h-14 px-5 rounded-xl bg-background/10 border border-background/20 text-background placeholder:text-background/40 focus:outline-none focus:border-primary focus:bg-background/15 transition-all text-sm text-center"
            />
            <button
              type="submit"
              className="w-full h-14 px-8 rounded-xl bg-primary text-primary-foreground text-sm tracking-widest uppercase font-medium hover:bg-primary/90 transition-colors inline-flex items-center justify-center gap-2"
            >
              Subscribe <Send size={16} />
            </button>
          </form>
        )}

        <p className="text-[11px] text-background/30 mt-4">
          By subscribing, you agree to our Privacy Policy. Unsubscribe anytime.
        </p>
      </div>
    </section>
  );
}