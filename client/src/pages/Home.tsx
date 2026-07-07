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
  Camera,
  Eye,
  Languages,
  Check,
  RotateCcw
} from "lucide-react";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const GOLD_GRADIENT = "linear-gradient(135deg, #D4A24E 0%, #E8C468 100%)";

type EntryType = "work" | "spend";
type EntryStatus = "paid" | "unpaid" | "undecided";
type PaymentMethod = "cash" | "online";
type DateFilter = "all" | "today" | "week" | "month";
type StatusFilter = "all" | EntryStatus;
type Language = "en" | "hi";

interface Entry {
  id: number;
  entryCode: string;
  type: EntryType;
  service?: string;
  customNote?: string;
  customer?: string;
  amount: number;
  status?: EntryStatus;
  method?: PaymentMethod;
  note?: string;
  date: string;
  photo?: string; // base64
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
  photo?: string;
}

const TRANSLATIONS = {
  en: {
    home: "Home",
    records: "Records",
    analysis: "Analysis",
    pay: "Pay",
    settings: "Settings",
    newRecord: "New Record",
    editRecord: "Edit Record",
    work: "Work",
    spend: "Spend",
    service: "Service",
    customer: "Customer Name",
    amount: "Amount",
    status: "Payment Status",
    method: "Method",
    note: "Note",
    save: "Confirm Entry",
    saveChanges: "Save Changes",
    capture: "Capture Photo Entry",
    usePhoto: "Use Photo",
    retake: "Retake",
    seePhoto: "See Photo",
    manageServices: "Manage Services",
    language: "Language",
    totalBalance: "Total Balance",
    income: "Income",
    expense: "Expense",
    unpaid: "Unpaid",
    scanToPay: "Scan to Pay",
    logPayment: "Log Payment",
    darkAppearance: "Dark Appearance",
    updateQr: "Update QR Code",
    export: "Export Data",
    import: "Import Data",
    clearAll: "Clear All Records",
    deleteConfirm: "Delete this record?",
    clearConfirm: "Delete all data? This cannot be undone.",
    noPhoto: "No photo attached",
    entryCode: "Entry Code",
    all: "All",
    today: "Today",
    week: "Week",
    month: "Month",
    paid: "Paid",
    undecided: "Undecided",
    cash: "Cash",
    online: "Online",
    describeService: "Describe service",
    whatSpentOn: "What did you spend on?",
    qrAmountPlaceholder: "Amount Received",
    qrCustomerPlaceholder: "Customer Name",
    backupPlaceholder: "Paste backup JSON",
    restoreBackup: "Restore Backup",
    undecidedHelp: "Undecided amount stays ₹0 until you edit it later.",
    paymentModes: "Payment Modes",
    servicesShare: "Services Share",
    noServices: "No services recorded yet",
    works: "works",
    work_one: "work",
  },
  hi: {
    home: "होम",
    records: "रिकॉर्ड्स",
    analysis: "विश्लेषण",
    pay: "भुगतान",
    settings: "सेटिंग्स",
    newRecord: "नया रिकॉर्ड",
    editRecord: "रिकॉर्ड बदलें",
    work: "काम",
    spend: "खर्च",
    service: "सेवा",
    customer: "ग्राहक का नाम",
    amount: "राशि",
    status: "भुगतान की स्थिति",
    method: "तरीका",
    note: "नोट",
    save: "एंट्री पक्की करें",
    saveChanges: "बदलाव सहेजें",
    capture: "फोटो एंट्री लें",
    usePhoto: "फोटो का उपयोग करें",
    retake: "फिर से लें",
    seePhoto: "फोटो देखें",
    manageServices: "सेवाएं प्रबंधित करें",
    language: "भाषा",
    totalBalance: "कुल बैलेंस",
    income: "आय",
    expense: "खर्च",
    unpaid: "बकाया",
    scanToPay: "पे करने के लिए स्कैन करें",
    logPayment: "पेमेंट लॉग करें",
    darkAppearance: "डार्क मोड",
    updateQr: "QR कोड अपडेट करें",
    export: "डेटा एक्सपोर्ट करें",
    import: "डेटा इम्पोर्ट करें",
    clearAll: "सभी रिकॉर्ड मिटाएं",
    deleteConfirm: "क्या आप इस रिकॉर्ड को मिटाना चाहते हैं?",
    clearConfirm: "सभी डेटा मिटाएं? इसे वापस नहीं लाया जा सकता।",
    noPhoto: "कोई फोटो नहीं है",
    entryCode: "एंट्री कोड",
    all: "सभी",
    today: "आज",
    week: "हफ्ता",
    month: "महीना",
    paid: "भुगतान किया",
    undecided: "तय नहीं",
    cash: "नकद",
    online: "ऑनलाइन",
    describeService: "सेवा का विवरण दें",
    whatSpentOn: "आपने किस पर खर्च किया?",
    qrAmountPlaceholder: "प्राप्त राशि",
    qrCustomerPlaceholder: "ग्राहक का नाम",
    backupPlaceholder: "बैकअप JSON पेस्ट करें",
    restoreBackup: "बैकअप रीस्टोर करें",
    undecidedHelp: "तय नहीं की गई राशि ₹0 रहेगी जब तक आप इसे बाद में नहीं बदलते।",
    paymentModes: "भुगतान के तरीके",
    servicesShare: "सेवाओं की हिस्सेदारी",
    noServices: "अभी तक कोई रिकॉर्ड नहीं है",
    works: "काम",
    work_one: "काम",
  }
};

function emptyForm(): EntryForm {
  return {
    entryType: "work",
    service: "",
    customNote: "",
    customer: "",
    amount: "0",
    status: "undecided",
    method: "cash",
    note: "",
    photo: undefined,
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

function formatDate(date: string, lang: Language) {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "No date";
  return d.toLocaleDateString(lang === "hi" ? "hi-IN" : "en-IN", { day: "2-digit", month: "short" });
}

function formatTime(date: string, lang: Language) {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString(lang === "hi" ? "hi-IN" : "en-IN", { hour: "2-digit", minute: "2-digit" });
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
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [qrImage, setQrImage] = useState<string | null>(() => localStorage.getItem("mbook_qr") || "/payment-qr.jpg");
  const [lang, setLang] = useState<Language>(() => (localStorage.getItem("mbook_lang") as Language) || "en");
  const [services, setServices] = useState<string[]>(() => {
    const saved = localStorage.getItem("mbook_services");
    return saved ? JSON.parse(saved) : ["PAN Card", "Voter ID", "Aadhaar", "Ration Card", "Swasthya Sathi", "DBT Link", "Other"];
  });
  const [nextEntryNum, setNextEntryNum] = useState<number>(() => Number(localStorage.getItem("mbook_next_num") || 1));
  const [cameraPreview, setCameraPreview] = useState<string | null>(null);
  const [showPhotoViewer, setShowPhotoViewer] = useState<string | null>(null);
  const [showManageServices, setShowManageServices] = useState(false);
  const [newServiceName, setNewServiceName] = useState("");

  const t = TRANSLATIONS[lang];

  const [form, setForm] = useState<EntryForm>(() => {
    const f = emptyForm();
    f.service = services[0] || "Other";
    return f;
  });

  const [entries, setEntries] = useState<Entry[]>(() => {
    try {
      const saved = localStorage.getItem("mbook_entries");
      if (!saved) return [];
      return JSON.parse(saved);
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("mbook_entries", JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    localStorage.setItem("mbook_qr", qrImage || "");
  }, [qrImage]);

  useEffect(() => {
    localStorage.setItem("mbook_lang", lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem("mbook_services", JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    localStorage.setItem("mbook_next_num", String(nextEntryNum));
  }, [nextEntryNum]);

  const inr = (n: number) => `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

  const entriesWithDaysAgo = useMemo<EntryWithDaysAgo[]>(() => entries.map((entry) => ({ ...entry, daysAgo: daysAgoFrom(entry.date) })), [entries]);
  const workEntries = entriesWithDaysAgo.filter((e) => e.type === "work");
  const spendEntries = entriesWithDaysAgo.filter((e) => e.type === "spend");

  const totalEarned = workEntries.filter((e) => e.status === "paid").reduce((sum, e) => sum + e.amount, 0);
  const totalUnpaid = workEntries.filter((e) => e.status === "unpaid").reduce((sum, e) => sum + e.amount, 0);
  const totalSpend = spendEntries.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalEarned - totalSpend;

  const filteredEntries = useMemo(() => {
    let list = [...entriesWithDaysAgo];
    if (dateFilter === "today") list = list.filter((e) => e.daysAgo === 0);
    if (dateFilter === "week") list = list.filter((e) => e.daysAgo >= 0 && e.daysAgo <= 6);
    if (dateFilter === "month") list = list.filter((e) => e.daysAgo >= 0 && e.daysAgo <= 30);
    if (statusFilter !== "all") list = list.filter((e) => e.type === "work" && e.status === statusFilter);
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [entriesWithDaysAgo, dateFilter, statusFilter]);

  const generateEntryCode = () => {
    const code = `MB-${String(nextEntryNum).padStart(4, "0")}`;
    return code;
  };

  function openNewForm(photo?: string) {
    setEditingId(null);
    const f = emptyForm();
    f.service = services[0] || "Other";
    f.photo = photo;
    setForm(f);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm());
    setCameraPreview(null);
  }

  function handleCameraCapture(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setCameraPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  function useCapturedPhoto() {
    if (cameraPreview) {
      openNewForm(cameraPreview);
      setCameraPreview(null);
    }
  }

  function saveEntry() {
    const isUndecided = form.entryType === "work" && form.status === "undecided";
    const amount = isUndecided ? 0 : parseFloat(form.amount) || 0;
    
    if (editingId !== null) {
      setEntries((prev) => prev.map((entry) => {
        if (entry.id !== editingId) return entry;
        return {
          ...entry,
          type: form.entryType,
          service: form.entryType === "work" ? form.service : undefined,
          customNote: form.entryType === "work" && form.service === "Other" ? form.customNote.trim() : undefined,
          customer: form.entryType === "work" ? form.customer.trim() : undefined,
          amount,
          status: form.entryType === "work" ? form.status : undefined,
          method: form.entryType === "work" && form.status === "paid" ? form.method : undefined,
          note: form.entryType === "spend" ? form.note.trim() : undefined,
          photo: form.photo || entry.photo,
        };
      }));
    } else {
      const code = generateEntryCode();
      const newEntry: Entry = {
        id: Date.now(),
        entryCode: code,
        type: form.entryType,
        service: form.entryType === "work" ? form.service : undefined,
        customNote: form.entryType === "work" && form.service === "Other" ? form.customNote.trim() : undefined,
        customer: form.entryType === "work" ? form.customer.trim() : undefined,
        amount,
        status: form.entryType === "work" ? form.status : undefined,
        method: form.entryType === "work" && form.status === "paid" ? form.method : undefined,
        note: form.entryType === "spend" ? form.note.trim() : undefined,
        date: new Date().toISOString(),
        photo: form.photo,
      };
      setEntries((prev) => [...prev, newEntry]);
      setNextEntryNum((n) => n + 1);
    }
    closeForm();
  }

  function deleteEntry(id: number) {
    if (window.confirm(t.deleteConfirm)) setEntries((prev) => prev.filter((entry) => entry.id !== id));
  }

  function editEntry(entry: Entry) {
    setEditingId(entry.id);
    setForm({
      entryType: entry.type,
      service: entry.service || services[0] || "Other",
      customNote: entry.customNote || "",
      customer: entry.customer || "",
      amount: String(entry.amount || ""),
      status: entry.status || "undecided",
      method: entry.method || "cash",
      note: entry.note || "",
      photo: entry.photo,
    });
    setShowForm(true);
  }

  const inputClass = "w-full rounded-2xl border border-[#2A2D35] bg-[#0D0F14] p-4 text-sm text-[#F5F5F7] outline-none focus:border-[#E8C468] transition-colors";

  return (
    <div className={`min-h-screen bg-[#0D0F14] text-[#F5F5F7] font-sans selection:bg-[#E8C468] selection:text-[#0D0F14]`}>
      <div className="mx-auto max-w-md pb-32 pt-6 px-6">
        
        <AnimatePresence mode="wait">
          {tab === "home" && (
            <motion.div key="home" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="font-display text-3xl font-extrabold tracking-tight">M-Book</h1>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#8B8F99]">Premium Work Ledger</p>
                </div>
                <button onClick={() => setTab("settings")} className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#181B22] border border-[#2A2D35] text-[#8B8F99] hover:text-[#E8C468] transition-colors">
                  <SettingsIcon size={20} />
                </button>
              </div>

              <div className="rounded-[2.5rem] border border-[#2A2D35] bg-[#181B22] p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#E8C468]/5 rounded-full -mr-16 -mt-16 blur-3xl" />
                <p className="text-xs font-black uppercase tracking-widest text-[#8B8F99]">{t.totalBalance}</p>
                <h3 className="mb-6 mt-1 font-display text-4xl font-extrabold text-transparent bg-clip-text" style={{ backgroundImage: GOLD_GRADIENT }}>{inr(netProfit)}</h3>
                <div className="grid grid-cols-3 gap-3">
                  <div><p className="text-[10px] font-black uppercase text-[#8B8F99]">{t.income}</p><p className="font-bold text-[#4ADE80]">{inr(totalEarned)}</p></div>
                  <div><p className="text-[10px] font-black uppercase text-[#8B8F99]">{t.expense}</p><p className="font-bold text-[#F87171]">{inr(totalSpend)}</p></div>
                  <div><p className="text-[10px] font-black uppercase text-[#8B8F99]">{t.unpaid}</p><p className="font-bold text-[#E8C468]">{inr(totalUnpaid)}</p></div>
                </div>
              </div>

              <button 
                onClick={() => cameraInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-3 rounded-2xl py-5 font-black uppercase tracking-widest text-[#0D0F14] shadow-xl active:scale-95 transition-transform" 
                style={{ background: GOLD_GRADIENT }}
              >
                <Camera size={20} /> {t.capture}
              </button>
              <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleCameraCapture} />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-xl font-bold">{t.records}</h2>
                  <button onClick={() => setTab("history")} className="text-xs font-bold text-[#E8C468] flex items-center gap-1">
                    View All <ChevronRight size={14} />
                  </button>
                </div>
                <div className="space-y-3">
                  {entriesWithDaysAgo.slice(0, 5).map((entry) => (
                    <div key={entry.id} className="group rounded-2xl border border-[#2A2D35] bg-[#181B22] p-4 flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-[#0D0F14] overflow-hidden flex-shrink-0 border border-[#2A2D35]">
                        {entry.photo ? (
                          <img src={entry.photo} alt="Entry" className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-[#2A2D35]">
                            <HistoryIcon size={20} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <p className="text-[10px] font-black text-[#8B8F99] uppercase tracking-tighter">{entry.entryCode}</p>
                          <p className="text-[10px] font-bold text-[#8B8F99]">{formatDate(entry.date, lang)}</p>
                        </div>
                        <p className="font-bold truncate text-sm">
                          {entry.type === "work" ? (entry.service === "Other" ? entry.customNote : entry.service) : entry.note}
                        </p>
                        <p className={`text-sm font-black ${entry.type === "spend" ? "text-[#F87171]" : "text-[#E8C468]"}`}>
                          {entry.type === "spend" ? "-" : ""}{inr(entry.amount)}
                        </p>
                      </div>
                      <button onClick={() => editEntry(entry)} className="h-10 w-10 flex items-center justify-center rounded-xl bg-[#1F2229] text-[#8B8F99] group-hover:text-[#E8C468] transition-colors">
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {tab === "history" && (
            <motion.div key="history" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
              <div className="pt-2">
                <h2 className="font-display text-3xl font-extrabold">{t.records}</h2>
                <div className="mt-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {(["all", "today", "week", "month"] as DateFilter[]).map((f) => (
                    <button key={f} onClick={() => setDateFilter(f)} className={`shrink-0 rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-widest transition ${dateFilter === f ? "text-[#0D0F14]" : "border border-[#2A2D35] text-[#8B8F99]"}`} style={dateFilter === f ? { background: GOLD_GRADIENT } : {}}>{t[f]}</button>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                {filteredEntries.map((entry) => (
                  <div key={entry.id} className="rounded-2xl border border-[#2A2D35] bg-[#181B22] p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-[10px] font-black text-[#E8C468] uppercase tracking-widest">{entry.entryCode}</p>
                        <h4 className="font-bold text-lg mt-1">
                          {entry.type === "work" ? (entry.service === "Other" ? entry.customNote : entry.service) : entry.note}
                        </h4>
                        <p className="text-xs text-[#8B8F99] font-medium">{formatDate(entry.date, lang)} • {formatTime(entry.date, lang)}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-black ${entry.type === "spend" ? "text-[#F87171]" : "text-[#F5F5F7]"}`}>
                          {entry.type === "spend" ? "-" : ""}{inr(entry.amount)}
                        </p>
                        {entry.status && (
                          <span className={`text-[10px] font-black uppercase tracking-widest ${entry.status === "paid" ? "text-[#4ADE80]" : entry.status === "unpaid" ? "text-[#F87171]" : "text-[#E8C468]"}`}>
                            {t[entry.status]}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => editEntry(entry)} className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#1F2229] py-3 text-[10px] font-black uppercase text-[#8B8F99] hover:text-[#E8C468] transition-colors">
                        <Edit3 size={14} /> Edit
                      </button>
                      {entry.photo && (
                        <button onClick={() => setShowPhotoViewer(entry.photo!)} className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#1F2229] py-3 text-[10px] font-black uppercase text-[#8B8F99] hover:text-[#E8C468] transition-colors">
                          <Eye size={14} /> {t.seePhoto}
                        </button>
                      )}
                      <button onClick={() => deleteEntry(entry.id)} className="w-12 flex items-center justify-center rounded-xl bg-[#F87171]/10 text-[#F87171] py-3 transition-colors hover:bg-[#F87171]/20">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {tab === "settings" && (
            <motion.div key="settings" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-6">
              <div className="pt-2"><h2 className="font-display text-3xl font-extrabold">{t.settings}</h2></div>
              
              <div className="rounded-3xl border border-[#2A2D35] bg-[#181B22] p-2">
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1F2229] text-[#8B8F99]"><Languages size={20} /></span>
                    <span className="text-sm font-bold">{t.language}</span>
                  </div>
                  <div className="flex gap-1 bg-[#0D0F14] p-1 rounded-xl">
                    <button onClick={() => setLang("en")} className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition ${lang === "en" ? "text-[#0D0F14]" : "text-[#8B8F99]"}`} style={lang === "en" ? { background: GOLD_GRADIENT } : {}}>EN</button>
                    <button onClick={() => setLang("hi")} className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition ${lang === "hi" ? "text-[#0D0F14]" : "text-[#8B8F99]"}`} style={lang === "hi" ? { background: GOLD_GRADIENT } : {}}>HI</button>
                  </div>
                </div>
                <button onClick={() => setShowManageServices(true)} className="flex w-full items-center justify-between rounded-2xl p-4 hover:bg-[#1F2229]">
                  <span className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1F2229] text-[#8B8F99]"><Edit3 size={18} /></span>
                    <span className="text-sm font-bold">{t.manageServices}</span>
                  </span>
                  <ChevronRight size={18} className="text-[#8B8F99]" />
                </button>
              </div>

              <div className="rounded-3xl border border-[#2A2D35] bg-[#181B22] p-2">
                <div className="flex items-center justify-between p-4"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1F2229] text-[#8B8F99]"><BarChart3 size={20} /></span><span className="text-sm font-bold">{t.darkAppearance}</span></div><button type="button" onClick={toggleTheme || (() => {})} className={`relative h-6 w-12 rounded-full ${theme === "dark" ? "" : "bg-[#1F2229]"}`} style={theme === "dark" ? { background: GOLD_GRADIENT } : undefined}><motion.span animate={{ x: theme === "dark" ? 24 : 2 }} className="absolute left-0 top-1 h-4 w-4 rounded-full bg-white" /></button></div>
                <button type="button" onClick={() => fileInputRef.current?.click()} className="flex w-full items-center justify-between rounded-2xl p-4 hover:bg-[#1F2229]"><span className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1F2229] text-[#8B8F99]"><Upload size={18} /></span><span className="text-sm font-bold">{t.updateQr}</span></span><ChevronRight size={18} className="text-[#8B8F99]" /></button>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = () => setQrImage(reader.result as string);
                    reader.readAsDataURL(file);
                  }
                }} className="hidden" />
              </div>

              <div className="rounded-3xl border border-[#2A2D35] bg-[#181B22] p-2">
                <button type="button" onClick={() => {
                  const backup = { app: "Mbook", exportedAt: new Date().toISOString(), entries, qrImage, services, nextEntryNum };
                  const url = URL.createObjectURL(new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" }));
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `mbook_backup_${new Date().toISOString().split("T")[0]}.json`;
                  a.click();
                }} className="flex w-full items-center justify-between rounded-2xl p-4 hover:bg-[#1F2229]"><span className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1F2229] text-[#8B8F99]"><Download size={18} /></span><span className="text-sm font-bold">{t.export}</span></span><ChevronRight size={18} className="text-[#8B8F99]" /></button>
                <button type="button" onClick={() => setShowImport(!showImport)} className="flex w-full items-center justify-between rounded-2xl p-4 hover:bg-[#1F2229]"><span className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1F2229] text-[#8B8F99]"><PieChart size={18} /></span><span className="text-sm font-bold">{t.import}</span></span><ChevronRight size={18} className="text-[#8B8F99]" /></button>
              </div>

              {showImport && (
                <div className="space-y-3 rounded-3xl border border-[#2A2D35] bg-[#181B22] p-4">
                  <textarea value={importText} onChange={(e) => setImportText(e.target.value)} placeholder={t.backupPlaceholder} className="h-32 w-full rounded-2xl border border-[#2A2D35] bg-[#0D0F14] p-4 font-mono text-xs text-[#F5F5F7] outline-none" />
                  <button type="button" onClick={() => {
                    try {
                      const parsed = JSON.parse(importText);
                      if (parsed.entries) setEntries(parsed.entries);
                      if (parsed.qrImage) setQrImage(parsed.qrImage);
                      if (parsed.services) setServices(parsed.services);
                      if (parsed.nextEntryNum) setNextEntryNum(parsed.nextEntryNum);
                      setShowImport(false);
                      setImportText("");
                    } catch { alert("Invalid JSON"); }
                  }} className="w-full rounded-2xl py-3 text-sm font-black text-[#0D0F14]" style={{ background: GOLD_GRADIENT }}>{t.restoreBackup}</button>
                </div>
              )}

              <button type="button" onClick={() => {
                if (window.confirm(t.clearConfirm)) {
                  setEntries([]);
                  setNextEntryNum(1);
                }
              }} className="flex w-full items-center gap-3 rounded-3xl border border-[#F87171]/20 bg-[#F87171]/5 p-4 text-sm font-bold text-[#F87171] hover:bg-[#F87171]/10 transition-colors">
                <Trash2 size={18} /> {t.clearAll}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <nav className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around border-t border-[#2A2D35] bg-[#0D0F14]/90 px-4 pb-8 pt-2 backdrop-blur-2xl sm:absolute">
          <button onClick={() => setTab("home")} className="flex flex-1 flex-col items-center justify-center gap-1 py-3">
            <HomeIcon size={22} className={tab === "home" ? "text-[#E8C468]" : "text-[#8B8F99]"} />
            <span className={`text-[10px] font-bold ${tab === "home" ? "text-[#E8C468]" : "text-[#8B8F99]"}`}>{t.home}</span>
          </button>
          <button onClick={() => setTab("history")} className="flex flex-1 flex-col items-center justify-center gap-1 py-3">
            <HistoryIcon size={22} className={tab === "history" ? "text-[#E8C468]" : "text-[#8B8F99]"} />
            <span className={`text-[10px] font-bold ${tab === "history" ? "text-[#E8C468]" : "text-[#8B8F99]"}`}>{t.records}</span>
          </button>
          <div className="relative -top-6">
            <button onClick={() => openNewForm()} className="flex h-14 w-14 items-center justify-center rounded-2xl text-[#0D0F14] shadow-2xl active:scale-95" style={{ background: GOLD_GRADIENT }}>
              <Plus size={28} strokeWidth={3} />
            </button>
          </div>
          <button onClick={() => setTab("summary")} className="flex flex-1 flex-col items-center justify-center gap-1 py-3">
            <BarChart3 size={22} className={tab === "summary" ? "text-[#E8C468]" : "text-[#8B8F99]"} />
            <span className={`text-[10px] font-bold ${tab === "summary" ? "text-[#E8C468]" : "text-[#8B8F99]"}`}>{t.analysis}</span>
          </button>
          <button onClick={() => setTab("qr")} className="flex flex-1 flex-col items-center justify-center gap-1 py-3">
            <QrCode size={22} className={tab === "qr" ? "text-[#E8C468]" : "text-[#8B8F99]"} />
            <span className={`text-[10px] font-bold ${tab === "qr" ? "text-[#E8C468]" : "text-[#8B8F99]"}`}>{t.pay}</span>
          </button>
        </nav>

        <AnimatePresence>
          {showForm && (
            <div className="fixed inset-0 z-50 flex items-end justify-center sm:absolute">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeForm} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
              <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="relative z-10 max-h-[90%] w-full max-w-md overflow-y-auto rounded-t-[2.5rem] border-t border-[#2A2D35] bg-[#181B22] p-8 shadow-2xl">
                <div className="mx-auto mb-8 h-1.5 w-12 rounded-full bg-[#2A2D35]" />
                <div className="mb-8 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-black text-[#E8C468] uppercase tracking-widest mb-1">{editingId ? t.entryCode : generateEntryCode()}</p>
                    <h2 className="font-display text-2xl font-extrabold">{editingId ? t.editRecord : t.newRecord}</h2>
                  </div>
                  <button onClick={closeForm} className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1F2229] text-[#8B8F99]"><X size={20} /></button>
                </div>

                {form.photo && (
                  <div className="mb-6 relative group">
                    <img src={form.photo} alt="Attached" className="w-full h-48 object-cover rounded-2xl border border-[#2A2D35]" />
                    <button onClick={() => setForm(f => ({...f, photo: undefined}))} className="absolute top-2 right-2 h-8 w-8 flex items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity">
                      <X size={16} />
                    </button>
                  </div>
                )}

                <div className="mb-6 flex gap-2 rounded-2xl bg-[#0D0F14] p-1">
                  <button onClick={() => setForm((f) => ({ ...f, entryType: "work" }))} className={`flex-1 rounded-xl py-3 text-xs font-black uppercase transition ${form.entryType === "work" ? "text-[#0D0F14]" : "text-[#8B8F99]"}`} style={form.entryType === "work" ? { background: GOLD_GRADIENT } : undefined}>{t.work}</button>
                  <button onClick={() => setForm((f) => ({ ...f, entryType: "spend" }))} className={`flex-1 rounded-xl py-3 text-xs font-black uppercase transition ${form.entryType === "spend" ? "bg-[#F87171] text-white" : "text-[#8B8F99]"}`}>{t.spend}</button>
                </div>

                <div className="space-y-4">
                  {form.entryType === "work" ? (
                    <>
                      <select value={form.service} onChange={(e) => setForm((f) => ({ ...f, service: e.target.value }))} className={inputClass}>
                        {services.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                      {form.service === "Other" && <input value={form.customNote} onChange={(e) => setForm((f) => ({ ...f, customNote: e.target.value }))} placeholder={t.describeService} className={inputClass} />}
                      <input value={form.customer} onChange={(e) => setForm((f) => ({ ...f, customer: e.target.value }))} placeholder={t.customer} className={inputClass} />
                      <div>
                        <p className="mb-2 ml-1 text-[10px] font-black uppercase tracking-widest text-[#8B8F99]">{t.status}</p>
                        <div className="flex gap-2">
                          {(["undecided", "unpaid", "paid"] as EntryStatus[]).map((status) => (
                            <button key={status} onClick={() => setForm(f => ({...f, status, amount: status === "undecided" ? "0" : f.amount}))} className={`flex-1 rounded-xl border py-3 text-[10px] font-black uppercase transition ${form.status === status ? status === "paid" ? "border-[#4ADE80] bg-[#4ADE80] text-[#0D0F14]" : status === "unpaid" ? "border-[#F87171] bg-[#F87171] text-white" : "border-[#E8C468] text-[#0D0F14]" : "border-[#2A2D35] bg-[#0D0F14] text-[#8B8F99]"}`} style={form.status === status && status === "undecided" ? { background: GOLD_GRADIENT } : undefined}>{t[status]}</button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="mb-2 ml-1 text-[10px] font-black uppercase tracking-widest text-[#8B8F99]">{t.amount}</p>
                        <input type="number" value={form.status === "undecided" ? "0" : form.amount} disabled={form.status === "undecided"} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} placeholder="₹0" className={`${inputClass} font-display text-xl font-bold ${form.status === "undecided" ? "opacity-50 cursor-not-allowed" : ""}`} />
                        {form.status === "undecided" && <p className="ml-1 mt-1 text-[11px] text-[#8B8F99]">{t.undecidedHelp}</p>}
                      </div>
                      {form.status === "paid" && (
                        <div className="flex gap-2">
                          {(["cash", "online"] as PaymentMethod[]).map((method) => (
                            <button key={method} onClick={() => setForm((f) => ({ ...f, method }))} className={`flex-1 rounded-xl border py-3 text-[10px] font-black uppercase transition ${form.method === method ? "border-[#8B8F99]/40 bg-[#1F2229] text-[#F5F5F7]" : "border-[#2A2D35] bg-[#0D0F14] text-[#8B8F99]"}`}>{t[method]}</button>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <input value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} placeholder={t.whatSpentOn} className={inputClass} />
                      <input type="number" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} placeholder="₹0" className={`${inputClass} font-display text-xl font-bold`} />
                    </>
                  )}
                </div>
                <button onClick={saveEntry} className="mt-8 w-full rounded-2xl py-5 font-black uppercase tracking-widest text-[#0D0F14] shadow-xl active:scale-95 transition-transform" style={{ background: GOLD_GRADIENT }}>{editingId ? t.saveChanges : t.save}</button>
              </motion.div>
            </div>
          )}

          {cameraPreview && (
            <div className="fixed inset-0 z-[60] bg-black flex flex-col">
              <div className="flex-1 flex items-center justify-center p-6">
                <img src={cameraPreview} alt="Preview" className="max-w-full max-h-full rounded-3xl border border-[#2A2D35] object-contain" />
              </div>
              <div className="p-8 bg-[#0D0F14] border-t border-[#2A2D35] flex gap-4">
                <button onClick={() => setCameraPreview(null)} className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-[#1F2229] py-5 font-black uppercase tracking-widest text-[#8B8F99]">
                  <RotateCcw size={18} /> {t.retake}
                </button>
                <button onClick={useCapturedPhoto} className="flex-1 flex items-center justify-center gap-2 rounded-2xl py-5 font-black uppercase tracking-widest text-[#0D0F14]" style={{ background: GOLD_GRADIENT }}>
                  <Check size={18} /> {t.usePhoto}
                </button>
              </div>
            </div>
          )}

          {showPhotoViewer && (
            <div className="fixed inset-0 z-[70] bg-black/95 backdrop-blur-xl flex flex-col">
              <div className="p-6 flex justify-end">
                <button onClick={() => setShowPhotoViewer(null)} className="h-12 w-12 flex items-center justify-center rounded-full bg-[#1F2229] text-[#8B8F99]">
                  <X size={24} />
                </button>
              </div>
              <div className="flex-1 flex items-center justify-center p-6">
                <img src={showPhotoViewer} alt="Full view" className="max-w-full max-h-full object-contain rounded-2xl" />
              </div>
            </div>
          )}

          {showManageServices && (
            <div className="fixed inset-0 z-[80] flex items-center justify-center p-6">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowManageServices(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative z-10 w-full max-w-sm rounded-3xl border border-[#2A2D35] bg-[#181B22] p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-display text-xl font-bold">{t.manageServices}</h3>
                  <button onClick={() => setShowManageServices(false)} className="text-[#8B8F99]"><X size={20} /></button>
                </div>
                <div className="space-y-3 max-h-60 overflow-y-auto mb-6 pr-2 scrollbar-hide">
                  {services.map((s, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-[#0D0F14] border border-[#2A2D35]">
                      <span className="text-sm font-medium">{s}</span>
                      <button onClick={() => setServices(services.filter((_, i) => i !== idx))} className="text-[#F87171] p-1"><Trash2 size={16} /></button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input value={newServiceName} onChange={(e) => setNewServiceName(e.target.value)} placeholder="Service Name" className={inputClass} />
                  <button onClick={() => {
                    if (newServiceName.trim()) {
                      setServices([...services, newServiceName.trim()]);
                      setNewServiceName("");
                    }
                  }} className="w-12 h-12 flex items-center justify-center rounded-2xl text-[#0D0F14] shrink-0" style={{ background: GOLD_GRADIENT }}><Plus size={24} /></button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
