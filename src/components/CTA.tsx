import { Button } from "@/components/ui/button";
import { ArrowRight, MessageCircle, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import tiaFonoCharacter from "@/assets/tiafono-character-new.png";

const CTA = () => {
  return (
    <section className="py-20 bg-gradient-primary">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 text-center lg:text-left">
            <div className="space-y-4">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-foreground">
                Comece hoje a estimular o desenvolvimento de forma divertida.
              </h2>
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
            <div className="relative z-10 flex justify-center">
              <img 
                src={tiaFonoCharacter} 
                alt="TiaFono - Assistente de Fonoaudiologia"
                className="w-80 h-80 object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;