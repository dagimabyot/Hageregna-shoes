import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, ShoppingBag, Heart, User, Menu, X, Package, UserPlus, LogOut, ChevronRight } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import RegisterDropdown from "@/components/auth/RegisterDropdown";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const CATEGORIES = ["Men", "Women", "Kids", "Formal", "Casual", "Leather"];
const LOGO_URL = "https://media.base44.com/images/public/6a4f6fc0e77e9654b0cbdbf5/09ebdc8b6_image.png";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [settings, setSettings] = useState(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    base44.entities.StoreSettings.list().then(items => { if (items[0]) setSettings(items[0]); }).catch(() => {});
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    base44.entities.CartItem.list().then(items => setCartCount(items.length)).catch(() => {});
    const unsub = base44.entities.CartItem.subscribe(() => {
      base44.entities.CartItem.list().then(items => setCartCount(items.length)).catch(() => {});
    });
    return unsub;
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-[#F7F5F0]/95 backdrop-blur-md shadow-sm" : "bg-[#F7F5F0]"}`}>
        {/* Main nav */}
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Mobile menu */}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-1">
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5">
              <img
                src={settings?.logo_url || LOGO_URL}
                alt="Hageregna Shoes"
                className="h-8 w-8 md:h-11 md:w-11 rounded-full object-cover shrink-0"
              />
              <span className="flex flex-col leading-none">
                <span className="font-display text-xl md:text-2xl font-bold tracking-tight text-[#0F0F0F]">HAGEREGNA</span>
                <span className="hidden sm:block text-[10px] tracking-[0.3em] uppercase text-[#4A4A4A] font-mono mt-0.5">SHOES</span>
              </span>
            </Link>

            {/* Desktop categories */}
            <nav className="hidden lg:flex items-center gap-8">
              {CATEGORIES.map(cat => (
                <Link key={cat} to={`/products?category=${cat}`} className="text-[13px] tracking-widest uppercase text-[#4A4A4A] hover:text-[#B34B2D] transition-colors font-medium">
                  {cat}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button onClick={() => setSearchOpen(!searchOpen)} className="p-2 hover:bg-[#0F0F0F]/5 rounded-lg transition-colors">
                <Search size={19} strokeWidth={1.5} />
              </button>
              <Link to="/wishlist" className="p-2 hover:bg-[#0F0F0F]/5 rounded-lg transition-colors hidden sm:block">
                <Heart size={19} strokeWidth={1.5} />
              </Link>
              <Link to="/cart" className="p-2 hover:bg-[#0F0F0F]/5 rounded-lg transition-colors relative">
                <ShoppingBag size={19} strokeWidth={1.5} />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#B34B2D] text-white text-[9px] font-bold rounded-full flex items-center justify-center">{cartCount}</span>
                )}
              </Link>
              {user ? (
                <>
                  <Link to="/order-history" className="p-2 hover:bg-[#0F0F0F]/5 rounded-lg transition-colors hidden sm:block" title="My Orders">
                    <Package size={19} strokeWidth={1.5} />
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center gap-1.5 p-1 rounded-full hover:bg-[#0F0F0F]/5 transition-colors" title="Account">
                        {user.profile_image_url ? (
                          <img src={user.profile_image_url} alt="Profile" className="w-7 h-7 rounded-full object-cover" />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-[#0F0F0F] text-[#F7F5F0] flex items-center justify-center text-xs font-semibold">
                            {(user.full_name || user.email || "?").charAt(0).toUpperCase()}
                          </div>
                        )}
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52">
                      <DropdownMenuLabel>
                        <p className="font-medium text-sm truncate">{user.full_name || "My Account"}</p>
                        <p className="text-xs text-muted-foreground truncate font-normal">{user.email}</p>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate("/profile")} className="flex items-center gap-2 cursor-pointer">
                        <User size={14} /> Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/order-history")} className="flex items-center gap-2 cursor-pointer">
                        <Package size={14} /> Order History
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/track-order")} className="flex items-center gap-2 cursor-pointer">
                        <Heart size={14} /> Track Order
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => logout()} className="flex items-center gap-2 cursor-pointer text-destructive">
                        <LogOut size={14} /> Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-[12px] tracking-widest uppercase text-[#4A4A4A] hover:text-[#B34B2D] transition-colors font-medium hidden sm:block">
                    Login
                  </Link>
                  <RegisterDropdown variant="desktop" />
                </>
              )}
            </div>
          </div>
        </div>

        {/* Search overlay */}
        {searchOpen && (
          <div className="border-t border-[#0F0F0F]/10 bg-[#F7F5F0]">
            <div className="max-w-7xl mx-auto px-4 py-4">
              <form onSubmit={handleSearch} className="flex items-center gap-3">
                <Search size={18} className="text-[#4A4A4A]" />
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search for shoes..."
                  className="flex-1 bg-transparent text-lg font-light outline-none placeholder:text-[#4A4A4A]/50"
                />
                <button type="button" onClick={() => setSearchOpen(false)} className="text-[#4A4A4A] p-1"><X size={18} /></button>
              </form>
            </div>
          </div>
        )}
      </header>

      {/* Mobile menu drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-[300px] bg-white shadow-2xl flex flex-col">
            {/* Drawer header */}
            <div className="flex items-center justify-between px-5 h-16 border-b border-[#0F0F0F]/8 shrink-0">
              <Link to="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-2.5">
                <img
                  src={settings?.logo_url || LOGO_URL}
                  alt="Hageregna Shoes"
                  className="h-8 w-8 rounded-full object-cover shrink-0"
                />
                <span className="flex flex-col leading-none">
                  <span className="font-display text-xl font-bold text-[#0F0F0F]">HAGEREGNA</span>
                  <span className="text-[9px] tracking-[0.3em] uppercase text-[#B34B2D] font-mono mt-0.5">SHOES</span>
                </span>
              </Link>
              <button onClick={() => setMobileOpen(false)} className="p-2 rounded-lg hover:bg-[#0F0F0F]/5 transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* User card */}
            {user ? (
              <Link to="/profile" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 mx-4 mt-4 p-3 rounded-xl bg-[#F7F5F0] border border-[#0F0F0F]/8 hover:border-[#B34B2D]/30 transition-colors">
                {user.profile_image_url ? (
                  <img src={user.profile_image_url} alt="Profile" className="w-11 h-11 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-[#0F0F0F] text-[#F7F5F0] flex items-center justify-center text-sm font-semibold shrink-0">
                    {(user.full_name || user.email || "?").charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{user.full_name || "My Account"}</p>
                  <p className="text-xs text-[#4A4A4A] truncate">{user.email}</p>
                </div>
                <ChevronRight size={16} className="text-[#4A4A4A] shrink-0" />
              </Link>
            ) : (
              <div className="flex gap-2 mx-4 mt-4">
                <Link to="/login" onClick={() => setMobileOpen(false)} className="flex-1 text-center text-sm tracking-widest uppercase text-[#0F0F0F] border border-[#0F0F0F]/20 rounded-lg py-2.5 font-medium hover:bg-[#0F0F0F]/5 transition-colors">
                  Login
                </Link>
                <RegisterDropdown variant="mobile" onNavigate={() => setMobileOpen(false)} />
              </div>
            )}

            {/* Scrollable nav */}
            <nav className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
              {/* Shop section */}
              <div>
                <p className="text-[10px] tracking-[0.25em] uppercase text-[#4A4A4A]/60 font-mono px-2 mb-2">Shop</p>
                <div className="space-y-0.5">
                  {CATEGORIES.map(cat => (
                    <Link key={cat} to={`/products?category=${cat}`} onClick={() => setMobileOpen(false)} className="flex items-center justify-between text-sm text-[#0F0F0F] hover:text-[#B34B2D] hover:bg-[#B34B2D]/5 px-3 py-2.5 rounded-lg transition-colors font-medium">
                      {cat} Shoes
                      <ChevronRight size={15} className="text-[#4A4A4A]/40" />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Account section */}
              <div>
                <p className="text-[10px] tracking-[0.25em] uppercase text-[#4A4A4A]/60 font-mono px-2 mb-2">Account</p>
                <div className="space-y-0.5">
                  <Link to="/wishlist" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 text-sm text-[#0F0F0F] hover:text-[#B34B2D] hover:bg-[#B34B2D]/5 px-3 py-2.5 rounded-lg transition-colors font-medium">
                    <Heart size={16} className="text-[#4A4A4A]" /> Wishlist
                  </Link>
                  {user && (
                    <>
                      <Link to="/order-history" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 text-sm text-[#0F0F0F] hover:text-[#B34B2D] hover:bg-[#B34B2D]/5 px-3 py-2.5 rounded-lg transition-colors font-medium">
                        <Package size={16} className="text-[#4A4A4A]" /> My Orders
                      </Link>
                      <Link to="/profile" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 text-sm text-[#0F0F0F] hover:text-[#B34B2D] hover:bg-[#B34B2D]/5 px-3 py-2.5 rounded-lg transition-colors font-medium">
                        <User size={16} className="text-[#4A4A4A]" /> Profile
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </nav>

            {/* Footer */}
            {user && (
              <div className="p-4 border-t border-[#0F0F0F]/8 shrink-0">
                <button onClick={() => { logout(); setMobileOpen(false); }} className="w-full flex items-center justify-center gap-2 text-sm text-[#B34B2D] border border-[#B34B2D]/20 rounded-lg py-2.5 font-medium hover:bg-[#B34B2D]/5 transition-colors">
                  <LogOut size={15} /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Spacer */}
      <div className="h-16" />
    </>
  );
}