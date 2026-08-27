import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export default function BackButton({ label = "", className = "" }) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  return (
    <button
      onClick={handleBack}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-xl border text-xs font-medium shadow-soft transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 shrink-0",
        "border-[#0F0F0F]/15 bg-white text-[#0F0F0F] hover:border-[#0F0F0F] hover:bg-[#0F0F0F]/5",
        className
      )}
      aria-label="Go back to previous page"
    >
      <ArrowLeft size={15} />{label && <span>{label}</span>}
    </button>
  );
}