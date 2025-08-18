import { Button } from "@/components/ui/button";
import { ArrowRight, Heart, Star } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/tiafono-character-branded.png";

const Hero = () => {
  return (
    <section className="pt-24 pb-16 bg-gradient-to-br from-background via-muted/30 to-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-sm">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                  ))}
                </div>
                <span className="text-muted-foreground">Confiado por +1000 famílias</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                <span className="text-foreground">A</span>{" "}
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  TiaFono
                </span>{" "}
                <span className="text-foreground">ajuda crianças a se comunicarem melhor todos os dias.</span>
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed max-w-xl">
                Comece hoje a estimular o desenvolvimento de forma divertida.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" variant="hero" className="text-lg px-8 py-6" asChild>
                <Link to="/avaliacao">
                  Comece Agora
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-8 py-6 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                onClick={() => window.open('https://www.youtube.com/watch?v=demo', '_blank')}
              >
                Ver Demonstração
              </Button>
            </div>

            <div className="flex items-center space-x-6 pt-4">
              <div className="flex items-center space-x-2">
                <Heart className="w-5 h-5 text-accent" />
                <span className="text-sm text-muted-foreground">100% seguro e confiável</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 bg-secondary rounded-full flex items-center justify-center">
                  <span className="text-xs text-secondary-foreground font-semibold">✓</span>
                </div>
                <span className="text-sm text-muted-foreground">Aprovado por especialistas</span>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-primary rounded-full opacity-20 blur-2xl animate-pulse-glow"></div>
            <div className="relative z-10">
              <img 
                src={heroImage} 
                alt="FonoBot - Assistente de Fonoaudiologia"
                className="w-full h-auto rounded-2xl shadow-glow animate-float hover:animate-gentle-bounce transition-all duration-300"
              />
            </div>
            <div className="absolute -top-4 -right-4 w-full h-full bg-gradient-secondary rounded-2xl opacity-20 -z-10"></div>
            <div className="absolute -bottom-4 -left-4 w-full h-full bg-gradient-warm rounded-2xl opacity-15 -z-20"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;