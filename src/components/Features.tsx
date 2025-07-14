import { Card, CardContent } from "@/components/ui/card";
import { Users, Brain, Target, Shield } from "lucide-react";

const Features = () => {
  const categories = [
    {
      icon: Users,
      title: "Crianças Típicas",
      description: "Atividades para estimular o desenvolvimento natural da fala e linguagem",
      color: "bg-primary/10 text-primary"
    },
    {
      icon: Brain,
      title: "Síndrome de Down",
      description: "Exercícios adaptados para potencializar as habilidades comunicativas",
      color: "bg-secondary/10 text-secondary"
    },
    {
      icon: Target,
      title: "Espectro Autista",
      description: "Estímulos especializados para comunicação e interação social",
      color: "bg-accent/10 text-accent"
    },
    {
      icon: Shield,
      title: "Transtornos de Linguagem",
      description: "Terapias direcionadas para dificuldades específicas de comunicação",
      color: "bg-primary-glow/10 text-primary"
    }
  ];

  return (
    <section id="recursos" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Atendemos Todas as <span className="bg-gradient-primary bg-clip-text text-transparent">Necessidades</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Nosso bot é especializado em oferecer atividades personalizadas para diferentes perfis 
            de desenvolvimento infantil, sempre com base científica e acompanhamento profissional.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => {
            const IconComponent = category.icon;
            return (
              <Card key={index} className="hover:shadow-soft transition-all duration-300 border-border/50">
                <CardContent className="p-6 text-center space-y-4">
                  <div className={`w-16 h-16 mx-auto rounded-xl ${category.color} flex items-center justify-center`}>
                    <IconComponent className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">{category.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {category.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <div className="bg-card rounded-2xl p-8 shadow-soft max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold mb-4 text-foreground">
              Como Funciona Nosso Sistema de Avaliação?
            </h3>
            <p className="text-muted-foreground text-lg leading-relaxed mb-6">
              Através de um questionário inicial cientificamente validado, identificamos o perfil 
              único da sua criança e criamos uma trilha personalizada de atividades que evoluem 
              conforme o progresso.
            </p>
            <div className="grid md:grid-cols-3 gap-6 mt-8">
              <div className="space-y-2">
                <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center text-primary-foreground font-bold mx-auto">1</div>
                <h4 className="font-semibold">Avaliação</h4>
                <p className="text-sm text-muted-foreground">Questionário personalizado</p>
              </div>
              <div className="space-y-2">
                <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center text-primary-foreground font-bold mx-auto">2</div>
                <h4 className="font-semibold">Trilha</h4>
                <p className="text-sm text-muted-foreground">Atividades sob medida</p>
              </div>
              <div className="space-y-2">
                <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center text-primary-foreground font-bold mx-auto">3</div>
                <h4 className="font-semibold">Evolução</h4>
                <p className="text-sm text-muted-foreground">Acompanhamento contínuo</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;