import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, ArrowLeft, CheckCircle, Heart, Brain } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const TranstornosLinguagem = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <Header />
      
      <section className="py-20 bg-gradient-to-br from-primary-glow/5 via-background to-primary/5">
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
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-primary-glow/10 flex items-center justify-center">
                <Shield className="w-10 h-10 text-primary" />
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-6">
                <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                  Transtornos de Linguagem
                </span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Terapias direcionadas e especializadas para superar dificuldades específicas de comunicação e linguagem.
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
                      <h3 className="text-xl font-semibold mb-3">Tipos de Transtornos</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        Incluem atraso na linguagem, distúrbios fonológicos, disfluência (gagueira), 
                        apraxia de fala e outras alterações que impactam a comunicação efetiva da criança, 
                        cada um requerendo abordagens terapêuticas específicas.
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
                      <h3 className="text-xl font-semibold mb-3">Intervenção Precoce</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        A identificação e intervenção precoces são fundamentais para o sucesso 
                        terapêutico. Quanto mais cedo iniciamos o trabalho, melhores são os 
                        resultados no desenvolvimento comunicativo da criança.
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
                      <strong>Identificação tardia:</strong> Muitos transtornos passam despercebidos nos primeiros anos, atrasando o início do tratamento.
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-muted-foreground">
                      <strong>Falta de orientação domiciliar:</strong> Pais não sabem como continuar os estímulos terapêuticos em casa.
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-muted-foreground">
                      <strong>Listas de espera extensas:</strong> Demora para conseguir atendimento fonoaudiológico especializado no SUS.
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-muted-foreground">
                      <strong>Ansiedade familiar:</strong> Preocupação constante com o desenvolvimento da criança sem saber como ajudar efetivamente.
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-muted-foreground">
                      <strong>Tratamentos descontinuados:</strong> Interrupções na terapia por questões financeiras ou de disponibilidade.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-primary/5 to-primary-glow/10 border-primary/20">
              <CardContent className="p-8 text-center">
                <h2 className="text-2xl font-bold mb-6">A Solução FonoBot</h2>
                <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                  Desenvolvemos trilhas específicas para transtornos de linguagem, com vídeos didáticos 
                  que ensinam técnicas terapêuticas adaptadas. Transformamos você no principal 
                  agente de intervenção precoce do seu filho.
                </p>
                
                <div className="grid md:grid-cols-2 gap-6 my-8">
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="font-semibold mb-2">⚡ Intervenção Precoce</h3>
                      <p className="text-sm text-muted-foreground">
                        Estratégias específicas para cada tipo de transtorno
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="font-semibold mb-2">📈 Progresso Contínuo</h3>
                      <p className="text-sm text-muted-foreground">
                        Exercícios progressivos adaptados ao ritmo da criança
                      </p>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    onClick={() => navigate('/assessment?profile=atraso')}
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

export default TranstornosLinguagem;