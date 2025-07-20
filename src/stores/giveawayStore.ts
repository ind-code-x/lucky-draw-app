// giveawayStore.ts

import { create } from 'zustand';
// Ensure these imports are correct based on your actual lib/supabase.ts content
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
    console.log('fetchGiveaways: Initiating fetch...'); 
    try {
      const { statusFilter } = get();
      let query = supabase
        .from('giveaways')
        .select(`*, profiles(*), prizes(*)`) // Corrected: Using table name directly for relationship
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;

      if (error) {
        console.error('fetchGiveaways: Supabase error details (first attempt):', error);
        // Fallback to basic query without joins if relationship fails
        // This fallback logic is still here from previous iterations, though
        // the primary issue was in the select syntax which is now fixed.
        const { data: basicData, error: basicError } = await supabase
          .from('giveaways')
          .select('*')
          .order('created_at', { ascending: false });

        if (basicError) {
          console.error('fetchGiveaways: Supabase error details (fallback):', basicError);
          throw basicError;
        }
        
        // Manually fetch organizer and prize data for fallback
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
        // Fallback logic
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
      // --- Explicitly and safely build the object from primitive types ---
      // This addresses the observed console log showing duplicate keys or hidden properties.
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

      console.log('createGiveaway: Stringified cleaned data:', JSON.stringify(cleanedGiveawayData, null, 2));

      const { data, error: insertGiveawayError } = await supabase
        .from('giveaways')
        .insert(cleanedGiveawayData)
        .select()
        .single();

      if (insertGiveawayError) {
        console.error('createGiveaway: Supabase insert giveaway error:', insertGiveawayError);
        throw insertGiveawayError;
      }
      
      if (!data || !data.id) { // Basic check for returned data
          throw new Error('createGiveaway: Inserted giveaway data is missing or invalid ID.');
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

      await get().fetchGiveaways(); // Refetch all giveaways to update the store state
      
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
        return; // Participant already exists, do nothing
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
      }
    } catch (error) {
      console.error('addParticipant: Error in addParticipant catch block:', error);
      throw error;
    }
  },

  fetchParticipants: async (giveawayId: string) => {
    console.log(`fetchParticipants: Fetching participants for giveaway ${giveawayId}`); 
    try {
      // Fix for PGRST200: Explicitly define the join path for profiles via user_id
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
          // Explicitly join to profiles table using the user_id (via auth.users implicitly)
          profiles:user_id( // The 'user_id' here is the foreign key column name in the participants table
              id,       // profile's id (which is same as auth.users.id)
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
  
  // NEW FUNCTION: fetchMyEntries (for MyEntriesPage)
  fetchMyEntries: async (userId: string) => {
    if (!userId) {
      console.warn('fetchMyEntries: userId is undefined, cannot fetch entries.');
      return [];
    }
    console.log(`fetchMyEntries: Fetching entries for user ${userId}`);
    try {
      const { data, error } = await supabase
        .from('participants')
        .select(`
          id,
          giveaway_id,
          user_id,
          total_entries,
          created_at,
          // Fetch related giveaway data
          giveaways(
            id,
            title,
            banner_url,
            end_time,
            status,
            organizer_id,
            // Fetch related organizer profile data via giveaways table
            profiles( // This refers to giveaways.organizer_id -> profiles.id
              username,
              email
            ),
            // Fetch entry_config for methods
            entry_config
          )
        `)
        .eq('user_id', userId) // Filter by the current user's ID
        .order('created_at', { ascending: false }); // Order by most recent entry

      if (error) {
        console.error('fetchMyEntries: Supabase error details:', error);
        throw error;
      }

      // Process data to match desired structure for display in MyEntriesPage
      const processedEntries = (data || []).map((entry: any) => ({
        id: entry.id, // participant_id
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
          entry_config: entry.giveaways?.entry_config || {} // Pass entry_config
        },
        entries: entry.total_entries || 0,
        // Extract methods from entry_config for display
        methods: Object.keys(entry.giveaways?.entry_config || {})
                       .filter(key => entry.giveaways?.entry_config[key].enabled)
                       .map(key => key.replace(/_/g, ' ')), // Format "instagram_follow" to "instagram follow"
        status: entry.giveaways?.status || 'unknown', // Use giveaway status for entry status
        joined_at: entry.created_at
      }));

      return processedEntries;
    } catch (error) {
      console.error('fetchMyEntries: Error in catch block:', error);
      return [];
    }
  },

  selectRandomWinner: async (giveawayId: string, prizeId: string) => {
    console.log(`selectRandomWinner: Selecting winner for giveaway ${giveawayId}, prize ${prizeId}`); 
    try {
      const { data: participants, error } = await supabase
        .from('participants')
        .select('*') // This select is fine if only participant data is needed
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
          participant_id: winner.id, // This is participant.id, not participant.user_id
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
