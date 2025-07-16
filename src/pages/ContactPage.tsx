import React, { useState } from 'react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  MessageCircle, 
  Send,
  Gift,
  Sparkles,
  Clock,
  CheckCircle
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input, Textarea } from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import toast from 'react-hot-toast';

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: 'AdiAru Softsolutions Pvt Ltd',
    email: 'ind.codex.softsolutions@gmail.com',
    subject: '',
    message: '',
    category: 'general'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate form submission
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Message sent successfully! We\'ll get back to you soon. ✨');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        category: 'general'
      });
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const contactMethods = [
    {
      icon: Mail,
      title: 'Email Support',
      description: 'Get help via email within 24 hours',
      contact: 'ind.codex.softsolutions@gmail.com',
      action: 'mailto:ind.codex.softsolutions@gmail.com',
      color: 'from-pink-500 to-rose-500'
    },
    {
      icon: MessageCircle,
      title: 'Live Chat',
      description: 'Chat with our support team instantly',
      contact: 'Available 9 AM - 6 PM IST',
      action: '#',
      color: 'from-maroon-500 to-pink-500'
    },
    {
      icon: Phone,
      title: 'Phone Support',
      description: 'Call us for urgent matters',
      contact: '+91 8380097432',
      action: 'tel:+918380097432',
      color: 'from-rose-500 to-maroon-500'
    }
  ];

  const categories = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'technical', label: 'Technical Support' },
    { value: 'billing', label: 'Billing & Payments' },
    { value: 'giveaway', label: 'Giveaway Help' },
    { value: 'partnership', label: 'Partnership' },
    { value: 'feedback', label: 'Feedback' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-maroon-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-gradient-maroon-pink opacity-95"></div>
        <div className="absolute inset-0 bg-pattern-dots-white opacity-30"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 w-20 h-20 mx-auto mb-8">
            <MessageCircle className="w-12 h-12 text-white animate-pulse" />
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Contact Us
          </h1>
          
          <p className="text-xl md:text-2xl text-pink-100 mb-10 max-w-4xl mx-auto leading-relaxed">
            Have questions or need help? Our magical support team is here to assist you 
            on your giveaway journey.
          </p>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-20 bg-white relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-pink-50/30 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-maroon-700 to-pink-600 bg-clip-text text-transparent mb-6">
              Get in Touch
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Choose the best way to reach us. We're here to help make your experience magical.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {contactMethods.map((method) => (
              <Card key={method.title} className="text-center p-8 hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-gradient-to-br from-pink-50 to-rose-50 border-pink-200">
                <div className={`bg-gradient-to-br ${method.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg`}>
                  <method.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-maroon-800 mb-4">{method.title}</h3>
                <p className="text-gray-700 mb-4 leading-relaxed">{method.description}</p>
                <p className="text-maroon-600 font-semibold mb-6">{method.contact}</p>
                <Button
                  as="a"
                  href={method.action}
                  size="sm"
                  className="bg-gradient-to-r from-maroon-600 to-pink-600 hover:from-maroon-700 hover:to-pink-700"
                >
                  Contact Now
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-20 bg-gradient-to-br from-pink-50 via-rose-50 to-maroon-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-maroon-700 to-pink-600 bg-clip-text text-transparent mb-6">
              Send us a Message
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Fill out the form below and we'll get back to you as soon as possible.
            </p>
          </div>

          <Card className="bg-white/90 backdrop-blur-sm border-pink-200 shadow-2xl">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Full Name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => updateFormData('name', e.target.value)}
                    required
                    fullWidth
                    placeholder="Enter your full name"
                    className="border-pink-200 focus:border-maroon-400 focus:ring-maroon-400"
                  />

                  <Input
                    label="Email Address"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateFormData('email', e.target.value)}
                    required
                    fullWidth
                    placeholder="Enter your email"
                    className="border-pink-200 focus:border-maroon-400 focus:ring-maroon-400"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => updateFormData('category', e.target.value)}
                      className="block w-full rounded-lg border-pink-200 shadow-sm focus:border-maroon-400 focus:ring-maroon-400 py-2.5 px-3"
                    >
                      {categories.map((category) => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <Input
                    label="Subject"
                    type="text"
                    value={formData.subject}
                    onChange={(e) => updateFormData('subject', e.target.value)}
                    required
                    fullWidth
                    placeholder="Brief subject of your message"
                    className="border-pink-200 focus:border-maroon-400 focus:ring-maroon-400"
                  />
                </div>

                <Textarea
                  label="Message"
                  value={formData.message}
                  onChange={(e) => updateFormData('message', e.target.value)}
                  required
                  fullWidth
                  rows={6}
                  placeholder="Tell us how we can help you..."
                  className="border-pink-200 focus:border-maroon-400 focus:ring-maroon-400"
                />

                <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-lg p-4 border border-pink-200">
                  <div className="flex items-start space-x-3">
                    <Clock className="w-5 h-5 text-maroon-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-maroon-800 mb-1">Response Time</h4>
                      <p className="text-sm text-gray-700">
                        We typically respond within 24 hours during business days. 
                        For urgent matters, please use our live chat or phone support.
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  loading={loading}
                  fullWidth
                  size="lg"
                  icon={Send}
                  className="bg-gradient-to-r from-maroon-600 to-pink-600 hover:from-maroon-700 hover:to-pink-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Office Info */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-maroon-700 to-pink-600 bg-clip-text text-transparent mb-6">
              Our Office
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Visit us at our magical headquarters or reach out through any of our channels.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Card className="bg-gradient-to-br from-pink-50 to-rose-50 border-pink-200 shadow-xl">
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <div className="flex items-start space-x-4">
                      <div className="bg-gradient-to-br from-maroon-500 to-pink-500 p-3 rounded-lg">
                        <MapPin className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-maroon-800 mb-2">Address</h3>
                        <p className="text-gray-700 leading-relaxed">
                          GiveawayHub Technologies<br />
                          123 Innovation Street<br />
                          Tech Park, Bangalore 560001<br />
                          Karnataka, India
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="bg-gradient-to-br from-rose-500 to-maroon-500 p-3 rounded-lg">
                        <Clock className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-maroon-800 mb-2">Business Hours</h3>
                        <div className="text-gray-700 space-y-1">
                          <p>Monday - Friday: 9:00 AM - 6:00 PM IST</p>
                          <p>Saturday: 10:00 AM - 4:00 PM IST</p>
                          <p>Sunday: Closed</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="bg-gradient-to-br from-pink-500 to-rose-500 p-3 rounded-lg">
                        <CheckCircle className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-maroon-800 mb-2">Support Availability</h3>
                        <p className="text-gray-700 leading-relaxed">
                          24/7 email support<br />
                          Live chat during business hours<br />
                          Emergency phone support available
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="bg-gradient-to-br from-maroon-100 to-pink-100 rounded-2xl p-8 h-96 flex items-center justify-center">
              <div className="text-center">
                <div className="bg-white/80 backdrop-blur-sm rounded-full p-6 w-24 h-24 mx-auto mb-6 shadow-lg">
                  <Gift className="w-12 h-12 text-maroon-600 mx-auto" />
                </div>
                <h3 className="text-2xl font-bold text-maroon-800 mb-4">Visit Our Office</h3>
                <p className="text-gray-700 leading-relaxed max-w-md mx-auto">
                  Come see where the magic happens! Our doors are always open for our 
                  valued users and partners.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-rose-maroon"></div>
        <div className="absolute inset-0 bg-pattern-circles-white opacity-20"></div>
        
        <div className="relative max-w-5xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-full p-6 w-24 h-24 mx-auto mb-8">
            <Sparkles className="w-12 h-12 text-pink-200 mx-auto" />
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            Ready to Create
            <span className="block text-pink-200">Something Magical?</span>
          </h2>
          
          <p className="text-xl text-pink-100 mb-10 max-w-3xl mx-auto leading-relaxed">
            Don't wait! Start your giveaway journey today and connect with your audience 
            in the most enchanting way possible.
          </p>
          
          <Button
            as="a"
            href="/auth/signup"
            size="xl"
            className="bg-white text-maroon-700 hover:bg-pink-50 shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 px-12"
          >
            <Gift className="w-5 h-5 mr-2" />
            Get Started Today
          </Button>
        </div>
      </section>
    </div>
  );
};
