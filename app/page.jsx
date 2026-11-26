"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  Building2,
  LayoutDashboard,
  CreditCard,
  Wrench,
  BellRing,
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
} from "lucide-react";
import { supabase } from "../lib/supabaseClient";

const INITIAL_UNITS = [
  { id: "G-04", tenant: "مطعم كوك اند غروب", type: "تجاري", area: "120 م²", rent: 35000, status: "نشط", expireDate: "2026-12-15", floor: "الدور الأرضي", phone: "01012345678" },
  { id: "F-12", tenant: "مكتب الفرسان للهندسة", type: "إداري", area: "85 م²", rent: 18000, status: "تنبيه تجديد", expireDate: "2026-12-10", floor: "الدور الأول", phone: "01123456789" },
  { id: "F-08", tenant: "شركة Valict للحلول التقنية", type: "إداري", area: "150 م²", rent: 0, status: "نشط (المقر الرئيسي)", expireDate: "2030-01-01", floor: "الدور الأول", phone: "01099998877" },
  { id: "G-09", tenant: "سوبرماركت الراية", type: "تجاري", area: "300 م²", rent: 65000, status: "نشط", expireDate: "2027-05-20", floor: "الدور الأرضي", phone: "01234567890" },
  { id: "S-02", tenant: "صيدلية مصر", type: "تجاري", area: "90 م²", rent: 28000, status: "نشط", expireDate: "2027-01-15", floor: "الدور الأرضي", phone: "01055554433" },
  { id: "F-05", tenant: "عيادة د. أحمد زكي - أسنان", type: "عيادات", area: "65 م²", rent: 15000, status: "متأخر في السداد", expireDate: "2026-11-30", floor: "الدور الأول", phone: "01188887766" },
  { id: "S-14", tenant: "كافيه كوستا", type: "مطاعم وكافيهات", area: "110 م²", rent: 32000, status: "نشط", expireDate: "2026-12-28", floor: "الدور الأرضي", phone: "01044443322" },
];

const INITIAL_INVOICES = [
  { id: "INV-2026-001", unitId: "G-04", tenant: "مطعم كوك اند غروب", amount: 35000, type: "إيجار شهر نوفمبر", dueDate: "2026-11-05", status: "مدفوع", paymentDate: "2026-11-03" },
  { id: "INV-2026-002", unitId: "F-12", tenant: "مكتب الفرسان للهندسة", amount: 18000, type: "إيجار شهر نوفمبر", dueDate: "2026-11-05", status: "مدفوع", paymentDate: "2026-11-04" },
  { id: "INV-2026-003", unitId: "F-05", tenant: "عيادة د. أحمد زكي", amount: 15000, type: "إيجار + صيانة", dueDate: "2026-11-01", status: "متأخر", paymentDate: "-" },
  { id: "INV-2026-004", unitId: "G-09", tenant: "سوبرماركت الراية", amount: 65000, type: "إيجار شهر نوفمبر", dueDate: "2026-11-10", status: "مدفوع", paymentDate: "2026-11-08" },
  { id: "INV-2026-005", unitId: "S-14", tenant: "كافيه كوستا", amount: 32000, type: "صيانة ومرافق", dueDate: "2026-11-15", status: "قيد الانتظار", paymentDate: "-" },
];

const INITIAL_TICKETS = [
  { id: "TCK-101", unitId: "G-04", title: "عطل في التكييف المركزي بالفرع", priority: "عاجل", status: "new", category: "تكييف", date: "منذ ساعتين", assignedTo: "م. أحمد حسن" },
  { id: "TCK-102", unitId: "F-12", title: "تسريب مياه في الدورة الخاصة", priority: "متوسط", status: "in_progress", category: "سباكة", date: "منذ 5 ساعات", assignedTo: "فني السباكة (أيمن)" },
  { id: "TCK-103", unitId: "S-02", title: "إنارة المدخل الخارجي للصيدلية", priority: "منخفض", status: "in_progress", category: "كهرباء", date: "أمس", assignedTo: "فني الكهرباء (علي)" },
  { id: "TCK-104", unitId: "G-09", title: "فحص الحساسات الخاصة بالحريق", priority: "عاجل", status: "resolved", category: "سلامة", date: "منذ يومين", assignedTo: "فريق السلامة المهنية" },
];

const INITIAL_ANNOUNCEMENTS = [
  { id: 1, title: "صيانة دورية للمولدات الكهربائية الاحتياطية", content: "نحيطكم علماً بأنه سيتم إجراء صيانة دورية للمولدات يوم السبت القادم من الساعة 2:00 صباحاً وحتى 4:00 صباحاً.", date: "2026-11-24", priority: "هام", target: "جميع المستأجرين" },
  { id: 2, title: "مواعيد العمل الشتوية الخاصة بالمول", content: "تم تحديث مواعيد فتح وإغلاق أبواب المول الرئيسية لتكون من الساعة 9:00 صباحاً وحتى 11:00 مساءً.", date: "2026-11-20", priority: "عادي", target: "القطاع التجاري" },
];

const TOTAL_MALL_UNITS = 120;

const mapUnitToDb = (u) => ({
  id: u.id,
  tenant: u.tenant,
  type: u.type,
  area: u.area || "",
  rent: Number(u.rent) || 0,
  status: u.status || "نشط",
  expire_date: u.expireDate || "",
  floor: u.floor || "الدور الأرضي",
  phone: u.phone || "",
});

const mapUnitFromDb = (row) => ({
  id: row.id,
  tenant: row.tenant,
  type: row.type,
  area: row.area || "",
  rent: Number(row.rent) || 0,
  status: row.status || "نشط",
  expireDate: row.expire_date || "",
  floor: row.floor || "الدور الأرضي",
  phone: row.phone || "",
});

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
});

export default function App() {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [noticeMessage, setNoticeMessage] = useState("");
  const [dbConnected, setDbConnected] = useState(false);

  const [units, setUnits] = useState(INITIAL_UNITS);
  const [invoices, setInvoices] = useState(INITIAL_INVOICES);
  const [tickets, setTickets] = useState(INITIAL_TICKETS);
  const [announcements, setAnnouncements] = useState(INITIAL_ANNOUNCEMENTS);

  const [showAddUnitModal, setShowAddUnitModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);

  const [unitFilter, setUnitFilter] = useState("الكل");
  const [invoiceFilter, setInvoiceFilter] = useState("الكل");

  const [newUnit, setNewUnit] = useState({ id: "", tenant: "", type: "تجاري", area: "", rent: "", expireDate: "", floor: "الدور الأرضي", phone: "" });
  const [newAnnouncement, setNewAnnouncement] = useState({ title: "", content: "", priority: "عادي", target: "جميع المستأجرين" });

  const loadFromSupabase = useCallback(async () => {
    if (!supabase) return;

    const [unitsRes, invoicesRes, ticketsRes, announcementsRes] = await Promise.all([
      supabase.from("units").select("*"),
      supabase.from("invoices").select("*"),
      supabase.from("tickets").select("*"),
      supabase.from("announcements").select("*").order("id", { ascending: false }),
    ]);

    if (unitsRes.error || invoicesRes.error || ticketsRes.error || announcementsRes.error) {
      setNoticeMessage("تعذر قراءة بعض جداول Supabase؛ تأكد من تنفيذ كود إنشاء الجداول والصلاحيات.");
      return;
    }

    setDbConnected(true);

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

  const dynamicKpis = useMemo(() => {
    const occupiedCount = units.length;
    const occupancyRate = ((occupiedCount / TOTAL_MALL_UNITS) * 100).toFixed(1);

    const totalBilled = invoices.reduce((sum, inv) => sum + inv.amount, 0);
    const totalCollected = invoices.filter((i) => i.status === "مدفوع").reduce((sum, inv) => sum + inv.amount, 0);
    const totalPending = totalBilled - totalCollected;

    const openTicketsCount = tickets.filter((t) => t.status !== "resolved").length;
    const expiringLeasesCount = units.filter((u) => u.status.includes("تنبيه") || u.expireDate.startsWith("2026-12")).length;

    return { occupiedCount, occupancyRate, totalBilled, totalCollected, totalPending, openTicketsCount, expiringLeasesCount };
  }, [units, invoices, tickets]);

  const handleAddUnit = async (e) => {
    e.preventDefault();
    if (!newUnit.id.trim() || !newUnit.tenant.trim()) return;

    const unitRecord = {
      ...newUnit,
      id: newUnit.id.trim(),
      tenant: newUnit.tenant.trim(),
      rent: Number(newUnit.rent) || 0,
      status: "نشط",
    };

    setUnits((prev) => [...prev, unitRecord]);

    if (supabase) {
      const { error } = await supabase.from("units").upsert(mapUnitToDb(unitRecord));
      if (error) {
        setNoticeMessage(`تمت الإضافة محلياً لكن حدث خطأ في حفظ قاعدة البيانات: ${error.message}`);
      } else {
        setNoticeMessage(`تم حفظ الوحدة ${unitRecord.id} في قاعدة البيانات بنجاح.`);
      }
    } else {
      setNoticeMessage(`تمت إضافة الوحدة ${unitRecord.id} (وضع محلي مؤقت).`);
    }

    setNewUnit({ id: "", tenant: "", type: "تجاري", area: "", rent: "", expireDate: "", floor: "الدور الأرضي", phone: "" });
    setShowAddUnitModal(false);
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

  const moveTicket = async (ticketId, newStatus) => {
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
      const matchesSearch = !q || u.tenant.toLowerCase().includes(q) || u.id.toLowerCase().includes(q);
      if (unitFilter === "الكل") return matchesSearch;
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

  return (
    <div dir="rtl" className="min-h-screen bg-[#070F1B] text-slate-100 text-right flex flex-col md:flex-row selection:bg-[#00D8F6] selection:text-slate-950 font-sans">
      <aside className="w-full md:w-72 bg-[#0B192C] border-b md:border-b-0 md:border-l border-slate-800 flex flex-col justify-between shrink-0">
        <div>
          <div className="p-6 border-b border-slate-800/80 bg-gradient-to-r from-[#0B192C] to-[#1E3E62]/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00D8F6] to-blue-600 flex items-center justify-center shadow-lg shadow-[#00D8F6]/20 font-bold text-slate-950 text-xl border border-white/20">
                V
              </div>
              <div>
                <h1 className="text-xl font-black tracking-wider text-white flex items-center gap-1.5">
                  Valict
                  <span className="text-[10px] bg-[#00D8F6]/20 text-[#00D8F6] px-2 py-0.5 rounded-full border border-[#00D8F6]/30 font-medium">
                    Mall Vision
                  </span>
                </h1>
                <p className="text-[11px] text-slate-400 font-medium">Validate Your Vision</p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 text-slate-300 font-semibold">
                <Building2 className="w-3.5 h-3.5 text-[#00D8F6]" />
                مول الفيوم الجديدة
              </span>
              <span
                className={`w-2.5 h-2.5 rounded-full ${dbConnected ? "bg-emerald-400" : "bg-amber-400"}`}
                title={dbConnected ? "متصل بقاعدة بيانات Supabase" : "وضع محلي / بانتظار الربط"}
              ></span>
            </div>
          </div>

          <nav className="p-4 space-y-1.5">
            <NavItem icon={<LayoutDashboard className="w-5 h-5" />} label="لوحة التحكم الرئيسية" active={activeTab === "overview"} onClick={() => setActiveTab("overview")} />
            <NavItem icon={<Building2 className="w-5 h-5" />} label="العقود والوحدات" active={activeTab === "units"} onClick={() => setActiveTab("units")} badge={units.length} />
            <NavItem icon={<CreditCard className="w-5 h-5" />} label="التحصيل والفواتير" active={activeTab === "billing"} onClick={() => setActiveTab("billing")} badge={invoices.filter((i) => i.status === "متأخر").length} badgeColor="bg-rose-500/20 text-rose-400 border-rose-500/30" />
            <NavItem icon={<Wrench className="w-5 h-5" />} label="مركز الصيانة والخدمات" active={activeTab === "maintenance"} onClick={() => setActiveTab("maintenance")} badge={dynamicKpis.openTicketsCount} badgeColor="bg-amber-500/20 text-amber-400 border-amber-500/30" />
            <NavItem icon={<BellRing className="w-5 h-5" />} label="التنبيهات والإعلانات" active={activeTab === "announcements"} onClick={() => setActiveTab("announcements")} />
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800/80 bg-[#070F1B]/50">
          <div className="bg-[#1E3E62]/30 rounded-xl p-3 border border-slate-700/50 flex items-center gap-3">
            <ShieldCheck className="w-7 h-7 text-[#00D8F6] shrink-0" />
            <div className="text-xs">
              <p className="font-semibold text-slate-200">{dbConnected ? "متصل بقاعدة البيانات" : "بنية Valict السحابية"}</p>
              <p className="text-[10px] text-slate-400">{dbConnected ? "حفظ دائم عبر Supabase" : "حماية وتأمين البيانات 99.9%"}</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="min-h-16 bg-[#0B192C]/90 backdrop-blur border-b border-slate-800 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-10">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="ابحث عن وحدة، مستأجر، أو فاتورة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#070F1B] border border-slate-700/80 rounded-xl pr-10 pl-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-[#00D8F6]"
            />
          </div>

          <div className="flex items-center gap-2.5 mr-auto sm:mr-0">
            <button type="button" onClick={() => setShowAddUnitModal(true)} className="bg-gradient-to-r from-[#00D8F6] to-blue-600 text-slate-950 font-bold px-3.5 py-2 rounded-lg text-xs flex items-center gap-1.5 hover:brightness-110 transition">
              <Plus className="w-4 h-4" /> وحدة جديدة
            </button>

            <button type="button" onClick={() => setShowAnnouncementModal(true)} className="bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition">
              <Send className="w-3.5 h-3.5 text-[#00D8F6]" /> إرسال تنبيه
            </button>

            <div className="h-6 w-px bg-slate-800 mx-1 hidden sm:block"></div>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-xs text-white border border-white/10">إم</div>
              <div className="hidden lg:block text-xs">
                <p className="font-semibold text-slate-200">إدارة المول</p>
                <p className="text-[10px] text-[#00D8F6]">Valict Admin</p>
              </div>
            </div>
          </div>
        </header>

        {noticeMessage && (
          <div className="mx-4 sm:mx-6 lg:mx-8 mt-4 bg-[#0B192C] border border-[#00D8F6]/40 text-slate-200 px-4 py-2.5 rounded-xl text-xs flex items-center justify-between">
            <span>{noticeMessage}</span>
            <button type="button" onClick={() => setNoticeMessage("")} className="text-slate-400 hover:text-white text-xs">إغلاق</button>
          </div>
        )}

        <div className="p-4 sm:p-6 lg:p-8 flex-1 space-y-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="relative bg-gradient-to-r from-[#1E3E62] via-[#0B192C] to-[#070F1B] rounded-2xl p-6 border border-slate-700/60 overflow-hidden shadow-xl">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#00D8F6] bg-[#00D8F6]/10 px-2.5 py-0.5 rounded-full border border-[#00D8F6]/20 mb-2">
                      <Sparkles className="w-3 h-3" /> نظام الإدارة التشغيلي الموحد
                    </span>
                    <h2 className="text-2xl font-black text-white">لوحة تحكم مول الفيوم الجديدة</h2>
                    <p className="text-slate-300 text-xs mt-1 max-w-xl">
                      متابعة لحظية للأداء المالي، نسبة الإشغال، تذاكر الصيانة، وعقود المستأجرين عبر منصة Valict.
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
                  subtext={`${dynamicKpis.occupiedCount} مشغولة من أصل ${TOTAL_MALL_UNITS} (${TOTAL_MALL_UNITS - dynamicKpis.occupiedCount} شاغرة)`}
                  icon={<Building2 className="w-6 h-6 text-[#00D8F6]" />}
                  badge="تحديث لحظي"
                  badgeType="success"
                />
                <KpiCard
                  title="تحصيل الإيجارات (الشهر الحالي)"
                  value={`${dynamicKpis.totalCollected.toLocaleString()} ج.م`}
                  subtext={`من إجمالي ${dynamicKpis.totalBilled.toLocaleString()} ج.م (${Math.round((dynamicKpis.totalCollected / dynamicKpis.totalBilled) * 100 || 0)}%)`}
                  icon={<DollarSign className="w-6 h-6 text-emerald-400" />}
                  badge={`متبقي ${dynamicKpis.totalPending.toLocaleString()} ج.م`}
                  badgeType="warning"
                />
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
                      <button type="button" onClick={() => setActiveTab("maintenance")} className="text-[10px] text-[#00D8F6] hover:underline">عرض الكل</button>
                    </div>
                    <div className="space-y-2.5">
                      {tickets.slice(0, 3).map((ticket) => (
                        <div key={ticket.id} className="bg-[#070F1B] p-2.5 rounded-xl border border-slate-800/80 flex items-center justify-between gap-2">
                          <div>
                            <p className="text-xs font-semibold text-slate-200">{ticket.title}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">الوحدة: {ticket.unitId} • {ticket.date}</p>
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
                    <Building2 className="w-5 h-5 text-[#00D8F6]" /> دليل الوحدات والعقود
                  </h2>
                  <p className="text-xs text-slate-400">إدارة المستأجرين، عقود الإيجار، وتفاصيل المساحات</p>
                </div>
                <button type="button" onClick={() => setShowAddUnitModal(true)} className="bg-gradient-to-r from-[#00D8F6] to-blue-600 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 hover:brightness-110 transition">
                  <Plus className="w-4 h-4" /> إضافة وحدة جديدة
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {["الكل", "الدور الأرضي", "الدور الأول", "تنبيهات"].map((filter) => (
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
                        <th className="p-4">اسم المستأجر / النشاط</th>
                        <th className="p-4">القطاع</th>
                        <th className="p-4">المساحة</th>
                        <th className="p-4">القيمة الشهرية</th>
                        <th className="p-4">تاريخ نهاية العقد</th>
                        <th className="p-4">حالة العقد</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-200">
                      {filteredUnits.map((unit) => (
                        <tr key={unit.id} className="hover:bg-slate-800/40 transition">
                          <td className="p-4 font-bold text-[#00D8F6]">{unit.id}</td>
                          <td className="p-4">
                            <p className="font-bold text-slate-100">{unit.tenant}</p>
                            <p className="text-[10px] text-slate-400">{unit.phone}</p>
                          </td>
                          <td className="p-4"><span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px] border border-slate-700">{unit.type}</span></td>
                          <td className="p-4 text-slate-300">{unit.area}</td>
                          <td className="p-4 font-bold text-emerald-400">{unit.rent > 0 ? `${unit.rent.toLocaleString()} ج.م` : "المقر الرئيسي"}</td>
                          <td className="p-4 text-slate-300">{unit.expireDate}</td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${unit.status.includes("نشط") ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : unit.status.includes("تنبيه") ? "bg-amber-500/10 text-amber-400 border-amber-500/30" : "bg-rose-500/10 text-rose-400 border-rose-500/30"}`}>
                              {unit.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "billing" && (
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
                  <div className="flex items-center gap-2">
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
                        <th className="p-3">الوحدة والمستأجر</th>
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
                            {inv.status !== "مدفوع" && (
                              <button type="button" onClick={() => handlePayInvoice(inv.id)} className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 px-2 py-1 rounded text-[10px] font-bold transition">
                                تحصيل الآن
                              </button>
                            )}
                            <button type="button" onClick={() => { setSelectedInvoice(inv); setShowInvoiceModal(true); }} className="bg-slate-800 hover:bg-[#00D8F6] hover:text-slate-950 text-slate-200 border border-slate-700 px-2.5 py-1 rounded text-[10px] font-semibold flex items-center gap-1 transition">
                              <Printer className="w-3 h-3" /> الإيصال
                            </button>
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
              <div className="flex items-center justify-between bg-[#0B192C] p-4 rounded-2xl border border-slate-800">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Wrench className="w-5 h-5 text-amber-400" /> مركز الصيانة والخدمات الفنية
                  </h2>
                  <p className="text-xs text-slate-400">تتبع البلاغات والأعطال ومتابعة الفنيين</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <KanbanColumn title="بلاغات جديدة" count={tickets.filter((t) => t.status === "new").length} color="border-rose-500/50 bg-rose-500/5">
                  {tickets.filter((t) => t.status === "new").map((ticket) => (
                    <TicketCard key={ticket.id} ticket={ticket} onMove={(status) => moveTicket(ticket.id, status)} />
                  ))}
                </KanbanColumn>

                <KanbanColumn title="قيد التنفيذ" count={tickets.filter((t) => t.status === "in_progress").length} color="border-amber-500/50 bg-amber-500/5">
                  {tickets.filter((t) => t.status === "in_progress").map((ticket) => (
                    <TicketCard key={ticket.id} ticket={ticket} onMove={(status) => moveTicket(ticket.id, status)} />
                  ))}
                </KanbanColumn>

                <KanbanColumn title="تم الحل والإغلاق" count={tickets.filter((t) => t.status === "resolved").length} color="border-emerald-500/50 bg-emerald-500/5">
                  {tickets.filter((t) => t.status === "resolved").map((ticket) => (
                    <TicketCard key={ticket.id} ticket={ticket} onMove={(status) => moveTicket(ticket.id, status)} />
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
                  <p className="text-xs text-slate-400">بث الإشعارات والتعليمات لكافة المستأجرين في المول</p>
                </div>
                <button type="button" onClick={() => setShowAnnouncementModal(true)} className="bg-[#00D8F6] text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5">
                  <Plus className="w-4 h-4" /> إعلان جديد
                </button>
              </div>

              <div className="space-y-4">
                {announcements.map((item) => (
                  <div key={item.id} className="bg-[#0B192C] p-5 rounded-2xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${item.priority === "هام" ? "bg-rose-500/20 text-rose-400 border-rose-500/30" : "bg-[#00D8F6]/20 text-[#00D8F6] border-[#00D8F6]/30"}`}>{item.priority}</span>
                        <h3 className="font-bold text-slate-100 text-sm">{item.title}</h3>
                      </div>
                      <span className="text-[11px] text-slate-400">{item.date}</span>
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
        </div>
      </main>

      {showAddUnitModal && (
        <Modal title="إضافة وحدة ومستأجر جديد" onClose={() => setShowAddUnitModal(false)}>
          <form onSubmit={handleAddUnit} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">رقم الوحدة</label>
                <input required type="text" value={newUnit.id} onChange={(e) => setNewUnit({ ...newUnit, id: e.target.value })} placeholder="G-15" className="w-full bg-[#070F1B] border border-slate-700 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-[#00D8F6]" />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">اسم الشركة / المستأجر</label>
                <input required type="text" value={newUnit.tenant} onChange={(e) => setNewUnit({ ...newUnit, tenant: e.target.value })} placeholder="متجر الأناقة" className="w-full bg-[#070F1B] border border-slate-700 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-[#00D8F6]" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">نوع النشاط</label>
                <select value={newUnit.type} onChange={(e) => setNewUnit({ ...newUnit, type: e.target.value })} className="w-full bg-[#070F1B] border border-slate-700 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-[#00D8F6]">
                  <option value="تجاري">تجاري</option>
                  <option value="إداري">إداري</option>
                  <option value="مطاعم وكافيهات">مطاعم وكافيهات</option>
                  <option value="عيادات">عيادات</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">الدور</label>
                <select value={newUnit.floor} onChange={(e) => setNewUnit({ ...newUnit, floor: e.target.value })} className="w-full bg-[#070F1B] border border-slate-700 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-[#00D8F6]">
                  <option value="الدور الأرضي">الدور الأرضي</option>
                  <option value="الدور الأول">الدور الأول</option>
                </select>
              </div>
            </div>

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

            <div className="pt-2 flex items-center justify-end gap-2">
              <button type="button" onClick={() => setShowAddUnitModal(false)} className="px-4 py-2 rounded-xl text-slate-400 hover:bg-slate-800">إلغاء</button>
              <button type="submit" className="bg-[#00D8F6] text-slate-950 font-bold px-5 py-2 rounded-xl hover:brightness-110">حفظ الوحدة</button>
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
                <p className="text-xs text-slate-500">مول الفيوم الجديدة - الإدارة التشغيلية</p>
              </div>
              <div className="text-left font-mono">
                <span className="text-xs text-cyan-700 font-bold block">Valict Cloud Secured</span>
                <span className="text-sm font-bold text-slate-700">{selectedInvoice.id}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-lg border border-slate-100">
              <div>
                <p className="text-slate-400">استلمنا من السيد / الشركة:</p>
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
                <CheckCircle2 className="w-4 h-4" /> معتمد ومسدد رقمياً عبر نظام Valict
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
        <Modal title="إرسال تنبيه جديد للمستأجرين" onClose={() => setShowAnnouncementModal(false)}>
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

function TicketCard({ ticket, onMove }) {
  return (
    <div className="bg-[#0B192C] border border-slate-800 p-3.5 rounded-xl space-y-2 hover:border-[#00D8F6]/50 transition shadow-md">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-[#00D8F6]">{ticket.id} • {ticket.unitId}</span>
        <span className={`text-[9px] px-2 py-0.5 rounded font-bold ${ticket.priority === "عاجل" ? "bg-rose-500/20 text-rose-400" : "bg-slate-800 text-slate-300"}`}>
          {ticket.priority}
        </span>
      </div>
      <p className="text-xs font-bold text-slate-100">{ticket.title}</p>
      <p className="text-[10px] text-slate-400">الفني المسؤول: {ticket.assignedTo}</p>

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
            <button type="button" onClick={() => onMove("resolved")} className="text-emerald-400 hover:underline px-1">تم الحل</button>
          )}
        </div>
      </div>
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
