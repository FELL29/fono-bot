import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WhatsAppRequest {
  child_name: string;
  parent_name: string;
  whatsapp: string;
  track_id: string;
}

// Rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const isRateLimited = (clientId: string, maxRequests = 3, windowMs = 300000): boolean => {
  const now = Date.now();
  const record = rateLimitMap.get(clientId);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(clientId, { count: 1, resetTime: now + windowMs });
    return false;
  }
  
  if (record.count >= maxRequests) return true;
  record.count++;
  return false;
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[WHATSAPP-WELCOME] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.id) throw new Error("User not authenticated");

    // Rate limiting check
    if (isRateLimited(user.id)) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), { 
        status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const body = await req.json();
    
    // Input validation and sanitization
    const requestData: WhatsAppRequest = {
      child_name: String(body.child_name || '').slice(0, 100).trim(),
      parent_name: String(body.parent_name || '').slice(0, 100).trim(),
      whatsapp: String(body.whatsapp || '').replace(/[^0-9+]/g, '').slice(0, 20),
      track_id: String(body.track_id || '').trim()
    };

    // Validate required fields
    if (!requestData.child_name || !requestData.parent_name || !requestData.track_id) {
      throw new Error('Missing required fields');
    }

    logStep("Request data validated", requestData);

    // Buscar primeira atividade do track
    const { data: firstActivity, error: activityError } = await supabaseClient
      .from('activities')
      .select('title, instructions')
      .eq('track_id', requestData.track_id)
      .eq('day_index', 1)
      .single();

    if (activityError) {
      logStep("No activity found, using default message", activityError);
    }

    // Formatar mensagem personalizada
    const activityText = firstActivity 
      ? `"${firstActivity.title}" - ${firstActivity.instructions.replace(/{{child_name}}/g, requestData.child_name).substring(0, 150)}...`
      : "Atividades personalizadas serão disponibilizadas em breve.";

    const whatsappMessage = `🎉 Olá ${requestData.parent_name}!

Bem-vindo(a) ao FonoBot! 

A avaliação de ${requestData.child_name} foi concluída com sucesso. Criamos um plano personalizado de atividades de fonoaudiologia.

🎯 Primeira atividade sugerida:
${activityText}

Deseja começar agora? Responda SIM para receber mais detalhes!

Acesse seu dashboard: ${req.headers.get("origin")}/dashboard`;

    logStep("Message formatted", { messageLength: whatsappMessage.length });

    // SIMULAÇÃO: Em vez de enviar WhatsApp real, vamos "simular"
    const simulationResult = {
      status: "simulated",
      message: whatsappMessage,
      to: requestData.whatsapp,
      timestamp: new Date().toISOString(),
      success: true,
      provider: "simulation"
    };

    // Registrar no banco para fins de log (opcional - criar tabela depois)
    logStep("WhatsApp simulation completed", {
      to: requestData.whatsapp,
      child: requestData.child_name,
      parent: requestData.parent_name,
      messagePreview: whatsappMessage.substring(0, 100) + "..."
    });

    // Retornar resultado da simulação
    return new Response(JSON.stringify({
      success: true,
      simulation: simulationResult,
      message: "Mensagem WhatsApp simulada com sucesso!"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in send-whatsapp-welcome", { message: errorMessage });
    return new Response(JSON.stringify({ 
      success: false,
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});