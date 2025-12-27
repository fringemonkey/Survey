/**
 * Environment detection and configuration utilities
 * Helps identify which Cloudflare Pages environment is running
 */

/**
 * Detect the current environment from request context
 * @param {Request} request - The incoming request
 * @param {object} env - Environment bindings from Cloudflare
 * @returns {string} Environment name: 'sandbox', 'preview', or 'production'
 */
export function detectEnvironment(request, env) {
  // Check explicit environment variable first
  if (env.ENVIRONMENT) {
    return env.ENVIRONMENT.toLowerCase()
  }

  // Check hostname for sandbox subdomain
  const hostname = request.headers.get('host') || ''
  if (hostname.includes('dev.') || hostname.includes('sandbox.')) {
    return 'sandbox'
  }

  // Check for preview deployments (Cloudflare Pages preview URLs)
  if (hostname.includes('.pages.dev') && !hostname.includes('survey.pages.dev')) {
    return 'preview'
  }

  // Default to production
  return 'production'
}

/**
 * Check if current environment is sandbox/preview
 * @param {Request} request - The incoming request
 * @param {object} env - Environment bindings from Cloudflare
 * @returns {boolean}
 */
export function isSandboxEnvironment(request, env) {
  const envName = detectEnvironment(request, env)
  return envName === 'sandbox' || envName === 'preview'
}

/**
 * Get environment-specific configuration
 * @param {Request} request - The incoming request
 * @param {object} env - Environment bindings from Cloudflare
 * @returns {object} Environment configuration
 */
export function getEnvironmentConfig(request, env) {
  const envName = detectEnvironment(request, env)
  const isSandbox = isSandboxEnvironment(request, env)

  return {
    name: envName,
    isSandbox,
    isProduction: envName === 'production',
    // Rate limiting is more lenient in sandbox
    rateLimitPerHour: parseInt(env.RATE_LIMIT_PER_HOUR || (isSandbox ? '50' : '10')),
    // Sandbox uses separate databases
    dbStaging: env.DB_STAGING || env.DB,
    dbProd: env.DB_PROD || null,
    db: env.DB || env.DB_STAGING,
  }
}

/**
 * Log environment info (useful for debugging)
 * @param {Request} request - The incoming request
 * @param {object} env - Environment bindings from Cloudflare
 * @returns {object} Environment info for logging
 */
export function getEnvironmentInfo(request, env) {
  const config = getEnvironmentConfig(request, env)
  const hostname = request.headers.get('host') || 'unknown'
  const url = new URL(request.url)
  
  return {
    environment: config.name,
    hostname,
    path: url.pathname,
    isSandbox: config.isSandbox,
    rateLimit: config.rateLimitPerHour,
  }
}

