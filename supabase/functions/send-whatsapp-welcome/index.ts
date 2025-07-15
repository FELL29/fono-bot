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

    const requestData: WhatsAppRequest = await req.json();
    const { child_name, parent_name, whatsapp, track_id } = requestData;

    logStep("Request data received", { child_name, parent_name, whatsapp, track_id });

    // Buscar primeira atividade do track
    const { data: firstActivity, error: activityError } = await supabaseClient
      .from('activities')
      .select('title, instructions')
      .eq('track_id', track_id)
      .eq('day_index', 1)
      .single();

    if (activityError) {
      logStep("No activity found, using default message", activityError);
    }

    // Formatar mensagem personalizada
    const activityText = firstActivity 
      ? `"${firstActivity.title}" - ${firstActivity.instructions.replace(/{{child_name}}/g, child_name).substring(0, 150)}...`
      : "Atividades personalizadas serão disponibilizadas em breve.";

    const whatsappMessage = `🎉 Olá ${parent_name}!

Bem-vindo(a) ao FonoBot! 

A avaliação de ${child_name} foi concluída com sucesso. Criamos um plano personalizado de atividades de fonoaudiologia.

🎯 Primeira atividade sugerida:
${activityText}

Deseja começar agora? Responda SIM para receber mais detalhes!

Acesse seu dashboard: ${req.headers.get("origin")}/dashboard`;

    logStep("Message formatted", { messageLength: whatsappMessage.length });

    // SIMULAÇÃO: Em vez de enviar WhatsApp real, vamos "simular"
    const simulationResult = {
      status: "simulated",
      message: whatsappMessage,
      to: whatsapp,
      timestamp: new Date().toISOString(),
      success: true,
      provider: "simulation"
    };

    // Registrar no banco para fins de log (opcional - criar tabela depois)
    logStep("WhatsApp simulation completed", {
      to: whatsapp,
      child: child_name,
      parent: parent_name,
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