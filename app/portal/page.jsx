"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Building2,
  CreditCard,
  Wrench,
  BellRing,
  Plus,
  Printer,
  X,
  Lock,
  LogOut,
  ArrowRight,
  ThumbsUp,
  History,
  ShieldCheck,
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

const DEFAULT_MALL_CONFIG = {
  mallName: "مول الماسة 1",
};

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
  assigned_to: t.assignedTo || "بانتظار توجيه مسؤول الصيانة",
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
  assignedTo: row.assigned_to || "بانتظار توجيه مسؤول الصيانة",
  billingType: row.billing_type || "غير محدد",
  serviceFee: Number(row.service_fee) || 0,
  paymentStatus: row.payment_status || "غير محدد",
  approvalStatus: row.approval_status || "غير مطلوب",
  depositCovered: Boolean(row.deposit_covered),
  invoiceIssued: Boolean(row.invoice_issued),
  invoiceId: row.invoice_id || null,
});

export default function PortalPage() {
  const [mallName, setMallName] = useState(DEFAULT_MALL_CONFIG.mallName);
  const [units, setUnits] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  const [selectedUnitId, setSelectedUnitId] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState("");
  const [authenticatedUnitId, setAuthenticatedUnitId] = useState("");
  const [authReady, setAuthReady] = useState(false);

  const [activeTab, setActiveTab] = useState("summary");
  const [notice, setNotice] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const [ticketForm, setTicketForm] = useState({
    title: "",
    category: "تكييف",
    priority: "متوسط",
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedUnit = localStorage.getItem("mms_portal_unit") || "";
      const savedTab = localStorage.getItem("mms_portal_tab") || "summary";
      setAuthenticatedUnitId(savedUnit);
      setActiveTab(savedTab);
    }
    setAuthReady(true);
  }, []);

  const handleSelectPortalTab = useCallback((tabName) => {
    setActiveTab(tabName);
    if (typeof window !== "undefined") {
      localStorage.setItem("mms_portal_tab", tabName);
    }
  }, []);

  const loadPortalData = useCallback(async () => {
    if (!supabase) return;

    const [settingsRes, unitsRes, invoicesRes, ticketsRes, announcementsRes] = await Promise.all([
      supabase.from("mall_settings").select("*").eq("id", 1).maybeSingle(),
      supabase.from("units").select("*"),
      supabase.from("invoices").select("*"),
      supabase.from("tickets").select("*"),
      supabase.from("announcements").select("*").order("id", { ascending: false }),
    ]);

    if (!settingsRes.error && settingsRes.data?.mall_name) {
      setMallName(settingsRes.data.mall_name);
    }
    if (!unitsRes.error) {
      const mappedUnits = (unitsRes.data || []).map(mapUnitFromDb);
      setUnits(mappedUnits);
      if (mappedUnits.length > 0) {
        setSelectedUnitId((prev) => (mappedUnits.some((u) => u.id === prev) ? prev : mappedUnits[0].id));
      }
    }
    if (!invoicesRes.error) {
      setInvoices((invoicesRes.data || []).map(mapInvoiceFromDb));
    }
    if (!ticketsRes.error) {
      setTickets((ticketsRes.data || []).map(mapTicketFromDb));
    }
    if (!announcementsRes.error) {
      setAnnouncements(announcementsRes.data || []);
    }
  }, []);

  useEffect(() => {
    loadPortalData();
  }, [loadPortalData]);

  const activeUnit = useMemo(
    () => units.find((u) => u.id === authenticatedUnitId) || null,
    [units, authenticatedUnitId]
  );

  const unitInvoices = useMemo(
    () => (activeUnit ? invoices.filter((inv) => inv.unitId === activeUnit.id) : []),
    [invoices, activeUnit]
  );

  const unitTickets = useMemo(
    () => (activeUnit ? tickets.filter((t) => t.unitId === activeUnit.id) : []),
    [tickets, activeUnit]
  );

  const unpaidAmount = useMemo(
    () => unitInvoices.filter((inv) => inv.status !== "مدفوع").reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0),
    [unitInvoices]
  );

  const handleLogin = (e) => {
    e.preventDefault();
    const target = units.find((u) => u.id === selectedUnitId);
    if (!target) {
      setLoginError("اختر وحدة صحيحة.");
      return;
    }
    if (String(target.portalPassword || "1234") !== passwordInput) {
      setLoginError("كلمة مرور البوابة غير صحيحة لهذه الوحدة.");
      return;
    }
    setLoginError("");
    setPasswordInput("");
    setActiveTab("summary");
    setAuthenticatedUnitId(target.id);
    if (typeof window !== "undefined") {
      localStorage.setItem("mms_portal_unit", target.id);
      localStorage.setItem("mms_portal_tab", "summary");
    }
  };

  const handleLogout = () => {
    setAuthenticatedUnitId("");
    setPasswordInput("");
    setLoginError("");
    setNotice("");
    setActiveTab("summary");
    if (typeof window !== "undefined") {
      localStorage.removeItem("mms_portal_unit");
      localStorage.removeItem("mms_portal_tab");
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!activeUnit || !ticketForm.title.trim()) return;

    const ticketRecord = {
      id: `TCK-${Math.floor(200 + Math.random() * 799)}`,
      unitId: activeUnit.id,
      title: ticketForm.title.trim(),
      category: ticketForm.category,
      priority: ticketForm.priority,
      status: "new",
      date: "الآن",
      assignedTo: "بانتظار مراجعة مسؤول الصيانة",
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

    setTicketForm({ title: "", category: "تكييف", priority: "متوسط" });
    setNotice(`تم إرسال بلاغ الصيانة ${ticketRecord.id} إلى مسؤول الصيانة لتحديد التبعية التعاقدية والمبلغ.`);
  };

  const handleApproveQuote = async (ticketId) => {
    const target = tickets.find((t) => t.id === ticketId);
    if (!target) return;

    const updated = {
      ...target,
      approvalStatus: "موافق عليه",
      paymentStatus: "بانتظار إتمام الإصلاح وإصدار الفاتورة",
      status: "in_progress",
      assignedTo:
        target.assignedTo && !target.assignedTo.includes("بانتظار")
          ? target.assignedTo
          : "فني الصيانة (تمت الموافقة وجارٍ التنفيذ)",
    };

    setTickets((prev) => prev.map((t) => (t.id === ticketId ? updated : t)));

    if (supabase) {
      await supabase
        .from("tickets")
        .update({
          approval_status: updated.approvalStatus,
          payment_status: updated.paymentStatus,
          status: updated.status,
          assigned_to: updated.assignedTo,
        })
        .eq("id", ticketId);
    }

    setNotice(`تمت موافقتك على مبلغ الصيانة (${Number(target.serviceFee || 0).toLocaleString()} ج.م) للبلاغ ${ticketId}؛ سيتم توجيه الفني للتنفيذ.`);
  };

  if (!authReady) {
    return (
      <div dir="rtl" className="min-h-screen bg-[#070F1B] text-slate-400 flex items-center justify-center p-4 text-xs font-sans">
        جاري تحميل الجلسة...
      </div>
    );
  }

  if (!activeUnit) {
    return (
      <div dir="rtl" className="min-h-screen bg-[#070F1B] text-slate-100 flex items-center justify-center p-4 font-sans">
        <div className="bg-[#0B192C] border border-slate-800 rounded-2xl p-6 w-full max-w-md space-y-5 shadow-2xl">
          <div className="flex flex-col items-center text-center border-b border-slate-800 pb-4 gap-2">
            <img src="/valict-logo.png" alt="MMS Logo" className="h-12 w-auto object-contain" />
            <h1 className="text-lg font-black text-white">بوابة المالك والمستأجر — {mallName}</h1>
            <p className="text-xs text-slate-400">متابعة المطالبات والفواتير، الموافقة على صيانة خارج العقد، وتقديم بلاغات الصيانة</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 mb-1.5 font-semibold">اختر الوحدة</label>
              <select
                value={selectedUnitId}
                onChange={(e) => {
                  setSelectedUnitId(e.target.value);
                  setLoginError("");
                }}
                className="w-full bg-[#070F1B] border border-slate-700 rounded-xl p-3 text-slate-100 focus:outline-none focus:border-[#00D8F6]"
              >
                {units.length === 0 ? (
                  <option value="">لا توجد وحدات مسجلة حالياً</option>
                ) : (
                  units.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.id} — {u.tenant} ({u.ownershipType})
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 mb-1.5 font-semibold">كلمة مرور الوحدة</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  required
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="أدخل كلمة مرور الوحدة"
                  className="w-full bg-[#070F1B] border border-slate-700 rounded-xl pr-10 pl-3 py-3 text-slate-100 focus:outline-none focus:border-[#00D8F6]"
                />
              </div>
            </div>

            {loginError && <p className="text-rose-400 text-[11px] font-semibold">{loginError}</p>}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#00D8F6] to-blue-600 text-slate-950 font-bold py-2.5 rounded-xl hover:brightness-110 transition"
            >
              دخول إلى بوابة الوحدة
            </button>
          </form>

          <div className="pt-2 border-t border-slate-800 flex justify-center">
            <Link href="/" className="text-xs text-[#00D8F6] hover:underline inline-flex items-center gap-1">
              <ArrowRight className="w-3.5 h-3.5" /> العودة إلى لوحة الإدارة
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isSelectedPaid = selectedInvoice?.status === "مدفوع";

  return (
    <div dir="rtl" className="min-h-screen bg-[#070F1B] text-slate-100 text-right font-sans">
      <header className="bg-[#0B192C] border-b border-slate-800 px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <img src="/valict-logo.png" alt="MMS Logo" className="h-10 w-auto object-contain" />
          <div>
            <h1 className="text-sm sm:text-base font-black text-white">
              الوحدة {activeUnit.id} • {activeUnit.tenant}
            </h1>
            <p className="text-[11px] text-slate-400">
              {mallName} — {activeUnit.floor} ({activeUnit.ownershipType})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <Link href="/" className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700">
            لوحة الإدارة
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 px-3 py-1.5 rounded-lg border border-rose-500/30 inline-flex items-center gap-1 font-bold"
          >
            <LogOut className="w-3.5 h-3.5" /> خروج
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
        {notice && (
          <div className="bg-[#0B192C] border border-[#00D8F6]/40 text-slate-200 px-4 py-3 rounded-xl text-xs flex items-center justify-between gap-3">
            <span>{notice}</span>
            <button type="button" onClick={() => setNotice("")} className="text-slate-400 hover:text-white">
              إغلاق
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="bg-[#0B192C] border border-slate-800 rounded-2xl p-4">
            <p className="text-slate-400">وديعة الصيانة للوحدة</p>
            <p className="text-xl font-black text-[#00D8F6] mt-1">
              {Number(activeUnit.maintenanceDeposit || 0).toLocaleString()} ج.م
            </p>
          </div>
          <div className="bg-[#0B192C] border border-slate-800 rounded-2xl p-4">
            <p className="text-slate-400">المطالبات غير المسددة</p>
            <p className={`text-xl font-black mt-1 ${unpaidAmount > 0 ? "text-rose-400" : "text-emerald-400"}`}>
              {unpaidAmount.toLocaleString()} ج.م
            </p>
          </div>
          <div className="bg-[#0B192C] border border-slate-800 rounded-2xl p-4">
            <p className="text-slate-400">بلاغات الصيانة</p>
            <p className="text-xl font-black text-amber-400 mt-1">{unitTickets.length} بلاغ</p>
          </div>
          <div className="bg-[#0B192C] border border-slate-800 rounded-2xl p-4">
            <p className="text-slate-400">حالة الوحدة</p>
            <p className="text-base font-black text-emerald-400 mt-1">{activeUnit.status}</p>
            {activeUnit.ownershipType === "مالك" && activeUnit.isSubleased && (
              <p className="text-[10px] text-slate-400 mt-0.5">مؤجرة لـ: {activeUnit.subtenantName}</p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          {[
            { id: "summary", label: "ملخص الوحدة والسجل التاريخي", icon: <ShieldCheck className="w-4 h-4" /> },
            { id: "maintenance", label: "طلبات الصيانة والموافقات", icon: <Wrench className="w-4 h-4" /> },
            { id: "billing", label: "الفواتير والإيصالات", icon: <CreditCard className="w-4 h-4" /> },
            { id: "announcements", label: "التنبيهات", icon: <BellRing className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleSelectPortalTab(tab.id)}
              className={`px-4 py-2 rounded-xl font-bold inline-flex items-center gap-2 border transition ${
                activeTab === tab.id
                  ? "bg-[#00D8F6] text-slate-950 border-[#00D8F6]"
                  : "bg-[#0B192C] text-slate-300 border-slate-800 hover:border-slate-700"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {activeTab === "summary" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
            <div className="bg-[#0B192C] border border-slate-800 rounded-2xl p-5 space-y-3">
              <h2 className="text-sm font-bold text-white border-b border-slate-800 pb-2.5 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#00D8F6]" /> بيانات العقد والتشغيل الحالية
              </h2>
              <div className="space-y-2 text-slate-300">
                <p>الطرف الرئيسي: <strong className="text-white">{activeUnit.tenant}</strong> ({activeUnit.ownershipType})</p>
                <p>المساحة والدور: <strong className="text-white">{activeUnit.area || "-"} — {activeUnit.floor}</strong></p>
                {activeUnit.ownershipType === "مستأجر" ? (
                  <>
                    <p>الإيجار الشهري: <strong className="text-emerald-400">{Number(activeUnit.rent || 0).toLocaleString()} ج.م</strong></p>
                    <p>تاريخ نهاية العقد: <strong className="text-white">{activeUnit.expireDate || "-"}</strong></p>
                  </>
                ) : activeUnit.isSubleased ? (
                  <>
                    <p>المستأجر الحالي للوحدة: <strong className="text-emerald-400">{activeUnit.subtenantName || "-"}</strong></p>
                    <p>قيمة الإيجار / التأجير: <strong className="text-emerald-400">{Number(activeUnit.subleaseRent || 0).toLocaleString()} ج.م</strong></p>
                    <p>نهاية التأجير: <strong className="text-white">{activeUnit.subleaseExpireDate || "-"}</strong></p>
                  </>
                ) : (
                  <p className="text-slate-400">الوحدة مدارَة مباشرة بواسطة المالك بدون عقد إيجار حالي.</p>
                )}
              </div>
            </div>

            <div className="bg-[#0B192C] border border-slate-800 rounded-2xl p-5 space-y-3">
              <h2 className="text-sm font-bold text-white border-b border-slate-800 pb-2.5 flex items-center gap-2">
                <History className="w-4 h-4 text-[#00D8F6]" /> السجل التاريخي للعقود والمشغلين السابقين
              </h2>
              {Array.isArray(activeUnit.contractHistory) && activeUnit.contractHistory.length > 0 ? (
                <div className="space-y-2.5">
                  {activeUnit.contractHistory.map((h) => (
                    <div key={h.id} className="bg-[#070F1B] border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-2">
                      <div>
                        <p className="font-bold text-slate-100">{h.partyName} ({h.ownershipType})</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{h.reason} • أُرشف في: {h.archivedAt}</p>
                      </div>
                      <span className="text-emerald-400 font-bold shrink-0">{Number(h.amount || 0).toLocaleString()} ج.م</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-xs">لا توجد عقود أو مشغلون سابقون مؤرشفون على هذه الوحدة حتى الآن.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === "maintenance" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
            <form onSubmit={handleCreateTicket} className="bg-[#0B192C] border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="border-b border-slate-800 pb-2.5">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Plus className="w-4 h-4 text-[#00D8F6]" /> تقديم طلب صيانة جديد
                </h2>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  يحدد مسؤول الصيانة التبعية التعاقدية والمبلغ بعد مراجعة العقد
                </p>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">وصف العطل</label>
                <input
                  required
                  type="text"
                  value={ticketForm.title}
                  onChange={(e) => setTicketForm({ ...ticketForm, title: e.target.value })}
                  placeholder="مثال: عطل في التكييف أو تسريب مياه"
                  className="w-full bg-[#070F1B] border border-slate-700 rounded-xl p-2.5 text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">التصنيف</label>
                  <select
                    value={ticketForm.category}
                    onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
                    className="w-full bg-[#070F1B] border border-slate-700 rounded-xl p-2.5 text-slate-200"
                  >
                    <option value="تكييف">تكييف</option>
                    <option value="كهرباء">كهرباء</option>
                    <option value="سباكة">سباكة</option>
                    <option value="سلامة">سلامة</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">الأولوية</label>
                  <select
                    value={ticketForm.priority}
                    onChange={(e) => setTicketForm({ ...ticketForm, priority: e.target.value })}
                    className="w-full bg-[#070F1B] border border-slate-700 rounded-xl p-2.5 text-slate-200"
                  >
                    <option value="منخفض">منخفض</option>
                    <option value="متوسط">متوسط</option>
                    <option value="عاجل">عاجل</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-[#00D8F6] to-blue-600 text-slate-950 font-bold py-2.5 rounded-xl hover:brightness-110 transition"
              >
                إرسال بلاغ الصيانة
              </button>
            </form>

            <div className="lg:col-span-2 bg-[#0B192C] border border-slate-800 rounded-2xl p-5 space-y-3">
              <h2 className="text-sm font-bold text-white border-b border-slate-800 pb-2.5">بلاغات الصيانة الخاصة بالوحدة</h2>
              {unitTickets.length === 0 ? (
                <p className="text-slate-400">لا توجد بلاغات صيانة مسجلة لهذه الوحدة.</p>
              ) : (
                <div className="space-y-3">
                  {unitTickets.map((t) => {
                    const needsApproval = t.billingType === "خارج العقد" && t.approvalStatus !== "موافق عليه";
                    return (
                      <div key={t.id} className="bg-[#070F1B] border border-slate-800 rounded-xl p-3.5 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-[#00D8F6]">{t.id} • {t.title}</span>
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 text-[10px] font-bold">
                            {t.status === "resolved" ? "تم الحل" : t.status === "in_progress" ? "قيد التنفيذ" : "جديد"}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          التصنيف: {t.category} • التبعية: <strong className="text-slate-200">{t.billingType}</strong>
                          {t.billingType === "داخل العقد" && " (مغطى من وديعة الصيانة)"}
                        </p>
                        {t.billingType === "خارج العقد" && (
                          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/80">
                            <span className="text-amber-300 font-bold">
                              المبلغ المحدد خارج العقد: {Number(t.serviceFee || 0).toLocaleString()} ج.م ({t.approvalStatus})
                            </span>
                            {needsApproval && (
                              <button
                                type="button"
                                onClick={() => handleApproveQuote(t.id)}
                                className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 px-3 py-1 rounded-lg font-bold inline-flex items-center gap-1"
                              >
                                <ThumbsUp className="w-3.5 h-3.5" /> موافقة على المبلغ وإرسال الفني
                              </button>
                            )}
                          </div>
                        )}
                        {t.invoiceId && (
                          <p className="text-[10px] text-cyan-300 font-mono">تم إصدار المطالبة بعد الحل: {t.invoiceId}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "billing" && (
          <div className="bg-[#0B192C] border border-slate-800 rounded-2xl p-5 space-y-4 text-xs">
            <h2 className="text-sm font-bold text-white border-b border-slate-800 pb-2.5">مطالبات وفواتير الوحدة</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead className="bg-[#070F1B] text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-3">رقم المرجع</th>
                    <th className="p-3">النوع</th>
                    <th className="p-3">البيان</th>
                    <th className="p-3">المبلغ</th>
                    <th className="p-3">تاريخ الاستحقاق</th>
                    <th className="p-3">الحالة</th>
                    <th className="p-3 text-center">المستند</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {unitInvoices.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="p-6 text-center text-slate-500">لا توجد مطالبات أو فواتير مسجلة لهذه الوحدة حالياً.</td>
                    </tr>
                  ) : (
                    unitInvoices.map((inv) => {
                      const isPaid = inv.status === "مدفوع";
                      return (
                        <tr key={inv.id}>
                          <td className="p-3 font-mono text-slate-300">{inv.id}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${isPaid ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30" : "bg-amber-500/10 text-amber-300 border-amber-500/30"}`}>
                              {isPaid ? "فاتورة / إيصال" : "مطالبة"}
                            </span>
                          </td>
                          <td className="p-3 text-slate-100">{inv.type}</td>
                          <td className="p-3 font-bold text-white">{Number(inv.amount || 0).toLocaleString()} ج.م</td>
                          <td className="p-3 text-slate-400">{inv.dueDate}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${isPaid ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : "bg-amber-500/10 text-amber-400 border-amber-500/30"}`}>
                              {isPaid ? "مدفوع" : inv.status}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <button
                              type="button"
                              onClick={() => setSelectedInvoice(inv)}
                              className="bg-slate-800 hover:bg-[#00D8F6] hover:text-slate-950 text-slate-200 px-2.5 py-1 rounded text-[10px] font-semibold inline-flex items-center gap-1"
                            >
                              <Printer className="w-3 h-3" /> {isPaid ? "عرض الفاتورة" : "عرض المطالبة"}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "announcements" && (
          <div className="space-y-3 text-xs">
            {announcements.length === 0 ? (
              <div className="bg-[#0B192C] border border-slate-800 rounded-2xl p-6 text-center text-slate-500">لا توجد تنبيهات حالياً.</div>
            ) : (
              announcements.map((a) => (
                <div key={a.id} className="bg-[#0B192C] border border-slate-800 rounded-2xl p-4 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-white text-sm">{a.title}</h3>
                    <span className="text-[11px] text-slate-400">{a.date}</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">{a.content}</p>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 w-full max-w-md rounded-2xl p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-black text-[#0B192C]">
                  {isSelectedPaid ? "إيصال فاتورة مسددة" : "بيان مطالبة مالية"}
                </h3>
                <p className="text-slate-500">{mallName}</p>
              </div>
              <button type="button" onClick={() => setSelectedInvoice(null)} className="text-slate-500 hover:text-slate-900">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-1.5">
              <p>رقم المرجع: <strong>{selectedInvoice.id}</strong></p>
              <p>الوحدة: <strong>{selectedInvoice.unitId} — {selectedInvoice.tenant}</strong></p>
              <p>البيان: <strong>{selectedInvoice.type}</strong></p>
              <p>المبلغ: <strong className={isSelectedPaid ? "text-emerald-700" : "text-amber-700"}>{Number(selectedInvoice.amount || 0).toLocaleString()} ج.م</strong></p>
              <p>تاريخ الاستحقاق: <strong>{selectedInvoice.dueDate}</strong></p>
              <p>الحالة: <strong>{isSelectedPaid ? "مدفوع" : selectedInvoice.status}</strong></p>
              {!isSelectedPaid && (
                <p className="text-[11px] text-slate-600 pt-1">
                  ملاحظة: هذه مطالبة قائمة؛ تصبح فاتورة وإيصالاً بعد سدادها وتحصيلها من الإدارة.
                </p>
              )}
            </div>
            <div className="pt-2 flex justify-end">
              <button type="button" onClick={() => window.print()} className="bg-[#0B192C] text-white px-4 py-2 rounded-lg font-bold inline-flex items-center gap-1.5">
                <Printer className="w-3.5 h-3.5 text-[#00D8F6]" /> طباعة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
