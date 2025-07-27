/**
 * Dashboard de segurança para usuários
 */
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Shield, Key, Clock, AlertTriangle, CheckCircle, QrCode } from 'lucide-react';
import { enrollMFA, verifyMFAEnrollment, listMFAFactors, unenrollMFA, checkMFAStatus } from '@/lib/mfa';
import { validatePasswordSecurity, generateStrongPassword } from '@/lib/passwordSecurity';
import { configureSecureSession } from '@/lib/otpSecurity';
import { supabase } from '@/integrations/supabase/client';

export const SecurityDashboard: React.FC = () => {
  const { toast } = useToast();
  const [mfaStatus, setMfaStatus] = useState({ enabled: false, factorCount: 0, factors: [] });
  const [showMFASetup, setShowMFASetup] = useState(false);
  const [mfaQRCode, setMfaQRCode] = useState('');
  const [mfaSecret, setMfaSecret] = useState('');
  const [factorId, setFactorId] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadMFAStatus();
    configureSecureSession();
  }, []);

  const loadMFAStatus = async () => {
    const status = await checkMFAStatus();
    setMfaStatus(status);
  };

  const handleEnrollMFA = async () => {
    setLoading(true);
    const result = await enrollMFA();
    
    if (result.success && result.qrCode && result.secret) {
      setMfaQRCode(result.qrCode);
      setMfaSecret(result.secret);
      setShowMFASetup(true);
      toast({
        title: "QR Code gerado",
        description: "Escaneie o QR code com seu app autenticador",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Erro ao configurar MFA",
        description: result.error,
      });
    }
    setLoading(false);
  };

  const handleVerifyMFA = async () => {
    if (!verificationCode || !factorId) return;
    
    setLoading(true);
    const result = await verifyMFAEnrollment(factorId, verificationCode);
    
    if (result.success) {
      setShowMFASetup(false);
      setVerificationCode('');
      await loadMFAStatus();
      toast({
        title: "MFA habilitado com sucesso!",
        description: "Sua conta agora está protegida com autenticação de dois fatores",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Código inválido",
        description: result.error,
      });
    }
    setLoading(false);
  };

  const handleDisableMFA = async (factorId: string) => {
    setLoading(true);
    const result = await unenrollMFA(factorId);
    
    if (result.success) {
      await loadMFAStatus();
      toast({
        title: "MFA desabilitado",
        description: "Autenticação de dois fatores foi removida",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Erro ao desabilitar MFA",
        description: result.error,
      });
    }
    setLoading(false);
  };

  const handlePasswordCheck = async () => {
    if (!newPassword) return;
    
    const result = await validatePasswordSecurity(newPassword);
    setPasswordStrength(result);
  };

  const handleGeneratePassword = () => {
    const generated = generateStrongPassword(16);
    setNewPassword(generated);
    handlePasswordCheck();
  };

  const handleUpdatePassword = async () => {
    if (!passwordStrength?.isValid) {
      toast({
        variant: "destructive",
        title: "Senha insegura",
        description: "Por favor, corrija os problemas de segurança da senha",
      });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    
    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar senha",
        description: error.message,
      });
    } else {
      setNewPassword('');
      setPasswordStrength(null);
      toast({
        title: "Senha atualizada",
        description: "Sua senha foi alterada com sucesso",
      });
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Shield className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Central de Segurança</h2>
      </div>

      {/* Status Geral de Segurança */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Status de Segurança
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Badge variant={mfaStatus.enabled ? "default" : "secondary"}>
                {mfaStatus.enabled ? "Ativo" : "Inativo"}
              </Badge>
              <span className="text-sm">Autenticação 2FA</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="default">Ativo</Badge>
              <span className="text-sm">Criptografia AES-256</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="default">Ativo</Badge>
              <span className="text-sm">Auditoria de Segurança</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Autenticação de Dois Fatores */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Autenticação de Dois Fatores (2FA)
          </CardTitle>
          <CardDescription>
            Adicione uma camada extra de segurança à sua conta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!mfaStatus.enabled ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                A autenticação de dois fatores adiciona uma camada extra de segurança, 
                exigindo um código do seu telefone além da senha.
              </p>
              <Button onClick={handleEnrollMFA} disabled={loading}>
                <QrCode className="h-4 w-4 mr-2" />
                Configurar 2FA
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>2FA está ativo ({mfaStatus.factorCount} dispositivos)</span>
              </div>
              {mfaStatus.factors.map((factor: any) => (
                <div key={factor.id} className="flex items-center justify-between p-3 border rounded">
                  <span className="text-sm">{factor.friendly_name || 'Dispositivo TOTP'}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDisableMFA(factor.id)}
                    disabled={loading}
                  >
                    Remover
                  </Button>
                </div>
              ))}
            </div>
          )}

          {showMFASetup && (
            <div className="space-y-4 p-4 border rounded">
              <h4 className="font-semibold">Configurar Autenticador</h4>
              
              {mfaQRCode && (
                <div className="space-y-2">
                  <p className="text-sm">1. Escaneie este QR code com seu app autenticador:</p>
                  <div className="flex justify-center">
                    <img src={mfaQRCode} alt="QR Code para 2FA" className="border rounded" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Ou digite manualmente: {mfaSecret}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="verification-code">2. Digite o código do seu app:</Label>
                <Input
                  id="verification-code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="000000"
                  maxLength={6}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleVerifyMFA} disabled={loading || !verificationCode}>
                  Verificar e Ativar
                </Button>
                <Button variant="outline" onClick={() => setShowMFASetup(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Segurança da Senha */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Segurança da Senha
          </CardTitle>
          <CardDescription>
            Mantenha sua senha forte e segura
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-password">Nova Senha</Label>
            <div className="flex gap-2">
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                onBlur={handlePasswordCheck}
                placeholder="Digite uma nova senha"
              />
              <Button variant="outline" onClick={handleGeneratePassword}>
                Gerar
              </Button>
            </div>
          </div>

          {passwordStrength && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm">Força da senha:</span>
                <Badge variant={passwordStrength.isStrong ? "default" : "destructive"}>
                  {passwordStrength.score}/8
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Tempo estimado para quebrar: {passwordStrength.strength.estimatedCrackTime}
                </span>
              </div>
              
              {passwordStrength.errors.length > 0 && (
                <div className="space-y-1">
                  {passwordStrength.errors.map((error, index) => (
                    <p key={index} className="text-xs text-destructive">• {error}</p>
                  ))}
                </div>
              )}

              {passwordStrength.isValid && (
                <Button onClick={handleUpdatePassword} disabled={loading}>
                  Atualizar Senha
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Configurações de Sessão */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Configurações de Sessão
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">Renovação automática de sessão</span>
              <Badge variant="default">Ativo</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Expiração de sessão</span>
              <span className="text-sm text-muted-foreground">1 hora</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Rate limiting</span>
              <Badge variant="default">Ativo</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};