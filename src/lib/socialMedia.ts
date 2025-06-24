// Social Media API Integration - Real OAuth Implementation
export class SocialMediaManager {
  private static instance: SocialMediaManager;

  static getInstance(): SocialMediaManager {
    if (!SocialMediaManager.instance) {
      SocialMediaManager.instance = new SocialMediaManager();
    }
    return SocialMediaManager.instance;
  }

  // Instagram Basic Display API
  async connectInstagram(): Promise<{ success: boolean; credentials?: any; error?: string }> {
    try {
      const clientId = import.meta.env.VITE_INSTAGRAM_CLIENT_ID;
      const redirectUri = `${window.location.origin}/auth/instagram/callback`;
      
      if (!clientId) {
        throw new Error('Instagram Client ID not configured');
      }

      const authUrl = `https://api.instagram.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user_profile,user_media&response_type=code`;
      
      return new Promise((resolve) => {
        const popup = window.open(authUrl, 'instagram-auth', 'width=600,height=600,scrollbars=yes,resizable=yes');
        
        const checkClosed = setInterval(() => {
          if (popup?.closed) {
            clearInterval(checkClosed);
            // Check if we have the access token in localStorage (set by callback)
            const accessToken = localStorage.getItem('instagram_access_token');
            const userId = localStorage.getItem('instagram_user_id');
            
            if (accessToken && userId) {
              localStorage.removeItem('instagram_access_token');
              localStorage.removeItem('instagram_user_id');
              
              resolve({
                success: true,
                credentials: {
                  platform: 'instagram',
                  connected: true,
                  accessToken,
                  userId,
                  username: 'instagram_user'
                }
              });
            } else {
              resolve({ success: false, error: 'Authentication cancelled or failed' });
            }
          }
        }, 1000);
      });
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Facebook Graph API
  async connectFacebook(): Promise<{ success: boolean; credentials?: any; error?: string }> {
    try {
      const appId = import.meta.env.VITE_FACEBOOK_APP_ID;
      const redirectUri = `${window.location.origin}/auth/facebook/callback`;
      
      if (!appId) {
        throw new Error('Facebook App ID not configured');
      }

      const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${appId}&redirect_uri=${redirectUri}&scope=pages_manage_posts,pages_read_engagement&response_type=code`;
      
      return new Promise((resolve) => {
        const popup = window.open(authUrl, 'facebook-auth', 'width=600,height=600,scrollbars=yes,resizable=yes');
        
        const checkClosed = setInterval(() => {
          if (popup?.closed) {
            clearInterval(checkClosed);
            const accessToken = localStorage.getItem('facebook_access_token');
            const pageId = localStorage.getItem('facebook_page_id');
            
            if (accessToken && pageId) {
              localStorage.removeItem('facebook_access_token');
              localStorage.removeItem('facebook_page_id');
              
              resolve({
                success: true,
                credentials: {
                  platform: 'facebook',
                  connected: true,
                  accessToken,
                  pageId,
                  username: 'facebook_page'
                }
              });
            } else {
              resolve({ success: false, error: 'Authentication cancelled or failed' });
            }
          }
        }, 1000);
      });
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Twitter OAuth 2.0
  async connectTwitter(): Promise<{ success: boolean; credentials?: any; error?: string }> {
    try {
      const clientId = import.meta.env.VITE_TWITTER_CLIENT_ID;
      const redirectUri = `${window.location.origin}/auth/twitter/callback`;
      
      if (!clientId) {
        throw new Error('Twitter Client ID not configured');
      }

      // Generate code verifier and challenge for PKCE
      const codeVerifier = this.generateCodeVerifier();
      const codeChallenge = await this.generateCodeChallenge(codeVerifier);
      
      localStorage.setItem('twitter_code_verifier', codeVerifier);

      const authUrl = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=tweet.read%20tweet.write%20users.read&state=state&code_challenge=${codeChallenge}&code_challenge_method=S256`;
      
      return new Promise((resolve) => {
        const popup = window.open(authUrl, 'twitter-auth', 'width=600,height=600,scrollbars=yes,resizable=yes');
        
        const checkClosed = setInterval(() => {
          if (popup?.closed) {
            clearInterval(checkClosed);
            const accessToken = localStorage.getItem('twitter_access_token');
            const userId = localStorage.getItem('twitter_user_id');
            
            if (accessToken && userId) {
              localStorage.removeItem('twitter_access_token');
              localStorage.removeItem('twitter_user_id');
              localStorage.removeItem('twitter_code_verifier');
              
              resolve({
                success: true,
                credentials: {
                  platform: 'twitter',
                  connected: true,
                  accessToken,
                  userId,
                  username: 'twitter_user'
                }
              });
            } else {
              resolve({ success: false, error: 'Authentication cancelled or failed' });
            }
          }
        }, 1000);
      });
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // TikTok for Developers
  async connectTikTok(): Promise<{ success: boolean; credentials?: any; error?: string }> {
    try {
      const clientKey = import.meta.env.VITE_TIKTOK_CLIENT_KEY;
      const redirectUri = `${window.location.origin}/auth/tiktok/callback`;
      
      if (!clientKey) {
        throw new Error('TikTok Client Key not configured');
      }

      const authUrl = `https://www.tiktok.com/auth/authorize/?client_key=${clientKey}&scope=user.info.basic,video.publish&response_type=code&redirect_uri=${redirectUri}&state=state`;
      
      return new Promise((resolve) => {
        const popup = window.open(authUrl, 'tiktok-auth', 'width=600,height=600,scrollbars=yes,resizable=yes');
        
        const checkClosed = setInterval(() => {
          if (popup?.closed) {
            clearInterval(checkClosed);
            const accessToken = localStorage.getItem('tiktok_access_token');
            const openId = localStorage.getItem('tiktok_open_id');
            
            if (accessToken && openId) {
              localStorage.removeItem('tiktok_access_token');
              localStorage.removeItem('tiktok_open_id');
              
              resolve({
                success: true,
                credentials: {
                  platform: 'tiktok',
                  connected: true,
                  accessToken,
                  openId,
                  username: 'tiktok_user'
                }
              });
            } else {
              resolve({ success: false, error: 'Authentication cancelled or failed' });
            }
          }
        }, 1000);
      });
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // YouTube Data API
  async connectYouTube(): Promise<{ success: boolean; credentials?: any; error?: string }> {
    try {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      const redirectUri = `${window.location.origin}/auth/youtube/callback`;
      
      if (!clientId) {
        throw new Error('Google Client ID not configured');
      }

      const authUrl = `https://accounts.google.com/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=https://www.googleapis.com/auth/youtube.upload&response_type=code&access_type=offline`;
      
      return new Promise((resolve) => {
        const popup = window.open(authUrl, 'youtube-auth', 'width=600,height=600,scrollbars=yes,resizable=yes');
        
        const checkClosed = setInterval(() => {
          if (popup?.closed) {
            clearInterval(checkClosed);
            const accessToken = localStorage.getItem('youtube_access_token');
            const channelId = localStorage.getItem('youtube_channel_id');
            
            if (accessToken && channelId) {
              localStorage.removeItem('youtube_access_token');
              localStorage.removeItem('youtube_channel_id');
              
              resolve({
                success: true,
                credentials: {
                  platform: 'youtube',
                  connected: true,
                  accessToken,
                  channelId,
                  username: 'youtube_channel'
                }
              });
            } else {
              resolve({ success: false, error: 'Authentication cancelled or failed' });
            }
          }
        }, 1000);
      });
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // WhatsApp Business API (requires business verification)
  async connectWhatsApp(): Promise<{ success: boolean; credentials?: any; error?: string }> {
    // WhatsApp Business API requires server-side implementation and business verification
    return {
      success: false,
      error: 'WhatsApp Business API requires server-side implementation and business verification. Please contact support for setup.'
    };
  }

  // Posting methods
  async postToInstagram(content: {
    caption: string;
    imageUrl: string;
    accessToken: string;
  }): Promise<{ success: boolean; postId?: string; error?: string }> {
    try {
      // Step 1: Create media object
      const mediaResponse = await fetch(`https://graph.instagram.com/me/media`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_url: content.imageUrl,
          caption: content.caption,
          access_token: content.accessToken,
        }),
      });

      const mediaData = await mediaResponse.json();
      
      if (mediaData.error) {
        throw new Error(mediaData.error.message);
      }

      // Step 2: Publish the media
      const publishResponse = await fetch(`https://graph.instagram.com/me/media_publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          creation_id: mediaData.id,
          access_token: content.accessToken,
        }),
      });

      const publishData = await publishResponse.json();
      
      if (publishData.error) {
        throw new Error(publishData.error.message);
      }

      return { success: true, postId: publishData.id };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async postToFacebook(content: {
    message: string;
    imageUrl: string;
    accessToken: string;
    pageId: string;
  }): Promise<{ success: boolean; postId?: string; error?: string }> {
    try {
      const response = await fetch(`https://graph.facebook.com/${content.pageId}/photos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: content.imageUrl,
          caption: content.message,
          access_token: content.accessToken,
        }),
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }

      return { success: true, postId: data.id };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async postToTwitter(content: {
    text: string;
    imageUrl?: string;
    accessToken: string;
  }): Promise<{ success: boolean; postId?: string; error?: string }> {
    try {
      let mediaId;
      
      // Upload media if provided
      if (content.imageUrl) {
        const mediaResponse = await fetch('/api/twitter/upload-media', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${content.accessToken}`,
          },
          body: JSON.stringify({
            imageUrl: content.imageUrl,
          }),
        });
        
        const mediaData = await mediaResponse.json();
        if (mediaData.media_id) {
          mediaId = mediaData.media_id;
        }
      }

      // Create tweet
      const tweetResponse = await fetch('https://api.twitter.com/2/tweets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${content.accessToken}`,
        },
        body: JSON.stringify({
          text: content.text,
          ...(mediaId && { media: { media_ids: [mediaId] } }),
        }),
      });

      const tweetData = await tweetResponse.json();
      
      if (tweetData.errors) {
        throw new Error(tweetData.errors[0].detail);
      }

      return { success: true, postId: tweetData.data.id };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async postToTikTok(content: {
    text: string;
    videoUrl?: string;
    accessToken: string;
    openId: string;
  }): Promise<{ success: boolean; postId?: string; error?: string }> {
    try {
      // TikTok requires video content, not images
      if (!content.videoUrl) {
        throw new Error('TikTok requires video content');
      }

      const response = await fetch('https://open-api.tiktok.com/share/video/upload/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${content.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          open_id: content.openId,
          video_url: content.videoUrl,
          text: content.text,
        }),
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }

      return { success: true, postId: data.data.share_id };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async postToYouTube(content: {
    title: string;
    description: string;
    thumbnailUrl?: string;
    accessToken: string;
  }): Promise<{ success: boolean; postId?: string; error?: string }> {
    try {
      // YouTube requires video upload, which is complex for a giveaway post
      // For now, we'll create a community post instead
      const response = await fetch('https://www.googleapis.com/youtube/v3/activities', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${content.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          snippet: {
            description: `${content.title}\n\n${content.description}`,
          },
        }),
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }

      return { success: true, postId: data.id };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Utility methods
  private generateCodeVerifier(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode.apply(null, Array.from(array)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  private async generateCodeChallenge(verifier: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(digest))))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  generatePostContent(giveaway: {
    title: string;
    description: string;
    prize: string;
    platform: string;
    endDate: string;
    entryMethods: Array<{ type: string; description: string; required: boolean }>;
  }): string {
    const hashtags = this.generateHashtags(giveaway.platform);
    const entryInstructions = giveaway.entryMethods
      .filter(method => method.required)
      .map(method => `✅ ${method.description}`)
      .join('\n');

    const endDate = new Date(giveaway.endDate).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });

    return `🎉 ${giveaway.title} 🎉

${giveaway.description}

🏆 PRIZE: ${giveaway.prize}

HOW TO ENTER:
${entryInstructions}

⏰ Ends: ${endDate}

Good luck everyone! 🍀

${hashtags}

#giveaway #contest #win #free #${giveaway.platform}giveaway`;
  }

  private generateHashtags(platform: string): string {
    const commonHashtags = ['#giveaway', '#contest', '#win', '#free'];
    const platformHashtags = {
      instagram: ['#instagramgiveaway', '#instacontest', '#followtowin', '#liketowin'],
      facebook: ['#facebookgiveaway', '#fbcontest', '#liketowin', '#sharetowin'],
      twitter: ['#twittergiveaway', '#retweet', '#follow', '#TwitterContest'],
      tiktok: ['#tiktokgiveaway', '#fyp', '#viral', '#TikTokContest'],
      youtube: ['#youtubegiveaway', '#subscribe', '#comment', '#YouTubeContest'],
      whatsapp: ['#whatsappgiveaway', '#share', '#forward', '#WhatsAppContest'],
    };

    return [...commonHashtags, ...(platformHashtags[platform as keyof typeof platformHashtags] || [])].join(' ');
  }
}