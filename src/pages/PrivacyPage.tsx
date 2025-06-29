import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Eye, Lock, Users, FileText, Mail, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';

export const PrivacyPage: React.FC = () => {
  const sections = [
    {
      id: 'information-collection',
      title: 'Information We Collect',
      icon: Users,
      content: [
        'Account information (name, email, username)',
        'Profile information and preferences',
        'Giveaway participation data',
        'Payment and billing information',
        'Device and usage analytics',
        'Communication preferences'
      ]
    },
    {
      id: 'information-use',
      title: 'How We Use Your Information',
      icon: Eye,
      content: [
        'Provide and improve our services',
        'Process giveaway entries and select winners',
        'Send important notifications and updates',
        'Prevent fraud and ensure security',
        'Analyze usage patterns and preferences',
        'Comply with legal obligations'
      ]
    },
    {
      id: 'information-sharing',
      title: 'Information Sharing',
      icon: Users,
      content: [
        'We never sell your personal information',
        'Share with giveaway organizers (limited data)',
        'Service providers and partners (anonymized)',
        'Legal compliance when required',
        'Business transfers (with notice)',
        'With your explicit consent'
      ]
    },
    {
      id: 'data-security',
      title: 'Data Security',
      icon: Lock,
      content: [
        'Industry-standard encryption',
        'Secure data transmission (SSL/TLS)',
        'Regular security audits and updates',
        'Access controls and authentication',
        'Data backup and recovery systems',
        'Employee training on data protection'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-maroon-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-gradient-maroon-pink opacity-95"></div>
        <div className="absolute inset-0 bg-pattern-dots-white opacity-30"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 w-20 h-20 mx-auto mb-8">
            <Shield className="w-12 h-12 text-white animate-pulse" />
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Privacy Policy
          </h1>
          
          <p className="text-xl md:text-2xl text-pink-100 mb-10 max-w-4xl mx-auto leading-relaxed">
            Your privacy is magical to us. Learn how we protect and use your information 
            to create the best giveaway experience.
          </p>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 max-w-2xl mx-auto">
            <p className="text-pink-100 text-lg">
              <strong>Last Updated:</strong> December 29, 2024
            </p>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-20 bg-white relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-pink-50/30 to-transparent"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-white/90 backdrop-blur-sm border-pink-200 shadow-xl">
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-maroon-700 to-pink-600 bg-clip-text text-transparent mb-6">
                Our Commitment to Your Privacy
              </h2>
              <div className="prose prose-lg text-gray-700 leading-relaxed space-y-4">
                <p>
                  At GiveawayHub, we believe that privacy is a fundamental right. This Privacy Policy 
                  explains how we collect, use, disclose, and safeguard your information when you use 
                  our magical giveaway platform.
                </p>
                <p>
                  We are committed to transparency and giving you control over your personal information. 
                  By using our services, you agree to the collection and use of information in accordance 
                  with this policy.
                </p>
                <p>
                  If you have any questions about this Privacy Policy, please don't hesitate to 
                  <Link to="/contact" className="text-maroon-600 hover:text-pink-600 font-semibold"> contact us</Link>.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Main Sections */}
      <section className="py-20 bg-gradient-to-br from-pink-50 via-rose-50 to-maroon-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {sections.map((section) => (
              <Card key={section.id} className="bg-white/90 backdrop-blur-sm border-pink-200 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl font-bold text-maroon-800">
                    <div className="bg-gradient-to-br from-maroon-500 to-pink-500 p-3 rounded-lg mr-4">
                      <section.icon className="w-6 h-6 text-white" />
                    </div>
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {section.content.map((item, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <div className="bg-pink-100 rounded-full p-1 mt-1">
                          <div className="w-2 h-2 bg-maroon-500 rounded-full"></div>
                        </div>
                        <span className="text-gray-700 leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Detailed Sections */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Cookies */}
          <Card className="bg-white/90 backdrop-blur-sm border-pink-200 shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-maroon-800 flex items-center">
                <FileText className="w-6 h-6 mr-3 text-pink-600" />
                Cookies and Tracking
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-lg text-gray-700 leading-relaxed space-y-4">
              <p>
                We use cookies and similar tracking technologies to enhance your experience on our platform. 
                These technologies help us:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Remember your preferences and settings</li>
                <li>Analyze how you use our services</li>
                <li>Provide personalized content and recommendations</li>
                <li>Ensure security and prevent fraud</li>
              </ul>
              <p>
                You can control cookie settings through your browser preferences. However, disabling 
                certain cookies may limit some functionality of our platform.
              </p>
            </CardContent>
          </Card>

          {/* Your Rights */}
          <Card className="bg-white/90 backdrop-blur-sm border-pink-200 shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-maroon-800 flex items-center">
                <Users className="w-6 h-6 mr-3 text-pink-600" />
                Your Privacy Rights
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-lg text-gray-700 leading-relaxed space-y-4">
              <p>You have the following rights regarding your personal information:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-maroon-800 mb-2">Access & Portability</h4>
                  <p className="text-sm">Request a copy of your personal data in a portable format.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-maroon-800 mb-2">Correction</h4>
                  <p className="text-sm">Update or correct inaccurate personal information.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-maroon-800 mb-2">Deletion</h4>
                  <p className="text-sm">Request deletion of your personal data (subject to legal requirements).</p>
                </div>
                <div>
                  <h4 className="font-semibold text-maroon-800 mb-2">Opt-out</h4>
                  <p className="text-sm">Unsubscribe from marketing communications at any time.</p>
                </div>
              </div>
              <p>
                To exercise these rights, please contact us at{' '}
                <a href="mailto:privacy@giveawayhub.com" className="text-maroon-600 hover:text-pink-600 font-semibold">
                  privacy@giveawayhub.com
                </a>
              </p>
            </CardContent>
          </Card>

          {/* Children's Privacy */}
          <Card className="bg-white/90 backdrop-blur-sm border-pink-200 shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-maroon-800 flex items-center">
                <Shield className="w-6 h-6 mr-3 text-pink-600" />
                Children's Privacy
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-lg text-gray-700 leading-relaxed space-y-4">
              <p>
                Our services are not intended for children under 13 years of age. We do not knowingly 
                collect personal information from children under 13. If you are a parent or guardian 
                and believe your child has provided us with personal information, please contact us 
                immediately.
              </p>
              <p>
                For users between 13-18 years old, we recommend parental guidance when participating 
                in giveaways and using our platform.
              </p>
            </CardContent>
          </Card>

          {/* International Transfers */}
          <Card className="bg-white/90 backdrop-blur-sm border-pink-200 shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-maroon-800 flex items-center">
                <Lock className="w-6 h-6 mr-3 text-pink-600" />
                International Data Transfers
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-lg text-gray-700 leading-relaxed space-y-4">
              <p>
                Your information may be transferred to and processed in countries other than your own. 
                We ensure that such transfers comply with applicable data protection laws and implement 
                appropriate safeguards to protect your information.
              </p>
              <p>
                We use industry-standard contractual clauses and security measures to ensure your 
                data remains protected regardless of where it is processed.
              </p>
            </CardContent>
          </Card>

          {/* Updates */}
          <Card className="bg-gradient-to-br from-pink-50 to-rose-50 border-pink-200 shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-maroon-800 flex items-center">
                <FileText className="w-6 h-6 mr-3 text-pink-600" />
                Policy Updates
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-lg text-gray-700 leading-relaxed space-y-4">
              <p>
                We may update this Privacy Policy from time to time to reflect changes in our practices 
                or for other operational, legal, or regulatory reasons. We will notify you of any 
                material changes by:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Posting the updated policy on our website</li>
                <li>Sending you an email notification</li>
                <li>Displaying a prominent notice on our platform</li>
              </ul>
              <p>
                Your continued use of our services after any changes indicates your acceptance of 
                the updated Privacy Policy.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-rose-maroon"></div>
        <div className="absolute inset-0 bg-pattern-circles-white opacity-20"></div>
        
        <div className="relative max-w-5xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-full p-6 w-24 h-24 mx-auto mb-8">
            <Sparkles className="w-12 h-12 text-pink-200 mx-auto" />
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            Questions About
            <span className="block text-pink-200">Your Privacy?</span>
          </h2>
          
          <p className="text-xl text-pink-100 mb-10 max-w-3xl mx-auto leading-relaxed">
            We're here to help you understand how we protect your information. 
            Don't hesitate to reach out with any privacy-related questions.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button
              as={Link}
              to="/contact"
              size="xl"
              className="bg-white text-maroon-700 hover:bg-pink-50 shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 px-12"
            >
              <Mail className="w-5 h-5 mr-2" />
              Contact Privacy Team
            </Button>
            <Button
              as="a"
              href="mailto:privacy@giveawayhub.com"
              size="xl"
              variant="outline"
              className="border-2 border-white text-white hover:bg-white hover:text-maroon-700 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 px-12"
            >
              <Shield className="w-5 h-5 mr-2" />
              Email Privacy Team
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};