-- Delete activities keeping only the 5 most recent per track based on created_at
WITH activities_to_keep AS (
  SELECT id
  FROM (
    SELECT id, track_id,
           ROW_NUMBER() OVER (PARTITION BY track_id ORDER BY created_at DESC) as rn
    FROM activities
  ) ranked
  WHERE rn <= 5
)
DELETE FROM activities 
WHERE id NOT IN (SELECT id FROM activities_to_keep);