import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Track {
  id: string;
  name: string;
  profile: string;
  age_range: string;
}

export const useTrackInfo = (trackId: string | null) => {
  const [track, setTrack] = useState<Track | null>(null);
  const [loading, setLoading] = useState(false);

  const condition = useMemo(() => {
    if (!track?.profile) return 'Típico';
    
    const profile = track.profile.toLowerCase();
    if (profile.includes('tea')) return 'TEA';
    if (profile.includes('down')) return 'Down';
    if (profile.includes('atraso')) return 'Atraso';
    if (profile.includes('typico')) return 'Típico';
    
    return 'Típico';
  }, [track]);

  const conditionColor = useMemo(() => {
    switch (condition) {
      case 'TEA': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Down': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Atraso': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Típico': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  }, [condition]);

  useEffect(() => {
    const fetchTrack = async () => {
      if (!trackId) return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('tracks')
          .select('*')
          .eq('id', trackId)
          .single();

        if (error) throw error;
        setTrack(data);
      } catch (error) {
        console.error('Error fetching track:', error);
        setTrack(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTrack();
  }, [trackId]);

  return { track, condition, conditionColor, loading };
};