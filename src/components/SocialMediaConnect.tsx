import React, { useState } from 'react';
import { Link, CheckCircle, AlertCircle, ExternalLink, Loader2 } from 'lucide-react';
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
  const socialManager = SocialMediaManager.getInstance();

  const platforms = [
    {
      id: 'instagram',
      name: 'Instagram',
      icon: '📷',
      color: 'bg-pink-500',
      description: 'Connect your Instagram account to post giveaways',
      available: true,
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: '👥',
      color: 'bg-blue-600',
      description: 'Connect your Facebook page to post giveaways',
      available: true,
    },
    {
      id: 'twitter',
      name: 'Twitter',
      icon: '🐦',
      color: 'bg-blue-400',
      description: 'Connect your Twitter account to post giveaways',
      available: true,
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      icon: '🎵',
      color: 'bg-black',
      description: 'Connect your TikTok account to post giveaways',
      available: true,
    },
    {
      id: 'youtube',
      name: 'YouTube',
      icon: '📺',
      color: 'bg-red-600',
      description: 'Connect your YouTube channel to post giveaways',
      available: true,
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: '💬',
      color: 'bg-green-500',
      description: 'Connect your WhatsApp Business account',
      available: true,
    },
  ];

  const handleConnect = async (platform: any) => {
    setConnectingPlatform(platform.id);

    try {
      // Use the demo connection method
      const result = await socialManager.connectAccount(platform.id);
      
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
    // Remove the connected account
    onConnect(platformId, { platform: platformId, connected: false });
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

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h4 className="font-medium text-blue-900 mb-2">🎭 Demo Mode</h4>
        <p className="text-sm text-blue-800">
          This is a demo environment. All social media connections are simulated and no real posts will be made to your accounts.
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
                    <span className="text-sm font-medium text-green-600 flex items-center space-x-1">
                      <CheckCircle size={16} />
                      <span>Connected (Demo)</span>
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
                      platform.available
                        ? 'bg-purple-600 text-white hover:bg-purple-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {isConnecting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Connecting...</span>
                      </>
                    ) : (
                      <>
                        <Link size={16} />
                        <span>{platform.available ? 'Connect (Demo)' : 'Coming Soon'}</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="font-medium text-green-900 mb-2">🔐 Privacy & Security</h4>
        <ul className="text-sm text-green-800 space-y-1">
          <li>• Demo mode: No real social media accounts are accessed</li>
          <li>• In production: Only posting permissions are requested</li>
          <li>• Your login credentials are never stored</li>
          <li>• You can disconnect accounts anytime</li>
          <li>• All data is encrypted and secure</li>
        </ul>
      </div>
    </div>
  );
}