import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('Auth state change:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Handle different auth events with reduced logging to prevent rate limiting
        if (event === 'SIGNED_IN' && session?.user) {
          // Defer profile creation to avoid race conditions
          setTimeout(() => {
            if (mounted) {
              ensureUserProfile(session.user);
            }
          }, 1000);
        }
        
        if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
        }
      }
    );

    const ensureUserProfile = async (user: any) => {
      try {
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!existingProfile) {
          console.log('Creating profile for new user:', user.id);
          await supabase
            .from('profiles')
            .insert({
              user_id: user.id,
              display_name: user.user_metadata?.display_name || 
                           user.user_metadata?.full_name || 
                           user.email?.split('@')[0] || 
                           'Пользователь',
              approval_status: 'pending'
            });
        }
      } catch (error) {
        console.error('Error ensuring user profile:', error);
      }
    };

    // THEN check for existing session with retry logic
    const initializeSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
        }
        
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
          
          // If we have a session, ensure profile exists
          if (session?.user) {
            setTimeout(() => ensureUserProfile(session.user), 500);
          }
        }
      } catch (error) {
        console.error('Session initialization error:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    loading,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};