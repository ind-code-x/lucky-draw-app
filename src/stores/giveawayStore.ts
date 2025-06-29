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
      // Use a simpler query first to test the relationship
      const { data, error } = await supabase
        .from('giveaways')
        .select(`
          *,
          profiles!giveaways_organizer_id_fkey(*),
          prizes(*)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error details:', error);
        // Fallback to basic query without joins if relationship fails
        const { data: basicData, error: basicError } = await supabase
          .from('giveaways')
          .select('*')
          .eq('status', 'active')
          .order('created_at', { ascending: false });

        if (basicError) throw basicError;
        
        // Manually fetch organizer data for each giveaway
        const giveawaysWithOrganizers = await Promise.all(
          (basicData || []).map(async (giveaway) => {
            const { data: organizer } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', giveaway.organizer_id)
              .single();

            const { data: prizes } = await supabase
              .from('prizes')
              .select('*')
              .eq('giveaway_id', giveaway.id);

            return {
              ...giveaway,
              organizer,
              prizes: prizes || []
            };
          })
        );

        set({ giveaways: giveawaysWithOrganizers, loading: false });
        return;
      }

      set({ giveaways: data || [], loading: false });
    } catch (error) {
      console.error('Error fetching giveaways:', error);
      set({ giveaways: [], loading: false });
    }
  },

  fetchGiveaway: async (slug: string) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('giveaways')
        .select(`
          *,
          profiles!giveaways_organizer_id_fkey(*),
          prizes(*)
        `)
        .eq('slug', slug)
        .single();

      if (error) {
        console.error('Supabase error details:', error);
        // Fallback to basic query without joins
        const { data: basicData, error: basicError } = await supabase
          .from('giveaways')
          .select('*')
          .eq('slug', slug)
          .single();

        if (basicError) throw basicError;

        // Manually fetch related data
        const { data: organizer } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', basicData.organizer_id)
          .single();

        const { data: prizes } = await supabase
          .from('prizes')
          .select('*')
          .eq('giveaway_id', basicData.id);

        const giveawayWithRelations = {
          ...basicData,
          organizer,
          prizes: prizes || []
        };

        set({ currentGiveaway: giveawayWithRelations, loading: false });
        return;
      }

      set({ currentGiveaway: data, loading: false });
    } catch (error) {
      console.error('Error fetching giveaway:', error);
      set({ currentGiveaway: null, loading: false });
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