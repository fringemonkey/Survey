/**
 * Admin API endpoint: /admin/api/status
 * Returns system status information
 */

import { getEnvironmentConfig } from '../../utils/environment.js'

export async function onRequestGet(context) {
  const { request, env } = context
  
  try {
    // Authentication is handled by middleware - just process the request
    return await handleStatus(request, env)
  } catch (error) {
    console.error('Admin status API error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

export async function handleStatus(request, env) {
  const envConfig = getEnvironmentConfig(request, env)
  const stagingDb = envConfig.dbStaging || env.DB_STAGING || env.DB
  const prodDb = envConfig.dbProd || env.DB_PROD
  const rateLimitKv = env.RATE_LIMIT_KV
  
  const status = {
    databases: {
      staging: { connected: false, error: null },
      production: { connected: false, error: null }
    },
    sanitization: {
      lastRun: null,
      pendingCount: 0,
      approvedCount: 0,
      rejectedCount: 0,
      successRate: 0
    },
    backup: {
      lastBackup: null,
      status: 'unknown'
    },
    rateLimit: {
      status: rateLimitKv ? 'configured' : 'not_configured'
    },
    errors: []
  }
  
  // Check staging database connectivity
  if (stagingDb) {
    try {
      await stagingDb.prepare('SELECT 1').first()
      status.databases.staging.connected = true
      
      // Get sanitization metrics
      const pendingResult = await stagingDb.prepare(
        "SELECT COUNT(*) as count FROM survey_responses WHERE sanitization_status = 'pending' OR sanitization_status IS NULL"
      ).first()
      const approvedResult = await stagingDb.prepare(
        "SELECT COUNT(*) as count FROM survey_responses WHERE sanitization_status = 'approved'"
      ).first()
      const rejectedResult = await stagingDb.prepare(
        "SELECT COUNT(*) as count FROM survey_responses WHERE sanitization_status = 'rejected'"
      ).first()
      const lastSanitizedResult = await stagingDb.prepare(
        'SELECT MAX(sanitized_at) as last_run FROM survey_responses WHERE sanitized_at IS NOT NULL'
      ).first()
      
      status.sanitization.pendingCount = pendingResult?.count || 0
      status.sanitization.approvedCount = approvedResult?.count || 0
      status.sanitization.rejectedCount = rejectedResult?.count || 0
      status.sanitization.lastRun = lastSanitizedResult?.last_run || null
      
      const total = status.sanitization.approvedCount + status.sanitization.rejectedCount
      if (total > 0) {
        status.sanitization.successRate = Math.round((status.sanitization.approvedCount / total) * 100)
      }
    } catch (error) {
      console.error('Staging database error:', error)
      status.databases.staging.error = error.message
      status.errors.push({ component: 'staging_db', error: error.message })
    }
  }
  
  // Check production database connectivity
  if (prodDb) {
    try {
      await prodDb.prepare('SELECT 1').first()
      status.databases.production.connected = true
    } catch (error) {
      console.error('Production database error:', error)
      status.databases.production.error = error.message
      status.errors.push({ component: 'production_db', error: error.message })
    }
  }
  
  return new Response(
    JSON.stringify(status),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  )
}

