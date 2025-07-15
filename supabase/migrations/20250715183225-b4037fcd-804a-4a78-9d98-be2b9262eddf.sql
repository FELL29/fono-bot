-- Expand children table with all assessment fields
ALTER TABLE public.children ADD COLUMN IF NOT EXISTS parent_name text;
ALTER TABLE public.children ADD COLUMN IF NOT EXISTS hearing_ok text;
ALTER TABLE public.children ADD COLUMN IF NOT EXISTS articulation_issue text[];
ALTER TABLE public.children ADD COLUMN IF NOT EXISTS oral_motor text[];
ALTER TABLE public.children ADD COLUMN IF NOT EXISTS follow_commands text;
ALTER TABLE public.children ADD COLUMN IF NOT EXISTS joint_attention text;
ALTER TABLE public.children ADD COLUMN IF NOT EXISTS sensory_issue text[];
ALTER TABLE public.children ADD COLUMN IF NOT EXISTS screen_time smallint;
ALTER TABLE public.children ADD COLUMN IF NOT EXISTS home_language text;
ALTER TABLE public.children ADD COLUMN IF NOT EXISTS frequency_pref text;

-- Add generated tags for future use
ALTER TABLE public.children ADD COLUMN IF NOT EXISTS tag_motricidade boolean DEFAULT false;
ALTER TABLE public.children ADD COLUMN IF NOT EXISTS tag_oral_motor boolean DEFAULT false;
ALTER TABLE public.children ADD COLUMN IF NOT EXISTS tag_joint_attention boolean DEFAULT false;
ALTER TABLE public.children ADD COLUMN IF NOT EXISTS tag_noise boolean DEFAULT false;

-- Update the get_track_for_child function to handle age in months
CREATE OR REPLACE FUNCTION public.get_track_for_child(p_child_profile child_profile, p_child_age smallint)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  age_range_str text;
  profile_str text;
  track_uuid UUID;
BEGIN
  -- Convert months to age ranges
  CASE 
    WHEN p_child_age BETWEEN 12 AND 47 THEN age_range_str := '1_3';
    WHEN p_child_age BETWEEN 48 AND 83 THEN age_range_str := '4_6';
    WHEN p_child_age BETWEEN 84 AND 131 THEN age_range_str := '7_10';
    WHEN p_child_age BETWEEN 132 AND 168 THEN age_range_str := '11_14';
    ELSE age_range_str := '1_3'; -- default
  END CASE;
  
  -- Build profile string (convert enum names to track naming)
  CASE 
    WHEN p_child_profile = 'Criança típica' THEN profile_str := 'TIPICO';
    WHEN p_child_profile = 'Atraso ou disfunção de fala' THEN profile_str := 'ATRASO';
    WHEN p_child_profile = 'TEA' THEN profile_str := 'TEA';
    WHEN p_child_profile = 'Síndrome de Down' THEN profile_str := 'DOWN';
    ELSE profile_str := 'TIPICO'; -- default
  END CASE;
  
  profile_str := profile_str || '_' || age_range_str;
  
  -- Get track ID
  SELECT id INTO track_uuid 
  FROM public.tracks 
  WHERE profile = profile_str 
  LIMIT 1;
  
  RETURN track_uuid;
END;
$function$;

-- Update child_profile enum to match new options
DROP TYPE IF EXISTS child_profile CASCADE;
CREATE TYPE child_profile AS ENUM ('Criança típica', 'Atraso ou disfunção de fala', 'TEA', 'Síndrome de Down');

-- Update speech_level enum to match new options
DROP TYPE IF EXISTS speech_level CASCADE;
CREATE TYPE speech_level AS ENUM ('Não verbal', 'Emite sons / sílabas', 'Fala 10‑50 palavras', 'Frases de 2‑3 palavras', 'Frases completas');

-- Update comprehension_level enum to match new options  
DROP TYPE IF EXISTS comprehension_level CASCADE;
CREATE TYPE comprehension_level AS ENUM ('Entende quase tudo', 'Entende ordens simples', 'Entende muito pouco', 'Responde só a pistas visuais');