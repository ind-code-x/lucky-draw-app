import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  HelpCircle, 
  Book, 
  MessageCircle, 
  Mail, 
  Phone,
  ChevronDown,
  ChevronRight,
  Gift,
  Sparkles,
  Users,
  Trophy,
  Shield,
  Zap
} from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export const HelpPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const faqs: FAQ[] = [
    {
      id: '1',
      question: 'How do I create my first giveaway?',
      answer: 'Creating a giveaway is simple! Sign up as an organizer, go to your dashboard, and click "Create Giveaway". Fill in the details like title, description, prizes, and entry methods. Set your start and end dates, then publish your magical giveaway!',
      category: 'organizers'
    },
    {
      id: '2',
      question: 'How do I enter a giveaway?',
      answer: 'Browse active giveaways on our homepage, click on one that interests you, and follow the entry methods listed (like following social accounts, sharing posts, or referring friends). Each method gives you entries to increase your chances of winning!',
      category: 'participants'
    },
    {
      id: '3',
      question: 'How are winners selected?',
      answer: 'Winners are selected using our provably fair random selection algorithm. All entries are counted, and winners are drawn randomly when the giveaway ends. The process is completely transparent and auditable.',
      category: 'general'
    },
    {
      id: '4',
      question: 'What payment methods do you accept?',
      answer: 'We accept all major payment methods through PayU including credit cards, debit cards, net banking, UPI, and digital wallets. All transactions are secure and encrypted.',
      category: 'billing'
    },
    {
      id: '5',
      question: 'Can I cancel my subscription?',
      answer: 'Yes, you can cancel your subscription anytime from your dashboard settings. Your access will continue until the end of your current billing period, and no future charges will be made.',
      category: 'billing'
    },
    {
      id: '6',
      question: 'How do I increase my chances of winning?',
      answer: 'Complete all available entry methods, refer friends using your unique referral code, and participate in multiple giveaways. Each entry method gives you additional chances to win!',
      category: 'participants'
    },
    {
      id: '7',
      question: 'What happens if I win a giveaway?',
      answer: 'Congratulations! You\'ll be notified via email and in your dashboard. You\'ll need to respond within the specified timeframe to claim your prize. The organizer will then coordinate prize delivery with you.',
      category: 'participants'
    },
    {
      id: '8',
      question: 'How do I manage my giveaway entries?',
      answer: 'As an organizer, you can view all entries, participant details, and analytics in your dashboard. You can also export data, manage winners, and track engagement metrics.',
      category: 'organizers'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Topics', icon: Book },
    { id: 'general', name: 'General', icon: HelpCircle },
    { id: 'participants', name: 'For Participants', icon: Users },
    { id: 'organizers', name: 'For Organizers', icon: Trophy },
    { id: 'billing', name: 'Billing & Plans', icon: Shield }
  ];

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const toggleFAQ = (id: string) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-maroon-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-gradient-maroon-pink opacity-95"></div>
        <div className="absolute inset-0 bg-pattern-dots-white opacity-30"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 w-20 h-20 mx-auto mb-8">
            <HelpCircle className="w-12 h-12 text-white animate-pulse" />
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Help Center
          </h1>
          
          <p className="text-xl md:text-2xl text-pink-100 mb-10 max-w-4xl mx-auto leading-relaxed">
            Find answers to your questions and get the most out of your magical giveaway experience.
          </p>

          {/* Search */}
          <div className="max-w-2xl mx-auto">
            <Input
              placeholder="Search for help articles..."
              icon={Search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white/90 backdrop-blur-sm border-pink-200 focus:border-white focus:ring-white text-lg py-4"
            />
          </div>
        </div>
      </section>

      {/* Quick Help Cards */}
      <section className="py-20 bg-white relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-pink-50/30 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-maroon-700 to-pink-600 bg-clip-text text-transparent mb-6">
              Quick Help
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Get instant help with the most common questions and tasks.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center p-8 hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-gradient-to-br from-pink-50 to-rose-50 border-pink-200">
              <div className="bg-gradient-to-br from-maroon-500 to-pink-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Gift className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-maroon-800 mb-4">Create Giveaway</h3>
              <p className="text-gray-700 mb-6 leading-relaxed">Learn how to create your first magical giveaway</p>
              <Button
                as={Link}
                to="/how-it-works"
                size="sm"
                className="bg-gradient-to-r from-maroon-600 to-pink-600 hover:from-maroon-700 hover:to-pink-700"
              >
                Learn More
              </Button>
            </Card>

            <Card className="text-center p-8 hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-gradient-to-br from-rose-50 to-pink-50 border-pink-200">
              <div className="bg-gradient-to-br from-rose-500 to-maroon-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-maroon-800 mb-4">Enter Giveaways</h3>
              <p className="text-gray-700 mb-6 leading-relaxed">Discover how to participate and win amazing prizes</p>
              <Button
                as={Link}
                to="/"
                size="sm"
                className="bg-gradient-to-r from-rose-600 to-maroon-600 hover:from-rose-700 hover:to-maroon-700"
              >
                Browse Giveaways
              </Button>
            </Card>

            <Card className="text-center p-8 hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-gradient-to-br from-maroon-50 to-rose-50 border-pink-200">
              <div className="bg-gradient-to-br from-pink-500 to-rose-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-maroon-800 mb-4">Billing Help</h3>
              <p className="text-gray-700 mb-6 leading-relaxed">Manage your subscription and payment methods</p>
              <Button
                as={Link}
                to="/subscription"
                size="sm"
                className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700"
              >
                View Plans
              </Button>
            </Card>

            <Card className="text-center p-8 hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-gradient-to-br from-pink-50 to-maroon-50 border-pink-200">
              <div className="bg-gradient-to-br from-maroon-600 to-pink-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-maroon-800 mb-4">Contact Support</h3>
              <p className="text-gray-700 mb-6 leading-relaxed">Get personalized help from our support team</p>
              <Button
                as={Link}
                to="/contact"
                size="sm"
                className="bg-gradient-to-r from-maroon-600 to-pink-600 hover:from-maroon-700 hover:to-pink-700"
              >
                Contact Us
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gradient-to-br from-pink-50 via-rose-50 to-maroon-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-maroon-700 to-pink-600 bg-clip-text text-transparent mb-6">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Find answers to the most common questions about GiveawayHub.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Categories */}
            <div className="lg:w-1/4">
              <Card className="bg-white/90 backdrop-blur-sm border-pink-200 shadow-xl sticky top-8">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-maroon-800">Categories</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-all duration-300 ${
                        selectedCategory === category.id
                          ? 'bg-gradient-to-r from-maroon-100 to-pink-100 text-maroon-700 shadow-md'
                          : 'hover:bg-pink-50 text-gray-700'
                      }`}
                    >
                      <category.icon className="w-5 h-5" />
                      <span className="font-medium">{category.name}</span>
                    </button>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* FAQ List */}
            <div className="lg:w-3/4">
              <div className="space-y-4">
                {filteredFAQs.map((faq) => (
                  <Card key={faq.id} className="bg-white/90 backdrop-blur-sm border-pink-200 shadow-lg hover:shadow-xl transition-all duration-300">
                    <button
                      onClick={() => toggleFAQ(faq.id)}
                      className="w-full p-6 text-left flex items-center justify-between hover:bg-pink-50 transition-colors duration-300"
                    >
                      <h3 className="text-lg font-semibold text-maroon-800 pr-4">{faq.question}</h3>
                      {expandedFAQ === faq.id ? (
                        <ChevronDown className="w-5 h-5 text-maroon-600 flex-shrink-0" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-maroon-600 flex-shrink-0" />
                      )}
                    </button>
                    {expandedFAQ === faq.id && (
                      <div className="px-6 pb-6">
                        <div className="border-t border-pink-200 pt-4">
                          <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>

              {filteredFAQs.length === 0 && (
                <Card className="bg-white/90 backdrop-blur-sm border-pink-200 shadow-xl">
                  <CardContent className="p-12 text-center">
                    <HelpCircle className="w-16 h-16 text-pink-300 mx-auto mb-6" />
                    <h3 className="text-2xl font-bold text-maroon-800 mb-4">No Results Found</h3>
                    <p className="text-gray-600 mb-8 leading-relaxed">
                      We couldn't find any FAQs matching your search. Try different keywords or browse all categories.
                    </p>
                    <Button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('all');
                      }}
                      className="bg-gradient-to-r from-maroon-600 to-pink-600 hover:from-maroon-700 hover:to-pink-700"
                    >
                      Clear Filters
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
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
            Still Need Help?
          </h2>
          
          <p className="text-xl text-pink-100 mb-10 max-w-3xl mx-auto leading-relaxed">
            Our magical support team is here to help you succeed. Get personalized assistance for any questions or issues.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button
              as={Link}
              to="/contact"
              size="xl"
              className="bg-white text-maroon-700 hover:bg-pink-50 shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 px-12"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Contact Support
            </Button>
            <Button
              as="a"
              href="mailto:support@giveawayhub.com"
              size="xl"
              variant="outline"
              className="border-2 border-white text-white hover:bg-white hover:text-maroon-700 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 px-12"
            >
              <Mail className="w-5 h-5 mr-2" />
              Email Us
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};