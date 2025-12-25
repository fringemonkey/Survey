import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FormField from './FormField'
import Footer from './Footer'
import { submitSurvey } from '../services/api'

const COMMON_BUGS = [
  'Boat Stuck',
  'Boat Sinking/Flying',
  'Sliding buildings on boat',
  'Elevator issues',
  'Other',
]

const RATING_OPTIONS = [
  { value: '1', label: '1 - Very Poor' },
  { value: '2', label: '2 - Poor' },
  { value: '3', label: '3 - Average' },
  { value: '4', label: '4 - Good' },
  { value: '5', label: '5 - Excellent' },
]

function SurveyForm() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    // Step 1: Respondent Info
    discordName: '',
    age: '',
    cpu: '',
    gpu: '',
    playtime: '',
    ram: '',
    tos: false,
    
    // Step 2: Performance and Stability
    avgFpsPreCu1: '',
    avgFpsPostCu1: '',
    preCu1VsPost: '',
    overallClientStability: '',
    commonBugsExperienced: [],
    crashesPerSession: '',
    questBugsExperienced: false,
    whichQuestPoi: '',
    
    // Bug-specific fields
    postedAboutIssuesBoat1: [],
    methodUsedToResolveBoat1: '',
    wasItResolvedBoat1: false,
    linkToPostBoat1: '',
    
    postedAboutIssuesBoat2: [],
    methodUsedToResolveBoat2: '',
    wasItResolvedBoat2: false,
    linkToPostBoat2: '',
    
    postedAboutIssuesElevator: [],
    methodUsedToResolveElevator: '',
    wasItResolvedElevator: false,
    whatPoiElevator: '',
    linkToPostElevator: '',
    
    postedAboutIssuesSliding: [],
    wasItResolvedSliding: false,
    pictureSliding: '',
    linkToPostSliding: '',
    
    resolvedQLaz: false,
    additionalData: '',
    
    // Step 3: Quests and Story (Optional)
    questProgress: '',
    preCu1QuestsRating: '',
    motherRating: '',
    theOneBeforeMeRating: '',
    theWarehouseRating: '',
    whispersWithinRating: '',
    smileAtDarkRating: '',
    storyEngagement: '',
    overallQuestStoryRating: '',
    
    // Step 4: Overall Feelings (Optional)
    overallScorePostCu1: '',
    openFeedbackSpace: '',
  })
  
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleMultiSelect = (name, value) => {
    setFormData((prev) => {
      const current = prev[name] || []
      const newValue = current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value]
      return { ...prev, [name]: newValue }
    })
  }

  const validateStep = (step) => {
    const newErrors = {}
    
    if (step === 1) {
      if (!formData.discordName.trim()) {
        newErrors.discordName = 'Discord name is required'
      }
      const age = parseInt(formData.age)
      if (!formData.age || isNaN(age) || age < 16) {
        newErrors.age = 'You must be 16 years or older to participate'
      }
      if (!formData.tos) {
        newErrors.tos = 'You must agree to the Terms of Service'
      }
    }
    
    if (step === 2) {
      if (!formData.avgFpsPreCu1) {
        newErrors.avgFpsPreCu1 = 'Pre CU1 FPS is required'
      }
      if (!formData.avgFpsPostCu1) {
        newErrors.avgFpsPostCu1 = 'Post CU1 FPS is required'
      }
      if (!formData.preCu1VsPost) {
        newErrors.preCu1VsPost = 'Please indicate if performance is better or worse'
      }
      if (!formData.overallClientStability) {
        newErrors.overallClientStability = 'Overall client stability rating is required'
      }
      if (formData.questBugsExperienced && !formData.whichQuestPoi.trim()) {
        newErrors.whichQuestPoi = 'Please specify which quest/POI had bugs'
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4))
      window.scrollTo(0, 0)
    }
  }

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
    window.scrollTo(0, 0)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateStep(2)) {
      setCurrentStep(2)
      return
    }
    
    setIsSubmitting(true)
    setSubmitStatus(null)
    
    try {
      await submitSurvey(formData)
      setSubmitStatus('success')
    } catch (error) {
      console.error('Submission error:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const hasBug = (bugName) => formData.commonBugsExperienced.includes(bugName)

  if (submitStatus === 'success') {
    return (
      <div className="notion-content py-12">
        <div className="bg-green-900/20 border border-green-500 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4 text-green-400">Thank You!</h2>
          <p className="text-notion-text-secondary mb-6">
            Your response has been submitted successfully. Your feedback helps us understand the community's experience with the game.
          </p>
          <button
            onClick={() => {
              setSubmitStatus(null)
              setCurrentStep(1)
              setFormData({
                discordName: '',
                age: '',
                cpu: '',
                gpu: '',
                playtime: '',
                ram: '',
                tos: false,
                avgFpsPreCu1: '',
                avgFpsPostCu1: '',
                preCu1VsPost: '',
                overallClientStability: '',
                commonBugsExperienced: [],
                crashesPerSession: '',
                questBugsExperienced: false,
                whichQuestPoi: '',
                postedAboutIssuesBoat1: [],
                methodUsedToResolveBoat1: '',
                wasItResolvedBoat1: false,
                linkToPostBoat1: '',
                postedAboutIssuesBoat2: [],
                methodUsedToResolveBoat2: '',
                wasItResolvedBoat2: false,
                linkToPostBoat2: '',
                postedAboutIssuesElevator: [],
                methodUsedToResolveElevator: '',
                wasItResolvedElevator: false,
                whatPoiElevator: '',
                linkToPostElevator: '',
                postedAboutIssuesSliding: [],
                wasItResolvedSliding: false,
                pictureSliding: '',
                linkToPostSliding: '',
                resolvedQLaz: false,
                additionalData: '',
                questProgress: '',
                preCu1QuestsRating: '',
                motherRating: '',
                theOneBeforeMeRating: '',
                theWarehouseRating: '',
                whispersWithinRating: '',
                smileAtDarkRating: '',
                storyEngagement: '',
                overallQuestStoryRating: '',
                overallScorePostCu1: '',
                openFeedbackSpace: '',
              })
            }}
            className="bg-notion-accent hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-200"
          >
            Submit Another Response
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="notion-content py-12">
      <div className="mb-8">
        <button
          onClick={() => navigate('/survey')}
          className="text-notion-text-secondary hover:text-notion-accent transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Survey Info
        </button>
      </div>

      <h2 className="text-4xl font-bold mb-2">Survey Form</h2>
      <div className="mb-8 flex items-center gap-4">
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                step === currentStep
                  ? 'bg-notion-accent text-white'
                  : step < currentStep
                  ? 'bg-green-600 text-white'
                  : 'bg-notion-bg-secondary text-notion-text-secondary'
              }`}
            >
              {step}
            </div>
          ))}
        </div>
        <span className="text-notion-text-secondary">
          Step {currentStep} of 4 {currentStep <= 2 ? '(Required)' : '(Optional)'}
        </span>
      </div>

      <form onSubmit={currentStep === 4 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }}>
        {/* Step 1: Respondent Info */}
        {currentStep === 1 && (
          <section className="bg-notion-bg-secondary rounded-lg p-6 space-y-6">
            <h3 className="text-2xl font-semibold mb-4">1️⃣ Respondent Info</h3>
            
            <FormField
              label="Discord Name"
              name="discordName"
              type="text"
              value={formData.discordName}
              onChange={handleChange}
              error={errors.discordName}
              placeholder="Your Discord username"
              required
            />
            
            <FormField
              label="Age"
              name="age"
              type="number"
              value={formData.age}
              onChange={handleChange}
              error={errors.age}
              placeholder="Your age"
              required
              min="16"
            />
            
            <FormField
              label="CPU"
              name="cpu"
              type="text"
              value={formData.cpu}
              onChange={handleChange}
              placeholder="e.g., AMD Ryzen 7 5800X"
            />
            
            <FormField
              label="GPU"
              name="gpu"
              type="text"
              value={formData.gpu}
              onChange={handleChange}
              placeholder="e.g., NVIDIA RTX 3080"
            />
            
            <FormField
              label="Playtime (hours)"
              name="playtime"
              type="number"
              value={formData.playtime}
              onChange={handleChange}
              placeholder="Approximate hours played"
              min="0"
            />
            
            <FormField
              label="RAM"
              name="ram"
              type="text"
              value={formData.ram}
              onChange={handleChange}
              placeholder="e.g., 16GB, 32GB"
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
                  I agree to the Terms of Service and am 16 years or older <span className="text-red-500">*</span>
                </span>
              </label>
              {errors.tos && <p className="mt-1 text-sm text-red-500">{errors.tos}</p>}
            </div>
          </section>
        )}

        {/* Step 2: Performance and Stability */}
        {currentStep === 2 && (
          <section className="bg-notion-bg-secondary rounded-lg p-6 space-y-6">
            <h3 className="text-2xl font-semibold mb-4">2️⃣ Performance and Stability</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Average FPS Pre CU1"
                name="avgFpsPreCu1"
                type="number"
                value={formData.avgFpsPreCu1}
                onChange={handleChange}
                error={errors.avgFpsPreCu1}
                placeholder="e.g., 45"
                required
                min="0"
              />
              
              <FormField
                label="Average FPS Post CU1"
                name="avgFpsPostCu1"
                type="number"
                value={formData.avgFpsPostCu1}
                onChange={handleChange}
                error={errors.avgFpsPostCu1}
                placeholder="e.g., 55"
                required
                min="0"
              />
            </div>
            
            <FormField
              label="Pre CU1 vs Post CU1"
              name="preCu1VsPost"
              type="select"
              value={formData.preCu1VsPost}
              onChange={handleChange}
              error={errors.preCu1VsPost}
              options={[
                { value: 'Better', label: 'Better' },
                { value: 'Worse', label: 'Worse' },
                { value: 'Same', label: 'Same' },
              ]}
              required
            />
            
            <FormField
              label="Overall Client Stability"
              name="overallClientStability"
              type="select"
              value={formData.overallClientStability}
              onChange={handleChange}
              error={errors.overallClientStability}
              options={RATING_OPTIONS}
              required
            />
            
            <div className="mb-6">
              <label className="block mb-2 font-medium text-notion-text">
                Common Bugs Experienced? <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                {COMMON_BUGS.map((bug) => (
                  <label key={bug} className="flex items-center gap-2 cursor-pointer hover:text-notion-accent transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.commonBugsExperienced.includes(bug)}
                      onChange={() => handleMultiSelect('commonBugsExperienced', bug)}
                      className="w-4 h-4 text-notion-accent focus:ring-notion-accent"
                    />
                    <span>{bug}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <FormField
              label="Crashes per Session"
              name="crashesPerSession"
              type="number"
              value={formData.crashesPerSession}
              onChange={handleChange}
              placeholder="Average number of crashes per session"
              min="0"
            />
            
            <div className="mb-6">
              <label className="flex items-center gap-2 cursor-pointer mb-2">
                <input
                  type="checkbox"
                  name="questBugsExperienced"
                  checked={formData.questBugsExperienced}
                  onChange={handleChange}
                  className="w-4 h-4 text-notion-accent focus:ring-notion-accent"
                />
                <span className="font-medium text-notion-text">Quest Bugs Experienced?</span>
              </label>
              {formData.questBugsExperienced && (
                <FormField
                  label="Which Quest/POI?"
                  name="whichQuestPoi"
                  type="text"
                  value={formData.whichQuestPoi}
                  onChange={handleChange}
                  error={errors.whichQuestPoi}
                  placeholder="Specify which quest or point of interest"
                />
              )}
            </div>
            
            {/* Bug-specific questions */}
            {hasBug('Boat Stuck') && (
              <div className="border-l-4 border-notion-accent pl-4 space-y-4">
                <h4 className="font-semibold text-notion-text">Boat Stuck Bug Details</h4>
                <div className="mb-4">
                  <label className="block mb-2 font-medium text-notion-text">Posted about issues? (Boat1)</label>
                  <div className="space-y-2">
                    {['Discord', 'Channel 37 Support e-mail', 'In Game Feedback', 'Reddit', 'Other'].map((option) => (
                      <label key={option} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.postedAboutIssuesBoat1.includes(option)}
                          onChange={() => handleMultiSelect('postedAboutIssuesBoat1', option)}
                          className="w-4 h-4 text-notion-accent"
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <FormField
                  label="Method used to resolve (Boat1)"
                  name="methodUsedToResolveBoat1"
                  type="text"
                  value={formData.methodUsedToResolveBoat1}
                  onChange={handleChange}
                  placeholder="How did you resolve it?"
                />
                <FormField
                  label="Link to post (Boat1)"
                  name="linkToPostBoat1"
                  type="url"
                  value={formData.linkToPostBoat1}
                  onChange={handleChange}
                  placeholder="https://..."
                />
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="wasItResolvedBoat1"
                    checked={formData.wasItResolvedBoat1}
                    onChange={handleChange}
                    className="w-4 h-4 text-notion-accent"
                  />
                  <span>Was it resolved? (Boat1)</span>
                </label>
              </div>
            )}
            
            {hasBug('Boat Sinking/Flying') && (
              <div className="border-l-4 border-notion-accent pl-4 space-y-4">
                <h4 className="font-semibold text-notion-text">Boat Sinking/Flying Bug Details</h4>
                <div className="mb-4">
                  <label className="block mb-2 font-medium text-notion-text">Posted about issues? (Boat2)</label>
                  <div className="space-y-2">
                    {['Discord', 'Channel 37 Support e-mail', 'In Game Feedback', 'Reddit', 'Other'].map((option) => (
                      <label key={option} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.postedAboutIssuesBoat2.includes(option)}
                          onChange={() => handleMultiSelect('postedAboutIssuesBoat2', option)}
                          className="w-4 h-4 text-notion-accent"
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <FormField
                  label="Method used to resolve (Boat2)"
                  name="methodUsedToResolveBoat2"
                  type="text"
                  value={formData.methodUsedToResolveBoat2}
                  onChange={handleChange}
                  placeholder="How did you resolve it?"
                />
                <FormField
                  label="Link to post (Boat2)"
                  name="linkToPostBoat2"
                  type="url"
                  value={formData.linkToPostBoat2}
                  onChange={handleChange}
                  placeholder="https://..."
                />
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="wasItResolvedBoat2"
                    checked={formData.wasItResolvedBoat2}
                    onChange={handleChange}
                    className="w-4 h-4 text-notion-accent"
                  />
                  <span>Was it resolved? (Boat2)</span>
                </label>
              </div>
            )}
            
            {hasBug('Elevator issues') && (
              <div className="border-l-4 border-notion-accent pl-4 space-y-4">
                <h4 className="font-semibold text-notion-text">Elevator Issues Details</h4>
                <div className="mb-4">
                  <label className="block mb-2 font-medium text-notion-text">Posted about issues? (Elevator)</label>
                  <div className="space-y-2">
                    {['Discord', 'Channel 37 Support e-mail', 'In Game Feedback', 'Reddit', 'Other'].map((option) => (
                      <label key={option} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.postedAboutIssuesElevator.includes(option)}
                          onChange={() => handleMultiSelect('postedAboutIssuesElevator', option)}
                          className="w-4 h-4 text-notion-accent"
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <FormField
                  label="What POI? (Elevator)"
                  name="whatPoiElevator"
                  type="text"
                  value={formData.whatPoiElevator}
                  onChange={handleChange}
                  placeholder="Which point of interest?"
                />
                <FormField
                  label="Method used to resolve (Elevator)"
                  name="methodUsedToResolveElevator"
                  type="text"
                  value={formData.methodUsedToResolveElevator}
                  onChange={handleChange}
                  placeholder="How did you resolve it?"
                />
                <FormField
                  label="Link to post (Elevator)"
                  name="linkToPostElevator"
                  type="url"
                  value={formData.linkToPostElevator}
                  onChange={handleChange}
                  placeholder="https://..."
                />
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="wasItResolvedElevator"
                    checked={formData.wasItResolvedElevator}
                    onChange={handleChange}
                    className="w-4 h-4 text-notion-accent"
                  />
                  <span>Was it resolved? (Elevator)</span>
                </label>
              </div>
            )}
            
            {hasBug('Sliding buildings on boat') && (
              <div className="border-l-4 border-notion-accent pl-4 space-y-4">
                <h4 className="font-semibold text-notion-text">Sliding Buildings Bug Details</h4>
                <div className="mb-4">
                  <label className="block mb-2 font-medium text-notion-text">Posted about issues? (Sliding)</label>
                  <div className="space-y-2">
                    {['Discord', 'Channel 37 Support e-mail', 'In Game Feedback', 'Reddit', 'Other'].map((option) => (
                      <label key={option} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.postedAboutIssuesSliding.includes(option)}
                          onChange={() => handleMultiSelect('postedAboutIssuesSliding', option)}
                          className="w-4 h-4 text-notion-accent"
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <FormField
                  label="Picture (Sliding)"
                  name="pictureSliding"
                  type="url"
                  value={formData.pictureSliding}
                  onChange={handleChange}
                  placeholder="URL to screenshot/image"
                />
                <FormField
                  label="Link to post (Sliding)"
                  name="linkToPostSliding"
                  type="url"
                  value={formData.linkToPostSliding}
                  onChange={handleChange}
                  placeholder="https://..."
                />
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="wasItResolvedSliding"
                    checked={formData.wasItResolvedSliding}
                    onChange={handleChange}
                    className="w-4 h-4 text-notion-accent"
                  />
                  <span>Was it resolved? (Sliding)</span>
                </label>
              </div>
            )}
            
            {formData.questBugsExperienced && (
              <div className="mb-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="resolvedQLaz"
                    checked={formData.resolvedQLaz}
                    onChange={handleChange}
                    className="w-4 h-4 text-notion-accent"
                  />
                  <span>Resolved? Q-Laz</span>
                </label>
              </div>
            )}
            
            <FormField
              label="Additional Data"
              name="additionalData"
              type="textarea"
              value={formData.additionalData}
              onChange={handleChange}
              placeholder="Any additional performance or stability feedback..."
              rows={4}
            />
          </section>
        )}

        {/* Step 3: Quests and Story (Optional) */}
        {currentStep === 3 && (
          <section className="bg-notion-bg-secondary rounded-lg p-6 space-y-6">
            <h3 className="text-2xl font-semibold mb-2">
              3️⃣ Quests and Story <span className="text-gray-500 text-base">(Optional)</span>
            </h3>
            <p className="text-notion-text-secondary mb-6 text-sm">
              Share your experience with quests and story elements.
            </p>
            
            <FormField
              label="Quest Progress"
              name="questProgress"
              type="text"
              value={formData.questProgress}
              onChange={handleChange}
              placeholder="e.g., Completed main story, On chapter 3, etc."
            />
            
            <FormField
              label="Pre CU1 Quests Rating"
              name="preCu1QuestsRating"
              type="select"
              value={formData.preCu1QuestsRating}
              onChange={handleChange}
              options={RATING_OPTIONS}
            />
            
            <h4 className="font-semibold text-notion-text mt-6 mb-4">Individual Quest Ratings</h4>
            
            <FormField
              label="Mother Rating"
              name="motherRating"
              type="select"
              value={formData.motherRating}
              onChange={handleChange}
              options={RATING_OPTIONS}
            />
            
            <FormField
              label="The One Before Me Rating"
              name="theOneBeforeMeRating"
              type="select"
              value={formData.theOneBeforeMeRating}
              onChange={handleChange}
              options={RATING_OPTIONS}
            />
            
            <FormField
              label="The Warehouse Rating"
              name="theWarehouseRating"
              type="select"
              value={formData.theWarehouseRating}
              onChange={handleChange}
              options={RATING_OPTIONS}
            />
            
            <FormField
              label="Whispers Within Rating"
              name="whispersWithinRating"
              type="select"
              value={formData.whispersWithinRating}
              onChange={handleChange}
              options={RATING_OPTIONS}
            />
            
            <FormField
              label="Smile at Dark Rating"
              name="smileAtDarkRating"
              type="select"
              value={formData.smileAtDarkRating}
              onChange={handleChange}
              options={RATING_OPTIONS}
            />
            
            <FormField
              label="Story Engagement"
              name="storyEngagement"
              type="select"
              value={formData.storyEngagement}
              onChange={handleChange}
              options={RATING_OPTIONS}
            />
            
            <FormField
              label="Overall Quest and Story Rating"
              name="overallQuestStoryRating"
              type="select"
              value={formData.overallQuestStoryRating}
              onChange={handleChange}
              options={RATING_OPTIONS}
            />
          </section>
        )}

        {/* Step 4: Overall Feelings (Optional) */}
        {currentStep === 4 && (
          <section className="bg-notion-bg-secondary rounded-lg p-6 space-y-6">
            <h3 className="text-2xl font-semibold mb-2">
              4️⃣ Overall Feelings <span className="text-gray-500 text-base">(Optional)</span>
            </h3>
            <p className="text-notion-text-secondary mb-6 text-sm">
              Share your overall thoughts and feelings about the game post CU1.
            </p>
            
            <FormField
              label="Overall Score Post CU1"
              name="overallScorePostCu1"
              type="select"
              value={formData.overallScorePostCu1}
              onChange={handleChange}
              options={RATING_OPTIONS}
            />
            
            <FormField
              label="Open Feedback Space"
              name="openFeedbackSpace"
              type="textarea"
              value={formData.openFeedbackSpace}
              onChange={handleChange}
              placeholder="Any additional thoughts, feedback, or comments..."
              rows={8}
            />
          </section>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between gap-4 pt-6 mt-8">
          <div>
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handlePrevious}
                className="px-6 py-3 bg-notion-bg-secondary hover:bg-notion-bg-tertiary text-notion-text rounded-lg transition-colors duration-200"
              >
                Previous
              </button>
            )}
          </div>
          <div className="flex gap-4">
            {currentStep < 4 ? (
              <button
                type="submit"
                className="px-6 py-3 bg-notion-accent hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors duration-200"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-notion-accent hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors duration-200"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Survey'}
              </button>
            )}
          </div>
        </div>

        {submitStatus === 'error' && (
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 text-red-400 mt-6">
            <p className="font-semibold mb-2">Error submitting survey</p>
            <p className="text-sm">Please check your connection and try again. If the problem persists, please contact support.</p>
          </div>
        )}
      </form>
      <Footer />
    </div>
  )
}

export default SurveyForm
