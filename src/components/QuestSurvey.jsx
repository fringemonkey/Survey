import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import FormField from './FormField'
import Footer from './Footer'
import { submitSurvey } from '../services/api'
import { hasConsent, refreshSession, setSessionCookie, isSessionValid } from '../utils/cookies'

const QUEST_PROGRESS_OPTIONS = [
  { value: 'not_started', label: 'Not started' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'completed_main', label: 'Completed main story' },
  { value: 'completed_all', label: 'Completed all quests' },
]

const RATING_OPTIONS = [
  { value: '1', label: '1 - Very Poor' },
  { value: '2', label: '2 - Poor' },
  { value: '3', label: '3 - Average' },
  { value: '4', label: '4 - Good' },
  { value: '5', label: '5 - Excellent' },
]

const DRAFT_STORAGE_KEY = 'quest_survey_draft'

function QuestSurvey() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState(() => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY)
      return saved ? JSON.parse(saved) : {
        questProgress: '',
        preCu1QuestsRating: '',
        overallQuestRating: '',
        favoriteQuest: '',
        questBugs: '',
      }
    } catch {
      return {
        questProgress: '',
        preCu1QuestsRating: '',
        overallQuestRating: '',
        favoriteQuest: '',
        questBugs: '',
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
        surveyType: 'quest',
      }
      
      await submitSurvey(submissionData)
      localStorage.removeItem(DRAFT_STORAGE_KEY)
      
      // Mark as completed
      const completed = JSON.parse(localStorage.getItem('completed_surveys') || '[]')
      if (!completed.includes('quest')) {
        completed.push('quest')
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
            Your quest feedback has been submitted successfully.
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
        <h2 className="text-4xl font-bold mb-2">Quests</h2>
        <p className="text-notion-text-secondary mb-8">
          Optional survey • 5 questions • ~2 minutes
        </p>

        <form onSubmit={handleSubmit} className="bg-notion-bg-secondary rounded-lg p-6 space-y-6">
          <FormField
            label="Quest progress"
            name="questProgress"
            type="select"
            value={formData.questProgress}
            onChange={handleChange}
            placeholder="Select progress..."
            options={QUEST_PROGRESS_OPTIONS}
          />

          <FormField
            label="Pre-CU1 quests rating"
            name="preCu1QuestsRating"
            type="select"
            value={formData.preCu1QuestsRating}
            onChange={handleChange}
            placeholder="Select rating..."
            options={RATING_OPTIONS}
          />

          <FormField
            label="Overall quest rating"
            name="overallQuestRating"
            type="select"
            value={formData.overallQuestRating}
            onChange={handleChange}
            placeholder="Select rating..."
            options={RATING_OPTIONS}
          />

          <FormField
            label="Favorite quest"
            name="favoriteQuest"
            type="select"
            value={formData.favoriteQuest}
            onChange={handleChange}
            placeholder="Select quest..."
            options={[
              { value: 'mother', label: 'Mother' },
              { value: 'the_one_before_me', label: 'The One Before Me' },
              { value: 'the_warehouse', label: 'The Warehouse' },
              { value: 'whispers_within', label: 'Whispers Within' },
              { value: 'smile_at_dark', label: 'Smile at Dark' },
              { value: 'none', label: 'No favorite' },
            ]}
          />

          <FormField
            label="Have you experienced quest bugs?"
            name="questBugs"
            type="select"
            value={formData.questBugs}
            onChange={handleChange}
            placeholder="Select answer..."
            options={[
              { value: 'no', label: 'No bugs' },
              { value: 'minor', label: 'Minor bugs' },
              { value: 'moderate', label: 'Moderate bugs' },
              { value: 'major', label: 'Major bugs' },
              { value: 'game_breaking', label: 'Game breaking bugs' },
            ]}
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

export default QuestSurvey

