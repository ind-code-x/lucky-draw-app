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
  const [loading, setLoading] = useState(true);

  // Load giveaways from Supabase
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
      
      // Load giveaways
      const { data: giveawaysData, error: giveawaysError } = await supabase
        .from('giveaways')
        .select(`
          *,
          entries (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (giveawaysError) throw giveawaysError;

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
        entries: (g.entries || []).map((e: any) => ({
          id: e.id,
          giveawayId: e.giveaway_id,
          participantName: e.participant_name,
          participantEmail: e.participant_email,
          participantHandle: e.participant_handle,
          platform: e.platform as any,
          verified: e.verified,
          entryDate: e.entry_date,
        })),
        posterUrl: g.poster_url,
        socialPostId: g.social_post_id,
        userId: g.user_id,
        createdAt: g.created_at,
        updatedAt: g.updated_at,
      }));

      setGiveaways(transformedGiveaways);
      calculateAnalytics(transformedGiveaways);
    } catch (error) {
      console.error('Error loading giveaways:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalytics = (giveawaysList: Giveaway[]) => {
    const totalGiveaways = giveawaysList.length;
    const activeGiveaways = giveawaysList.filter(g => g.status === 'active').length;
    const totalEntries = giveawaysList.reduce((sum, g) => sum + g.entries.length, 0);
    
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
      const { data, error } = await supabase
        .from('giveaways')
        .insert([{
          user_id: giveawayData.userId,
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

      if (error) throw error;

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
        posterUrl: data.poster_url,
        socialPostId: data.social_post_id,
        userId: data.user_id,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };

      // Reload giveaways to get the updated list
      await loadGiveaways();
      
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
    const giveaway = giveaways.find(g => g.id === giveawayId);
    if (!giveaway || giveaway.entries.length === 0) return null;
    
    const randomIndex = Math.floor(Math.random() * giveaway.entries.length);
    const winner = giveaway.entries[randomIndex];
    
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

      // Update local state
      const newEntry: Entry = {
        id: data.id,
        giveawayId: data.giveaway_id,
        participantName: data.participant_name,
        participantEmail: data.participant_email,
        participantHandle: data.participant_handle,
        platform: data.platform,
        verified: data.verified,
        entryDate: data.entry_date,
      };

      setGiveaways(prev =>
        prev.map(giveaway =>
          giveaway.id === giveawayId
            ? { ...giveaway, entries: [...giveaway.entries, newEntry] }
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