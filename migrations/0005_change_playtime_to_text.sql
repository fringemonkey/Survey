-- Migration to change playtime from INTEGER to TEXT
-- This allows storing playtime ranges like "26-50" instead of just integers
--
-- NOTE: D1 doesn't support ALTER COLUMN directly, so we need to recreate the table

-- Create temporary table with updated schema (playtime is now TEXT)
CREATE TABLE IF NOT EXISTS survey_responses_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  -- Respondent Info
  discord_name TEXT, -- Optional, no longer collected
  age INTEGER, -- Now nullable for hardware surveys
  cpu TEXT,
  gpu TEXT,
  playtime TEXT, -- Changed from INTEGER to TEXT to store ranges like "26-50"
  ram TEXT,
  tos INTEGER NOT NULL DEFAULT 0, -- checkbox: 0 = No, 1 = Yes
  response_id TEXT UNIQUE, -- Generated: TLC-CU1-{id}
  storage TEXT,
  
  -- Performance and Stability (Required)
  avg_fps_pre_cu1 INTEGER,
  avg_fps_post_cu1 INTEGER,
  pre_cu1_vs_post TEXT, -- Better/Worse/Same
  overall_client_stability INTEGER, -- Rating 1-5
  common_bugs_experienced TEXT, -- JSON array of selected bugs
  crashes_per_session INTEGER,
  quest_bugs_experienced INTEGER DEFAULT 0, -- 0 = No, 1 = Yes
  which_quest_poi TEXT,
  
  -- Bug-specific fields (conditional based on common_bugs_experienced)
  -- Boat1
  posted_about_issues_boat1 TEXT, -- multi-select as JSON array
  method_used_to_resolve_boat1 TEXT,
  was_it_resolved_boat1 INTEGER DEFAULT 0,
  link_to_post_boat1 TEXT,
  
  -- Boat2
  posted_about_issues_boat2 TEXT,
  method_used_to_resolve_boat2 TEXT,
  was_it_resolved_boat2 INTEGER DEFAULT 0,
  link_to_post_boat2 TEXT,
  
  -- Elevator
  posted_about_issues_elevator TEXT,
  method_used_to_resolve_elevator TEXT,
  was_it_resolved_elevator INTEGER DEFAULT 0,
  what_poi_elevator TEXT,
  link_to_post_elevator TEXT,
  
  -- Sliding
  posted_about_issues_sliding TEXT,
  was_it_resolved_sliding INTEGER DEFAULT 0,
  picture_sliding TEXT, -- URL or file reference
  link_to_post_sliding TEXT,
  
  -- Q-Laz quest bug
  resolved_q_laz INTEGER DEFAULT 0,
  
  -- Additional performance data
  additional_data TEXT, -- textarea
  
  -- Quests and Story (Optional)
  quest_progress TEXT,
  pre_cu1_quests_rating INTEGER, -- Rating 1-5
  mother_rating INTEGER,
  the_one_before_me_rating INTEGER,
  the_warehouse_rating INTEGER,
  whispers_within_rating INTEGER,
  smile_at_dark_rating INTEGER,
  story_engagement INTEGER, -- Rating 1-5
  overall_quest_story_rating INTEGER,
  
  -- Overall Feelings (Optional)
  overall_score_post_cu1 INTEGER, -- Rating 1-5
  open_feedback_space TEXT, -- textarea
  
  -- Metadata
  submitted_at TEXT NOT NULL,
  synced_to_notion INTEGER NOT NULL DEFAULT 0,
  synced_at TEXT
);

-- Copy data from old table to new table
-- Convert existing INTEGER playtime values to TEXT (cast to string)
-- Note: storage column may not exist in old table, so we'll set it to NULL
INSERT INTO survey_responses_new 
SELECT 
  id,
  discord_name,
  age,
  cpu,
  gpu,
  CASE WHEN playtime IS NULL THEN NULL ELSE CAST(playtime AS TEXT) END as playtime,
  ram,
  tos,
  response_id,
  NULL as storage, -- Storage may not exist in old table, set to NULL
  avg_fps_pre_cu1,
  avg_fps_post_cu1,
  pre_cu1_vs_post,
  overall_client_stability,
  common_bugs_experienced,
  crashes_per_session,
  quest_bugs_experienced,
  which_quest_poi,
  posted_about_issues_boat1,
  method_used_to_resolve_boat1,
  was_it_resolved_boat1,
  link_to_post_boat1,
  posted_about_issues_boat2,
  method_used_to_resolve_boat2,
  was_it_resolved_boat2,
  link_to_post_boat2,
  posted_about_issues_elevator,
  method_used_to_resolve_elevator,
  was_it_resolved_elevator,
  what_poi_elevator,
  link_to_post_elevator,
  posted_about_issues_sliding,
  was_it_resolved_sliding,
  picture_sliding,
  link_to_post_sliding,
  resolved_q_laz,
  additional_data,
  quest_progress,
  pre_cu1_quests_rating,
  mother_rating,
  the_one_before_me_rating,
  the_warehouse_rating,
  whispers_within_rating,
  smile_at_dark_rating,
  story_engagement,
  overall_quest_story_rating,
  overall_score_post_cu1,
  open_feedback_space,
  submitted_at,
  synced_to_notion,
  synced_at
FROM survey_responses;

-- Drop old table
DROP TABLE IF EXISTS survey_responses;

-- Rename new table to original name
ALTER TABLE survey_responses_new RENAME TO survey_responses;

-- Recreate indexes
CREATE INDEX IF NOT EXISTS idx_synced_to_notion ON survey_responses(synced_to_notion, submitted_at);
CREATE INDEX IF NOT EXISTS idx_response_id ON survey_responses(response_id);

