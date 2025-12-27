/**
 * Admin API endpoint: /admin/api/submissions
 * Returns submission logs with pagination
 */

import { getEnvironmentConfig } from '../../utils/environment.js'

export async function onRequestGet(context) {
  const { request, env } = context
  
  try {
    // Authentication is handled by middleware - just process the request
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '50')
    
    return await handleSubmissions(request, env, page, limit)
  } catch (error) {
    console.error('Admin submissions API error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

export async function handleSubmissions(request, env, page, limit) {
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

