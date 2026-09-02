import * as FileSystem from 'expo-file-system/legacy';
import {
  getBaseUrl,
  getAccessToken,
  getTenantId,
  setAccessToken,
  setTenantId,
  clearAccessToken,
  setUserInfo,
  getUserInfo,
  clearUserInfo,
} from './apiConfig';
import { Campaign, CampaignCategory, CampaignModule, UserProfile, Lead, LeadStage, Outlet, OutletStatus } from '../types';

/** Thrown by authFetch when the stored session is missing or the server rejects the token (401). */
export class AuthError extends Error {}

/** Thrown by authFetch only when the device couldn't reach the server at all (no response received) — distinct from a request that reached the server and was rejected, which should never be treated as "offline". */
export class NetworkError extends Error {}

export interface LoginResult {
  success: boolean;
  message?: string;
  accessToken?: string;
  user?: UserProfile;
}

/** Attaches the stored bearer token and tenant base URL to a request against a protected `/agent/*` or `/api/*` route. */
const authFetch = async (path: string, options: RequestInit = {}): Promise<any> => {
  const [token, tenantId] = await Promise.all([getAccessToken(), getTenantId()]);
  if (!token || !tenantId) {
    throw new AuthError('Your session has expired. Please sign in again.');
  }

  const url = `${getBaseUrl(tenantId)}${path}`;
  const method = options.method || 'GET';
  console.log('[FieldOps API]', method, url, options.body instanceof FormData ? '(form-data)' : options.body ?? '');

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    });
  } catch (err: any) {
    console.log('[FieldOps API]', method, url, '-> NETWORK ERROR', err?.message || err);
    throw new NetworkError('Could not reach the server. Check your connection and try again.');
  }

  const rawText = await response.text();
  console.log('[FieldOps API]', method, url, '->', response.status, rawText);

  let data: any;
  try {
    data = JSON.parse(rawText);
  } catch {
    throw new Error(`Server returned an unexpected response (HTTP ${response.status}).`);
  }

  if (response.status === 401) {
    throw new AuthError(data?.message || 'Your session has expired. Please sign in again.');
  }
  if (!response.ok || data?.status === 'error') {
    throw new Error(data?.message || `Request failed (HTTP ${response.status}).`);
  }

  return data;
};

export const mapUserInfoToProfile = (info: any, fallbackEmail?: string): UserProfile => {
  const email = info?.email || (typeof info?.user === 'string' && info.user.includes('@') ? info.user : fallbackEmail || '');
  
  // Clean up full_name and reject "Guest" or "Guest User"
  let rawFullName = (typeof info?.full_name === 'string' ? info.full_name.trim() : '') || (typeof info?.employee?.employee_name === 'string' ? info.employee.employee_name.trim() : '');
  if (rawFullName.toLowerCase() === 'guest' || rawFullName.toLowerCase() === 'guest user') {
    rawFullName = '';
  }

  // If full_name is missing, derive a human-readable name from the email/username prefix
  if (!rawFullName) {
    if (typeof info?.user === 'string' && !info.user.includes('@') && info.user.toLowerCase() !== 'guest') {
      rawFullName = info.user;
    } else if (email) {
      const prefix = email.split('@')[0];
      rawFullName = prefix
        .replace(/[._-]+/g, ' ')
        .replace(/([a-zA-Z])(\d+)/g, '$1 $2')
        .split(' ')
        .filter(Boolean)
        .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
    }
  }

  const fullName = rawFullName || 'Field Agent';

  const nameParts = fullName.trim().split(/\s+/).filter(Boolean);
  const initials = nameParts.length >= 2
    ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
    : fullName.slice(0, 2).toUpperCase() || 'FA';

  const role = Array.isArray(info?.roles) && info.roles.length > 0
    ? (info.roles.find((r: string) => r !== 'All' && r !== 'Desk User') || info.roles[0])
    : (info?.user_type || 'Field Execution Agent');

  return {
    name: fullName,
    email: email,
    initials: initials,
    role: role,
    territory: info?.territory || 'Assigned Territory',
    rank: info?.rank ?? 1,
    totalAgents: info?.totalAgents ?? 1,
    profileCompletion: info?.profileCompletion ?? 100,
  };
};

export const getStoredUserProfile = async (): Promise<UserProfile | null> => {
  const info = await getUserInfo();
  if (!info) return null;
  return mapUserInfoToProfile(info);
};

export const fetchUserProfile = async (): Promise<UserProfile | null> => {
  try {
    const data = await authFetch('/api/method/fieldops.api.mobile_api.get_my_profile');
    const profileInfo = data?.message || data;
    if (profileInfo && typeof profileInfo === 'object') {
      await setUserInfo(profileInfo);
      return mapUserInfoToProfile(profileInfo);
    }
  } catch (e) {
    // Non-fatal, fallback to stored profile
  }
  return getStoredUserProfile();
};

export const login = async (email: string, password: string, tenantId: string): Promise<LoginResult> => {
  const url = `${getBaseUrl(tenantId)}/auth/login`;
  const body = { email, password, tenantID: tenantId };

  console.log('[FieldOps API] POST', url, {
    ...body,
    email: JSON.stringify(email),
    password: `<${password.length} chars, starts "${password[0] ?? ''}", ends "${password[password.length - 1] ?? ''}">`,
  });

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const rawText = await response.text();
  console.log('[FieldOps API] login response', response.status, rawText);

  let data: any;
  try {
    data = JSON.parse(rawText);
  } catch (err) {
    console.log('[FieldOps API] login response was not valid JSON', err);
    return { success: false, message: `Server returned an unexpected response (HTTP ${response.status}).` };
  }

  // Contract specifies the token may be at any of these three locations.
  const token = data?.access_token || data?.data?.access_token || data?.message?.access_token;

  if (!token) {
    const message = typeof data?.message === 'string' ? data.message : data?.error || 'Login failed. Please check your credentials.';
    return { success: false, message };
  }

  const rawUserInfo = data?.user_info || data?.data?.user_info || data?.message?.user_info || {
    user: email,
    email: email,
    full_name: email.split('@')[0],
  };

  await setAccessToken(token);
  await setTenantId(tenantId);
  await setUserInfo(rawUserInfo);

  let profile = mapUserInfoToProfile(rawUserInfo, email);

  // Fetch full User doctype profile from Frappe
  try {
    const fetched = await fetchUserProfile();
    if (fetched && fetched.name && fetched.name !== 'Field Agent') {
      profile = fetched;
    }
  } catch {
    // Non-fatal
  }

  return { success: true, accessToken: token, user: profile };
};

export const logout = async (): Promise<void> => {
  await clearAccessToken();
  await clearUserInfo();
};

const deriveCampaignCategory = (modules: CampaignModule[]): CampaignCategory => {
  if (modules.includes('sales')) return 'Sales';
  if (modules.includes('orders')) return 'Orders';
  if (modules.includes('surveys')) return 'Survey';
  if (modules.includes('merchandising')) return 'Merchandising';
  return 'Mixed';
};

/**
 * The API only returns id/name/campaign_type/dates/modules for campaigns (per the integration
 * contract, no color/target/progress/description/beat/surveys/dashboard config exist server-side).
 * Real fields are mapped through; everything else gets a safe UI default rather than an invented value.
 * `modules` is passed through as-is (lowercased) rather than filtered against a hardcoded allowlist —
 * the exact set of module strings the backend sends isn't fully confirmed, and silently dropping an
 * unrecognized one would break module-driven UI (e.g. Dashboard Quick Access) for no visible reason.
 */
const mapCampaign = (raw: any): Campaign => {
  const modules: CampaignModule[] = Array.isArray(raw?.modules)
    ? raw.modules.filter((m: any): m is string => typeof m === 'string').map((m: string) => m.toLowerCase())
    : [];
  const isOutletCampaign = modules.includes('orders') || modules.includes('merchandising');

  return {
    // `name` is the real Frappe document primary key (e.g. "CAM-00016") — the RPC
    // endpoints (submit_lead, get_my_leads, check_in's `campaign` field, etc.) look
    // campaigns up by this exact value. `id` (e.g. 16) is a decorative numeric field
    // that doesn't exist as a lookup key server-side; using it caused a 404
    // "Campaign 16 not found" DoesNotExistError on lead creation.
    id: String(raw?.name ?? raw?.id ?? ''),
    name: raw?.campaign_name || raw?.name || 'Untitled Campaign',
    client: raw?.campaign_type || 'FieldOps',
    type: raw?.campaign_type || '',
    category: deriveCampaignCategory(modules),
    progress: 0,
    target: '',
    color: '#1B2559',
    beat: '',
    description: raw?.description || '',
    startDate: raw?.start_date || undefined,
    endDate: raw?.end_date || undefined,
    modules,
    ctaType: isOutletCampaign ? 'outlets' : 'leads',
  };
};

export const getCampaigns = async (): Promise<Campaign[]> => {
  const data = await authFetch('/agent/campaigns');
  const list = Array.isArray(data?.data) ? data.data : [];
  return list.map(mapCampaign);
};

/**
 * Clocks in the agent via the RPC contract (`check_in`). The v3 contract accepts the
 * shift selfie as a base64 data URI in the JSON body (not multipart like the old
 * `/agent/attendance/clock-in` route). Returns the attendance record id from the
 * response (if the backend sends one) so it can be passed to `clockOut` later.
 */
export const clockIn = async (
  coordinates: { lat: number; lng: number },
  options?: { imageUri?: string; campaignId?: string; remarks?: string }
): Promise<{ attendanceId?: string }> => {
  const body: Record<string, any> = {
    latitude: coordinates.lat,
    longitude: coordinates.lng,
  };
  if (options?.campaignId) body.campaign = options.campaignId;
  if (options?.remarks) body.remarks = options.remarks;
  if (options?.imageUri) {
    const base64 = await FileSystem.readAsStringAsync(options.imageUri, { encoding: FileSystem.EncodingType.Base64 });
    body.image = `data:image/jpeg;base64,${base64}`;
  }

  const data = await authFetch('/api/method/fieldops.api.mobile_api.check_in', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const result = data?.message ?? data?.data ?? data;
  const attendanceId = result?.attendance_id || result?.name || result?.id;
  return { attendanceId };
};

/** Clocks out the agent via the RPC contract (`check_out`). `attendanceId` is the id returned by `clockIn`. */
export const clockOut = async (
  coordinates: { lat: number; lng: number },
  attendanceId?: string,
  remarks?: string
): Promise<void> => {
  const body: Record<string, any> = {
    latitude: coordinates.lat,
    longitude: coordinates.lng,
  };
  if (attendanceId) body.attendance_id = attendanceId;
  if (remarks) body.remarks = remarks;

  await authFetch('/api/method/fieldops.api.mobile_api.check_out', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
};

// ─── Leads API ─────────────────────────────────────────────────────────────────

const STAGE_SCORE: Record<string, number> = {
  New: 20,
  Contacted: 40,
  Qualified: 60,
  'Proposal Sent': 70,
  Negotiation: 80,
  Converted: 100,
  Lost: 0,
};

const VALID_STAGES: LeadStage[] = [
  'New', 'Contacted', 'Qualified', 'Proposal Sent', 'Negotiation', 'Converted', 'Lost',
];

const mapLead = (raw: any): Lead => {
  const stage: LeadStage = VALID_STAGES.includes(raw?.funnel_stage) ? raw.funnel_stage : 'New';
  return {
    id: raw?.name || String(raw?.id || ''),
    name: raw?.lead_name || raw?.name || 'Unknown',
    company: raw?.company_name || '',
    phone: raw?.phone || '',
    email: raw?.email || undefined,
    position: raw?.position || undefined,
    address: raw?.address || undefined,
    stage,
    score: STAGE_SCORE[stage] ?? 20,
    next: raw?.next_contact || '',
    nextActionDate: raw?.next_action_date || undefined,
    createdAt: raw?.creation ? raw.creation.slice(0, 10) : undefined,
    lastContactDate: raw?.modified ? raw.modified.slice(0, 10) : undefined,
    // value is not on the Lead DocType — omit rather than invent a number
    value: raw?.opportunity_amount ? `₦${Number(raw.opportunity_amount).toLocaleString()}` : '',
    source: raw?.source || undefined,
    notes: raw?.notes || undefined,
    gps: raw?.latitude && raw?.longitude ? `${raw.latitude}, ${raw.longitude}` : undefined,
  };
};

/**
 * Fetch leads for the active campaign via the RPC contract (`get_my_leads`). The old
 * campaign-nested REST route (`/agent/campaigns/{id}/leads`) no longer exists — get_my_leads
 * returns leads across all of the agent's campaigns, so results are narrowed to campaignId
 * client-side whenever the response actually carries a campaign field. Falls back to an
 * empty array on error.
 */
export const getLeads = async (campaignId: string): Promise<Lead[]> => {
  try {
    const data = await authFetch('/api/method/fieldops.api.mobile_api.get_my_leads');
    const raw = data?.message ?? data?.data ?? data;
    const list = Array.isArray(raw) ? raw : [];
    const scoped = campaignId
      ? list.filter((l: any) => {
          // An empty string is common on leads whose campaign link didn't save server-side —
          // treat it the same as "unknown" rather than a real mismatch, or the lead vanishes
          // from every campaign's list.
          const c = l?.campaign || l?.campaign_id;
          return !c || String(c) === String(campaignId);
        })
      : list;
    return scoped.map(mapLead);
  } catch (e: any) {
    if (e instanceof AuthError) throw e;
    return [];
  }
};

export interface CreateLeadPayload {
  name: string;           // lead_name
  company: string;        // company_name
  phone: string;
  email?: string;
  address?: string;
  source?: string;
  notes?: string;
}

/**
 * Submit a new lead via the RPC contract (`submit_lead`). The v3 contract added outlet/
 * address/source/notes fields, so the values collected on the lead form are sent again.
 * `outlet_id` (a real linked Outlet record) and `latitude`/`longitude` are left out — the
 * app has no outlet-picker or GPS capture on this form yet, so there's no real value to send.
 */
export const createLead = async (campaignId: string, payload: CreateLeadPayload): Promise<Lead> => {
  const body: Record<string, any> = {
    lead_name: payload.name,
    contact_person: payload.name,
    phone_number: payload.phone,
    email_address: payload.email,
    campaign: campaignId,
    outlet: payload.company,
    address: payload.address,
    source: payload.source,
    notes: payload.notes,
  };

  const data = await authFetch('/api/method/fieldops.api.mobile_api.submit_lead', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const result = data?.message ?? data?.data ?? data;
  const leadId = result?.lead_id || result?.name || result?.id;

  // Return a minimal Lead object immediately so the UI can update optimistically
  return mapLead({
    name: leadId,
    lead_name: payload.name,
    company_name: payload.company,
    phone: payload.phone,
    email: payload.email,
    funnel_stage: 'New',
    source: payload.source,
    address: payload.address,
    notes: payload.notes,
    creation: new Date().toISOString(),
  });
};

/**
 * Update the funnel stage of a lead via the RPC contract (`update_lead_stage`). The old
 * campaign-nested REST route (`/agent/campaigns/{id}/leads/{id}/stage`) no longer exists.
 */
export const updateLeadStage = async (leadId: string, stage: LeadStage, remarks?: string): Promise<void> => {
  await authFetch('/api/method/fieldops.api.mobile_api.update_lead_stage', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lead_id: leadId, stage, remarks }),
  });
};

// ─── Outlets API ───────────────────────────────────────────────────────────────

/**
 * `campaignId` is stamped onto the mapped Outlet purely for local bookkeeping (the Outlet
 * type requires it) — the v3 contract's `submit_outlet`/`get_outlets` bodies have no
 * campaign field at all, so outlets aren't campaign-scoped server-side the way leads are.
 */
const mapOutlet = (raw: any, campaignId: string): Outlet => {
  const status: OutletStatus = raw?.status === 'Visited' || raw?.status === 'visited'
    ? 'visited'
    : raw?.status === 'Skipped' || raw?.status === 'skipped'
      ? 'skipped'
      : 'pending';

  return {
    id: raw?.name || String(raw?.id || ''),
    name: raw?.outlet_name || raw?.name || 'Unknown Outlet',
    type: raw?.outlet_type || '',
    category: raw?.sub_channel || raw?.category || undefined,
    area: raw?.area || raw?.territory || '',
    address: raw?.address || '',
    phone: raw?.phone_number || raw?.phone || '',
    ownerName: raw?.owner_name || undefined,
    ownerPhone: raw?.owner_phone || undefined,
    isOpen: raw?.is_open ?? true,
    // No live distance signal from the backend — left blank rather than invented.
    distance: '',
    notes: raw?.notes || undefined,
    status,
    gps: raw?.latitude && raw?.longitude ? `${raw.latitude}, ${raw.longitude}` : undefined,
    photoUri: raw?.image_url || raw?.photo_url || undefined,
    campaignId,
  };
};

/** Fetch outlets via the RPC contract (`get_outlets`). Falls back to an empty array on error. */
export const getOutlets = async (campaignId: string): Promise<Outlet[]> => {
  try {
    const data = await authFetch('/api/method/fieldops.api.mobile_api.get_outlets');
    const raw = data?.message ?? data?.data ?? data;
    const list = Array.isArray(raw) ? raw : [];
    return list.map((o: any) => mapOutlet(o, campaignId));
  } catch (e: any) {
    if (e instanceof AuthError) throw e;
    return [];
  }
};

export interface CreateOutletPayload {
  name: string;
  type: string;
  address: string;
  phone?: string;
  latitude?: number;
  longitude?: number;
}

/** Submit a new outlet via the RPC contract (`submit_outlet`). */
export const createOutlet = async (campaignId: string, payload: CreateOutletPayload): Promise<Outlet> => {
  const body: Record<string, any> = {
    outlet_name: payload.name,
    outlet_type: payload.type,
    address: payload.address,
    phone_number: payload.phone,
  };
  if (payload.latitude !== undefined) body.latitude = payload.latitude;
  if (payload.longitude !== undefined) body.longitude = payload.longitude;

  const data = await authFetch('/api/method/fieldops.api.mobile_api.submit_outlet', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const result = data?.message ?? data?.data ?? data;
  const outletId = result?.outlet_id || result?.name || result?.id;

  // Return a rich Outlet object immediately so the UI can update optimistically
  return mapOutlet({
    name: outletId,
    outlet_name: payload.name,
    outlet_type: payload.type,
    address: payload.address,
    phone_number: payload.phone,
    latitude: payload.latitude,
    longitude: payload.longitude,
  }, campaignId);
};

// ─── End of Day API ─────────────────────────────────────────────────────────────

/** Submit the end-of-day report via the RPC contract (`submit_eod_report`). */
export const submitEodReport = async (date: string, summary: string, expenses?: number): Promise<void> => {
  const body: Record<string, any> = { date, summary };
  if (expenses !== undefined) body.expenses = expenses;

  await authFetch('/api/method/fieldops.api.mobile_api.submit_eod_report', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
};
