/**
 * API service for submitting survey data to Cloudflare D1 database
 */

const API_BASE = '/api'

/**
 * Submit survey form data to D1 database
 * @param {Object} formData - Form data to submit
 * @returns {Promise<Object>} Response from API
 */
export async function submitSurvey(formData) {
  try {
    const response = await fetch(`${API_BASE}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to submit survey' }))
      throw new Error(error.message || `HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error submitting survey:', error)
    throw error
  }
}

