import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { GiveawayProvider } from './contexts/GiveawayContext';
import { LandingPage } from './components/LandingPage';
import { AuthPage } from './components/AuthPage';
import { Dashboard } from './components/Dashboard';
import { CreateGiveaway } from './components/CreateGiveaway';
import { Analytics } from './components/Analytics';
import { SubscriptionPlans } from './components/SubscriptionPlans';
import { PublicGiveaway } from './components/PublicGiveaway';
import { Navbar } from './components/Navbar';
import { Loader2 } from 'lucide-react';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('landing');
  const [giveawayId, setGiveawayId] = useState<string | undefined>();

  const handleNavigation = (page: string, id?: string) => {
    setCurrentPage(page);
    setGiveawayId(id);
  };

  // Check if we're viewing a public giveaway
  const urlParams = new URLSearchParams(window.location.search);
  const publicGiveawayId = urlParams.get('giveaway');
  
  if (publicGiveawayId) {
    return (
      <GiveawayProvider>
        <PublicGiveaway giveawayId={publicGiveawayId} />
      </GiveawayProvider>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="mx-auto text-purple-600 animate-spin mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    if (currentPage === 'auth') {
      return <AuthPage onBack={() => handleNavigation('landing')} />;
    }
    return <LandingPage onGetStarted={() => handleNavigation('auth')} />;
  }

  return (
    <GiveawayProvider>
      <div className="min-h-screen bg-gray-50">
        <Navbar onNavigate={handleNavigation} currentPage={currentPage} />
        
        {currentPage === 'dashboard' && (
          <Dashboard onNavigate={handleNavigation} />
        )}
        
        {currentPage === 'create' && (
          <CreateGiveaway onBack={() => handleNavigation('dashboard')} />
        )}
        
        {currentPage === 'analytics' && (
          <Analytics />
        )}

        {currentPage === 'subscription' && (
          <SubscriptionPlans />
        )}
      </div>
    </GiveawayProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;