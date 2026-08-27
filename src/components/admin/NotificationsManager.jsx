import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { Bell, Check, Trash2, CheckCheck } from "lucide-react";

export default function NotificationsManager() {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    base44.entities.Notification.list("-created_date", 50)
      .then(setNotifications)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const markAsRead = async (id) => {
    await base44.entities.Notification.update(id, { is_read: true });
    loadData();
  };

  const markAllRead = async () => {
    const unread = notifications.filter(n => !n.is_read);
    if (unread.length === 0) return;
    await base44.entities.Notification.bulkUpdate(unread.map(n => ({ id: n.id, is_read: true })));
    toast({ title: "All notifications marked as read" });
    loadData();
  };

  const deleteNotification = async (id) => {
    await base44.entities.Notification.delete(id);
    loadData();
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading) return <div className="animate-pulse h-96 rounded-xl bg-muted" />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Bell size={20} className="text-primary" /> Notifications
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}` : "All caught up"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors">
            <CheckCheck size={15} /> Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="rounded-xl border border-border/60 bg-card p-12 text-center shadow-soft">
          <Bell size={40} className="mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(notif => (
            <div
              key={notif.id}
              className={`rounded-xl border p-4 shadow-soft transition-all ${
                notif.is_read
                  ? "border-border/40 bg-card"
                  : "border-primary/20 bg-primary/5"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${notif.is_read ? "bg-muted" : "bg-primary/10"}`}>
                  <Bell size={15} className={notif.is_read ? "text-muted-foreground" : "text-primary"} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className={`text-sm font-medium ${notif.is_read ? "text-foreground" : "text-foreground"}`}>
                        {notif.title}
                        {!notif.is_read && <span className="ml-2 w-2 h-2 rounded-full bg-primary inline-block" />}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{notif.message}</p>
                      <p className="text-[10px] text-muted-foreground/60 mt-1.5">
                        {new Date(notif.created_date).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {!notif.is_read && (
                        <button onClick={() => markAsRead(notif.id)} className="p-1.5 rounded-lg hover:bg-muted transition-colors" title="Mark as read">
                          <Check size={14} className="text-green-600" />
                        </button>
                      )}
                      <button onClick={() => deleteNotification(notif.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors" title="Delete">
                        <Trash2 size={14} className="text-muted-foreground hover:text-destructive" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}