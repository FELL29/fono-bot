import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Target, Heart, Award } from "lucide-react";

const About = () => {
  const team = [
    {
      name: "Dra. Ana Carolina Silva",
      role: "Fonoaudióloga Especialista",
      description: "15 anos de experiência em desenvolvimento infantil e transtornos de linguagem.",
      icon: Users
    },
    {
      name: "Dr. Rafael Santos",
      role: "Neuropsicólogo Infantil", 
      description: "Especialista em autismo e síndrome de Down com foco em comunicação.",
      icon: Target
    },
    {
      name: "Dra. Maria Fernanda",
      role: "Terapeuta Ocupacional",
      description: "Desenvolvimento de atividades lúdicas para estimulação da fala.",
      icon: Heart
    }
  ];

  const values = [
    {
      title: "Evidência Científica",
      description: "Todas as atividades são baseadas em pesquisas e metodologias comprovadas pela ciência.",
      icon: Award
    },
    {
      title: "Acessibilidade",
      description: "Tornamos a fonoaudiologia acessível para todas as famílias, independente da localização.",
      icon: Heart
    },
    {
      title: "Personalização",
      description: "Cada criança é única, por isso criamos planos totalmente personalizados.",
      icon: Target
    },
    {
      title: "Acompanhamento",
      description: "Monitoramos o progresso e ajustamos as atividades conforme a evolução da criança.",
      icon: Users
    }
  ];

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-background via-muted/30 to-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
              Sobre o <span className="bg-gradient-primary bg-clip-text text-transparent">FonoBot</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Somos uma equipe de especialistas dedicados a transformar o desenvolvimento da comunicação 
              infantil através de tecnologia e metodologias cientificamente comprovadas.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h2 className="text-3xl font-bold">Nossa Missão</h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Democratizar o acesso à fonoaudiologia especializada, oferecendo ferramentas 
                  científicas e personalizadas que apoiem pais e cuidadores no desenvolvimento 
                  da comunicação de suas crianças.
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Acreditamos que toda criança merece ter suas habilidades comunicativas 
                  desenvolvidas ao máximo, independentemente de onde mora ou sua condição específica.
                </p>
              </div>
              <div className="space-y-4">
                <div className="bg-card rounded-2xl p-6 shadow-soft">
                  <h3 className="text-xl font-semibold mb-3">1000+</h3>
                  <p className="text-muted-foreground">Famílias atendidas</p>
                </div>
                <div className="bg-card rounded-2xl p-6 shadow-soft">
                  <h3 className="text-xl font-semibold mb-3">95%</h3>
                  <p className="text-muted-foreground">Taxa de satisfação</p>
                </div>
                <div className="bg-card rounded-2xl p-6 shadow-soft">
                  <h3 className="text-xl font-semibold mb-3">4 anos</h3>
                  <p className="text-muted-foreground">De experiência</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Nossos <span className="bg-gradient-primary bg-clip-text text-transparent">Valores</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Os princípios que guiam nosso trabalho e nosso compromisso com as famílias.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <Card key={index} className="hover:shadow-soft transition-all duration-300">
                  <CardContent className="p-6 text-center space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                      <IconComponent className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-semibold">{value.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Nossa <span className="bg-gradient-primary bg-clip-text text-transparent">Equipe</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Profissionais especializados e dedicados ao desenvolvimento infantil.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => {
              const IconComponent = member.icon;
              return (
                <Card key={index} className="hover:shadow-soft transition-all duration-300">
                  <CardContent className="p-6 text-center space-y-4">
                    <div className="w-20 h-20 mx-auto rounded-full bg-gradient-primary flex items-center justify-center">
                      <IconComponent className="w-10 h-10 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                      <p className="text-primary font-medium mb-3">{member.role}</p>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {member.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;