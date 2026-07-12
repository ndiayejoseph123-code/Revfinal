// netlify/functions/mistral.js
export default async (req, context) => {
  // Seulement POST accepté
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Prompt requis' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Récupère la clé API depuis la variable d'environnement
    const apiKey = process.env.MISTRAL_API_KEY;

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Clé API Mistral non configurée' }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Appel à Mistral API
    const response = await fetch('https://api.mistral.ai/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'mistral-small-latest',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const error = await response.json();
      return new Response(JSON.stringify({ 
        error: error.message || 'Erreur Mistral API' 
      }), { 
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const data = await response.json();
    const result = data.content[0].text;

    return new Response(JSON.stringify({ result }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
