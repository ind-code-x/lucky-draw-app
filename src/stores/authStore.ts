import { create } from 'zustand';
import { User } from '@supabase/supabase-js';
import { supabase, Profile } from '../lib/supabase';

interface AuthState {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string, role?: 'participant' | 'organizer') => Promise<void>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  loading: true,

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Try to get existing profile
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (error && error.code === 'PGRST116') {
          // Profile doesn't exist, create it
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: session.user.id,
              email: session.user.email || '',
              username: session.user.email?.split('@')[0] || 'user',
              role: 'participant'
            })
            .select()
            .single();

          if (createError) {
            console.error('Error creating profile:', createError);
          } else {
            set({ user: session.user, profile: newProfile, loading: false });
          }
        } else if (!error) {
          set({ user: session.user, profile, loading: false });
        } else {
          console.error('Error fetching profile:', error);
          set({ user: session.user, profile: null, loading: false });
        }
      } else {
        set({ user: null, profile: null, loading: false });
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          // Try to get existing profile
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (error && error.code === 'PGRST116') {
            // Profile doesn't exist, create it
            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .insert({
                id: session.user.id,
                email: session.user.email || '',
                username: session.user.email?.split('@')[0] || 'user',
                role: 'participant'
              })
              .select()
              .single();

            if (createError) {
              console.error('Error creating profile:', createError);
              set({ user: session.user, profile: null });
            } else {
              set({ user: session.user, profile: newProfile });
            }
          } else if (!error) {
            set({ user: session.user, profile });
          } else {
            console.error('Error fetching profile:', error);
            set({ user: session.user, profile: null });
          }
        } else {
          set({ user: null, profile: null });
        }
      });
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({ loading: false });
    }
  },

  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Provide more user-friendly error messages
      if (error.message.includes('email_not_confirmed')) {
        throw new Error('Please check your email and click the confirmation link before signing in. Check your spam folder if you don\'t see the email.');
      } else if (error.message.includes('Invalid login credentials')) {
        throw new Error('Invalid email or password. Please check your credentials and try again.');
      } else {
        throw error;
      }
    }

    // Profile will be loaded by the auth state change listener
  },

  signUp: async (email: string, password: string, username: string, role: 'participant' | 'organizer' = 'participant') => {
    // Sign up with email confirmation disabled for demo purposes
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          role
        },
        emailRedirectTo: `${window.location.origin}/auth/login`
      }
    });

    if (error) throw error;

    if (data.user && !data.session) {
      // Email confirmation is required
      throw new Error('Account created! Please check your email and click the confirmation link to complete your registration. Check your spam folder if you don\'t see the email.');
    }

    if (data.user && data.session) {
      // User is immediately signed in, create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          email,
          username,
          role,
        });

      if (profileError) {
        console.error('Error creating profile:', profileError);
        // Don't throw here as the user is already created
      }
    }
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },
}));