import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PlusCircle, Users, Calendar, CheckCircle, MessageCircle, LogOut, Home } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import WhatsAppSimulation from '@/components/WhatsAppSimulation';

interface Child {
  id: string;
  child_name: string;
  child_age: number;
  child_profile: string;
  track_id: string;
  created_at: string;
}

interface Activity {
  id: string;
  title: string;
  instructions: string;
  day_index: number;
}

interface Profile {
  parent_name: string;
  plan: string;
  trial_end: string;
}

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [children, setChildren] = useState<Child[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [todayActivity, setTodayActivity] = useState<Activity | null>(null);
  const [isActivityDialogOpen, setIsActivityDialogOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('parent_name, plan, trial_end')
        .eq('id', user?.id)
        .single();

      setProfile(profileData);

      // Fetch children
      const { data: childrenData } = await supabase
        .from('children')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: true });

      setChildren((childrenData || []) as any);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar dados',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = (child: Child) => {
    // Mock progress calculation - last 7 days
    // In real implementation, this would calculate based on completions
    const daysSinceCreated = Math.floor(
      (Date.now() - new Date(child.created_at).getTime()) / (1000 * 60 * 60 * 24)
    );
    return Math.min(Math.max(daysSinceCreated * 14, 0), 100);
  };

  const getTodayActivity = async (child: Child) => {
    const daysSinceCreated = Math.floor(
      (Date.now() - new Date(child.created_at).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    const { data: activity } = await supabase
      .from('activities')
      .select('*')
      .eq('track_id', child.track_id)
      .eq('day_index', daysSinceCreated + 1)
      .single();

    return activity;
  };

  const handleChildClick = async (child: Child) => {
    setSelectedChild(child);
    const activity = await getTodayActivity(child);
    setTodayActivity(activity);
    setIsActivityDialogOpen(true);
  };

  const markActivityCompleted = async () => {
    if (!selectedChild || !todayActivity) return;

    try {
      const { error } = await supabase
        .from('completions')
        .insert({
          child_id: selectedChild.id,
          activity_id: todayActivity.id,
        });

      if (error) {
        toast({
          title: 'Erro',
          description: 'Erro ao marcar atividade como concluída',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Atividade concluída!',
          description: `Parabéns! ${selectedChild.child_name} completou a atividade de hoje.`,
        });
        setIsActivityDialogOpen(false);
      }
    } catch (error) {
      console.error('Error completing activity:', error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getPlanBadgeVariant = (plan: string) => {
    switch (plan) {
      case 'TRIAL': return 'secondary';
      case 'ESSENCIAL': return 'default';
      case 'AVANCADO': return 'default';
      case 'PREMIUM': return 'default';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow animate-pulse">
            <MessageCircle className="w-8 h-8 text-primary-foreground" />
          </div>
          <p className="text-muted-foreground">Carregando...</p>
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
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">FonoBot</h1>
                <p className="text-sm text-muted-foreground">
                  Olá, {profile?.parent_name}!
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/')}
                className="text-muted-foreground hover:text-primary"
              >
                <Home className="w-4 h-4 mr-2" />
                Início
              </Button>
              <Badge variant={getPlanBadgeVariant(profile?.plan || 'TRIAL')}>
                {profile?.plan === 'TRIAL' ? 'Teste Grátis' : profile?.plan}
              </Badge>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Dashboard</h2>
          <p className="text-muted-foreground">
            Acompanhe o progresso das atividades de fonoaudiologia
          </p>
        </div>

        {/* Children Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          {children.map((child) => (
            <Card 
              key={child.id} 
              className="cursor-pointer transition-all hover:shadow-warm hover:scale-[1.02]"
              onClick={() => handleChildClick(child)}
            >
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between">
                  <span>{child.child_name}</span>
                  <Badge variant="outline">{child.child_age} anos</Badge>
                </CardTitle>
                <CardDescription>
                  {child.child_profile} • Progresso dos últimos 7 dias
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Atividades concluídas</span>
                      <span>{calculateProgress(child)}%</span>
                    </div>
                    <Progress value={calculateProgress(child)} className="h-2" />
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    <Calendar className="w-4 h-4 mr-2" />
                    Ver atividade de hoje
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Add Child Card */}
          <Card 
            className="cursor-pointer transition-all hover:shadow-warm hover:scale-[1.02] border-dashed"
            onClick={() => navigate('/avaliacao')}
          >
            <CardContent className="flex flex-col items-center justify-center h-full py-8">
              <PlusCircle className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">Adicionar criança</h3>
              <p className="text-sm text-muted-foreground text-center">
                Faça uma nova avaliação para adicionar outra criança
              </p>
            </CardContent>
          </Card>
        </div>

        {/* WhatsApp Simulation */}
        <WhatsAppSimulation />

        {/* Quick Stats */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Crianças</CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{children.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Atividades Hoje</CardTitle>
              <Calendar className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{children.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Plano Atual</CardTitle>
              <MessageCircle className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {profile?.plan === 'TRIAL' ? 'Grátis' : profile?.plan}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Activity Dialog */}
      <Dialog open={isActivityDialogOpen} onOpenChange={setIsActivityDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Atividade de Hoje</DialogTitle>
            <DialogDescription>
              Atividade para {selectedChild?.child_name}
            </DialogDescription>
          </DialogHeader>
          
          {todayActivity ? (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">{todayActivity.title}</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {todayActivity.instructions.replace(/{{child_name}}/g, selectedChild?.child_name || '')}
                </p>
              </div>
              
              <div className="flex gap-3">
                <Button 
                  onClick={markActivityCompleted}
                  className="flex-1"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Marcar como Concluída
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsActivityDialogOpen(false)}
                >
                  Fechar
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Nenhuma atividade disponível para hoje
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}