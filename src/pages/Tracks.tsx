import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, BookOpen, Activity, Users, Target } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Track {
  id: string;
  name: string;
  profile: string;
  age_range: string;
  total_activities: number;
}

interface TrackWithActivities extends Track {
  activities: {
    id: string;
    title: string;
    day_index: number;
  }[];
}

export default function Tracks() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<TrackWithActivities | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchTracks();
  }, [user, navigate]);

  const fetchTracks = async () => {
    try {
      // Fetch tracks with activity count
      const { data: tracksData, error } = await supabase
        .from('tracks')
        .select(`
          id,
          name,
          profile,
          age_range,
          activities(count)
        `)
        .order('profile')
        .order('age_range');

      if (error) throw error;

      // Transform data to include activity count
      const transformedTracks = tracksData?.map(track => ({
        id: track.id,
        name: track.name,
        profile: track.profile,
        age_range: track.age_range,
        total_activities: track.activities?.[0]?.count || 0
      })) || [];

      setTracks(transformedTracks);
    } catch (error) {
      console.error('Error fetching tracks:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar trilhas',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTrackDetails = async (trackId: string) => {
    try {
      const { data: trackData, error: trackError } = await supabase
        .from('tracks')
        .select('*')
        .eq('id', trackId)
        .single();

      if (trackError) throw trackError;

      const { data: activitiesData, error: activitiesError } = await supabase
        .from('activities')
        .select('id, title, day_index')
        .eq('track_id', trackId)
        .order('day_index');

      if (activitiesError) throw activitiesError;

      setSelectedTrack({
        ...trackData,
        total_activities: activitiesData?.length || 0,
        activities: activitiesData || []
      });
    } catch (error) {
      console.error('Error fetching track details:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar detalhes da trilha',
        variant: 'destructive',
      });
    }
  };

  const getProfileColor = (profile: string) => {
    const baseProfile = profile.split('_')[0];
    switch (baseProfile) {
      case 'Típico': return 'bg-blue-100 text-blue-800';
      case 'TEA': return 'bg-purple-100 text-purple-800';
      case 'Down': return 'bg-green-100 text-green-800';
      case 'Atraso': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProfileIcon = (profile: string) => {
    const baseProfile = profile.split('_')[0];
    switch (baseProfile) {
      case 'Típico': return '👶';
      case 'TEA': return '🧩';
      case 'Down': return '💙';
      case 'Atraso': return '⚡';
      default: return '📚';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Carregando trilhas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="text-muted-foreground hover:text-primary"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao Dashboard
              </Button>
            </div>
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold">Trilhas de Atividades</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Trilhas Disponíveis</h2>
          <p className="text-muted-foreground">
            Explore as trilhas de atividades organizadas por perfil e faixa etária
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Trilhas</CardTitle>
              <BookOpen className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tracks.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Com Atividades</CardTitle>
              <Activity className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {tracks.filter(t => t.total_activities > 0).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Perfis Atendidos</CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4</div>
              <div className="text-xs text-muted-foreground">
                Típico, TEA, Down, Atraso
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Atividades</CardTitle>
              <Target className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {tracks.reduce((sum, track) => sum + track.total_activities, 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tracks Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tracks
            .filter(track => track.total_activities > 0) // Only show tracks with activities
            .map((track) => (
            <Card 
              key={track.id} 
              className="cursor-pointer transition-all hover:shadow-warm hover:scale-[1.02]"
              onClick={() => fetchTrackDetails(track.id)}
            >
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <span className="text-2xl mr-2">
                      {getProfileIcon(track.profile)}
                    </span>
                    <span className="text-sm">{track.name}</span>
                  </span>
                </CardTitle>
                <CardDescription className="flex items-center justify-between">
                  <Badge className={getProfileColor(track.profile)}>
                    {track.profile.split('_')[0]}
                  </Badge>
                  <Badge variant="outline">
                    {track.age_range} anos
                  </Badge>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Atividades disponíveis</span>
                      <span>{track.total_activities}</span>
                    </div>
                    <Progress 
                      value={Math.min((track.total_activities / 30) * 100, 100)} 
                      className="h-2" 
                    />
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Ver Detalhes
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Track Details Modal would go here */}
        {selectedTrack && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[80vh] overflow-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <span className="text-2xl mr-2">
                      {getProfileIcon(selectedTrack.profile)}
                    </span>
                    {selectedTrack.name}
                  </CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setSelectedTrack(null)}
                  >
                    ✕
                  </Button>
                </div>
                <CardDescription>
                  {selectedTrack.total_activities} atividades disponíveis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedTrack.activities.map((activity) => (
                    <div 
                      key={activity.id}
                      className="p-3 border rounded-lg hover:bg-muted/50"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{activity.title}</p>
                          <p className="text-sm text-muted-foreground">
                            Dia {activity.day_index}
                          </p>
                        </div>
                        <Badge variant="outline">
                          #{activity.day_index}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}