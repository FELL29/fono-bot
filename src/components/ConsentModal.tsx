import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Shield, FileText, Eye, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
}

export const ConsentModal = ({ isOpen, onClose, onAccept }: ConsentModalProps) => {
  const [consents, setConsents] = useState({
    terms: false,
    privacy: false,
    dataProcessing: false,
    marketing: false,
  });

  const handleConsentChange = (key: keyof typeof consents, checked: boolean) => {
    setConsents(prev => ({ ...prev, [key]: checked }));
  };

  const requiredConsents = ['terms', 'privacy', 'dataProcessing'] as const;
  const canProceed = requiredConsents.every(key => consents[key]);

  const handleAccept = () => {
    if (canProceed) {
      // Salvar consentimentos no localStorage
      localStorage.setItem('fonobot_consents', JSON.stringify({
        ...consents,
        timestamp: new Date().toISOString(),
        version: '1.0'
      }));
      onAccept();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Consentimento e Proteção de Dados
          </DialogTitle>
          <DialogDescription>
            Para usar o FonoBot, precisamos do seu consentimento para processar 
            os dados conforme a LGPD (Lei Geral de Proteção de Dados).
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[50vh] pr-4">
          <div className="space-y-6">
            {/* Termos de Uso */}
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="terms"
                  checked={consents.terms}
                  onCheckedChange={(checked) => handleConsentChange('terms', !!checked)}
                />
                <div className="flex-1">
                  <label htmlFor="terms" className="text-sm font-medium cursor-pointer">
                    Aceito os Termos de Uso *
                  </label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Li e concordo com as condições de uso do serviço.{' '}
                    <Link to="/termos" className="text-primary hover:underline" target="_blank">
                      Ver termos completos
                    </Link>
                  </p>
                </div>
                <FileText className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>

            {/* Política de Privacidade */}
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="privacy"
                  checked={consents.privacy}
                  onCheckedChange={(checked) => handleConsentChange('privacy', !!checked)}
                />
                <div className="flex-1">
                  <label htmlFor="privacy" className="text-sm font-medium cursor-pointer">
                    Aceito a Política de Privacidade *
                  </label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Compreendo como meus dados são coletados e processados.{' '}
                    <Link to="/privacidade" className="text-primary hover:underline" target="_blank">
                      Ver política completa
                    </Link>
                  </p>
                </div>
                <Eye className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>

            {/* Processamento de Dados */}
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="dataProcessing"
                  checked={consents.dataProcessing}
                  onCheckedChange={(checked) => handleConsentChange('dataProcessing', !!checked)}
                />
                <div className="flex-1">
                  <label htmlFor="dataProcessing" className="text-sm font-medium cursor-pointer">
                    Autorizo o processamento dos dados da criança *
                  </label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Autorizo o FonoBot a processar os dados da avaliação para 
                    personalizar atividades de fonoaudiologia. Os dados são 
                    usados exclusivamente para prestação do serviço.
                  </p>
                </div>
                <Shield className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>

            {/* Marketing (Opcional) */}
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="marketing"
                  checked={consents.marketing}
                  onCheckedChange={(checked) => handleConsentChange('marketing', !!checked)}
                />
                <div className="flex-1">
                  <label htmlFor="marketing" className="text-sm font-medium cursor-pointer">
                    Aceito receber comunicações de marketing
                  </label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Desejo receber emails com dicas, novidades e ofertas 
                    relacionadas ao desenvolvimento infantil. (Opcional)
                  </p>
                </div>
                <Users className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium text-sm mb-2">Seus Direitos (LGPD)</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Acessar seus dados pessoais</li>
                <li>• Corrigir dados incompletos ou inexatos</li>
                <li>• Solicitar exclusão dos dados</li>
                <li>• Revogar consentimento a qualquer momento</li>
                <li>• Portabilidade dos dados</li>
              </ul>
              <p className="text-xs text-muted-foreground mt-2">
                Entre em contato: <span className="text-primary">dpo@fonobot.com.br</span>
              </p>
            </div>
          </div>
        </ScrollArea>

        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button 
            onClick={handleAccept} 
            disabled={!canProceed}
            className="flex-1"
          >
            {canProceed ? 'Aceitar e Continuar' : 'Aceite os termos obrigatórios'}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          * Campos obrigatórios para usar o serviço
        </p>
      </DialogContent>
    </Dialog>
  );
};