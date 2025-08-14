-- Alterar plano padrão dos usuários para PREMIUM (versão de teste)
-- Atualizar usuários existentes
UPDATE public.profiles 
SET plan = 'PREMIUM'::subscription_plan 
WHERE plan = 'TRIAL'::subscription_plan;

-- Alterar valor padrão da coluna para novos usuários
ALTER TABLE public.profiles 
ALTER COLUMN plan SET DEFAULT 'PREMIUM'::subscription_plan;

-- Proteger tabelas de dados proprietários
-- Remover políticas existentes que permitem acesso público
DROP POLICY IF EXISTS "Anyone can view activities" ON public.activities;
DROP POLICY IF EXISTS "Anyone can view tracks" ON public.tracks;

-- Criar políticas mais restritivas para tabelas activities e tracks
-- Apenas usuários autenticados podem ver atividades
CREATE POLICY "Authenticated users can view activities" 
ON public.activities 
FOR SELECT 
USING (auth.role() = 'authenticated');

-- Apenas usuários autenticados podem ver tracks
CREATE POLICY "Authenticated users can view tracks" 
ON public.tracks 
FOR SELECT 
USING (auth.role() = 'authenticated');