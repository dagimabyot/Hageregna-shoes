import { base44 } from "@/api/base44Client";

/**
 * Generates a branded HTML order confirmation email.
 * @param {Object} order - The order entity record
 * @param {Object} settings - StoreSettings record (optional)
 * @returns {{ subject: string, html: string }}
 */
export function generateOrderConfirmationEmail(order, settings = {}) {
  const storeName = settings.store_name || "Hageregna Shoes";
  const logoUrl = settings.logo_url;
  const storeEmail = settings.email || "info@hageregna.com";
  const storePhone = settings.phone || "+251 911 000 000";
  const orderNumber = (order.id || "").slice(-8).toUpperCase();
  const orderDate = new Date(order.created_date || Date.now()).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });
  const estimatedDelivery = order.estimated_delivery_date
    ? new Date(order.estimated_delivery_date).toLocaleDateString("en-US", {
        year: "numeric", month: "long", day: "numeric",
      })
    : "1-2 business days";

  const itemsHtml = (order.items || [])
    .map(
      (item) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #eee;">
          <div style="font-weight:600;font-size:14px;color:#1a1a1a;">${item.name || item.product_name || "Product"}</div>
          <div style="font-size:12px;color:#888;margin-top:2px;">
            ${item.size ? `Size: ${item.size} · ` : ""}${item.color ? `Color: ${item.color} · ` : ""}Qty: ${item.quantity}
          </div>
        </td>
        <td style="padding:10px 0;border-bottom:1px solid #eee;text-align:right;white-space:nowrap;font-size:14px;color:#1a1a1a;">
          ${Number(item.price * item.quantity).toLocaleString()} ETB
        </td>
      </tr>`
    )
    .join("");

  const discountRow = order.coupon_discount > 0
    ? `<tr><td style="padding:6px 0;font-size:13px;color:#B34B2D;">Discount (${order.coupon_code || ""})</td><td style="padding:6px 0;text-align:right;font-size:13px;color:#B34B2D;">-${Number(order.coupon_discount).toLocaleString()} ETB</td></tr>`
    : "";

  return {
    subject: "Your Hageregna Shoes Order Confirmation",
    html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f0;font-family:'Inter',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f0;padding:20px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
        <!-- Header -->
        <tr>
          <td style="background:#0F0F0F;padding:28px 32px;text-align:center;">
            ${logoUrl ? `<img src="${logoUrl}" alt="${storeName}" style="max-height:48px;max-width:200px;" />` : `<span style="font-size:24px;font-weight:700;color:#fff;letter-spacing:2px;">HAGEREGNA</span>`}
            <p style="margin:6px 0 0;font-size:11px;color:#B34B2D;letter-spacing:3px;text-transform:uppercase;">SHOES</p>
          </td>
        </tr>
        <!-- Body -->
        <tr><td style="padding:32px;">
          <h1 style="margin:0 0 8px;font-size:22px;color:#1a1a1a;">Thank you for your order!</h1>
          <p style="margin:0 0 24px;font-size:14px;color:#666;">Hi ${order.customer_name || "Customer"}, we've received your order and are getting your shoes ready.</p>

          <!-- Order info card -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f9f7;border-radius:8px;margin-bottom:24px;">
            <tr>
              <td style="padding:14px 18px;">
                <p style="margin:0 0 4px;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:1px;">Order Number</p>
                <p style="margin:0;font-size:16px;font-weight:700;color:#1a1a1a;">#HG-${orderNumber}</p>
              </td>
              <td style="padding:14px 18px;">
                <p style="margin:0 0 4px;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:1px;">Order Date</p>
                <p style="margin:0;font-size:14px;font-weight:600;color:#1a1a1a;">${orderDate}</p>
              </td>
              <td style="padding:14px 18px;">
                <p style="margin:0 0 4px;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:1px;">Est. Delivery</p>
                <p style="margin:0;font-size:14px;font-weight:600;color:#B34B2D;">${estimatedDelivery}</p>
              </td>
            </tr>
          </table>

          <!-- Items -->
          <h2 style="font-size:14px;text-transform:uppercase;letter-spacing:1px;color:#999;margin:0 0 12px;">Order Details</h2>
          <table width="100%" cellpadding="0" cellspacing="0">
            ${itemsHtml}
          </table>

          <!-- Totals -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
            <tr><td style="padding:6px 0;font-size:13px;color:#666;">Subtotal</td><td style="padding:6px 0;text-align:right;font-size:13px;color:#666;">${Number(order.subtotal || 0).toLocaleString()} ETB</td></tr>
            ${discountRow}
            <tr><td style="padding:6px 0;font-size:13px;color:#666;">Shipping Fee</td><td style="padding:6px 0;text-align:right;font-size:13px;color:#666;">${Number(order.delivery_fee || 0).toLocaleString()} ETB</td></tr>
            <tr><td style="padding:12px 0;border-top:2px solid #0F0F0F;font-size:16px;font-weight:700;color:#1a1a1a;">Total Amount</td><td style="padding:12px 0;border-top:2px solid #0F0F0F;text-align:right;font-size:18px;font-weight:700;color:#0F0F0F;">${Number(order.total_amount || 0).toLocaleString()} ETB</td></tr>
          </table>

          <!-- Payment & Delivery -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
            <tr>
              <td style="vertical-align:top;width:50%;padding-right:12px;">
                <p style="margin:0 0 6px;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:1px;">Payment Method</p>
                <p style="margin:0;font-size:14px;font-weight:600;color:#1a1a1a;">${order.payment_method || "Cash on Delivery"}</p>
                ${order.transaction_reference ? `<p style="margin:4px 0 0;font-size:12px;color:#888;">Ref: ${order.transaction_reference}</p>` : ""}
              </td>
              <td style="vertical-align:top;width:50%;padding-left:12px;">
                <p style="margin:0 0 6px;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:1px;">Delivery Address</p>
                <p style="margin:0;font-size:14px;color:#1a1a1a;">${order.delivery_zone || ""}</p>
                <p style="margin:2px 0 0;font-size:13px;color:#888;">${order.delivery_address || ""}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#0F0F0F;padding:24px 32px;text-align:center;">
            <p style="margin:0 0 8px;font-size:13px;color:#ccc;">Need help? Contact our support team:</p>
            <p style="margin:0 0 4px;font-size:13px;color:#B34B2D;font-weight:600;">${storePhone}</p>
            <p style="margin:0 0 16px;font-size:13px;color:#B34B2D;font-weight:600;">${storeEmail}</p>
            <p style="margin:0;font-size:11px;color:#666;">© 2026 ${storeName}. All Rights Reserved.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  };
}

/**
 * Generates an HTML email for order status updates.
 */
export function generateOrderStatusUpdateEmail(order, newStatus, settings = {}) {
  const storeName = settings.store_name || "Hageregna Shoes";
  const storePhone = settings.phone || "+251 911 000 000";
  const storeEmail = settings.email || "info@hageregna.com";
  const orderNumber = (order.id || "").slice(-8).toUpperCase();

  const statusMessages = {
    "Payment Confirmed": "Your payment has been confirmed. We're preparing your order.",
    "Processing": "Your order is now being processed.",
    "Packed": "Your order has been packed and is ready to ship.",
    "Shipped": "Your order has been shipped!",
    "Out for Delivery": "Your order is out for delivery and will arrive soon.",
    "Delivered": "Your order has been delivered. Enjoy your new shoes!",
    "Cancelled": "Your order has been cancelled. Please contact us if you have questions.",
    "Returned": "Your return has been processed.",
  };

  const message = statusMessages[newStatus] || `Your order status has been updated to: ${newStatus}`;

  return {
    subject: `Order Update: ${newStatus} — #HG-${orderNumber}`,
    html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f0;font-family:'Inter',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f0;padding:20px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:#0F0F0F;padding:24px 32px;text-align:center;">
            <span style="font-size:22px;font-weight:700;color:#fff;letter-spacing:2px;">HAGEREGNA</span>
            <p style="margin:4px 0 0;font-size:11px;color:#B34B2D;letter-spacing:3px;text-transform:uppercase;">SHOES</p>
          </td>
        </tr>
        <tr><td style="padding:32px;">
          <h1 style="margin:0 0 8px;font-size:20px;color:#1a1a1a;">Order Status Update</h1>
          <p style="margin:0 0 20px;font-size:14px;color:#666;">Hi ${order.customer_name || "Customer"},</p>
          <p style="font-size:15px;color:#1a1a1a;line-height:1.6;">${message}</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f9f7;border-radius:8px;margin:20px 0;">
            <tr>
              <td style="padding:14px 18px;">
                <p style="margin:0 0 4px;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:1px;">Order Number</p>
                <p style="margin:0;font-size:15px;font-weight:700;color:#1a1a1a;">#HG-${orderNumber}</p>
              </td>
              <td style="padding:14px 18px;text-align:right;">
                <p style="margin:0 0 4px;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:1px;">Current Status</p>
                <p style="margin:0;font-size:15px;font-weight:700;color:#B34B2D;">${newStatus}</p>
              </td>
            </tr>
          </table>
          <p style="font-size:13px;color:#666;">Track your order anytime in your account dashboard.</p>
        </td></tr>
        <tr>
          <td style="background:#0F0F0F;padding:20px 32px;text-align:center;">
            <p style="margin:0 0 6px;font-size:12px;color:#ccc;">Questions? ${storePhone} · ${storeEmail}</p>
            <p style="margin:0;font-size:11px;color:#666;">© 2026 ${storeName}. All Rights Reserved.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  };
}

/**
 * Sends an email and logs the result to the EmailLog entity.
 * @returns {{ success: boolean, error?: string }}
 */
export async function sendEmailWithLog({ to, subject, body, email_type = "other", order_id }) {
  try {
    await base44.integrations.Core.SendEmail({ to, subject, body });
    await base44.entities.EmailLog.create({
      recipient: to,
      subject,
      email_type,
      status: "sent",
      order_id: order_id || "",
    }).catch(() => {});
    return { success: true };
  } catch (error) {
    console.error("Email send failed:", error);
    await base44.entities.EmailLog.create({
      recipient: to,
      subject,
      email_type,
      status: "failed",
      error_message: error?.message || "Unknown error",
      order_id: order_id || "",
    }).catch(() => {});
    return { success: false, error: error?.message || "Unknown error" };
  }
}