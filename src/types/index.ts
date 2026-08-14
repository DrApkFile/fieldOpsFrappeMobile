// ─── Route Names ──────────────────────────────────────────────────────────────
export type RouteName =
  | 'splash'
  | 'onboarding'
  | 'login'
  | 'forgot'
  | 'campaignSelect'
  | 'clockIn'
  | 'home'
  | 'dashboard'
  | 'campaigns'
  | 'campaignDetail'
  | 'attendance'
  | 'leads'
  | 'leadForm'
  | 'leadDetail'
  | 'leadUpdate'
  | 'leadSuccess'
  | 'pipelineOverview'
  | 'inventory'
  | 'reconcile'
  | 'productCatalog'
  | 'productDetail'
  | 'notifications'
  | 'notificationsEmpty'
  | 'profile'
  | 'draftsList'
  | 'eodSummary'
  | 'ordersList'
  | 'transactionDetail'
  // Outlet workspace
  | 'outlets'
  | 'outletDetail'
  | 'addOutlet'
  | 'editOutlet'
  | 'outletActivity'
  | 'customerSelect'
  | 'saleReceipt'
  | 'outletSaleSuccess'
  | 'orderSuccess'
  | 'outletSurveySuccess'
  | 'surveySuccess';

// ─── User Profile ──────────────────────────────────────────────────────────────
export interface UserProfile {
  name: string;
  email: string;
  initials: string;
  role: string;
  territory: string;
  rank: number;
  totalAgents: number;
  profileCompletion: number;
}

// ─── Campaign ─────────────────────────────────────────────────────────────────
export type CampaignCategory = 'Sales' | 'Orders' | 'Survey' | 'Merchandising' | 'Mixed';

export interface Campaign {
  id: string;
  name: string;
  type: string;
  category: CampaignCategory;
  progress: number;
  target: string;
  color: string;
  beat: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  modules?: CampaignModule[];
  surveys?: CampaignSurveyConfig[];
  ctaType?: 'leads' | 'outlets';
  dashboard?: CampaignDashboardConfig;
}

export type DashboardWidgetId =
  // CRM / Pipeline
  | 'total-leads' | 'new-leads' | 'conversion-rate' | 'pipeline-value' | 'leads-by-stage' | 'agent-performance'
  // Sales / Non-pipeline
  | 'outlets-visited' | 'orders-created' | 'sales-value' | 'products-sold' | 'target-achievement'
  // Merchandising
  | 'outlet-visits' | 'completed-audits' | 'compliance' | 'shelf-availability' | 'photo-captures' | 'pending-activities';

export interface CampaignDashboardConfig {
  template?: 'default' | 'merchandising';
  widgets: DashboardWidgetId[];
}

export type CampaignModule = 'sales' | 'orders' | 'surveys' | 'merchandising' | 'stock' | 'photo';

export interface CampaignSurveyConfig {
  id: string;
  name: string;
  module: 'surveys' | 'merchandising';
  questions: DynamicSurveyQuestion[];
}

// ─── Lead ─────────────────────────────────────────────────────────────────────
export interface Lead {
  id: string;
  name: string;
  company: string;
  phone: string;
  email?: string;
  stage: 'New' | 'Contacted' | 'Qualified' | 'Proposal' | 'Closed';
  score: number;
  next: string;
  nextActionDate?: string; // ISO yyyy-mm-dd — drives Overdue Follow-ups + Day/Route filtering
  value: string;
  source?: string;
  pipeline?: string;
  notes?: string;
  gps?: string;
}

// ─── Product / Inventory ──────────────────────────────────────────────────────
export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  category?: string;
  warehouse: string;
  unitsPerCase: number;
  imageUrl?: string;
  description?: string;
}

// ─── Stock Movements ──────────────────────────────────────────────────────────
export type StockMovementType = 'sale' | 'adjustment' | 'reconciliation';

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: StockMovementType;
  qtyChange: number; // negative for decreases
  reason?: string;
  outletId?: string;
  outletName?: string;
  timestamp: string;
}

// ─── Notification ─────────────────────────────────────────────────────────────
export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  time: string;
  type: 'assignment' | 'geofence' | 'stock' | 'eod' | 'system';
  color: string;
  read: boolean;
}

// ─── Survey ───────────────────────────────────────────────────────────────────
export type QuestionType = 'choice' | 'multi' | 'select' | 'rating' | 'text' | 'number' | 'photo' | 'gps';

export interface DynamicSurveyQuestion {
  id: string;
  type: QuestionType;
  question: string;
  required?: boolean;
  options?: string[];
}

// ─── Outlet ───────────────────────────────────────────────────────────────────
export type OutletStatus = 'pending' | 'visited' | 'skipped';

export interface Outlet {
  id: string;
  name: string;
  type: string;
  area: string;
  address: string;
  phone: string;
  ownerName?: string;
  ownerPhone?: string;
  isOpen: boolean;
  distance: string;
  notes?: string;
  status: OutletStatus;
  gps?: string;
  photoUri?: string;
  campaignId: string;
}

// ─── Customer ─────────────────────────────────────────────────────────────────
export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  company?: string;
}

// ─── Outlet Activities ────────────────────────────────────────────────────────
export type PromoDiscount = { label: string; pct: number };

export interface OutletSale {
  id: string;
  outletId: string;
  campaignId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
  customerId: string;
  customerName: string;
  promoLabel?: string;
  timestamp: string;
  invoiceRef: string;
}

export interface OutletOrder {
  id: string;
  outletId: string;
  campaignId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
  customerId: string;
  customerName: string;
  status: 'Pending' | 'Confirmed' | 'Delivered';
  timestamp: string;
  orderRef: string;
}

export interface SurveyAnswer {
  questionId: string;
  question: string;
  answer: string | string[] | number | null;
}

export interface OutletSurvey {
  id: string;
  outletId: string;
  campaignId: string;
  surveyConfigId?: string;
  surveyName?: string;
  answers: SurveyAnswer[];
  isDraft: boolean;
  timestamp: string;
}

export interface SkipRecord {
  id: string;
  outletId: string;
  reason: string;
  note?: string;
  gps: string;
  timestamp: string;
}

// ─── Attendance ───────────────────────────────────────────────────────────────
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'half-day';

export interface AttendanceRecord {
  id: string;
  date: string; // ISO yyyy-mm-dd
  status: AttendanceStatus;
  clockInTime?: string; // e.g. "9:05 AM"
  clockOutTime?: string; // e.g. "1:30 PM" — before 2 PM implies half-day
}

// ─── Cart / Draft ─────────────────────────────────────────────────────────────
export interface CartLine {
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  discount: number;
  promoLabel?: string;
}

export interface Draft {
  id: string;
  mode: 'sale' | 'order';
  outletId: string;
  outletName: string;
  customerId?: string;
  customerName?: string;
  cart: CartLine[];
  promoLabel?: string;
  updatedAt: string;
  pendingSync: true;
}

// ─── Photo Capture ────────────────────────────────────────────────────────────
export interface OutletPhotoCapture {
  id: string;
  outletId: string;
  campaignId: string;
  photoUri: string;
  timestamp: string;
}

// ─── Day / Route Assignment ───────────────────────────────────────────────────
export interface RouteAssignment {
  date: string; // ISO yyyy-mm-dd
  routeName: string;
  outletIds: string[];
  leadIds: string[];
}

// ─── Point of Interest (legacy) ───────────────────────────────────────────────
export interface PointOfInterest {
  id: string;
  name: string;
  distance: string;
  address: string;
  status: string;
}
