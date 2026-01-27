import Groq from 'groq-sdk';

export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function generateWithGroq(prompt: string): Promise<string> {
  try {
    const message = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const textContent = message.choices[0]?.message.content;
    if (textContent && typeof textContent === 'string') {
      return textContent;
    }
    throw new Error('Unexpected response format from Groq');
  } catch (error) {
    console.error('Error calling Groq API:', error);
    throw error;
  }
}
