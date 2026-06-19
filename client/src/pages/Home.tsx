import React, { useState, useMemo, useRef } from "react";
import { useTheme } from "@/contexts/ThemeContext";
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
  daysAgo: number;
}

const seedEntries: Entry[] = [
  { id: 1, type: "work", service: "PAN Card", customer: "Swapan Samanta", amount: 100, status: "paid", method: "online", daysAgo: 5 },
  { id: 2, type: "work", service: "Ration Card", customer: "Bappa Kaka", amount: 30, status: "unpaid", daysAgo: 6 },
  { id: 3, type: "work", service: "Annapurna Bhandar", customer: "Ranjit", amount: 50, status: "paid", method: "cash", daysAgo: 5 },
  { id: 4, type: "work", service: "Other", customNote: "Aadhaar print", customer: "", amount: 20, status: "paid", method: "cash", daysAgo: 0 },
  { id: 5, type: "work", service: "Voter ID", customer: "Mousumi", amount: 50, status: "unpaid", daysAgo: 0 },
  { id: 6, type: "work", service: "DBT Link", customer: "Provat", amount: 40, status: "paid", method: "online", daysAgo: 4 },
  { id: 7, type: "work", service: "Swasthya Sathi", customer: "Lakshmi", amount: 0, status: "unpaid", daysAgo: 3 },
  { id: 8, type: "work", service: "PAN Card", customer: "Rasbihari", amount: 50, status: "unpaid", daysAgo: 5 },
  { id: 9, type: "spend", note: "Printer ink", amount: 80, daysAgo: 5 },
  { id: 10, type: "spend", note: "Electricity bill share", amount: 50, daysAgo: 4 },
];

function Switch({ checked, onClick, activeClass }: { checked: boolean; onClick: () => void; activeClass: string }) {
  return (
    <button
      onClick={onClick}
      className={`w-11 h-6 rounded-full relative transition-colors duration-200 ${
        checked ? activeClass : "bg-zinc-700"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function StatCard({ label, value, valueClass = "text-white" }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex-1 shadow-lg">
      <p className="text-zinc-500 text-sm mb-1 font-body">{label}</p>
      <p className={`text-2xl font-display font-bold ${valueClass}`}>{value}</p>
    </div>
  );
}

function NavButton({ icon: Icon, label, active, onClick }: { icon: any; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex-1 flex flex-col items-center justify-center gap-1 py-2"
    >
      <Icon
        size={20}
        className={active ? "text-amber-400" : "text-zinc-500"}
      />
      <span
        className={`text-xs font-body ${active ? "text-amber-400" : "text-zinc-500"}`}
      >
        {label}
      </span>
    </button>
  );
}

export default function WorkingBuddyDemo() {
  const { theme, toggleTheme } = useTheme();
  const [tab, setTab] = useState("home");
  const [entries, setEntries] = useState(seedEntries);
  const [filter, setFilter] = useState("all");
  const [showAdd, setShowAdd] = useState(false);
  const [qrImage, setQrImage] = useState<string | null>(null);
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

  const todayName = dayLabel(0);

  const workEntries = entries.filter((e) => e.type === "work");
  const spendEntries = entries.filter((e) => e.type === "spend");

  const totalEarned = workEntries
    .filter((e) => e.status === "paid")
    .reduce((s, e) => s + e.amount, 0);
  const totalPending = workEntries
    .filter((e) => e.status === "unpaid")
    .reduce((s, e) => s + e.amount, 0);
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
  const todayPending = workEntries
    .filter((e) => e.daysAgo === 0 && e.status === "unpaid")
    .reduce((s, e) => s + e.amount, 0);
  const todayCount = entries.filter((e) => e.daysAgo === 0).length;

  const topService = useMemo(() => {
    const counts: Record<string, number> = {};
    workEntries.forEach((e) => {
      const key = e.service === "Other" ? e.customNote || "Other" : (e.service || "Other");
      counts[key] = (counts[key] || 0) + 1;
    });
    let best = "—";
    let max = 0;
    Object.entries(counts).forEach(([k, v]) => {
      if (v > max) {
        max = v;
        best = k;
      }
    });
    return best;
  }, [workEntries]);

  const weeklyData = useMemo(() => {
    const sums: Record<string, number> = {};
    WEEKDAYS.forEach((d) => (sums[d] = 0));
    workEntries
      .filter((e) => e.status === "paid")
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
    let list = [...entries];
    if (filter === "today") list = list.filter((e) => e.daysAgo === 0);
    if (filter === "week") list = list.filter((e) => e.daysAgo <= 6);
    if (filter === "month") list = list.filter((e) => e.daysAgo <= 30);
    return list.sort((a, b) => a.daysAgo - b.daysAgo);
  }, [entries, filter]);

  function toggleStatus(id: number) {
    setEntries((prev) =>
      prev.map((e) =>
        e.id === id && e.type === "work"
          ? {
              ...e,
              status: e.status === "paid" ? "unpaid" : (e.status === "unpaid" ? "undecided" : "paid") as "paid" | "unpaid" | "undecided",
              method: e.status === "paid" ? undefined : (e.method || "cash") as "cash" | "online",
            }
          : e
      )
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
      const newEntry: Entry = { id: Date.now(), type: "spend", note: form.note, amount, daysAgo: 0 };
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
        daysAgo: 0,
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
      daysAgo: 0,
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
    a.download = "working_buddy_backup.json";
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
        alert("Backup file should contain a list of entries.");
      }
    } catch {
      alert("Couldn't read that — check the JSON and try again.");
    }
  }

  function clearAll() {
    if (window.confirm("This will delete every entry. Continue?")) {
      setEntries([]);
    }
  }

  function handleQrUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setQrImage(reader.result as string);
    reader.readAsDataURL(file);
  }

  const inr = (n: number) => `₹${n.toFixed(2)}`;

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 font-body">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Inter:wght@400;500;600&display=swap');
        .font-display { font-family: 'Sora', sans-serif; }
        .font-body { font-family: 'Inter', sans-serif; }
      `}</style>
      <div className="w-full max-w-sm bg-zinc-950 rounded-3xl overflow-hidden shadow-2xl border border-zinc-800 flex flex-col h-[800px] relative">
        <div className="h-1 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600" />

        {/* Header with logo */}
        <div className="px-5 pt-4 pb-3 border-b border-zinc-800 flex items-center gap-3">
          <img src="/mbook-logo.png" alt="Mbook" className="w-8 h-8" />
          <h1 className="text-white text-xl font-display font-bold">Mbook</h1>
        </div>

        {/* Screen content */}
        <div className="flex-1 overflow-y-auto px-5 pt-6 pb-4">
          {tab === "home" && (
            <div>
              <h1 className="text-white text-3xl font-display font-bold mb-5">
                Today's Work
              </h1>
              <div className="flex gap-3 mb-3">
                <StatCard
                  label="Earned"
                  value={inr(todayEarned)}
                  valueClass="text-emerald-400"
                />
                <StatCard
                  label="Pending"
                  value={inr(todayPending)}
                  valueClass="text-rose-400"
                />
                <StatCard
                  label="Undecided"
                  value={inr(todayUndecided)}
                  valueClass="text-amber-400"
                />
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between mb-3 shadow-lg">
                <span className="text-zinc-500 text-sm">Total Entries</span>
                <span className="text-white text-xl font-display font-bold">
                  {todayCount}
                </span>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between shadow-lg">
                <span className="text-zinc-500 text-sm">Net Profit (week)</span>
                <span
                  className={`text-xl font-display font-bold ${
                    netProfit >= 0 ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {inr(netProfit)}
                </span>
              </div>
            </div>
          )}

          {tab === "history" && (
            <div>
              <h1 className="text-white text-3xl font-display font-bold mb-4">
                Work Records
              </h1>
              <div className="flex gap-2 mb-4 flex-wrap">
                {[
                  ["all", "All"],
                  ["today", "Today"],
                  ["week", "This Week"],
                  ["month", "This Month"],
                ].map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setFilter(key)}
                    className={`px-3 py-1.5 rounded-full text-sm border ${
                      filter === key
                        ? "bg-amber-500 border-amber-500 text-zinc-900 font-medium"
                        : "border-zinc-700 text-zinc-400"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {filteredEntries.length === 0 && (
                <p className="text-zinc-500 text-sm text-center mt-10">
                  No entries here yet. Tap + New on Home to add one.
                </p>
              )}

              <div className="space-y-3">
                {filteredEntries.map((e) =>
                  e.type === "spend" ? (
                    <div
                      key={e.id}
                      className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 border-l-4 border-l-rose-500 shadow-lg"
                    >
                      <p className="text-white font-medium">
                        Spend: {e.note}
                      </p>
                      <p className="text-rose-400 font-display font-bold">
                        -{inr(e.amount)}
                      </p>
                    </div>
                  ) : (
                    <div
                      key={e.id}
                      className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-start justify-between shadow-lg"
                    >
                      <div>
                        <p className="text-white font-medium">
                          {e.service === "Other"
                            ? e.customNote || "Other"
                            : e.service}
                        </p>
                        {e.customer && (
                          <p className="text-zinc-500 text-sm">
                            Customer: {e.customer}
                          </p>
                        )}
                        <p className="text-white text-lg font-display font-bold">{inr(e.amount)}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <button
                          onClick={() => toggleStatus(e.id)}
                          className="text-xs font-semibold px-2 py-1 rounded-full transition-colors"
                          style={{
                            backgroundColor: e.status === "paid" ? "#10b981" : e.status === "unpaid" ? "#ef4444" : "#f59e0b",
                            color: e.status === "undecided" ? "#18181b" : "white"
                          }}
                        >
                          {e.status === "paid" ? "Paid" : e.status === "unpaid" ? "Unpaid" : "Undecided"}
                        </button>
                        {e.status === "paid" && (
                          <div className="flex gap-1">
                            <button
                              onClick={() => setMethod(e.id, "cash")}
                              className={`text-xs px-2 py-1 rounded-full ${
                                e.method === "cash"
                                  ? "bg-teal-500 text-zinc-900"
                                  : "bg-zinc-800 text-zinc-400"
                              }`}
                            >
                              Cash
                            </button>
                            <button
                              onClick={() => setMethod(e.id, "online")}
                              className={`text-xs px-2 py-1 rounded-full ${
                                e.method === "online"
                                  ? "bg-sky-500 text-zinc-900"
                                  : "bg-zinc-800 text-zinc-400"
                              }`}
                            >
                              Online
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {tab === "summary" && (
            <div>
              <h1 className="text-white text-3xl font-display font-bold mb-4">
                Summary
              </h1>

              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-4 shadow-lg">
                <p className="text-zinc-500 text-sm mb-1">Total Earned</p>
                <p className="text-2xl font-display font-bold text-emerald-400">
                  {inr(totalEarned)}
                </p>
                <p className="text-zinc-500 text-xs mt-1">
                  Pending: {inr(totalPending)}
                </p>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-4 shadow-lg">
                <p className="text-zinc-500 text-sm mb-1">Net Profit</p>
                <p
                  className={`text-2xl font-display font-bold ${
                    netProfit >= 0 ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {inr(netProfit)}
                </p>
                <p className="text-zinc-500 text-xs mt-1">
                  Total spend this week: {inr(totalSpend)}
                </p>
              </div>

              <h2 className="text-white text-lg font-display font-bold mb-2">
                Cash vs Online
              </h2>
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-4 space-y-3 shadow-lg">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-zinc-300 flex items-center gap-1">
                      <Banknote size={14} /> Cash
                    </span>
                    <span className="text-white">{inr(totalCash)}</span>
                  </div>
                  <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teal-400"
                      style={{
                        width: `${
                          (totalCash / Math.max(1, totalCash + totalOnline)) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-zinc-300 flex items-center gap-1">
                      <Smartphone size={14} /> Online (QR)
                    </span>
                    <span className="text-white">{inr(totalOnline)}</span>
                  </div>
                  <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-sky-400"
                      style={{
                        width: `${
                          (totalOnline /
                            Math.max(1, totalCash + totalOnline)) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              <h2 className="text-white text-lg font-display font-bold mb-2">
                Weekly Income
              </h2>
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-4 shadow-lg">
                <div className="flex items-end justify-between h-32">
                  {WEEKDAYS.map((d) => (
                    <div
                      key={d}
                      className="flex flex-col items-center justify-end h-full flex-1"
                    >
                      <div
                        className={`w-3 rounded-t-full ${
                          d === todayName ? "bg-amber-400" : "bg-zinc-700"
                        }`}
                        style={{
                          height: `${Math.max(
                            4,
                            (weeklyData[d] / maxWeekly) * 100
                          )}%`,
                        }}
                      />
                      <span className="text-zinc-500 text-xs mt-2">{d}</span>
                    </div>
                  ))}
                </div>
              </div>

              <h2 className="text-white text-lg font-display font-bold mb-2">
                Service Breakdown
              </h2>
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3 shadow-lg">
                {serviceBreakdown.map((s) => (
                  <div key={s.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-zinc-300">{s.name}</span>
                      <span className="text-white">{s.pct}%</span>
                    </div>
                    <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-teal-400"
                        style={{ width: `${s.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "qr" && (
            <div>
              <h1 className="text-white text-3xl font-display font-bold mb-4">
                My QR Code
              </h1>

              <div className="bg-zinc-900 border-2 border-amber-500 rounded-3xl p-5 flex flex-col items-center shadow-lg mb-4">
                {qrImage ? (
                  <img
                    src={qrImage}
                    alt="Your payment QR"
                    className="w-52 h-52 object-contain rounded-xl bg-white p-2"
                  />
                ) : (
                  <div className="w-52 h-52 rounded-xl bg-zinc-950 border border-zinc-700 flex items-center justify-center">
                    <QrCode size={56} className="text-zinc-600" />
                  </div>
                )}
                <p className="text-zinc-400 text-sm mt-4 text-center font-medium">
                  {qrImage
                    ? "Show this screen to customers to receive payments"
                    : "No QR uploaded yet — add one from Settings"}
                </p>
                {!qrImage && (
                  <button
                    onClick={() => setTab("settings")}
                    className="mt-3 text-amber-400 text-sm underline"
                  >
                    Go to Settings
                  </button>
                )}
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-4 shadow-lg">
                <p className="text-zinc-500 text-sm mb-1">
                  Received via QR (Online)
                </p>
                <p className="text-2xl font-display font-bold text-sky-400">
                  {inr(totalOnline)}
                </p>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-lg">
                <p className="text-white font-medium mb-3">
                  Log a payment received
                </p>
                <input
                  type="number"
                  value={qrAmount}
                  onChange={(e) => setQrAmount(e.target.value)}
                  placeholder="Amount received"
                  className="w-full bg-zinc-950 text-white rounded-xl p-3 border border-zinc-700 mb-2"
                />
                <input
                  value={qrCustomer}
                  onChange={(e) => setQrCustomer(e.target.value)}
                  placeholder="Customer name (optional)"
                  className="w-full bg-zinc-950 text-white rounded-xl p-3 border border-zinc-700 mb-3"
                />
                <button
                  onClick={addQrPayment}
                  className="w-full bg-amber-500 text-zinc-900 rounded-full py-3 flex items-center justify-center gap-2 font-semibold"
                >
                  <Plus size={16} /> Add Payment
                </button>
              </div>
            </div>
          )}

          {tab === "settings" && (
            <div>
              <h1 className="text-white text-3xl font-display font-bold mb-5">
                Settings
              </h1>

              <div className="flex items-center justify-between mb-5">
                <span className="text-white">Dark Mode</span>
                <Switch checked={theme === "dark"} onClick={toggleTheme || (() => {})} activeClass="bg-amber-500" />
              </div>
              <div className="h-px bg-zinc-800 mb-5" />

              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-amber-500 text-zinc-900 rounded-full py-3 mb-3 flex items-center justify-center gap-2 font-semibold"
              >
                <Upload size={16} /> Upload My QR Code
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
                className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-full py-3 mb-3 flex items-center justify-center gap-2"
              >
                <Download size={16} /> Export Backup (JSON)
              </button>

              <button
                onClick={() => setShowImport((v) => !v)}
                className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-full py-3 mb-3"
              >
                Import Backup (Paste JSON)
              </button>
              {showImport && (
                <div className="mb-3">
                  <textarea
                    value={importText}
                    onChange={(e) => setImportText(e.target.value)}
                    placeholder="Paste backup JSON here"
                    className="w-full h-24 bg-zinc-900 text-white text-sm rounded-xl p-3 mb-2 border border-zinc-700"
                  />
                  <button
                    onClick={applyImport}
                    className="w-full bg-teal-500 text-zinc-900 rounded-full py-2 font-medium"
                  >
                    Apply Import
                  </button>
                </div>
              )}

              <button
                onClick={clearAll}
                className="w-full bg-zinc-900 border border-rose-500 text-rose-400 rounded-full py-3 flex items-center justify-center gap-2 mt-2"
              >
                <Trash2 size={16} /> Clear All Data
              </button>
            </div>
          )}
        </div>

        {/* Floating New button on Home */}
        {tab === "home" && (
          <div className="absolute bottom-24 right-5">
            <button
              onClick={() => setShowAdd(true)}
              className="bg-amber-500 text-zinc-900 rounded-full px-5 py-3 flex items-center gap-2 shadow-lg font-semibold"
            >
              <Plus size={18} /> New
            </button>
          </div>
        )}

        {/* Bottom nav */}
        <div className="border-t border-zinc-800 bg-zinc-950 flex">
          <NavButton icon={HomeIcon} label="Home" active={tab === "home"} onClick={() => setTab("home")} />
          <NavButton icon={HistoryIcon} label="History" active={tab === "history"} onClick={() => setTab("history")} />
          <NavButton icon={BarChart3} label="Summary" active={tab === "summary"} onClick={() => setTab("summary")} />
          <NavButton icon={QrCode} label="QR" active={tab === "qr"} onClick={() => setTab("qr")} />
          <NavButton icon={SettingsIcon} label="Settings" active={tab === "settings"} onClick={() => setTab("settings")} />
        </div>

        {/* Add entry modal */}
        {showAdd && (
          <div className="absolute inset-0 bg-black/60 flex items-end">
            <div className="w-full bg-zinc-900 rounded-t-3xl p-5 max-h-[85%] overflow-y-auto border-t border-zinc-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white text-xl font-display font-bold">
                  New Entry
                </h2>
                <button onClick={() => setShowAdd(false)}>
                  <X className="text-zinc-400" size={22} />
                </button>
              </div>

              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setForm((f) => ({ ...f, entryType: "work" }))}
                  className={`flex-1 py-2 rounded-full text-sm ${
                    form.entryType === "work"
                      ? "bg-amber-500 text-zinc-900 font-semibold"
                      : "bg-zinc-800 text-zinc-400"
                  }`}
                >
                  Work
                </button>
                <button
                  onClick={() => setForm((f) => ({ ...f, entryType: "spend" }))}
                  className={`flex-1 py-2 rounded-full text-sm ${
                    form.entryType === "spend"
                      ? "bg-rose-500 text-white font-semibold"
                      : "bg-zinc-800 text-zinc-400"
                  }`}
                >
                  Spend
                </button>
              </div>

              {form.entryType === "work" ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-zinc-500 text-sm">Service</label>
                    <select
                      value={form.service}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, service: e.target.value }))
                      }
                      className="w-full bg-zinc-950 text-white rounded-xl p-3 mt-1 border border-zinc-700"
                    >
                      {SERVICES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  {form.service === "Other" && (
                    <input
                      value={form.customNote}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, customNote: e.target.value }))
                      }
                      placeholder="Describe the service"
                      className="w-full bg-zinc-950 text-white rounded-xl p-3 border border-zinc-700"
                    />
                  )}
                  <input
                    value={form.customer}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, customer: e.target.value }))
                    }
                    placeholder="Customer name (optional)"
                    className="w-full bg-zinc-950 text-white rounded-xl p-3 border border-zinc-700"
                  />
                  <input
                    type="number"
                    value={form.amount}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, amount: e.target.value }))
                    }
                    placeholder="Amount charged"
                    className="w-full bg-zinc-950 text-white rounded-xl p-3 border border-zinc-700"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        setForm((f) => ({ ...f, status: "undecided" }))
                      }
                      className={`flex-1 py-2 rounded-full text-sm ${
                        form.status === "undecided"
                          ? "bg-amber-500 text-zinc-900 font-semibold"
                          : "bg-zinc-800 text-zinc-400"
                      }`}
                    >
                      Undecided
                    </button>
                    <button
                      onClick={() =>
                        setForm((f) => ({ ...f, status: "unpaid" }))
                      }
                      className={`flex-1 py-2 rounded-full text-sm ${
                        form.status === "unpaid"
                          ? "bg-rose-500 text-white font-semibold"
                          : "bg-zinc-800 text-zinc-400"
                      }`}
                    >
                      Unpaid
                    </button>
                    <button
                      onClick={() => setForm((f) => ({ ...f, status: "paid" }))}
                      className={`flex-1 py-2 rounded-full text-sm ${
                        form.status === "paid"
                          ? "bg-emerald-500 text-white font-semibold"
                          : "bg-zinc-800 text-zinc-400"
                      }`}
                    >
                      Paid
                    </button>
                  </div>
                  {form.status === "paid" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          setForm((f) => ({ ...f, method: "cash" }))
                        }
                        className={`flex-1 py-2 rounded-full text-sm ${
                          form.method === "cash"
                            ? "bg-teal-500 text-zinc-900 font-semibold"
                            : "bg-zinc-800 text-zinc-400"
                        }`}
                      >
                        Cash
                      </button>
                      <button
                        onClick={() =>
                          setForm((f) => ({ ...f, method: "online" }))
                        }
                        className={`flex-1 py-2 rounded-full text-sm ${
                          form.method === "online"
                            ? "bg-sky-500 text-zinc-900 font-semibold"
                            : "bg-zinc-800 text-zinc-400"
                        }`}
                      >
                        Online
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <input
                    value={form.note}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, note: e.target.value }))
                    }
                    placeholder="What did you spend on?"
                    className="w-full bg-zinc-950 text-white rounded-xl p-3 border border-zinc-700"
                  />
                  <input
                    type="number"
                    value={form.amount}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, amount: e.target.value }))
                    }
                    placeholder="Amount spent"
                    className="w-full bg-zinc-950 text-white rounded-xl p-3 border border-zinc-700"
                  />
                </div>
              )}

              <button
                onClick={saveEntry}
                className="w-full bg-amber-500 text-zinc-900 rounded-full py-3 mt-5 font-semibold"
              >
                Save Entry
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
