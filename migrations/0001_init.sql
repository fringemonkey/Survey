-- Create survey_responses table matching Notion database structure
CREATE TABLE IF NOT EXISTS survey_responses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  -- Respondent Info (Required)
  discord_name TEXT NOT NULL,
  age INTEGER NOT NULL,
  cpu TEXT,
  gpu TEXT,
  playtime INTEGER, -- hours
  ram TEXT,
  tos INTEGER NOT NULL DEFAULT 0, -- checkbox: 0 = No, 1 = Yes
  response_id TEXT UNIQUE, -- Generated: TLC-CU1-{id}
  
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

-- Create index for faster syncing queries
CREATE INDEX IF NOT EXISTS idx_synced_to_notion ON survey_responses(synced_to_notion, submitted_at);

-- Create index for response ID lookups
CREATE INDEX IF NOT EXISTS idx_response_id ON survey_responses(response_id);
