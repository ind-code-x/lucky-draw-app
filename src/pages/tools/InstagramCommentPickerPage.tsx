import React, { useState, useEffect } from 'react';
import { 
  Instagram, 
  Upload, 
  Users, 
  Trophy, 
  Shuffle, 
  Download,
  Copy,
  Settings,
  Filter,
  Sparkles,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  X,
  FileText,
  Link as LinkIcon,
  Info,
  Chrome,
  Code,
  Play,
  ExternalLink,
  Package,
  Zap,
  Globe,
  RefreshCw,
  Eye,
  Clock,
  Shield,
  Target,
  BarChart3,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Hash,
  AtSign,
  MessageCircle,
  Star,
  Trash2,
  Edit3,
  Save,
  Plus,
  Minus,
  Award,
  Crown,
  PartyPopper,
  Heart
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { InstagramLimitationsGuide } from '../../components/tools/InstagramLimitationsGuide';
import { PythonScriptGuide } from '../../components/tools/PythonScriptGuide';
import toast from 'react-hot-toast';

interface Comment {
  id: string;
  username: string;
  text: string;
  timestamp?: string;
  isValid: boolean;
  reason?: string;
  profileUrl?: string;
  verified?: boolean;
  mentions: string[];
  hashtags: string[];
  likeCount?: number;
  replies?: Comment[];
}

interface Winner {
  id: string;
  username: string;
  text: string;
  position: number;
  profileUrl?: string;
  mentions: string[];
  hashtags: string[];
  timestamp?: string;
  likeCount?: number;
  selectionMethod: string;
  selectionTimestamp: string;
}

interface FilterRule {
  id: string;
  type: 'include' | 'exclude';
  field: 'text' | 'username' | 'mentions' | 'hashtags';
  operator: 'contains' | 'equals' | 'starts_with' | 'ends_with' | 'regex';
  value: string;
  enabled: boolean;
}

interface InstagramApiResponse {
  data?: Array<{
    id: string;
    media_url?: string;
    permalink?: string;
    timestamp?: string;
  }>;
  comments?: {
    data: Array<{
      id: string;
      text: string;
      username: string;
      timestamp: string;
      like_count?: number;
      replies?: {
        data: Array<{
          id: string;
          text: string;
          username: string;
          timestamp: string;
        }>;
      };
    }>;
  };
}

export const InstagramCommentPickerPage: React.FC = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [winners, setWinners] = useState<Winner[]>([]);
  const [numberOfWinners, setNumberOfWinners] = useState(1);
  const [allowDuplicateUsers, setAllowDuplicateUsers] = useState(false);
  const [minCommentLength, setMinCommentLength] = useState(0);
  const [maxCommentLength, setMaxCommentLength] = useState(0);
  const [requireMentions, setRequireMentions] = useState(false);
  const [minMentions, setMinMentions] = useState(1);
  const [requireHashtags, setRequireHashtags] = useState(false);
  const [minHashtags, setMinHashtags] = useState(1);
  const [excludeVerified, setExcludeVerified] = useState(false);
  const [minLikes, setMinLikes] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [instagramUrl, setInstagramUrl] = useState('');
  const [rawInput, setRawInput] = useState('');
  const [filterRules, setFilterRules] = useState<FilterRule[]>([]);
  const [showFilterBuilder, setShowFilterBuilder] = useState(false);
  const [sortBy, setSortBy] = useState<'random' | 'oldest' | 'newest' | 'mentions' | 'length' | 'likes'>('random');
  const [showStats, setShowStats] = useState(true);
  const [collectionMethod, setCollectionMethod] = useState<'manual' | 'api' | 'extension' | 'python'>('manual');
  const [accessToken, setAccessToken] = useState('');
  const [isCollecting, setIsCollecting] = useState(false);
  const [activeTab, setActiveTab] = useState<'collect' | 'limitations' | 'python'>('collect');

  // Parse Instagram URL to extract post info
  const parseInstagramUrl = (url: string) => {
    const postMatch = url.match(/instagram\.com\/p\/([^\/\?]+)/);
    const reelMatch = url.match(/instagram\.com\/reel\/([^\/\?]+)/);
    const userMatch = url.match(/instagram\.com\/([^\/\?]+)/);
    
    return {
      postId: postMatch?.[1] || reelMatch?.[1],
      username: userMatch?.[1],
      isPost: !!postMatch,
      isReel: !!reelMatch,
      isValid: !!(postMatch || reelMatch)
    };
  };

  // Extract mentions and hashtags from text
  const extractMentionsAndHashtags = (text: string) => {
    const mentions = (text.match(/@[\w.]+/g) || []).map(m => m.substring(1));
    const hashtags = (text.match(/#[\w]+/g) || []).map(h => h.substring(1));
    return { mentions, hashtags };
  };

  // Parse comments from various formats
  const parseComments = (text: string): Comment[] => {
    if (!text.trim()) return [];

    const lines = text.split('\n').filter(line => line.trim());
    const parsedComments: Comment[] = [];

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return;

      let username = '';
      let commentText = '';

      // Format 1: @username: comment text
      const format1 = trimmedLine.match(/^@([^:]+):\s*(.+)$/);
      if (format1) {
        username = format1[1].trim();
        commentText = format1[2].trim();
      }
      // Format 2: username | comment text
      else if (trimmedLine.includes(' | ')) {
        const parts = trimmedLine.split(' | ');
        username = parts[0].replace('@', '').trim();
        commentText = parts.slice(1).join(' | ').trim();
      }
      // Format 3: username - comment text
      else if (trimmedLine.includes(' - ')) {
        const parts = trimmedLine.split(' - ');
        username = parts[0].replace('@', '').trim();
        commentText = parts.slice(1).join(' - ').trim();
      }
      // Format 4: username comment text (space separated)
      else {
        const parts = trimmedLine.split(/\s+/);
        if (parts.length >= 2) {
          username = parts[0].replace('@', '');
          commentText = parts.slice(1).join(' ');
        } else {
          username = `user_${index + 1}`;
          commentText = trimmedLine;
        }
      }

      if (username && commentText) {
        const { mentions, hashtags } = extractMentionsAndHashtags(commentText);
        
        const comment: Comment = {
          id: `comment_${Date.now()}_${index}`,
          username: username,
          text: commentText,
          isValid: true,
          profileUrl: `https://instagram.com/${username}`,
          mentions,
          hashtags,
          timestamp: new Date().toISOString(),
          likeCount: 0
        };

        const validation = validateComment(comment);
        comment.isValid = validation.isValid;
        comment.reason = validation.reason;

        parsedComments.push(comment);
      }
    });

    return parsedComments;
  };

  // Validate comment against all rules
  const validateComment = (comment: Comment): { isValid: boolean; reason?: string } => {
    // Length validation
    if (minCommentLength > 0 && comment.text.length < minCommentLength) {
      return { isValid: false, reason: `Comment too short (min ${minCommentLength} chars)` };
    }

    if (maxCommentLength > 0 && comment.text.length > maxCommentLength) {
      return { isValid: false, reason: `Comment too long (max ${maxCommentLength} chars)` };
    }

    // Mentions validation
    if (requireMentions && comment.mentions.length < minMentions) {
      return { isValid: false, reason: `Needs at least ${minMentions} mention(s)` };
    }

    // Hashtags validation
    if (requireHashtags && comment.hashtags.length < minHashtags) {
      return { isValid: false, reason: `Needs at least ${minHashtags} hashtag(s)` };
    }

    // Verified user filter
    if (excludeVerified && comment.verified) {
      return { isValid: false, reason: 'Verified users excluded' };
    }

    // Minimum likes filter
    if (minLikes > 0 && (comment.likeCount || 0) < minLikes) {
      return { isValid: false, reason: `Needs at least ${minLikes} like(s)` };
    }

    // Custom filter rules
    for (const rule of filterRules.filter(r => r.enabled)) {
      const fieldValue = getFieldValue(comment, rule.field);
      const matches = checkRuleMatch(fieldValue, rule.operator, rule.value);
      
      if (rule.type === 'include' && !matches) {
        return { isValid: false, reason: `Must ${rule.operator} "${rule.value}" in ${rule.field}` };
      }
      
      if (rule.type === 'exclude' && matches) {
        return { isValid: false, reason: `Cannot ${rule.operator} "${rule.value}" in ${rule.field}` };
      }
    }

    return { isValid: true };
  };

  const getFieldValue = (comment: Comment, field: string): string => {
    switch (field) {
      case 'text': return (comment.text ?? '').toLowerCase();
      case 'username': return (comment.username ?? '').toLowerCase();
      case 'mentions': return comment.mentions.join(' ').toLowerCase();
      case 'hashtags': return comment.hashtags.join(' ').toLowerCase();
      default: return '';
    }
  };

  const checkRuleMatch = (value: string, operator: string, ruleValue: string): boolean => {
    const lowerRuleValue = (ruleValue ?? '').toLowerCase();
    
    switch (operator) {
      case 'contains': return value.includes(lowerRuleValue);
      case 'equals': return value === lowerRuleValue;
      case 'starts_with': return value.startsWith(lowerRuleValue);
      case 'ends_with': return value.endsWith(lowerRuleValue);
      case 'regex':
        try {
          return new RegExp(ruleValue, 'i').test(value);
        } catch {
          return false;
        }
      default: return false;
    }
  };

  // Collect comments via Instagram Graph API
  const collectViaAPI = async () => {
    if (!accessToken.trim()) {
      toast.error('Please enter your Instagram Graph API access token');
      return;
    }

    if (!instagramUrl.trim()) {
      toast.error('Please enter an Instagram post URL');
      return;
    }

    const urlInfo = parseInstagramUrl(instagramUrl);
    if (!urlInfo.isValid) {
      toast.error('Please enter a valid Instagram post or reel URL');
      return;
    }

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
            `https://graph.facebook.com/v19.0/${page.id}?fields=instagram_business_account&access_token=${accessToken}`
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

      const mediaData: InstagramApiResponse = await mediaResponse.json();
      
      if (!mediaData.data || mediaData.data.length === 0) {
        throw new Error('No Instagram posts found in your account.');
      }

      // Find the matching post
      const targetPost = mediaData.data.find(post => 
        post.permalink?.includes(urlInfo.postId || '') || 
        post.id === urlInfo.postId
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

      // Process comments
      const processedComments: Comment[] = [];

      commentsData.data.forEach((comment: any) => {
        const { mentions, hashtags } = extractMentionsAndHashtags(comment.text || '');
        
        const processedComment: Comment = {
          id: comment.id,
          username: comment.username || 'unknown_user',
          text: comment.text || '',
          timestamp: comment.timestamp,
          isValid: true,
          profileUrl: `https://instagram.com/${comment.username || 'unknown_user'}`,
          mentions,
          hashtags,
          likeCount: comment.like_count || 0
        };

        const validation = validateComment(processedComment);
        processedComment.isValid = validation.isValid;
        processedComment.reason = validation.reason;

        processedComments.push(processedComment);

        // Process replies if they exist
        if (comment.replies && comment.replies.data) {
          comment.replies.data.forEach((reply: any) => {
            const { mentions: replyMentions, hashtags: replyHashtags } = extractMentionsAndHashtags(reply.text || '');
            
            const processedReply: Comment = {
              id: reply.id,
              username: reply.username || 'unknown_user',
              text: reply.text || '',
              timestamp: reply.timestamp,
              isValid: true,
              profileUrl: `https://instagram.com/${reply.username || 'unknown_user'}`,
              mentions: replyMentions,
              hashtags: replyHashtags,
              likeCount: 0
            };

            const replyValidation = validateComment(processedReply);
            processedReply.isValid = replyValidation.isValid;
            processedReply.reason = replyValidation.reason;

            processedComments.push(processedReply);
          });
        }
      });

      setComments(processedComments);
      
      const validCount = processedComments.filter(c => c.isValid).length;
      const invalidCount = processedComments.length - validCount;
      
      toast.success(
        `🎉 Collected ${processedComments.length} comments via Instagram API! (${validCount} valid, ${invalidCount} filtered)`
      );

    } catch (error: any) {
      console.error('Instagram API Error:', error);
      toast.error(error.message || 'Failed to collect comments via Instagram API');
    } finally {
      setIsCollecting(false);
    }
  };

  // Handle input changes and auto-parse
  const handleInputChange = (text: string) => {
    setRawInput(text);
    if (text.trim()) {
      const parsedComments = parseComments(text);
      setComments(parsedComments);
      setWinners([]);
      
      const validCount = parsedComments.filter(c => c.isValid).length;
      const invalidCount = parsedComments.length - validCount;
      
      if (parsedComments.length > 0) {
        toast.success(
          `Parsed ${parsedComments.length} comments (${validCount} valid, ${invalidCount} filtered)`
        );
      }
    } else {
      setComments([]);
      setWinners([]);
    }
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      handleInputChange(content);
      setRawInput(content);
    };
    reader.readAsText(file);
  };

  // Add filter rule
  const addFilterRule = () => {
    const newRule: FilterRule = {
      id: `rule_${Date.now()}`,
      type: 'include',
      field: 'text',
      operator: 'contains',
      value: '',
      enabled: true
    };
    setFilterRules([...filterRules, newRule]);
  };

  // Update filter rule
  const updateFilterRule = (id: string, updates: Partial<FilterRule>) => {
    setFilterRules(rules => 
      rules.map(rule => 
        rule.id === id ? { ...rule, ...updates } : rule
      )
    );
    
    // Re-validate comments
    if (comments.length > 0) {
      const updatedComments = comments.map(comment => {
        const validation = validateComment(comment);
        return { ...comment, isValid: validation.isValid, reason: validation.reason };
      });
      setComments(updatedComments);
    }
  };

  // Remove filter rule
  const removeFilterRule = (id: string) => {
    setFilterRules(rules => rules.filter(rule => rule.id !== id));
    
    // Re-validate comments
    if (comments.length > 0) {
      const updatedComments = comments.map(comment => {
        const validation = validateComment(comment);
        return { ...comment, isValid: validation.isValid, reason: validation.reason };
      });
      setComments(updatedComments);
    }
  };

  // Sort comments
  const sortComments = (comments: Comment[], sortBy: string): Comment[] => {
    switch (sortBy) {
      case 'oldest':
        return [...comments].sort((a, b) => new Date(a.timestamp || 0).getTime() - new Date(b.timestamp || 0).getTime());
      case 'newest':
        return [...comments].sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime());
      case 'mentions':
        return [...comments].sort((a, b) => b.mentions.length - a.mentions.length);
      case 'length':
        return [...comments].sort((a, b) => b.text.length - a.text.length);
      case 'likes':
        return [...comments].sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0));
      case 'random':
      default:
        return [...comments].sort(() => Math.random() - 0.5);
    }
  };

  // Draw winners with animation
  const drawWinners = () => {
    const validComments = comments.filter(c => c.isValid);
    
    if (validComments.length === 0) {
      toast.error('No valid comments to draw from');
      return;
    }

    if (numberOfWinners > validComments.length) {
      toast.error(`Cannot draw ${numberOfWinners} winners from ${validComments.length} valid comments`);
      return;
    }

    setIsDrawing(true);
    setWinners([]); // Clear previous winners

    // Animated drawing process
    let animationStep = 0;
    const maxSteps = 20; // Number of animation frames
    
    const animateDrawing = () => {
      if (animationStep < maxSteps) {
        // Show random temporary winners during animation
        const tempWinners: Winner[] = [];
        for (let i = 0; i < numberOfWinners; i++) {
          const randomComment = validComments[Math.floor(Math.random() * validComments.length)];
          tempWinners.push({
            id: `temp_${i}`,
            username: randomComment.username || 'unknown_user',
            text: randomComment.text || '',
            position: i + 1,
            profileUrl: randomComment.profileUrl,
            mentions: randomComment.mentions || [],
            hashtags: randomComment.hashtags || [],
            timestamp: randomComment.timestamp,
            likeCount: randomComment.likeCount,
            selectionMethod: 'drawing...',
            selectionTimestamp: new Date().toISOString()
          });
        }
        setWinners(tempWinners);
        animationStep++;
        setTimeout(animateDrawing, 100);
      } else {
        // Final selection
        performFinalSelection();
      }
    };

    animateDrawing();
  };

  // Perform the actual winner selection
  const performFinalSelection = () => {
    const validComments = comments.filter(c => c.isValid);
    let availableComments = sortComments(validComments, sortBy);
    const selectedWinners: Winner[] = [];

    // Remove duplicates if not allowed
    if (!allowDuplicateUsers) {
      const uniqueUsers = new Map();
      availableComments.forEach(comment => {
        const username = (comment.username ?? '').toLowerCase();
        if (!uniqueUsers.has(username)) {
          uniqueUsers.set(username, comment);
        }
      });
      availableComments = Array.from(uniqueUsers.values());
    }

    // Select winners
    for (let i = 0; i < numberOfWinners && availableComments.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * availableComments.length);
      const winner = availableComments[randomIndex];
      
      selectedWinners.push({
        id: winner.id,
        username: winner.username || 'unknown_user',
        text: winner.text || '',
        position: i + 1,
        profileUrl: winner.profileUrl,
        mentions: winner.mentions || [],
        hashtags: winner.hashtags || [],
        timestamp: winner.timestamp,
        likeCount: winner.likeCount,
        selectionMethod: `Random selection (${sortBy} sort)`,
        selectionTimestamp: new Date().toISOString()
      });

      // Remove selected winner from available pool
      if (!allowDuplicateUsers) {
        const winnerUsername = (winner.username ?? '').toLowerCase();
        availableComments = availableComments.filter(c => 
          (c.username ?? '').toLowerCase() !== winnerUsername
        );
      } else {
        availableComments.splice(randomIndex, 1);
      }
    }

    setWinners(selectedWinners);
    setIsDrawing(false);
    
    // Celebration toast
    toast.success(`🎉 ${selectedWinners.length} winner(s) selected! Congratulations! 🏆`);
  };

  // Export results
  const exportResults = () => {
    if (winners.length === 0) {
      toast.error('No winners to export');
      return;
    }

    const urlInfo = parseInstagramUrl(instagramUrl);
    
    const exportData = {
      giveaway: {
        timestamp: new Date().toISOString(),
        instagramUrl: instagramUrl || 'Manual input',
        postId: urlInfo.postId,
        tool: 'GiveawayHub Instagram Comment Picker',
        version: '3.0.0',
        collectionMethod
      },
      settings: {
        numberOfWinners,
        allowDuplicateUsers,
        minCommentLength,
        maxCommentLength,
        requireMentions,
        minMentions,
        requireHashtags,
        minHashtags,
        excludeVerified,
        minLikes,
        sortBy,
        filterRules: filterRules.filter(r => r.enabled)
      },
      statistics: {
        totalComments: comments.length,
        validComments: comments.filter(c => c.isValid).length,
        invalidComments: comments.filter(c => !c.isValid).length,
        uniqueUsers: new Set(comments.map(c => (c.username ?? '').toLowerCase())).size,
        totalMentions: comments.reduce((sum, c) => sum + (c.mentions?.length || 0), 0),
        totalHashtags: comments.reduce((sum, c) => sum + (c.hashtags?.length || 0), 0),
        averageLikes: comments.reduce((sum, c) => sum + (c.likeCount || 0), 0) / comments.length || 0
      },
      winners: winners.map(w => ({
        position: w.position,
        username: w.username,
        comment: w.text,
        profileUrl: w.profileUrl,
        mentions: w.mentions,
        hashtags: w.hashtags,
        timestamp: w.timestamp,
        likeCount: w.likeCount,
        selectionMethod: w.selectionMethod,
        selectionTimestamp: w.selectionTimestamp
      })),
      allComments: comments.map(c => ({
        username: c.username,
        text: c.text,
        isValid: c.isValid,
        reason: c.reason,
        mentions: c.mentions,
        hashtags: c.hashtags,
        profileUrl: c.profileUrl,
        timestamp: c.timestamp,
        likeCount: c.likeCount,
        verified: c.verified
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

    toast.success('Complete results exported successfully!');
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

  // Re-validate comments when settings change
  useEffect(() => {
    if (comments.length > 0) {
      const updatedComments = comments.map(comment => {
        const validation = validateComment(comment);
        return { ...comment, isValid: validation.isValid, reason: validation.reason };
      });
      setComments(updatedComments);
    }
  }, [minCommentLength, maxCommentLength, requireMentions, minMentions, requireHashtags, minHashtags, excludeVerified, minLikes, filterRules]);

  const validComments = comments.filter(c => c.isValid);
  const invalidComments = comments.filter(c => !c.isValid);

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
            Professional Instagram comment collection and winner selection tool. 
            Collect comments via API or manual input, apply advanced filters, and select winners fairly.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-8 max-w-2xl mx-auto">
          {[
            { id: 'collect', label: 'Comment Collection', icon: MessageCircle },
            { id: 'limitations', label: 'Instagram Limitations', icon: AlertTriangle },
            { id: 'python', label: 'Python Scripts', icon: Code }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-semibold transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-white text-maroon-700 shadow-md'
                  : 'text-gray-600 hover:text-maroon-600 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'limitations' && <InstagramLimitationsGuide />}
        {activeTab === 'python' && <PythonScriptGuide />}
        
        {activeTab === 'collect' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Input Section */}
            <div className="lg:col-span-2 space-y-6">
              {/* Collection Method Selection */}
              <Card className="bg-white/90 backdrop-blur-sm border-pink-200 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-maroon-800 flex items-center">
                    <Settings className="w-5 h-5 mr-3 text-pink-600" />
                    Collection Method
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      onClick={() => setCollectionMethod('api')}
                      className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                        collectionMethod === 'api'
                          ? 'border-maroon-500 bg-maroon-50 text-maroon-700'
                          : 'border-gray-200 hover:border-maroon-300 hover:bg-maroon-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3 mb-2">
                        <Zap className="w-5 h-5" />
                        <span className="font-semibold">Instagram Graph API</span>
                      </div>
                      <p className="text-sm text-gray-600">Automatic collection via Instagram API (requires access token)</p>
                    </button>

                    <button
                      onClick={() => setCollectionMethod('manual')}
                      className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                        collectionMethod === 'manual'
                          ? 'border-maroon-500 bg-maroon-50 text-maroon-700'
                          : 'border-gray-200 hover:border-maroon-300 hover:bg-maroon-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3 mb-2">
                        <Edit3 className="w-5 h-5" />
                        <span className="font-semibold">Manual Input</span>
                      </div>
                      <p className="text-sm text-gray-600">Copy and paste comments manually</p>
                    </button>
                  </div>
                </CardContent>
              </Card>

              {/* Instagram URL Input */}
              <Card className="bg-white/90 backdrop-blur-sm border-pink-200 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-maroon-800 flex items-center">
                    <LinkIcon className="w-5 h-5 mr-3 text-pink-600" />
                    Instagram Post URL
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Input
                    placeholder="https://www.instagram.com/p/ABC123..."
                    value={instagramUrl}
                    onChange={(e) => setInstagramUrl(e.target.value)}
                    className="border-pink-200 focus:border-maroon-400 focus:ring-maroon-400"
                  />
                  {instagramUrl && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-start space-x-3">
                        <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div className="text-sm text-blue-700">
                          {(() => {
                            const urlInfo = parseInstagramUrl(instagramUrl);
                            if (urlInfo.isValid) {
                              return (
                                <div>
                                  <p className="font-semibold">Post detected: {urlInfo.postId}</p>
                                  <p>Type: {urlInfo.isPost ? 'Post' : 'Reel'}</p>
                                  {collectionMethod === 'api' && (
                                    <p className="text-xs mt-1">Note: Must be from your Instagram Business Account</p>
                                  )}
                                </div>
                              );
                            } else {
                              return <p>Please enter a valid Instagram post or reel URL</p>;
                            }
                          })()}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* API Collection */}
              {collectionMethod === 'api' && (
                <Card className="bg-white/90 backdrop-blur-sm border-pink-200 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-maroon-800 flex items-center">
                      <Zap className="w-5 h-5 mr-3 text-pink-600" />
                      Instagram Graph API Collection
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-blue-800 mb-2">Requirements</h4>
                          <div className="text-sm text-blue-700 space-y-1">
                            <p>• Instagram Business Account connected to Facebook Page</p>
                            <p>• Access token with <code>instagram_basic</code> and <code>pages_show_list</code> permissions</p>
                            <p>• Post must be from YOUR Instagram Business Account</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Input
                      label="Instagram Graph API Access Token"
                      type="password"
                      placeholder="Enter your access token..."
                      value={accessToken}
                      onChange={(e) => setAccessToken(e.target.value)}
                      className="border-pink-200 focus:border-maroon-400 focus:ring-maroon-400"
                    />

                    <Button
                      onClick={collectViaAPI}
                      disabled={!accessToken.trim() || !instagramUrl.trim() || isCollecting}
                      loading={isCollecting}
                      fullWidth
                      size="lg"
                      icon={Zap}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                    >
                      {isCollecting ? 'Collecting Comments...' : 'Collect via Instagram API'}
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Manual Collection */}
              {collectionMethod === 'manual' && (
                <Card className="bg-white/90 backdrop-blur-sm border-pink-200 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-maroon-800 flex items-center">
                      <MessageCircle className="w-5 h-5 mr-3 text-pink-600" />
                      Paste Instagram Comments
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                          <div>
                            <h4 className="font-semibold text-blue-800 mb-2">Supported Formats</h4>
                            <div className="text-sm text-blue-700 space-y-1">
                              <p>• <code>@username: comment text</code></p>
                              <p>• <code>username | comment text</code></p>
                              <p>• <code>username - comment text</code></p>
                              <p>• <code>username comment text</code></p>
                              <p>• One comment per line</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex space-x-2 mb-4">
                        <input
                          type="file"
                          accept=".txt,.csv"
                          onChange={handleFileUpload}
                          className="hidden"
                          id="file-upload"
                        />
                        <Button
                          as="label"
                          htmlFor="file-upload"
                          variant="outline"
                          icon={FileText}
                          className="border-2 border-maroon-600 text-maroon-600 hover:bg-maroon-50 cursor-pointer"
                        >
                          Upload File
                        </Button>
                        <span className="text-sm text-gray-500 flex items-center">or paste comments below</span>
                      </div>

                      <Textarea
                        placeholder="Paste Instagram comments here...&#10;&#10;Example:&#10;@user1: This looks amazing! 😍 @friend1 @friend2 #giveaway&#10;@user2: Count me in! #contest #win&#10;user3 I love this giveaway @bestie"
                        rows={12}
                        value={rawInput}
                        onChange={(e) => handleInputChange(e.target.value)}
                        className="border-pink-200 focus:border-maroon-400 focus:ring-maroon-400 font-mono text-sm"
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Advanced Filters */}
              <Card className="bg-white/90 backdrop-blur-sm border-pink-200 shadow-xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-bold text-maroon-800 flex items-center">
                      <Filter className="w-5 h-5 mr-3 text-pink-600" />
                      Advanced Filters
                    </CardTitle>
                    <Button
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      variant="ghost"
                      size="sm"
                      icon={showAdvanced ? ChevronUp : ChevronDown}
                      className="text-maroon-600 hover:text-pink-600 hover:bg-pink-50"
                    >
                      {showAdvanced ? 'Hide' : 'Show'} Filters
                    </Button>
                  </div>
                </CardHeader>
                {showAdvanced && (
                  <CardContent className="space-y-6">
                    {/* Basic Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Min Comment Length"
                        type="number"
                        min="0"
                        value={minCommentLength}
                        onChange={(e) => setMinCommentLength(parseInt(e.target.value) || 0)}
                        className="border-pink-200 focus:border-maroon-400 focus:ring-maroon-400"
                      />

                      <Input
                        label="Max Comment Length (0 = no limit)"
                        type="number"
                        min="0"
                        value={maxCommentLength}
                        onChange={(e) => setMaxCommentLength(parseInt(e.target.value) || 0)}
                        className="border-pink-200 focus:border-maroon-400 focus:ring-maroon-400"
                      />

                      <Input
                        label="Min Likes (API only)"
                        type="number"
                        min="0"
                        value={minLikes}
                        onChange={(e) => setMinLikes(parseInt(e.target.value) || 0)}
                        className="border-pink-200 focus:border-maroon-400 focus:ring-maroon-400"
                      />
                    </div>

                    {/* Mentions & Hashtags */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            id="requireMentions"
                            checked={requireMentions}
                            onChange={(e) => setRequireMentions(e.target.checked)}
                            className="h-4 w-4 text-maroon-600 focus:ring-maroon-500 border-pink-300 rounded"
                          />
                          <label htmlFor="requireMentions" className="text-sm font-medium text-gray-700 flex items-center">
                            <AtSign className="w-4 h-4 mr-1" />
                            Require Mentions
                          </label>
                        </div>
                        {requireMentions && (
                          <Input
                            label="Minimum Mentions"
                            type="number"
                            min="1"
                            value={minMentions}
                            onChange={(e) => setMinMentions(parseInt(e.target.value) || 1)}
                            className="border-pink-200 focus:border-maroon-400 focus:ring-maroon-400"
                          />
                        )}
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            id="requireHashtags"
                            checked={requireHashtags}
                            onChange={(e) => setRequireHashtags(e.target.checked)}
                            className="h-4 w-4 text-maroon-600 focus:ring-maroon-500 border-pink-300 rounded"
                          />
                          <label htmlFor="requireHashtags" className="text-sm font-medium text-gray-700 flex items-center">
                            <Hash className="w-4 h-4 mr-1" />
                            Require Hashtags
                          </label>
                        </div>
                        {requireHashtags && (
                          <Input
                            label="Minimum Hashtags"
                            type="number"
                            min="1"
                            value={minHashtags}
                            onChange={(e) => setMinHashtags(parseInt(e.target.value) || 1)}
                            className="border-pink-200 focus:border-maroon-400 focus:ring-maroon-400"
                          />
                        )}
                      </div>
                    </div>

                    {/* Additional Filters */}
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="excludeVerified"
                          checked={excludeVerified}
                          onChange={(e) => setExcludeVerified(e.target.checked)}
                          className="h-4 w-4 text-maroon-600 focus:ring-maroon-500 border-pink-300 rounded"
                        />
                        <label htmlFor="excludeVerified" className="text-sm font-medium text-gray-700 flex items-center">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Exclude Verified Users
                        </label>
                      </div>
                    </div>

                    {/* Custom Filter Rules */}
                    <div className="border-t border-pink-200 pt-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-maroon-800">Custom Filter Rules</h4>
                        <Button
                          onClick={addFilterRule}
                          size="sm"
                          icon={Plus}
                          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                        >
                          Add Rule
                        </Button>
                      </div>

                      {filterRules.length > 0 && (
                        <div className="space-y-3">
                          {filterRules.map((rule) => (
                            <div key={rule.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                              <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
                                <select
                                  value={rule.type}
                                  onChange={(e) => updateFilterRule(rule.id, { type: e.target.value as 'include' | 'exclude' })}
                                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                >
                                  <option value="include">Include</option>
                                  <option value="exclude">Exclude</option>
                                </select>

                                <select
                                  value={rule.field}
                                  onChange={(e) => updateFilterRule(rule.id, { field: e.target.value as any })}
                                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                >
                                  <option value="text">Comment Text</option>
                                  <option value="username">Username</option>
                                  <option value="mentions">Mentions</option>
                                  <option value="hashtags">Hashtags</option>
                                </select>

                                <select
                                  value={rule.operator}
                                  onChange={(e) => updateFilterRule(rule.id, { operator: e.target.value as any })}
                                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                >
                                  <option value="contains">Contains</option>
                                  <option value="equals">Equals</option>
                                  <option value="starts_with">Starts With</option>
                                  <option value="ends_with">Ends With</option>
                                  <option value="regex">Regex</option>
                                </select>

                                <input
                                  type="text"
                                  value={rule.value}
                                  onChange={(e) => updateFilterRule(rule.id, { value: e.target.value })}
                                  placeholder="Value..."
                                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                />

                                <div className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    checked={rule.enabled}
                                    onChange={(e) => updateFilterRule(rule.id, { enabled: e.target.checked })}
                                    className="h-4 w-4 text-maroon-600 focus:ring-maroon-500 border-gray-300 rounded"
                                  />
                                  <span className="text-xs text-gray-600">Enabled</span>
                                </div>

                                <Button
                                  onClick={() => removeFilterRule(rule.id)}
                                  size="sm"
                                  variant="ghost"
                                  icon={Trash2}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Other Settings */}
                    <div className="border-t border-pink-200 pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Sort Comments By</label>
                          <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="w-full px-3 py-2 border border-pink-200 rounded-lg focus:border-maroon-400 focus:ring-maroon-400"
                          >
                            <option value="random">Random</option>
                            <option value="oldest">Oldest First</option>
                            <option value="newest">Newest First</option>
                            <option value="mentions">Most Mentions</option>
                            <option value="length">Longest Comments</option>
                            <option value="likes">Most Likes</option>
                          </select>
                        </div>

                        <div className="flex items-center space-x-3 pt-6">
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
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>

              {/* Comments Display */}
              {comments.length > 0 && (
                <Card className="bg-white/90 backdrop-blur-sm border-pink-200 shadow-xl">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl font-bold text-maroon-800 flex items-center">
                        <Users className="w-5 h-5 mr-3 text-pink-600" />
                        Parsed Comments ({comments.length})
                      </CardTitle>
                      <div className="text-sm font-normal text-gray-600">
                        {validComments.length} valid • {invalidComments.length} filtered
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="max-h-96 overflow-y-auto space-y-2">
                      {comments.slice(0, 50).map((comment) => (
                        <div
                          key={comment.id}
                          className={`p-4 rounded-lg border ${
                            comment.isValid
                              ? 'bg-green-50 border-green-200'
                              : 'bg-red-50 border-red-200'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <span className="font-semibold text-maroon-800">@{comment.username || 'unknown_user'}</span>
                                {comment.verified && <CheckCircle className="w-4 h-4 text-blue-500" />}
                                {comment.isValid ? (
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                ) : (
                                  <X className="w-4 h-4 text-red-600" />
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
                                {comment.likeCount !== undefined && comment.likeCount > 0 && (
                                  <span className="bg-pink-100 text-pink-800 text-xs px-2 py-1 rounded-full flex items-center">
                                    <Heart className="w-3 h-3 mr-1" />
                                    {comment.likeCount}
                                  </span>
                                )}
                              </div>
                              <p className="text-gray-700 text-sm mb-2">{comment.text || ''}</p>
                              
                              {/* Mentions and Hashtags */}
                              <div className="flex flex-wrap gap-2 mb-2">
                                {(comment.mentions || []).map((mention, i) => (
                                  <span key={i} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                    @{mention}
                                  </span>
                                ))}
                                {(comment.hashtags || []).map((hashtag, i) => (
                                  <span key={i} className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                                    #{hashtag}
                                  </span>
                                ))}
                              </div>

                              {comment.timestamp && (
                                <p className="text-gray-500 text-xs flex items-center">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {new Date(comment.timestamp).toLocaleString()}
                                </p>
                              )}
                              {!comment.isValid && comment.reason && (
                                <p className="text-red-600 text-xs mt-1 font-medium">{comment.reason}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      {comments.length > 50 && (
                        <div className="text-center py-4 text-gray-500">
                          ... and {comments.length - 50} more comments
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
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
                        <div className="text-sm text-blue-600">Total</div>
                      </div>
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-green-800">{validComments.length}</div>
                        <div className="text-sm text-green-600">Valid</div>
                      </div>
                      <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-purple-800">
                          {new Set(validComments.map(c => (c.username ?? '').toLowerCase())).size}
                        </div>
                        <div className="text-sm text-purple-600">Unique Users</div>
                      </div>
                      <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-red-800">{invalidComments.length}</div>
                        <div className="text-sm text-red-600">Filtered</div>
                      </div>
                    </div>

                    {/* Additional Stats */}
                    <div className="border-t border-pink-200 pt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total Mentions:</span>
                        <span className="font-semibold text-maroon-800">
                          {comments.reduce((sum, c) => sum + (c.mentions?.length || 0), 0)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total Hashtags:</span>
                        <span className="font-semibold text-maroon-800">
                          {comments.reduce((sum, c) => sum + (c.hashtags?.length || 0), 0)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Avg Comment Length:</span>
                        <span className="font-semibold text-maroon-800">
                          {comments.length > 0 ? Math.round(comments.reduce((sum, c) => sum + (c.text?.length || 0), 0) / comments.length) : 0} chars
                        </span>
                      </div>
                      {collectionMethod === 'api' && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Avg Likes:</span>
                          <span className="font-semibold text-maroon-800">
                            {comments.length > 0 ? Math.round(comments.reduce((sum, c) => sum + (c.likeCount || 0), 0) / comments.length) : 0}
                          </span>
                        </div>
                      )}
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
                    max={validComments.length || 1}
                    value={numberOfWinners}
                    onChange={(e) => setNumberOfWinners(parseInt(e.target.value) || 1)}
                    className="border-pink-200 focus:border-maroon-400 focus:ring-maroon-400"
                  />

                  <Button
                    onClick={drawWinners}
                    disabled={validComments.length === 0 || isDrawing}
                    loading={isDrawing}
                    fullWidth
                    size="lg"
                    icon={isDrawing ? PartyPopper : Shuffle}
                    className={`shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 ${
                      isDrawing 
                        ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 animate-pulse'
                        : 'bg-gradient-to-r from-maroon-600 to-pink-600 hover:from-maroon-700 hover:to-pink-700'
                    }`}
                  >
                    {isDrawing ? 'Drawing Winners...' : '🎲 Draw Winners'}
                  </Button>

                  {validComments.length > 0 && (
                    <div className="text-xs text-gray-500 text-center">
                      Drawing from {validComments.length} valid comments
                      {!allowDuplicateUsers && (
                        <span> ({new Set(validComments.map(c => (c.username ?? '').toLowerCase())).size} unique users)</span>
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
                      <Crown className="w-5 h-5 mr-3 text-yellow-600" />
                      🎉 Winners Selected!
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      {winners.map((winner) => (
                        <div
                          key={winner.id}
                          className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-lg p-4 relative overflow-hidden"
                        >
                          {/* Celebration animation background */}
                          <div className="absolute inset-0 bg-gradient-to-r from-yellow-100/50 to-orange-100/50 animate-pulse"></div>
                          
                          <div className="relative flex items-start space-x-3">
                            <div className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg shadow-lg">
                              {winner.position === 1 ? '🥇' : winner.position === 2 ? '🥈' : winner.position === 3 ? '🥉' : winner.position}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="font-bold text-maroon-800 text-lg">@{winner.username || 'unknown_user'}</span>
                                <Award className="w-4 h-4 text-yellow-600" />
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
                                {winner.likeCount !== undefined && winner.likeCount > 0 && (
                                  <span className="bg-pink-100 text-pink-800 text-xs px-2 py-1 rounded-full flex items-center">
                                    <Heart className="w-3 h-3 mr-1" />
                                    {winner.likeCount}
                                  </span>
                                )}
                              </div>
                              <p className="text-gray-700 text-sm mb-2 font-medium">{winner.text || ''}</p>
                              
                              {/* Winner mentions and hashtags */}
                              <div className="flex flex-wrap gap-1 mb-2">
                                {(winner.mentions || []).map((mention, i) => (
                                  <span key={i} className="bg-blue-100 text-blue-800 text-xs px-1 py-0.5 rounded">
                                    @{mention}
                                  </span>
                                ))}
                                {(winner.hashtags || []).map((hashtag, i) => (
                                  <span key={i} className="bg-purple-100 text-purple-800 text-xs px-1 py-0.5 rounded">
                                    #{hashtag}
                                  </span>
                                ))}
                              </div>

                              <div className="text-xs text-gray-500">
                                <p>Selected: {new Date(winner.selectionTimestamp).toLocaleString()}</p>
                                <p>Method: {winner.selectionMethod}</p>
                              </div>
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
                        Copy Winners
                      </Button>
                      <Button
                        onClick={exportResults}
                        size="sm"
                        icon={Download}
                        className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                      >
                        Export All
                      </Button>
                    </div>

                    {/* Celebration message */}
                    <div className="bg-gradient-to-r from-pink-100 to-rose-100 border border-pink-200 rounded-lg p-3 text-center">
                      <p className="text-pink-800 font-semibold">🎊 Congratulations to all winners! 🎊</p>
                      <p className="text-pink-700 text-sm">Winners selected fairly using provably random selection</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* How It Works */}
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-blue-800">How It Works</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-blue-700">
                  <div className="flex items-start space-x-2">
                    <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">1</span>
                    <span>Choose collection method (API or manual input)</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">2</span>
                    <span>Comments are automatically parsed and validated</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">3</span>
                    <span>Configure filters for mentions, hashtags, and custom rules</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">4</span>
                    <span>Draw winners with animated, provably fair random selection</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">5</span>
                    <span>Export complete results with full transparency</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};