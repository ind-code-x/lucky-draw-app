import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Scale, Shield, Users, AlertTriangle, Mail, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';

export const TermsPage: React.FC = () => {
  const sections = [
    {
      id: 'acceptance',
      title: 'Acceptance of Terms',
      icon: Scale,
      content: `By accessing and using GiveawayHub, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.`
    },
    {
      id: 'user-accounts',
      title: 'User Accounts',
      icon: Users,
      content: `You are responsible for safeguarding the password and for maintaining the confidentiality of your account. You agree not to disclose your password to any third party and to take sole responsibility for activities that occur under your account.`
    },
    {
      id: 'giveaway-rules',
      title: 'Giveaway Rules',
      icon: Shield,
      content: `All giveaways must comply with applicable laws and regulations. Organizers are responsible for prize fulfillment and winner selection. Participants must follow entry requirements and may be disqualified for fraudulent activity.`
    },
    {
      id: 'prohibited-conduct',
      title: 'Prohibited Conduct',
      icon: AlertTriangle,
      content: `Users may not engage in fraudulent activities, create fake accounts, manipulate giveaway entries, violate intellectual property rights, or use the platform for illegal purposes. Violations may result in account termination.`
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
            <FileText className="w-12 h-12 text-white animate-pulse" />
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Terms of Service
          </h1>
          
          <p className="text-xl md:text-2xl text-pink-100 mb-10 max-w-4xl mx-auto leading-relaxed">
            These terms govern your use of GiveawayHub and outline the magical rules 
            that keep our community safe and fair.
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
                Welcome to GiveawayHub
              </h2>
              <div className="prose prose-lg text-gray-700 leading-relaxed space-y-4">
                <p>
                  These Terms of Service ("Terms") govern your use of the GiveawayHub platform 
                  operated by GiveawayHub Technologies ("us", "we", or "our"). Our platform 
                  provides giveaway management and participation services.
                </p>
                <p>
                  By accessing or using our service, you agree to be bound by these Terms. 
                  If you disagree with any part of these terms, then you may not access the service.
                </p>
                <p>
                  We reserve the right to update these Terms at any time. We will notify users 
                  of any material changes via email or through our platform.
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
                  <p className="text-gray-700 leading-relaxed">{section.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Detailed Terms */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Payment Terms */}
          <Card className="bg-white/90 backdrop-blur-sm border-pink-200 shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-maroon-800 flex items-center">
                <FileText className="w-6 h-6 mr-3 text-pink-600" />
                Payment and Billing Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-lg text-gray-700 leading-relaxed space-y-4">
              <h4 className="font-semibold text-maroon-800">Subscription Plans</h4>
              <ul className="list-disc pl-6 space-y-2">
                <li>Subscription fees are billed in advance on a monthly or yearly basis</li>
                <li>All fees are non-refundable except as required by law</li>
                <li>You may cancel your subscription at any time</li>
                <li>Price changes will be communicated 30 days in advance</li>
              </ul>
              
              <h4 className="font-semibold text-maroon-800">Payment Processing</h4>
              <ul className="list-disc pl-6 space-y-2">
                <li>Payments are processed securely through PayU</li>
                <li>You authorize us to charge your payment method</li>
                <li>Failed payments may result in service suspension</li>
                <li>All transactions are in Indian Rupees (INR)</li>
              </ul>
            </CardContent>
          </Card>

          {/* Intellectual Property */}
          <Card className="bg-white/90 backdrop-blur-sm border-pink-200 shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-maroon-800 flex items-center">
                <Shield className="w-6 h-6 mr-3 text-pink-600" />
                Intellectual Property Rights
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-lg text-gray-700 leading-relaxed space-y-4">
              <h4 className="font-semibold text-maroon-800">Our Content</h4>
              <p>
                The GiveawayHub platform, including its design, features, and content, is owned by 
                GiveawayHub Technologies and protected by copyright, trademark, and other intellectual 
                property laws.
              </p>
              
              <h4 className="font-semibold text-maroon-800">User Content</h4>
              <p>
                You retain ownership of content you create on our platform. By posting content, 
                you grant us a non-exclusive license to use, display, and distribute your content 
                in connection with our services.
              </p>
              
              <h4 className="font-semibold text-maroon-800">Respect for Others</h4>
              <p>
                You agree not to infringe on the intellectual property rights of others. 
                We will respond to valid copyright infringement notices in accordance with applicable law.
              </p>
            </CardContent>
          </Card>

          {/* Limitation of Liability */}
          <Card className="bg-white/90 backdrop-blur-sm border-pink-200 shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-maroon-800 flex items-center">
                <AlertTriangle className="w-6 h-6 mr-3 text-pink-600" />
                Limitation of Liability
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-lg text-gray-700 leading-relaxed space-y-4">
              <p>
                To the maximum extent permitted by law, GiveawayHub Technologies shall not be liable 
                for any indirect, incidental, special, consequential, or punitive damages, including 
                without limitation, loss of profits, data, use, goodwill, or other intangible losses.
              </p>
              
              <h4 className="font-semibold text-maroon-800">Service Availability</h4>
              <p>
                We strive to maintain high service availability but cannot guarantee uninterrupted 
                access. We are not liable for any damages resulting from service interruptions.
              </p>
              
              <h4 className="font-semibold text-maroon-800">Third-Party Services</h4>
              <p>
                Our platform may integrate with third-party services. We are not responsible for 
                the availability, accuracy, or content of such third-party services.
              </p>
            </CardContent>
          </Card>

          {/* Termination */}
          <Card className="bg-white/90 backdrop-blur-sm border-pink-200 shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-maroon-800 flex items-center">
                <Users className="w-6 h-6 mr-3 text-pink-600" />
                Account Termination
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-lg text-gray-700 leading-relaxed space-y-4">
              <h4 className="font-semibold text-maroon-800">Termination by You</h4>
              <p>
                You may terminate your account at any time by contacting our support team or 
                using the account deletion feature in your dashboard.
              </p>
              
              <h4 className="font-semibold text-maroon-800">Termination by Us</h4>
              <p>
                We may terminate or suspend your account immediately if you violate these Terms, 
                engage in fraudulent activity, or for any other reason at our sole discretion.
              </p>
              
              <h4 className="font-semibold text-maroon-800">Effect of Termination</h4>
              <p>
                Upon termination, your right to use the service will cease immediately. 
                We may retain certain information as required by law or for legitimate business purposes.
              </p>
            </CardContent>
          </Card>

          {/* Governing Law */}
          <Card className="bg-gradient-to-br from-pink-50 to-rose-50 border-pink-200 shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-maroon-800 flex items-center">
                <Scale className="w-6 h-6 mr-3 text-pink-600" />
                Governing Law and Disputes
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-lg text-gray-700 leading-relaxed space-y-4">
              <h4 className="font-semibold text-maroon-800">Applicable Law</h4>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of India, 
                without regard to its conflict of law provisions.
              </p>
              
              <h4 className="font-semibold text-maroon-800">Dispute Resolution</h4>
              <p>
                Any disputes arising from these Terms or your use of our services shall be resolved 
                through binding arbitration in Bangalore, Karnataka, India, in accordance with the 
                Arbitration and Conciliation Act, 2015.
              </p>
              
              <h4 className="font-semibold text-maroon-800">Jurisdiction</h4>
              <p>
                You agree to submit to the personal jurisdiction of the courts located in Bangalore, 
                Karnataka, India for any actions not subject to arbitration.
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
            <span className="block text-pink-200">These Terms?</span>
          </h2>
          
          <p className="text-xl text-pink-100 mb-10 max-w-3xl mx-auto leading-relaxed">
            We're here to help you understand our terms and how they apply to your use of GiveawayHub. 
            Don't hesitate to reach out with any questions.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button
              as={Link}
              to="/contact"
              size="xl"
              className="bg-white text-maroon-700 hover:bg-pink-50 shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 px-12"
            >
              <Mail className="w-5 h-5 mr-2" />
              Contact Legal Team
            </Button>
            <Button
              as="a"
              href="mailto:legal@giveawayhub.com"
              size="xl"
              variant="outline"
              className="border-2 border-white text-white hover:bg-white hover:text-maroon-700 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 px-12"
            >
              <FileText className="w-5 h-5 mr-2" />
              Email Legal Team
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};