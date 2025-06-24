// Social Media API Integration
export class SocialMediaManager {
  private static instance: SocialMediaManager;

  static getInstance(): SocialMediaManager {
    if (!SocialMediaManager.instance) {
      SocialMediaManager.instance = new SocialMediaManager();
    }
    return SocialMediaManager.instance;
  }

  async postToInstagram(content: {
    caption: string;
    imageUrl: string;
    accessToken: string;
  }): Promise<{ success: boolean; postId?: string; error?: string }> {
    try {
      // Instagram Basic Display API posting
      const response = await fetch(`https://graph.instagram.com/me/media`, {
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

      const data = await response.json();
      
      if (data.id) {
        // Publish the media
        const publishResponse = await fetch(`https://graph.instagram.com/me/media_publish`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            creation_id: data.id,
            access_token: content.accessToken,
          }),
        });

        const publishData = await publishResponse.json();
        return { success: true, postId: publishData.id };
      }

      return { success: false, error: data.error?.message || 'Failed to post' };
    } catch (error) {
      return { success: false, error: 'Network error' };
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
      
      if (data.id) {
        return { success: true, postId: data.id };
      }

      return { success: false, error: data.error?.message || 'Failed to post' };
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  }

  async postToTwitter(content: {
    text: string;
    imageUrl?: string;
    apiKey: string;
    apiSecret: string;
    accessToken: string;
    accessTokenSecret: string;
  }): Promise<{ success: boolean; postId?: string; error?: string }> {
    try {
      // Note: Twitter API v2 requires server-side implementation for OAuth
      // This is a placeholder for the client-side interface
      const response = await fetch('/api/twitter/post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: content.text,
          imageUrl: content.imageUrl,
        }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
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

    return `🎉 ${giveaway.title} 🎉

${giveaway.description}

🏆 PRIZE: ${giveaway.prize}

HOW TO ENTER:
${entryInstructions}

⏰ Ends: ${new Date(giveaway.endDate).toLocaleDateString()}

Good luck everyone! 🍀

${hashtags}

#giveaway #contest #win #free #${giveaway.platform}giveaway`;
  }

  private generateHashtags(platform: string): string {
    const commonHashtags = ['#giveaway', '#contest', '#win', '#free'];
    const platformHashtags = {
      instagram: ['#instagramgiveaway', '#instacontest', '#followtowin'],
      facebook: ['#facebookgiveaway', '#fbcontest', '#liketowin'],
      twitter: ['#twittergiveaway', '#retweet', '#follow'],
      tiktok: ['#tiktokgiveaway', '#fyp', '#viral'],
      youtube: ['#youtubegiveaway', '#subscribe', '#comment'],
      whatsapp: ['#whatsappgiveaway', '#share', '#forward'],
    };

    return [...commonHashtags, ...(platformHashtags[platform as keyof typeof platformHashtags] || [])].join(' ');
  }
}