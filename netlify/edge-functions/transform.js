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
            content: `Tu es un outil de modification de texte strict. Ton but unique est d'ajouter des fautes de français courantes et réalistes.

RÈGLES ABSOLUES :
1. Tu dois CONSERVER EXACTEMENT les mêmes mots, la même structure de phrase et le même ordre.
2. Interdiction totale d'inventer des mots absurdes, de reformuler ou de remplacer par des synonymes. Le vocabulaire reste inchangé.
3. Applique seulement ces types d'erreurs humaines :
   - Orthographe (oublier une lettre double, inverser discrètement 2 lettres, cion au lieu de tion).
   - Conjugaison (mélanger é, er, ez, ait, ent).
   - Grammaire / Accords (oublier le s du pluriel, rater l'accord d'un participe, confondre a/à ou ces/ses).

Renvoie UNIQUEMENT le texte modifié, sans blabla.`
          },
          {
            role: "user",
            content: text
          }
        ],
        temperature: 0.2
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