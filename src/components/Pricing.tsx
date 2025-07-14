import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

const Pricing = () => {
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
  
  const plans = [
    {
      name: "Essencial",
      subtitle: "Para começar",
      price: "R$ 29",
      period: "/mês",
      activities: "1 atividade por semana",
      description: "Perfeito para famílias que querem começar com estímulos fonoaudiológicos",
      features: [
        "1 atividade semanal personalizada",
        "Avaliação inicial completa",
        "Materiais para impressão",
        "Suporte via chat",
        "Relatórios mensais"
      ],
      popular: false,
      cta: "Começar Agora"
    },
    {
      name: "Desenvolvimento",
      subtitle: "Mais popular",
      price: "R$ 69",
      period: "/mês",
      activities: "3 atividades por semana",
      description: "Ideal para crianças que precisam de estímulos mais frequentes",
      features: [
        "3 atividades semanais personalizadas",
        "Avaliação inicial + reavaliações",
        "Materiais para impressão",
        "Suporte prioritário via chat",
        "Relatórios quinzenais",
        "Vídeos demonstrativos",
        "Acesso a especialistas"
      ],
      popular: true,
      cta: "Começar Agora"
    },
    {
      name: "Intensivo",
      subtitle: "Máximo desenvolvimento",
      price: "R$ 99",
      period: "/mês",
      activities: "5 atividades por semana",
      description: "Para casos que requerem intervenção intensiva e acompanhamento próximo",
      features: [
        "5 atividades semanais personalizadas",
        "Avaliações contínuas",
        "Materiais para impressão",
        "Suporte 24/7 via chat e telefone",
        "Relatórios semanais",
        "Vídeos demonstrativos",
        "Consultoria com fonoaudiólogos",
        "Planos familiares personalizados"
      ],
      popular: false,
      cta: "Começar Agora"
    }
  ];

  return (
    <section id="precos" className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Escolha o <span className="bg-gradient-primary bg-clip-text text-transparent">Plano Ideal</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Todos os planos incluem atividades desenvolvidas por fonoaudiólogos especialistas, 
            personalizadas para as necessidades específicas da sua criança.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={`relative overflow-hidden transition-all duration-300 hover:shadow-soft cursor-pointer ${
                selectedPlan === index
                  ? 'ring-2 ring-accent shadow-warm scale-105'
                  : plan.popular 
                    ? 'ring-2 ring-primary shadow-glow scale-105' 
                    : 'hover:scale-102'
              }`}
              onClick={() => setSelectedPlan(index)}
            >
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0 bg-gradient-primary text-primary-foreground text-center py-2 text-sm font-semibold">
                  <Star className="w-4 h-4 inline mr-1" />
                  Mais Popular
                </div>
              )}
              
              <CardHeader className={`text-center ${plan.popular ? 'pt-12' : 'pt-6'} pb-6`}>
                <div className="space-y-2">
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{plan.subtitle}</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-baseline justify-center space-x-1">
                    <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  <p className="text-sm font-medium text-primary">{plan.activities}</p>
                </div>
                
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {plan.description}
                </p>
              </CardHeader>

              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start space-x-3">
                      <div className="w-5 h-5 bg-secondary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-secondary-foreground" />
                      </div>
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  className="w-full" 
                  variant={selectedPlan === index ? "warm" : plan.popular ? "hero" : "default"}
                  size="lg"
                  asChild
                >
                  <Link to="/avaliacao">
                    {plan.cta}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-muted-foreground mb-4">
            Não tem certeza qual plano escolher? Comece com nossa avaliação gratuita!
          </p>
          <Button variant="warm" size="lg" asChild>
            <Link to="/avaliacao">
              Fazer Avaliação Gratuita
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Pricing;