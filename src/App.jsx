import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from '@/components/ProtectedRoute';

// Auth pages
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';

// Public site
import PublicLayout from '@/components/site/PublicLayout';
import Home from '@/pages/Home';
import HowItWorks from '@/pages/HowItWorks';
import About from '@/pages/About';
import Contact from '@/pages/Contact';
import Faq from '@/pages/Faq';
import AccidentTypes from '@/pages/AccidentTypes';
import Resources from '@/pages/Resources';
import Blog from '@/pages/Blog';
import BlogDetail from '@/pages/BlogDetail';
import { Privacy, Terms, PrivacyChoices } from '@/pages/LegalPages';
import ClaimCheck from '@/pages/ClaimCheck';
import Submitted from '@/pages/Submitted';
import Thanks from '@/pages/Thanks';
import AdvertorialPage from '@/pages/AdvertorialPage';
import LandingPagePublic from '@/pages/LandingPagePublic';
import SurveyPage from '@/pages/SurveyPage';
import ExperimentPage from '@/pages/ExperimentPage';

// Admin
import Dashboard from '@/pages/admin/Dashboard';
import PagesAdmin from '@/pages/admin/Pages';
import BlogAdmin from '@/pages/admin/Blog';
import SEOAdmin from '@/pages/admin/SEO';
import Analytics from '@/pages/admin/Analytics';
import Signals from '@/pages/admin/Signals';
import Advertorials from '@/pages/admin/Advertorials';
import ClaimBot from '@/pages/admin/ClaimBot';
import Experiments from '@/pages/admin/Experiments';
import ExperimentEditor from '@/pages/admin/ExperimentEditor';
import Surveys from '@/pages/admin/Surveys';
import Themes from '@/pages/admin/Themes';
import LandingPages from '@/pages/admin/LandingPages';
import Integrations from '@/pages/admin/Integrations';
import UserManagement from '@/pages/admin/UserManagement';
import Settings from '@/pages/admin/Settings';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      {/* Auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Public site */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/faq" element={<Faq />} />
        <Route path="/accident-types" element={<AccidentTypes />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogDetail />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy-choices" element={<PrivacyChoices />} />
      </Route>

      {/* Claim flow + standalone public routes */}
      <Route path="/claim" element={<ClaimCheck />} />
      <Route path="/submitted" element={<Submitted />} />
      <Route path="/thanks" element={<Thanks />} />
      <Route path="/a/:slug" element={<AdvertorialPage />} />
      <Route path="/lp/:slug" element={<LandingPagePublic />} />
      <Route path="/s/:slug" element={<SurveyPage />} />
      <Route path="/tools/*" element={<ExperimentPage />} />
      <Route path="/community/*" element={<ExperimentPage />} />

      {/* Admin */}
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route path="/admin" element={<Dashboard />} />
        <Route path="/admin/pages" element={<PagesAdmin />} />
        <Route path="/admin/blog" element={<BlogAdmin />} />
        <Route path="/admin/seo" element={<SEOAdmin />} />
        <Route path="/admin/analytics" element={<Analytics />} />
        <Route path="/admin/signals" element={<Signals />} />
        <Route path="/admin/advertorials" element={<Advertorials />} />
        <Route path="/admin/claimbot" element={<ClaimBot />} />
        <Route path="/admin/experiments" element={<Experiments />} />
        <Route path="/admin/experiments/new" element={<ExperimentEditor />} />
        <Route path="/admin/experiments/:id/edit" element={<ExperimentEditor />} />
        <Route path="/admin/surveys" element={<Surveys />} />
        <Route path="/admin/themes" element={<Themes />} />
        <Route path="/admin/landing-pages" element={<LandingPages />} />
        <Route path="/admin/integrations" element={<Integrations />} />
        <Route path="/admin/users" element={<UserManagement />} />
        <Route path="/admin/settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App