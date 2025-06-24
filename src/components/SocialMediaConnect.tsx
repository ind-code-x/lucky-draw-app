import React, { useState } from 'react';
import { Link, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';

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

  const platforms = [
    {
      id: 'instagram',
      name: 'Instagram',
      icon: '📷',
      color: 'bg-pink-500',
      description: 'Connect your Instagram account to post giveaways',
      authUrl: 'https://api.instagram.com/oauth/authorize',
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: '👥',
      color: 'bg-blue-600',
      description: 'Connect your Facebook page to post giveaways',
      authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
    },
    {
      id: 'twitter',
      name: 'Twitter',
      icon: '🐦',
      color: 'bg-blue-400',
      description: 'Connect your Twitter account to post giveaways',
      authUrl: 'https://twitter.com/i/oauth2/authorize',
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      icon: '🎵',
      color: 'bg-black',
      description: 'Connect your TikTok account (coming soon)',
      authUrl: null,
    },
    {
      id: 'youtube',
      name: 'YouTube',
      icon: '📺',
      color: 'bg-red-600',
      description: 'Connect your YouTube channel (coming soon)',
      authUrl: null,
    },
  ];

  const handleConnect = async (platform: any) => {
    if (!platform.authUrl) {
      alert('This platform integration is coming soon!');
      return;
    }

    setConnectingPlatform(platform.id);

    try {
      // Open OAuth popup
      const popup = window.open(
        platform.authUrl,
        'social-auth',
        'width=600,height=600,scrollbars=yes,resizable=yes'
      );

      // Listen for OAuth callback
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed);
          setConnectingPlatform(null);
          // In a real implementation, you'd handle the OAuth callback here
          onConnect(platform.id, { connected: true, username: 'demo_user' });
        }
      }, 1000);
    } catch (error) {
      console.error('Connection error:', error);
      setConnectingPlatform(null);
    }
  };

  const isConnected = (platformId: string) => {
    return connectedAccounts.some(account => account.platform === platformId && account.connected);
  };

  const getConnectedAccount = (platformId: string) => {
    return connectedAccounts.find(account => account.platform === platformId);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Connect Social Media Accounts</h3>
        <p className="text-gray-600">
          Connect your social media accounts to automatically post your giveaways
        </p>
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
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {connected ? (
                    <CheckCircle size={20} className="text-green-600" />
                  ) : (
                    <AlertCircle size={20} className="text-gray-400" />
                  )}
                </div>
              </div>

              <div className="mt-4">
                {connected ? (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-green-600">Connected</span>
                    <button className="text-sm text-gray-500 hover:text-red-600 transition-colors">
                      Disconnect
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleConnect(platform)}
                    disabled={isConnecting || !platform.authUrl}
                    className={`w-full py-2 px-4 rounded-lg font-medium transition-all flex items-center justify-center space-x-2 ${
                      platform.authUrl
                        ? 'bg-purple-600 text-white hover:bg-purple-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {isConnecting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Connecting...</span>
                      </>
                    ) : (
                      <>
                        <Link size={16} />
                        <span>{platform.authUrl ? 'Connect' : 'Coming Soon'}</span>
                        {platform.authUrl && <ExternalLink size={14} />}
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
        </ul>
      </div>
    </div>
  );
}