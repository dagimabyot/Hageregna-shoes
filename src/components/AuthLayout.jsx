import React from "react";

const LOGO_URL = "https://media.base44.com/images/public/6a4f6fc0e77e9654b0cbdbf5/09ebdc8b6_image.png";

export default function AuthLayout({ icon: Icon, title, subtitle, footer, children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FBF8F4] via-background to-[#F5EFE7] px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src={LOGO_URL} alt="Hageregna" className="w-20 h-20 mx-auto mb-4 rounded-full ring-2 ring-border shadow-soft" />
          <h1 className="text-3xl font-bold tracking-tight text-foreground font-display">{title}</h1>
          {subtitle && <p className="text-muted-foreground mt-2">{subtitle}</p>}
        </div>
        <div className="bg-card rounded-2xl shadow-soft border border-border p-8">
          {children}
        </div>
        {footer && (
          <p className="text-center text-sm text-muted-foreground mt-6">{footer}</p>
        )}
      </div>
    </div>
  );
}