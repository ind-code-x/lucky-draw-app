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
      console.log('Auth state changed:', event, session?.user?.email);
      
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
      console.log('Loading user profile for:', authUser.email);
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // User doesn't exist, create profile
        console.log('Creating new user profile...');
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

        if (createError) {
          console.error('Error creating user profile:', createError);
          throw createError;
        }
        
        console.log('User profile created successfully:', createdUser);
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
        console.error('Error loading user profile:', error);
        throw error;
      } else {
        console.log('User profile loaded successfully:', data);
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
      console.error('Error in loadUserProfile:', error);
      // Don't throw here, just log the error
    }
  };

  const register = async (name: string, email: string, password: string) => {
    console.log('Attempting to register user:', email);
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });

    if (error) {
      console.error('Registration error:', error);
      throw error;
    }

    console.log('Registration successful:', data);
    
    // If user is immediately confirmed (no email confirmation required)
    if (data.user && !data.user.email_confirmed_at) {
      console.log('User registered but needs email confirmation');
      // You might want to show a message about email confirmation
    }
  };

  const login = async (email: string, password: string) => {
    console.log('Attempting to login user:', email);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Login error:', error);
      throw error;
    }

    console.log('Login successful:', data);
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