import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Footer from './Footer'
import GovernmentBanner from './GovernmentBanner'
import CookieConsentModal from './CookieConsentModal'
import { hasConsent } from '../utils/cookies'

function SurveySelectionPage() {
  const navigate = useNavigate()
  const [showCookieModal, setShowCookieModal] = useState(false)
  const [completedSurveys, setCompletedSurveys] = useState(() => {
    // Load completed surveys from localStorage
    try {
      const saved = localStorage.getItem('completed_surveys')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    
    // Show cookie modal on page load if consent hasn't been given
    if (!hasConsent()) {
      setShowCookieModal(true)
    }
    
    // Refresh completed surveys when component mounts or when returning from a survey
    const refreshCompleted = () => {
      try {
        const saved = localStorage.getItem('completed_surveys')
        setCompletedSurveys(saved ? JSON.parse(saved) : [])
      } catch {
        setCompletedSurveys([])
      }
    }
    
    refreshCompleted()
    
    // Also refresh when window gains focus (user returns to tab)
    window.addEventListener('focus', refreshCompleted)
    return () => window.removeEventListener('focus', refreshCompleted)
  }, [])

  const handleStartSurvey = (surveyType) => {
    if (hasConsent()) {
      navigate(`/survey/${surveyType}`)
    } else {
      setShowCookieModal(true)
    }
  }

  const handleAcceptCookies = () => {
    setShowCookieModal(false)
    // User can now proceed with surveys
  }

  const handleDeclineCookies = () => {
    setShowCookieModal(false)
    // User can still browse but won't be able to submit survey without cookies
  }

  const isCompleted = (surveyType) => completedSurveys.includes(surveyType)

  return (
    <div className="min-h-screen">
      <GovernmentBanner />

      <div className="notion-content py-12">
        <div className="mb-8">
          <Link
            to="/survey"
            className="text-notion-text-secondary hover:text-notion-accent transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Link>
        </div>

        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Select Survey</h2>
          <p className="text-notion-text-secondary">
            Complete the required surveys first, then choose any optional surveys you'd like to complete.
          </p>
        </div>

        {/* Required Surveys */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold mb-4">Required Surveys</h3>
          
          <div className="space-y-4">
            {/* Hardware Survey */}
            <div className="bg-notion-bg-secondary rounded-lg p-6 border-2 border-red-500">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Hardware Specs</h3>
                  <p className="text-notion-text-secondary">Required - Complete this first</p>
                  <p className="text-sm text-notion-text-secondary mt-2">~2 minutes • 4 questions</p>
                </div>
                <div className="flex items-center gap-4">
                  {isCompleted('hardware') && (
                    <span className="text-green-500 font-semibold flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Completed
                    </span>
                  )}
                  <button
                    onClick={() => handleStartSurvey('hardware')}
                    className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-200"
                  >
                    {isCompleted('hardware') ? 'Review' : 'Start'}
                  </button>
                </div>
              </div>
            </div>

            {/* Performance Survey */}
            <div className="bg-notion-bg-secondary rounded-lg p-6 border-2 border-red-500">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Performance</h3>
                  <p className="text-notion-text-secondary">Required - Complete after hardware</p>
                  <p className="text-sm text-notion-text-secondary mt-2">~2 minutes • 5 questions</p>
                </div>
                <div className="flex items-center gap-4">
                  {isCompleted('performance') && (
                    <span className="text-green-500 font-semibold flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Completed
                    </span>
                  )}
                  <button
                    onClick={() => handleStartSurvey('performance')}
                    className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-200"
                  >
                    {isCompleted('performance') ? 'Review' : 'Start'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Optional Surveys */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold mb-4">Optional Surveys</h3>
          <p className="text-notion-text-secondary mb-6">
            Complete any of these to provide additional feedback. Each takes ~1-2 minutes.
          </p>
          
          <div className="grid md:grid-cols-2 gap-4">
            {/* Bug Survey */}
            <div className="bg-notion-bg-secondary rounded-lg p-6 border border-notion-border">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-xl font-bold mb-2">Bug Report</h4>
                  <p className="text-sm text-notion-text-secondary">Report bugs you've encountered</p>
                  <p className="text-xs text-notion-text-secondary mt-1">5 questions</p>
                </div>
                {isCompleted('bug') && (
                  <span className="text-green-500">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                )}
              </div>
              <button
                onClick={() => handleStartSurvey('bug')}
                className="w-full bg-notion-accent hover:bg-orange-600 text-white font-semibold px-4 py-2 rounded-lg transition-colors duration-200"
              >
                {isCompleted('bug') ? 'Review' : 'Start'}
              </button>
            </div>

            {/* Quest Survey */}
            <div className="bg-notion-bg-secondary rounded-lg p-6 border border-notion-border">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-xl font-bold mb-2">Quests</h4>
                  <p className="text-sm text-notion-text-secondary">Quest experience and ratings</p>
                  <p className="text-xs text-notion-text-secondary mt-1">5 questions</p>
                </div>
                {isCompleted('quest') && (
                  <span className="text-green-500">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                )}
              </div>
              <button
                onClick={() => handleStartSurvey('quest')}
                className="w-full bg-notion-accent hover:bg-orange-600 text-white font-semibold px-4 py-2 rounded-lg transition-colors duration-200"
              >
                {isCompleted('quest') ? 'Review' : 'Start'}
              </button>
            </div>

            {/* Story Survey */}
            <div className="bg-notion-bg-secondary rounded-lg p-6 border border-notion-border">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-xl font-bold mb-2">Story</h4>
                  <p className="text-sm text-notion-text-secondary">Story engagement and feedback</p>
                  <p className="text-xs text-notion-text-secondary mt-1">5 questions</p>
                </div>
                {isCompleted('story') && (
                  <span className="text-green-500">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                )}
              </div>
              <button
                onClick={() => handleStartSurvey('story')}
                className="w-full bg-notion-accent hover:bg-orange-600 text-white font-semibold px-4 py-2 rounded-lg transition-colors duration-200"
              >
                {isCompleted('story') ? 'Review' : 'Start'}
              </button>
            </div>

            {/* Personal Data Survey */}
            <div className="bg-notion-bg-secondary rounded-lg p-6 border border-notion-border">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-xl font-bold mb-2">Personal Data</h4>
                  <p className="text-sm text-notion-text-secondary">Age, Discord name, and terms</p>
                  <p className="text-xs text-notion-text-secondary mt-1">3 questions</p>
                </div>
                {isCompleted('personal') && (
                  <span className="text-green-500">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                )}
              </div>
              <button
                onClick={() => handleStartSurvey('personal')}
                className="w-full bg-notion-accent hover:bg-orange-600 text-white font-semibold px-4 py-2 rounded-lg transition-colors duration-200"
              >
                {isCompleted('personal') ? 'Review' : 'Start'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <CookieConsentModal
        isOpen={showCookieModal}
        onAccept={handleAcceptCookies}
        onDecline={handleDeclineCookies}
      />

      <Footer />
    </div>
  )
}

export default SurveySelectionPage

