import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Target, ArrowLeft, CheckCircle, Heart, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const EspectroAutista = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <Header />
      
      <section className="py-20 bg-gradient-to-br from-accent/5 via-background to-accent/10">
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
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-accent/10 flex items-center justify-center">
                <Target className="w-10 h-10 text-accent" />
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-6">
                <span className="bg-gradient-to-r from-accent to-accent/80 bg-clip-text text-transparent">
                  Transtorno do Espectro Autista
                </span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Estímulos especializados para desenvolver comunicação e interação social em crianças no espectro autista.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <Card className="border-border/50">
                <CardContent className="p-8">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <Target className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-3">Características do TEA</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        O Transtorno do Espectro Autista envolve desafios na comunicação social, 
                        comportamentos repetitivos e interesses restritos. Cada criança apresenta 
                        um perfil único que requer intervenções personalizadas e específicas.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardContent className="p-8">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-3">Comunicação e Interação</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        Focamos no desenvolvimento de habilidades comunicativas funcionais, 
                        desde comunicação não-verbal até o desenvolvimento da linguagem oral, 
                        sempre respeitando o ritmo e preferências de cada criança.
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
                    <CheckCircle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                    <p className="text-muted-foreground">
                      <strong>Diagnóstico tardio:</strong> Muitas famílias enfrentam longos processos até receberem o diagnóstico e orientações adequadas.
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                    <p className="text-muted-foreground">
                      <strong>Falta de profissionais especializados:</strong> Escassez de terapeutas com formação específica em TEA.
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                    <p className="text-muted-foreground">
                      <strong>Métodos não personalizados:</strong> Abordagens padronizadas que não consideram as particularidades de cada criança.
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                    <p className="text-muted-foreground">
                      <strong>Sobrecarga emocional:</strong> Famílias enfrentam estresse e ansiedade sem suporte adequado durante o processo.
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                    <p className="text-muted-foreground">
                      <strong>Custo das terapias:</strong> Tratamentos multidisciplinares representam alto investimento financeiro para as famílias.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-accent/5 to-accent/10 border-accent/20">
              <CardContent className="p-8 text-center">
                <h2 className="text-2xl font-bold mb-6">A Solução FonoBot</h2>
                <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                  Criamos trilhas personalizadas para crianças no espectro autista, com vídeos didáticos 
                  específicos para desenvolvimento da comunicação funcional. Capacitamos você para ser 
                  o estimulador diário do seu filho.
                </p>
                
                <div className="grid md:grid-cols-2 gap-6 my-8">
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="font-semibold mb-2">🔄 Rotinas Estruturadas</h3>
                      <p className="text-sm text-muted-foreground">
                        Exercícios adaptados ao perfil sensorial e comunicativo
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="font-semibold mb-2">🎯 Comunicação Funcional</h3>
                      <p className="text-sm text-muted-foreground">
                        Técnicas visuais para facilitar a expressão e compreensão
                      </p>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    onClick={() => navigate('/assessment?profile=tea')}
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

export default EspectroAutista;