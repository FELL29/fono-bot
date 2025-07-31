import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, ArrowLeft, CheckCircle, Baby, Brain, MessageCircle, User, Heart, Volume2, Home } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { assessmentFormSchema } from '@/lib/validations';
import { useSecureValidation } from '@/hooks/useSecureValidation';
import { sanitizeName, sanitizeText, sanitizeAge } from '@/lib/sanitize';
import { checkFormSubmissionRate } from '@/lib/security';

const AssessmentForm = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const { validate, validateField } = useSecureValidation(assessmentFormSchema);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    // Bloco A - Identificação
    parent_name: "",
    child_name: "",
    child_age: "",
    
    // Bloco B - Diagnóstico & Saúde
    child_profile: [] as string[],
    child_profile_other: "",
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
    joint_attention_pointing: "",
    joint_attention_sharing: "",
    sensory_issue: [] as string[],
    
    // Bloco F - Rotina & Preferências
    screen_time: "",
    home_language: "",
    
    // Novos campos
    attention_shared: "",
    play_type: "",
    previous_therapy: "",
    therapy_description: "",
  });

  const totalSteps = 8;

  const updateFormData = (field: string, value: any) => {
    // Sanitize input based on field type
    let sanitizedValue = value;
    
    if (field === 'parent_name' || field === 'child_name') {
      sanitizedValue = sanitizeName(value);
    } else if (field === 'child_age') {
      try {
        sanitizedValue = value;
        // Validate age immediately for better UX
        if (value && parseInt(value) > 0) {
          sanitizeAge(value);
        }
      } catch (error) {
        setFieldErrors(prev => ({ ...prev, [field]: 'Idade inválida' }));
        return;
      }
    } else if (field === 'child_profile_other' || field === 'therapy_description') {
      sanitizedValue = sanitizeText(value, 500);
    }
    
    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    
    // Validate field if it has content
    if (sanitizedValue && typeof sanitizedValue === 'string' && sanitizedValue.trim()) {
      const fieldValidation = validateField(field, sanitizedValue);
      if (!fieldValidation.isValid && fieldValidation.error) {
        setFieldErrors(prev => ({ ...prev, [field]: fieldValidation.error! }));
      }
    }
    
    setFormData(prev => ({ ...prev, [field]: sanitizedValue }));
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
    // Check rate limiting
    if (!checkFormSubmissionRate('assessment')) {
      toast({
        title: "Muitas tentativas",
        description: "Aguarde alguns minutos antes de enviar novamente.",
        variant: "destructive",
      });
      return;
    }

    // Validate complete form
    const validationResult = validate(formData, 'assessment');
    
    if (!validationResult.isValid) {
      setFieldErrors(validationResult.errors);
      const firstError = Object.values(validationResult.errors)[0];
      toast({
        title: "Dados inválidos",
        description: firstError,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Use sanitized data from validation
      const sanitizedData = validationResult.sanitizedData!;
      
      // Convert age to months for internal processing
      const ageInYears = parseInt(sanitizedData.child_age);
      
      // Get track for child profile and age using corrected profile mapping
      let profileForTrack = '';
      const primaryProfile = formData.child_profile[0] || '';
      
      switch (primaryProfile) {
        case 'Criança típica':
          profileForTrack = 'TYPICO';
          break;
        case 'Atraso ou disfunção de fala':
          profileForTrack = 'ATRASO';
          break;
        case 'TEA':
          profileForTrack = 'TEA';
          break;
        case 'Síndrome de Down':
          profileForTrack = 'DOWN';
          break;
        default:
          profileForTrack = 'TYPICO';
      }
      
      // Determine age range based on years
      let ageRange = '';
      if (ageInYears >= 1 && ageInYears <= 3) {
        ageRange = '1_3';
      } else if (ageInYears >= 4 && ageInYears <= 6) {
        ageRange = '4_6';
      } else if (ageInYears >= 7 && ageInYears <= 10) {
        ageRange = '7_10';
      } else if (ageInYears >= 11 && ageInYears <= 14) {
        ageRange = '11_14';
      } else {
        ageRange = '1_3'; // default
      }
      
      const trackProfile = `${profileForTrack}_${ageRange}`;
      
      // Find track directly from database with improved fallback
      const { data: trackData, error: trackError } = await supabase
        .from('tracks')
        .select('id')
        .eq('profile', trackProfile)
        .single();

      let trackId = null;
      if (trackError || !trackData) {
        // Try fallbacks in order of preference
        const fallbackProfiles = [
          `TYPICO_${ageRange}`, // Try typical for same age range
          'TYPICO_1_3',         // Try typical 1-3 years
          'DOWN_1_3',           // Try Down syndrome 1-3 years
          'TEA_4_6',            // Try TEA 4-6 years
          'ATRASO_4_6'          // Try delay 4-6 years
        ];
        
        for (const fallbackProfile of fallbackProfiles) {
          const { data: fallbackTrack } = await supabase
            .from('tracks')
            .select('id')
            .eq('profile', fallbackProfile)
            .limit(1)
            .single();
            
          if (fallbackTrack) {
            trackId = fallbackTrack.id;
            break;
          }
        }
        
        // Last resort: get any available track
        if (!trackId) {
          const { data: anyTrack } = await supabase
            .from('tracks')
            .select('id')
            .limit(1)
            .single();
          trackId = anyTrack?.id;
        }
      } else {
        trackId = trackData.id;
      }

      // Calculate start level based on speech level
      let startLevel = 'A';
      if (['Não verbal', 'Vocalizações/sílabas (ex.: "ba-ba", "da-da")'].includes(formData.speech_level)) {
        startLevel = 'A';
      } else if (['10 - 50 palavras isoladas (ex.: "água", "mamã")', 'Frases de 2-3 palavras (ex.: "quer biscoito")'].includes(formData.speech_level)) {
        startLevel = 'B';
      } else {
        startLevel = 'C';
      }

      // Generate tags based on responses
      const tagMotricidade = formData.articulation_issue.some(item => item !== "Nenhuma") && formData.articulation_issue.length > 0;
      const tagOralMotor = formData.oral_motor.some(item => item !== "Nenhuma") && formData.oral_motor.length > 0;
      const tagJointAttention = formData.attention_shared === "Baixa (raramente estabelece contato visual)";
      const tagNoise = formData.sensory_issue.includes("Sensível a ruídos altos");

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
          joint_attention: formData.attention_shared,
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
        child_profile: [],
        child_profile_other: "",
        hearing_ok: "",
        speech_level: "",
        articulation_issue: [],
        oral_motor: [],
        comprehension_level: "",
        follow_commands: "",
        joint_attention: "",
        joint_attention_pointing: "",
        joint_attention_sharing: "",
        sensory_issue: [],
        screen_time: "",
        home_language: "",
        attention_shared: "",
        play_type: "",
        previous_therapy: "",
        therapy_description: "",
      });
      setCurrentStep(1);
      
      // Navigate to dashboard after short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
      
    } catch (error: any) {
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
                {fieldErrors.parent_name && (
                  <p className="text-sm text-destructive">{fieldErrors.parent_name}</p>
                )}
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
                {fieldErrors.child_name && (
                  <p className="text-sm text-destructive">{fieldErrors.child_name}</p>
                )}
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
                {fieldErrors.child_age && (
                  <p className="text-sm text-destructive">{fieldErrors.child_age}</p>
                )}
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
                <Label>Perfil clínico da criança (pode escolher mais de uma) *</Label>
                <div className="space-y-2">
                  {["Criança típica", "Atraso ou disfunção de fala", "TEA", "Síndrome de Down"].map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                      <Checkbox
                        id={`profile-${option}`}
                        checked={formData.child_profile.includes(option)}
                        onCheckedChange={(checked) => updateCheckboxArray("child_profile", option, checked as boolean)}
                      />
                      <Label htmlFor={`profile-${option}`}>{option}</Label>
                    </div>
                  ))}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="profile-other"
                      checked={formData.child_profile.includes("Outros")}
                      onCheckedChange={(checked) => updateCheckboxArray("child_profile", "Outros", checked as boolean)}
                    />
                    <Label htmlFor="profile-other">Outros:</Label>
                  </div>
                  {formData.child_profile.includes("Outros") && (
                    <Input
                      value={formData.child_profile_other}
                      onChange={(e) => updateFormData("child_profile_other", e.target.value)}
                      placeholder="Especifique outras comorbidades"
                      className="ml-6"
                    />
                  )}
                </div>
              </div>
              
                <div className="space-y-2">
                <Label>Audição verificada (audiometria dentro da normalidade)? *</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="hearing-yes"
                      checked={formData.hearing_ok === "Sim"}
                      onCheckedChange={(checked) => updateFormData("hearing_ok", checked ? "Sim" : "")}
                    />
                    <Label htmlFor="hearing-yes">Sim</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="hearing-no"
                      checked={formData.hearing_ok === "Não"}
                      onCheckedChange={(checked) => updateFormData("hearing_ok", checked ? "Não" : "")}
                    />
                    <Label htmlFor="hearing-no">Não</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="hearing-unknown"
                      checked={formData.hearing_ok === "Não sei"}
                      onCheckedChange={(checked) => updateFormData("hearing_ok", checked ? "Não sei" : "")}
                    />
                    <Label htmlFor="hearing-unknown">Não sei</Label>
                  </div>
                </div>
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
                <Label>Nível atual de Fala - Melhor descrição *</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="speech-nonverbal"
                      checked={formData.speech_level === "Não verbal"}
                      onCheckedChange={(checked) => updateFormData("speech_level", checked ? "Não verbal" : "")}
                    />
                    <Label htmlFor="speech-nonverbal">Não verbal</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="speech-sounds"
                      checked={formData.speech_level === 'Vocalizações/sílabas (ex.: "ba-ba", "da-da")'}
                      onCheckedChange={(checked) => updateFormData("speech_level", checked ? 'Vocalizações/sílabas (ex.: "ba-ba", "da-da")' : "")}
                    />
                    <Label htmlFor="speech-sounds">Vocalizações/sílabas (ex.: "ba-ba", "da-da")</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="speech-words"
                      checked={formData.speech_level === '10 - 50 palavras isoladas (ex.: "água", "mamã")'}
                      onCheckedChange={(checked) => updateFormData("speech_level", checked ? '10 - 50 palavras isoladas (ex.: "água", "mamã")' : "")}
                    />
                    <Label htmlFor="speech-words">10 - 50 palavras isoladas (ex.: "água", "mamã")</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="speech-short"
                      checked={formData.speech_level === 'Frases de 2-3 palavras (ex.: "quer biscoito")'}
                      onCheckedChange={(checked) => updateFormData("speech_level", checked ? 'Frases de 2-3 palavras (ex.: "quer biscoito")' : "")}
                    />
                    <Label htmlFor="speech-short">Frases de 2-3 palavras (ex.: "quer biscoito")</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="speech-complete"
                      checked={formData.speech_level === 'Frases completas (ex.: "Posso brincar lá fora?")'}
                      onCheckedChange={(checked) => updateFormData("speech_level", checked ? 'Frases completas (ex.: "Posso brincar lá fora?")' : "")}
                    />
                    <Label htmlFor="speech-complete">Frases completas (ex.: "Posso brincar lá fora?")</Label>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Dificuldades de Articulação - Marque todas *</Label>
                <div className="space-y-2">
                  {[
                    'Troca sons (ex.: "tota" por "coca")',
                    'Omite sons (ex.: "apo" por "sapo")',
                    'Fala imprecisa (difícil entender)',
                    'Nenhuma'
                  ].map((option) => (
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
                <Label>Motricidade oral e hábitos - Quais desses itens você observa? *</Label>
                <div className="space-y-2">
                  {[
                    "Baba excessiva",
                    "Dificuldade para mastigar alimentos sólidos",
                    "Dificuldade para soprar/assoprar",
                    "Respira mais pela boca que pelo nariz",
                    "Dificuldade na deglutição",
                    "Usa chupeta/mamadeira ou chupa dedo",
                    "Engasga com frequência",
                    "Nenhuma"
                  ].map((option) => (
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
              <h3 className="text-2xl font-bold">Bloco D - Compreensão de linguagem</h3>
              <p className="text-muted-foreground">O quanto {formData.child_name} entende?</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Compreensão de linguagem *</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="comp-all"
                      checked={formData.comprehension_level === "Entende quase tudo (ordens complexas)"}
                      onCheckedChange={(checked) => updateFormData("comprehension_level", checked ? "Entende quase tudo (ordens complexas)" : "")}
                    />
                    <Label htmlFor="comp-all">Entende quase tudo (ordens complexas)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="comp-simple"
                      checked={formData.comprehension_level === "Entende apenas frases simples (ex.: pegue o sapato)"}
                      onCheckedChange={(checked) => updateFormData("comprehension_level", checked ? "Entende apenas frases simples (ex.: pegue o sapato)" : "")}
                    />
                    <Label htmlFor="comp-simple">Entende apenas frases simples (ex.: pegue o sapato)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="comp-little"
                      checked={formData.comprehension_level === "Entende muito pouco"}
                      onCheckedChange={(checked) => updateFormData("comprehension_level", checked ? "Entende muito pouco" : "")}
                    />
                    <Label htmlFor="comp-little">Entende muito pouco</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="comp-visual"
                      checked={formData.comprehension_level === "Responde apenas a gestões/expressões"}
                      onCheckedChange={(checked) => updateFormData("comprehension_level", checked ? "Responde apenas a gestões/expressões" : "")}
                    />
                    <Label htmlFor="comp-visual">Responde apenas a gestões/expressões</Label>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Segue instruções simples sem ajuda visual? *</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="follow-yes"
                      checked={formData.follow_commands === "Sim"}
                      onCheckedChange={(checked) => updateFormData("follow_commands", checked ? "Sim" : "")}
                    />
                    <Label htmlFor="follow-yes">Sim</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="follow-no"
                      checked={formData.follow_commands === "Não"}
                      onCheckedChange={(checked) => updateFormData("follow_commands", checked ? "Não" : "")}
                    />
                    <Label htmlFor="follow-no">Não</Label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <MessageCircle className="w-12 h-12 text-primary mx-auto" />
              <h3 className="text-2xl font-bold">Comunicação Social (Gestos e Interação)</h3>
              <p className="text-muted-foreground">Aspectos sociais de {formData.child_name}</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Aponta com o dedo para mostrar interesse (ex. apontar para um avião no céu ou um cachorro na rua)? *</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="pointing-always"
                      checked={formData.joint_attention_pointing === "Sempre"}
                      onCheckedChange={(checked) => updateFormData("joint_attention_pointing", checked ? "Sempre" : "")}
                    />
                    <Label htmlFor="pointing-always">Sempre</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="pointing-rarely"
                      checked={formData.joint_attention_pointing === "Raramente"}
                      onCheckedChange={(checked) => updateFormData("joint_attention_pointing", checked ? "Raramente" : "")}
                    />
                    <Label htmlFor="pointing-rarely">Raramente</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="pointing-never"
                      checked={formData.joint_attention_pointing === "Nunca"}
                      onCheckedChange={(checked) => updateFormData("joint_attention_pointing", checked ? "Nunca" : "")}
                    />
                    <Label htmlFor="pointing-never">Nunca</Label>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Traz objetos para você apenas para compartilhar (ex.: mostrar um brinquedo ou um desenho, sem querer que você faça algo)? *</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="sharing-always"
                      checked={formData.joint_attention_sharing === "Sempre"}
                      onCheckedChange={(checked) => updateFormData("joint_attention_sharing", checked ? "Sempre" : "")}
                    />
                    <Label htmlFor="sharing-always">Sempre</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="sharing-rarely"
                      checked={formData.joint_attention_sharing === "Raramente"}
                      onCheckedChange={(checked) => updateFormData("joint_attention_sharing", checked ? "Raramente" : "")}
                    />
                    <Label htmlFor="sharing-rarely">Raramente</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="sharing-never"
                      checked={formData.joint_attention_sharing === "Nunca"}
                      onCheckedChange={(checked) => updateFormData("joint_attention_sharing", checked ? "Nunca" : "")}
                    />
                    <Label htmlFor="sharing-never">Nunca</Label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <Volume2 className="w-12 h-12 text-primary mx-auto" />
              <h3 className="text-2xl font-bold">Interação Social e Comportamento</h3>
              <p className="text-muted-foreground">Comportamento e brincadeiras de {formData.child_name}</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Atenção conjunta (olhar compartilhado) *</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="attention-good"
                      checked={formData.attention_shared === "Boa (olha quando chamada, compartilha interesses)"}
                      onCheckedChange={(checked) => updateFormData("attention_shared", checked ? "Boa (olha quando chamada, compartilha interesses)" : "")}
                    />
                    <Label htmlFor="attention-good">Boa (olha quando chamada, compartilha interesses)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="attention-moderate"
                      checked={formData.attention_shared === "Moderada (responde às vezes)"}
                      onCheckedChange={(checked) => updateFormData("attention_shared", checked ? "Moderada (responde às vezes)" : "")}
                    />
                    <Label htmlFor="attention-moderate">Moderada (responde às vezes)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="attention-low"
                      checked={formData.attention_shared === "Baixa (raramente estabelece contato visual)"}
                      onCheckedChange={(checked) => updateFormData("attention_shared", checked ? "Baixa (raramente estabelece contato visual)" : "")}
                    />
                    <Label htmlFor="attention-low">Baixa (raramente estabelece contato visual)</Label>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Como a criança brinca? *</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="play-functional"
                      checked={formData.play_type === "Brincadeiras funcionais (ex.: empurrar carrinho)"}
                      onCheckedChange={(checked) => updateFormData("play_type", checked ? "Brincadeiras funcionais (ex.: empurrar carrinho)" : "")}
                    />
                    <Label htmlFor="play-functional">Brincadeiras funcionais (ex.: empurrar carrinho)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="play-symbolic"
                      checked={formData.play_type === "Jogos simbólicos (ex.: fingir que cozinha)"}
                      onCheckedChange={(checked) => updateFormData("play_type", checked ? "Jogos simbólicos (ex.: fingir que cozinha)" : "")}
                    />
                    <Label htmlFor="play-symbolic">Jogos simbólicos (ex.: fingir que cozinha)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="play-repetitive"
                      checked={formData.play_type === "Padrões repetitivos (ex.: alinhar brinquedos)"}
                      onCheckedChange={(checked) => updateFormData("play_type", checked ? "Padrões repetitivos (ex.: alinhar brinquedos)" : "")}
                    />
                    <Label htmlFor="play-repetitive">Padrões repetitivos (ex.: alinhar brinquedos)</Label>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Características sensoriais (marque todas) *</Label>
                <div className="space-y-2">
                  {[
                    "Sensível a ruídos altos",
                    "Evita tocar certas texturas (ex.: massinha, areia)",
                    "Seletividade alimentar extrema",
                    "Nenhuma"
                  ].map((option) => (
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

      case 7:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <Home className="w-12 h-12 text-primary mx-auto" />
              <h3 className="text-2xl font-bold">Contexto Familiar e Ambiente</h3>
              <p className="text-muted-foreground">Informações sobre rotina e ambiente</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Idioma(s) falado(s) em casa *</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="lang-pt"
                      checked={formData.home_language === "Apenas Português"}
                      onCheckedChange={(checked) => updateFormData("home_language", checked ? "Apenas Português" : "")}
                    />
                    <Label htmlFor="lang-pt">Apenas Português</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="lang-mixed"
                      checked={formData.home_language === "Português + outro idioma"}
                      onCheckedChange={(checked) => updateFormData("home_language", checked ? "Português + outro idioma" : "")}
                    />
                    <Label htmlFor="lang-mixed">Português + outro idioma</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="lang-other"
                      checked={formData.home_language === "Outro(s) idioma(s)"}
                      onCheckedChange={(checked) => updateFormData("home_language", checked ? "Outro(s) idioma(s)" : "")}
                    />
                    <Label htmlFor="lang-other">Outro(s) idioma(s)</Label>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Tempo de tela diário (TV/Tablet/Celular) *</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="screen-1"
                      checked={formData.screen_time === "Menos de 1 hora"}
                      onCheckedChange={(checked) => updateFormData("screen_time", checked ? "Menos de 1 hora" : "")}
                    />
                    <Label htmlFor="screen-1">Menos de 1 hora</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="screen-2"
                      checked={formData.screen_time === "Entre 1 e 2 horas"}
                      onCheckedChange={(checked) => updateFormData("screen_time", checked ? "Entre 1 e 2 horas" : "")}
                    />
                    <Label htmlFor="screen-2">Entre 1 e 2 horas</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="screen-3"
                      checked={formData.screen_time === "Entre 2 a 3 horas"}
                      onCheckedChange={(checked) => updateFormData("screen_time", checked ? "Entre 2 a 3 horas" : "")}
                    />
                    <Label htmlFor="screen-3">Entre 2 a 3 horas</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="screen-4"
                      checked={formData.screen_time === "Mais de 3 horas"}
                      onCheckedChange={(checked) => updateFormData("screen_time", checked ? "Mais de 3 horas" : "")}
                    />
                    <Label htmlFor="screen-4">Mais de 3 horas</Label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 8:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <Heart className="w-12 h-12 text-primary mx-auto" />
              <h3 className="text-2xl font-bold">Histórico de Terapia</h3>
              <p className="text-muted-foreground">Informações sobre terapias anteriores</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Já fez terapia fonoaudiológica anteriormente? *</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="therapy-yes"
                      checked={formData.previous_therapy === "Sim"}
                      onCheckedChange={(checked) => updateFormData("previous_therapy", checked ? "Sim" : "")}
                    />
                    <Label htmlFor="therapy-yes">Sim</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="therapy-no"
                      checked={formData.previous_therapy === "Não"}
                      onCheckedChange={(checked) => updateFormData("previous_therapy", checked ? "Não" : "")}
                    />
                    <Label htmlFor="therapy-no">Não</Label>
                  </div>
                </div>
              </div>
              
              {formData.previous_therapy === "Sim" && (
                <div className="space-y-2">
                  <Label htmlFor="therapy_description">Breve relato sobre a terapia anterior</Label>
                  <Textarea
                    id="therapy_description"
                    value={formData.therapy_description}
                    onChange={(e) => updateFormData("therapy_description", e.target.value)}
                    placeholder="Descreva brevemente como foi a experiência com a fonoaudiologia anterior..."
                    rows={4}
                  />
                </div>
              )}
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
        return formData.child_profile.length > 0 && 
               formData.hearing_ok !== '';
      case 3: 
        return formData.speech_level !== '' &&
               formData.articulation_issue.length > 0 &&
               formData.oral_motor.length > 0;
      case 4: 
        return formData.comprehension_level !== '' && 
               formData.follow_commands !== '';
      case 5: 
        return formData.joint_attention_pointing !== '' &&
               formData.joint_attention_sharing !== '';
      case 6: 
        return formData.attention_shared !== '' &&
               formData.play_type !== '' &&
               formData.sensory_issue.length > 0;
      case 7: 
        return formData.screen_time !== '' && 
               formData.home_language !== '';
      case 8:
        return formData.previous_therapy !== '';
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