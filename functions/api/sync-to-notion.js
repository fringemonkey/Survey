/**
 * Cloudflare Pages Function to sync D1 data to Notion
 * Can be called manually or via cron trigger
 * Protected endpoint - requires ADMIN_PASSWORD Bearer token
 * 
 * NOTE: This function is OPTIONAL. The survey works perfectly fine without Notion.
 * Only use this if you want to sync data to Notion for reports/views.
 */

import { isAuthenticated, unauthorizedResponse } from '../utils/auth.js'

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
  
  try {
    // Check if Notion is configured
    const notionApiKey = env.VITE_NOTION_API_KEY
    if (!notionApiKey) {
      return new Response(
        JSON.stringify({ 
          error: 'Notion API key not configured',
          message: 'Notion sync is optional. The survey works without it. To enable sync, add VITE_NOTION_API_KEY to your environment variables.'
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Import Notion client only if API key exists
    const { Client } = await import('@notionhq/client')
    const notion = new Client({ auth: notionApiKey })
    
    // Get unsynced records from D1 (where synced_to_notion = 0)
    const unsynced = await env.DB.prepare(
      'SELECT * FROM survey_responses WHERE synced_to_notion = 0 ORDER BY submitted_at ASC LIMIT 100'
    ).all()

    if (unsynced.results.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No records to sync', synced: 0 }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const synced = []
    const errors = []

    for (const record of unsynced.results) {
      try {
        // Determine which Notion database to use based on data
        // Since we're storing everything in one table now, we can sync to multiple databases
        // or use a single "All Responses" database
        
        // Option 1: Sync to Respondent Info database (main database)
        const respondentDbId = env.VITE_NOTION_DB_1
        if (respondentDbId) {
          await syncToRespondentInfo(notion, respondentDbId, record)
        }
        
        // Option 2: Sync to Performance database if performance data exists
        if (record.avg_fps_pre_cu1 && env.VITE_NOTION_DB_2) {
          await syncToPerformance(notion, env.VITE_NOTION_DB_2, record)
        }
        
        // Option 3: Sync to Quests database if quest data exists
        if (record.quest_progress && env.VITE_NOTION_DB_3) {
          await syncToQuests(notion, env.VITE_NOTION_DB_3, record)
        }
        
        // Option 4: Sync to Overall Feelings database if feedback exists
        if (record.open_feedback_space && env.VITE_NOTION_DB_4) {
          await syncToOverallFeelings(notion, env.VITE_NOTION_DB_4, record)
        }

        // Mark as synced in D1
        await env.DB.prepare(
          'UPDATE survey_responses SET synced_to_notion = 1, synced_at = ? WHERE id = ?'
        ).bind(new Date().toISOString(), record.id).run()

        synced.push(record.id)
      } catch (error) {
        console.error(`Error syncing record ${record.id}:`, error)
        errors.push({ id: record.id, error: error.message })
      }
    }

    return new Response(
      JSON.stringify({ 
        synced: synced.length,
        errors: errors.length,
        details: { synced, errors }
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in sync function:', error)
    return new Response(
      JSON.stringify({ error: 'Sync failed', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

/**
 * Sync to Respondent Info database
 */
async function syncToRespondentInfo(notion, databaseId, record) {
  const properties = {
    'Name': {
      title: [{ text: { content: record.discord_name } }],
    },
    'Discord Name': {
      rich_text: [{ text: { content: record.discord_name } }],
    },
    'Age': {
      number: record.age,
    },
    'CPU': {
      rich_text: record.cpu ? [{ text: { content: record.cpu } }] : [],
    },
    'GPU': {
      rich_text: record.gpu ? [{ text: { content: record.gpu } }] : [],
    },
    'Playtime': {
      number: record.playtime,
    },
    'RAM': {
      rich_text: record.ram ? [{ text: { content: record.ram } }] : [],
    },
    'Responce ID': {
      rich_text: record.response_id ? [{ text: { content: record.response_id } }] : [],
    },
    'TOS': {
      checkbox: record.tos === 1,
    },
    'last edit time': {
      date: { start: record.submitted_at },
    },
  }

  await notion.pages.create({
    parent: { database_id: databaseId },
    properties: properties,
  })
}

/**
 * Sync to Performance and Stability database
 */
async function syncToPerformance(notion, databaseId, record) {
  const commonBugs = record.common_bugs_experienced 
    ? JSON.parse(record.common_bugs_experienced) 
    : []

  const properties = {
    'Name': {
      title: [{ text: { content: record.discord_name || 'New submission' } }],
    },
    'Discord Name': {
      rich_text: [{ text: { content: record.discord_name } }],
    },
    'Avg FPS Pre CU1': {
      number: record.avg_fps_pre_cu1,
    },
    'Avg FPS Post CU1': {
      number: record.avg_fps_post_cu1,
    },
    'Pre CU1 vs Post': {
      select: { name: record.pre_cu1_vs_post },
    },
    'Overall Client Stabillity': {
      number: record.overall_client_stability,
    },
    'Common Bugs Experienced?': {
      multi_select: commonBugs.map(bug => ({ name: bug })),
    },
    'Crashes per Session': {
      number: record.crashes_per_session,
    },
    'Quest Bugs Experienced?': {
      checkbox: record.quest_bugs_experienced === 1,
    },
    'Which Quest/POI': {
      rich_text: record.which_quest_poi ? [{ text: { content: record.which_quest_poi } }] : [],
    },
    'Additional data': {
      rich_text: record.additional_data ? [{ text: { content: record.additional_data } }] : [],
    },
  }

  // Add bug-specific fields if bugs were experienced
  if (commonBugs.includes('Boat Stuck')) {
    const boat1Posted = record.posted_about_issues_boat1 
      ? JSON.parse(record.posted_about_issues_boat1) 
      : []
    properties['Posted about issues? Boat1'] = {
      multi_select: boat1Posted.map(opt => ({ name: opt })),
    }
    properties['Method used to resolve boat1'] = {
      rich_text: record.method_used_to_resolve_boat1 
        ? [{ text: { content: record.method_used_to_resolve_boat1 } }] 
        : [],
    }
    properties['Was it resolved? Boat1'] = {
      checkbox: record.was_it_resolved_boat1 === 1,
    }
    properties['Link to post Boat1'] = {
      url: record.link_to_post_boat1 || null,
    }
  }

  if (commonBugs.includes('Boat Sinking/Flying')) {
    const boat2Posted = record.posted_about_issues_boat2 
      ? JSON.parse(record.posted_about_issues_boat2) 
      : []
    properties['Posted about issues? Boat2'] = {
      multi_select: boat2Posted.map(opt => ({ name: opt })),
    }
    properties['Method used to resolve boat2'] = {
      rich_text: record.method_used_to_resolve_boat2 
        ? [{ text: { content: record.method_used_to_resolve_boat2 } }] 
        : [],
    }
    properties['Was it resolved? Boat2'] = {
      checkbox: record.was_it_resolved_boat2 === 1,
    }
    properties['Link to post Boat2'] = {
      url: record.link_to_post_boat2 || null,
    }
  }

  if (commonBugs.includes('Elevator issues')) {
    const elevatorPosted = record.posted_about_issues_elevator 
      ? JSON.parse(record.posted_about_issues_elevator) 
      : []
    properties['Posted about issues? Elevator'] = {
      multi_select: elevatorPosted.map(opt => ({ name: opt })),
    }
    properties['Method use to resolve elevator'] = {
      rich_text: record.method_used_to_resolve_elevator 
        ? [{ text: { content: record.method_used_to_resolve_elevator } }] 
        : [],
    }
    properties['Was it resolved? Elevator'] = {
      checkbox: record.was_it_resolved_elevator === 1,
    }
    properties['What POI? elevator'] = {
      rich_text: record.what_poi_elevator 
        ? [{ text: { content: record.what_poi_elevator } }] 
        : [],
    }
    properties['Link to post Elevator'] = {
      url: record.link_to_post_elevator || null,
    }
  }

  if (commonBugs.includes('Sliding buildings on boat')) {
    const slidingPosted = record.posted_about_issues_sliding 
      ? JSON.parse(record.posted_about_issues_sliding) 
      : []
    properties['Posted about issues? Sliding'] = {
      multi_select: slidingPosted.map(opt => ({ name: opt })),
    }
    properties['Was it resolved? sliding'] = {
      checkbox: record.was_it_resolved_sliding === 1,
    }
    properties['Picture sliding'] = {
      url: record.picture_sliding || null,
    }
    properties['Link to post Sliding'] = {
      url: record.link_to_post_sliding || null,
    }
  }

  if (record.quest_bugs_experienced === 1) {
    properties['resolved? Q-Laz'] = {
      checkbox: record.resolved_q_laz === 1,
    }
  }

  await notion.pages.create({
    parent: { database_id: databaseId },
    properties: properties,
  })
}

/**
 * Sync to Quests and Story database
 */
async function syncToQuests(notion, databaseId, record) {
  const properties = {
    'Name': {
      title: [{ text: { content: record.discord_name || 'New submission' } }],
    },
    'Quest Progress': {
      rich_text: record.quest_progress ? [{ text: { content: record.quest_progress } }] : [],
    },
    'Pre CU1 Quests rating': {
      number: record.pre_cu1_quests_rating,
    },
    'Mother rating': {
      number: record.mother_rating,
    },
    'The One Before Me rating': {
      number: record.the_one_before_me_rating,
    },
    'The Warehouse rating': {
      number: record.the_warehouse_rating,
    },
    'Whispers Within rating': {
      number: record.whispers_within_rating,
    },
    'Smile at Dark rating': {
      number: record.smile_at_dark_rating,
    },
    'Story Engagement': {
      number: record.story_engagement,
    },
    'Overall Quest and Story rating': {
      number: record.overall_quest_story_rating,
    },
    '1️⃣ Respondent Info': {
      relation: [], // Could link to Respondent Info if needed
    },
  }

  await notion.pages.create({
    parent: { database_id: databaseId },
    properties: properties,
  })
}

/**
 * Sync to Overall Feelings database
 */
async function syncToOverallFeelings(notion, databaseId, record) {
  const properties = {
    'Name': {
      title: [{ text: { content: record.discord_name || 'New submission' } }],
    },
    'Overall Score Post CU1': {
      number: record.overall_score_post_cu1,
    },
    'Open feedback space': {
      rich_text: record.open_feedback_space ? [{ text: { content: record.open_feedback_space } }] : [],
    },
    'Respondent Info': {
      relation: [], // Could link to Respondent Info if needed
    },
  }

  await notion.pages.create({
    parent: { database_id: databaseId },
    properties: properties,
  })
}
