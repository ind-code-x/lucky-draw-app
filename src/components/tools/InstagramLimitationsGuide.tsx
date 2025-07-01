import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Shield, 
  CheckCircle, 
  XCircle,
  Info,
  ExternalLink,
  Download,
  Copy,
  Globe,
  Lock,
  Users,
  Zap,
  BookOpen,
  HelpCircle
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import toast from 'react-hot-toast';

export const InstagramLimitationsGuide: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'limitations' | 'solutions' | 'workflow'>('limitations');

  const limitations = [
    {
      title: "Anti-Bot Protection",
      description: "Instagram uses advanced CAPTCHA, behavioral analysis, and device fingerprinting",
      severity: "high",
      icon: Shield
    },
    {
      title: "Login Requirements", 
      description: "Comments often require authentication and may be restricted",
      severity: "high",
      icon: Lock
    },
    {
      title: "Dynamic Loading",
      description: "JavaScript-heavy interface with infinite scroll and lazy loading",
      severity: "medium",
      icon: Zap
    },
    {
      title: "API Restrictions",
      description: "No public API for comments, strict rate limiting on all endpoints",
      severity: "high",
      icon: XCircle
    }
  ];

  const solutions = [
    {
      title: "Browser Extension",
      description: "Works with user's authenticated session, no automation detection",
      effectiveness: "high",
      difficulty: "easy",
      icon: Download,
      pros: ["Uses existing login", "No automation detection", "Real-time collection"],
      cons: ["Manual installation required", "Limited to visible comments"]
    },
    {
      title: "Bookmarklet",
      description: "One-click collection from any Instagram post in user's browser",
      effectiveness: "medium",
      difficulty: "easy", 
      icon: Globe,
      pros: ["No installation needed", "Works in any browser", "Quick setup"],
      cons: ["Limited functionality", "Requires manual scrolling"]
    },
    {
      title: "Manual Collection",
      description: "Copy-paste comments manually with formatting assistance",
      effectiveness: "medium",
      difficulty: "easy",
      icon: Copy,
      pros: ["100% compliant", "No technical setup", "Always works"],
      cons: ["Time consuming", "Limited scale", "Manual effort required"]
    },
    {
      title: "Hybrid Approach",
      description: "Combine multiple methods for best results",
      effectiveness: "high",
      difficulty: "medium",
      icon: Users,
      pros: ["Best coverage", "Flexible approach", "Scalable"],
      cons: ["More complex", "Requires multiple tools"]
    }
  ];

  const workflows = [
    {
      size: "Small Giveaways (< 100 comments)",
      method: "Browser Extension",
      steps: [
        "Install GiveawayHub browser extension",
        "Navigate to Instagram post",
        "Click extension to collect comments",
        "Copy results to GiveawayHub tool"
      ],
      timeEstimate: "5-10 minutes",
      difficulty: "Easy"
    },
    {
      size: "Medium Giveaways (100-500 comments)", 
      method: "Manual + Bookmarklet",
      steps: [
        "Scroll through post manually to load comments",
        "Use bookmarklet for quick collection",
        "Copy comments in batches",
        "Paste into GiveawayHub manual import"
      ],
      timeEstimate: "15-30 minutes",
      difficulty: "Medium"
    },
    {
      size: "Large Giveaways (500+ comments)",
      method: "Hybrid Approach",
      steps: [
        "Use browser extension for initial collection",
        "Supplement with manual scrolling",
        "Combine multiple collection methods",
        "Merge results in GiveawayHub"
      ],
      timeEstimate: "30-60 minutes", 
      difficulty: "Advanced"
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getEffectivenessColor = (effectiveness: string) => {
    switch (effectiveness) {
      case 'high': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Alert */}
      <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 shadow-xl">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className="bg-gradient-to-br from-amber-500 to-orange-500 p-3 rounded-xl">
              <AlertTriangle className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-amber-800 mb-2">Instagram Access Limitations</h3>
              <p className="text-amber-700 leading-relaxed mb-4">
                Instagram has strict anti-bot measures that prevent direct automated comment collection. 
                However, we have several effective workarounds that respect Instagram's terms of service.
              </p>
              <div className="bg-white/60 rounded-lg p-3 border border-amber-200">
                <p className="text-sm text-amber-800 font-semibold">
                  ✅ Good News: Our browser extension and manual methods work perfectly and are fully compliant!
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
        {[
          { id: 'limitations', label: 'Why It\'s Limited', icon: AlertTriangle },
          { id: 'solutions', label: 'Available Solutions', icon: CheckCircle },
          { id: 'workflow', label: 'Recommended Workflow', icon: BookOpen }
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

      {/* Limitations Tab */}
      {activeTab === 'limitations' && (
        <div className="space-y-6">
          <Card className="bg-white/90 backdrop-blur-sm border-pink-200 shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-maroon-800 flex items-center">
                <Shield className="w-6 h-6 mr-3 text-pink-600" />
                Instagram's Protection Measures
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {limitations.map((limitation, index) => (
                <div key={index} className={`p-4 rounded-lg border ${getSeverityColor(limitation.severity)}`}>
                  <div className="flex items-start space-x-3">
                    <limitation.icon className="w-5 h-5 mt-1" />
                    <div className="flex-1">
                      <h4 className="font-semibold mb-2">{limitation.title}</h4>
                      <p className="text-sm">{limitation.description}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      limitation.severity === 'high' ? 'bg-red-100 text-red-800' :
                      limitation.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {limitation.severity.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-start space-x-3">
                <Info className="w-6 h-6 text-blue-600 mt-1" />
                <div>
                  <h4 className="font-bold text-blue-800 mb-2">Why These Limitations Exist</h4>
                  <div className="text-sm text-blue-700 space-y-2">
                    <p>• <strong>User Privacy:</strong> Protect user data from unauthorized access</p>
                    <p>• <strong>Platform Integrity:</strong> Prevent spam and abuse</p>
                    <p>• <strong>Business Model:</strong> Encourage use of official business tools</p>
                    <p>• <strong>Legal Compliance:</strong> Meet data protection regulations</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Solutions Tab */}
      {activeTab === 'solutions' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {solutions.map((solution, index) => (
              <Card key={index} className="bg-white/90 backdrop-blur-sm border-pink-200 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-maroon-800 flex items-center">
                    <div className="bg-gradient-to-br from-maroon-500 to-pink-500 p-2 rounded-lg mr-3">
                      <solution.icon className="w-5 h-5 text-white" />
                    </div>
                    {solution.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-700">{solution.description}</p>
                  
                  <div className="flex space-x-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getEffectivenessColor(solution.effectiveness)}`}>
                      {solution.effectiveness.toUpperCase()} EFFECTIVENESS
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      solution.difficulty === 'easy' ? 'bg-green-50 text-green-800' :
                      solution.difficulty === 'medium' ? 'bg-yellow-50 text-yellow-800' :
                      'bg-red-50 text-red-800'
                    }`}>
                      {solution.difficulty.toUpperCase()} SETUP
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-semibold text-green-800 mb-2">✅ Pros</h5>
                      <ul className="text-sm text-green-700 space-y-1">
                        {solution.pros.map((pro, i) => (
                          <li key={i}>• {pro}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-semibold text-red-800 mb-2">⚠️ Cons</h5>
                      <ul className="text-sm text-red-700 space-y-1">
                        {solution.cons.map((con, i) => (
                          <li key={i}>• {con}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-xl">
            <CardContent className="p-6">
              <h4 className="font-bold text-green-800 mb-4 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                Recommended: Browser Extension + Manual Backup
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-semibold text-green-700 mb-2">Primary Method: Browser Extension</h5>
                  <ul className="text-sm text-green-600 space-y-1">
                    <li>• Install once, use everywhere</li>
                    <li>• Works with your Instagram login</li>
                    <li>• No automation detection</li>
                    <li>• Real-time collection</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-semibold text-green-700 mb-2">Backup Method: Manual Collection</h5>
                  <ul className="text-sm text-green-600 space-y-1">
                    <li>• Always works as fallback</li>
                    <li>• 100% terms compliant</li>
                    <li>• No technical requirements</li>
                    <li>• Perfect for small giveaways</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Workflow Tab */}
      {activeTab === 'workflow' && (
        <div className="space-y-6">
          {workflows.map((workflow, index) => (
            <Card key={index} className="bg-white/90 backdrop-blur-sm border-pink-200 shadow-xl">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-maroon-800 flex items-center justify-between">
                  <div className="flex items-center">
                    <Users className="w-5 h-5 mr-3 text-pink-600" />
                    {workflow.size}
                  </div>
                  <div className="flex space-x-2 text-sm">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">{workflow.timeEstimate}</span>
                    <span className={`px-2 py-1 rounded ${
                      workflow.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                      workflow.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {workflow.difficulty}
                    </span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <h4 className="font-semibold text-maroon-700 mb-2">Recommended Method: {workflow.method}</h4>
                </div>
                <div className="space-y-3">
                  {workflow.steps.map((step, stepIndex) => (
                    <div key={stepIndex} className="flex items-start space-x-3">
                      <div className="bg-gradient-to-br from-maroon-500 to-pink-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                        {stepIndex + 1}
                      </div>
                      <p className="text-gray-700 flex-1">{step}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

          <Card className="bg-gradient-to-br from-maroon-50 to-pink-50 border-maroon-200 shadow-xl">
            <CardContent className="p-6">
              <h4 className="font-bold text-maroon-800 mb-4">💡 Pro Tips for Better Results</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-maroon-700">
                <div>
                  <h5 className="font-semibold mb-2">Collection Tips:</h5>
                  <ul className="space-y-1">
                    <li>• Collect during peak engagement hours</li>
                    <li>• Scroll slowly to load all comments</li>
                    <li>• Use stable internet connection</li>
                    <li>• Clear browser cache if issues occur</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-semibold mb-2">Quality Tips:</h5>
                  <ul className="space-y-1">
                    <li>• Verify comment count manually</li>
                    <li>• Check for duplicate entries</li>
                    <li>• Review filtered results</li>
                    <li>• Save backup copies of data</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* CTA Section */}
      <Card className="bg-gradient-to-br from-maroon-900 via-maroon-800 to-pink-900 text-white border-none shadow-2xl">
        <CardContent className="p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-pattern-dots-white opacity-10"></div>
          <div className="relative">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 w-20 h-20 mx-auto mb-6">
              <Download className="w-12 h-12 text-white mx-auto" />
            </div>
            <h3 className="text-3xl font-bold mb-4">Ready to Collect Comments?</h3>
            <p className="text-pink-100 mb-8 max-w-2xl mx-auto leading-relaxed">
              Download our browser extension for the easiest and most effective way to collect 
              Instagram comments while respecting platform guidelines.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => toast.success('Browser extension download started!')}
                size="lg"
                icon={Download}
                className="bg-white text-maroon-700 hover:bg-pink-50 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                Download Extension
              </Button>
              <Button
                as="a"
                href="/tools/instagram-comment-picker"
                size="lg"
                variant="outline"
                icon={ExternalLink}
                className="border-2 border-white text-white hover:bg-white hover:text-maroon-700 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                Try Manual Import
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};