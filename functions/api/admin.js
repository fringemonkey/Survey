/**
 * Cloudflare Pages Function for admin panel API
 * Provides database statistics, submission logs, and system status
 * Protected endpoint - uses server-side session authentication
 */

import { 
  isAuthenticated, 
  unauthorizedResponse, 
  verifyPasswordAndCreateSession,
  invalidateSession,
  getSessionToken,
  getSessionCookieHeader,
  getClearSessionCookieHeader
} from '../utils/auth.js'

/**
 * Infer survey type from record data
 */
function inferSurveyType(record) {
  if (record.surveyType) {
    return record.surveyType
  }
  
  // Infer from data fields
  if (record.cpu || record.gpu || record.ram || record.storage) {
    if (!record.age && !record.tos) {
      return 'hardware'
    }
  }
  
  if (record.avg_fps_pre_cu1 || record.avg_fps_post_cu1 || record.overall_client_stability) {
    return 'performance'
  }
  
  if (record.bug_none || record.bug_boat_stuck || record.bug_elevator || record.bug_other) {
    return 'bug'
  }
  
  if (record.quest_progress || record.pre_cu1_quests_rating || record.overall_quest_story_rating) {
    return 'quest'
  }
  
  if (record.story_engagement || record.overall_score_post_cu1) {
    return 'story'
  }
  
  if (record.age && record.tos) {
    return 'personal'
  }
  
  return 'full'
}

/**
 * Handle POST requests (login, logout)
 */
export async function onRequestPost(context) {
  const { request, env } = context
  
  try {
    const url = new URL(request.url)
    const path = url.pathname
    
    if (path === '/api/admin/login') {
      return await handleLogin(request, env)
    }
    
    if (path === '/api/admin/logout') {
      return await handleLogout(request, env)
    }
    
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
 * Handle login
 */
async function handleLogin(request, env) {
  try {
    const body = await request.json()
    const { password } = body
    
    const result = await verifyPasswordAndCreateSession(password, env)
    
    if (!result.success) {
      return new Response(
        JSON.stringify({ error: result.error || 'Authentication failed' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    return new Response(
      JSON.stringify({ success: true, message: 'Login successful' }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': getSessionCookieHeader(result.sessionToken)
        }
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Invalid request body' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

/**
 * Handle logout
 */
async function handleLogout(request, env) {
  const sessionToken = getSessionToken(request)
  
  if (sessionToken) {
    await invalidateSession(sessionToken, env)
  }
  
  return new Response(
    JSON.stringify({ success: true, message: 'Logged out' }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': getClearSessionCookieHeader()
      }
    }
  )
}

/**
 * Handle GET requests (stats, submissions, status)
 */
export async function onRequestGet(context) {
  const { request, env } = context
  
  try {
    // Check authentication for all GET endpoints
    const authenticated = await isAuthenticated(request, env)
    if (!authenticated) {
      return unauthorizedResponse()
    }
    
    const url = new URL(request.url)
    const path = url.pathname
    
    if (path === '/api/admin/stats') {
      return await handleStats(env)
    }
    
    if (path === '/api/admin/submissions') {
      const page = parseInt(url.searchParams.get('page') || '1')
      const limit = parseInt(url.searchParams.get('limit') || '50')
      return await handleSubmissions(env, page, limit)
    }
    
    if (path === '/api/admin/status') {
      return await handleStatus(env)
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
 * Handle database statistics
 */
async function handleStats(env) {
  const stagingDb = env.DB_STAGING || env.DB
  const prodDb = env.DB_PROD
  
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
async function handleSubmissions(env, page, limit) {
  const stagingDb = env.DB_STAGING || env.DB
  
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
    
    // Infer survey type for each submission (would need full record, but we'll use a simplified approach)
    // For now, we'll just return what we have and let frontend handle type inference if needed
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
async function handleStatus(env) {
  const stagingDb = env.DB_STAGING || env.DB
  const prodDb = env.DB_PROD
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
  
  // Backup status would ideally come from backup metadata stored in KV or R2
  // For now, we'll mark it as unknown since we don't have a reliable way to track it
  // This could be enhanced by storing backup timestamps in KV
  
  return new Response(
    JSON.stringify(status),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  )
}

