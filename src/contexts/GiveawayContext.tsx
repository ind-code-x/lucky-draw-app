import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { Giveaway, Entry, Analytics } from '../types';

interface GiveawayContextType {
  giveaways: Giveaway[];
  analytics: Analytics;
  createGiveaway: (giveaway: Omit<Giveaway, 'id' | 'createdAt' | 'updatedAt' | 'entries'>) => Promise<Giveaway>;
  updateGiveaway: (id: string, updates: Partial<Giveaway>) => Promise<void>;
  deleteGiveaway: (id: string) => Promise<void>;
  selectWinner: (giveawayId: string) => Promise<Entry | null>;
  addEntry: (giveawayId: string, entry: Omit<Entry, 'id' | 'entryDate'>) => Promise<void>;
  loading: boolean;
}

const GiveawayContext = createContext<GiveawayContextType | undefined>(undefined);

export function useGiveaways() {
  const context = useContext(GiveawayContext);
  if (context === undefined) {
    throw new Error('useGiveaways must be used within a GiveawayProvider');
  }
  return context;
}

export function GiveawayProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [giveaways, setGiveaways] = useState<Giveaway[]>([]);
  const [analytics, setAnalytics] = useState<Analytics>({
    totalGiveaways: 0,
    activeGiveaways: 0,
    totalEntries: 0,
    averageEngagement: 0,
    platformBreakdown: {
      instagram: 0,
      facebook: 0,
      twitter: 0,
      tiktok: 0,
      youtube: 0,
      whatsapp: 0,
    },
    monthlyGrowth: 0,
  });
  const [loading, setLoading] = useState(false);

  // Load giveaways from Supabase with aggressive optimization
  useEffect(() => {
    if (user) {
      loadGiveaways();
    } else {
      setGiveaways([]);
      setLoading(false);
    }
  }, [user]);

  const loadGiveaways = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Load only essential giveaway data without entries
      const { data: giveawaysData, error: giveawaysError } = await supabase
        .from('giveaways')
        .select(`
          id,
          title,
          description,
          prize,
          platform,
          status,
          start_date,
          end_date,
          entry_methods,
          poster_url,
          created_at,
          updated_at
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20); // Limit to recent giveaways for performance

      if (giveawaysError) throw giveawaysError;

      // Get entry counts separately for better performance
      const giveawayIds = (giveawaysData || []).map(g => g.id);
      let entryCounts: Record<string, number> = {};

      if (giveawayIds.length > 0) {
        const { data: entryCountData } = await supabase
          .from('entries')
          .select('giveaway_id')
          .in('giveaway_id', giveawayIds);

        // Count entries per giveaway
        entryCounts = (entryCountData || []).reduce((acc, entry) => {
          acc[entry.giveaway_id] = (acc[entry.giveaway_id] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
      }

      // Transform data to match our types
      const transformedGiveaways: Giveaway[] = (giveawaysData || []).map(g => ({
        id: g.id,
        title: g.title,
        description: g.description,
        prize: g.prize,
        platform: g.platform as any,
        status: g.status as any,
        startDate: g.start_date,
        endDate: g.end_date,
        entryMethods: g.entry_methods || [],
        entries: [], // Empty array for performance, use entriesCount instead
        entriesCount: entryCounts[g.id] || 0,
        posterUrl: g.poster_url,
        socialPostId: '',
        userId: user.id,
        createdAt: g.created_at,
        updatedAt: g.updated_at,
      }));

      setGiveaways(transformedGiveaways);
      calculateAnalytics(transformedGiveaways);
    } catch (error) {
      console.error('Error loading giveaways:', error);
      // Set empty state on error to prevent infinite loading
      setGiveaways([]);
      setAnalytics({
        totalGiveaways: 0,
        activeGiveaways: 0,
        totalEntries: 0,
        averageEngagement: 0,
        platformBreakdown: {
          instagram: 0,
          facebook: 0,
          twitter: 0,
          tiktok: 0,
          youtube: 0,
          whatsapp: 0,
        },
        monthlyGrowth: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalytics = (giveawaysList: Giveaway[]) => {
    const totalGiveaways = giveawaysList.length;
    const activeGiveaways = giveawaysList.filter(g => {
      const now = new Date();
      const endDate = new Date(g.endDate);
      return g.status === 'active' && endDate > now;
    }).length;
    
    const totalEntries = giveawaysList.reduce((sum, g) => sum + (g.entriesCount || 0), 0);
    
    const platformBreakdown = giveawaysList.reduce((acc, g) => {
      acc[g.platform] = (acc[g.platform] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    setAnalytics({
      totalGiveaways,
      activeGiveaways,
      totalEntries,
      averageEngagement: totalEntries > 0 ? Math.round((totalEntries / totalGiveaways) * 10) / 10 : 0,
      platformBreakdown: {
        instagram: platformBreakdown.instagram || 0,
        facebook: platformBreakdown.facebook || 0,
        twitter: platformBreakdown.twitter || 0,
        tiktok: platformBreakdown.tiktok || 0,
        youtube: platformBreakdown.youtube || 0,
        whatsapp: platformBreakdown.whatsapp || 0,
      },
      monthlyGrowth: 23.5, // This would be calculated based on historical data
    });
  };

  const createGiveaway = async (giveawayData: Omit<Giveaway, 'id' | 'createdAt' | 'updatedAt' | 'entries'>): Promise<Giveaway> => {
    if (!user) throw new Error('User not authenticated');

    try {
      console.log('Creating giveaway with user ID:', user.id);
      
      // Verify user exists in database before creating giveaway
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single();

      if (userError || !userData) {
        console.log('User not found in database, creating profile...');
        // Create user profile if it doesn't exist
        const { error: createUserError } = await supabase
          .from('users')
          .upsert({
            id: user.id,
            email: user.email,
            name: user.name,
            subscription_status: 'free',
          }, {
            onConflict: 'id'
          });

        if (createUserError) {
          console.error('Error creating user profile:', createUserError);
          throw new Error('Failed to create user profile');
        }
      }

      const { data, error } = await supabase
        .from('giveaways')
        .insert([{
          user_id: user.id,
          title: giveawayData.title,
          description: giveawayData.description,
          prize: giveawayData.prize,
          platform: giveawayData.platform,
          status: giveawayData.status,
          start_date: giveawayData.startDate,
          end_date: giveawayData.endDate,
          entry_methods: giveawayData.entryMethods,
          poster_url: (giveawayData as any).posterUrl,
          social_post_id: (giveawayData as any).socialPostId,
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating giveaway:', error);
        throw error;
      }

      const newGiveaway: Giveaway = {
        id: data.id,
        title: data.title,
        description: data.description,
        prize: data.prize,
        platform: data.platform,
        status: data.status,
        startDate: data.start_date,
        endDate: data.end_date,
        entryMethods: data.entry_methods || [],
        entries: [],
        entriesCount: 0,
        posterUrl: data.poster_url,
        socialPostId: data.social_post_id,
        userId: data.user_id,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };

      // Add to local state instead of reloading everything
      setGiveaways(prev => [newGiveaway, ...prev]);
      
      return newGiveaway;
    } catch (error) {
      console.error('Error creating giveaway:', error);
      throw error;
    }
  };

  const updateGiveaway = async (id: string, updates: Partial<Giveaway>) => {
    try {
      const { error } = await supabase
        .from('giveaways')
        .update({
          title: updates.title,
          description: updates.description,
          prize: updates.prize,
          platform: updates.platform,
          status: updates.status,
          start_date: updates.startDate,
          end_date: updates.endDate,
          entry_methods: updates.entryMethods,
          poster_url: (updates as any).posterUrl,
          social_post_id: (updates as any).socialPostId,
          winner_id: updates.winner?.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setGiveaways(prev => 
        prev.map(giveaway => 
          giveaway.id === id 
            ? { ...giveaway, ...updates, updatedAt: new Date().toISOString() }
            : giveaway
        )
      );
    } catch (error) {
      console.error('Error updating giveaway:', error);
      throw error;
    }
  };

  const deleteGiveaway = async (id: string) => {
    try {
      const { error } = await supabase
        .from('giveaways')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setGiveaways(prev => prev.filter(giveaway => giveaway.id !== id));
    } catch (error) {
      console.error('Error deleting giveaway:', error);
      throw error;
    }
  };

  const selectWinner = async (giveawayId: string): Promise<Entry | null> => {
    // Load entries for this specific giveaway
    const { data: entries } = await supabase
      .from('entries')
      .select('*')
      .eq('giveaway_id', giveawayId);

    if (!entries || entries.length === 0) return null;
    
    const randomIndex = Math.floor(Math.random() * entries.length);
    const winnerData = entries[randomIndex];
    
    const winner: Entry = {
      id: winnerData.id,
      giveawayId: winnerData.giveaway_id,
      participantName: winnerData.participant_name,
      participantEmail: winnerData.participant_email,
      participantHandle: winnerData.participant_handle,
      platform: winnerData.platform,
      verified: winnerData.verified,
      entryDate: winnerData.entry_date,
    };
    
    await updateGiveaway(giveawayId, { winner, status: 'completed' });
    return winner;
  };

  const addEntry = async (giveawayId: string, entryData: Omit<Entry, 'id' | 'entryDate'>) => {
    try {
      const { data, error } = await supabase
        .from('entries')
        .insert([{
          giveaway_id: giveawayId,
          participant_name: entryData.participantName,
          participant_email: entryData.participantEmail,
          participant_handle: entryData.participantHandle,
          platform: entryData.platform,
          verified: entryData.verified,
        }])
        .select()
        .single();

      if (error) throw error;

      // Update local giveaway entry count
      setGiveaways(prev =>
        prev.map(giveaway =>
          giveaway.id === giveawayId
            ? { ...giveaway, entriesCount: (giveaway.entriesCount || 0) + 1 }
            : giveaway
        )
      );
    } catch (error) {
      console.error('Error adding entry:', error);
      throw error;
    }
  };

  return (
    <GiveawayContext.Provider value={{
      giveaways,
      analytics,
      createGiveaway,
      updateGiveaway,
      deleteGiveaway,
      selectWinner,
      addEntry,
      loading,
    }}>
      {children}
    </GiveawayContext.Provider>
  );
}