import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  ChevronRight,
  Edit3,
  History as HistoryIcon,
  Home as HomeIcon,
  Plus,
  QrCode,
  Settings as SettingsIcon,
  Trash2,
  Upload,
  X,
  Camera,
  Eye,
  Languages,
  Check,
  RotateCcw,
} from "lucide-react";
import { EntryCard, HistoryEntryCard } from "@/components/EntryCard";
import {
  WEEKDAYS,
  GOLD_GRADIENT,
  daysAgoFrom,
  formatDate,
  formatTime,
  inr,
  calculateStats,
  debounce,
} from "@/utils/helpers";

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
  photo?: string;
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
    photoWork: "Photo Work",
    filterByService: "Filter by Service",
    totalPhotos: "Total Photos",
    cashPayments: "Cash Payments",
    onlinePayments: "Online Payments",
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
    photoWork: "फोटो काम",
    filterByService: "सेवा के अनुसार फ़िल्टर करें",
    totalPhotos: "कुल फोटो",
    cashPayments: "नकद भुगतान",
    onlinePayments: "ऑनलाइन भुगतान",
  },
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

// Memoized subcomponents to prevent unnecessary re-renders
const StatsCard = React.memo(
  ({ totalBalance, income, expense, unpaid, t }: any) => (
    <div className="rounded-[2.5rem] border border-[#2A2D35] bg-[#181B22] p-8 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#E8C468]/5 rounded-full -mr-16 -mt-16 blur-3xl" />
      <p className="text-xs font-black uppercase tracking-widest text-[#8B8F99]">{t.totalBalance}</p>
      <h3 className="mb-6 mt-1 font-display text-4xl font-extrabold text-transparent bg-clip-text" style={{ backgroundImage: GOLD_GRADIENT }}>
        {inr(totalBalance)}
      </h3>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <p className="text-[10px] font-black uppercase text-[#8B8F99]">{t.income}</p>
          <p className="font-bold text-[#4ADE80]">{inr(income)}</p>
        </div>
        <div>
          <p className="text-[10px] font-black uppercase text-[#8B8F99]">{t.expense}</p>
          <p className="font-bold text-[#F87171]">{inr(expense)}</p>
        </div>
        <div>
          <p className="text-[10px] font-black uppercase text-[#8B8F99]">{t.unpaid}</p>
          <p className="font-bold text-[#E8C468]">{inr(unpaid)}</p>
        </div>
      </div>
    </div>
  )
);
StatsCard.displayName = "StatsCard";

const PaymentMethodsSection = React.memo(
  ({ cashPayments, onlinePayments, t }: any) => (
    <div className="rounded-3xl border border-[#2A2D35] bg-[#181B22] p-6 space-y-4">
      <h3 className="font-bold text-lg">{t.paymentModes}</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between p-4 rounded-2xl bg-[#0D0F14]">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full" style={{ background: "#4ADE80" }}></div>
            <span className="text-sm font-medium">{t.cash}</span>
          </div>
          <span className="font-bold text-[#4ADE80]">{inr(cashPayments)}</span>
        </div>
        <div className="flex items-center justify-between p-4 rounded-2xl bg-[#0D0F14]">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full" style={{ background: "#60A5FA" }}></div>
            <span className="text-sm font-medium">{t.online}</span>
          </div>
          <span className="font-bold text-[#60A5FA]">{inr(onlinePayments)}</span>
        </div>
      </div>
    </div>
  )
);
PaymentMethodsSection.displayName = "PaymentMethodsSection";

const ServiceEarningsSection = React.memo(
  ({ serviceEarnings, totalEarned, t }: any) => (
    <div className="rounded-3xl border border-[#2A2D35] bg-[#181B22] p-6 space-y-4">
      <h3 className="font-bold text-lg">{t.servicesShare}</h3>
      {serviceEarnings.length > 0 ? (
        <div className="space-y-3">
          {serviceEarnings.map(([service, amount]: any) => {
            const percentage = totalEarned > 0 ? (amount / totalEarned) * 100 : 0;
            return (
              <div key={service} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium truncate">{service}</span>
                  <span className="font-bold text-[#E8C468]">{inr(amount)}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#0D0F14] overflow-hidden">
                  <div className="h-full" style={{ width: `${percentage}%`, background: GOLD_GRADIENT }}></div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-[#8B8F99] text-sm">{t.noServices}</p>
      )}
    </div>
  )
);
ServiceEarningsSection.displayName = "ServiceEarningsSection";

export default function MBookApp() {
  const { theme, toggleTheme } = useTheme();
  const [tab, setTab] = useState("home");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [serviceFilter, setServiceFilter] = useState<string>("all");
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

  // Debounced localStorage saves to prevent excessive writes
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem("mbook_entries", JSON.stringify(entries));
    }, 1000);
    return () => clearTimeout(timer);
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

  const entriesWithDaysAgo = useMemo<EntryWithDaysAgo[]>(
    () => entries.map((entry) => ({ ...entry, daysAgo: daysAgoFrom(entry.date) })),
    [entries]
  );

  const workEntries = useMemo(() => entriesWithDaysAgo.filter((e) => e.type === "work"), [entriesWithDaysAgo]);
  const spendEntries = useMemo(() => entriesWithDaysAgo.filter((e) => e.type === "spend"), [entriesWithDaysAgo]);
  const photoEntries = useMemo(() => workEntries.filter((e) => e.photo), [workEntries]);

  const stats = useMemo(() => calculateStats(workEntries, spendEntries), [workEntries, spendEntries]);

  const filteredEntries = useMemo(() => {
    let list = [...entriesWithDaysAgo];
    if (dateFilter === "today") list = list.filter((e) => e.daysAgo === 0);
    if (dateFilter === "week") list = list.filter((e) => e.daysAgo >= 0 && e.daysAgo <= 6);
    if (dateFilter === "month") list = list.filter((e) => e.daysAgo >= 0 && e.daysAgo <= 30);
    if (statusFilter !== "all") list = list.filter((e) => e.type === "work" && e.status === statusFilter);
    if (serviceFilter !== "all")
      list = list.filter((e) => e.type === "work" && (e.service === serviceFilter || (e.service === "Other" && e.customNote)));
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [entriesWithDaysAgo, dateFilter, statusFilter, serviceFilter]);

  const serviceEarnings = useMemo(() => {
    const earnings: { [key: string]: number } = {};
    workEntries
      .filter((e) => e.status === "paid")
      .forEach((entry) => {
        const service = entry.service === "Other" ? entry.customNote : entry.service;
        earnings[service || "Unknown"] = (earnings[service || "Unknown"] || 0) + entry.amount;
      });
    return Object.entries(earnings).sort((a, b) => b[1] - a[1]);
  }, [workEntries]);

  const generateEntryCode = useCallback(() => {
    const code = `MB-${String(nextEntryNum).padStart(4, "0")}`;
    return code;
  }, [nextEntryNum]);

  const openNewForm = useCallback(
    (photo?: string) => {
      setEditingId(null);
      const f = emptyForm();
      f.service = services[0] || "Other";
      f.photo = photo;
      setForm(f);
      setShowForm(true);
    },
    [services]
  );

  const closeForm = useCallback(() => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm());
    setCameraPreview(null);
  }, []);

  const handleCameraCapture = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Use requestIdleCallback to not block UI thread
    requestIdleCallback(() => {
      const reader = new FileReader();
      reader.onload = () => {
        setCameraPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const useCapturedPhoto = useCallback(() => {
    if (cameraPreview) {
      openNewForm(cameraPreview);
      setCameraPreview(null);
    }
  }, [cameraPreview, openNewForm]);

  const saveEntry = useCallback(() => {
    const isUndecided = form.entryType === "work" && form.status === "undecided";
    const amount = isUndecided ? 0 : parseFloat(form.amount) || 0;

    if (editingId !== null) {
      setEntries((prev) =>
        prev.map((entry) => {
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
        })
      );
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
  }, [editingId, form, generateEntryCode, closeForm]);

  const deleteEntry = useCallback(
    (id: number) => {
      if (window.confirm(t.deleteConfirm)) setEntries((prev) => prev.filter((entry) => entry.id !== id));
    },
    [t]
  );

  const editEntry = useCallback(
    (entry: Entry) => {
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
    },
    [services]
  );

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

              <StatsCard totalBalance={stats.netProfit} income={stats.totalEarned} expense={stats.totalSpend} unpaid={stats.totalUnpaid} t={t} />

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
                    <EntryCard
                      key={entry.id}
                      entry={entry}
                      lang={lang}
                      t={t}
                      onEdit={editEntry}
                      onDelete={deleteEntry}
                      onViewPhoto={setShowPhotoViewer}
                    />
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
                    <button
                      key={f}
                      onClick={() => setDateFilter(f)}
                      className={`shrink-0 rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-widest transition ${
                        dateFilter === f ? "bg-[#E8C468] text-[#0D0F14]" : "bg-[#1F2229] text-[#8B8F99]"
                      }`}
                    >
                      {t[f]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#8B8F99] mb-2">{t.filterByService}</p>
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    <button
                      onClick={() => setServiceFilter("all")}
                      className={`shrink-0 rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-widest transition ${
                        serviceFilter === "all" ? "bg-[#E8C468] text-[#0D0F14]" : "bg-[#1F2229] text-[#8B8F99]"
                      }`}
                    >
                      {t.all}
                    </button>
                    {services.map((s) => (
                      <button
                        key={s}
                        onClick={() => setServiceFilter(s)}
                        className={`shrink-0 rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-widest transition ${
                          serviceFilter === s ? "bg-[#E8C468] text-[#0D0F14]" : "bg-[#1F2229] text-[#8B8F99]"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {filteredEntries.map((entry) => (
                  <HistoryEntryCard
                    key={entry.id}
                    entry={entry}
                    lang={lang}
                    t={t}
                    onEdit={editEntry}
                    onDelete={deleteEntry}
                    onViewPhoto={setShowPhotoViewer}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {tab === "summary" && (
            <motion.div key="summary" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
              <div className="pt-2">
                <h2 className="font-display text-3xl font-extrabold">{t.analysis}</h2>
              </div>

              <PaymentMethodsSection cashPayments={stats.cashPayments} onlinePayments={stats.onlinePayments} t={t} />
              <ServiceEarningsSection serviceEarnings={serviceEarnings} totalEarned={stats.totalEarned} t={t} />
            </motion.div>
          )}

          {tab === "qr" && (
            <motion.div key="qr" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
              <div className="pt-2">
                <h2 className="font-display text-3xl font-extrabold">{t.pay}</h2>
              </div>

              <div className="rounded-3xl border border-[#2A2D35] bg-[#181B22] p-6 space-y-6">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-[#8B8F99] mb-4">{t.scanToPay}</p>
                  {qrImage && (
                    <div className="rounded-2xl overflow-hidden border border-[#2A2D35] bg-white p-4">
                      <img src={qrImage} alt="Payment QR" className="w-full h-auto" loading="lazy" />
                    </div>
                  )}
                </div>

                <div className="space-y-4 border-t border-[#2A2D35] pt-6">
                  <p className="text-xs font-black uppercase tracking-widest text-[#8B8F99]">{t.logPayment}</p>
                  <input type="text" placeholder={t.qrCustomerPlaceholder} value={qrCustomer} onChange={(e) => setQrCustomer(e.target.value)} className={inputClass} />
                  <input
                    type="number"
                    placeholder={t.qrAmountPlaceholder}
                    value={qrAmount}
                    onChange={(e) => setQrAmount(e.target.value)}
                    className={`${inputClass} font-display text-xl font-bold`}
                  />
                  <button
                    onClick={() => {
                      if (qrAmount && qrCustomer) {
                        const newEntry: Entry = {
                          id: Date.now(),
                          entryCode: generateEntryCode(),
                          type: "work",
                          service: "Other",
                          customNote: qrCustomer,
                          customer: qrCustomer,
                          amount: parseFloat(qrAmount),
                          status: "paid",
                          method: "online",
                          date: new Date().toISOString(),
                        };
                        setEntries((prev) => [...prev, newEntry]);
                        setNextEntryNum((n) => n + 1);
                        setQrAmount("");
                        setQrCustomer("");
                        alert(lang === "en" ? "Payment logged successfully!" : "भुगतान सफलतापूर्वक लॉग किया गया!");
                      }
                    }}
                    className="w-full rounded-2xl py-4 font-black uppercase tracking-widest text-[#0D0F14] shadow-xl active:scale-95 transition-transform"
                    style={{ background: GOLD_GRADIENT }}
                  >
                    {t.logPayment}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {tab === "settings" && (
            <motion.div key="settings" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-6">
              <div className="pt-2">
                <h2 className="font-display text-3xl font-extrabold">{t.settings}</h2>
              </div>

              <div className="rounded-3xl border border-[#2A2D35] bg-[#181B22] p-2">
                <div className="flex items-center justify-between p-4">
                  <span className="text-sm font-bold">{t.language}</span>
                  <div className="flex gap-1 bg-[#0D0F14] p-1 rounded-xl">
                    <button
                      onClick={() => setLang("en")}
                      className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition ${lang === "en" ? "bg-[#E8C468] text-[#0D0F14]" : "text-[#8B8F99]"}`}
                    >
                      EN
                    </button>
                    <button
                      onClick={() => setLang("hi")}
                      className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition ${lang === "hi" ? "bg-[#E8C468] text-[#0D0F14]" : "text-[#8B8F99]"}`}
                    >
                      HI
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (window.confirm(t.clearConfirm)) {
                    setEntries([]);
                    setNextEntryNum(1);
                  }
                }}
                className="flex w-full items-center gap-3 rounded-3xl border border-[#F87171]/20 bg-[#F87171]/5 p-4 text-sm font-bold text-[#F87171] hover:bg-[#F87171]/10 transition-colors"
              >
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
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="relative z-10 max-h-[90%] w-full rounded-t-3xl border border-[#2A2D35] border-b-0 bg-[#181B22] overflow-y-auto"
              >
                <div className="p-6 space-y-4">
                  <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-[#2A2D35]" />
                  <div className="flex items-start justify-between gap-4">
                    <h2 className="font-display text-2xl font-extrabold">{editingId ? t.editRecord : t.newRecord}</h2>
                    <button onClick={closeForm} className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1F2229] text-[#8B8F99]">
                      <X size={20} />
                    </button>
                  </div>

                  {form.photo && (
                    <div className="relative group">
                      <img src={form.photo} alt="Attached" className="w-full h-48 object-cover rounded-2xl border border-[#2A2D35]" />
                      <button
                        onClick={() => setForm((f) => ({ ...f, photo: undefined }))}
                        className="absolute top-2 right-2 h-8 w-8 flex items-center justify-center rounded-full bg-black/50 text-white"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}

                  <div className="flex gap-2 rounded-2xl bg-[#0D0F14] p-1">
                    <button
                      onClick={() => setForm((f) => ({ ...f, entryType: "work" }))}
                      className={`flex-1 rounded-xl py-3 text-xs font-black uppercase transition ${form.entryType === "work" ? "bg-[#E8C468] text-[#0D0F14]" : "text-[#8B8F99]"}`}
                    >
                      {t.work}
                    </button>
                    <button
                      onClick={() => setForm((f) => ({ ...f, entryType: "spend" }))}
                      className={`flex-1 rounded-xl py-3 text-xs font-black uppercase transition ${form.entryType === "spend" ? "bg-[#E8C468] text-[#0D0F14]" : "text-[#8B8F99]"}`}
                    >
                      {t.spend}
                    </button>
                  </div>

                  <div className="space-y-4">
                    {form.entryType === "work" ? (
                      <>
                        <select value={form.service} onChange={(e) => setForm((f) => ({ ...f, service: e.target.value }))} className={inputClass}>
                          {services.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                        {form.service === "Other" && (
                          <input
                            value={form.customNote}
                            onChange={(e) => setForm((f) => ({ ...f, customNote: e.target.value }))}
                            placeholder={t.describeService}
                            className={inputClass}
                          />
                        )}
                        <input
                          value={form.customer}
                          onChange={(e) => setForm((f) => ({ ...f, customer: e.target.value }))}
                          placeholder={t.customer}
                          className={inputClass}
                        />
                        <div>
                          <p className="mb-2 ml-1 text-[10px] font-black uppercase tracking-widest text-[#8B8F99]">{t.status}</p>
                          <div className="flex gap-2">
                            {(["undecided", "unpaid", "paid"] as EntryStatus[]).map((status) => (
                              <button
                                key={status}
                                onClick={() => setForm((f) => ({ ...f, status, amount: status === "undecided" ? "0" : f.amount }))}
                                className={`flex-1 rounded-xl border py-3 text-[10px] font-black uppercase transition ${
                                  form.status === status
                                    ? "border-[#E8C468] bg-[#E8C468]/10 text-[#E8C468]"
                                    : "border-[#2A2D35] text-[#8B8F99]"
                                }`}
                              >
                                {t[status]}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="mb-2 ml-1 text-[10px] font-black uppercase tracking-widest text-[#8B8F99]">{t.amount}</p>
                          <input
                            type="number"
                            value={form.status === "undecided" ? "0" : form.amount}
                            disabled={form.status === "undecided"}
                            onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                            className={inputClass}
                          />
                          {form.status === "undecided" && <p className="ml-1 mt-1 text-[11px] text-[#8B8F99]">{t.undecidedHelp}</p>}
                        </div>
                        {form.status === "paid" && (
                          <div className="flex gap-2">
                            {(["cash", "online"] as PaymentMethod[]).map((method) => (
                              <button
                                key={method}
                                onClick={() => setForm((f) => ({ ...f, method }))}
                                className={`flex-1 rounded-xl border py-3 text-[10px] font-black uppercase transition ${
                                  form.method === method ? "border-[#E8C468] bg-[#E8C468]/10 text-[#E8C468]" : "border-[#2A2D35] text-[#8B8F99]"
                                }`}
                              >
                                {t[method]}
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
                          placeholder={t.whatSpentOn}
                          className={inputClass}
                        />
                        <input
                          type="number"
                          value={form.amount}
                          onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                          placeholder="₹0"
                          className={`${inputClass} font-display text-xl font-bold`}
                        />
                      </>
                    )}
                  </div>
                  <button
                    onClick={saveEntry}
                    className="w-full rounded-2xl py-5 font-black uppercase tracking-widest text-[#0D0F14] shadow-xl active:scale-95 transition-transform"
                    style={{ background: GOLD_GRADIENT }}
                  >
                    {t.save}
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          {cameraPreview && (
            <div className="fixed inset-0 z-[60] bg-black flex flex-col">
              <div className="flex-1 flex items-center justify-center p-6">
                <img src={cameraPreview} alt="Preview" className="max-w-full max-h-full rounded-3xl border border-[#2A2D35] object-contain" />
              </div>
              <div className="p-8 bg-[#0D0F14] border-t border-[#2A2D35] flex gap-4">
                <button
                  onClick={() => setCameraPreview(null)}
                  className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-[#1F2229] py-5 font-black uppercase tracking-widest text-[#8B8F99]"
                >
                  <RotateCcw size={18} /> {t.retake}
                </button>
                <button
                  onClick={useCapturedPhoto}
                  className="flex-1 flex items-center justify-center gap-2 rounded-2xl py-5 font-black uppercase tracking-widest text-[#0D0F14]"
                  style={{ background: GOLD_GRADIENT }}
                >
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
        </AnimatePresence>
      </div>
    </div>
  );
}
