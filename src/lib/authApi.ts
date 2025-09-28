import { supabase } from '@/integrations/supabase/client';

export interface LoginResponse {
  success: boolean;
  user?: any;
  session?: {
    access_token: string;
    expires_at: number;
  };
  code?: string;
  message?: string;
}

export interface RefreshResponse {
  success: boolean;
  access_token?: string;
  expires_at?: number;
  code?: string;
  message?: string;
}

// Get Supabase URL and key from environment or use current project values
const SUPABASE_URL = 'https://pbsdsdexayzfoexjdlgb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBic2RzZGV4YXl6Zm9leGpkbGdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNzQxNjUsImV4cCI6MjA3MjY1MDE2NX0.mlCtak2aAIMRuJU3GCF0WWS4065aalvfZOm1nPHtEqI';

class AuthAPI {
  private accessToken: string | null = null;
  private tokenExpiresAt: number | null = null;
  private isRefreshing: boolean = false;
  private refreshPromise: Promise<boolean> | null = null;

  async login(email: string, password: string, remember: boolean = false): Promise<LoginResponse> {
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
        },
        credentials: 'include', // Include cookies
        body: JSON.stringify({ email, password, remember }),
      });

      const data = await response.json();

      if (data.success && data.session) {
        this.accessToken = data.session.access_token;
        this.tokenExpiresAt = data.session.expires_at;
        
        // Set session in Supabase client
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: 'dummy', // We use our own refresh mechanism
        });
      }

      return data;
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        code: 'NETWORK_ERROR',
        message: 'Ошибка сети'
      };
    }
  }

  async refreshToken(): Promise<boolean> {
    if (this.isRefreshing) {
      return this.refreshPromise || Promise.resolve(false);
    }

    this.isRefreshing = true;
    this.refreshPromise = this.performRefresh();

    try {
      const result = await this.refreshPromise;
      return result;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  private async performRefresh(): Promise<boolean> {
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
        },
        credentials: 'include', // Include cookies for refresh token
      });

      const data = await response.json();

      if (data.success && data.access_token) {
        this.accessToken = data.access_token;
        this.tokenExpiresAt = data.expires_at;

        // Update Supabase client session
        await supabase.auth.setSession({
          access_token: data.access_token,
          refresh_token: 'dummy', // We use our own refresh mechanism
        });

        console.log('Token refreshed successfully');
        return true;
      } else {
        console.log('Token refresh failed:', data.message);
        await this.logout();
        return false;
      }
    } catch (error) {
      console.error('Refresh token error:', error);
      await this.logout();
      return false;
    }
  }

  async logout(): Promise<void> {
    try {
      await fetch(`${SUPABASE_URL}/functions/v1/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
        },
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    }

    this.accessToken = null;
    this.tokenExpiresAt = null;
    
    // Clear Supabase session
    await supabase.auth.signOut();
    
    // Clear any stored credentials
    localStorage.removeItem('rememberedEmail');
    localStorage.removeItem('rememberedPassword');
    localStorage.removeItem('rememberMe');
  }

  async getProfile(): Promise<any> {
    const token = await this.getValidToken();
    if (!token) {
      throw new Error('No valid token');
    }

    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/auth/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      const data = await response.json();
      
      if (data.success) {
        return data;
      } else {
        throw new Error(data.message || 'Failed to get profile');
      }
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  }

  private async getValidToken(): Promise<string | null> {
    if (!this.accessToken || !this.tokenExpiresAt) {
      return null;
    }

    // Check if token expires in the next 5 minutes
    const now = Math.floor(Date.now() / 1000);
    const expiryBuffer = 5 * 60; // 5 minutes

    if (this.tokenExpiresAt - now < expiryBuffer) {
      console.log('Token expiring soon, refreshing...');
      const refreshed = await this.refreshToken();
      if (!refreshed) {
        return null;
      }
    }

    return this.accessToken;
  }

  isTokenExpired(): boolean {
    if (!this.tokenExpiresAt) return true;
    const now = Math.floor(Date.now() / 1000);
    return this.tokenExpiresAt <= now;
  }

  // Automatic session initialization
  async initializeSession(): Promise<boolean> {
    try {
      // First try to get current session from Supabase
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.access_token) {
        this.accessToken = session.access_token;
        this.tokenExpiresAt = session.expires_at || 0;
        return true;
      }

      // If no session, try to refresh with cookie
      const refreshed = await this.refreshToken();
      return refreshed;
    } catch (error) {
      console.error('Session initialization error:', error);
      return false;
    }
  }
}

export const authAPI = new AuthAPI();