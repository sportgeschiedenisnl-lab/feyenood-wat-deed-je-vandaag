
import { GoogleGenAI, Type } from "@google/genai";
import type { EventGroup, ProcessedEvent } from '../types';

if (!process.env.API_KEY) {
    console.error("API_KEY environment variable not set.");
}
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const processEventsWithGemini = async (eventGroups: EventGroup[]): Promise<Omit<ProcessedEvent, 'image' | 'wikimediaUrl' | 'photoCount'>[]> => {
  if (eventGroups.length === 0) {
    return [];
  }

  const simplifiedEvents = eventGroups.map(group => ({
    date: group.date,
    descriptions: group.images.map(img => img.description.replace(/<[^>]*>/g, '').trim()).filter(d => d.length > 10)
  }));
  
  const prompt = `
    Je bent een AI-assistent voor een historisch sportfotoarchief over de voetbalclub Feyenoord. 
    Voor elke gebeurtenis hieronder, analyseer de bijbehorende fotobeschrijvingen.
    Genereer een korte, pakkende kop.
    Indien de gebeurtenis een voetbalwedstrijd is, formuleer dan een korte tekst met de wedstrijd en de uitslag (bijv. "Feyenoord - Telstar, 2-1"). Als het geen wedstrijd is, of de uitslag is onbekend, laat dit veld dan een lege string.
    BELANGRIJK: Gebruik altijd de correcte spelling "Feyenoord".
    De output moet een JSON-array zijn, waarbij elk object overeenkomt met een input-gebeurtenis en de velden "date", "headline", en "matchInfo" bevat.

    Gegevens:
    ${JSON.stringify(simplifiedEvents, null, 2)}
  `;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                date: { type: Type.STRING },
                headline: { type: Type.STRING },
                matchInfo: { type: Type.STRING, description: "Wedstrijd en uitslag, of een lege string." },
              },
              required: ["date", "headline", "matchInfo"],
            },
          },
        },
    });

    const text = response.text.trim();
    const result = JSON.parse(text);
    return result;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to process events with AI.");
  }
};