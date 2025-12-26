import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Footer from './Footer'
import GovernmentBanner from './GovernmentBanner'
import CookieConsentModal from './CookieConsentModal'
import { hasConsent } from '../utils/cookies'

function LandingPage() {
  const navigate = useNavigate()
  const [showCookieModal, setShowCookieModal] = useState(false)

  // Show cookie modal on page load if consent hasn't been given
  useEffect(() => {
    if (!hasConsent()) {
      setShowCookieModal(true)
    }
  }, [])

  const handleStartSurvey = () => {
    if (hasConsent()) {
      navigate('/survey/select')
    } else {
      setShowCookieModal(true)
    }
  }

  const handleAcceptCookies = () => {
    setShowCookieModal(false)
    navigate('/survey/select')
  }

  const handleDeclineCookies = () => {
    setShowCookieModal(false)
    // User can still browse but won't be able to submit survey without cookies
  }

  return (
    <div className="min-h-screen flex flex-col">
      <GovernmentBanner />

      {/* Main Content - Minimal */}
      <div className="flex-1 flex items-center justify-center notion-content py-12">
        <div className="text-center max-w-2xl mx-auto px-4">
          <h1 className="text-5xl font-bold mb-6">The Last Caretaker Survey</h1>
          <p className="text-xl text-notion-text-secondary mb-12">
            Share your experience with the CU1 update
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <button
              onClick={handleStartSurvey}
              className="bg-notion-accent hover:bg-orange-600 text-white font-semibold px-8 py-4 rounded-lg transition-colors duration-200 text-lg"
            >
              Take Survey(s)
            </button>
            <Link
              to="/"
              className="bg-notion-bg-secondary hover:bg-notion-bg-tertiary text-notion-text font-semibold px-8 py-4 rounded-lg transition-colors duration-200 text-lg border border-notion-border"
            >
              More Info
            </Link>
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

export default LandingPage

