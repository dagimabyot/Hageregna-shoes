import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/AuthContext";
import ProfileImageUploader from "@/components/shared/ProfileImageUploader";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { User, Mail, Phone, MapPin, Lock, Save, Plus, Trash2, Shield, LogOut } from "lucide-react";
import PageHero from "@/components/shared/PageHero";

export default function Profile() {
  const { toast } = useToast();
  const { checkUserAuth } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ full_name: "", phone: "", addresses: [] });

  useEffect(() => {
    base44.auth.me()
      .then(u => {
        setUser(u);
        setForm({
          full_name: u?.full_name || "",
          phone: u?.phone || "",
          addresses: u?.addresses || [],
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await base44.auth.updateMe({
        full_name: form.full_name,
        phone: form.phone,
        addresses: form.addresses,
      });
      toast({ title: "Profile updated successfully" });
    } catch {
      toast({ title: "Failed to update profile", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const addAddress = () => {
    setForm(f => ({ ...f, addresses: [...f.addresses, { label: "Home", zone: "", detail: "" }] }));
  };

  const updateAddress = (idx, field, value) => {
    setForm(f => ({
      ...f,
      addresses: f.addresses.map((a, i) => i === idx ? { ...a, [field]: value } : a),
    }));
  };

  const removeAddress = (idx) => {
    setForm(f => ({ ...f, addresses: f.addresses.filter((_, i) => i !== idx) }));
  };

  if (loading) {
    return <div className="max-w-3xl mx-auto px-4 py-12"><div className="animate-pulse h-96 bg-muted rounded-xl" /></div>;
  }

  return (
    <div>
      <PageHero eyebrow="Account" title="My Profile" subtitle="Manage your contact details, delivery addresses, and account security." />

      <section className="max-w-3xl mx-auto px-4 py-16">
        {/* Account Info */}
        <div className="rounded-xl border border-border/60 bg-card p-6 shadow-soft mb-8">
          <div className="flex items-center gap-4 mb-6">
            <ProfileImageUploader
              imageUrl={user?.profile_image_url}
              userName={form.full_name || user?.email}
              size="lg"
              onUpdated={(url) => {
                setUser(u => ({ ...u, profile_image_url: url }));
                checkUserAuth();
              }}
            />
            <div>
              <p className="font-semibold text-lg">{form.full_name || "Unnamed User"}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full mt-1 inline-block ${user?.role === "admin" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                {user?.role || "user"}
              </span>
            </div>
          </div>
        </div>

        {/* Contact Details Form */}
        <form onSubmit={handleSave} className="rounded-xl border border-border/60 bg-card p-6 shadow-soft mb-8">
          <h2 className="font-display text-xl font-bold mb-6 flex items-center gap-2">
            <User size={20} className="text-primary" /> Contact Details
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground font-mono block mb-1.5">Full Name</label>
              <input
                value={form.full_name}
                onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                className="w-full border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground font-mono block mb-1.5">Email</label>
                <div className="flex items-center gap-2 border border-border rounded-lg px-3 py-2.5 bg-muted/30">
                  <Mail size={14} className="text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{user?.email}</span>
                </div>
              </div>
              <div>
                <label className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground font-mono block mb-1.5">Phone</label>
                <div className="relative">
                  <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="+251..."
                    className="w-full pl-9 border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Delivery Addresses */}
        <div className="rounded-xl border border-border/60 bg-card p-6 shadow-soft mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-xl font-bold flex items-center gap-2">
              <MapPin size={20} className="text-primary" /> Delivery Addresses
            </h2>
            <button onClick={addAddress} className="flex items-center gap-1.5 text-sm text-primary hover:underline">
              <Plus size={14} /> Add
            </button>
          </div>
          {form.addresses.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No saved addresses yet. Add one for faster checkout.</p>
          ) : (
            <div className="space-y-4">
              {form.addresses.map((addr, idx) => (
                <div key={idx} className="p-4 rounded-lg border border-border/60 bg-muted/20 space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      value={addr.label}
                      onChange={e => updateAddress(idx, "label", e.target.value)}
                      placeholder="Label (e.g. Home, Office)"
                      className="flex-1 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary bg-card"
                    />
                    <button onClick={() => removeAddress(idx)} className="p-2 text-muted-foreground hover:text-destructive hover:bg-muted rounded-lg transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <input
                    value={addr.zone}
                    onChange={e => updateAddress(idx, "zone", e.target.value)}
                    placeholder="Zone (e.g. Bole, Megenagna)"
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary bg-card"
                  />
                  <textarea
                    value={addr.detail}
                    onChange={e => updateAddress(idx, "detail", e.target.value)}
                    placeholder="Detailed address / landmark"
                    rows={2}
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary bg-card resize-none"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3 mb-8">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-full text-sm tracking-widest uppercase font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            <Save size={15} /> {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>

        {/* Account Security */}
        <div className="rounded-xl border border-border/60 bg-card p-6 shadow-soft">
          <h2 className="font-display text-xl font-bold mb-6 flex items-center gap-2">
            <Lock size={20} className="text-primary" /> Account Security
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/20">
              <div className="flex items-center gap-3">
                <Shield size={18} className="text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Password</p>
                  <p className="text-xs text-muted-foreground">Reset your password via secure email verification</p>
                </div>
              </div>
              <a href="/forgot-password" className="text-sm text-primary hover:underline">Reset</a>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/20">
              <div className="flex items-center gap-3">
                <Mail size={18} className="text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Email Address</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </div>
              <span className="text-xs text-muted-foreground">Verified</span>
            </div>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="mt-6 w-full flex items-center justify-center gap-2 border border-destructive/30 text-destructive py-2.5 rounded-lg text-sm font-medium hover:bg-destructive/5 transition-colors">
                <LogOut size={15} /> Sign Out
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure you want to log out?</AlertDialogTitle>
                <AlertDialogDescription>
                  You will be signed out and redirected to the home page.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => base44.auth.logout().then(() => window.location.href = "/")}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Logout
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </section>
    </div>
  );
}