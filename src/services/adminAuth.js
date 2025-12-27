/**
 * Admin authentication service
 * Uses Cloudflare Zero Trust Access - authentication handled at edge level
 * Cloudflare automatically adds CF-Access-JWT-Assertion header for authenticated requests
 */

const API_BASE = '/api/admin'

/**
 * Check if user is authenticated via Cloudflare Zero Trust
 * This is a client-side check - actual authentication happens at Cloudflare edge
 * @returns {boolean}
 */
export function isAuthenticated() {
  // With Cloudflare Zero Trust, if the user can access the page,
  // they are authenticated. The edge handles authentication before
  // requests reach the application.
  // We can't reliably check this client-side, so we assume if they
  // can access the page, they're authenticated.
  return true
}

/**
 * Make authenticated API request
 * Cloudflare Zero Trust handles authentication at the edge
 * @param {string} endpoint - API endpoint (e.g., '/dashboard?type=overall' or '/admin/stats')
 * @param {RequestInit} options - Fetch options
 * @returns {Promise<Response>}
 */
export async function authenticatedFetch(endpoint, options = {}) {
  // Determine base path based on endpoint
  const basePath = endpoint.startsWith('/admin') ? API_BASE : '/api'
  
  // Cloudflare Zero Trust automatically adds CF-Access-JWT-Assertion header
  // for authenticated requests. No need to manually add auth headers.
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  }
  
  const response = await fetch(`${basePath}${endpoint}`, {
    ...options,
    credentials: 'include', // Include cookies
    headers
  })
  
  // If unauthorized, Cloudflare Zero Trust will have redirected before this
  // But handle 401/403 just in case
  if (response.status === 401 || response.status === 403) {
    throw new Error('Unauthorized - please authenticate via Cloudflare Zero Trust')
  }
  
  return response
}

/**
 * Logout - redirects to home page
 * With Cloudflare Zero Trust, logout is handled by clearing the CF Access session
 * @returns {Promise<void>}
 */
export async function logout() {
  // Cloudflare Zero Trust sessions are managed by Cloudflare
  // Redirecting to home page effectively logs out
  window.location.href = '/'
}

