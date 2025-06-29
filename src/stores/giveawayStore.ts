import { create } from 'zustand';
import { supabase, Giveaway, Prize } from '../lib/supabase';

interface GiveawayState {
  giveaways: Giveaway[];
  currentGiveaway: Giveaway | null;
  loading: boolean;
  searchQuery: string;
  statusFilter: string;
  fetchGiveaways: () => Promise<void>;
  fetchGiveaway: (slug: string) => Promise<void>;
  createGiveaway: (giveaway: Partial<Giveaway>, prizes: Partial<Prize>[]) => Promise<string>;
  setSearchQuery: (query: string) => void;
  setStatusFilter: (status: string) => void;
}

export const useGiveawayStore = create<GiveawayState>((set, get) => ({
  giveaways: [],
  currentGiveaway: null,
  loading: false,
  searchQuery: '',
  statusFilter: 'all',

  fetchGiveaways: async () => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('giveaways')
        .select(`
          *,
          organizer:profiles!organizer_id(*),
          prizes(*)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ giveaways: data || [], loading: false });
    } catch (error) {
      console.error('Error fetching giveaways:', error);
      set({ loading: false });
    }
  },

  fetchGiveaway: async (slug: string) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('giveaways')
        .select(`
          *,
          organizer:profiles!organizer_id(*),
          prizes(*)
        `)
        .eq('slug', slug)
        .single();

      if (error) throw error;
      set({ currentGiveaway: data, loading: false });
    } catch (error) {
      console.error('Error fetching giveaway:', error);
      set({ loading: false });
    }
  },

  createGiveaway: async (giveaway: Partial<Giveaway>, prizes: Partial<Prize>[]) => {
    try {
      const { data, error } = await supabase
        .from('giveaways')
        .insert(giveaway)
        .select()
        .single();

      if (error) throw error;

      // Create prizes
      if (prizes.length > 0) {
        const prizesWithGiveawayId = prizes.map(prize => ({
          ...prize,
          giveaway_id: data.id,
        }));

        const { error: prizesError } = await supabase
          .from('prizes')
          .insert(prizesWithGiveawayId);

        if (prizesError) throw prizesError;
      }

      return data.id;
    } catch (error) {
      console.error('Error creating giveaway:', error);
      throw error;
    }
  },

  setSearchQuery: (query: string) => set({ searchQuery: query }),
  setStatusFilter: (status: string) => set({ statusFilter: status }),
}));