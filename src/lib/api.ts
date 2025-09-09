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

async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ? {
    'Authorization': `Bearer ${session.access_token}`,
  } : {};
}

export async function apiGet<T>(url: string): Promise<T> {
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
  console.log('Response headers:', response.headers.get('content-type'));

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

export async function apiPost<T>(url: string, body?: unknown): Promise<T> {
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

export async function apiDelete<T>(url: string): Promise<T> {
  const headers = await getAuthHeaders();
  
  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    credentials: 'include',
  });

  if (!response.ok) {
    throw new ApiError(response.status, `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}