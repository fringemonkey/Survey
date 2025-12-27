/**
 * Admin middleware for Cloudflare Pages Functions
 * Enforces Zero Trust authentication for all /admin/* routes
 * Adds security headers and rate limiting
 */

import { verifyAdminAccess, getAdminUserInfo } from './utils/adminAuth.js'
import { getClientIP } from '../utils/sanitization.js'

/**
 * Security headers for admin routes
 */
function getSecurityHeaders() {
  return {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'",
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
  }
}

/**
 * Check admin rate limit per user
 * @param {KVNamespace} kv - KV namespace
 * @param {string} githubUsername - GitHub username
 * @param {number} limitPerHour - Limit per hour
 * @returns {Promise<{allowed: boolean, remaining: number, resetAt: number}>}
 */
async function checkAdminRateLimit(kv, githubUsername, limitPerHour = 100) {
  if (!kv || !githubUsername) {
    return { allowed: true, remaining: limitPerHour, resetAt: Date.now() + 3600000 }
  }

  const key = `admin_rate_limit:${githubUsername}`
  const now = Date.now()

  try {
    const data = await kv.get(key, { type: 'json' })
    
    if (!data) {
      await kv.put(key, JSON.stringify({
        count: 1,
        resetAt: now + 3600000
      }), { expirationTtl: 3600 })
      return { allowed: true, remaining: limitPerHour - 1, resetAt: now + 3600000 }
    }

    if (data.resetAt < now) {
      await kv.put(key, JSON.stringify({
        count: 1,
        resetAt: now + 3600000
      }), { expirationTtl: 3600 })
      return { allowed: true, remaining: limitPerHour - 1, resetAt: now + 3600000 }
    }

    if (data.count >= limitPerHour) {
      return { allowed: false, remaining: 0, resetAt: data.resetAt }
    }

    const newCount = data.count + 1
    await kv.put(key, JSON.stringify({
      count: newCount,
      resetAt: data.resetAt
    }), { expirationTtl: Math.ceil((data.resetAt - now) / 1000) })

    return { allowed: true, remaining: limitPerHour - newCount, resetAt: data.resetAt }
  } catch (error) {
    console.error('Admin rate limit check error:', error)
    return { allowed: true, remaining: limitPerHour, resetAt: now + 3600000 }
  }
}

/**
 * Log admin action for audit trail
 * @param {KVNamespace} kv - KV namespace (can be RATE_LIMIT_KV)
 * @param {object} userInfo - User info from JWT
 * @param {string} action - Action performed
 * @param {string} endpoint - Endpoint accessed
 * @param {string} ip - Client IP
 */
async function logAdminAction(kv, userInfo, action, endpoint, ip) {
  if (!kv || !userInfo) return

  try {
    const logEntry = {
      timestamp: new Date().toISOString(),
      githubUsername: userInfo.githubUsername,
      email: userInfo.email,
      action,
      endpoint,
      ip,
      githubOrg: userInfo.githubOrg
    }

    // Store in KV with timestamp as part of key for easy querying
    const timestamp = Date.now()
    const key = `admin_audit:${timestamp}:${userInfo.githubUsername}`
    
    // Store with 90 day expiration (audit logs retention)
    await kv.put(key, JSON.stringify(logEntry), { expirationTtl: 90 * 24 * 60 * 60 })
  } catch (error) {
    console.error('Failed to log admin action:', error)
    // Don't fail the request if logging fails
  }
}

/**
 * Admin middleware - runs before all /admin/* requests
 */
export async function onRequest(context) {
  const { request, env, next } = context
  const url = new URL(request.url)
  
  // Only apply to /admin/* paths
  if (!url.pathname.startsWith('/admin')) {
    return next()
  }

  // Verify Zero Trust authentication
  const authResult = await verifyAdminAccess(request, env)
  
  if (!authResult.authenticated) {
    // Log failed access attempt
    const ip = getClientIP(request)
    console.warn(`Admin access denied: ${authResult.error || 'Not authenticated'} - IP: ${ip} - Path: ${url.pathname}`)
    
    return new Response(
      JSON.stringify({ 
        error: 'Unauthorized', 
        message: authResult.error || 'Authentication required',
        details: 'Access requires GitHub authentication via Cloudflare Zero Trust. You must be a member of TLC-Community-Survey/Admins.'
      }),
      { 
        status: 403,
        headers: {
          'Content-Type': 'application/json',
          ...getSecurityHeaders()
        }
      }
    )
  }

  // Get user info for rate limiting and audit logging
  const userInfo = authResult.userInfo
  const ip = getClientIP(request)
  
  // Check admin-specific rate limiting (per user, not per IP)
  const adminRateLimit = parseInt(env.ADMIN_RATE_LIMIT_PER_HOUR || '100')
  const rateLimitResult = await checkAdminRateLimit(
    env.RATE_LIMIT_KV, 
    userInfo.githubUsername, 
    adminRateLimit
  )

  if (!rateLimitResult.allowed) {
    // Log rate limit exceeded
    await logAdminAction(env.RATE_LIMIT_KV, userInfo, 'rate_limit_exceeded', url.pathname, ip)
    
    return new Response(
      JSON.stringify({ 
        error: 'Rate limit exceeded',
        message: `Too many admin requests. Please try again after ${new Date(rateLimitResult.resetAt).toISOString()}`,
        resetAt: rateLimitResult.resetAt
      }),
      { 
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000).toString(),
          ...getSecurityHeaders()
        }
      }
    )
  }

  // Log admin action
  const action = request.method === 'GET' ? 'read' : request.method.toLowerCase()
  await logAdminAction(env.RATE_LIMIT_KV, userInfo, action, url.pathname, ip)

  // Continue to the actual handler
  const response = await next()
  
  // Add security headers to response
  const securityHeaders = getSecurityHeaders()
  for (const [key, value] of Object.entries(securityHeaders)) {
    response.headers.set(key, value)
  }

  return response
}

