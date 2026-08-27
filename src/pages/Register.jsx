import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Mail, Lock, User, Phone, Loader2, Shield, ShoppingBag,
  KeyRound, AlertTriangle, Eye, EyeOff, ArrowRight, ArrowLeft, Check
} from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "@/components/ui/use-toast";
import { validateAdminPasscode } from "@/lib/adminPasscode";

const LOGO_URL = "https://media.base44.com/images/public/6a4f6fc0e77e9654b0cbdbf5/09ebdc8b6_image.png";

export default function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const role = searchParams.get("role") === "admin" ? "admin" : "customer";

  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showPasscode, setShowPasscode] = useState(false);
  const [form, setForm] = useState({
    fullName: "", email: "", phone: "",
    password: "", confirmPassword: "", adminPasscode: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("details"); // "details" | "otp"
  const [otpCode, setOtpCode] = useState("");

  useEffect(() => {
    base44.auth.isAuthenticated().then(authed => { if (authed) navigate("/dashboard"); });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.fullName || !form.phone) { setError("Please fill all required fields"); return; }
    if (form.password.length < 8) { setError("Password must be at least 8 characters"); return; }
    if (form.password !== form.confirmPassword) { setError("Passwords do not match"); return; }

    if (role === "admin") {
      if (!form.adminPasscode) { setError("Please enter the admin passcode."); return; }
      setLoading(true);
      const isValid = await validateAdminPasscode(form.adminPasscode);
      if (!isValid) { setError("Invalid admin passcode. Use the passcode configured in Admin Settings."); setLoading(false); return; }
    }

    setLoading(true);
    try {
      await base44.auth.register({ email: form.email, password: form.password });
      setStep("otp");
      toast({ title: "Verification code sent", description: `Check ${form.email} for your code.` });
    } catch (err) {
      setError(err.message || "Registration failed. This email may already be in use.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await base44.auth.verifyOtp({ email: form.email, otpCode });
      if (result?.access_token) base44.auth.setToken(result.access_token);
      const updateData = { full_name: form.fullName, phone: form.phone };
      if (role === "admin") updateData.is_admin_verified = true;
      await base44.auth.updateMe(updateData);
      await base44.entities.Notification.create({
        title: "Welcome to Hageregna!",
        message: role === "admin"
          ? "Your admin account has been created successfully. You now have access to the admin dashboard."
          : "Your account has been created successfully. Start exploring our collection of handcrafted Ethiopian footwear.",
        type: "account", is_read: false,
      }).catch(() => {});
      window.location.href = role === "admin" ? "/admin/dashboard" : "/dashboard";
    } catch (err) {
      setError(err.message || "Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    try {
      await base44.auth.resendOtp(form.email);
      toast({ title: "Code sent", description: "Check your email for the new code." });
    } catch (err) { setError(err.message || "Failed to resend code"); }
  };

  const handleGoogle = () => { base44.auth.loginWithProvider("google", "/dashboard"); };

  // ============ OTP STEP ============
  if (step === "otp") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FBF8F4] via-background to-[#F5EFE7] px-4 py-10">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <img src={LOGO_URL} alt="Hageregna" className="w-20 h-20 mx-auto mb-4 rounded-full ring-2 ring-border shadow-soft" />
            <h1 className="text-2xl font-bold text-foreground font-display">Verify your email</h1>
            <p className="text-sm text-muted-foreground mt-2">We sent a code to <span className="font-medium text-foreground">{form.email}</span></p>
          </div>
          <div className="bg-card rounded-2xl shadow-soft border border-border p-7">
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-destructive/10 text-destructive text-sm flex items-start gap-2">
                <AlertTriangle size={16} className="shrink-0 mt-0.5" /><span>{error}</span>
              </div>
            )}
            <div className="flex justify-center mb-6">
              <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode} autoFocus autoComplete="one-time-code">
                <InputOTPGroup>
                  <InputOTPSlot index={0} /><InputOTPSlot index={1} /><InputOTPSlot index={2} />
                  <InputOTPSlot index={3} /><InputOTPSlot index={4} /><InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            <button onClick={handleVerify} disabled={loading || otpCode.length < 6}
              className="w-full h-12 flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-all disabled:opacity-50 shadow-soft">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</> : <>Verify & Create Account <Check size={17} /></>}
            </button>
            <p className="text-center text-sm text-muted-foreground mt-4">
              Didn't receive the code?{" "}
              <button onClick={handleResend} className="text-primary font-medium hover:underline">Resend</button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ============ DETAILS STEP ============
  const inputClass = "w-full h-12 border border-border rounded-xl pl-10 pr-10 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all";
  const labelClass = "text-[11px] tracking-[0.15em] uppercase text-muted-foreground font-medium block mb-1.5";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FBF8F4] via-background to-[#F5EFE7] px-4 py-10">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <img src={LOGO_URL} alt="Hageregna" className="w-16 h-16 mx-auto mb-3 rounded-full ring-2 ring-border shadow-soft" />
          <h1 className="text-2xl font-bold text-foreground font-display">
            {role === "admin" ? "Admin Registration" : "Create your account"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            {role === "admin" ? "Enter your details and admin passcode" : "Join Hageregna and start shopping"}
          </p>
        </div>

        {/* Selected role badge */}
        <div className="flex items-center justify-center gap-2 mb-5">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium ${role === "admin" ? "bg-foreground text-background" : "bg-primary text-primary-foreground"}`}>
            {role === "admin" ? <Shield size={14} /> : <ShoppingBag size={14} />}
            {role === "admin" ? "Admin" : "Customer"} Account
          </div>
        </div>

        <div className="bg-card rounded-2xl shadow-soft border border-border p-7">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-destructive/10 text-destructive text-sm flex items-start gap-2">
              <AlertTriangle size={16} className="shrink-0 mt-0.5" /><span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className={labelClass}>Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input autoFocus placeholder="Your full name" value={form.fullName}
                  onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} className={inputClass} required />
              </div>
            </div>

            <div>
              <Label className={labelClass}>Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input type="email" placeholder="you@example.com" value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className={inputClass} required />
              </div>
            </div>

            <div>
              <Label className={labelClass}>Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input type="tel" placeholder="+251 911 000 000" value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className={inputClass} required />
              </div>
            </div>

            {role === "admin" && (
              <div>
                <Label className={`${labelClass} flex items-center gap-1.5`}>
                  <KeyRound size={12} /> Admin Passcode
                </Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input type={showPasscode ? "text" : "password"} placeholder="Enter admin passcode" value={form.adminPasscode}
                    onChange={e => setForm(f => ({ ...f, adminPasscode: e.target.value }))} className={inputClass} required />
                  <button type="button" onClick={() => setShowPasscode(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                    {showPasscode ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1.5">Only authorized personnel with the correct passcode can register as administrators.</p>
              </div>
            )}

            <div>
              <Label className={labelClass}>Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input type={showPass ? "text" : "password"} placeholder="Min 8 characters" value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))} className={inputClass} required minLength={8} />
                <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <Label className={labelClass}>Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input type={showConfirm ? "text" : "password"} placeholder="Re-enter password" value={form.confirmPassword}
                  onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))} className={inputClass} required />
                <button type="button" onClick={() => setShowConfirm(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full h-12 flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-all disabled:opacity-50 shadow-soft-lg">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account...</>
                : <>{role === "admin" ? "Create admin account" : "Create account"} <ArrowRight size={17} /></>}
            </button>
          </form>

          <Link to="/" className="w-full flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft size={15} /> Back to home
          </Link>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-primary font-medium hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}