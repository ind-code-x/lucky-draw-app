import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, Trophy, Clock, Heart, Sparkles } from 'lucide-react';
import { Card } from '../ui/Card';
import { Giveaway } from '../../lib/supabase';
import { formatDistanceToNow, isAfter } from 'date-fns';

interface GiveawayCardProps {
  giveaway: Giveaway;
}

export const GiveawayCard: React.FC<GiveawayCardProps> = ({ giveaway }) => {
  const isEnded = isAfter(new Date(), new Date(giveaway.end_time));
  const timeLeft = formatDistanceToNow(new Date(giveaway.end_time), { addSuffix: true });

  return (
    <Card 
      hover 
      className="overflow-hidden h-full flex flex-col bg-white/90 backdrop-blur-sm border-pink-200 hover:border-maroon-300 hover:shadow-2xl transform hover:scale-105 transition-all duration-300" 
      padding="none"
    >
      {/* Banner Image */}
      <div className="relative h-48 bg-gradient-to-br from-maroon-500 via-pink-500 to-rose-400">
        {giveaway.banner_url ? (
          <img
            src={giveaway.banner_url}
            alt={giveaway.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-maroon-500 via-pink-500 to-rose-400 opacity-90"></div>
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2220%22 height=%2220%22 viewBox=%220 0 20 20%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.1%22%3E%3Ccircle cx=%2210%22 cy=%2210%22 r=%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50"></div>
            <Trophy className="w-16 h-16 text-white opacity-90 relative z-10" />
            <Sparkles className="w-8 h-8 text-pink-200 absolute top-4 right-4 animate-pulse" />
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-4 left-4">
          <span className={`px-4 py-2 rounded-full text-sm font-semibold shadow-lg backdrop-blur-sm ${
            isEnded 
              ? 'bg-gray-800/90 text-white' 
              : 'bg-white/90 text-maroon-700 animate-pulse-subtle'
          }`}>
            {isEnded ? 'Ended' : 'Active'}
          </span>
        </div>

        {/* Entry Count */}
        {giveaway.total_entries && (
          <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl px-4 py-2 shadow-lg">
            <div className="flex items-center space-x-2 text-sm font-semibold text-maroon-700">
              <Users className="w-4 h-4" />
              <span>{giveaway.total_entries} entries</span>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-maroon-800 mb-3 line-clamp-2 leading-tight">
            {giveaway.title}
          </h3>
          
          <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
            {giveaway.description}
          </p>

          {/* Organizer */}
          {giveaway.organizer && (
            <div className="mb-4">
              <div className="flex items-center space-x-2 text-sm bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg p-3">
                <div className="w-6 h-6 bg-gradient-to-br from-maroon-500 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    {giveaway.organizer.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="font-medium text-maroon-700">
                  by {giveaway.organizer.username}
                </span>
              </div>
            </div>
          )}

          {/* Prizes Preview */}
          {giveaway.prizes && giveaway.prizes.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center space-x-2 text-sm bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg p-3">
                <Trophy className="w-4 h-4 text-maroon-600" />
                <span className="font-medium text-maroon-700">
                  {giveaway.prizes.length === 1 
                    ? giveaway.prizes[0].name
                    : `${giveaway.prizes.length} amazing prizes available`
                  }
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-2 bg-pink-50 rounded-lg px-3 py-2">
              <Clock className="w-4 h-4 text-maroon-600" />
              <span className="font-medium">{isEnded ? 'Ended' : timeLeft}</span>
            </div>
            
            <div className="flex items-center space-x-2 bg-rose-50 rounded-lg px-3 py-2">
              <Calendar className="w-4 h-4 text-maroon-600" />
              <span className="font-medium">
                {new Date(giveaway.end_time).toLocaleDateString()}
              </span>
            </div>
          </div>

          <button
            onClick={() => alert(`Giveaway details for: ${giveaway.title}\n\nThis would normally navigate to the giveaway detail page.`)}
            className={`block w-full text-center py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl ${
              isEnded 
                ? 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white'
                : 'bg-gradient-to-r from-maroon-600 to-pink-600 hover:from-maroon-700 hover:to-pink-700 text-white'
            }`}
          >
            {isEnded ? (
              <>
                <Trophy className="w-4 h-4 inline mr-2" />
                View Results
              </>
            ) : (
              <>
                <Heart className="w-4 h-4 inline mr-2" />
                Enter Giveaway
              </>
            )}
          </button>
        </div>
      </div>
    </Card>
  );
};