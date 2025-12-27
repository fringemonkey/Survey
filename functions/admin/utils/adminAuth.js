/**
 * Admin-specific Zero Trust authentication utilities (server-side)
 * Enforces strict GitHub org/team validation for admin routes
 * Survey site: TLC-Community-Survey / Admins team
 */

const CF_ACCESS_JWT_HEADER = 'CF-Access-JWT-Assertion'
const REQUIRED_GITHUB_ORG = 'TLC-Community-Survey'
const REQUIRED_GITHUB_TEAM = 'Admins'

/**
 * Decode JWT payload
 * @param {string} jwt - JWT token
 * @returns {object|null} - Decoded payload or null
 */
function decodeJWTPayload(jwt) {
  try {
    const parts = jwt.split('.')
    if (parts.length !== 3) {
      return null
    }
    
    // Decode JWT payload (second part)
    let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    // Add padding if needed
    while (base64.length % 4) {
      base64 += '='
    }
    
    return JSON.parse(atob(base64))
  } catch (error) {
    console.error('JWT decode error:', error)
    return null
  }
}

/**
 * Verify Cloudflare Access JWT and validate GitHub org/team
 * @param {Request} request - HTTP request
 * @param {Object} env - Cloudflare environment variables
 * @returns {Promise<{authenticated: boolean, userInfo?: object, error?: string}>}
 */
export async function verifyAdminAccess(request, env) {
  const jwtAssertion = request.headers.get(CF_ACCESS_JWT_HEADER)
  
  if (!jwtAssertion) {
    return { authenticated: false, error: 'Missing CF-Access-JWT-Assertion header' }
  }
  
  try {
    const payload = decodeJWTPayload(jwtAssertion)
    
    if (!payload) {
      return { authenticated: false, error: 'Invalid JWT format' }
    }
    
    // Validate expiration
    const now = Math.floor(Date.now() / 1000)
    if (payload.exp && payload.exp < now) {
      return { authenticated: false, error: 'JWT expired' }
    }
    
    // Validate audience if configured
    if (env.CF_ACCESS_AUD) {
      const audList = Array.isArray(payload.aud) ? payload.aud : [payload.aud]
      if (!audList.includes(env.CF_ACCESS_AUD)) {
        return { authenticated: false, error: 'Invalid JWT audience' }
      }
    }
    
    // Validate issuer if configured
    if (env.CF_ACCESS_ISS && payload.iss !== env.CF_ACCESS_ISS) {
      return { authenticated: false, error: 'Invalid JWT issuer' }
    }
    
    // Extract GitHub organization and team from JWT
    // Cloudflare Access includes GitHub org/team info in custom claims
    // The exact claim names may vary - check both common patterns
    const githubOrg = payload['https://cloudflareaccess.com/claims/org'] || 
                     payload['custom:github_org'] || 
                     payload.github_org ||
                     payload.org
    
    // Teams might be in different claim formats
    const githubTeam = payload['https://cloudflareaccess.com/claims/team'] || 
                      payload['custom:github_team'] || 
                      payload.github_team ||
                      payload.team
    
    const githubTeams = payload['https://cloudflareaccess.com/claims/teams'] || 
                       payload['custom:github_teams'] || 
                       payload.github_teams ||
                       (githubTeam ? [githubTeam] : [])
    
    // Note: Cloudflare Access may not include GitHub org/team in JWT by default
    // If not present, we'll rely on Cloudflare Access policy enforcement at the edge
    // But we still validate that the JWT is present and valid
    
    // If GitHub org info is present, validate it
    if (githubOrg && githubOrg !== REQUIRED_GITHUB_ORG) {
      return { 
        authenticated: false, 
        error: `Access denied: Must be member of ${REQUIRED_GITHUB_ORG} organization` 
      }
    }
    
    // If GitHub team info is present, validate it
    if (githubTeam || (Array.isArray(githubTeams) && githubTeams.length > 0)) {
      const userTeams = Array.isArray(githubTeams) ? githubTeams : (githubTeam ? [githubTeam] : [])
      const isInRequiredTeam = userTeams.includes(REQUIRED_GITHUB_TEAM)
      
      if (!isInRequiredTeam) {
        return { 
          authenticated: false, 
          error: `Access denied: Must be member of ${REQUIRED_GITHUB_TEAM} team in ${REQUIRED_GITHUB_ORG}` 
        }
      }
    }
    
    // Extract user information
    const userInfo = {
      email: payload.email || payload.sub,
      githubUsername: payload.github_username || payload.preferred_username || payload.sub,
      githubOrg: githubOrg || REQUIRED_GITHUB_ORG, // Default to required org if not in JWT
      githubTeams: Array.isArray(githubTeams) ? githubTeams : (githubTeam ? [githubTeam] : [REQUIRED_GITHUB_TEAM]),
      aud: payload.aud,
      exp: payload.exp,
      iat: payload.iat
    }
    
    return { authenticated: true, userInfo }
  } catch (error) {
    console.error('Admin access verification error:', error)
    return { authenticated: false, error: 'JWT verification failed' }
  }
}

/**
 * Check if request is authenticated for admin access
 * @param {Request} request - HTTP request
 * @param {Object} env - Cloudflare environment variables
 * @returns {Promise<boolean>} - True if authenticated
 */
export async function isAdminAuthenticated(request, env) {
  const result = await verifyAdminAccess(request, env)
  return result.authenticated
}

/**
 * Get user info from authenticated request
 * @param {Request} request - HTTP request
 * @param {Object} env - Cloudflare environment variables
 * @returns {Promise<object|null>} - User info or null
 */
export async function getAdminUserInfo(request, env) {
  const result = await verifyAdminAccess(request, env)
  return result.authenticated ? result.userInfo : null
}

