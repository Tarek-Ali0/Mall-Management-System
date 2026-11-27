export const DEFAULT_MALL_CONFIG = {
  mallName: "مول الماسة 1",
  floors: [
    { id: "ground", code: "G", name: "الدور الأرضي", category: "تجاري (محلات)", unitsCount: 40, notes: "محلات تجارية رئيسية" },
    { id: "duplex", code: "DX", name: "دور الدوبليكس", category: "دوبليكس تجاري", unitsCount: 20, notes: "ملحق علوي لبعض الوحدات التجارية بالدور الأرضي" },
    { id: "first", code: "F1", name: "الدور الأول العلوي", category: "إداري", unitsCount: 30, notes: "مكاتب وخدمات" },
    { id: "second", code: "F2", name: "الدور الثاني", category: "إداري", unitsCount: 30, notes: "وحدات إدارية وخدمات" },
  ],
};

export const ALL_PERMISSION_KEYS = [
  { key: "canViewBilling", label: "عرض التحصيل والفواتير" },
  { key: "canManageBilling", label: "إضافة وتحصيل الفواتير" },
  { key: "canManageUnits", label: "إضافة وتعديل الوحدات والملاك" },
  { key: "canManageTickets", label: "إدارة بلاغات الصيانة" },
  { key: "canManageAnnouncements", label: "إرسال وإدارة التنبيهات" },
  { key: "canManageSettings", label: "تعديل إعدادات المول والأدوار" },
  { key: "canDelete", label: "حذف السجلات" },
  { key: "canManageUsers", label: "إدارة المستخدمين والصلاحيات" },
];

export const INITIAL_USERS = [
  {
    id: "USR-ADMIN",
    name: "مدير النظام الرئيسي",
    roleTitle: "إدارة المول",
    badge: "Admin Access",
    password: "admin",
    permissions: Object.fromEntries(ALL_PERMISSION_KEYS.map((p) => [p.key, true])),
  },
];

export const mapUserToDb = (u) => ({
  id: u.id,
  name: u.name,
  role_title: u.roleTitle,
  badge: u.badge,
  password: u.password,
  permissions: u.permissions,
});

export const mapUserFromDb = (row) => ({
  id: row.id,
  name: row.name,
  roleTitle: row.role_title || "مستخدم",
  badge: row.badge || "Staff",
  password: row.password || "1234",
  permissions: Object.fromEntries(ALL_PERMISSION_KEYS.map((p) => [p.key, Boolean(row.permissions?.[p.key])])),
});

export const mapUnitToDb = (u) => ({
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

export const mapUnitFromDb = (row) => {
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

export const mapInvoiceToDb = (inv) => ({
  id: inv.id,
  unit_id: inv.unitId,
  tenant: inv.tenant,
  amount: Number(inv.amount) || 0,
  type: inv.type,
  due_date: inv.dueDate,
  status: inv.status,
  payment_date: inv.paymentDate || "-",
});

export const mapInvoiceFromDb = (row) => ({
  id: row.id,
  unitId: row.unit_id,
  tenant: row.tenant,
  amount: Number(row.amount) || 0,
  type: row.type,
  dueDate: row.due_date,
  status: row.status,
  paymentDate: row.payment_date || "-",
});

export const mapTicketToDb = (t) => ({
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

export const mapTicketFromDb = (row) => ({
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
