import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import FormField from './FormField'
import Footer from './Footer'
import { submitSurvey } from '../services/api'
import { hasConsent, refreshSession, setSessionCookie, isSessionValid } from '../utils/cookies'

const FPS_RANGE_OPTIONS = [
  { value: '20', label: '20 FPS' },
  { value: '21-30', label: '21-30 FPS' },
  { value: '31-45', label: '31-45 FPS' },
  { value: '46-60', label: '46-60 FPS' },
  { value: '61-90', label: '61-90 FPS' },
  { value: '91-120', label: '91-120 FPS' },
  { value: '120+', label: '120+ FPS' },
]

const PERFORMANCE_CHANGE_OPTIONS = [
  { value: 'much_better', label: 'Much better' },
  { value: 'better', label: 'Better' },
  { value: 'same', label: 'About the same' },
  { value: 'worse', label: 'Worse' },
  { value: 'much_worse', label: 'Much worse' },
]

const STABILITY_OPTIONS = [
  { value: '1', label: '1 - Very Poor' },
  { value: '2', label: '2 - Poor' },
  { value: '3', label: '3 - Average' },
  { value: '4', label: '4 - Good' },
  { value: '5', label: '5 - Excellent' },
]

const DRAFT_STORAGE_KEY = 'performance_survey_draft'

function PerformanceSurvey() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState(() => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY)
      return saved ? JSON.parse(saved) : {
        avgFpsPreCu1: '',
        avgFpsPostCu1: '',
        performanceChange: '',
        overallStability: '',
      }
    } catch {
      return {
        avgFpsPreCu1: '',
        avgFpsPostCu1: '',
        performanceChange: '',
        overallStability: '',
      }
    }
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null)

  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    
    if (!hasConsent()) {
      navigate('/survey')
      return
    }
    
    if (!isSessionValid()) {
      setSessionCookie()
    } else {
      refreshSession()
    }
  }, [navigate])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => {
      const updated = { ...prev, [name]: value }
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(updated))
      return updated
    })
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    setIsSubmitting(true)
    setSubmitStatus(null)
    
    try {
      const submissionData = {
        ...formData,
        surveyType: 'performance',
      }
      
      await submitSurvey(submissionData)
      localStorage.removeItem(DRAFT_STORAGE_KEY)
      
      // Mark as completed
      const completed = JSON.parse(localStorage.getItem('completed_surveys') || '[]')
      if (!completed.includes('performance')) {
        completed.push('performance')
        localStorage.setItem('completed_surveys', JSON.stringify(completed))
      }
      
      setSubmitStatus('success')
    } catch (error) {
      console.error('Submission error:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitStatus === 'success') {
    return (
      <div className="notion-content py-12">
        <div className="bg-green-900/20 border border-green-500 rounded-lg p-8 text-center max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-4 text-green-400">Thank You!</h2>
          <p className="text-notion-text-secondary mb-6">
            Your performance feedback has been submitted successfully.
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate('/survey/select')}
              className="bg-notion-accent hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-200"
            >
              Continue to Other Surveys
            </button>
            <button
              onClick={() => navigate('/survey/select')}
              className="bg-notion-bg-secondary hover:bg-notion-bg-tertiary text-notion-text font-semibold px-6 py-3 rounded-lg transition-colors duration-200"
            >
              Done
            </button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="notion-content py-12">
      <div className="mb-8">
        <button
          onClick={() => navigate('/survey/select')}
          className="text-notion-text-secondary hover:text-notion-accent transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Survey Selection
        </button>
      </div>

      <div className="max-w-2xl mx-auto">
        <h2 className="text-4xl font-bold mb-2">Performance</h2>
        <p className="text-notion-text-secondary mb-4">
          Required survey • 4 questions • ~2 minutes
        </p>
        <p className="text-sm text-notion-text-secondary mb-8 bg-notion-bg-secondary rounded-lg p-4 border border-notion-border">
          <strong>Note:</strong> Approximate FPS numbers are perfectly fine. The more accurate you can be, the better, but estimates are welcome!
        </p>

        <form onSubmit={handleSubmit} className="bg-notion-bg-secondary rounded-lg p-6 space-y-6">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <label htmlFor="avgFpsPreCu1" className="block font-medium text-notion-text">
                Average FPS before Last Humans
              </label>
              <div className="group relative">
                <svg 
                  className="w-4 h-4 text-notion-text-secondary hover:text-notion-text cursor-help" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-2 bg-notion-bg border border-notion-border rounded-lg text-xs text-notion-text shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  Note: The in-game FPS counter doesn't display below 20 FPS (this is a bug in the current build). If your FPS is below 20, select "20 FPS" as the minimum.
                </div>
              </div>
            </div>
            <FormField
              label=""
              name="avgFpsPreCu1"
              type="select"
              value={formData.avgFpsPreCu1}
              onChange={handleChange}
              placeholder="Select FPS range..."
              options={FPS_RANGE_OPTIONS}
            />
          </div>

          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <label htmlFor="avgFpsPostCu1" className="block font-medium text-notion-text">
                Average FPS after Last Humans
              </label>
              <div className="group relative">
                <svg 
                  className="w-4 h-4 text-notion-text-secondary hover:text-notion-text cursor-help" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-2 bg-notion-bg border border-notion-border rounded-lg text-xs text-notion-text shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  Note: The in-game FPS counter doesn't display below 20 FPS (this is a bug in the current build). If your FPS is below 20, select "20 FPS" as the minimum.
                </div>
              </div>
            </div>
            <FormField
              label=""
              name="avgFpsPostCu1"
              type="select"
              value={formData.avgFpsPostCu1}
              onChange={handleChange}
              placeholder="Select FPS range..."
              options={FPS_RANGE_OPTIONS}
            />
          </div>

          <FormField
            label="How has performance changed?"
            name="performanceChange"
            type="select"
            value={formData.performanceChange}
            onChange={handleChange}
            placeholder="Select change..."
            options={PERFORMANCE_CHANGE_OPTIONS}
          />

          <FormField
            label="Overall client stability"
            name="overallStability"
            type="select"
            value={formData.overallStability}
            onChange={handleChange}
            placeholder="Select rating..."
            options={STABILITY_OPTIONS}
          />

          <div className="flex justify-end gap-4 pt-6">
            <button
              type="button"
              onClick={() => navigate('/survey/select')}
              className="px-6 py-3 bg-notion-bg-secondary hover:bg-notion-bg-tertiary text-notion-text rounded-lg transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-notion-accent hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors duration-200"
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>

          {submitStatus === 'error' && (
            <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 text-red-400">
              <p className="font-semibold mb-2">Error submitting survey</p>
              <p className="text-sm">Please check your connection and try again.</p>
            </div>
          )}
        </form>
      </div>

      <Footer />
    </div>
  )
}

export default PerformanceSurvey

