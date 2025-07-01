// Instagram API configuration and utilities
export interface InstagramConfig {
  accessToken: string;
  appId: string;
  appSecret: string;
  apiVersion: string;
}

export interface InstagramComment {
  id: string;
  username: string;
  text: string;
  timestamp: string;
  like_count?: number;
  user: {
    id: string;
    username: string;
    profile_url: string;
    is_verified: boolean;
  };
  replies?: InstagramComment[];
}

export interface InstagramPost {
  id: string;
  caption: string;
  media_type: string;
  media_url: string;
  permalink: string;
  timestamp: string;
  comments_count: number;
}

export interface FacebookPage {
  id: string;
  name: string;
  access_token: string;
  instagram_business_account?: {
    id: string;
  };
}

export interface InstagramApiResponse {
  data: any[];
  paging?: {
    next?: string;
    previous?: string;
  };
}

export interface ExtractCommentsRequest {
  url: string;
  maxComments?: number;
  includeReplies?: boolean;
  filterSpam?: boolean;
}

export interface ExtractCommentsResponse {
  success: boolean;
  comments: InstagramComment[];
  post: InstagramPost;
  total_count: number;
  error?: string;
}

// Get Instagram configuration from environment variables
export const getInstagramConfig = (): InstagramConfig => {
  const config = {
    accessToken: import.meta.env.VITE_INSTAGRAM_ACCESS_TOKEN || '',
    appId: import.meta.env.VITE_INSTAGRAM_APP_ID || '',
    appSecret: import.meta.env.VITE_INSTAGRAM_APP_SECRET || '',
    apiVersion: import.meta.env.VITE_INSTAGRAM_API_VERSION || 'v19.0'
  };

  // Validate required configuration
  if (!config.accessToken || !config.appId) {
    console.warn('Instagram API configuration missing. Please set VITE_INSTAGRAM_ACCESS_TOKEN and VITE_INSTAGRAM_APP_ID in your environment variables.');
  }

  return config;
};

// Extract Instagram post ID from URL
export const extractPostIdFromUrl = (url: string): { postId: string | null; username?: string } => {
  const patterns = [
    /instagram\.com\/p\/([A-Za-z0-9_-]+)/,
    /instagram\.com\/reel\/([A-Za-z0-9_-]+)/,
    /instagram\.com\/tv\/([A-Za-z0-9_-]+)/
  ];

  const usernamePattern = /instagram\.com\/([^\/\?]+)/;
  const usernameMatch = url.match(usernamePattern);
  const username = usernameMatch?.[1];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return { postId: match[1], username };
    }
  }

  return { postId: null, username };
};

// Validate Instagram URL
export const isValidInstagramUrl = (url: string): boolean => {
  return extractPostIdFromUrl(url).postId !== null;
};

// Instagram API client class
export class InstagramAPI {
  private config: InstagramConfig;
  private baseUrl: string;

  constructor(config?: Partial<InstagramConfig>) {
    this.config = { ...getInstagramConfig(), ...config };
    this.baseUrl = `https://graph.facebook.com/${this.config.apiVersion}`;
  }

  // Get user's Facebook pages
  async getFacebookPages(): Promise<FacebookPage[]> {
    const url = `${this.baseUrl}/me/accounts`;
    const params = new URLSearchParams({
      access_token: this.config.accessToken
    });

    const response = await fetch(`${url}?${params}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to fetch Facebook pages');
    }

    const data = await response.json();
    
    if (!data.data || data.data.length === 0) {
      throw new Error('No Facebook pages found. Make sure your access token has pages_show_list permission.');
    }

    return data.data;
  }

  // Find Instagram Business Account from Facebook pages
  async findInstagramBusinessAccount(): Promise<{ accountId: string; pageAccessToken: string }> {
    const pages = await this.getFacebookPages();

    for (const page of pages) {
      try {
        const igResponse = await fetch(
          `${this.baseUrl}/${page.id}?fields=instagram_business_account&access_token=${this.config.accessToken}`
        );
        
        if (igResponse.ok) {
          const igData = await igResponse.json();
          if (igData.instagram_business_account) {
            return {
              accountId: igData.instagram_business_account.id,
              pageAccessToken: page.access_token
            };
          }
        }
      } catch (error) {
        console.log('No Instagram account for page:', page.name);
      }
    }

    throw new Error('No Instagram Business Account found. Make sure your Facebook page is connected to an Instagram Business Account.');
  }

  // Get Instagram media to find the post
  async findInstagramPost(postId: string, accountId: string, accessToken: string): Promise<any> {
    const mediaResponse = await fetch(
      `${this.baseUrl}/${accountId}/media?fields=id,media_url,permalink,timestamp&limit=50&access_token=${accessToken}`
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
      post.permalink?.includes(postId) || 
      post.id === postId
    );

    if (!targetPost) {
      throw new Error(`Post not found in your Instagram Business Account. Make sure the URL is from your own account and the post exists.`);
    }

    return targetPost;
  }

  // Get comments for a post with full implementation
  async getPostComments(postId: string, accessToken: string, options: {
    limit?: number;
    includeReplies?: boolean;
  } = {}): Promise<InstagramComment[]> {
    const { limit = 100, includeReplies = false } = options;
    
    let fields = 'id,text,username,timestamp,like_count';
    if (includeReplies) {
      fields += ',replies{id,text,username,timestamp}';
    }

    const commentsResponse = await fetch(
      `${this.baseUrl}/${postId}/comments?fields=${fields}&limit=${limit}&access_token=${accessToken}`
    );

    if (!commentsResponse.ok) {
      const error = await commentsResponse.json();
      throw new Error(error.error?.message || 'Failed to fetch comments');
    }

    const commentsData = await commentsResponse.json();
    
    if (!commentsData.data || commentsData.data.length === 0) {
      return [];
    }

    // Transform comments to our format
    return commentsData.data.map((comment: any) => ({
      id: comment.id,
      username: comment.username || 'unknown',
      text: comment.text || '',
      timestamp: comment.timestamp || new Date().toISOString(),
      like_count: comment.like_count || 0,
      user: {
        id: comment.id,
        username: comment.username || 'unknown',
        profile_url: `https://instagram.com/${comment.username}`,
        is_verified: false
      },
      replies: comment.replies?.data?.map((reply: any) => ({
        id: reply.id,
        username: reply.username || 'unknown',
        text: reply.text || '',
        timestamp: reply.timestamp || new Date().toISOString(),
        user: {
          id: reply.id,
          username: reply.username || 'unknown',
          profile_url: `https://instagram.com/${reply.username}`,
          is_verified: false
        }
      })) || []
    }));
  }

  // Extract comments from Instagram post URL - Complete implementation
  async extractCommentsFromUrl(request: ExtractCommentsRequest): Promise<ExtractCommentsResponse> {
    try {
      // Validate configuration
      if (!this.config.accessToken || !this.config.appId) {
        throw new Error('Instagram API configuration missing. Please set VITE_INSTAGRAM_ACCESS_TOKEN and VITE_INSTAGRAM_APP_ID in your environment variables.');
      }

      // Extract post ID from URL
      const urlInfo = extractPostIdFromUrl(request.url);
      if (!urlInfo.postId) {
        throw new Error('Invalid Instagram URL. Please provide a valid post, reel, or IGTV URL.');
      }

      // Step 1: Get user's pages
      const pagesResponse = await fetch(
        `${this.baseUrl}/me/accounts?access_token=${this.config.accessToken}`
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
            `${this.baseUrl}/${page.id}?fields=instagram_business_account&access_token=${this.config.accessToken}`
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
        `${this.baseUrl}/${instagramAccountId}/media?fields=id,media_url,permalink,timestamp&limit=50&access_token=${pageAccessToken || this.config.accessToken}`
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
        `${this.baseUrl}/${targetPost.id}/comments?fields=id,text,username,timestamp,like_count,replies{id,text,username,timestamp}&limit=100&access_token=${pageAccessToken || this.config.accessToken}`
      );

      if (!commentsResponse.ok) {
        const error = await commentsResponse.json();
        throw new Error(error.error?.message || 'Failed to fetch comments');
      }

      const commentsData = await commentsResponse.json();
      
      if (!commentsData.data || commentsData.data.length === 0) {
        return {
          success: true,
          comments: [],
          post: {
            id: targetPost.id,
            caption: '',
            media_type: 'IMAGE',
            media_url: targetPost.media_url || '',
            permalink: targetPost.permalink || '',
            timestamp: targetPost.timestamp || '',
            comments_count: 0
          },
          total_count: 0
        };
      }

      // Transform comments to our format
      let allComments: InstagramComment[] = [];
      
      for (const comment of commentsData.data) {
        const transformedComment: InstagramComment = {
          id: comment.id,
          username: comment.username || 'unknown',
          text: comment.text || '',
          timestamp: comment.timestamp || new Date().toISOString(),
          like_count: comment.like_count || 0,
          user: {
            id: comment.id,
            username: comment.username || 'unknown',
            profile_url: `https://instagram.com/${comment.username}`,
            is_verified: false
          }
        };

        allComments.push(transformedComment);

        // Add replies if requested and available
        if (request.includeReplies && comment.replies?.data) {
          for (const reply of comment.replies.data) {
            const transformedReply: InstagramComment = {
              id: reply.id,
              username: reply.username || 'unknown',
              text: reply.text || '',
              timestamp: reply.timestamp || new Date().toISOString(),
              user: {
                id: reply.id,
                username: reply.username || 'unknown',
                profile_url: `https://instagram.com/${reply.username}`,
                is_verified: false
              }
            };
            allComments.push(transformedReply);
          }
        }
      }

      // Filter spam if requested
      if (request.filterSpam) {
        allComments = this.filterSpamComments(allComments);
      }

      // Limit comments if requested
      if (request.maxComments && allComments.length > request.maxComments) {
        allComments = allComments.slice(0, request.maxComments);
      }

      return {
        success: true,
        comments: allComments,
        post: {
          id: targetPost.id,
          caption: '',
          media_type: 'IMAGE',
          media_url: targetPost.media_url || '',
          permalink: targetPost.permalink || '',
          timestamp: targetPost.timestamp || '',
          comments_count: allComments.length
        },
        total_count: allComments.length
      };

    } catch (error: any) {
      console.error('Instagram API Error:', error);
      
      return {
        success: false,
        comments: [],
        post: {} as InstagramPost,
        total_count: 0,
        error: error.message || 'Failed to extract comments'
      };
    }
  }

  // Basic spam filtering
  private filterSpamComments(comments: InstagramComment[]): InstagramComment[] {
    return comments.filter(comment => {
      // Filter out very short comments
      if (comment.text.length < 3) return false;
      
      // Filter out comments with excessive emojis
      const emojiCount = (comment.text.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/gu) || []).length;
      if (emojiCount > comment.text.length * 0.5) return false;
      
      // Filter out comments with excessive repetition
      const words = comment.text.toLowerCase().split(/\s+/);
      const uniqueWords = new Set(words);
      if (words.length > 5 && uniqueWords.size / words.length < 0.3) return false;
      
      // Filter out comments that are just mentions
      if (comment.text.trim().match(/^@\w+(\s+@\w+)*$/)) return false;
      
      return true;
    });
  }
}

// Default Instagram API instance
export const instagramAPI = new InstagramAPI();