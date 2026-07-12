export default async (request) => {
  // On accepte uniquement les requêtes POST
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Méthode non autorisée" }), {
      status: 405,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const { text } = await request.json();
    
    // Récupération sécurisée de la variable d'environnement Netlify
    const apiKey = Deno.env.get("MISTRAL_API_KEY");

    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Clé API Mistral manquante dans Netlify." }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Appel direct à l'API Mistral
    const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "mistral-small-latest",
        messages: [
          {
            role: "system",
            content: "Tu es un assistant chargé de réécrire le texte fourni par l'utilisateur en y ajoutant de nombreuses fautes d'orthographe, de grammaire et de conjugaison réalistes en français (erreurs d'accords, confusion é/er/ez, consonnes doubles sautées, fautes phonétiques). Le texte doit rester lisible mais donner une impression de très faibles compétences en français écrit. Ne réponds QUE le texte modifié, sans aucune formule de politesse, introduction ou blabla."
          },
          {
            role: "user",
            content: text
          }
        ],
        temperature: 0.7
      })
    });

    const data = await response.json();
    const resultText = data.choices[0].message.content;

    return new Response(JSON.stringify({ result: resultText }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

// Configuration de la route d'API pour Netlify
export const config = { path: "/api/transform" };