/**
 * Storage utility functions for managing survey data
 * Provides functions to clear all survey-related data
 * 
 * These functions can be called from the browser console for testing:
 * import { clearEverything } from './utils/storage'
 * clearEverything()
 */

/**
 * Clear all survey-related localStorage data
 */
export function clearAllSurveyData() {
  // Clear draft data for all surveys
  localStorage.removeItem('hardware_survey_draft')
  localStorage.removeItem('bug_survey_draft')
  localStorage.removeItem('performance_survey_draft')
  localStorage.removeItem('quest_survey_draft')
  localStorage.removeItem('story_survey_draft')
  localStorage.removeItem('personal_data_survey_draft')
  
  // Clear completed surveys tracking
  localStorage.removeItem('completed_surveys')
  
  // Clear any other survey-related data
  localStorage.removeItem('survey_draft')
  localStorage.removeItem('survey_draft_step')
  
  // Clear sessionStorage as well
  sessionStorage.clear()
}

/**
 * Clear all cookies related to surveys
 */
export function clearAllSurveyCookies() {
  // Delete cookie consent
  document.cookie = 'cookie_consent=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
  
  // Delete session cookie
  document.cookie = 'survey_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
  
  // Delete auth cookie if it exists
  document.cookie = 'tlc_survey_auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
  
  // Clear all cookies (more thorough)
  document.cookie.split(";").forEach(c => {
    const name = c.trim().split("=")[0]
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
  })
}

/**
 * Clear everything: localStorage, sessionStorage, and cookies
 * This provides a "fresh start" for testing
 * 
 * Usage in browser console:
 *   import { clearEverything } from './utils/storage'
 *   clearEverything()
 *   location.reload()
 */
export function clearEverything() {
  clearAllSurveyData()
  clearAllSurveyCookies()
  
  // Also clear all localStorage (nuclear option)
  localStorage.clear()
  
  console.log('✅ Cleared all survey data, cookies, and storage')
}

// Make available globally in development for easy console access
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  window.clearSurveyData = clearAllSurveyData
  window.clearSurveyCookies = clearAllSurveyCookies
  window.clearEverything = clearEverything
  console.log('💡 Dev helpers available: clearSurveyData(), clearSurveyCookies(), clearEverything()')
}

