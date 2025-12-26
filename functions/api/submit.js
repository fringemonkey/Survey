/**
 * Cloudflare Pages Function to handle survey submissions
 * Stores data in D1 database
 */

export async function onRequestPost(context) {
  const { request, env } = context
  
  try {
    const formData = await request.json()
    const surveyType = formData.surveyType || 'full'
    
    // Handle hardware survey (required, no age/tos needed)
    if (surveyType === 'hardware') {
      // Generate response ID
      const responseId = await generateResponseId(env.DB)

      // Insert hardware data (no age/tos required)
      const result = await env.DB.prepare(
        `INSERT INTO survey_responses (
          discord_name, age, cpu, gpu, ram, tos, response_id, storage, submitted_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        null,
        null, // age not required for hardware survey
        formData.cpu || null,
        formData.gpu || null,
        formData.ram || null,
        0, // tos not required for hardware survey
        responseId,
        formData.storage || null,
        new Date().toISOString()
      ).run()

      return new Response(
        JSON.stringify({ 
          success: true, 
          id: result.meta.last_row_id,
          responseId: responseId
        }),
        { 
          status: 200,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          } 
        }
      )
    }
    
    // Handle personal data survey (optional, requires age/tos)
    if (surveyType === 'personal') {
      // Validate required fields for personal data survey
      if (!formData.age || !formData.tos) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields: Age and TOS agreement are required' }),
          { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
        )
      }

      // Validate age
      const age = parseInt(formData.age)
      if (isNaN(age) || age < 16) {
        return new Response(
          JSON.stringify({ error: 'Age must be 16 or older' }),
          { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
        )
      }

      // Generate response ID
      const responseId = await generateResponseId(env.DB)

      // Insert personal data
      const result = await env.DB.prepare(
        `INSERT INTO survey_responses (
          discord_name, age, cpu, gpu, ram, tos, response_id, playtime, submitted_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        formData.discordName || null,
        age,
        null, // no hardware data
        null,
        null,
        formData.tos ? 1 : 0,
        responseId,
        formData.playtime || null,
        new Date().toISOString()
      ).run()

      return new Response(
        JSON.stringify({ 
          success: true, 
          id: result.meta.last_row_id,
          responseId: responseId
        }),
        { 
          status: 200,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          } 
        }
      )
    }
    
    // Handle performance survey (required, no age/tos needed)
    if (surveyType === 'performance') {
      // Generate response ID
      const responseId = await generateResponseId(env.DB)

      // Insert performance data
      const result = await env.DB.prepare(
        `INSERT INTO survey_responses (
          discord_name, age, cpu, gpu, ram, tos, response_id, storage,
          avg_fps_pre_cu1, avg_fps_post_cu1, pre_cu1_vs_post, overall_client_stability,
          submitted_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        null,
        null, // age not required
        null, // no hardware data
        null,
        null,
        0, // tos not required
        responseId,
        null,
        formData.avgFpsPreCu1 || null,
        formData.avgFpsPostCu1 || null,
        formData.performanceChange || null,
        formData.overallStability ? parseInt(formData.overallStability) : null,
        new Date().toISOString()
      ).run()

      return new Response(
        JSON.stringify({ 
          success: true, 
          id: result.meta.last_row_id,
          responseId: responseId
        }),
        { 
          status: 200,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          } 
        }
      )
    }
    
    // Handle bug survey (optional, no age/tos needed)
    if (surveyType === 'bug') {
      // Generate response ID
      const responseId = await generateResponseId(env.DB)

      // Insert bug data with individual binary columns
      const result = await env.DB.prepare(
        `INSERT INTO survey_responses (
          discord_name, age, cpu, gpu, ram, tos, response_id, storage,
          bug_none, bug_boat_stuck, bug_boat_sinking, bug_sliding_buildings,
          bug_elevator, bug_quest, bug_other, bug_other_text,
          crashes_per_session, additional_data, submitted_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        null,
        null, // age not required
        null, // no hardware data
        null,
        null,
        0, // tos not required
        responseId,
        null,
        formData.bugNone ? 1 : 0,
        formData.bugBoatStuck ? 1 : 0,
        formData.bugBoatSinking ? 1 : 0,
        formData.bugSlidingBuildings ? 1 : 0,
        formData.bugElevator ? 1 : 0,
        formData.bugQuest ? 1 : 0,
        formData.bugOther ? 1 : 0,
        formData.bugOtherText || null,
        formData.crashesPerSession || null,
        JSON.stringify({
          bugFrequency: formData.bugFrequency || null,
          bugImpact: formData.bugImpact || null,
          resolved: formData.resolved || null,
        }),
        new Date().toISOString()
      ).run()

      return new Response(
        JSON.stringify({ 
          success: true, 
          id: result.meta.last_row_id,
          responseId: responseId
        }),
        { 
          status: 200,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          } 
        }
      )
    }
    
    // Handle quest survey (optional, no age/tos needed)
    if (surveyType === 'quest') {
      // Generate response ID
      const responseId = await generateResponseId(env.DB)

      // Insert quest data
      const result = await env.DB.prepare(
        `INSERT INTO survey_responses (
          discord_name, age, cpu, gpu, ram, tos, response_id, storage,
          quest_progress, pre_cu1_quests_rating, overall_quest_story_rating,
          quest_bugs_experienced, additional_data, submitted_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        null,
        null, // age not required
        null, // no hardware data
        null,
        null,
        0, // tos not required
        responseId,
        null,
        formData.questProgress || null,
        formData.preCu1QuestsRating ? parseInt(formData.preCu1QuestsRating) : null,
        formData.overallQuestRating ? parseInt(formData.overallQuestRating) : null,
        formData.questBugs && formData.questBugs !== 'no' ? 1 : 0,
        formData.favoriteQuest || null, // Store favorite quest in additional_data field
        new Date().toISOString()
      ).run()

      return new Response(
        JSON.stringify({ 
          success: true, 
          id: result.meta.last_row_id,
          responseId: responseId
        }),
        { 
          status: 200,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          } 
        }
      )
    }
    
    // Handle story survey (optional, no age/tos needed)
    if (surveyType === 'story') {
      // Generate response ID
      const responseId = await generateResponseId(env.DB)

      // Insert story data
      const result = await env.DB.prepare(
        `INSERT INTO survey_responses (
          discord_name, age, cpu, gpu, ram, tos, response_id, storage,
          story_engagement, overall_quest_story_rating, overall_score_post_cu1,
          additional_data, submitted_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        null,
        null, // age not required
        null, // no hardware data
        null,
        null,
        0, // tos not required
        responseId,
        null,
        formData.storyEngagement ? parseInt(formData.storyEngagement) : null,
        formData.overallStoryRating ? parseInt(formData.overallStoryRating) : null,
        formData.overallScore ? parseInt(formData.overallScore) : null,
        JSON.stringify({
          storyPacing: formData.storyPacing ? parseInt(formData.storyPacing) : null,
          characterDevelopment: formData.characterDevelopment ? parseInt(formData.characterDevelopment) : null,
        }),
        new Date().toISOString()
      ).run()

      return new Response(
        JSON.stringify({ 
          success: true, 
          id: result.meta.last_row_id,
          responseId: responseId
        }),
        { 
          status: 200,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          } 
        }
      )
    }
    
    // Handle optional surveys - they need to be linked to an existing hardware submission
    // For now, we'll create a new record for each optional survey
    // In a production system, you'd want to link them via response_id
    
    // For backward compatibility, handle full form submission
    if (!formData.age || !formData.tos) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: Age and TOS agreement are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      )
    }

    // Validate age
    const age = parseInt(formData.age)
    if (isNaN(age) || age < 16) {
      return new Response(
        JSON.stringify({ error: 'Age must be 16 or older' }),
        { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      )
    }

    // For optional surveys, we still need age/tos but don't require performance data
    // Generate response ID
    const responseId = await generateResponseId(env.DB)

    // Prepare data for insertion
    const insertData = {
      discord_name: null, // No longer collected
      age: age,
      cpu: formData.cpu || null,
      gpu: formData.gpu || null,
      playtime: formData.playtime ? (typeof formData.playtime === 'string' ? formData.playtime : parseInt(formData.playtime)) : null,
      ram: formData.ram || null,
      storage: formData.storage || null,
      tos: formData.tos ? 1 : 0,
      response_id: responseId,
      
      // Performance and Stability (optional for modular surveys)
      avg_fps_pre_cu1: formData.avgFpsPreCu1 ? (typeof formData.avgFpsPreCu1 === 'string' ? formData.avgFpsPreCu1 : parseInt(formData.avgFpsPreCu1)) : null,
      avg_fps_post_cu1: formData.avgFpsPostCu1 ? (typeof formData.avgFpsPostCu1 === 'string' ? formData.avgFpsPostCu1 : parseInt(formData.avgFpsPostCu1)) : null,
      pre_cu1_vs_post: formData.preCu1VsPost || formData.performanceChange || null,
      overall_client_stability: formData.overallClientStability || formData.overallStability ? parseInt(formData.overallClientStability || formData.overallStability) : null,
      common_bugs_experienced: formData.commonBugsExperienced ? JSON.stringify(formData.commonBugsExperienced) : (formData.bugsExperienced ? JSON.stringify([formData.bugsExperienced]) : null),
      crashes_per_session: formData.crashesPerSession ? (typeof formData.crashesPerSession === 'string' ? formData.crashesPerSession : parseInt(formData.crashesPerSession)) : null,
      quest_bugs_experienced: formData.questBugsExperienced ? 1 : (formData.questBugs ? (formData.questBugs !== 'no' ? 1 : 0) : 0),
      which_quest_poi: formData.whichQuestPoi || null,
      
      // Bug-specific fields
      posted_about_issues_boat1: JSON.stringify(formData.postedAboutIssuesBoat1 || []),
      method_used_to_resolve_boat1: formData.methodUsedToResolveBoat1 || null,
      was_it_resolved_boat1: formData.wasItResolvedBoat1 ? 1 : 0,
      link_to_post_boat1: formData.linkToPostBoat1 || null,
      
      posted_about_issues_boat2: JSON.stringify(formData.postedAboutIssuesBoat2 || []),
      method_used_to_resolve_boat2: formData.methodUsedToResolveBoat2 || null,
      was_it_resolved_boat2: formData.wasItResolvedBoat2 ? 1 : 0,
      link_to_post_boat2: formData.linkToPostBoat2 || null,
      
      posted_about_issues_elevator: JSON.stringify(formData.postedAboutIssuesElevator || []),
      method_used_to_resolve_elevator: formData.methodUsedToResolveElevator || null,
      was_it_resolved_elevator: formData.wasItResolvedElevator ? 1 : 0,
      what_poi_elevator: formData.whatPoiElevator || null,
      link_to_post_elevator: formData.linkToPostElevator || null,
      
      posted_about_issues_sliding: JSON.stringify(formData.postedAboutIssuesSliding || []),
      was_it_resolved_sliding: formData.wasItResolvedSliding ? 1 : 0,
      picture_sliding: formData.pictureSliding || null,
      link_to_post_sliding: formData.linkToPostSliding || null,
      
      resolved_q_laz: formData.resolvedQLaz ? 1 : 0,
      additional_data: formData.additionalData || null,
      
      // Quests and Story (Optional)
      quest_progress: formData.questProgress || null,
      pre_cu1_quests_rating: formData.preCu1QuestsRating ? parseInt(formData.preCu1QuestsRating) : null,
      mother_rating: formData.motherRating ? parseInt(formData.motherRating) : null,
      the_one_before_me_rating: formData.theOneBeforeMeRating ? parseInt(formData.theOneBeforeMeRating) : null,
      the_warehouse_rating: formData.theWarehouseRating ? parseInt(formData.theWarehouseRating) : null,
      whispers_within_rating: formData.whispersWithinRating ? parseInt(formData.whispersWithinRating) : null,
      smile_at_dark_rating: formData.smileAtDarkRating ? parseInt(formData.smileAtDarkRating) : null,
      story_engagement: formData.storyEngagement ? parseInt(formData.storyEngagement) : null,
      overall_quest_story_rating: formData.overallQuestStoryRating || formData.overallQuestRating ? parseInt(formData.overallQuestStoryRating || formData.overallQuestRating) : null,
      
      // Overall Feelings (Optional)
      overall_score_post_cu1: formData.overallScorePostCu1 || formData.overallScore ? parseInt(formData.overallScorePostCu1 || formData.overallScore) : null,
      open_feedback_space: formData.openFeedbackSpace || null,
      
      submitted_at: new Date().toISOString(),
    }

    // Insert into D1 database
    const result = await env.DB.prepare(
      `INSERT INTO survey_responses (
        discord_name, age, cpu, gpu, playtime, ram, storage, tos, response_id,
        avg_fps_pre_cu1, avg_fps_post_cu1, pre_cu1_vs_post, overall_client_stability,
        common_bugs_experienced, crashes_per_session, quest_bugs_experienced, which_quest_poi,
        posted_about_issues_boat1, method_used_to_resolve_boat1, was_it_resolved_boat1, link_to_post_boat1,
        posted_about_issues_boat2, method_used_to_resolve_boat2, was_it_resolved_boat2, link_to_post_boat2,
        posted_about_issues_elevator, method_used_to_resolve_elevator, was_it_resolved_elevator, what_poi_elevator, link_to_post_elevator,
        posted_about_issues_sliding, was_it_resolved_sliding, picture_sliding, link_to_post_sliding,
        resolved_q_laz, additional_data,
        quest_progress, pre_cu1_quests_rating, mother_rating, the_one_before_me_rating,
        the_warehouse_rating, whispers_within_rating, smile_at_dark_rating, story_engagement, overall_quest_story_rating,
        overall_score_post_cu1, open_feedback_space,
        submitted_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      insertData.discord_name,
      insertData.age,
      insertData.cpu,
      insertData.gpu,
      insertData.playtime,
      insertData.ram,
      insertData.storage,
      insertData.tos,
      insertData.response_id,
      insertData.avg_fps_pre_cu1,
      insertData.avg_fps_post_cu1,
      insertData.pre_cu1_vs_post,
      insertData.overall_client_stability,
      insertData.common_bugs_experienced,
      insertData.crashes_per_session,
      insertData.quest_bugs_experienced,
      insertData.which_quest_poi,
      insertData.posted_about_issues_boat1,
      insertData.method_used_to_resolve_boat1,
      insertData.was_it_resolved_boat1,
      insertData.link_to_post_boat1,
      insertData.posted_about_issues_boat2,
      insertData.method_used_to_resolve_boat2,
      insertData.was_it_resolved_boat2,
      insertData.link_to_post_boat2,
      insertData.posted_about_issues_elevator,
      insertData.method_used_to_resolve_elevator,
      insertData.was_it_resolved_elevator,
      insertData.what_poi_elevator,
      insertData.link_to_post_elevator,
      insertData.posted_about_issues_sliding,
      insertData.was_it_resolved_sliding,
      insertData.picture_sliding,
      insertData.link_to_post_sliding,
      insertData.resolved_q_laz,
      insertData.additional_data,
      insertData.quest_progress,
      insertData.pre_cu1_quests_rating,
      insertData.mother_rating,
      insertData.the_one_before_me_rating,
      insertData.the_warehouse_rating,
      insertData.whispers_within_rating,
      insertData.smile_at_dark_rating,
      insertData.story_engagement,
      insertData.overall_quest_story_rating,
      insertData.overall_score_post_cu1,
      insertData.open_feedback_space,
      insertData.submitted_at
    ).run()

    return new Response(
      JSON.stringify({ 
        success: true, 
        id: result.meta.last_row_id,
        responseId: responseId
      }),
      { 
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        } 
      }
    )
  } catch (error) {
    console.error('Error processing submission:', error)
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    
    // Provide more helpful error messages for common issues
    let errorMessage = 'Internal server error'
    let errorDetails = error.message || 'Unknown error'
    
    // Check for database constraint violations
    if (error.message && (
      error.message.includes('NOT NULL constraint') ||
      error.message.includes('constraint failed') ||
      error.message.includes('UNIQUE constraint')
    )) {
      errorMessage = 'Database constraint error'
      errorDetails = 'A required field is missing or a duplicate entry was detected. Please check your submission data.'
    } else if (error.message && error.message.includes('no such table')) {
      errorMessage = 'Database schema error'
      errorDetails = 'Database table not found. Please run migrations: wrangler d1 execute tlc-survey-db --file=./migrations/0001_init.sql'
    } else if (error.message && error.message.includes('no such column')) {
      errorMessage = 'Database schema error'
      errorDetails = 'Database column not found. Please run migrations to update the schema.'
    } else if (error.message && error.message.length < 200) {
      // Include the error message if it's short and doesn't contain sensitive info
      errorDetails = error.message
    }
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        message: errorDetails
      }),
      { 
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    )
  }
}

/**
 * Generate unique response ID in format TLC-CU1-{number}
 */
async function generateResponseId(db) {
  // Get the highest existing response number
  const result = await db.prepare(
    "SELECT response_id FROM survey_responses WHERE response_id LIKE 'TLC-CU1-%' ORDER BY id DESC LIMIT 1"
  ).first()
  
  if (result && result.response_id) {
    const match = result.response_id.match(/TLC-CU1-(\d+)/)
    if (match) {
      const nextNum = parseInt(match[1]) + 1
      return `TLC-CU1-${nextNum}`
    }
  }
  
  // Start from 1 if no existing responses
  return 'TLC-CU1-1'
}
