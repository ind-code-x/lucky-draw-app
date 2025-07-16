import { create } from 'zustand';
import { supabase, Giveaway, Prize, Profile, Participant, Winner } from '../lib/supabase';

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
  addParticipant: (giveawayId: string, userId: string) => Promise<void>;
  fetchParticipants: (giveawayId: string) => Promise<Participant[]>;
  selectRandomWinner: (giveawayId: string, prizeId: string) => Promise<{ winner: Participant, winnerRecord: Winner }>;
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
      const { statusFilter } = get();
      let query = supabase
        .from('giveaways')
        .select(`*, profiles(*), prizes(*)`)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Supabase error:', error);
        set({ giveaways: [], loading: false });
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
        .select(`*, profiles(*), prizes(*)`)
        .eq('slug', slug)
        .single();

      if (error) throw error;
      set({ currentGiveaway: data, loading: false });
    } catch (error) {
      console.error('Error fetching giveaway:', error);
      set({ currentGiveaway: null, loading: false });
    }
  },

  createGiveaway: async (giveaway, prizes) => {
    try {
      const { data, error: insertGiveawayError } = await supabase
        .from('giveaways')
        .insert(giveaway)
        .select()
        .single();

      if (insertGiveawayError) throw insertGiveawayError;

      if (prizes.length > 0) {
        const prizesWithGiveawayId = prizes.map(prize => ({
          ...prize,
          giveaway_id: data.id
        }));

        const { error: prizesError } = await supabase.from('prizes').insert(prizesWithGiveawayId);
        if (prizesError) throw prizesError;
      }

      await get().fetchGiveaways();
      return data.id;
    } catch (error) {
      console.error('Error creating giveaway:', error);
      throw error;
    }
  },

  setSearchQuery: (query) => set({ searchQuery: query }),
  setStatusFilter: (status) => set({ statusFilter: status }),

  addParticipant: async (giveawayId, userId) => {
    try {
      const referralCode = `${userId.slice(0, 5)}-${Math.random().toString(36).slice(2, 7)}`;

      const { data: existing, error: checkError } = await supabase
        .from('participants')
        .select('*')
        .eq('giveaway_id', giveawayId)
        .eq('user_id', userId)
        .maybeSingle();

      if (checkError) throw checkError;
      if (existing) return;

      const { error } = await supabase.from('participants').insert({
        giveaway_id: giveawayId,
        user_id: userId,
        referral_code: referralCode,
        total_entries: 1,
      });

      if (error) throw error;

      const { data: giveaway } = await supabase
        .from('giveaways')
        .select('total_entries, unique_participants')
        .eq('id', giveawayId)
        .single();

      if (giveaway) {
        await supabase.from('giveaways').update({
          total_entries: (giveaway.total_entries || 0) + 1,
          unique_participants: (giveaway.unique_participants || 0) + 1,
        }).eq('id', giveawayId);
      }
    } catch (error) {
      console.error('Error adding participant:', error);
      throw error;
    }
  },

  fetchParticipants: async (giveawayId) => {
    try {
      const { data, error } = await supabase
        .from('participants')
        .select(`*, profiles:user_id(*)`)
        .eq('giveaway_id', giveawayId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching participants:', error);
      return [];
    }
  },

  selectRandomWinner: async (giveawayId, prizeId) => {
    try {
      const { data: participants, error } = await supabase
        .from('participants')
        .select('*')
        .eq('giveaway_id', giveawayId);

      if (error) throw error;
      if (!participants || participants.length === 0) {
        throw new Error('No participants found for this giveaway');
      }

      const randomIndex = Math.floor(Math.random() * participants.length);
      const winner = participants[randomIndex];

      const { data: winnerRecord, error: winnerError } = await supabase
        .from('winners')
        .insert({
          giveaway_id: giveawayId,
          prize_id: prizeId,
          participant_id: winner.id,
          status: 'pending_contact',
          drawn_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (winnerError) throw winnerError;

      return { winner, winnerRecord };
    } catch (error) {
      console.error('Error selecting winner:', error);
      throw error;
    }
  },
}));
