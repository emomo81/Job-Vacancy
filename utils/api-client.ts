const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api/v1';

const TOKEN_KEY = 'rankr_token';
const REFRESH_TOKEN_KEY = 'rankr_refresh_token';
const ROLE_KEY = 'rankr_role';
const USER_ID_KEY = 'rankr_user_id';
const CURRENT_JOB_KEY = 'rankr_current_job_id';
const USER_NAME_KEY = 'rankr_user_name';

export type SessionUser = {
  id?: string;
  role?: string;
  fullName?: string;
  email?: string;
};

export type SessionPayload = {
  token?: string;
  refreshToken?: string;
  user?: SessionUser;
};

type ApiFetchOptions = {
  method?: string;
  body?: unknown;
  auth?: boolean;
  isFormData?: boolean;
};

function setCookie(name: string, value: string, maxAgeSeconds = 60 * 60 * 24 * 7): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; samesite=lax`;
}

function clearCookie(name: string): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; path=/; max-age=0; samesite=lax`;
}

function emitSessionChanged(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event('rankr:session-changed'));
}

export function getApiBase(): string {
  return API_BASE;
}

export function getToken(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(TOKEN_KEY) || '';
}

export function getRole(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(ROLE_KEY) || '';
}

export function isAuthenticated(): boolean {
  return Boolean(getToken());
}

export function getSessionUser(): SessionUser | null {
  if (typeof window === 'undefined') return null;
  const id = localStorage.getItem(USER_ID_KEY) || undefined;
  const role = localStorage.getItem(ROLE_KEY) || undefined;
  const fullName = localStorage.getItem(USER_NAME_KEY) || undefined;
  if (!id && !role && !fullName) return null;
  return { id, role, fullName };
}

export function setSession({ token, refreshToken, user }: SessionPayload): void {
  if (typeof window === 'undefined') return;

  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
    setCookie(TOKEN_KEY, token);
  }

  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }

  if (user?.id) localStorage.setItem(USER_ID_KEY, String(user.id));

  if (user?.role) {
    localStorage.setItem(ROLE_KEY, String(user.role));
    setCookie(ROLE_KEY, String(user.role));
  }

  if (user?.fullName) localStorage.setItem(USER_NAME_KEY, String(user.fullName));

  emitSessionChanged();
}

export function clearSession(): void {
  if (typeof window === 'undefined') return;

  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
  localStorage.removeItem(USER_ID_KEY);
  localStorage.removeItem(CURRENT_JOB_KEY);
  localStorage.removeItem(USER_NAME_KEY);

  clearCookie(TOKEN_KEY);
  clearCookie(ROLE_KEY);

  emitSessionChanged();
}

export function getCurrentJobId(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(CURRENT_JOB_KEY) || '';
}

export function setCurrentJobId(jobId: string): void {
  if (typeof window === 'undefined') return;
  if (jobId) localStorage.setItem(CURRENT_JOB_KEY, String(jobId));
}

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function onTokenRefreshed(token: string) {
  refreshSubscribers.map((cb) => cb(token));
  refreshSubscribers = [];
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  if (!refreshToken) return null;

  try {
    const response = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    const payload = await response.json();
    if (response.ok && payload.success) {
      const { token, refreshToken: newRefreshToken } = payload.data;
      setSession({ token, refreshToken: newRefreshToken });
      return token;
    }
  } catch (err) {
    console.error('Refresh token failed:', err);
  }

  clearSession();
  return null;
}

export async function apiFetch(path: string, options: ApiFetchOptions = {}): Promise<{ data: any; meta: any }> {
  const {
    method = 'GET',
    body,
    auth = true,
    isFormData = false,
  } = options;

  const headers: Record<string, string> = {};
  if (!isFormData) headers['Content-Type'] = 'application/json';
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let response = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body
      ? (isFormData ? (body as BodyInit) : JSON.stringify(body))
      : undefined,
  });

  // Handle Token Refresh
  if (response.status === 401 && auth && localStorage.getItem(REFRESH_TOKEN_KEY)) {
    if (!isRefreshing) {
      isRefreshing = true;
      const newToken = await refreshAccessToken();
      isRefreshing = false;
      if (newToken) {
        onTokenRefreshed(newToken);
      }
    }

    if (isRefreshing) {
      return new Promise((resolve) => {
        refreshSubscribers.push(async (newToken: string) => {
          headers.Authorization = `Bearer ${newToken}`;
          const retryResponse = await fetch(`${API_BASE}${path}`, {
            method,
            headers,
            body: body
              ? (isFormData ? (body as BodyInit) : JSON.stringify(body))
              : undefined,
          });
          const retryPayload = await retryResponse.json();
          resolve({
            data: retryPayload.data,
            meta: retryPayload.meta,
          });
        });
      });
    }

    // If we're here, refresh just finished or failed
    const newToken = getToken();
    if (newToken) {
      headers.Authorization = `Bearer ${newToken}`;
      response = await fetch(`${API_BASE}${path}`, {
        method,
        headers,
        body: body
          ? (isFormData ? (body as BodyInit) : JSON.stringify(body))
          : undefined,
      });
    }
  }

  let payload: any;
  try {
    payload = await response.json();
  } catch {
    payload = { success: false, error: { message: 'Invalid server response' } };
  }

  if (!response.ok || !payload?.success) {
    const message = payload?.error?.message || 'Request failed';
    if (response.status === 401) clearSession();
    throw new Error(message);
  }

  return {
    data: payload.data,
    meta: payload.meta,
  };
}
