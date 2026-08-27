import React, { useEffect, useState } from "react";
import { KeyRound, Save } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { hasAdminPasscode, setAdminPasscode } from "@/lib/adminPasscode";

export default function AdminSettings() {
  const { toast } = useToast();
  const [newPasscode, setNewPasscode] = useState("");
  const [confirmPasscode, setConfirmPasscode] = useState("");
  const [hasPasscode, setHasPasscode] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    hasAdminPasscode().then(setHasPasscode);
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    if (newPasscode.length < 6) {
      toast({ title: "Passcode must be at least 6 characters", variant: "destructive" });
      return;
    }
    if (newPasscode !== confirmPasscode) {
      toast({ title: "Passcodes do not match", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      await setAdminPasscode(newPasscode);
      setNewPasscode("");
      setConfirmPasscode("");
      setHasPasscode(true);
      toast({ title: "Admin passcode updated successfully" });
    } catch {
      toast({ title: "Failed to update passcode", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="max-w-3xl rounded-xl border border-border/60 bg-card p-6 shadow-soft">
      <h2 className="mb-2 flex items-center gap-2 text-lg font-semibold">
        <KeyRound size={18} className="text-primary" /> Admin settings
      </h2>
      <p className="mb-6 text-sm text-muted-foreground">
        {hasPasscode ? "Update the passcode used to protect the admin area." : "Create a passcode to protect the admin area."}
      </p>
      <form onSubmit={handleSubmit} className="grid gap-4 sm:max-w-md">
        <label className="grid gap-2 text-sm font-medium">
          New passcode
          <input className="rounded-lg border border-border bg-background px-3 py-2 outline-none focus:border-primary" type="password" value={newPasscode} onChange={(event) => setNewPasscode(event.target.value)} minLength={6} required />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Confirm passcode
          <input className="rounded-lg border border-border bg-background px-3 py-2 outline-none focus:border-primary" type="password" value={confirmPasscode} onChange={(event) => setConfirmPasscode(event.target.value)} minLength={6} required />
        </label>
        <button type="submit" disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60">
          <Save size={16} /> {saving ? "Saving..." : "Save passcode"}
        </button>
      </form>
    </section>
  );
}
