export const generateHealthAdvice = async (symptoms: string, userContext: string): Promise<string> => {
  try {
    const prompt = `
      Agis comme un assistant médical empathique et bienveillant pour une patiente atteinte ou en rémission du cancer du sein.
      L'utilisateur signale les symptômes suivants : "${symptoms}".
      Contexte supplémentaire : "${userContext}".
      
      Fournis :
      1. Une réponse rassurante.
      2. Des conseils pratiques pour soulager les symptômes (non-médicaux).
      3. Une suggestion de savoir s'il faut contacter un médecin.
      
      Réponds en français, format concis.
    `;

    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    return data.result || "Désolé, je n'ai pas pu générer de conseil pour le moment.";
  } catch (error) {
    console.error("AI Service Error:", error);
    return "Une erreur est survenue lors de la consultation de l'assistant virtuel.";
  }
};

export const chatWithAssistant = async (history: { role: 'user' | 'model', text: string }[], newMessage: string) => {
  try {
    const messages = [
      {
        role: 'system',
        content: "Tu es 'Rose', une assistante virtuelle spécialisée dans le soutien aux patients atteints de cancer du sein. Tu es douce, informative, et tu ne donnes jamais de diagnostic médical strict, mais tu orientes toujours vers les professionnels de santé. Tu parles français."
      },
      ...history.map(h => ({
        role: h.role === 'model' ? 'assistant' : 'user',
        content: h.text
      })),
      { role: 'user', content: newMessage }
    ];

    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`AI Chat Error: ${response.status} ${response.statusText}`, errorText);
      throw new Error(`Erreur serveur: ${response.status}`);
    }

    const data = await response.json();
    return data.result || "Désolé, je ne peux pas répondre pour le moment.";
  } catch (error) {
    console.error("AI Chat Error Details:", error);
    throw new Error("Impossible de joindre l'assistant. Vérifiez que le serveur backend tourne.");
  }
}
