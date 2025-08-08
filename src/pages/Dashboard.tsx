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
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { LoadingState, StatusIndicator, InlineLoading } from '@/components/ui/loading-spinner';
import { DashboardSkeleton, ActivitySkeleton } from '@/components/ui/skeleton';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { showOperationToast } from '@/components/ui/feedback-toast';
import ErrorBoundary from '@/components/ui/error-boundary';
import { ChildCard } from '@/components/ChildCard';
import { ActivityProgressTrail } from '@/components/ui/activity-progress-trail';
import { ActivityHistory } from '@/components/ui/activity-history';
import { GamificationSystem } from '@/components/ui/gamification-system';
import { PlayfulGamification } from '@/components/ui/playful-gamification';
import { OnboardingTour } from '@/components/OnboardingTour';
import { WeeklyCalendar } from '@/components/WeeklyCalendar';
import { ActivityCards } from '@/components/ActivityCards';
import { DevelopmentInsights } from '@/components/DevelopmentInsights';
import { PlusCircle, Users, Calendar, MessageCircle, LogOut, Home, CheckCircle, Trophy, Shield, History, Award } from 'lucide-react';
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
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingChild, setEditingChild] = useState<Child | null>(null);
  const [editName, setEditName] = useState('');
  const [editAge, setEditAge] = useState('');
  const [editCondition, setEditCondition] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [progressData, setProgressData] = useState<Record<string, number>>({});
  const [completedActivities, setCompletedActivities] = useState<Set<string>>(new Set());
  const [isMarkingComplete, setIsMarkingComplete] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showGamification, setShowGamification] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { toast } = useToast();

  // Check if user needs onboarding
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('fonobot-onboarding-completed');
    if (!hasSeenOnboarding && user && children.length === 0) {
      setShowOnboarding(true);
    }
  }, [user, children]);

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
    if (!selectedChild || completedActivities.has(activityId) || isMarkingComplete) return;

    setIsMarkingComplete(activityId);
    showOperationToast.loading("Marcando atividade como concluída");

    try {
      const { error } = await supabase
        .from('completions')
        .insert({
          child_id: selectedChild.id,
          activity_id: activityId,
        });

      if (error) throw error;

      const activity = activities.find(a => a.id === activityId);
      
      // Update completed activities state
      setCompletedActivities(prev => new Set([...prev, activityId]));
      
      // Update progress for this child
      const newProgress = await calculateProgress(selectedChild);
      setProgressData(prev => ({
        ...prev,
        [selectedChild.id]: newProgress
      }));

      showOperationToast.success(`${selectedChild.child_name} completou "${activity?.title}"`);
    } catch (error) {
      showOperationToast.error("marcar atividade como concluída");
    } finally {
      setIsMarkingComplete(null);
    }
  }, [selectedChild, completedActivities, activities, calculateProgress, isMarkingComplete]);

  const handleSignOut = useCallback(async () => {
    await signOut();
    navigate('/');
  }, [signOut, navigate]);

  const handleEditChild = useCallback((childId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const child = children.find(c => c.id === childId);
    if (child) {
      setEditingChild(child);
      setEditName(child.child_name);
      setEditAge(child.child_age.toString());
      setEditDialogOpen(true);
    }
  }, [children]);

  const handleUpdateChild = useCallback(async () => {
    if (!editingChild || !editName.trim() || !editAge.trim()) return;

    setIsUpdating(true);
    showOperationToast.loading("Atualizando dados da criança");

    try {
      const { error } = await supabase
        .from('children')
        .update({
          child_name: editName.trim(),
          child_age: parseInt(editAge)
        })
        .eq('id', editingChild.id)
        .eq('user_id', user?.id);

      if (error) throw error;

      // Update local state
      const updatedChildren = children.map(child => 
        child.id === editingChild.id 
          ? { ...child, child_name: editName.trim(), child_age: parseInt(editAge) }
          : child
      );

      // Force re-fetch to get updated data
      window.location.reload();

      showOperationToast.success("Dados da criança atualizados com sucesso");
      setEditDialogOpen(false);
      setEditingChild(null);
      setEditName('');
      setEditAge('');
    } catch (error) {
      showOperationToast.error("atualizar dados da criança");
    } finally {
      setIsUpdating(false);
    }
  }, [editingChild, editName, editAge, user?.id, children]);

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
    return <DashboardSkeleton />;
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 animate-fade-in">
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
                <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="px-2 sm:px-4 hover-scale">
                  <Home className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Início</span>
                </Button>
                <Button variant="ghost" size="sm" onClick={() => navigate('/seguranca')} className="px-2 sm:px-4 hover-scale">
                  <Shield className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Segurança</span>
                </Button>
                <Badge variant={getPlanBadgeVariant(profile?.plan || 'TRIAL')} className="hidden sm:inline-flex animate-fade-in">
                  {profile?.plan === 'TRIAL' ? 'Trial' : profile?.plan}
                </Badge>
                <EnhancedButton 
                  variant="outline" 
                  size="sm" 
                  onClick={handleSignOut}
                  className="hover-scale"
                >
                  <LogOut className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Sair</span>
                </EnhancedButton>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Welcome Section */}
          <div className="mb-6 sm:mb-8 animate-fade-in">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">Dashboard</h2>
            <p className="text-muted-foreground">
              Acompanhe o progresso das atividades de fonoaudiologia
            </p>
          </div>

              {/* Children Cards */}
          {children.length === 0 ? (
            <div className="text-center py-12 animate-fade-in">
              <MessageCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhuma criança cadastrada</h3>
              <p className="text-muted-foreground mb-4">
                Faça uma avaliação para começar a usar o FonoBot
              </p>
              <EnhancedButton 
                onClick={() => navigate('/avaliacao')} 
                variant="gradient"
                data-onboarding-target="add-child-button"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Fazer Avaliação
              </EnhancedButton>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                {children.map((child, index) => (
                  <div 
                    key={child.id} 
                    className="animate-fade-in hover-scale"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <ChildCard 
                      child={child} 
                      progress={progressData[child.id] || 0}
                      onEdit={handleEditChild}
                      onDelete={handleDeleteChild}
                      onClick={() => handleChildClick(child)}
                    />
                  </div>
                ))}
                
                {/* Add Child Card */}
                <Card 
                  className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] border-dashed border-2 border-muted hover-scale animate-fade-in"
                  onClick={() => navigate('/avaliacao')}
                  style={{ animationDelay: `${children.length * 100}ms` }}
                  data-onboarding-target="add-child-button"
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

              {/* Enhanced Dashboard Sections */}
              <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Content Column */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Weekly Calendar */}
                  <div data-onboarding-target="activities-section">
                    <WeeklyCalendar childId={primaryChild?.id} />
                  </div>

                  {/* Today's Activities Cards */}
                  {selectedChild && activities.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Atividades de Hoje</h3>
                        <Badge variant="secondary">
                          {activities.filter(a => completedActivities.has(a.id)).length} de {activities.length} concluídas
                        </Badge>
                      </div>
                      <ActivityCards
                        activities={activities.map(a => ({
                          ...a,
                          completed: completedActivities.has(a.id),
                          category: 'Fala',
                          difficulty: 'medium' as const,
                          duration: '5-10 min'
                        }))}
                        onActivityComplete={markActivityCompleted}
                        isMarkingComplete={isMarkingComplete}
                      />
                    </div>
                  )}
                </div>

                {/* Sidebar Column */}
                <div className="space-y-6">
                  {/* Development Insights */}
                  {primaryChild && (
                    <div data-onboarding-target="insights-section">
                      <DevelopmentInsights
                        child={primaryChild}
                        progressData={progressData[primaryChild.id] || 0}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Visual Progress Trail */}
              {selectedChild && (
                <div className="mb-6 sm:mb-8 animate-fade-in" data-onboarding-target="progress-section" style={{ animationDelay: "150ms" }}>
                  <ActivityProgressTrail
                    activities={activities}
                    completedActivities={Array.from(completedActivities)}
                    currentDay={Math.floor((Date.now() - new Date(selectedChild.created_at).getTime()) / (1000 * 60 * 60 * 24)) + 1}
                    childName={selectedChild.child_name}
                  />
                </div>
              )}

              {/* History and Gamification Controls */}
              {children.length > 0 && (
                <div className="flex flex-wrap gap-3 mb-6 sm:mb-8 animate-fade-in" style={{ animationDelay: "175ms" }}>
                  <Button
                    variant={showHistory ? "default" : "outline"}
                    onClick={() => setShowHistory(!showHistory)}
                    className="flex items-center gap-2"
                  >
                    <History className="w-4 h-4" />
                    Histórico de Atividades
                  </Button>
                  <Button
                    variant={showGamification ? "default" : "outline"}
                    onClick={() => setShowGamification(!showGamification)}
                    className="flex items-center gap-2"
                  >
                    <Award className="w-4 h-4" />
                    Conquistas
                  </Button>
                </div>
              )}

              {/* Activity History */}
              {showHistory && selectedChild && (
                <div className="mb-6 sm:mb-8 animate-fade-in" style={{ animationDelay: "200ms" }}>
                  <ActivityHistory
                    childId={selectedChild.id}
                    childName={selectedChild.child_name}
                  />
                </div>
              )}

              {/* Playful Gamification System */}
              {showGamification && selectedChild && (
                <div className="mb-6 sm:mb-8 animate-fade-in" data-onboarding-target="gamification-section" style={{ animationDelay: "225ms" }}>
                  <PlayfulGamification
                    childId={selectedChild.id}
                    childName={selectedChild.child_name}
                    childAge={selectedChild.child_age}
                  />
                </div>
              )}

              {/* Quick Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8 animate-fade-in"
                   style={{ animationDelay: "200ms" }}>
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
                  const isLoading = isMarkingComplete === activity.id;
                  
                  return (
                    <div 
                      key={activity.id} 
                      className={`p-4 rounded-lg border transition-all animate-fade-in ${
                        isCompleted 
                          ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800' 
                          : 'bg-muted/50 border-muted'
                      }`}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-sm flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">
                            {index + 1}
                          </span>
                          {activity.title}
                        </h4>
                        
                        {isCompleted ? (
                          <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 animate-scale-in">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Concluída
                          </Badge>
                        ) : (
                          <EnhancedButton
                            size="sm"
                            variant="outline"
                            onClick={() => markActivityCompleted(activity.id)}
                            className="text-xs px-3 py-1 h-7"
                            loading={isLoading}
                            loadingText="Marcando..."
                          >
                            Marcar como feita
                          </EnhancedButton>
                        )}
                      </div>
                      
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {activity.instructions}
                      </p>
                    </div>
                  );
                })}

                {/* Progress for today */}
                <div className="mt-6 p-4 bg-primary/5 rounded-lg animate-fade-in">
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
              <div className="text-center py-8 animate-fade-in">
                <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Nenhuma atividade disponível para hoje.
                </p>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Child Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Editar dados da criança</DialogTitle>
              <DialogDescription>
                Altere o nome, idade e condição da criança
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nome da criança</Label>
                <Input
                  id="edit-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Digite o nome da criança"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-age">Idade (em anos)</Label>
                <Input
                  id="edit-age"
                  type="number"
                  min="1"
                  max="18"
                  value={editAge}
                  onChange={(e) => setEditAge(e.target.value)}
                  placeholder="Digite a idade"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-condition">Condição</Label>
                <Select value={editCondition} onValueChange={setEditCondition}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a condição" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TYPICO">Típico</SelectItem>
                    <SelectItem value="TEA">TEA (Transtorno do Espectro Autista)</SelectItem>
                    <SelectItem value="DOWN">Síndrome de Down</SelectItem>
                    <SelectItem value="ATRASO">Atraso no Desenvolvimento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setEditDialogOpen(false)}
                  disabled={isUpdating}
                >
                  Cancelar
                </Button>
                <EnhancedButton
                  onClick={handleUpdateChild}
                  loading={isUpdating}
                  loadingText="Salvando..."
                  disabled={!editName.trim() || !editAge.trim()}
                >
                  Salvar alterações
                </EnhancedButton>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Onboarding Tour */}
        <OnboardingTour
          isOpen={showOnboarding}
          onComplete={() => {
            localStorage.setItem('fonobot-onboarding-completed', 'true');
            setShowOnboarding(false);
          }}
          onSkip={() => {
            localStorage.setItem('fonobot-onboarding-completed', 'true');
            setShowOnboarding(false);
          }}
        />
      </div>
    </ErrorBoundary>
  );
};

export default Dashboard;