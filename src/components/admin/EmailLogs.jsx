import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { Mail, Search, CheckCircle2, XCircle } from "lucide-react";

export default function EmailLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    base44.entities.EmailLog.list("-created_date", 100)
      .then(setLogs)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let result = logs;
    if (filter === "sent") result = result.filter(l => l.status === "sent");
    if (filter === "failed") result = result.filter(l => l.status === "failed");
    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter(l =>
        l.recipient?.toLowerCase().includes(q) ||
        l.subject?.toLowerCase().includes(q) ||
        l.email_type?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [logs, search, filter]);

  const sentCount = logs.filter(l => l.status === "sent").length;
  const failedCount = logs.filter(l => l.status === "failed").length;

  if (loading) {
    return <div className="animate-pulse h-96 rounded-xl bg-muted" />;
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Mail size={20} className="text-primary" /> Email Logs
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Track all emails sent from the system</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="rounded-xl border border-green-200 bg-green-50 p-4">
          <p className="text-[10px] tracking-[0.2em] uppercase text-green-700 font-mono">Sent</p>
          <p className="text-2xl font-bold mt-1 text-green-700">{sentCount}</p>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-[10px] tracking-[0.2em] uppercase text-red-700 font-mono">Failed</p>
          <p className="text-2xl font-bold mt-1 text-red-700">{failedCount}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by recipient, subject, type..."
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/30 transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          {["all", "sent", "failed"].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium capitalize transition-colors ${
                filter === f
                  ? "bg-primary text-primary-foreground"
                  : "border border-border hover:bg-muted"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border/60 bg-card shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-[10px] font-mono tracking-[0.2em] uppercase text-muted-foreground bg-muted/30">
                <th className="text-left p-3 font-medium">Status</th>
                <th className="text-left p-3 font-medium">Recipient</th>
                <th className="text-left p-3 font-medium">Subject</th>
                <th className="text-left p-3 font-medium">Type</th>
                <th className="text-left p-3 font-medium">Date</th>
                <th className="text-left p-3 font-medium">Error</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    <Mail size={32} className="mx-auto text-muted-foreground/30 mb-2" />
                    No email logs found
                  </td>
                </tr>
              ) : (
                filtered.map(log => (
                  <tr key={log.id} className="border-b last:border-0 hover:bg-muted/20">
                    <td className="p-3">
                      {log.status === "sent" ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-1 rounded-full bg-green-100 text-green-700">
                          <CheckCircle2 size={11} /> Sent
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-1 rounded-full bg-red-100 text-red-700">
                          <XCircle size={11} /> Failed
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-xs truncate max-w-[180px]">{log.recipient}</td>
                    <td className="p-3 text-xs truncate max-w-[250px]">{log.subject}</td>
                    <td className="p-3 text-xs text-muted-foreground">
                      <span className="bg-muted px-2 py-0.5 rounded-full font-mono">{log.email_type || "—"}</span>
                    </td>
                    <td className="p-3 text-xs text-muted-foreground whitespace-nowrap">{new Date(log.created_date).toLocaleString()}</td>
                    <td className="p-3 text-xs text-red-600 truncate max-w-[200px]">{log.error_message || "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}