'use client';

import React, { useState } from 'react';
import { 
  Building2, 
  Users, 
  CreditCard, 
  Wrench, 
  Bell, 
  Plus, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  TrendingUp, 
  FileText, 
  Printer, 
  ChevronLeft,
  LayoutDashboard,
  ShieldCheck,
  Building,
  Menu,
  X
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Mock Data
  const stats = [
    { title: 'إجمالي الوحدات', value: '120', subText: '100 مشغولة | 20 شاغرة', icon: Building, color: 'from-blue-600 to-cyan-500' },
    { title: 'نسبة التحصيل', value: '85%', subText: '15% متأخرات هذا الشهر', icon: TrendingUp, color: 'from-emerald-500 to-teal-600' },
    { title: 'طلب الصيانة', value: '4', subText: 'طلبات قيد المعالجة', icon: Wrench, color: 'from-amber-500 to-orange-600' },
    { title: 'عقود تنتهي قريباً', value: '3', subText: 'خلال 30 يوماً القادمة', icon: Clock, color: 'from-rose-500 to-red-600' }
  ];

  const tenants = [
    { id: 'U-101', name: 'سوبرماركت الخير', type: 'تجاري', rent: '25,000 ج.م', status: 'نشط', expiry: '2027-05-15' },
    { id: 'U-102', name: 'صيدلية مصر', type: 'تجاري', rent: '18,000 ج.م', status: 'نشط', expiry: '2026-12-01' },
    { id: 'U-201', name: 'شركة النور للمقاولات', type: 'إداري', rent: '12,000 ج.م', status: 'ينتهي قريباً', expiry: '2026-12-10' },
    { id: 'U-202', name: 'مكتب الهدى للاستشارات', type: 'إداري', rent: '10,000 ج.م', status: 'نشط', expiry: '2028-01-20' },
  ];

  const tickets = [
    { id: 'TK-101', unit: 'U-101', issue: 'عطل في التكييف المركزي', status: 'New', priority: 'مرتفع', date: '2026-11-26' },
    { id: 'TK-102', unit: 'U-201', issue: 'تسريب مياه بالحمام الرئيسي', status: 'In Progress', priority: 'متوسط', date: '2026-11-25' },
    { id: 'TK-103', unit: 'U-102', issue: 'صيانة إضاءة الممر الإداري', status: 'Resolved', priority: 'منخفض', date: '2026-11-24' },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col md:flex-row font-sans text-right" dir="rtl">
      
      {/* Mobile Menu Button */}
      <div className="md:hidden flex items-center justify-between p-4 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center space-x-2 space-x-reverse">
          <ShieldCheck className="w-8 h-8 text-cyan-400" />
          <span className="font-bold text-xl tracking-wide text-white">Valict <span className="text-cyan-400 text-sm">Mall Vision</span></span>
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 text-slate-300 hover:text-white">
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`${sidebarOpen ? 'block' : 'hidden'} md:block w-full md:w-64 bg-slate-800 border-l border-slate-700/60 p-6 flex flex-col justify-between shrink-0`}>
        <div>
          {/* Logo Header */}
          <div className="hidden md:flex items-center space-x-3 space-x-reverse mb-10">
            <div className="p-2 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-lg shadow-lg shadow-cyan-500/20">
              <ShieldCheck className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="font-extrabold text-xl tracking-wider text-white">VALICT</h1>
              <p className="text-xs text-cyan-400 font-medium">Validate Your Vision</p>
            </div>
          </div>

          <div className="mb-6 px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-700/40">
            <p className="text-xs text-slate-400">المشروع الحالي:</p>
            <p className="text-sm font-semibold text-cyan-300">مول الفيوم الجديدة</p>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-2">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center space-x-3 space-x-reverse px-4 py-3 rounded-xl transition-all duration-200 font-medium ${activeTab === 'overview' ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/25' : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'}`}
            >
              <LayoutDashboard size={20} />
              <span>لوحة التحكم</span>
            </button>

            <button 
              onClick={() => setActiveTab('tenants')}
              className={`w-full flex items-center space-x-3 space-x-reverse px-4 py-3 rounded-xl transition-all duration-200 font-medium ${activeTab === 'tenants' ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/25' : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'}`}
            >
              <Users size={20} />
              <span>الوحدات والعقود</span>
            </button>

            <button 
              onClick={() => setActiveTab('billing')}
              className={`w-full flex items-center space-x-3 space-x-reverse px-4 py-3 rounded-xl transition-all duration-200 font-medium ${activeTab === 'billing' ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/25' : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'}`}
            >
              <CreditCard size={20} />
              <span>المالية والتحصيل</span>
            </button>

            <button 
              onClick={() => setActiveTab('maintenance')}
              className={`w-full flex items-center space-x-3 space-x-reverse px-4 py-3 rounded-xl transition-all duration-200 font-medium ${activeTab === 'maintenance' ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/25' : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'}`}
            >
              <Wrench size={20} />
              <span>مركز الصيانة</span>
            </button>
          </nav>
        </div>

        {/* User Footer */}
        <div className="pt-6 border-t border-slate-700/60 flex items-center space-x-3 space-x-reverse">
          <div className="w-10 h-10 rounded-full bg-cyan-900/50 border border-cyan-500/40 flex items-center justify-center font-bold text-cyan-300">
            إم
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-white truncate">إدارة المول</p>
            <p className="text-xs text-slate-400 truncate">admin@mallvision.com</p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        
        {/* Top Header Bar */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">نظام إدارة وتشعيل المول الموحد</h2>
            <p className="text-slate-400 text-sm mt-1">نظام إدارة المرافق والعمليات المطور بواسطة Valict</p>
          </div>

          <div className="flex items-center space-x-3 space-x-reverse w-full sm:w-auto justify-end">
            <button className="p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-300 hover:text-white relative">
              <Bell size={20} />
              <span className="absolute top-1 left-1 w-2.5 h-2.5 bg-cyan-400 rounded-full animate-ping"></span>
              <span className="absolute top-1 left-1 w-2.5 h-2.5 bg-cyan-500 rounded-full"></span>
            </button>
            <button className="flex items-center space-x-2 space-x-reverse px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold rounded-xl shadow-md transition">
              <Plus size={18} />
              <span>إضافة وحدة جديدة</span>
            </button>
          </div>
        </header>

        {/* Dynamic Tab Contents */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {stats.map((stat, idx) => {
                const IconComponent = stat.icon;
                return (
                  <div key={idx} className="bg-slate-800/80 border border-slate-700/50 p-5 rounded-2xl relative overflow-hidden group hover:border-slate-600 transition">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-400 text-sm font-medium">{stat.title}</p>
                        <h3 className="text-3xl font-extrabold text-white mt-2">{stat.value}</h3>
                        <p className="text-xs text-slate-400 mt-2">{stat.subText}</p>
                      </div>
                      <div className={`p-3.5 rounded-xl bg-gradient-to-tr ${stat.color} text-white shadow-lg`}>
                        <IconComponent size={24} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Content Split Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Recent Tenants Table Overview */}
              <div className="lg:col-span-2 bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Building2 className="text-cyan-400" size={20} />
                    <span>أحدث عقود الوحدات</span>
                  </h3>
                  <button onClick={() => setActiveTab('tenants')} className="text-sm text-cyan-400 hover:underline flex items-center gap-1">
                    <span>عرض الكل</span>
                    <ChevronLeft size={16} />
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-right border-collapse">
                    <thead>
                      <tr className="border-b border-slate-700/60 text-slate-400 text-sm">
                        <th className="py-3 px-4 font-semibold">رقم الوحدة</th>
                        <th className="py-3 px-4 font-semibold">المستأجر</th>
                        <th className="py-3 px-4 font-semibold">النشاط</th>
                        <th className="py-3 px-4 font-semibold">الإيجار</th>
                        <th className="py-3 px-4 font-semibold">الحالة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/40 text-sm">
                      {tenants.map((t) => (
                        <tr key={t.id} className="hover:bg-slate-700/20 transition">
                          <td className="py-3.5 px-4 font-mono font-bold text-cyan-400">{t.id}</td>
                          <td className="py-3.5 px-4 font-medium text-white">{t.name}</td>
                          <td className="py-3.5 px-4 text-slate-300">{t.type}</td>
                          <td className="py-3.5 px-4 font-semibold text-slate-200">{t.rent}</td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${t.status === 'نشط' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                              {t.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Maintenance Overview Stack */}
              <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Wrench className="text-cyan-400" size={20} />
                    <span>تذاكر الصيانة العاجلة</span>
                  </h3>
                  <button onClick={() => setActiveTab('maintenance')} className="text-sm text-cyan-400 hover:underline">المزيد</button>
                </div>
                <div className="space-y-4">
                  {tickets.map((tk) => (
                    <div key={tk.id} className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/40 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-cyan-400">{tk.id} - {tk.unit}</span>
                        <span className={`text-xs px-2 py-0.5 rounded font-medium ${tk.status === 'New' ? 'bg-amber-500/20 text-amber-300' : tk.status === 'In Progress' ? 'bg-blue-500/20 text-blue-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                          {tk.status === 'New' ? 'جديد' : tk.status === 'In Progress' ? 'قيد التنفيذ' : 'تم الحل'}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-slate-200">{tk.issue}</p>
                      <span className="text-xs text-slate-400">{tk.date}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Tab 2: Tenants Page */}
        {activeTab === 'tenants' && (
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
              <h3 className="text-xl font-bold text-white">سجل الوحدات والعقود الموثقة</h3>
              <div className="relative">
                <Search className="absolute right-3 top-3 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="بحث عن وحدة أو مستأجر..."
                  className="w-full sm:w-64 pr-10 pl-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm focus:outline-none focus:border-cyan-400 text-white placeholder-slate-500"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="border-b border-slate-700/60 text-slate-400 text-sm">
                    <th className="py-3 px-4 font-semibold">الوحدة</th>
                    <th className="py-3 px-4 font-semibold">المستأجر</th>
                    <th className="py-3 px-4 font-semibold">نوع النشاط</th>
                    <th className="py-3 px-4 font-semibold">القيمة الشهرية</th>
                    <th className="py-3 px-4 font-semibold">تاريخ الانتهاء</th>
                    <th className="py-3 px-4 font-semibold">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/40 text-sm">
                  {tenants.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-700/20 transition">
                      <td className="py-4 px-4 font-mono font-bold text-cyan-400">{t.id}</td>
                      <td className="py-4 px-4 font-medium text-white">{t.name}</td>
                      <td className="py-4 px-4 text-slate-300">{t.type}</td>
                      <td className="py-4 px-4 font-semibold text-slate-200">{t.rent}</td>
                      <td className="py-4 px-4 text-slate-400 font-mono">{t.expiry}</td>
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${t.status === 'نشط' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Billing & Invoices */}
        {activeTab === 'billing' && (
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-white">إدارة الفواتير والتحصيل</h3>
                <p className="text-slate-400 text-sm">شهر نوفمبر 2026</p>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl text-sm font-semibold transition">
                <Printer size={16} />
                <span>طباعة تقرير التحصيل</span>
              </button>
            </div>
            <div className="space-y-4">
              {tenants.map((t, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center space-x-4 space-x-reverse">
                    <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl">
                      <FileText size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-white">{t.name} ({t.id})</p>
                      <p className="text-xs text-slate-400">فاتورة إيجار وصيانة شائعة</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end space-x-6 space-x-reverse">
                    <span className="font-extrabold text-white text-lg">{t.rent}</span>
                    <button className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-lg text-xs font-bold border border-emerald-500/30 transition">
                      تحصيل الآن
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Maintenance Center */}
        {activeTab === 'maintenance' && (
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-6">نظام متابعة الصيانة للبلاغات</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* New Column */}
              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700/40">
                <h4 className="font-bold text-amber-400 text-sm mb-4 flex items-center justify-between">
                  <span>جديد (New)</span>
                  <span className="bg-amber-400/10 px-2 py-0.5 rounded text-xs">1</span>
                </h4>
                <div className="p-4 rounded-xl bg-slate-800 border border-slate-700 text-sm space-y-2">
                  <span className="text-xs font-mono text-cyan-400">U-101</span>
                  <p className="font-semibold text-white">عطل في التكييف المركزي</p>
                  <p className="text-xs text-slate-400">الأولوية: مرتفع</p>
                </div>
              </div>

              {/* In Progress Column */}
              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700/40">
                <h4 className="font-bold text-blue-400 text-sm mb-4 flex items-center justify-between">
                  <span>قيد التنفيذ (In Progress)</span>
                  <span className="bg-blue-400/10 px-2 py-0.5 rounded text-xs">1</span>
                </h4>
                <div className="p-4 rounded-xl bg-slate-800 border border-slate-700 text-sm space-y-2">
                  <span className="text-xs font-mono text-cyan-400">U-201</span>
                  <p className="font-semibold text-white">تسريب مياه بالحمام الرئيسي</p>
                  <p className="text-xs text-slate-400">الأولوية: متوسط</p>
                </div>
              </div>

              {/* Resolved Column */}
              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700/40">
                <h4 className="font-bold text-emerald-400 text-sm mb-4 flex items-center justify-between">
                  <span>تم الحل (Resolved)</span>
                  <span className="bg-emerald-400/10 px-2 py-0.5 rounded text-xs">1</span>
                </h4>
                <div className="p-4 rounded-xl bg-slate-800 border border-slate-700 text-sm space-y-2 opacity-75">
                  <span className="text-xs font-mono text-cyan-400">U-102</span>
                  <p className="font-semibold text-white">صيانة إضاءة الممر الإداري</p>
                  <p className="text-xs text-slate-400">مكتمِلة</p>
                </div>
              </div>

            </div>
          </div>
        )}

      </main>
    </div>
  );
}
