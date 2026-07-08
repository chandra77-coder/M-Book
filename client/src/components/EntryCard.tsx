import React from "react";
import { Edit3, Eye, Trash2, History as HistoryIcon } from "lucide-react";

interface Entry {
  id: number;
  entryCode: string;
  type: "work" | "spend";
  service?: string;
  customNote?: string;
  customer?: string;
  amount: number;
  status?: "paid" | "unpaid" | "undecided";
  method?: "cash" | "online";
  note?: string;
  date: string;
  photo?: string;
}

interface EntryCardProps {
  entry: Entry & { daysAgo: number };
  lang: "en" | "hi";
  t: any;
  onEdit: (entry: Entry) => void;
  onDelete: (id: number) => void;
  onViewPhoto?: (photo: string) => void;
}

const formatDate = (date: string, lang: "en" | "hi") => {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "No date";
  return d.toLocaleDateString(lang === "hi" ? "hi-IN" : "en-IN", { day: "2-digit", month: "short" });
};

const formatTime = (date: string, lang: "en" | "hi") => {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString(lang === "hi" ? "hi-IN" : "en-IN", { hour: "2-digit", minute: "2-digit" });
};

const inr = (n: number) => `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

export const EntryCard = React.memo(
  ({ entry, lang, t, onEdit, onDelete, onViewPhoto }: EntryCardProps) => (
    <div className="group rounded-2xl border border-[#2A2D35] bg-[#181B22] p-4 flex items-center gap-4">
      <div className="h-12 w-12 rounded-xl bg-[#0D0F14] overflow-hidden flex-shrink-0 border border-[#2A2D35]">
        {entry.photo ? (
          <img src={entry.photo} alt="Entry" className="h-full w-full object-cover" loading="lazy" />
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
      <button
        onClick={() => onEdit(entry)}
        className="h-10 w-10 flex items-center justify-center rounded-xl bg-[#1F2229] text-[#8B8F99] group-hover:text-[#E8C468] transition-colors"
      >
        <Edit3 size={18} />
      </button>
    </div>
  ),
  (prevProps, nextProps) => {
    return (
      prevProps.entry.id === nextProps.entry.id &&
      prevProps.lang === nextProps.lang &&
      prevProps.entry.photo === nextProps.entry.photo
    );
  }
);

EntryCard.displayName = "EntryCard";

export const HistoryEntryCard = React.memo(
  ({ entry, lang, t, onEdit, onDelete, onViewPhoto }: EntryCardProps) => (
    <div className="rounded-2xl border border-[#2A2D35] bg-[#181B22] p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-[10px] font-black text-[#E8C468] uppercase tracking-widest">{entry.entryCode}</p>
          <h4 className="font-bold text-lg mt-1">
            {entry.type === "work" ? (entry.service === "Other" ? entry.customNote : entry.service) : entry.note}
          </h4>
          <p className="text-xs text-[#8B8F99] font-medium">
            {formatDate(entry.date, lang)} • {formatTime(entry.date, lang)}
          </p>
        </div>
        <div className="text-right">
          <p className={`text-lg font-black ${entry.type === "spend" ? "text-[#F87171]" : "text-[#F5F5F7]"}`}>
            {entry.type === "spend" ? "-" : ""}{inr(entry.amount)}
          </p>
          {entry.status && (
            <span
              className={`text-[10px] font-black uppercase tracking-widest ${
                entry.status === "paid" ? "text-[#4ADE80]" : entry.status === "unpaid" ? "text-[#F87171]" : "text-[#E8C468]"
              }`}
            >
              {t[entry.status]}
            </span>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onEdit(entry)}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#1F2229] py-3 text-[10px] font-black uppercase text-[#8B8F99] hover:text-[#E8C468] transition-colors"
        >
          <Edit3 size={14} /> Edit
        </button>
        {entry.photo && (
          <button
            onClick={() => onViewPhoto?.(entry.photo!)}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#1F2229] py-3 text-[10px] font-black uppercase text-[#8B8F99] hover:text-[#E8C468] transition-colors"
          >
            <Eye size={14} /> {t.seePhoto}
          </button>
        )}
        <button
          onClick={() => onDelete(entry.id)}
          className="w-12 flex items-center justify-center rounded-xl bg-[#F87171]/10 text-[#F87171] py-3 transition-colors hover:bg-[#F87171]/20"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  ),
  (prevProps, nextProps) => {
    return (
      prevProps.entry.id === nextProps.entry.id &&
      prevProps.lang === nextProps.lang &&
      prevProps.entry.photo === nextProps.entry.photo
    );
  }
);

HistoryEntryCard.displayName = "HistoryEntryCard";
