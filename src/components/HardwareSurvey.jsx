import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import FormField from './FormField'
import SearchableDropdown from './SearchableDropdown'
import Footer from './Footer'
import { submitSurvey } from '../services/api'
import { CPU_OPTIONS, GPU_OPTIONS, RAM_OPTIONS, STORAGE_OPTIONS } from '../data/hardwareOptions'
import { hasConsent, refreshSession, setSessionCookie, isSessionValid } from '../utils/cookies'

const DRAFT_STORAGE_KEY = 'hardware_survey_draft'

function HardwareSurvey() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState(() => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY)
      return saved ? JSON.parse(saved) : {
        cpu: '',
        cpuOther: '',
        gpu: '',
        gpuOther: '',
        ram: '',
        storage: '',
      }
    } catch {
      return {
        cpu: '',
        cpuOther: '',
        gpu: '',
        gpuOther: '',
        ram: '',
        storage: '',
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
    const { name, value, type, checked } = e.target
    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
        ...(name === 'cpu' && value !== 'Other' ? { cpuOther: '' } : {}),
        ...(name === 'gpu' && value !== 'Other' ? { gpuOther: '' } : {}),
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
    if (!formData.cpu) newErrors.cpu = 'Please select your CPU'
    if (!formData.gpu) newErrors.gpu = 'Please select your GPU'
    if (!formData.ram) newErrors.ram = 'Please select your RAM'
    if (!formData.storage) newErrors.storage = 'Please select your storage type'
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
    
    try {
      const submissionData = {
        cpu: formData.cpu === 'Other' && formData.cpuOther ? formData.cpuOther : formData.cpu,
        gpu: formData.gpu === 'Other' && formData.gpuOther ? formData.gpuOther : formData.gpu,
        ram: formData.ram,
        storage: formData.storage,
        surveyType: 'hardware',
      }
      
      await submitSurvey(submissionData)
      localStorage.removeItem(DRAFT_STORAGE_KEY)
      
      // Mark as completed
      const completed = JSON.parse(localStorage.getItem('completed_surveys') || '[]')
      if (!completed.includes('hardware')) {
        completed.push('hardware')
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
            Your hardware information has been submitted successfully.
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate('/survey/select')}
              className="bg-notion-accent hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-200"
            >
              Continue to Optional Surveys
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
        <h2 className="text-4xl font-bold mb-2">Hardware Specs</h2>
        <p className="text-notion-text-secondary mb-8">
          Required survey • 4 questions • ~2 minutes
        </p>

        <form onSubmit={handleSubmit} className="bg-notion-bg-secondary rounded-lg p-6 space-y-6">
          <SearchableDropdown
            label="CPU"
            name="cpu"
            value={formData.cpu}
            onChange={handleChange}
            onOtherChange={handleChange}
            placeholder="Start typing to search for your CPU"
            options={CPU_OPTIONS}
            otherValue={formData.cpuOther}
            otherPlaceholder="Specify your CPU model..."
            error={errors.cpu}
            required
          />

          <SearchableDropdown
            label="GPU"
            name="gpu"
            value={formData.gpu}
            onChange={handleChange}
            onOtherChange={handleChange}
            placeholder="Start typing to search for your GPU"
            options={GPU_OPTIONS}
            otherValue={formData.gpuOther}
            otherPlaceholder="Specify your GPU model..."
            error={errors.gpu}
            required
          />

          <FormField
            label="RAM"
            name="ram"
            type="select"
            value={formData.ram}
            onChange={handleChange}
            placeholder="Select RAM size..."
            options={RAM_OPTIONS}
            error={errors.ram}
            required
          />

          <FormField
            label="Storage"
            name="storage"
            type="select"
            value={formData.storage}
            onChange={handleChange}
            placeholder="Select storage type..."
            options={STORAGE_OPTIONS}
            error={errors.storage}
            required
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

export default HardwareSurvey

