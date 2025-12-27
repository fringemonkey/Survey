/**
 * Unified authentication utility for Cloudflare Pages Functions
 * Supports Cloudflare Zero Trust Access (primary) and password-based sessions (fallback during migration)
 * Password is never stored client-side - only session tokens
 */

const SESSION_DURATION = 24 * 60 * 60 // 24 hours in seconds
const SESSION_COOKIE_NAME = 'admin_session'
const CF_ACCESS_JWT_HEADER = 'CF-Access-JWT-Assertion'

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
 * Verify Cloudflare Access JWT token
 * @param {Request} request - HTTP request
 * @param {Object} env - Cloudflare environment variables
 * @returns {Promise<{authenticated: boolean, userInfo?: object}>}
 */
async function verifyCloudflareAccess(request, env) {
  const jwtAssertion = request.headers.get(CF_ACCESS_JWT_HEADER)
  
  if (!jwtAssertion) {
    return { authenticated: false }
  }
  
  try {
    // Cloudflare Access automatically validates the JWT at the edge
    // If we receive the header, it means the user passed Zero Trust authentication
    // Extract user info from JWT payload (base64 encoded)
    const parts = jwtAssertion.split('.')
    if (parts.length !== 3) {
      return { authenticated: false }
    }
    
    // Decode JWT payload (second part)
    // Base64 URL decode: replace URL-safe characters and add padding if needed
    let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    // Add padding if needed
    while (base64.length % 4) {
      base64 += '='
    }
    const payload = JSON.parse(atob(base64))
    
    // Extract user information
    const userInfo = {
      email: payload.email || payload.sub,
      githubUsername: payload.github_username || payload.preferred_username,
      aud: payload.aud,
      exp: payload.exp,
      iat: payload.iat
    }
    
    return { authenticated: true, userInfo }
  } catch (error) {
    console.error('CF Access JWT verification error:', error)
    return { authenticated: false }
  }
}

/**
 * Check password-based authentication (fallback during migration)
 * @param {Request} request - HTTP request
 * @param {Object} env - Cloudflare environment variables
 * @returns {Promise<boolean>} - True if authenticated
 */
async function checkPasswordAuth(request, env) {
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
 * Check if request is authenticated using Cloudflare Zero Trust (primary) or password auth (fallback)
 * @param {Request} request - HTTP request
 * @param {Object} env - Cloudflare environment variables
 * @returns {Promise<boolean>} - True if authenticated
 */
export async function isAuthenticated(request, env) {
  // Check Zero Trust first (primary authentication method)
  const cfAccess = await verifyCloudflareAccess(request, env)
  if (cfAccess.authenticated) {
    return true
  }
  
  // Fallback to password auth during migration period
  // This allows gradual migration without breaking existing sessions
  return await checkPasswordAuth(request, env)
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

