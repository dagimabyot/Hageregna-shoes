import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, Shield, ChevronDown, UserPlus } from "lucide-react";

export default function RegisterDropdown({ variant = "desktop", onNavigate }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const ref = useRef(null);
  const isMobile = variant === "mobile";

  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const handleKey = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const go = (role) => {
    setOpen(false);
    if (onNavigate) onNavigate();
    navigate(`/register?role=${role}`);
  };

  const wrapperClass = isMobile ? "relative flex-1" : "relative hidden sm:block";
  const triggerClass = isMobile
    ? "w-full flex items-center justify-center gap-1.5 text-sm tracking-widest uppercase bg-[#0F0F0F] text-[#F7F5F0] rounded-lg py-2.5 font-medium hover:bg-[#0F0F0F]/90 transition-colors"
    : "flex items-center gap-1.5 text-[12px] tracking-widest uppercase bg-[#0F0F0F] text-[#F7F5F0] px-4 py-2 rounded-md hover:bg-[#0F0F0F]/90 transition-colors";

  return (
    <div
      ref={ref}
      className={wrapperClass}
      onMouseEnter={() => { if (!isMobile) setOpen(true); }}
      onMouseLeave={() => { if (!isMobile) setOpen(false); }}
    >
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={triggerClass}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Register — choose account type"
      >
        <UserPlus size={14} />
        Register
        <ChevronDown size={13} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {/* Outer wrapper bridges the gap (pt-2) so hover doesn't drop when moving to the menu */}
      <div
        className={`absolute right-0 top-full z-50 transition-opacity duration-200 ${
          open ? "visible opacity-100" : "invisible opacity-0 pointer-events-none"
        }`}
      >
        <div className="pt-2">
          <div
            role="menu"
            aria-label="Registration options"
            className={`w-60 bg-white rounded-xl shadow-soft-lg border border-border overflow-hidden origin-top transition-transform duration-200 ${
              open ? "translate-y-0" : "-translate-y-2"
            }`}
          >
            <button
              type="button"
              role="menuitem"
              onClick={() => go("customer")}
              className="group w-full flex items-center gap-3 px-3.5 py-3 text-left hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 text-primary group-hover:bg-white/20 transition-colors shrink-0">
                <ShoppingBag size={16} />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium">Customer Registration</span>
                <span className="block text-[11px] text-muted-foreground group-hover:text-primary-foreground/80">Shop handcrafted footwear</span>
              </span>
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => go("admin")}
              className="group w-full flex items-center gap-3 px-3.5 py-3 text-left hover:bg-primary hover:text-primary-foreground transition-colors border-t border-border"
            >
              <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-foreground/10 text-foreground group-hover:bg-white/20 transition-colors shrink-0">
                <Shield size={16} />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium">Admin Registration</span>
                <span className="block text-[11px] text-muted-foreground group-hover:text-primary-foreground/80">Requires admin passcode</span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}