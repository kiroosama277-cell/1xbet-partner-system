"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// --- Types ---
type Registration = {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  promoCode: string;
  trafficSource: string;
  channelDesc: string | null;
  refCode: string | null;
  salesRefId: string | null;
  status: string;
  notes: string | null;
  createdAt: string;
  salesRef?: { id: string; code: string; name: string } | null;
  commissions?: { id: string; amount: number; status: string; currency: string; month: string; createdAt: string }[];
};

type SalesRef = {
  id: string;
  code: string;
  name: string;
  email: string | null;
  phone: string | null;
  target: number;
  isActive: boolean;
  createdAt: string;
  _count: { registrations: number; commissions: number };
};

type Commission = {
  id: string;
  salesRefId: string;
  registrationId: string;
  amount: number;
  currency: string;
  status: string;
  month: string;
  paidAt: string | null;
  createdAt: string;
  salesRef: { id: string; code: string; name: string };
  registration: { id: string; name: string; country: string };
};

type Activity = {
  id: string;
  action: string;
  details: string | null;
  salesRefId: string | null;
  adminId?: string | null;
  adminName?: string | null;
  adminUserId?: string | null;
  ipAddress?: string | null;
  createdAt: string;
  salesRef?: { id: string; code: string; name: string } | null;
};

type Stats = {
  overview: {
    totalRegistrations: number;
    totalSalesRefs: number;
    activeSalesRefs: number;
    todayRegistrations: number;
    weekRegistrations: number;
    monthRegistrations: number;
    refRegistrations: number;
    conversionRate: number;
  };
  commissions: { total: number; pending: number; approved: number; paid: number };
  salesStats: {
    id: string; code: string; name: string; email: string | null; phone: string | null;
    target: number; isActive: boolean; totalRegs: number; monthRegs: number;
    totalCommissions: number; progress: number;
  }[];
  countryStats: { country: string; count: number }[];
  sourceStats: { source: string; count: number }[];
  daily: { date: string; count: number }[];
  recentRegs: { id: string; name: string; country: string; createdAt: string; salesRef: { name: string; code: string } | null }[];
};

type Notification = { id: string; message: string; time: string; read: boolean; type?: "success" | "error" | "info" };

// --- Icon helpers ---
const Icons = {
  dashboard: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>,
  users: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>,
  money: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  team: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /></svg>,
  activity: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  settings: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  bell: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>,
  download: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>,
  refresh: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>,
  trash: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>,
  copy: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" /></svg>,
  email: <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>,
  phoneIcon: <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>,
  check: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>,
  x: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>,
};

const statusColors: Record<string, string> = {
  new: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  contacted: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
  active: "bg-green-500/15 text-green-400 border-green-500/20",
  inactive: "bg-red-500/15 text-red-400 border-red-500/20",
  pending: "bg-orange-500/15 text-orange-400 border-orange-500/20",
  approved: "bg-green-500/15 text-green-400 border-green-500/20",
  paid: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
};

const statusLabels: Record<string, string> = {
  new: "جديد",
  contacted: "تم التواصل",
  active: "نشط",
  inactive: "غير نشط",
  pending: "معلق",
  approved: "معتمد",
  paid: "مدفوع",
};

// --- Loading skeleton ---
function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-white/5 ${className}`} />;
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24" />)}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-52" />
        <Skeleton className="h-52" />
      </div>
      <Skeleton className="h-40" />
    </div>
  );
}

export default function AdminPage() {
  const [isAuthed, setIsAuthed] = useState(false);
  const [loginUserId, setLoginUserId] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [authError, setAuthError] = useState("");  
  const [authLoading, setAuthLoading] = useState(true);
  const [showCode, setShowCode] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [clientIP, setClientIP] = useState("");
  const [currentAdmin, setCurrentAdmin] = useState<{userId: string; username: string; role: string} | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [siteUrl, setSiteUrl] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // Data
  const [stats, setStats] = useState<Stats | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [salesRefs, setSalesRefs] = useState<SalesRef[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [commissionSummary, setCommissionSummary] = useState({ total: 0, pending: 0, approved: 0, paid: 0, count: 0 });
  const [activities, setActivities] = useState<Activity[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});

  // UI state
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAddRef, setShowAddRef] = useState(false);
  const [newRef, setNewRef] = useState({ code: "", name: "", email: "", phone: "", target: "50" });
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [editingReg, setEditingReg] = useState<Registration | null>(null);
  const [editingRef, setEditingRef] = useState<SalesRef | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [activityFilter, setActivityFilter] = useState("all");
  const [regPage, setRegPage] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Bulk actions
  const [selectedRegs, setSelectedRegs] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState("");

  // Registration detail modal
  const [viewReg, setViewReg] = useState<Registration | null>(null);

  // Commission creation
  const [showAddCommission, setShowAddCommission] = useState(false);
  const [newCommission, setNewCommission] = useState({ salesRefId: "", registrationId: "", amount: "", currency: "USD", month: "" });

  // Dashboard period toggle
  const [dailyPeriod, setDailyPeriod] = useState<"7" | "30">("7");

  // Session timeout tracking
  const [sessionExpiry, setSessionExpiry] = useState<number | null>(null);
  const [showSessionWarning, setShowSessionWarning] = useState(false);

  // Settings sub-tab
  const [settingsSubTab, setSettingsSubTab] = useState<"general" | "users" | "ips" | "security">("general");

  // IP whitelist status (kept for login form indicator)
  const [ipWhitelistActive, setIPWhitelistActive] = useState(false);
  const [ipWhitelisted, setIPWhitelisted] = useState(true);

  const ITEMS_PER_PAGE = 15;

  useEffect(() => { setSiteUrl(window.location.origin); }, []);

  // Check existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Fetch client IP
        const ipRes = await fetch("/api/admin/auth/check-ip");
        if (ipRes.ok) {
          const ipData = await ipRes.json();
          setClientIP(ipData.ip);
          // Store whitelist status for login form
          setIPWhitelistActive(ipData.whitelistActive || false);
          setIPWhitelisted(ipData.isWhitelisted || false);
        }

        // Try to fetch stats (will fail with 401 if not authenticated)
        const res = await fetch("/api/admin/stats");
        if (res.ok) {
          setIsAuthed(true);
          setSessionExpiry(Date.now() + 24 * 60 * 60 * 1000);
          // Fetch all data
          const [regRes, refRes, commRes, actRes, setRes] = await Promise.all([
            fetch("/api/admin/registrations"),
            fetch("/api/admin/refs"),
            fetch("/api/admin/commissions"),
            fetch("/api/admin/activities?limit=50"),
            fetch("/api/admin/settings"),
          ]);
          setStats(await res.json());
          if (regRes.ok) { const d = await regRes.json(); setRegistrations(d.registrations || d); }
          if (refRes.ok) setSalesRefs(await refRes.json());
          if (commRes.ok) { const d = await commRes.json(); setCommissions(d.commissions); setCommissionSummary(d.summary); }
          if (actRes.ok) { const d = await actRes.json(); setActivities(d.activities); }
          if (setRes.ok) setSettings(await setRes.json());
          // Sensitive data (adminUsers, ipWhitelist, loginAttempts) is only in /super-admin
        }
      } catch {}
      setAuthLoading(false);
    };
    checkSession();
  }, []);

  // --- Data fetching ---
  const fetchAllData = useCallback(async (showRefreshLoader = false) => {
    if (showRefreshLoader) setRefreshing(true); else setLoading(true);
    try {
      const [statsRes, regRes, refRes, commRes, actRes, setRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/registrations"),
        fetch("/api/admin/refs"),
        fetch("/api/admin/commissions"),
        fetch("/api/admin/activities?limit=50"),
        fetch("/api/admin/settings"),
      ]);
      if (statsRes.ok) setStats(await statsRes.json());
      if (regRes.ok) { const d = await regRes.json(); setRegistrations(d.registrations || d); }
      if (refRes.ok) setSalesRefs(await refRes.json());
      if (commRes.ok) { const d = await commRes.json(); setCommissions(d.commissions); setCommissionSummary(d.summary); }
      if (actRes.ok) { const d = await actRes.json(); setActivities(d.activities); }
      if (setRes.ok) setSettings(await setRes.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  // Poll for new registrations
  useEffect(() => {
    if (!isAuthed) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/admin/registrations");
        if (res.ok) {
          const d = await res.json();
          const newRegs: Registration[] = d.registrations || d;
          if (newRegs.length > registrations.length && registrations.length > 0) {
            const newOnes = newRegs.filter((nr) => !registrations.some((or) => or.id === nr.id));
            newOnes.forEach((reg) => {
              addNotif(`تسجيل جديد: ${reg.name} — ${reg.salesRef?.name || "بدون مندوب"}`);
            });
          }
          setRegistrations(newRegs);
        }
      } catch {}
    }, 10000);
    return () => clearInterval(interval);
  }, [isAuthed, registrations]);

  // Auto-refresh every 30 seconds when on overview tab
  useEffect(() => {
    if (!isAuthed || activeTab !== "overview") return;
    const interval = setInterval(() => {
      fetchAllData(false);
    }, 30000);
    return () => clearInterval(interval);
  }, [isAuthed, activeTab, fetchAllData]);

  // Session timeout tracking
  useEffect(() => {
    if (!isAuthed || !sessionExpiry) return;
    const interval = setInterval(() => {
      const now = Date.now();
      const fiveMinBeforeExpiry = sessionExpiry - 5 * 60 * 1000;
      if (now >= fiveMinBeforeExpiry && now < sessionExpiry) {
        setShowSessionWarning(true);
      }
      if (now >= sessionExpiry) {
        handleLogout();
        setShowSessionWarning(false);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [isAuthed, sessionExpiry]);

  const addNotif = (message: string, type: "success" | "error" | "info" = "success") => {
    const id = Date.now().toString();
    setNotifications((prev) => [{ id, message, time: new Date().toLocaleTimeString("ar-EG"), read: false, type }, ...prev]);
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 5000);
  };
  const unreadCount = notifications.filter((n) => !n.read).length;

  // --- Auth ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setLoginLoading(true);
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: loginUserId, accessCode }),
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentAdmin({ userId: data.userId, username: data.username, role: data.role });
        setIsAuthed(true);
        setAuthError("");
        setSessionExpiry(Date.now() + 24 * 60 * 60 * 1000);
        fetchAllData();
      } else {
        const d = await res.json();
        setAuthError(d.error || "بيانات الدخول غير صحيحة");
      }
    } catch {
      setAuthError("تعذر تسجيل الدخول، يرجى التحقق من البيانات");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try { await fetch("/api/admin/auth", { method: "DELETE" }); } catch {}
    setIsAuthed(false);
    setCurrentAdmin(null);
  };

  // --- Admin user/IP/login management moved to /super-admin ---

  // --- Actions ---
  const handleAddRef = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/refs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRef),
      });
      if (res.ok) { addNotif(`تمت إضافة المندوب: ${newRef.name}`); setNewRef({ code: "", name: "", email: "", phone: "", target: "50" }); setShowAddRef(false); fetchAllData(); }
      else { const d = await res.json(); alert(d.error || "حدث خطأ"); }
    } catch {}
  };

  const handleUpdateRef = async (data: any) => {
    try {
      await fetch("/api/admin/refs", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      setEditingRef(null);
      fetchAllData();
    } catch {}
  };

  const handleDeleteRef = async (id: string, name: string) => {
    if (!confirm(`هل أنت متأكد من حذف المندوب "${name}"؟ لا يمكن التراجع عن هذا الإجراء.`)) return;
    try { await fetch(`/api/admin/refs?id=${id}`, { method: "DELETE" }); addNotif(`تم حذف المندوب: ${name}`); fetchAllData(); } catch {}
  };

  const handleUpdateReg = async (id: string, data: { status?: string; notes?: string }) => {
    try {
      await fetch("/api/admin/registrations", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, ...data }) });
      setEditingReg(null);
      addNotif("تم تحديث بيانات التسجيل بنجاح");
      fetchAllData();
    } catch {}
  };

  const handleDeleteReg = async (id: string, name: string) => {
    try {
      const res = await fetch(`/api/admin/registrations?id=${id}`, { method: "DELETE" });
      if (res.ok) { addNotif(`تم حذف تسجيل: ${name}`); setDeleteConfirm(null); fetchAllData(); }
      else { addNotif("حدث خطأ أثناء حذف التسجيل"); }
    } catch {}
  };

  // --- Bulk Actions ---
  const handleBulkStatus = async (status: string) => {
    if (selectedRegs.size === 0) return;
    try {
      const res = await fetch("/api/admin/registrations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "bulkStatus", ids: Array.from(selectedRegs), status }),
      });
      if (res.ok) {
        const data = await res.json();
        addNotif(`تم تغيير حالة ${data.count} تسجيل`);
        setSelectedRegs(new Set());
        setBulkAction("");
        fetchAllData();
      }
    } catch {}
  };

  const handleBulkDelete = async () => {
    if (selectedRegs.size === 0) return;
    if (!confirm(`هل أنت متأكد من حذف ${selectedRegs.size} تسجيل؟`)) return;
    try {
      const res = await fetch("/api/admin/registrations", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "bulkDelete", ids: Array.from(selectedRegs) }),
      });
      if (res.ok) {
        const data = await res.json();
        addNotif(`تم حذف ${data.count} تسجيل`);
        setSelectedRegs(new Set());
        fetchAllData();
      }
    } catch {}
  };

  const toggleSelectReg = (id: string) => {
    setSelectedRegs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedRegs.size === paginatedRegs.length) {
      setSelectedRegs(new Set());
    } else {
      setSelectedRegs(new Set(paginatedRegs.map((r) => r.id)));
    }
  };

  // --- Commission Creation ---
  const handleCreateCommission = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/commissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCommission),
      });
      if (res.ok) {
        addNotif("تم إنشاء العمولة بنجاح");
        setShowAddCommission(false);
        setNewCommission({ salesRefId: "", registrationId: "", amount: "", currency: "USD", month: "" });
        fetchAllData();
      } else {
        const d = await res.json();
        alert(d.error || "حدث خطأ في إنشاء العمولة");
      }
    } catch {}
  };

  const handleCommissionStatus = async (id: string, status: string) => {
    try {
      await fetch("/api/admin/commissions", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
      addNotif("تم تحديث حالة العمولة بنجاح");
      fetchAllData();
    } catch {}
  };

  const copyLink = (code: string, refId: string) => {
    navigator.clipboard.writeText(`${siteUrl}?ref=${code}`);
    setCopiedId(refId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // --- Export ---
  const exportCSV = (type: "registrations" | "commissions") => {
    const BOM = "\uFEFF";
    let csv: string;
    if (type === "registrations") {
      const headers = ["الاسم", "البريد الإلكتروني", "الهاتف", "الدولة", "الرمز الترويجي", "المصدر", "المندوب", "الحالة", "التاريخ"];
      const rows = filteredRegs.map((r) => [r.name, r.email, r.phone, r.country, r.promoCode, r.trafficSource, r.salesRef?.name || r.refCode || "—", statusLabels[r.status] || r.status, new Date(r.createdAt).toLocaleDateString("ar-EG")]);
      csv = BOM + [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    } else {
      const headers = ["المندوب", "العميل", "المبلغ", "العملة", "الحالة", "الشهر", "التاريخ"];
      const rows = commissions.map((c) => [c.salesRef.name, c.registration.name, c.amount, c.currency, statusLabels[c.status] || c.status, c.month, new Date(c.createdAt).toLocaleDateString("ar-EG")]);
      csv = BOM + [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    }
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = `1xbet-${type}-${new Date().toISOString().split("T")[0]}.csv`;
    a.click(); addNotif("تم تصدير البيانات بنجاح");
  };

  // --- Filtered data ---
  const filteredRegs = registrations.filter((r) => {
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q) || r.phone.includes(q) || r.promoCode.toLowerCase().includes(q);
    }
    if (dateFilter !== "all") {
      const regDate = new Date(r.createdAt);
      const now = new Date();
      if (dateFilter === "today") return regDate.toDateString() === now.toDateString();
      if (dateFilter === "week") {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return regDate >= weekAgo;
      }
      if (dateFilter === "month") {
        return regDate.getMonth() === now.getMonth() && regDate.getFullYear() === now.getFullYear();
      }
    }
    return true;
  });

  // Paginated registrations
  const totalPages = Math.ceil(filteredRegs.length / ITEMS_PER_PAGE);
  const paginatedRegs = filteredRegs.slice((regPage - 1) * ITEMS_PER_PAGE, regPage * ITEMS_PER_PAGE);

  // Filtered activities
  const filteredActivities = activityFilter === "all"
    ? activities
    : activities.filter((a) => {
        // Special handling: user_create/user_update/user_delete all start with "user_"
        if (activityFilter === "user") return a.action.startsWith("user_");
        return a.action.includes(activityFilter);
      });

  // --- LOGIN ---
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a1628]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 rounded-full border-2 border-[#2db8ff] border-t-transparent animate-spin" />
          <p className="text-sm text-white/60">جاري التحقق...</p>
        </div>
      </div>
    );
  }

  if (!isAuthed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a1628] px-4">
        {/* Background decoration */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#2db8ff]/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-[#d4a017]/5 rounded-full blur-3xl" />
        </div>
        <motion.form 
          initial={{ opacity: 0, y: 30, scale: 0.95 }} 
          animate={{ opacity: 1, y: 0, scale: 1 }} 
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          onSubmit={handleLogin} 
          className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-[#0f1f3d]/90 backdrop-blur-xl p-8 shadow-2xl shadow-black/30"
        >
          <div className="mb-6 text-center">
            <motion.div 
              initial={{ scale: 0 }} 
              animate={{ scale: 1 }} 
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br from-[#2db8ff] to-[#1a8fd4] mb-4 shadow-lg shadow-[#2db8ff]/20"
            >
              <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>
            </motion.div>
            <div className="text-2xl font-bold mb-1"><span className="text-[#2db8ff]">1X</span><span className="text-white">BET</span></div>
            <p className="text-sm text-white/60">لوحة تحكم الشريك</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-white/70 mb-1.5 font-medium">رقم التعريف (ID)</label>
              <input autoFocus type="text" value={loginUserId} onChange={(e) => { setLoginUserId(e.target.value); setAuthError(""); }} placeholder="أدخل رقم التعريف الخاص بك" dir="ltr" className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-[#2db8ff]/50 focus:ring-2 focus:ring-[#2db8ff]/20 transition-all text-center tracking-widest font-mono text-lg" />
            </div>
            <div>
              <label className="block text-xs text-white/70 mb-1.5 font-medium">كود الدخول</label>
              <div className="relative">
                <input type={showCode ? "text" : "password"} value={accessCode} onChange={(e) => { setAccessCode(e.target.value); setAuthError(""); }} placeholder="أدخل كود الدخول" dir="ltr" className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 pr-10 text-sm text-white placeholder:text-white/40 outline-none focus:border-[#2db8ff]/50 focus:ring-2 focus:ring-[#2db8ff]/20 transition-all text-center tracking-wider font-mono" />
                <button type="button" onClick={() => setShowCode(!showCode)} className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 text-white/40 hover:text-white/70 transition-colors">
                  {showCode ? <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg> : <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                </button>
              </div>
            </div>
          </div>
          <AnimatePresence>
          {authError && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ type: "spring", stiffness: 300, damping: 20 }} className="mt-3 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-center text-sm text-red-400 flex items-center justify-center gap-2">
              <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
              {authError}
            </motion.div>
          )}
          </AnimatePresence>
          {clientIP && (
            <>
              <div className="mt-3 flex items-center justify-center gap-1.5 text-[10px] text-white/30">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" /></svg>
                <span dir="ltr">IP: {clientIP}</span>
              </div>
              {ipWhitelistActive && (
                <div className={`mt-1.5 flex items-center justify-center gap-1.5 text-[10px] ${ipWhitelisted ? "text-green-400/60" : "text-red-400/80"}`}>
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    {ipWhitelisted
                      ? <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      : <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    }
                  </svg>
                  <span>{ipWhitelisted ? "IP مصرح به" : "IP غير مصرح به - ممنوع الدخول"}</span>
                </div>
              )}
            </>
          )}
          <button type="submit" disabled={loginLoading} className="mt-5 w-full rounded-lg bg-gradient-to-r from-[#d4a017] to-[#e8b84d] py-3 text-sm font-bold text-[#0a1628] hover:shadow-lg hover:shadow-[#d4a017]/20 transition-all active:scale-[0.97] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {loginLoading ? <><div className="h-4 w-4 rounded-full border-2 border-[#0a1628]/30 border-t-[#0a1628] animate-spin" /><span>جاري التحقق...</span></> : "تسجيل الدخول"}
          </button>
        </motion.form>
      </div>
    );
  }

  const tabs = [
    { key: "overview", label: "نظرة عامة", icon: Icons.dashboard },
    { key: "registrations", label: "التسجيلات", icon: Icons.users },
    { key: "commissions", label: "العمولات", icon: Icons.money },
    { key: "sales", label: "فريق المبيعات", icon: Icons.team },
    { key: "activities", label: "سجل الانشطة", icon: Icons.activity },
    { key: "settings", label: "الاعدادات", icon: Icons.settings },
  ];

  const maxDaily = Math.max(...(stats?.daily.map((d) => d.count) || [1]), 1);

  return (
    <div className="min-h-screen bg-[#0a1628] text-white flex overflow-x-hidden" dir="rtl">
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`fixed lg:relative z-50 lg:z-auto top-0 right-0 h-full transition-all duration-300 border-l border-white/5 bg-[#0b1a30] flex flex-col overflow-hidden ${sidebarOpen ? "w-60 translate-x-0" : "w-0 lg:w-auto translate-x-full lg:translate-x-0"} ${!sidebarOpen ? "lg:w-[68px]" : "lg:w-60"}`}>
        {/* Sidebar header */}
        <div className="p-4 flex items-center gap-3 border-b border-white/5 min-h-[60px] flex-shrink-0">
          <span className={`text-lg font-bold whitespace-nowrap transition-opacity ${sidebarOpen ? "opacity-100" : "lg:opacity-100 opacity-0 lg:hidden"}`}>
            <span className="text-[#2db8ff]">1X</span><span>BET</span>
          </span>
          {!sidebarOpen && <span className="hidden lg:inline text-lg font-bold"><span className="text-[#2db8ff]">1X</span></span>}
          {/* Desktop toggle */}
          <button onClick={() => { setSidebarOpen(!sidebarOpen); setSidebarExpanded(!sidebarExpanded); }} className="hidden lg:block mr-auto text-white/50 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors">
            <svg className={`h-5 w-5 transition-transform ${sidebarOpen ? "" : "rotate-180"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
          </button>
          {/* Mobile close */}
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden mr-auto text-white/50 hover:text-white p-1">
            {Icons.x}
          </button>
        </div>
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {tabs.map((tab) => (
            <button key={tab.key} onClick={() => { setActiveTab(tab.key); setSidebarOpen(false); setRegPage(1); setSelectedRegs(new Set()); }}
              className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${activeTab === tab.key ? "bg-[#2db8ff]/10 text-[#2db8ff]" : "text-white/60 hover:text-white hover:bg-white/5"} ${!sidebarOpen ? "lg:justify-center lg:px-0 lg:[&>span:last-child]:hidden" : ""}`}
              title={!sidebarOpen ? tab.label : undefined}>
              <span className="flex-shrink-0">{tab.icon}</span>
              <span className="whitespace-nowrap overflow-hidden">{tab.label}</span>
            </button>
          ))}
        </nav>
        {/* Super Admin Link - only for superadmins */}
        {currentAdmin?.role === "superadmin" && (
          <div className="px-2 pt-3 mt-3 border-t border-[#d4a017]/10">
            <a href="/super-admin" className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all text-[#d4a017]/80 hover:text-[#d4a017] hover:bg-[#d4a017]/10 ${!sidebarOpen ? "lg:justify-center lg:px-0 lg:[&>span:last-child]:hidden" : ""}`}>
              <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm0 2h14v2H5v-2z" /></svg>
              {sidebarOpen && <span className="whitespace-nowrap">لوحة المشرف العام</span>}
            </a>
          </div>
        )}
        <div className="p-2 border-t border-white/5 flex-shrink-0">
          <button onClick={handleLogout} className={`w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/60 hover:text-red-400 hover:bg-red-500/5 transition-colors ${!sidebarOpen ? "lg:justify-center lg:px-0" : ""}`}>
            <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg>
            {sidebarOpen && <span className="whitespace-nowrap">تسجيل الخروج</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Session Timeout Warning Toast */}
        <AnimatePresence>
          {showSessionWarning && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-3 rounded-xl border border-yellow-500/20 bg-[#0f1f3d]/95 backdrop-blur-lg px-5 py-3 shadow-2xl shadow-black/40">
              <svg className="h-5 w-5 text-yellow-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
              <div>
                <p className="text-sm font-bold text-yellow-400">انتهاء الجلسة قريباً</p>
                <p className="text-[10px] text-white/60">ستنتهي جلستك خلال 5 دقائق. يرجى حفظ عملك.</p>
              </div>
              <button onClick={() => setShowSessionWarning(false)} className="rounded-lg bg-white/5 p-1.5 text-white/50 hover:text-white transition-colors">{Icons.x}</button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Top bar */}
        <header className="border-b border-white/5 bg-[#0b1a30]/80 backdrop-blur-md px-3 sm:px-6 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* Hamburger for mobile */}
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden rounded-lg bg-white/5 p-2 text-white/70 hover:text-white hover:bg-white/10 transition-colors">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
            </button>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">{tabs.find((t) => t.key === activeTab)?.label}</h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Current user info */}
            {currentAdmin && (
              <div className="hidden sm:flex items-center gap-2 rounded-lg bg-white/5 px-3 py-1.5">
                <div className="h-6 w-6 rounded-full bg-[#2db8ff]/20 flex items-center justify-center text-[10px] font-bold text-[#2db8ff]">{currentAdmin.username.charAt(0)}</div>
                <div className="text-xs">
                  <p className="text-white/80 font-medium leading-tight">{currentAdmin.username}</p>
                  <p className="text-white/40 text-[9px]" dir="ltr">ID: {currentAdmin.userId}</p>
                </div>
              </div>
            )}
            {/* Refresh button */}
            <button onClick={() => fetchAllData(true)} disabled={refreshing} className="rounded-lg bg-white/5 p-2 text-white/70 hover:text-white hover:bg-white/10 transition-all disabled:opacity-40" title="تحديث البيانات">
              <span className={refreshing ? "animate-spin" : ""}>{Icons.refresh}</span>
            </button>
            {/* Notifications */}
            <div className="relative">
              <button onClick={() => { setShowNotifications(!showNotifications); setNotifications((p) => p.map((n) => ({ ...n, read: true }))); }}
                className="relative rounded-lg bg-white/5 p-2 text-white/70 hover:text-white hover:bg-white/10 transition-colors">
                {Icons.bell}
                {unreadCount > 0 && <span className="absolute -top-1 -left-1 h-4 w-4 rounded-full bg-red-500 text-[9px] font-bold flex items-center justify-center">{unreadCount}</span>}
              </button>
              <AnimatePresence>
                {showNotifications && (
                  <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="absolute left-0 top-full mt-2 w-72 sm:w-80 rounded-xl border border-white/10 bg-[#0f1f3d] shadow-2xl z-50">
                    <div className="border-b border-white/5 px-4 py-3 flex justify-between items-center">
                      <h4 className="text-sm font-bold">الاشعارات</h4>
                      {notifications.length > 0 && <button onClick={() => setNotifications([])} className="text-[10px] text-white/50 hover:text-white/80 transition-colors">مسح الكل</button>}
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {notifications.length === 0 ? <p className="px-4 py-6 text-center text-xs text-white/50">لا توجد اشعارات حاليا</p> :
                        notifications.slice(0, 20).map((n) => (
                          <div key={n.id} className={`border-b border-white/5 px-4 py-2.5 ${n.read ? "" : "bg-[#2db8ff]/5"}`}>
                            <p className="text-xs text-white/70">{n.message}</p>
                            <p className="mt-0.5 text-[9px] text-white/40">{n.time}</p>
                          </div>
                        ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-6">
          {loading ? <LoadingSkeleton /> : (
            <AnimatePresence mode="wait">

              {/* ===== OVERVIEW ===== */}
              {activeTab === "overview" && stats && (
                <motion.div key="overview" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="space-y-6">
                  {/* KPI Cards */}
                  <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
                    {[
                      { label: "اجمالي التسجيلات", value: stats.overview.totalRegistrations, sub: `+${stats.overview.todayRegistrations} اليوم`, color: "text-[#2db8ff]", bg: "from-[#2db8ff]/10 to-transparent" },
                      { label: "تسجيلات الشهر", value: stats.overview.monthRegistrations, sub: `+${stats.overview.weekRegistrations} هذا الاسبوع`, color: "text-purple-400", bg: "from-purple-400/10 to-transparent" },
                      { label: "فريق المبيعات", value: stats.overview.totalSalesRefs, sub: `${stats.overview.activeSalesRefs} نشط`, color: "text-[#d4a017]", bg: "from-[#d4a017]/10 to-transparent" },
                      { label: "نسبة التحويل", value: `${stats.overview.conversionRate}%`, sub: `${stats.overview.refRegistrations} عبر مندوب`, color: "text-green-400", bg: "from-green-400/10 to-transparent" },
                    ].map((card, i) => (
                      <div key={i} className={`rounded-xl border border-white/5 bg-gradient-to-b ${card.bg} bg-[#0f1f3d] p-3 sm:p-5`}>
                        <p className="text-[10px] sm:text-xs text-white/60 mb-1">{card.label}</p>
                        <p className={`text-xl sm:text-2xl font-bold ${card.color}`}>{card.value}</p>
                        <p className="mt-1 text-[9px] sm:text-[10px] text-white/50">{card.sub}</p>
                      </div>
                    ))}
                  </div>

                  {/* Commission cards */}
                  <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
                    {[
                      { label: "اجمالي العمولات", value: `$${stats.commissions.total.toFixed(2)}`, color: "text-white" },
                      { label: "معلقة", value: `$${stats.commissions.pending.toFixed(2)}`, color: "text-orange-400" },
                      { label: "معتمدة", value: `$${stats.commissions.approved.toFixed(2)}`, color: "text-yellow-400" },
                      { label: "مدفوعة", value: `$${stats.commissions.paid.toFixed(2)}`, color: "text-emerald-400" },
                    ].map((card, i) => (
                      <div key={i} className="rounded-xl border border-white/5 bg-[#0f1f3d] p-3 sm:p-4">
                        <p className="text-[9px] sm:text-[10px] text-white/60 mb-0.5">{card.label}</p>
                        <p className={`text-base sm:text-lg font-bold ${card.color}`}>{card.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Charts row */}
                  <div className="grid gap-4 lg:grid-cols-2">
                    {/* Daily chart */}
                    <div className="rounded-xl border border-white/5 bg-[#0f1f3d] p-3 sm:p-5">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-white/90">التسجيلات اليومية</h3>
                        <div className="flex rounded-lg bg-white/5 p-0.5">
                          <button onClick={() => setDailyPeriod("7")} className={`px-2 py-1 text-[10px] rounded-md transition-colors ${dailyPeriod === "7" ? "bg-[#2db8ff]/20 text-[#2db8ff]" : "text-white/50 hover:text-white"}`}>آخر 7 أيام</button>
                          <button onClick={() => setDailyPeriod("30")} className={`px-2 py-1 text-[10px] rounded-md transition-colors ${dailyPeriod === "30" ? "bg-[#2db8ff]/20 text-[#2db8ff]" : "text-white/50 hover:text-white"}`}>آخر 30 يوم</button>
                        </div>
                      </div>
                      <div className="flex items-end gap-1 h-36">
                        {(dailyPeriod === "7" ? stats.daily.slice(-7) : stats.daily).map((day, i) => (
                          <div key={i} className="flex-1 flex flex-col items-center gap-0.5 min-w-0">
                            <span className="text-[7px] sm:text-[8px] text-white/60">{day.count || ""}</span>
                            <div className="w-full rounded-t bg-gradient-to-t from-[#2db8ff] to-[#2db8ff]/20 transition-all" style={{ height: `${Math.max((day.count / maxDaily) * 100, day.count > 0 ? 4 : 0)}%` }} />
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-1 mt-1">
                        {(dailyPeriod === "7" ? stats.daily.slice(-7) : stats.daily).map((day, i) => (
                          <div key={i} className="flex-1 text-center min-w-0"><span className="text-[6px] sm:text-[7px] text-white/30">{day.date.split(" ")[0]}</span></div>
                        ))}
                      </div>
                    </div>

                    {/* Top sales */}
                    <div className="rounded-xl border border-white/5 bg-[#0f1f3d] p-3 sm:p-5">
                      <h3 className="mb-4 text-sm font-bold text-white/90">افضل المندوبين هذا الشهر</h3>
                      {stats.salesStats.length === 0 ? <p className="text-xs text-white/50 py-8 text-center">لا يوجد مندوبو مبيعات مسجلون بعد</p> : (
                        <div className="space-y-3">
                          {stats.salesStats.slice(0, 6).map((s, i) => (
                            <div key={s.id} className="flex items-center gap-2 sm:gap-3">
                              <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold flex-shrink-0 ${i === 0 ? "bg-[#d4a017]/20 text-[#d4a017]" : i === 1 ? "bg-gray-400/20 text-gray-300" : i === 2 ? "bg-orange-500/20 text-orange-400" : "bg-white/5 text-white/60"}`}>{i + 1}</span>
                              <span className="flex-1 text-xs sm:text-sm text-white/70 truncate min-w-0">{s.name}</span>
                              <span className="text-[10px] sm:text-xs text-white/50 flex-shrink-0">{s.monthRegs}/{s.target}</span>
                              <div className="w-12 sm:w-20 h-1.5 rounded-full bg-white/5 overflow-hidden flex-shrink-0">
                                <div className="h-full rounded-full bg-[#2db8ff] transition-all" style={{ width: `${Math.min(s.progress, 100)}%` }} />
                              </div>
                              <span className="text-[10px] sm:text-xs font-bold text-[#2db8ff] w-7 sm:w-8 text-left flex-shrink-0">{s.progress}%</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Country & Source */}
                  <div className="grid gap-4 lg:grid-cols-2">
                    <div className="rounded-xl border border-white/5 bg-[#0f1f3d] p-3 sm:p-5">
                      <h3 className="mb-4 text-sm font-bold text-white/90">التسجيلات حسب الدولة</h3>
                      {stats.countryStats.length > 0 && (
                        <div className="flex items-center gap-4 mb-4">
                          {/* Donut chart */}
                          <div className="relative flex-shrink-0">
                            {(() => {
                              const totalCountryCount = stats.countryStats.reduce((sum, c) => sum + c.count, 0);
                              const countryColors = ["#2db8ff", "#d4a017", "#22c55e", "#a855f7", "#f97316", "#ef4444", "#06b6d4", "#ec4899"];
                              let currentAngle = 0;
                              const gradientStops = stats.countryStats.slice(0, 8).map((c, i) => {
                                const startAngle = currentAngle;
                                const percentage = totalCountryCount > 0 ? (c.count / totalCountryCount) * 100 : 0;
                                currentAngle += percentage;
                                return `${countryColors[i % countryColors.length]} ${startAngle}% ${currentAngle}%`;
                              }).join(", ");
                              return (
                                <div className="w-24 h-24 rounded-full relative" style={{ background: `conic-gradient(${gradientStops || "#1e293b 0% 100%"})` }}>
                                  <div className="absolute inset-[30%] rounded-full bg-[#0f1f3d]" />
                                </div>
                              );
                            })()}
                          </div>
                          {/* Legend */}
                          <div className="flex-1 min-w-0 space-y-1">
                            {stats.countryStats.slice(0, 4).map((c, i) => {
                              const totalCountryCount = stats.countryStats.reduce((sum, cc) => sum + cc.count, 0);
                              const countryColors = ["#2db8ff", "#d4a017", "#22c55e", "#a855f7", "#f97316", "#ef4444", "#06b6d4", "#ec4899"];
                              const pct = totalCountryCount > 0 ? ((c.count / totalCountryCount) * 100).toFixed(1) : "0";
                              return (
                                <div key={c.country} className="flex items-center gap-1.5 text-[10px]">
                                  <div className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: countryColors[i % countryColors.length] }} />
                                  <span className="text-white/60 truncate flex-1">{c.country}</span>
                                  <span className="text-white/80 font-bold">{pct}%</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      <div className="space-y-2.5">
                        {stats.countryStats.map((c) => {
                          const totalCountryCount = stats.overview.totalRegistrations;
                          const pct = totalCountryCount > 0 ? ((c.count / totalCountryCount) * 100).toFixed(1) : "0";
                          return (
                            <div key={c.country} className="flex items-center gap-2">
                              <span className="flex-1 text-xs text-white/70 min-w-0 truncate">{c.country}</span>
                              <span className="text-xs font-bold text-[#2db8ff] flex-shrink-0">{c.count}</span>
                              <span className="text-[10px] text-white/40 flex-shrink-0 w-10 text-left">{pct}%</span>
                              <div className="w-16 h-1.5 rounded-full bg-white/5 flex-shrink-0"><div className="h-full rounded-full bg-green-400/60" style={{ width: `${(c.count / stats.overview.totalRegistrations) * 100}%` }} /></div>
                            </div>
                          );
                        })}
                        {stats.countryStats.length === 0 && <p className="text-xs text-white/50 text-center py-4">لا توجد بيانات متاحة</p>}
                      </div>
                    </div>
                    <div className="rounded-xl border border-white/5 bg-[#0f1f3d] p-3 sm:p-5">
                      <h3 className="mb-4 text-sm font-bold text-white/90">التسجيلات حسب المصدر</h3>
                      <div className="space-y-2.5">
                        {stats.sourceStats.map((s) => {
                          const totalSourceCount = stats.overview.totalRegistrations;
                          const pct = totalSourceCount > 0 ? ((s.count / totalSourceCount) * 100).toFixed(1) : "0";
                          return (
                            <div key={s.source} className="flex items-center gap-2">
                              <span className="flex-1 text-xs text-white/70 min-w-0 truncate">{s.source}</span>
                              <span className="text-xs font-bold text-purple-400 flex-shrink-0">{s.count}</span>
                              <span className="text-[10px] text-white/40 flex-shrink-0 w-10 text-left">{pct}%</span>
                              <div className="w-16 h-1.5 rounded-full bg-white/5 flex-shrink-0"><div className="h-full rounded-full bg-purple-400/60" style={{ width: `${(s.count / stats.overview.totalRegistrations) * 100}%` }} /></div>
                            </div>
                          );
                        })}
                        {stats.sourceStats.length === 0 && <p className="text-xs text-white/50 text-center py-4">لا توجد بيانات متاحة</p>}
                      </div>
                    </div>
                  </div>

                  {/* Recent registrations */}
                  <div className="rounded-xl border border-white/5 bg-[#0f1f3d] p-3 sm:p-5">
                    <h3 className="mb-4 text-sm font-bold text-white/90">احدث التسجيلات</h3>
                    <div className="space-y-2">
                      {stats.recentRegs.map((r) => (
                        <div key={r.id} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                          <div className="h-8 w-8 rounded-full bg-[#2db8ff]/10 flex items-center justify-center text-[#2db8ff] text-xs font-bold flex-shrink-0">{r.name.charAt(0)}</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white/80 truncate">{r.name}</p>
                            <p className="text-[10px] text-white/50">{r.country} — {new Date(r.createdAt).toLocaleDateString("ar-EG")}</p>
                          </div>
                          {r.salesRef && <span className="text-[10px] text-[#d4a017] flex-shrink-0">{r.salesRef.name}</span>}
                        </div>
                      ))}
                      {stats.recentRegs.length === 0 && <p className="text-xs text-white/50 text-center py-4">لا توجد تسجيلات حاليا</p>}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ===== REGISTRATIONS ===== */}
              {activeTab === "registrations" && (
                <motion.div key="regs" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="space-y-4">
                  {/* Toolbar */}
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                      <input value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setRegPage(1); }} placeholder="بحث بالاسم او البريد او الهاتف..." className="flex-1 min-w-0 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 outline-none focus:border-[#2db8ff]/50 transition-colors" />
                      <div className="flex gap-2">
                        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setRegPage(1); }} className="rounded-lg border border-white/10 bg-[#0f1f3d] px-3 py-2 text-sm text-white/70 outline-none min-w-0">
                          <option value="all">جميع الحالات</option>
                          <option value="new">جديد</option>
                          <option value="contacted">تم التواصل</option>
                          <option value="active">نشط</option>
                          <option value="inactive">غير نشط</option>
                        </select>
                        <select value={dateFilter} onChange={(e) => { setDateFilter(e.target.value); setRegPage(1); }} className="rounded-lg border border-white/10 bg-[#0f1f3d] px-3 py-2 text-sm text-white/70 outline-none min-w-0">
                          <option value="all">كل الاوقات</option>
                          <option value="today">اليوم</option>
                          <option value="week">هذا الاسبوع</option>
                          <option value="month">هذا الشهر</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-white/50">{filteredRegs.length} من {registrations.length} تسجيل</p>
                      <button onClick={() => exportCSV("registrations")} disabled={filteredRegs.length === 0} className="flex items-center gap-1.5 rounded-lg bg-green-500/10 px-3 py-2 text-xs font-medium text-green-400 hover:bg-green-500/20 disabled:opacity-30 transition-colors">
                        {Icons.download} تصدير CSV
                      </button>
                    </div>
                  </div>

                  {filteredRegs.length === 0 ? (
                    <div className="rounded-xl border border-white/5 bg-[#0f1f3d] p-12 text-center">
                      <svg className="mx-auto h-12 w-12 text-white/10 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
                      <p className="text-white/50 text-sm">لا توجد نتائج مطابقة</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {/* Desktop table */}
                      <div className="hidden lg:block rounded-xl border border-white/5 bg-[#0f1f3d] overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm min-w-[700px]">
                            <thead>
                              <tr className="border-b border-white/5 text-white/50 text-xs">
                                <th className="px-4 py-3 text-right font-medium w-10">
                                  <input type="checkbox" checked={selectedRegs.size === paginatedRegs.length && paginatedRegs.length > 0} onChange={toggleSelectAll} className="accent-[#2db8ff] h-3.5 w-3.5 rounded" />
                                </th>
                                <th className="px-4 py-3 text-right font-medium">الاسم</th>
                                <th className="px-4 py-3 text-right font-medium">البريد</th>
                                <th className="px-4 py-3 text-right font-medium">الهاتف</th>
                                <th className="px-4 py-3 text-right font-medium">الدولة</th>
                                <th className="px-4 py-3 text-right font-medium">الرمز الترويجي</th>
                                <th className="px-4 py-3 text-right font-medium">المصدر</th>
                                <th className="px-4 py-3 text-right font-medium">المندوب</th>
                                <th className="px-4 py-3 text-right font-medium">الحالة</th>
                                <th className="px-4 py-3 text-right font-medium">التاريخ</th>
                                <th className="px-4 py-3 text-right font-medium">اجراءات</th>
                              </tr>
                            </thead>
                            <tbody>
                              {paginatedRegs.map((reg) => (
                                <tr key={reg.id} className={`border-b border-white/5 hover:bg-white/[0.02] transition-colors ${selectedRegs.has(reg.id) ? "bg-[#2db8ff]/5" : ""}`}>
                                  <td className="px-4 py-3">
                                    <input type="checkbox" checked={selectedRegs.has(reg.id)} onChange={() => toggleSelectReg(reg.id)} className="accent-[#2db8ff] h-3.5 w-3.5 rounded" />
                                  </td>
                                  <td className="px-4 py-3 text-white/80 font-medium cursor-pointer hover:text-[#2db8ff] transition-colors" onClick={() => setViewReg(reg)}>{reg.name}</td>
                                  <td className="px-4 py-3 text-white/60 text-xs break-all max-w-[180px]">{reg.email}</td>
                                  <td className="px-4 py-3 text-white/60 text-xs" dir="ltr">{reg.phone}</td>
                                  <td className="px-4 py-3 text-white/60 text-xs">{reg.country}</td>
                                  <td className="px-4 py-3 font-mono text-[#2db8ff] text-xs">{reg.promoCode}</td>
                                  <td className="px-4 py-3 text-white/60 text-xs">{reg.trafficSource}</td>
                                  <td className="px-4 py-3 text-xs">{reg.salesRef?.name ? <span className="text-[#d4a017]">{reg.salesRef.name}</span> : <span className="text-white/30">—</span>}</td>
                                  <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium border ${statusColors[reg.status] || "bg-white/5 text-white/50 border-white/10"}`}>{statusLabels[reg.status] || reg.status}</span></td>
                                  <td className="px-4 py-3 text-white/50 text-[10px]" dir="ltr">{new Date(reg.createdAt).toLocaleDateString("ar-EG")}</td>
                                  <td className="px-4 py-3">
                                    <div className="flex items-center gap-1">
                                      <button onClick={() => setEditingReg(reg)} className="rounded-lg p-1.5 text-white/50 hover:text-[#2db8ff] hover:bg-[#2db8ff]/10 transition-colors" title="تعديل">
                                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" /></svg>
                                      </button>
                                      <button onClick={() => setDeleteConfirm(reg.id)} className="rounded-lg p-1.5 text-white/50 hover:text-red-400 hover:bg-red-500/10 transition-colors" title="حذف">
                                        {Icons.trash}
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Mobile & Tablet cards */}
                      <div className="lg:hidden space-y-2">
                        {paginatedRegs.map((reg) => (
                          <div key={reg.id} className={`rounded-xl border border-white/5 bg-[#0f1f3d] p-4 ${selectedRegs.has(reg.id) ? "ring-1 ring-[#2db8ff]/30 bg-[#2db8ff]/5" : ""}`}>
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2 min-w-0">
                                <input type="checkbox" checked={selectedRegs.has(reg.id)} onChange={() => toggleSelectReg(reg.id)} className="accent-[#2db8ff] h-3.5 w-3.5 rounded flex-shrink-0" />
                                <div className="h-9 w-9 rounded-full bg-[#2db8ff]/10 flex items-center justify-center text-[#2db8ff] text-sm font-bold flex-shrink-0">{reg.name.charAt(0)}</div>
                                <div className="min-w-0 cursor-pointer" onClick={() => setViewReg(reg)}>
                                  <p className="text-sm font-medium text-white/90 truncate hover:text-[#2db8ff] transition-colors">{reg.name}</p>
                                  <p className="text-[10px] text-white/40 truncate">{reg.email}</p>
                                </div>
                              </div>
                              <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium border flex-shrink-0 ${statusColors[reg.status] || "bg-white/5 text-white/50 border-white/10"}`}>{statusLabels[reg.status] || reg.status}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px] text-white/60">
                              <div className="flex items-center gap-1"><span className="text-white/40">الهاتف:</span> <span dir="ltr">{reg.phone}</span></div>
                              <div className="flex items-center gap-1"><span className="text-white/40">الدولة:</span> {reg.country}</div>
                              <div className="flex items-center gap-1"><span className="text-white/40">الرمز:</span> <span className="font-mono text-[#2db8ff]">{reg.promoCode}</span></div>
                              <div className="flex items-center gap-1"><span className="text-white/40">المصدر:</span> {reg.trafficSource}</div>
                              <div className="flex items-center gap-1"><span className="text-white/40">المندوب:</span> {reg.salesRef?.name ? <span className="text-[#d4a017]">{reg.salesRef.name}</span> : "—"}</div>
                              <div className="flex items-center gap-1"><span className="text-white/40">التاريخ:</span> <span dir="ltr">{new Date(reg.createdAt).toLocaleDateString("ar-EG")}</span></div>
                            </div>
                            <div className="mt-3 pt-2 border-t border-white/5 flex gap-2 justify-end">
                              <button onClick={() => setEditingReg(reg)} className="flex items-center gap-1 rounded-lg bg-[#2db8ff]/10 px-3 py-1.5 text-[10px] font-medium text-[#2db8ff] hover:bg-[#2db8ff]/20 transition-colors">
                                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" /></svg>
                                تعديل
                              </button>
                              <button onClick={() => setDeleteConfirm(reg.id)} className="flex items-center gap-1 rounded-lg bg-red-500/10 px-3 py-1.5 text-[10px] font-medium text-red-400 hover:bg-red-500/20 transition-colors">
                                {Icons.trash}
                                حذف
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-1 pt-2">
                      <button onClick={() => setRegPage((p) => Math.max(1, p - 1))} disabled={regPage === 1} className="rounded-lg bg-white/5 px-3 py-1.5 text-xs text-white/60 hover:bg-white/10 disabled:opacity-30 transition-colors">السابق</button>
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        const page = regPage <= 3 ? i + 1 : regPage >= totalPages - 2 ? totalPages - 4 + i : regPage - 2 + i;
                        if (page < 1 || page > totalPages) return null;
                        return (
                          <button key={page} onClick={() => setRegPage(page)} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${regPage === page ? "bg-[#2db8ff] text-white" : "bg-white/5 text-white/60 hover:bg-white/10"}`}>{page}</button>
                        );
                      })}
                      <button onClick={() => setRegPage((p) => Math.min(totalPages, p + 1))} disabled={regPage === totalPages} className="rounded-lg bg-white/5 px-3 py-1.5 text-xs text-white/60 hover:bg-white/10 disabled:opacity-30 transition-colors">التالي</button>
                    </div>
                  )}

                  {/* Delete Confirmation Modal */}
                  <AnimatePresence>
                    {deleteConfirm && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setDeleteConfirm(null)}>
                        <motion.div initial={{ opacity: 0, y: 40, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }} transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }} className="w-full max-w-sm rounded-2xl border border-red-500/20 bg-[#0f1f3d] p-6" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-3 mb-4">
                            <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
                              <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
                            </div>
                            <div>
                              <h3 className="text-base font-bold text-red-400">تأكيد الحذف</h3>
                              <p className="text-xs text-white/60 mt-0.5">هذا الاجراء لا يمكن التراجع عنه</p>
                            </div>
                          </div>
                          <p className="text-sm text-white/70 mb-4">هل أنت متأكد من حذف هذا التسجيل نهائيا؟</p>
                          <div className="flex gap-2">
                            <button onClick={() => { const reg = registrations.find(r => r.id === deleteConfirm); if (reg) handleDeleteReg(deleteConfirm, reg.name); }} className="flex-1 rounded-lg bg-red-500/20 border border-red-500/30 py-2 text-sm font-bold text-red-400 hover:bg-red-500/30 transition-colors">نعم، حذف</button>
                            <button onClick={() => setDeleteConfirm(null)} className="flex-1 rounded-lg bg-white/5 py-2 text-sm text-white/70 hover:text-white transition-colors">الغاء</button>
                          </div>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Edit Registration Modal */}
                  <AnimatePresence>
                    {editingReg && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setEditingReg(null)}>
                        <motion.div initial={{ opacity: 0, y: 40, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }} transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }} className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0f1f3d] p-6" onClick={(e) => e.stopPropagation()}>
                          <h3 className="text-lg font-bold mb-4">تعديل تسجيل: {editingReg.name}</h3>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-xs text-white/60 mb-1 font-medium">الحالة</label>
                              <select id="reg-status" defaultValue={editingReg.status} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-[#2db8ff]/50 transition-colors">
                                <option value="new">جديد</option>
                                <option value="contacted">تم التواصل</option>
                                <option value="active">نشط</option>
                                <option value="inactive">غير نشط</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs text-white/60 mb-1 font-medium">ملاحظات</label>
                              <textarea id="reg-notes" defaultValue={editingReg.notes || ""} rows={3} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#2db8ff]/50 transition-colors resize-none" placeholder="اضف ملاحظة..." />
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => {
                                const status = (document.getElementById("reg-status") as HTMLSelectElement).value;
                                const notes = (document.getElementById("reg-notes") as HTMLTextAreaElement).value;
                                handleUpdateReg(editingReg.id, { status, notes });
                              }} className="flex-1 rounded-lg bg-[#2db8ff] py-2.5 text-sm font-bold text-white hover:bg-[#2db8ff]/80 transition-colors">حفظ التعديلات</button>
                              <button onClick={() => setEditingReg(null)} className="rounded-lg bg-white/5 px-5 py-2.5 text-sm text-white/60 hover:text-white transition-colors">الغاء</button>
                            </div>
                          </div>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Bulk Action Floating Bar */}
                  <AnimatePresence>
                    {selectedRegs.size > 0 && (
                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 rounded-2xl border border-[#2db8ff]/20 bg-[#0f1f3d]/95 backdrop-blur-lg px-5 py-3 shadow-2xl shadow-black/40">
                        <span className="text-sm font-bold text-[#2db8ff]">{selectedRegs.size} محدد</span>
                        <div className="h-6 w-px bg-white/10" />
                        <select value={bulkAction} onChange={(e) => { setBulkAction(e.target.value); if (e.target.value && e.target.value !== "delete") handleBulkStatus(e.target.value); }} className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white outline-none focus:border-[#2db8ff]/30 min-w-[120px]">
                          <option value="">تغيير الحالة</option>
                          <option value="new">جديد</option>
                          <option value="contacted">تم التواصل</option>
                          <option value="active">نشط</option>
                          <option value="inactive">غير نشط</option>
                        </select>
                        <button onClick={handleBulkDelete} className="flex items-center gap-1.5 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/20 transition-colors">
                          {Icons.trash} حذف المحدد
                        </button>
                        <button onClick={() => setSelectedRegs(new Set())} className="rounded-lg bg-white/5 p-1.5 text-white/50 hover:text-white transition-colors">
                          {Icons.x}
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Registration Detail Modal */}
                  <AnimatePresence>
                    {viewReg && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setViewReg(null)}>
                        <motion.div initial={{ opacity: 0, y: 40, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }} transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }} className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#0f1f3d] p-6" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-between mb-5">
                            <h3 className="text-lg font-bold text-white">تفاصيل التسجيل</h3>
                            <button onClick={() => setViewReg(null)} className="rounded-lg bg-white/5 p-1.5 text-white/50 hover:text-white transition-colors">{Icons.x}</button>
                          </div>

                          {/* Main Info */}
                          <div className="flex items-center gap-3 mb-5">
                            <div className="h-12 w-12 rounded-full bg-[#2db8ff]/10 flex items-center justify-center text-[#2db8ff] text-lg font-bold">{viewReg.name.charAt(0)}</div>
                            <div>
                              <p className="text-base font-bold text-white">{viewReg.name}</p>
                              <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium border ${statusColors[viewReg.status] || "bg-white/5 text-white/50 border-white/10"}`}>{statusLabels[viewReg.status] || viewReg.status}</span>
                            </div>
                          </div>

                          {/* Details Grid */}
                          <div className="grid grid-cols-2 gap-3 mb-5">
                            <div className="rounded-lg bg-white/[0.03] p-3">
                              <p className="text-[9px] text-white/40 mb-0.5">البريد الإلكتروني</p>
                              <p className="text-xs text-white/80 break-all">{viewReg.email}</p>
                            </div>
                            <div className="rounded-lg bg-white/[0.03] p-3">
                              <p className="text-[9px] text-white/40 mb-0.5">الهاتف</p>
                              <p className="text-xs text-white/80" dir="ltr">{viewReg.phone}</p>
                            </div>
                            <div className="rounded-lg bg-white/[0.03] p-3">
                              <p className="text-[9px] text-white/40 mb-0.5">الدولة</p>
                              <p className="text-xs text-white/80">{viewReg.country}</p>
                            </div>
                            <div className="rounded-lg bg-white/[0.03] p-3">
                              <p className="text-[9px] text-white/40 mb-0.5">الرمز الترويجي</p>
                              <p className="text-xs text-[#2db8ff] font-mono">{viewReg.promoCode}</p>
                            </div>
                            <div className="rounded-lg bg-white/[0.03] p-3">
                              <p className="text-[9px] text-white/40 mb-0.5">المصدر</p>
                              <p className="text-xs text-white/80">{viewReg.trafficSource}</p>
                            </div>
                            <div className="rounded-lg bg-white/[0.03] p-3">
                              <p className="text-[9px] text-white/40 mb-0.5">المندوب</p>
                              <p className="text-xs text-[#d4a017]">{viewReg.salesRef?.name || viewReg.refCode || "—"}</p>
                            </div>
                            <div className="rounded-lg bg-white/[0.03] p-3">
                              <p className="text-[9px] text-white/40 mb-0.5">وصف القناة</p>
                              <p className="text-xs text-white/80">{viewReg.channelDesc || "—"}</p>
                            </div>
                            <div className="rounded-lg bg-white/[0.03] p-3">
                              <p className="text-[9px] text-white/40 mb-0.5">تاريخ التسجيل</p>
                              <p className="text-xs text-white/80" dir="ltr">{new Date(viewReg.createdAt).toLocaleString("ar-EG")}</p>
                            </div>
                          </div>

                          {/* Notes */}
                          {viewReg.notes && (
                            <div className="rounded-lg bg-white/[0.03] p-3 mb-5">
                              <p className="text-[9px] text-white/40 mb-1">ملاحظات</p>
                              <p className="text-xs text-white/70 whitespace-pre-wrap">{viewReg.notes}</p>
                            </div>
                          )}

                          {/* Commission History */}
                          <div className="mb-5">
                            <h4 className="text-sm font-bold text-white/80 mb-2">سجل العمولات</h4>
                            {viewReg.commissions && viewReg.commissions.length > 0 ? (
                              <div className="space-y-2">
                                {viewReg.commissions.map((comm) => (
                                  <div key={comm.id} className="flex items-center justify-between rounded-lg bg-white/[0.03] px-3 py-2">
                                    <div>
                                      <span className="text-xs font-bold text-[#2db8ff]">${comm.amount.toFixed(2)}</span>
                                      <span className="text-[10px] text-white/40 mx-2">{comm.currency}</span>
                                      <span className="text-[10px] text-white/40" dir="ltr">{comm.month}</span>
                                    </div>
                                    <span className={`rounded-full px-2 py-0.5 text-[9px] font-medium border ${statusColors[comm.status] || "bg-white/5 text-white/50 border-white/10"}`}>{statusLabels[comm.status] || comm.status}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-white/40 text-center py-3">لا توجد عمولات</p>
                            )}
                          </div>

                          {/* Quick Actions */}
                          <div className="flex gap-2 pt-3 border-t border-white/5">
                            <select id="detail-reg-status" defaultValue={viewReg.status} className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none focus:border-[#2db8ff]/30">
                              <option value="new">جديد</option>
                              <option value="contacted">تم التواصل</option>
                              <option value="active">نشط</option>
                              <option value="inactive">غير نشط</option>
                            </select>
                            <button onClick={() => {
                              const status = (document.getElementById("detail-reg-status") as HTMLSelectElement).value;
                              handleUpdateReg(viewReg.id, { status });
                              setViewReg({ ...viewReg, status });
                            }} className="rounded-lg bg-[#2db8ff] px-4 py-2 text-xs font-bold text-white hover:bg-[#2db8ff]/80 transition-colors">تحديث الحالة</button>
                            <button onClick={() => { setEditingReg(viewReg); setViewReg(null); }} className="rounded-lg bg-white/5 px-4 py-2 text-xs text-white/70 hover:text-white transition-colors">تعديل</button>
                          </div>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}

              {/* ===== COMMISSIONS ===== */}
              {activeTab === "commissions" && (
                <motion.div key="commissions" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="space-y-4">
                  {/* Summary cards */}
                  <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
                    {[
                      { label: "اجمالي العمولات", value: `$${commissionSummary.total.toFixed(2)}`, color: "text-white" },
                      { label: "معلقة", value: `$${commissionSummary.pending.toFixed(2)}`, color: "text-orange-400" },
                      { label: "معتمدة", value: `$${commissionSummary.approved.toFixed(2)}`, color: "text-yellow-400" },
                      { label: "مدفوعة", value: `$${commissionSummary.paid.toFixed(2)}`, color: "text-emerald-400" },
                    ].map((c, i) => (
                      <div key={i} className="rounded-xl border border-white/5 bg-[#0f1f3d] p-4">
                        <p className="text-[10px] text-white/60 mb-0.5">{c.label}</p>
                        <p className={`text-xl font-bold ${c.color}`}>{c.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-white/50">{commissions.length} عمولة</p>
                    <div className="flex gap-2">
                      <button onClick={() => setShowAddCommission(!showAddCommission)} className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#d4a017] to-[#e8b84d] px-3 py-2 text-xs font-bold text-[#0a1628] hover:shadow-lg hover:shadow-[#d4a017]/20 transition-all">
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                        انشاء عمولة
                      </button>
                      <button onClick={() => exportCSV("commissions")} disabled={commissions.length === 0} className="flex items-center gap-1.5 rounded-lg bg-green-500/10 px-3 py-2 text-xs font-medium text-green-400 hover:bg-green-500/20 disabled:opacity-30 transition-colors">
                        {Icons.download} تصدير CSV
                      </button>
                    </div>
                  </div>

                  {/* Add Commission Form */}
                  <AnimatePresence>
                    {showAddCommission && (
                      <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} onSubmit={handleCreateCommission} className="overflow-hidden rounded-xl border border-[#d4a017]/20 bg-[#0f1f3d] p-6">
                        <h3 className="text-sm font-bold text-[#d4a017] mb-4">انشاء عمولة جديدة</h3>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          <div>
                            <label className="mb-1 block text-xs text-white/60 font-medium">المندوب *</label>
                            <select value={newCommission.salesRefId} onChange={(e) => setNewCommission((p) => ({ ...p, salesRefId: e.target.value }))} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[#2db8ff]/50 transition-colors" required>
                              <option value="">اختر المندوب</option>
                              {salesRefs.map((ref) => <option key={ref.id} value={ref.id}>{ref.name} (@{ref.code})</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="mb-1 block text-xs text-white/60 font-medium">التسجيل *</label>
                            <select value={newCommission.registrationId} onChange={(e) => setNewCommission((p) => ({ ...p, registrationId: e.target.value }))} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[#2db8ff]/50 transition-colors" required>
                              <option value="">اختر التسجيل</option>
                              {registrations.slice(0, 50).map((reg) => <option key={reg.id} value={reg.id}>{reg.name} ({reg.promoCode})</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="mb-1 block text-xs text-white/60 font-medium">المبلغ (USD) *</label>
                            <input type="number" step="0.01" value={newCommission.amount} onChange={(e) => setNewCommission((p) => ({ ...p, amount: e.target.value }))} placeholder="5.00" className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#2db8ff]/50 transition-colors" required />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs text-white/60 font-medium">العملة</label>
                            <select value={newCommission.currency} onChange={(e) => setNewCommission((p) => ({ ...p, currency: e.target.value }))} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[#2db8ff]/50 transition-colors">
                              <option value="USD">USD</option>
                              <option value="EUR">EUR</option>
                              <option value="SAR">SAR</option>
                              <option value="AED">AED</option>
                            </select>
                          </div>
                          <div>
                            <label className="mb-1 block text-xs text-white/60 font-medium">الشهر *</label>
                            <input type="month" value={newCommission.month} onChange={(e) => setNewCommission((p) => ({ ...p, month: e.target.value }))} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[#2db8ff]/50 transition-colors" required />
                          </div>
                        </div>
                        <div className="mt-4 flex gap-2">
                          <button type="submit" className="rounded-lg bg-[#2db8ff] px-5 py-2 text-sm font-bold text-white hover:bg-[#2db8ff]/80 transition-colors">انشاء العمولة</button>
                          <button type="button" onClick={() => setShowAddCommission(false)} className="rounded-lg bg-white/5 px-5 py-2 text-sm text-white/60 hover:text-white transition-colors">الغاء</button>
                        </div>
                      </motion.form>
                    )}
                  </AnimatePresence>
                  {commissions.length === 0 ? (
                    <div className="rounded-xl border border-white/5 bg-[#0f1f3d] p-12 text-center">
                      <svg className="mx-auto h-12 w-12 text-white/10 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <p className="text-white/50 text-sm">لا توجد عمولات مسجلة بعد</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {/* Desktop table */}
                      <div className="hidden lg:block rounded-xl border border-white/5 bg-[#0f1f3d] overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm min-w-[500px]">
                            <thead>
                              <tr className="border-b border-white/5 text-white/50 text-xs">
                                <th className="px-4 py-3 text-right font-medium">المندوب</th>
                                <th className="px-4 py-3 text-right font-medium">العميل</th>
                                <th className="px-4 py-3 text-right font-medium">المبلغ</th>
                                <th className="px-4 py-3 text-right font-medium">الشهر</th>
                                <th className="px-4 py-3 text-right font-medium">الحالة</th>
                                <th className="px-4 py-3 text-right font-medium">اجراءات</th>
                              </tr>
                            </thead>
                            <tbody>
                              {commissions.map((c) => (
                                <tr key={c.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                  <td className="px-4 py-3 text-white/70">{c.salesRef.name}</td>
                                  <td className="px-4 py-3 text-white/80">{c.registration.name}</td>
                                  <td className="px-4 py-3 font-bold text-[#2db8ff]">${c.amount.toFixed(2)}</td>
                                  <td className="px-4 py-3 text-white/50 text-xs" dir="ltr">{c.month}</td>
                                  <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium border ${statusColors[c.status]}`}>{statusLabels[c.status] || c.status}</span></td>
                                  <td className="px-4 py-3">
                                    {c.status === "pending" && (
                                      <button onClick={() => handleCommissionStatus(c.id, "approved")} className="text-[10px] text-yellow-400 hover:text-yellow-300 rounded-lg bg-yellow-500/10 px-2.5 py-1 transition-colors">اعتماد</button>
                                    )}
                                    {c.status === "approved" && (
                                      <button onClick={() => handleCommissionStatus(c.id, "paid")} className="text-[10px] text-emerald-400 hover:text-emerald-300 rounded-lg bg-emerald-500/10 px-2.5 py-1 transition-colors">دفع</button>
                                    )}
                                    {c.status === "paid" && <span className="text-[10px] text-white/30">تم الدفع</span>}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Mobile cards */}
                      <div className="lg:hidden space-y-2">
                        {commissions.map((c) => (
                          <div key={c.id} className="rounded-xl border border-white/5 bg-[#0f1f3d] p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-white/90 truncate">{c.salesRef.name}</p>
                                <p className="text-[10px] text-white/40">العميل: {c.registration.name}</p>
                              </div>
                              <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium border flex-shrink-0 ${statusColors[c.status]}`}>{statusLabels[c.status] || c.status}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="text-[11px] text-white/60">
                                <span className="text-white/40">المبلغ:</span> <span className="font-bold text-[#2db8ff]">${c.amount.toFixed(2)}</span>
                                <span className="mx-2 text-white/20">|</span>
                                <span dir="ltr">{c.month}</span>
                              </div>
                              <div>
                                {c.status === "pending" && (
                                  <button onClick={() => handleCommissionStatus(c.id, "approved")} className="text-[10px] text-yellow-400 hover:text-yellow-300 rounded-lg bg-yellow-500/10 px-2.5 py-1 transition-colors">اعتماد</button>
                                )}
                                {c.status === "approved" && (
                                  <button onClick={() => handleCommissionStatus(c.id, "paid")} className="text-[10px] text-emerald-400 hover:text-emerald-300 rounded-lg bg-emerald-500/10 px-2.5 py-1 transition-colors">دفع</button>
                                )}
                                {c.status === "paid" && <span className="text-[10px] text-white/30">تم الدفع</span>}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* ===== SALES TEAM ===== */}
              {activeTab === "sales" && (
                <motion.div key="sales" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-white/50">{salesRefs.length} مندوب</p>
                    <button onClick={() => setShowAddRef(!showAddRef)} className="rounded-lg bg-gradient-to-r from-[#d4a017] to-[#e8b84d] px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold text-[#0a1628] hover:shadow-lg hover:shadow-[#d4a017]/20 transition-all active:scale-[0.98]">+ اضافة مندوب جديد</button>
                  </div>

                  {/* Add ref form */}
                  <AnimatePresence>
                    {showAddRef && (
                      <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} onSubmit={handleAddRef} className="overflow-hidden rounded-xl border border-[#d4a017]/20 bg-[#0f1f3d] p-6">
                        <h3 className="text-sm font-bold text-[#d4a017] mb-4">اضافة مندوب مبيعات جديد</h3>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          <div><label className="mb-1 block text-xs text-white/60 font-medium">الكود *</label><input value={newRef.code} onChange={(e) => setNewRef((p) => ({ ...p, code: e.target.value.replace(/\s/g, "").toLowerCase() }))} placeholder="ahmed" className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#2db8ff]/50 transition-colors" required /></div>
                          <div><label className="mb-1 block text-xs text-white/60 font-medium">الاسم *</label><input value={newRef.name} onChange={(e) => setNewRef((p) => ({ ...p, name: e.target.value }))} placeholder="احمد محمد" className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#2db8ff]/50 transition-colors" required /></div>
                          <div><label className="mb-1 block text-xs text-white/60 font-medium">البريد الالكتروني</label><input type="email" value={newRef.email} onChange={(e) => setNewRef((p) => ({ ...p, email: e.target.value }))} placeholder="email@example.com" className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#2db8ff]/50 transition-colors" /></div>
                          <div><label className="mb-1 block text-xs text-white/60 font-medium">رقم الهاتف</label><input value={newRef.phone} onChange={(e) => setNewRef((p) => ({ ...p, phone: e.target.value }))} placeholder="+20 xxx" className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#2db8ff]/50 transition-colors" /></div>
                          <div><label className="mb-1 block text-xs text-white/60 font-medium">الهدف الشهري</label><input type="number" value={newRef.target} onChange={(e) => setNewRef((p) => ({ ...p, target: e.target.value }))} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[#2db8ff]/50 transition-colors" /></div>
                        </div>
                        <div className="mt-4 flex gap-2">
                          <button type="submit" className="rounded-lg bg-[#2db8ff] px-5 py-2 text-sm font-bold text-white hover:bg-[#2db8ff]/80 transition-colors">اضافة المندوب</button>
                          <button type="button" onClick={() => setShowAddRef(false)} className="rounded-lg bg-white/5 px-5 py-2 text-sm text-white/60 hover:text-white transition-colors">الغاء</button>
                        </div>
                      </motion.form>
                    )}
                  </AnimatePresence>

                  {salesRefs.length === 0 ? (
                    <div className="rounded-xl border border-white/5 bg-[#0f1f3d] p-12 text-center">
                      <svg className="mx-auto h-12 w-12 text-white/10 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477" /></svg>
                      <p className="text-white/50 text-sm">لا يوجد مندوبو مبيعات مسجلون بعد</p>
                    </div>
                  ) : (
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
                      {salesRefs.map((ref) => {
                        const salesData = stats?.salesStats.find((s) => s.id === ref.id);
                        return (
                          <div key={ref.id} className={`rounded-xl border bg-[#0f1f3d] p-5 transition-all ${ref.isActive ? "border-white/5" : "border-red-500/10 opacity-60"}`}>
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="h-9 w-9 rounded-full bg-[#2db8ff]/10 flex items-center justify-center text-[#2db8ff] font-bold text-sm flex-shrink-0">{ref.name.charAt(0)}</div>
                                <div className="min-w-0">
                                  <h4 className="font-bold text-white text-sm truncate">{ref.name}</h4>
                                  <p className="text-[10px] text-white/40">@{ref.code}</p>
                                </div>
                              </div>
                              <span className={`rounded-full px-2 py-0.5 text-[9px] font-medium border flex-shrink-0 ${ref.isActive ? "bg-green-500/15 text-green-400 border-green-500/20" : "bg-red-500/15 text-red-400 border-red-500/20"}`}>{ref.isActive ? "نشط" : "متوقف"}</span>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-2 mb-3">
                              <div className="rounded-lg bg-white/[0.02] p-2 text-center">
                                <p className="text-[9px] text-white/50">تسجيلات</p>
                                <p className="text-sm font-bold text-[#2db8ff]">{ref._count.registrations}</p>
                              </div>
                              <div className="rounded-lg bg-white/[0.02] p-2 text-center">
                                <p className="text-[9px] text-white/50">الشهر</p>
                                <p className="text-sm font-bold text-purple-400">{salesData?.monthRegs || 0}</p>
                              </div>
                              <div className="rounded-lg bg-white/[0.02] p-2 text-center">
                                <p className="text-[9px] text-white/50">عمولات</p>
                                <p className="text-sm font-bold text-[#d4a017]">${salesData?.totalCommissions.toFixed(0) || 0}</p>
                              </div>
                            </div>

                            {/* Progress */}
                            {salesData && (
                              <div className="mb-3">
                                <div className="flex justify-between text-[10px] text-white/50 mb-1">
                                  <span>تقدم الهدف</span>
                                  <span>{salesData.monthRegs}/{salesData.target}</span>
                                </div>
                                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                                  <div className={`h-full rounded-full transition-all ${salesData.progress >= 100 ? "bg-green-400" : "bg-[#2db8ff]"}`} style={{ width: `${Math.min(salesData.progress, 100)}%` }} />
                                </div>
                              </div>
                            )}

                            {/* Contact info - using icons instead of emoji */}
                            <div className="mb-3 space-y-1.5">
                              {ref.email && (
                                <div className="flex items-center gap-2 text-[10px] text-white/50">
                                  <span className="text-white/30">{Icons.email}</span>
                                  <span className="truncate">{ref.email}</span>
                                </div>
                              )}
                              {ref.phone && (
                                <div className="flex items-center gap-2 text-[10px] text-white/50" dir="ltr">
                                  <span className="text-white/30">{Icons.phoneIcon}</span>
                                  <span>{ref.phone}</span>
                                </div>
                              )}
                            </div>

                            {/* Link */}
                            <div className="mb-3 rounded-lg bg-white/[0.02] p-2.5">
                              <p className="text-[9px] text-white/40 mb-0.5">رابط الاحالة:</p>
                              <p className="font-mono text-[11px] text-[#d4a017] break-all" dir="ltr">{siteUrl}?ref={ref.code}</p>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-1.5">
                              <button onClick={() => copyLink(ref.code, ref.id)} className="flex-1 rounded-lg bg-[#2db8ff]/10 py-1.5 text-[10px] font-medium text-[#2db8ff] hover:bg-[#2db8ff]/20 transition-colors flex items-center justify-center gap-1">
                                {copiedId === ref.id ? <>{Icons.check} تم</> : <>{Icons.copy} نسخ الرابط</>}
                              </button>
                              <button onClick={() => setEditingRef(ref)} className="rounded-lg bg-white/5 py-1.5 px-2.5 text-[10px] text-white/60 hover:text-white transition-colors">تعديل</button>
                              <button onClick={() => handleDeleteRef(ref.id, ref.name)} className="rounded-lg bg-red-500/10 py-1.5 px-2.5 text-[10px] text-red-400 hover:bg-red-500/20 transition-colors">حذف</button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Edit Sales Ref Modal */}
                  <AnimatePresence>
                    {editingRef && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setEditingRef(null)}>
                        <motion.div initial={{ opacity: 0, y: 40, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }} transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }} className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0f1f3d] p-6" onClick={(e) => e.stopPropagation()}>
                          <h3 className="text-lg font-bold mb-4">تعديل: {editingRef.name}</h3>
                          <div className="space-y-3">
                            <div><label className="block text-xs text-white/60 mb-1 font-medium">الاسم</label><input id="edit-ref-name" defaultValue={editingRef.name} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[#2db8ff]/50 transition-colors" /></div>
                            <div><label className="block text-xs text-white/60 mb-1 font-medium">البريد الالكتروني</label><input id="edit-ref-email" type="email" defaultValue={editingRef.email || ""} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[#2db8ff]/50 transition-colors" /></div>
                            <div><label className="block text-xs text-white/60 mb-1 font-medium">رقم الهاتف</label><input id="edit-ref-phone" defaultValue={editingRef.phone || ""} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[#2db8ff]/50 transition-colors" /></div>
                            <div><label className="block text-xs text-white/60 mb-1 font-medium">الهدف الشهري</label><input id="edit-ref-target" type="number" defaultValue={editingRef.target} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[#2db8ff]/50 transition-colors" /></div>
                            <div className="flex items-center gap-2">
                              <input id="edit-ref-active" type="checkbox" defaultChecked={editingRef.isActive} className="accent-[#2db8ff] h-4 w-4" />
                              <label className="text-xs text-white/70">مندوب نشط</label>
                            </div>
                            <div className="flex gap-2 pt-2">
                              <button onClick={() => {
                                handleUpdateRef({
                                  id: editingRef.id,
                                  name: (document.getElementById("edit-ref-name") as HTMLInputElement).value,
                                  email: (document.getElementById("edit-ref-email") as HTMLInputElement).value,
                                  phone: (document.getElementById("edit-ref-phone") as HTMLInputElement).value,
                                  target: (document.getElementById("edit-ref-target") as HTMLInputElement).value,
                                  isActive: (document.getElementById("edit-ref-active") as HTMLInputElement).checked,
                                });
                              }} className="flex-1 rounded-lg bg-[#2db8ff] py-2.5 text-sm font-bold text-white hover:bg-[#2db8ff]/80 transition-colors">حفظ التعديلات</button>
                              <button onClick={() => setEditingRef(null)} className="rounded-lg bg-white/5 px-5 py-2.5 text-sm text-white/60 hover:text-white transition-colors">الغاء</button>
                            </div>
                          </div>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}

              {/* ===== ACTIVITIES ===== */}
              {activeTab === "activities" && (
                <motion.div key="activities" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="space-y-4">
                  {/* Header with filter */}
                  <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                    <p className="text-xs text-white/50">{filteredActivities.length} نشاط</p>
                    <div className="flex gap-2 flex-wrap">
                      {[
                        { key: "all", label: "الكل" },
                        { key: "registration", label: "تسجيلات" },
                        { key: "sales", label: "مندوبين" },
                        { key: "commission", label: "عمولات" },
                        { key: "user", label: "مستخدمين" },
                        { key: "ip_whitelist", label: "IP" },
                        { key: "admin_login", label: "دخول" },
                        { key: "setting", label: "اعدادات" },
                      ].map((f) => (
                        <button key={f.key} onClick={() => setActivityFilter(f.key)}
                          className={`rounded-lg px-3 py-1.5 text-[10px] sm:text-xs font-medium transition-colors ${activityFilter === f.key ? "bg-[#2db8ff]/10 text-[#2db8ff] border border-[#2db8ff]/20" : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-transparent"}`}>
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {filteredActivities.length === 0 ? (
                    <div className="rounded-xl border border-white/5 bg-[#0f1f3d] p-12 text-center">
                      <svg className="mx-auto h-12 w-12 text-white/10 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <p className="text-white/50 text-sm">لا توجد انشطة مسجلة بعد</p>
                    </div>
                  ) : (
                    <div className="relative">
                      {/* Timeline line */}
                      <div className="absolute right-[15px] top-0 bottom-0 w-px bg-white/10" />

                      {filteredActivities.map((act, idx) => {
                        const isReg = act.action.includes("registration");
                        const isSales = act.action.includes("sales");
                        const isComm = act.action.includes("commission");
                        const isSetting = act.action.includes("setting");
                        const isUser = act.action.startsWith("user_");
                        const isIP = act.action.includes("ip_whitelist");
                        const isLogin = act.action === "admin_login";

                        const dotColor = isReg ? "bg-[#2db8ff]" : isSales ? "bg-[#d4a017]" : isComm ? "bg-green-400" : isUser ? "bg-rose-400" : isIP ? "bg-amber-400" : isLogin ? "bg-emerald-400" : isSetting ? "bg-purple-400" : "bg-white/40";
                        const badgeColor = isReg ? "bg-[#2db8ff]/15 text-[#2db8ff] border-[#2db8ff]/20" : isSales ? "bg-[#d4a017]/15 text-[#d4a017] border-[#d4a017]/20" : isComm ? "bg-green-400/15 text-green-400 border-green-400/20" : isUser ? "bg-rose-400/15 text-rose-400 border-rose-400/20" : isIP ? "bg-amber-400/15 text-amber-400 border-amber-400/20" : isLogin ? "bg-emerald-400/15 text-emerald-400 border-emerald-400/20" : isSetting ? "bg-purple-400/15 text-purple-400 border-purple-400/20" : "bg-white/10 text-white/60 border-white/10";
                        const badgeLabel = isReg ? "تسجيل" : isSales ? "مندوب" : isComm ? "عمولة" : isUser ? "مستخدم" : isIP ? "IP" : isLogin ? "دخول" : isSetting ? "اعدادات" : "اخرى";

                        const actDate = new Date(act.createdAt);
                        const prevDate = idx > 0 ? new Date(filteredActivities[idx - 1].createdAt) : null;
                        const isNewDay = !prevDate || actDate.toDateString() !== prevDate.toDateString();

                        return (
                          <div key={act.id}>
                            {/* Date separator */}
                            {isNewDay && (
                              <div className="relative flex items-center gap-3 py-3">
                                <div className="relative z-10 flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-full bg-[#0b1a30] border border-white/10">
                                  <svg className="h-3.5 w-3.5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
                                </div>
                                <span className="text-[10px] font-bold text-white/40">{actDate.toLocaleDateString("ar-EG", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
                                <div className="flex-1 h-px bg-white/5" />
                              </div>
                            )}

                            {/* Activity item */}
                            <div className="relative flex gap-3 py-2">
                              {/* Timeline dot */}
                              <div className={`relative z-10 flex-shrink-0 mt-1.5 h-[30px] w-[30px] flex items-center justify-center rounded-full border-2 ${dotColor} border-[#0a1628]`}>
                                <div className={`h-2 w-2 rounded-full ${dotColor}`} />
                              </div>

                              {/* Content card */}
                              <div className="flex-1 min-w-0 rounded-xl border border-white/5 bg-[#0f1f3d] p-3 sm:p-4">
                                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                  <span className={`rounded-full px-2 py-0.5 text-[9px] sm:text-[10px] font-medium border ${badgeColor}`}>{badgeLabel}</span>
                                  {act.salesRef && (
                                    <span className="rounded-full px-2 py-0.5 text-[9px] sm:text-[10px] font-medium bg-[#d4a017]/10 text-[#d4a017] border border-[#d4a017]/20">{act.salesRef.name}</span>
                                  )}
                                  {act.adminName && (
                                    <span className="rounded-full px-2 py-0.5 text-[9px] sm:text-[10px] font-medium bg-rose-400/10 text-rose-300 border border-rose-400/20 flex items-center gap-1" title={`بواسطة: ${act.adminName}`}>
                                      <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
                                      {act.adminName}
                                      {act.adminUserId && <span className="text-rose-400/60" dir="ltr">#{act.adminUserId}</span>}
                                    </span>
                                  )}
                                  <span className="text-[9px] sm:text-[10px] text-white/40 mr-auto" dir="ltr">{actDate.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })}</span>
                                </div>
                                <p className="text-xs sm:text-sm text-white/70 leading-relaxed break-words">{act.details || act.action}</p>
                                {act.ipAddress && (
                                  <div className="mt-1.5 flex items-center gap-1 text-[9px] text-white/30" dir="ltr">
                                    <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" /></svg>
                                    IP: {act.ipAddress}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              )}

              {/* ===== SETTINGS ===== */}
              {activeTab === "settings" && (
                <motion.div key="settings" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="space-y-6">
                  {/* Settings - General only (users/ips/security moved to super-admin) */}
                  <div className="space-y-4">
                      <div className="rounded-xl border border-white/5 bg-[#0f1f3d] p-4">
                        <h3 className="text-sm font-bold mb-4 text-white/80">اعدادات الموقع</h3>
                        <div className="space-y-3">
                          {Object.entries(settings).map(([key, value]) => (
                            <div key={key} className="flex items-center gap-3 rounded-lg bg-white/5 px-3 py-2">
                              <span className="text-xs text-white/50 min-w-[120px]">{key}</span>
                              <span className="text-xs text-white/80 flex-1" dir="ltr">{value}</span>
                            </div>
                          ))}
                          {Object.keys(settings).length === 0 && (
                            <p className="text-xs text-white/40 text-center py-4">لا توجد اعدادات حاليا</p>
                          )}
                        </div>
                      </div>

                      {/* Commission settings */}
                      <div className="rounded-xl border border-white/5 bg-[#0f1f3d] p-4 space-y-3">
                        <h3 className="text-sm font-bold text-white/80">اعدادات العمولات</h3>
                        <div>
                          <label className="block text-xs text-white/50 mb-1">مبلغ العمولة لكل تسجيل (USD)</label>
                          <input id="setting-commission" type="number" step="0.01" defaultValue={settings.commission_amount || "5"} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none focus:border-[#2db8ff]/30 transition-colors" />
                        </div>
                        <button onClick={async () => {
                          const val = (document.getElementById("setting-commission") as HTMLInputElement).value;
                          await fetch("/api/admin/settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key: "commission_amount", value: val }) });
                          addNotif("تم حفظ الاعدادات بنجاح");
                          fetchAllData();
                        }} className="rounded-lg bg-[#2db8ff] px-4 py-2 text-xs font-bold text-white hover:bg-[#2db8ff]/80 transition-colors">حفظ الاعدادات</button>
                      </div>

                      {/* Quick Info Cards moved to /super-admin */}

                      {/* System Info */}
                      <div className="rounded-xl border border-white/5 bg-[#0f1f3d] p-4">
                        <h3 className="text-sm font-bold mb-3 text-white/80">معلومات النظام</h3>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div className="rounded-lg bg-white/[0.02] p-3"><span className="text-white/50">اجمالي التسجيلات</span><p className="font-bold text-white mt-1 text-lg">{registrations.length}</p></div>
                          <div className="rounded-lg bg-white/[0.02] p-3"><span className="text-white/50">اجمالي المندوبين</span><p className="font-bold text-white mt-1 text-lg">{salesRefs.length}</p></div>
                          <div className="rounded-lg bg-white/[0.02] p-3"><span className="text-white/50">اجمالي العمولات</span><p className="font-bold text-white mt-1 text-lg">{commissions.length}</p></div>
                          <div className="rounded-lg bg-white/[0.02] p-3"><span className="text-white/50">سجل الانشطة</span><p className="font-bold text-white mt-1 text-lg">{activities.length}</p></div>
                        </div>
                      </div>

                      {/* Super Admin Link - redirect to /super-admin for management */}
                      {currentAdmin?.role === "superadmin" && (
                      <div className="rounded-xl border border-[#d4a017]/10 bg-[#d4a017]/5 p-4 space-y-3">
                        <h3 className="text-sm font-bold text-[#d4a017] flex items-center gap-2">
                          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm0 2h14v2H5v-2z" /></svg>
                          أدوات المشرف العام
                        </h3>
                        <p className="text-xs text-white/50">تم نقل إدارة المستخدمين، القائمة البيضاء للـ IP، وسجل الأمان إلى لوحة المشرف العام</p>
                        <a href="/super-admin" className="inline-flex items-center gap-1.5 rounded-lg bg-[#d4a017]/10 border border-[#d4a017]/20 px-4 py-2 text-xs font-medium text-[#d4a017] hover:bg-[#d4a017]/20 transition-colors">
                          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm0 2h14v2H5v-2z" /></svg>
                          الانتقال إلى لوحة المشرف العام
                        </a>
                      </div>
                      )}
                    </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}

        </div>
      </main>
    </div>
  );
}
