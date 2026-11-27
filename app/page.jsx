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
  AlertTriangle,
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
  FileCheck2,
  ThumbsUp,
} from "lucide-react";
import { supabase } from "../lib/supabaseClient";

const DEFAULT_MALL_CONFIG = {
  mallName: "مول الماسة 1",
  floors: [
    { id: "ground", code: "G", name: "الدور الأرضي", category: "تجاري (محلات)", unitsCount: 40, notes: "محلات تجارية رئيسية" },
    { id: "duplex", code: "DX", name: "دور الدوبليكس", category: "دوبليكس تجاري", unitsCount: 20, notes: "ملحق علوي لبعض الوحدات التجارية بالدور الأرضي" },
    { id: "first", code: "F1", name: "الدور الأول العلوي", category: "إداري", unitsCount: 30, notes: "مكاتب وخدمات" },
    { id: "second", code: "F2", name: "الدور الثاني", category: "إداري", unitsCount: 30, notes: "وحدات إدارية وخدمات" },
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
    permissions: Object.fromEntries(ALL_PERMISSION_KEYS.map((p) => [p.key, true])),
  },
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
  permissions: Object.fromEntries(ALL_PERMISSION_KEYS.map((p) => [p.key, Boolean(row.permissions?.[p.key])])),
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
  contract_history: Array.isArray(u.contractHistory) ? u.contractHistory : [],
  maintenance_deposit: Number(u.maintenanceDeposit) || 0,
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
    maintenanceDeposit: Number(row.maintenance_deposit) || 0,
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
  billing_type: t.billingType || "غير محدد",
  service_fee: Number(t.serviceFee) || 0,
  payment_status: t.paymentStatus || "غير محدد",
  approval_status: t.approvalStatus || "غير مطلوب",
  deposit_covered: Boolean(t.depositCovered),
  invoice_issued: Boolean(t.invoiceIssued),
  invoice_id: t.invoiceId || null,
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
  billingType: row.billing_type || "غير محدد",
  serviceFee: Number(row.service_fee) || 0,
  paymentStatus: row.payment_status || "غير محدد",
  approvalStatus: row.approval_status || "غير مطلوب",
  depositCovered: Boolean(row.deposit_covered),
  invoiceIssued: Boolean(row.invoice_issued),
  invoiceId: row.invoice_id || null,
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
  const [authReady, setAuthReady] = useState(false);

  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [noticeMessage, setNoticeMessage] = useState("");
  const [dbConnected, setDbConnected] = useState(false);

  const [mallConfig, setMallConfig] = useState(DEFAULT_MALL_CONFIG);
  const [draftConfig, setDraftConfig] = useState(DEFAULT_MALL_CONFIG);

  const [units, setUnits] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

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

  const initialFloor = DEFAULT_MALL_CONFIG.floors[0];
  const [newUnit, setNewUnit] = useState({
    id: initialFloor?.code ? `${initialFloor.code}-` : "",
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
    floor: initialFloor?.name || "الدور الأرضي",
    phone: "",
    portalPassword: "",
    maintenanceDeposit: "10000",
  });

  const [newInvoice, setNewInvoice] = useState({
    unitId: "",
    amount: "",
    type: "إيجار شهري",
    dueDate: "2026-12-05",
    status: "قيد الانتظار",
  });

  const [newTicket, setNewTicket] = useState({
    unitId: "",
    title: "",
    priority: "متوسط",
    category: "تكييف",
    assignedTo: "بانتظار توجيه مسؤول الصيانة",
  });

  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    content: "",
    priority: "عادي",
    target: "جميع المستأجرين",
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedUser = localStorage.getItem("mms_logged_user") || "";
      const savedTab = localStorage.getItem("mms_active_tab") || "overview";
      setLoggedInUserId(savedUser);
      setActiveTab(savedTab);
    }
    setAuthReady(true);
  }, []);

  const currentUser = useMemo(
    () => users.find((u) => u.id === loggedInUserId) || null,
    [users, loggedInUserId]
  );

  const handleSelectTab = useCallback((tabName) => {
    setActiveTab(tabName);
    setSearchQuery("");
    if (typeof window !== "undefined") {
      localStorage.setItem("mms_active_tab", tabName);
    }
    if (tabName !== "units") setUnitFilter("الكل");
    if (tabName !== "billing") setInvoiceFilter("الكل");
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
      setNoticeMessage("تعذر قراءة بعض جداول Supabase؛ تأكد من إنشاء الجداول والصلاحيات.");
      return;
    }

    setDbConnected(true);

    if (!settingsRes.error && Array.isArray(settingsRes.data?.floors)) {
      const normalizedFloors = settingsRes.data.floors.map((f, idx) => ({
        ...f,
        code: (f.code || `F${idx + 1}`).trim(),
      }));
      const loadedConfig = {
        mallName: settingsRes.data.mall_name || DEFAULT_MALL_CONFIG.mallName,
        floors: normalizedFloors,
      };
      setMallConfig(loadedConfig);
      setDraftConfig(loadedConfig);
      if (normalizedFloors[0]) {
        setNewUnit((prev) => ({
          ...prev,
          floor: normalizedFloors[0].name,
          id: prev.id || (normalizedFloors[0].code ? `${normalizedFloors[0].code}-` : ""),
        }));
      }
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

    setUnits(unitsRes.data ? unitsRes.data.map(mapUnitFromDb) : []);
    setInvoices(invoicesRes.data ? invoicesRes.data.map(mapInvoiceFromDb) : []);
    setTickets(ticketsRes.data ? ticketsRes.data.map(mapTicketFromDb) : []);
    setAnnouncements(announcementsRes.data || []);
  }, []);

  useEffect(() => {
    loadFromSupabase();
  }, [loadFromSupabase]);

  const handleFloorSelectionInAddUnit = (floorName) => {
    const matchedFloor = mallConfig.floors.find((f) => f.name === floorName);
    const nextCode = (matchedFloor?.code || "").trim();
    const existingCodes = mallConfig.floors
      .map((f) => (f.code || "").trim())
      .filter(Boolean);

    setNewUnit((prev) => {
      const currentId = prev.id.trim();
      const isEmptyOrJustPrefix =
        !currentId ||
        existingCodes.some((c) => currentId === c || currentId === `${c}-`);

      return {
        ...prev,
        floor: floorName,
        id: isEmptyOrJustPrefix ? (nextCode ? `${nextCode}-` : "") : prev.id,
      };
    });
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    const target = users.find((u) => u.id === selectedUserId);
    if (!target || String(target.password || "") !== loginPasswordInput) {
      setLoginError("كلمة المرور غير صحيحة لهذا المستخدم.");
      return;
    }
    setLoginError("");
    setLoginPasswordInput("");
    setSearchQuery("");
    setActiveTab("overview");
    setLoggedInUserId(target.id);
    if (typeof window !== "undefined") {
      localStorage.setItem("mms_logged_user", target.id);
      localStorage.setItem("mms_active_tab", "overview");
    }
  };

  const handleLogoutUser = () => {
    setLoggedInUserId("");
    setLoginPasswordInput("");
    setLoginError("");
    setSearchQuery("");
    setActiveTab("overview");
    if (typeof window !== "undefined") {
      localStorage.removeItem("mms_logged_user");
      localStorage.removeItem("mms_active_tab");
    }
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
          ? `تم إنشاء المستخدم محلياً لكن فشل الحفظ في Supabase: ${error.message}`
          : `تم إنشاء المستخدم "${created.name}" وحفظ صلاحياته.`
      );
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
    const nextPerms = { ...target.permissions, [permKey]: !target.permissions[permKey] };
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, permissions: nextPerms } : u)));
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
    const occupancyRate = totalConfiguredUnits > 0 ? ((occupiedCount / totalConfiguredUnits) * 100).toFixed(1) : 0;
    const totalBilled = invoices.reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);
    const totalCollected = invoices.filter((i) => i.status === "مدفوع").reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);
    const totalPending = invoices.filter((i) => i.status !== "مدفوع").reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);
    const openTicketsCount = tickets.filter((t) => t.status !== "resolved").length;
    const expiringLeasesCount = units.filter(
      (u) =>
        u.status.includes("تنبيه") ||
        (u.ownershipType === "مستأجر" && u.expireDate && u.expireDate.startsWith("2026-12")) ||
        (u.ownershipType === "مالك" && u.isSubleased && u.subleaseExpireDate && u.subleaseExpireDate.startsWith("2026-12"))
    ).length;

    return { occupiedCount, occupancyRate, totalBilled, totalCollected, totalPending, openTicketsCount, expiringLeasesCount };
  }, [units, invoices, tickets, totalConfiguredUnits]);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    const cleanedFloors = draftConfig.floors.map((f, idx) => ({
      ...f,
      code: (f.code || `F${idx + 1}`).trim(),
      name: f.name.trim() || `دور ${idx + 1}`,
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
          : "تم حفظ إعدادات المول وأكواد وأسماء الأدوار بنجاح."
      );
    } else {
      setNoticeMessage("تم تحديث إعدادات المول وأكواد الأدوار.");
    }
  };

  const handleAddFloorRow = () => {
    const nextIndex = draftConfig.floors.length + 1;
    setDraftConfig((prev) => ({
      ...prev,
      floors: [
        ...prev.floors,
        {
          id: `floor-${Date.now()}`,
          code: `F${nextIndex}`,
          name: `دور جديد ${nextIndex}`,
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
      maintenanceDeposit: Number(newUnit.maintenanceDeposit) || 0,
    };

    setUnits((prev) => [...prev, unitRecord]);
    if (supabase) {
      const { error } = await supabase.from("units").upsert(mapUnitToDb(unitRecord));
      setNoticeMessage(
        error
          ? `تمت الإضافة محلياً لكن حدث خطأ في حفظ قاعدة البيانات: ${error.message}`
          : `تم حفظ الوحدة ${unitRecord.id} (${unitRecord.ownershipType}) بنجاح.`
      );
    }

    const firstFloor = mallConfig.floors[0];
    setNewUnit({
      id: firstFloor?.code ? `${firstFloor.code}-` : "",
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
      floor: firstFloor?.name || "الدور الأرضي",
      phone: "",
      portalPassword: "",
      maintenanceDeposit: "10000",
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
      maintenanceDeposit: unit.maintenanceDeposit !== undefined ? String(unit.maintenanceDeposit) : "0",
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

      if (supabase) {
        await supabase.from("unit_contract_history").upsert({
          id: historyEntry.id,
          unit_id: newId,
          party_name: historyEntry.partyName,
          ownership_type: historyEntry.ownershipType,
          amount: historyEntry.amount,
          start_date: "",
          end_date: historyEntry.endDate,
          archived_at: historyEntry.archivedAt,
          reason: historyEntry.reason,
        });
      }
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
      maintenanceDeposit: Number(editUnitForm.maintenanceDeposit) || 0,
      contractHistory: nextHistory,
    };

    setUnits((prev) => prev.map((u) => (u.id === editingUnitOriginalId ? updatedRecord : u)));

    if (supabase) {
      const { error: upsertErr } = await supabase.from("units").upsert(mapUnitToDb(updatedRecord));
      if (upsertErr) {
        setNoticeMessage(`تم التعديل محلياً لكن فشل الحفظ في قاعدة البيانات: ${upsertErr.message}`);
      } else {
        if (newId !== editingUnitOriginalId) {
          await supabase.from("units").delete().eq("id", editingUnitOriginalId);
        }
        setNoticeMessage(`تم تحديث بيانات الوحدة ${updatedRecord.id} بنجاح.`);
      }
    }

    setEditingUnitOriginalId(null);
    setEditUnitForm(null);
  };

  const handleRequestDeleteUnit = (unit) => {
    const unpaidInvoices = invoices.filter((inv) => inv.unitId === unit.id && inv.status !== "مدفوع");
    const openOrUnpaidTickets = tickets.filter(
      (t) => t.unitId === unit.id && (t.status !== "resolved" || (t.billingType === "خارج العقد" && !t.invoiceIssued))
    );

    if (unpaidInvoices.length > 0 || openOrUnpaidTickets.length > 0) {
      setNoticeMessage(
        `لا يمكن حذف الوحدة ${unit.id} لوجود مطالبات غير محصلة أو بلاغات صيانة معلقة؛ يجب تسويتها أو إغلاقها أولاً.`
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
    const invoiceId = `INV-2026-${String(invoices.length + 1).padStart(3, "0")}-${Math.floor(10 + Math.random() * 89)}`;
    const today = new Date().toISOString().split("T")[0];

    const invoiceRecord = {
      id: invoiceId,
      unitId: newInvoice.unitId,
      tenant: matchedUnit ? matchedUnit.tenant : `وحدة ${newInvoice.unitId}`,
      amount: amountNum,
      type: newInvoice.type.trim() || "إيجار شهري",
      dueDate: newInvoice.dueDate || today,
      status: newInvoice.status,
      paymentDate: newInvoice.status === "مدفوع" ? today : "-",
    };

    setInvoices((prev) => [invoiceRecord, ...prev]);
    if (supabase) {
      await supabase.from("invoices").upsert(mapInvoiceToDb(invoiceRecord));
    }

    setNewInvoice({ unitId: units[0]?.id || "", amount: "", type: "إيجار شهري", dueDate: "2026-12-05", status: "قيد الانتظار" });
    setShowAddInvoiceModal(false);
  };

  const handlePayInvoice = async (invoiceId) => {
    const today = new Date().toISOString().split("T")[0];
    setInvoices((prev) => prev.map((inv) => (inv.id === invoiceId ? { ...inv, status: "مدفوع", paymentDate: today } : inv)));
    if (supabase) {
      await supabase.from("invoices").update({ status: "مدفوع", payment_date: today }).eq("id", invoiceId);
    }
    setNoticeMessage(`تم تحصيل المطالبة ${invoiceId} وإدخال المبلغ في الخزينة.`);
  };

  const handleAddTicket = async (e) => {
    e.preventDefault();
    if (!newTicket.unitId || !newTicket.title.trim()) return;

    const ticketRecord = {
      id: `TCK-${Math.floor(200 + Math.random() * 799)}`,
      unitId: newTicket.unitId,
      title: newTicket.title.trim(),
      priority: newTicket.priority,
      status: "new",
      category: newTicket.category,
      date: "الآن",
      assignedTo: newTicket.assignedTo.trim() || "بانتظار توجيه مسؤول الصيانة",
      billingType: "غير محدد",
      serviceFee: 0,
      paymentStatus: "غير محدد",
      approvalStatus: "غير مطلوب",
      depositCovered: false,
      invoiceIssued: false,
      invoiceId: null,
    };

    setTickets((prev) => [ticketRecord, ...prev]);
    if (supabase) {
      await supabase.from("tickets").upsert(mapTicketToDb(ticketRecord));
    }

    setNewTicket({
      unitId: units[0]?.id || "",
      title: "",
      priority: "متوسط",
      category: "تكييف",
      assignedTo: "بانتظار توجيه مسؤول الصيانة",
    });
    setShowAddTicketModal(false);
  };

  // تقييم البلاغ:
  // - داخل العقد: تكلفة المصنعيات/قطع الغيار تُحصَّل من الجهة الثالثة المسؤولة عن الوديعة (ولا تُحصّل من العميل ولا تُخصم من رصيد الوديعة المعروض)
  // - خارج العقد: تكلفة الصيانة تُحصَّل من العميل بعد موافقته
  const handleEvaluateTicket = async (ticketId, { billingType, serviceFee, assignedTo }) => {
    const isInside = billingType === "داخل العقد";
    const feeNum = Math.max(0, Number(serviceFee) || 0);
    if (!isInside && feeNum <= 0) {
      setNoticeMessage(`يرجى إدخال مبلغ الصيانة خارج العقد للبلاغ ${ticketId}.`);
      return;
    }

    const patch = {
      billingType,
      serviceFee: feeNum,
      assignedTo: assignedTo?.trim() || (isInside ? "فني الصيانة" : "بانتظار موافقة العميل"),
      depositCovered: isInside,
      approvalStatus: isInside ? "داخل العقد (تحصيل من جهة الوديعة)" : "بانتظار موافقة العميل",
      paymentStatus: isInside
        ? feeNum > 0
          ? `بانتظار تحصيل ${feeNum.toLocaleString()} ج.م من جهة الوديعة`
          : "داخل العقد (لا يُحصّل من العميل)"
        : "بانتظار الموافقة",
    };

    setTickets((prev) => prev.map((t) => (t.id === ticketId ? { ...t, ...patch } : t)));
    if (supabase) {
      await supabase
        .from("tickets")
        .update({
          billing_type: patch.billingType,
          service_fee: patch.serviceFee,
          assigned_to: patch.assignedTo,
          deposit_covered: patch.depositCovered,
          approval_status: patch.approvalStatus,
          payment_status: patch.paymentStatus,
        })
        .eq("id", ticketId);
    }
  };

  const handleClientApproveTicket = async (ticketId) => {
    const target = tickets.find((t) => t.id === ticketId);
    if (!target) return;
    const patch = {
      approvalStatus: "موافق عليه",
      paymentStatus: "بانتظار إتمام الإصلاح وإصدار المطالبة",
      status: "in_progress",
      assignedTo:
        target.assignedTo && !target.assignedTo.includes("بانتظار")
          ? target.assignedTo
          : "فني الصيانة (تم التوجيه بعد الموافقة)",
    };

    setTickets((prev) => prev.map((t) => (t.id === ticketId ? { ...t, ...patch } : t)));
    if (supabase) {
      await supabase
        .from("tickets")
        .update({
          approval_status: patch.approvalStatus,
          payment_status: patch.paymentStatus,
          status: patch.status,
          assigned_to: patch.assignedTo,
        })
        .eq("id", ticketId);
    }
  };

  const handleResolveAndIssueInvoice = async (ticketId) => {
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket || ticket.billingType === "غير محدد") {
      setNoticeMessage(`يجب أولاً تحديد هل البلاغ ${ticketId} داخل العقد أم خارجه.`);
      return;
    }
    if (ticket.billingType === "خارج العقد" && ticket.approvalStatus !== "موافق عليه") {
      setNoticeMessage(`يلزم موافقة العميل قبل إغلاق البلاغ ${ticketId} أو إصدار مطالبته.`);
      return;
    }

    let issuedInvoiceId = ticket.invoiceId || null;
    const feeNum = Number(ticket.serviceFee) || 0;
    const today = new Date().toISOString().split("T")[0];

    if (feeNum > 0 && !ticket.invoiceIssued) {
      if (ticket.billingType === "خارج العقد") {
        const matchedUnit = units.find((u) => u.id === ticket.unitId);
        const partyName =
          matchedUnit?.ownershipType === "مالك" && matchedUnit?.isSubleased && matchedUnit?.subtenantName
            ? `${matchedUnit.subtenantName} (وحدة ${ticket.unitId} - مالك: ${matchedUnit.tenant})`
            : matchedUnit?.tenant || `وحدة ${ticket.unitId}`;

        issuedInvoiceId = `INV-MNT-${ticket.id}-${Math.floor(10 + Math.random() * 89)}`;
        const newInv = {
          id: issuedInvoiceId,
          unitId: ticket.unitId,
          tenant: partyName,
          amount: feeNum,
          type: `صيانة خارج العقد (${ticket.title} - ${ticket.id})`,
          dueDate: today,
          status: "قيد الانتظار",
          paymentDate: "-",
        };
        setInvoices((prev) => [newInv, ...prev]);
        if (supabase) await supabase.from("invoices").upsert(mapInvoiceToDb(newInv));
      } else if (ticket.billingType === "داخل العقد") {
        issuedInvoiceId = `INV-DEP-${ticket.id}-${Math.floor(10 + Math.random() * 89)}`;
        const depositPartyName = `الجهة المسؤولة عن وديعة الصيانة (وحدة ${ticket.unitId})`;
        const newInv = {
          id: issuedInvoiceId,
          unitId: ticket.unitId,
          tenant: depositPartyName,
          amount: feeNum,
          type: `صيانة داخل العقد - مصنعيات وقطع غيار (${ticket.title} - ${ticket.id})`,
          dueDate: today,
          status: "قيد الانتظار",
          paymentDate: "-",
        };
        setInvoices((prev) => [newInv, ...prev]);
        if (supabase) await supabase.from("invoices").upsert(mapInvoiceToDb(newInv));
      }
    }

    const updatedTicket = {
      ...ticket,
      status: "resolved",
      invoiceIssued: feeNum > 0 ? true : ticket.invoiceIssued,
      invoiceId: issuedInvoiceId,
      paymentStatus:
        ticket.billingType === "داخل العقد"
          ? feeNum > 0
            ? `مطالبة على جهة الوديعة (${issuedInvoiceId || ""})`
            : "داخل العقد (بدون تكلفة إضافية)"
          : "مطالبة قائمة بانتظار التحصيل",
    };

    setTickets((prev) => prev.map((t) => (t.id === ticketId ? updatedTicket : t)));
    if (supabase) {
      await supabase
        .from("tickets")
        .update({
          status: updatedTicket.status,
          invoice_issued: updatedTicket.invoiceIssued,
          invoice_id: updatedTicket.invoiceId,
          payment_status: updatedTicket.paymentStatus,
        })
        .eq("id", ticketId);
    }
  };

  const handleAddAnnouncement = async (e) => {
    e.preventDefault();
    if (!newAnnouncement.title.trim() || !newAnnouncement.content.trim()) return;
    const record = {
      id: Date.now(),
      ...newAnnouncement,
      date: new Date().toISOString().split("T")[0],
    };
    setAnnouncements((prev) => [record, ...prev]);
    if (supabase) await supabase.from("announcements").insert(record);
    setNewAnnouncement({ title: "", content: "", priority: "عادي", target: "جميع المستأجرين" });
    setShowAnnouncementModal(false);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const { kind, id } = deleteTarget;
    setDeleteTarget(null);

    const setters = {
      unit: () => setUnits((prev) => prev.filter((item) => item.id !== id)),
      invoice: () => setInvoices((prev) => prev.filter((item) => item.id !== id)),
      ticket: () => setTickets((prev) => prev.filter((item) => item.id !== id)),
      announcement: () => setAnnouncements((prev) => prev.filter((item) => item.id !== id)),
      user: () => setUsers((prev) => prev.filter((item) => item.id !== id)),
    };
    setters[kind]?.();

    const tableMap = {
      unit: "units",
      invoice: "invoices",
      ticket: "tickets",
      announcement: "announcements",
      user: "portal_users",
    };
    if (supabase && tableMap[kind]) {
      await supabase.from(tableMap[kind]).delete().eq("id", id);
    }
  };

  const moveTicket = async (ticketId, newStatus) => {
    const target = tickets.find((t) => t.id === ticketId);
    if (!target) return;
    if (newStatus === "resolved") return handleResolveAndIssueInvoice(ticketId);
    if (newStatus === "in_progress" && target.billingType === "خارج العقد" && target.approvalStatus !== "موافق عليه") {
      setNoticeMessage(`يرجى تسجيل موافقة العميل أولاً قبل توجيه الفني للبلاغ ${ticketId}.`);
      return;
    }
    setTickets((prev) => prev.map((t) => (t.id === ticketId ? { ...t, status: newStatus } : t)));
    if (supabase) await supabase.from("tickets").update({ status: newStatus }).eq("id", ticketId);
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
      return invoiceFilter === "الكل" ? matchesSearch : matchesSearch && i.status === invoiceFilter;
    });
  }, [invoices, searchQuery, invoiceFilter]);

  const unitFilterOptions = useMemo(
    () => ["الكل", "ملاك", "مستأجرون", "مؤجرة للغير", ...mallConfig.floors.map((f) => f.name), "تنبيهات"],
    [mallConfig]
  );

  if (!authReady) {
    return (
      <div dir="rtl" className="min-h-screen bg-[#070F1B] text-slate-400 flex items-center justify-center p-4 text-xs font-sans">
        جاري تحميل الجلسة...
      </div>
    );
  }

  if (!currentUser) {
    const chosenUser = users.find((u) => u.id === selectedUserId) || users[0];
    return (
      <div dir="rtl" className="min-h-screen bg-[#070F1B] text-slate-100 flex items-center justify-center p-4 font-sans">
        <div className="bg-[#0B192C] border border-slate-800 rounded-2xl p-6 w-full max-w-md space-y-5 shadow-2xl">
          <div className="flex flex-col items-center border-b border-slate-800 pb-4 gap-3">
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
                title={dbConnected ? "متصل بقاعدة بيانات Supabase" : "وضع محلي"}
              />
            </div>
          </div>

          <nav className="p-4 space-y-1.5">
            <NavItem icon={<LayoutDashboard className="w-5 h-5" />} label="لوحة التحكم الرئيسية" active={activeTab === "overview"} onClick={() => handleSelectTab("overview")} />
            <NavItem icon={<Building2 className="w-5 h-5" />} label="الوحدات والملاك والعقود" active={activeTab === "units"} onClick={() => handleSelectTab("units")} badge={units.length} />
            {perms.canViewBilling && (
              <NavItem
                icon={<CreditCard className="w-5 h-5" />}
                label="التحصيل والمطالبات"
                active={activeTab === "billing"}
                onClick={() => handleSelectTab("billing")}
                badge={invoices.filter((i) => i.status !== "مدفوع").length}
                badgeColor="bg-amber-500/20 text-amber-400 border-amber-500/30"
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
                placeholder="ابحث عن وحدة، مالك، مستأجر، أو مطالبة/فاتورة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#070F1B] border border-slate-700/80 rounded-xl pr-10 pl-8 py-2 text-xs text-slate-200 focus:outline-none focus:border-[#00D8F6]"
              />
              {searchQuery && (
                <button type="button" onClick={() => setSearchQuery("")} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
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
              <div className="bg-gradient-to-r from-[#1E3E62] via-[#0B192C] to-[#070F1B] rounded-2xl p-6 border border-slate-700/60 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#00D8F6] bg-[#00D8F6]/10 px-2.5 py-0.5 rounded-full border border-[#00D8F6]/20 mb-2">
                    <Sparkles className="w-3 h-3" /> MMS • Mall Management System
                  </span>
                  <h2 className="text-2xl font-black text-white">لوحة تحكم {mallConfig.mallName}</h2>
                  <p className="text-slate-300 text-xs mt-1">متابعة لحظية للوحدات والتحصيل والصيانة عبر نظام MMS.</p>
                </div>
                <div className="flex items-center gap-2 text-xs bg-[#070F1B]/70 p-3 rounded-xl border border-slate-700/50">
                  <Calendar className="w-4 h-4 text-[#00D8F6]" />
                  <div>
                    <p className="text-slate-400 text-[10px]">تاريخ التشغيل</p>
                    <p className="font-bold text-slate-200">نوفمبر 2026</p>
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
                    title="المحصّل في الخزينة"
                    value={`${dynamicKpis.totalCollected.toLocaleString()} ج.م`}
                    subtext={`من إجمالي ${dynamicKpis.totalBilled.toLocaleString()} ج.م`}
                    icon={<DollarSign className="w-6 h-6 text-emerald-400" />}
                    badge={`قائمة ${dynamicKpis.totalPending.toLocaleString()} ج.م`}
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
                  title="عقود تنتهي قريباً"
                  value={`${dynamicKpis.expiringLeasesCount} عقود`}
                  subtext="تتطلب متابعة التجديد"
                  icon={<AlertTriangle className="w-6 h-6 text-rose-400" />}
                  badge="إجراء مطلوب"
                  badgeType="danger"
                />
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
                  <p className="text-xs text-slate-400">إدارة الوحدات والملاك والمستأجرين ووديعة الصيانة والسجل التاريخي</p>
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
                    {filter}
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
                        <th className="p-4">التفاصيل المالية والوديعة</th>
                        <th className="p-4">نهاية العقد</th>
                        <th className="p-4">الحالة</th>
                        <th className="p-4 text-center">إجراء</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-200">
                      {filteredUnits.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="p-8 text-center text-slate-500">لا توجد وحدات مضافة بعد.</td>
                        </tr>
                      ) : (
                        filteredUnits.map((unit) => {
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
                              <td className="p-4 text-slate-300 space-y-0.5">
                                {isOwner ? (
                                  unit.isSubleased ? (
                                    <>
                                      <p className="text-emerald-400 font-semibold">مؤجر للغير: {unit.subtenantName || "مستأجر فرعي"}</p>
                                      <p className="text-[10px] text-slate-400">إيجار التأجير: {Number(unit.subleaseRent || 0).toLocaleString()} ج.م</p>
                                    </>
                                  ) : (
                                    <span className="text-slate-400">بدون عقد إيجار (ملك خاص)</span>
                                  )
                                ) : (
                                  <p className="font-bold text-emerald-400">{Number(unit.rent || 0).toLocaleString()} ج.م / شهر</p>
                                )}
                                <p className="text-[10px] text-cyan-300">
                                  وديعة الصيانة: {Number(unit.maintenanceDeposit || 0).toLocaleString()} ج.م
                                </p>
                              </td>
                              <td className="p-4 text-slate-300">
                                {isOwner ? (unit.isSubleased ? unit.subleaseExpireDate || "-" : "لا يوجد عقد إيجار") : unit.expireDate || "-"}
                              </td>
                              <td className="p-4">
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold border bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
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
                        })
                      )}
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
                  <p className="text-xs text-slate-400">إجمالي المطالبات والفواتير</p>
                  <p className="text-xl font-black text-white mt-1">{dynamicKpis.totalBilled.toLocaleString()} ج.م</p>
                </div>
                <div className="bg-[#0B192C] p-4 rounded-2xl border border-slate-800">
                  <p className="text-xs text-slate-400">المحصّل في الخزينة</p>
                  <p className="text-xl font-black text-emerald-400 mt-1">{dynamicKpis.totalCollected.toLocaleString()} ج.م</p>
                </div>
                <div className="bg-[#0B192C] p-4 rounded-2xl border border-slate-800">
                  <p className="text-xs text-slate-400">مطالبات لم تُحصّل بعد</p>
                  <p className="text-xl font-black text-amber-400 mt-1">{dynamicKpis.totalPending.toLocaleString()} ج.م</p>
                </div>
              </div>

              <div className="bg-[#0B192C] border border-slate-800 rounded-2xl p-4 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-[#00D8F6]" /> سجل المطالبات والفواتير المحصّلة
                  </h3>
                  <div className="flex flex-wrap items-center gap-2">
                    {perms.canManageBilling && (
                      <button type="button" onClick={() => setShowAddInvoiceModal(true)} className="bg-gradient-to-r from-[#00D8F6] to-blue-600 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 hover:brightness-110 transition">
                        <Plus className="w-3.5 h-3.5" /> مطالبة / فاتورة جديدة
                      </button>
                    )}
                    {[
                      { key: "الكل", label: "الكل" },
                      { key: "قيد الانتظار", label: "مطالبة" },
                      { key: "متأخر", label: "متأخرة" },
                      { key: "مدفوع", label: "محصّل" },
                    ].map((filter) => (
                      <button
                        key={filter.key}
                        type="button"
                        onClick={() => setInvoiceFilter(filter.key)}
                        className={`px-2.5 py-1 rounded-lg text-xs transition ${
                          invoiceFilter === filter.key ? "bg-[#00D8F6] text-slate-950 font-bold" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                        }`}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-[#070F1B] text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="p-3">رقم المرجع</th>
                        <th className="p-3">الوحدة والطرف / الجهة</th>
                        <th className="p-3">البيان</th>
                        <th className="p-3">المبلغ</th>
                        <th className="p-3">الاستحقاق</th>
                        <th className="p-3">الحالة</th>
                        <th className="p-3 text-center">إجراء</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {filteredInvoices.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="p-8 text-center text-slate-500">لا توجد مطالبات أو فواتير مسجلة.</td>
                        </tr>
                      ) : (
                        filteredInvoices.map((inv) => {
                          const isPaid = inv.status === "مدفوع";
                          return (
                            <tr key={inv.id} className="hover:bg-slate-800/40 transition">
                              <td className="p-3 font-mono font-semibold text-slate-300">{inv.id}</td>
                              <td className="p-3 font-bold text-slate-100">{inv.tenant} ({inv.unitId})</td>
                              <td className="p-3 text-slate-300">{inv.type}</td>
                              <td className="p-3 font-bold text-white">{inv.amount.toLocaleString()} ج.م</td>
                              <td className="p-3 text-slate-400">{inv.dueDate}</td>
                              <td className="p-3">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${isPaid ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : "bg-amber-500/10 text-amber-400 border-amber-500/30"}`}>
                                  {isPaid ? "محصّل" : inv.status}
                                </span>
                              </td>
                              <td className="p-3 text-center flex items-center justify-center gap-2">
                                {perms.canManageBilling && !isPaid && (
                                  <button type="button" onClick={() => handlePayInvoice(inv.id)} className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 px-2 py-1 rounded text-[10px] font-bold transition">
                                    تحصيل الآن
                                  </button>
                                )}
                                <button type="button" onClick={() => { setSelectedInvoice(inv); setShowInvoiceModal(true); }} className="bg-slate-800 hover:bg-[#00D8F6] hover:text-slate-950 text-slate-200 border border-slate-700 px-2.5 py-1 rounded text-[10px] font-semibold flex items-center gap-1 transition">
                                  <Printer className="w-3 h-3" /> {isPaid ? "الإيصال" : "المطالبة"}
                                </button>
                                {perms.canDelete && (
                                  <button
                                    type="button"
                                    onClick={() => setDeleteTarget({ kind: "invoice", id: inv.id, label: `السجل ${inv.id}` })}
                                    className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 px-2 py-1 rounded text-[10px] font-bold inline-flex items-center gap-1 transition"
                                  >
                                    <Trash2 className="w-3 h-3" /> حذف
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
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
                  <p className="text-xs text-slate-400">داخل العقد يُصدر مطالبة على الجهة المسؤولة عن الوديعة • خارج العقد يُصدر مطالبة على العميل بعد الموافقة</p>
                </div>
                {perms.canManageTickets && (
                  <button type="button" onClick={() => setShowAddTicketModal(true)} className="bg-gradient-to-r from-[#00D8F6] to-blue-600 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 hover:brightness-110 transition">
                    <Plus className="w-4 h-4" /> بلاغ صيانة جديد
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <KanbanColumn title="بلاغات جديدة / بانتظار التقييم" count={tickets.filter((t) => t.status === "new").length} color="border-rose-500/50 bg-rose-500/5">
                  {tickets.filter((t) => t.status === "new").map((ticket) => (
                    <TicketCard
                      key={ticket.id}
                      ticket={ticket}
                      canManageTickets={perms.canManageTickets}
                      canDelete={perms.canDelete}
                      onMove={(status) => moveTicket(ticket.id, status)}
                      onEvaluate={(payload) => handleEvaluateTicket(ticket.id, payload)}
                      onApproveClient={() => handleClientApproveTicket(ticket.id)}
                      onResolveAndInvoice={() => handleResolveAndIssueInvoice(ticket.id)}
                      onDelete={() => setDeleteTarget({ kind: "ticket", id: ticket.id, label: `البلاغ ${ticket.id}` })}
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
                      onEvaluate={(payload) => handleEvaluateTicket(ticket.id, payload)}
                      onApproveClient={() => handleClientApproveTicket(ticket.id)}
                      onResolveAndInvoice={() => handleResolveAndIssueInvoice(ticket.id)}
                      onDelete={() => setDeleteTarget({ kind: "ticket", id: ticket.id, label: `البلاغ ${ticket.id}` })}
                    />
                  ))}
                </KanbanColumn>

                <KanbanColumn title="تم الحل" count={tickets.filter((t) => t.status === "resolved").length} color="border-emerald-500/50 bg-emerald-500/5">
                  {tickets.filter((t) => t.status === "resolved").map((ticket) => (
                    <TicketCard
                      key={ticket.id}
                      ticket={ticket}
                      canManageTickets={perms.canManageTickets}
                      canDelete={perms.canDelete}
                      onMove={(status) => moveTicket(ticket.id, status)}
                      onEvaluate={(payload) => handleEvaluateTicket(ticket.id, payload)}
                      onApproveClient={() => handleClientApproveTicket(ticket.id)}
                      onResolveAndInvoice={() => handleResolveAndIssueInvoice(ticket.id)}
                      onDelete={() => setDeleteTarget({ kind: "ticket", id: ticket.id, label: `البلاغ ${ticket.id}` })}
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
                    <BellRing className="w-5 h-5 text-[#00D8F6]" /> سجل التنبيهات والإعلانات
                  </h2>
                  <p className="text-xs text-slate-400">بث الإشعارات للملاك والمستأجرين</p>
                </div>
                {perms.canManageAnnouncements && (
                  <button type="button" onClick={() => setShowAnnouncementModal(true)} className="bg-[#00D8F6] text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5">
                    <Plus className="w-4 h-4" /> إعلان جديد
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {announcements.length === 0 ? (
                  <div className="bg-[#0B192C] p-8 text-center text-slate-500 rounded-2xl border border-slate-800">لا توجد تنبيهات مرسلة حالياً.</div>
                ) : (
                  announcements.map((item) => (
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
                  ))
                )}
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
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">اسم المستخدم</label>
                    <input
                      required
                      type="text"
                      value={newUserForm.name}
                      onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
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
                      className="w-full bg-[#070F1B] border border-slate-700 rounded-xl p-2.5 text-slate-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">المسمى الوظيفي</label>
                    <input
                      type="text"
                      value={newUserForm.roleTitle}
                      onChange={(e) => setNewUserForm({ ...newUserForm, roleTitle: e.target.value })}
                      className="w-full bg-[#070F1B] border border-slate-700 rounded-xl p-2.5 text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">الشارة</label>
                    <input
                      type="text"
                      value={newUserForm.badge}
                      onChange={(e) => setNewUserForm({ ...newUserForm, badge: e.target.value })}
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
                              permissions: { ...newUserForm.permissions, [item.key]: e.target.checked },
                            })
                          }
                          className="rounded border-slate-600"
                        />
                        <span>{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <button type="submit" className="bg-gradient-to-r from-[#00D8F6] to-blue-600 text-slate-950 font-bold px-4 py-2.5 rounded-xl inline-flex items-center gap-1.5">
                  <Plus className="w-4 h-4" /> حفظ المستخدم بالصلاحيات
                </button>
              </form>

              <div className="bg-[#0B192C] border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="border-b border-slate-800 pb-3">
                  <h2 className="text-base font-bold text-white">المستخدمون الحاليون وتعديل صلاحياتهم</h2>
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
                                active ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" : "bg-slate-800/70 text-slate-500 border-slate-700"
                              }`}
                            >
                              {active ? "✓ " : "✕ "}{p.label}
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
                    <Settings className="w-5 h-5 text-[#00D8F6]" /> إعدادات المول وأكواد وأسماء الأدوار
                  </h2>
                  <p className="text-xs text-slate-400">عدّل كود واسم وعدد وحدات أي دور بسهولة</p>
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
                  <h3 className="font-bold text-slate-200">أدوار المول وكود كل دور</h3>
                  <button type="button" onClick={handleAddFloorRow} className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg font-semibold border border-slate-700 inline-flex items-center gap-1">
                    <Plus className="w-3.5 h-3.5 text-[#00D8F6]" /> إضافة دور
                  </button>
                </div>

                {draftConfig.floors.map((floor, idx) => (
                  <div key={floor.id} className="grid grid-cols-1 sm:grid-cols-5 gap-3 bg-[#070F1B] p-3.5 rounded-xl border border-slate-800">
                    <div>
                      <label className="block text-slate-400 mb-1 text-[10px]">كود الدور</label>
                      <input
                        type="text"
                        value={floor.code || ""}
                        onChange={(e) => {
                          const next = [...draftConfig.floors];
                          next[idx] = { ...next[idx], code: e.target.value };
                          setDraftConfig({ ...draftConfig, floors: next });
                        }}
                        placeholder="G / DX / F1"
                        className="w-full bg-[#0B192C] border border-slate-700 rounded-lg p-2 text-[#00D8F6] font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1 text-[10px]">اسم الدور</label>
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
                      <label className="block text-slate-400 mb-1 text-[10px]">نوع النشاط</label>
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
                      <label className="block text-slate-400 mb-1 text-[10px]">عدد الوحدات</label>
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
                      <label className="block text-slate-400 mb-1 text-[10px]">ملاحظات</label>
                      <input
                        type="text"
                        value={floor.notes || ""}
                        onChange={(e) => {
                          const next = [...draftConfig.floors];
                          next[idx] = { ...next[idx], notes: e.target.value };
                          setDraftConfig({ ...draftConfig, floors: next });
                        }}
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
            <p className="text-slate-200">
              هل أنت متأكد من حذف <strong className="text-rose-400">{deleteTarget.label}</strong>؟
            </p>
            <div className="pt-2 flex items-center justify-end gap-2">
              <button type="button" onClick={() => setDeleteTarget(null)} className="px-4 py-2 rounded-xl text-slate-400 hover:bg-slate-800">إلغاء</button>
              <button type="button" onClick={confirmDelete} className="bg-rose-500 hover:bg-rose-600 text-white font-bold px-5 py-2 rounded-xl">تأكيد الحذف</button>
            </div>
          </div>
        </Modal>
      )}

      {showAddUnitModal && (
        <Modal title="إضافة وحدة جديدة" onClose={() => setShowAddUnitModal(false)}>
          <form onSubmit={handleAddUnit} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">الدور</label>
                <select
                  value={newUnit.floor}
                  onChange={(e) => handleFloorSelectionInAddUnit(e.target.value)}
                  className="w-full bg-[#070F1B] border border-slate-700 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-[#00D8F6]"
                >
                  {mallConfig.floors.map((f) => (
                    <option key={f.id} value={f.name}>
                      {f.name} ({f.code})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">رقم الوحدة (كود الدور + الرقم)</label>
                <input
                  required
                  type="text"
                  value={newUnit.id}
                  onChange={(e) => setNewUnit({ ...newUnit, id: e.target.value })}
                  placeholder="مثال: G-01 أو DX-02"
                  className="w-full bg-[#070F1B] border border-slate-700 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-[#00D8F6]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">الصفة</label>
                <select
                  value={newUnit.ownershipType}
                  onChange={(e) => setNewUnit({ ...newUnit, ownershipType: e.target.value, isSubleased: false })}
                  className="w-full bg-[#070F1B] border border-slate-700 rounded-xl p-2.5 text-slate-200"
                >
                  <option value="مستأجر">مستأجر</option>
                  <option value="مالك">مالك (بدون عقد إيجار)</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">
                  {newUnit.ownershipType === "مالك" ? "اسم المالك" : "اسم المستأجر / النشاط"}
                </label>
                <input
                  required
                  type="text"
                  value={newUnit.tenant}
                  onChange={(e) => setNewUnit({ ...newUnit, tenant: e.target.value })}
                  className="w-full bg-[#070F1B] border border-slate-700 rounded-xl p-2.5 text-slate-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">رقم التواصل</label>
                <input type="text" value={newUnit.phone} onChange={(e) => setNewUnit({ ...newUnit, phone: e.target.value })} className="w-full bg-[#070F1B] border border-slate-700 rounded-xl p-2.5 text-slate-200" />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">باسورد البوابة</label>
                <input required type="text" value={newUnit.portalPassword} onChange={(e) => setNewUnit({ ...newUnit, portalPassword: e.target.value })} placeholder="1234" className="w-full bg-[#070F1B] border border-slate-700 rounded-xl p-2.5 text-slate-200" />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">وديعة الصيانة (10% من الشراء)</label>
                <input type="number" value={newUnit.maintenanceDeposit} onChange={(e) => setNewUnit({ ...newUnit, maintenanceDeposit: e.target.value })} className="w-full bg-[#070F1B] border border-slate-700 rounded-xl p-2.5 text-slate-200" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">القطاع</label>
                <select value={newUnit.type} onChange={(e) => setNewUnit({ ...newUnit, type: e.target.value })} className="w-full bg-[#070F1B] border border-slate-700 rounded-xl p-2.5 text-slate-200">
                  <option value="تجاري">تجاري</option>
                  <option value="إداري">إداري</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">المساحة</label>
                <input type="text" value={newUnit.area} onChange={(e) => setNewUnit({ ...newUnit, area: e.target.value })} placeholder="100 م²" className="w-full bg-[#070F1B] border border-slate-700 rounded-xl p-2.5 text-slate-200" />
              </div>
            </div>

            {newUnit.ownershipType === "مستأجر" ? (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">الإيجار الشهري (ج.م)</label>
                  <input type="number" value={newUnit.rent} onChange={(e) => setNewUnit({ ...newUnit, rent: e.target.value })} className="w-full bg-[#070F1B] border border-slate-700 rounded-xl p-2.5 text-slate-200" />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">نهاية العقد</label>
                  <input type="date" value={newUnit.expireDate} onChange={(e) => setNewUnit({ ...newUnit, expireDate: e.target.value })} className="w-full bg-[#070F1B] border border-slate-700 rounded-xl p-2.5 text-slate-200" />
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
                  <div className="grid grid-cols-3 gap-2">
                    <input type="text" value={newUnit.subtenantName} onChange={(e) => setNewUnit({ ...newUnit, subtenantName: e.target.value })} placeholder="المستأجر" className="bg-[#0B192C] border border-slate-700 rounded-lg p-2 text-slate-200" />
                    <input type="number" value={newUnit.subleaseRent} onChange={(e) => setNewUnit({ ...newUnit, subleaseRent: e.target.value })} placeholder="قيمة الإيجار" className="bg-[#0B192C] border border-slate-700 rounded-lg p-2 text-slate-200" />
                    <input type="date" value={newUnit.subleaseExpireDate} onChange={(e) => setNewUnit({ ...newUnit, subleaseExpireDate: e.target.value })} className="bg-[#0B192C] border border-slate-700 rounded-lg p-2 text-slate-200" />
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

      {editUnitForm && (
        <Modal
          title={`تعديل الوحدة (${editingUnitOriginalId})`}
          onClose={() => {
            setEditingUnitOriginalId(null);
            setEditUnitForm(null);
          }}
        >
          <form onSubmit={handleSaveEditedUnit} className="space-y-4 text-xs max-h-[75vh] overflow-y-auto pl-1">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">رقم الوحدة</label>
                <input required type="text" value={editUnitForm.id} onChange={(e) => setEditUnitForm({ ...editUnitForm, id: e.target.value })} className="w-full bg-[#070F1B] border border-slate-700 rounded-xl p-2.5 text-slate-200" />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">الدور</label>
                <select value={editUnitForm.floor} onChange={(e) => setEditUnitForm({ ...editUnitForm, floor: e.target.value })} className="w-full bg-[#070F1B] border border-slate-700 rounded-xl p-2.5 text-slate-200">
                  {mallConfig.floors.map((f) => (
                    <option key={f.id} value={f.name}>{f.name} ({f.code})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">الاسم</label>
                <input required type="text" value={editUnitForm.tenant} onChange={(e) => setEditUnitForm({ ...editUnitForm, tenant: e.target.value })} className="w-full bg-[#070F1B] border border-slate-700 rounded-xl p-2.5 text-slate-200" />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">وديعة الصيانة</label>
                <input type="number" value={editUnitForm.maintenanceDeposit} onChange={(e) => setEditUnitForm({ ...editUnitForm, maintenanceDeposit: e.target.value })} className="w-full bg-[#070F1B] border border-slate-700 rounded-xl p-2.5 text-slate-200" />
              </div>
            </div>

            <div className="bg-[#070F1B] border border-slate-800 rounded-xl p-3 space-y-2">
              <label className="flex items-center gap-2 text-[#00D8F6] font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(editUnitForm.archiveCurrentContract)}
                  onChange={(e) => setEditUnitForm({ ...editUnitForm, archiveCurrentContract: e.target.checked })}
                />
                <Archive className="w-3.5 h-3.5" />
                <span>أرشفة العقد / التشغيل السابق في السجل التاريخي</span>
              </label>
              {Array.isArray(editUnitForm.contractHistory) && editUnitForm.contractHistory.length > 0 && (
                <div className="pt-2 border-t border-slate-800 space-y-1">
                  {editUnitForm.contractHistory.map((h) => (
                    <div key={h.id} className="text-[10px] text-slate-300 flex justify-between">
                      <span>{h.partyName} ({h.archivedAt})</span>
                      <span className="text-emerald-400">{Number(h.amount || 0).toLocaleString()} ج.م</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button type="button" onClick={() => { setEditingUnitOriginalId(null); setEditUnitForm(null); }} className="px-4 py-2 rounded-xl text-slate-400 hover:bg-slate-800">إلغاء</button>
              <button type="submit" className="bg-[#00D8F6] text-slate-950 font-bold px-5 py-2 rounded-xl">حفظ التعديلات</button>
            </div>
          </form>
        </Modal>
      )}

      {showAddInvoiceModal && (
        <Modal title="إضافة مطالبة / فاتورة جديدة" onClose={() => setShowAddInvoiceModal(false)}>
          <form onSubmit={handleAddInvoice} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">الوحدة</label>
              <select value={newInvoice.unitId} onChange={(e) => setNewInvoice({ ...newInvoice, unitId: e.target.value })} className="w-full bg-[#070F1B] border border-slate-700 rounded-xl p-2.5 text-slate-200">
                <option value="">اختر الوحدة...</option>
                {units.map((u) => (
                  <option key={u.id} value={u.id}>{u.id} - {u.tenant}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">المبلغ (ج.م)</label>
                <input required type="number" min="1" value={newInvoice.amount} onChange={(e) => setNewInvoice({ ...newInvoice, amount: e.target.value })} className="w-full bg-[#070F1B] border border-slate-700 rounded-xl p-2.5 text-slate-200" />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">البيان</label>
                <input required type="text" value={newInvoice.type} onChange={(e) => setNewInvoice({ ...newInvoice, type: e.target.value })} className="w-full bg-[#070F1B] border border-slate-700 rounded-xl p-2.5 text-slate-200" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">الاستحقاق</label>
                <input required type="date" value={newInvoice.dueDate} onChange={(e) => setNewInvoice({ ...newInvoice, dueDate: e.target.value })} className="w-full bg-[#070F1B] border border-slate-700 rounded-xl p-2.5 text-slate-200" />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">الحالة</label>
                <select value={newInvoice.status} onChange={(e) => setNewInvoice({ ...newInvoice, status: e.target.value })} className="w-full bg-[#070F1B] border border-slate-700 rounded-xl p-2.5 text-slate-200">
                  <option value="قيد الانتظار">مطالبة (غير محصلة)</option>
                  <option value="متأخر">مطالبة متأخرة</option>
                  <option value="مدفوع">محصّل (في الخزينة)</option>
                </select>
              </div>
            </div>
            <div className="pt-2 flex justify-end gap-2">
              <button type="button" onClick={() => setShowAddInvoiceModal(false)} className="px-4 py-2 rounded-xl text-slate-400 hover:bg-slate-800">إلغاء</button>
              <button type="submit" className="bg-[#00D8F6] text-slate-950 font-bold px-5 py-2 rounded-xl">حفظ</button>
            </div>
          </form>
        </Modal>
      )}

      {showAddTicketModal && (
        <Modal title="تسجيل بلاغ صيانة" onClose={() => setShowAddTicketModal(false)}>
          <form onSubmit={handleAddTicket} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">الوحدة</label>
                <select value={newTicket.unitId} onChange={(e) => setNewTicket({ ...newTicket, unitId: e.target.value })} className="w-full bg-[#070F1B] border border-slate-700 rounded-xl p-2.5 text-slate-200">
                  <option value="">اختر الوحدة...</option>
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>{u.id} - {u.tenant}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">الأولوية</label>
                <select value={newTicket.priority} onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })} className="w-full bg-[#070F1B] border border-slate-700 rounded-xl p-2.5 text-slate-200">
                  <option value="منخفض">منخفض</option>
                  <option value="متوسط">متوسط</option>
                  <option value="عاجل">عاجل</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">وصف العطل</label>
              <input required type="text" value={newTicket.title} onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })} className="w-full bg-[#070F1B] border border-slate-700 rounded-xl p-2.5 text-slate-200" />
            </div>
            <div className="pt-2 flex justify-end gap-2">
              <button type="button" onClick={() => setShowAddTicketModal(false)} className="px-4 py-2 rounded-xl text-slate-400 hover:bg-slate-800">إلغاء</button>
              <button type="submit" className="bg-[#00D8F6] text-slate-950 font-bold px-5 py-2 rounded-xl">حفظ البلاغ</button>
            </div>
          </form>
        </Modal>
      )}

      {showInvoiceModal && selectedInvoice && (
        <Modal title="معاينة الإيصال / المطالبة" onClose={() => setShowInvoiceModal(false)}>
          <div className="bg-white text-slate-900 p-6 rounded-xl space-y-4 text-right font-sans text-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-lg font-black text-[#0B192C]">{selectedInvoice.status === "مدفوع" ? "إيصال سداد" : "بيان مطالبة"}</h3>
                <p className="text-slate-500">{mallConfig.mallName}</p>
              </div>
              <span className="font-mono font-bold">{selectedInvoice.id}</span>
            </div>
            <div className="space-y-1">
              <p><strong>الوحدة / الجهة:</strong> {selectedInvoice.unitId} — {selectedInvoice.tenant}</p>
              <p><strong>البيان:</strong> {selectedInvoice.type}</p>
              <p><strong>المبلغ:</strong> {selectedInvoice.amount.toLocaleString()} ج.م</p>
              <p><strong>الحالة:</strong> {selectedInvoice.status}</p>
            </div>
            <div className="flex justify-end pt-2">
              <button type="button" onClick={() => window.print()} className="bg-[#0B192C] text-white px-4 py-2 rounded-lg font-bold inline-flex items-center gap-1.5">
                <Printer className="w-3.5 h-3.5 text-[#00D8F6]" /> طباعة
              </button>
            </div>
          </div>
        </Modal>
      )}

      {showAnnouncementModal && (
        <Modal title="إرسال تنبيه جديد" onClose={() => setShowAnnouncementModal(false)}>
          <form onSubmit={handleAddAnnouncement} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">العنوان</label>
              <input required type="text" value={newAnnouncement.title} onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })} className="w-full bg-[#070F1B] border border-slate-700 rounded-xl p-2.5 text-slate-200" />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">النص</label>
              <textarea required rows={3} value={newAnnouncement.content} onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })} className="w-full bg-[#070F1B] border border-slate-700 rounded-xl p-2.5 text-slate-200" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <select value={newAnnouncement.priority} onChange={(e) => setNewAnnouncement({ ...newAnnouncement, priority: e.target.value })} className="bg-[#070F1B] border border-slate-700 rounded-xl p-2.5 text-slate-200">
                <option value="عادي">عادي</option>
                <option value="هام">هام</option>
              </select>
              <select value={newAnnouncement.target} onChange={(e) => setNewAnnouncement({ ...newAnnouncement, target: e.target.value })} className="bg-[#070F1B] border border-slate-700 rounded-xl p-2.5 text-slate-200">
                <option value="جميع المستأجرين">جميع المستأجرين</option>
                <option value="القطاع التجاري">القطاع التجاري</option>
                <option value="القطاع الإداري">القطاع الإداري</option>
              </select>
            </div>
            <div className="pt-2 flex justify-end gap-2">
              <button type="button" onClick={() => setShowAnnouncementModal(false)} className="px-4 py-2 rounded-xl text-slate-400 hover:bg-slate-800">إلغاء</button>
              <button type="submit" className="bg-[#00D8F6] text-slate-950 font-bold px-5 py-2 rounded-xl">إرسال</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

function NavItem({ icon, label, active, onClick, badge, badgeColor }) {
  return (
    <button type="button" onClick={onClick} className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${active ? "bg-gradient-to-r from-[#00D8F6] to-blue-600 text-slate-950 font-bold" : "text-slate-300 hover:bg-slate-800/60 hover:text-white"}`}>
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
    <div className="bg-[#0B192C] border border-slate-800 p-4 rounded-2xl space-y-3 shadow-lg">
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-400 font-medium">{title}</span>
        <div className="p-2 bg-[#070F1B] rounded-xl border border-slate-800">{icon}</div>
      </div>
      <div>
        <h3 className="text-2xl font-black text-white">{value}</h3>
        <p className="text-[11px] text-slate-400 mt-0.5">{subtext}</p>
      </div>
      <div className="pt-2 border-t border-slate-800/80">
        <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${badgeType === "success" ? "bg-emerald-500/10 text-emerald-400" : badgeType === "warning" ? "bg-amber-500/10 text-amber-400" : badgeType === "danger" ? "bg-rose-500/10 text-rose-400" : "bg-slate-800 text-slate-300"}`}>
          {badge}
        </span>
      </div>
    </div>
  );
}

function KanbanColumn({ title, count, color, children }) {
  return (
    <div className={`border rounded-2xl p-4 flex flex-col min-h-[320px] ${color}`}>
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
        <h3 className="font-bold text-slate-200 text-xs">{title}</h3>
        <span className="bg-slate-800 text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded-full">{count}</span>
      </div>
      <div className="space-y-3 flex-1">{children}</div>
    </div>
  );
}

function TicketCard({ ticket, canManageTickets, canDelete, onMove, onEvaluate, onApproveClient, onResolveAndInvoice, onDelete }) {
  const [evalBillingType, setEvalBillingType] = useState(ticket.billingType === "خارج العقد" ? "خارج العقد" : "داخل العقد");
  const [evalFee, setEvalFee] = useState(ticket.serviceFee ? String(ticket.serviceFee) : "");
  const [evalTechnician, setEvalTechnician] = useState(
    ticket.assignedTo && !ticket.assignedTo.includes("بانتظار") ? ticket.assignedTo : "فني الصيانة"
  );

  const isOutside = ticket.billingType === "خارج العقد";
  const isWaitingApproval = isOutside && ticket.approvalStatus !== "موافق عليه";
  const canIssueNow = ticket.status !== "resolved" && ticket.billingType !== "غير محدد" && (!isOutside || ticket.approvalStatus === "موافق عليه");

  return (
    <div className="bg-[#0B192C] border border-slate-800 p-3.5 rounded-xl space-y-2.5 text-xs">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-bold text-[#00D8F6]">{ticket.id} • {ticket.unitId}</span>
        <div className="flex items-center gap-1.5">
          <span className={`text-[9px] px-2 py-0.5 rounded font-bold ${ticket.priority === "عاجل" ? "bg-rose-500/20 text-rose-400" : "bg-slate-800 text-slate-300"}`}>
            {ticket.priority}
          </span>
          {canDelete && (
            <button type="button" onClick={onDelete} className="text-slate-400 hover:text-rose-400 p-0.5 rounded">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <p className="font-bold text-slate-100">{ticket.title}</p>
      <p className="text-[10px] text-slate-400">الفني: {ticket.assignedTo}</p>
      {ticket.billingType !== "غير محدد" && (
        <p className="text-[10px] text-slate-300">
          {ticket.billingType === "داخل العقد"
            ? `داخل العقد • تكلفة مصنعيات/قطع غيار: ${Number(ticket.serviceFee || 0).toLocaleString()} ج.م (تحصيل من جهة الوديعة)`
            : `خارج العقد • المبلغ على العميل: ${Number(ticket.serviceFee || 0).toLocaleString()} ج.م (${ticket.approvalStatus})`}
        </p>
      )}

      {canManageTickets && ticket.status !== "resolved" && (
        <div className="bg-[#070F1B] border border-slate-800 rounded-lg p-2.5 space-y-2 text-[10px]">
          <div className="grid grid-cols-2 gap-1.5">
            <select value={evalBillingType} onChange={(e) => setEvalBillingType(e.target.value)} className="bg-[#0B192C] border border-slate-700 rounded px-2 py-1 text-slate-200">
              <option value="داخل العقد">داخل العقد (جهة الوديعة)</option>
              <option value="خارج العقد">خارج العقد (على العميل)</option>
            </select>
            <input type="text" value={evalTechnician} onChange={(e) => setEvalTechnician(e.target.value)} placeholder="الفني" className="bg-[#0B192C] border border-slate-700 rounded px-2 py-1 text-slate-200" />
          </div>
          <input
            type="number"
            min="0"
            value={evalFee}
            onChange={(e) => setEvalFee(e.target.value)}
            placeholder={evalBillingType === "داخل العقد" ? "تكلفة المصنعيات/القطع (لتحصيلها من جهة الوديعة)" : "مبلغ الصيانة خارج العقد (ج.م)"}
            className={`w-full bg-[#0B192C] border rounded px-2 py-1 text-slate-200 ${evalBillingType === "خارج العقد" ? "border-amber-500/40" : "border-cyan-500/30"}`}
          />
          <div className="flex flex-wrap gap-1.5">
            <button type="button" onClick={() => onEvaluate({ billingType: evalBillingType, serviceFee: evalFee, assignedTo: evalTechnician })} className="bg-[#00D8F6]/20 text-[#00D8F6] border border-[#00D8F6]/40 px-2.5 py-1 rounded font-bold">
              حفظ التحديد
            </button>
            {isWaitingApproval && (
              <button type="button" onClick={onApproveClient} className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-1 rounded font-bold inline-flex items-center gap-1">
                <ThumbsUp className="w-3 h-3" /> موافقة العميل
              </button>
            )}
          </div>
        </div>
      )}

      {canManageTickets && ticket.status !== "resolved" && (
        <button
          type="button"
          disabled={!canIssueNow}
          onClick={onResolveAndInvoice}
          className={`w-full py-1.5 rounded-lg text-[10px] font-bold inline-flex items-center justify-center gap-1 ${
            canIssueNow ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" : "bg-slate-800/70 text-slate-500 border border-slate-700 cursor-not-allowed"
          }`}
        >
          <FileCheck2 className="w-3.5 h-3.5" />
          {isOutside ? "حل وإصدار مطالبة للعميل" : "حل وإصدار مطالبة لجهة الوديعة"}
        </button>
      )}

      {canManageTickets && (
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
          <span className="text-slate-400">{ticket.date}</span>
          <div className="flex items-center gap-1">
            {ticket.status !== "new" && <button type="button" onClick={() => onMove("new")} className="text-slate-400 hover:text-white px-1">جديد</button>}
            {ticket.status !== "in_progress" && <button type="button" onClick={() => onMove("in_progress")} className="text-amber-400 hover:underline px-1">تنفيذ</button>}
            {ticket.status !== "resolved" && (
              <button type="button" disabled={!canIssueNow} onClick={() => onMove("resolved")} className={`px-1 ${canIssueNow ? "text-emerald-400 hover:underline" : "text-slate-600 cursor-not-allowed"}`}>
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
