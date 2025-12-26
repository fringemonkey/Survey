import React, { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Footer from './Footer'
import GovernmentBanner from './GovernmentBanner'

function LandingPage() {
  const navigate = useNavigate()

  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [])

  const handleStartSurvey = () => {
    navigate('/survey/select')
  }

  return (
    <div className="min-h-screen flex flex-col">
      <GovernmentBanner />

      {/* Main Content - Minimal */}
      <div className="flex-1 flex items-center justify-center notion-content py-12">
        <div className="text-center max-w-2xl mx-auto px-4">
          <h1 className="text-5xl font-bold mb-6">The Last Caretaker Survey</h1>
          <p className="text-xl text-notion-text-secondary mb-12">
            Share your experience with the Last Humans update
          </p>
          
          <div className="flex flex-col items-center gap-4 mb-4">
            <button
              onClick={handleStartSurvey}
              className="bg-notion-accent hover:bg-orange-600 text-white font-semibold px-8 py-4 rounded-lg transition-colors duration-200 text-lg"
            >
              Take Survey(s)
            </button>
            <div className="flex flex-col items-center gap-2">
              <Link
                to="/info"
                className="text-sm text-notion-text-secondary hover:text-notion-text transition-colors duration-200 underline"
              >
                More Info
              </Link>
              <p className="text-xs text-notion-text-secondary max-w-md">
                Learn about data collection, privacy policy, survey methodology, and project disclaimers
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default LandingPage

