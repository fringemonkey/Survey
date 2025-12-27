import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './components/HomePage'
import AboutPage from './components/AboutPage'
import MethodologyPage from './components/MethodologyPage'
import LandingPage from './components/LandingPage'
import SurveySelectionPage from './components/SurveySelectionPage'
import HardwareSurvey from './components/HardwareSurvey'
import BugSurvey from './components/BugSurvey'
import PerformanceSurvey from './components/PerformanceSurvey'
import QuestSurvey from './components/QuestSurvey'
import StorySurvey from './components/StorySurvey'
import PersonalDataSurvey from './components/PersonalDataSurvey'
import SurveyForm from './components/SurveyForm'
import CookiePolicyPage from './components/CookiePolicyPage'
import DashboardPage from './components/DashboardPage'
import AdminPage from './components/AdminPage'
import AdminLogin from './components/AdminLogin'
import AdminPanelPage from './components/AdminPanelPage'
import ScrollToTop from './components/ScrollToTop'

function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen bg-notion-bg text-notion-text">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/info" element={<HomePage />} />
          <Route path="/methodology" element={<MethodologyPage />} />
          <Route path="/survey" element={<LandingPage />} />
          <Route path="/survey/select" element={<SurveySelectionPage />} />
          <Route path="/survey/hardware" element={<HardwareSurvey />} />
          <Route path="/survey/bug" element={<BugSurvey />} />
          <Route path="/survey/performance" element={<PerformanceSurvey />} />
          <Route path="/survey/quest" element={<QuestSurvey />} />
          <Route path="/survey/story" element={<StorySurvey />} />
          <Route path="/survey/personal" element={<PersonalDataSurvey />} />
          <Route path="/survey/form" element={<SurveyForm />} />
          <Route path="/cookie-policy" element={<CookiePolicyPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin-panel" element={<AdminPanelPage />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
