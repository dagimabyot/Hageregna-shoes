import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import {
  ShieldCheck,
  LayoutDashboard,
  Package,
  Tag,
  ShoppingBag,
  Users,
  Star,
  Truck,
  BarChart3,
  CreditCard,
  Ticket,
  Settings,
  LogOut,
  PanelLeftClose,
  PanelLeft,
  Zap,
  Boxes,
  Bell,
  Mail,
  FileText,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import NotificationBell from "@/components/admin/NotificationBell";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import ProfileImageUploader from "@/components/shared/ProfileImageUploader";

const NAV = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "orders", label: "Orders", icon: Package },
  { key: "products", label: "Products", icon: ShoppingBag },
  { key: "customers", label: "Customers", icon: Users },
  { key: "flashdeals", label: "Flash Deals", icon: Zap },
  { key: "coupons", label: "Coupons", icon: Ticket },
  { key: "inventory", label: "Inventory", icon: Boxes },
  { key: "reviews", label: "Reviews", icon: Star },
  { key: "payments", label: "Payments", icon: CreditCard },
  { key: "delivery", label: "Delivery", icon: Truck },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "emaillogs", label: "Email Logs", icon: Mail },
  { key: "reports", label: "Reports", icon: FileText },
  { key: "settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({ activeTab, onTabChange, children }) {
  const { user, logout, checkUserAuth } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showProfileDialog, setShowProfileDialog] = useState(false);

  const adminName = user?.full_name || user?.email?.split("@")[0] || "Administrator";
  const initials = (user?.full_name || user?.email || "A")
    .charAt(0)
    .toUpperCase();

  useEffect(() => {
    const prev = document.title;
    document.title = "Hageregna Shoes | Admin Dashboard";
    return () => {
      document.title = prev;
    };
  }, []);

  const handleNav = (key) => {
    if (key === "logout") {
      setShowLogoutDialog(true);
      return;
    }
    onTabChange(key);
    setMobileOpen(false);
  };

  const confirmLogout = () => {
    setShowLogoutDialog(false);
    logout();
  };

  const SidebarContent = (
    <aside className="flex flex-col h-full w-full" style={{ background: "#1E293B" }}>
      {/* Brand block */}
      <div
        className="flex items-center gap-2.5 px-5 h-16 border-b shrink-0"
        style={{ borderColor: "rgba(255,255,255,0.08)" }}
      >
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: "#4F46E5" }}
        >
          <ShieldCheck size={18} className="text-white" />
        </div>
        {!collapsed && (
          <div className="min-w-0 overflow-hidden">
            <p className="text-white text-sm font-semibold leading-tight truncate">
              Hageregna Shoes
            </p>
            <p
              className="text-[10px] font-mono tracking-[0.2em] uppercase leading-tight"
              style={{ color: "#F59E0B" }}
            >
              Admin Panel
            </p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-3 space-y-0.5">
        {NAV.map((n) => {
          const isActive = activeTab === n.key;
          return (
            <button
              key={n.key}
              onClick={() => handleNav(n.key)}
              title={collapsed ? n.label : ""}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                collapsed ? "justify-center" : ""
              }`}
              style={{
                background: isActive ? "#F59E0B" : "transparent",
                color: isActive ? "#FFFFFF" : "rgba(226,232,240,0.75)",
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.06)";
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.background = "transparent";
              }}
            >
              <n.icon size={17} className="shrink-0" />
              {!collapsed && <span className="whitespace-nowrap truncate">{n.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Logout footer */}
      <div className="p-3 border-t shrink-0" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
        <button
          onClick={() => handleNav("logout")}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            collapsed ? "justify-center" : ""
          }`}
          style={{ color: "rgba(226,232,240,0.75)" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(239,68,68,0.15)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <LogOut size={17} className="shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#F8FAFC" }}>
      {/* Top header */}
      <header
        className="h-16 flex items-center justify-between px-4 lg:px-6 border-b shrink-0 z-30"
        style={{ background: "#1E293B", borderColor: "rgba(255,255,255,0.08)" }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 rounded-lg text-slate-300 hover:bg-white/10"
          >
            <PanelLeft size={18} />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-white text-base lg:text-lg font-semibold truncate">
                Hageregna Shoes Admin
              </h1>
              <span
                className="text-[10px] font-bold tracking-[0.15em] px-2 py-0.5 rounded-full text-white shrink-0"
                style={{ background: "#F59E0B" }}
              >
                ADMIN
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate">
              Administrator | {adminName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 lg:gap-3 shrink-0">
          <NotificationBell />

          <button
            onClick={() => setShowProfileDialog(true)}
            className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center text-white text-sm font-semibold shrink-0 ring-2 ring-white/20 hover:ring-amber-400 transition-all cursor-pointer"
            style={{ background: "#4F46E5" }}
            title="Edit profile picture"
          >
            {user?.profile_image_url ? (
              <img src={user.profile_image_url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </button>
        </div>
      </header>

      {/* Body: sidebar + content */}
      <div className="flex flex-1 min-h-0">
        {/* Desktop sidebar */}
        <div
          className={`hidden lg:block shrink-0 transition-all duration-300 ease-in-out ${
            collapsed ? "w-16" : "w-60"
          }`}
          style={{ background: "#1E293B" }}
        >
          <div className="h-full relative overflow-hidden">
            <div className="absolute top-2 right-2 z-20">
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
                title={collapsed ? "Expand" : "Collapse"}
              >
                {collapsed ? <PanelLeft size={15} /> : <PanelLeftClose size={15} />}
              </button>
            </div>
            {SidebarContent}
          </div>
        </div>

        {/* Mobile sidebar overlay */}
        {mobileOpen && (
          <div className="lg:hidden fixed inset-0 z-40 flex">
            <div className="w-60 shrink-0 overflow-hidden">
              {SidebarContent}
            </div>
            <div
              className="flex-1 bg-black/50"
              onClick={() => setMobileOpen(false)}
            />
          </div>
        )}

        {/* Content */}
        <main className="flex-1 min-w-0 overflow-x-hidden">
          <div className="p-4 lg:p-8">{children}</div>
        </main>
      </div>

      {/* Profile editor dialog */}
      <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Admin Profile</DialogTitle>
            <DialogDescription>Manage your profile picture and account details.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-5 py-4">
            <ProfileImageUploader
              imageUrl={user?.profile_image_url}
              userName={adminName}
              size="lg"
              onUpdated={() => {
                checkUserAuth();
              }}
            />
            <div className="w-full text-center space-y-1.5">
              <p className="text-lg font-semibold text-foreground">{adminName}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <span
                className="inline-block text-[10px] font-bold tracking-[0.15em] px-2.5 py-1 rounded-full text-white"
                style={{ background: "#F59E0B" }}
              >
                ADMINISTRATOR
              </span>
            </div>
            <div className="w-full pt-3 border-t" style={{ borderColor: "rgba(0,0,0,0.08)" }}>
              <p className="text-xs text-muted-foreground text-center">
                Click the camera icon above to upload or change your picture. Images are automatically cropped to a square.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Logout confirmation dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to log out?</AlertDialogTitle>
            <AlertDialogDescription>
              You will be signed out of the admin panel and redirected to the login page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmLogout}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}