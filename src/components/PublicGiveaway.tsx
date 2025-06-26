import React, { useState, useEffect } from 'react';
import { Calendar, Trophy, Users, Share2, ExternalLink, CheckCircle, AlertCircle, Loader2, Gift } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Giveaway, Entry } from '../types';

interface PublicGiveawayProps {
  giveawayId: string;
}

export function PublicGiveaway({ giveawayId }: PublicGiveawayProps) {
  const [giveaway, setGiveaway] = useState<Giveaway | null>(null);
  const [loading, setLoading] = useState(true);
  const [entering, setEntering] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);
  const [entryForm, setEntryForm] = useState({
    name: '',
    email: '',
    socialHandle: '',
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadGiveaway();
  }, [giveawayId]);

  const loadGiveaway = async () => {
    try {
      // First get the giveaway
      const { data: giveawayData, error: giveawayError } = await supabase
        .from('giveaways')
        .select(`
          *,
          users (name)
        `)
        .eq('id', giveawayId)
        .eq('status', 'active')
        .single();

      if (giveawayError) throw giveawayError;

      // Then get the entries count
      const { count: entriesCount } = await supabase
        .from('entries')
        .select('*', { count: 'exact', head: true })
        .eq('giveaway_id', giveawayId);

      const transformedGiveaway: Giveaway = {
        id: giveawayData.id,
        title: giveawayData.title,
        description: giveawayData.description,
        prize: giveawayData.prize,
        platform: giveawayData.platform,
        status: giveawayData.status,
        startDate: giveawayData.start_date,
        endDate: giveawayData.end_date,
        entryMethods: giveawayData.entry_methods || [],
        entries: [], // We'll just use the count
        posterUrl: giveawayData.poster_url,
        socialPostId: giveawayData.social_post_id,
        userId: giveawayData.user_id,
        createdAt: giveawayData.created_at,
        updatedAt: giveawayData.updated_at,
        organizer: giveawayData.users?.name || 'Anonymous',
        entriesCount: entriesCount || 0,
      };

      setGiveaway(transformedGiveaway);

      // Check if user has already entered
      const userEmail = localStorage.getItem('user_email');
      if (userEmail) {
        const { data: existingEntry } = await supabase
          .from('entries')
          .select('id')
          .eq('giveaway_id', giveawayId)
          .eq('participant_email', userEmail)
          .single();
        
        setHasEntered(!!existingEntry);
      }
    } catch (error) {
      console.error('Error loading giveaway:', error);
      setMessage({ type: 'error', text: 'Giveaway not found or no longer active' });
    } finally {
      setLoading(false);
    }
  };

  const handleEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!giveaway || hasEntered) return;

    setEntering(true);
    setMessage(null);

    try {
      // Create entry
      const { data, error } = await supabase
        .from('entries')
        .insert([{
          giveaway_id: giveaway.id,
          participant_name: entryForm.name,
          participant_email: entryForm.email,
          participant_handle: entryForm.socialHandle,
          platform: giveaway.platform,
          verified: true,
        }])
        .select()
        .single();

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          setMessage({ type: 'error', text: 'This email has already entered the giveaway' });
          setHasEntered(true);
        } else {
          throw error;
        }
        return;
      }

      // Store email in localStorage to prevent re-entry
      localStorage.setItem('user_email', entryForm.email);
      
      setHasEntered(true);
      setMessage({ 
        type: 'success', 
        text: 'Entry successful! Good luck! 🍀' 
      });

      // Update entries count
      if (giveaway.entriesCount !== undefined) {
        setGiveaway(prev => prev ? { ...prev, entriesCount: prev.entriesCount! + 1 } : null);
      }
    } catch (error: any) {
      console.error('Error entering giveaway:', error);
      setMessage({ 
        type: 'error', 
        text: error.message || 'Failed to enter giveaway. Please try again.' 
      });
    } finally {
      setEntering(false);
    }
  };

  const shareGiveaway = () => {
    const url = window.location.href;
    const text = `🎉 Check out this amazing giveaway: ${giveaway?.title}! Win ${giveaway?.prize}! 🏆`;
    
    if (navigator.share) {
      navigator.share({
        title: giveaway?.title,
        text: text,
        url: url,
      });
    } else {
      navigator.clipboard.writeText(`${text} ${url}`);
      setMessage({ type: 'success', text: 'Giveaway link copied to clipboard!' });
    }
  };

  const isGiveawayActive = () => {
    if (!giveaway) return false;
    const now = new Date();
    const endDate = new Date(giveaway.endDate);
    return now < endDate && giveaway.status === 'active';
  };

  const getTimeRemaining = () => {
    if (!giveaway) return '';
    const now = new Date();
    const endDate = new Date(giveaway.endDate);
    const diff = endDate.getTime() - now.getTime();
    
    if (diff <= 0) return 'Ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h ${minutes}m remaining`;
    return `${minutes}m remaining`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="mx-auto text-purple-600 animate-spin mb-4" />
          <p className="text-gray-600">Loading giveaway...</p>
        </div>
      </div>
    );
  }

  if (!giveaway) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <AlertCircle size={64} className="mx-auto text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Giveaway Not Found</h1>
          <p className="text-gray-600 mb-6">
            This giveaway may have ended, been removed, or the link is invalid.
          </p>
          <a
            href="/"
            className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
          >
            Go to Homepage
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Gift size={32} className="text-purple-600" />
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                GiveawayHub
              </span>
            </div>
            <button
              onClick={shareGiveaway}
              className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Share2 size={16} />
              <span>Share</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Giveaway Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-8 text-white">
            <div className="text-center">
              <div className="bg-white/20 p-3 rounded-full w-fit mx-auto mb-4">
                <Trophy size={32} className="text-white" />
              </div>
              <h1 className="text-3xl font-bold mb-2">{giveaway.title}</h1>
              <p className="text-purple-100 mb-4">{giveaway.description}</p>
              <div className="bg-white/20 rounded-lg p-4 inline-block">
                <p className="text-lg font-semibold">🏆 Prize: {giveaway.prize}</p>
              </div>
            </div>
          </div>

          {/* Giveaway Image */}
          {giveaway.posterUrl && (
            <div className="relative">
              <img
                src={giveaway.posterUrl}
                alt={giveaway.title}
                className="w-full h-64 sm:h-80 object-cover"
                loading="lazy"
              />
              <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                {getTimeRemaining()}
              </div>
            </div>
          )}

          {/* Giveaway Info */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <Calendar className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Ends</p>
                <p className="font-semibold">
                  {new Date(giveaway.endDate).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              </div>
              <div className="text-center">
                <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Entries</p>
                <p className="font-semibold">{giveaway.entriesCount || 0}</p>
              </div>
              <div className="text-center">
                <Trophy className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Organized by</p>
                <p className="font-semibold">{giveaway.organizer}</p>
              </div>
            </div>

            {/* Entry Methods */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">How to Enter:</h3>
              <div className="space-y-2">
                {giveaway.entryMethods.map((method, index) => (
                  <div key={method.id} className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <span className="text-gray-700">{method.description}</span>
                    {method.required && (
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Required</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Message Display */}
            {message && (
              <div className={`mb-6 p-4 rounded-lg flex items-center space-x-2 ${
                message.type === 'success' 
                  ? 'bg-green-50 border border-green-200 text-green-800' 
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}>
                {message.type === 'success' ? (
                  <CheckCircle size={20} className="flex-shrink-0" />
                ) : (
                  <AlertCircle size={20} className="flex-shrink-0" />
                )}
                <span className="text-sm">{message.text}</span>
              </div>
            )}

            {/* Entry Form or Status */}
            {!isGiveawayActive() ? (
              <div className="text-center p-8 bg-gray-50 rounded-lg">
                <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Giveaway Ended</h3>
                <p className="text-gray-600">This giveaway has ended. Thank you to all participants!</p>
              </div>
            ) : hasEntered ? (
              <div className="text-center p-8 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle size={48} className="mx-auto text-green-600 mb-4" />
                <h3 className="text-lg font-semibold text-green-900 mb-2">You're Entered!</h3>
                <p className="text-green-700">Good luck! The winner will be announced when the giveaway ends.</p>
                <button
                  onClick={shareGiveaway}
                  className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 mx-auto"
                >
                  <Share2 size={16} />
                  <span>Share with Friends</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleEntry} className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Enter the Giveaway</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={entryForm.name}
                    onChange={(e) => setEntryForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter your full name"
                    disabled={entering}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={entryForm.email}
                    onChange={(e) => setEntryForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter your email address"
                    disabled={entering}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Social Media Handle
                  </label>
                  <input
                    type="text"
                    value={entryForm.socialHandle}
                    onChange={(e) => setEntryForm(prev => ({ ...prev, socialHandle: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Your social media handle (optional)"
                    disabled={entering}
                  />
                </div>

                <button
                  type="submit"
                  disabled={entering}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {entering ? (
                    <div className="flex items-center justify-center space-x-2">
                      <Loader2 size={20} className="animate-spin" />
                      <span>Entering...</span>
                    </div>
                  ) : (
                    'Enter Giveaway'
                  )}
                </button>

                <p className="text-xs text-gray-500 text-center">
                  By entering, you agree to follow the entry requirements and terms of the giveaway.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}