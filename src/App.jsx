import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from '@/components/ProtectedRoute';
import RequireRole from '@/components/admin/RequireRole';
import { ROUTE_REDIRECTS } from '@/lib/admin-nav';

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

// Admin — primary
import Overview from '@/pages/admin/Overview';
import Leads from '@/pages/admin/Leads';
import PagesAdmin from '@/pages/admin/Pages';
import AnalyticsAdmin from '@/pages/admin/Analytics';
import BlogAdmin from '@/pages/admin/Blog';
import SurveysAdmin from '@/pages/admin/Surveys';
import LandingPagesAdmin from '@/pages/admin/LandingPages';
import AdvertorialsAdmin from '@/pages/admin/Advertorials';
import ClaimBotAdmin from '@/pages/admin/ClaimBot';
import NewsInsightsAdmin from '@/pages/admin/NewsInsights';

// Admin — tools
import CalculatedFields from '@/pages/admin/tools/CalculatedFields';
import Webhooks from '@/pages/admin/tools/Webhooks';
import CustomFields from '@/pages/admin/tools/CustomFields';
import ContactForms from '@/pages/admin/tools/ContactForms';
import CompletionRouting from '@/pages/admin/tools/CompletionRouting';
import ExperimentsAdmin from '@/pages/admin/Experiments';
import ExperimentEditor from '@/pages/admin/ExperimentEditor';

// Admin — settings
import GeneralSettings from '@/pages/admin/settings/General';
import UsersSettings from '@/pages/admin/settings/Users';
import SeoSettings from '@/pages/admin/settings/SEO';
import IntegrationsSettings from '@/pages/admin/settings/Integrations';
import TrackingSettings from '@/pages/admin/settings/Tracking';
import BotSettings from '@/pages/admin/settings/Bot';
import KnowledgeBaseSettings from '@/pages/admin/settings/KnowledgeBase';
import ThemesAdmin from '@/pages/admin/Themes';

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

      {/* Admin — auth-gated, then role-gated */}
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route element={<RequireRole />}>
          {/* Primary */}
          <Route path="/admin" element={<Overview />} />
          <Route path="/admin/leads" element={<Leads />} />
          <Route path="/admin/pages" element={<PagesAdmin />} />
          <Route path="/admin/analytics" element={<AnalyticsAdmin />} />
          <Route path="/admin/blog" element={<BlogAdmin />} />
          <Route path="/admin/surveys" element={<SurveysAdmin />} />
          <Route path="/admin/landing-pages" element={<LandingPagesAdmin />} />
          <Route path="/admin/advertorials" element={<AdvertorialsAdmin />} />
          <Route path="/admin/claimbot" element={<ClaimBotAdmin />} />
          <Route path="/admin/news-insights" element={<NewsInsightsAdmin />} />

          {/* Tools */}
          <Route path="/admin/tools/calculated-fields" element={<CalculatedFields />} />
          <Route path="/admin/tools/webhooks" element={<Webhooks />} />
          <Route path="/admin/tools/custom-fields" element={<CustomFields />} />
          <Route path="/admin/tools/contact-forms" element={<ContactForms />} />
          <Route path="/admin/tools/completion-routing" element={<CompletionRouting />} />
          <Route path="/admin/experiments" element={<ExperimentsAdmin />} />
          <Route path="/admin/experiments/new" element={<ExperimentEditor />} />
          <Route path="/admin/experiments/:id/edit" element={<ExperimentEditor />} />

          {/* Settings */}
          <Route path="/admin/settings/general" element={<GeneralSettings />} />
          <Route path="/admin/settings/users" element={<UsersSettings />} />
          <Route path="/admin/settings/seo" element={<SeoSettings />} />
          <Route path="/admin/settings/integrations" element={<IntegrationsSettings />} />
          <Route path="/admin/settings/tracking" element={<TrackingSettings />} />
          <Route path="/admin/settings/bot" element={<BotSettings />} />
          <Route path="/admin/settings/knowledge-base" element={<KnowledgeBaseSettings />} />
          <Route path="/admin/themes" element={<ThemesAdmin />} />

          {/* Legacy bookmarks — never delete a route, redirect it */}
          {Object.entries(ROUTE_REDIRECTS).map(([from, to]) => (
            <Route key={from} path={from} element={<Navigate to={to} replace />} />
          ))}
        </Route>
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
