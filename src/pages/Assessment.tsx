import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AssessmentForm from "@/components/AssessmentForm";

const Assessment = () => {
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
          
          <AssessmentForm />
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Assessment;