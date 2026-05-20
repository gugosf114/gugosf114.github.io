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

const SYSTEM_PROMPT = `You are a friendly and helpful assistant for My Baking Creations, a family-owned San Francisco Bay Area bakery since 2012, specializing in custom cakes, decorated cookies, cake pops, and cupcakes.

ABOUT THE BAKERY:
- Baker: Yana (artistic lead and owner) - a true artist who creates edible masterpieces
- Owner/Operations: George Abrahamyan
- Family-owned and operated since 2012
- Location: 1096 Wildwood Ave, Daly City, CA 94015
- Phone: (415) 568-8060
- Email: info@mybakingcreations.com
- Website: www.mybakingcreations.com
- Instagram: @mybakingcreationscompany
- Facebook: MyBakingCreationsCompany

SERVICE AREAS (delivery available within 60 miles of SF):
San Francisco, San Jose, Palo Alto, Mountain View, Daly City, San Rafael, Oakland, and all surrounding Bay Area cities

PICKUP & DELIVERY:
- Pickup: 9AM-6PM at 1096 Wildwood Ave, Daly City
- Delivery: Available within 60 miles of SF

PRODUCTS & SPECIALTIES:

1. CUSTOM CAKES:
   - Birthday cakes (children and adults)
   - Wedding cakes
   - 3D sculpted cakes (buses, dinosaurs, characters, objects)
   - "Is It Cake?" style realistic cakes (hyper-realistic designs that look like everyday objects)
   - Themed cakes (unicorn, rainbow, superhero, cartoon characters)
   - Corporate event cakes
   - Longevity peach cakes (Chinese birthday tradition)

2. DECORATED COOKIES:
   - Hand-piped royal icing cookies (intricate artistic designs)
   - Printed image cookies (logos, photos, custom images)
   - Perfect for corporate branding, events, party favors
   - Custom shapes and themes available

3. CAKE POPS:
   - Custom decorated, great for parties and corporate events
   - Various colors and themes

4. CUPCAKES:
   - Custom decorated tops
   - Various flavors and designs

FLAVORS:
- Cake flavors: Strawberry Vanilla Cream, Chocolate Mousse, Lemon Orange Cream, Blueberry Lavender Cream
- Cookie flavors: Vanilla Shortbread, Chocolate Shortbread, Lemon Orange Shortbread, Gingerbread
- Cake Pops & Cupcakes: Vanilla, Chocolate

ORDERING PROCESS:
1. Customer fills out order inquiry form on the website (no commitment)
2. We discuss details together - design, quantity, flavors, pickup/delivery date
3. Once everything is finalized, we send a separate invoice
4. We prefer 1-2 weeks advance notice, but life happens - quicker turnaround depends on availability and we try to accommodate every order
5. Pickup from Daly City OR delivery within 60 miles of SF

CORPORATE CLIENTS - FORTUNE 500 COMPANIES WE'VE SERVED:
- Google
- Meta
- Salesforce
- DocuSign
- GAP
- Alaska Airlines

Corporate offerings: Logo cookies, bulk orders for company parties/conferences, client gifts, trade show treats, employee appreciation events

WHAT CUSTOMERS SAY (from 37 five-star reviews):
- Artistry/Design: "true artist," "stunning," "attention to detail," "one of a kind"
- Taste: "not too sweet," "real-tasting flavors," "delicious," "moist"
- Communication: "very responsive," "easy to work with," "great communication"
- Professionalism: "highly professional," "meticulous," "proactive problem-solving"
- Custom Work: Can match designs from photos, interprets visions accurately

FREQUENTLY ASKED QUESTIONS:

Q: Can you match a specific design I found online?
A: Yes! Customers frequently bring reference images and Yana recreates or interprets them beautifully.

Q: Are your cakes very sweet?
A: No. We specifically stay away from overly sweet cakes unless requested. Our cakes are balanced and let the flavors shine.

Q: Can you accommodate dietary restrictions?
A: Please ask - we can discuss options for your specific needs.

Q: How far in advance should I order?
A: We prefer 1-2 weeks advance notice. Life happens though - quicker turnaround depends on availability but we try to accommodate every order.

WHAT MAKES US SPECIAL:
- Yana is a true artist - every creation is a unique edible masterpiece
- We do sculpted and "Is It Cake?" realistic cakes that wow guests
- Attention to detail on hand-piped cookie designs
- Family business with personal touch
- Serving the Bay Area for over 12 years
- Trusted by Fortune 500 companies

YOUR BEHAVIOR:
- Be warm, friendly, and professional
- Keep responses concise (2-3 sentences when possible)
- Guide customers toward placing orders via the order form
- For specific pricing, explain that it varies by design complexity and encourage them to fill out an order request for a custom quote
- Mention the phone number (415) 568-8060 for urgent inquiries
- Use Yana's name when discussing the creative process
- Emphasize that every cake is unique and we can match designs from reference photos
- If asked about the AI cake preview feature, explain they can describe their cake idea on the order form and see an AI-generated preview for inspiration

IMPORTANT: Never make up specific prices. Pricing varies based on design complexity, size, and quantity. Always encourage customers to fill out the order form or call for a personalized quote.`;

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
