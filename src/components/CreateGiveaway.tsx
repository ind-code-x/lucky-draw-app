import React, { useState } from 'react';
import { ArrowLeft, Plus, X, Calendar, Trophy, Target, Share2, Upload, Send, CheckCircle, Loader2 } from 'lucide-react';
import { useGiveaways } from '../contexts/GiveawayContext';
import { useAuth } from '../contexts/AuthContext';
import { SocialPlatform, EntryMethod } from '../types';
import { PosterUpload } from './PosterUpload';
import { SocialMediaConnect } from './SocialMediaConnect';
import { SocialMediaManager } from '../lib/socialMedia';

interface CreateGiveawayProps {
  onBack: () => void;
}

export function CreateGiveaway({ onBack }: CreateGiveawayProps) {
  const { createGiveaway } = useGiveaways();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [posterUrl, setPosterUrl] = useState<string>('');
  const [connectedAccounts, setConnectedAccounts] = useState<any[]>([]);
  const [autoPost, setAutoPost] = useState(false);
  const [posting, setPosting] = useState(false);
  const [postingStatus, setPostingStatus] = useState<string>('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    prize: '',
    platform: 'instagram' as SocialPlatform,
    startDate: '',
    endDate: '',
    entryMethods: [] as EntryMethod[],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const platforms = [
    { id: 'instagram', name: 'Instagram', icon: '📷', color: 'bg-pink-500' },
    { id: 'facebook', name: 'Facebook', icon: '👥', color: 'bg-blue-600' },
    { id: 'twitter', name: 'Twitter', icon: '🐦', color: 'bg-blue-400' },
    { id: 'tiktok', name: 'TikTok', icon: '🎵', color: 'bg-black' },
    { id: 'youtube', name: 'YouTube', icon: '📺', color: 'bg-red-600' },
    { id: 'whatsapp', name: 'WhatsApp', icon: '💬', color: 'bg-green-500' },
  ];

  const entryMethodTypes = [
    { id: 'follow', name: 'Follow Account', description: 'Follow your social media account' },
    { id: 'like', name: 'Like Post', description: 'Like the giveaway post' },
    { id: 'comment', name: 'Comment', description: 'Leave a comment on the post' },
    { id: 'share', name: 'Share/Repost', description: 'Share or repost the content' },
    { id: 'tag', name: 'Tag Friends', description: 'Tag friends in comments' },
    { id: 'subscribe', name: 'Subscribe', description: 'Subscribe to newsletter/channel' },
    { id: 'visit', name: 'Visit Website', description: 'Visit your website or landing page' },
  ];

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.title.trim()) newErrors.title = 'Title is required';
      if (!formData.description.trim()) newErrors.description = 'Description is required';
      if (!formData.prize.trim()) newErrors.prize = 'Prize description is required';
    }

    if (step === 2) {
      if (!formData.startDate) newErrors.startDate = 'Start date is required';
      if (!formData.endDate) newErrors.endDate = 'End date is required';
      if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
        newErrors.endDate = 'End date must be after start date';
      }
    }

    if (step === 3) {
      if (formData.entryMethods.length === 0) {
        newErrors.entryMethods = 'At least one entry method is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const addEntryMethod = (type: string) => {
    const method = entryMethodTypes.find(m => m.id === type);
    if (method) {
      const newMethod: EntryMethod = {
        id: Math.random().toString(36).substr(2, 9),
        type: type as any,
        description: method.description,
        required: true,
        platform: formData.platform,
      };
      setFormData(prev => ({
        ...prev,
        entryMethods: [...prev.entryMethods, newMethod],
      }));
    }
  };

  const removeEntryMethod = (id: string) => {
    setFormData(prev => ({
      ...prev,
      entryMethods: prev.entryMethods.filter(method => method.id !== id),
    }));
  };

  const toggleEntryMethodRequired = (id: string) => {
    setFormData(prev => ({
      ...prev,
      entryMethods: prev.entryMethods.map(method =>
        method.id === id ? { ...method, required: !method.required } : method
      ),
    }));
  };

  const handleSocialConnect = (platform: string, credentials: any) => {
    if (credentials.connected === false) {
      // Remove the account
      setConnectedAccounts(prev => prev.filter(acc => acc.platform !== platform));
    } else {
      // Add or update the account
      setConnectedAccounts(prev => [
        ...prev.filter(acc => acc.platform !== platform),
        { platform, connected: true, ...credentials }
      ]);
    }
  };

  const postToSocialMedia = async (giveaway: any) => {
    if (!autoPost) return null;

    setPosting(true);
    setPostingStatus('Preparing to post...');
    
    const socialManager = SocialMediaManager.getInstance();

    try {
      const postContent = socialManager.generatePostContent(giveaway);
      
      // Find connected account for the platform
      const connectedAccount = connectedAccounts.find(
        acc => acc.platform === giveaway.platform && acc.connected
      );

      if (!connectedAccount) {
        throw new Error(`No connected account found for ${giveaway.platform}`);
      }

      setPostingStatus(`Posting to ${platforms.find(p => p.id === giveaway.platform)?.name}...`);

      let result;
      switch (giveaway.platform) {
        case 'instagram':
          result = await socialManager.postToInstagram({
            caption: postContent,
            imageUrl: posterUrl || 'https://via.placeholder.com/1080x1080',
            accessToken: connectedAccount.accessToken,
          });
          break;
        case 'facebook':
          result = await socialManager.postToFacebook({
            message: postContent,
            imageUrl: posterUrl || 'https://via.placeholder.com/1080x1080',
            accessToken: connectedAccount.accessToken,
            pageId: connectedAccount.pageId || 'demo_page',
          });
          break;
        case 'twitter':
          result = await socialManager.postToTwitter({
            text: postContent.substring(0, 280), // Twitter character limit
            imageUrl: posterUrl,
            apiKey: connectedAccount.apiKey || 'demo_key',
            apiSecret: connectedAccount.apiSecret || 'demo_secret',
            accessToken: connectedAccount.accessToken,
            accessTokenSecret: connectedAccount.accessTokenSecret || 'demo_token_secret',
          });
          break;
        case 'tiktok':
          result = await socialManager.postToTikTok({
            text: postContent,
            videoUrl: posterUrl,
            accessToken: connectedAccount.accessToken,
          });
          break;
        case 'youtube':
          result = await socialManager.postToYouTube({
            title: giveaway.title,
            description: postContent,
            thumbnailUrl: posterUrl,
            accessToken: connectedAccount.accessToken,
          });
          break;
        case 'whatsapp':
          result = await socialManager.postToWhatsApp({
            message: postContent,
            imageUrl: posterUrl,
            phoneNumber: connectedAccount.phoneNumber || 'demo_number',
          });
          break;
        default:
          throw new Error(`Posting to ${giveaway.platform} is not yet supported`);
      }

      if (result.success) {
        setPostingStatus('Posted successfully!');
        return result;
      } else {
        throw new Error(result.error || 'Failed to post');
      }
    } catch (error: any) {
      console.error('Social media posting error:', error);
      setPostingStatus('Posting failed, but giveaway was created');
      // Don't throw the error - we still want to create the giveaway
      return null;
    } finally {
      setTimeout(() => {
        setPosting(false);
        setPostingStatus('');
      }, 2000);
    }
  };

  const handleSubmit = async () => {
    if (validateStep(4)) {
      const giveawayData = {
        ...formData,
        userId: user!.id,
        status: 'draft' as const,
        posterUrl,
      };

      try {
        // Post to social media if enabled
        let socialPostResult = null;
        if (autoPost) {
          socialPostResult = await postToSocialMedia(giveawayData);
        }

        // Create giveaway with social post ID if successful
        await createGiveaway({
          ...giveawayData,
          socialPostId: socialPostResult?.postId,
        });

        // Show success message
        if (autoPost && socialPostResult?.success) {
          alert(`Giveaway created and posted to ${platforms.find(p => p.id === formData.platform)?.name} successfully!`);
        } else {
          alert('Giveaway created successfully!');
        }

        onBack();
      } catch (error) {
        console.error('Error creating giveaway:', error);
        alert('Failed to create giveaway. Please try again.');
      }
    }
  };

  const steps = [
    { number: 1, title: 'Basic Info', icon: <Trophy size={16} /> },
    { number: 2, title: 'Schedule', icon: <Calendar size={16} /> },
    { number: 3, title: 'Entry Rules', icon: <Target size={16} /> },
    { number: 4, title: 'Media & Post', icon: <Share2 size={16} /> },
    { number: 5, title: 'Review', icon: <Send size={16} /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Dashboard</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Create New Giveaway</h1>
          <div></div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      currentStep >= step.number
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {step.icon}
                  </div>
                  <div className="ml-3">
                    <p className={`text-sm font-medium ${
                      currentStep >= step.number ? 'text-purple-600' : 'text-gray-500'
                    }`}>
                      Step {step.number}
                    </p>
                    <p className="text-xs text-gray-500">{step.title}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 mx-4 h-0.5 ${
                    currentStep > step.number ? 'bg-purple-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giveaway Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.title ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="e.g., iPhone 15 Pro Giveaway"
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.description ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Describe your giveaway and what participants need to know..."
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prize Description *
                </label>
                <input
                  type="text"
                  value={formData.prize}
                  onChange={(e) => setFormData(prev => ({ ...prev, prize: e.target.value }))}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.prize ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="e.g., iPhone 15 Pro (256GB) + AirPods Pro"
                />
                {errors.prize && <p className="text-red-500 text-sm mt-1">{errors.prize}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Select Platform *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {platforms.map((platform) => (
                    <button
                      key={platform.id}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, platform: platform.id as SocialPlatform }))}
                      className={`p-4 border-2 rounded-lg transition-all ${
                        formData.platform === platform.id
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-12 h-12 ${platform.color} rounded-lg flex items-center justify-center text-white text-xl mb-2 mx-auto`}>
                        {platform.icon}
                      </div>
                      <p className="font-medium text-gray-900">{platform.name}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Schedule Your Giveaway</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      errors.startDate ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      errors.endDate ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.endDate && <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">📅 Scheduling Tips</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Run giveaways for 1-2 weeks for optimal engagement</li>
                  <li>• Start on weekdays for better initial traction</li>
                  <li>• End on weekends when more people are active</li>
                  <li>• Consider your audience's timezone</li>
                </ul>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Entry Requirements</h2>
              
              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Add Entry Methods *
                  </label>
                  <p className="text-sm text-gray-500">{formData.entryMethods.length} methods added</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
                  {entryMethodTypes.map((method) => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => addEntryMethod(method.id)}
                      disabled={formData.entryMethods.some(m => m.type === method.id)}
                      className="p-3 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{method.name}</p>
                          <p className="text-xs text-gray-500 mt-1">{method.description}</p>
                        </div>
                        <Plus size={16} className="text-purple-600" />
                      </div>
                    </button>
                  ))}
                </div>

                {formData.entryMethods.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-medium text-gray-900">Selected Entry Methods:</h3>
                    {formData.entryMethods.map((method) => (
                      <div key={method.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {entryMethodTypes.find(t => t.id === method.type)?.name}
                          </p>
                          <p className="text-sm text-gray-600">{method.description}</p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={method.required}
                              onChange={() => toggleEntryMethodRequired(method.id)}
                              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            />
                            <span className="text-sm text-gray-700">Required</span>
                          </label>
                          <button
                            onClick={() => removeEntryMethod(method.id)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {errors.entryMethods && <p className="text-red-500 text-sm mt-1">{errors.entryMethods}</p>}
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-medium text-green-900 mb-2">✅ Entry Method Best Practices</h3>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Start with basic actions (follow, like) as required</li>
                  <li>• Add optional methods for bonus entries</li>
                  <li>• More entry methods = higher engagement</li>
                  <li>• Keep required actions simple and achievable</li>
                </ul>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Upload Poster & Connect Social Media</h2>
              
              {/* Poster Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Giveaway Poster (Optional)
                </label>
                <PosterUpload
                  onUpload={setPosterUrl}
                  currentPoster={posterUrl}
                  onRemove={() => setPosterUrl('')}
                />
              </div>

              {/* Social Media Connection */}
              <div>
                <SocialMediaConnect
                  onConnect={handleSocialConnect}
                  connectedAccounts={connectedAccounts}
                />
              </div>

              {/* Auto-post Option */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">Auto-post to Social Media</h3>
                    <p className="text-sm text-gray-600">
                      Automatically post your giveaway when you create it (Demo Mode)
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoPost}
                      onChange={(e) => setAutoPost(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>
                
                {autoPost && (
                  <div className="bg-white rounded-lg p-4 border border-purple-200">
                    <h4 className="font-medium text-gray-900 mb-2">✨ What will happen:</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Your giveaway will be posted to {platforms.find(p => p.id === formData.platform)?.name} (Demo)</li>
                      <li>• Entry instructions will be included in the caption</li>
                      <li>• Relevant hashtags will be added automatically</li>
                      <li>• This is a demo - no real posts will be made</li>
                    </ul>
                    
                    {connectedAccounts.find(acc => acc.platform === formData.platform) ? (
                      <div className="mt-3 flex items-center space-x-2 text-green-600">
                        <CheckCircle size={16} />
                        <span className="text-sm font-medium">Ready to post to {platforms.find(p => p.id === formData.platform)?.name}</span>
                      </div>
                    ) : (
                      <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800">
                          ⚠️ Please connect your {platforms.find(p => p.id === formData.platform)?.name} account above to enable auto-posting.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Review Your Giveaway</h2>
              
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Basic Information</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Title:</span> {formData.title}</p>
                      <p><span className="font-medium">Prize:</span> {formData.prize}</p>
                      <p><span className="font-medium">Platform:</span> {platforms.find(p => p.id === formData.platform)?.name}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Schedule</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Start:</span> {new Date(formData.startDate).toLocaleString()}</p>
                      <p><span className="font-medium">End:</span> {new Date(formData.endDate).toLocaleString()}</p>
                      <p><span className="font-medium">Duration:</span> {Math.ceil((new Date(formData.endDate).getTime() - new Date(formData.startDate).getTime()) / (1000 * 60 * 60 * 24))} days</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Entry Methods ({formData.entryMethods.length})</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {formData.entryMethods.map((method) => (
                      <div key={method.id} className="flex items-center justify-between bg-white p-3 rounded border">
                        <span className="text-sm">{entryMethodTypes.find(t => t.id === method.type)?.name}</span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          method.required ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {method.required ? 'Required' : 'Optional'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {posterUrl && (
                  <div className="mt-6">
                    <h3 className="font-semibold text-gray-900 mb-3">Poster Preview</h3>
                    <img
                      src={posterUrl}
                      alt="Giveaway poster"
                      className="w-full max-w-md h-64 object-cover rounded-lg border"
                    />
                  </div>
                )}

                {autoPost && (
                  <div className="mt-6">
                    <h3 className="font-semibold text-gray-900 mb-3">Social Media Posting</h3>
                    <div className="bg-white p-4 rounded-lg border">
                      <p className="text-sm text-green-700">
                        ✅ Will auto-post to {platforms.find(p => p.id === formData.platform)?.name} when created (Demo Mode)
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handlePrevStep}
              disabled={currentStep === 1}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            
            {currentStep < 5 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all"
              >
                Next Step
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={posting}
                className="px-8 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {posting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    <span>Create Giveaway</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Posting Status */}
          {posting && postingStatus && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <Loader2 size={16} className="animate-spin text-blue-600" />
                <span className="text-sm text-blue-800">{postingStatus}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}