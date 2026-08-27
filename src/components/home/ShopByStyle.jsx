import React from "react";
import { Link } from "react-router-dom";

const STYLES = [
  { name: "Casual", image: "https://images.unsplash.com/photo-1449505278894-297fdb3edbc1?w=600&q=80" },
  { name: "Running", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80" },
  { name: "Sports", image: "https://images.unsplash.com/photo-1511556820785-df641e85cda4?w=600&q=80" },
  { name: "Formal", image: "https://images.unsplash.com/photo-1614253429340-98120ac447b3?w=600&q=80" },
  { name: "Boots", image: "https://images.unsplash.com/photo-1605812860427-4024433a70fd?w=600&q=80" },
  { name: "Sandals", image: "https://images.unsplash.com/photo-1603487742131-4160ec999306?w=600&q=80" },
  { name: "Sneakers", image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&q=80" },
];

export default function ShopByStyle() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-16 md:py-20">
      <div className="text-center mb-10">
        <span className="text-[11px] tracking-[0.3em] uppercase text-[#B34B2D] font-mono block mb-2">Collections</span>
        <h2 className="font-display text-3xl md:text-4xl font-bold text-[#0F0F0F]">Shop by Style</h2>
        <p className="text-sm text-[#4A4A4A] mt-2">Find your perfect pair by category</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {STYLES.map((style) => (
          <Link
            key={style.name}
            to={`/products?category=${style.name}`}
            className="group relative overflow-hidden aspect-square rounded-2xl shadow-soft hover:shadow-soft-lg transition-all duration-300"
          >
            <img
              src={style.image}
              alt={style.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F0F]/80 via-[#0F0F0F]/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4 text-center">
              <h3 className="font-display text-lg md:text-xl font-bold text-white">{style.name}</h3>
              <span className="text-[10px] tracking-[0.2em] uppercase text-white/60 font-mono group-hover:text-[#B34B2D] transition-colors">
                Shop Now →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}