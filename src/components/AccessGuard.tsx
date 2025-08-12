import { PropsWithChildren, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { LoadingState } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";

// AccessGuard: protege rotas de acordo com o plano/trial do usuário
const AccessGuard = ({ children }: PropsWithChildren) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { profile, loading } = useProfile();
  const { toast } = useToast();

  useEffect(() => {
    if (!user || loading) return;

    // Sem perfil, enviamos para auth
    if (!profile) {
      navigate('/auth');
      return;
    }

    // Bloqueia acesso se trial expirado
    if (profile.plan === 'TRIAL' && profile.trial_end) {
      const expired = new Date(profile.trial_end).getTime() <= Date.now();
      if (expired) {
        toast({
          title: 'Seu período de teste terminou',
          description: 'Assine um plano para continuar usando as ferramentas.',
        });
        navigate('/precos');
      }
    }
  }, [user, profile, loading, navigate, toast]);

  if (!user || loading) {
    return <LoadingState>Carregando acesso...</LoadingState>;
  }

  return <>{children}</>;
};

export default AccessGuard;
