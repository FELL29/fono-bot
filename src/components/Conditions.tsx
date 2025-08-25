import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Brain, Sparkles, Users, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Conditions = () => {
  const conditions = [
    {
      icon: Users,
      title: "Crianças Típicas",
      description: "Desenvolvimento natural da linguagem com estímulos adequados para cada fase",
      href: "/criancas-tipicas",
      color: "from-blue-500/20 to-cyan-500/20",
      iconColor: "text-blue-600"
    },
    {
      icon: Sparkles,
      title: "Espectro Autista (TEA)",
      description: "Abordagem especializada para comunicação e interação social",
      href: "/espectro-autista",
      color: "from-purple-500/20 to-pink-500/20",
      iconColor: "text-purple-600"
    },
    {
      icon: Heart,
      title: "Síndrome de Down",
      description: "Exercícios adaptados considerando as características específicas",
      href: "/sindrome-down",
      color: "from-green-500/20 to-emerald-500/20",
      iconColor: "text-green-600"
    },
    {
      icon: Brain,
      title: "Transtornos da Linguagem",
      description: "Terapia direcionada para diferentes tipos de alterações na comunicação",
      href: "/transtornos-linguagem",
      color: "from-orange-500/20 to-red-500/20",
      iconColor: "text-orange-600"
    }
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground">
            A quem se aplica
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            O FonoBot com a TiaFono atende diferentes perfis de desenvolvimento, 
            oferecendo atividades personalizadas para cada necessidade específica
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {conditions.map((condition, index) => {
            const IconComponent = condition.icon;
            return (
              <Card key={index} className="group hover:shadow-glow transition-all duration-300 border-border/50 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-6 text-center space-y-4">
                  <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-br ${condition.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className={`w-8 h-8 ${condition.iconColor}`} />
                  </div>
                  
                  <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                    {condition.title}
                  </h3>
                  
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {condition.description}
                  </p>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="mt-4 text-primary hover:text-primary-foreground hover:bg-primary"
                    asChild
                  >
                    <Link to={condition.href}>
                      Saiba mais
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-6">
            Não tem certeza qual perfil se adapta melhor à sua criança?
          </p>
          <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground" asChild>
            <Link to="/avaliacao">
              Fazer Avaliação Gratuita
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Conditions;