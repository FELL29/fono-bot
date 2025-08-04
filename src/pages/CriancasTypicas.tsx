import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users, ArrowLeft, CheckCircle, Heart, Brain } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const CriancasTypicas = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <Header />
      
      <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-primary-glow/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="mb-8"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Início
          </Button>

          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Users className="w-10 h-10 text-primary" />
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-6">
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  Crianças Típicas
                </span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Estimulando o desenvolvimento natural da fala e linguagem através de atividades lúdicas e científicamente embasadas.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <Card className="border-border/50">
                <CardContent className="p-8">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Brain className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-3">Desenvolvimento Natural</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        Crianças com desenvolvimento típico seguem marcos previsíveis na aquisição da linguagem. 
                        Nosso foco é potencializar esse processo natural através de estímulos adequados para cada faixa etária.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardContent className="p-8">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0">
                      <Heart className="w-6 h-6 text-secondary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-3">Importância da Estimulação</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        Mesmo em desenvolvimento típico, a estimulação adequada nos primeiros anos de vida 
                        é fundamental para maximizar o potencial comunicativo e cognitivo da criança.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-muted/30 border-border/50 mb-12">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-6 text-center">Desafios das Famílias</h2>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-muted-foreground">
                      <strong>Falta de orientação especializada:</strong> Muitos pais não sabem como estimular adequadamente o desenvolvimento da fala em casa.
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-muted-foreground">
                      <strong>Atividades inadequadas para a idade:</strong> Uso de estímulos que não respeitam o desenvolvimento neurológico da criança.
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-muted-foreground">
                      <strong>Acompanhamento irregular:</strong> Dificuldade de acesso a profissionais especializados para orientação contínua.
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-muted-foreground">
                      <strong>Sobrecarga de informações:</strong> Excesso de conteúdo contraditório na internet sobre desenvolvimento infantil.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-primary/5 to-primary-glow/5 border-primary/20">
              <CardContent className="p-8 text-center">
                <h2 className="text-2xl font-bold mb-6">A Solução FonoBot</h2>
                <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                  Nosso sistema inteligente oferece atividades personalizadas baseadas na idade e desenvolvimento 
                  da criança, com orientações claras para os pais e acompanhamento profissional via WhatsApp. 
                  Transformamos o aprendizado em uma experiência divertida e eficaz.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    onClick={() => navigate('/assessment?profile=typico')}
                    className="px-8"
                  >
                    Iniciar Avaliação
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/pricing')}
                  >
                    Ver Planos
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CriancasTypicas;