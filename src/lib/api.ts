import { supabase } from "@/integrations/supabase/client";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function refreshSession(): Promise<boolean> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.refresh_token) return false;

    const response = await fetch('/functions/v1/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-refresh-token': session.refresh_token,
      },
    });

    if (!response.ok) return false;

    const data = await response.json();
    if (data.success && data.session) {
      await supabase.auth.setSession(data.session);
      return true;
    }

    return false;
  } catch (error) {
    console.error('Failed to refresh session:', error);
    return false;
  }
}

async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ? {
    'Authorization': `Bearer ${session.access_token}`,
  } : {};
}

export async function apiGet<T>(url: string, retryCount = 0): Promise<T> {
  const headers = await getAuthHeaders();
  
  console.log('API GET:', url);
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    credentials: 'include',
  });

  console.log('Response status:', response.status);

  // Handle 401 with session refresh
  if (response.status === 401 && retryCount < 1) {
    console.log('Attempting to refresh session due to 401...');
    const refreshed = await refreshSession();
    if (refreshed) {
      console.log('Session refreshed, retrying request...');
      return apiGet<T>(url, retryCount + 1);
    }
  }

  if (!response.ok) {
    const text = await response.text();
    console.log('Error response body:', text);
    throw new ApiError(response.status, `HTTP ${response.status}: ${response.statusText}`);
  }

  const contentType = response.headers.get('content-type');
  if (!contentType?.includes('application/json')) {
    const text = await response.text();
    console.log('Non-JSON response:', text);
    throw new ApiError(response.status, 'API returned non-JSON response');
  }

  return response.json();
}

export async function apiPost<T>(url: string, body?: unknown, retryCount = 0): Promise<T> {
  const headers = await getAuthHeaders();
  
  console.log('API POST:', url, body);
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined,
  });

  console.log('Response status:', response.status);

  // Handle 401 with session refresh
  if (response.status === 401 && retryCount < 1) {
    console.log('Attempting to refresh session due to 401...');
    const refreshed = await refreshSession();
    if (refreshed) {
      console.log('Session refreshed, retrying request...');
      return apiPost<T>(url, body, retryCount + 1);
    }
  }

  if (!response.ok) {
    const text = await response.text();
    console.log('Error response body:', text);
    throw new ApiError(response.status, `HTTP ${response.status}: ${response.statusText}`);
  }

  const contentType = response.headers.get('content-type');
  if (!contentType?.includes('application/json')) {
    const text = await response.text();
    console.log('Non-JSON response:', text);
    throw new ApiError(response.status, 'API returned non-JSON response');
  }

  return response.json();
}

export async function apiDelete<T>(url: string, retryCount = 0): Promise<T> {
  const headers = await getAuthHeaders();
  
  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    credentials: 'include',
  });

  // Handle 401 with session refresh
  if (response.status === 401 && retryCount < 1) {
    console.log('Attempting to refresh session due to 401...');
    const refreshed = await refreshSession();
    if (refreshed) {
      console.log('Session refreshed, retrying request...');
      return apiDelete<T>(url, retryCount + 1);
    }
  }

  if (!response.ok) {
    throw new ApiError(response.status, `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}