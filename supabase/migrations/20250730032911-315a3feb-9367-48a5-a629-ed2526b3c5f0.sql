-- Corrigir track_ids inválidos baseado na idade das crianças
-- Primeiro, vamos mapear crianças para tracks válidos baseado na idade

-- Atualizar crianças com track_id inválido para tracks válidos
UPDATE children 
SET track_id = (
  CASE 
    WHEN child_age >= 1 AND child_age <= 3 THEN '50089f2a-e602-43be-ba4d-77a079a7c209'  -- Track Típico 1-3 anos
    WHEN child_age >= 4 AND child_age <= 6 THEN 'bd0cec54-0bb3-4f24-9c6f-8cbb2b5a5c8f'  -- Track TEA 4-6 anos
    ELSE '50089f2a-e602-43be-ba4d-77a079a7c209'  -- Fallback para Típico 1-3 anos
  END
)
WHERE track_id NOT IN (
  SELECT id FROM tracks
) OR track_id IS NULL;

-- Verificar se todas as crianças agora têm tracks válidos
-- Esta query pode ser usada para confirmar a correção