-- Fix critical security issues with RLS policies

-- 1. Remove public access to activities and tracks tables
DROP POLICY IF EXISTS "read-activities" ON public.activities;
DROP POLICY IF EXISTS "read-tracks" ON public.tracks;

-- 2. Create secure policies for activities - only authenticated users can read
CREATE POLICY "authenticated_read_activities" ON public.activities 
FOR SELECT 
USING (auth.role() = 'authenticated');

-- 3. Create secure policies for tracks - only authenticated users can read  
CREATE POLICY "authenticated_read_tracks" ON public.tracks 
FOR SELECT 
USING (auth.role() = 'authenticated');

-- 4. Fix subscribers policy to ensure proper user ownership validation
DROP POLICY IF EXISTS "upd-meu-subscriber" ON public.subscribers;
CREATE POLICY "update_own_subscriber" ON public.subscribers 
FOR UPDATE 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 5. Add missing insert policy for subscribers
CREATE POLICY "insert_own_subscriber" ON public.subscribers 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- 6. Strengthen profiles policy
DROP POLICY IF EXISTS "upd-meu-profile" ON public.profiles;
CREATE POLICY "update_own_profile" ON public.profiles 
FOR UPDATE 
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- 7. Add proper insert policy for profiles
CREATE POLICY "insert_own_profile" ON public.profiles 
FOR INSERT 
WITH CHECK (id = auth.uid());