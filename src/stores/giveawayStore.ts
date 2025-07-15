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
  addParticipant: (giveawayId: string, userId: string) => Promise<void>;
  fetchParticipants: (giveawayId: string) => Promise<any[]>;
  selectRandomWinner: (giveawayId: string, prizeId: string) => Promise<any>;
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
          profiles(*),
          prizes(*)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error details:', error);
        // Fallback to basic query without joins if relationship fails
        const { data: basicData, error: basicError } = await supabase
          .from('giveaways')
          .select('*')
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
          profiles(*),
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

  addParticipant: async (giveawayId: string, userId: string) => {
    try {
      // Generate a unique referral code
      const referralCode = `${userId.substring(0, 5)}-${Math.random().toString(36).substring(2, 7)}`;
      
      // First check if the participant already exists
      const { data: existingParticipant, error: checkError } = await supabase
        .from('participants')
        .select('*')
        .eq('giveaway_id', giveawayId)
        .eq('user_id', userId)
        .maybeSingle();
      
      if (checkError) throw checkError;
      
      // If participant already exists, don't add again
      if (existingParticipant) {
        return;
      }
      
      // Add new participant
      const { error } = await supabase
        .from('participants')
        .insert({
          giveaway_id: giveawayId,
          user_id: userId,
          referral_code: referralCode,
          total_entries: 1, // Start with one entry
        });
        
      if (error) throw error;
      
      // Update the giveaway's total entries and unique participants
      const { data: giveaway } = await supabase
        .from('giveaways')
        .select('total_entries, unique_participants')
        .eq('id', giveawayId)
        .single();
        
      if (giveaway) {
        await supabase
          .from('giveaways')
          .update({
            total_entries: (giveaway.total_entries || 0) + 1,
            unique_participants: (giveaway.unique_participants || 0) + 1
          })
          .eq('id', giveawayId);
      }
    } catch (error) {
      console.error('Error adding participant:', error);
      throw error;
    }
  },

  fetchParticipants: async (giveawayId: string) => {
    try {
      const { data, error } = await supabase
        .from('participants')
        .select(`
          *,
          profiles:user_id(*)
        `)
        .eq('giveaway_id', giveawayId);
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching participants:', error);
      return [];
    }
  },
  
  selectRandomWinner: async (giveawayId: string, prizeId: string) => {
    try {
      // Get all participants for this giveaway
      const { data: participants, error } = await supabase
        .from('participants')
        .select('*')
        .eq('giveaway_id', giveawayId);
        
      if (error) throw error;
      if (!participants || participants.length === 0) {
        throw new Error('No participants found for this giveaway');
      }
      
      // Select a random participant
      const randomIndex = Math.floor(Math.random() * participants.length);
      const winner = participants[randomIndex];
      
      // Record the winner in the winners table
      const { data: winnerRecord, error: winnerError } = await supabase
        .from('winners')
        .insert({
          giveaway_id: giveawayId,
          prize_id: prizeId,
          participant_id: winner.id,
          status: 'pending_contact',
          drawn_at: new Date().toISOString()
        })
        .select()
        .single();
        
      if (winnerError) throw winnerError;
      
      return { winner, winnerRecord };
    } catch (error) {
      console.error('Error selecting winner:', error);
      throw error;
    }
  }
}));
