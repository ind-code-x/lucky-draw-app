import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  subscriptionStatus: 'free' | 'premium' | 'pro';
  subscriptionExpiresAt?: string;
  createdAt: string;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  updateSubscription: (status: 'free' | 'premium' | 'pro', expiresAt?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUserProfile(session.user);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await loadUserProfile(session.user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (authUser: User) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // User doesn't exist, create profile
        const newUser = {
          id: authUser.id,
          email: authUser.email!,
          name: authUser.user_metadata?.name || authUser.email!.split('@')[0],
          subscription_status: 'free' as const,
        };

        const { data: createdUser, error: createError } = await supabase
          .from('users')
          .insert([newUser])
          .select()
          .single();

        if (createError) throw createError;
        
        setUser({
          id: createdUser.id,
          name: createdUser.name,
          email: createdUser.email,
          avatar: createdUser.avatar_url,
          subscriptionStatus: createdUser.subscription_status,
          subscriptionExpiresAt: createdUser.subscription_expires_at,
          createdAt: createdUser.created_at,
        });
      } else if (error) {
        throw error;
      } else {
        setUser({
          id: data.id,
          name: data.name,
          email: data.email,
          avatar: data.avatar_url,
          subscriptionStatus: data.subscription_status,
          subscriptionExpiresAt: data.subscription_expires_at,
          createdAt: data.created_at,
        });
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });

    if (error) throw error;
  };

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
  };

  const updateSubscription = async (status: 'free' | 'premium' | 'pro', expiresAt?: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('users')
      .update({
        subscription_status: status,
        subscription_expires_at: expiresAt,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (error) throw error;

    setUser(prev => prev ? {
      ...prev,
      subscriptionStatus: status,
      subscriptionExpiresAt: expiresAt,
    } : null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      loading,
      updateSubscription,
    }}>
      {children}
    </AuthContext.Provider>
  );
}