-- First, delete activities for tracks that will be removed
WITH tracks_to_keep AS (
  SELECT id
  FROM (
    SELECT id, profile, age_range,
           ROW_NUMBER() OVER (PARTITION BY profile, age_range ORDER BY created_at DESC) as rn
    FROM tracks
  ) ranked
  WHERE rn = 1
),
activities_to_delete AS (
  SELECT id FROM activities 
  WHERE track_id NOT IN (SELECT id FROM tracks_to_keep)
)
DELETE FROM activities WHERE id IN (SELECT id FROM activities_to_delete);

-- Then delete duplicate tracks, keeping only the most recent one for each profile+age_range combination
WITH tracks_to_keep AS (
  SELECT id
  FROM (
    SELECT id, profile, age_range,
           ROW_NUMBER() OVER (PARTITION BY profile, age_range ORDER BY created_at DESC) as rn
    FROM tracks
  ) ranked
  WHERE rn = 1
)
DELETE FROM tracks 
WHERE id NOT IN (SELECT id FROM tracks_to_keep);