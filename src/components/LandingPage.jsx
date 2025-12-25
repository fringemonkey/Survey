import React from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Callout from './Callout'
import Footer from './Footer'
import GovernmentBanner from './GovernmentBanner'

function LandingPage() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen">
      <GovernmentBanner />

      {/* Main Content */}
      <div className="notion-content py-12">
        <div className="mb-8">
          <Link
            to="/"
            className="text-notion-text-secondary hover:text-notion-accent transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
        </div>

        <section className="my-8 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Start?</h2>
          <p className="text-notion-text-secondary leading-relaxed mb-8 max-w-2xl mx-auto">
            This survey focuses on your experience with the CU1 update—performance, stability, and gameplay changes. Your feedback helps identify common issues and improve the community's understanding of the update's impact.
          </p>
        </section>

        <section className="my-8 bg-notion-bg-secondary rounded-lg p-8">
          <h3 className="text-2xl font-bold mb-6 text-center">Survey Sections</h3>
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <div className="bg-notion-bg rounded-lg p-4">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <span className="text-red-500">●</span>
                Required Section
              </h4>
              <p className="text-sm text-notion-text-secondary">Stability and performance feedback</p>
            </div>
            <div className="bg-notion-bg rounded-lg p-4">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <span className="text-gray-500">○</span>
                Optional Sections
              </h4>
              <p className="text-sm text-notion-text-secondary">Quests, exploration, and lore feedback</p>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={() => navigate('/survey/form')}
              className="bg-notion-accent hover:bg-orange-600 text-white font-semibold px-8 py-4 rounded-lg transition-colors duration-200 text-lg"
            >
              Start Survey
            </button>
            <p className="text-sm text-notion-text-secondary mt-4">
              Estimated time: ~5 minutes for required sections, up to ~10 minutes total
            </p>
          </div>
        </section>

        <Callout icon="⚠️" className="mt-8">
          <p className="mb-2">
            <strong>Eligibility:</strong> You must be <strong>16 years or older</strong> to participate. 
            We collect your Discord username and age for data quality purposes only.
          </p>
          <p className="text-sm text-notion-text-secondary">
            For detailed information about data collection, privacy, and survey methodology, please review the <Link to="/" className="text-notion-accent hover:underline">home page</Link> and <Link to="/methodology" className="text-notion-accent hover:underline">methodology page</Link>.
          </p>
        </Callout>
      </div>
      <Footer />
    </div>
  )
}

export default LandingPage

