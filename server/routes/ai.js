import express from 'express';
import OpenAI from 'openai';

const router = express.Router();

// Initialize OpenAI client pointing to local LM Studio
const client = new OpenAI({
    baseURL: 'http://localhost:1234/v1',
    apiKey: 'lm-studio', // Dummy key
});

router.post('/chat', async (req, res) => {
    const { messages } = req.body;

    try {
        const completion = await client.chat.completions.create({
            messages: messages,
            model: 'qwen3-1.7b', // Updated as per user request
        });

        const responseText = completion.choices[0]?.message?.content || "Désolé, je ne peux pas répondre pour le moment.";
        res.status(200).json({ result: responseText });
    } catch (error) {
        console.error("AI Service Error:", error);
        res.status(500).json({ message: "Erreur de connexion avec l'IA local." });
    }
});

export default router;
