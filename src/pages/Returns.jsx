import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { RotateCcw, Check, Clock, Shield, Send } from "lucide-react";
import PageHero from "@/components/shared/PageHero";

const ADMIN_EMAIL = "info@hageregna.com";

const POLICY = [
  { icon: Clock, title: "7-Day Return Window", desc: "You can request a return within 7 days of receiving your order. Items must be unworn and in original packaging." },
  { icon: RotateCcw, title: "Free Exchanges", desc: "Need a different size or color? Exchanges are free within the return window, subject to stock availability." },
  { icon: Shield, title: "Full Refunds", desc: "Refunds are processed within 3–5 business days after we receive and inspect the returned item." },
  { icon: Check, title: "Easy Process", desc: "Fill out the form below, and our team will contact you within 24 hours with return instructions." },
];

export default function Returns() {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", phone: "", orderId: "", reason: "", details: "" });
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.orderId || !form.reason) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }
    setSending(true);
    try {
      await base44.integrations.Core.SendEmail({
        to: ADMIN_EMAIL,
        subject: `Return Request — ${form.name} (Order #${form.orderId.slice(-8).toUpperCase()})`,
        body: `Return Request\n\nName: ${form.name}\nEmail: ${form.email}\nPhone: ${form.phone || "—"}\nOrder ID: ${form.orderId}\nReason: ${form.reason}\n\nDetails:\n${form.details || "—"}`,
      });
      setSubmitted(true);
      toast({ title: "Return request submitted!" });
    } catch {
      toast({ title: "Failed to submit request. Please try again.", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <PageHero
        eyebrow="Returns & Refunds"
        title="Returns & Refunds"
        subtitle="Not satisfied with your purchase? We make returns and exchanges simple and stress-free."
      />

      {/* Policy */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {POLICY.map(p => (
            <div key={p.title} className="rounded-xl border border-border/60 bg-card p-6 shadow-soft text-center hover:shadow-soft-lg transition-shadow">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <p.icon size={24} className="text-primary" />
              </div>
              <h3 className="font-semibold mb-2">{p.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>

        {/* Form */}
        {submitted ? (
          <div className="max-w-lg mx-auto text-center py-12 rounded-xl border border-border/60 bg-card p-8 shadow-soft">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check size={32} className="text-green-600" />
            </div>
            <h2 className="font-display text-2xl font-bold mb-3">Request Submitted!</h2>
            <p className="text-muted-foreground mb-6">Our team will contact you within 24 hours with return instructions.</p>
            <button
              onClick={() => { setSubmitted(false); setForm({ name: "", email: "", phone: "", orderId: "", reason: "", details: "" }); }}
              className="inline-flex items-center gap-2 text-sm tracking-widest uppercase font-medium text-primary border border-primary/30 rounded-full px-6 py-2.5 hover:bg-primary/5 transition-colors"
            >
              Submit Another Request
            </button>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            <h2 className="font-display text-2xl font-bold mb-6 text-center">Request a Return</h2>
            <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border border-border/60 bg-card p-6 shadow-soft">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground font-mono block mb-1.5">Full Name *</label>
                  <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors" />
                </div>
                <div>
                  <label className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground font-mono block mb-1.5">Email *</label>
                  <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="w-full border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground font-mono block mb-1.5">Phone</label>
                  <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+251..." className="w-full border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors" />
                </div>
                <div>
                  <label className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground font-mono block mb-1.5">Order ID *</label>
                  <input required value={form.orderId} onChange={e => setForm(f => ({ ...f, orderId: e.target.value }))} placeholder="Paste your order ID" className="w-full border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors font-mono" />
                </div>
              </div>
              <div>
                <label className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground font-mono block mb-1.5">Reason for Return *</label>
                <select required value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} className="w-full border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors bg-card">
                  <option value="">Select a reason...</option>
                  <option value="Wrong size">Wrong size</option>
                  <option value="Wrong color">Wrong color</option>
                  <option value="Defective product">Defective product</option>
                  <option value="Not as described">Not as described</option>
                  <option value="Changed my mind">Changed my mind</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground font-mono block mb-1.5">Additional Details</label>
                <textarea value={form.details} onChange={e => setForm(f => ({ ...f, details: e.target.value }))} rows={4} placeholder="Tell us more about the issue or your preferred exchange size..." className="w-full border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors resize-none" />
              </div>
              <button type="submit" disabled={sending} className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-full text-sm tracking-widest uppercase font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
                <Send size={15} /> {sending ? "Submitting..." : "Submit Request"}
              </button>
            </form>
          </div>
        )}
      </section>
    </div>
  );
}