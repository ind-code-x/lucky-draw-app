import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          avatar_url?: string;
          subscription_status: 'free' | 'premium' | 'pro';
          subscription_expires_at?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          avatar_url?: string;
          subscription_status?: 'free' | 'premium' | 'pro';
          subscription_expires_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          avatar_url?: string;
          subscription_status?: 'free' | 'premium' | 'pro';
          subscription_expires_at?: string;
          updated_at?: string;
        };
      };
      giveaways: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string;
          prize: string;
          platform: string;
          status: 'draft' | 'active' | 'completed';
          start_date: string;
          end_date: string;
          entry_methods: any;
          poster_url?: string;
          social_post_id?: string;
          winner_id?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description: string;
          prize: string;
          platform: string;
          status?: 'draft' | 'active' | 'completed';
          start_date: string;
          end_date: string;
          entry_methods: any;
          poster_url?: string;
          social_post_id?: string;
          winner_id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          description?: string;
          prize?: string;
          platform?: string;
          status?: 'draft' | 'active' | 'completed';
          start_date?: string;
          end_date?: string;
          entry_methods?: any;
          poster_url?: string;
          social_post_id?: string;
          winner_id?: string;
          updated_at?: string;
        };
      };
      entries: {
        Row: {
          id: string;
          giveaway_id: string;
          participant_name: string;
          participant_email: string;
          participant_handle: string;
          platform: string;
          verified: boolean;
          entry_date: string;
        };
        Insert: {
          id?: string;
          giveaway_id: string;
          participant_name: string;
          participant_email: string;
          participant_handle: string;
          platform: string;
          verified?: boolean;
          entry_date?: string;
        };
        Update: {
          participant_name?: string;
          participant_email?: string;
          participant_handle?: string;
          platform?: string;
          verified?: boolean;
        };
      };
    };
  };
}