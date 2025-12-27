/**
 * Admin API endpoint: /admin/api/stats
 * Returns database statistics
 */

import { getEnvironmentConfig } from '../../utils/environment.js'

export async function onRequestGet(context) {
  const { request, env } = context
  
  try {
    // Authentication is handled by middleware - just process the request
    return await handleStats(request, env)
  } catch (error) {
    console.error('Admin stats API error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

export async function handleStats(request, env) {
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

