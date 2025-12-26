import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import FormField from './FormField'
import Footer from './Footer'
import { submitSurvey } from '../services/api'
import { hasConsent, refreshSession, setSessionCookie, isSessionValid } from '../utils/cookies'

const AGE_RANGES = [
  { value: '16', label: '16-25' },
  { value: '26', label: '26-35' },
  { value: '36', label: '36-45' },
  { value: '46', label: '46-55' },
  { value: '56', label: '56-65' },
  { value: '66', label: '66-75' },
  { value: '76', label: '76+' },
]

const DRAFT_STORAGE_KEY = 'personal_data_survey_draft'

function PersonalDataSurvey() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState(() => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY)
      return saved ? JSON.parse(saved) : {
        age: '',
        discordName: '',
        playtime: '',
        tos: false,
      }
    } catch {
      return {
        age: '',
        discordName: '',
        playtime: '',
        tos: false,
      }
    }
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)

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
    const { name, value, type, checked } = e.target
    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }
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

  const validate = () => {
    const newErrors = {}
    if (!formData.age) newErrors.age = 'Please select your age range'
    if (!formData.tos) newErrors.tos = 'You must agree to the Terms of Service'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validate()) {
      return
    }
    
    setIsSubmitting(true)
    setSubmitStatus(null)
    setErrorMessage(null)
    
    try {
      const submissionData = {
        age: formData.age,
        discordName: formData.discordName || null,
        playtime: formData.playtime || null,
        tos: formData.tos,
        surveyType: 'personal',
      }
      
      await submitSurvey(submissionData)
      localStorage.removeItem(DRAFT_STORAGE_KEY)
      
      // Mark as completed
      const completed = JSON.parse(localStorage.getItem('completed_surveys') || '[]')
      if (!completed.includes('personal')) {
        completed.push('personal')
        localStorage.setItem('completed_surveys', JSON.stringify(completed))
      }
      
      setSubmitStatus('success')
    } catch (error) {
      console.error('Submission error:', error)
      const errMsg = error.message || 'Unknown error occurred'
      setErrorMessage(errMsg)
      setSubmitStatus('error')
      console.error('Error details:', {
        message: errMsg,
        name: error.name,
        stack: error.stack
      })
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
            Your personal data has been submitted successfully.
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
        <h2 className="text-4xl font-bold mb-2">Personal Data</h2>
        <p className="text-notion-text-secondary mb-8">
          Optional survey • 4 questions • ~1 minute
        </p>

        <form onSubmit={handleSubmit} className="bg-notion-bg-secondary rounded-lg p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-notion-text mb-2">
              Age Range <span className="text-red-500">*</span>
            </label>
            <select
              name="age"
              value={formData.age}
              onChange={handleChange}
              className={`w-full px-4 py-2 bg-notion-bg border rounded-lg text-notion-text focus:outline-none focus:ring-2 focus:ring-notion-blue ${
                errors.age ? 'border-red-500' : 'border-notion-border'
              }`}
              required
            >
              <option value="">Select your age range...</option>
              {AGE_RANGES.map((range) => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
            {errors.age && (
              <p className="text-red-500 text-sm mt-1">{errors.age}</p>
            )}
          </div>

          <FormField
            label="Discord Name (optional)"
            name="discordName"
            type="text"
            value={formData.discordName}
            onChange={handleChange}
            placeholder="Your Discord username (optional)"
          />

          <FormField
            label="Approximate playtime (hours)"
            name="playtime"
            type="select"
            value={formData.playtime}
            onChange={handleChange}
            placeholder="Select range..."
            options={[
              { value: '0-10', label: '0-10 hours' },
              { value: '11-25', label: '11-25 hours' },
              { value: '26-50', label: '26-50 hours' },
              { value: '51-100', label: '51-100 hours' },
              { value: '100+', label: '100+ hours' },
            ]}
          />

          <div className="mb-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="tos"
                checked={formData.tos}
                onChange={handleChange}
                className="w-4 h-4 text-notion-accent focus:ring-notion-accent"
              />
              <span className="text-notion-text">
                I agree to the <Link to="/info" className="text-notion-accent hover:underline" target="_blank" rel="noopener noreferrer">Terms of Service</Link> and am 16 years or older <span className="text-red-500">*</span>
              </span>
            </label>
            {errors.tos && <p className="mt-1 text-sm text-red-500">{errors.tos}</p>}
          </div>

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
              <p className="text-sm">
                {errorMessage || 'Please check your connection and try again.'}
              </p>
              {process.env.NODE_ENV === 'development' && errorMessage && (
                <details className="mt-2 text-xs opacity-75">
                  <summary className="cursor-pointer">Technical details</summary>
                  <pre className="mt-2 whitespace-pre-wrap">{errorMessage}</pre>
                </details>
              )}
            </div>
          )}
        </form>
      </div>

      <Footer />
    </div>
  )
}

export default PersonalDataSurvey

