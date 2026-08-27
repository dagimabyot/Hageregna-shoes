import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

const CATEGORIES = [
  { name: "Men", image: "https://media.base44.com/images/public/6a48e4603d74fde2543d7985/fed2a750c_generated_3bb2271a.png" },
  { name: "Women", image: "https://media.base44.com/images/public/6a48e4603d74fde2543d7985/a743db993_generated_e58b86fe.png" },
  { name: "Kids", image: "https://media.base44.com/images/public/6a48e4603d74fde2543d7985/026b36b30_generated_3bf7548f.png" },
  { name: "Casual", image: "https://media.base44.com/images/public/6a48e4603d74fde2543d7985/6b7bd149a_generated_5d5598bf.png" },
];

export default function CategoryGrid() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-16 md:py-20">
      <div className="flex items-end justify-between mb-10">
        <div>
          <span className="text-[11px] tracking-[0.3em] uppercase text-primary font-mono block mb-2">Categories</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">Shop by Style</h2>
        </div>
        <Link to="/products" className="text-[12px] tracking-widest uppercase text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
          View All <ArrowUpRight size={14} />
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {CATEGORIES.map((cat) => (
          <Link key={cat.name} to={`/products?category=${cat.name}`} className="group relative overflow-hidden aspect-[3/4] rounded-2xl shadow-soft hover:shadow-soft-lg transition-all duration-300">
            <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/75 via-foreground/10 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
              <h3 className="font-display text-xl md:text-2xl font-bold text-background">{cat.name}</h3>
              <span className="text-[10px] tracking-[0.2em] uppercase text-background/60 font-mono group-hover:text-primary transition-colors">Explore →</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
