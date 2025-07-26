import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AssessmentForm from "@/components/AssessmentForm";
import { ConsentModal } from "@/components/ConsentModal";
import { useAuth } from '@/contexts/AuthContext';

const Assessment = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [consentsAccepted, setConsentsAccepted] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    // Verificar se o usuário já aceitou os consentimentos
    const savedConsents = localStorage.getItem('fonobot_consents');
    if (savedConsents) {
      const consents = JSON.parse(savedConsents);
      setConsentsAccepted(true);
    } else {
      setShowConsentModal(true);
    }
  }, [user, navigate]);

  const handleConsentAccept = () => {
    setConsentsAccepted(true);
    setShowConsentModal(false);
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      <section className="pt-24 pb-20 bg-gradient-to-br from-background via-muted/30 to-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-6">
              Avaliação <span className="bg-gradient-primary bg-clip-text text-transparent">Personalizada</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Responda algumas perguntas sobre seu filho e receba um plano de exercícios 
              de fonoaudiologia totalmente personalizado, desenvolvido por especialistas.
            </p>
          </div>
          
          {consentsAccepted ? (
            <AssessmentForm />
          ) : (
            <div className="max-w-2xl mx-auto text-center py-12">
              <div className="bg-card rounded-lg shadow-soft p-8">
                <h2 className="text-2xl font-bold mb-4">Consentimento Necessário</h2>
                <p className="text-muted-foreground mb-6">
                  Para continuar com a avaliação personalizada, precisamos do seu consentimento 
                  para processar os dados conforme a LGPD (Lei Geral de Proteção de Dados).
                </p>
                <button 
                  onClick={() => setShowConsentModal(true)}
                  className="bg-primary text-primary-foreground px-8 py-3 rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Revisar Consentimentos
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
      
      <ConsentModal 
        isOpen={showConsentModal}
        onClose={() => setShowConsentModal(false)}
        onAccept={handleConsentAccept}
      />
    </div>
  );
};

export default Assessment;