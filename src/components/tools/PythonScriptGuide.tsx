import React, { useState } from 'react';
import { 
  Code, 
  Download, 
  Play, 
  Terminal, 
  FileText, 
  Copy,
  CheckCircle,
  AlertTriangle,
  Zap,
  Settings,
  Globe,
  Shield
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import toast from 'react-hot-toast';

export const PythonScriptGuide: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'setup' | 'usage' | 'advanced'>('setup');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedCode(label);
      toast.success(`${label} copied to clipboard!`);
      setTimeout(() => setCopiedCode(null), 2000);
    });
  };

  const setupCommands = [
    {
      title: "1. Install Python Dependencies",
      command: "pip install selenium webdriver-manager requests beautifulsoup4",
      description: "Install required Python packages"
    },
    {
      title: "2. Download ChromeDriver",
      command: "# Automatic installation via webdriver-manager\n# Or manual download from: https://chromedriver.chromium.org/",
      description: "ChromeDriver is required for browser automation"
    },
    {
      title: "3. Run Setup Script",
      command: "python setup.py",
      description: "Automated setup and verification"
    }
  ];

  const usageExamples = [
    {
      title: "Basic Collection",
      command: `python instagram_collector.py "https://www.instagram.com/p/POST_ID/"`,
      description: "Collect comments from a single Instagram post"
    },
    {
      title: "Headless Mode",
      command: `python instagram_collector.py "https://www.instagram.com/p/POST_ID/" --headless`,
      description: "Run without browser window (faster)"
    },
    {
      title: "Extended Collection",
      command: `python instagram_collector.py "https://www.instagram.com/p/POST_ID/" --max-scrolls 50`,
      description: "Collect more comments with extra scrolling"
    },
    {
      title: "Custom Output",
      command: `python instagram_collector.py "https://www.instagram.com/p/POST_ID/" --output my_comments.json`,
      description: "Save to custom filename"
    }
  ];

  const pythonIntegration = `from instagram_collector import InstagramCommentCollector

# Create collector instance
collector = InstagramCommentCollector(headless=False)

# Collect comments from Instagram post
url = "https://www.instagram.com/p/YOUR_POST_ID/"
result = collector.collect_from_url(url, max_scrolls=20)

if result['success']:
    comments = result['comments']
    print(f"Collected {len(comments)} comments!")
    
    # Format for GiveawayHub
    formatted_comments = []
    for comment in comments:
        formatted_comments.append(f"@{comment['username']}: {comment['text']}")
    
    # Save for manual import
    with open('giveawayhub_comments.txt', 'w', encoding='utf-8') as f:
        f.write('\\n'.join(formatted_comments))
    
    print("Comments saved to giveawayhub_comments.txt")
    print("Copy the file content and paste into GiveawayHub manual import!")
else:
    print(f"Collection failed: {result['error']}")`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-xl">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-500 p-3 rounded-xl">
              <Code className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-blue-800 mb-2">Professional Python Script</h3>
              <p className="text-blue-700 leading-relaxed">
                Advanced Instagram comment collection using Selenium automation. Works exactly like app-sorteos.com 
                with professional features for large-scale giveaway management.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
        {[
          { id: 'setup', label: 'Setup & Installation', icon: Settings },
          { id: 'usage', label: 'Usage Examples', icon: Play },
          { id: 'advanced', label: 'Advanced Integration', icon: Zap }
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

      {/* Setup Tab */}
      {activeTab === 'setup' && (
        <div className="space-y-6">
          <Card className="bg-white/90 backdrop-blur-sm border-pink-200 shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-maroon-800 flex items-center">
                <Download className="w-5 h-5 mr-3 text-pink-600" />
                Download & Setup
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
                <h4 className="font-bold text-green-800 mb-3 flex items-center">
                  <Download className="w-5 h-5 mr-2" />
                  Download Python Scripts
                </h4>
                <p className="text-green-700 mb-4">
                  Get the complete Instagram comment collection toolkit with all necessary files.
                </p>
                <div className="flex space-x-3">
                  <Button
                    onClick={() => {
                      // In a real implementation, this would trigger a download
                      toast.success('Download started! Check your downloads folder.');
                    }}
                    icon={Download}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  >
                    Download Scripts
                  </Button>
                  <Button
                    as="a"
                    href="https://github.com/giveawayhub/instagram-collector"
                    target="_blank"
                    variant="outline"
                    icon={Globe}
                    className="border-green-600 text-green-600 hover:bg-green-50"
                  >
                    View on GitHub
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                {setupCommands.map((step, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-800">{step.title}</h4>
                      <Button
                        onClick={() => copyToClipboard(step.command, step.title)}
                        size="sm"
                        variant="ghost"
                        icon={copiedCode === step.title ? CheckCircle : Copy}
                        className="text-gray-600 hover:text-maroon-600"
                      >
                        {copiedCode === step.title ? 'Copied!' : 'Copy'}
                      </Button>
                    </div>
                    <code className="block bg-gray-800 text-green-400 p-3 rounded text-sm font-mono whitespace-pre-wrap">
                      {step.command}
                    </code>
                    <p className="text-sm text-gray-600 mt-2">{step.description}</p>
                  </div>
                ))}
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-amber-800 mb-1">Requirements</h4>
                    <ul className="text-sm text-amber-700 space-y-1">
                      <li>• Python 3.7+ installed</li>
                      <li>• Google Chrome browser</li>
                      <li>• Instagram account for login</li>
                      <li>• Stable internet connection</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Usage Tab */}
      {activeTab === 'usage' && (
        <div className="space-y-6">
          <Card className="bg-white/90 backdrop-blur-sm border-pink-200 shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-maroon-800 flex items-center">
                <Terminal className="w-5 h-5 mr-3 text-pink-600" />
                Command Line Usage
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {usageExamples.map((example, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-800">{example.title}</h4>
                    <Button
                      onClick={() => copyToClipboard(example.command, example.title)}
                      size="sm"
                      variant="ghost"
                      icon={copiedCode === example.title ? CheckCircle : Copy}
                      className="text-gray-600 hover:text-maroon-600"
                    >
                      {copiedCode === example.title ? 'Copied!' : 'Copy'}
                    </Button>
                  </div>
                  <code className="block bg-gray-800 text-green-400 p-3 rounded text-sm font-mono">
                    {example.command}
                  </code>
                  <p className="text-sm text-gray-600 mt-2">{example.description}</p>
                </div>
              ))}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-3">How It Works</h4>
                <ol className="text-sm text-blue-700 space-y-2">
                  <li className="flex items-start space-x-2">
                    <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">1</span>
                    <span>Script opens Chrome browser and navigates to Instagram post</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">2</span>
                    <span>Waits for you to manually log in to Instagram</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">3</span>
                    <span>Automatically scrolls to load all comments</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">4</span>
                    <span>Extracts usernames and comment text</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">5</span>
                    <span>Saves results to JSON file for import into GiveawayHub</span>
                  </li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Advanced Tab */}
      {activeTab === 'advanced' && (
        <div className="space-y-6">
          <Card className="bg-white/90 backdrop-blur-sm border-pink-200 shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-maroon-800 flex items-center">
                <Zap className="w-5 h-5 mr-3 text-pink-600" />
                Python Integration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-800">Complete Integration Example</h4>
                  <Button
                    onClick={() => copyToClipboard(pythonIntegration, 'Python Integration')}
                    size="sm"
                    variant="ghost"
                    icon={copiedCode === 'Python Integration' ? CheckCircle : Copy}
                    className="text-gray-600 hover:text-maroon-600"
                  >
                    {copiedCode === 'Python Integration' ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
                <code className="block bg-gray-800 text-green-400 p-4 rounded text-sm font-mono whitespace-pre-wrap overflow-x-auto">
                  {pythonIntegration}
                </code>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg p-6 border border-purple-200">
                  <h4 className="font-bold text-purple-800 mb-3 flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Output Formats
                  </h4>
                  <ul className="text-sm text-purple-700 space-y-2">
                    <li>• JSON with complete metadata</li>
                    <li>• CSV for Excel analysis</li>
                    <li>• TXT for GiveawayHub import</li>
                    <li>• Custom format support</li>
                  </ul>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
                  <h4 className="font-bold text-green-800 mb-3 flex items-center">
                    <Shield className="w-5 h-5 mr-2" />
                    Safety Features
                  </h4>
                  <ul className="text-sm text-green-700 space-y-2">
                    <li>• Rate limiting protection</li>
                    <li>• Duplicate detection</li>
                    <li>• Error handling & recovery</li>
                    <li>• Account safety measures</li>
                  </ul>
                </div>
              </div>

              <div className="bg-gradient-to-br from-maroon-50 to-pink-50 rounded-lg p-6 border border-maroon-200">
                <h4 className="font-bold text-maroon-800 mb-3">Professional Features</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-maroon-700">
                  <div>
                    <h5 className="font-semibold mb-2">Collection Features:</h5>
                    <ul className="space-y-1">
                      <li>• Automatic comment loading</li>
                      <li>• Username extraction</li>
                      <li>• Verified account detection</li>
                      <li>• Timestamp recording</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-semibold mb-2">Processing Features:</h5>
                    <ul className="space-y-1">
                      <li>• Smart duplicate removal</li>
                      <li>• Comment validation</li>
                      <li>• Batch processing</li>
                      <li>• Export customization</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* CTA */}
      <Card className="bg-gradient-to-br from-maroon-900 via-maroon-800 to-pink-900 text-white border-none shadow-2xl">
        <CardContent className="p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-pattern-dots-white opacity-10"></div>
          <div className="relative">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 w-20 h-20 mx-auto mb-6">
              <Code className="w-12 h-12 text-white mx-auto" />
            </div>
            <h3 className="text-3xl font-bold mb-4">Ready to Automate?</h3>
            <p className="text-pink-100 mb-8 max-w-2xl mx-auto leading-relaxed">
              Download the professional Python scripts and start collecting Instagram comments 
              automatically. Perfect for large-scale giveaways and professional organizers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => toast.success('Download started! Check your downloads folder.')}
                size="lg"
                icon={Download}
                className="bg-white text-maroon-700 hover:bg-pink-50 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                Download Scripts
              </Button>
              <Button
                as="a"
                href="https://github.com/giveawayhub/instagram-collector"
                target="_blank"
                size="lg"
                variant="outline"
                icon={Globe}
                className="border-2 border-white text-white hover:bg-white hover:text-maroon-700 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                View Documentation
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};