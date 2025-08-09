import { MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import fonoBotIcon from "@/assets/fonobot-icon.png";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 flex items-center justify-center">
                <img src={fonoBotIcon} alt="FonoBot" className="w-8 h-8" />
              </div>
              <span className="text-xl font-bold">FonoBot</span>
            </Link>
            <p className="text-background/70 text-sm leading-relaxed">
              Transformando o desenvolvimento da comunicação infantil através de 
              tecnologia e expertise fonoaudiológica.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Produto</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/#recursos" className="text-background/70 hover:text-background transition-colors">Como Funciona</a></li>
              <li><a href="/#precos" className="text-background/70 hover:text-background transition-colors">Planos</a></li>
              <li><Link to="/sobre" className="text-background/70 hover:text-background transition-colors">Especialidades</Link></li>
              <li><Link to="/sobre" className="text-background/70 hover:text-background transition-colors">Resultados</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Suporte</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/contato" className="text-background/70 hover:text-background transition-colors">Central de Ajuda</Link></li>
              <li><Link to="/contato" className="text-background/70 hover:text-background transition-colors">Contato</Link></li>
              <li><Link to="/contato" className="text-background/70 hover:text-background transition-colors">Dúvidas Frequentes</Link></li>
              <li><Link to="/sobre" className="text-background/70 hover:text-background transition-colors">Blog</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/privacidade" className="text-background/70 hover:text-background transition-colors">Política de Privacidade</Link></li>
              <li><Link to="/termos" className="text-background/70 hover:text-background transition-colors">Termos de Uso</Link></li>
              <li><Link to="/privacidade" className="text-background/70 hover:text-background transition-colors">LGPD</Link></li>
              <li><Link to="/contato" className="text-background/70 hover:text-background transition-colors">Cookies</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-background/20 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-background/70 text-sm">
            © 2024 FonoBot. Todos os direitos reservados.
          </p>
          <p className="text-background/70 text-sm mt-4 md:mt-0">
            Desenvolvido com ❤️ para o desenvolvimento infantil
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;