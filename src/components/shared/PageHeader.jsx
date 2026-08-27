import React from "react";
import BackButton from "@/components/shared/BackButton";

export default function PageHeader({ title, subtitle, children, className = "" }) {
  return (
    <div className={className}>
      <div className="flex items-center gap-3 flex-wrap">
        <BackButton />
        {title && (
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground leading-tight m-0">
            {title}
          </h1>
        )}
        {children}
      </div>
      {subtitle && <p className="text-sm text-muted-foreground mt-2">{subtitle}</p>}
    </div>
  );
}