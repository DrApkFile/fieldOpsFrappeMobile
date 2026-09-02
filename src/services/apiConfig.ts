import AsyncStorage from '@react-native-async-storage/async-storage';

const TENANT_BASE_DOMAIN = 'fieldops.africa';

const ACCESS_TOKEN_KEY = 'fieldops_access_token';
const TENANT_ID_KEY = 'fieldops_tenant_id';

const USER_INFO_KEY = 'fieldops_user_info';

export const getBaseUrl = (tenantId: string) => `https://${tenantId}.${TENANT_BASE_DOMAIN}`;

export const setAccessToken = (token: string) => AsyncStorage.setItem(ACCESS_TOKEN_KEY, token);
export const getAccessToken = () => AsyncStorage.getItem(ACCESS_TOKEN_KEY);
export const clearAccessToken = () => AsyncStorage.removeItem(ACCESS_TOKEN_KEY);

export const setTenantId = (tenantId: string) => AsyncStorage.setItem(TENANT_ID_KEY, tenantId);
export const getTenantId = () => AsyncStorage.getItem(TENANT_ID_KEY);

export const setUserInfo = (userInfo: any) => AsyncStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo));
export const getUserInfo = async (): Promise<any | null> => {
  const raw = await AsyncStorage.getItem(USER_INFO_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};
export const clearUserInfo = () => AsyncStorage.removeItem(USER_INFO_KEY);
