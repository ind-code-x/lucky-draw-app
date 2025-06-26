export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: string;
}

export interface Giveaway {
  id: string;
  title: string;
  description: string;
  prize: string;
  platform: SocialPlatform;
  status: 'draft' | 'active' | 'completed';
  startDate: string;
  endDate: string;
  entryMethods: EntryMethod[];
  entries: Entry[];
  winner?: Entry;
  userId: string;
  createdAt: string;
  updatedAt: string;
  posterUrl?: string;
  socialPostId?: string;
  organizer?: string;
  entriesCount?: number; // For performance optimization
}

export interface Entry {
  id: string;
  giveawayId: string;
  participantName: string;
  participantEmail: string;
  participantHandle: string;
  platform: SocialPlatform;
  verified: boolean;
  entryDate: string;
}

export interface EntryMethod {
  id: string;
  type: 'follow' | 'like' | 'comment' | 'share' | 'tag' | 'subscribe' | 'visit';
  description: string;
  required: boolean;
  platform: SocialPlatform;
}

export type SocialPlatform = 'instagram' | 'facebook' | 'twitter' | 'tiktok' | 'youtube' | 'whatsapp';

export interface Analytics {
  totalGiveaways: number;
  activeGiveaways: number;
  totalEntries: number;
  averageEngagement: number;
  platformBreakdown: Record<SocialPlatform, number>;
  monthlyGrowth: number;
}