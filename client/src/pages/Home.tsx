import React, { useState, useMemo, useRef, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home as HomeIcon,
  History as HistoryIcon,
  BarChart3,
  QrCode,
  Settings as SettingsIcon,
  Plus,
  X,
  Download,
  Upload,
  Trash2,
  Banknote,
  Smartphone,
  ChevronRight,
  PieChart,
} from "lucide-react";

const SERVICES = [
  "PAN Card",
  "Voter ID",
  "Aadhaar",
  "Ration Card",
  "Swasthya Sathi",
  "DBT Link",
  "Other",
];

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function dayLabel(daysAgo: number) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return WEEKDAYS[d.getDay()];
}

interface Entry {
  id: number;
  type: "work" | "spend";
  service?: string;
  customNote?: string;
  customer?: string;
  amount: number;
  status?: "paid" | "unpaid" | "undecided";
  method?: "cash" | "online";
  note?: string;
  date: string; // ISO string
}

const seedEntries: Entry[] = [];

function CustomSwitch({ checked, onClick, activeClass }: { checked: boolean; onClick: () => void; activeClass: string }) {
  return (
    <button
      onClick={onClick}
      className={`w-12 h-6 rounded-full relative transition-all duration-300 ${
        checked ? activeClass : "bg-zinc-700/50"
      }`}
    >
      <motion.span
        animate={{ x: checked ? 24 : 2 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-sm"
      />
    </button>
  );
}

function StatCard({ label, value, valueClass = "text-zinc-900 dark:text-white", icon: Icon }: { label: string; value: string; valueClass?: string; icon?: any }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-zinc-100 dark:bg-zinc-900/50 backdrop-blur-md border border-zinc-200 dark:border-zinc-800/50 rounded-2xl p-4 flex-1 shadow-lg group hover:bg-zinc-200 dark:hover:bg-zinc-900 transition-colors"
    >
      <div className="flex justify-between items-start mb-1">
        <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider">{label}</p>
        {Icon && <Icon size={14} className="text-zinc-400 dark:text-zinc-600 group-hover:text-zinc-600 dark:group-hover:text-zinc-400 transition-colors" />}
      </div>
      <p className={`text-xl font-display font-bold ${valueClass}`}>{value}</p>
    </motion.div>
  );
}

function NavButton({ icon: Icon, label, active, onClick }: { icon: any; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex-1 flex flex-col items-center justify-center gap-1 py-3 relative group"
    >
      <Icon
        size={22}
        className={`transition-all duration-300 ${active ? "text-amber-400 scale-110" : "text-zinc-500 group-hover:text-zinc-400"}`}
      />
      <span
        className={`text-[10px] font-medium transition-colors duration-300 ${active ? "text-amber-400" : "text-zinc-500 group-hover:text-zinc-400"}`}
      >
        {label}
      </span>
      {active && (
        <motion.div 
          layoutId="activeTab"
          className="absolute top-0 w-8 h-1 bg-amber-400 rounded-b-full"
        />
      )}
    </button>
  );
}

export default function MBookApp() {
  const { theme, toggleTheme } = useTheme();
  const [tab, setTab] = useState("home");
  const [entries, setEntries] = useState<Entry[]>(() => {
    const saved = localStorage.getItem("mbook_entries");
    if (!saved) return seedEntries;
    try {
      const parsed = JSON.parse(saved);
      // Migration: convert old entries with daysAgo to date
      return parsed.map((e: any) => {
        if (e.daysAgo !== undefined && !e.date) {
          const d = new Date();
          d.setDate(d.getDate() - e.daysAgo);
          return { ...e, date: d.toISOString() };
        }
        return e;
      });
    } catch {
      return seedEntries;
    }
  });
  const [filter, setFilter] = useState("all");
  const [showAdd, setShowAdd] = useState(false);
  const [qrImage, setQrImage] = useState<string | null>(() => localStorage.getItem("mbook_qr") || "/payment-qr.jpg");
  const [importText, setImportText] = useState("");
  const [showImport, setShowImport] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [qrAmount, setQrAmount] = useState("");
  const [qrCustomer, setQrCustomer] = useState("");

  const [form, setForm] = useState({
    entryType: "work",
    service: "PAN Card",
    customNote: "",
    customer: "",
    amount: "",
    status: "undecided",
    method: "cash",
    note: "",
  });

  useEffect(() => {
    localStorage.setItem("mbook_entries", JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    if (qrImage) localStorage.setItem("mbook_qr", qrImage);
  }, [qrImage]);

  const todayName = dayLabel(0);

  const entriesWithDaysAgo = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return entries.map(e => {
      const entryDate = new Date(e.date);
      entryDate.setHours(0, 0, 0, 0);
      const diffTime = now.getTime() - entryDate.getTime();
      const daysAgo = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      return { ...e, daysAgo };
    });
  }, [entries]);

  const workEntries = entriesWithDaysAgo.filter((e) => e.type === "work");
  const spendEntries = entries.filter((e) => e.type === "spend");

  const totalEarned = workEntries
    .filter((e) => e.status === "paid")
    .reduce((s, e) => s + e.amount, 0);
  const totalPendingEntries = workEntries.filter((e) => e.status === "unpaid");
  const totalPending = totalPendingEntries.reduce((s, e) => s + e.amount, 0);
  const totalPendingCount = totalPendingEntries.length;
  const totalUndecided = workEntries
    .filter((e) => e.status === "undecided")
    .reduce((s, e) => s + e.amount, 0);
  const totalSpend = spendEntries.reduce((s, e) => s + e.amount, 0);
  const netProfit = totalEarned - totalSpend;
  const totalCash = workEntries
    .filter((e) => e.status === "paid" && e.method === "cash")
    .reduce((s, e) => s + e.amount, 0);
  const totalOnline = workEntries
    .filter((e) => e.status === "paid" && e.method === "online")
    .reduce((s, e) => s + e.amount, 0);

  const todayUndecided = workEntries
    .filter((e) => e.daysAgo === 0 && e.status === "undecided")
    .reduce((s, e) => s + e.amount, 0);
  const todayEarned = workEntries
    .filter((e) => e.daysAgo === 0 && e.status === "paid")
    .reduce((s, e) => s + e.amount, 0);
  const todayPendingEntries = workEntries.filter((e) => e.daysAgo === 0 && e.status === "unpaid");
  const todayPending = todayPendingEntries.reduce((s, e) => s + e.amount, 0);
  const todayPendingCount = todayPendingEntries.length;
  const todayCount = entriesWithDaysAgo.filter((e) => e.daysAgo === 0).length;

  const weeklyData = useMemo(() => {
    const sums: Record<string, number> = {};
    WEEKDAYS.forEach((d) => (sums[d] = 0));
    workEntries
      .filter((e) => e.status === "paid" && e.daysAgo <= 6)
      .forEach((e) => {
        const label = dayLabel(e.daysAgo);
        sums[label] += e.amount;
      });
    return sums;
  }, [workEntries]);
  const maxWeekly = Math.max(1, ...Object.values(weeklyData));

  const serviceBreakdown = useMemo(() => {
    const sums: Record<string, number> = {};
    workEntries.forEach((e) => {
      const key = e.service === "Other" ? e.customNote || "Other" : (e.service || "Other");
      sums[key] = (sums[key] || 0) + e.amount;
    });
    const total = Object.values(sums).reduce((a, b) => a + b, 0) || 1;
    return Object.entries(sums)
      .map(([k, v]) => ({ name: k, pct: Math.round((v / total) * 100) }))
      .sort((a, b) => b.pct - a.pct);
  }, [workEntries]);

  const filteredEntries = useMemo(() => {
    let list = [...entriesWithDaysAgo];
    if (filter === "today") list = list.filter((e) => e.daysAgo === 0);
    if (filter === "week") list = list.filter((e) => e.daysAgo <= 6);
    if (filter === "month") list = list.filter((e) => e.daysAgo <= 30);
    return list.sort((a, b) => a.daysAgo - b.daysAgo);
  }, [entriesWithDaysAgo, filter]);

  function toggleStatus(id: number) {
    setEntries((prev) =>
      prev.map((e) => {
        if (e.id === id && e.type === "work") {
          const nextStatus = e.status === "paid" ? "unpaid" : (e.status === "unpaid" ? "undecided" : "paid") as "paid" | "unpaid" | "undecided";
          return {
            ...e,
            status: nextStatus,
            method: nextStatus === "paid" ? (e.method || "cash") : undefined,
          };
        }
        return e;
      })
    );
  }

  function setMethod(id: number, method: "cash" | "online") {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, method } : e))
    );
  }

  function resetForm() {
    setForm({
      entryType: "work",
      service: "PAN Card",
      customNote: "",
      customer: "",
      amount: "",
      status: "undecided",
      method: "cash",
      note: "",
    });
  }

  function saveEntry() {
    const amount = parseFloat(form.amount) || 0;
    if (form.entryType === "spend") {
      if (!form.note.trim()) return;
      const newEntry: Entry = { id: Date.now(), type: "spend", note: form.note, amount, date: new Date().toISOString() };
      setEntries((prev) => [...prev, newEntry]);
    } else {
      const newEntry: Entry = {
        id: Date.now(),
        type: "work",
        service: form.service,
        customNote: form.service === "Other" ? form.customNote : undefined,
        customer: form.customer,
        amount,
        status: form.status as "paid" | "unpaid" | "undecided",
        method: form.status === "paid" ? (form.method as "cash" | "online") : undefined,
        date: new Date().toISOString(),
      };
      setEntries((prev) => [...prev, newEntry]);
    }
    resetForm();
    setShowAdd(false);
  }

  function addQrPayment() {
    const amount = parseFloat(qrAmount) || 0;
    if (amount <= 0) return;
    const newEntry: Entry = {
      id: Date.now(),
      type: "work",
      service: "Other",
      customNote: "QR Payment",
      customer: qrCustomer,
      amount,
      status: "paid",
      method: "online",
      date: new Date().toISOString(),
    };
    setEntries((prev) => [...prev, newEntry]);
    setQrAmount("");
    setQrCustomer("");
  }

  function exportBackup() {
    const blob = new Blob([JSON.stringify(entries, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mbook_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function applyImport() {
    try {
      const parsed = JSON.parse(importText);
      if (Array.isArray(parsed)) {
        setEntries(parsed as Entry[]);
        setShowImport(false);
        setImportText("");
      } else {
        alert("Invalid backup format.");
      }
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

  const inr = (n: number) => `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 flex items-center justify-center p-0 sm:p-4 font-body text-zinc-900 dark:text-zinc-200 transition-colors duration-300">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800&family=Inter:wght@400;500;600&display=swap');
        .font-display { font-family: 'Plus Jakarta Sans', sans-serif; }
        .font-body { font-family: 'Inter', sans-serif; }
        ::-webkit-scrollbar { width: 0px; background: transparent; }
      `}</style>
      
      <div className="w-full max-w-md bg-white dark:bg-zinc-950 sm:rounded-[2.5rem] overflow-hidden shadow-2xl border-x border-zinc-200 dark:border-zinc-800/50 flex flex-col h-screen sm:h-[844px] relative transition-colors duration-300">
        <div className="h-1.5 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600 shrink-0" />

        {/* Header */}
        <header className="px-6 pt-6 pb-4 flex items-center justify-between sticky top-0 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl z-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-900/20">
              <img src="/mbook-logo.png" alt="M" className="w-6 h-6 invert" />
            </div>
            <div>
              <h1 className="text-zinc-900 dark:text-white text-xl font-display font-extrabold tracking-tight">Mbook</h1>
              <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Finance Manager</p>
            </div>
          </div>
          <button 
            onClick={() => setTab("settings")}
            className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-900/50 flex items-center justify-center border border-zinc-200 dark:border-zinc-800/50 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            <SettingsIcon size={18} />
          </button>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto px-6 pb-32">
          <AnimatePresence mode="wait">
            {tab === "home" && (
              <motion.div 
                key="home"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-6"
              >
                <div className="pt-2">
                  <h2 className="text-zinc-500 dark:text-zinc-400 text-sm font-medium mb-1">Good Day!</h2>
                  <h1 className="text-zinc-900 dark:text-white text-3xl font-display font-bold">Dashboard</h1>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <StatCard
                    label="Today's Earned"
                    value={inr(todayEarned)}
                    valueClass="text-emerald-400"
                    icon={Banknote}
                  />
                  <StatCard
                    label="Today's Pending"
                    value={`${inr(todayPending)} (${todayPendingCount})`}
                    valueClass="text-rose-400"
                    icon={HistoryIcon}
                  />
                </div>

                <div className="bg-zinc-100 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/50 rounded-3xl p-5 shadow-xl transition-colors">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-zinc-900 dark:text-white font-display font-bold">Weekly Performance</h3>
                    <div className="px-2 py-1 bg-amber-500/10 rounded-lg">
                      <span className="text-amber-500 text-[10px] font-bold uppercase">This Week</span>
                    </div>
                  </div>
                  
                  <div className="flex items-end justify-between h-32 gap-2">
                    {WEEKDAYS.map((d) => (
                      <div key={d} className="flex flex-col items-center justify-end h-full flex-1 gap-2">
                        <div className="relative w-full flex justify-center group">
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${Math.max(8, (weeklyData[d] / (maxWeekly || 1)) * 100)}%` }}
                            className={`w-2 sm:w-3 rounded-full ${d === todayName ? "bg-amber-400 shadow-lg shadow-amber-900/40" : "bg-zinc-300 dark:bg-zinc-800 group-hover:bg-zinc-400 dark:group-hover:bg-zinc-700"} transition-colors`}
                          />
                        </div>
                        <span className={`text-[10px] font-bold ${d === todayName ? "text-amber-400" : "text-zinc-400 dark:text-zinc-600"}`}>{d}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                   <div className="bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/50 rounded-2xl p-4 transition-colors">
                    <p className="text-zinc-500 text-[10px] font-bold uppercase mb-1">Total Entries</p>
                    <p className="text-zinc-900 dark:text-white text-2xl font-display font-bold">{todayCount}</p>
                  </div>
                  <div className="bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/50 rounded-2xl p-4 transition-colors">
                    <p className="text-zinc-500 text-[10px] font-bold uppercase mb-1">Net Profit</p>
                    <p className={`text-2xl font-display font-bold ${netProfit >= 0 ? "text-emerald-400" : "text-rose-400"}`}>{inr(netProfit)}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {tab === "history" && (
              <motion.div 
                key="history"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-6"
              >
                <div className="pt-2">
                  <h1 className="text-zinc-900 dark:text-white text-3xl font-display font-bold">Records</h1>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                  {[
                    ["all", "All"],
                    ["today", "Today"],
                    ["week", "Week"],
                    ["month", "Month"],
                  ].map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => setFilter(key)}
                      className={`px-5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap border transition-all ${
                        filter === key
                          ? "bg-amber-500 border-amber-500 text-zinc-950 shadow-lg shadow-amber-900/20"
                          : "bg-zinc-100 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <div className="space-y-3">
                  {filteredEntries.length === 0 ? (
                    <div className="text-center py-20">
                      <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-zinc-200 dark:border-zinc-800">
                        <HistoryIcon className="text-zinc-400 dark:text-zinc-700" size={24} />
                      </div>
                      <p className="text-zinc-500 text-sm">No records found</p>
                    </div>
                  ) : (
                    filteredEntries.map((e) => (
                      <motion.div
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={e.id}
                        className="bg-zinc-100 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/50 rounded-2xl p-4 flex items-center justify-between group hover:bg-zinc-200 dark:hover:bg-zinc-900/60 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${e.type === 'spend' ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500'}`}>
                            {e.type === 'spend' ? <Download size={20} /> : <Plus size={20} />}
                          </div>
                          <div>
                            <p className="text-zinc-900 dark:text-white font-bold text-sm">
                              {e.type === 'spend' ? e.note : (e.service === "Other" ? e.customNote || "Other" : e.service)}
                            </p>
                            <p className="text-zinc-500 text-[10px] font-medium uppercase tracking-tighter">
                              {e.customer ? `${e.customer} • ` : ''}{e.daysAgo === 0 ? 'Today' : `${e.daysAgo}d ago`}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-display font-extrabold ${e.type === 'spend' ? 'text-rose-400' : 'text-zinc-900 dark:text-white'}`}>
                            {e.type === 'spend' ? '-' : ''}{inr(e.amount)}
                          </p>
                          {e.type === 'work' && (
                            <button 
                              onClick={() => toggleStatus(e.id)}
                              className={`text-[9px] font-black uppercase tracking-widest mt-1 ${e.status === 'paid' ? 'text-emerald-500' : e.status === 'unpaid' ? 'text-rose-500' : 'text-amber-500'}`}
                            >
                              {e.status}
                            </button>
                          )}
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {tab === "summary" && (
              <motion.div 
                key="summary"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-6"
              >
                <div className="pt-2">
                  <h1 className="text-zinc-900 dark:text-white text-3xl font-display font-bold">Analysis</h1>
                </div>

                <div className="bg-gradient-to-br from-zinc-800 to-zinc-900 dark:from-zinc-900 dark:to-black border border-zinc-200 dark:border-zinc-800 rounded-[2rem] p-6 shadow-2xl relative overflow-hidden transition-colors">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-3xl rounded-full -mr-16 -mt-16" />
                  <p className="text-zinc-400 dark:text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">Total Balance</p>
                  <h2 className="text-white text-4xl font-display font-extrabold mb-6">{inr(netProfit)}</h2>
                  
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <p className="text-zinc-500 text-[10px] font-bold uppercase mb-1">Income</p>
                      <p className="text-emerald-400 font-bold">{inr(totalEarned)}</p>
                    </div>
                    <div className="w-px h-8 bg-zinc-700 dark:bg-zinc-800" />
                    <div className="flex-1">
                      <p className="text-zinc-500 text-[10px] font-bold uppercase mb-1">Expense</p>
                      <p className="text-rose-400 font-bold">{inr(totalSpend)}</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-zinc-800/50 flex gap-4">
                    <div className="flex-1">
                      <p className="text-zinc-500 text-[10px] font-bold uppercase mb-1">Unpaid Work</p>
                      <p className="text-amber-500 font-bold">{inr(totalPending)} ({totalPendingCount} entries)</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-zinc-900 dark:text-white font-display font-bold px-1">Payment Modes</h3>
                  <div className="bg-zinc-100 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/50 rounded-3xl p-5 space-y-4 transition-colors">
                    <div>
                      <div className="flex justify-between text-xs font-bold mb-2">
                        <span className="text-zinc-400 flex items-center gap-2"><Banknote size={14} className="text-teal-500" /> Cash</span>
                        <span className="text-zinc-900 dark:text-white">{inr(totalCash)}</span>
                      </div>
                      <div className="h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(totalCash / Math.max(1, totalCash + totalOnline)) * 100}%` }}
                          className="h-full bg-teal-500"
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs font-bold mb-2">
                        <span className="text-zinc-400 flex items-center gap-2"><Smartphone size={14} className="text-sky-500" /> Online</span>
                        <span className="text-zinc-900 dark:text-white">{inr(totalOnline)}</span>
                      </div>
                      <div className="h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(totalOnline / Math.max(1, totalCash + totalOnline)) * 100}%` }}
                          className="h-full bg-sky-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-zinc-900 dark:text-white font-display font-bold px-1">Services Share</h3>
                  <div className="bg-zinc-100 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/50 rounded-3xl p-5 space-y-4 transition-colors">
                    {serviceBreakdown.map((s) => (
                      <div key={s.name}>
                        <div className="flex justify-between text-xs font-bold mb-2">
                          <span className="text-zinc-400">{s.name}</span>
                          <span className="text-zinc-900 dark:text-white">{s.pct}%</span>
                        </div>
                        <div className="h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${s.pct}%` }}
                            className="h-full bg-amber-500/60"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {tab === "qr" && (
              <motion.div 
                key="qr"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-6"
              >
                <div className="pt-2">
                  <h1 className="text-zinc-900 dark:text-white text-3xl font-display font-bold">Payments</h1>
                </div>

                <div className="bg-white rounded-[2.5rem] p-8 flex flex-col items-center shadow-2xl relative">
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-zinc-100 rounded-full" />
                  <div className="w-full flex justify-center">
                    <img
                      src={qrImage || "/payment-qr.jpg"}
                      alt="QR"
                      className="w-64 h-64 object-contain rounded-2xl shadow-inner"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/payment-qr.jpg";
                      }}
                    />
                  </div>

                  <div className="mt-6 text-center">
                    <p className="text-zinc-900 font-bold text-sm">Scan to Pay</p>
                    <p className="text-zinc-400 text-[10px] font-medium mt-1 uppercase tracking-widest">Instant Online Payment</p>
                  </div>
                </div>

                <div className="bg-zinc-100 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/50 rounded-3xl p-6 space-y-4 transition-colors">
                  <h3 className="text-zinc-900 dark:text-white font-display font-bold">Quick Log</h3>
                  <div className="space-y-3">
                    <input
                      type="number"
                      value={qrAmount}
                      onChange={(e) => setQrAmount(e.target.value)}
                      placeholder="Amount Received"
                      className="w-full bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white rounded-2xl p-4 border border-zinc-200 dark:border-zinc-800 focus:border-amber-500/50 outline-none transition-all font-bold"
                    />
                    <input
                      value={qrCustomer}
                      onChange={(e) => setQrCustomer(e.target.value)}
                      placeholder="Customer Name"
                      className="w-full bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white rounded-2xl p-4 border border-zinc-200 dark:border-zinc-800 focus:border-amber-500/50 outline-none transition-all"
                    />
                    <button
                      onClick={addQrPayment}
                      className="w-full bg-amber-500 text-zinc-950 rounded-2xl py-4 flex items-center justify-center gap-2 font-extrabold shadow-lg shadow-amber-900/20 active:scale-[0.98] transition-transform"
                    >
                      <Plus size={18} /> Log Payment
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {tab === "settings" && (
              <motion.div 
                key="settings"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-6"
              >
                <div className="pt-2">
                  <h1 className="text-zinc-900 dark:text-white text-3xl font-display font-bold">Settings</h1>
                </div>

                <div className="bg-zinc-100 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/50 rounded-3xl p-2 transition-colors">
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400">
                        <BarChart3 size={20} />
                      </div>
                      <span className="text-zinc-900 dark:text-white font-bold text-sm">Dark Appearance</span>
                    </div>
                    <CustomSwitch checked={theme === "dark"} onClick={toggleTheme || (() => {})} activeClass="bg-amber-500" />
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest px-4">Configuration</p>
                  <div className="bg-zinc-100 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/50 rounded-3xl p-2 space-y-1 transition-colors">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full flex items-center justify-between p-4 hover:bg-zinc-200 dark:hover:bg-zinc-800/50 rounded-2xl transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                          <Upload size={18} />
                        </div>
                        <span className="text-zinc-900 dark:text-white font-bold text-sm">Update QR Code</span>
                      </div>
                      <ChevronRight size={18} className="text-zinc-300 dark:text-zinc-700 group-hover:text-zinc-500" />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleQrUpload}
                      className="hidden"
                    />

                    <button
                      onClick={exportBackup}
                      className="w-full flex items-center justify-between p-4 hover:bg-zinc-200 dark:hover:bg-zinc-800/50 rounded-2xl transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 flex items-center justify-center">
                          <Download size={18} />
                        </div>
                        <span className="text-zinc-900 dark:text-white font-bold text-sm">Export Data</span>
                      </div>
                      <ChevronRight size={18} className="text-zinc-300 dark:text-zinc-700 group-hover:text-zinc-500" />
                    </button>

                    <button
                      onClick={() => setShowImport((v) => !v)}
                      className="w-full flex items-center justify-between p-4 hover:bg-zinc-200 dark:hover:bg-zinc-800/50 rounded-2xl transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 flex items-center justify-center">
                          <PieChart size={18} />
                        </div>
                        <span className="text-zinc-900 dark:text-white font-bold text-sm">Import Data</span>
                      </div>
                      <ChevronRight size={18} className="text-zinc-300 dark:text-zinc-700 group-hover:text-zinc-500" />
                    </button>
                  </div>
                </div>

                {showImport && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-zinc-100 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/50 rounded-3xl p-4 space-y-3 transition-colors"
                  >
                    <textarea
                      value={importText}
                      onChange={(e) => setImportText(e.target.value)}
                      placeholder="Paste backup JSON"
                      className="w-full h-32 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white rounded-2xl p-4 border border-zinc-200 dark:border-zinc-800 focus:border-amber-500/50 outline-none transition-all font-mono text-xs"
                    />
                    <button
                      onClick={applyImport}
                      className="w-full bg-amber-500 text-zinc-950 rounded-2xl py-3 font-extrabold text-sm"
                    >
                      Restore Backup
                    </button>
                  </motion.div>
                )}

                <button
                  onClick={clearAll}
                  className="w-full flex items-center gap-3 p-4 bg-rose-500/5 border border-rose-500/20 rounded-3xl text-rose-500 font-bold text-sm hover:bg-rose-500/10 transition-colors"
                >
                  <Trash2 size={18} />
                  <span>Clear All Records</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 sm:absolute left-0 right-0 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-2xl border-t border-zinc-200 dark:border-zinc-800/50 px-4 pb-8 pt-2 flex items-center justify-around z-30 transition-colors">
          <NavButton icon={HomeIcon} label="Home" active={tab === "home"} onClick={() => setTab("home")} />
          <NavButton icon={HistoryIcon} label="Records" active={tab === "history"} onClick={() => setTab("history")} />
          
          <div className="relative -top-6">
            <button
              onClick={() => setShowAdd(true)}
              className="w-14 h-14 bg-amber-500 text-zinc-950 rounded-2xl flex items-center justify-center shadow-2xl shadow-amber-900/40 active:scale-90 transition-transform"
            >
              <Plus size={28} strokeWidth={3} />
            </button>
          </div>

          <NavButton icon={BarChart3} label="Analysis" active={tab === "summary"} onClick={() => setTab("summary")} />
          <NavButton icon={QrCode} label="Pay" active={tab === "qr"} onClick={() => setTab("qr")} />
        </nav>

        {/* Add Entry Modal */}
        <AnimatePresence>
          {showAdd && (
            <div className="fixed inset-0 z-50 flex items-end justify-center sm:absolute">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowAdd(false)}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              />
                <motion.div
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-t-[2.5rem] border-t border-zinc-200 dark:border-zinc-800 p-8 relative z-10 max-h-[90%] overflow-y-auto no-scrollbar shadow-2xl transition-colors"
                >
                  <div className="w-12 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full mx-auto mb-8" />
                  
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-zinc-900 dark:text-white text-2xl font-display font-extrabold">New Record</h2>
                    <button 
                      onClick={() => setShowAdd(false)}
                      className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="flex gap-2 p-1 bg-zinc-100 dark:bg-zinc-950 rounded-2xl mb-6 transition-colors">
                  <button
                    onClick={() => setForm((f) => ({ ...f, entryType: "work" }))}
                    className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                      form.entryType === "work" ? "bg-amber-500 text-zinc-950" : "text-zinc-500"
                    }`}
                  >
                    Work
                  </button>
                  <button
                    onClick={() => setForm((f) => ({ ...f, entryType: "spend" }))}
                    className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                      form.entryType === "spend" ? "bg-rose-500 text-white" : "text-zinc-500"
                    }`}
                  >
                    Spend
                  </button>
                </div>

                <div className="space-y-4">
                  {form.entryType === "work" ? (
                    <>
                      <div className="space-y-1.5">
                        <label className="text-zinc-500 text-[10px] font-black uppercase tracking-widest ml-1">Service Type</label>
                        <select
                          value={form.service}
                          onChange={(e) => setForm((f) => ({ ...f, service: e.target.value }))}
                          className="w-full bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white rounded-2xl p-4 border border-zinc-200 dark:border-zinc-800 outline-none focus:border-amber-500/50 transition-colors"
                        >
                          {SERVICES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      
                      {form.service === "Other" && (
                        <input
                          value={form.customNote}
                          onChange={(e) => setForm((f) => ({ ...f, customNote: e.target.value }))}
                          placeholder="Describe service"
                          className="w-full bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white rounded-2xl p-4 border border-zinc-200 dark:border-zinc-800 outline-none focus:border-amber-500/50 transition-colors"
                        />
                      )}

                      <input
                        value={form.customer}
                        onChange={(e) => setForm((f) => ({ ...f, customer: e.target.value }))}
                        placeholder="Customer Name"
                        className="w-full bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white rounded-2xl p-4 border border-zinc-200 dark:border-zinc-800 outline-none focus:border-amber-500/50 transition-colors"
                      />

                      <div className="space-y-1.5">
                        <label className="text-zinc-500 text-[10px] font-black uppercase tracking-widest ml-1">Amount</label>
                        <input
                          type="number"
                          value={form.amount}
                          onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                          placeholder="₹0.00"
                          className="w-full bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white rounded-2xl p-4 border border-zinc-200 dark:border-zinc-800 outline-none focus:border-amber-500/50 text-xl font-display font-bold transition-colors"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-zinc-500 text-[10px] font-black uppercase tracking-widest ml-1">Payment Status</label>
                        <div className="flex gap-2">
                          {["undecided", "unpaid", "paid"].map((s) => (
                            <button
                              key={s}
                              onClick={() => setForm((f) => ({ ...f, status: s as any }))}
                              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                                form.status === s 
                                  ? (s === 'paid' ? 'bg-emerald-500 border-emerald-500 text-white' : s === 'unpaid' ? 'bg-rose-500 border-rose-500 text-white' : 'bg-amber-500 border-amber-500 text-zinc-950')
                                  : 'bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-500'
                              }`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>

                      {form.status === "paid" && (
                        <div className="flex gap-2">
                          {["cash", "online"].map((m) => (
                            <button
                              key={m}
                              onClick={() => setForm((f) => ({ ...f, method: m as any }))}
                              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                                form.method === m 
                                ? 'bg-zinc-200 border-zinc-200 text-zinc-950'
                                : 'bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-500'
                            }`}
                            >
                              {m}
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <input
                        value={form.note}
                        onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                        placeholder="What did you spend on?"
                        className="w-full bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white rounded-2xl p-4 border border-zinc-200 dark:border-zinc-800 outline-none focus:border-amber-500/50 transition-colors"
                      />
                      <div className="space-y-1.5">
                        <label className="text-zinc-500 text-[10px] font-black uppercase tracking-widest ml-1">Amount Spent</label>
                        <input
                          type="number"
                          value={form.amount}
                          onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                          placeholder="₹0.00"
                          className="w-full bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white rounded-2xl p-4 border border-zinc-200 dark:border-zinc-800 outline-none focus:border-amber-500/50 text-xl font-display font-bold transition-colors"
                        />
                      </div>
                    </>
                  )}
                </div>

                <button
                  onClick={saveEntry}
                  className="w-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 rounded-2xl py-5 mt-8 font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all"
                >
                  Confirm Entry
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
