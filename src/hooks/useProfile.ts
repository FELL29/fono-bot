import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { profileSchema } from '@/lib/validations';
import { useSecureValidation } from '@/hooks/useSecureValidation';
import { checkDataFetchRate } from '@/lib/security';

interface Profile {
  parent_name: string;
  plan: "TRIAL" | "ESSENCIAL" | "AVANCADO" | "PREMIUM";
  trial_end: string;
}

export const useProfile = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const { validate } = useSecureValidation(profileSchema);

  const fetchProfile = async () => {
    if (!user) return;

    // Check rate limiting
    if (!checkDataFetchRate('profile')) {
      toast({
        title: "Muitas solicitações",
        description: "Aguarde antes de tentar novamente.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('parent_name, plan, trial_end')
        .eq('id', user.id)
        .single();

      if (fetchError) throw fetchError;

      setProfile(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar perfil';
      setError(errorMessage);
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return;

    // Validate and sanitize updates
    const validationResult = validate(updates, 'profile-update');
    if (!validationResult.isValid) {
      const firstError = Object.values(validationResult.errors)[0];
      toast({
        title: "Dados inválidos",
        description: firstError,
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update(validationResult.sanitizedData)
        .eq('id', user.id);

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, ...validationResult.sanitizedData } : null);
      
      toast({
        title: "Sucesso",
        description: "Perfil atualizado com sucesso",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar perfil';
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  return {
    profile,
    loading,
    error,
    fetchProfile,
    updateProfile
  };
};