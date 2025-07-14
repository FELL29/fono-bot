import { Button } from "@/components/ui/button";
import { ArrowRight, MessageCircle, Phone } from "lucide-react";
import { Link } from "react-router-dom";

const CTA = () => {
  return (
    <section className="py-20 bg-gradient-hero">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
              Pronto para transformar o desenvolvimento do seu filho?
            </h2>
            <p className="text-xl text-white/90 leading-relaxed max-w-3xl mx-auto">
              Junte-se a mais de 1.000 famílias que já estão vendo resultados incríveis 
              com nossos exercícios de fonoaudiologia personalizados.
            </p>
          </div>

           <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6" asChild>
              <Link to="/avaliacao">
                Começar Avaliação Gratuita
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg px-8 py-6 bg-white/10 text-white border-white/30 hover:bg-white/20"
              asChild
            >
              <Link to="/contato">
                Falar com Especialista
                <MessageCircle className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-12 pt-8 border-t border-white/20">
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-white">7 dias</div>
              <div className="text-white/80">Teste gratuito</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-white">1000+</div>
              <div className="text-white/80">Famílias atendidas</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-white">95%</div>
              <div className="text-white/80">Taxa de satisfação</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;