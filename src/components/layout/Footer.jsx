import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, Clock, Instagram, Facebook, Send, Music2, Youtube } from "lucide-react";
import { base44 } from "@/api/base44Client";

const SHOP_LINKS = [
  { label: "Men", path: "/products?category=Men" },
  { label: "Women", path: "/products?category=Women" },
  { label: "Kids", path: "/products?category=Kids" },
  { label: "New Arrivals", path: "/products?filter=new_arrival" },
  { label: "Best Sellers", path: "/products?filter=best_seller" },
];

const SUPPORT_LINKS = [
  { label: "Contact Us", path: "/contact" },
  { label: "FAQ", path: "/faq" },
  { label: "Shipping", path: "/faq" },
  { label: "Returns", path: "/returns" },
  { label: "Privacy Policy", path: "/privacy-policy" },
];

const COMPANY_LINKS = [
  { label: "About", path: "/about" },
  { label: "Careers", path: "/about" },
  { label: "Terms & Conditions", path: "/privacy-policy" },
  { label: "Blog", path: "/about" },
];

const LOGO_URL = "https://media.base44.com/images/public/6a4f6fc0e77e9654b0cbdbf5/09ebdc8b6_image.png";

export default function Footer() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    base44.entities.StoreSettings.list().then(items => {
      if (items.length > 0) setSettings(items[0]);
    }).catch(() => {});
  }, []);

  const storeName = settings?.store_name || "Hageregna Shoes";
  const storeEmail = settings?.email || "info@hageregna.com";
  const storePhone = settings?.phone || "+251 911 000 000";
  const storeAddress = settings?.address || "Bole Road, Addis Ababa, Ethiopia";
  const socials = [
    { url: settings?.social_facebook, icon: Facebook, label: "Facebook" },
    { url: settings?.social_instagram, icon: Instagram, label: "Instagram" },
    { url: settings?.social_telegram, icon: Send, label: "Telegram" },
    { url: settings?.social_tiktok, icon: Music2, label: "TikTok" },
    { url: settings?.social_youtube, icon: Youtube, label: "YouTube" },
  ].filter(s => s.url);

  return (
    <footer className="bg-foreground text-background">
      <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
        {/* Five-column grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 md:gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <img src={settings?.logo_url || LOGO_URL} alt={storeName} className="h-10 w-10 rounded-full object-cover shrink-0" />
              <h3 className="font-display text-lg font-bold leading-tight">{storeName}</h3>
            </div>
            <p className="text-sm text-background/60 leading-relaxed mb-6 max-w-xs">
              Crafting quality footwear for Addis Ababa since 2015. Every pair tells a story of Ethiopian craftsmanship.
            </p>
            {socials.length > 0 && (
              <div className="flex items-center gap-3">
                {socials.map((s, i) => (
                  <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full border border-background/20 flex items-center justify-center hover:border-primary hover:text-primary transition-colors" aria-label={s.label}>
                    <s.icon size={15} />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-[11px] tracking-[0.3em] uppercase text-background/40 font-mono mb-5">Shop</h4>
            <nav className="flex flex-col gap-2.5">
              {SHOP_LINKS.map(link => (
                <Link key={link.label} to={link.path} className="text-sm text-background/70 hover:text-primary transition-colors">
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-[11px] tracking-[0.3em] uppercase text-background/40 font-mono mb-5">Support</h4>
            <nav className="flex flex-col gap-2.5">
              {SUPPORT_LINKS.map(link => (
                <Link key={link.label} to={link.path} className="text-sm text-background/70 hover:text-primary transition-colors">
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-[11px] tracking-[0.3em] uppercase text-background/40 font-mono mb-5">Company</h4>
            <nav className="flex flex-col gap-2.5">
              {COMPANY_LINKS.map(link => (
                <Link key={link.label} to={link.path} className="text-sm text-background/70 hover:text-primary transition-colors">
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Visit Us */}
          <div className="min-w-0">
            <h4 className="text-[11px] tracking-[0.3em] uppercase text-background/40 font-mono mb-5">Visit Us</h4>
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <MapPin size={16} className="text-primary mt-0.5 shrink-0" />
                <span className="text-sm text-background/70 break-words min-w-0">{storeAddress}</span>
              </div>
              <a href={`tel:${storePhone}`} className="flex items-center gap-3 hover:text-primary transition-colors min-w-0">
                <Phone size={16} className="text-primary shrink-0" />
                <span className="text-sm text-background/70 break-words min-w-0">{storePhone}</span>
              </a>
              <a href={`mailto:${storeEmail}`} className="flex items-center gap-3 hover:text-primary transition-colors min-w-0">
                <Mail size={16} className="text-primary shrink-0" />
                <span className="text-sm text-background/70 break-all min-w-0">{storeEmail}</span>
              </a>
              <div className="flex items-center gap-3">
                <Clock size={16} className="text-primary shrink-0" />
                <span className="text-sm text-background/70">Mon – Sat: 9AM – 8PM</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="border-t border-background/10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center">
            <p className="text-xs text-background/40">© 2026 {storeName}. All Rights Reserved.</p>
            <div className="flex items-center gap-4 sm:gap-6 flex-wrap justify-center">
              <Link to="/privacy-policy" className="text-xs text-background/40 hover:text-background/70 transition-colors">Privacy Policy</Link>
              <Link to="/privacy-policy" className="text-xs text-background/40 hover:text-background/70 transition-colors">Terms of Service</Link>
              <Link to="/privacy-policy" className="text-xs text-background/40 hover:text-background/70 transition-colors">Cookies Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}