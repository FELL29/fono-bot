import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Lock, Eye, UserCheck } from "lucide-react";

const Privacy = () => {
  const sections = [
    {
      title: "Informações que Coletamos",
      icon: Eye,
      content: [
        "Dados pessoais fornecidos voluntariamente (nome, email, telefone)",
        "Informações sobre a criança (idade, necessidades específicas) apenas quando necessário para personalização",
        "Dados de uso da plataforma para melhorar nossos serviços",
        "Informações de pagamento processadas através de parceiros seguros"
      ]
    },
    {
      title: "Como Utilizamos suas Informações",
      icon: UserCheck,
      content: [
        "Personalizar atividades e exercícios conforme o perfil da criança",
        "Comunicar atualizações importantes sobre nossos serviços",
        "Processar pagamentos e gerenciar assinaturas",
        "Melhorar a qualidade e eficácia de nossa plataforma",
        "Fornecer suporte técnico quando necessário"
      ]
    },
    {
      title: "Proteção e Segurança",
      icon: Lock,
      content: [
        "Utilizamos criptografia SSL para todas as transmissões de dados",
        "Armazenamento seguro em servidores com certificação internacional",
        "Acesso restrito aos dados apenas para equipe autorizada",
        "Monitoramento contínuo contra ameaças de segurança",
        "Backups regulares para proteção contra perda de dados"
      ]
    },
    {
      title: "Seus Direitos",
      icon: Shield,
      content: [
        "Acessar, corrigir ou excluir seus dados pessoais a qualquer momento",
        "Solicitar portabilidade dos seus dados",
        "Retirar consentimento para processamento de dados",
        "Receber informações sobre como seus dados são utilizados",
        "Reclamar junto aos órgãos de proteção de dados"
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
              Política de <span className="bg-gradient-primary bg-clip-text text-transparent">Privacidade</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Sua privacidade e a segurança dos dados da sua família são nossas prioridades absolutas. 
              Entenda como protegemos e utilizamos suas informações.
            </p>
            <div className="text-sm text-muted-foreground">
              Última atualização: Janeiro de 2025
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            
            {/* Introduction */}
            <Card className="mb-12 shadow-soft">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-4">Nosso Compromisso com Você</h2>
                <p className="text-muted-foreground text-lg leading-relaxed mb-4">
                  O FonoBot está comprometido em proteger a privacidade e segurança das informações 
                  pessoais de nossos usuários, especialmente quando se trata de dados relacionados 
                  ao desenvolvimento infantil.
                </p>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Esta política explica como coletamos, usamos, protegemos e compartilhamos suas 
                  informações pessoais em conformidade com a Lei Geral de Proteção de Dados (LGPD) 
                  e melhores práticas internacionais.
                </p>
              </CardContent>
            </Card>

            {/* Sections */}
            <div className="space-y-8">
              {sections.map((section, index) => {
                const IconComponent = section.icon;
                return (
                  <Card key={index} className="shadow-soft">
                    <CardContent className="p-8">
                      <div className="flex items-start space-x-4 mb-6">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                          <IconComponent className="w-6 h-6" />
                        </div>
                        <h2 className="text-2xl font-bold">{section.title}</h2>
                      </div>
                      <ul className="space-y-3">
                        {section.content.map((item, itemIndex) => (
                          <li key={itemIndex} className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-muted-foreground leading-relaxed">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Additional Sections */}
            <div className="grid md:grid-cols-2 gap-8 mt-12">
              <Card className="shadow-soft">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4">Compartilhamento de Dados</h3>
                  <p className="text-muted-foreground mb-4">
                    Nunca vendemos seus dados pessoais. Compartilhamos informações apenas:
                  </p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Com seu consentimento explícito</li>
                    <li>• Para cumprir obrigações legais</li>
                    <li>• Com parceiros técnicos sob rigorosos acordos de confidencialidade</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="shadow-soft">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4">Retenção de Dados</h3>
                  <p className="text-muted-foreground mb-4">
                    Mantemos seus dados apenas pelo tempo necessário:
                  </p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Durante o período de uso ativo da plataforma</li>
                    <li>• Por obrigação legal (quando aplicável)</li>
                    <li>• Exclusão automática após cancelamento</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Contact Section */}
            <Card className="mt-12 bg-gradient-primary text-primary-foreground shadow-soft">
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-bold mb-4">Dúvidas sobre Privacidade?</h3>
                <p className="text-lg mb-6 opacity-90">
                  Nossa equipe de proteção de dados está sempre disponível para esclarecer 
                  qualquer questão sobre o tratamento das suas informações.
                </p>
                <div className="space-y-2">
                  <p className="font-semibold">Email: privacidade@fonobot.com.br</p>
                  <p className="font-semibold">WhatsApp: (11) 99999-9999</p>
                </div>
              </CardContent>
            </Card>

            {/* Legal Notice */}
            <div className="mt-8 p-6 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground text-center">
                <strong>Aviso Legal:</strong> Esta política pode ser atualizada periodicamente para refletir 
                mudanças em nossas práticas ou na legislação. Notificaremos sobre alterações significativas 
                através dos nossos canais oficiais de comunicação.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Privacy;