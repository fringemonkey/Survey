/**
 * Admin authentication service
 * Uses server-side session management - password never stored client-side
 */

const API_BASE = '/api/admin'
const SESSION_COOKIE_NAME = 'admin_session'

/**
 * Check if admin session exists (client-side check only)
 * Server will verify the session token
 * @returns {boolean}
 */
export function isAuthenticated() {
  // Check if session cookie exists
  const cookies = document.cookie.split(';')
  return cookies.some(cookie => cookie.trim().startsWith(`${SESSION_COOKIE_NAME}=`))
}

/**
 * Get session token from cookie
 * @returns {string|null}
 */
function getSessionToken() {
  const cookies = document.cookie.split(';')
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=')
    if (name === SESSION_COOKIE_NAME) {
      return value
    }
  }
  return null
}

/**
 * Make authenticated API request
 * Session token is sent via cookie automatically
 * @param {string} endpoint - API endpoint (e.g., '/dashboard?type=overall' or '/admin/stats')
 * @param {RequestInit} options - Fetch options
 * @returns {Promise<Response>}
 */
export async function authenticatedFetch(endpoint, options = {}) {
  if (!isAuthenticated()) {
    throw new Error('Not authenticated')
  }

  // Determine base path based on endpoint
  const basePath = endpoint.startsWith('/admin') ? API_BASE : '/api'
  
  // Session token is sent automatically via cookie
  // Optionally also send as Bearer token for API clients
  const sessionToken = getSessionToken()
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  }
  
  if (sessionToken) {
    headers['Authorization'] = `Bearer ${sessionToken}`
  }
  
  return fetch(`${basePath}${endpoint}`, {
    ...options,
    credentials: 'include', // Include cookies
    headers
  })
}

/**
 * Login with password - creates server-side session
 * Password is never stored client-side
 * @param {string} password - Admin password
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function login(password) {
  try {
    const response = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies
      body: JSON.stringify({ password }),
    })

    const data = await response.json()

    if (!response.ok) {
      return { success: false, error: data.error || 'Login failed' }
    }

    // Session cookie is set by server automatically
    return { success: true }
  } catch (error) {
    console.error('Login error:', error)
    return { success: false, error: 'Network error. Please try again.' }
  }
}

/**
 * Logout - invalidates server-side session
 * @returns {Promise<void>}
 */
export async function logout() {
  try {
    await fetch(`${API_BASE}/logout`, {
      method: 'POST',
      credentials: 'include'
    })
  } catch (error) {
    console.error('Logout error:', error)
  }
  
  // Clear any client-side indicators (cookie cleared by server)
}

/**
 * Clear session (client-side only - server session already invalidated)
 */
export function clearPassword() {
  // Cookie is cleared by server on logout
  // This is just for client-side state cleanup if needed
}

