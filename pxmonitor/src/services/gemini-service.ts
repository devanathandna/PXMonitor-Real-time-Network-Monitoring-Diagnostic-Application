/**
 * Gemini API Service
 * 
 * This module provides a client-side interface to interact with the Google
 * Generative AI API for explaining network components and providing insights.
 */
import { GoogleGenerativeAI } from "@google/generative-ai";

// --- IMPORTANT ---
// Replace "YOUR_API_KEY" with your actual Google AI Studio API key.
// For production, use a secure method like environment variables.
const API_KEY = "AIzaSyAajxqRTFjW0gSph8Aod3sCOpc8qvhmFR0";

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Simple in-memory cache to store explanations and avoid rate-limiting.
const explanationCache = new Map<string, string>();

/**
 * Generates an explanation for a component and its data using the Gemini API.
 * Caches results to avoid redundant API calls.
 *
 * @param componentName - The name of the component to explain.
 * @param data - The data associated with the component.
 * @returns A promise with the explanation text.
 */
async function generateExplanation(componentName: string, data: Record<string, any> = {}): Promise<string> {
  // Create a consistent key for caching based on the component and its data.
  const cacheKey = `${componentName}:${JSON.stringify(data)}`;

  // If we have a cached response, return it immediately.
  if (explanationCache.has(cacheKey)) {
    console.log(`Returning cached explanation for: ${componentName}`);
    return explanationCache.get(cacheKey)!;
  }

  console.log(`Fetching new explanation from Gemini API for: ${componentName}`);
  // Construct the prompt with a clear instruction and stringified data.
  const prompt = `Analyse this '${componentName}' Use the component metrics (indirectly Don't use it as in output expect metrics )and Explain what it does to the Network and what information that we can infer in simple understadable formal way,)(easy to understand wordings) around 140 words not more than this . Data: ${JSON.stringify(data, null, 2)}`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Store the new explanation in the cache.
    explanationCache.set(cacheKey, text);

    return text;
  } catch (error) {
    console.error("Error generating explanation with Gemini API:", error);
    // Throw a more specific error to be caught by the UI
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Gemini API Error: ${errorMessage}`);
  }
}


/**
 * Get an explanation for a network component. This function is for simple cases
 * where no specific data is passed.
 * @param componentName - The name of the component to explain.
 * @returns A promise with the explanation text.
 */
export const getComponentExplanation = async (componentName: string, data: Record<string, any> = {}): Promise<string> => {
  // We can call the generic generator with the component name and its data.
  return generateExplanation(componentName, data);
};

/**
 * Analyze component data and provide a detailed explanation.
 * @param dataSnapshot - The component data snapshot to analyze.
 * @returns A promise with detailed analysis text.
 */
export const analyzeComponentData = async (dataSnapshot: {
  componentName: string;
  metrics: Record<string, any>;
}): Promise<string> => {
  // Pass both the component name and its metrics to the generator.
  return generateExplanation(dataSnapshot.componentName, dataSnapshot.metrics);
};

// The analyzeNetworkMetrics function seems to be unused by the popovers,
// but we can keep it and wire it to the new generator if needed.
/**
 * Analyze network metrics and provide insights.
 * @param metrics - The network metrics to analyze.
 * @returns A promise with analysis text.
 */
export const analyzeNetworkMetrics = async (metrics: Record<string, any>): Promise<string> => {
    return generateExplanation("Overall Network Metrics", metrics);
};

export default {
  getComponentExplanation,
  analyzeNetworkMetrics,
  analyzeComponentData,
};