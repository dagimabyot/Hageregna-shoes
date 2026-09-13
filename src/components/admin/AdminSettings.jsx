import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { Store, Save, Upload, Phone, Mail, MapPin, Facebook, Instagram, Send, Music, Youtube, KeyRound, Eye, EyeOff } from "lucide-react";
import { setAdminPasscode, hasAdminPasscode } from "@/lib/adminPasscode";

function AdminPasscodeSection() {
  const { toast } = useToast();
  const [newPasscode, setNewPasscode] = useState("");
  const [confirmPasscode, setConfirmPasscode] = useState("");
  const [savingPasscode, setSavingPasscode] = useState(false);
  const [hasPasscode, setHasPasscode] = useState(false);
  const [showPasscode, setShowPasscode] = useState(false);

  useEffect(() => {
    hasAdminPasscode().then(setHasPasscode);
  }, []);

  const handleUpdatePasscode = async (e) => {
    e.preventDefault();
    if (!newPasscode || newPasscode.length < 6) {
      toast({ title: "Passcode must be at least 6 characters", variant: "destructive" });
      return;
    }
    if (newPasscode !== confirmPasscode) {
      toast({ title: "Passcodes do not match", variant: "destructive" });
      return;
    }
    setSavingPasscode(true);
    try {
      await setAdminPasscode(newPasscode);
      toast({ title: "Admin passcode updated successfully" });
      setNewPasscode("");
      setConfirmPasscode("");
      hasAdminPasscode().then(setHasPasscode);
    } catch {
      toast({ title: "Failed to update passcode", variant: "destructive" });
    } finally {
      setSavingPasscode(false);
    }
  };

  const inputClass = "w-full border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors";
  const labelClass = "text-[11px] tracking-[0.2em] uppercase text-muted-foreground font-mono block mb-1.5";

  return (
    <div className="rounded-xl border border-border/60 bg-card p-6 shadow-soft">
      <h3 className="text-sm font-semibold tracking-widest uppercase mb-4 flex items-center gap-2">
        <KeyRound size={16} className="text-primary" /> Admin Passcode
      </h3>
      <div className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-muted/30">
        <span className={`w-2 h-2 rounded-full ${hasPasscode ? "bg-green-500" : "bg-yellow-500"}`} />
        <span className="text-sm text-muted-foreground">
          {hasPasscode ? "A passcode is currently configured. New admins must enter it to register." : "No passcode set yet — set one below to enable admin registration."}
        </span>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        Set the passcode required for new admin registrations. It is stored as a SHA-256 hash and never shown in plain text. After updating, the new passcode works immediately.
      </p>
      <form onSubmit={handleUpdatePasscode} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>New Passcode</label>
          <div className="relative">
            <input
              type={showPasscode ? "text" : "password"}
              value={newPasscode}
              onChange={e => setNewPasscode(e.target.value)}
              placeholder="Enter new passcode"
              className={`${inputClass} pr-10`}
              minLength={6}
            />
            <button type="button" onClick={() => setShowPasscode(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              {showPasscode ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>
        <div>
          <label className={labelClass}>Confirm Passcode</label>
          <input
            type={showPasscode ? "text" : "password"}
            value={confirmPasscode}
            onChange={e => setConfirmPasscode(e.target.value)}
            placeholder="Confirm new passcode"
            className={inputClass}
            minLength={6}
          />
        </div>
        <div className="sm:col-span-2">
          <button type="submit" disabled={savingPasscode} className="inline-flex items-center gap-2 bg-foreground text-background px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-foreground/90 transition-colors disabled:opacity-50">
            <KeyRound size={14} /> {savingPasscode ? "Updating..." : "Update Passcode"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function AdminSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    base44.entities.StoreSettings.list("-created_date", 1)
      .then(items => {
        if (items.length > 0) setSettings(items[0]);
        else setSettings(null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const [form, setForm] = useState({
    store_name: "Hageregna Shoes", logo_url: "", email: "info@hageregna.com", phone: "+251 911 000 000", address: "",
    social_facebook: "", social_instagram: "", social_telegram: "", social_tiktok: "", social_youtube: "",
    default_delivery_fee: 100, default_delivery_time: "1-2 business days",
    enable_cod: true, enable_telebirr: true, enable_cbe_birr: true,
  });

  useEffect(() => {
    if (settings) {
      setForm({
        store_name: settings.store_name || "Hageregna Shoes",
        logo_url: settings.logo_url || "",
        email: settings.email || "",
        phone: settings.phone || "",
        address: settings.address || "",
        social_facebook: settings.social_facebook || "",
        social_instagram: settings.social_instagram || "",
        social_telegram: settings.social_telegram || "",
        social_tiktok: settings.social_tiktok || "",
        social_youtube: settings.social_youtube || "",
        default_delivery_fee: settings.default_delivery_fee ?? 100,
        default_delivery_time: settings.default_delivery_time || "1-2 business days",
        enable_cod: settings.enable_cod !== false,
        enable_telebirr: settings.enable_telebirr !== false,
        enable_cbe_birr: settings.enable_cbe_birr !== false,
      });
    }
  }, [settings]);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setForm(f => ({ ...f, logo_url: file_url }));
    } catch { toast({ title: "Upload failed", variant: "destructive" }); }
    finally { setUploading(false); }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (settings) {
        await base44.entities.StoreSettings.update(settings.id, form);
      } else {
        await base44.entities.StoreSettings.create(form);
      }
      toast({ title: "Settings saved successfully" });
    } catch { toast({ title: "Failed to save settings", variant: "destructive" }); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="animate-pulse h-96 bg-muted rounded-xl" />;

  const inputClass = "w-full border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors";
  const labelClass = "text-[11px] tracking-[0.2em] uppercase text-muted-foreground font-mono block mb-1.5";

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Store Information */}
      <div className="rounded-xl border border-border/60 bg-card p-6 shadow-soft">
        <h3 className="text-sm font-semibold tracking-widest uppercase mb-4 flex items-center gap-2"><Store size={16} className="text-primary" /> Store Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Store Name</label>
            <input value={form.store_name} onChange={e => setForm(f => ({ ...f, store_name: e.target.value }))} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Logo</label>
            <div className="flex items-center gap-3">
              {form.logo_url && <img src={form.logo_url} alt="" className="w-10 h-10 rounded-lg object-cover" />}
              <label className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg text-sm cursor-pointer hover:bg-muted transition-colors">
                <Upload size={14} /> {uploading ? "Uploading..." : "Upload Logo"}
                <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
              </label>
            </div>
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className={`${inputClass} pl-9`} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Phone</label>
            <div className="relative">
              <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className={`${inputClass} pl-9`} />
            </div>
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Address</label>
            <div className="relative">
              <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} className={`${inputClass} pl-9`} />
            </div>
          </div>
        </div>
      </div>

      {/* Social Media */}
      <div className="rounded-xl border border-border/60 bg-card p-6 shadow-soft">
        <h3 className="text-sm font-semibold tracking-widest uppercase mb-4">Social Media</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Facebook URL</label>
            <div className="relative">
              <Facebook size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input value={form.social_facebook} onChange={e => setForm(f => ({ ...f, social_facebook: e.target.value }))} placeholder="https://facebook.com/..." className={`${inputClass} pl-9`} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Instagram URL</label>
            <div className="relative">
              <Instagram size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input value={form.social_instagram} onChange={e => setForm(f => ({ ...f, social_instagram: e.target.value }))} placeholder="https://instagram.com/..." className={`${inputClass} pl-9`} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Telegram URL</label>
            <div className="relative">
              <Send size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input value={form.social_telegram} onChange={e => setForm(f => ({ ...f, social_telegram: e.target.value }))} placeholder="https://t.me/..." className={`${inputClass} pl-9`} />
            </div>
          </div>
          <div>
            <label className={labelClass}>TikTok URL</label>
            <div className="relative">
              <Music size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input value={form.social_tiktok} onChange={e => setForm(f => ({ ...f, social_tiktok: e.target.value }))} placeholder="https://tiktok.com/..." className={`${inputClass} pl-9`} />
            </div>
          </div>
          <div>
            <label className={labelClass}>YouTube URL</label>
            <div className="relative">
              <Youtube size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input value={form.social_youtube} onChange={e => setForm(f => ({ ...f, social_youtube: e.target.value }))} placeholder="https://youtube.com/..." className={`${inputClass} pl-9`} />
            </div>
          </div>
        </div>
      </div>

      {/* Shipping */}
      <div className="rounded-xl border border-border/60 bg-card p-6 shadow-soft">
        <h3 className="text-sm font-semibold tracking-widest uppercase mb-4">Shipping</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Default Delivery Fee (ETB)</label>
            <input type="number" value={form.default_delivery_fee} onChange={e => setForm(f => ({ ...f, default_delivery_fee: +e.target.value }))} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Default Delivery Time</label>
            <input value={form.default_delivery_time} onChange={e => setForm(f => ({ ...f, default_delivery_time: e.target.value }))} className={inputClass} />
          </div>
        </div>
      </div>

      {/* Payments */}
      <div className="rounded-xl border border-border/60 bg-card p-6 shadow-soft">
        <h3 className="text-sm font-semibold tracking-widest uppercase mb-4">Payment Methods</h3>
        <div className="space-y-3">
          {[
            { key: "enable_cod", label: "Cash on Delivery" },
            { key: "enable_telebirr", label: "Telebirr" },
            { key: "enable_cbe_birr", label: "CBE Birr" },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
              <span className="text-sm font-medium">{item.label}</span>
              <button type="button" onClick={() => setForm(f => ({ ...f, [item.key]: !f[item.key] }))} className={`relative w-11 h-6 rounded-full transition-colors ${form[item.key] ? "bg-primary" : "bg-muted-foreground/30"}`}>
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${form[item.key] ? "translate-x-5" : ""}`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Admin Passcode */}
      <AdminPasscodeSection />

      <button type="submit" disabled={saving} className="flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-full text-sm tracking-widest uppercase font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
        <Save size={15} /> {saving ? "Saving..." : "Save Settings"}
      </button>
    </form>
  );
}