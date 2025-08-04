import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get visitor info
    const { userAgent, acceptLanguage } = await req.json()
    
    // Get IP from headers (Cloudflare/proxy headers)
    const forwardedFor = req.headers.get('x-forwarded-for')
    const realIp = req.headers.get('x-real-ip')
    const cfConnectingIp = req.headers.get('cf-connecting-ip')
    
    const ipAddress = cfConnectingIp || realIp || forwardedFor?.split(',')[0] || 'unknown'
    
    // Store visitor info
    const { data, error } = await supabaseClient
      .from('visitors')
      .insert({
        ip_address: ipAddress,
        user_agent: userAgent,
        accept_language: acceptLanguage,
        visited_at: new Date().toISOString(),
      })

    if (error) {
      console.error('Error storing visitor:', error)
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        ip: ipAddress,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (error) {
    console.error('Track visitor error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 },
    )
  }
})