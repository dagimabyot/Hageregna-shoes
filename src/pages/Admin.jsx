import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/AuthContext";
import AdminLayout from "@/components/admin/AdminLayout";
import ProductForm from "@/components/admin/ProductForm";
import OrdersView from "@/components/admin/OrdersView";
import DeliveryZoneManager from "@/components/admin/DeliveryZoneManager";
import ReviewsModeration from "@/components/admin/ReviewsModeration";
import CategoryManager from "@/components/admin/CategoryManager";
import CouponManager from "@/components/admin/CouponManager";
import PaymentManager from "@/components/admin/PaymentManager";
import AdminSettings from "@/components/admin/AdminSettings";
import AdminDashboard from "@/components/admin/AdminDashboard";
import AdminAnalytics from "@/components/admin/AdminAnalytics";
import ProductsManager from "@/components/admin/ProductsManager";
import CustomersManager from "@/components/admin/CustomersManager";
import FlashDealsManager from "@/components/admin/FlashDealsManager";
import InventoryManager from "@/components/admin/InventoryManager";
import EmailLogs from "@/components/admin/EmailLogs";
import Reports from "@/components/admin/Reports";
import NotificationsManager from "@/components/admin/NotificationsManager";
import { generateOrderStatusUpdateEmail, sendEmailWithLog } from "@/lib/emailTemplates";

export default function Admin() {
  const [tab, setTab] = useState("dashboard");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const loadData = async () => {
    setLoading(true);
    const [p, o, u] = await Promise.all([
      base44.entities.Product.list("-created_date", 100).catch(() => []),
      base44.entities.Order.list("-created_date", 50).catch(() => []),
      base44.entities.User.list().catch(() => []),
    ]);
    setProducts(p);
    setOrders(o);
    setUsers(u);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const openNew = () => { setEditProduct(null); setShowForm(true); };
  const openEdit = (p) => { setEditProduct(p); setShowForm(true); };

  const deleteProduct = async (id) => {
    await base44.entities.Product.delete(id);
    await base44.entities.Notification.create({
      title: "Product Deleted",
      message: `A product was removed from the catalog.`,
      type: "account",
      is_read: false,
    }).catch(() => {});
    toast({ title: "Product deleted" });
    loadData();
  };

  const updateOrderStatus = async (orderId, status) => {
    const order = orders.find(o => o.id === orderId);
    const history = [...(order?.status_history || []), { status, timestamp: new Date().toISOString() }];
    const update = { status, status_history: history };
    if (status === "Payment Confirmed" && !order?.approved_at) {
      update.approved_by = user?.full_name || user?.email || "Admin";
      update.approved_at = new Date().toISOString();
    }
    await base44.entities.Order.update(orderId, update);

    // In-app notification
    const notifMessage = (() => {
      switch (status) {
        case "Payment Confirmed": return "Your payment has been confirmed.";
        case "Processing": return "Your order is now Processing.";
        case "Packed": return "Your order has been Packed.";
        case "Shipped": return "Your order has been Shipped.";
        case "Out for Delivery": return "Your order is Out for Delivery.";
        case "Delivered": return "Your order has been Delivered. Enjoy your new shoes!";
        case "Cancelled": return "Your order has been Cancelled.";
        case "Returned": return "Your return has been processed.";
        default: return `Your order status is now ${status}.`;
      }
    })();

    await base44.entities.Notification.create({
      title: `Order ${status}`,
      message: `${notifMessage} Order #${orderId?.slice(-8).toUpperCase()}.`,
      type: status === "Delivered" ? "delivery" : "order",
      order_id: orderId,
      is_read: false,
    }).catch(() => {});

    // Email notification to customer
    if (order?.customer_email) {
      try {
        const settings = await base44.entities.StoreSettings.list().catch(() => []);
        const { subject, html } = generateOrderStatusUpdateEmail(
          { ...order, id: orderId },
          status,
          settings[0] || {}
        );
        await sendEmailWithLog({
          to: order.customer_email,
          subject,
          body: html,
          email_type: "order_update",
          order_id: orderId,
        });
      } catch (e) {
        console.error("Status update email failed", e);
      }
    }

    // Update payment status when delivered or payment confirmed (non-COD)
    if (status === "Delivered" || (status === "Payment Confirmed" && order?.payment_method !== "Cash on Delivery")) {
      await base44.entities.Payment.updateMany(
        { order_id: orderId },
        { $set: { payment_status: "Paid" } }
      ).catch(() => {});
    }
    toast({ title: `Order marked as ${status}` });
    loadData();
  };

  const updateTrackingNote = async (orderId, note) => {
    await base44.entities.Order.update(orderId, { tracking_note: note });
    toast({ title: "Tracking note updated" });
  };

  const bulkDeleteProducts = async (ids) => {
    await base44.entities.Product.deleteMany({ id: { $in: ids } });
    toast({ title: `${ids.length} products deleted` });
    loadData();
  };

  const bulkUpdateProducts = async (ids, changes) => {
    await base44.entities.Product.updateMany({ id: { $in: ids } }, { $set: changes });
    toast({ title: `${ids.length} products updated` });
    loadData();
  };

  const bulkUpdateOrderStatus = async (ids, status) => {
    const history = { status, timestamp: new Date().toISOString() };
    await base44.entities.Order.updateMany(
      { id: { $in: ids } },
      { $set: { status }, $push: { status_history: history } }
    );
    await base44.entities.Notification.create({
      title: "Bulk Order Update",
      message: `${ids.length} order(s) marked as ${status}.`,
      type: "order",
      is_read: false,
    }).catch(() => {});
    toast({ title: `${ids.length} orders marked as ${status}` });
    loadData();
  };

  const bulkDeleteOrders = async (ids) => {
    await base44.entities.Order.deleteMany({ id: { $in: ids } });
    toast({ title: `${ids.length} orders deleted` });
    loadData();
  };

  if (loading) {
    return (
      <AdminLayout activeTab={tab} onTabChange={setTab}>
        <div className="animate-pulse h-96 rounded-xl" style={{ background: "#E2E8F0" }} />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout activeTab={tab} onTabChange={setTab}>
      {tab === "dashboard" && (
        <AdminDashboard products={products} orders={orders} users={users} />
      )}

      {tab === "analytics" && (
        <AdminAnalytics products={products} orders={orders} users={users} />
      )}

      {tab === "orders" && (
        <OrdersView
          orders={orders}
          onStatusChange={updateOrderStatus}
          updateTrackingNote={updateTrackingNote}
          onBulkStatusChange={bulkUpdateOrderStatus}
          onBulkDelete={bulkDeleteOrders}
        />
      )}

      {tab === "products" && (
        <ProductsManager
          products={products}
          onAdd={openNew}
          onEdit={openEdit}
          onDelete={deleteProduct}
          onBulkDelete={bulkDeleteProducts}
          onBulkUpdate={bulkUpdateProducts}
        />
      )}

      {tab === "categories" && <CategoryManager />}
      {tab === "payments" && <PaymentManager />}
      {tab === "coupons" && <CouponManager />}
      {tab === "flashdeals" && <FlashDealsManager />}
      {tab === "inventory" && <InventoryManager products={products} onRefresh={loadData} />}
      {tab === "emaillogs" && <EmailLogs />}
      {tab === "notifications" && <NotificationsManager />}
      {tab === "reports" && <Reports products={products} orders={orders} users={users} />}
      {tab === "delivery" && <DeliveryZoneManager />}
      {tab === "reviews" && <ReviewsModeration />}
      {tab === "settings" && <AdminSettings />}

      {tab === "customers" && (
        <CustomersManager users={users} />
      )}

      {showForm && (
        <ProductForm
          initialProduct={editProduct}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            base44.entities.Notification.create({
              title: editProduct ? "Product Updated" : "Product Added",
              message: editProduct ? `${editProduct.name} has been updated.` : "A new product has been added to the catalog.",
              type: "account",
              is_read: false,
            }).catch(() => {});
            loadData();
          }}
        />
      )}
    </AdminLayout>
  );
}