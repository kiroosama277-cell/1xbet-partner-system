"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// --- Types ---
type AdminUser = { id: string; userId: string; username: string; accessCode: string; allowedIPs: string; isActive: boolean; role: string; lastLoginAt: string | null; lastLoginIP: string | null; createdAt: string };
type IPEntry = { id: string; ip: string; label: string | null; addedBy: string | null; isActive: boolean; createdAt: string };
type LoginAttempt = { id: string; userId: string; ip: string; success: boolean; reason: string | null; createdAt: string };
type Activity = { id: string; action: string; details: string | null; adminId?: string | null; adminName?: string | null; adminUserId?: string | null; ipAddress?: string | null; createdAt: string };
type AuditLog = { id: string; action: string; targetType: string | null; targetId: string | null; targetName: string | null; oldValue: string | null; newValue: string | null; adminId: string | null; adminName: string | null; adminUserId: string | null; ipAddress: string | null; details: string | null; createdAt: string };
type Stats = { overview: { totalRegistrations: number; totalSalesRefs: number; activeSalesRefs: number; todayRegistrations: number }; commissions: { total: number; pending: number; approved: number; paid: number } };
type Notification = { id: string; message: string; time: string; read: boolean; type?: "success" | "error" | "info" };

// --- Icons ---
const Icons = {
  dashboard: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>,
  users: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>,
  shield: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>,
  activity: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  network: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" /></svg>,
  danger: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>,
  refresh: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>,
  copy: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" /></svg>,
  trash: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>,
  check: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>,
  x: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>,
  eye: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
};

const actionLabels: Record<string, string> = {
  admin_login: "تسجيل دخول أدمن",
  admin_logout: "تسجيل خروج أدمن",
  user_create: "إنشاء مستخدم",
  user_delete: "حذف مستخدم",
  user_toggle_active: "تفعيل/تعطيل مستخدم",
  user_regen_code: "توليد كود جديد",
  setting_updated: "تحديث إعداد",
  ip_whitelist_add: "إضافة IP",
  ip_whitelist_remove: "حذف IP",
  registration: "تسجيل جديد",
  registration_updated: "تحديث تسجيل",
  registration_deleted: "حذف تسجيل",
  registration_bulk_update: "تحديث جماعي",
  registration_bulk_delete: "حذف جماعي",
  registration_delete_all: "حذف كل التسجيلات",
  commission_created: "إنشاء عمولة",
  commission_updated: "تحديث عمولة",
  salesref_create: "إنشاء مندوب",
  salesref_update: "تحديث مندوب",
};

export default function SuperAdminPage() {
  const [isAuthed, setIsAuthed] = useState(false);
  const [loginUserId, setLoginUserId] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(true);
  const [showCode, setShowCode] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState<{ userId: string; username: string; role: string } | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Data
  const [stats, setStats] = useState<Stats | null>(null);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [ipWhitelist, setIPWhitelist] = useState<IPEntry[]>([]);
  const [loginAttempts, setLoginAttempts] = useState<LoginAttempt[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});

  // UI state
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserIPs, setNewUserIPs] = useState("*");
  const [newUserRole, setNewUserRole] = useState("admin");
  const [newUserCredentials, setNewUserCredentials] = useState<{ userId: string; accessCode: string; username: string } | null>(null);
  const [newIP, setNewIP] = useState("");
  const [newIPLabel, setNewIPLabel] = useState("");
  const [activityFilter, setActivityFilter] = useState("all");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Notifications
  const addNotif = (message: string, type: "success" | "error" | "info" = "success") => {
    const id = Math.random().toString(36).slice(2);
    setNotifications((prev) => [{ id, message, time: new Date().toLocaleTimeString("ar-EG"), read: false, type }, ...prev]);
    setTimeout(() => setNotifications((prev) => prev.filter((n) => n.id !== id)), 5000);
  };

  // Check session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch("/api/admin/stats");
        if (res.ok) {
          const data = await res.json();
          setStats(data);
          setIsAuthed(true);
          // Need to get admin info from session - check users endpoint
          const usersRes = await fetch("/api/admin/users");
          if (usersRes.ok) {
            const users = await usersRes.json();
            // Find superadmin user (we'll determine current user from login attempts or just check role)
          }
          fetchAllData();
        }
      } catch {}
      setAuthLoading(false);
    };
    checkSession();
  }, []);

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
        if (data.role !== "superadmin") {
          setIsAuthed(true);
          setIsSuperAdmin(false);
          setAuthError("");
        } else {
          setIsAuthed(true);
          setIsSuperAdmin(true);
          setAuthError("");
          fetchAllData();
        }
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
    setIsSuperAdmin(false);
  };

  // --- Data fetching ---
  const fetchAllData = useCallback(async () => {
    try {
      const [statsRes, usersRes, ipRes, attemptsRes, actRes, setRes, auditRes] = await Promise.all([
        fetch("/api/super-admin/stats"),
        fetch("/api/super-admin/admin-users"),
        fetch("/api/admin/ip-whitelist"),
        fetch("/api/super-admin/login-attempts?limit=100"),
        fetch("/api/admin/activities?limit=100"),
        fetch("/api/admin/settings"),
        fetch("/api/super-admin/audit-log?limit=100"),
      ]);
      if (statsRes.ok) setStats(await statsRes.json());
      if (usersRes.ok) setAdminUsers(await usersRes.json());
      if (ipRes.ok) setIPWhitelist(await ipRes.json());
      if (attemptsRes.ok) { const d = await attemptsRes.json(); setLoginAttempts(d.attempts || d); }
      if (actRes.ok) { const d = await actRes.json(); setActivities(d.activities || d); }
      if (setRes.ok) setSettings(await setRes.json());
      if (auditRes.ok) { const d = await auditRes.json(); setAuditLogs(d.logs || d); }
    } catch {}
  }, []);

  // --- Admin User Management ---
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/super-admin/admin-users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username: newUserName, allowedIPs: newUserIPs, role: newUserRole }) });
      if (res.ok) {
        const user = await res.json();
        addNotif(`تم إنشاء مستخدم: ${user.username} — ID: ${user.userId}`);
        setNewUserCredentials({ userId: user.userId, accessCode: user.accessCode, username: user.username });
        setNewUserName("");
        setNewUserIPs("*");
        setShowAddUser(false);
        fetchAllData();
      } else { const d = await res.json(); addNotif(d.error || "حدث خطأ", "error"); }
    } catch { addNotif("حدث خطأ", "error"); }
  };

  const handleToggleUserActive = async (id: string, isActive: boolean) => {
    try {
      const res = await fetch("/api/super-admin/admin-users", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, action: "toggleActive" }) });
      if (res.ok) { addNotif(isActive ? "تم تعطيل المستخدم" : "تم تفعيل المستخدم"); fetchAllData(); }
    } catch {}
  };

  const handleRegenerateCode = async (id: string) => {
    try {
      const res = await fetch("/api/super-admin/admin-users", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, regenerateCode: true }) });
      if (res.ok) {
        const user = await res.json();
        addNotif(`تم توليد كود جديد لـ ${user.username}: ${user.accessCode}`);
        setNewUserCredentials({ userId: user.userId, accessCode: user.accessCode, username: user.username });
        fetchAllData();
      }
    } catch {}
  };

  const handleDeleteUser = async (id: string, username: string) => {
    if (!confirm(`هل أنت متأكد من حذف المستخدم ${username}؟`)) return;
    try {
      const res = await fetch(`/api/super-admin/admin-users?id=${id}`, { method: "DELETE" });
      if (res.ok) { addNotif(`تم حذف المستخدم: ${username}`); fetchAllData(); }
      else { const d = await res.json(); addNotif(d.error || "حدث خطأ", "error"); }
    } catch {}
  };

  // --- IP Whitelist ---
  const handleAddIP = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/ip-whitelist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ip: newIP, label: newIPLabel }) });
      if (res.ok) { addNotif(`تم إضافة IP: ${newIP}`); setNewIP(""); setNewIPLabel(""); fetchAllData(); }
      else { const d = await res.json(); addNotif(d.error || "خطأ", "error"); }
    } catch {}
  };

  const handleDeleteIP = async (id: string, ip: string) => {
    try {
      const res = await fetch(`/api/admin/ip-whitelist?id=${id}`, { method: "DELETE" });
      if (res.ok) { addNotif(`تم حذف IP: ${ip}`); fetchAllData(); }
    } catch {}
  };

  // --- Danger Zone ---
  const handleDeleteAllRegistrations = async () => {
    if (!confirm("⚠️ هل أنت متأكد من حذف جميع التسجيلات؟ لا يمكن التراجع!")) return;
    try {
      const res = await fetch("/api/admin/registrations", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "deleteAll" }) });
      if (res.ok) { addNotif("تم مسح جميع التسجيلات"); fetchAllData(); }
      else { addNotif("حدث خطأ", "error"); }
    } catch {}
  };

  // --- Loading ---
  if (authLoading) {
    return <div className="flex min-h-screen items-center justify-center bg-[#0a1628]"><div className="h-8 w-8 rounded-full border-2 border-[#d4a017]/30 border-t-[#d4a017] animate-spin" /></div>;
  }

  // --- Login Form ---
  if (!isAuthed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a1628] px-4">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#d4a017]/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-[#2db8ff]/5 rounded-full blur-3xl" />
        </div>
        <motion.form initial={{ opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} onSubmit={handleLogin} className="relative w-full max-w-sm rounded-2xl border border-[#d4a017]/30 bg-[#0f1f3d]/90 backdrop-blur-xl p-8 shadow-2xl shadow-[#d4a017]/10">
          <div className="mb-6 text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring", stiffness: 200 }} className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br from-[#d4a017] to-[#e8b84d] mb-4 shadow-lg shadow-[#d4a017]/30">
              <svg className="h-7 w-7 text-[#0a1628]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>
            </motion.div>
            <div className="text-2xl font-bold mb-1"><span className="text-[#2db8ff]">1X</span><span className="text-white">BET</span></div>
            <p className="text-sm text-[#d4a017] font-bold">لوحة تحكم المشرف العام</p>
            <p className="text-[10px] text-white/40 mt-1">Super Admin Control Panel</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-white/70 mb-1.5 font-medium">رقم التعريف (ID)</label>
              <input autoFocus type="text" value={loginUserId} onChange={(e) => { setLoginUserId(e.target.value); setAuthError(""); }} placeholder="أدخل رقم التعريف" dir="ltr" className="w-full rounded-lg border border-[#d4a017]/20 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-[#d4a017]/50 focus:ring-2 focus:ring-[#d4a017]/20 transition-all text-center tracking-widest font-mono text-lg" />
            </div>
            <div>
              <label className="block text-xs text-white/70 mb-1.5 font-medium">كود الدخول</label>
              <div className="relative">
                <input type={showCode ? "text" : "password"} value={accessCode} onChange={(e) => { setAccessCode(e.target.value); setAuthError(""); }} placeholder="أدخل كود الدخول" dir="ltr" className="w-full rounded-lg border border-[#d4a017]/20 bg-white/5 px-4 py-3 pr-10 text-sm text-white placeholder:text-white/40 outline-none focus:border-[#d4a017]/50 focus:ring-2 focus:ring-[#d4a017]/20 transition-all text-center tracking-wider font-mono" />
                <button type="button" onClick={() => setShowCode(!showCode)} className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 text-white/40 hover:text-white/70 transition-colors">
                  {showCode ? <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg> : Icons.eye}
                </button>
              </div>
            </div>
          </div>
          <AnimatePresence>
          {authError && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="mt-3 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-center text-sm text-red-400 flex items-center justify-center gap-2">
              <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
              {authError}
            </motion.div>
          )}
          </AnimatePresence>
          <button type="submit" disabled={loginLoading} className="mt-5 w-full rounded-lg bg-gradient-to-r from-[#d4a017] to-[#e8b84d] py-3 text-sm font-bold text-[#0a1628] hover:shadow-lg hover:shadow-[#d4a017]/20 transition-all active:scale-[0.97] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {loginLoading ? <><div className="h-4 w-4 rounded-full border-2 border-[#0a1628]/30 border-t-[#0a1628] animate-spin" /><span>جاري التحقق...</span></> : "دخول لوحة المشرف العام"}
          </button>
        </motion.form>
      </div>
    );
  }

  // --- NOT SUPERADMIN - ACCESS DENIED ---
  if (!isSuperAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a1628] px-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full rounded-2xl border border-red-500/30 bg-[#0f1f3d] p-8 text-center">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-red-500/20 mb-4">
            <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
          </div>
          <h2 className="text-xl font-bold text-red-400 mb-2">⛔ غير مصرح بالدخول</h2>
          <p className="text-sm text-white/60 mb-6">هذه الصفحة خاصة بالمشرف العام فقط (Super Admin). حسابك الحالي ليس لديه صلاحية الوصول هنا.</p>
          <div className="space-y-3">
            <a href="/admin" className="block rounded-lg bg-[#2db8ff] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#2db8ff]/80 transition-colors">العودة للوحة الأدمن العادية</a>
            <button onClick={handleLogout} className="w-full rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/20 transition-colors">تسجيل الخروج</button>
          </div>
        </motion.div>
      </div>
    );
  }

  // --- TABS ---
  const tabs = [
    { key: "overview", label: "نظرة عامة", icon: Icons.dashboard },
    { key: "users", label: "إدارة الأدمنز", icon: Icons.users },
    { key: "logins", label: "سجل الدخول", icon: Icons.shield },
    { key: "audit", label: "سجل التدقيق", icon: Icons.activity },
    { key: "ips", label: "الـ IP المصرح", icon: Icons.network },
    { key: "activities", label: "سجل الأنشطة", icon: Icons.activity },
    { key: "danger", label: "منطقة الخطر", icon: Icons.danger },
  ];

  const filteredActivities = activityFilter === "all" ? activities : activities.filter((a) => a.action === activityFilter);

  // --- MAIN DASHBOARD ---
  return (
    <div className="min-h-screen bg-[#0a1628] text-white flex overflow-x-hidden" dir="rtl">
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />)}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`fixed lg:relative z-50 lg:z-auto top-0 right-0 h-full transition-all duration-300 border-l border-[#d4a017]/10 bg-[#0b1a30] flex flex-col overflow-hidden ${sidebarOpen ? "w-60 translate-x-0" : "w-0 lg:w-auto translate-x-full lg:translate-x-0"} ${!sidebarOpen ? "lg:w-[68px]" : "lg:w-60"}`}>
        <div className="p-4 flex items-center gap-3 border-b border-[#d4a017]/10 min-h-[60px] flex-shrink-0">
          <span className={`text-lg font-bold whitespace-nowrap transition-opacity ${sidebarOpen ? "opacity-100" : "lg:opacity-100 opacity-0 lg:hidden"}`}>
            <span className="text-[#d4a017]">1X</span><span>BET</span>
          </span>
          {!sidebarOpen && <span className="hidden lg:inline text-lg font-bold text-[#d4a017]">1X</span>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="hidden lg:block mr-auto text-white/50 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors">
            <svg className={`h-5 w-5 transition-transform ${sidebarOpen ? "" : "rotate-180"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
          </button>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden mr-auto text-white/50 hover:text-white p-1">{Icons.x}</button>
        </div>
        {/* Super Admin Badge */}
        <div className={`px-3 py-2 border-b border-[#d4a017]/10 ${!sidebarOpen ? "lg:px-1" : ""}`}>
          <div className={`flex items-center gap-2 rounded-lg bg-[#d4a017]/10 px-2 py-1.5 ${!sidebarOpen ? "lg:justify-center" : ""}`}>
            <svg className="h-4 w-4 text-[#d4a017] flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/></svg>
            {sidebarOpen && <span className="text-[10px] font-bold text-[#d4a017] whitespace-nowrap">مشرف عام</span>}
          </div>
        </div>
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {tabs.map((tab) => (
            <button key={tab.key} onClick={() => { setActiveTab(tab.key); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${activeTab === tab.key ? "bg-[#d4a017]/10 text-[#d4a017]" : "text-white/60 hover:text-white hover:bg-white/5"} ${!sidebarOpen ? "lg:justify-center lg:px-0 lg:[&>span:last-child]:hidden" : ""}`} title={!sidebarOpen ? tab.label : undefined}>
              <span className="flex-shrink-0">{tab.icon}</span>
              <span className="whitespace-nowrap overflow-hidden">{tab.label}</span>
            </button>
          ))}
          {/* Link to regular admin */}
          <a href="/admin" className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/40 hover:text-[#2db8ff] hover:bg-[#2db8ff]/5 transition-all ${!sidebarOpen ? "lg:justify-center lg:px-0 lg:[&>span:last-child]:hidden" : ""}`}>
            <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
            <span className="whitespace-nowrap overflow-hidden">لوحة الأدمن العادية</span>
          </a>
        </nav>
        <div className="p-2 border-t border-[#d4a017]/10 flex-shrink-0">
          <button onClick={handleLogout} className={`w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/60 hover:text-red-400 hover:bg-red-500/5 transition-colors ${!sidebarOpen ? "lg:justify-center lg:px-0" : ""}`}>
            <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg>
            {sidebarOpen && <span className="whitespace-nowrap">تسجيل الخروج</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Top bar */}
        <header className="border-b border-[#d4a017]/10 bg-[#0b1a30]/80 backdrop-blur-md px-3 sm:px-6 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden rounded-lg bg-white/5 p-2 text-white/70 hover:text-white hover:bg-white/10 transition-colors">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
            </button>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#d4a017]">{tabs.find((t) => t.key === activeTab)?.label}</h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {currentAdmin && (
              <div className="hidden sm:flex items-center gap-2 rounded-lg bg-[#d4a017]/10 px-3 py-1.5">
                <div className="h-6 w-6 rounded-full bg-[#d4a017]/30 flex items-center justify-center text-[10px] font-bold text-[#d4a017]">
                  <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/></svg>
                </div>
                <div className="text-xs">
                  <p className="text-[#d4a017] font-medium leading-tight">{currentAdmin.username}</p>
                  <p className="text-[#d4a017]/50 text-[9px]" dir="ltr">ID: {currentAdmin.userId}</p>
                </div>
              </div>
            )}
            <button onClick={fetchAllData} className="rounded-lg bg-white/5 p-2 text-white/50 hover:text-white hover:bg-white/10 transition-colors" title="تحديث">{Icons.refresh}</button>
          </div>
        </header>

        {/* Notifications */}
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 space-y-2 pointer-events-none">
          <AnimatePresence>
            {notifications.map((n) => (
              <motion.div key={n.id} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm shadow-lg pointer-events-auto ${n.type === "error" ? "bg-red-500/90 text-white" : n.type === "info" ? "bg-[#2db8ff]/90 text-white" : "bg-[#d4a017]/90 text-[#0a1628]"}`}>
                {n.message}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6">

          {/* ====== OVERVIEW ====== */}
          {activeTab === "overview" && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-[#d4a017]/20 bg-gradient-to-b from-[#d4a017]/10 to-[#0f1f3d] p-4">
                  <p className="text-[10px] text-[#d4a017]/60 mb-1">إجمالي التسجيلات</p>
                  <p className="text-2xl font-bold text-[#d4a017]">{stats?.overview.totalRegistrations || 0}</p>
                  <p className="text-[9px] text-white/30 mt-1">اليوم: {stats?.overview.todayRegistrations || 0}</p>
                </div>
                <div className="rounded-xl border border-[#2db8ff]/20 bg-gradient-to-b from-[#2db8ff]/10 to-[#0f1f3d] p-4">
                  <p className="text-[10px] text-[#2db8ff]/60 mb-1">عدد الأدمنز</p>
                  <p className="text-2xl font-bold text-[#2db8ff]">{adminUsers.length}</p>
                  <p className="text-[9px] text-white/30 mt-1">نشط: {adminUsers.filter(u => u.isActive).length}</p>
                </div>
                <div className="rounded-xl border border-green-500/20 bg-gradient-to-b from-green-500/10 to-[#0f1f3d] p-4">
                  <p className="text-[10px] text-green-400/60 mb-1">IPs مصرح بها</p>
                  <p className="text-2xl font-bold text-green-400">{ipWhitelist.filter(i => i.isActive).length}</p>
                  <p className="text-[9px] text-white/30 mt-1">من {ipWhitelist.length} عنوان</p>
                </div>
                <div className="rounded-xl border border-purple-500/20 bg-gradient-to-b from-purple-500/10 to-[#0f1f3d] p-4">
                  <p className="text-[10px] text-purple-400/60 mb-1">محاولات الدخول</p>
                  <p className="text-2xl font-bold text-purple-400">{loginAttempts.length}</p>
                  <p className="text-[9px] text-white/30 mt-1">ناجحة: {loginAttempts.filter(a => a.success).length}</p>
                </div>
              </div>

              {/* Recent login attempts */}
              <div className="rounded-xl border border-white/5 bg-[#0f1f3d] p-4">
                <h3 className="text-sm font-bold text-[#d4a017] mb-3">آخر محاولات الدخول</h3>
                <div className="space-y-2">
                  {loginAttempts.slice(0, 5).map((a) => (
                    <div key={a.id} className={`flex items-center justify-between rounded-lg px-3 py-2 ${a.success ? "bg-green-500/5" : "bg-red-500/5"}`}>
                      <div className="flex items-center gap-2">
                        <div className={`h-6 w-6 rounded-lg flex items-center justify-center text-[10px] ${a.success ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                          {a.success ? "✓" : "✗"}
                        </div>
                        <div>
                          <p className="text-xs text-white/80" dir="ltr">ID: {a.userId}</p>
                          <p className="text-[9px] text-white/30" dir="ltr">IP: {a.ip}</p>
                        </div>
                      </div>
                      <div className="text-left">
                        <p className="text-[9px] text-white/30">{new Date(a.createdAt).toLocaleString("ar-EG")}</p>
                        {a.reason && <p className="text-[9px] text-red-400/60">{a.reason}</p>}
                      </div>
                    </div>
                  ))}
                  {loginAttempts.length === 0 && <p className="text-xs text-white/40 text-center py-4">لا توجد محاولات</p>}
                </div>
              </div>

              {/* Recent activities */}
              <div className="rounded-xl border border-white/5 bg-[#0f1f3d] p-4">
                <h3 className="text-sm font-bold text-[#d4a017] mb-3">آخر الأنشطة</h3>
                <div className="space-y-2">
                  {activities.slice(0, 5).map((a) => (
                    <div key={a.id} className="flex items-center justify-between rounded-lg bg-white/[0.02] px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-lg flex items-center justify-center bg-[#2db8ff]/10 text-[10px] text-[#2db8ff]">⚡</div>
                        <div>
                          <p className="text-xs text-white/80">{actionLabels[a.action] || a.action}</p>
                          {a.details && <p className="text-[9px] text-white/40 line-clamp-1">{a.details}</p>}
                        </div>
                      </div>
                      <div className="text-left">
                        <p className="text-[9px] text-white/30">{new Date(a.createdAt).toLocaleString("ar-EG")}</p>
                        {a.adminName && <p className="text-[9px] text-[#d4a017]/60">بواسطة: {a.adminName}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ====== ADMIN USERS MANAGEMENT ====== */}
          {activeTab === "users" && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white/80">إدارة المستخدمين والأدمنز</h3>
                <button onClick={() => setShowAddUser(true)} className="flex items-center gap-1.5 rounded-lg bg-[#d4a017]/10 px-3 py-1.5 text-xs font-medium text-[#d4a017] hover:bg-[#d4a017]/20 transition-colors">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                  مستخدم جديد
                </button>
              </div>

              {/* Add User Form */}
              <AnimatePresence>
                {showAddUser && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <form onSubmit={handleAddUser} className="rounded-xl border border-[#d4a017]/20 bg-[#d4a017]/5 p-4 space-y-3">
                      <h4 className="text-xs font-bold text-[#d4a017]">إنشاء مستخدم جديد</h4>
                      <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
                        <div>
                          <label className="block text-[10px] text-white/50 mb-1">اسم المستخدم</label>
                          <input type="text" value={newUserName} onChange={(e) => setNewUserName(e.target.value)} placeholder="الاسم" className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none focus:border-[#d4a017]/30" required />
                        </div>
                        <div>
                          <label className="block text-[10px] text-white/50 mb-1">IP المسموحة (افتراضي: *)</label>
                          <input type="text" value={newUserIPs} onChange={(e) => setNewUserIPs(e.target.value)} placeholder="* أو 192.168.1.*" dir="ltr" className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none focus:border-[#d4a017]/30 font-mono" />
                        </div>
                        <div>
                          <label className="block text-[10px] text-white/50 mb-1">الدور / الصلاحية</label>
                          <select value={newUserRole} onChange={(e) => setNewUserRole(e.target.value)} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none focus:border-[#d4a017]/30">
                            <option value="admin" className="bg-[#0f1f3d]">أدمن عادي</option>
                            <option value="superadmin" className="bg-[#0f1f3d]">مشرف عام (Super Admin)</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button type="submit" className="rounded-lg bg-[#d4a017] px-4 py-1.5 text-xs font-medium text-[#0a1628] hover:bg-[#d4a017]/80 transition-colors">إنشاء</button>
                        <button type="button" onClick={() => setShowAddUser(false)} className="rounded-lg bg-white/5 px-4 py-1.5 text-xs text-white/60 hover:bg-white/10 transition-colors">إلغاء</button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* New User Credentials Modal */}
              <AnimatePresence>
                {newUserCredentials && (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="rounded-xl border border-[#d4a017]/30 bg-[#d4a017]/5 p-5 space-y-3">
                    <div className="flex items-center gap-2">
                      <svg className="h-5 w-5 text-[#d4a017]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <h4 className="text-sm font-bold text-[#d4a017]">تم إنشاء المستخدم بنجاح!</h4>
                    </div>
                    <p className="text-[10px] text-red-400/80">⚠️ احفظ هذه البيانات الآن! لن يتم عرض كود الدخول مرة أخرى.</p>
                    <div className="rounded-lg bg-[#0a1628] p-3 space-y-2 font-mono text-xs">
                      <div className="flex justify-between"><span className="text-white/50">اسم المستخدم:</span><span className="text-[#d4a017]">{newUserCredentials.username}</span></div>
                      <div className="flex justify-between"><span className="text-white/50">User ID:</span><span className="text-[#d4a017]" dir="ltr">{newUserCredentials.userId}</span></div>
                      <div className="flex justify-between items-center"><span className="text-white/50">Access Code:</span><div className="flex items-center gap-1"><span className="text-lg font-bold text-[#d4a017] tracking-widest" dir="ltr">{newUserCredentials.accessCode}</span><button onClick={() => { navigator.clipboard.writeText(newUserCredentials.accessCode); setCopiedId("cred-code"); setTimeout(() => setCopiedId(null), 2000); }} className="rounded-lg p-1.5 text-[#d4a017]/60 hover:text-[#d4a017] hover:bg-[#d4a017]/10 transition-colors" title="نسخ">{copiedId === "cred-code" ? Icons.check : Icons.copy}</button></div></div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { navigator.clipboard.writeText(`بيانات الدخول لوحة الأدمن\nاسم المستخدم: ${newUserCredentials.username}\nUser ID: ${newUserCredentials.userId}\nAccess Code: ${newUserCredentials.accessCode}\nرابط الدخول: ${window.location.origin}/admin`); setCopiedId("cred-all"); setTimeout(() => setCopiedId(null), 2000); }} className="rounded-lg bg-[#d4a017]/10 px-3 py-1.5 text-xs text-[#d4a017] hover:bg-[#d4a017]/20 transition-colors">{copiedId === "cred-all" ? "تم النسخ!" : "نسخ الكل"}</button>
                      <button onClick={() => setNewUserCredentials(null)} className="rounded-lg bg-white/5 px-3 py-1.5 text-xs text-white/60 hover:bg-white/10 transition-colors">إغلاق</button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Users List */}
              <div className="space-y-2">
                {adminUsers.map((user) => (
                  <div key={user.id} className={`rounded-xl border border-white/5 bg-[#0f1f3d] p-4 transition-all ${!user.isActive ? "opacity-50" : ""}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-sm font-bold ${user.role === "superadmin" ? "bg-[#d4a017]/20 text-[#d4a017]" : user.isActive ? "bg-[#2db8ff]/20 text-[#2db8ff]" : "bg-red-500/20 text-red-400"}`}>
                          {user.role === "superadmin" ? <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/></svg> : user.username?.charAt(0) || "?"}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white/90">{user.username}</p>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            <span className="text-[10px] font-mono text-white/40 bg-white/5 px-1.5 py-0.5 rounded" dir="ltr">ID: {user.userId}</span>
                            <span className="text-[10px] font-mono text-[#d4a017] bg-[#d4a017]/10 px-1.5 py-0.5 rounded cursor-pointer" dir="ltr" onClick={() => { navigator.clipboard.writeText(user.accessCode); setCopiedId(user.id + "-code"); setTimeout(() => setCopiedId(null), 2000); }} title="نسخ الكود">
                              {copiedId === user.id + "-code" ? "تم النسخ!" : `كود: ${user.accessCode}`}
                            </span>
                            {user.role === "superadmin" && <span className="text-[10px] text-[#d4a017] bg-[#d4a017]/20 px-1.5 py-0.5 rounded font-bold">مشرف عام</span>}
                            {user.role === "admin" && <span className="text-[10px] text-[#2db8ff] bg-[#2db8ff]/10 px-1.5 py-0.5 rounded">أدمن</span>}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[9px] text-white/30" dir="ltr">IP: {user.allowedIPs}</span>
                            {user.lastLoginAt && <span className="text-[9px] text-white/30">آخر دخول: {new Date(user.lastLoginAt).toLocaleDateString("ar-EG")}</span>}
                            {user.lastLoginIP && <span className="text-[9px] text-white/30" dir="ltr">من: {user.lastLoginIP}</span>}
                          </div>
                        </div>
                      </div>
                      {user.role !== "superadmin" && (
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleToggleUserActive(user.id, user.isActive)} className={`rounded-lg p-1.5 text-xs transition-colors ${user.isActive ? "text-green-400 hover:bg-green-500/10" : "text-red-400 hover:bg-red-500/10"}`} title={user.isActive ? "تعطيل" : "تفعيل"}>
                            {user.isActive ? Icons.check : Icons.x}
                          </button>
                          <button onClick={() => handleRegenerateCode(user.id)} className="rounded-lg p-1.5 text-xs text-[#d4a017] hover:bg-[#d4a017]/10 transition-colors" title="توليد كود جديد">{Icons.refresh}</button>
                          <button onClick={() => handleDeleteUser(user.id, user.username)} className="rounded-lg p-1.5 text-xs text-red-400 hover:bg-red-500/10 transition-colors" title="حذف">{Icons.trash}</button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {adminUsers.length === 0 && <p className="text-xs text-white/40 text-center py-6">لا يوجد مستخدمين</p>}
              </div>
            </motion.div>
          )}

          {/* ====== LOGIN LOG ====== */}
          {activeTab === "logins" && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-green-500/20 bg-[#0f1f3d] p-4">
                  <p className="text-[10px] text-white/40 mb-1">تسجيلات دخول ناجحة</p>
                  <p className="text-2xl font-bold text-green-400">{loginAttempts.filter(a => a.success).length}</p>
                </div>
                <div className="rounded-xl border border-red-500/20 bg-[#0f1f3d] p-4">
                  <p className="text-[10px] text-white/40 mb-1">محاولات فاشلة</p>
                  <p className="text-2xl font-bold text-red-400">{loginAttempts.filter(a => !a.success).length}</p>
                </div>
                <div className="rounded-xl border border-[#2db8ff]/20 bg-[#0f1f3d] p-4">
                  <p className="text-[10px] text-white/40 mb-1">أدمنز نشطون</p>
                  <p className="text-2xl font-bold text-[#2db8ff]">{adminUsers.filter(u => u.isActive).length}</p>
                </div>
                <div className="rounded-xl border border-[#d4a017]/20 bg-[#0f1f3d] p-4">
                  <p className="text-[10px] text-white/40 mb-1">أدمنز معطلون</p>
                  <p className="text-2xl font-bold text-[#d4a017]">{adminUsers.filter(u => !u.isActive).length}</p>
                </div>
              </div>
              <div className="rounded-xl border border-white/5 bg-[#0f1f3d] p-4">
                <h3 className="text-sm font-bold text-white/80 mb-3">سجل محاولات الدخول</h3>
                <div className="space-y-2">
                  {loginAttempts.map((a) => (
                    <div key={a.id} className={`flex items-center justify-between rounded-lg px-3 py-2.5 ${a.success ? "bg-green-500/5 border border-green-500/10" : "bg-red-500/5 border border-red-500/10"}`}>
                      <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-sm font-bold ${a.success ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                          {a.success ? "✓" : "✗"}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white/90" dir="ltr">User ID: {a.userId}</p>
                          <p className="text-[9px] text-white/40" dir="ltr">IP: {a.ip}</p>
                          {a.reason && <p className="text-[9px] text-red-400/70">{a.reason}</p>}
                        </div>
                      </div>
                      <div className="text-left">
                        <p className="text-[10px] text-white/40">{new Date(a.createdAt).toLocaleString("ar-EG")}</p>
                      </div>
                    </div>
                  ))}
                  {loginAttempts.length === 0 && <p className="text-xs text-white/40 text-center py-6">لا توجد محاولات دخول</p>}
                </div>
              </div>
            </motion.div>
          )}

          {/* ====== AUDIT LOG ====== */}
          {activeTab === "audit" && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="rounded-xl border border-[#d4a017]/20 bg-[#0f1f3d] p-4">
                <h3 className="text-sm font-bold text-[#d4a017] mb-3">سجل التدقيق — Audit Log</h3>
                <p className="text-xs text-white/50 mb-4">كل تعديل يتم تسجيله هنا مع بيانات من قام بالتعديل ومتى</p>
                {auditLogs.length === 0 ? (
                  <p className="text-xs text-white/30 text-center py-8">لا توجد سجلات تدقيق بعد</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-right py-2 px-2 text-white/50 font-medium">التاريخ</th>
                          <th className="text-right py-2 px-2 text-white/50 font-medium">الإجراء</th>
                          <th className="text-right py-2 px-2 text-white/50 font-medium">الهدف</th>
                          <th className="text-right py-2 px-2 text-white/50 font-medium">من نفّذ</th>
                          <th className="text-right py-2 px-2 text-white/50 font-medium">IP</th>
                          <th className="text-right py-2 px-2 text-white/50 font-medium">التفاصيل</th>
                        </tr>
                      </thead>
                      <tbody>
                        {auditLogs.map((log) => (
                          <tr key={log.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                            <td className="py-2 px-2 text-white/60 whitespace-nowrap">{new Date(log.createdAt).toLocaleString("ar-EG")}</td>
                            <td className="py-2 px-2">
                              <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium ${
                                log.action.includes("delete") ? "bg-red-500/10 text-red-400" :
                                log.action.includes("create") ? "bg-green-500/10 text-green-400" :
                                log.action.includes("update") ? "bg-[#2db8ff]/10 text-[#2db8ff]" :
                                "bg-white/5 text-white/60"
                              }`}>
                                {log.action}
                              </span>
                            </td>
                            <td className="py-2 px-2 text-white/60">
                              {log.targetType && <span className="text-[#d4a017]/80">{log.targetType}</span>}
                              {log.targetName && <span className="mr-1">: {log.targetName}</span>}
                            </td>
                            <td className="py-2 px-2 text-white/60">
                              {log.adminName && <span>{log.adminName}</span>}
                              {log.adminUserId && <span className="text-[#d4a017]/50 mr-1" dir="ltr">({log.adminUserId})</span>}
                            </td>
                            <td className="py-2 px-2 text-white/40 font-mono whitespace-nowrap" dir="ltr">{log.ipAddress || "-"}</td>
                            <td className="py-2 px-2 text-white/40 max-w-[200px] truncate">{log.details || "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ====== IP WHITELIST ====== */}
          {activeTab === "ips" && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="rounded-xl border border-[#2db8ff]/20 bg-[#2db8ff]/5 p-4">
                <h3 className="text-sm font-bold text-[#2db8ff] mb-3">إضافة IP جديد</h3>
                <form onSubmit={handleAddIP} className="flex gap-2 flex-wrap">
                  <input type="text" value={newIP} onChange={(e) => setNewIP(e.target.value)} placeholder="عنوان IP (مثال: 192.168.1.100)" dir="ltr" className="flex-1 min-w-[150px] rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none focus:border-[#2db8ff]/30 font-mono" required />
                  <input type="text" value={newIPLabel} onChange={(e) => setNewIPLabel(e.target.value)} placeholder="تسمية (اختياري)" className="flex-1 min-w-[100px] rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none focus:border-[#2db8ff]/30" />
                  <button type="submit" className="rounded-lg bg-[#2db8ff] px-4 py-2 text-xs font-bold text-white hover:bg-[#2db8ff]/80 transition-colors">إضافة</button>
                </form>
              </div>

              <div className={`rounded-xl border p-3 ${ipWhitelist.length > 0 ? "border-green-500/20 bg-green-500/5" : "border-yellow-500/20 bg-yellow-500/5"}`}>
                <div className="flex items-center gap-2">
                  {ipWhitelist.length > 0 ? <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> : <svg className="h-5 w-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>}
                  <p className={`text-xs font-medium ${ipWhitelist.length > 0 ? "text-green-400" : "text-yellow-400"}`}>
                    {ipWhitelist.length > 0 ? `القائمة البيضاء مفعلة - ${ipWhitelist.filter(i => i.isActive).length} IP مصرح بها` : "القائمة البيضاء فارغة - جميع IPs مسموحة"}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {ipWhitelist.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between rounded-xl border border-white/5 bg-[#0f1f3d] p-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-green-500/20 text-green-400">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3" /></svg>
                      </div>
                      <div>
                        <p className="text-sm font-mono text-white/80" dir="ltr">{entry.ip}</p>
                        {entry.label && <p className="text-[9px] text-white/30">{entry.label}</p>}
                        <p className="text-[9px] text-white/20">أضيف بواسطة: {entry.addedBy || "غير معروف"} • {new Date(entry.createdAt).toLocaleDateString("ar-EG")}</p>
                      </div>
                    </div>
                    <button onClick={() => handleDeleteIP(entry.id, entry.ip)} className="rounded-lg p-1.5 text-red-400 hover:bg-red-500/10 transition-colors" title="حذف">{Icons.trash}</button>
                  </div>
                ))}
                {ipWhitelist.length === 0 && <p className="text-xs text-white/40 text-center py-6">لا توجد عناوين IP في القائمة البيضاء</p>}
              </div>
            </motion.div>
          )}

          {/* ====== ACTIVITIES ====== */}
          {activeTab === "activities" && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                <button onClick={() => setActivityFilter("all")} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${activityFilter === "all" ? "bg-[#d4a017]/10 text-[#d4a017]" : "bg-white/5 text-white/50 hover:bg-white/10"}`}>الكل</button>
                <button onClick={() => setActivityFilter("admin_login")} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${activityFilter === "admin_login" ? "bg-[#d4a017]/10 text-[#d4a017]" : "bg-white/5 text-white/50 hover:bg-white/10"}`}>دخول أدمن</button>
                <button onClick={() => setActivityFilter("user_create")} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${activityFilter === "user_create" ? "bg-[#d4a017]/10 text-[#d4a017]" : "bg-white/5 text-white/50 hover:bg-white/10"}`}>إنشاء مستخدم</button>
                <button onClick={() => setActivityFilter("setting_updated")} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${activityFilter === "setting_updated" ? "bg-[#d4a017]/10 text-[#d4a017]" : "bg-white/5 text-white/50 hover:bg-white/10"}`}>تحديث إعداد</button>
                <button onClick={() => setActivityFilter("registration")} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${activityFilter === "registration" ? "bg-[#d4a017]/10 text-[#d4a017]" : "bg-white/5 text-white/50 hover:bg-white/10"}`}>تسجيل جديد</button>
              </div>

              <div className="rounded-xl border border-white/5 bg-[#0f1f3d] p-4">
                <div className="space-y-2">
                  {filteredActivities.map((a) => (
                    <div key={a.id} className="flex items-start justify-between rounded-lg bg-white/[0.02] px-3 py-2.5">
                      <div className="flex items-start gap-3">
                        <div className={`h-7 w-7 rounded-lg flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5 ${a.adminName ? "bg-[#d4a017]/10 text-[#d4a017]" : "bg-[#2db8ff]/10 text-[#2db8ff]"}`}>
                          {a.adminName ? "👤" : "⚡"}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white/90">{actionLabels[a.action] || a.action}</p>
                          {a.details && <p className="text-[10px] text-white/40 mt-0.5 max-w-md">{a.details}</p>}
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            {a.adminName && <span className="text-[9px] text-[#d4a017]/70 bg-[#d4a017]/5 px-1.5 py-0.5 rounded">بواسطة: {a.adminName}</span>}
                            {a.adminUserId && <span className="text-[9px] text-white/20 font-mono" dir="ltr">ID: {a.adminUserId}</span>}
                            {a.ipAddress && <span className="text-[9px] text-white/20 font-mono" dir="ltr">IP: {a.ipAddress}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="text-left flex-shrink-0">
                        <p className="text-[10px] text-white/30">{new Date(a.createdAt).toLocaleString("ar-EG")}</p>
                      </div>
                    </div>
                  ))}
                  {filteredActivities.length === 0 && <p className="text-xs text-white/40 text-center py-6">لا توجد أنشطة</p>}
                </div>
              </div>
            </motion.div>
          )}

          {/* ====== DANGER ZONE ====== */}
          {activeTab === "danger" && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6 text-center">
                <svg className="h-12 w-12 text-red-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
                <h3 className="text-lg font-bold text-red-400 mb-2">منطقة الخطر</h3>
                <p className="text-xs text-white/50 mb-6">تحذير: الإجراءات التالية لا يمكن التراجع عنها. استخدمها بحذر شديد.</p>
              </div>

              <div className="rounded-xl border border-red-500/10 bg-[#0f1f3d] p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-red-400">مسح جميع التسجيلات</h4>
                    <p className="text-[10px] text-white/40">حذف كل بيانات التسجيل من قاعدة البيانات (لا يمكن التراجع)</p>
                  </div>
                  <button onClick={handleDeleteAllRegistrations} className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-2 text-xs text-red-400 hover:bg-red-500/20 transition-colors">مسح الكل</button>
                </div>
              </div>

              <div className="rounded-xl border border-red-500/10 bg-[#0f1f3d] p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-red-400">مسح سجل محاولات الدخول</h4>
                    <p className="text-[10px] text-white/40">حذف سجل من دخل ومن لم يدخل</p>
                  </div>
                  <button onClick={async () => { if (!confirm("هل أنت متأكد من مسح سجل الدخول؟")) return; try { await fetch("/api/admin/login-attempts", { method: "DELETE" }); addNotif("تم مسح سجل الدخول"); fetchAllData(); } catch {} }} className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-2 text-xs text-red-400 hover:bg-red-500/20 transition-colors">مسح السجل</button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
