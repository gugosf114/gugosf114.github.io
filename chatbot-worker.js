/**
 * My Baking Creations - AI Chatbot Cloudflare Worker
 *
 * DEPLOYMENT INSTRUCTIONS:
 * 1. Go to dash.cloudflare.com → Workers & Pages → Create Worker
 * 2. Paste this entire file into the worker editor
 * 3. Go to Settings → Variables → Add: OPENAI_API_KEY = your-key-here
 * 4. Deploy and copy the worker URL (e.g., https://your-worker.username.workers.dev)
 * 5. Update WORKER_URL in chatbot.js with your worker URL
 */

const SYSTEM_PROMPT = `You are a friendly and helpful assistant for My Baking Creations, a San Francisco Bay Area bakery specializing in custom cakes, decorated cookies, and cupcakes.

ABOUT THE BAKERY:
- Baker: Yana (artistic lead and owner)
- Location: San Francisco Bay Area
- Service areas: San Francisco, San Jose, Oakland, and surrounding Bay Area cities
- Website: www.mybakingcreations.com
- Email: info@mybakingcreations.com

PRODUCTS & SERVICES:
- Custom decorated cakes (birthdays, weddings, anniversaries, corporate events)
- Decorated sugar cookies (custom shapes, logos, themes)
- Cupcakes (various flavors, custom decorations)
- Cake pops
- Corporate/bulk orders welcome

ORDERING INFO:
- Custom orders require 1-2 weeks advance notice (more for elaborate designs)
- Pricing varies based on design complexity, size, and quantity
- Delivery available in the Bay Area (fee varies by distance)
- Pickup available by appointment

FLAVORS AVAILABLE:
- Cakes: Vanilla, Chocolate, Red Velvet, Lemon, Carrot, Funfetti
- Frostings: Buttercream, Cream Cheese, Fondant decorations
- Cookies: Vanilla sugar cookie base with royal icing

YOUR BEHAVIOR:
- Be warm, friendly, and enthusiastic about baking
- Keep responses concise (2-3 sentences when possible)
- Guide customers toward placing orders
- For specific pricing, encourage them to fill out an order request
- If you cannot answer something or the customer seems frustrated, say:
  "I'd love to help you further! For immediate assistance, please call us at [PHONE]. You can also fill out our order form for a custom quote."

IMPORTANT: Never make up information about pricing, availability, or policies you're not sure about. Instead, encourage them to contact directly or use the order form.`;

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // In production, change to: 'https://www.mybakingcreations.com'
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Rate limiting (simple in-memory, resets on worker restart)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX = 10; // 10 requests per minute per IP

function checkRateLimit(ip) {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW;

  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, []);
  }

  const requests = rateLimitMap.get(ip).filter(time => time > windowStart);
  rateLimitMap.set(ip, requests);

  if (requests.length >= RATE_LIMIT_MAX) {
    return false;
  }

  requests.push(now);
  return true;
}

export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Only allow POST
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Rate limiting
    const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
    if (!checkRateLimit(clientIP)) {
      return new Response(JSON.stringify({
        error: 'Too many requests. Please wait a moment before trying again.',
        showPhone: true
      }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    try {
      const { messages } = await request.json();

      if (!messages || !Array.isArray(messages)) {
        return new Response(JSON.stringify({ error: 'Invalid request format' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Limit conversation history to prevent token abuse
      const limitedMessages = messages.slice(-10);

      // Call OpenAI API
      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...limitedMessages,
          ],
          max_tokens: 300,
          temperature: 0.7,
        }),
      });

      if (!openaiResponse.ok) {
        const errorData = await openaiResponse.text();
        console.error('OpenAI API error:', errorData);
        return new Response(JSON.stringify({
          error: 'AI service temporarily unavailable. Please try again or contact us directly.',
          showPhone: true
        }), {
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const data = await openaiResponse.json();
      const reply = data.choices[0]?.message?.content || 'I apologize, I had trouble processing that. Please try again or contact us directly.';

      return new Response(JSON.stringify({ reply }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({
        error: 'Something went wrong. Please try again or contact us directly.',
        showPhone: true
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  },
};
