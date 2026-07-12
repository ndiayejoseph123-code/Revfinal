export default async (request) => {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Méthode non autorisée" }), {
      status: 405,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const { text } = await request.json();
    const apiKey = Deno.env.get("MISTRAL_API_KEY");

    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Clé API Mistral manquante dans Netlify." }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

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
            content: `Tu es un outil de modification de texte. Ton but est de saboter l'orthographe du texte fourni.

RÈGLES CRUCIALES DE FRÉQUENCE :
- Tu DOIS introduire au MINIMUM 7 fautes distinctes dans le texte (ou saboter environ 30% des mots si le texte est très long). Ne sois pas timide, sois agressif sur le nombre de fautes.

RÈGLES ABSOLUES DE STRUCTURE :
1. Tu dois CONSERVER EXACTEMENT les mêmes mots, la même structure de phrase et le même ordre. Ne reformule rien.
2. Interdiction totale d'inventer des mots absurdes ou d'utiliser des synonymes. Le mot doit rester reconnaissable mais mal écrit.

TYPES DE FAUTES AUTORISÉES :
- Orthographe (ex: oublier une lettre double, inverser 2 lettres, "f" au lieu de "ph", "tion" devient "cion").
- Conjugaison (ex: mélanger é, er, ez, ait, ent).
- Grammaire / Accords (ex: supprimer les "s" ou "x" du pluriel, rater l'accord du participe passé, confondre a/à ou ces/ses/c'est).

Renvoie UNIQUEMENT le texte modifié.`
          },
          {
            role: "user",
            content: text
          }
        ],
        temperature: 0.4 // Légèrement augmenté pour libérer sa capacité à faire des erreurs sans inventer de mots
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

export const config = { path: "/api/transform" };