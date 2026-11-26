"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Building2,
  LayoutDashboard,
  CreditCard,
  Wrench,
  BellRing,
  Settings,
  Search,
  Plus,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Printer,
  X,
  ShieldCheck,
  Send,
  Check,
  Sparkles,
  Calendar,
  DollarSign,
  Trash2,
  UserCheck,
  ExternalLink,
  Save,
  Pencil,
  Users,
  Lock,
  LogOut,
  KeyRound,
  History,
  Archive,
} from "lucide-react";
import { supabase } from "../lib/supabaseClient";

const DEFAULT_MALL_CONFIG = {
  mallName: "مول الماسة 1",
  floors: [
    { id: "ground", name: "الدور الأرضي", category: "تجاري (محلات)", unitsCount: 40, notes: "محلات تجارية رئيسية" },
    { id: "duplex", name: "دور الدوبليكس", category: "دوبليكس تجاري", unitsCount: 20, notes: "ملحق علوي لبعض الوحدات التجارية بالدور الأرضي" },
    { id: "first", name: "الدور الأول العلوي", category: "إداري", unitsCount: 30, notes: "مكاتب وخدمات" },
    { id: "second", name: "الدور الثاني", category: "إداري", unitsCount: 30, notes: "وحدات إدارية وخدمات" },
  ],
};

const ALL_PERMISSION_KEYS = [
  { key: "canViewBilling", label: "عرض التحصيل والفواتير" },
  { key: "canManageBilling", label: "إضافة وتحصيل الفواتير" },
  { key: "canManageUnits", label: "إضافة وتعديل الوحدات والملاك" },
  { key: "canManageTickets", label: "إدارة بلاغات الصيانة" },
  { key: "canManageAnnouncements", label: "إرسال وإدارة التنبيهات" },
  { key: "canManageSettings", label: "تعديل إعدادات المول والأدوار" },
  { key: "canDelete", label: "حذف السجلات" },
  { key: "canManageUsers", label: "إدارة المستخدمين والصلاحيات" },
];

const INITIAL_USERS = [
  {
    id: "USR-ADMIN",
    name: "مدير النظام الرئيسي",
    roleTitle: "إدارة المول",
    badge: "Admin Access",
    password: "admin",
    permissions: {
      canViewBilling: true,
      canManageBilling: true,
      canManageUnits: true,
      canManageTickets: true,
      canManageAnnouncements: true,
      canManageSettings: true,
      canDelete: true,
      canManageUsers: true,
    },
  },
  {
    id: "USR-MAINT",
    name: "مسؤول الصيانة والتشغيل",
    roleTitle: "فريق الصيانة",
    badge: "Maintenance",
    password: "1234",
    permissions: {
      canViewBilling: false,
      canManageBilling: false,
      canManageUnits: false,
      canManageTickets: true,
      canManageAnnouncements: false,
      canManageSettings: false,
      canDelete: false,
      canManageUsers: false,
    },
  },
  {
    id: "USR-ACC",
    name: "مسؤول الحسابات والتحصيل",
    roleTitle: "الحسابات",
    badge: "Billing",
    password: "1234",
    permissions: {
      canViewBilling: true,
      canManageBilling: true,
      canManageUnits: false,
      canManageTickets: false,
      canManageAnnouncements: true,
      canManageSettings: false,
      canDelete: false,
      canManageUsers: false,
    },
  },
];

const INITIAL_UNITS = [
  {
    id: "G-04",
    tenant: "مطعم كوك اند غروب",
    ownershipType: "مستأجر",
    isSubleased: false,
    subtenantName: "",
    subleaseRent: 0,
    subleaseExpireDate: "",
    type: "تجاري",
    area: "120 م² + دوبليكس",
    rent: 35000,
    status: "نشط",
    expireDate: "2026-12-15",
    floor: "الدور الأرضي",
    phone: "01012345678",
    portalPassword: "1234",
    contractHistory: [],
  },
  {
    id: "F-12",
    tenant: "مكتب الفرسان للهندسة",
    ownershipType: "مستأجر",
    isSubleased: false,
    subtenantName: "",
    subleaseRent: 0,
    subleaseExpireDate: "",
    type: "إداري",
    area: "85 م²",
    rent: 18000,
    status: "تنبيه تجديد",
    expireDate: "2026-12-10",
    floor: "الدور الأول العلوي",
    phone: "01123456789",
    portalPassword: "1234",
    contractHistory: [],
  },
  {
    id: "F-08",
    tenant: "شركة Valict للحلول التقنية",
    ownershipType: "مالك",
    isSubleased: false,
    subtenantName: "",
    subleaseRent: 0,
    subleaseExpireDate: "",
    type: "إداري",
    area: "150 م²",
    rent: 0,
    status: "مملوكة للمالك",
    expireDate: "",
    floor: "الدور الأول العلوي",
    phone: "01099998877",
    portalPassword: "1234",
    contractHistory: [],
  },
  {
    id: "G-09",
    tenant: "م. محمود عبد الله (مالك)",
    ownershipType: "مالك",
    isSubleased: true,
    subtenantName: "سوبرماركت الراية",
    subleaseRent: 65000,
    subleaseExpireDate: "2027-05-20",
    type: "تجاري",
    area: "300 م²",
    rent: 0,
    status: "مؤجرة للغير",
    expireDate: "",
    floor: "الدور الأرضي",
    phone: "01234567890",
    portalPassword: "1234",
    contractHistory: [],
  },
  {
    id: "S-02",
    tenant: "صيدلية مصر",
    ownershipType: "مستأجر",
    isSubleased: false,
    subtenantName: "",
    subleaseRent: 0,
    subleaseExpireDate: "",
    type: "تجاري",
    area: "90 م²",
    rent: 28000,
    status: "نشط",
    expireDate: "2027-01-15",
    floor: "الدور الأرضي",
    phone: "01055554433",
    portalPassword: "1234",
    contractHistory: [],
  },
  {
    id: "F-05",
    tenant: "عيادة د. أحمد زكي - أسنان",
    ownershipType: "مستأجر",
    isSubleased: false,
    subtenantName: "",
    subleaseRent: 0,
    subleaseExpireDate: "",
    type: "إداري",
    area: "65 م²",
    rent: 15000,
    status: "متأخر في السداد",
    expireDate: "2026-11-30",
    floor: "الدور الثاني",
    phone: "01188887766",
    portalPassword: "1234",
    contractHistory: [],
  },
  {
    id: "S-14",
    tenant: "كافيه كوستا",
    ownershipType: "مستأجر",
    isSubleased: false,
    subtenantName: "",
    subleaseRent: 0,
    subleaseExpireDate: "",
    type: "تجاري",
    area: "110 م²",
    rent: 32000,
    status: "نشط",
    expireDate: "2026-12-28",
    floor: "الدور الأرضي",
    phone: "01044443322",
    portalPassword: "1234",
    contractHistory: [],
  },
];

const INITIAL_INVOICES = [
  { id: "INV-2026-001", unitId: "G-04", tenant: "مطعم كوك اند غروب", amount: 35000, type: "إيجار شهر نوفمبر", dueDate: "2026-11-05", status: "مدفوع", paymentDate: "2026-11-03" },
  { id: "INV-2026-002", unitId: "F-12", tenant: "مكتب الفرسان للهندسة", amount: 18000, type: "إيجار شهر نوفمبر", dueDate: "2026-11-05", status: "مدفوع", paymentDate: "2026-11-04" },
  { id: "INV-2026-003", unitId: "F-05", tenant: "عيادة د. أحمد زكي", amount: 15000, type: "إيجار + صيانة", dueDate: "2026-11-01", status: "متأخر", paymentDate: "-" },
  { id: "INV-2026-004", unitId: "G-09", tenant: "م. محمود عبد الله (مالك)", amount: 65000, type: "رسوم إدارة وتأجير وحدة", dueDate: "2026-11-10", status: "مدفوع", paymentDate: "2026-11-08" },
  { id: "INV-2026-005", unitId: "S-14", tenant: "كافيه كوستا", amount: 32000, type: "صيانة ومرافق", dueDate: "2026-11-15", status: "قيد الانتظار", paymentDate: "-" },
];

const INITIAL_TICKETS = [
  { id: "TCK-101", unitId: "G-04", title: "عطل في التكييف المركزي بالفرع", priority: "عاجل", status: "new", category: "تكييف", date: "منذ ساعتين", assignedTo: "م. أحمد حسن", billingType: "ضمن العقد", serviceFee: 0, paymentStatus: "مدفوع" },
  { id: "TCK-102", unitId: "F-12", title: "تركيب وحدة إنارة إضافية خارج العقد", priority: "متوسط", status: "in_progress", category: "كهرباء", date: "منذ 5 ساعات", assignedTo: "فني الكهرباء (علي)", billingType: "مدفوع", serviceFee: 1800, paymentStatus: "غير مدفوع" },
  { id: "TCK-103", unitId: "S-02", title: "إنارة المدخل الخارجي للصيدلية", priority: "منخفض", status: "in_progress", category: "كهرباء", date: "أمس", assignedTo: "فني الكهرباء (علي)", billingType: "ضمن العقد", serviceFee: 0, paymentStatus: "مدفوع" },
  { id: "TCK-104", unitId: "G-09", title: "فحص الحساسات الخاصة بالحريق", priority: "عاجل", status: "resolved", category: "سلامة", date: "منذ يومين", assignedTo: "فريق السلامة المهنية", billingType: "ضمن العقد", serviceFee: 0, paymentStatus: "مدفوع" },
];

const INITIAL_ANNOUNCEMENTS = [
  { id: 1, title: "صيانة دورية للمولدات الكهربائية الاحتياطية", content: "نحيطكم علماً بأنه سيتم إجراء صيانة دورية للمولدات يوم السبت القادم من الساعة 2:00 صباحاً وحتى 4:00 صباحاً.", date: "2026-11-24", priority: "هام", target: "جميع المستأجرين" },
  { id: 2, title: "مواعيد العمل الشتوية الخاصة بالمول", content: "تم تحديث مواعيد فتح وإغلاق أبواب المول الرئيسية لتكون من الساعة 9:00 صباحاً وحتى 11:00 مساءً.", date: "2026-11-20", priority: "عادي", target: "القطاع التجاري" },
];

const mapUserToDb = (u) => ({
  id: u.id,
  name: u.name,
  role_title: u.roleTitle,
  badge: u.badge,
  password: u.password,
  permissions: u.permissions,
});

const mapUserFromDb = (row) => ({
  id: row.id,
  name: row.name,
  roleTitle: row.role_title || "مستخدم",
  badge: row.badge || "Staff",
  password: row.password || "1234",
  permissions: {
    canViewBilling: Boolean(row.permissions?.canViewBilling),
    canManageBilling: Boolean(row.permissions?.canManageBilling),
    canManageUnits: Boolean(row.permissions?.canManageUnits),
    canManageTickets: Boolean(row.permissions?.canManageTickets),
    canManageAnnouncements: Boolean(row.permissions?.canManageAnnouncements),
    canManageSettings: Boolean(row.permissions?.canManageSettings),
    canDelete: Boolean(row.permissions?.canDelete),
    canManageUsers: Boolean(row.permissions?.canManageUsers),
  },
});

const mapUnitToDb = (u) => ({
  id: u.id,
  tenant: u.tenant,
  ownership_type: u.ownershipType || "مستأجر",
  is_subleased: Boolean(u.isSubleased),
  subtenant_name: u.subtenantName || "",
  sublease_rent: Number(u.subleaseRent) || 0,
  sublease_expire_date: u.subleaseExpireDate || "",
  type: u.type,
  area: u.area || "",
  rent: u.ownershipType === "مالك" ? 0 : Number(u.rent) || 0,
  status: u.status || (u.ownershipType === "مالك" ? (u.isSubleased ? "مؤجرة للغير" : "مملوكة للمالك") : "نشط"),
  expire_date: u.ownershipType === "مالك" ? "" : u.expireDate || "",
  floor: u.floor || "الدور الأرضي",
  phone: u.phone || "",
  portal_password: u.portalPassword || "1234",
});

const mapUnitFromDb = (row) => {
  const ownershipType = row.ownership_type || "مستأجر";
  const isSubleased = Boolean(row.is_subleased);
  return {
    id: row.id,
    tenant: row.tenant,
    ownershipType,
    isSubleased,
    subtenantName: row.subtenant_name || "",
    subleaseRent: Number(row.sublease_rent) || 0,
    subleaseExpireDate: row.sublease_expire_date || "",
    type: row.type,
    area: row.area || "",
    rent: ownershipType === "مالك" ? 0 : Number(row.rent) || 0,
    status: row.status || (ownershipType === "مالك" ? (isSubleased ? "مؤجرة للغير" : "مملوكة للمالك") : "نشط"),
    expireDate: ownershipType === "مالك" ? "" : row.expire_date || "",
    floor: row.floor || "الدور الأرضي",
    phone: row.phone || "",
    portalPassword: row.portal_password || "1234",
    contractHistory: Array.isArray(row.contract_history) ? row.contract_history : [],
  };
};

const mapInvoiceToDb = (inv) => ({
  id: inv.id,
  unit_id: inv.unitId,
  tenant: inv.tenant,
  amount: Number(inv.amount) || 0,
  type: inv.type,
  due_date: inv.dueDate,
  status: inv.status,
  payment_date: inv.paymentDate || "-",
});

const mapInvoiceFromDb = (row) => ({
  id: row.id,
  unitId: row.unit_id,
  tenant: row.tenant,
  amount: Number(row.amount) || 0,
  type: row.type,
  dueDate: row.due_date,
  status: row.status,
  paymentDate: row.payment_date || "-",
});

const mapTicketToDb = (t) => ({
  id: t.id,
  unit_id: t.unitId,
  title: t.title,
  priority: t.priority,
  status: t.status,
  category: t.category || "عام",
  date_label: t.date || "الآن",
  assigned_to: t.assignedTo || "فريق الصيانة",
  billing_type: t.billingType || "ضمن العقد",
  service_fee: Number(t.serviceFee) || 0,
  payment_status: t.paymentStatus || "مدفوع",
});

const mapTicketFromDb = (row) => ({
  id: row.id,
  unitId: row.unit_id,
  title: row.title,
  priority: row.priority,
  status: row.status,
  category: row.category || "عام",
  date: row.date_label || "الآن",
  assignedTo: row.assigned_to || "فريق الصيانة",
  billingType: row.billing_type || "ضمن العقد",
  serviceFee: Number(row.service_fee) || 0,
  paymentStatus: row.payment_status || "مدفوع",
});

function BrandLogoBlock({ compact = false }) {
  return (
    <div className="flex flex-col items-center text-center gap-1.5">
      <img
        src="/valict-logo.png"
        alt="MMS Logo"
        className={`${compact ? "h-12" : "h-14"} w-auto max-w-[190px] object-contain`}
      />
      <div>
        <div className="text-base font-black tracking-widest text-white leading-tight">MMS</div>
        <div className="text-[11px] text-slate-400 font-medium leading-tight">Mall Management System</div>
      </div>
    </div>
  );
}

export default function App() {
  const [users, setUsers] = useState(INITIAL_USERS);
  const [selectedUserId, setSelectedUserId] = useState(INITIAL_USERS[0].id);
  const [loginPasswordInput, setLoginPasswordInput] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loggedInUserId, setLoggedInUserId] = useState("");

  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [noticeMessage, setNoticeMessage] = useState("");
  const [dbConnected, setDbConnected] = useState(false);

  const [mallConfig, setMallConfig] = useState(DEFAULT_MALL_CONFIG);
  const [draftConfig, setDraftConfig] = useState(DEFAULT_MALL_CONFIG);

  const [units, setUnits] = useState(INITIAL_UNITS);
  const [invoices, setInvoices] = useState(INITIAL_INVOICES);
  const [tickets, setTickets] = useState(INITIAL_TICKETS);
  const [announcements, setAnnouncements] = useState(INITIAL_ANNOUNCEMENTS);

  const [showAddUnitModal, setShowAddUnitModal] = useState(false);
  const [editingUnitOriginalId, setEditingUnitOriginalId] = useState(null);
  const [editUnitForm, setEditUnitForm] = useState(null);

  const [showAddInvoiceModal, setShowAddInvoiceModal] = useState(false);
  const [showAddTicketModal, setShowAddTicketModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [unitFilter, setUnitFilter] = useState("الكل");
  const [invoiceFilter, setInvoiceFilter] = useState("الكل");

  const [newUserForm, setNewUserForm] = useState({
    name: "",
    roleTitle: "موظف تشغيل",
    badge: "Staff",
    password: "",
    permissions: {
      canViewBilling: true,
      canManageBilling: false,
      canManageUnits: true,
      canManageTickets: true,
      canManageAnnouncements: false,
      canManageSettings: false,
      canDelete: false,
      canManageUsers: false,
    },
  });

  const [newUnit, setNewUnit] = useState({
    id: "",
    tenant: "",
    ownershipType: "مستأجر",
    isSubleased: false,
    subtenantName: "",
    subleaseRent: "",
    subleaseExpireDate: "",
    type: "تجاري",
    area: "",
    rent: "",
    expireDate: "",
    floor: DEFAULT_MALL_CONFIG.floors[0].name,
    phone: "",
    portalPassword: "",
  });

  const [newInvoice, setNewInvoice] = useState({
    unitId: "G-04",
    amount: "",
    type: "إيجار شهري",
    dueDate: "2026-12-05",
    status: "قيد الانتظار",
  });

  const [newTicket, setNewTicket] = useState({
    unitId: "G-04",
    title: "",
    priority: "متوسط",
    category: "تكييف",
    assignedTo: "فريق الصيانة",
    billingType: "ضمن العقد",
    serviceFee: "",
    paymentStatus: "مدفوع",
  });

  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    content: "",
    priority: "عادي",
    target: "جميع المستأجرين",
  });

  const currentUser = useMemo(
    () => users.find((u) => u.id === loggedInUserId) || null,
    [users, loggedInUserId]
  );

  const handleSelectTab = useCallback((tabName) => {
    setActiveTab(tabName);
    setSearchQuery("");
    if (tabName !== "units") {
      setUnitFilter("الكل");
    }
    if (tabName !== "billing") {
      setInvoiceFilter("الكل");
    }
  }, []);

  const loadFromSupabase = useCallback(async () => {
    if (!supabase) return;

    const [settingsRes, unitsRes, invoicesRes, ticketsRes, announcementsRes, usersRes] = await Promise.all([
      supabase.from("mall_settings").select("*").eq("id", 1).maybeSingle(),
      supabase.from("units").select("*"),
      supabase.from("invoices").select("*"),
      supabase.from("tickets").select("*"),
      supabase.from("announcements").select("*").order("id", { ascending: false }),
      supabase.from("portal_users").select("*"),
    ]);

    if (unitsRes.error || invoicesRes.error || ticketsRes.error || announcementsRes.error) {
      setNoticeMessage("تعذر قراءة بعض جداول Supabase؛ تأكد من تنفيذ كود إنشاء الجداول والصلاحيات.");
      return;
    }

    setDbConnected(true);

    if (!settingsRes.error && settingsRes.data?.floors) {
      const loadedConfig = {
        mallName: settingsRes.data.mall_name || DEFAULT_MALL_CONFIG.mallName,
        floors: settingsRes.data.floors,
      };
      setMallConfig(loadedConfig);
      setDraftConfig(loadedConfig);
    }

    if (!usersRes.error) {
      if (usersRes.data.length === 0) {
        await supabase.from("portal_users").insert(INITIAL_USERS.map(mapUserToDb));
        setUsers(INITIAL_USERS);
      } else {
        const mapped = usersRes.data.map(mapUserFromDb);
        setUsers(mapped);
        setSelectedUserId((prev) => (mapped.some((m) => m.id === prev) ? prev : mapped[0].id));
      }
    }

    if (unitsRes.data.length === 0) {
      await supabase.from("units").insert(INITIAL_UNITS.map(mapUnitToDb));
      setUnits(INITIAL_UNITS);
    } else {
      setUnits(unitsRes.data.map(mapUnitFromDb));
    }

    if (invoicesRes.data.length === 0) {
      await supabase.from("invoices").insert(INITIAL_INVOICES.map(mapInvoiceToDb));
      setInvoices(INITIAL_INVOICES);
    } else {
      setInvoices(invoicesRes.data.map(mapInvoiceFromDb));
    }

    if (ticketsRes.data.length === 0) {
      await supabase.from("tickets").insert(INITIAL_TICKETS.map(mapTicketToDb));
      setTickets(INITIAL_TICKETS);
    } else {
      setTickets(ticketsRes.data.map(mapTicketFromDb));
    }

    if (announcementsRes.data.length === 0) {
      await supabase.from("announcements").insert(INITIAL_ANNOUNCEMENTS);
      setAnnouncements(INITIAL_ANNOUNCEMENTS);
    } else {
      setAnnouncements(announcementsRes.data);
    }
  }, []);

  useEffect(() => {
    loadFromSupabase();
  }, [loadFromSupabase]);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    const target = users.find((u) => u.id === selectedUserId);
    if (!target) {
      setLoginError("اختر مستخدماً صحيحاً.");
      return;
    }
    if (String(target.password || "") !== loginPasswordInput) {
      setLoginError("كلمة المرور غير صحيحة لهذا المستخدم.");
      return;
    }
    setLoginError("");
    setLoginPasswordInput("");
    setSearchQuery("");
    setActiveTab("overview");
    setLoggedInUserId(target.id);
  };

  const handleLogoutUser = () => {
    setLoggedInUserId("");
    setLoginPasswordInput("");
    setLoginError("");
    setSearchQuery("");
    setActiveTab("overview");
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUserForm.name.trim() || !newUserForm.password.trim()) return;

    const created = {
      id: `USR-${Math.floor(1000 + Math.random() * 8999)}`,
      name: newUserForm.name.trim(),
      roleTitle: newUserForm.roleTitle.trim() || "مستخدم",
      badge: newUserForm.badge.trim() || "Custom Role",
      password: newUserForm.password.trim(),
      permissions: { ...newUserForm.permissions },
    };

    setUsers((prev) => [...prev, created]);

    if (supabase) {
      const { error } = await supabase.from("portal_users").upsert(mapUserToDb(created));
      setNoticeMessage(
        error
          ? `تم إنشاء المستخدم محلياً لكن فشل حفظه في Supabase: ${error.message}`
          : `تم إنشاء المستخدم "${created.name}" وحفظ صلاحياته في قاعدة البيانات.`
      );
    } else {
      setNoticeMessage(`تم إنشاء المستخدم "${created.name}".`);
    }

    setNewUserForm({
      name: "",
      roleTitle: "موظف تشغيل",
      badge: "Staff",
      password: "",
      permissions: {
        canViewBilling: true,
        canManageBilling: false,
        canManageUnits: true,
        canManageTickets: true,
        canManageAnnouncements: false,
        canManageSettings: false,
        canDelete: false,
        canManageUsers: false,
      },
    });
  };

  const handleToggleUserPermission = async (userId, permKey) => {
    const target = users.find((u) => u.id === userId);
    if (!target) return;

    const nextPerms = {
      ...target.permissions,
      [permKey]: !target.permissions[permKey],
    };

    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, permissions: nextPerms } : u))
    );

    if (supabase) {
      await supabase.from("portal_users").update({ permissions: nextPerms }).eq("id", userId);
    }
  };

  const totalConfiguredUnits = useMemo(() => {
    const sum = mallConfig.floors.reduce((acc, f) => acc + (Number(f.unitsCount) || 0), 0);
    return sum > 0 ? sum : 120;
  }, [mallConfig]);

  const dynamicKpis = useMemo(() => {
    const occupiedCount = units.length;
    const occupancyRate = ((occupiedCount / totalConfiguredUnits) * 100).toFixed(1);

    const totalBilled = invoices.reduce((sum, inv) => sum + inv.amount, 0);
    const totalCollected = invoices.filter((i) => i.status === "مدفوع").reduce((sum, inv) => sum + inv.amount, 0);
    const totalPending = totalBilled - totalCollected;

    const openTicketsCount = tickets.filter((t) => t.status !== "resolved").length;
    const expiringLeasesCount = units.filter(
      (u) =>
        u.status.includes("تنبيه") ||
        (u.ownershipType === "مستأجر" && u.expireDate.startsWith("2026-12")) ||
        (u.ownershipType === "مالك" && u.isSubleased && u.subleaseExpireDate.startsWith("2026-12"))
    ).length;

    return { occupiedCount, occupancyRate, totalBilled, totalCollected, totalPending, openTicketsCount, expiringLeasesCount };
  }, [units, invoices, tickets, totalConfiguredUnits]);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    const cleanedFloors = draftConfig.floors.map((f) => ({
      ...f,
      name: f.name.trim() || "دور",
      unitsCount: Math.max(0, Number(f.unitsCount) || 0),
    }));
    const updatedConfig = {
      mallName: draftConfig.mallName.trim() || DEFAULT_MALL_CONFIG.mallName,
      floors: cleanedFloors,
    };

    setMallConfig(updatedConfig);
    setDraftConfig(updatedConfig);

    if (supabase) {
      const { error } = await supabase.from("mall_settings").upsert({
        id: 1,
        mall_name: updatedConfig.mallName,
        floors: updatedConfig.floors,
        updated_at: new Date().toISOString(),
      });
      setNoticeMessage(
        error
          ? `تم حفظ الإعدادات محلياً لكن فشل حفظها في قاعدة البيانات: ${error.message}`
          : "تم حفظ إعدادات المول والأدوار وعدد الوحدات لكل دور بنجاح."
      );
    } else {
      setNoticeMessage("تم تحديث إعدادات المول.");
    }
  };

  const handleAddFloorRow = () => {
    setDraftConfig((prev) => ({
      ...prev,
      floors: [
        ...prev.floors,
        {
          id: `floor-${Date.now()}`,
          name: `دور جديد ${prev.floors.length + 1}`,
          category: "إداري",
          unitsCount: 20,
          notes: "",
        },
      ],
    }));
  };

  const handleAddUnit = async (e) => {
    e.preventDefault();
    if (!newUnit.id.trim() || !newUnit.tenant.trim()) return;

    const isOwner = newUnit.ownershipType === "مالك";
    const isSubleased = isOwner ? Boolean(newUnit.isSubleased) : false;

    const unitRecord = {
      ...newUnit,
      id: newUnit.id.trim(),
      tenant: newUnit.tenant.trim(),
      ownershipType: isOwner ? "مالك" : "مستأجر",
      isSubleased,
      subtenantName: isSubleased ? newUnit.subtenantName.trim() : "",
      subleaseRent: isSubleased ? Number(newUnit.subleaseRent) || 0 : 0,
      subleaseExpireDate: isSubleased ? newUnit.subleaseExpireDate : "",
      rent: isOwner ? 0 : Number(newUnit.rent) || 0,
      expireDate: isOwner ? "" : newUnit.expireDate,
      status: isOwner ? (isSubleased ? "مؤجرة للغير" : "مملوكة للمالك") : "نشط",
      portalPassword: newUnit.portalPassword.trim() || "1234",
      contractHistory: [],
    };

    setUnits((prev) => [...prev, unitRecord]);

    if (supabase) {
      const { error } = await supabase.from("units").upsert(mapUnitToDb(unitRecord));
      setNoticeMessage(
        error
          ? `تمت الإضافة محلياً لكن حدث خطأ في حفظ قاعدة البيانات: ${error.message}`
          : `تم حفظ الوحدة ${unitRecord.id} (${unitRecord.ownershipType}) في قاعدة البيانات بنجاح.`
      );
    }

    setNewUnit({
      id: "",
      tenant: "",
      ownershipType: "مستأجر",
      isSubleased: false,
      subtenantName: "",
      subleaseRent: "",
      subleaseExpireDate: "",
      type: "تجاري",
      area: "",
      rent: "",
      expireDate: "",
      floor: mallConfig.floors[0]?.name || "الدور الأرضي",
      phone: "",
      portalPassword: "",
    });
    setShowAddUnitModal(false);
  };

  const openEditUnitModal = (unit) => {
    setEditingUnitOriginalId(unit.id);
    setEditUnitForm({
      id: unit.id,
      tenant: unit.tenant || "",
      ownershipType: unit.ownershipType || "مستأجر",
      isSubleased: Boolean(unit.isSubleased),
      subtenantName: unit.subtenantName || "",
      subleaseRent: unit.subleaseRent ? String(unit.subleaseRent) : "",
      subleaseExpireDate: unit.subleaseExpireDate || "",
      type: unit.type || "تجاري",
      area: unit.area || "",
      rent: unit.rent ? String(unit.rent) : "",
      expireDate: unit.expireDate || "",
      floor: unit.floor || mallConfig.floors[0]?.name || "الدور الأرضي",
      phone: unit.phone || "",
      portalPassword: unit.portalPassword || "1234",
      status: unit.status || "نشط",
      contractHistory: Array.isArray(unit.contractHistory) ? unit.contractHistory : [],
      archiveCurrentContract: false,
      archiveReason: "انتهاء العقد / تغيير المشغل",
    });
  };

  const handleSaveEditedUnit = async (e) => {
    e.preventDefault();
    if (!editUnitForm || !editingUnitOriginalId || !editUnitForm.id.trim() || !editUnitForm.tenant.trim()) return;

    const newId = editUnitForm.id.trim();
    const isOwner = editUnitForm.ownershipType === "مالك";
    const isSubleased = isOwner ? Boolean(editUnitForm.isSubleased) : false;
    const previousUnit = units.find((u) => u.id === editingUnitOriginalId);

    let nextHistory = Array.isArray(editUnitForm.contractHistory) ? [...editUnitForm.contractHistory] : [];
    if (editUnitForm.archiveCurrentContract && previousUnit) {
      const today = new Date().toISOString().split("T")[0];
      const historyEntry = {
        id: `HIST-${Date.now()}`,
        partyName:
          previousUnit.ownershipType === "مالك" && previousUnit.isSubleased && previousUnit.subtenantName
            ? `${previousUnit.tenant} (مؤجر لـ: ${previousUnit.subtenantName})`
            : previousUnit.tenant,
        ownershipType: previousUnit.ownershipType,
        amount:
          previousUnit.ownershipType === "مالك"
            ? Number(previousUnit.subleaseRent || 0)
            : Number(previousUnit.rent || 0),
        endDate: previousUnit.expireDate || previousUnit.subleaseExpireDate || today,
        archivedAt: today,
        reason: editUnitForm.archiveReason || "إنهاء / أرشفة العقد السابق",
      };
      nextHistory = [historyEntry, ...nextHistory];
    }

    const nextStatus = isOwner
      ? isSubleased
        ? "مؤجرة للغير"
        : "مملوكة للمالك"
      : editUnitForm.status && !["مملوكة للمالك", "مؤجرة للغير"].includes(editUnitForm.status)
        ? editUnitForm.status
        : "نشط";

    const updatedRecord = {
      id: newId,
      tenant: editUnitForm.tenant.trim(),
      ownershipType: isOwner ? "مالك" : "مستأجر",
      isSubleased,
      subtenantName: isSubleased ? editUnitForm.subtenantName.trim() : "",
      subleaseRent: isSubleased ? Number(editUnitForm.subleaseRent) || 0 : 0,
      subleaseExpireDate: isSubleased ? editUnitForm.subleaseExpireDate : "",
      type: editUnitForm.type,
      area: editUnitForm.area.trim(),
      rent: isOwner ? 0 : Number(editUnitForm.rent) || 0,
      expireDate: isOwner ? "" : editUnitForm.expireDate,
      floor: editUnitForm.floor,
      phone: editUnitForm.phone.trim(),
      portalPassword: editUnitForm.portalPassword.trim() || "1234",
      status: nextStatus,
      contractHistory: nextHistory,
    };

    setUnits((prev) =>
      prev.map((u) => (u.id === editingUnitOriginalId ? updatedRecord : u))
    );

    if (supabase) {
      const { error: upsertErr } = await supabase.from("units").upsert(mapUnitToDb(updatedRecord));
      if (upsertErr) {
        setNoticeMessage(`تم التعديل محلياً لكن فشل الحفظ في قاعدة البيانات: ${upsertErr.message}`);
      } else {
        if (newId !== editingUnitOriginalId) {
          await supabase.from("units").delete().eq("id", editingUnitOriginalId);
        }
        setNoticeMessage(
          editUnitForm.archiveCurrentContract
            ? `تم أرشفة العقد/التشغيل السابق وحفظ تحديثات الوحدة ${updatedRecord.id} مع الاحتفاظ بالسجل التاريخي والفواتير.`
            : `تم تحديث بيانات الوحدة ${updatedRecord.id} (${updatedRecord.ownershipType}) بنجاح.`
        );
      }
    } else {
      setNoticeMessage(`تم تحديث بيانات الوحدة ${updatedRecord.id}.`);
    }

    setEditingUnitOriginalId(null);
    setEditUnitForm(null);
  };

  const handleRequestDeleteUnit = (unit) => {
    const unpaidInvoices = invoices.filter((inv) => inv.unitId === unit.id && inv.status !== "مدفوع");
    const openOrUnpaidTickets = tickets.filter(
      (t) => t.unitId === unit.id && (t.status !== "resolved" || (t.billingType === "مدفوع" && t.paymentStatus !== "مدفوع"))
    );

    if (unpaidInvoices.length > 0 || openOrUnpaidTickets.length > 0) {
      const unpaidTotal = unpaidInvoices.reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);
      const reasons = [];
      if (unpaidInvoices.length > 0) {
        reasons.push(`${unpaidInvoices.length} فاتورة غير محصلة بإجمالي ${unpaidTotal.toLocaleString()} ج.م`);
      }
      if (openOrUnpaidTickets.length > 0) {
        reasons.push(`${openOrUnpaidTickets.length} بلاغ صيانة مفتوح أو غير مسدد`);
      }
      setNoticeMessage(
        `لا يمكن حذف الوحدة ${unit.id} (${unit.tenant}) لوجود: ${reasons.join(" و")}؛ يجب تحصيل أو تسوية الفواتير وإغلاق البلاغات أولاً (أو أرشفة العقد السابق بدلاً من الحذف).`
      );
      return;
    }

    setDeleteTarget({ kind: "unit", id: unit.id, label: `الوحدة ${unit.id} (${unit.tenant})` });
  };

  const handleAddInvoice = async (e) => {
    e.preventDefault();
    const amountNum = Number(newInvoice.amount);
    if (!newInvoice.unitId || !amountNum || amountNum <= 0) return;

    const matchedUnit = units.find((u) => u.id === newInvoice.unitId);
    const tenantName = matchedUnit ? matchedUnit.tenant : `وحدة ${newInvoice.unitId}`;
    const invoiceId = `INV-2026-${String(invoices.length + 1).padStart(3, "0")}-${Math.floor(10 + Math.random() * 89)}`;
    const today = new Date().toISOString().split("T")[0];

    const invoiceRecord = {
      id: invoiceId,
      unitId: newInvoice.unitId,
      tenant: tenantName,
      amount: amountNum,
      type: newInvoice.type.trim() || "إيجار شهري",
      dueDate: newInvoice.dueDate || today,
      status: newInvoice.status,
      paymentDate: newInvoice.status === "مدفوع" ? today : "-",
    };

    setInvoices((prev) => [invoiceRecord, ...prev]);

    if (supabase) {
      const { error } = await supabase.from("invoices").upsert(mapInvoiceToDb(invoiceRecord));
      setNoticeMessage(
        error
          ? `تم إنشاء الفاتورة محلياً لكن فشل الحفظ في قاعدة البيانات: ${error.message}`
          : `تم إنشاء الفاتورة ${invoiceRecord.id} للوحدة ${invoiceRecord.unitId} وحفظها بنجاح.`
      );
    }

    setNewInvoice({ unitId: units[0]?.id || "G-04", amount: "", type: "إيجار شهري", dueDate: "2026-12-05", status: "قيد الانتظار" });
    setShowAddInvoiceModal(false);
  };

  const handlePayInvoice = async (invoiceId) => {
    const today = new Date().toISOString().split("T")[0];
    setInvoices((prev) => prev.map((inv) => (inv.id === invoiceId ? { ...inv, status: "مدفوع", paymentDate: today } : inv)));

    if (supabase) {
      const { error } = await supabase
        .from("invoices")
        .update({ status: "مدفوع", payment_date: today })
        .eq("id", invoiceId);

      setNoticeMessage(
        error
          ? `تم التحديث محلياً لكن فشل الحفظ في قاعدة البيانات: ${error.message}`
          : `تم تسجيل تحصيل الفاتورة ${invoiceId} وحفظه في قاعدة البيانات.`
      );
    }
  };

  const handleAddTicket = async (e) => {
    e.preventDefault();
    if (!newTicket.unitId || !newTicket.title.trim()) return;

    const isPaid = newTicket.billingType === "مدفوع";
    const feeValue = isPaid ? Number(newTicket.serviceFee) || 0 : 0;
    const paymentStatusValue = isPaid ? newTicket.paymentStatus : "مدفوع";

    const ticketId = `TCK-${Math.floor(200 + Math.random() * 799)}`;
    const ticketRecord = {
      id: ticketId,
      unitId: newTicket.unitId,
      title: newTicket.title.trim(),
      priority: newTicket.priority,
      status: "new",
      category: newTicket.category,
      date: "الآن",
      assignedTo: newTicket.assignedTo.trim() || "فريق الصيانة",
      billingType: isPaid ? "مدفوع" : "ضمن العقد",
      serviceFee: feeValue,
      paymentStatus: paymentStatusValue,
    };

    setTickets((prev) => [ticketRecord, ...prev]);

    let createdInvoiceId = null;
    if (isPaid && feeValue > 0 && paymentStatusValue === "غير مدفوع") {
      const matchedUnit = units.find((u) => u.id === ticketRecord.unitId);
      createdInvoiceId = `INV-SRV-${Math.floor(100 + Math.random() * 899)}`;
      const today = new Date().toISOString().split("T")[0];
      const serviceInvoice = {
        id: createdInvoiceId,
        unitId: ticketRecord.unitId,
        tenant: matchedUnit ? matchedUnit.tenant : `وحدة ${ticketRecord.unitId}`,
        amount: feeValue,
        type: `صيانة خارج العقد (${ticketRecord.id})`,
        dueDate: today,
        status: "قيد الانتظار",
        paymentDate: "-",
      };
      setInvoices((prev) => [serviceInvoice, ...prev]);
      if (supabase) {
        await supabase.from("invoices").upsert(mapInvoiceToDb(serviceInvoice));
      }
    }

    if (supabase) {
      const { error } = await supabase.from("tickets").upsert(mapTicketToDb(ticketRecord));
      setNoticeMessage(
        error
          ? `تم تسجيل البلاغ محلياً لكن فشل الحفظ في قاعدة البيانات: ${error.message}`
          : createdInvoiceId
            ? `تم إضافة البلاغ المدفوع ${ticketRecord.id} وإصدار فاتورة الصيانة ${createdInvoiceId}؛ لا يمكن إغلاقه قبل الدفع.`
            : `تم إضافة بلاغ الصيانة ${ticketRecord.id} وحفظه في قاعدة البيانات.`
      );
    }

    setNewTicket({
      unitId: units[0]?.id || "G-04",
      title: "",
      priority: "متوسط",
      category: "تكييف",
      assignedTo: "فريق الصيانة",
      billingType: "ضمن العقد",
      serviceFee: "",
      paymentStatus: "مدفوع",
    });
    setShowAddTicketModal(false);
  };

  const handleMarkTicketPaid = async (ticketId) => {
    const today = new Date().toISOString().split("T")[0];

    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, paymentStatus: "مدفوع" } : t))
    );
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.type.includes(`(${ticketId})`) ? { ...inv, status: "مدفوع", paymentDate: today } : inv
      )
    );

    if (supabase) {
      await supabase.from("tickets").update({ payment_status: "مدفوع" }).eq("id", ticketId);
      await supabase
        .from("invoices")
        .update({ status: "مدفوع", payment_date: today })
        .ilike("type", `%(${ticketId})%`);
    }

    setNoticeMessage(`تم تأكيد دفع رسوم الصيانة للبلاغ ${ticketId}؛ يمكنك الآن نقله إلى "تم الحل".`);
  };

  const handleAddAnnouncement = async (e) => {
    e.preventDefault();
    if (!newAnnouncement.title.trim() || !newAnnouncement.content.trim()) return;

    const announcementRecord = {
      id: Date.now(),
      ...newAnnouncement,
      date: new Date().toISOString().split("T")[0],
    };

    setAnnouncements((prev) => [announcementRecord, ...prev]);

    if (supabase) {
      const { error } = await supabase.from("announcements").insert(announcementRecord);
      setNoticeMessage(
        error
          ? `تم الإرسال محلياً لكن فشل الحفظ في قاعدة البيانات: ${error.message}`
          : "تم بث التنبيه وحفظه في قاعدة البيانات بنجاح."
      );
    }

    setNewAnnouncement({ title: "", content: "", priority: "عادي", target: "جميع المستأجرين" });
    setShowAnnouncementModal(false);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const { kind, id, label } = deleteTarget;
    setDeleteTarget(null);

    if (kind === "unit") {
      const unpaidInvoices = invoices.filter((inv) => inv.unitId === id && inv.status !== "مدفوع");
      const openOrUnpaidTickets = tickets.filter(
        (t) => t.unitId === id && (t.status !== "resolved" || (t.billingType === "مدفوع" && t.paymentStatus !== "مدفوع"))
      );
      if (unpaidInvoices.length > 0 || openOrUnpaidTickets.length > 0) {
        setNoticeMessage(`تم إيقاف حذف ${label} لوجود فواتير غير محصلة أو بلاغات صيانة معلقة.`);
        return;
      }
    }

    const tableMap = {
      unit: "units",
      invoice: "invoices",
      ticket: "tickets",
      announcement: "announcements",
      user: "portal_users",
    };

    if (kind === "unit") setUnits((prev) => prev.filter((item) => item.id !== id));
    if (kind === "invoice") {
      setInvoices((prev) => prev.filter((item) => item.id !== id));
      if (selectedInvoice?.id === id) {
        setSelectedInvoice(null);
        setShowInvoiceModal(false);
      }
    }
    if (kind === "ticket") setTickets((prev) => prev.filter((item) => item.id !== id));
    if (kind === "announcement") setAnnouncements((prev) => prev.filter((item) => item.id !== id));
    if (kind === "user") setUsers((prev) => prev.filter((item) => item.id !== id));

    const tableName = tableMap[kind];
    if (supabase && tableName) {
      const { error } = await supabase.from(tableName).delete().eq("id", id);
      setNoticeMessage(
        error
          ? `تم الحذف من العرض لكن تعذر الحذف من قاعدة البيانات: ${error.message}`
          : `تم حذف ${label} نهائياً من قاعدة البيانات.`
      );
    }
  };

  const moveTicket = async (ticketId, newStatus) => {
    const targetTicket = tickets.find((t) => t.id === ticketId);
    if (!targetTicket) return;

    if (
      newStatus === "resolved" &&
      targetTicket.billingType === "مدفوع" &&
      targetTicket.paymentStatus !== "مدفوع"
    ) {
      setNoticeMessage(
        `لا يمكن إغلاق البلاغ ${ticketId} لأن صيانته خارج العقد بقيمة ${Number(targetTicket.serviceFee || 0).toLocaleString()} ج.م ولم يتم تسجيل الدفع بعد.`
      );
      return;
    }

    setTickets((prev) => prev.map((t) => (t.id === ticketId ? { ...t, status: newStatus } : t)));

    if (supabase) {
      const { error } = await supabase.from("tickets").update({ status: newStatus }).eq("id", ticketId);
      if (error) {
        setNoticeMessage(`تعذر تحديث حالة التذكرة في قاعدة البيانات: ${error.message}`);
      }
    }
  };

  const filteredUnits = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return units.filter((u) => {
      const matchesSearch =
        !q ||
        u.tenant.toLowerCase().includes(q) ||
        u.id.toLowerCase().includes(q) ||
        (u.subtenantName && u.subtenantName.toLowerCase().includes(q));
      if (unitFilter === "الكل") return matchesSearch;
      if (unitFilter === "ملاك") return matchesSearch && u.ownershipType === "مالك";
      if (unitFilter === "مستأجرون") return matchesSearch && u.ownershipType !== "مالك";
      if (unitFilter === "مؤجرة للغير") return matchesSearch && u.ownershipType === "مالك" && u.isSubleased;
      if (unitFilter === "تنبيهات") return matchesSearch && u.status.includes("تنبيه");
      return matchesSearch && u.floor === unitFilter;
    });
  }, [units, searchQuery, unitFilter]);

  const filteredInvoices = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return invoices.filter((i) => {
      const matchesSearch = !q || i.tenant.toLowerCase().includes(q) || i.id.toLowerCase().includes(q) || i.unitId.toLowerCase().includes(q);
      if (invoiceFilter === "الكل") return matchesSearch;
      return matchesSearch && i.status === invoiceFilter;
    });
  }, [invoices, searchQuery, invoiceFilter]);

  const unitFilterOptions = useMemo(() => {
    const dynamicFloorNames = mallConfig.floors.map((f) => f.name);
    return ["الكل", "ملاك", "مستأجرون", "مؤجرة للغير", ...dynamicFloorNames, "تنبيهات"];
  }, [mallConfig]);

  if (!currentUser) {
    const chosenUser = users.find((u) => u.id === selectedUserId) || users[0];
    return (
      <div dir="rtl" className="min-h-screen bg-[#070F1B] text-slate-100 flex items-center justify-center p-4 font-sans">
        <div className="bg-[#0B192C] border border-slate-800 rounded-2xl p-6 w-full max-w-md space-y-5 shadow-2xl">
          <div className="flex flex-col items-center border-b border-slate-800 pb-4 gap-3 relative">
            <BrandLogoBlock compact />
            <Link href="/portal" className="text-xs text-[#00D8F6] hover:underline inline-flex items-center gap-1">
              بوابة الوحدة <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 mb-1.5 font-semibold">اختيار المستخدم</label>
              <select
                value={selectedUserId}
                onChange={(e) => {
                  setSelectedUserId(e.target.value);
                  setLoginError("");
                }}
                className="w-full bg-[#070F1B] border border-slate-700 rounded-xl p-3 text-slate-100 focus:outline-none focus:border-[#00D8F6]"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} — {u.roleTitle}
                  </option>
                ))}
              </select>
            </div>

            {chosenUser && (
              <div className="bg-[#070F1B] border border-slate-800 rounded-xl p-3 space-y-1.5">
                <p className="text-[10px] text-slate-400">صلاحيات الحساب المحدد:</p>
                <div className="flex flex-wrap gap-1.5">
                  {ALL_PERMISSION_KEYS.filter((p) => chosenUser.permissions[p.key]).map((p) => (
                    <span
                      key={p.key}
                      className="px-2 py-0.5 rounded bg-[#00D8F6]/10 text-[#00D8F6] border border-[#00D8F6]/20 text-[10px] font-semibold"
                    >
                      {p.label}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-slate-300 mb-1.5 font-semibold">كلمة المرور</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  required
                  type="password"
                  value={loginPasswordInput}
                  onChange={(e) => setLoginPasswordInput(e.target.value)}
                  placeholder="أدخل كلمة المرور"
                  className="w-full bg-[#070F1B] border border-slate-700 rounded-xl pr-10 pl-3 py-3 text-slate-100 focus:outline-none focus:border-[#00D8F6]"
                />
              </div>
            </div>

            {loginError && <p className="text-rose-400 text-[11px] font-semibold">{loginError}</p>}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#00D8F6] to-blue-600 text-slate-950 font-bold py-2.5 rounded-xl hover:brightness-110 transition"
            >
              دخول إلى لوحة التحكم
            </button>
          </form>
        </div>
      </div>
    );
  }

  const perms = currentUser.permissions;

  return (
    <div dir="rtl" className="min-h-screen bg-[#070F1B] text-slate-100 text-right flex flex-col md:flex-row selection:bg-[#00D8F6] selection:text-slate-950 font-sans">
      <aside className="w-full md:w-72 bg-[#0B192C] border-b md:border-b-0 md:border-l border-slate-800 flex flex-col justify-between shrink-0">
        <div>
          <div className="p-5 border-b border-slate-800/80 bg-gradient-to-r from-[#0B192C] to-[#1E3E62]/30">
            <BrandLogoBlock />

            <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 text-slate-300 font-semibold">
                <Building2 className="w-3.5 h-3.5 text-[#00D8F6]" />
                {mallConfig.mallName}
              </span>
              <span
                className={`w-2.5 h-2.5 rounded-full ${dbConnected ? "bg-emerald-400" : "bg-amber-400"}`}
                title={dbConnected ? "متصل بقاعدة بيانات Supabase" : "وضع محلي / بانتظار الربط"}
              ></span>
            </div>
          </div>

          <nav className="p-4 space-y-1.5">
            <NavItem icon={<LayoutDashboard className="w-5 h-5" />} label="لوحة التحكم الرئيسية" active={activeTab === "overview"} onClick={() => handleSelectTab("overview")} />
            <NavItem icon={<Building2 className="w-5 h-5" />} label="الوحدات والملاك والعقود" active={activeTab === "units"} onClick={() => handleSelectTab("units")} badge={units.length} />
            {perms.canViewBilling && (
              <NavItem
                icon={<CreditCard className="w-5 h-5" />}
                label="التحصيل والفواتير"
                active={activeTab === "billing"}
                onClick={() => handleSelectTab("billing")}
                badge={invoices.filter((i) => i.status === "متأخر").length}
                badgeColor="bg-rose-500/20 text-rose-400 border-rose-500/30"
              />
            )}
            <NavItem
              icon={<Wrench className="w-5 h-5" />}
              label="مركز الصيانة والخدمات"
              active={activeTab === "maintenance"}
              onClick={() => handleSelectTab("maintenance")}
              badge={dynamicKpis.openTicketsCount}
              badgeColor="bg-amber-500/20 text-amber-400 border-amber-500/30"
            />
            <NavItem icon={<BellRing className="w-5 h-5" />} label="التنبيهات والإعلانات" active={activeTab === "announcements"} onClick={() => handleSelectTab("announcements")} />
            {perms.canManageUsers && (
              <NavItem icon={<Users className="w-5 h-5" />} label="المستخدمون والصلاحيات" active={activeTab === "users"} onClick={() => handleSelectTab("users")} badge={users.length} />
            )}
            {perms.canManageSettings && (
              <NavItem icon={<Settings className="w-5 h-5" />} label="الإعدادات" active={activeTab === "settings"} onClick={() => handleSelectTab("settings")} />
            )}
          </nav>

          <div className="px-4 pb-4 space-y-2">
            <Link
              href="/portal"
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold bg-[#070F1B] hover:bg-slate-800 text-[#00D8F6] border border-[#00D8F6]/30 transition"
            >
              <span className="flex items-center gap-2">
                <UserCheck className="w-4 h-4" /> دخول المالك / المستأجر
              </span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <button
              type="button"
              onClick={handleLogoutUser}
              className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800/70 hover:bg-slate-800 text-rose-400 border border-slate-700/60 transition"
            >
              <span className="flex items-center gap-2">
                <LogOut className="w-3.5 h-3.5" /> تبديل المستخدم / خروج
              </span>
            </button>
          </div>
        </div>

        <div className="p-4 border-t border-slate-800/80 bg-[#070F1B]/50">
          <div className="bg-[#1E3E62]/30 rounded-xl p-3 border border-slate-700/50 flex items-center gap-3">
            <ShieldCheck className="w-7 h-7 text-[#00D8F6] shrink-0" />
            <div className="text-xs">
              <p className="font-semibold text-slate-200">{currentUser.name}</p>
              <p className="text-[10px] text-slate-400">{currentUser.roleTitle}</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="min-h-16 bg-[#0B192C]/90 backdrop-blur border-b border-slate-800 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-10">
          <div className="relative w-full sm:max-w-md flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="ابحث عن وحدة، مالك، مستأجر، أو فاتورة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#070F1B] border border-slate-700/80 rounded-xl pr-10 pl-8 py-2 text-xs text-slate-200 focus:outline-none focus:border-[#00D8F6]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  title="مسح البحث"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2.5 mr-auto sm:mr-0">
            {perms.canManageUnits && (
              <button type="button" onClick={() => setShowAddUnitModal(true)} className="bg-gradient-to-r from-[#00D8F6] to-blue-600 text-slate-950 font-bold px-3.5 py-2 rounded-lg text-xs flex items-center gap-1.5 hover:brightness-110 transition">
                <Plus className="w-4 h-4" /> وحدة جديدة
              </button>
            )}

            {perms.canManageAnnouncements && (
              <button type="button" onClick={() => setShowAnnouncementModal(true)} className="bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition">
                <Send className="w-3.5 h-3.5 text-[#00D8F6]" /> إرسال تنبيه
              </button>
            )}

            <div className="h-6 w-px bg-slate-800 mx-1 hidden sm:block"></div>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-xs text-white border border-white/10">
                {currentUser.name.slice(0, 2)}
              </div>
              <div className="hidden lg:block text-xs">
                <p className="font-semibold text-slate-200">{currentUser.name}</p>
                <p className="text-[10px] text-[#00D8F6]">{currentUser.badge}</p>
              </div>
            </div>
          </div>
        </header>

        {noticeMessage && (
          <div className="mx-4 sm:mx-6 lg:mx-8 mt-4 bg-[#0B192C] border border-[#00D8F6]/40 text-slate-200 px-4 py-2.5 rounded-xl text-xs flex items-center justify-between gap-3">
            <span>{noticeMessage}</span>
            <button type="button" onClick={() => setNoticeMessage("")} className="text-slate-400 hover:text-white text-xs shrink-0">إغلاق</button>
          </div>
        )}

        <div className="p-4 sm:p-6 lg:p-8 flex-1 space-y-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="relative bg-gradient-to-r from-[#1E3E62] via-[#0B192C] to-[#070F1B] rounded-2xl p-6 border border-slate-700/60 overflow-hidden shadow-xl">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#00D8F6] bg-[#00D8F6]/10 px-2.5 py-0.5 rounded-full border border-[#00D8F6]/20 mb-2">
                      <Sparkles className="w-3 h-3" /> MMS • Mall Management System
                    </span>
                    <h2 className="text-2xl font-black text-white">لوحة تحكم {mallConfig.mallName}</h2>
                    <p className="text-slate-300 text-xs mt-1 max-w-xl">
                      متابعة لحظية للأداء المالي، نسبة الإشغال، تذاكر الصيانة، الملاك والمستأجرين عبر نظام MMS.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs bg-[#070F1B]/70 p-3 rounded-xl border border-slate-700/50">
                    <Calendar className="w-4 h-4 text-[#00D8F6]" />
                    <div>
                      <p className="text-slate-400 text-[10px]">تاريخ التشغيل</p>
                      <p className="font-bold text-slate-200">نوفمبر 2026</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard
                  title="إجمالي الوحدات والإشغال"
                  value={`${dynamicKpis.occupancyRate}%`}
                  subtext={`${dynamicKpis.occupiedCount} مسجلة من أصل ${totalConfiguredUnits} وحدة`}
                  icon={<Building2 className="w-6 h-6 text-[#00D8F6]" />}
                  badge="تحديث لحظي"
                  badgeType="success"
                />
                {perms.canViewBilling ? (
                  <KpiCard
                    title="تحصيل الفواتير (الشهر الحالي)"
                    value={`${dynamicKpis.totalCollected.toLocaleString()} ج.م`}
                    subtext={`من إجمالي ${dynamicKpis.totalBilled.toLocaleString()} ج.م`}
                    icon={<DollarSign className="w-6 h-6 text-emerald-400" />}
                    badge={`متبقي ${dynamicKpis.totalPending.toLocaleString()} ج.م`}
                    badgeType="warning"
                  />
                ) : (
                  <KpiCard
                    title="صلاحية الحساب الحالي"
                    value={currentUser.roleTitle}
                    subtext="العرض المالي مقيد حسب الصلاحيات"
                    icon={<KeyRound className="w-6 h-6 text-emerald-400" />}
                    badge={currentUser.badge}
                    badgeType="neutral"
                  />
                )}
                <KpiCard
                  title="طلبات الصيانة المفتوحة"
                  value={`${dynamicKpis.openTicketsCount} طلبات`}
                  subtext="متابعة الأعطال الفنية والبلاغات"
                  icon={<Wrench className="w-6 h-6 text-amber-400" />}
                  badge="تحديث الكانبان"
                  badgeType="neutral"
                />
                <KpiCard
                  title="عقود تنتهي قريباً (30 يوم)"
                  value={`${dynamicKpis.expiringLeasesCount} عقود`}
                  subtext="تتطلب متابعة وإعادة التجديد"
                  icon={<AlertTriangle className="w-6 h-6 text-rose-400" />}
                  badge="إجراء مطلوب"
                  badgeType="danger"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-[#0B192C] border border-slate-800 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-[#00D8F6]" />
                        تحليل التدفق النقدي والتحصيل الشهري
                      </h3>
                      <p className="text-[11px] text-slate-400">مقارنة التحصيل الشهري خلال 6 أشهر</p>
                    </div>
                    <span className="text-xs bg-slate-800 text-slate-300 px-3 py-1 rounded-lg border border-slate-700">بالجنيه المصري</span>
                  </div>

                  <div className="grid grid-cols-6 gap-2 sm:gap-3 pt-4 px-1 items-end h-52">
                    {[
                      { month: "يونيو", amount: 410 },
                      { month: "يوليو", amount: 430 },
                      { month: "أغسطس", amount: 460 },
                      { month: "سبتمبر", amount: 440 },
                      { month: "أكتوبر", amount: 490 },
                      { month: "نوفمبر", amount: Math.round(dynamicKpis.totalCollected / 1000) },
                    ].map((item) => (
                      <div key={item.month} className="flex flex-col items-center gap-2 h-full justify-end">
                        <span className="text-[10px] text-slate-300 font-bold">{item.amount}k</span>
                        <div className="w-full max-w-[38px] bg-slate-800/90 rounded-t-lg h-36 flex items-end overflow-hidden">
                          <div className="w-full bg-gradient-to-t from-blue-700 to-[#00D8F6] rounded-t-lg" style={{ height: `${Math.min(100, Math.max(15, (item.amount / 550) * 100))}%` }}></div>
                        </div>
                        <span className="text-[11px] text-slate-400 font-medium">{item.month}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-[#0B192C] border border-slate-800 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
                      <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                        <Wrench className="w-3.5 h-3.5 text-amber-400" /> آخر طلبات الصيانة
                      </h4>
                      <button type="button" onClick={() => handleSelectTab("maintenance")} className="text-[10px] text-[#00D8F6] hover:underline">عرض الكل</button>
                    </div>
                    <div className="space-y-2.5">
                      {tickets.slice(0, 3).map((ticket) => (
                        <div key={ticket.id} className="bg-[#070F1B] p-2.5 rounded-xl border border-slate-800/80 flex items-center justify-between gap-2">
                          <div>
                            <p className="text-xs font-semibold text-slate-200">{ticket.title}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              الوحدة: {ticket.unitId} • {ticket.billingType === "مدفوع" ? `مدفوع (${ticket.paymentStatus})` : "ضمن العقد"}
                            </p>
                          </div>
                          <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold border shrink-0 ${ticket.priority === "عاجل" ? "bg-rose-500/20 text-rose-400 border-rose-500/30" : "bg-slate-800 text-slate-300 border-slate-700"}`}>
                            {ticket.priority}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "units" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0B192C] p-4 rounded-2xl border border-slate-800">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-[#00D8F6]" /> دليل الوحدات والملاك والعقود
                  </h2>
                  <p className="text-xs text-slate-400">حماية المستحقات من الحذف، وحفظ السجل التاريخي للعقود والتأجير على نفس الوحدة</p>
                </div>
                {perms.canManageUnits && (
                  <button type="button" onClick={() => setShowAddUnitModal(true)} className="bg-gradient-to-r from-[#00D8F6] to-blue-600 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 hover:brightness-110 transition">
                    <Plus className="w-4 h-4" /> إضافة وحدة جديدة
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {unitFilterOptions.map((filter) => (
                  <button key={filter} type="button" onClick={() => setUnitFilter(filter)} className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition ${unitFilter === filter ? "bg-[#00D8F6] text-slate-950 font-bold border-[#00D8F6]" : "bg-[#0B192C] text-slate-300 border-slate-800 hover:border-slate-700"}`}>
                    {filter === "تنبيهات" ? "تنبيهات التجديد" : filter}
                  </button>
                ))}
              </div>

              <div className="bg-[#0B192C] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-[#070F1B] text-slate-400 border-b border-slate-800 font-semibold">
                      <tr>
                        <th className="p-4">رقم الوحدة</th>
                        <th className="p-4">المالك / المستأجر</th>
                        <th className="p-4">الصفة</th>
                        <th className="p-4">تفاصيل الإيجار / التأجير</th>
                        <th className="p-4">نهاية العقد</th>
                        <th className="p-4">الحالة</th>
                        <th className="p-4 text-center">إجراء</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-200">
                      {filteredUnits.map((unit) => {
                        const isOwner = unit.ownershipType === "مالك";
                        const historyCount = Array.isArray(unit.contractHistory) ? unit.contractHistory.length : 0;
                        return (
                          <tr key={unit.id} className="hover:bg-slate-800/40 transition">
                            <td className="p-4 font-bold text-[#00D8F6]">
                              {unit.id}
                              <span className="block text-[10px] text-slate-400 font-normal">{unit.floor} • {unit.area}</span>
                              {historyCount > 0 && (
                                <span className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[9px]">
                                  <History className="w-2.5 h-2.5 text-[#00D8F6]" /> سجل سابق ({historyCount})
                                </span>
                              )}
                            </td>
                            <td className="p-4">
                              <p className="font-bold text-slate-100">{unit.tenant}</p>
                              <p className="text-[10px] text-slate-400">{unit.phone}</p>
                              <p className="text-[10px] text-[#00D8F6] font-mono mt-0.5">باسورد الدخول: {unit.portalPassword || "1234"}</p>
                            </td>
                            <td className="p-4">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${isOwner ? "bg-indigo-500/15 text-indigo-300 border-indigo-500/30" : "bg-cyan-500/15 text-cyan-300 border-cyan-500/30"}`}>
                                {unit.ownershipType}
                              </span>
                            </td>
                            <td className="p-4 text-slate-300">
                              {isOwner ? (
                                unit.isSubleased ? (
                                  <div className="space-y-0.5">
                                    <p className="text-emerald-400 font-semibold">مؤجر للغير: {unit.subtenantName || "مستأجر فرعي"}</p>
                                    <p className="text-[10px] text-slate-400">قيمة إيجار التأجير: {Number(unit.subleaseRent || 0).toLocaleString()} ج.م</p>
                                  </div>
                                ) : (
                                  <span className="text-slate-400">بدون عقد إيجار (ملك خاص)</span>
                                )
                              ) : (
                                <span className="font-bold text-emerald-400">{Number(unit.rent || 0).toLocaleString()} ج.م / شهر</span>
                              )}
                            </td>
                            <td className="p-4 text-slate-300">
                              {isOwner ? (unit.isSubleased ? unit.subleaseExpireDate || "-" : "لا يوجد عقد إيجار") : unit.expireDate || "-"}
                            </td>
                            <td className="p-4">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${unit.status.includes("نشط") || unit.status.includes("مالك") || unit.status.includes("مؤجرة") ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : unit.status.includes("تنبيه") ? "bg-amber-500/10 text-amber-400 border-amber-500/30" : "bg-rose-500/10 text-rose-400 border-rose-500/30"}`}>
                                {unit.status}
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              <div className="inline-flex items-center gap-1.5">
                                {perms.canManageUnits && (
                                  <button
                                    type="button"
                                    onClick={() => openEditUnitModal(unit)}
                                    className="bg-[#00D8F6]/10 hover:bg-[#00D8F6]/20 text-[#00D8F6] border border-[#00D8F6]/30 px-2.5 py-1 rounded text-[10px] font-bold inline-flex items-center gap-1 transition"
                                  >
                                    <Pencil className="w-3 h-3" /> تعديل
                                  </button>
                                )}
                                {perms.canDelete && (
                                  <button
                                    type="button"
                                    onClick={() => handleRequestDeleteUnit(unit)}
                                    className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 px-2.5 py-1 rounded text-[10px] font-bold inline-flex items-center gap-1 transition"
                                  >
                                    <Trash2 className="w-3 h-3" /> حذف
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "billing" && perms.canViewBilling && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-[#0B192C] p-4 rounded-2xl border border-slate-800">
                  <p className="text-xs text-slate-400">إجمالي المفوتر</p>
                  <p className="text-xl font-black text-white mt-1">{dynamicKpis.totalBilled.toLocaleString()} ج.م</p>
                </div>
                <div className="bg-[#0B192C] p-4 rounded-2xl border border-slate-800">
                  <p className="text-xs text-slate-400">المبلغ المحصل بالفعل</p>
                  <p className="text-xl font-black text-emerald-400 mt-1">{dynamicKpis.totalCollected.toLocaleString()} ج.م</p>
                </div>
                <div className="bg-[#0B192C] p-4 rounded-2xl border border-slate-800">
                  <p className="text-xs text-slate-400">المتبقي والمتأخرات</p>
                  <p className="text-xl font-black text-rose-400 mt-1">{dynamicKpis.totalPending.toLocaleString()} ج.م</p>
                </div>
              </div>

              <div className="bg-[#0B192C] border border-slate-800 rounded-2xl p-4 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-[#00D8F6]" /> سجل الفواتير والإيصالات الرقمية
                  </h3>
                  <div className="flex flex-wrap items-center gap-2">
                    {perms.canManageBilling && (
                      <button type="button" onClick={() => setShowAddInvoiceModal(true)} className="bg-gradient-to-r from-[#00D8F6] to-blue-600 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 hover:brightness-110 transition">
                        <Plus className="w-3.5 h-3.5" /> فاتورة جديدة
                      </button>
                    )}
                    {["الكل", "مدفوع", "متأخر", "قيد الانتظار"].map((filter) => (
                      <button key={filter} type="button" onClick={() => setInvoiceFilter(filter)} className={`px-2.5 py-1 rounded-lg text-xs transition ${invoiceFilter === filter ? "bg-[#00D8F6] text-slate-950 font-bold" : "bg-slate-800 text-slate-300 hover:bg-slate-700"}`}>
                        {filter}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-[#070F1B] text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="p-3">رقم الفاتورة</th>
                        <th className="p-3">الوحدة والطرف</th>
                        <th className="p-3">البيان</th>
                        <th className="p-3">المبلغ</th>
                        <th className="p-3">تاريخ الاستحقاق</th>
                        <th className="p-3">الحالة</th>
                        <th className="p-3 text-center">إجراء الإيصال</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {filteredInvoices.map((inv) => (
                        <tr key={inv.id} className="hover:bg-slate-800/40 transition">
                          <td className="p-3 font-mono font-semibold text-slate-300">{inv.id}</td>
                          <td className="p-3 font-bold text-slate-100">{inv.tenant} ({inv.unitId})</td>
                          <td className="p-3 text-slate-300">{inv.type}</td>
                          <td className="p-3 font-bold text-white">{inv.amount.toLocaleString()} ج.م</td>
                          <td className="p-3 text-slate-400">{inv.dueDate}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${inv.status === "مدفوع" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : inv.status === "متأخر" ? "bg-rose-500/10 text-rose-400 border-rose-500/30" : "bg-amber-500/10 text-amber-400 border-amber-500/30"}`}>
                              {inv.status}
                            </span>
                          </td>
                          <td className="p-3 text-center flex items-center justify-center gap-2">
                            {perms.canManageBilling && inv.status !== "مدفوع" && (
                              <button type="button" onClick={() => handlePayInvoice(inv.id)} className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 px-2 py-1 rounded text-[10px] font-bold transition">
                                تحصيل الآن
                              </button>
                            )}
                            <button type="button" onClick={() => { setSelectedInvoice(inv); setShowInvoiceModal(true); }} className="bg-slate-800 hover:bg-[#00D8F6] hover:text-slate-950 text-slate-200 border border-slate-700 px-2.5 py-1 rounded text-[10px] font-semibold flex items-center gap-1 transition">
                              <Printer className="w-3 h-3" /> الإيصال
                            </button>
                            {perms.canDelete && (
                              <button
                                type="button"
                                onClick={() => setDeleteTarget({ kind: "invoice", id: inv.id, label: `الفاتورة ${inv.id}` })}
                                className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 px-2 py-1 rounded text-[10px] font-bold inline-flex items-center gap-1 transition"
                              >
                                <Trash2 className="w-3 h-3" /> حذف
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "maintenance" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0B192C] p-4 rounded-2xl border border-slate-800">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Wrench className="w-5 h-5 text-amber-400" /> مركز الصيانة والخدمات الفنية
                  </h2>
                  <p className="text-xs text-slate-400">الصيانة المدفوعة خارج العقد لا تُغلق إلى «تم الحل» قبل تأكيد الدفع</p>
                </div>
                {perms.canManageTickets && (
                  <button type="button" onClick={() => setShowAddTicketModal(true)} className="bg-gradient-to-r from-[#00D8F6] to-blue-600 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 hover:brightness-110 transition">
                    <Plus className="w-4 h-4" /> بلاغ صيانة جديد
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <KanbanColumn title="بلاغات جديدة" count={tickets.filter((t) => t.status === "new").length} color="border-rose-500/50 bg-rose-500/5">
                  {tickets.filter((t) => t.status === "new").map((ticket) => (
                    <TicketCard
                      key={ticket.id}
                      ticket={ticket}
                      canManageTickets={perms.canManageTickets}
                      canDelete={perms.canDelete}
                      onMove={(status) => moveTicket(ticket.id, status)}
                      onMarkPaid={() => handleMarkTicketPaid(ticket.id)}
                      onDelete={() => setDeleteTarget({ kind: "ticket", id: ticket.id, label: `بلاغ الصيانة ${ticket.id}` })}
                    />
                  ))}
                </KanbanColumn>

                <KanbanColumn title="قيد التنفيذ" count={tickets.filter((t) => t.status === "in_progress").length} color="border-amber-500/50 bg-amber-500/5">
                  {tickets.filter((t) => t.status === "in_progress").map((ticket) => (
                    <TicketCard
                      key={ticket.id}
                      ticket={ticket}
                      canManageTickets={perms.canManageTickets}
                      canDelete={perms.canDelete}
                      onMove={(status) => moveTicket(ticket.id, status)}
                      onMarkPaid={() => handleMarkTicketPaid(ticket.id)}
                      onDelete={() => setDeleteTarget({ kind: "ticket", id: ticket.id, label: `بلاغ الصيانة ${ticket.id}` })}
                    />
                  ))}
                </KanbanColumn>

                <KanbanColumn title="تم الحل والإغلاق" count={tickets.filter((t) => t.status === "resolved").length} color="border-emerald-500/50 bg-emerald-500/5">
                  {tickets.filter((t) => t.status === "resolved").map((ticket) => (
                    <TicketCard
                      key={ticket.id}
                      ticket={ticket}
                      canManageTickets={perms.canManageTickets}
                      canDelete={perms.canDelete}
                      onMove={(status) => moveTicket(ticket.id, status)}
                      onMarkPaid={() => handleMarkTicketPaid(ticket.id)}
                      onDelete={() => setDeleteTarget({ kind: "ticket", id: ticket.id, label: `بلاغ الصيانة ${ticket.id}` })}
                    />
                  ))}
                </KanbanColumn>
              </div>
            </div>
          )}

          {activeTab === "announcements" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-[#0B192C] p-4 rounded-2xl border border-slate-800">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <BellRing className="w-5 h-5 text-[#00D8F6]" /> سجل التنبيهات والتواصل الداخلي
                  </h2>
                  <p className="text-xs text-slate-400">بث الإشعارات والتعليمات للملاك والمستأجرين</p>
                </div>
                {perms.canManageAnnouncements && (
                  <button type="button" onClick={() => setShowAnnouncementModal(true)} className="bg-[#00D8F6] text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5">
                    <Plus className="w-4 h-4" /> إعلان جديد
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {announcements.map((item) => (
                  <div key={item.id} className="bg-[#0B192C] p-5 rounded-2xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${item.priority === "هام" ? "bg-rose-500/20 text-rose-400 border-rose-500/30" : "bg-[#00D8F6]/20 text-[#00D8F6] border-[#00D8F6]/30"}`}>{item.priority}</span>
                        <h3 className="font-bold text-slate-100 text-sm">{item.title}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-400">{item.date}</span>
                        {perms.canDelete && (
                          <button
                            type="button"
                            onClick={() => setDeleteTarget({ kind: "announcement", id: item.id, label: `التنبيه "${item.title}"` })}
                            className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded text-[10px] font-bold inline-flex items-center gap-1 transition"
                          >
                            <Trash2 className="w-3 h-3" /> حذف
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{item.content}</p>
                    <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                      <span>المستهدف: <strong className="text-slate-200">{item.target}</strong></span>
                      <span className="text-emerald-400 flex items-center gap-1"><Check className="w-3 h-3" /> تم الإرسال</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "users" && perms.canManageUsers && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
              <form onSubmit={handleCreateUser} className="bg-[#0B192C] border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="border-b border-slate-800 pb-3">
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#00D8F6]" /> إنشاء مستخدم وتحديد صلاحياته
                  </h2>
                  <p className="text-[11px] text-slate-400 mt-0.5">حدد بيانات المستخدم والصلاحيات المسموحة له قبل الحفظ</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">اسم المستخدم</label>
                    <input
                      required
                      type="text"
                      value={newUserForm.name}
                      onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                      placeholder="مثال: م. سارة أحمد"
                      className="w-full bg-[#070F1B] border border-slate-700 rounded-xl p-2.5 text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">كلمة المرور</label>
                    <input
                      required
                      type="text"
                      value={newUserForm.password}
                      onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                      placeholder="مثال: 5566"
                      className="w-full bg-[#070F1B] border border-slate-700 rounded-xl p-2.5 text-slate-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">المسمى الوظيفي / الدور</label>
                    <input
                      type="text"
                      value={newUserForm.roleTitle}
                      onChange={(e) => setNewUserForm({ ...newUserForm, roleTitle: e.target.value })}
                      placeholder="مشرف تشغيل"
                      className="w-full bg-[#070F1B] border border-slate-700 rounded-xl p-2.5 text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">شارة الصلاحية</label>
                    <input
                      type="text"
                      value={newUserForm.badge}
                      onChange={(e) => setNewUserForm({ ...newUserForm, badge: e.target.value })}
                      placeholder="Operations"
                      className="w-full bg-[#070F1B] border border-slate-700 rounded-xl p-2.5 text-slate-200"
                    />
                  </div>
                </div>

                <div className="bg-[#070F1B] border border-slate-800 rounded-xl p-3.5 space-y-2.5">
                  <p className="font-bold text-slate-200">تحديد الصلاحيات:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {ALL_PERMISSION_KEYS.map((item) => (
                      <label key={item.key} className="flex items-center gap-2 text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(newUserForm.permissions[item.key])}
                          onChange={(e) =>
                            setNewUserForm({
                              ...newUserForm,
                              permissions: {
                                ...newUserForm.permissions,
                                [item.key]: e.target.checked,
                              },
                            })
                          }
                          className="rounded border-slate-600"
                        />
                        <span>{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="bg-gradient-to-r from-[#00D8F6] to-blue-600 text-slate-950 font-bold px-4 py-2.5 rounded-xl inline-flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> حفظ المستخدم بالصلاحيات
                </button>
              </form>

              <div className="bg-[#0B192C] border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="border-b border-slate-800 pb-3">
                  <h2 className="text-base font-bold text-white">المستخدمون الحاليون وتعديل صلاحياتهم</h2>
                  <p className="text-[11px] text-slate-400 mt-0.5">يمكن تبديل أي صلاحية فوراً لأي مستخدم</p>
                </div>

                <div className="space-y-3">
                  {users.map((u) => (
                    <div key={u.id} className="bg-[#070F1B] border border-slate-800 rounded-xl p-3.5 space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="font-bold text-white text-sm">{u.name}</p>
                          <p className="text-[10px] text-slate-400">
                            {u.roleTitle} • باسورد: <span className="font-mono text-[#00D8F6]">{u.password}</span>
                          </p>
                        </div>
                        {u.id !== currentUser.id && perms.canDelete && (
                          <button
                            type="button"
                            onClick={() => setDeleteTarget({ kind: "user", id: u.id, label: `المستخدم ${u.name}` })}
                            className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 px-2 py-1 rounded text-[10px] font-bold inline-flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" /> حذف
                          </button>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {ALL_PERMISSION_KEYS.map((p) => {
                          const active = Boolean(u.permissions[p.key]);
                          return (
                            <button
                              key={p.key}
                              type="button"
                              onClick={() => handleToggleUserPermission(u.id, p.key)}
                              className={`px-2 py-1 rounded text-[10px] font-semibold border transition ${
                                active
                                  ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                                  : "bg-slate-800/70 text-slate-500 border-slate-700"
                              }`}
                            >
                              {active ? "✓ " : "✕ "}
                              {p.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "settings" && perms.canManageSettings && (
            <form onSubmit={handleSaveSettings} className="bg-[#0B192C] border border-slate-800 rounded-2xl p-5 space-y-5 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Settings className="w-5 h-5 text-[#00D8F6]" /> إعدادات المول والأدوار والوحدات
                  </h2>
                  <p className="text-xs text-slate-400">اضبط اسم المول، أدوار المول، وعدد الوحدات وتصنيف كل دور ليتناسب مع أي مول</p>
                </div>
                <button type="submit" className="bg-gradient-to-r from-[#00D8F6] to-blue-600 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs inline-flex items-center gap-1.5">
                  <Save className="w-4 h-4" /> حفظ الإعدادات
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">اسم المول</label>
                  <input
                    type="text"
                    value={draftConfig.mallName}
                    onChange={(e) => setDraftConfig({ ...draftConfig, mallName: e.target.value })}
                    className="w-full bg-[#070F1B] border border-slate-700 rounded-xl p-2.5 text-slate-200"
                  />
                </div>
                <div className="bg-[#070F1B] border border-slate-800 rounded-xl p-3 flex items-center justify-between">
                  <span className="text-slate-400">إجمالي وحدات المول المحسوب:</span>
                  <span className="text-base font-black text-[#00D8F6]">
                    {draftConfig.floors.reduce((acc, f) => acc + (Number(f.unitsCount) || 0), 0)} وحدة
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-200">أدوار المول وعدد الوحدات وتصنيف كل دور</h3>
                  <button type="button" onClick={handleAddFloorRow} className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg font-semibold border border-slate-700 inline-flex items-center gap-1">
                    <Plus className="w-3.5 h-3.5 text-[#00D8F6]" /> إضافة دور
                  </button>
                </div>

                {draftConfig.floors.map((floor, idx) => (
                  <div key={floor.id} className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-[#070F1B] p-3.5 rounded-xl border border-slate-800">
                    <div>
                      <label className="block text-slate-400 mb-1 text-[10px]">اسم / رقم الدور</label>
                      <input
                        type="text"
                        value={floor.name}
                        onChange={(e) => {
                          const next = [...draftConfig.floors];
                          next[idx] = { ...next[idx], name: e.target.value };
                          setDraftConfig({ ...draftConfig, floors: next });
                        }}
                        className="w-full bg-[#0B192C] border border-slate-700 rounded-lg p-2 text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1 text-[10px]">نوع النشاط في الدور</label>
                      <select
                        value={floor.category}
                        onChange={(e) => {
                          const next = [...draftConfig.floors];
                          next[idx] = { ...next[idx], category: e.target.value };
                          setDraftConfig({ ...draftConfig, floors: next });
                        }}
                        className="w-full bg-[#0B192C] border border-slate-700 rounded-lg p-2 text-slate-200"
                      >
                        <option value="تجاري (محلات)">تجاري (محلات)</option>
                        <option value="دوبليكس تجاري">دوبليكس تجاري</option>
                        <option value="إداري">إداري</option>
                        <option value="مختلط">مختلط</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1 text-[10px]">عدد الوحدات في الدور</label>
                      <input
                        type="number"
                        min="0"
                        value={floor.unitsCount}
                        onChange={(e) => {
                          const next = [...draftConfig.floors];
                          next[idx] = { ...next[idx], unitsCount: Number(e.target.value) || 0 };
                          setDraftConfig({ ...draftConfig, floors: next });
                        }}
                        className="w-full bg-[#0B192C] border border-slate-700 rounded-lg p-2 text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1 text-[10px]">ملاحظات الدور</label>
                      <input
                        type="text"
                        value={floor.notes || ""}
                        onChange={(e) => {
                          const next = [...draftConfig.floors];
                          next[idx] = { ...next[idx], notes: e.target.value };
                          setDraftConfig({ ...draftConfig, floors: next });
                        }}
                        placeholder="مثال: دوبليكس مرتبط بالأرضي"
                        className="w-full bg-[#0B192C] border border-slate-700 rounded-lg p-2 text-slate-200"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </form>
          )}
        </div>
      </main>

      {deleteTarget && (
        <Modal title="تأكيد الحذف" onClose={() => setDeleteTarget(null)}>
          <div className="space-y-4 text-xs">
            <p className="text-slate-200 leading-relaxed">
              هل أنت متأكد من حذف <strong className="text-rose-400">{deleteTarget.label}</strong>؟ لا يمكن التراجع عن هذا الإجراء بعد التنفيذ.
            </p>
            <div className="pt-2 flex items-center justify-end gap-2">
              <button type="button" onClick={() => setDeleteTarget(null)} className="px-4 py-2 rounded-xl text-slate-400 hover:bg-slate-800">
                إلغاء
              </button>
              <button type="button" onClick={confirmDelete} className="bg-rose-500 hover:bg-rose-600 text-white font-bold px-5 py-2 rounded-xl transition">
                تأكيد الحذف
              </button>
            </div>
          </div>
        </Modal>
      )}

      {editUnitForm && (
        <Modal
          title={`تعديل بيانات الوحدة (${editingUnitOriginalId})`}
          onClose={() => {
            setEditingUnitOriginalId(null);
            setEditUnitForm(null);
          }}
        >
          <form onSubmit={handleSaveEditedUnit} className="space-y-4 text-xs max-h-[75vh] overflow-y-auto pl-1">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">رقم الوحدة</label>
                <input
                  required
                  type="text"
                  value={editUnitForm.id}
                  onChange={(e) => setEditUnitForm({ ...editUnitForm, id: e.target.value })}
                  className="w-full bg-[#070F1B] border border-slate-700 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-[#00D8F6]"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">الصفة (مالك / مستأجر)</label>
                <select
                  value={editUnitForm.ownershipType}
                  onChange={(e) => setEditUnitForm({ ...editUnitForm, ownershipType: e.target.value, isSubleased: false })}
                  className="w-full bg-[#070F1B] border border-slate-700 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-[#00D8F6]"
                >
                  <option value="مستأجر">مستأجر</option>
                  <option value="مالك">مالك (بدون عقد إيجار)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">
                  {editUnitForm.ownershipType === "مالك" ? "اسم المالك" : "اسم المستأجر / النشاط"}
                </label>
                <input
                  required
                  type="text"
                  value={editUnitForm.tenant}
                  onChange={(e) => setEditUnitForm({ ...editUnitForm, tenant: e.target.value })}
                  className="w-full bg-[#070F1B] border border-slate-700 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-[#00D8F6]"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">رقم التواصل</label>
                <input
                  type="text"
                  value={editUnitForm.phone}
                  onChange={(e) => setEditUnitForm({ ...editUnitForm, phone: e.target.value })}
                  className="w-full bg-[#070F1B] border border-slate-700 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-[#00D8F6]"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-semibold">كلمة مرور البوابة للوحدة</label>
              <input
                required
                type="text"
                value={editUnitForm.portalPassword}
                onChange={(e) => setEditUnitForm({ ...editUnitForm, portalPassword: e.target.value })}
                className="w-full bg-[#070F1B] border border-slate-700 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-[#00D8F6]"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">القطاع</label>
                <select
                  value={editUnitForm.type}
                  onChange={(e) => setEditUnitForm({ ...editUnitForm, type: e.target.value })}
                  className="w-full bg-[#070F1B] border border-slate-700 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-[#00D8F6]"
                >
                  <option value="تجاري">تجاري</option>
                  <option value="إداري">إداري</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">الدور</label>
                <select
                  value={editUnitForm.floor}
                  onChange={(e) => setEditUnitForm({ ...editUnitForm, floor: e.target.value })}
                  className="w-full bg-[#070F1B] border border-slate-700 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-[#00D8F6]"
                >
                  {mallConfig.floors.map((f) => (
                    <option key={f.id} value={f.name}>{f.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">المساحة</label>
                <input
                  type="text"
                  value={editUnitForm.area}
                  onChange={(e) => setEditUnitForm({ ...editUnitForm, area: e.target.value })}
                  className="w-full bg-[#070F1B] border border-slate-700 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-[#00D8F6]"
                />
              </div>
            </div>

            {editUnitForm.ownershipType === "مستأجر" ? (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">الإيجار الشهري (ج.م)</label>
                  <input
                    type="number"
                    value={editUnitForm.rent}
                    onChange={(e) => setEditUnitForm({ ...editUnitForm, rent: e.target.value })}
                    className="w-full bg-[#070F1B] border border-slate-700 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-[#00D8F6]"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">تاريخ نهاية العقد</label>
                  <input
                    type="date"
                    value={editUnitForm.expireDate}
                    onChange={(e) => setEditUnitForm({ ...editUnitForm, expireDate: e.target.value })}
                    className="w-full bg-[#070F1B] border border-slate-700 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-[#00D8F6]"
                  />
                </div>
              </div>
            ) : (
              <div className="bg-[#070F1B] border border-slate-800 rounded-xl p-3 space-y-3">
                <label className="flex items-center gap-2 text-slate-200 font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editUnitForm.isSubleased}
                    onChange={(e) => setEditUnitForm({ ...editUnitForm, isSubleased: e.target.checked })}
                    className="rounded border-slate-600"
                  />
                  <span>المالك يقوم بتأجير الوحدة للغير</span>
                </label>

                {editUnitForm.isSubleased && (
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <div>
                      <label className="block text-slate-400 mb-1 text-[10px]">المستأجر من المالك</label>
                      <input
                        type="text"
                        value={editUnitForm.subtenantName}
                        onChange={(e) => setEditUnitForm({ ...editUnitForm, subtenantName: e.target.value })}
                        className="w-full bg-[#0B192C] border border-slate-700 rounded-lg p-2 text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1 text-[10px]">قيمة الإيجار (ج.م)</label>
                      <input
                        type="number"
                        value={editUnitForm.subleaseRent}
                        onChange={(e) => setEditUnitForm({ ...editUnitForm, subleaseRent: e.target.value })}
                        className="w-full bg-[#0B192C] border border-slate-700 rounded-lg p-2 text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1 text-[10px]">نهاية التأجير</label>
                      <input
                        type="date"
                        value={editUnitForm.subleaseExpireDate}
                        onChange={(e) => setEditUnitForm({ ...editUnitForm, subleaseExpireDate: e.target.value })}
                        className="w-full bg-[#0B192C] border border-slate-700 rounded-lg p-2 text-slate-200"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="bg-[#070F1B] border border-slate-800 rounded-xl p-3 space-y-2.5">
              <label className="flex items-center gap-2 text-[#00D8F6] font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(editUnitForm.archiveCurrentContract)}
                  onChange={(e) => setEditUnitForm({ ...editUnitForm, archiveCurrentContract: e.target.checked })}
                  className="rounded border-slate-600"
                />
                <Archive className="w-3.5 h-3.5" />
                <span>أرشفة العقد / التشغيل الحالي في السجل التاريخي قبل إضافة طرف جديد</span>
              </label>

              {editUnitForm.archiveCurrentContract && (
                <div>
                  <label className="block text-slate-400 mb-1 text-[10px]">سبب إنهاء / أرشفة العقد السابق</label>
                  <input
                    type="text"
                    value={editUnitForm.archiveReason || ""}
                    onChange={(e) => setEditUnitForm({ ...editUnitForm, archiveReason: e.target.value })}
                    placeholder="انتهاء مدة الإيجار أو تغيير المستأجر من الباطن"
                    className="w-full bg-[#0B192C] border border-slate-700 rounded-lg p-2 text-slate-200"
                  />
                </div>
              )}

              {Array.isArray(editUnitForm.contractHistory) && editUnitForm.contractHistory.length > 0 && (
                <div className="pt-2 border-t border-slate-800 space-y-1.5">
                  <p className="text-[10px] font-bold text-slate-300 flex items-center gap-1">
                    <History className="w-3 h-3 text-[#00D8F6]" /> السجل التاريخي للعقود والمشغلين السابقين:
                  </p>
                  {editUnitForm.contractHistory.map((h) => (
                    <div key={h.id} className="bg-[#0B192C] border border-slate-800/80 rounded-lg p-2 text-[10px] flex items-center justify-between gap-2">
                      <div>
                        <p className="font-bold text-slate-200">{h.partyName} ({h.ownershipType})</p>
                        <p className="text-slate-400">{h.reason} • أُرشف في: {h.archivedAt}</p>
                      </div>
                      <span className="text-emerald-400 font-bold shrink-0">{Number(h.amount || 0).toLocaleString()} ج.م</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditingUnitOriginalId(null);
                  setEditUnitForm(null);
                }}
                className="px-4 py-2 rounded-xl text-slate-400 hover:bg-slate-800"
              >
                إلغاء
              </button>
              <button type="submit" className="bg-[#00D8F6] text-slate-950 font-bold px-5 py-2 rounded-xl hover:brightness-110">
                حفظ التعديلات
              </button>
            </div>
          </form>
        </Modal>
      )}

      {showAddUnitModal && (
        <Modal title="إضافة وحدة (مالك أو مستأجر)" onClose={() => setShowAddUnitModal(false)}>
          <form onSubmit={handleAddUnit} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">رقم الوحدة</label>
                <input required type="text" value={newUnit.id} onChange={(e) => setNewUnit({ ...newUnit, id: e.target.value })} placeholder="G-15" className="w-full bg-[#070F1B] border border-slate-700 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-[#00D8F6]" />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">الصفة (مالك / مستأجر)</label>
                <select
                  value={newUnit.ownershipType}
                  onChange={(e) => setNewUnit({ ...newUnit, ownershipType: e.target.value, isSubleased: false })}
                  className="w-full bg-[#070F1B] border border-slate-700 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-[#00D8F6]"
                >
                  <option value="مستأجر">مستأجر</option>
                  <option value="مالك">مالك (بدون عقد إيجار)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">
                  {newUnit.ownershipType === "مالك" ? "اسم المالك" : "اسم المستأجر / النشاط"}
                </label>
                <input required type="text" value={newUnit.tenant} onChange={(e) => setNewUnit({ ...newUnit, tenant: e.target.value })} placeholder={newUnit.ownershipType === "مالك" ? "أ. كريم حسن" : "متجر الأناقة"} className="w-full bg-[#070F1B] border border-slate-700 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-[#00D8F6]" />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">رقم التواصل</label>
                <input type="text" value={newUnit.phone} onChange={(e) => setNewUnit({ ...newUnit, phone: e.target.value })} placeholder="010..." className="w-full bg-[#070F1B] border border-slate-700 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-[#00D8F6]" />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-semibold">كلمة مرور البوابة للوحدة</label>
              <input
                required
                type="text"
                value={newUnit.portalPassword}
                onChange={(e) => setNewUnit({ ...newUnit, portalPassword: e.target.value })}
                placeholder="مثال: Unit@2026"
                className="w-full bg-[#070F1B] border border-slate-700 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-[#00D8F6]"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">القطاع</label>
                <select value={newUnit.type} onChange={(e) => setNewUnit({ ...newUnit, type: e.target.value })} className="w-full bg-[#070F1B] border border-slate-700 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-[#00D8F6]">
                  <option value="تجاري">تجاري</option>
                  <option value="إداري">إداري</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">الدور</label>
                <select value={newUnit.floor} onChange={(e) => setNewUnit({ ...newUnit, floor: e.target.value })} className="w-full bg-[#070F1B] border border-slate-700 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-[#00D8F6]">
                  {mallConfig.floors.map((f) => (
                    <option key={f.id} value={f.name}>{f.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">المساحة</label>
                <input type="text" value={newUnit.area} onChange={(e) => setNewUnit({ ...newUnit, area: e.target.value })} placeholder="100 م²" className="w-full bg-[#070F1B] border border-slate-700 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-[#00D8F6]" />
              </div>
            </div>

            {newUnit.ownershipType === "مستأجر" ? (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">الإيجار الشهري (ج.م)</label>
                  <input type="number" placeholder="25000" value={newUnit.rent} onChange={(e) => setNewUnit({ ...newUnit, rent: e.target.value })} className="w-full bg-[#070F1B] border border-slate-700 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-[#00D8F6]" />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">تاريخ نهاية العقد</label>
                  <input type="date" value={newUnit.expireDate} onChange={(e) => setNewUnit({ ...newUnit, expireDate: e.target.value })} className="w-full bg-[#070F1B] border border-slate-700 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-[#00D8F6]" />
                </div>
              </div>
            ) : (
              <div className="bg-[#070F1B] border border-slate-800 rounded-xl p-3 space-y-3">
                <label className="flex items-center gap-2 text-slate-200 font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newUnit.isSubleased}
                    onChange={(e) => setNewUnit({ ...newUnit, isSubleased: e.target.checked })}
                    className="rounded border-slate-600"
                  />
                  <span>المالك يقوم بتأجير الوحدة للغير</span>
                </label>

                {newUnit.isSubleased && (
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <div>
                      <label className="block text-slate-400 mb-1 text-[10px]">المستأجر من المالك</label>
                      <input type="text" value={newUnit.subtenantName} onChange={(e) => setNewUnit({ ...newUnit, subtenantName: e.target.value })} placeholder="اسم المستأجر" className="w-full bg-[#0B192C] border border-slate-700 rounded-lg p-2 text-slate-200" />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1 text-[10px]">قيمة الإيجار (ج.م)</label>
                      <input type="number" value={newUnit.subleaseRent} onChange={(e) => setNewUnit({ ...newUnit, subleaseRent: e.target.value })} placeholder="20000" className="w-full bg-[#0B192C] border border-slate-700 rounded-lg p-2 text-slate-200" />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1 text-[10px]">نهاية التأجير</label>
                      <input type="date" value={newUnit.subleaseExpireDate} onChange={(e) => setNewUnit({ ...newUnit, subleaseExpireDate: e.target.value })} className="w-full bg-[#0B192C] border border-slate-700 rounded-lg p-2 text-slate-200" />
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="pt-2 flex items-center justify-end gap-2">
              <button type="button" onClick={() => setShowAddUnitModal(false)} className="px-4 py-2 rounded-xl text-slate-400 hover:bg-slate-800">إلغاء</button>
              <button type="submit" className="bg-[#00D8F6] text-slate-950 font-bold px-5 py-2 rounded-xl hover:brightness-110">حفظ الوحدة</button>
            </div>
          </form>
        </Modal>
      )}

      {showAddInvoiceModal && (
        <Modal title="إضافة فاتورة جديدة" onClose={() => setShowAddInvoiceModal(false)}>
          <form onSubmit={handleAddInvoice} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">الوحدة / الطرف</label>
              <select value={newInvoice.unitId} onChange={(e) => setNewInvoice({ ...newInvoice, unitId: e.target.value })} className="w-full bg-[#070F1B] border border-slate-700 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-[#00D8F6]">
                {units.map((u) => (
                  <option key={u.id} value={u.id}>{u.id} - {u.tenant} ({u.ownershipType})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">المبلغ (ج.م)</label>
                <input required type="number" min="1" placeholder="20000" value={newInvoice.amount} onChange={(e) => setNewInvoice({ ...newInvoice, amount: e.target.value })} className="w-full bg-[#070F1B] border border-slate-700 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-[#00D8F6]" />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">البيان</label>
                <input required type="text" placeholder="إيجار أو رسوم خدمات" value={newInvoice.type} onChange={(e) => setNewInvoice({ ...newInvoice, type: e.target.value })} className="w-full bg-[#070F1B] border border-slate-700 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-[#00D8F6]" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">تاريخ الاستحقاق</label>
                <input required type="date" value={newInvoice.dueDate} onChange={(e) => setNewInvoice({ ...newInvoice, dueDate: e.target.value })} className="w-full bg-[#070F1B] border border-slate-700 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-[#00D8F6]" />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">الحالة</label>
                <select value={newInvoice.status} onChange={(e) => setNewInvoice({ ...newInvoice, status: e.target.value })} className="w-full bg-[#070F1B] border border-slate-700 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-[#00D8F6]">
                  <option value="قيد الانتظار">قيد الانتظار</option>
                  <option value="متأخر">متأخر</option>
                  <option value="مدفوع">مدفوع</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button type="button" onClick={() => setShowAddInvoiceModal(false)} className="px-4 py-2 rounded-xl text-slate-400 hover:bg-slate-800">إلغاء</button>
              <button type="submit" className="bg-[#00D8F6] text-slate-950 font-bold px-5 py-2 rounded-xl hover:brightness-110">حفظ الفاتورة</button>
            </div>
          </form>
        </Modal>
      )}

      {showAddTicketModal && (
        <Modal title="إضافة بلاغ صيانة جديد" onClose={() => setShowAddTicketModal(false)}>
          <form onSubmit={handleAddTicket} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">الوحدة</label>
                <select value={newTicket.unitId} onChange={(e) => setNewTicket({ ...newTicket, unitId: e.target.value })} className="w-full bg-[#070F1B] border border-slate-700 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-[#00D8F6]">
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>{u.id} - {u.tenant}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">التصنيف</label>
                <select value={newTicket.category} onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })} className="w-full bg-[#070F1B] border border-slate-700 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-[#00D8F6]">
                  <option value="تكييف">تكييف</option>
                  <option value="كهرباء">كهرباء</option>
                  <option value="سباكة">سباكة</option>
                  <option value="سلامة">سلامة</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-semibold">وصف العطل / البلاغ</label>
              <input required type="text" placeholder="مثال: إصلاح أو تركيب خارج عقد الصيانة" value={newTicket.title} onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })} className="w-full bg-[#070F1B] border border-slate-700 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-[#00D8F6]" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">نوع الصيانة</label>
                <select
                  value={newTicket.billingType}
                  onChange={(e) =>
                    setNewTicket({
                      ...newTicket,
                      billingType: e.target.value,
                      paymentStatus: e.target.value === "مدفوع" ? "غير مدفوع" : "مدفوع",
                    })
                  }
                  className="w-full bg-[#070F1B] border border-slate-700 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-[#00D8F6]"
                >
                  <option value="ضمن العقد">ضمن عقد الصيانة</option>
                  <option value="مدفوع">خارج العقد (مدفوع)</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">الأولوية</label>
                <select value={newTicket.priority} onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })} className="w-full bg-[#070F1B] border border-slate-700 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-[#00D8F6]">
                  <option value="منخفض">منخفض</option>
                  <option value="متوسط">متوسط</option>
                  <option value="عاجل">عاجل</option>
                </select>
              </div>
            </div>

            {newTicket.billingType === "مدفوع" && (
              <div className="grid grid-cols-2 gap-3 bg-[#070F1B] p-3 rounded-xl border border-amber-500/30">
                <div>
                  <label className="block text-amber-300 mb-1 font-semibold">تكلفة الصيانة (ج.م)</label>
                  <input
                    required
                    type="number"
                    min="1"
                    placeholder="1500"
                    value={newTicket.serviceFee}
                    onChange={(e) => setNewTicket({ ...newTicket, serviceFee: e.target.value })}
                    className="w-full bg-[#0B192C] border border-slate-700 rounded-lg p-2 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-amber-300 mb-1 font-semibold">حالة الدفع</label>
                  <select
                    value={newTicket.paymentStatus}
                    onChange={(e) => setNewTicket({ ...newTicket, paymentStatus: e.target.value })}
                    className="w-full bg-[#0B192C] border border-slate-700 rounded-lg p-2 text-slate-200"
                  >
                    <option value="غير مدفوع">غير مدفوع (يمنع الإغلاق)</option>
                    <option value="مدفوع">مدفوع</option>
                  </select>
                </div>
              </div>
            )}

            <div>
              <label className="block text-slate-400 mb-1 font-semibold">الفني المسؤول</label>
              <input type="text" placeholder="م. أحمد حسن" value={newTicket.assignedTo} onChange={(e) => setNewTicket({ ...newTicket, assignedTo: e.target.value })} className="w-full bg-[#070F1B] border border-slate-700 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-[#00D8F6]" />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button type="button" onClick={() => setShowAddTicketModal(false)} className="px-4 py-2 rounded-xl text-slate-400 hover:bg-slate-800">إلغاء</button>
              <button type="submit" className="bg-[#00D8F6] text-slate-950 font-bold px-5 py-2 rounded-xl hover:brightness-110">حفظ البلاغ</button>
            </div>
          </form>
        </Modal>
      )}

      {showInvoiceModal && selectedInvoice && (
        <Modal title="معاينة إيصال سداد رقمي" onClose={() => setShowInvoiceModal(false)}>
          <div className="bg-white text-slate-900 p-6 rounded-xl space-y-6 text-right font-sans">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-xl font-black text-[#0B192C]">إيصال استلام نقدية / خدمات</h3>
                <p className="text-xs text-slate-500">{mallConfig.mallName} - الإدارة التشغيلية</p>
              </div>
              <div className="text-left font-mono">
                <span className="text-xs text-cyan-700 font-bold block">MMS Cloud Secured</span>
                <span className="text-sm font-bold text-slate-700">{selectedInvoice.id}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-lg border border-slate-100">
              <div>
                <p className="text-slate-400">استلمنا من:</p>
                <p className="font-bold text-slate-800 text-sm mt-0.5">{selectedInvoice.tenant}</p>
              </div>
              <div>
                <p className="text-slate-400">رقم الوحدة:</p>
                <p className="font-bold text-slate-800 text-sm mt-0.5">{selectedInvoice.unitId}</p>
              </div>
              <div>
                <p className="text-slate-400">المبلغ:</p>
                <p className="font-black text-emerald-600 text-base mt-0.5">{selectedInvoice.amount.toLocaleString()} جنيه مصري</p>
              </div>
              <div>
                <p className="text-slate-400">وذلك مقابل:</p>
                <p className="font-bold text-slate-800 text-sm mt-0.5">{selectedInvoice.type}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
              <div className="flex items-center gap-1.5 text-emerald-600 font-bold">
                <CheckCircle2 className="w-4 h-4" /> معتمد ومسدد رقمياً عبر نظام MMS
              </div>
              <p>التاريخ: {selectedInvoice.paymentDate !== "-" ? selectedInvoice.paymentDate : selectedInvoice.dueDate}</p>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button type="button" onClick={() => window.print()} className="bg-[#0B192C] text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-slate-800">
                <Printer className="w-3.5 h-3.5 text-[#00D8F6]" /> طباعة الإيصال
              </button>
            </div>
          </div>
        </Modal>
      )}

      {showAnnouncementModal && (
        <Modal title="إرسال تنبيه جديد" onClose={() => setShowAnnouncementModal(false)}>
          <form onSubmit={handleAddAnnouncement} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">عنوان التنبيه</label>
              <input required type="text" value={newAnnouncement.title} onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })} placeholder="مثال: تنبيه بخصوص أعمال النظافة الدورية" className="w-full bg-[#070F1B] border border-slate-700 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-[#00D8F6]" />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">نص الرسالة / الإعلان</label>
              <textarea required rows={4} value={newAnnouncement.content} onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })} placeholder="اكتب التنبيه..." className="w-full bg-[#070F1B] border border-slate-700 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-[#00D8F6]"></textarea>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">الأهمية</label>
                <select value={newAnnouncement.priority} onChange={(e) => setNewAnnouncement({ ...newAnnouncement, priority: e.target.value })} className="w-full bg-[#070F1B] border border-slate-700 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-[#00D8F6]">
                  <option value="عادي">عادي</option>
                  <option value="هام">هام جداً</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">الفئة المستهدفة</label>
                <select value={newAnnouncement.target} onChange={(e) => setNewAnnouncement({ ...newAnnouncement, target: e.target.value })} className="w-full bg-[#070F1B] border border-slate-700 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-[#00D8F6]">
                  <option value="جميع المستأجرين">جميع المستأجرين</option>
                  <option value="القطاع التجاري">القطاع التجاري فقط</option>
                  <option value="القطاع الإداري">القطاع الإداري فقط</option>
                </select>
              </div>
            </div>
            <div className="pt-2 flex justify-end gap-2">
              <button type="button" onClick={() => setShowAnnouncementModal(false)} className="px-4 py-2 rounded-xl text-slate-400 hover:bg-slate-800">إلغاء</button>
              <button type="submit" className="bg-[#00D8F6] text-slate-950 font-bold px-5 py-2 rounded-xl hover:brightness-110">إرسال فوراً</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

function NavItem({ icon, label, active, onClick, badge, badgeColor }) {
  return (
    <button type="button" onClick={onClick} className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${active ? "bg-gradient-to-r from-[#00D8F6] to-blue-600 text-slate-950 shadow-md shadow-[#00D8F6]/20 font-bold" : "text-slate-300 hover:bg-slate-800/60 hover:text-white"}`}>
      <div className="flex items-center gap-3">
        {icon}
        <span>{label}</span>
      </div>
      {badge !== undefined && (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${badgeColor || "bg-slate-800 text-slate-200 border-slate-700"}`}>
          {badge}
        </span>
      )}
    </button>
  );
}

function KpiCard({ title, value, subtext, icon, badge, badgeType }) {
  return (
    <div className="bg-[#0B192C] border border-slate-800 p-4 rounded-2xl space-y-3 hover:border-slate-700 transition shadow-lg">
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-400 font-medium">{title}</span>
        <div className="p-2 bg-[#070F1B] rounded-xl border border-slate-800">{icon}</div>
      </div>
      <div>
        <h3 className="text-2xl font-black text-white">{value}</h3>
        <p className="text-[11px] text-slate-400 mt-0.5">{subtext}</p>
      </div>
      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
        <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${badgeType === "success" ? "bg-emerald-500/10 text-emerald-400" : badgeType === "warning" ? "bg-amber-500/10 text-amber-400" : badgeType === "danger" ? "bg-rose-500/10 text-rose-400" : "bg-slate-800 text-slate-300"}`}>
          {badge}
        </span>
      </div>
    </div>
  );
}

function KanbanColumn({ title, count, color, children }) {
  return (
    <div className={`border rounded-2xl p-4 flex flex-col min-h-[360px] ${color}`}>
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
        <h3 className="font-bold text-slate-200 text-xs">{title}</h3>
        <span className="bg-slate-800 text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded-full">{count}</span>
      </div>
      <div className="space-y-3 flex-1">{children}</div>
    </div>
  );
}

function TicketCard({ ticket, canManageTickets, canDelete, onMove, onMarkPaid, onDelete }) {
  const isUnpaidPaidTicket = ticket.billingType === "مدفوع" && ticket.paymentStatus !== "مدفوع";

  return (
    <div className="bg-[#0B192C] border border-slate-800 p-3.5 rounded-xl space-y-2 hover:border-[#00D8F6]/50 transition shadow-md">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-bold text-[#00D8F6]">{ticket.id} • {ticket.unitId}</span>
        <div className="flex items-center gap-1.5">
          <span className={`text-[9px] px-2 py-0.5 rounded font-bold ${ticket.priority === "عاجل" ? "bg-rose-500/20 text-rose-400" : "bg-slate-800 text-slate-300"}`}>
            {ticket.priority}
          </span>
          {canDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="text-slate-400 hover:text-rose-400 p-0.5 rounded transition"
              title="حذف البلاغ"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <p className="text-xs font-bold text-slate-100">{ticket.title}</p>
      <p className="text-[10px] text-slate-400">الفني المسؤول: {ticket.assignedTo}</p>

      <div className="flex items-center justify-between text-[10px] pt-1">
        {ticket.billingType === "مدفوع" ? (
          <span className={`px-2 py-0.5 rounded font-bold border ${isUnpaidPaidTicket ? "bg-rose-500/15 text-rose-300 border-rose-500/30" : "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"}`}>
            خارج العقد: {Number(ticket.serviceFee || 0).toLocaleString()} ج.م ({ticket.paymentStatus})
          </span>
        ) : (
          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">ضمن عقد الصيانة</span>
        )}

        {canManageTickets && isUnpaidPaidTicket && (
          <button
            type="button"
            onClick={onMarkPaid}
            className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-bold transition"
          >
            تأكيد الدفع
          </button>
        )}
      </div>

      {canManageTickets && (
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
          <span className="text-slate-400">{ticket.date}</span>
          <div className="flex items-center gap-1">
            {ticket.status !== "new" && (
              <button type="button" onClick={() => onMove("new")} className="text-slate-400 hover:text-white px-1">جديد</button>
            )}
            {ticket.status !== "in_progress" && (
              <button type="button" onClick={() => onMove("in_progress")} className="text-amber-400 hover:underline px-1">تنفيذ</button>
            )}
            {ticket.status !== "resolved" && (
              <button
                type="button"
                disabled={isUnpaidPaidTicket}
                onClick={() => onMove("resolved")}
                title={isUnpaidPaidTicket ? "يلزم تأكيد الدفع أولاً لإغلاق البلاغ" : "نقل إلى تم الحل"}
                className={`px-1 ${isUnpaidPaidTicket ? "text-slate-600 cursor-not-allowed" : "text-emerald-400 hover:underline"}`}
              >
                تم الحل
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0B192C] border border-slate-800 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#070F1B]">
          <h3 className="font-bold text-slate-100 text-sm">{title}</h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
