import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, ArrowLeft, CheckCircle, Baby, Brain, MessageCircle, User, Heart, Volume2, Home } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const AssessmentForm = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Bloco A - Identificação
    parent_name: "",
    child_name: "",
    child_age: "",
    
    // Bloco B - Diagnóstico & Saúde
    child_profile: "",
    hearing_ok: "",
    
    // Bloco C - Expressão Oral
    speech_level: "",
    articulation_issue: [] as string[],
    oral_motor: [] as string[],
    
    // Bloco D - Compreensão
    comprehension_level: "",
    follow_commands: "",
    
    // Bloco E - Social & Sensorial
    joint_attention: "",
    sensory_issue: [] as string[],
    
    // Bloco F - Rotina & Preferências
    screen_time: "",
    home_language: "",
  });

  const totalSteps = 6;

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateCheckboxArray = (field: string, value: string, checked: boolean) => {
    setFormData(prev => {
      const currentArray = prev[field as keyof typeof prev] as string[];
      if (checked) {
        return { ...prev, [field]: [...currentArray.filter(item => item !== "Nenhuma"), value] };
      } else {
        return { ...prev, [field]: currentArray.filter(item => item !== value) };
      }
    });
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    
    try {
      // Convert age to months for internal processing
      const ageInYears = parseInt(formData.child_age);
      const ageInMonths = ageInYears * 12; // Convert years to months for function
      
      // Get track for child profile and age using corrected profile mapping
      let profileForTrack = '';
      switch (formData.child_profile) {
        case 'Criança típica':
          profileForTrack = 'Típico';
          break;
        case 'Atraso ou disfunção de fala':
          profileForTrack = 'Atraso';
          break;
        case 'TEA':
          profileForTrack = 'TEA';
          break;
        case 'Síndrome de Down':
          profileForTrack = 'Down';
          break;
        default:
          profileForTrack = 'Típico';
      }
      
      // Determine age range based on years
      let ageRange = '';
      if (ageInYears >= 1 && ageInYears <= 3) {
        ageRange = '1-3';
      } else if (ageInYears >= 4 && ageInYears <= 6) {
        ageRange = '4-6';
      } else if (ageInYears >= 7 && ageInYears <= 10) {
        ageRange = '7-10';
      } else if (ageInYears >= 11 && ageInYears <= 14) {
        ageRange = '11-14';
      } else {
        ageRange = '1-3'; // default
      }
      
      const trackProfile = `${profileForTrack}_${ageRange}`;
      
      // Find track directly from database instead of using RPC
      const { data: trackData, error: trackError } = await supabase
        .from('tracks')
        .select('id')
        .eq('profile', trackProfile)
        .single();

      let trackId = null;
      if (trackError || !trackData) {
        console.error('Track not found for profile:', trackProfile, 'Error:', trackError);
        // Try to find any track as fallback
        const { data: fallbackTrack } = await supabase
          .from('tracks')
          .select('id')
          .limit(1)
          .single();
        trackId = fallbackTrack?.id;
      } else {
        trackId = trackData.id;
      }

      // Calculate start level based on speech level
      let startLevel = 'A';
      if (['Não verbal', 'Emite sons / sílabas'].includes(formData.speech_level)) {
        startLevel = 'A';
      } else if (['Fala 10‑50 palavras', 'Frases de 2‑3 palavras'].includes(formData.speech_level)) {
        startLevel = 'B';
      } else {
        startLevel = 'C';
      }

      // Generate tags based on responses
      const tagMotricidade = formData.articulation_issue.some(item => item !== "Nenhuma") && formData.articulation_issue.length > 0;
      const tagOralMotor = formData.oral_motor.some(item => item !== "Nenhuma") && formData.oral_motor.length > 0;
      const tagJointAttention = formData.joint_attention === "Baixa";
      const tagNoise = formData.sensory_issue.includes("Sensível a ruídos");

      // Insert child into database with all assessment data
      console.log('Inserting child with data:', {
        user_id: user?.id,
        child_name: formData.child_name,
        child_age: ageInYears,
        track_id: trackId
      });

      const { error: childError } = await supabase
        .from('children')
        .insert({
          user_id: user?.id,
          parent_name: formData.parent_name,
          child_name: formData.child_name,
          child_age: ageInYears, // Store age in years (constraint expects 1-14)
          hearing_ok: formData.hearing_ok,
          articulation_issue: formData.articulation_issue,
          oral_motor: formData.oral_motor,
          follow_commands: formData.follow_commands,
          joint_attention: formData.joint_attention,
          sensory_issue: formData.sensory_issue,
          screen_time: parseInt(formData.screen_time) || 0,
          home_language: formData.home_language,
          frequency_pref: "3x por semana", // Default value for trial period
          track_id: trackId,
          tag_motricidade: tagMotricidade,
          tag_oral_motor: tagOralMotor,
          tag_joint_attention: tagJointAttention,
          tag_noise: tagNoise,
        } as any);

      if (childError) {
        console.error('Error inserting child:', childError);
        console.error('Full error details:', JSON.stringify(childError, null, 2));
        throw new Error(`Erro ao salvar dados da criança: ${childError.message || 'Erro desconhecido'}`);
      }

      // Get parent profile data for WhatsApp
      const { data: profileData } = await supabase
        .from('profiles')
        .select('parent_name, whatsapp')
        .eq('id', user?.id)
        .single();

      // Send WhatsApp welcome message (simulation)
      if (profileData?.whatsapp) {
        try {
          const { data: whatsappResult, error: whatsappError } = await supabase.functions.invoke(
            'send-whatsapp-welcome',
            {
              body: {
                child_name: formData.child_name,
                parent_name: profileData.parent_name,
                whatsapp: profileData.whatsapp,
                track_id: trackId,
              },
            }
          );

          if (whatsappError) {
            console.error('WhatsApp simulation error:', whatsappError);
          } else {
            console.log('WhatsApp simulation result:', whatsappResult);
            
            // Show detailed simulation result
            setTimeout(() => {
              toast({
                title: "📱 Simulação WhatsApp Enviada!",
                description: `Mensagem simulada para ${profileData.whatsapp}. Verifique o console para ver o conteúdo completo.`,
              });
            }, 1000);
          }
        } catch (whatsappError) {
          console.error('WhatsApp function call error:', whatsappError);
        }
      }

      toast({
        title: "Avaliação concluída!",
        description: "A criança foi adicionada com sucesso. As atividades começam amanhã cedo!",
      });

      // Reset form and navigate to dashboard
      setFormData({
        parent_name: "",
        child_name: "",
        child_age: "",
        child_profile: "",
        hearing_ok: "",
        speech_level: "",
        articulation_issue: [],
        oral_motor: [],
        comprehension_level: "",
        follow_commands: "",
        joint_attention: "",
        sensory_issue: [],
        screen_time: "",
        home_language: "",
      });
      setCurrentStep(1);
      
      // Navigate to dashboard after short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
      
    } catch (error: any) {
      console.error('Assessment submission error:', error);
      toast({
        title: "Erro ao finalizar avaliação",
        description: error.message || "Tente novamente ou entre em contato conosco.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <User className="w-12 h-12 text-primary mx-auto" />
              <h3 className="text-2xl font-bold">Bloco A - Identificação</h3>
              <p className="text-muted-foreground">Vamos começar com algumas informações básicas</p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="parent_name">Seu nome completo *</Label>
                <Input
                  id="parent_name"
                  value={formData.parent_name}
                  onChange={(e) => updateFormData("parent_name", e.target.value)}
                  placeholder="Digite seu nome completo"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="child_name">Nome da criança *</Label>
                <Input
                  id="child_name"
                  value={formData.child_name}
                  onChange={(e) => updateFormData("child_name", e.target.value)}
                  placeholder="Digite o nome da criança"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label>Idade da criança em anos *</Label>
                <Select onValueChange={(value) => updateFormData("child_age", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a idade" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 14 }, (_, i) => i + 1).map((age) => (
                      <SelectItem key={age} value={age.toString()}>
                        {age} {age === 1 ? 'ano' : 'anos'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Selecione a idade da criança em anos completos
                </p>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <Heart className="w-12 h-12 text-primary mx-auto" />
              <h3 className="text-2xl font-bold">Bloco B - Diagnóstico & Saúde</h3>
              <p className="text-muted-foreground">Informações sobre o perfil de {formData.child_name}</p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Perfil clínico da criança *</Label>
                <RadioGroup 
                  value={formData.child_profile} 
                  onValueChange={(value) => updateFormData("child_profile", value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Criança típica" id="profile-typical" />
                    <Label htmlFor="profile-typical">Criança típica (sem diagnóstico)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Atraso ou disfunção de fala" id="profile-delay" />
                    <Label htmlFor="profile-delay">Atraso ou disfunção de fala</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="TEA" id="profile-tea" />
                    <Label htmlFor="profile-tea">Transtorno do Espectro Autista (TEA)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Síndrome de Down" id="profile-down" />
                    <Label htmlFor="profile-down">Síndrome de Down</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-2">
                <Label>Audição verificada (audiometria dentro da normalidade)? *</Label>
                <RadioGroup 
                  value={formData.hearing_ok} 
                  onValueChange={(value) => updateFormData("hearing_ok", value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Sim" id="hearing-yes" />
                    <Label htmlFor="hearing-yes">Sim</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Não" id="hearing-no" />
                    <Label htmlFor="hearing-no">Não</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Não sei" id="hearing-unknown" />
                    <Label htmlFor="hearing-unknown">Não sei</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <MessageCircle className="w-12 h-12 text-primary mx-auto" />
              <h3 className="text-2xl font-bold">Bloco C - Expressão Oral</h3>
              <p className="text-muted-foreground">Como {formData.child_name} se comunica?</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nível atual de fala *</Label>
                <RadioGroup 
                  value={formData.speech_level} 
                  onValueChange={(value) => updateFormData("speech_level", value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Não verbal" id="speech-nonverbal" />
                    <Label htmlFor="speech-nonverbal">Não verbal</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Emite sons / sílabas" id="speech-sounds" />
                    <Label htmlFor="speech-sounds">Emite sons / sílabas</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Fala 10‑50 palavras" id="speech-words" />
                    <Label htmlFor="speech-words">Fala 10‑50 palavras</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Frases de 2‑3 palavras" id="speech-short" />
                    <Label htmlFor="speech-short">Frases de 2‑3 palavras</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Frases completas" id="speech-complete" />
                    <Label htmlFor="speech-complete">Frases completas</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-2">
                <Label>Dificuldades de articulação (pode escolher mais de uma)</Label>
                <div className="space-y-2">
                  {["Trocas de sons", "Omissões de sons", "Imprecisão geral", "Nenhuma"].map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                      <Checkbox
                        id={`articulation-${option}`}
                        checked={formData.articulation_issue.includes(option)}
                        onCheckedChange={(checked) => updateCheckboxArray("articulation_issue", option, checked as boolean)}
                      />
                      <Label htmlFor={`articulation-${option}`}>{option}</Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Questões de motricidade oral</Label>
                <div className="space-y-2">
                  {["Baba excessiva", "Dificuldade para mastigar", "Dificuldade para soprar", "Nenhuma"].map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                      <Checkbox
                        id={`oral-motor-${option}`}
                        checked={formData.oral_motor.includes(option)}
                        onCheckedChange={(checked) => updateCheckboxArray("oral_motor", option, checked as boolean)}
                      />
                      <Label htmlFor={`oral-motor-${option}`}>{option}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <Brain className="w-12 h-12 text-primary mx-auto" />
              <h3 className="text-2xl font-bold">Bloco D - Compreensão</h3>
              <p className="text-muted-foreground">O quanto {formData.child_name} entende?</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Compreensão de linguagem *</Label>
                <RadioGroup 
                  value={formData.comprehension_level} 
                  onValueChange={(value) => updateFormData("comprehension_level", value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Entende quase tudo" id="comp-all" />
                    <Label htmlFor="comp-all">Entende quase tudo</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Entende ordens simples" id="comp-simple" />
                    <Label htmlFor="comp-simple">Entende ordens simples</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Entende muito pouco" id="comp-little" />
                    <Label htmlFor="comp-little">Entende muito pouco</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Responde só a pistas visuais" id="comp-visual" />
                    <Label htmlFor="comp-visual">Responde só a pistas visuais</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-2">
                <Label>Segue instruções simples sem ajuda visual? *</Label>
                <RadioGroup 
                  value={formData.follow_commands} 
                  onValueChange={(value) => updateFormData("follow_commands", value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Sim" id="follow-yes" />
                    <Label htmlFor="follow-yes">Sim</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Não" id="follow-no" />
                    <Label htmlFor="follow-no">Não</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <Volume2 className="w-12 h-12 text-primary mx-auto" />
              <h3 className="text-2xl font-bold">Bloco E - Social & Sensorial</h3>
              <p className="text-muted-foreground">Aspectos sociais e sensoriais de {formData.child_name}</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nível de atenção conjunta (olhar compartilhado) *</Label>
                <RadioGroup 
                  value={formData.joint_attention} 
                  onValueChange={(value) => updateFormData("joint_attention", value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Boa" id="attention-good" />
                    <Label htmlFor="attention-good">Boa</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Moderada" id="attention-moderate" />
                    <Label htmlFor="attention-moderate">Moderada</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Baixa" id="attention-low" />
                    <Label htmlFor="attention-low">Baixa</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-2">
                <Label>Características sensoriais (escolha se houver)</Label>
                <div className="space-y-2">
                  {["Sensível a ruídos", "Busca muito movimento", "Seletivo alimentar", "Nenhuma"].map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                      <Checkbox
                        id={`sensory-${option}`}
                        checked={formData.sensory_issue.includes(option)}
                        onCheckedChange={(checked) => updateCheckboxArray("sensory_issue", option, checked as boolean)}
                      />
                      <Label htmlFor={`sensory-${option}`}>{option}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <Home className="w-12 h-12 text-primary mx-auto" />
              <h3 className="text-2xl font-bold">Bloco F - Rotina & Preferências</h3>
              <p className="text-muted-foreground">Informações sobre rotina e preferências</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Tempo de tela diário (horas) *</Label>
                <Input
                  type="number"
                  min="0"
                  max="24"
                  value={formData.screen_time}
                  onChange={(e) => updateFormData("screen_time", e.target.value)}
                  placeholder="Ex: 2"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label>Idioma(s) falado(s) em casa *</Label>
                <RadioGroup 
                  value={formData.home_language} 
                  onValueChange={(value) => updateFormData("home_language", value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Apenas Português" id="lang-pt" />
                    <Label htmlFor="lang-pt">Apenas Português</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Português + outro idioma" id="lang-mixed" />
                    <Label htmlFor="lang-mixed">Português + outro idioma</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Somente outro(s) idioma(s)" id="lang-other" />
                    <Label htmlFor="lang-other">Somente outro(s) idioma(s)</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">O que acontece agora?</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>✓ {formData.child_name} será adicionado(a) ao seu dashboard</li>
                <li>✓ Criaremos atividades personalizadas para o perfil</li>
                <li>✓ Durante o período de teste: 3× por semana</li>
                <li>✓ As atividades começam amanhã cedo!</li>
                <li>✓ Você poderá acompanhar o progresso no dashboard</li>
              </ul>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: 
        return formData.parent_name.trim() !== '' && 
               formData.child_name.trim() !== '' && 
               formData.child_age !== '';
      case 2: 
        return formData.child_profile !== '' && 
               formData.hearing_ok !== '';
      case 3: 
        return formData.speech_level !== '';
      case 4: 
        return formData.comprehension_level !== '' && 
               formData.follow_commands !== '';
      case 5: 
        return formData.joint_attention !== '';
      case 6: 
        return formData.screen_time !== '' && 
               formData.home_language !== '';
      default: return false;
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-soft">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl">Avaliação Personalizada</CardTitle>
          <span className="text-sm text-muted-foreground">
            {currentStep} de {totalSteps}
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-gradient-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </CardHeader>

      <CardContent className="min-h-[400px]">
        {renderStep()}

        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Anterior
          </Button>

          {currentStep < totalSteps ? (
            <Button
              onClick={nextStep}
              disabled={!canProceed()}
            >
              Próximo
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!canProceed() || isLoading}
            >
              {isLoading ? 'Finalizando...' : 'Finalizar Avaliação'}
              <CheckCircle className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AssessmentForm;