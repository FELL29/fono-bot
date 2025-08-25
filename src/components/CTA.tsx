import { Button } from "@/components/ui/button";
import { ArrowRight, MessageCircle, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import tiaFonoCharacter from "@/assets/tiafono-character-branded.png";

const CTA = () => {
  return (
    <section className="py-20 bg-gradient-primary">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 text-center lg:text-left">
            <div className="space-y-4">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-foreground">
                Descubra o poder do FonoBot com a TiaFono
              </h2>
              <p className="text-lg text-primary-foreground/90 mt-4">
                A terapeuta virtual que transforma o desenvolvimento da linguagem em diversão
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-6" asChild>
                <Link to="/avaliacao">
                  Experimente Grátis
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-secondary rounded-full opacity-15 blur-3xl animate-pulse-glow"></div>
            <div className="relative z-10 flex justify-center">
              <img 
                src={tiaFonoCharacter} 
                alt="TiaFono - Assistente de Fonoaudiologia"
                className="w-80 h-80 object-contain animate-gentle-bounce hover:animate-float transition-all duration-300"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;