/**
 * Admin API service
 * Handles authenticated API requests to admin endpoints
 * Uses Cloudflare Zero Trust - authentication handled at edge level
 */

const API_BASE = '/admin/api'

/**
 * Make authenticated API request to admin endpoints
 * Cloudflare Zero Trust handles authentication at the edge
 * @param {string} endpoint - API endpoint (e.g., '/stats' or '/submissions?page=1')
 * @param {RequestInit} options - Fetch options
 * @returns {Promise<Response>}
 */
export async function adminFetch(endpoint, options = {}) {
  // Cloudflare Zero Trust automatically adds CF-Access-JWT-Assertion header
  // for authenticated requests. No need to manually add auth headers.
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  }
  
  // Ensure endpoint starts with /
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  
  const response = await fetch(`${API_BASE}${normalizedEndpoint}`, {
    ...options,
    credentials: 'include', // Include cookies
    headers
  })
  
  // If unauthorized, Cloudflare Zero Trust will have redirected before this
  // But handle 401/403 just in case
  if (response.status === 401 || response.status === 403) {
    throw new Error('Unauthorized - please authenticate via Cloudflare Zero Trust')
  }
  
  // Check if response is empty or not JSON
  const contentType = response.headers.get('content-type')
  if (!contentType || !contentType.includes('application/json')) {
    const text = await response.text()
    throw new Error(`Invalid response: ${text || 'Empty response'}`)
  }
  
  return response
}

/**
 * Fetch admin stats
 * @returns {Promise<object>}
 */
export async function fetchStats() {
  const response = await adminFetch('/stats')
  if (!response.ok) {
    const errorText = await response.text()
    let errorMessage = 'Failed to fetch stats'
    try {
      const errorData = JSON.parse(errorText)
      errorMessage = errorData.message || errorData.error || errorMessage
    } catch {
      errorMessage = errorText || errorMessage
    }
    throw new Error(errorMessage)
  }
  const text = await response.text()
  if (!text) {
    throw new Error('Empty response from server')
  }
  return JSON.parse(text)
}

/**
 * Fetch submissions
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Promise<object>}
 */
export async function fetchSubmissions(page = 1, limit = 50) {
  const response = await adminFetch(`/submissions?page=${page}&limit=${limit}`)
  if (!response.ok) {
    const errorText = await response.text()
    let errorMessage = 'Failed to fetch submissions'
    try {
      const errorData = JSON.parse(errorText)
      errorMessage = errorData.message || errorData.error || errorMessage
    } catch {
      errorMessage = errorText || errorMessage
    }
    throw new Error(errorMessage)
  }
  const text = await response.text()
  if (!text) {
    throw new Error('Empty response from server')
  }
  return JSON.parse(text)
}

/**
 * Fetch system status
 * @returns {Promise<object>}
 */
export async function fetchStatus() {
  const response = await adminFetch('/status')
  if (!response.ok) {
    throw new Error('Failed to fetch status')
  }
  return await response.json()
}

/**
 * Trigger backup operation
 * Uses existing /api/backup endpoint (protected by Zero Trust)
 * @returns {Promise<object>}
 */
export async function triggerBackup() {
  const response = await fetch('/api/backup', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    }
  })
  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || 'Backup failed')
  }
  return await response.json()
}

/**
 * Trigger sanitization operation
 * Uses existing /api/sanitize endpoint (protected by Zero Trust)
 * @returns {Promise<object>}
 */
export async function triggerSanitize() {
  const response = await fetch('/api/sanitize', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    }
  })
  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || 'Sanitization failed')
  }
  return await response.json()
}

