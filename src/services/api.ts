import { getBaseUrl, getAccessToken, getTenantId, setAccessToken, setTenantId, clearAccessToken } from './apiConfig';
import { Campaign, CampaignCategory, CampaignModule } from '../types';

/** Thrown by authFetch when the stored session is missing or the server rejects the token (401). */
export class AuthError extends Error {}

export interface LoginResult {
  success: boolean;
  message?: string;
  accessToken?: string;
}

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

  await setAccessToken(token);
  await setTenantId(tenantId);

  return { success: true, accessToken: token };
};

export const logout = async (): Promise<void> => {
  await clearAccessToken();
};

/** Attaches the stored bearer token and tenant base URL to a request against a protected `/agent/*` route. */
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
    throw new Error('Could not reach the server. Check your connection and try again.');
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

const VALID_CAMPAIGN_MODULES: CampaignModule[] = ['sales', 'orders', 'surveys', 'merchandising', 'stock', 'photo'];

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
 */
const mapCampaign = (raw: any): Campaign => {
  const modules = Array.isArray(raw?.modules)
    ? raw.modules.filter((m: any): m is CampaignModule => VALID_CAMPAIGN_MODULES.includes(m))
    : [];
  const isOutletCampaign = modules.includes('orders') || modules.includes('merchandising');

  return {
    id: String(raw?.id ?? raw?.name ?? ''),
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

/** Clocks in the agent. `imageUri` is a local file URI (e.g. from expo-image-picker); omit if no selfie was captured. */
export const clockIn = async (coordinates: { lat: number; lng: number }, imageUri?: string): Promise<void> => {
  const formData = new FormData();
  formData.append('coordinates', JSON.stringify({ lat: String(coordinates.lat), lng: String(coordinates.lng) }));

  if (imageUri) {
    const filename = imageUri.split('/').pop() || 'clockin.jpg';
    const extMatch = /\.(\w+)$/.exec(filename);
    const type = extMatch ? `image/${extMatch[1]}` : 'image/jpeg';
    formData.append('image', { uri: imageUri, name: filename, type } as any);
  }

  await authFetch('/agent/attendance/clock-in', {
    method: 'POST',
    body: formData,
  });
};
