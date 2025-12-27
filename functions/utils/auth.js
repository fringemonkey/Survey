/**
 * Unified authentication utility for Cloudflare Pages Functions
 * Uses server-side session management with Cloudflare KV
 * Password is never stored client-side - only session tokens
 */

const SESSION_DURATION = 24 * 60 * 60 // 24 hours in seconds
const SESSION_COOKIE_NAME = 'admin_session'

/**
 * Generate a secure session token
 */
function generateSessionToken() {
  const randomBytes = new Uint8Array(32)
  crypto.getRandomValues(randomBytes)
  return Array.from(randomBytes, byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Get session token from request (cookie or Authorization header)
 * @param {Request} request - HTTP request
 * @returns {string|null} - Session token or null
 */
export function getSessionToken(request) {
  // Try Authorization header first (Bearer token)
  const authHeader = request.headers.get('Authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }
  
  // Fall back to cookie
  const cookies = request.headers.get('Cookie') || ''
  const match = cookies.match(new RegExp(`${SESSION_COOKIE_NAME}=([^;]+)`))
  return match ? match[1] : null
}

/**
 * Check if request is authenticated using server-side session
 * @param {Request} request - HTTP request
 * @param {Object} env - Cloudflare environment variables
 * @returns {Promise<boolean>} - True if authenticated
 */
export async function isAuthenticated(request, env) {
  const sessionToken = getSessionToken(request)
  
  if (!sessionToken) {
    return false
  }
  
  // Verify session exists in KV
  const sessionKv = env.SESSION_KV || env.RATE_LIMIT_KV // Fallback to rate limit KV if session KV not configured
  if (!sessionKv) {
    console.warn('No KV namespace configured for sessions')
    return false
  }
  
  try {
    const sessionData = await sessionKv.get(`session:${sessionToken}`, { type: 'json' })
    return sessionData !== null && sessionData.valid === true
  } catch (error) {
    console.error('Session verification error:', error)
    return false
  }
}

/**
 * Create a new session and store in KV
 * @param {Object} env - Cloudflare environment variables
 * @returns {Promise<string>} - Session token
 */
export async function createSession(env) {
  const sessionToken = generateSessionToken()
  const sessionKv = env.SESSION_KV || env.RATE_LIMIT_KV
  
  if (!sessionKv) {
    throw new Error('No KV namespace configured for sessions')
  }
  
  await sessionKv.put(
    `session:${sessionToken}`,
    JSON.stringify({
      valid: true,
      createdAt: Date.now()
    }),
    { expirationTtl: SESSION_DURATION }
  )
  
  return sessionToken
}

/**
 * Invalidate a session
 * @param {string} sessionToken - Session token to invalidate
 * @param {Object} env - Cloudflare environment variables
 */
export async function invalidateSession(sessionToken, env) {
  const sessionKv = env.SESSION_KV || env.RATE_LIMIT_KV
  
  if (!sessionKv || !sessionToken) {
    return
  }
  
  try {
    await sessionKv.delete(`session:${sessionToken}`)
  } catch (error) {
    console.error('Session invalidation error:', error)
  }
}

/**
 * Verify password and create session
 * @param {string} password - Password to verify
 * @param {Object} env - Cloudflare environment variables
 * @returns {Promise<{success: boolean, sessionToken?: string, error?: string}>}
 */
export async function verifyPasswordAndCreateSession(password, env) {
  const expectedPassword = env.ADMIN_PASSWORD
  
  if (!expectedPassword) {
    return { success: false, error: 'Admin password not configured' }
  }
  
  if (password !== expectedPassword) {
    return { success: false, error: 'Invalid password' }
  }
  
  try {
    const sessionToken = await createSession(env)
    return { success: true, sessionToken }
  } catch (error) {
    console.error('Session creation error:', error)
    return { success: false, error: 'Failed to create session' }
  }
}

/**
 * Get session cookie header
 * @param {string} sessionToken - Session token
 * @returns {string} - Set-Cookie header value
 */
export function getSessionCookieHeader(sessionToken) {
  return `${SESSION_COOKIE_NAME}=${sessionToken}; Max-Age=${SESSION_DURATION}; Path=/; HttpOnly; SameSite=Lax; Secure`
}

/**
 * Clear session cookie header
 * @returns {string} - Set-Cookie header value to clear cookie
 */
export function getClearSessionCookieHeader() {
  return `${SESSION_COOKIE_NAME}=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax; Secure`
}

/**
 * Return unauthorized response
 * @returns {Response}
 */
export function unauthorizedResponse() {
  return new Response(
    JSON.stringify({ error: 'Unauthorized', message: 'Authentication required' }),
    { 
      status: 401, 
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      } 
    }
  )
}

/**
 * Middleware function to protect endpoints
 * @param {Function} handler - Request handler function
 * @returns {Function} - Protected handler
 */
export function requireAuth(handler) {
  return async (context) => {
    const { request, env } = context
    
    if (!isAuthenticated(request, env)) {
      return unauthorizedResponse()
    }
    
    return handler(context)
  }
}

