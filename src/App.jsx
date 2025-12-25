import { useState } from 'react'
import LandingPage from './components/LandingPage'
import SurveyForm from './components/SurveyForm'

function App() {
  const [showSurvey, setShowSurvey] = useState(false)

  return (
    <div className="min-h-screen bg-notion-bg text-notion-text">
      {!showSurvey ? (
        <LandingPage onStartSurvey={() => setShowSurvey(true)} />
      ) : (
        <SurveyForm onBack={() => setShowSurvey(false)} />
      )}
    </div>
  )
}

export default App

