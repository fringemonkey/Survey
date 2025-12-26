-- Migration to add individual bug columns as binary yes/no fields
-- This replaces the JSON array in common_bugs_experienced with individual columns

-- Add individual bug columns
ALTER TABLE survey_responses ADD COLUMN bug_none INTEGER DEFAULT 0;
ALTER TABLE survey_responses ADD COLUMN bug_boat_stuck INTEGER DEFAULT 0;
ALTER TABLE survey_responses ADD COLUMN bug_boat_sinking INTEGER DEFAULT 0;
ALTER TABLE survey_responses ADD COLUMN bug_sliding_buildings INTEGER DEFAULT 0;
ALTER TABLE survey_responses ADD COLUMN bug_elevator INTEGER DEFAULT 0;
ALTER TABLE survey_responses ADD COLUMN bug_quest INTEGER DEFAULT 0;
ALTER TABLE survey_responses ADD COLUMN bug_other INTEGER DEFAULT 0;
ALTER TABLE survey_responses ADD COLUMN bug_other_text TEXT;

