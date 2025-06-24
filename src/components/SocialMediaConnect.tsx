import React, { useState } from 'react';
import { Link, CheckCircle, AlertCircle, ExternalLink, Loader2, Settings } from 'lucide-react';
import { SocialMediaManager } from '../lib/socialMedia';

interface SocialAccount {
  platform: string;
  name: string;
  icon: string;
  connected: boolean;
  username?: string;
  color: string;
}

interface SocialMediaConnectProps {
  onConnect: (platform: string, credentials: any) => void;
  connectedAccounts: SocialAccount[];
}

export function SocialMediaConnect({ onConnect, connectedAccounts }: SocialMediaConnectProps) {
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null);
  const [showSetup, setShowSetup] = useState(false);
  const socialManager = SocialMediaManager.getInstance();

  const platforms = [
    {
      id: 'instagram',
      name: 'Instagram',
      icon: '📷',
      color: 'bg-pink-500',
      description: 'Connect your Instagram Business account',
      available: true,
      requiresSetup: !import.meta.env.VITE_INSTAGRAM_CLIENT_ID,
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: '👥',
      color: 'bg-blue-600',
      description: 'Connect your Facebook page',
      available: true,
      requiresSetup: !import.meta.env.VITE_FACEBOOK_APP_ID,
    },
    {
      id: 'twitter',
      name: 'Twitter',
      icon: '🐦',
      color: 'bg-blue-400',
      description: 'Connect your Twitter account',
      available: true,
      requiresSetup: !import.meta.env.VITE_TWITTER_CLIENT_ID,
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      icon: '🎵',
      color: 'bg-black',
      description: 'Connect your TikTok account',
      available: true,
      requiresSetup: !import.meta.env.VITE_TIKTOK_CLIENT_KEY,
    },
    {
      id: 'youtube',
      name: 'YouTube',
      icon: '📺',
      color: 'bg-red-600',
      description: 'Connect your YouTube channel',
      available: true,
      requiresSetup: !import.meta.env.VITE_GOOGLE_CLIENT_ID,
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: '💬',
      color: 'bg-green-500',
      description: 'WhatsApp Business API (Enterprise)',
      available: false,
      requiresSetup: true,
    },
  ];

  const handleConnect = async (platform: any) => {
    if (platform.requiresSetup) {
      setShowSetup(true);
      return;
    }

    setConnectingPlatform(platform.id);

    try {
      let result;
      
      switch (platform.id) {
        case 'instagram':
          result = await socialManager.connectInstagram();
          break;
        case 'facebook':
          result = await socialManager.connectFacebook();
          break;
        case 'twitter':
          result = await socialManager.connectTwitter();
          break;
        case 'tiktok':
          result = await socialManager.connectTikTok();
          break;
        case 'youtube':
          result = await socialManager.connectYouTube();
          break;
        case 'whatsapp':
          result = await socialManager.connectWhatsApp();
          break;
        default:
          result = { success: false, error: 'Platform not supported' };
      }
      
      if (result.success && result.credentials) {
        onConnect(platform.id, result.credentials);
      } else {
        alert(`Failed to connect to ${platform.name}: ${result.error}`);
      }
    } catch (error) {
      console.error('Connection error:', error);
      alert(`Failed to connect to ${platform.name}. Please try again.`);
    } finally {
      setConnectingPlatform(null);
    }
  };

  const handleDisconnect = (platformId: string) => {
    onConnect(platformId, { platform: platformId, connected: false });
  };

  const isConnected = (platformId: string) => {
    return connectedAccounts.some(account => account.platform === platformId && account.connected);
  };

  const getConnectedAccount = (platformId: string) => {
    return connectedAccounts.find(account => account.platform === platformId);
  };

  if (showSetup) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">API Setup Required</h3>
          <button
            onClick={() => setShowSetup(false)}
            className="text-purple-600 hover:text-purple-700"
          >
            ← Back
          </button>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <Settings className="w-6 h-6 text-yellow-600 mt-1" />
            <div>
              <h4 className="font-semibold text-yellow-900 mb-2">Social Media API Configuration</h4>
              <p className="text-yellow-800 mb-4">
                To enable real social media posting, you need to configure API credentials for each platform.
              </p>
              
              <div className="space-y-4">
                <div>
                  <h5 className="font-medium text-yellow-900">Required Environment Variables:</h5>
                  <div className="mt-2 bg-yellow-100 p-3 rounded text-sm font-mono">
                    <div>VITE_INSTAGRAM_CLIENT_ID=your_instagram_client_id</div>
                    <div>VITE_FACEBOOK_APP_ID=your_facebook_app_id</div>
                    <div>VITE_TWITTER_CLIENT_ID=your_twitter_client_id</div>
                    <div>VITE_TIKTOK_CLIENT_KEY=your_tiktok_client_key</div>
                    <div>VITE_GOOGLE_CLIENT_ID=your_google_client_id</div>
                  </div>
                </div>

                <div>
                  <h5 className="font-medium text-yellow-900">Setup Instructions:</h5>
                  <ol className="list-decimal list-inside text-yellow-800 space-y-1 mt-2">
                    <li>Create developer accounts for each platform</li>
                    <li>Register your application and get API credentials</li>
                    <li>Add the environment variables to your .env file</li>
                    <li>Restart your development server</li>
                    <li>Return here to connect your accounts</li>
                  </ol>
                </div>

                <div>
                  <h5 className="font-medium text-yellow-900">Developer Links:</h5>
                  <div className="space-y-1 mt-2">
                    <a href="https://developers.facebook.com/apps/" target="_blank" rel="noopener noreferrer" className="block text-blue-600 hover:underline">
                      • Instagram/Facebook: Meta for Developers
                    </a>
                    <a href="https://developer.twitter.com/en/portal/dashboard" target="_blank" rel="noopener noreferrer" className="block text-blue-600 hover:underline">
                      • Twitter: Developer Portal
                    </a>
                    <a href="https://developers.tiktok.com/" target="_blank" rel="noopener noreferrer" className="block text-blue-600 hover:underline">
                      • TikTok: TikTok for Developers
                    </a>
                    <a href="https://console.developers.google.com/" target="_blank" rel="noopener noreferrer" className="block text-blue-600 hover:underline">
                      • YouTube: Google Cloud Console
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Connect Social Media Accounts</h3>
          <p className="text-gray-600">
            Connect your social media accounts to automatically post your giveaways
          </p>
        </div>
        <button
          onClick={() => setShowSetup(true)}
          className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 text-sm"
        >
          <Settings size={16} />
          <span>API Setup</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {platforms.map((platform) => {
          const connected = isConnected(platform.id);
          const account = getConnectedAccount(platform.id);
          const isConnecting = connectingPlatform === platform.id;

          return (
            <div
              key={platform.id}
              className={`p-6 border-2 rounded-lg transition-all ${
                connected
                  ? 'border-green-200 bg-green-50'
                  : platform.requiresSetup
                  ? 'border-yellow-200 bg-yellow-50'
                  : 'border-gray-200 hover:border-purple-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 ${platform.color} rounded-lg flex items-center justify-center text-white text-xl`}>
                    {platform.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{platform.name}</h4>
                    <p className="text-sm text-gray-600">{platform.description}</p>
                    {connected && account?.username && (
                      <p className="text-sm text-green-600 mt-1">@{account.username}</p>
                    )}
                    {platform.requiresSetup && (
                      <p className="text-sm text-yellow-600 mt-1">API setup required</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {connected ? (
                    <CheckCircle size={20} className="text-green-600" />
                  ) : platform.requiresSetup ? (
                    <Settings size={20} className="text-yellow-600" />
                  ) : (
                    <AlertCircle size={20} className="text-gray-400" />
                  )}
                </div>
              </div>

              <div className="mt-4">
                {connected ? (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-green-600 flex items-center space-x-1">
                      <CheckCircle size={16} />
                      <span>Connected</span>
                    </span>
                    <button 
                      onClick={() => handleDisconnect(platform.id)}
                      className="text-sm text-gray-500 hover:text-red-600 transition-colors"
                    >
                      Disconnect
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleConnect(platform)}
                    disabled={isConnecting || !platform.available}
                    className={`w-full py-2 px-4 rounded-lg font-medium transition-all flex items-center justify-center space-x-2 ${
                      platform.requiresSetup
                        ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                        : platform.available
                        ? 'bg-purple-600 text-white hover:bg-purple-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {isConnecting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Connecting...</span>
                      </>
                    ) : platform.requiresSetup ? (
                      <>
                        <Settings size={16} />
                        <span>Setup Required</span>
                      </>
                    ) : platform.available ? (
                      <>
                        <Link size={16} />
                        <span>Connect</span>
                        <ExternalLink size={14} />
                      </>
                    ) : (
                      <>
                        <span>Enterprise Only</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">🔐 Privacy & Security</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• We only request permissions needed for posting</li>
          <li>• Your login credentials are never stored</li>
          <li>• You can disconnect accounts anytime</li>
          <li>• All data is encrypted and secure</li>
          <li>• OAuth 2.0 standard authentication</li>
        </ul>
      </div>
    </div>
  );
}