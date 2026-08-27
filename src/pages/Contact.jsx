import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react";
import PageHero from "@/components/shared/PageHero";

const ADMIN_EMAIL = "info@hageregna.com";

export default function Contact() {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }
    setSending(true);
    try {
      await base44.integrations.Core.SendEmail({
        to: ADMIN_EMAIL,
        subject: `Contact Form — ${form.name}`,
        body: `Name: ${form.name}\nEmail: ${form.email}\nPhone: ${form.phone || "—"}\n\nMessage:\n${form.message}`,
      });
      toast({ title: "Message sent! We'll get back to you soon." });
      setForm({ name: "", email: "", phone: "", message: "" });
    } catch {
      toast({ title: "Failed to send message. Please try again.", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const CONTACT_INFO = [
    { icon: MapPin, label: "Visit Us", value: "Bole Road, Friendship Building, Addis Ababa, Ethiopia" },
    { icon: Phone, label: "Call Us", value: "+251 911 000 000", href: "tel:+251911000000" },
    { icon: Mail, label: "Email Us", value: "info@hageregna.com", href: "mailto:info@hageregna.com" },
    { icon: Clock, label: "Working Hours", value: "Monday – Saturday: 9:00 AM – 8:00 PM" },
  ];

  return (
    <div>
      <PageHero
        eyebrow="Get In Touch"
        title="Contact Us"
        subtitle="Have a question or need help? We're here for you — reach out and our team will respond within 24 hours."
      />

      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div>
            <h2 className="font-display text-2xl font-bold mb-6">Reach Us Directly</h2>
            <div className="space-y-5">
              {CONTACT_INFO.map(info => (
                <div key={info.label} className="flex items-start gap-4 p-4 rounded-xl border border-border/60 bg-card shadow-soft">
                  <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <info.icon size={20} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground font-mono mb-1">{info.label}</p>
                    {info.href ? (
                      <a href={info.href} className="text-sm font-medium hover:text-primary transition-colors">{info.value}</a>
                    ) : (
                      <p className="text-sm font-medium">{info.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-xl overflow-hidden shadow-soft">
              <iframe
                title="Hageregna Store Location"
                src="https://www.openstreetmap.org/export/embed.html?bbox=38.76%2C8.98%2C38.82%2C9.03&layer=mapnik&marker=9.005%2C38.788"
                className="w-full h-64 border-0"
                loading="lazy"
              />
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <h2 className="font-display text-2xl font-bold mb-6">Send a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border border-border/60 bg-card p-6 shadow-soft">
              <div>
                <label className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground font-mono block mb-1.5">Full Name *</label>
                <input
                  required
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground font-mono block mb-1.5">Email *</label>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground font-mono block mb-1.5">Phone</label>
                  <input
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="+251..."
                    className="w-full border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground font-mono block mb-1.5">Message *</label>
                <textarea
                  required
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  rows={5}
                  className="w-full border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={sending}
                className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-full text-sm tracking-widest uppercase font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                <Send size={15} /> {sending ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}