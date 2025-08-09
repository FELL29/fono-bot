import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Brain, Target, Shield, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Features = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Brain,
      title: "Estimula a linguagem",
      description: "Atividades especializadas para desenvolver habilidades de comunicação"
    },
    {
      icon: Target,
      title: "Personaliza atividades", 
      description: "Exercícios adaptados para cada criança baseados na avaliação inicial"
    },
    {
      icon: Users,
      title: "Acompanha progresso",
      description: "Monitore o desenvolvimento e celebrate cada conquista"
    }
  ];

  return (
    <section id="recursos" className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground">
            Como Funciona
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div key={index} className="text-center space-y-4">
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-primary/10 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center">
                    <IconComponent className="w-8 h-8 text-primary-foreground" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-card rounded-3xl p-8 shadow-soft border border-border/50">
            <div className="flex items-start space-x-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-muted flex-shrink-0 overflow-hidden">
                <div className="w-full h-full bg-gradient-secondary rounded-full"></div>
              </div>
              <div className="flex-1">
                <div className="bg-muted/50 rounded-2xl p-4 relative">
                  <p className="text-foreground">
                    Nossa filha adora usar a TiaFono! Estamos muito felizes com o progresso.
                  </p>
                  <div className="flex items-center mt-2">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-accent text-lg">★</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="w-12 h-12 flex-shrink-0">
                <div className="w-full h-full rounded-full bg-primary/10 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-primary-foreground text-xs">😊</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <div className="bg-gradient-primary rounded-2xl p-8 text-center">
            <h3 className="text-2xl font-bold text-primary-foreground mb-4">
              Comece hoje a estimular o desenvolvimento de forma divertida.
            </h3>
            <Button 
              size="lg" 
              variant="secondary" 
              className="text-lg px-8 py-6"
              onClick={() => navigate('/avaliacao')}
            >
              Experimente Grátis
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;