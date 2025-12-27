/**
 * Cloudflare Pages Function for admin panel API
 * Provides database statistics, submission logs, and system status
 * Protected by Zero Trust authentication via middleware
 * All endpoints under /admin/api/*
 */

import { isAdminAuthenticated, getAdminUserInfo } from './utils/adminAuth.js'
import { getEnvironmentConfig } from '../utils/environment.js'

/**
 * Handle GET requests (stats, submissions, status)
 */
export async function onRequestGet(context) {
  const { request, env } = context
  
  try {
    // Verify admin authentication (middleware should have already done this, but double-check)
    const authenticated = await isAdminAuthenticated(request, env)
    if (!authenticated) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized', message: 'Authentication required' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    const url = new URL(request.url)
    const path = url.pathname
    
    // Handle different endpoints
    if (path === '/admin/api/stats') {
      return await handleStats(request, env)
    }
    
    if (path === '/admin/api/submissions') {
      const page = parseInt(url.searchParams.get('page') || '1')
      const limit = parseInt(url.searchParams.get('limit') || '50')
      return await handleSubmissions(request, env, page, limit)
    }
    
    if (path === '/admin/api/status') {
      return await handleStatus(request, env)
    }
    
    if (path === '/admin/api/audit') {
      const limit = parseInt(url.searchParams.get('limit') || '50')
      return await handleAuditLog(request, env, limit)
    }
    
    return new Response(
      JSON.stringify({ error: 'Not found' }),
      { status: 404, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Admin API GET error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

/**
 * Handle POST requests (backup, sanitize)
 */
export async function onRequestPost(context) {
  const { request, env } = context
  
  try {
    // Verify admin authentication
    const authenticated = await isAdminAuthenticated(request, env)
    if (!authenticated) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized', message: 'Authentication required' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    const url = new URL(request.url)
    const path = url.pathname
    
    // Note: Backup and sanitize operations are handled by existing /api/backup and /api/sanitize endpoints
    // Those endpoints are also protected by Zero Trust and can be called directly from the admin panel
    // No need to proxy them here
    
    return new Response(
      JSON.stringify({ error: 'Not found' }),
      { status: 404, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Admin API POST error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

/**
 * Handle database statistics
 */
async function handleStats(request, env) {
  const envConfig = getEnvironmentConfig(request, env)
  const stagingDb = envConfig.dbStaging || env.DB_STAGING || env.DB
  const prodDb = envConfig.dbProd || env.DB_PROD
  
  const stats = {
    staging: null,
    production: null,
    errors: []
  }
  
  // Get staging database stats
  if (stagingDb) {
    try {
      const countResult = await stagingDb.prepare('SELECT COUNT(*) as count FROM survey_responses').first()
      const lastRecordResult = await stagingDb.prepare(
        'SELECT submitted_at FROM survey_responses ORDER BY submitted_at DESC LIMIT 1'
      ).first()
      const statusBreakdown = await stagingDb.prepare(
        `SELECT sanitization_status, COUNT(*) as count 
         FROM survey_responses 
         GROUP BY sanitization_status`
      ).all()
      
      stats.staging = {
        totalRecords: countResult?.count || 0,
        lastSubmission: lastRecordResult?.submitted_at || null,
        statusBreakdown: statusBreakdown?.results || []
      }
    } catch (error) {
      console.error('Error fetching staging stats:', error)
      stats.errors.push({ database: 'staging', error: error.message })
    }
  }
  
  // Get production database stats
  if (prodDb) {
    try {
      const countResult = await prodDb.prepare('SELECT COUNT(*) as count FROM survey_responses').first()
      const lastRecordResult = await prodDb.prepare(
        'SELECT submitted_at FROM survey_responses ORDER BY submitted_at DESC LIMIT 1'
      ).first()
      
      stats.production = {
        totalRecords: countResult?.count || 0,
        lastSubmission: lastRecordResult?.submitted_at || null
      }
    } catch (error) {
      console.error('Error fetching production stats:', error)
      stats.errors.push({ database: 'production', error: error.message })
    }
  }
  
  return new Response(
    JSON.stringify(stats),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  )
}

/**
 * Handle submission log
 */
async function handleSubmissions(request, env, page, limit) {
  const envConfig = getEnvironmentConfig(request, env)
  const stagingDb = envConfig.dbStaging || env.DB_STAGING || env.DB
  
  if (!stagingDb) {
    return new Response(
      JSON.stringify({ error: 'Staging database not configured' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
  
  try {
    const offset = (page - 1) * limit
    const submissions = await stagingDb.prepare(
      `SELECT response_id, submitted_at, sanitization_status, sanitized_at, rejected_reason
       FROM survey_responses 
       ORDER BY submitted_at DESC 
       LIMIT ? OFFSET ?`
    ).bind(limit, offset).all()
    
    // Get total count for pagination
    const totalResult = await stagingDb.prepare('SELECT COUNT(*) as count FROM survey_responses').first()
    const total = totalResult?.count || 0
    
    const submissionsWithType = submissions.results.map(sub => ({
      response_id: sub.response_id,
      submitted_at: sub.submitted_at,
      sanitization_status: sub.sanitization_status || 'pending',
      sanitized_at: sub.sanitized_at,
      rejected_reason: sub.rejected_reason
    }))
    
    return new Response(
      JSON.stringify({
        submissions: submissionsWithType,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error fetching submissions:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to fetch submissions', message: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

/**
 * Handle system status
 */
async function handleStatus(request, env) {
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

/**
 * Handle audit log retrieval
 */
async function handleAuditLog(request, env, limit) {
  const envConfig = getEnvironmentConfig(request, env)
  const stagingDb = envConfig.dbStaging || env.DB_STAGING || env.DB
  
  if (!stagingDb) {
    return new Response(
      JSON.stringify({ error: 'Database not configured', logs: [] }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
  
  try {
    // Check if audit log table exists
    try {
      await stagingDb.prepare('SELECT 1 FROM admin_audit_log LIMIT 1').first()
    } catch (error) {
      // Table doesn't exist yet - return empty logs with message
      return new Response(
        JSON.stringify({ 
          logs: [],
          message: 'Audit log table not found. Run migration 0008_add_admin_audit_log.sql to enable audit logging.',
          note: 'Audit logs will be stored once the migration is applied'
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    // Fetch recent audit logs
    const logs = await stagingDb.prepare(
      `SELECT id, timestamp, github_username, email, action, endpoint, ip_address, github_org, details, created_at
       FROM admin_audit_log
       ORDER BY timestamp DESC
       LIMIT ?`
    ).bind(limit).all()
    
    const formattedLogs = logs.results.map(log => ({
      id: log.id,
      timestamp: log.timestamp,
      githubUsername: log.github_username,
      email: log.email,
      action: log.action,
      endpoint: log.endpoint,
      ipAddress: log.ip_address,
      githubOrg: log.github_org,
      details: log.details ? JSON.parse(log.details) : null,
      createdAt: log.created_at
    }))
    
    return new Response(
      JSON.stringify({ 
        logs: formattedLogs,
        total: formattedLogs.length
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error fetching audit logs:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to fetch audit logs', message: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

