import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const HERO_IMG = "https://media.base44.com/images/public/6a48e4603d74fde2543d7985/a880aac36_generated_image.png";

const MARQUEE_ITEMS = [
  "Free Delivery in Bole",
  "Genuine Leather",
  "Cash on Delivery",
  "Quality Guaranteed",
  "Addis Ababa Store",
  "Handcrafted Since 2015",
];

export default function HeroSection() {
  // Duplicate items for seamless infinite scroll
  const items = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];

  return (
    <section className="relative">
      {/* Full-width cinematic hero */}
      <div className="relative min-h-[78vh] md:min-h-[82vh] flex items-center overflow-hidden">
        <img src={HERO_IMG} alt="Hageregna handcrafted leather shoes" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/85 via-foreground/55 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 to-transparent" />

        <div className="relative max-w-[1500px] mx-auto px-4 md:px-8 w-full py-20 md:py-24">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 border border-primary/60 bg-foreground/20 backdrop-blur-sm px-3 py-1.5 rounded-full mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] tracking-[0.3em] uppercase text-background font-mono">New Collection 2025</span>
            </div>
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-background leading-[1.05] mb-6 text-balance">
              Walk With <span className="text-primary">Heritage</span>
            </h1>
            <p className="text-background/75 text-base md:text-lg max-w-md mb-8 leading-relaxed">
              Handcrafted leather shoes from the heart of Addis Ababa. Every stitch carries generations of Ethiopian craftsmanship.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/products" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3.5 rounded-full text-sm tracking-widest uppercase font-medium hover:bg-primary/90 transition-all shadow-soft hover:shadow-soft-lg">
                Shop Now <ArrowRight size={16} />
              </Link>
              <Link to="/products?category=Leather" className="inline-flex items-center gap-2 border border-background/30 text-background px-8 py-3.5 rounded-full text-sm tracking-widest uppercase font-medium hover:border-background hover:bg-foreground/10 transition-all backdrop-blur-sm">
                Leather Collection
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Promotional marquee — infinite right-to-left scroll, pause on hover */}
      <div className="bg-primary text-primary-foreground py-3 overflow-hidden marquee-container">
        <div className="flex animate-marquee whitespace-nowrap">
          {items.map((text, i) => (
            <span key={i} className="text-[11px] tracking-[0.2em] uppercase font-mono whitespace-nowrap flex items-center gap-6 px-3">
              {text}
              <span className="text-primary-foreground/40">•</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}