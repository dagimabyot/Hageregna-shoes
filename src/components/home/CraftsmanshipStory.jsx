import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const STORY_IMG = "https://media.base44.com/images/public/6a48e4603d74fde2543d7985/c898c3c59_generated_image.png";

export default function CraftsmanshipStory() {
  return (
    <section className="bg-foreground text-background">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 items-stretch">
        <div className="relative min-h-[48vh] lg:min-h-[58vh] overflow-hidden">
          <img src={STORY_IMG} alt="Hageregna artisan crafting leather shoes" className="absolute inset-0 w-full h-full object-cover" />
        </div>
        <div className="flex flex-col justify-center p-8 md:p-12 lg:p-16">
          <span className="text-[11px] tracking-[0.3em] uppercase text-primary font-mono block mb-4">Our Craft</span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight text-balance">
            Made by Hand,<br />Worn With Pride
          </h2>
          <p className="text-background/70 text-base leading-relaxed mb-4">
            In our Addis Ababa workshop, master artisans cut, stitch, and finish each pair using techniques passed down through generations. We source genuine Ethiopian leather and inspect every shoe before it reaches your feet.
          </p>
          <p className="text-background/70 text-base leading-relaxed mb-8">
            No mass production. No shortcuts. Just honest, durable footwear built to last.
          </p>
          <div className="flex flex-wrap gap-8 mb-8">
            <div>
              <p className="font-display text-3xl font-bold text-primary">10+</p>
              <p className="text-xs text-background/50 uppercase tracking-wider font-mono">Years of Craft</p>
            </div>
            <div>
              <p className="font-display text-3xl font-bold text-primary">100%</p>
              <p className="text-xs text-background/50 uppercase tracking-wider font-mono">Genuine Leather</p>
            </div>
            <div>
              <p className="font-display text-3xl font-bold text-primary">5K+</p>
              <p className="text-xs text-background/50 uppercase tracking-wider font-mono">Happy Customers</p>
            </div>
          </div>
          <Link to="/products" className="inline-flex items-center gap-2 text-sm tracking-widest uppercase text-background hover:text-primary transition-colors w-fit">
            Explore the Collection <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}