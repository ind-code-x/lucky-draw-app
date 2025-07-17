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
    console.log('fetchGiveaways: Initiating fetch...'); 
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
        console.log('fetchGiveaways: Fallback data loaded.'); 
        return;
      }

      set({ giveaways: data || [], loading: false });
      console.log('fetchGiveaways: Data loaded successfully (with joins).', data); 
    } catch (error) {
      console.error('fetchGiveaways: Error in catch block:', error);
      set({ giveaways: [], loading: false });
    }
  },

  fetchGiveaway: async (slug: string) => {
    set({ loading: true });
    console.log(`fetchGiveaway: Initiating fetch for slug: ${slug}`); 
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
        console.log('fetchGiveaway: Fallback data loaded.', giveawayWithRelations); 
        return;
      }

      set({ currentGiveaway: data, loading: false });
      console.log('fetchGiveaway: Data loaded successfully (with joins).', data); 
    } catch (error) {
      console.error('fetchGiveaway: Error in catch block:', error);
      set({ currentGiveaway: null, loading: false });
    }
  },

  createGiveaway: async (giveaway, prizes) => {
    console.log('createGiveaway: function in store STARTED'); 
    console.log('createGiveaway: Attempting to insert giveaway (raw input from component):', giveaway);       

    let insertedGiveawayId: string = ''; 

    try {
      // --- CRITICAL FIX: Explicitly and safely build the object from primitive types ---
      // This will ensure no hidden properties or duplicate keys from the input 'giveaway' object.
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
          status: String(giveaway.status), 
          entry_config: giveaway.entry_config || {}, 
          total_entries: Number(giveaway.total_entries) || 0,
          unique_participants: Number(giveaway.unique_participants) || 0,
      };

      const { data, error: insertGiveawayError } = await supabase
        .from('giveaways')
        .insert(cleanedGiveawayData) // Pass the explicitly constructed object
        .select()
        .single();

      if (insertGiveawayError) {
        console.error('createGiveaway: Supabase insert giveaway error:', insertGiveawayError);
        throw insertGiveawayError;
      }
      
      insertedGiveawayId = data.id; 
      console.log('createGiveaway: Giveaway inserted successfully with ID:', insertedGiveawayId);

      // Create prizes
      if (prizes.length > 0) {
        const cleanedPrizes = prizes.map(p => ({
            name: String(p.name),
            value: Number(p.value) || 0,
            quantity: Number(p.quantity) || 1,
            description: p.description ? String(p.description) : null,
        }));
        console.log('createGiveaway: Attempting to insert prizes (cleaned):', cleanedPrizes);

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
        console.log('createGiveaway: Prizes inserted successfully.');
      }

      await get().fetchGiveaways(); 
      
      console.log('createGiveaway: function in store FINISHED, returning ID:', insertedGiveawayId);
      return insertedGiveawayId;
    } catch (error) {
      console.error('createGiveaway: Error in createGiveaway catch block:', error);
      throw error;
    }
  },

  setSearchQuery: (query: string) => set({ searchQuery: query }),
  setStatusFilter: (status: string) => set({ statusFilter: status }),

  addParticipant: async (giveawayId: string, userId: string) => {
    console.log(`addParticipant: Adding participant ${userId} to giveaway ${giveawayId}`); 
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
        console.log('addParticipant: Participant already exists, not adding again.');
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
      console.log('addParticipant: Participant added successfully.');
      
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
        console.log('addParticipant: Giveaway entries updated successfully.'); 
      }
    } catch (error) {
      console.error('addParticipant: Error in addParticipant catch block:', error);
      throw error;
    }
  },

  fetchParticipants: async (giveawayId: string) => {
    console.log(`fetchParticipants: Fetching participants for giveaway ${giveawayId}`); 
    try {
      const { data, error } = await supabase
        .from('participants')
        .select(`*, profiles:user_id(*)`)
        .eq('giveaway_id', giveawayId);
        
      if (error) {
        console.error('fetchParticipants: Supabase error details:', error); 
        throw error;
      }
      console.log('fetchParticipants: Data loaded.', data); 
      return data || [];
    } catch (error) {
      console.error('fetchParticipants: Error in catch block:', error);
      return [];
    }
  },
  
  selectRandomWinner: async (giveawayId: string, prizeId: string) => {
    console.log(`selectRandomWinner: Selecting winner for giveaway ${giveawayId}, prize ${prizeId}`); 
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
      console.log('selectRandomWinner: Participants found:', participants.length); 
      
      const randomIndex = Math.floor(Math.random() * participants.length);
      const winner = participants[randomIndex];
      console.log('selectRandomWinner: Randomly selected winner:', winner.id); 
      
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
      console.log('selectRandomWinner: Winner record inserted successfully.', winnerRecord); 
      
      return { winner, winnerRecord };
    } catch (error) {
      console.error('selectRandomWinner: Error in selectRandomWinner catch block:', error);
      throw error;
    }
  }
}));
