// giveawayStore.ts

import { create } from 'zustand';
import { supabase, Giveaway, Prize } from '../lib/supabase'; // Assuming 'supabase' is your initialized Supabase client

interface GiveawayState {
  giveaways: Giveaway[];
  currentGiveaway: Giveaway | null;
  loading: boolean;
  searchQuery: string;
  statusFilter: string;
  fetchGiveaways: () => Promise<void>;
  fetchGiveaway: (slug: string) => Promise<void>;
  createGiveaway: (giveaway: Partial<Giveaway>, prizes: Partial<Prize>[]) => Promise<string | null>; // Changed return type to allow null
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
    console.log('fetchGiveaways: Initiating fetch...'); // Debug log
    try {
      const { data, error } = await supabase
        .from('giveaways')
        .select(`
          *,
          profiles(*), // Corrected: Using table name directly for relationship
          prizes(*)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('fetchGiveaways: Supabase error details (first attempt):', error);
        // Fallback to basic query without joins if relationship fails
        const { data: basicData, error: basicError } = await supabase
          .from('giveaways')
          .select('*')
          .order('created_at', { ascending: false });

        if (basicError) {
          console.error('fetchGiveaways: Supabase error details (fallback):', basicError);
          throw basicError;
        }
        
        // Manually fetch organizer data for each giveaway
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
        console.log('fetchGiveaways: Fallback data loaded.'); // Debug log
        return;
      }

      set({ giveaways: data || [], loading: false });
      console.log('fetchGiveaways: Data loaded successfully (with joins).', data); // Debug log
    } catch (error) {
      console.error('fetchGiveaways: Error in catch block:', error);
      set({ giveaways: [], loading: false });
    }
  },

  fetchGiveaway: async (slug: string) => {
    set({ loading: true });
    console.log(`fetchGiveaway: Initiating fetch for slug: ${slug}`); // Debug log
    try {
      const { data, error } = await supabase
        .from('giveaways')
        .select(`
          *,
          profiles(*), // Corrected: Using table name directly for relationship
          prizes(*)
        `)
        .eq('slug', slug)
        .single();

      if (error) {
        console.error('fetchGiveaway: Supabase error details (first attempt):', error);
        // Fallback to basic query without joins
        const { data: basicData, error: basicError } = await supabase
          .from('giveaways')
          .select('*')
          .eq('slug', slug)
          .single();

        if (basicError) {
          console.error('fetchGiveaway: Supabase error details (fallback):', basicError);
          throw basicError;
        }

        // Manually fetch related data
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
        console.log('fetchGiveaway: Fallback data loaded.', giveawayWithRelations); // Debug log
        return;
      }

      set({ currentGiveaway: data, loading: false });
      console.log('fetchGiveaway: Data loaded successfully (with joins).', data); // Debug log
    } catch (error) {
      console.error('fetchGiveaway: Error in catch block:', error);
      set({ currentGiveaway: null, loading: false });
    }
  },

  createGiveaway: async (giveaway: Partial<Giveaway>, prizes: Partial<Prize>[]) => {
    console.log('createGiveaway: function in store STARTED'); 
    console.log('createGiveaway: Attempting to insert giveaway:', giveaway);       
    let insertedGiveawayId: string | null = null; // Variable to hold the inserted ID

    try {
      // MODIFIED SYNTAX: Use { data, error } and then retrieve data if no error
      // Removed .single() here to rule out issues with that, still return 'id'
      const { data, error: insertGiveawayError } = await supabase
        .from('giveaways')
        .insert(giveaway)
        .select('id', giveaway.organizer_id)
        .single(); // Select only the ID, expecting an array of results now

      if (insertGiveawayError) {
        console.error('createGiveaway: Supabase insert giveaway error:', insertGiveawayError);
        throw insertGiveawayError;
      }
      
      // Since .single() was removed, data will be an array. Ensure it's not empty.
      if (!data || data.length === 0 || !data[0].id) {
          throw new Error('createGiveaway: Inserted giveaway data is missing or invalid ID.');
      }

      insertedGiveawayId = data[0].id; // Capture the ID from the first (and only) inserted row
      console.log('createGiveaway: Giveaway inserted successfully with ID:', insertedGiveawayId);

      // Create prizes
      if (prizes.length > 0) {
        console.log('createGiveaway: Attempting to insert prizes:', prizes);
        const prizesWithGiveawayId = prizes.map(prize => ({
          ...prize,
          giveaway_id: insertedGiveawayId, // Use the captured ID here
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

      console.log('createGiveaway: function in store FINISHED');
      return insertedGiveawayId; // Return the ID
    } catch (error) {
      console.error('createGiveaway: Error in createGiveaway catch block:', error);
      throw error;
    }
  },

  setSearchQuery: (query: string) => set({ searchQuery: query }),
  setStatusFilter: (status: string) => set({ statusFilter: status }),

  addParticipant: async (giveawayId: string, userId: string) => {
    console.log(`addParticipant: Adding participant ${userId} to giveaway ${giveawayId}`); // Debug log
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
      
      if (checkError) {
        console.error('addParticipant: Error checking existing participant:', checkError); // Debug log
        throw checkError;
      }
      
      // If participant already exists, don't add again
      if (existingParticipant) {
        console.log('addParticipant: Participant already exists, not adding again.');
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
        
      if (error) {
        console.error('addParticipant: Error inserting new participant:', error); // Debug log
        throw error;
      }
      console.log('addParticipant: Participant added successfully.');
      
      // Update the giveaway's total entries and unique participants
      const { data: giveaway, error: giveawayUpdateError } = await supabase
        .from('giveaways')
        .select('total_entries, unique_participants')
        .eq('id', giveawayId)
        .single();
        
      if (giveawayUpdateError) {
        console.error('addParticipant: Error fetching giveaway for update:', giveawayUpdateError); // Debug log
        // This is a non-critical error, so we log but don't re-throw to avoid blocking
      }
      
      if (giveaway) {
        await supabase
          .from('giveaways')
          .update({
            total_entries: (giveaway.total_entries || 0) + 1,
            unique_participants: (giveaway.unique_participants || 0) + 1
          })
          .eq('id', giveawayId);
        console.log('addParticipant: Giveaway entries updated successfully.'); // Debug log
      }
    } catch (error) {
      console.error('addParticipant: Error in addParticipant catch block:', error);
      throw error;
    }
  },

  fetchParticipants: async (giveawayId: string) => {
    console.log(`fetchParticipants: Fetching participants for giveaway ${giveawayId}`); // Debug log
    try {
      const { data, error } = await supabase
        .from('participants')
        .select(`
          *,
          profiles:user_id(*)
        `)
        .eq('giveaway_id', giveawayId);
        
      if (error) {
        console.error('fetchParticipants: Supabase error details:', error); // Debug log
        throw error;
      }
      console.log('fetchParticipants: Data loaded.', data); // Debug log
      return data || [];
    } catch (error) {
      console.error('fetchParticipants: Error in catch block:', error);
      return [];
    }
  },
  
  selectRandomWinner: async (giveawayId: string, prizeId: string) => {
    console.log(`selectRandomWinner: Selecting winner for giveaway ${giveawayId}, prize ${prizeId}`); // Debug log
    try {
      // Get all participants for this giveaway
      const { data: participants, error } = await supabase
        .from('participants')
        .select('*')
        .eq('giveaway_id', giveawayId);
        
      if (error) {
        console.error('selectRandomWinner: Error fetching participants:', error); // Debug log
        throw error;
      }
      if (!participants || participants.length === 0) {
        throw new Error('selectRandomWinner: No participants found for this giveaway');
      }
      console.log('selectRandomWinner: Participants found:', participants.length); // Debug log
      
      // Select a random participant
      const randomIndex = Math.floor(Math.random() * participants.length);
      const winner = participants[randomIndex];
      console.log('selectRandomWinner: Randomly selected winner:', winner.id); // Debug log
      
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
        
      if (winnerError) {
        console.error('selectRandomWinner: Error inserting winner record:', winnerError); // Debug log
        throw winnerError;
      }
      console.log('selectRandomWinner: Winner record inserted successfully.', winnerRecord); // Debug log
      
      return { winner, winnerRecord };
    } catch (error) {
      console.error('selectRandomWinner: Error in selectRandomWinner catch block:', error);
      throw error;
    }
  }
}));
