import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, ArrowLeft, CheckCircle, Baby, Brain, MessageCircle, User } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const AssessmentForm = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    child_name: "",
    child_age: "",
    child_profile: "",
    speech_level: "",
    comprehension_level: "",
  });

  const totalSteps = 5;

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
      // Convert age string to number
      const ageValue = parseInt(formData.child_age);
      
      // Get track for child profile and age
      const { data: trackId, error: trackError } = await supabase
        .rpc('get_track_for_child', {
          p_child_profile: formData.child_profile as 'Típico' | 'TEA' | 'Down' | 'Atraso',
          p_child_age: ageValue,
        });

      if (trackError) {
        console.error('Error getting track:', trackError);
        throw new Error('Erro ao determinar o plano de atividades');
      }

      // Insert child into database
      const { error: childError } = await supabase
        .from('children')
        .insert({
          user_id: user?.id,
          child_name: formData.child_name,
          child_age: ageValue,
          child_profile: formData.child_profile as 'Típico' | 'TEA' | 'Down' | 'Atraso',
          speech_level: formData.speech_level as 'Não verbal' | 'Palavras isoladas' | 'Frases curtas' | 'Frases completas',
          comprehension_level: formData.comprehension_level as 'Entende tudo' | 'Ordens simples' | 'Pouco' | 'Só pistas visuais',
          track_id: trackId,
        });

      if (childError) {
        console.error('Error inserting child:', childError);
        throw new Error('Erro ao salvar dados da criança');
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
        child_name: "",
        child_age: "",
        child_profile: "",
        speech_level: "",
        comprehension_level: "",
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
              <h3 className="text-2xl font-bold">Nome da Criança</h3>
              <p className="text-muted-foreground">Como devemos chamar seu filho(a)?</p>
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
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <Baby className="w-12 h-12 text-primary mx-auto" />
              <h3 className="text-2xl font-bold">Idade da Criança</h3>
              <p className="text-muted-foreground">Quantos anos {formData.child_name} tem?</p>
            </div>
            
            <div className="space-y-2">
              <Label>Idade *</Label>
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
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <Brain className="w-12 h-12 text-primary mx-auto" />
              <h3 className="text-2xl font-bold">Perfil da Criança</h3>
              <p className="text-muted-foreground">Qual melhor descreve {formData.child_name}?</p>
            </div>

            <div className="space-y-2">
              <Label>Perfil de desenvolvimento *</Label>
              <RadioGroup 
                value={formData.child_profile} 
                onValueChange={(value) => updateFormData("child_profile", value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Típico" id="profile-typical" />
                  <Label htmlFor="profile-typical">Desenvolvimento Típico</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="TEA" id="profile-tea" />
                  <Label htmlFor="profile-tea">TEA (Transtorno do Espectro Autista)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Down" id="profile-down" />
                  <Label htmlFor="profile-down">Síndrome de Down</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Atraso" id="profile-delay" />
                  <Label htmlFor="profile-delay">Atraso de Desenvolvimento</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <MessageCircle className="w-12 h-12 text-primary mx-auto" />
              <h3 className="text-2xl font-bold">Nível de Fala</h3>
              <p className="text-muted-foreground">Como {formData.child_name} se comunica atualmente?</p>
            </div>

            <div className="space-y-2">
              <Label>Nível de fala atual *</Label>
              <RadioGroup 
                value={formData.speech_level} 
                onValueChange={(value) => updateFormData("speech_level", value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Não verbal" id="speech-nonverbal" />
                  <Label htmlFor="speech-nonverbal">Não verbal</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Palavras isoladas" id="speech-words" />
                  <Label htmlFor="speech-words">Palavras isoladas</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Frases curtas" id="speech-short" />
                  <Label htmlFor="speech-short">Frases curtas</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Frases completas" id="speech-complete" />
                  <Label htmlFor="speech-complete">Frases completas</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <CheckCircle className="w-12 h-12 text-primary mx-auto" />
              <h3 className="text-2xl font-bold">Nível de Compreensão</h3>
              <p className="text-muted-foreground">O quanto {formData.child_name} entende?</p>
            </div>

            <div className="space-y-2">
              <Label>Nível de compreensão *</Label>
              <RadioGroup 
                value={formData.comprehension_level} 
                onValueChange={(value) => updateFormData("comprehension_level", value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Entende tudo" id="comp-all" />
                  <Label htmlFor="comp-all">Entende tudo</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Ordens simples" id="comp-simple" />
                  <Label htmlFor="comp-simple">Ordens simples</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Pouco" id="comp-little" />
                  <Label htmlFor="comp-little">Pouco</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Só pistas visuais" id="comp-visual" />
                  <Label htmlFor="comp-visual">Só pistas visuais</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">O que acontece agora?</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>✓ {formData.child_name} será adicionado(a) ao seu dashboard</li>
                <li>✓ Criaremos atividades personalizadas para o perfil</li>
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
      case 1: return formData.child_name.trim() !== '';
      case 2: return formData.child_age !== '';
      case 3: return formData.child_profile !== '';
      case 4: return formData.speech_level !== '';
      case 5: return formData.comprehension_level !== '';
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