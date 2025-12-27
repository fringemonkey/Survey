/**
 * Admin API endpoint: /admin/api/audit
 * Returns audit logs
 */

import { getEnvironmentConfig } from '../../utils/environment.js'

export async function onRequestGet(context) {
  const { request, env } = context
  
  try {
    // Authentication is handled by middleware - just process the request
    const url = new URL(request.url)
    const limit = parseInt(url.searchParams.get('limit') || '50')
    
    return await handleAuditLog(request, env, limit)
  } catch (error) {
    console.error('Admin audit API error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

export async function handleAuditLog(request, env, limit) {
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

