/**
 * Cloudflare Pages Function to handle survey submissions
 * Stores data in D1 database
 */

export async function onRequestPost(context) {
  const { request, env } = context
  
  try {
    const formData = await request.json()
    
    // Validate required fields
    if (!formData.discordName || !formData.age || !formData.tos) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: Discord name, age, and TOS agreement are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Validate age
    const age = parseInt(formData.age)
    if (isNaN(age) || age < 16) {
      return new Response(
        JSON.stringify({ error: 'Age must be 16 or older' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Validate Step 2 required fields
    if (!formData.avgFpsPreCu1 || !formData.avgFpsPostCu1 || !formData.preCu1VsPost || !formData.overallClientStability) {
      return new Response(
        JSON.stringify({ error: 'Missing required performance data' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Generate response ID
    const responseId = await generateResponseId(env.DB)

    // Prepare data for insertion
    const insertData = {
      discord_name: formData.discordName,
      age: age,
      cpu: formData.cpu || null,
      gpu: formData.gpu || null,
      playtime: formData.playtime ? parseInt(formData.playtime) : null,
      ram: formData.ram || null,
      tos: formData.tos ? 1 : 0,
      response_id: responseId,
      
      // Performance and Stability
      avg_fps_pre_cu1: parseInt(formData.avgFpsPreCu1),
      avg_fps_post_cu1: parseInt(formData.avgFpsPostCu1),
      pre_cu1_vs_post: formData.preCu1VsPost,
      overall_client_stability: parseInt(formData.overallClientStability),
      common_bugs_experienced: JSON.stringify(formData.commonBugsExperienced || []),
      crashes_per_session: formData.crashesPerSession ? parseInt(formData.crashesPerSession) : null,
      quest_bugs_experienced: formData.questBugsExperienced ? 1 : 0,
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
      overall_quest_story_rating: formData.overallQuestStoryRating ? parseInt(formData.overallQuestStoryRating) : null,
      
      // Overall Feelings (Optional)
      overall_score_post_cu1: formData.overallScorePostCu1 ? parseInt(formData.overallScorePostCu1) : null,
      open_feedback_space: formData.openFeedbackSpace || null,
      
      submitted_at: new Date().toISOString(),
    }

    // Insert into D1 database
    const result = await env.DB.prepare(
      `INSERT INTO survey_responses (
        discord_name, age, cpu, gpu, playtime, ram, tos, response_id,
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
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      insertData.discord_name,
      insertData.age,
      insertData.cpu,
      insertData.gpu,
      insertData.playtime,
      insertData.ram,
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
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
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
