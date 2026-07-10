// Utility functions extracted to prevent recreating on every render
export const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const GOLD_GRADIENT = "linear-gradient(135deg, #D4A24E 0%, #E8C468 100%)";

export const daysAgoFrom = (date: string): number => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return Math.floor((now.getTime() - d.getTime()) / 86400000);
};

export const formatDate = (date: string, lang: "en" | "hi"): string => {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "No date";
  return d.toLocaleDateString(lang === "hi" ? "hi-IN" : "en-IN", { day: "2-digit", month: "short" });
};

export const formatTime = (date: string, lang: "en" | "hi"): string => {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString(lang === "hi" ? "hi-IN" : "en-IN", { hour: "2-digit", minute: "2-digit" });
};

export const inr = (n: number): string => `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

// Memoized calculations to prevent recalculation
export const calculateStats = (workEntries: any[], spendEntries: any[], transferEntries: any[]) => {
  const totalEarned = workEntries
    .filter((e) => e.status === "paid")
    .reduce((sum, e) => sum + e.amount, 0);
  const totalUnpaid = workEntries
    .filter((e) => e.status === "unpaid")
    .reduce((sum, e) => sum + e.amount, 0);
  const totalSpend = spendEntries.reduce((sum, e) => sum + e.amount, 0);
  
  // Total Balance (Net Profit) should be Income - Expense
  const netProfit = totalEarned - totalSpend;
  
  const cashPayments = workEntries
    .filter((e) => e.method === "cash" && e.status === "paid")
    .reduce((sum, e) => sum + e.amount, 0);
  const onlinePayments = workEntries
    .filter((e) => e.method === "online" && e.status === "paid")
    .reduce((sum, e) => sum + e.amount, 0);
  
  const totalTransferred = transferEntries.reduce((sum, e) => sum + e.amount, 0);

  return {
    totalEarned,
    totalUnpaid,
    totalSpend,
    netProfit,
    cashPayments,
    onlinePayments,
    totalTransferred,
  };
};

// Debounce helper for search/filter inputs
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return function (...args: Parameters<T>) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};
