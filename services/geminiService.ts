
import { GoogleGenAI } from "@google/genai";
import { GeminiPromptInfo } from '../types';

// IMPORTANT: In a real application, the API key should be handled securely
// and not exposed in the frontend code. This is for demonstration purposes.
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // This provides a clear error for developers if the API key is missing.
  // In a production app, you might have a different way of handling this.
  console.error("API_KEY environment variable not set. Gemini features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });
const model = 'gemini-2.5-flash';

const generatePrompt = (info: GeminiPromptInfo): string => {
  const { hostName, guestName, guestEmail, topic, date, time } = info;
  const formattedDate = date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `
    You are a helpful assistant responsible for creating calendar event details for a podcast recording session.
    Generate a concise, professional, and friendly calendar event title and a detailed event description.

    **Event Information:**
    - Podcast Host: ${hostName}
    - Guest: ${guestName}
    - Guest Email: ${guestEmail}
    - Topic of Discussion: "${topic}"
    - Date: ${formattedDate}
    - Time: ${time}

    **Instructions:**
    1.  **Title:** Create a clear and concise title. It should follow the format: "Podcast Recording: [Host Name] w/ [Guest Name]".
    2.  **Description:** Create a detailed description. It should:
        - Start with a friendly welcome to the guest.
        - Clearly state the purpose of the meeting (podcast recording).
        - Reiterate the topic of discussion.
        - Include the date and time.
        - Provide a brief, simple agenda (e.g., Pre-chat, Recording, Post-chat).
        - End with a positive closing remark, expressing excitement for the conversation.
        
    **Output Format:**
    Return a single JSON object with two keys: "title" and "description". Do not include any other text or markdown formatting.
    Example:
    {
      "title": "Podcast Recording: Alice w/ John Doe",
      "description": "Hello John,\\n\\nThis invitation is for our upcoming podcast recording session...etc."
    }
  `;
};


export const geminiService = {
    generateEventDetails: async (info: GeminiPromptInfo): Promise<{ title: string; description: string }> => {
        if (!API_KEY) {
            console.warn("Gemini service is disabled. Using fallback details.");
            return {
                title: `Podcast Recording: ${info.hostName} w/ ${info.guestName}`,
                description: `A podcast recording session about "${info.topic}".`
            };
        }

        try {
            const prompt = generatePrompt(info);
            const response = await ai.models.generateContent({
                model: model,
                contents: prompt,
                 config: {
                    responseMimeType: "application/json",
                },
            });

            const text = response.text.trim();
            const parsed = JSON.parse(text);

            if (typeof parsed.title === 'string' && typeof parsed.description === 'string') {
                return parsed;
            } else {
                throw new Error("Invalid JSON structure from Gemini API");
            }

        } catch (error) {
            console.error("Error calling Gemini API:", error);
            // Provide a fallback response in case of an API error
            return {
                title: `Podcast Recording: ${info.hostName} w/ ${info.guestName}`,
                description: `Guest: ${info.guestName} (${info.guestEmail})\nTopic: ${info.topic}\n\nThis is a placeholder description. There was an error generating the full details.`,
            };
        }
    },
};
