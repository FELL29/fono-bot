import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, CheckCircle, Baby, Brain, MessageCircle } from "lucide-react";

const AssessmentForm = () => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Dados básicos
    childName: "",
    childAge: "",
    parentName: "",
    parentEmail: "",
    parentPhone: "",
    
    // Desenvolvimento
    developmentConcerns: "",
    communicationLevel: "",
    specialNeeds: [],
    currentTherapies: [],
    otherTherapies: "",
    
    // Comportamento e interesses
    childInterests: "",
    attentionSpan: "",
    socialInteraction: "",
    
    // Objetivos
    mainGoals: "",
    additionalInfo: ""
  });

  const totalSteps = 4;

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSpecialNeedsChange = (need: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      specialNeeds: checked 
        ? [...prev.specialNeeds, need]
        : prev.specialNeeds.filter(n => n !== need)
    }));
  };

  const handleTherapyChange = (therapy: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      currentTherapies: checked 
        ? [...prev.currentTherapies, therapy]
        : prev.currentTherapies.filter(t => t !== therapy)
    }));
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
      // Simular envio da avaliação
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Avaliação enviada com sucesso!",
        description: "Em breve você receberá um plano personalizado para seu filho. Verifique seu email!",
      });

      // Reset form
      setFormData({
        childName: "",
        childAge: "",
        parentName: "",
        parentEmail: "",
        parentPhone: "",
        developmentConcerns: "",
        communicationLevel: "",
        specialNeeds: [],
        currentTherapies: [],
        otherTherapies: "",
        childInterests: "",
        attentionSpan: "",
        socialInteraction: "",
        mainGoals: "",
        additionalInfo: ""
      });
      setCurrentStep(1);
    } catch (error) {
      toast({
        title: "Erro ao enviar avaliação",
        description: "Tente novamente ou entre em contato conosco.",
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
              <Baby className="w-12 h-12 text-primary mx-auto" />
              <h3 className="text-2xl font-bold">Informações Básicas</h3>
              <p className="text-muted-foreground">Conte-nos sobre você e seu filho</p>
            </div>
            
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="childName">Nome da criança *</Label>
                <Input
                  id="childName"
                  value={formData.childName}
                  onChange={(e) => updateFormData("childName", e.target.value)}
                  placeholder="Nome do seu filho"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="childAge">Idade da criança *</Label>
                <Select onValueChange={(value) => updateFormData("childAge", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a idade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0-1">0 a 1 ano</SelectItem>
                    <SelectItem value="1-2">1 a 2 anos</SelectItem>
                    <SelectItem value="2-3">2 a 3 anos</SelectItem>
                    <SelectItem value="3-4">3 a 4 anos</SelectItem>
                    <SelectItem value="4-5">4 a 5 anos</SelectItem>
                    <SelectItem value="5-6">5 a 6 anos</SelectItem>
                    <SelectItem value="6-8">6 a 8 anos</SelectItem>
                    <SelectItem value="8-10">8 a 10 anos</SelectItem>
                    <SelectItem value="10-12">10 a 12 anos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="parentName">Seu nome *</Label>
              <Input
                id="parentName"
                value={formData.parentName}
                onChange={(e) => updateFormData("parentName", e.target.value)}
                placeholder="Seu nome completo"
                required
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="parentEmail">Seu email *</Label>
                <Input
                  id="parentEmail"
                  type="email"
                  value={formData.parentEmail}
                  onChange={(e) => updateFormData("parentEmail", e.target.value)}
                  placeholder="seu@email.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="parentPhone">WhatsApp</Label>
                <Input
                  id="parentPhone"
                  value={formData.parentPhone}
                  onChange={(e) => updateFormData("parentPhone", e.target.value)}
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <Brain className="w-12 h-12 text-primary mx-auto" />
              <h3 className="text-2xl font-bold">Desenvolvimento e Necessidades</h3>
              <p className="text-muted-foreground">Ajude-nos a entender o perfil do seu filho</p>
            </div>

            <div className="space-y-2">
              <Label>Você tem alguma preocupação específica sobre o desenvolvimento do seu filho?</Label>
              <RadioGroup 
                value={formData.developmentConcerns} 
                onValueChange={(value) => updateFormData("developmentConcerns", value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="nao" id="concern-no" />
                  <Label htmlFor="concern-no">Não, apenas quero estimular o desenvolvimento</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="leve" id="concern-mild" />
                  <Label htmlFor="concern-mild">Tenho algumas preocupações leves</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="moderada" id="concern-moderate" />
                  <Label htmlFor="concern-moderate">Tenho preocupações moderadas</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="significativa" id="concern-significant" />
                  <Label htmlFor="concern-significant">Tenho preocupações significativas</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>Nível de comunicação atual</Label>
              <Select onValueChange={(value) => updateFormData("communicationLevel", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Como seu filho se comunica atualmente?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pre-verbal">Pré-verbal (gestos, sons)</SelectItem>
                  <SelectItem value="primeiras-palavras">Primeiras palavras</SelectItem>
                  <SelectItem value="frases-simples">Frases simples</SelectItem>
                  <SelectItem value="conversacao-basica">Conversação básica</SelectItem>
                  <SelectItem value="comunicacao-avancada">Comunicação avançada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <Label>O seu filho tem alguma dessas condições? (marque todas que se aplicam)</Label>
              {[
                "Autismo / TEA",
                "Síndrome de Down",
                "Atraso global do desenvolvimento",
                "Deficiência auditiva",
                "Transtorno de linguagem",
                "TDAH",
                "Outros transtornos",
                "Nenhuma das anteriores"
              ].map((need) => (
                <div key={need} className="flex items-center space-x-2">
                  <Checkbox
                    id={need}
                    checked={formData.specialNeeds.includes(need)}
                    onCheckedChange={(checked) => handleSpecialNeedsChange(need, checked as boolean)}
                  />
                  <Label htmlFor={need}>{need}</Label>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <Label>Seu filho já fez alguma terapia? (marque todas que se aplicam)</Label>
              {[
                "Não",
                "Fonoaudiologia",
                "Terapia Ocupacional",
                "Psicologia",
                "Fisioterapia",
                "Psicopedagogia",
                "Musicoterapia"
              ].map((therapy) => (
                <div key={therapy} className="flex items-center space-x-2">
                  <Checkbox
                    id={therapy}
                    checked={formData.currentTherapies.includes(therapy)}
                    onCheckedChange={(checked) => handleTherapyChange(therapy, checked as boolean)}
                  />
                  <Label htmlFor={therapy}>{therapy}</Label>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Label htmlFor="otherTherapies">Outras Terapias</Label>
              <Input
                id="otherTherapies"
                value={formData.otherTherapies}
                onChange={(e) => updateFormData("otherTherapies", e.target.value)}
                placeholder="Especifique outras terapias que seu filho já fez ou faz atualmente"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <MessageCircle className="w-12 h-12 text-primary mx-auto" />
              <h3 className="text-2xl font-bold">Comportamento e Interesses</h3>
              <p className="text-muted-foreground">Vamos personalizar as atividades para seu filho</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="childInterests">Quais são os principais interesses do seu filho?</Label>
              <Textarea
                id="childInterests"
                value={formData.childInterests}
                onChange={(e) => updateFormData("childInterests", e.target.value)}
                placeholder="Ex: carros, animais, música, desenhos animados, jogos..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Tempo de atenção/concentração</Label>
              <RadioGroup 
                value={formData.attentionSpan} 
                onValueChange={(value) => updateFormData("attentionSpan", value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="muito-baixo" id="attention-very-low" />
                  <Label htmlFor="attention-very-low">Muito baixo (menos de 2 minutos)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="baixo" id="attention-low" />
                  <Label htmlFor="attention-low">Baixo (2-5 minutos)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="moderado" id="attention-moderate" />
                  <Label htmlFor="attention-moderate">Moderado (5-10 minutos)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="bom" id="attention-good" />
                  <Label htmlFor="attention-good">Bom (10-20 minutos)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="excelente" id="attention-excellent" />
                  <Label htmlFor="attention-excellent">Excelente (mais de 20 minutos)</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>Como é a interação social do seu filho?</Label>
              <RadioGroup 
                value={formData.socialInteraction} 
                onValueChange={(value) => updateFormData("socialInteraction", value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="evita" id="social-avoids" />
                  <Label htmlFor="social-avoids">Evita contato social</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="limitada" id="social-limited" />
                  <Label htmlFor="social-limited">Interação limitada</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="seletiva" id="social-selective" />
                  <Label htmlFor="social-selective">Seletiva (com pessoas conhecidas)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="ativa" id="social-active" />
                  <Label htmlFor="social-active">Ativa e busca interação</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="muito-ativa" id="social-very-active" />
                  <Label htmlFor="social-very-active">Muito sociável</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <CheckCircle className="w-12 h-12 text-primary mx-auto" />
              <h3 className="text-2xl font-bold">Objetivos e Informações Finais</h3>
              <p className="text-muted-foreground">Quase pronto! Vamos finalizar seu plano personalizado</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mainGoals">Quais são seus principais objetivos para o desenvolvimento do seu filho?</Label>
              <Textarea
                id="mainGoals"
                value={formData.mainGoals}
                onChange={(e) => updateFormData("mainGoals", e.target.value)}
                placeholder="Ex: melhorar a fala, aumentar vocabulário, facilitar comunicação social..."
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="additionalInfo">Informações adicionais (opcional)</Label>
              <Textarea
                id="additionalInfo"
                value={formData.additionalInfo}
                onChange={(e) => updateFormData("additionalInfo", e.target.value)}
                placeholder="Qualquer outra informação que considere importante para entendermos melhor seu filho..."
                rows={3}
              />
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">O que acontece agora?</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>✓ Analisaremos suas respostas com nossa equipe de especialistas</li>
                <li>✓ Criaremos um plano personalizado para seu filho</li>
                <li>✓ Enviaremos por email em até 24 horas</li>
                <li>✓ Você poderá agendar uma consulta gratuita para tirar dúvidas</li>
              </ul>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-soft">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-3xl">Avaliação Personalizada</CardTitle>
          <div className="text-sm text-muted-foreground">
            Etapa {currentStep} de {totalSteps}
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-gradient-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-8">
        {renderStep()}

        <div className="flex justify-between pt-6">
          <Button 
            variant="outline" 
            onClick={prevStep}
            disabled={currentStep === 1}
          >
            Voltar
          </Button>

          {currentStep < totalSteps ? (
            <Button onClick={nextStep}>
              Próximo
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit}
              disabled={isLoading}
              variant="hero"
              size="lg"
            >
              {isLoading ? "Enviando..." : "Finalizar Avaliação"}
              <CheckCircle className="w-5 h-5 ml-2" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AssessmentForm;