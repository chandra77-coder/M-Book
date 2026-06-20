import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  Banknote,
  ChevronRight,
  Download,
  Edit3,
  History as HistoryIcon,
  Home as HomeIcon,
  PieChart,
  Plus,
  QrCode,
  Settings as SettingsIcon,
  Smartphone,
  Trash2,
  Upload,
  X,
} from "lucide-react";

const SERVICES = ["PAN Card", "Voter ID", "Aadhaar", "Ration Card", "Swasthya Sathi", "DBT Link", "Other"];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const GOLD_GRADIENT = "linear-gradient(135deg, #D4A24E 0%, #E8C468 100%)";

type EntryType = "work" | "spend";
type EntryStatus = "paid" | "unpaid" | "undecided";
type PaymentMethod = "cash" | "online";
type DateFilter = "all" | "today" | "week" | "month";
type StatusFilter = "all" | EntryStatus;

interface Entry {
  id: number;
  type: EntryType;
  service?: string;
  customNote?: string;
  customer?: string;
  amount: number;
  status?: EntryStatus;
  method?: PaymentMethod;
  note?: string;
  date: string;
}

interface EntryWithDaysAgo extends Entry {
  daysAgo: number;
}

interface EntryForm {
  entryType: EntryType;
  service: string;
  customNote: string;
  customer: string;
  amount: string;
  status: EntryStatus;
  method: PaymentMethod;
  note: string;
}

function emptyForm(): EntryForm {
  return {
    entryType: "work",
    service: "PAN Card",
    customNote: "",
    customer: "",
    amount: "0",
    status: "undecided",
    method: "cash",
    note: "",
  };
}

function daysAgoFrom(date: string) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return Math.floor((now.getTime() - d.getTime()) / 86400000);
}

function dayLabel(daysAgo: number) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return WEEKDAYS[d.getDay()];
}

function formatDate(date: string) {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "No date";
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

function formatTime(date: string) {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

function migrateEntry(raw: any): Entry {
  let date = raw?.date;
  if (!date && raw?.daysAgo !== undefined) {
    const d = new Date();
    d.setDate(d.getDate() - Number(raw.daysAgo || 0));
    date = d.toISOString();
  }
  return {
    id: Number(raw?.id || Date.now() + Math.random()),
    type: raw?.type === "spend" ? "spend" : "work",
    service: raw?.service,
    customNote: raw?.customNote,
    customer: raw?.customer,
    amount: Number(raw?.amount || 0),
    status: raw?.status === "paid" || raw?.status === "unpaid" || raw?.status === "undecided" ? raw.status : raw?.type === "spend" ? undefined : "undecided",
    method: raw?.method === "online" ? "online" : raw?.method === "cash" ? "cash" : undefined,
    note: raw?.note,
    date: date || new Date().toISOString(),
  };
}

function StatusPill({ status }: { status?: EntryStatus }) {
  if (!status) return null;
  const cls = status === "paid" ? "text-[#4ADE80]" : status === "unpaid" ? "text-[#F87171]" : "text-[#E8C468]";
  return <span className={`text-[10px] font-black uppercase tracking-widest ${cls}`}>{status}</span>;
}

function NavButton({ icon: Icon, label, active, onClick }: { icon: React.ElementType; label: string; active: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="relative flex flex-1 flex-col items-center justify-center gap-1 py-3">
      {active && <motion.div layoutId="activeTab" className="absolute top-0 h-1 w-8 rounded-b-full" style={{ background: GOLD_GRADIENT }} />}
      <Icon size={22} className={active ? "text-[#E8C468]" : "text-[#8B8F99]"} />
      <span className={active ? "text-[10px] font-bold text-[#E8C468]" : "text-[10px] font-bold text-[#8B8F99]"}>{label}</span>
    </button>
  );
}

function StatCard({ label, value, valueClass, icon: Icon }: { label: string; value: string; valueClass?: string; icon?: React.ElementType }) {
  return (
    <div className="rounded-2xl border border-[#2A2D35] bg-[#181B22] p-4 shadow-xl">
      <div className="mb-1 flex items-start justify-between gap-3">
        <p className="text-[10px] font-black uppercase tracking-widest text-[#8B8F99]">{label}</p>
        {Icon && <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#1F2229] text-[#8B8F99]"><Icon size={14} /></span>}
      </div>
      <p className={`font-display text-xl font-extrabold ${valueClass || "text-[#F5F5F7]"}`}>{value}</p>
    </div>
  );
}

function StatusFilterCard({ label, count, status, active, onClick }: { label: string; count: number; status: EntryStatus; active: boolean; onClick: () => void }) {
  const color = status === "paid" ? "text-[#4ADE80]" : status === "unpaid" ? "text-[#F87171]" : "text-[#E8C468]";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-w-[116px] flex-1 rounded-2xl border p-4 text-left transition ${active ? "border-[#E8C468] bg-[#E8C468]/10" : "border-[#2A2D35] bg-[#181B22]"}`}
    >
      <p className="text-[10px] font-black uppercase tracking-widest text-[#8B8F99]">{label}</p>
      <p className={`mt-1 font-display text-2xl font-extrabold ${color}`}>{count}</p>
    </button>
  );
}

export default function MBookApp() {
  const { theme, toggleTheme } = useTheme();
  const [tab, setTab] = useState("home");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState("");
  const [qrAmount, setQrAmount] = useState("");
  const [qrCustomer, setQrCustomer] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [qrImage, setQrImage] = useState<string | null>(() => localStorage.getItem("mbook_qr") || "/payment-qr.jpg");
  const [form, setForm] = useState<EntryForm>(emptyForm);
  const [entries, setEntries] = useState<Entry[]>(() => {
    try {
      const saved = localStorage.getItem("mbook_entries");
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed.map(migrateEntry) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("mbook_entries", JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    if (qrImage) localStorage.setItem("mbook_qr", qrImage);
  }, [qrImage]);

  const inr = (n: number) => `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

  const entriesWithDaysAgo = useMemo<EntryWithDaysAgo[]>(() => entries.map((entry) => ({ ...entry, daysAgo: daysAgoFrom(entry.date) })), [entries]);
  const workEntries = entriesWithDaysAgo.filter((e) => e.type === "work");
  const spendEntries = entriesWithDaysAgo.filter((e) => e.type === "spend");

  const totalEarned = workEntries.filter((e) => e.status === "paid").reduce((sum, e) => sum + e.amount, 0);
  const totalUnpaid = workEntries.filter((e) => e.status === "unpaid").reduce((sum, e) => sum + e.amount, 0);
  const totalSpend = spendEntries.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalEarned - totalSpend;
  const todayEarned = workEntries.filter((e) => e.daysAgo === 0 && e.status === "paid").reduce((sum, e) => sum + e.amount, 0);
  const todayUnpaid = workEntries.filter((e) => e.daysAgo === 0 && e.status === "unpaid").reduce((sum, e) => sum + e.amount, 0);
  const todayCount = entriesWithDaysAgo.filter((e) => e.daysAgo === 0).length;
  const totalCash = workEntries.filter((e) => e.status === "paid" && e.method === "cash").reduce((sum, e) => sum + e.amount, 0);
  const totalOnline = workEntries.filter((e) => e.status === "paid" && e.method === "online").reduce((sum, e) => sum + e.amount, 0);

  const counts = useMemo(() => ({
    paid: workEntries.filter((e) => e.status === "paid").length,
    unpaid: workEntries.filter((e) => e.status === "unpaid").length,
    undecided: workEntries.filter((e) => e.status === "undecided").length,
  }), [workEntries]);

  const weeklyData = useMemo(() => {
    const sums: Record<string, number> = {};
    WEEKDAYS.forEach((d) => (sums[d] = 0));
    workEntries.filter((e) => e.status === "paid" && e.daysAgo >= 0 && e.daysAgo <= 6).forEach((e) => {
      sums[dayLabel(e.daysAgo)] += e.amount;
    });
    return sums;
  }, [workEntries]);
  const maxWeekly = Math.max(1, ...Object.values(weeklyData));
  const todayName = dayLabel(0);

  const serviceBreakdown = useMemo(() => {
    const sums: Record<string, number> = {};
    workEntries.forEach((e) => {
      const service = e.service === "Other" ? e.customNote || "Other" : e.service || "Other";
      sums[service] = (sums[service] || 0) + e.amount;
    });
    const total = Object.values(sums).reduce((a, b) => a + b, 0) || 1;
    return Object.entries(sums).map(([name, value]) => ({ name, pct: Math.round((value / total) * 100) })).sort((a, b) => b.pct - a.pct);
  }, [workEntries]);

  const filteredEntries = useMemo(() => {
    let list = [...entriesWithDaysAgo];
    if (dateFilter === "today") list = list.filter((e) => e.daysAgo === 0);
    if (dateFilter === "week") list = list.filter((e) => e.daysAgo >= 0 && e.daysAgo <= 6);
    if (dateFilter === "month") list = list.filter((e) => e.daysAgo >= 0 && e.daysAgo <= 30);
    if (statusFilter !== "all") list = list.filter((e) => e.type === "work" && e.status === statusFilter);
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [entriesWithDaysAgo, dateFilter, statusFilter]);

  function openNewForm() {
    setEditingId(null);
    setForm(emptyForm());
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm());
  }

  function setFormStatus(status: EntryStatus) {
    setForm((current) => ({ ...current, status, amount: status === "undecided" ? "0" : current.amount === "0" ? "" : current.amount }));
  }

  function editEntry(entry: EntryWithDaysAgo) {
    setEditingId(entry.id);
    setForm({
      entryType: entry.type,
      service: entry.service || "PAN Card",
      customNote: entry.customNote || "",
      customer: entry.customer || "",
      amount: String(entry.status === "undecided" ? 0 : entry.amount || ""),
      status: entry.status || "undecided",
      method: entry.method || "cash",
      note: entry.note || "",
    });
    setShowForm(true);
  }

  function deleteEntry(id: number) {
    if (window.confirm("Delete this record?")) setEntries((prev) => prev.filter((entry) => entry.id !== id));
  }

  function toggleStatus(id: number) {
    setEntries((prev) => prev.map((entry) => {
      if (entry.id !== id || entry.type !== "work") return entry;
      const nextStatus: EntryStatus = entry.status === "paid" ? "unpaid" : entry.status === "unpaid" ? "undecided" : "paid";
      return { ...entry, status: nextStatus, amount: nextStatus === "undecided" ? 0 : entry.amount, method: nextStatus === "paid" ? entry.method || "cash" : undefined };
    }));
  }

  function saveEntry() {
    const isUndecided = form.entryType === "work" && form.status === "undecided";
    const amount = isUndecided ? 0 : parseFloat(form.amount) || 0;
    if (form.entryType === "spend" && !form.note.trim()) return;

    if (editingId !== null) {
      setEntries((prev) => prev.map((entry) => {
        if (entry.id !== editingId) return entry;
        if (form.entryType === "spend") {
          return { ...entry, type: "spend", note: form.note.trim(), amount, service: undefined, customNote: undefined, customer: undefined, status: undefined, method: undefined };
        }
        return {
          ...entry,
          type: "work",
          service: form.service,
          customNote: form.service === "Other" ? form.customNote.trim() : undefined,
          customer: form.customer.trim(),
          amount,
          status: form.status,
          method: form.status === "paid" ? form.method : undefined,
          note: undefined,
        };
      }));
    } else {
      const newEntry: Entry = form.entryType === "spend"
        ? { id: Date.now(), type: "spend", note: form.note.trim(), amount, date: new Date().toISOString() }
        : { id: Date.now(), type: "work", service: form.service, customNote: form.service === "Other" ? form.customNote.trim() : undefined, customer: form.customer.trim(), amount, status: form.status, method: form.status === "paid" ? form.method : undefined, date: new Date().toISOString() };
      setEntries((prev) => [...prev, newEntry]);
    }

    closeForm();
  }

  function addQrPayment() {
    const amount = parseFloat(qrAmount) || 0;
    if (amount <= 0) return;
    setEntries((prev) => [...prev, { id: Date.now(), type: "work", service: "Other", customNote: "QR Payment", customer: qrCustomer.trim(), amount, status: "paid", method: "online", date: new Date().toISOString() }]);
    setQrAmount("");
    setQrCustomer("");
  }

  function exportBackup() {
    const backup = { app: "Mbook", exportedAt: new Date().toISOString(), entries, qrImage };
    const url = URL.createObjectURL(new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `mbook_backup_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function applyImport() {
    try {
      const parsed = JSON.parse(importText);
      const imported = Array.isArray(parsed) ? parsed : parsed.entries;
      if (!Array.isArray(imported)) {
        alert("Invalid backup format.");
        return;
      }
      setEntries(imported.map(migrateEntry));
      if (parsed.qrImage) setQrImage(parsed.qrImage);
      setImportText("");
      setShowImport(false);
    } catch {
      alert("Error parsing JSON.");
    }
  }

  function clearAll() {
    if (window.confirm("Delete all data? This cannot be undone.")) {
      setEntries([]);
      localStorage.removeItem("mbook_entries");
    }
  }

  function handleQrUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setQrImage(reader.result as string);
    reader.readAsDataURL(file);
  }

  const inputClass = "w-full rounded-2xl border border-[#2A2D35] bg-[#0D0F14] p-4 text-[#F5F5F7] outline-none transition focus:border-[#E8C468]/70";

  return (
    <div className="min-h-screen bg-[#0D0F14] text-[#F5F5F7] sm:flex sm:items-center sm:justify-center sm:p-4">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800&family=Inter:wght@400;500;600&display=swap');
        .font-display { font-family: 'Plus Jakarta Sans', sans-serif; }
        .font-body { font-family: 'Inter', sans-serif; }
        ::-webkit-scrollbar { width: 0px; background: transparent; }
      `}</style>

      <div className="relative flex h-screen w-full max-w-md flex-col overflow-hidden border-x border-[#2A2D35] bg-[#0D0F14] font-body shadow-2xl sm:h-[844px] sm:rounded-[2.5rem]">
        <div className="h-1.5 shrink-0" style={{ background: GOLD_GRADIENT }} />

        <header className="sticky top-0 z-20 flex items-center justify-between bg-[#0D0F14]/90 px-6 pb-4 pt-6 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl shadow-lg" style={{ background: GOLD_GRADIENT }}>
              <img src="/mbook-logo.png" alt="M" className="h-6 w-6 invert" />
            </div>
            <div>
              <h1 className="font-display text-xl font-extrabold tracking-tight text-[#F5F5F7]">Mbook</h1>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#8B8F99]">Finance Manager</p>
            </div>
          </div>
          <button type="button" onClick={() => setTab("settings")} className="flex h-10 w-10 items-center justify-center rounded-full border border-[#2A2D35] bg-[#181B22] text-[#8B8F99]">
            <SettingsIcon size={18} />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto px-6 pb-32">
          <AnimatePresence mode="wait">
            {tab === "home" && (
              <motion.div key="home" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-6">
                <div className="pt-2">
                  <p className="text-sm text-[#8B8F99]">Good Day!</p>
                  <h2 className="font-display text-3xl font-extrabold">Dashboard</h2>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <StatCard label="Today's Earned" value={inr(todayEarned)} valueClass="text-[#4ADE80]" icon={Banknote} />
                  <StatCard label="Today's Unpaid" value={inr(todayUnpaid)} valueClass="text-[#F87171]" icon={HistoryIcon} />
                </div>
                <div className="rounded-3xl border border-[#2A2D35] bg-[#181B22] p-5 shadow-xl">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-display font-bold">Weekly Performance</h3>
                    <span className="rounded-lg border border-[#2A2D35] bg-[#1F2229] px-2 py-1 text-[10px] font-black uppercase text-[#E8C468]">This Week</span>
                  </div>
                  <div className="flex h-32 items-end justify-between gap-2">
                    {WEEKDAYS.map((day) => (
                      <div key={day} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${Math.max(8, (weeklyData[day] / maxWeekly) * 100)}%` }}
                          className="w-2 rounded-full"
                          style={{ background: day === todayName ? GOLD_GRADIENT : "#2A2D35" }}
                        />
                        <span className={day === todayName ? "text-[10px] font-bold text-[#E8C468]" : "text-[10px] font-bold text-[#8B8F99]"}>{day}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <StatCard label="Today Entries" value={String(todayCount)} />
                  <StatCard label="Net Profit" value={inr(netProfit)} valueClass={netProfit >= 0 ? "text-[#4ADE80]" : "text-[#F87171]"} />
                </div>
              </motion.div>
            )}

            {tab === "history" && (
              <motion.div key="history" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-6">
                <div className="pt-2">
                  <h2 className="font-display text-3xl font-extrabold">Records</h2>
                  <p className="mt-1 text-xs text-[#8B8F99]">Newest records show first. Every work is editable.</p>
                </div>

                <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
                  <StatusFilterCard label="Paid" count={counts.paid} status="paid" active={statusFilter === "paid"} onClick={() => setStatusFilter(statusFilter === "paid" ? "all" : "paid")} />
                  <StatusFilterCard label="Unpaid" count={counts.unpaid} status="unpaid" active={statusFilter === "unpaid"} onClick={() => setStatusFilter(statusFilter === "unpaid" ? "all" : "unpaid")} />
                  <StatusFilterCard label="Undecided" count={counts.undecided} status="undecided" active={statusFilter === "undecided"} onClick={() => setStatusFilter(statusFilter === "undecided" ? "all" : "undecided")} />
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                  {(["all", "today", "week", "month"] as DateFilter[]).map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setDateFilter(key)}
                      className={`rounded-2xl border px-5 py-2 text-xs font-black capitalize transition ${dateFilter === key ? "border-[#E8C468] text-[#0D0F14]" : "border-[#2A2D35] bg-[#181B22] text-[#8B8F99]"}`}
                      style={dateFilter === key ? { background: GOLD_GRADIENT } : undefined}
                    >
                      {key}
                    </button>
                  ))}
                  {statusFilter !== "all" && <button type="button" onClick={() => setStatusFilter("all")} className="rounded-2xl border border-[#2A2D35] bg-[#1F2229] px-5 py-2 text-xs font-black text-[#E8C468]">Clear Status</button>}
                </div>

                <div className="space-y-3">
                  {filteredEntries.length === 0 ? (
                    <div className="py-20 text-center text-sm text-[#8B8F99]">No records found</div>
                  ) : filteredEntries.map((entry) => (
                    <motion.div key={entry.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3 rounded-2xl border border-[#2A2D35] bg-[#181B22] p-4 shadow-lg">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#1F2229] text-[#F5F5F7]">
                            {entry.type === "spend" ? <Download size={20} /> : <Plus size={20} />}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-[#F5F5F7]">{entry.type === "spend" ? entry.note : entry.service === "Other" ? entry.customNote || "Other" : entry.service}</p>
                            <p className="text-[10px] font-semibold uppercase tracking-tight text-[#8B8F99]">{entry.customer ? `${entry.customer} • ` : ""}{formatDate(entry.date)} • {formatTime(entry.date)}</p>
                            <button type="button" onClick={() => toggleStatus(entry.id)} className="mt-1"><StatusPill status={entry.status} /></button>
                          </div>
                        </div>
                        <p className={`shrink-0 text-right font-display font-extrabold ${entry.type === "spend" ? "text-[#F87171]" : "text-[#F5F5F7]"}`}>{entry.type === "spend" ? "-" : ""}{inr(entry.amount)}</p>
                      </div>
                      <div className="flex gap-2 border-t border-[#2A2D35] pt-3">
                        <button type="button" onClick={() => editEntry(entry)} className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#2A2D35] bg-[#1F2229] px-3 py-2 text-xs font-black text-[#F5F5F7]"><Edit3 size={14} /> Edit</button>
                        <button type="button" onClick={() => deleteEntry(entry.id)} className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#2A2D35] bg-[#1F2229] px-3 py-2 text-xs font-black text-[#F87171]"><Trash2 size={14} /> Delete</button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {tab === "summary" && (
              <motion.div key="summary" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-6">
                <div className="pt-2"><h2 className="font-display text-3xl font-extrabold">Analysis</h2></div>
                <div className="rounded-[2rem] border border-[#2A2D35] bg-[#181B22] p-6 shadow-2xl">
                  <p className="text-xs font-black uppercase tracking-widest text-[#8B8F99]">Total Balance</p>
                  <h3 className="mb-6 mt-1 font-display text-4xl font-extrabold">{inr(netProfit)}</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div><p className="text-[10px] font-black uppercase text-[#8B8F99]">Income</p><p className="font-bold text-[#4ADE80]">{inr(totalEarned)}</p></div>
                    <div><p className="text-[10px] font-black uppercase text-[#8B8F99]">Expense</p><p className="font-bold text-[#F87171]">{inr(totalSpend)}</p></div>
                    <div><p className="text-[10px] font-black uppercase text-[#8B8F99]">Unpaid</p><p className="font-bold text-[#E8C468]">{inr(totalUnpaid)}</p></div>
                  </div>
                </div>
                <div className="rounded-3xl border border-[#2A2D35] bg-[#181B22] p-5">
                  <h3 className="mb-4 font-display font-bold">Payment Modes</h3>
                  <div className="space-y-4">
                    <div><div className="mb-2 flex justify-between text-xs font-bold"><span className="flex items-center gap-2 text-[#8B8F99]"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1F2229]"><Banknote size={14} /></span>Cash</span><span>{inr(totalCash)}</span></div><div className="h-2 overflow-hidden rounded-full bg-[#1F2229]"><div className="h-full bg-[#8B8F99]" style={{ width: `${(totalCash / Math.max(1, totalCash + totalOnline)) * 100}%` }} /></div></div>
                    <div><div className="mb-2 flex justify-between text-xs font-bold"><span className="flex items-center gap-2 text-[#8B8F99]"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1F2229]"><Smartphone size={14} /></span>Online</span><span>{inr(totalOnline)}</span></div><div className="h-2 overflow-hidden rounded-full bg-[#1F2229]"><div className="h-full bg-[#8B8F99]" style={{ width: `${(totalOnline / Math.max(1, totalCash + totalOnline)) * 100}%` }} /></div></div>
                  </div>
                </div>
                <div className="rounded-3xl border border-[#2A2D35] bg-[#181B22] p-5">
                  <h3 className="mb-4 font-display font-bold">Services Share</h3>
                  {serviceBreakdown.length === 0 ? <p className="py-4 text-center text-xs text-[#8B8F99]">No services recorded yet</p> : serviceBreakdown.map((item) => <div key={item.name} className="mb-4"><div className="mb-2 flex justify-between text-xs font-bold"><span className="text-[#8B8F99]">{item.name}</span><span>{item.pct}%</span></div><div className="h-1.5 overflow-hidden rounded-full bg-[#1F2229]"><div className="h-full" style={{ width: `${item.pct}%`, background: GOLD_GRADIENT }} /></div></div>)}
                </div>
              </motion.div>
            )}

            {tab === "qr" && (
              <motion.div key="qr" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-6">
                <div className="pt-2"><h2 className="font-display text-3xl font-extrabold">Payments</h2></div>
                <div className="rounded-[2.5rem] border border-[#2A2D35] bg-[#181B22] p-8 text-center shadow-2xl">
                  <img src={qrImage || "/payment-qr.jpg"} alt="QR" className="mx-auto h-64 w-64 rounded-2xl bg-white object-contain p-2" onError={(e) => { (e.target as HTMLImageElement).src = "/payment-qr.jpg"; }} />
                  <p className="mt-6 text-sm font-bold">Scan to Pay</p>
                  <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-[#8B8F99]">Instant Online Payment</p>
                </div>
                <div className="space-y-3 rounded-3xl border border-[#2A2D35] bg-[#181B22] p-6">
                  <h3 className="font-display font-bold">Quick Log</h3>
                  <input type="number" value={qrAmount} onChange={(e) => setQrAmount(e.target.value)} placeholder="Amount Received" className={inputClass} />
                  <input value={qrCustomer} onChange={(e) => setQrCustomer(e.target.value)} placeholder="Customer Name" className={inputClass} />
                  <button type="button" onClick={addQrPayment} className="flex w-full items-center justify-center gap-2 rounded-2xl py-4 font-black text-[#0D0F14]" style={{ background: GOLD_GRADIENT }}><Plus size={18} /> Log Payment</button>
                </div>
              </motion.div>
            )}

            {tab === "settings" && (
              <motion.div key="settings" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-6">
                <div className="pt-2"><h2 className="font-display text-3xl font-extrabold">Settings</h2></div>
                <div className="rounded-3xl border border-[#2A2D35] bg-[#181B22] p-2">
                  <div className="flex items-center justify-between p-4"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1F2229] text-[#8B8F99]"><BarChart3 size={20} /></span><span className="text-sm font-bold">Dark Appearance</span></div><button type="button" onClick={toggleTheme || (() => {})} className={`relative h-6 w-12 rounded-full ${theme === "dark" ? "" : "bg-[#1F2229]"}`} style={theme === "dark" ? { background: GOLD_GRADIENT } : undefined}><motion.span animate={{ x: theme === "dark" ? 24 : 2 }} className="absolute left-0 top-1 h-4 w-4 rounded-full bg-white" /></button></div>
                </div>
                <div className="rounded-3xl border border-[#2A2D35] bg-[#181B22] p-2">
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="flex w-full items-center justify-between rounded-2xl p-4 hover:bg-[#1F2229]"><span className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1F2229]"><Upload size={18} /></span><span className="text-sm font-bold">Update QR Code</span></span><ChevronRight size={18} className="text-[#8B8F99]" /></button>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleQrUpload} className="hidden" />
                  <button type="button" onClick={exportBackup} className="flex w-full items-center justify-between rounded-2xl p-4 hover:bg-[#1F2229]"><span className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1F2229]"><Download size={18} /></span><span className="text-sm font-bold">Export Data</span></span><ChevronRight size={18} className="text-[#8B8F99]" /></button>
                  <button type="button" onClick={() => setShowImport((v) => !v)} className="flex w-full items-center justify-between rounded-2xl p-4 hover:bg-[#1F2229]"><span className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1F2229]"><PieChart size={18} /></span><span className="text-sm font-bold">Import Data</span></span><ChevronRight size={18} className="text-[#8B8F99]" /></button>
                </div>
                {showImport && <div className="space-y-3 rounded-3xl border border-[#2A2D35] bg-[#181B22] p-4"><textarea value={importText} onChange={(e) => setImportText(e.target.value)} placeholder="Paste backup JSON" className="h-32 w-full rounded-2xl border border-[#2A2D35] bg-[#0D0F14] p-4 font-mono text-xs text-[#F5F5F7] outline-none" /><button type="button" onClick={applyImport} className="w-full rounded-2xl py-3 text-sm font-black text-[#0D0F14]" style={{ background: GOLD_GRADIENT }}>Restore Backup</button></div>}
                <button type="button" onClick={clearAll} className="flex w-full items-center gap-3 rounded-3xl border border-[#F87171]/20 bg-[#F87171]/5 p-4 text-sm font-bold text-[#F87171]"><Trash2 size={18} /> Clear All Records</button>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <nav className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around border-t border-[#2A2D35] bg-[#0D0F14]/90 px-4 pb-8 pt-2 backdrop-blur-2xl sm:absolute">
          <NavButton icon={HomeIcon} label="Home" active={tab === "home"} onClick={() => setTab("home")} />
          <NavButton icon={HistoryIcon} label="Records" active={tab === "history"} onClick={() => setTab("history")} />
          <div className="relative -top-6"><button type="button" onClick={openNewForm} className="flex h-14 w-14 items-center justify-center rounded-2xl text-[#0D0F14] shadow-2xl active:scale-95" style={{ background: GOLD_GRADIENT }}><Plus size={28} strokeWidth={3} /></button></div>
          <NavButton icon={BarChart3} label="Analysis" active={tab === "summary"} onClick={() => setTab("summary")} />
          <NavButton icon={QrCode} label="Pay" active={tab === "qr"} onClick={() => setTab("qr")} />
        </nav>

        <AnimatePresence>
          {showForm && (
            <div className="fixed inset-0 z-50 flex items-end justify-center sm:absolute">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeForm} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
              <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="relative z-10 max-h-[90%] w-full max-w-md overflow-y-auto rounded-t-[2.5rem] border-t border-[#2A2D35] bg-[#181B22] p-8 shadow-2xl">
                <div className="mx-auto mb-8 h-1.5 w-12 rounded-full bg-[#2A2D35]" />
                <div className="mb-8 flex items-start justify-between gap-4"><div><h2 className="font-display text-2xl font-extrabold">{editingId ? "Edit Record" : "New Record"}</h2><p className="mt-1 text-xs text-[#8B8F99]">Work data is saved in local device storage.</p></div><button type="button" onClick={closeForm} className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1F2229] text-[#8B8F99]"><X size={20} /></button></div>
                <div className="mb-6 flex gap-2 rounded-2xl bg-[#0D0F14] p-1"><button type="button" onClick={() => setForm((f) => ({ ...f, entryType: "work" }))} className={`flex-1 rounded-xl py-3 text-xs font-black uppercase ${form.entryType === "work" ? "text-[#0D0F14]" : "text-[#8B8F99]"}`} style={form.entryType === "work" ? { background: GOLD_GRADIENT } : undefined}>Work</button><button type="button" onClick={() => setForm((f) => ({ ...f, entryType: "spend" }))} className={`flex-1 rounded-xl py-3 text-xs font-black uppercase ${form.entryType === "spend" ? "bg-[#F87171] text-white" : "text-[#8B8F99]"}`}>Spend</button></div>
                <div className="space-y-4">
                  {form.entryType === "work" ? <>
                    <select value={form.service} onChange={(e) => setForm((f) => ({ ...f, service: e.target.value }))} className={inputClass}>{SERVICES.map((service) => <option key={service} value={service}>{service}</option>)}</select>
                    {form.service === "Other" && <input value={form.customNote} onChange={(e) => setForm((f) => ({ ...f, customNote: e.target.value }))} placeholder="Describe service" className={inputClass} />}
                    <input value={form.customer} onChange={(e) => setForm((f) => ({ ...f, customer: e.target.value }))} placeholder="Customer Name" className={inputClass} />
                    <div><p className="mb-2 ml-1 text-[10px] font-black uppercase tracking-widest text-[#8B8F99]">Payment Status</p><div className="flex gap-2">{(["undecided", "unpaid", "paid"] as EntryStatus[]).map((status) => <button key={status} type="button" onClick={() => setFormStatus(status)} className={`flex-1 rounded-xl border py-3 text-[10px] font-black uppercase ${form.status === status ? status === "paid" ? "border-[#4ADE80] bg-[#4ADE80] text-[#0D0F14]" : status === "unpaid" ? "border-[#F87171] bg-[#F87171] text-white" : "border-[#E8C468] text-[#0D0F14]" : "border-[#2A2D35] bg-[#0D0F14] text-[#8B8F99]"}`} style={form.status === status && status === "undecided" ? { background: GOLD_GRADIENT } : undefined}>{status}</button>)}</div></div>
                    <div><p className="mb-2 ml-1 text-[10px] font-black uppercase tracking-widest text-[#8B8F99]">Amount</p><input type="number" value={form.status === "undecided" ? "0" : form.amount} disabled={form.status === "undecided"} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} placeholder="₹0" className={`${inputClass} font-display text-xl font-bold ${form.status === "undecided" ? "cursor-not-allowed bg-[#1F2229] text-[#8B8F99]" : ""}`} />{form.status === "undecided" && <p className="ml-1 mt-1 text-[11px] text-[#8B8F99]">Undecided amount stays ₹0 until you edit it later.</p>}</div>
                    {form.status === "paid" && <div className="flex gap-2">{(["cash", "online"] as PaymentMethod[]).map((method) => <button key={method} type="button" onClick={() => setForm((f) => ({ ...f, method }))} className={`flex-1 rounded-xl border py-3 text-[10px] font-black uppercase ${form.method === method ? "border-[#8B8F99]/40 bg-[#1F2229] text-[#F5F5F7]" : "border-[#2A2D35] bg-[#0D0F14] text-[#8B8F99]"}`}>{method}</button>)}</div>}
                  </> : <>
                    <input value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} placeholder="What did you spend on?" className={inputClass} />
                    <input type="number" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} placeholder="₹0" className={`${inputClass} font-display text-xl font-bold`} />
                  </>}
                </div>
                <button type="button" onClick={saveEntry} className="mt-8 w-full rounded-2xl py-5 font-black uppercase tracking-widest text-[#0D0F14] shadow-xl active:scale-95" style={{ background: GOLD_GRADIENT }}>{editingId ? "Save Changes" : "Confirm Entry"}</button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
