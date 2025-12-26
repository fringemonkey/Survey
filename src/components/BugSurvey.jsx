import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import FormField from './FormField'
import Footer from './Footer'
import { submitSurvey } from '../services/api'
import { hasConsent, refreshSession, setSessionCookie, isSessionValid } from '../utils/cookies'

const BUG_EXPERIENCED_OPTIONS = [
  { value: 'none', label: 'No bugs experienced' },
  { value: 'boat_stuck', label: 'Boat Stuck' },
  { value: 'boat_sinking', label: 'Boat Sinking/Flying' },
  { value: 'sliding_buildings', label: 'Sliding buildings on boat' },
  { value: 'elevator', label: 'Elevator issues' },
  { value: 'quest', label: 'Quest bugs' },
  { value: 'other', label: 'Other bugs' },
]

const BUG_FREQUENCY_OPTIONS = [
  { value: 'never', label: 'Never' },
  { value: 'rarely', label: 'Rarely (once or twice)' },
  { value: 'sometimes', label: 'Sometimes (a few times)' },
  { value: 'often', label: 'Often (regularly)' },
  { value: 'always', label: 'Always (every session)' },
]

const BUG_IMPACT_OPTIONS = [
  { value: 'none', label: 'No impact' },
  { value: 'minor', label: 'Minor inconvenience' },
  { value: 'moderate', label: 'Moderate impact' },
  { value: 'major', label: 'Major impact' },
  { value: 'game_breaking', label: 'Game breaking' },
]

const RESOLVED_OPTIONS = [
  { value: 'yes', label: 'Yes, resolved' },
  { value: 'partial', label: 'Partially resolved' },
  { value: 'no', label: 'No, not resolved' },
  { value: 'workaround', label: 'Found a workaround' },
]

const DRAFT_STORAGE_KEY = 'bug_survey_draft'

function BugSurvey() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState(() => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY)
      return saved ? JSON.parse(saved) : {
        bugsExperienced: '',
        bugFrequency: '',
        bugImpact: '',
        crashesPerSession: '',
        resolved: '',
      }
    } catch {
      return {
        bugsExperienced: '',
        bugFrequency: '',
        bugImpact: '',
        crashesPerSession: '',
        resolved: '',
      }
    }
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null)

  useEffect(() => {
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
        surveyType: 'bug',
      }
      
      await submitSurvey(submissionData)
      localStorage.removeItem(DRAFT_STORAGE_KEY)
      
      // Mark as completed
      const completed = JSON.parse(localStorage.getItem('completed_surveys') || '[]')
      if (!completed.includes('bug')) {
        completed.push('bug')
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
            Your bug report has been submitted successfully.
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
        <h2 className="text-4xl font-bold mb-2">Bug Report</h2>
        <p className="text-notion-text-secondary mb-8">
          Optional survey • 5 questions • ~2 minutes
        </p>

        <form onSubmit={handleSubmit} className="bg-notion-bg-secondary rounded-lg p-6 space-y-6">
          <FormField
            label="What bugs have you experienced?"
            name="bugsExperienced"
            type="select"
            value={formData.bugsExperienced}
            onChange={handleChange}
            placeholder="Select bugs experienced..."
            options={BUG_EXPERIENCED_OPTIONS}
          />

          <FormField
            label="How frequently do you encounter bugs?"
            name="bugFrequency"
            type="select"
            value={formData.bugFrequency}
            onChange={handleChange}
            placeholder="Select frequency..."
            options={BUG_FREQUENCY_OPTIONS}
          />

          <FormField
            label="What is the impact of bugs on your gameplay?"
            name="bugImpact"
            type="select"
            value={formData.bugImpact}
            onChange={handleChange}
            placeholder="Select impact level..."
            options={BUG_IMPACT_OPTIONS}
          />

          <FormField
            label="Average crashes per session"
            name="crashesPerSession"
            type="select"
            value={formData.crashesPerSession}
            onChange={handleChange}
            placeholder="Select number..."
            options={[
              { value: '0', label: '0 - No crashes' },
              { value: '1', label: '1' },
              { value: '2', label: '2' },
              { value: '3', label: '3' },
              { value: '4+', label: '4 or more' },
            ]}
          />

          <FormField
            label="Have bugs been resolved or do you have workarounds?"
            name="resolved"
            type="select"
            value={formData.resolved}
            onChange={handleChange}
            placeholder="Select status..."
            options={RESOLVED_OPTIONS}
          />

          <div className="flex justify-end gap-4 pt-6">
            <button
              type="button"
              onClick={() => navigate('/survey/select')}
              className="px-6 py-3 bg-notion-bg-secondary hover:bg-notion-bg-tertiary text-notion-text rounded-lg transition-colors duration-200"
            >
              Skip
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

export default BugSurvey

