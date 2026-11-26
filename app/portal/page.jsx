"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  Building2,
  CreditCard,
  Wrench,
  BellRing,
  ArrowRight,
  Plus,
  CheckCircle2,
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

const FALLBACK_UNITS = [
  { id: "G-04", tenant: "مطعم كوك اند غروب", ownershipType: "مستأجر", isSubleased: false, subtenantName: "", subleaseRent: 0, subleaseExpireDate: "", type: "تجاري", area: "120 م²", rent: 35000, status: "نشط", expireDate: "2026-12-15", floor: "الدور الأرضي", phone: "01012345678" },
  { id: "F-08", tenant: "شركة Valict للحلول التقنية", ownershipType: "مالك", isSubleased: false, subtenantName: "", subleaseRent: 0, subleaseExpireDate: "", type: "إداري", area: "150 م²", rent: 0, status: "مملوكة للمالك", expireDate: "", floor: "الدور الأول", phone: "01099998877" },
  { id: "G-09", tenant: "م. محمود عبد الله (مالك)", ownershipType: "مالك", isSubleased: true, subtenantName: "سوبرماركت الراية", subleaseRent: 65000, subleaseExpireDate: "2027-05-20", type: "تجاري", area: "300 م²", rent: 0, status: "مؤجرة للغير", expireDate: "", floor: "الدور الأرضي", phone: "01234567890" },
];

export default function UnitPortalPage() {
  const [units, setUnits] = useState(FALLBACK_UNITS);
  const [selectedUnitId, setSelectedUnitId] = useState("G-04");
  const [invoices, setInvoices] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [statusNote, setStatusNote] = useState("");

  const [ticketForm, setTicketForm] = useState({
    title: "",
    category: "تكييف",
    priority: "متوسط",
    billingType: "ضمن العقد",
    serviceFee: "",
  });

  const loadPortalData = useCallback(async () => {
    if (!supabase) return;
    const [uRes, iRes, tRes, aRes] = await Promise.all([
      supabase.from("units").select("*"),
      supabase.from("invoices").select("*"),
      supabase.from("tickets").select("*"),
      supabase.from("announcements").select("*").order("id", { ascending: false }),
    ]);

    if (!uRes.error && uRes.data?.length) {
      const mappedUnits = uRes.data.map((row) => ({
        id: row.id,
        tenant: row.tenant,
        ownershipType: row.ownership_type || "مستأجر",
        isSubleased: Boolean(row.is_subleased),
        subtenantName: row.subtenant_name || "",
        subleaseRent: Number(row.sublease_rent) || 0,
        subleaseExpireDate: row.sublease_expire_date || "",
        type: row.type,
        area: row.area || "",
        rent: Number(row.rent) || 0,
        status: row.status || "نشط",
        expireDate: row.expire_date || "",
        floor: row.floor || "الدور الأرضي",
        phone: row.phone || "",
      }));
      setUnits(mappedUnits);
      setSelectedUnitId((prev) => (mappedUnits.some((u) => u.id === prev) ? prev : mappedUnits[0].id));
    }

    if (!iRes.error && iRes.data) {
      setInvoices(
        iRes.data.map((row) => ({
          id: row.id,
          unitId: row.unit_id,
          tenant: row.tenant,
          amount: Number(row.amount) || 0,
          type: row.type,
          dueDate: row.due_date,
          status: row.status,
          paymentDate: row.payment_date || "-",
        }))
      );
    }

    if (!tRes.error && tRes.data) {
      setTickets(
        tRes.data.map((row) => ({
          id: row.id,
          unitId: row.unit_id,
          title: row.title,
          priority: row.priority,
          status: row.status,
          category: row.category || "عام",
          date: row.date_label || "الآن",
          billingType: row.billing_type || "ضمن العقد",
          serviceFee: Number(row.service_fee) || 0,
          paymentStatus: row.payment_status || "مدفوع",
        }))
      );
    }

    if (!aRes.error && aRes.data) {
      setAnnouncements(aRes.data);
    }
  }, []);

  useEffect(() => {
    loadPortalData();
  }, [loadPortalData]);

  const activeUnit = useMemo(
    () => units.find((u) => u.id === selectedUnitId) || units[0],
    [units, selectedUnitId]
  );

  const unitInvoices = useMemo(
    () => invoices.filter((inv) => inv.unitId === activeUnit?.id),
    [invoices, activeUnit]
  );

  const unitTickets = useMemo(
    () => tickets.filter((t) => t.unitId === activeUnit?.id),
    [tickets, activeUnit]
  );

  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    if (!activeUnit || !ticketForm.title.trim()) return;

    const isPaid = ticketForm.billingType === "مدفوع";
    const feeValue = isPaid ? Number(ticketForm.serviceFee) || 0 : 0;
    const ticketId = `TCK-${Math.floor(200 + Math.random() * 799)}`;

    const newTicket = {
      id: ticketId,
      unitId: activeUnit.id,
      title: ticketForm.title.trim(),
      priority: ticketForm.priority,
      status: "new",
      category: ticketForm.category,
      date: "الآن",
      billingType: isPaid ? "مدفوع" : "ضمن العقد",
      serviceFee: feeValue,
      paymentStatus: isPaid ? "غير مدفوع" : "مدفوع",
    };

    setTickets((prev) => [newTicket, ...prev]);

    let invoiceId = null;
    if (isPaid && feeValue > 0) {
      invoiceId = `INV-SRV-${Math.floor(100 + Math.random() * 899)}`;
      const today = new Date().toISOString().split("T")[0];
      const newInv = {
        id: invoiceId,
        unitId: activeUnit.id,
        tenant: activeUnit.tenant,
        amount: feeValue,
        type: `صيانة خارج العقد (${ticketId})`,
        dueDate: today,
        status: "قيد الانتظار",
        paymentDate: "-",
      };
      setInvoices((prev) => [newInv, ...prev]);
      if (supabase) {
        await supabase.from("invoices").insert({
          id: newInv.id,
          unit_id: newInv.unitId,
          tenant: newInv.tenant,
          amount: newInv.amount,
          type: newInv.type,
          due_date: newInv.dueDate,
          status: newInv.status,
          payment_date: newInv.paymentDate,
        });
      }
    }

    if (supabase) {
      await supabase.from("tickets").insert({
        id: newTicket.id,
        unit_id: newTicket.unitId,
        title: newTicket.title,
        priority: newTicket.priority,
        status: newTicket.status,
        category: newTicket.category,
        date_label: newTicket.date,
        assigned_to: "فريق الصيانة",
        billing_type: newTicket.billingType,
        service_fee: newTicket.serviceFee,
        payment_status: newTicket.paymentStatus,
      });
    }

    setStatusNote(
      isPaid
        ? `تم تسجيل طلب الصيانة المدفوع ${ticketId} وإصدار الفاتورة ${invoiceId}؛ لن يُغلق البلاغ قبل إتمام الدفع.`
        : `تم إرسال بلاغ الصيانة ${ticketId} إلى إدارة المول.`
    );
    setTicketForm({ title: "", category: "تكييف", priority: "متوسط", billingType: "ضمن العقد", serviceFee: "" });
  };

  const isOwner = activeUnit?.ownershipType === "مالك";

  return (
    <div dir="rtl" className="min-h-screen bg-[#070F1B] text-slate-100 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-[#0B192C] border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-xs text-[#00D8F6] font-bold">Mall Vision • بوابة الوحدة</p>
            <h1 className="text-xl font-black text-white mt-0.5">واجهة المالك والمستأجر - مول الفيوم الجديدة</h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              aria-label="اختر الوحدة"
              value={selectedUnitId}
              onChange={(e) => setSelectedUnitId(e.target.value)}
              className="bg-[#070F1B] border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 font-bold"
            >
              {units.map((u) => (
                <option key={u.id} value={u.id}>
                  الوحدة {u.id} ({u.ownershipType}) - {u.tenant}
                </option>
              ))}
            </select>

            <Link href="/" className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 border border-slate-700">
              <ArrowRight className="w-3.5 h-3.5" /> العودة للإدارة
            </Link>
          </div>
        </div>

        {statusNote && (
          <div className="bg-[#0B192C] border border-[#00D8F6]/40 text-slate-200 px-4 py-3 rounded-xl text-xs flex items-center justify-between">
            <span>{statusNote}</span>
            <button type="button" onClick={() => setStatusNote("")} className="text-slate-400 hover:text-white">إغلاق</button>
          </div>
        )}

        {activeUnit && (
          <div className="bg-[#0B192C] border border-slate-800 rounded-2xl p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="bg-[#070F1B] p-3.5 rounded-xl border border-slate-800">
              <p className="text-slate-400">الصفة والاسم</p>
              <p className="font-bold text-white text-sm mt-1">{activeUnit.tenant}</p>
              <span className="inline-block mt-1 px-2 py-0.5 rounded bg-[#00D8F6]/15 text-[#00D8F6] text-[10px] font-bold">
                {activeUnit.ownershipType}
              </span>
            </div>

            <div className="bg-[#070F1B] p-3.5 rounded-xl border border-slate-800">
              <p className="text-slate-400">بيانات الوحدة</p>
              <p className="font-bold text-white text-sm mt-1">وحدة {activeUnit.id} • {activeUnit.floor}</p>
              <p className="text-slate-400 text-[11px] mt-1">{activeUnit.area} • {activeUnit.type}</p>
            </div>

            <div className="bg-[#070F1B] p-3.5 rounded-xl border border-slate-800">
              <p className="text-slate-400">{isOwner ? "وضع الملكية والتأجير" : "عقد الإيجار"}</p>
              {isOwner ? (
                activeUnit.isSubleased ? (
                  <>
                    <p className="font-bold text-emerald-400 text-sm mt-1">مؤجرة للغير: {activeUnit.subtenantName}</p>
                    <p className="text-slate-400 text-[11px] mt-1">إيجار التأجير: {activeUnit.subleaseRent.toLocaleString()} ج.م</p>
                  </>
                ) : (
                  <>
                    <p className="font-bold text-slate-200 text-sm mt-1">مملوكة للمالك</p>
                    <p className="text-slate-400 text-[11px] mt-1">لا يوجد عقد إيجار على الوحدة</p>
                  </>
                )
              ) : (
                <>
                  <p className="font-bold text-emerald-400 text-sm mt-1">{activeUnit.rent.toLocaleString()} ج.م / شهر</p>
                  <p className="text-slate-400 text-[11px] mt-1">ينتهي العقد: {activeUnit.expireDate || "-"}</p>
                </>
              )}
            </div>

            <div className="bg-[#070F1B] p-3.5 rounded-xl border border-slate-800">
              <p className="text-slate-400">الحالة التشغيلية</p>
              <p className="font-bold text-white text-sm mt-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> {activeUnit.status}
              </p>
              <p className="text-slate-400 text-[11px] mt-1">هاتف: {activeUnit.phone || "-"}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#0B192C] border border-slate-800 rounded-2xl p-5 space-y-4">
            <h2 className="font-bold text-sm text-white flex items-center gap-2">
              <Wrench className="w-4 h-4 text-amber-400" /> طلب صيانة جديد ومتابعة البلاغات
            </h2>

            <form onSubmit={handleSubmitTicket} className="space-y-3 text-xs">
              <input
                required
                type="text"
                placeholder="اكتب وصف العطل أو الخدمة المطلوبة..."
                value={ticketForm.title}
                onChange={(e) => setTicketForm({ ...ticketForm, title: e.target.value })}
                className="w-full bg-[#070F1B] border border-slate-700 rounded-xl p-2.5 text-slate-200"
              />

              <div className="grid grid-cols-3 gap-2">
                <select value={ticketForm.category} onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })} className="bg-[#070F1B] border border-slate-700 rounded-xl p-2 text-slate-200">
                  <option value="تكييف">تكييف</option>
                  <option value="كهرباء">كهرباء</option>
                  <option value="سباكة">سباكة</option>
                  <option value="سلامة">سلامة</option>
                </select>

                <select value={ticketForm.priority} onChange={(e) => setTicketForm({ ...ticketForm, priority: e.target.value })} className="bg-[#070F1B] border border-slate-700 rounded-xl p-2 text-slate-200">
                  <option value="منخفض">منخفض</option>
                  <option value="متوسط">متوسط</option>
                  <option value="عاجل">عاجل</option>
                </select>

                <select value={ticketForm.billingType} onChange={(e) => setTicketForm({ ...ticketForm, billingType: e.target.value })} className="bg-[#070F1B] border border-slate-700 rounded-xl p-2 text-slate-200">
                  <option value="ضمن العقد">ضمن العقد</option>
                  <option value="مدفوع">خارج العقد (مدفوع)</option>
                </select>
              </div>

              {ticketForm.billingType === "مدفوع" && (
                <input
                  required
                  type="number"
                  min="1"
                  placeholder="القيمة التقديرية للصيانة المدفوعة (ج.م)"
                  value={ticketForm.serviceFee}
                  onChange={(e) => setTicketForm({ ...ticketForm, serviceFee: e.target.value })}
                  className="w-full bg-[#070F1B] border border-amber-500/40 rounded-xl p-2.5 text-slate-200"
                />
              )}

              <button type="submit" className="bg-[#00D8F6] text-slate-950 font-bold px-4 py-2 rounded-xl inline-flex items-center gap-1.5">
                <Plus className="w-4 h-4" /> إرسال بلاغ الصيانة
              </button>
            </form>

            <div className="space-y-2 pt-2 border-t border-slate-800">
              {unitTickets.map((t) => (
                <div key={t.id} className="bg-[#070F1B] p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs gap-2">
                  <div>
                    <p className="font-bold text-slate-100">{t.title}</p>
                    <p className="text-[10px] text-slate-400">
                      {t.id} • {t.billingType === "مدفوع" ? `مدفوع (${t.serviceFee.toLocaleString()} ج.م - ${t.paymentStatus})` : "ضمن العقد"}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-[#00D8F6] text-[10px] font-bold">
                    {t.status === "resolved" ? "تم الحل" : t.status === "in_progress" ? "قيد التنفيذ" : "جديد"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-[#0B192C] border border-slate-800 rounded-2xl p-5 space-y-3">
              <h2 className="font-bold text-sm text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#00D8F6]" /> فواتير وإيصالات الوحدة
              </h2>
              {unitInvoices.length === 0 ? (
                <p className="text-xs text-slate-400">لا توجد فواتير مسجلة لهذه الوحدة حالياً.</p>
              ) : (
                <div className="space-y-2 text-xs">
                  {unitInvoices.map((inv) => (
                    <div key={inv.id} className="bg-[#070F1B] p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-100">{inv.type}</p>
                        <p className="text-[10px] text-slate-400">{inv.id} • استحقاق {inv.dueDate}</p>
                      </div>
                      <div className="text-left">
                        <p className="font-black text-emerald-400">{inv.amount.toLocaleString()} ج.م</p>
                        <span className="text-[10px] text-slate-300">{inv.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-[#0B192C] border border-slate-800 rounded-2xl p-5 space-y-3">
              <h2 className="font-bold text-sm text-white flex items-center gap-2">
                <BellRing className="w-4 h-4 text-[#00D8F6]" /> التنبيهات والإعلانات
              </h2>
              <div className="space-y-2 text-xs">
                {announcements.map((a) => (
                  <div key={a.id} className="bg-[#070F1B] p-3 rounded-xl border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-slate-100">{a.title}</p>
                      <span className="text-[10px] text-slate-400">{a.date}</span>
                    </div>
                    <p className="text-slate-300 text-[11px]">{a.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
