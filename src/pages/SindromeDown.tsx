import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, ArrowLeft, CheckCircle, Heart, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const SindromeDown = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <Header />
      
      <section className="py-20 bg-gradient-to-br from-secondary/5 via-background to-secondary/10">
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
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-secondary/10 flex items-center justify-center">
                <Brain className="w-10 h-10 text-secondary" />
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-6">
                <span className="bg-gradient-to-r from-secondary to-secondary/80 bg-clip-text text-transparent">
                  Síndrome de Down
                </span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Exercícios especializados e adaptados para potencializar as habilidades comunicativas de crianças com Síndrome de Down.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <Card className="border-border/50">
                <CardContent className="p-8">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0">
                      <Brain className="w-6 h-6 text-secondary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-3">Características Específicas</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        Crianças com Síndrome de Down apresentam características físicas e cognitivas que 
                        influenciam o desenvolvimento da fala, como hipotonia muscular e alterações anatômicas 
                        que requerem estímulos específicos e adaptados.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardContent className="p-8">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <Heart className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-3">Potencial de Desenvolvimento</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        Com estímulos adequados e intervenção precoce, crianças com Síndrome de Down 
                        podem desenvolver habilidades comunicativas significativas, melhorando sua 
                        qualidade de vida e autonomia.
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
                    <CheckCircle className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                    <p className="text-muted-foreground">
                      <strong>Acesso limitado a especialistas:</strong> Dificuldade de encontrar fonoaudiólogos especializados em Síndrome de Down.
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                    <p className="text-muted-foreground">
                      <strong>Falta de atividades adaptadas:</strong> Escassez de recursos específicos para as necessidades desta condição.
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                    <p className="text-muted-foreground">
                      <strong>Custo elevado do tratamento:</strong> Terapias especializadas frequentemente têm valores inacessíveis para muitas famílias.
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                    <p className="text-muted-foreground">
                      <strong>Informações conflitantes:</strong> Orientações contraditórias sobre métodos de estimulação mais eficazes.
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                    <p className="text-muted-foreground">
                      <strong>Falta de acompanhamento contínuo:</strong> Interrupções no processo terapêutico por questões logísticas ou financeiras.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-secondary/5 to-secondary/10 border-secondary/20">
              <CardContent className="p-8 text-center">
                <h2 className="text-2xl font-bold mb-6">A Solução FonoBot</h2>
                <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                  Desenvolvemos protocolos específicos para crianças com Síndrome de Down, com atividades 
                  que respeitam suas características e potencializam suas habilidades. Nosso sistema oferece 
                  exercícios adaptados, orientação familiar especializada e acompanhamento profissional 
                  acessível via WhatsApp, garantindo continuidade no desenvolvimento comunicativo.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    onClick={() => navigate('/assessment?profile=down')}
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

export default SindromeDown;