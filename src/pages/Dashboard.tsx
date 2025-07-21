import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { PlusCircle, Users, Calendar, CheckCircle, MessageCircle, LogOut, Home, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import WhatsAppSimulation from '@/components/WhatsAppSimulation';

interface Child {
  id: string;
  child_name: string;
  child_age: number;
  track_id: string;
  created_at: string;
  user_id: string;
  // Optional fields that may not be used in UI but exist in DB
  [key: string]: any;
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
  const [todayActivities, setTodayActivities] = useState<Activity[]>([]);
  const [isActivityDialogOpen, setIsActivityDialogOpen] = useState(false);
  const [whatsAppSelectedChild, setWhatsAppSelectedChild] = useState<Child | null>(null);
  const [childrenProgress, setChildrenProgress] = useState<Record<string, number>>({});
  const [completedActivities, setCompletedActivities] = useState<Set<string>>(new Set());

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

      // Calculate progress for each child
      if (childrenData) {
        const progressData: Record<string, number> = {};
        for (const child of childrenData) {
          progressData[child.id] = await calculateProgress(child);
        }
        setChildrenProgress(progressData);
      }
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

  const calculateProgress = async (child: Child) => {
    try {
      // Get total activities for this track
      const { data: totalActivities, count: totalCount } = await supabase
        .from('activities')
        .select('*', { count: 'exact' })
        .eq('track_id', child.track_id);

      // Get completed activities for this child
      const { data: completedActivities, count: completedCount } = await supabase
        .from('completions')
        .select('*', { count: 'exact' })
        .eq('child_id', child.id);

      if (!totalCount || totalCount === 0) return 0;
      
      const progress = Math.round((completedCount || 0) / totalCount * 100);
      return Math.min(progress, 100);
    } catch (error) {
      console.error('Error calculating progress:', error);
      return 0;
    }
  };

  // Generate all possible combinations of 3 activities from 5
  const generateCombinations = (activities: Activity[]) => {
    const combinations: Activity[][] = [];
    for (let i = 0; i < activities.length - 2; i++) {
      for (let j = i + 1; j < activities.length - 1; j++) {
        for (let k = j + 1; k < activities.length; k++) {
          combinations.push([activities[i], activities[j], activities[k]]);
        }
      }
    }
    return combinations;
  };

  const getTodayActivities = async (child: Child) => {
    try {
      // Get all activities for this track
      const { data: activities } = await supabase
        .from('activities')
        .select('*')
        .eq('track_id', child.track_id)
        .order('day_index', { ascending: true });

      if (!activities || activities.length < 3) return [];

      // Generate all possible combinations of 3 activities
      const combinations = generateCombinations(activities);
      
      if (combinations.length === 0) return [];

      // Create a pseudo-random but consistent index based on child ID and current date
      const today = new Date().toDateString();
      const childIdHash = child.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const dateHash = today.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const combinedHash = childIdHash + dateHash;
      
      // Use modulo to get a consistent combination index (cycles through all 10 combinations)
      const combinationIndex = combinedHash % combinations.length;
      
      return combinations[combinationIndex];
    } catch (error) {
      console.error('Error fetching today activities:', error);
      return [];
    }
  };

  const handleChildClick = async (child: Child) => {
    setSelectedChild(child);
    setWhatsAppSelectedChild(child); // Atualiza a simulação do WhatsApp
    const activities = await getTodayActivities(child);
    setTodayActivities(activities);
    
    // Check which activities are already completed
    if (activities.length > 0) {
      const { data: completions } = await supabase
        .from('completions')
        .select('activity_id')
        .eq('child_id', child.id)
        .in('activity_id', activities.map(a => a.id));
      
      const completedIds = new Set(completions?.map(c => c.activity_id) || []);
      setCompletedActivities(completedIds);
    } else {
      setCompletedActivities(new Set());
    }
    
    setIsActivityDialogOpen(true);
  };

  const markActivityCompleted = async (activityId: string) => {
    if (!selectedChild || completedActivities.has(activityId)) return;

    try {
      const { error } = await supabase
        .from('completions')
        .insert({
          child_id: selectedChild.id,
          activity_id: activityId,
        });

      if (error) {
        toast({
          title: 'Erro',
          description: 'Erro ao marcar atividade como concluída',
          variant: 'destructive',
        });
      } else {
        const activity = todayActivities.find(a => a.id === activityId);
        toast({
          title: 'Atividade concluída!',
          description: `Parabéns! ${selectedChild.child_name} completou "${activity?.title}".`,
        });
        
        // Update completed activities state
        setCompletedActivities(prev => new Set([...prev, activityId]));
        
        // Update progress for this child
        const newProgress = await calculateProgress(selectedChild);
        setChildrenProgress(prev => ({
          ...prev,
          [selectedChild.id]: newProgress
        }));
      }
    } catch (error) {
      console.error('Error completing activity:', error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleEditChild = (childId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Implementar edição do perfil da criança
    console.log('Editar criança:', childId);
  };

  const handleDeleteChild = async (childId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Tem certeza que deseja excluir este perfil?')) {
      try {
        const { error } = await supabase
          .from('children')
          .delete()
          .eq('id', childId);
        
        if (error) throw error;
        
        // Atualizar a lista de crianças
        setChildren(children.filter(child => child.id !== childId));
        
        toast({
          title: 'Perfil excluído',
          description: 'O perfil da criança foi excluído com sucesso.',
        });
      } catch (error) {
        console.error('Erro ao excluir criança:', error);
        toast({
          title: 'Erro',
          description: 'Erro ao excluir perfil da criança.',
          variant: 'destructive',
        });
      }
    }
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
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{child.child_age} anos</Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => handleEditChild(child.id, e)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar perfil
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={(e) => handleDeleteChild(child.id, e)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir perfil
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardTitle>
                <CardDescription>
                  Progresso das atividades
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Atividades concluídas</span>
                      <span>{childrenProgress[child.id] || 0}%</span>
                    </div>
                    <Progress value={childrenProgress[child.id] || 0} className="h-2" />
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
        <WhatsAppSimulation 
          parentName={profile?.parent_name || "Responsável"} 
          childName={whatsAppSelectedChild?.child_name || children[0]?.child_name || "Criança"}
        />

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
              <div className="text-2xl font-bold">{children.length * 3}</div>
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
            <DialogTitle>Atividades de Hoje</DialogTitle>
            <DialogDescription>
              3 atividades sugeridas para {selectedChild?.child_name}
            </DialogDescription>
          </DialogHeader>
          
          {todayActivities.length > 0 ? (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {todayActivities.map((activity, index) => (
                <div key={activity.id} className="p-4 bg-muted rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold">Atividade {index + 1}: {activity.title}</h4>
                    {completedActivities.has(activity.id) && (
                      <Badge variant="default" className="ml-2">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Concluída
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap mb-3">
                    {activity.instructions.replace(/{{child_name}}/g, selectedChild?.child_name || '')}
                  </p>
                  
                  {completedActivities.has(activity.id) ? (
                    <Button 
                      disabled
                      size="sm"
                      variant="outline"
                      className="w-full"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Atividade Concluída!
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => markActivityCompleted(activity.id)}
                      size="sm"
                      className="w-full"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Marcar como Concluída
                    </Button>
                  )}
                </div>
              ))}
              
              <div className="flex justify-end pt-4 border-t">
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