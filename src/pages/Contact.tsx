import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, MapPin, Clock, MessageCircle, Heart } from "lucide-react";
import { useState } from "react";

const Contact = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    childAge: "",
    concernType: "",
    message: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simular envio (aqui você integraria com um backend real)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Mensagem enviada com sucesso!",
        description: "Entraremos em contato em até 24 horas. Obrigado pela confiança!",
      });

      // Limpar formulário
      setFormData({
        name: "",
        email: "",
        phone: "",
        childAge: "",
        concernType: "",
        message: ""
      });
    } catch (error) {
      toast({
        title: "Erro ao enviar mensagem",
        description: "Tente novamente ou entre em contato pelo WhatsApp.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const contactInfo = [
    {
      icon: Mail,
      title: "Email",
      details: "contato@fonobot.com.br",
      description: "Respondemos em até 24h"
    },
    {
      icon: Phone,
      title: "WhatsApp",
      details: "(11) 99999-9999",
      description: "Atendimento de seg a sex, 9h às 18h"
    },
    {
      icon: MapPin,
      title: "Localização",
      details: "São Paulo, SP",
      description: "Atendimento 100% online"
    },
    {
      icon: Clock,
      title: "Horário",
      details: "Segunda a Sexta: 9h às 18h",
      description: "Sábado: 9h às 12h"
    }
  ];

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-background via-muted/30 to-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
              Entre em <span className="bg-gradient-primary bg-clip-text text-transparent">Contato</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Estamos aqui para ajudar no desenvolvimento do seu filho. 
              Fale conosco e descubra como podemos apoiar vocês nessa jornada.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            
            {/* Contact Form */}
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <MessageCircle className="w-6 h-6 text-primary" />
                  Fale Conosco
                </CardTitle>
                <p className="text-muted-foreground">
                  Preencha o formulário e nossa equipe entrará em contato para uma consulta personalizada.
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome Completo *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        placeholder="Seu nome completo"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder="seu@email.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">WhatsApp</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="childAge">Idade da Criança</Label>
                      <Select onValueChange={(value) => handleInputChange("childAge", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a idade" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0-2">0 a 2 anos</SelectItem>
                          <SelectItem value="3-5">3 a 5 anos</SelectItem>
                          <SelectItem value="6-8">6 a 8 anos</SelectItem>
                          <SelectItem value="9-12">9 a 12 anos</SelectItem>
                          <SelectItem value="13+">13+ anos</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="concernType">Principal Interesse</Label>
                    <Select onValueChange={(value) => handleInputChange("concernType", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="O que mais te preocupa?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="desenvolvimento-tipico">Desenvolvimento Típico</SelectItem>
                        <SelectItem value="atraso-fala">Atraso na Fala</SelectItem>
                        <SelectItem value="autismo">Transtorno do Espectro Autista</SelectItem>
                        <SelectItem value="sindrome-down">Síndrome de Down</SelectItem>
                        <SelectItem value="dificuldades-linguagem">Dificuldades de Linguagem</SelectItem>
                        <SelectItem value="avaliacao-geral">Avaliação Geral</SelectItem>
                        <SelectItem value="outros">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Mensagem *</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleInputChange("message", e.target.value)}
                      placeholder="Conte-nos mais sobre sua situação e como podemos ajudar..."
                      rows={4}
                      required
                    />
                  </div>

                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? "Enviando..." : "Enviar Mensagem"}
                    <Heart className="w-5 h-5 ml-2" />
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <div className="space-y-6">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">
                  Como Podemos <span className="bg-gradient-primary bg-clip-text text-transparent">Ajudar</span>
                </h2>
                <p className="text-muted-foreground text-lg">
                  Nossa equipe especializada está pronta para orientar você sobre o melhor 
                  caminho para o desenvolvimento da comunicação do seu filho.
                </p>
              </div>

              <div className="grid gap-4">
                {contactInfo.map((info, index) => {
                  const IconComponent = info.icon;
                  return (
                    <Card key={index} className="hover:shadow-soft transition-all duration-300">
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                            <IconComponent className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{info.title}</h3>
                            <p className="text-foreground font-medium">{info.details}</p>
                            <p className="text-muted-foreground text-sm">{info.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <Card className="bg-gradient-primary text-primary-foreground">
                <CardContent className="p-6 text-center">
                  <h3 className="text-xl font-bold mb-2">Atendimento Especializado</h3>
                  <p className="mb-4">
                    Primeira consulta gratuita para conhecer melhor suas necessidades
                  </p>
                  <Button variant="secondary" size="lg">
                    <Phone className="w-5 h-5 mr-2" />
                    Agendar Consulta Gratuita
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;