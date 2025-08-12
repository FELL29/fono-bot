import { useEffect } from "react";
import Header from "@/components/Header";
import Pricing from "@/components/Pricing";
import Footer from "@/components/Footer";

const Precos = () => {
  useEffect(() => {
    document.title = 'Planos e Preços | FonoBot';
    const desc = 'Planos de fonoaudiologia personalizados. Teste gratuito e escolha o melhor para sua família.';
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', desc);
  }, []);

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Pricing />
      </main>
      <Footer />
    </div>
  );
};

export default Precos;
