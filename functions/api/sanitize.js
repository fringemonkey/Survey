/**
 * Cloudflare Pages Function to sanitize staging data and sync to production
 * Called via cron trigger or manually via POST request
 * Protected endpoint - requires ADMIN_PASSWORD Bearer token
 */

import { filterContent, validateSurveyData, sanitizeSurveyData } from '../utils/sanitization.js'
import { isAuthenticated, unauthorizedResponse } from '../utils/auth.js'
import { getEnvironmentConfig } from '../utils/environment.js'

export async function onRequestPost(context) {
  const { request, env } = context
  
  // Check authentication (skip for cron triggers)
  // Cron triggers don't include Authorization header, so we allow them through
  // Manual triggers require authentication
  const isCronTrigger = request.headers.get('CF-Scheduled') !== null
  if (!isCronTrigger) {
    const authenticated = await isAuthenticated(request, env)
    if (!authenticated) {
      return unauthorizedResponse()
    }
  }

  return await processSanitization(request, env)
}

/**
 * Cron trigger handler (called hourly)
 */
export async function onScheduled(event, env, ctx) {
  // Cron triggers don't have a request object, so we detect environment from env vars
  // Create a mock request for environment detection
  const envName = env.ENVIRONMENT || 'production'
  const mockUrl = envName === 'sandbox' || envName === 'preview' 
    ? 'https://dev.gamesurvey.cocstlc.org' 
    : 'https://gamesurvey.cocstlc.org'
  const mockRequest = new Request(mockUrl)
  ctx.waitUntil(processSanitization(mockRequest, env))
}

async function processSanitization(request, env) {
  // Use environment-specific databases
  const envConfig = getEnvironmentConfig(request, env)
  const stagingDb = envConfig.dbStaging
  const prodDb = envConfig.dbProd

  if (!stagingDb) {
    console.error('Staging database not available')
    return new Response(
      JSON.stringify({ error: 'Staging database not configured' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }

  if (!prodDb) {
    console.error('Production database not available')
    return new Response(
      JSON.stringify({ error: 'Production database not configured' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }

  try {
    // Get pending records from staging (limit to prevent timeout)
    const pendingRecords = await stagingDb.prepare(
      `SELECT * FROM survey_responses 
       WHERE sanitization_status = 'pending' OR sanitization_status IS NULL
       ORDER BY submitted_at ASC 
       LIMIT 100`
    ).all()

    if (!pendingRecords.results || pendingRecords.results.length === 0) {
      return new Response(
        JSON.stringify({ 
          message: 'No pending records to sanitize',
          processed: 0,
          approved: 0,
          rejected: 0
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }

    let approved = 0
    let rejected = 0
    const errors = []

    for (const record of pendingRecords.results) {
      try {
        // Increment attempt counter
        const attempts = (record.sanitization_attempts || 0) + 1
        await stagingDb.prepare(
          `UPDATE survey_responses 
           SET sanitization_attempts = ? 
           WHERE id = ?`
        ).bind(attempts, record.id).run()

        // Validate data structure
        const validation = await validateSurveyData(record)
        if (!validation.valid) {
          await markAsRejected(stagingDb, record.id, `Validation failed: ${validation.errors?.join(', ')}`)
          rejected++
          continue
        }

        // Sanitize text content
        const sanitization = await sanitizeSurveyData(record)
        if (sanitization.issues && sanitization.issues.length > 0) {
          // Log issues but don't necessarily reject
          console.warn(`Sanitization issues for record ${record.id}:`, sanitization.issues)
        }

        const sanitizedRecord = sanitization.sanitized

        // Check all text fields for malicious content
        const textFields = [
          'cpu', 'gpu', 'ram', 'storage', 'playtime', 'discord_name',
          'quest_progress', 'open_feedback_space', 'bug_other_text',
          'pre_cu1_vs_post', 'which_quest_poi', 'additional_data'
        ]

        let hasMaliciousContent = false
        const maliciousReasons = []

        for (const field of textFields) {
          if (sanitizedRecord[field]) {
            const contentCheck = await filterContent(String(sanitizedRecord[field]))
            if (!contentCheck.safe) {
              hasMaliciousContent = true
              maliciousReasons.push(`${field}: ${contentCheck.reason}`)
            }
          }
        }

        if (hasMaliciousContent) {
          await markAsRejected(stagingDb, record.id, `Malicious content detected: ${maliciousReasons.join(', ')}`)
          rejected++
          continue
        }

        // All checks passed - insert into production database
        await insertToProduction(prodDb, sanitizedRecord)

        // Mark as approved in staging
        await stagingDb.prepare(
          `UPDATE survey_responses 
           SET sanitization_status = 'approved',
               sanitized_at = ?,
               rejected_reason = NULL
           WHERE id = ?`
        ).bind(new Date().toISOString(), record.id).run()

        approved++

      } catch (error) {
        console.error(`Error processing record ${record.id}:`, error)
        errors.push({ id: record.id, error: error.message })
        
        // Mark as rejected after too many attempts
        const attempts = record.sanitization_attempts || 0
        if (attempts >= 3) {
          await markAsRejected(stagingDb, record.id, `Processing failed after ${attempts} attempts: ${error.message}`)
          rejected++
        }
      }
    }

    return new Response(
      JSON.stringify({
        message: 'Sanitization completed',
        processed: pendingRecords.results.length,
        approved,
        rejected,
        errors: errors.length > 0 ? errors : undefined
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Sanitization error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Sanitization failed',
        message: error.message
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

async function markAsRejected(db, id, reason) {
  await db.prepare(
    `UPDATE survey_responses 
     SET sanitization_status = 'rejected',
         sanitized_at = ?,
         rejected_reason = ?
     WHERE id = ?`
  ).bind(new Date().toISOString(), reason, id).run()
}

async function insertToProduction(db, record) {
  // Build INSERT statement with all columns
  // This matches the structure from submit.js
  const columns = [
    'discord_name', 'age', 'cpu', 'gpu', 'ram', 'storage', 'playtime', 'tos', 'response_id',
    'avg_fps_pre_cu1', 'avg_fps_post_cu1', 'pre_cu1_vs_post', 'overall_client_stability',
    'common_bugs_experienced', 'crashes_per_session', 'quest_bugs_experienced', 'which_quest_poi',
    'posted_about_issues_boat1', 'method_used_to_resolve_boat1', 'was_it_resolved_boat1', 'link_to_post_boat1',
    'posted_about_issues_boat2', 'method_used_to_resolve_boat2', 'was_it_resolved_boat2', 'link_to_post_boat2',
    'posted_about_issues_elevator', 'method_used_to_resolve_elevator', 'was_it_resolved_elevator', 'what_poi_elevator', 'link_to_post_elevator',
    'posted_about_issues_sliding', 'was_it_resolved_sliding', 'picture_sliding', 'link_to_post_sliding',
    'resolved_q_laz', 'additional_data',
    'quest_progress', 'pre_cu1_quests_rating', 'mother_rating', 'the_one_before_me_rating',
    'the_warehouse_rating', 'whispers_within_rating', 'smile_at_dark_rating', 'story_engagement', 'overall_quest_story_rating',
    'overall_score_post_cu1', 'open_feedback_space',
    'bug_none', 'bug_boat_stuck', 'bug_boat_sinking', 'bug_sliding_buildings',
    'bug_elevator', 'bug_quest', 'bug_other', 'bug_other_text',
    'submitted_at'
  ]

  const placeholders = columns.map(() => '?').join(', ')
  const values = columns.map(col => record[col] !== undefined ? record[col] : null)

  await db.prepare(
    `INSERT INTO survey_responses (${columns.join(', ')}) VALUES (${placeholders})`
  ).bind(...values).run()
}

