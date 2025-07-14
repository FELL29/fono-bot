import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { MessageCircle, HelpCircle } from "lucide-react";
import { Link } from "react-router-dom";

const FAQ = () => {
  const faqs = [
    {
      category: "Sobre o FonoBot",
      questions: [
        {
          question: "O que é o FonoBot?",
          answer: "O FonoBot é uma plataforma digital que oferece exercícios de fonoaudiologia personalizados para crianças, desenvolvidos por especialistas. Nosso objetivo é apoiar o desenvolvimento da comunicação infantil através de atividades cientificamente fundamentadas."
        },
        {
          question: "Quais idades vocês atendem?",
          answer: "Atendemos crianças de 0 a 12 anos, com atividades adaptadas para cada faixa etária e necessidade específica."
        },
        {
          question: "As atividades substituem o atendimento presencial?",
          answer: "Não. Nossos exercícios são complementares ao atendimento fonoaudiológico presencial. Sempre recomendamos acompanhamento profissional especializado para casos que necessitem."
        }
      ]
    },
    {
      category: "Como Funciona",
      questions: [
        {
          question: "Como são criadas as atividades personalizadas?",
          answer: "Através de um questionário inicial detalhado, identificamos o perfil único da sua criança (idade, necessidades, interesses) e nossa IA, orientada por fonoaudiólogos, cria uma trilha personalizada de exercícios."
        },
        {
          question: "Com que frequência as atividades são atualizadas?",
          answer: "As atividades são atualizadas conforme o progresso da criança. No plano Essencial (1x/semana), Desenvolvimento (3x/semana) e Intensivo (5x/semana)."
        },
        {
          question: "Preciso de materiais especiais?",
          answer: "A maioria das atividades usa materiais simples que você já tem em casa. Quando necessário, fornecemos listas de materiais acessíveis e sugestões de onde encontrar."
        }
      ]
    },
    {
      category: "Condições Específicas",
      questions: [
        {
          question: "Vocês trabalham com crianças autistas?",
          answer: "Sim! Temos atividades especializadas para crianças no espectro autista, focadas em comunicação, interação social e desenvolvimento de habilidades comunicativas adequadas ao perfil de cada criança."
        },
        {
          question: "E síndrome de Down?",
          answer: "Certamente. Desenvolvemos exercícios adaptados que potencializam as habilidades comunicativas de crianças com síndrome de Down, respeitando seu ritmo e características específicas."
        },
        {
          question: "Atendem transtornos de linguagem?",
          answer: "Sim, oferecemos terapias direcionadas para diversos transtornos de linguagem, sempre com base em evidências científicas e orientação de fonoaudiólogos especializados."
        }
      ]
    },
    {
      category: "Planos e Pagamento",
      questions: [
        {
          question: "Qual plano escolher?",
          answer: "Depende das necessidades da sua criança. O Essencial é ideal para começar, o Desenvolvimento para casos que precisam de mais estímulos, e o Intensivo para situações que requerem intervenção mais frequente."
        },
        {
          question: "Posso cancelar a qualquer momento?",
          answer: "Sim, não há fidelidade. Você pode cancelar ou pausar sua assinatura a qualquer momento através da sua área do usuário."
        },
        {
          question: "Oferecem teste gratuito?",
          answer: "Sim! Oferecemos 7 dias de teste gratuito para você conhecer nossa plataforma e ver os primeiros resultados com seu filho."
        }
      ]
    },
    {
      category: "Suporte e Resultados",
      questions: [
        {
          question: "Como acompanho o progresso?",
          answer: "Através de relatórios periódicos (semanais, quinzenais ou mensais, dependendo do plano) que mostram o desenvolvimento da criança e sugestões de continuidade."
        },
        {
          question: "Quando verei os primeiros resultados?",
          answer: "Muitas famílias notam melhorias já nas primeiras semanas, mas cada criança tem seu ritmo. O importante é a consistência na realização das atividades."
        },
        {
          question: "Como posso entrar em contato com especialistas?",
          answer: "Planos Desenvolvimento e Intensivo incluem acesso direto a nossa equipe de fonoaudiólogos via chat, telefone ou videochamada."
        }
      ]
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
              Perguntas <span className="bg-gradient-primary bg-clip-text text-transparent">Frequentes</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Encontre respostas para as dúvidas mais comuns sobre o FonoBot e como podemos 
              ajudar no desenvolvimento do seu filho.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            
            {faqs.map((category, categoryIndex) => (
              <div key={categoryIndex} className="mb-12">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <HelpCircle className="w-6 h-6 text-primary" />
                  {category.category}
                </h2>
                
                <Accordion type="single" collapsible className="space-y-4">
                  {category.questions.map((faq, faqIndex) => (
                    <AccordionItem key={faqIndex} value={`${categoryIndex}-${faqIndex}`}>
                      <Card className="shadow-soft">
                        <AccordionTrigger className="px-6 py-4 text-left hover:no-underline">
                          <span className="font-semibold text-lg">{faq.question}</span>
                        </AccordionTrigger>
                        <AccordionContent>
                          <CardContent className="pt-0 pb-6">
                            <p className="text-muted-foreground leading-relaxed">
                              {faq.answer}
                            </p>
                          </CardContent>
                        </AccordionContent>
                      </Card>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}

            {/* Contact CTA */}
            <Card className="mt-16 bg-gradient-primary text-primary-foreground shadow-soft">
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-bold mb-4">Não encontrou sua dúvida?</h3>
                <p className="text-lg mb-6 opacity-90">
                  Nossa equipe de especialistas está pronta para esclarecer qualquer questão 
                  sobre o desenvolvimento comunicativo do seu filho.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild variant="secondary" size="lg">
                    <Link to="/contato">
                      <MessageCircle className="w-5 h-5 mr-2" />
                      Falar com Especialista
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" className="bg-white/10 text-white border-white/30 hover:bg-white/20">
                    Agendar Consulta Gratuita
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default FAQ;