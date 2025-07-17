import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Smartphone, CheckCircle } from 'lucide-react';

interface WhatsAppSimulationProps {
  message?: string;
  recipient?: string;
  timestamp?: string;
  parentName?: string;
  childName?: string;
}

export default function WhatsAppSimulation({ 
  message = "Nenhuma mensagem simulada ainda", 
  recipient = "Não definido",
  timestamp = new Date().toISOString(),
  parentName = "Fellipe",
  childName = "João"
}: WhatsAppSimulationProps) {
  const [isOpen, setIsOpen] = useState(false);

  const formatMessage = (msg: string) => {
    return msg.split('\n').map((line, index) => (
      <span key={index}>
        {line}
        {index < msg.split('\n').length - 1 && <br />}
      </span>
    ));
  };

  const formatTimestamp = (ts: string) => {
    try {
      return new Date(ts).toLocaleString('pt-BR');
    } catch {
      return 'Data inválida';
    }
  };

  const sampleMessage = `🎉 Olá ${parentName}!

Bem-vindo(a) ao FonoBot! 

A avaliação de ${childName} foi concluída com sucesso. Criamos um plano personalizado de atividades de fonoaudiologia.

🎯 Primeira atividade sugerida:
"Sons de Animais" - Mostre figuras de animais para ${childName} e faça os sons correspondentes. Peça para ${childName} imitar os sons...

Deseja começar agora? Responda SIM para receber mais detalhes!

Acesse seu dashboard: ${window.location.origin}/dashboard`;

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-lg flex items-center">
            <Smartphone className="w-5 h-5 mr-2 text-green-600" />
            WhatsApp Simulator
          </CardTitle>
          <CardDescription>
            Visualize as mensagens que seriam enviadas no WhatsApp
          </CardDescription>
        </div>
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Simulação
        </Badge>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Para: {recipient}</span>
            <span>{formatTimestamp(timestamp)}</span>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <MessageCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
              <div className="space-y-2 flex-1">
                <p className="text-sm font-medium text-green-800">Prévia da Mensagem:</p>
                <div className="text-sm text-green-700 leading-relaxed">
                  {message === "Nenhuma mensagem simulada ainda" ? (
                    <em className="text-muted-foreground">
                      Complete uma avaliação para ver a simulação da mensagem
                    </em>
                  ) : (
                    formatMessage(message)
                  )}
                </div>
              </div>
            </div>
          </div>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="w-full">
                <MessageCircle className="w-4 h-4 mr-2" />
                Ver Exemplo Completo
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="flex items-center">
                  <Smartphone className="w-5 h-5 mr-2 text-green-600" />
                  Exemplo de Mensagem WhatsApp
                </DialogTitle>
                <DialogDescription>
                  Assim ficaria a mensagem real enviada no WhatsApp
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="bg-gray-100 rounded-lg p-4 border">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                        <MessageCircle className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-medium text-sm">FonoBot</span>
                    </div>
                    <span className="text-xs text-gray-500">agora</span>
                  </div>
                  
                  <div className="bg-green-500 text-white rounded-lg p-3 text-sm leading-relaxed">
                    {formatMessage(sampleMessage)}
                  </div>
                </div>
                
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>✓ Esta é uma simulação de como a mensagem apareceria no WhatsApp</p>
                  <p>✓ A mensagem real será personalizada com os dados da avaliação</p>
                  <p>✓ Para implementar o envio real, configure uma API de WhatsApp</p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}