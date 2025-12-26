/**
 * Cloudflare Pages Function to handle dashboard data requests
 * Returns aggregate statistics and user-specific data
 */

export async function onRequestGet(context) {
  const { request, env } = context
  
  try {
    const url = new URL(request.url)
    const type = url.searchParams.get('type') || 'overall'
    const userDiscordName = url.searchParams.get('user') || null
    
    const db = env.DB
    
    // Check if database is available
    if (!db) {
      console.error('D1 database binding not found. Check Cloudflare Pages Settings → Functions → D1 Database bindings.')
      return new Response(
        JSON.stringify({ 
          error: 'Database Configuration Error', 
          message: 'D1 database binding is not configured. Please check Cloudflare Pages Settings → Functions → D1 Database bindings and ensure the binding name is "DB".'
        }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        }
      )
    }
    
    // Test database connection and verify table exists
    try {
      const testQuery = await db.prepare('SELECT name FROM sqlite_master WHERE type="table" AND name="survey_responses"').first()
      if (!testQuery) {
        console.error('survey_responses table not found in database')
        return new Response(
          JSON.stringify({ 
            error: 'Database Schema Error', 
            message: 'Database table "survey_responses" not found. Please run the migration: wrangler d1 execute tlc-survey-db --file=./migrations/0001_init.sql'
          }),
          { 
            status: 500,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
          }
        )
      }
    } catch (testError) {
      console.error('Database connection test failed:', testError)
      return new Response(
        JSON.stringify({ 
          error: 'Database Connection Error', 
          message: `Unable to connect to database: ${testError.message}. Please verify the database binding is configured correctly.`
        }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        }
      )
    }
    
    if (type === 'overall') {
      // Get overall statistics (no personal data)
      const stats = await getOverallStats(db)
      return new Response(
        JSON.stringify(stats),
        { 
          status: 200,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          } 
        }
      )
    } else if (type === 'user' && userDiscordName) {
      // Get user-specific data for comparison
      const userData = await getUserData(db, userDiscordName)
      const overallStats = await getOverallStats(db)
      return new Response(
        JSON.stringify({ user: userData, overall: overallStats }),
        { 
          status: 200,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          } 
        }
      )
    } else if (type === 'fields') {
      // Get available fields for report builder
      const fields = getAvailableFields()
      return new Response(
        JSON.stringify(fields),
        { 
          status: 200,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          } 
        }
      )
    } else if (type === 'report') {
      // Generate custom report
      const field1 = url.searchParams.get('field1')
      const field2 = url.searchParams.get('field2')
      const filter = url.searchParams.get('filter') || null
      
      if (!field1 || !field2) {
        return new Response(
          JSON.stringify({ error: 'field1 and field2 are required' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        )
      }
      
      const report = await generateReport(db, field1, field2, filter, userDiscordName)
      return new Response(
        JSON.stringify(report),
        { 
          status: 200,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          } 
        }
      )
    }
    
    return new Response(
      JSON.stringify({ error: 'Invalid request type' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error processing dashboard request:', error)
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    
    // Provide more helpful error messages for common issues
    let errorMessage = 'An error occurred while processing your request. Please try again later.'
    let errorType = 'Internal server error'
    
    const errorMsg = error.message || ''
    
    if (errorMsg.includes('Database not available') || errorMsg.includes('D1')) {
      errorType = 'Database Configuration Error'
      errorMessage = 'D1 database binding is not configured. Please check Cloudflare Pages Settings → Functions → D1 Database bindings.'
    } else if (errorMsg.includes('no such table') || errorMsg.includes('no such column')) {
      errorType = 'Database Schema Error'
      errorMessage = 'Database table or column not found. Please run the migration: wrangler d1 execute tlc-survey-db --file=./migrations/0001_init.sql'
    } else if (errorMsg.includes('syntax error')) {
      errorType = 'Database Query Error'
      errorMessage = 'Database query syntax error. Please check the server logs for details.'
    } else if (errorMsg.length > 0 && errorMsg.length < 200) {
      // Include the error message if it's short and doesn't contain sensitive info
      errorMessage = errorMsg
    }
    
    return new Response(
      JSON.stringify({ 
        error: errorType,
        message: errorMessage
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
 * Get overall statistics (aggregated, no personal data)
 */
async function getOverallStats(db) {
  try {
    const totalResponses = await db.prepare(
      'SELECT COUNT(*) as count FROM survey_responses'
    ).first()
    
    const avgFpsPre = await db.prepare(
      'SELECT AVG(avg_fps_pre_cu1) as avg FROM survey_responses WHERE avg_fps_pre_cu1 IS NOT NULL'
    ).first()
    
    const avgFpsPost = await db.prepare(
      'SELECT AVG(avg_fps_post_cu1) as avg FROM survey_responses WHERE avg_fps_post_cu1 IS NOT NULL'
    ).first()
    
    const performanceComparison = await db.prepare(
      'SELECT pre_cu1_vs_post, COUNT(*) as count FROM survey_responses WHERE pre_cu1_vs_post IS NOT NULL GROUP BY pre_cu1_vs_post'
    ).all()
    
    const avgStability = await db.prepare(
      'SELECT AVG(overall_client_stability) as avg FROM survey_responses WHERE overall_client_stability IS NOT NULL'
    ).first()
    
    const avgOverallScore = await db.prepare(
      'SELECT AVG(overall_score_post_cu1) as avg FROM survey_responses WHERE overall_score_post_cu1 IS NOT NULL'
    ).first()
    
    const avgCrashes = await db.prepare(
      'SELECT AVG(crashes_per_session) as avg FROM survey_responses WHERE crashes_per_session IS NOT NULL'
    ).first()
    
    // Bug statistics
    const bugStats = await getBugStatistics(db)
    
    // Quest ratings
    const questRatings = await getQuestRatings(db)
    
    // Hardware distribution
    const hardwareStats = await getHardwareStats(db)
    
    return {
      totalResponses: totalResponses?.count || 0,
      avgFpsPre: Math.round(avgFpsPre?.avg || 0),
      avgFpsPost: Math.round(avgFpsPost?.avg || 0),
      performanceComparison: performanceComparison?.results || [],
      avgStability: Math.round((avgStability?.avg || 0) * 10) / 10,
      avgOverallScore: Math.round((avgOverallScore?.avg || 0) * 10) / 10,
      avgCrashes: Math.round((avgCrashes?.avg || 0) * 10) / 10,
      bugStats: bugStats || {},
      questRatings: questRatings || {},
      hardwareStats: hardwareStats || { topCpus: [], topGpus: [], topRams: [], avgPlaytime: 0 },
    }
  } catch (error) {
    console.error('Error in getOverallStats:', error)
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    throw error
  }
}

/**
 * Get bug statistics
 */
async function getBugStatistics(db) {
  try {
    const allBugs = await db.prepare(
      'SELECT common_bugs_experienced FROM survey_responses WHERE common_bugs_experienced IS NOT NULL'
    ).all()
    
    const bugCounts = {}
    const bugNames = ['Boat Stuck', 'Boat Sinking/Flying', 'Sliding buildings on boat', 'Elevator issues', 'Other']
    
    bugNames.forEach(bug => bugCounts[bug] = 0)
    
    if (allBugs?.results && Array.isArray(allBugs.results)) {
      allBugs.results.forEach(row => {
        try {
          const bugs = JSON.parse(row.common_bugs_experienced || '[]')
          if (Array.isArray(bugs)) {
            bugs.forEach(bug => {
              if (bugCounts.hasOwnProperty(bug)) {
                bugCounts[bug]++
              }
            })
          }
        } catch (e) {
          // Skip invalid JSON
        }
      })
    }
    
    return bugCounts
  } catch (error) {
    console.error('Error in getBugStatistics:', error)
    // Return empty bug counts on error
    return {
      'Boat Stuck': 0,
      'Boat Sinking/Flying': 0,
      'Sliding buildings on boat': 0,
      'Elevator issues': 0,
      'Other': 0
    }
  }
}

/**
 * Get quest ratings
 */
async function getQuestRatings(db) {
  try {
    const quests = [
      { field: 'pre_cu1_quests_rating', name: 'Pre CU1 Quests' },
      { field: 'mother_rating', name: 'Mother' },
      { field: 'the_one_before_me_rating', name: 'The One Before Me' },
      { field: 'the_warehouse_rating', name: 'The Warehouse' },
      { field: 'whispers_within_rating', name: 'Whispers Within' },
      { field: 'smile_at_dark_rating', name: 'Smile at Dark' },
      { field: 'story_engagement', name: 'Story Engagement' },
      { field: 'overall_quest_story_rating', name: 'Overall Quest/Story' },
    ]
    
    const ratings = {}
    
    for (const quest of quests) {
      try {
        const result = await db.prepare(
          `SELECT AVG(${quest.field}) as avg FROM survey_responses WHERE ${quest.field} IS NOT NULL`
        ).first()
        ratings[quest.name] = Math.round((result?.avg || 0) * 10) / 10
      } catch (error) {
        console.error(`Error fetching quest rating for ${quest.name}:`, error)
        ratings[quest.name] = 0
      }
    }
    
    return ratings
  } catch (error) {
    console.error('Error in getQuestRatings:', error)
    return {}
  }
}

/**
 * Get hardware statistics
 */
async function getHardwareStats(db) {
  try {
    const cpuStats = await db.prepare(
      'SELECT cpu, COUNT(*) as count FROM survey_responses WHERE cpu IS NOT NULL GROUP BY cpu ORDER BY count DESC LIMIT 10'
    ).all()
    
    const gpuStats = await db.prepare(
      'SELECT gpu, COUNT(*) as count FROM survey_responses WHERE gpu IS NOT NULL GROUP BY gpu ORDER BY count DESC LIMIT 10'
    ).all()
    
    const ramStats = await db.prepare(
      'SELECT ram, COUNT(*) as count FROM survey_responses WHERE ram IS NOT NULL GROUP BY ram ORDER BY count DESC LIMIT 10'
    ).all()
    
    const avgPlaytime = await db.prepare(
      'SELECT AVG(playtime) as avg FROM survey_responses WHERE playtime IS NOT NULL'
    ).first()
    
    return {
      topCpus: cpuStats?.results || [],
      topGpus: gpuStats?.results || [],
      topRams: ramStats?.results || [],
      avgPlaytime: Math.round(avgPlaytime?.avg || 0),
    }
  } catch (error) {
    console.error('Error in getHardwareStats:', error)
    return {
      topCpus: [],
      topGpus: [],
      topRams: [],
      avgPlaytime: 0
    }
  }
}

/**
 * Get user-specific data
 */
async function getUserData(db, discordName) {
  try {
    const userData = await db.prepare(
      'SELECT * FROM survey_responses WHERE discord_name = ? ORDER BY submitted_at DESC LIMIT 1'
    ).bind(discordName).first()
    
    if (!userData) {
      return null
    }
    
    // Remove discord_name from response for privacy
    const { discord_name, ...data } = userData
    return data
  } catch (error) {
    console.error('Error in getUserData:', error)
    return null
  }
}

/**
 * Get available fields for report builder
 */
function getAvailableFields() {
  return {
    performance: [
      { value: 'avg_fps_pre_cu1', label: 'Average FPS Pre CU1', type: 'number' },
      { value: 'avg_fps_post_cu1', label: 'Average FPS Post CU1', type: 'number' },
      { value: 'pre_cu1_vs_post', label: 'Performance Comparison', type: 'category' },
      { value: 'overall_client_stability', label: 'Client Stability Rating', type: 'number' },
      { value: 'crashes_per_session', label: 'Crashes Per Session', type: 'number' },
    ],
    quests: [
      { value: 'pre_cu1_quests_rating', label: 'Pre CU1 Quests Rating', type: 'number' },
      { value: 'mother_rating', label: 'Mother Quest Rating', type: 'number' },
      { value: 'the_one_before_me_rating', label: 'The One Before Me Rating', type: 'number' },
      { value: 'the_warehouse_rating', label: 'The Warehouse Rating', type: 'number' },
      { value: 'whispers_within_rating', label: 'Whispers Within Rating', type: 'number' },
      { value: 'smile_at_dark_rating', label: 'Smile at Dark Rating', type: 'number' },
      { value: 'story_engagement', label: 'Story Engagement', type: 'number' },
      { value: 'overall_quest_story_rating', label: 'Overall Quest/Story Rating', type: 'number' },
    ],
    hardware: [
      { value: 'cpu', label: 'CPU', type: 'category' },
      { value: 'gpu', label: 'GPU', type: 'category' },
      { value: 'ram', label: 'RAM', type: 'category' },
      { value: 'playtime', label: 'Playtime (hours)', type: 'number' },
    ],
    overall: [
      { value: 'overall_score_post_cu1', label: 'Overall Score Post CU1', type: 'number' },
      { value: 'age', label: 'Age', type: 'number' },
    ],
  }
}

/**
 * Generate custom report comparing two fields
 */
async function generateReport(db, field1, field2, filter, userDiscordName) {
  // Security: Never allow discord_name to be selected in reports
  if (field1 === 'discord_name' || field2 === 'discord_name') {
    throw new Error('Discord names cannot be included in reports for privacy reasons')
  }
  
  // Validate fields are from allowed list (prevent SQL injection)
  const allowedFields = getAvailableFields()
  const allFields = [
    ...allowedFields.performance,
    ...allowedFields.quests,
    ...allowedFields.hardware,
    ...allowedFields.overall,
  ].map(f => f.value)
  
  if (!allFields.includes(field1) || !allFields.includes(field2)) {
    throw new Error('Invalid field selected')
  }
  
  // Build query - exclude discord_name from results
  let query = `SELECT ${field1}, ${field2}, COUNT(*) as count`
  
  if (userDiscordName) {
    query += `, CASE WHEN discord_name = ? THEN 1 ELSE 0 END as is_user`
  }
  
  query += ` FROM survey_responses WHERE ${field1} IS NOT NULL AND ${field2} IS NOT NULL`
  
  const params = []
  if (userDiscordName) {
    params.push(userDiscordName)
  }
  
  if (filter) {
    // Add filter logic if needed (should be validated separately)
    query += ` AND ${filter}`
  }
  
  query += ` GROUP BY ${field1}, ${field2}`
  
  const result = await db.prepare(query).bind(...params).all()
  
  return {
    field1,
    field2,
    data: result.results || [],
    total: result.results?.reduce((sum, row) => sum + (row.count || 0), 0) || 0,
  }
}

