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
  const [showAddInvoiceModal, setShowAddInvoiceModal] = useState(false);
  const [showAddTicketModal, setShowAddTicketModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);

  const [unitFilter, setUnitFilter] = useState("الكل");
  const [invoiceFilter, setInvoiceFilter] = useState("الكل");

  const [newUnit, setNewUnit] = useState({ id: "", tenant: "", type: "تجاري", area: "", rent: "", expireDate: "", floor: "الدور الأرضي", phone: "" });
  const [newInvoice, setNewInvoice] = useState({ unitId: "G-04", amount: "", type: "إيجار شهري", dueDate: "2026-12-05", status: "قيد الانتظار" });
  const [newTicket, setNewTicket] = useState({ unitId: "G-04", title: "", priority: "متوسط", category: "تكييف", assignedTo: "فريق الصيانة" });
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
      setNoticeMessage(
        error
          ? `تمت الإضافة محلياً لكن حدث خطأ في حفظ قاعدة البيانات: ${error.message}`
          : `تم حفظ الوحدة ${unitRecord.id} في قاعدة البيانات بنجاح.`
      );
    } else {
      setNoticeMessage(`تمت إضافة الوحدة ${unitRecord.id} (وضع محلي مؤقت).`);
    }

    setNewUnit({ id: "", tenant: "", type: "تجاري", area: "", rent: "", expireDate: "", floor: "الدور الأرضي", phone: "" });
    setShowAddUnitModal(false);
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
    } else {
      setNoticeMessage(`تم إنشاء الفاتورة ${invoiceRecord.id} (وضع محلي مؤقت).`);
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
    };

    setTickets((prev) => [ticketRecord, ...prev]);

    if (supabase) {
      const { error } = await supabase.from("tickets").upsert(mapTicketToDb(ticketRecord));
      setNoticeMessage(
        error
          ? `تم تسجيل البلاغ محلياً لكن فشل الحفظ في قاعدة البيانات: ${error.message}`
          : `تم إضافة بلاغ الصيانة ${ticketRecord.id} وحفظه في قاعدة البيانات.`
      );
    } else {
      setNoticeMessage(`تم إضافة بلاغ الصيانة ${ticketRecord.id} (وضع محلي مؤقت).`);
    }

    setNewTicket({ unitId: units[0]?.id || "G-04", title: "", priority: "متوسط", category: "تكييف", assignedTo: "فريق الصيانة" });
    setShowAddTicketModal(false);
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
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#00D8F6] bg-[#00D8F6]/10 px-2.5 py-0.5 rounded-full border border-[#00D8F6]/20 mb
