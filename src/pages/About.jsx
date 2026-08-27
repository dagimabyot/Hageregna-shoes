import React from "react";
import { Link } from "react-router-dom";
import { Hammer, Heart, Shield, Award, Users, Globe } from "lucide-react";
import PageHero from "@/components/shared/PageHero";

const VALUES = [
  { icon: Hammer, title: "Handcrafted", desc: "Every pair is made by hand using traditional techniques passed down through generations." },
  { icon: Shield, title: "Quality First", desc: "We use only genuine leather and premium materials, verified at every step." },
  { icon: Heart, title: "Customer Care", desc: "Your comfort is our priority. We stand behind every pair with a 7-day guarantee." },
  { icon: Award, title: "Authenticity", desc: "Certified Ethiopian craftsmanship, recognized for excellence since 2015." },
];

export default function About() {
  return (
    <div>
      <PageHero
        eyebrow="Our Story"
        title="Walk With Heritage"
        subtitle="Born in the heart of Addis Ababa, Hageregna Shoes blends generations of Ethiopian craftsmanship with modern design."
      />

      {/* Heritage Section */}
      <section className="max-w-7xl mx-auto px-4 py-16 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-[11px] tracking-[0.3em] uppercase text-primary font-mono block mb-3">Since 2015</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">A Legacy of Ethiopian Craftsmanship</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>Hageregna Shoes began with a simple mission: to bring the artistry of Ethiopian leatherwork to the world. Founded in Addis Ababa in 2015, we started as a small workshop with three craftsmen and a shared dream.</p>
              <p>Today, we work with over 40 artisans across Ethiopia, each bringing their unique skills and stories to every pair. From the tanneries of Mekanisa to the workshops of Bole, every step of our process celebrates Ethiopian heritage.</p>
              <p>Our name, Hageregna, means "of the heritage" — a reminder that every stitch carries the weight of tradition and the promise of quality.</p>
            </div>
          </div>
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=800&q=80"
              alt="Ethiopian leather craftsmanship"
              className="w-full aspect-[4/3] object-cover rounded-xl shadow-soft-lg"
              loading="lazy"
            />
            <div className="absolute -bottom-6 -left-6 bg-primary text-primary-foreground p-6 rounded-xl shadow-soft-lg hidden md:block">
              <p className="text-3xl font-bold font-tabular">10+</p>
              <p className="text-xs tracking-widest uppercase">Years of Craft</p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-muted/30 py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-[11px] tracking-[0.3em] uppercase text-primary font-mono block mb-2">What We Stand For</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold">Our Values</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map(v => (
              <div key={v.title} className="rounded-xl bg-card border border-border/60 p-6 shadow-soft text-center hover:shadow-soft-lg transition-shadow">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <v.icon size={24} className="text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{v.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="max-w-4xl mx-auto px-4 py-16 md:py-20 text-center">
        <div className="inline-flex items-center gap-2 border border-primary/30 bg-primary/5 px-4 py-1.5 rounded-full mb-6">
          <Globe size={14} className="text-primary" />
          <span className="text-[11px] tracking-[0.3em] uppercase text-primary font-mono">Our Mission</span>
        </div>
        <p className="font-display text-2xl md:text-3xl font-medium leading-relaxed text-balance">
          "To empower Ethiopian artisans, celebrate our heritage, and deliver footwear that carries the soul of Ethiopia to every corner of the world."
        </p>
        <div className="flex items-center justify-center gap-2 mt-8">
          <Users size={16} className="text-muted-foreground" />
          <span className="text-sm text-muted-foreground">40+ artisans · 10,000+ happy customers · 100% Ethiopian made</span>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-foreground text-background py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-display text-3xl font-bold mb-4">Experience the Difference</h2>
          <p className="text-background/60 mb-8 max-w-xl mx-auto">Discover handcrafted shoes made with passion, precision, and pride.</p>
          <Link to="/products" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3.5 rounded-full text-sm tracking-widest uppercase font-medium hover:bg-primary/90 transition-colors">
            Shop Collection
          </Link>
        </div>
      </section>
    </div>
  );
}