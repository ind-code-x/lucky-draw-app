import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Profile {
  id: string;
  username: string;
  email: string;
  role: 'organizer' | 'participant';
  avatar_url?: string;
  created_at: string;
}

export interface Giveaway {
  id: string;
  organizer_id: string;
  title: string;
  slug: string;
  description: string;
  banner_url?: string;
  start_time: string;
  end_time: string;
  announce_time: string;
  status: 'pending' | 'active' | 'paused' | 'ended';
  entry_config: Record<string, any>;
  rules?: string;
  total_entries?: number;
  unique_participants?: number;
  created_at: string;
  updated_at: string;
  organizer?: Profile;
  prizes?: Prize[];
}

export interface Prize {
  id: string;
  giveaway_id: string;
  name: string;
  value: number;
  quantity: number;
  image_url?: string;
  description?: string;
}

export interface Participant {
  id: string;
  giveaway_id: string;
  user_id: string;
  referral_code: string;
  referred_by_user_id?: string;
  total_entries: number;
  created_at: string;
}

export interface Entry {
  id: string;
  participant_id: string;
  giveaway_id: string;
  method_type: string;
  method_value?: string;
  points: number;
  is_verified: boolean;
  created_at: string;
}

export interface Winner {
  id: string;
  giveaway_id: string;
  prize_id: string;
  participant_id: string;
  status: 'pending_contact' | 'contacted' | 'responded' | 'disqualified' | 'prize_sent';
  drawn_at: string;
  prize?: Prize;
  participant?: Participant;
}