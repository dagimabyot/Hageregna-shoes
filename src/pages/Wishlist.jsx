import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Heart, Trash2, ShoppingBag } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import PageHeader from "@/components/shared/PageHeader";

export default function Wishlist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadItems = () => {
    base44.entities.Wishlist.list()
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadItems(); }, []);

  const removeItem = async (id, name) => {
    await base44.entities.Wishlist.delete(id);
    loadItems();
    toast({ title: "Removed from wishlist", description: name });
  };

  if (loading) {
    return <div className="max-w-4xl mx-auto px-4 py-12"><div className="animate-pulse h-48 bg-[#0F0F0F]/5" /></div>;
  }

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <Heart size={48} className="mx-auto text-[#0F0F0F]/20 mb-4" />
        <h1 className="font-display text-2xl font-bold text-[#0F0F0F] mb-2">Your wishlist is empty</h1>
        <p className="text-sm text-[#4A4A4A] mb-6">Save your favorite shoes for later.</p>
        <Link to="/products" className="inline-flex items-center gap-2 bg-[#0F0F0F] text-[#F7F5F0] px-8 py-3 text-sm tracking-widest uppercase">Browse Shoes</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <PageHeader title="Wishlist" className="mb-8">
        <span className="text-sm text-[#4A4A4A]">({items.length} items)</span>
      </PageHeader>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {items.map(item => (
          <div key={item.id} className="group rounded-xl overflow-hidden bg-white border border-[#0F0F0F]/10 hover:shadow-lg transition-all duration-300">
            <Link to={`/product/${item.product_id}`} className="block">
              <div className="relative aspect-square bg-[#EDEBE6] overflow-hidden">
                {item.product_image ? (
                  <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#4A4A4A]/30"><ShoppingBag size={32} /></div>
                )}
              </div>
              <div className="p-4">
                <p className="text-sm font-medium text-[#0F0F0F] line-clamp-2 mb-2">{item.product_name}</p>
                <p className="text-base font-bold font-tabular text-[#B34B2D]">{item.product_price?.toLocaleString()} ETB</p>
              </div>
            </Link>
            <div className="px-4 pb-4">
              <button
                onClick={() => removeItem(item.id, item.product_name)}
                className="w-full flex items-center justify-center gap-1.5 border border-red-200 text-red-500 py-2 text-[11px] tracking-widest uppercase font-medium rounded-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 size={12} /> Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}