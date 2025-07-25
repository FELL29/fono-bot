import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

const TermsOfService = () => {
  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="pt-20 pb-16 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">Termos de Uso</h1>
            <p className="text-muted-foreground">
              Última atualização: {new Date().toLocaleDateString('pt-BR')}
            </p>
          </div>

          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>1. Aceitação dos Termos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    Ao acessar e usar o FonoBot, você concorda em cumprir e estar 
                    vinculado a estes Termos de Uso. Se você não concordar com 
                    qualquer parte destes termos, não deverá usar nosso serviço.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>2. Descrição do Serviço</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    O FonoBot é uma plataforma digital que oferece atividades 
                    personalizadas de fonoaudiologia para crianças com diferentes 
                    perfis de desenvolvimento.
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Avaliação inicial para personalização</li>
                    <li>Atividades desenvolvidas por fonoaudiólogos</li>
                    <li>Acompanhamento de progresso</li>
                    <li>Suporte técnico especializado</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>3. Responsabilidades do Usuário</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <h4 className="font-semibold">3.1 Idade e Capacidade</h4>
                  <p>
                    Você declara ter pelo menos 18 anos ou possuir autorização 
                    dos pais/responsáveis para usar o serviço.
                  </p>
                  
                  <h4 className="font-semibold">3.2 Informações Precisas</h4>
                  <p>
                    Você se compromete a fornecer informações verdadeiras, 
                    atualizadas e completas sobre a criança durante a avaliação.
                  </p>
                  
                  <h4 className="font-semibold">3.3 Uso Adequado</h4>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Usar o serviço apenas para fins legítimos</li>
                    <li>Não compartilhar credenciais de acesso</li>
                    <li>Não tentar acessar sistemas não autorizados</li>
                    <li>Seguir as orientações das atividades propostas</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>4. Privacidade e Proteção de Dados</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    Protegemos seus dados conforme nossa Política de Privacidade 
                    e a Lei Geral de Proteção de Dados (LGPD).
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Dados coletados apenas para prestação do serviço</li>
                    <li>Não compartilhamento com terceiros sem consentimento</li>
                    <li>Direito de acesso, correção e exclusão dos dados</li>
                    <li>Medidas de segurança para proteção das informações</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>5. Limitações de Responsabilidade</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <h4 className="font-semibold">5.1 Natureza Educacional</h4>
                  <p>
                    O FonoBot oferece atividades educacionais e NÃO substitui 
                    tratamento médico ou fonoaudiológico profissional.
                  </p>
                  
                  <h4 className="font-semibold">5.2 Resultados</h4>
                  <p>
                    Não garantimos resultados específicos, pois o desenvolvimento 
                    de cada criança é único e individual.
                  </p>
                  
                  <h4 className="font-semibold">5.3 Disponibilidade</h4>
                  <p>
                    Faremos nossos melhores esforços para manter o serviço 
                    disponível, mas não garantimos funcionamento ininterrupto.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>6. Pagamentos e Cancelamentos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <h4 className="font-semibold">6.1 Planos e Preços</h4>
                  <p>
                    Os preços estão sujeitos a alterações mediante aviso prévio 
                    de 30 dias.
                  </p>
                  
                  <h4 className="font-semibold">6.2 Cancelamento</h4>
                  <p>
                    Você pode cancelar sua assinatura a qualquer momento através 
                    do dashboard ou entrando em contato conosco.
                  </p>
                  
                  <h4 className="font-semibold">6.3 Reembolso</h4>
                  <p>
                    Oferecemos garantia de 7 dias para cancelamento e reembolso 
                    integral para novos usuários.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>7. Propriedade Intelectual</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    Todo o conteúdo do FonoBot, incluindo atividades, textos, 
                    imagens e metodologias, é protegido por direitos autorais.
                  </p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Uso pessoal e não comercial permitido</li>
                    <li>Proibida reprodução sem autorização</li>
                    <li>Respeito às licenças de terceiros</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>8. Modificações dos Termos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    Podemos modificar estes termos a qualquer momento. Mudanças 
                    significativas serão comunicadas com pelo menos 30 dias de 
                    antecedência por email ou através da plataforma.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>9. Lei Aplicável e Foro</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    Estes termos são regidos pela legislação brasileira. 
                    Quaisquer disputas serão resolvidas no foro da comarca de 
                    São Paulo, SP.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>10. Contato</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    Para dúvidas sobre estes termos, entre em contato:
                  </p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Email: legal@fonobot.com.br</li>
                    <li>Telefone: (11) 3456-7890</li>
                    <li>Endereço: Rua das Flores, 123 - São Paulo, SP</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TermsOfService;