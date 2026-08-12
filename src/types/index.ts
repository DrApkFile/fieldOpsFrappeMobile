// ─── Route Names ──────────────────────────────────────────────────────────────
export type RouteName =
  | 'splash'
  | 'onboarding'
  | 'login'
  | 'forgot'
  | 'campaignSelect'
  | 'clockIn'
  | 'home'
  | 'campaigns'
  | 'campaignDetail'
  | 'attendance'
  | 'beat'
  | 'surveys'
  | 'surveyForm'
  | 'surveySuccess'
  | 'leads'
  | 'leadForm'
  | 'leadDetail'
  | 'leadUpdate'
  | 'leadSuccess'
  | 'sales'
  | 'saleSuccess'
  | 'inventory'
  | 'reconcile'
  | 'inventorySuccess'
  | 'notifications'
  | 'notificationsEmpty'
  | 'profile'
  | 'sync'
  | 'eodSummary'
  // Outlet workspace
  | 'outlets'
  | 'outletDetail'
  | 'addOutlet'
  | 'editOutlet'
  | 'newSale'
  | 'customerSelect'
  | 'saleReceipt'
  | 'outletSaleSuccess'
  | 'newOrder'
  | 'orderReview'
  | 'orderSuccess'
  | 'newSurvey'
  | 'outletSurveySuccess';

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
export interface Campaign {
  id: string;
  name: string;
  type: string;
  progress: number;
  target: string;
  color: string;
  beat: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  modules?: CampaignModule[];
  ctaType?: 'leads' | 'outlets';
}

export type CampaignModule = 'sales' | 'orders' | 'surveys' | 'merchandising';

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
export interface DynamicSurveyQuestion {
  id: string;
  type: 'choice' | 'multi' | 'rating' | 'text' | 'number' | 'photo' | 'gps';
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

// ─── Point of Interest (legacy) ───────────────────────────────────────────────
export interface PointOfInterest {
  id: string;
  name: string;
  distance: string;
  address: string;
  status: string;
}
