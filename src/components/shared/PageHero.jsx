import React from "react";
import BackButton from "@/components/shared/BackButton";

export default function PageHero({ eyebrow, title, subtitle }) {
  return (
    <section className="bg-foreground text-background py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-start mb-8">
          <BackButton className="border-background/20 bg-transparent text-background shadow-none hover:bg-background/10 hover:border-background/40" />
        </div>
        <div className="text-center">
          {eyebrow && (
            <span className="text-[11px] tracking-[0.3em] uppercase text-primary font-mono block mb-3">{eyebrow}</span>
          )}
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 text-balance">{title}</h1>
          {subtitle && <p className="text-background/60 max-w-2xl mx-auto leading-relaxed">{subtitle}</p>}
        </div>
      </div>
    </section>
  );
}