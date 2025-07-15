-- Create custom types
CREATE TYPE user_role AS ENUM ('parent', 'therapist', 'admin');
CREATE TYPE subscription_plan AS ENUM ('TRIAL', 'ESSENCIAL', 'AVANCADO', 'PREMIUM');
CREATE TYPE child_profile AS ENUM ('Típico', 'TEA', 'Down', 'Atraso');
CREATE TYPE speech_level AS ENUM ('Não verbal', 'Palavras isoladas', 'Frases curtas', 'Frases completas');
CREATE TYPE comprehension_level AS ENUM ('Entende tudo', 'Ordens simples', 'Pouco', 'Só pistas visuais');

-- Create profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  parent_name TEXT NOT NULL,
  whatsapp TEXT,
  role user_role DEFAULT 'parent' NOT NULL,
  plan subscription_plan DEFAULT 'TRIAL' NOT NULL,
  trial_end TIMESTAMPTZ DEFAULT (now() + interval '7 days'),
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create children table
CREATE TABLE public.children (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  child_name TEXT NOT NULL,
  child_age SMALLINT NOT NULL CHECK (child_age >= 1 AND child_age <= 14),
  child_profile child_profile NOT NULL,
  speech_level speech_level,
  comprehension_level comprehension_level,
  track_id UUID,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create tracks table
CREATE TABLE public.tracks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  profile TEXT NOT NULL, -- e.g., 'TEA_1-3', 'Típico_4-6'
  age_range TEXT NOT NULL, -- e.g., '1-3', '4-6', '7-10', '11-14'
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create activities table
CREATE TABLE public.activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  track_id UUID REFERENCES public.tracks(id) ON DELETE CASCADE NOT NULL,
  day_index SMALLINT NOT NULL,
  title TEXT NOT NULL,
  instructions TEXT NOT NULL,
  media_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create completions table
CREATE TABLE public.completions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID REFERENCES public.children(id) ON DELETE CASCADE NOT NULL,
  activity_id UUID REFERENCES public.activities(id) ON DELETE CASCADE NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(child_id, activity_id)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.completions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Allow profile creation" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for children
CREATE POLICY "Parents can view own children" ON public.children
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Parents can manage own children" ON public.children
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for tracks (public read)
CREATE POLICY "Anyone can view tracks" ON public.tracks
  FOR SELECT USING (true);

-- RLS Policies for activities (public read)
CREATE POLICY "Anyone can view activities" ON public.activities
  FOR SELECT USING (true);

-- RLS Policies for completions
CREATE POLICY "Parents can view completions for their children" ON public.completions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.children 
      WHERE children.id = completions.child_id 
      AND children.user_id = auth.uid()
    )
  );

CREATE POLICY "Parents can manage completions for their children" ON public.completions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.children 
      WHERE children.id = completions.child_id 
      AND children.user_id = auth.uid()
    )
  );

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, parent_name, whatsapp)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'parent_name',
    NEW.raw_user_meta_data->>'whatsapp'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_children_updated_at BEFORE UPDATE ON public.children
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample tracks
INSERT INTO public.tracks (name, profile, age_range) VALUES
  ('Desenvolvimento Típico 1-3 anos', 'Típico_1-3', '1-3'),
  ('Desenvolvimento Típico 4-6 anos', 'Típico_4-6', '4-6'),
  ('Desenvolvimento Típico 7-10 anos', 'Típico_7-10', '7-10'),
  ('Desenvolvimento Típico 11-14 anos', 'Típico_11-14', '11-14'),
  ('TEA Nível 1 - 1-3 anos', 'TEA_1-3', '1-3'),
  ('TEA Nível 1 - 4-6 anos', 'TEA_4-6', '4-6'),
  ('TEA Nível 1 - 7-10 anos', 'TEA_7-10', '7-10'),
  ('TEA Nível 1 - 11-14 anos', 'TEA_11-14', '11-14'),
  ('Síndrome de Down 1-3 anos', 'Down_1-3', '1-3'),
  ('Síndrome de Down 4-6 anos', 'Down_4-6', '4-6'),
  ('Síndrome de Down 7-10 anos', 'Down_7-10', '7-10'),
  ('Síndrome de Down 11-14 anos', 'Down_11-14', '11-14'),
  ('Atraso de Desenvolvimento 1-3 anos', 'Atraso_1-3', '1-3'),
  ('Atraso de Desenvolvimento 4-6 anos', 'Atraso_4-6', '4-6'),
  ('Atraso de Desenvolvimento 7-10 anos', 'Atraso_7-10', '7-10'),
  ('Atraso de Desenvolvimento 11-14 anos', 'Atraso_11-14', '11-14');

-- Function to get appropriate track based on profile and age
CREATE OR REPLACE FUNCTION public.get_track_for_child(
  p_child_profile child_profile,
  p_child_age smallint
)
RETURNS UUID AS $$
DECLARE
  age_range_str text;
  profile_str text;
  track_uuid UUID;
BEGIN
  -- Determine age range
  CASE 
    WHEN p_child_age BETWEEN 1 AND 3 THEN age_range_str := '1-3';
    WHEN p_child_age BETWEEN 4 AND 6 THEN age_range_str := '4-6';
    WHEN p_child_age BETWEEN 7 AND 10 THEN age_range_str := '7-10';
    WHEN p_child_age BETWEEN 11 AND 14 THEN age_range_str := '11-14';
    ELSE age_range_str := '1-3'; -- default
  END CASE;
  
  -- Build profile string
  profile_str := p_child_profile::text || '_' || age_range_str;
  
  -- Get track ID
  SELECT id INTO track_uuid 
  FROM public.tracks 
  WHERE profile = profile_str 
  LIMIT 1;
  
  RETURN track_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;