import {
  Campaign, Lead, NotificationItem, Product, UserProfile,
  DynamicSurveyQuestion, PointOfInterest, Outlet, Customer,
  CampaignModule,
} from '../types';

// ─── User ─────────────────────────────────────────────────────────────────────
export const mockUser: UserProfile = {
  name: 'Amara Okafor',
  email: 'amara.okafor@fieldops.io',
  initials: 'AO',
  role: 'Field Lead Agent',
  territory: 'Lekki Phase 1',
  rank: 4,
  totalAgents: 38,
  profileCompletion: 75,
};

// ─── Campaigns ────────────────────────────────────────────────────────────────
export const mockCampaigns: Campaign[] = [
  {
    id: 'c1',
    name: 'Renmoney Personal Loan Promo',
    type: 'Sales Drive',
    progress: 68,
    target: '₦480k / ₦700k',
    color: '#6D5BD0',
    beat: 'Lekki Phase 1',
    description: 'Drive key loan product placement and customer lead conversions.',
    startDate: '01 Aug',
    endDate: '31 Aug',
    modules: ['sales', 'surveys'],
    ctaType: 'leads',
  },
  {
    id: 'c2',
    name: 'FreshMart Retail Drive',
    type: 'Sales Drive',
    progress: 42,
    target: '84 / 200 units',
    color: '#1A9B8F',
    beat: 'Victoria Island',
    description: 'Drive retail product distribution across key supermarket stockists.',
    startDate: '10 Aug',
    endDate: '25 Aug',
    modules: ['sales', 'orders', 'merchandising'],
    ctaType: 'outlets',
  },
  {
    id: 'c3',
    name: 'Customer Pulse Survey Q3',
    type: 'Survey',
    progress: 25,
    target: '15 / 60 surveys',
    color: '#D4890A',
    beat: 'Lekki Phase 1',
    description: 'Gather field sentiment and shelf positioning analytics.',
    startDate: '05 Aug',
    endDate: '30 Aug',
    modules: ['surveys'],
    ctaType: 'outlets',
  },
];

// ─── Leads ────────────────────────────────────────────────────────────────────
export const mockLeads: Lead[] = [
  {
    id: 'l1',
    name: 'Mariam Bello',
    company: "Mariam's Pantry",
    phone: '+234 803 555 0192',
    email: 'mariam@pantry.ng',
    stage: 'Qualified',
    score: 82,
    next: 'Follow up tomorrow at 10:00 AM',
    value: '₦180,000',
    source: 'Store visit',
    pipeline: 'Retail Pipeline',
    notes: 'Interested in stocking 10 cases of FieldFresh 1L.',
  },
  {
    id: 'l2',
    name: 'Chinedu Okeke',
    company: 'Cedar Stores',
    phone: '+234 806 222 7431',
    email: 'chinedu@cedarstores.com',
    stage: 'Contacted',
    score: 64,
    next: 'Call today at 2:00 PM',
    value: '₦95,000',
    source: 'Referral',
    pipeline: 'Retail Pipeline',
    notes: 'Requested sample kit before placing bulk order.',
  },
  {
    id: 'l3',
    name: 'Ayo Martins',
    company: 'Daily Basket',
    phone: '+234 809 111 5512',
    stage: 'New',
    score: 45,
    next: 'Visit scheduled for Thursday',
    value: '₦65,000',
    source: 'Store visit',
    pipeline: 'Wholesale Pipeline',
    notes: 'New outlet opened last week.',
  },
];

// ─── Products ─────────────────────────────────────────────────────────────────
export const mockProducts: Product[] = [
  { id: 'p1', name: 'FieldFresh 1L',       sku: 'FF-1000', price: 1450, stock: 28, category: 'Beverage' },
  { id: 'p2', name: 'FieldFresh 500ml',    sku: 'FF-500',  price:  850, stock: 42, category: 'Beverage' },
  { id: 'p3', name: 'Active Energy 330ml', sku: 'AE-330',  price: 1100, stock: 14, category: 'Energy'   },
  { id: 'p4', name: 'Pure Hydrate 750ml',  sku: 'PH-750',  price:  950, stock: 35, category: 'Water'    },
  { id: 'p5', name: 'FieldFresh 2L',       sku: 'FF-2000', price: 2200, stock:  0, category: 'Beverage' },
];

// ─── Customers ────────────────────────────────────────────────────────────────
export const mockCustomers: Customer[] = [
  { id: 'cu1', name: 'Mariam Bello',   phone: '+234 803 555 0192', email: 'mariam@pantry.ng',         company: "Mariam's Pantry" },
  { id: 'cu2', name: 'Chinedu Okeke',  phone: '+234 806 222 7431', email: 'chinedu@cedarstores.com',  company: 'Cedar Stores'    },
  { id: 'cu3', name: 'Ayo Martins',    phone: '+234 809 111 5512',                                    company: 'Daily Basket'    },
  { id: 'cu4', name: 'Funke Adeyemi',  phone: '+234 811 300 5600', email: 'funke@greenmart.ng',       company: 'GreenMart'       },
  { id: 'cu5', name: 'Ibrahim Salisu', phone: '+234 802 774 8821',                                    company: 'Salisu Stores'   },
  { id: 'cu6', name: 'Ngozi Eze',      phone: '+234 706 888 3312', email: 'ngozi@freshbench.ng',      company: 'FreshBench'      },
];

// ─── Outlets ──────────────────────────────────────────────────────────────────
export const mockOutlets: Outlet[] = [
  {
    id: 'o1',
    name: 'Corner Store',
    type: 'Supermarket',
    area: 'Ikoyi',
    address: '14 Bourdillon Road, Ikoyi, Lagos',
    phone: '+234 801 000 0000',
    ownerName: 'Mr. Emeka Obi',
    ownerPhone: '+234 802 000 0000',
    isOpen: false,
    distance: '2.4 km',
    notes: 'Manager usually arrives at 10 AM. Back entrance on weekdays.',
    status: 'pending',
    gps: '6.4550, 3.4320',
    campaignId: 'c2',
  },
  {
    id: 'o2',
    name: 'Freshline Mini',
    type: 'Supermarket',
    area: 'Victoria Island',
    address: '3 Akin Adesola St, Victoria Island',
    phone: '+234 801 000 0001',
    ownerName: 'Mrs. Chika Eze',
    ownerPhone: '+234 803 000 0001',
    isOpen: true,
    distance: '0.8 km',
    notes: 'Products are usually stocked near the refrigerators section.',
    status: 'pending',
    gps: '6.4281, 3.4219',
    campaignId: 'c2',
  },
  {
    id: 'o3',
    name: 'MaxiMart',
    type: 'Supermarket',
    area: 'Lekki Phase 1',
    address: 'Admiralty Way, Lekki Phase 1',
    phone: '+234 801 000 0002',
    ownerName: 'Mr. Bayo Adewale',
    ownerPhone: '+234 804 000 0002',
    isOpen: true,
    distance: '0.4 km',
    notes: '',
    status: 'pending',
    gps: '6.4474, 3.4723',
    campaignId: 'c2',
  },
  {
    id: 'o4',
    name: 'QuickShop Express',
    type: 'Supermarket',
    area: 'Oniru',
    address: '12 Marine Rd, Oniru, Lekki',
    phone: '+234 801 000 0003',
    ownerName: 'Ms. Aisha Bello',
    ownerPhone: '+234 805 000 0003',
    isOpen: true,
    distance: '1.1 km',
    notes: 'New outlet, first time visit.',
    status: 'pending',
    gps: '6.4442, 3.4501',
    campaignId: 'c2',
  },
];

// ─── Notifications ────────────────────────────────────────────────────────────
export const mockNotifications: NotificationItem[] = [
  {
    id: 'n1',
    title: 'New Assignment',
    body: 'Renmoney Personal Loan Promo campaign has been assigned to your territory.',
    time: '10m',
    type: 'assignment',
    color: '#6D5BD0',
    read: false,
  },
  {
    id: 'n2',
    title: 'Low Stock Alert',
    body: 'Active Energy 330ml inventory is below your 15 unit threshold.',
    time: '1h',
    type: 'stock',
    color: '#D4890A',
    read: false,
  },
  {
    id: 'n3',
    title: 'Geofence Compliance',
    body: 'You successfully entered assigned territory: Lekki Phase 1.',
    time: '2h',
    type: 'geofence',
    color: '#1A9E60',
    read: true,
  },
  {
    id: 'n4',
    title: 'EOD Summary Reminder',
    body: 'Please complete your daily stock & shift summary by 6:00 PM.',
    time: '4h',
    type: 'eod',
    color: '#1A9B8F',
    read: true,
  },
];

// ─── Survey Questions ─────────────────────────────────────────────────────────
export const mockSurveyQuestions: DynamicSurveyQuestion[] = [
  {
    id: 'q1',
    type: 'choice',
    required: true,
    question: 'How satisfied is the store manager with current product delivery speed?',
    options: ['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied'],
  },
  {
    id: 'q2',
    type: 'rating',
    required: true,
    question: 'Rate the eye-level shelf visibility of FieldFresh 1L (1 to 5 stars)',
  },
  {
    id: 'q3',
    type: 'text',
    required: false,
    question: 'What primary competitor products are positioned next to our stock?',
  },
  {
    id: 'q4',
    type: 'photo',
    required: true,
    question: 'Capture a clear front photo of the main shelf display',
  },
  {
    id: 'q5',
    type: 'number',
    required: false,
    question: 'How many facing units of FieldFresh 1L are currently on the shelf?',
  },
];

// ─── Promotions ───────────────────────────────────────────────────────────────
export const mockPromos = [
  { label: 'None',         pct: 0  },
  { label: '5% Intro',     pct: 5  },
  { label: '10% Bulk',     pct: 10 },
  { label: '15% Launch',   pct: 15 },
];

// ─── Points of Interest (legacy) ──────────────────────────────────────────────
export const mockPointsOfInterest: PointOfInterest[] = [
  { id: 'poi1', name: 'FreshMart Lekki', distance: '0.4 km', address: 'Admiralty Way, Lekki Phase 1', status: 'Visited' },
  { id: 'poi2', name: 'Daily Basket',    distance: '0.8 km', address: 'Freedom Way, Lekki',            status: 'Pending' },
  { id: 'poi3', name: 'Cedar Stores',    distance: '1.2 km', address: 'Bisola Durosinmi Etti Dr',       status: 'Pending' },
];

export const mockDelay = (ms = 500) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export const demoAuthService = async (email: string) => {
  await mockDelay(600);
  return { success: true, email };
};

export const submitMockData = async (data?: any) => {
  await mockDelay(500);
  return { success: true, timestamp: new Date().toISOString() };
};

export const generateId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

export const generateInvoiceRef = () =>
  `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 90000 + 10000)}`;
