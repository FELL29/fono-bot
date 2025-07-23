import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useChildren } from '@/hooks/useChildren';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { LoadingState } from '@/components/ui/loading-spinner';
import ErrorBoundary from '@/components/ui/error-boundary';
import { ChildCard } from '@/components/ChildCard';
import { PlusCircle, Users, Calendar, MessageCircle, LogOut, Home, CheckCircle, Trophy } from 'lucide-react';
import WhatsAppSimulation from '@/components/WhatsAppSimulation';
import { useToast } from '@/hooks/use-toast';

interface Child {
  id: string;
  child_name: string;
  child_age: number;
  track_id: string;
  created_at: string;
  user_id: string;
}

interface Activity {
  id: string;
  title: string;
  instructions: string;
  day_index: number;
}

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { children, loading: childrenLoading, deleteChild, calculateProgress, getTodayActivities } = useChildren();
  const { profile, loading: profileLoading } = useProfile();
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [progressData, setProgressData] = useState<Record<string, number>>({});
  const [completedActivities, setCompletedActivities] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const loading = childrenLoading || profileLoading;

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
  }, [user, navigate]);

  // Optimized progress data fetching with debounce
  const fetchProgressData = useCallback(async () => {
    if (children.length === 0) return;
    
    const progressPromises = children.map(async (child) => {
      const progress = await calculateProgress(child);
      return { id: child.id, progress };
    });

    const results = await Promise.all(progressPromises);
    const progressMap = results.reduce((acc, { id, progress }) => {
      acc[id] = progress;
      return acc;
    }, {} as Record<string, number>);

    setProgressData(progressMap);
  }, [children, calculateProgress]);

  useEffect(() => {
    fetchProgressData();
  }, [fetchProgressData]);

  const handleChildClick = useCallback(async (child: Child) => {
    setSelectedChild(child);
    const todayActivities = await getTodayActivities(child);
    setActivities(todayActivities);
    
    // Check which activities are already completed
    if (todayActivities.length > 0) {
      const { data: completions } = await supabase
        .from('completions')
        .select('activity_id')
        .eq('child_id', child.id)
        .in('activity_id', todayActivities.map(a => a.id));
      
      const completedIds = new Set(completions?.map(c => c.activity_id) || []);
      setCompletedActivities(completedIds);
    } else {
      setCompletedActivities(new Set());
    }
    
    setDialogOpen(true);
  }, [getTodayActivities]);

  const markActivityCompleted = useCallback(async (activityId: string) => {
    if (!selectedChild || completedActivities.has(activityId)) return;

    try {
      const { error } = await supabase
        .from('completions')
        .insert({
          child_id: selectedChild.id,
          activity_id: activityId,
        });

      if (error) throw error;

      const activity = activities.find(a => a.id === activityId);
      toast({
        title: 'Atividade concluída!',
        description: `Parabéns! ${selectedChild.child_name} completou "${activity?.title}".`,
      });
      
      // Update completed activities state
      setCompletedActivities(prev => new Set([...prev, activityId]));
      
      // Update progress for this child
      const newProgress = await calculateProgress(selectedChild);
      setProgressData(prev => ({
        ...prev,
        [selectedChild.id]: newProgress
      }));
    } catch (error) {
      console.error('Error completing activity:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao marcar atividade como concluída',
        variant: 'destructive',
      });
    }
  }, [selectedChild, completedActivities, activities, calculateProgress, toast]);

  const handleSignOut = useCallback(async () => {
    await signOut();
    navigate('/');
  }, [signOut, navigate]);

  const handleEditChild = useCallback((childId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Implementar edição do perfil da criança
    console.log('Editar criança:', childId);
  }, []);

  const handleDeleteChild = useCallback(async (childId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm('Tem certeza que deseja excluir esta criança?')) {
      return;
    }

    await deleteChild(childId);
  }, [deleteChild]);

  const getPlanBadgeVariant = useCallback((plan: string) => {
    switch (plan) {
      case 'TRIAL': return 'secondary';
      case 'ESSENCIAL': return 'default';
      case 'AVANCADO': return 'default';
      case 'PREMIUM': return 'default';
      default: return 'secondary';
    }
  }, []);

  // Memoized calculations to avoid unnecessary re-renders
  const totalChildren = useMemo(() => children.length, [children.length]);
  const totalActivitiesHoje = useMemo(() => children.length * 3, [children.length]);
  const progressoMedio = useMemo(() => {
    const values = Object.values(progressData);
    return values.length > 0 
      ? Math.round(values.reduce((a, b) => a + b, 0) / values.length)
      : 0;
  }, [progressData]);

  const primaryChild = useMemo(() => children[0], [children]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
        <LoadingState>Carregando seu dashboard...</LoadingState>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
        <header className="bg-background/80 backdrop-blur-sm border-b sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    FonoBot
                  </h1>
                  <p className="text-sm text-muted-foreground hidden sm:block">
                    Olá, {profile?.parent_name}!
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 sm:space-x-4">
                <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="px-2 sm:px-4">
                  <Home className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Início</span>
                </Button>
                <Badge variant={getPlanBadgeVariant(profile?.plan || 'TRIAL')} className="hidden sm:inline-flex">
                  {profile?.plan === 'TRIAL' ? 'Trial' : profile?.plan}
                </Badge>
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Sair</span>
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Welcome Section */}
          <div className="mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">Dashboard</h2>
            <p className="text-muted-foreground">
              Acompanhe o progresso das atividades de fonoaudiologia
            </p>
          </div>

          {/* Children Cards */}
          {children.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhuma criança cadastrada</h3>
              <p className="text-muted-foreground mb-4">
                Faça uma avaliação para começar a usar o FonoBot
              </p>
              <Button onClick={() => navigate('/avaliacao')}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Fazer Avaliação
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                {children.map((child) => (
                  <ChildCard 
                    key={child.id} 
                    child={child} 
                    progress={progressData[child.id] || 0}
                    onEdit={handleEditChild}
                    onDelete={handleDeleteChild}
                    onClick={() => handleChildClick(child)}
                  />
                ))}
                
                {/* Add Child Card */}
                <Card 
                  className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] border-dashed border-2 border-muted"
                  onClick={() => navigate('/avaliacao')}
                >
                  <CardContent className="flex flex-col items-center justify-center h-full py-8 text-center">
                    <PlusCircle className="w-12 h-12 text-muted-foreground mb-4" />
                    <h3 className="font-semibold mb-2">Adicionar criança</h3>
                    <p className="text-sm text-muted-foreground">
                      Faça uma nova avaliação
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total de Crianças</CardTitle>
                    <Users className="w-4 h-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalChildren}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Atividades Hoje</CardTitle>
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalActivitiesHoje}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Progresso Médio</CardTitle>
                    <Trophy className="w-4 h-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{progressoMedio}%</div>
                  </CardContent>
                </Card>
              </div>

              {/* WhatsApp Simulation */}
              <WhatsAppSimulation 
                parentName={profile?.parent_name || "Responsável"} 
                childName={primaryChild?.child_name || "Criança"}
              />
            </>
          )}
        </main>

        {/* Activity Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Atividades de Hoje
              </DialogTitle>
              <DialogDescription>
                Atividades sugeridas para {selectedChild?.child_name}
              </DialogDescription>
            </DialogHeader>
            
            {activities.length > 0 ? (
              <div className="space-y-4">
                {activities.map((activity, index) => {
                  const isCompleted = completedActivities.has(activity.id);
                  
                  return (
                    <div 
                      key={activity.id} 
                      className={`p-4 rounded-lg border transition-all ${
                        isCompleted 
                          ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800' 
                          : 'bg-muted/50 border-muted'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-sm flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">
                            {index + 1}
                          </span>
                          {activity.title}
                        </h4>
                        
                        {isCompleted ? (
                          <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Concluída
                          </Badge>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => markActivityCompleted(activity.id)}
                            className="text-xs px-3 py-1 h-7"
                          >
                            Marcar como feita
                          </Button>
                        )}
                      </div>
                      
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {activity.instructions}
                      </p>
                    </div>
                  );
                })}

                {/* Progress for today */}
                <div className="mt-6 p-4 bg-primary/5 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Progresso de hoje</span>
                    <span className="text-sm text-muted-foreground">
                      {completedActivities.size} de {activities.length}
                    </span>
                  </div>
                  <Progress 
                    value={(completedActivities.size / activities.length) * 100} 
                    className="h-2" 
                  />
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Nenhuma atividade disponível para hoje.
                </p>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </ErrorBoundary>
  );
};

export default Dashboard;