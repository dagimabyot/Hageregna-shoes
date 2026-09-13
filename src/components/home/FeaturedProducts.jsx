import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { base44 } from "@/api/base44Client";
import ProductCard from "@/components/products/ProductCard";
import ProductSlider from "@/components/home/ProductSlider";

export default function FeaturedProducts({
  title = "Featured",
  subtitle = "Curated Selection",
  filterKey = "is_featured",
  seeAllLink = "/products",
}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);

      try {
        // First try to get products matching the requested section
        const filteredProducts = await base44.entities.Product.filter(
          {
            [filterKey]: true,
            is_active: true,
          },
          "-created_date",
          8
        );

        // If matching products exist, use them
        if (filteredProducts && filteredProducts.length > 0) {
          setProducts(filteredProducts);
          return;
        }

        // If no matching products, get active products
        const activeProducts = await base44.entities.Product.filter(
          { is_active: true },
          "-created_date",
          8
        );

        // If active products exist, show them
        if (activeProducts && activeProducts.length > 0) {
          setProducts(activeProducts);
          return;
        }

        // Last fallback: get products without is_active filter
        const allProducts = await base44.entities.Product.filter(
          {},
          "-created_date",
          8
        );

        setProducts(allProducts || []);
      } catch (error) {
        console.error("Failed to load products:", error);

        // Final attempt without filters
        try {
          const allProducts = await base44.entities.Product.filter(
            {},
            "-created_date",
            8
          );

          setProducts(allProducts || []);
        } catch (fallbackError) {
          console.error("Failed to load products:", fallbackError);
          setProducts([]);
        }
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [filterKey]);

  if (loading) {
    return (
      <section className="max-w-[1500px] mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-square bg-[#0F0F0F]/5 rounded-sm" />
              <div className="h-3 bg-[#0F0F0F]/5 rounded mt-3 w-2/3" />
              <div className="h-3 bg-[#0F0F0F]/5 rounded mt-2 w-1/3" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="max-w-[1500px] mx-auto px-4 py-12 md:py-16">
      <div className="flex items-end justify-between mb-8 md:mb-10">
        <div>
          <span className="text-[11px] tracking-[0.3em] uppercase text-[#B34B2D] font-mono block mb-2">
            {subtitle}
          </span>

          <h2 className="font-display text-3xl md:text-4xl font-bold text-[#0F0F0F]">
            {title}
          </h2>
        </div>

        <Link
          to={seeAllLink}
          className="text-[12px] tracking-widest uppercase text-[#4A4A4A] hover:text-[#B34B2D] transition-colors flex items-center gap-1 whitespace-nowrap"
        >
          See All
          <ArrowUpRight size={14} />
        </Link>
      </div>

      <ProductSlider>
        {products.slice(0, 8).map((product) => (
          <ProductCard
            key={product.id}
            product={product}
          />
        ))}
      </ProductSlider>
    </section>
  );
}