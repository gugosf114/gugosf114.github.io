/**
 * My Baking Creations - AI Cake Preview (Gemini)
 * Cloudflare Worker
 *
 * DEPLOYMENT:
 * 1. Go to dash.cloudflare.com → Workers & Pages → Create Worker
 * 2. Paste this entire file
 * 3. Go to Settings → Variables → Add: GEMINI_API_KEY = your-key-here
 * 4. Deploy and copy the worker URL
 * 5. Update PREVIEW_WORKER_URL in order-form.html
 */

// Rate limiting (simple in-memory, resets on worker restart)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 3600000; // 1 hour
const RATE_LIMIT_MAX = 5; // 5 generations per hour per IP

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

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

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
        error: 'You\'ve reached the preview limit. Please describe your cake in the form and we\'ll work with you on the design!'
      }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    try {
      const { description } = await request.json();

      if (!description || description.trim().length < 5) {
        return new Response(JSON.stringify({
          error: 'Please provide a description of your cake (at least a few words).'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Sanitize and limit description length
      const cleanDescription = description.trim().slice(0, 500);

      // Build the prompt - we control the style, they provide the concept
      const imagePrompt = `Professional bakery product photo of a beautiful custom decorated cake: ${cleanDescription}.
The cake should look realistic and achievable by a skilled baker.
Style: elegant presentation, clean white background, soft studio lighting, realistic buttercream or fondant textures, appetizing and celebratory.
Do NOT include any text, letters, words, or writing on the cake.`;

      // Call Gemini Imagen API
      const geminiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${env.GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            instances: [{ prompt: imagePrompt }],
            parameters: {
              sampleCount: 1,
              aspectRatio: "1:1",
              safetyFilterLevel: "block_medium_and_above",
              personGeneration: "dont_allow"
            }
          }),
        }
      );

      if (!geminiResponse.ok) {
        const errorText = await geminiResponse.text();
        console.error('Gemini API error:', errorText);
        return new Response(JSON.stringify({
          error: 'Could not generate preview. Please try a different description or contact us directly!'
        }), {
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const geminiData = await geminiResponse.json();

      // Extract the base64 image from response
      const imageData = geminiData.predictions?.[0]?.bytesBase64Encoded;

      if (!imageData) {
        console.error('No image in Gemini response:', geminiData);
        return new Response(JSON.stringify({
          error: 'Could not generate preview. Please try a simpler description!'
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({
        image: `data:image/png;base64,${imageData}`,
        success: true
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({
        error: 'Something went wrong. Please try again or describe your cake in the form!'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  },
};
