"use client";

import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  LayoutDashboard, 
  FileText, 
  CreditCard, 
  Wrench, 
  BellRing, 
  Search, 
  Plus, 
  Filter, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  Printer, 
  X, 
  ChevronRight, 
  ChevronLeft,
  ShieldCheck,
  Send,
  MoreVertical,
  Check,
  Sparkles,
  Download,
  Calendar,
  DollarSign,
  ArrowUpRight,
  HelpCircle
} from 'lucide-react';

// --- MOCK DATA ---
const INITIAL_STATS = {
  totalUnits: 120,
  occupiedUnits: 100,
  vacantUnits: 20,
  monthlyRevenue: 485000,
  targetRevenue: 550000,
  openTickets: 4,
  expiringLeases: 3
};

const INITIAL_UNITS = [
  { id: 'G-04', tenant: 'مطعم كوك اند غروب', type: 'تجاري', area: '120 م²', rent: 35000, status: 'نشط', expireDate: '2026-12-15', floor: 'الدور الأرضي', phone: '01012345678' },
  { id: 'F-12', tenant: 'مكتب الفرسان للهندسة', type: 'إداري', area: '85 م²', rent: 18000, status: 'تنبيه تجديد', expireDate: '2026-12-10', floor: 'الدور الأول', phone: '01123456789' },
  { id: 'F-08', tenant: 'شركة Valict للحلول التقنية', type: 'إداري', area: '150 م²', rent: 0, status: 'نشط (المقر الرئيسي)', expireDate: '2030-01-01', floor: 'الدور الأول', phone: '01099998877' },
  { id: 'G-09', tenant: 'سوبرماركت الراية', type: 'تجاري', area: '300 م²', rent: 65000, status: 'نشط', expireDate: '2027-05-20', floor: 'الدور الأرضي', phone: '01234567890' },
  { id: 'S-02', tenant: 'صيدلية مصر', type: 'تجاري', area: '90 م²', rent: 28000, status: 'نشط', expireDate: '2027-01-15', floor: 'الدور الأرضي', phone: '01055554433' },
  { id: 'F-05', tenant: 'عيادة د. أحمد زكي - أسنان', type: 'عيادات', area: '65 م²', rent: 15000, status: 'متأخر في السداد', expireDate: '2026-11-30', floor: 'الدور الأول', phone: '01188887766' },
  { id: 'S-14', tenant: 'كافيه كوستا', type: 'مطاعم وكافيهات', area: '110 م²', rent: 32000, status: 'نشط', expireDate: '2026-12-28', floor: 'الدور الأرضي', phone: '01044443322' },
];

const INITIAL_INVOICES = [
  { id: 'INV-2026-001', unitId: 'G-04', tenant: 'مطعم كوك اند غروب', amount: 35000, type: 'إيجار شهر نوفمبر', dueDate: '2026-11-05', status: 'مدفوع', paymentDate: '2026-11-03' },
  { id: 'INV-2026-002', unitId: 'F-12', tenant: 'مكتب الفرسان للهندسة', amount: 18000, type: 'إيجار شهر نوفمبر', dueDate: '2026-11-05', status: 'مدفوع', paymentDate: '2026-11-04' },
  { id: 'INV-2026-003', unitId: 'F-05', tenant: 'عيادة د. أحمد زكي', amount: 15000, type: 'إيجار + صيانة', dueDate: '2026-11-01', status: 'متأخر', paymentDate: '-' },
  { id: 'INV-2026-004', unitId: 'G-09', tenant: 'سوبرماركت الراية', amount: 65000, type: 'إيجار شهر نوفمبر', dueDate: '2026-11-10', status: 'مدفوع', paymentDate: '2026-11-08' },
  { id: 'INV-2026-005', unitId: 'S-14', tenant: 'كافيه كوستا', amount: 32000, type: 'صيانة ومرافق', dueDate: '2026-11-15', status: 'قيد الانتظار', paymentDate: '-' },
];

const INITIAL_TICKETS = [
  { id: 'TCK-101', unitId: 'G-04', title: 'عطل في التكييف المركزي بالفرع', priority: 'عاجل', status: 'new', category: 'تكييف', date: 'منذ ساعتين', assignedTo: 'م. أحمد حسن' },
  { id: 'TCK-102', unitId: 'F-12', title: 'تسريب مياه في الدورة الخاصة', priority: 'متوسط', status: 'in_progress', category: 'سباكة', date: 'منذ 5 ساعات', assignedTo: 'فني السباكة (أيمن)' },
  { id: 'TCK-103', unitId: 'S-02', title: 'إنارة المدخل الخارجي للصيدلية', priority: 'منخفض', status: 'in_progress', category: 'كهرباء', date: 'أمس', assignedTo: 'فني الكهرباء (علي)' },
  { id: 'TCK-104', unitId: 'G-09', title: 'فحص الحساسات الخاصة بالحريق', priority: 'عاجل', status: 'resolved', category: 'سلامة', date: 'منذ يومين', assignedTo: 'فريق السلامة المهنية' },
];

const INITIAL_ANNOUNCEMENTS = [
  { id: 1, title: 'صيانة دورية للمولدات الكهربائية الاحتياطية', content: 'نحيطكم علماً بأنه سيتم إجراء صيانة دورية للمولدات يوم السبت القادم من الساعة 2:00 صباحاً وحتى 4:00 صباحاً.', date: '2026-11-24', priority: 'هام', target: 'جميع المستأجرين' },
  { id: 2, title: 'مواعيد العمل الشتوية الخاصة بالمول', content: 'تم تحديث مواعيد فتح وإغلاق أبواب المول الرئيسية لتكون من الساعة 9:00 صباحاً وحتى 11:00 مساءً.', date: '2026-11-20', priority: 'عادي', target: 'القطاع التجاري' },
];

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');

  // Data States
  const [units, setUnits] = useState(INITIAL_UNITS);
  const [invoices, setInvoices] = useState(INITIAL_INVOICES);
  const [tickets, setTickets] = useState(INITIAL_TICKETS);
  const [announcements, setAnnouncements] = useState(INITIAL_ANNOUNCEMENTS);

  // Modals
  const [showAddUnitModal, setShowAddUnitModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Filter States
  const [unitFilter, setUnitFilter] = useState('الكل');

  // New Unit Form State
  const [newUnit, setNewUnit] = useState({ id: '', tenant: '', type: 'تجاري', area: '', rent: '', expireDate: '', floor: 'الدور الأرضي', phone: '' });
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '', priority: 'عادي', target: 'جميع المستأجرين' });

  // Add Unit Handler
  const handleAddUnit = (e) => {
    e.preventDefault();
    if (!newUnit.id || !newUnit.tenant) return;
    setUnits([...units, { ...newUnit, rent: Number(newUnit.rent), status: 'نشط' }]);
    setNewUnit({ id: '', tenant: '', type: 'تجاري', area: '', rent: '', expireDate: '', floor: 'الدور الأرضي', phone: '' });
    setShowAddUnitModal(false);
  };

  // Add Announcement Handler
  const handleAddAnnouncement = (e) => {
    e.preventDefault();
    if (!newAnnouncement.title || !newAnnouncement.content) return;
    setAnnouncements([
      { id: Date.now(), ...newAnnouncement, date: new Date().toISOString().split('T')[0] },
      ...announcements
    ]);
    setNewAnnouncement({ title: '', content: '', priority: 'عادي', target: 'جميع المستأجرين' });
    setShowAnnouncementModal(false);
  };

  // Ticket Status Change
  const moveTicket = (ticketId, newStatus) => {
    setTickets(tickets.map(t => t.id === ticketId ? { ...t, status: newStatus } : t));
  };

  // Filtered Units
  const filteredUnits = useMemo(() => {
    return units.filter(u => {
      const matchesSearch = u.tenant.toLowerCase().includes(searchQuery.toLowerCase()) || u.id.toLowerCase().includes(searchQuery.toLowerCase());
      if (unitFilter === 'الكل') return matchesSearch;
      if (unitFilter === 'تنبيهات') return matchesSearch && u.status.includes('تنبيه');
      return matchesSearch && u.floor === unitFilter;
    });
  }, [units, searchQuery, unitFilter]);

  return (
    <div className="min-h-screen bg-[#070F1B] text-slate-100 font-sans dir-rtl text-right flex flex-col md:flex-row antialiased selection:bg-[#00D8F6] selection:text-black">
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-full md:w-72 bg-[#0B192C] border-l border-slate-800 flex flex-col justify-between shrink-0 z-20">
        <div>
          {/* Valict Brand Header */}
          <div className="p-6 border-b border-slate-800/80 bg-gradient-to-r from-[#0B192C] to-[#1E3E62]/30">
            <div className="flex items-center gap-3">
              {/* Circuit V Icon */}
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00D8F6] to-blue-600 flex items-center justify-center shadow-lg shadow-[#00D8F6]/20 font-bold text-slate-950 text-xl border border-white/20">
                V
              </div>
              <div>
                <h1 className="text-xl font-black tracking-wider text-white flex items-center gap-1.5">
                  Valict <span className="text-[10px] bg-[#00D8F6]/20 text-[#00D8F6] px-2 py-0.5 rounded-full border border-[#00D8F6]/30 font-medium">SaaS</span>
                </h1>
                <p className="text-[11px] text-slate-400 font-medium">Validate Your Vision</p>
              </div>
            </div>
            
            <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 text-slate-300 font-semibold">
                <Building2 className="w-3.5 h-3.5 text-[#00D8F6]" />
                مول الفيوم الجديدة
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="متصل بالمنظومة"></span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            <NavItem 
              icon={<LayoutDashboard className="w-5 h-5" />} 
              label="لوحة التحكم الرئيسية" 
              active={activeTab === 'overview'} 
              onClick={() => setActiveTab('overview')} 
            />
            <NavItem 
              icon={<Building2 className="w-5 h-5" />} 
              label="العقود والوحدات" 
              active={activeTab === 'units'} 
              onClick={() => setActiveTab('units')} 
              badge={units.length}
            />
            <NavItem 
              icon={<CreditCard className="w-5 h-5" />} 
              label="التحصيل والفواتير" 
              active={activeTab === 'billing'} 
              onClick={() => setActiveTab('billing')} 
              badge={invoices.filter(i => i.status === 'متأخر').length}
              badgeColor="bg-rose-500/20 text-rose-400 border-rose-500/30"
            />
            <NavItem 
              icon={<Wrench className="w-5 h-5" />} 
              label="مركز الصيانة والخدمات" 
              active={activeTab === 'maintenance'} 
              onClick={() => setActiveTab('maintenance')} 
              badge={tickets.filter(t => t.status !== 'resolved').length}
              badgeColor="bg-amber-500/20 text-amber-400 border-amber-500/30"
            />
            <NavItem 
              icon={<BellRing className="w-5 h-5" />} 
              label="التنبيهات والإعلانات" 
              active={activeTab === 'announcements'} 
              onClick={() => setActiveTab('announcements')} 
            />
          </nav>
        </div>

        {/* Footer / Infrastructure Badge */}
        <div className="p-4 border-t border-slate-800/80 bg-[#070F1B]/50">
          <div className="bg-[#1E3E62]/30 rounded-xl p-3 border border-slate-700/50 flex items-center gap-3">
            <ShieldCheck className="w-7 h-7 text-[#00D8F6] shrink-0" />
            <div className="text-xs">
              <p className="font-semibold text-slate-200">بنية Valict السحابية</p>
              <p className="text-[10px] text-slate-400">حماية وتأمين البيانات 99.9%</p>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        
        {/* TOP HEADER BAR */}
        <header className="h-16 bg-[#0B192C]/80 backdrop-blur border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-10">
          {/* Global Search Bar */}
          <div className="relative w-full max-w-md hidden sm:block">
            <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="ابحث عن وحدة، مستأجر، رقم فاتورة، أو تذكرة صيانة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#070F1B] border border-slate-700/80 rounded-xl pr-10 pl-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-[#00D8F6] focus:ring-1 focus:ring-[#00D8F6] transition-all"
            />
          </div>

          {/* User Profile & Quick Actions */}
          <div className="flex items-center gap-3 mr-auto sm:mr-0">
            <button 
              onClick={() => setShowAddUnitModal(true)}
              className="bg-gradient-to-r from-[#00D8F6] to-blue-600 text-slate-950 font-bold px-3.5 py-1.5 rounded-lg text-xs flex items-center gap-1.5 hover:brightness-110 shadow-lg shadow-[#00D8F6]/15 transition-all"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              وحدة جديدة
            </button>

            <button 
              onClick={() => setShowAnnouncementModal(true)}
              className="bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition"
            >
              <Send className="w-3.5 h-3.5 text-[#00D8F6]" />
              إرسال تنبيه
            </button>

            <div className="h-6 w-px bg-slate-800 mx-1"></div>

            {/* Profile Avatar */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-xs text-white border border-white/10">
                إم
              </div>
              <div className="hidden lg:block text-xs">
                <p className="font-semibold text-slate-200">إدارة المول</p>
                <p className="text-[10px] text-[#00D8F6]">Valict Admin</p>
              </div>
            </div>
          </div>
        </header>

        {/* TAB CONTENTS CONTAINER */}
        <div className="p-4 sm:p-6 lg:p-8 flex-1 space-y-6">

          {/* ================= TAB 1: OVERVIEW DASHBOARD ================= */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Banner Welcome */}
              <div className="relative bg-gradient-to-r from-[#1E3E62] via-[#0B192C] to-[#070F1B] rounded-2xl p-6 border border-slate-700/60 overflow-hidden shadow-xl">
                <div className="absolute left-0 top-0 bottom-0 w-1/3 bg-gradient-to-r from-transparent to-[#00D8F6]/10 pointer-events-none transform -skew-x-12"></div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#00D8F6] bg-[#00D8F6]/10 px-2.5 py-0.5 rounded-full border border-[#00D8F6]/20 mb-2">
                      <Sparkles className="w-3 h-3" /> نظام الإدارة التشغيلي الموحد
                    </span>
                    <h2 className="text-2xl font-black text-white">لوحة تحكم مول الفيوم الجديدة</h2>
                    <p className="text-slate-300 text-xs mt-1 max-w-xl">
                      متابعة لحظية ومباشرة للأداء المالي، نسبة الإشغال، تذاكر الصيانة وعقود المستأجرين مدعومة بذكاء Valict الرقمي.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs bg-[#070F1B]/60 p-3 rounded-xl border border-slate-700/50 backdrop-blur">
                    <Calendar className="w-4 h-4 text-[#00D8F6]" />
                    <div>
                      <p className="text-slate-400 text-[10px]">التاريخ الحالي</p>
                      <p className="font-bold text-slate-200">الخميس، 26 نوفمبر 2026</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* KPI TOP CARDS GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard 
                  title="إجمالي الوحدات والإشغال"
                  value="83.3%"
                  subtext={`100 مشغولة من أصل 120 (20 شاغرة)`}
                  icon={<Building2 className="w-6 h-6 text-[#00D8F6]" />}
                  badge="+2.4% هذا الشهر"
                  badgeType="success"
                />
                <KpiCard 
                  title="تحصيل الإيجارات (الشهر الحالي)"
                  value="485,000 ج.م"
                  subtext="من إجمالي 550,000 ج.م (88%)"
                  icon={<DollarSign className="w-6 h-6 text-emerald-400" />}
                  badge="متبقى 65,000 ج.م"
                  badgeType="warning"
                />
                <KpiCard 
                  title="طلبات الصيانة المفتوحة"
                  value="4 طلبات"
                  subtext="1 عاجل جداً | 2 قيد العمل"
                  icon={<Wrench className="w-6 h-6 text-amber-400" />}
                  badge="استجابة سريعة"
                  badgeType="neutral"
                />
                <KpiCard 
                  title="عقود تنتهي قريباً (30 يوم)"
                  value="3 عقود"
                  subtext="تتطلب متابعة وإعادة التجديد"
                  icon={<AlertTriangle className="w-6 h-6 text-rose-400" />}
                  badge="إجراء مطلوب"
                  badgeType="danger"
                />
              </div>

              {/* CHARTS & RECENT ACTIVITIES SECTION */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Revenue Trend Visual */}
                <div className="lg:col-span-2 bg-[#0B192C] border border-slate-800 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-[#00D8F6]" />
                        تحليل التدفق النقدي والتحصيل الشهري (2026)
                      </h3>
                      <p className="text-[11px] text-slate-400">مقارنة بين المستهدف والفعلي خلال 6 أشهر</p>
                    </div>
                    <span className="text-xs bg-slate-800 text-slate-300 px-3 py-1 rounded-lg border border-slate-700">بالجنيه المصري</span>
                  </div>

                  {/* Simulated Visual Bar Chart */}
                  <div className="h-56 flex items-end justify-between gap-3 pt-6 px-2">
                    {[
                      { month: 'يونيو', amount: 410, target: 450 },
                      { month: 'يوليو', amount: 430, target: 470 },
                      { month: 'أغسطس', amount: 460, target: 500 },
                      { month: 'سبتمبر', amount: 440, target: 500 },
                      { month: 'أكتوبر', amount: 490, target: 520 },
                      { month: 'نوفمبر', amount: 485, target: 550 },
                    ].map((item, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                        <div className="text-[10px] text-slate-400 group-hover:text-[#00D8F6] font-bold transition">
                          {item.amount}k
                        </div>
                        <div className="w-full max-w-[36px] bg-slate-800 rounded-t-lg relative overflow-hidden flex items-end h-full">
                          <div 
                            className="w-full bg-gradient-to-t from-blue-700 to-[#00D8F6] rounded-t-lg transition-all duration-500 group-hover:brightness-125"
                            style={{ height: `${(item.amount / 550) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-[11px] text-slate-400 font-medium">{item.month}</span>
                      </div>
                    ))}
                  </div>

                  {/* Category Occupancy Status */}
                  <div className="pt-3 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <div className="bg-[#070F1B] p-2.5 rounded-xl border border-slate-800">
                      <p className="text-[10px] text-slate-400">محلات تجارية</p>
                      <p className="font-bold text-slate-200 text-sm mt-0.5">45 وحدة (90%)</p>
                    </div>
                    <div className="bg-[#070F1B] p-2.5 rounded-xl border border-slate-800">
                      <p className="text-[10px] text-slate-400">مكاتب إدارية</p>
                      <p className="font-bold text-slate-200 text-sm mt-0.5">35 وحدة (80%)</p>
                    </div>
                    <div className="bg-[#070F1B] p-2.5 rounded-xl border border-slate-800">
                      <p className="text-[10px] text-slate-400">مطاعم وكافيهات</p>
                      <p className="font-bold text-slate-200 text-sm mt-0.5">12 وحدة (100%)</p>
                    </div>
                    <div className="bg-[#070F1B] p-2.5 rounded-xl border border-slate-800">
                      <p className="text-[10px] text-slate-400">عيادات ومراكز</p>
                      <p className="font-bold text-slate-200 text-sm mt-0.5">8 وحدات (70%)</p>
                    </div>
                  </div>
                </div>

                {/* Urgent Action Widgets Column */}
                <div className="space-y-4">
                  {/* Urgent Maintenance Widget */}
                  <div className="bg-[#0B192C] border border-slate-800 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
                      <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                        <Wrench className="w-3.5 h-3.5 text-amber-400" />
                        آخر طلبات الصيانة
                      </h4>
                      <button onClick={() => setActiveTab('maintenance')} className="text-[10px] text-[#00D8F6] hover:underline">عرض الكل</button>
                    </div>
                    <div className="space-y-2.5">
                      {tickets.slice(0, 3).map(ticket => (
                        <div key={ticket.id} className="bg-[#070F1B] p-2.5 rounded-xl border border-slate-800/80 flex items-center justify-between gap-2">
                          <div>
                            <p className="text-xs font-semibold text-slate-200 line-clamp-1">{ticket.title}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">الوحدة: {ticket.unitId} • {ticket.date}</p>
                          </div>
                          <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold border shrink-0 ${
                            ticket.priority === 'عاجل' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' : 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}>
                            {ticket.priority}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Expiring Leases Widget */}
                  <div className="bg-[#0B192C] border border-slate-800 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
                      <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-rose-400" />
                        عقود بحاجة لتجديد
                      </h4>
                      <button onClick={() => { setActiveTab('units'); setUnitFilter('تنبيهات'); }} className="text-[10px] text-[#00D8F6] hover:underline">متابعة العقود</button>
                    </div>
                    <div className="space-y-2">
                      {units.filter(u => u.status.includes('تنبيه') || u.expireDate.startsWith('2026-12')).slice(0, 2).map(unit => (
                        <div key={unit.id} className="bg-[#070F1B] p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
                          <div>
                            <p className="text-xs font-semibold text-slate-200">{unit.tenant}</p>
                            <p className="text-[10px] text-slate-400">ينتهي في: {unit.expireDate}</p>
                          </div>
                          <span className="text-[10px] text-amber-400 font-bold bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                            {unit.id}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>

            </div>
          )}

          {/* ================= TAB 2: UNITS & LEASES ================= */}
          {activeTab === 'units' && (
            <div className="space-y-4 animate-fadeIn">
              
              {/* Header & Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0B192C] p-4 rounded-2xl border border-slate-800">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-[#00D8F6]" />
                    دليل الوحدات والعقود
                  </h2>
                  <p className="text-xs text-slate-400">إدارة المستأجرين، عقود الإيجار، وتفاصيل المساحات</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setShowAddUnitModal(true)}
                    className="bg-gradient-to-r from-[#00D8F6] to-blue-600 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 hover:brightness-110 shadow-md transition"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    إضافة وحدة جديدة
                  </button>
                </div>
              </div>

              {/* Filters Bar */}
              <div className="flex flex-wrap items-center gap-2">
                {['الكل', 'الدور الأرضي', 'الدور الأول', 'تنبيهات'].map(filter => (
                  <button
                    key={filter}
                    onClick={() => setUnitFilter(filter)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition ${
                      unitFilter === filter 
                        ? 'bg-[#00D8F6] text-slate-950 font-bold border-[#00D8F6]' 
                        : 'bg-[#0B192C] text-slate-300 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {filter === 'تنبيهات' ? '⚠️ تنبيهات التجديد' : filter}
                  </button>
                ))}
              </div>

              {/* Units Table */}
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
                        <th className="p-4 text-center">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-200">
                      {filteredUnits.map(unit => (
                        <tr key={unit.id} className="hover:bg-slate-800/40 transition">
                          <td className="p-4 font-bold text-[#00D8F6]">{unit.id}</td>
                          <td className="p-4">
                            <p className="font-bold text-slate-100">{unit.tenant}</p>
                            <p className="text-[10px] text-slate-400">{unit.phone}</p>
                          </td>
                          <td className="p-4">
                            <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px] border border-slate-700">
                              {unit.type}
                            </span>
                          </td>
                          <td className="p-4 text-slate-300">{unit.area}</td>
                          <td className="p-4 font-bold text-emerald-400">
                            {unit.rent > 0 ? `${unit.rent.toLocaleString()} ج.م` : 'المقر الرئيسي'}
                          </td>
                          <td className="p-4 text-slate-300">{unit.expireDate}</td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                              unit.status.includes('نشط') 
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                : unit.status.includes('تنبيه')
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse'
                                : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                            }`}>
                              {unit.status}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <button 
                              onClick={() => alert(`تفاصيل العقد للوحدة ${unit.id}: ${unit.tenant}`)}
                              className="text-slate-400 hover:text-[#00D8F6] p-1 rounded hover:bg-slate-800 transition"
                            >
                              عرض العقد
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

          {/* ================= TAB 3: BILLING & FINANCIALS ================= */}
          {activeTab === 'billing' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Financial Stats Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-[#0B192C] p-4 rounded-2xl border border-slate-800">
                  <p className="text-xs text-slate-400">إجمالي المفوتر هذا الشهر</p>
                  <p className="text-xl font-black text-white mt-1">550,000 ج.م</p>
                </div>
                <div className="bg-[#0B192C] p-4 rounded-2xl border border-slate-800">
                  <p className="text-xs text-slate-400">المبلغ المحصل بالفعل</p>
                  <p className="text-xl font-black text-emerald-400 mt-1">485,000 ج.م</p>
                </div>
                <div className="bg-[#0B192C] p-4 rounded-2xl border border-slate-800">
                  <p className="text-xs text-slate-400">المتبقي والمتأخرات</p>
                  <p className="text-xl font-black text-rose-400 mt-1">65,000 ج.م</p>
                </div>
              </div>

              {/* Invoices List */}
              <div className="bg-[#0B192C] border border-slate-800 rounded-2xl p-4 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-[#00D8F6]" />
                    سجل الفواتير والإيصالات الرقمية
                  </h3>
                  <span className="text-xs text-slate-400">معتمدة بهوية Valict الرقمية</span>
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
                        <th className="p-3 text-center">الإيصال الرقمي</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {invoices.map(inv => (
                        <tr key={inv.id} className="hover:bg-slate-800/40 transition">
                          <td className="p-3 font-mono font-semibold text-slate-300">{inv.id}</td>
                          <td className="p-3 font-bold text-slate-100">{inv.tenant} ({inv.unitId})</td>
                          <td className="p-3 text-slate-300">{inv.type}</td>
                          <td className="p-3 font-bold text-white">{inv.amount.toLocaleString()} ج.م</td>
                          <td className="p-3 text-slate-400">{inv.dueDate}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                              inv.status === 'مدفوع' 
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                : inv.status === 'متأخر'
                                ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            }`}>
                              {inv.status}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <button
                              onClick={() => { setSelectedInvoice(inv); setShowInvoiceModal(true); }}
                              className="bg-slate-800 hover:bg-[#00D8F6] hover:text-slate-950 text-slate-200 border border-slate-700 px-3 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 mx-auto transition"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              معاينة وتفريغ
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

          {/* ================= TAB 4: MAINTENANCE TICKETS (KANBAN) ================= */}
          {activeTab === 'maintenance' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between bg-[#0B192C] p-4 rounded-2xl border border-slate-800">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Wrench className="w-5 h-5 text-amber-400" />
                    مركز الصيانة والخدمات الفنية
                  </h2>
                  <p className="text-xs text-slate-400">تتبع البلاغات والأعطال ومتابعة الفنيين (نظام Kanban)</p>
                </div>
              </div>

              {/* KANBAN BOARD GRID */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Column 1: New Tickets */}
                <KanbanColumn 
                  title="بلاغات جديدة (New)" 
                  count={tickets.filter(t => t.status === 'new').length}
                  color="border-rose-500/50 bg-rose-500/5"
                >
                  {tickets.filter(t => t.status === 'new').map(ticket => (
                    <TicketCard 
                      key={ticket.id} 
                      ticket={ticket} 
                      onMove={(status) => moveTicket(ticket.id, status)}
                      onSelect={() => setSelectedTicket(ticket)}
                    />
                  ))}
                </KanbanColumn>

                {/* Column 2: In Progress */}
                <KanbanColumn 
                  title="قيد التنفيذ (In Progress)" 
                  count={tickets.filter(t => t.status === 'in_progress').length}
                  color="border-amber-500/50 bg-amber-500/5"
                >
                  {tickets.filter(t => t.status === 'in_progress').map(ticket => (
                    <TicketCard 
                      key={ticket.id} 
                      ticket={ticket} 
                      onMove={(status) => moveTicket(ticket.id, status)}
                      onSelect={() => setSelectedTicket(ticket)}
                    />
                  ))}
                </KanbanColumn>

                {/* Column 3: Resolved */}
                <KanbanColumn 
                  title="تم الحل والإغلاق (Resolved)" 
                  count={tickets.filter(t => t.status === 'resolved').length}
                  color="border-emerald-500/50 bg-emerald-500/5"
                >
                  {tickets.filter(t => t.status === 'resolved').map(ticket => (
                    <TicketCard 
                      key={ticket.id} 
                      ticket={ticket} 
                      onMove={(status) => moveTicket(ticket.id, status)}
                      onSelect={() => setSelectedTicket(ticket)}
                    />
                  ))}
                </KanbanColumn>

              </div>
            </div>
          )}

          {/* ================= TAB 5: ANNOUNCEMENTS ================= */}
          {activeTab === 'announcements' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between bg-[#0B192C] p-4 rounded-2xl border border-slate-800">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <BellRing className="w-5 h-5 text-[#00D8F6]" />
                    سجل التنبيهات والتواصل الداخلي
                  </h2>
                  <p className="text-xs text-slate-400">بث الإشعارات والتعليمات لكافة المستأجرين في المول</p>
                </div>
                <button 
                  onClick={() => setShowAnnouncementModal(true)}
                  className="bg-[#00D8F6] text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  إعلان جديد
                </button>
              </div>

              <div className="space-y-4">
                {announcements.map(item => (
                  <div key={item.id} className="bg-[#0B192C] p-5 rounded-2xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          item.priority === 'هام' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' : 'bg-[#00D8F6]/20 text-[#00D8F6] border-[#00D8F6]/30'
                        }`}>
                          {item.priority}
                        </span>
                        <h3 className="font-bold text-slate-100 text-sm">{item.title}</h3>
                      </div>
                      <span className="text-[11px] text-slate-400">{item.date}</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{item.content}</p>
                    <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                      <span>المستهدف: <strong className="text-slate-200">{item.target}</strong></span>
                      <span className="text-emerald-400 flex items-center gap-1">
                        <Check className="w-3 h-3" /> تم الإرسال عبر التطبيق والـ SMS
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>

      {/* ================= MODALS ================= */}

      {/* 1. ADD NEW UNIT MODAL */}
      {showAddUnitModal && (
        <Modal title="إضافة وحدة ومستأجر جديد" onClose={() => setShowAddUnitModal(false)}>
          <form onSubmit={handleAddUnit} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">رقم الوحدة (مثال: G-15)</label>
                <input 
                  required
                  type="text" 
                  value={newUnit.id}
                  onChange={e => setNewUnit({...newUnit, id: e.target.value})}
                  placeholder="G-15"
                  className="w-full bg-[#070F1B] border border-slate-700 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-[#00D8F6]"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">اسم الشركة / المستأجر</label>
                <input 
                  required
                  type="text" 
                  value={newUnit.tenant}
                  onChange={e => setNewUnit({...newUnit, tenant: e.target.value})}
                  placeholder="مثال: متجر الأناقة"
                  className="w-full bg-[#070F1B] border border-slate-700 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-[#00D8F6]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">نوع النشاط</label>
                <select 
                  value={newUnit.type}
                  onChange={e => setNewUnit({...newUnit, type: e.target.value})}
                  className="w-full bg-[#070F1B] border border-slate-700 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-[#00D8F6]"
                >
                  <option value="تجاري">تجاري</option>
                  <option value="إداري">إداري</option>
                  <option value="مطاعم وكافيهات">مطاعم وكافيهات</option>
                  <option value="عيادات">عيادات</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">المساحة</label>
                <input 
                  type="text" 
                  placeholder="100 م²"
                  value={newUnit.area}
                  onChange={e => setNewUnit({...newUnit, area: e.target.value})}
                  className="w-full bg-[#070F1B] border border-slate-700 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-[#00D8F6]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">الإيجار الشهري (ج.م)</label>
                <input 
                  type="number" 
                  placeholder="25000"
                  value={newUnit.rent}
                  onChange={e => setNewUnit({...newUnit, rent: e.target.value})}
                  className="w-full bg-[#070F1B] border border-slate-700 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-[#00D8F6]"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">تاريخ نهاية العقد</label>
                <input 
                  type="date" 
                  value={newUnit.expireDate}
                  onChange={e => setNewUnit({...newUnit, expireDate: e.target.value})}
                  className="w-full bg-[#070F1B] border border-slate-700 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-[#00D8F6]"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button 
                type="button" 
                onClick={() => setShowAddUnitModal(false)}
                className="px-4 py-2 rounded-xl text-slate-400 hover:bg-slate-800"
              >
                إلغاء
              </button>
              <button 
                type="submit"
                className="bg-[#00D8F6] text-slate-950 font-bold px-5 py-2 rounded-xl hover:brightness-110"
              >
                حفظ الوحدة
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* 2. INVOICE RECEIPT MODAL (PRINT READY) */}
      {showInvoiceModal && selectedInvoice && (
        <Modal title="معاينة إيصال سداد رقمي" onClose={() => setShowInvoiceModal(false)}>
          <div className="bg-white text-slate-900 p-6 rounded-xl space-y-6 dir-rtl text-right font-sans">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-xl font-black text-[#0B192C]">إيصال استلام نقدية / خدمات</h3>
                <p className="text-xs text-slate-500">مول الفيوم الجديدة - الإدارة التشغيلية</p>
              </div>
              <div className="text-left font-mono">
                <span className="text-xs text-[#00D8F6] font-bold block">Valict Cloud Secured</span>
                <span className="text-sm font-bold text-slate-700">{selectedInvoice.id}</span>
              </div>
            </div>

            {/* Details Grid */}
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
                <p className="text-slate-400">مبلغ وقدره:</p>
                <p className="font-black text-emerald-600 text-base mt-0.5">{selectedInvoice.amount.toLocaleString()} جنيه مصري</p>
              </div>
              <div>
                <p className="text-slate-400">وذلك مقابل:</p>
                <p className="font-bold text-slate-800 text-sm mt-0.5">{selectedInvoice.type}</p>
              </div>
            </div>

            {/* Verification Stamp Footer */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
              <div className="flex items-center gap-1.5 text-emerald-600 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                معتمد ومسدد رقمياً عبر نظام Valict
              </div>
              <p>التاريخ: {selectedInvoice.paymentDate !== '-' ? selectedInvoice.paymentDate : new Date().toISOString().split('T')[0]}</p>
            </div>

            {/* Print Button */}
            <div className="pt-2 flex justify-end gap-2">
              <button 
                onClick={() => window.print()}
                className="bg-[#0B192C] text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-slate-800"
              >
                <Printer className="w-3.5 h-3.5 text-[#00D8F6]" />
                طباعة الإيصال
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* 3. NEW ANNOUNCEMENT MODAL */}
      {showAnnouncementModal && (
        <Modal title="إرسال تنبيه جديد للمستأجرين" onClose={() => setShowAnnouncementModal(false)}>
          <form onSubmit={handleAddAnnouncement} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">عنوان التنبيه</label>
              <input 
                required
                type="text" 
                value={newAnnouncement.title}
                onChange={e => setNewAnnouncement({...newAnnouncement, title: e.target.value})}
                placeholder="مثال: تنبيه بخصوص أعمال النظافة الدورية"
                className="w-full bg-[#070F1B] border border-slate-700 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-[#00D8F6]"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">نص الرسالة / الإعلان</label>
              <textarea 
                required
                rows="4"
                value={newAnnouncement.content}
                onChange={e => setNewAnnouncement({...newAnnouncement, content: e.target.value})}
                placeholder="اكتب التنبيه للتوجيه المباشر..."
                className="w-full bg-[#070F1B] border border-slate-700 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-[#00D8F6]"
              ></textarea>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">الأهمية</label>
                <select 
                  value={newAnnouncement.priority}
                  onChange={e => setNewAnnouncement({...newAnnouncement, priority: e.target.value})}
                  className="w-full bg-[#070F1B] border border-slate-700 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-[#00D8F6]"
                >
                  <option value="عادي">عادي</option>
                  <option value="هام">هام جداً</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">الفئة المستهدفة</label>
                <select 
                  value={newAnnouncement.target}
                  onChange={e => setNewAnnouncement({...newAnnouncement, target: e.target.value})}
                  className="w-full bg-[#070F1B] border border-slate-700 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-[#00D8F6]"
                >
                  <option value="جميع المستأجرين">جميع المستأجرين</option>
                  <option value="القطاع التجاري">القطاع التجاري فقط</option>
                  <option value="القطاع الإداري">القطاع الإداري فقط</option>
                </select>
              </div>
            </div>
            <div className="pt-2 flex justify-end gap-2">
              <button 
                type="button" 
                onClick={() => setShowAnnouncementModal(false)}
                className="px-4 py-2 rounded-xl text-slate-400 hover:bg-slate-800"
              >
                إلغاء
              </button>
              <button 
                type="submit"
                className="bg-[#00D8F6] text-slate-950 font-bold px-5 py-2 rounded-xl hover:brightness-110"
              >
                إرسال فوراً
              </button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
}

// --- HELPER COMPONENTS ---

function NavItem({ icon, label, active, onClick, badge, badgeColor }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
        active 
          ? 'bg-gradient-to-r from-[#00D8F6] to-blue-600 text-slate-950 shadow-md shadow-[#00D8F6]/20 font-bold' 
          : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
      }`}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span>{label}</span>
      </div>
      {badge !== undefined && (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${badgeColor || 'bg-slate-800 text-slate-200 border-slate-700'}`}>
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
        <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
          badgeType === 'success' ? 'bg-emerald-500/10 text-emerald-400' :
          badgeType === 'warning' ? 'bg-amber-500/10 text-amber-400' :
          badgeType === 'danger' ? 'bg-rose-500/10 text-rose-400' : 'bg-slate-800 text-slate-300'
        }`}>
          {badge}
        </span>
      </div>
    </div>
  );
}

function KanbanColumn({ title, count, color, children }) {
  return (
    <div className={`border rounded-2xl p-4 flex flex-col min-h-[400px] ${color}`}>
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
        <h3 className="font-bold text-slate-200 text-xs">{title}</h3>
        <span className="bg-slate-800 text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded-full">{count}</span>
      </div>
      <div className="space-y-3 flex-1">{children}</div>
    </div>
  );
}

function TicketCard({ ticket, onMove, onSelect }) {
  return (
    <div className="bg-[#0B192C] border border-slate-800 p-3.5 rounded-xl space-y-2 hover:border-[#00D8F6]/50 transition cursor-pointer shadow-md">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-[#00D8F6]">{ticket.id} • {ticket.unitId}</span>
        <span className={`text-[9px] px-2 py-0.5 rounded font-bold ${
          ticket.priority === 'عاجل' ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-800 text-slate-300'
        }`}>
          {ticket.priority}
        </span>
      </div>
      <p className="text-xs font-bold text-slate-100">{ticket.title}</p>
      <p className="text-[10px] text-slate-400">الفني المسؤول: {ticket.assignedTo}</p>
      
      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
        <span className="text-slate-400">{ticket.date}</span>
        <div className="flex items-center gap-1">
          {ticket.status !== 'new' && (
            <button onClick={(e) => { e.stopPropagation(); onMove('new'); }} className="text-slate-400 hover:text-white px-1">جديد</button>
          )}
          {ticket.status !== 'in_progress' && (
            <button onClick={(e) => { e.stopPropagation(); onMove('in_progress'); }} className="text-amber-400 hover:underline px-1">تنفيذ</button>
          )}
          {ticket.status !== 'resolved' && (
            <button onClick={(e) => { e.stopPropagation(); onMove('resolved'); }} className="text-emerald-400 hover:underline px-1">تم الحل</button>
          )}
        </div>
      </div>
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0B192C] border border-slate-800 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl animate-scaleUp">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#070F1B]">
          <h3 className="font-bold text-slate-100 text-sm">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
