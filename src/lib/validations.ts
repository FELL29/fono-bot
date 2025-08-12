import { z } from 'zod';

// Schema para validação de formulário de avaliação
export const assessmentFormSchema = z.object({
  // Bloco A - Identificação
  parent_name: z.string()
    .min(2, 'Nome do responsável deve ter pelo menos 2 caracteres')
    .max(100, 'Nome muito longo')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras e espaços'),
  
  child_name: z.string()
    .min(2, 'Nome da criança deve ter pelo menos 2 caracteres')
    .max(100, 'Nome muito longo')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras e espaços'),
  
  child_age: z.string()
    .refine((val) => {
      const age = parseInt(val);
      return age >= 1 && age <= 18;
    }, 'Idade deve ser entre 1 e 18 anos'),

  // Bloco B - Diagnóstico & Saúde
  child_profile: z.array(z.string()).min(1, 'Selecione pelo menos um perfil'),
  child_profile_other: z.string().max(200, 'Descrição muito longa').optional(),
  hearing_ok: z.string().min(1, 'Campo obrigatório'),

  // Bloco C - Expressão Oral
  speech_level: z.string().min(1, 'Campo obrigatório'),
  articulation_issue: z.array(z.string()),
  oral_motor: z.array(z.string()),

  // Bloco D - Compreensão
  comprehension_level: z.string().min(1, 'Campo obrigatório'),
  follow_commands: z.string().min(1, 'Campo obrigatório'),

  // Bloco E - Social & Sensorial
  joint_attention: z.string().optional(),
  joint_attention_pointing: z.string().min(1, 'Campo obrigatório'),
  joint_attention_sharing: z.string().min(1, 'Campo obrigatório'),
  sensory_issue: z.array(z.string()),

  // Bloco F - Rotina & Preferências
  screen_time: z.string().min(1, 'Campo obrigatório'),
  home_language: z.string().min(1, 'Campo obrigatório'),

  // Campos adicionais
  attention_shared: z.string().min(1, 'Campo obrigatório'),
  play_type: z.string().min(1, 'Campo obrigatório'),
  previous_therapy: z.string().min(1, 'Campo obrigatório'),
  therapy_description: z.string().max(500, 'Descrição muito longa').optional(),
});

// Schema para validação de perfil de usuário
export const profileSchema = z.object({
  parent_name: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome muito longo')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras e espaços'),
  
  plan: z.enum(['TRIAL', 'ESSENCIAL', 'AVANCADO', 'PREMIUM']),
  trial_end: z.string().datetime('Data inválida'),
});

// Schema para validação de criança
export const childSchema = z.object({
  name: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome muito longo')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras e espaços'),
  
  age: z.number()
    .min(1, 'Idade deve ser pelo menos 1 ano')
    .max(18, 'Idade deve ser no máximo 18 anos'),
  
  track_id: z.string().uuid('ID de trilha inválido'),
  start_level: z.number().min(1, 'Nível inicial inválido'),
});

// Schema para autenticação
export const authSchema = z.object({
  email: z.string()
    .email('Email inválido')
    .max(255, 'Email muito longo'),
  
  password: z.string()
    .min(6, 'Senha deve ter pelo menos 6 caracteres')
    .max(100, 'Senha muito longa'),
});

export const signUpSchema = authSchema.extend({
  parent_name: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome muito longo')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras e espaços'),
  
  whatsapp: z.string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Número de WhatsApp inválido')
    .optional(),
});

export const resetPasswordSchema = z.object({
  password: z.string()
    .min(6, 'Senha deve ter pelo menos 6 caracteres')
    .max(100, 'Senha muito longa'),
  
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"],
});

// Tipos derivados dos schemas
export type AssessmentFormData = z.infer<typeof assessmentFormSchema>;
export type ProfileData = z.infer<typeof profileSchema>;
export type ChildData = z.infer<typeof childSchema>;
export type AuthData = z.infer<typeof authSchema>;
export type SignUpData = z.infer<typeof signUpSchema>;
export type ResetPasswordData = z.infer<typeof resetPasswordSchema>;