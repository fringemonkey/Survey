import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './components/HomePage'
import MethodologyPage from './components/MethodologyPage'
import LandingPage from './components/LandingPage'
import SurveyForm from './components/SurveyForm'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-notion-bg text-notion-text">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/methodology" element={<MethodologyPage />} />
          <Route path="/survey" element={<LandingPage />} />
          <Route path="/survey/form" element={<SurveyForm />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
