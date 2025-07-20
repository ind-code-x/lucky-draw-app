// giveawayStore.ts

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
  fetchMyEntries: (userId: string) => Promise<any[]>; // Added for MyEntriesPage
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
        console.error('fetchGiveaways: Supabase error details (first attempt):', error);
        const { data: basicData, error: basicError } = await supabase
          .from('giveaways')
          .select('*')
          .order('created_at', { ascending: false });

        if (basicError) {
          console.error('fetchGiveaways: Supabase error details (fallback):', basicError);
          throw basicError;
        }
        
        const giveawaysWithOrganizers = await Promise.all(
          (basicData || []).map(async (giveaway) => {
            const { data: organizer, error: organizerError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', giveaway.organizer_id)
              .single();

            if (organizerError && organizerError.code !== 'PGRST116') { 
                console.warn(`fetchGiveaways: Error fetching organizer for ${giveaway.id}:`, organizerError);
            }

            const { data: prizes, error: prizesFetchError } = await supabase
              .from('prizes')
              .select('*')
              .eq('giveaway_id', giveaway.id);

            if (prizesFetchError) {
                console.warn(`fetchGiveaways: Error fetching prizes for ${giveaway.id}:`, prizesFetchError);
            }

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
      console.error('fetchGiveaways: Error in catch block:', error);
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

      if (error) {
        console.error('fetchGiveaway: Supabase error details (first attempt):', error);
        const { data: basicData, error: basicError } = await supabase
          .from('giveaways')
          .select('*')
          .eq('slug', slug)
          .single();

        if (basicError) {
          console.error('fetchGiveaway: Supabase error details (fallback):', basicError);
          throw basicError;
        }

        const { data: organizer, error: organizerError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', basicData.organizer_id)
          .single();
        
        if (organizerError && organizerError.code !== 'PGRST116') {
            console.warn(`fetchGiveaway: Error fetching organizer for ${basicData.id}:`, organizerError);
        }

        const { data: prizes, error: prizesFetchError } = await supabase
          .from('prizes')
          .select('*')
          .eq('giveaway_id', basicData.id);
        
        if (prizesFetchError) {
            console.warn(`fetchGiveaway: Error fetching prizes for ${basicData.id}:`, prizesFetchError);
        }

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
      console.error('fetchGiveaway: Error in catch block:', error);
      set({ currentGiveaway: null, loading: false });
    }
  },

  createGiveaway: async (giveaway, prizes) => {
    try {
      const cleanedGiveawayData = {
          organizer_id: String(giveaway.organizer_id), 
          title: String(giveaway.title),
          slug: String(giveaway.slug),
          description: String(giveaway.description),
          rules: giveaway.rules ? String(giveaway.rules) : null, 
          banner_url: giveaway.banner_url ? String(giveaway.banner_url) : null,
          start_time: String(giveaway.start_time),
          end_time: String(giveaway.end_time),
          announce_time: String(giveaway.announce_time),
          status: giveaway.status ? String(giveaway.status) : 'active', 
          entry_config: giveaway.entry_config || {}, 
          total_entries: Number(giveaway.total_entries) || 0,
          unique_participants: Number(giveaway.unique_participants) || 0,
      };

      const { data, error: insertGiveawayError } = await supabase
        .from('giveaways')
        .insert(cleanedGiveawayData)
        .select()
        .single();

      if (insertGiveawayError) {
        console.error('createGiveaway: Supabase insert giveaway error:', insertGiveawayError);
        throw insertGiveawayError;
      }
      
      if (!data || !data.id) { 
          throw new Error('createGiveaway: Inserted giveaway data is missing or invalid ID.');
      }

      const insertedGiveawayId = data.id;

      if (prizes.length > 0) {
        const cleanedPrizes = prizes.map(p => ({
            name: String(p.name),
            value: Number(p.value) || 0,
            quantity: Number(p.quantity) || 1,
            description: p.description ? String(p.description) : null,
        }));

        const prizesWithGiveawayId = cleanedPrizes.map(prize => ({
          ...prize,
          giveaway_id: insertedGiveawayId,
        }));

        const { error: prizesError } = await supabase
          .from('prizes')
          .insert(prizesWithGiveawayId);

        if (prizesError) {
          console.error('createGiveaway: Supabase insert prizes error:', prizesError);
          throw prizesError;
        }
      }

      await get().fetchGiveaways(); 
      
      return insertedGiveawayId;
    } catch (error) {
      console.error('createGiveaway: Error in createGiveaway catch block:', error);
      throw error;
    }
  },

  setSearchQuery: (query: string) => set({ searchQuery: query }),
  setStatusFilter: (status: string) => set({ statusFilter: status }),

  addParticipant: async (giveawayId: string, userId: string) => {
    try {
      const referralCode = `${userId.substring(0, 5)}-${Math.random().toString(36).substring(2, 7)}`;
      
      const { data: existingParticipant, error: checkError } = await supabase
        .from('participants')
        .select('*')
        .eq('giveaway_id', giveawayId)
        .eq('user_id', userId)
        .maybeSingle();
      
      if (checkError) {
        console.error('addParticipant: Error checking existing participant:', checkError); 
        throw checkError;
      }
      
      if (existingParticipant) {
        return; 
      }
      
      const { error } = await supabase
        .from('participants')
        .insert({
          giveaway_id: giveawayId,
          user_id: userId,
          referral_code: referralCode,
          total_entries: 1, 
        });
        
      if (error) {
        console.error('addParticipant: Error inserting new participant:', error); 
        throw error;
      }
      
      const { data: giveaway, error: giveawayUpdateError } = await supabase
        .from('giveaways')
        .select('total_entries, unique_participants')
        .eq('id', giveawayId)
        .single();
        
      if (giveawayUpdateError) {
        console.error('addParticipant: Error fetching giveaway for update:', giveawayUpdateError); 
      }
      
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
      console.error('addParticipant: Error in addParticipant catch block:', error);
      throw error;
    }
  },

  fetchParticipants: async (giveawayId: string) => {
    try {
      const { data, error } = await supabase
        .from('participants')
        .select(`
          id, 
          giveaway_id,
          user_id,
          referral_code,
          referred_by_user_id,
          total_entries,
          created_at,
          profiles:user_id( // Fix for PGRST200: Use explicit foreign key name if needed, or simply profiles()
              id,       
              username,
              email,
              avatar_url
          )
        `) 
        .eq('giveaway_id', giveawayId);
        
      if (error) {
        console.error('fetchParticipants: Supabase error details:', error); 
        throw error;
      }
      return data || [];
    } catch (error) {
      console.error('fetchParticipants: Error in catch block:', error);
      return [];
    }
  },
  
  fetchMyEntries: async (userId: string) => {
    if (!userId) {
      console.warn('fetchMyEntries: userId is undefined, cannot fetch entries.');
      return [];
    }
    try {
      const { data, error } = await supabase
        .from('participants')
        .select(`
          id,
          giveaway_id,
          user_id,
          total_entries,
          created_at,
          giveaways(
            id,
            title,
            banner_url,
            end_time,
            status,
            organizer_id,
            profiles( // This refers to giveaways.organizer_id -> profiles.id
              username,
              email
            ),
            entry_config
          )
        `)
        .eq('user_id', userId) 
        .order('created_at', { ascending: false });

      if (error) {
        console.error('fetchMyEntries: Supabase error details:', error);
        throw error;
      }

      const processedEntries = (data || []).map((entry: any) => ({
        id: entry.id, 
        giveaway: {
          id: entry.giveaways?.id,
          title: entry.giveaways?.title,
          banner_url: entry.giveaways?.banner_url,
          end_time: entry.giveaways?.end_time,
          status: entry.giveaways?.status,
          organizer: { 
            username: entry.giveaways?.profiles?.username || 'Unknown',
            email: entry.giveaways?.profiles?.email || 'N/A'
          },
          entry_config: entry.giveaways?.entry_config || {} 
        },
        entries: entry.total_entries || 0,
        methods: Object.keys(entry.giveaways?.entry_config || {})
                       .filter(key => entry.giveaways?.entry_config[key].enabled)
                       .map(key => key.replace(/_/g, ' ')), 
        status: entry.giveaways?.status || 'unknown', 
        joined_at: entry.created_at
      }));

      return processedEntries;
    } catch (error) {
      console.error('fetchMyEntries: Error in catch block:', error);
      return [];
    }
  },

  selectRandomWinner: async (giveawayId: string, prizeId: string) => {
    try {
      const { data: participants, error } = await supabase
        .from('participants')
        .select('*') 
        .eq('giveaway_id', giveawayId);
        
      if (error) {
        console.error('selectRandomWinner: Error fetching participants:', error); 
        throw error;
      }
      if (!participants || participants.length === 0) {
        throw new Error('selectRandomWinner: No participants found for this giveaway');
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
          drawn_at: new Date().toISOString()
        })
        .select()
        .single();
        
      if (winnerError) {
        console.error('selectRandomWinner: Error inserting winner record:', winnerError); 
        throw winnerError;
      }
      
      return { winner, winnerRecord };
    } catch (error) {
      console.error('selectRandomWinner: Error in selectRandomWinner catch block:', error);
      throw error;
    }
  }
}));
