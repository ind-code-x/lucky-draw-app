// App.tsx

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { SubscriptionPage } from './pages/SubscriptionPage'; // Assuming this is your PricingPage
import { SubscriptionSuccessPage } from './pages/subscription/SuccessPage';
import { SubscriptionFailurePage } from './pages/subscription/FailurePage';
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { EmailConfirmedPage } from './pages/auth/EmailConfirmedPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { CreateGiveawayPage } from './pages/dashboard/CreateGiveawayPage';
import { MyEntriesPage } from './pages/dashboard/MyEntriesPage';
import { HelpPage } from './pages/HelpPage';
import { ContactPage } from './pages/ContactPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';
import { ToolsIndexPage } from './pages/tools/ToolsIndexPage';
import { InstagramCommentPickerPage } from './pages/tools/InstagramCommentPickerPage';
import { GiveawayPage } from './pages/GiveawayPage';

import { useAuthStore } from './stores/authStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const { initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-white flex flex-col">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/how-it-works" element={<HowItWorksPage />} />
              <Route path="/pricing" element={<SubscriptionPage />} />
              <Route path="/subscription" element={<SubscriptionPage />} />
              <Route path="/subscription/success" element={<SubscriptionSuccessPage />} />
              <Route path="/subscription/failure" element={<SubscriptionFailurePage />} />
              <Route path="/auth/login" element={<LoginPage />} />
              <Route path="/auth/signup" element={<SignupPage />} />
              <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
              <Route path="/auth/email-confirmed" element={<EmailConfirmedPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/dashboard/create" element={<CreateGiveawayPage />} />
              <Route path="/dashboard/entries" element={<MyEntriesPage />} />
              <Route path="/help" element={<HelpPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/tools" element={<ToolsIndexPage />} />
              <Route path="/tools/instagram-comment-picker" element={<InstagramCommentPickerPage />} />
              
              <Route path="/giveaway/:id" element={<GiveawayPage />} />
            </Routes>
          </main>
          <Footer />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                style: {
                  background: '#10b981',
                },
              },
              error: {
                style: {
                  background: '#ef4444',
                },
              },
            }}
          />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
