import React, { useState, useMemo } from "react";
import { Mail, Search, ChevronLeft, ChevronRight, Users } from "lucide-react";
import ViewToggle from "@/components/admin/ViewToggle";

const PAGE_SIZE = 10;

export default function CustomersManager({ users }) {
  const [search, setSearch] = useState("");
  const [view, setView] = useState("grid");
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(u =>
      u.full_name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.role?.toLowerCase().includes(q)
    );
  }, [users, search]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 justify-between mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            placeholder="Search customers..."
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground hidden sm:inline">{filtered.length} customers</span>
          <ViewToggle view={view} onViewChange={setView} />
        </div>
      </div>

      {view === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paged.map(u => (
            <div key={u.id} className="rounded-xl border bg-white p-5 shadow-sm" style={{ borderColor: "#E2E8F0" }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold" style={{ background: "#4F46E5" }}>
                  {(u.full_name || u.email || "?").charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{u.full_name || "Unnamed"}</p>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full" style={u.role === "admin" ? { background: "#FEF3C7", color: "#92400E" } : { background: "#F1F5F9", color: "#475569" }}>
                    {u.role || "user"}
                  </span>
                </div>
              </div>
              <div className="space-y-1.5 text-xs text-slate-500">
                {u.email && <div className="flex items-center gap-2"><Mail size={12} /> {u.email}</div>}
              </div>
              <p className="text-[10px] text-slate-400 mt-3 font-mono">Joined {new Date(u.created_date).toLocaleDateString()}</p>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full rounded-xl border bg-white p-12 text-center shadow-sm" style={{ borderColor: "#E2E8F0" }}>
              <Users size={40} className="mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500">No customers found</p>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-xl border bg-white shadow-sm overflow-hidden" style={{ borderColor: "#E2E8F0" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-[10px] font-mono tracking-[0.2em] uppercase text-slate-500" style={{ background: "#F1F5F9", borderColor: "#E2E8F0" }}>
                  <th className="text-left p-3 font-medium">Customer</th>
                  <th className="text-left p-3 font-medium">Email</th>
                  <th className="text-left p-3 font-medium">Role</th>
                  <th className="text-left p-3 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody>
                {paged.map(u => (
                  <tr key={u.id} className="border-b last:border-0 hover:bg-slate-50" style={{ borderColor: "#E2E8F0" }}>
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0" style={{ background: "#4F46E5" }}>
                          {(u.full_name || u.email || "?").charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium">{u.full_name || "Unnamed"}</span>
                      </div>
                    </td>
                    <td className="p-3 text-slate-500">{u.email || "—"}</td>
                    <td className="p-3">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full" style={u.role === "admin" ? { background: "#FEF3C7", color: "#92400E" } : { background: "#F1F5F9", color: "#475569" }}>
                        {u.role || "user"}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500 font-mono text-xs">{new Date(u.created_date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} className="p-2 rounded-lg border disabled:opacity-30 hover:bg-muted" style={{ borderColor: "#E2E8F0" }}>
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm text-muted-foreground">Page {page + 1} of {totalPages}</span>
          <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1} className="p-2 rounded-lg border disabled:opacity-30 hover:bg-muted" style={{ borderColor: "#E2E8F0" }}>
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}