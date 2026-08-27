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
        <span className={`w-2 h-2 ro