import React, { useState } from 'react';
import {
  Instagram,
  Users,
  Trophy,
  Shuffle,
  Download,
  Copy,
  Sparkles,
  CheckCircle,
  X,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  BarChart3,
  Settings,
  Info,
  Shield
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { isValidInstagramUrl } from '../../lib/instagram';
import toast from 'react-hot-toast';

interface Comment {
  id: string;
  username: string;
  text: string;
  timestamp?: string;
  profileUrl?: string;
  verified?: boolean;
  like_count?: number;
}

interface Winner {
  id: string;
  username: string;
  text: string;
  position: number;
  profileUrl?: string;
}

export const InstagramCommentPickerPage: React.FC = () => {
  const [instagramUrl, setInstagramUrl] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [winners, setWinners] = useState<Winner[]>([]);
  const [numberOfWinners, setNumberOfWinners] = useState(1);
  const [allowDuplicateUsers, setAllowDuplicateUsers] = useState(false);
  const [includeReplies, setIncludeReplies] = useState(true);
  const [filterSpam, setFilterSpam] = useState(true);
  const [maxComments, setMaxComments] = useState(1000);
  const [isLoading, setIsLoading] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isApiConfigured] = useState(!!import.meta.env.VITE_INSTAGRAM_ACCESS_TOKEN);
  const [isCollecting, setIsCollecting] = useState(false);

  const accessToken = import.meta.env.VITE_INSTAGRAM_ACCESS_TOKEN;

  const extractPostId = (url: string): string | null => {
    const match = url.match(/(?:\/p\/|\/reel\/|\/tv\/)([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  };

  const extractComments = async () => {
    if (!instagramUrl.trim()) {
      toast.error('Please enter an Instagram post URL');
      return;
    }

    if (!isValidInstagramUrl(instagramUrl)) {
      toast.error('Please enter a valid Instagram post or reel URL');
      return;
    }

    setIsLoading(true);
    setIsCollecting(true);
    setComments([]);
    setWinners([]);

    try {
      // Step 1: Get user's pages
      const pagesResponse = await fetch(
        `https://graph.facebook.com/v19.0/me/accounts?access_token=${accessToken}`
      );
      
      if (!pagesResponse.ok) {
        const error = await pagesResponse.json();
        throw new Error(error.error?.message || 'Failed to fetch Facebook pages');
      }

      const pagesData = await pagesResponse.json();
      
      if (!pagesData.data || pagesData.data.length === 0) {
        throw new Error('No Facebook pages found. Make sure your access token has pages_show_list permission.');
      }

      // Step 2: Find Instagram Business Account
      let instagramAccountId = null;
      let pageAccessToken = null;

      for (const page of pagesData.data) {
        try {
          const igResponse = await fetch(
            `https://graph.facebook.com/v19.0/712069925320615?fields=instagram_business_account&access_token=${accessToken}`
          );
          
          if (igResponse.ok) {
            const igData = await igResponse.json();
            if (igData.instagram_business_account) {
              instagramAccountId = igData.instagram_business_account.id;
              pageAccessToken = page.access_token;
              break;
            }
          }
        } catch (error) {
          console.log('No Instagram account for page:', page.name);
        }
      }

      if (!instagramAccountId) {
        throw new Error('No Instagram Business Account found. Make sure your Facebook page is connected to an Instagram Business Account.');
      }

      // Step 3: Get Instagram media to find the post
      const mediaResponse = await fetch(
        `https://graph.facebook.com/v19.0/${instagramAccountId}/media?fields=id,media_url,permalink,timestamp&limit=50&access_token=${pageAccessToken || accessToken}`
      );

      if (!mediaResponse.ok) {
        const error = await mediaResponse.json();
        throw new Error(error.error?.message || 'Failed to fetch Instagram media');
      }

      const mediaData = await mediaResponse.json();
      
      if (!mediaData.data || mediaData.data.length === 0) {
        throw new Error('No Instagram posts found in your account.');
      }

      // Find the matching post
      const postId = extractPostId(instagramUrl);
      const targetPost = mediaData.data.find(post => 
        post.permalink?.includes(postId || '') || 
        post.id === postId
      );

      if (!targetPost) {
        throw new Error(`Post not found in your Instagram Business Account. Make sure the URL is from your own account and the post exists.`);
      }

      // Step 4: Get comments for the post
      const commentsResponse = await fetch(
        `https://graph.facebook.com/v19.0/${targetPost.id}/comments?fields=id,text,username,timestamp,like_count,replies{id,text,username,timestamp}&limit=100&access_token=${pageAccessToken || accessToken}`
      );

      if (!commentsResponse.ok) {
        const error = await commentsResponse.json();
        throw new Error(error.error?.message || 'Failed to fetch comments');
      }

      const commentsData = await commentsResponse.json();
      
      if (!commentsData.data || commentsData.data.length === 0) {
        toast.warning('No comments found on this post');
        setIsCollecting(false);
        return;
      }

      setComments(commentsData.data);
      toast.success(`Fetched ${commentsData.data.length} comments.`);
    } catch (err: any) {
      toast.error(err.message || 'An unexpected error occurred');
      } finally {
      setIsLoading(false);
      setIsCollecting(false);
    }
  };
      
  // Draw winners
  const drawWinners = () => {
    if (comments.length === 0) {
      toast.error('No comments to draw from');
      return;
    }

    if (numberOfWinners > comments.length) {
      toast.error(`Cannot draw ${numberOfWinners} winners from ${comments.length} comments`);
      return;
    }

    setIsDrawing(true);

    setTimeout(() => {
      let availableComments = [...comments];
      const selectedWinners: Winner[] = [];

      if (!allowDuplicateUsers) {
        const uniqueUsers = new Map();
        availableComments.forEach(comment => {
          if (!uniqueUsers.has(comment.username.toLowerCase())) {
            uniqueUsers.set(comment.username.toLowerCase(), comment);
          }
        });
        availableComments = Array.from(uniqueUsers.values());
      }

      for (let i = 0; i < numberOfWinners && availableComments.length > 0; i++) {
        const randomIndex = Math.floor(Math.random() * availableComments.length);
        const winner = availableComments[randomIndex];
        
        selectedWinners.push({
          id: winner.id,
          username: winner.username,
          text: winner.text,
          position: i + 1,
          profileUrl: winner.profileUrl
        });

        if (!allowDuplicateUsers) {
          availableComments = availableComments.filter(c => 
            c.username.toLowerCase() !== winner.username.toLowerCase()
          );
        } else {
          availableComments.splice(randomIndex, 1);
        }
      }

      setWinners(selectedWinners);
      setIsDrawing(false);
      toast.success(`🎉 ${selectedWinners.length} winner(s) selected!`);
    }, 2000);
  };

  // Export results
  const exportResults = () => {
    if (winners.length === 0) {
      toast.error('No winners to export');
      return;
    }

    const exportData = {
      giveaway: {
        timestamp: new Date().toISOString(),
        instagramUrl: instagramUrl,
        tool: 'GiveawayHub Instagram Comment Picker',
        version: '2.0.0'
      },
      settings: {
        numberOfWinners,
        allowDuplicateUsers,
        includeReplies,
        filterSpam,
        maxComments
      },
      statistics: {
        totalComments: comments.length,
        uniqueUsers: new Set(comments.map(c => c.username.toLowerCase())).size,
        totalLikes: comments.reduce((sum, c) => sum + (c.like_count || 0), 0)
      },
      winners: winners.map(w => ({
        position: w.position,
        username: w.username,
        comment: w.text,
        profileUrl: w.profileUrl
      })),
      allComments: comments.map(c => ({
        username: c.username,
        text: c.text,
        profileUrl: c.profileUrl,
        verified: c.verified,
        timestamp: c.timestamp,
        like_count: c.like_count
      }))
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `instagram-giveaway-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Results exported successfully!');
  };

  // Copy winners
  const copyWinners = () => {
    if (winners.length === 0) {
      toast.error('No winners to copy');
      return;
    }

    const winnersText = winners
      .map(w => `${w.position}. @${w.username}: ${w.text}`)
      .join('\n');

    navigator.clipboard.writeText(winnersText).then(() => {
      toast.success('Winners copied to clipboard!');
    }).catch(() => {
      toast.error('Failed to copy to clipboard');
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-maroon-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="bg-gradient-to-br from-pink-500 to-rose-500 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl relative">
            <Instagram className="w-10 h-10 text-white" />
            <Sparkles className="w-4 h-4 text-pink-200 absolute -top-1 -right-1 animate-pulse" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-maroon-700 to-pink-600 bg-clip-text text-transparent mb-4">
            Instagram Comment Picker
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Extract comments from Instagram posts using the Instagram Graph API and randomly select winners for your giveaways.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* API Configuration Notice */}
            {!isApiConfigured && (
              <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-gradient-to-br from-amber-500 to-orange-500 p-3 rounded-xl">
                      <Shield className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-amber-800 mb-2">Instagram API Configuration Required</h3>
                      <p className="text-amber-700 leading-relaxed mb-4">
                        To extract real Instagram comments, you need to configure your Instagram Graph API credentials. 
                        The tool will show demo data until configured.
                      </p>
                      <div className="bg-white/60 rounded-lg p-4 border border-amber-200">
                        <h4 className="font-semibold text-amber-800 mb-2">Required Environment Variables:</h4>
                        <ul className="text-sm text-amber-700 space-y-1">
                          <li>• <code>VITE_INSTAGRAM_ACCESS_TOKEN</code> - Your Instagram Graph API access token</li>
                          <li>• <code>VITE_INSTAGRAM_APP_ID</code> - Your Instagram App ID</li>
                          <li>• <code>VITE_INSTAGRAM_APP_SECRET</code> - Your Instagram App Secret</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* URL Input */}
            <Card className="bg-white/90 backdrop-blur-sm border-pink-200 shadow-xl">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-maroon-800 flex items-center">
                  <Instagram className="w-5 h-5 mr-3 text-pink-600" />
                  Instagram Post URL
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Input
                    placeholder="https://www.instagram.com/p/ABC123..."
                    value={instagramUrl}
                    onChange={(e) => setInstagramUrl(e.target.value)}
                    className="border-pink-200 focus:border-maroon-400 focus:ring-maroon-400"
                  />
                  
                  <Button
                    onClick={extractComments}
                    disabled={!instagramUrl.trim() || isLoading}
                    loading={isLoading}
                    fullWidth
                    size="lg"
                    icon={RefreshCw}
                    className="bg-gradient-to-r from-maroon-600 to-pink-600 hover:from-maroon-700 hover:to-pink-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  >
                    {isLoading ? 'Extracting Comments...' : 'Extract Comments'}
                  </Button>

                  {!isValidInstagramUrl(instagramUrl) && instagramUrl.trim() && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <div className="flex items-start space-x-3">
                        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                        <div className="text-sm text-red-700">
                          Please enter a valid Instagram post or reel URL (e.g., https://www.instagram.com/p/ABC123/)
                        </div>
                      </div>
                    </div>
                  )}

                  {isApiConfigured && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-start space-x-3">
                        <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div className="text-sm text-blue-700">
                          <p className="font-semibold mb-1">Instagram Business Account Required</p>
                          <p>This tool works with Instagram Business Accounts connected to Facebook Pages. Make sure:</p>
                          <ul className="mt-2 space-y-1 text-xs">
                            <li>• Your Instagram account is a Business Account</li>
                            <li>• It's connected to a Facebook Page</li>
                            <li>• The post URL is from your own account</li>
                            <li>• Your access token has the required permissions</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Advanced Settings */}
            <Card className="bg-white/90 backdrop-blur-sm border-pink-200 shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold text-maroon-800 flex items-center">
                    <Settings className="w-5 h-5 mr-3 text-pink-600" />
                    Advanced Settings
                  </CardTitle>
                  <Button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    variant="ghost"
                    size="sm"
                    className="text-maroon-600 hover:text-pink-600 hover:bg-pink-50"
                  >
                    {showAdvanced ? 'Hide' : 'Show'}
                  </Button>
                </div>
              </CardHeader>
              {showAdvanced && (
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Max Comments"
                      type="number"
                      min="1"
                      max="5000"
                      value={maxComments}
                      onChange={(e) => setMaxComments(parseInt(e.target.value) || 1000)}
                      className="border-pink-200 focus:border-maroon-400 focus:ring-maroon-400"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="includeReplies"
                        checked={includeReplies}
                        onChange={(e) => setIncludeReplies(e.target.checked)}
                        className="h-4 w-4 text-maroon-600 focus:ring-maroon-500 border-pink-300 rounded"
                      />
                      <label htmlFor="includeReplies" className="text-sm font-medium text-gray-700">
                        Include comment replies
                      </label>
                    </div>

                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="filterSpam"
                        checked={filterSpam}
                        onChange={(e) => setFilterSpam(e.target.checked)}
                        className="h-4 w-4 text-maroon-600 focus:ring-maroon-500 border-pink-300 rounded"
                      />
                      <label htmlFor="filterSpam" className="text-sm font-medium text-gray-700">
                        Filter spam comments
                      </label>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Comments Display */}
            {comments.length > 0 && (
              <Card className="bg-white/90 backdrop-blur-sm border-pink-200 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-maroon-800 flex items-center">
                    <Users className="w-5 h-5 mr-3 text-pink-600" />
                    Extracted Comments ({comments.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="max-h-96 overflow-y-auto space-y-3">
                    {comments.slice(0, 20).map((comment) => (
                      <div
                        key={comment.id}
                        className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="font-semibold text-maroon-800">@{comment.username}</span>
                              {comment.verified && <CheckCircle className="w-4 h-4 text-blue-500" />}
                              {comment.like_count !== undefined && comment.like_count > 0 && (
                                <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                                  ❤️ {comment.like_count}
                                </span>
                              )}
                              {comment.profileUrl && (
                                <a
                                  href={comment.profileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-500 hover:text-blue-700"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                            <p className="text-gray-700 text-sm">{comment.text}</p>
                            {comment.timestamp && (
                              <p className="text-gray-500 text-xs mt-1">
                                {new Date(comment.timestamp).toLocaleString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {comments.length > 20 && (
                      <div className="text-center py-4 text-gray-500">
                        ... and {comments.length - 20} more comments
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* API Configuration Status */}
            <Card className="bg-white/90 backdrop-blur-sm border-pink-200 shadow-xl">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-maroon-800">API Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Access Token:</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      import.meta.env.VITE_INSTAGRAM_ACCESS_TOKEN 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {import.meta.env.VITE_INSTAGRAM_ACCESS_TOKEN ? 'Configured' : 'Missing'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">App ID:</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      import.meta.env.VITE_INSTAGRAM_APP_ID 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {import.meta.env.VITE_INSTAGRAM_APP_ID ? 'Configured' : 'Missing'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">API Version:</span>
                    <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">
                      {import.meta.env.VITE_INSTAGRAM_API_VERSION || 'v19.0'}
                    </span>
                  </div>
                  {!isApiConfigured && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-3">
                      <p className="text-xs text-amber-700">
                        Configure Instagram API credentials in your environment variables to extract real comments.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Statistics */}
            {comments.length > 0 && (
              <Card className="bg-white/90 backdrop-blur-sm border-pink-200 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-maroon-800 flex items-center">
                    <BarChart3 className="w-5 h-5 mr-3 text-pink-600" />
                    Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-blue-800">{comments.length}</div>
                      <div className="text-sm text-blue-600">Total Comments</div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-purple-800">
                        {new Set(comments.map(c => c.username.toLowerCase())).size}
                      </div>
                      <div className="text-sm text-purple-600">Unique Users</div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-red-800">
                      {comments.reduce((sum, c) => sum + (c.like_count || 0), 0)}
                    </div>
                    <div className="text-sm text-red-600">Total Likes</div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Winner Selection */}
            <Card className="bg-white/90 backdrop-blur-sm border-pink-200 shadow-xl">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-maroon-800 flex items-center">
                  <Trophy className="w-5 h-5 mr-3 text-pink-600" />
                  Winner Selection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="Number of Winners"
                  type="number"
                  min="1"
                  max={comments.length || 1}
                  value={numberOfWinners}
                  onChange={(e) => setNumberOfWinners(parseInt(e.target.value) || 1)}
                  className="border-pink-200 focus:border-maroon-400 focus:ring-maroon-400"
                />

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="allowDuplicates"
                    checked={allowDuplicateUsers}
                    onChange={(e) => setAllowDuplicateUsers(e.target.checked)}
                    className="h-4 w-4 text-maroon-600 focus:ring-maroon-500 border-pink-300 rounded"
                  />
                  <label htmlFor="allowDuplicates" className="text-sm font-medium text-gray-700">
                    Allow duplicate users
                  </label>
                </div>

                <Button
                  onClick={drawWinners}
                  disabled={comments.length === 0 || isDrawing}
                  loading={isDrawing}
                  fullWidth
                  size="lg"
                  icon={Shuffle}
                  className="bg-gradient-to-r from-maroon-600 to-pink-600 hover:from-maroon-700 hover:to-pink-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  {isDrawing ? 'Drawing Winners...' : 'Draw Winners'}
                </Button>

                {comments.length > 0 && (
                  <div className="text-xs text-gray-500 text-center">
                    Drawing from {comments.length} comments
                    {!allowDuplicateUsers && (
                      <span> ({new Set(comments.map(c => c.username.toLowerCase())).size} unique users)</span>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Winners Display */}
            {winners.length > 0 && (
              <Card className="bg-white/90 backdrop-blur-sm border-pink-200 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-maroon-800 flex items-center">
                    <Trophy className="w-5 h-5 mr-3 text-pink-600" />
                    🎉 Winners
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {winners.map((winner) => (
                      <div
                        key={winner.id}
                        className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4"
                      >
                        <div className="flex items-start space-x-3">
                          <div className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                            {winner.position}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-semibold text-maroon-800">@{winner.username}</span>
                              {winner.profileUrl && (
                                <a
                                  href={winner.profileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-500 hover:text-blue-700"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                            <p className="text-gray-700 text-sm">{winner.text}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      onClick={copyWinners}
                      size="sm"
                      icon={Copy}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    >
                      Copy
                    </Button>
                    <Button
                      onClick={exportResults}
                      size="sm"
                      icon={Download}
                      className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    >
                      Export
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
