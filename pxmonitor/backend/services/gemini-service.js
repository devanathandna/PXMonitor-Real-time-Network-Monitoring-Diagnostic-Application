
/**
 * Gemini API Service
 * 
 * This module provides functionality to interact with Google's Generative AI (Gemini)
 * for explaining network components and providing insights about network metrics.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

// You'll need to replace this with your actual API key
// In a production environment, this should be stored as an environment variable
const API_KEY = "YOUR_API_KEY"; // Replace with your API key

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(API_KEY);

/**
 * Get an explanation for a network component
 * @param {string} componentName - The name of the component to explain
 * @returns {Promise<string>} - A description of the component
 */
async function explainNetworkComponent(componentName) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `Explain what a "${componentName}" is in the context of network monitoring 
                    and how it helps users understand their network performance. 
                    Keep the explanation under 150 words, technical but accessible.`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return `Failed to get explanation for ${componentName}. Please try again later.`;
  }
}

/**
 * Analyze network metrics and provide insights
 * @param {Object} metrics - The network metrics to analyze
 * @returns {Promise<string>} - Insights about the network metrics
 */
async function analyzeNetworkMetrics(metrics) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `I have the following network metrics:
                    - Latency: ${metrics.latency}ms
                    - Jitter: ${metrics.jitter}ms
                    - Packet Loss: ${metrics.packetLoss}%
                    - Bandwidth: ${metrics.bandwidth}Mbps
                    - DNS Delay: ${metrics.dnsDelay}ms
                    - Health Score: ${metrics.healthScore}
                    - Network Stability: ${metrics.stability}
                    - Network Congestion: ${metrics.congestion}
                    
                    Based on these metrics, provide a brief analysis of the network health
                    and 2-3 specific recommendations to improve performance.
                    Keep it under 150 words and focus on actionable advice.`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return text;
  } catch (error) {
    console.error("Error calling Gemini API for network analysis:", error);
    return "Failed to analyze network metrics. Please try again later.";
  }
}

export {
  explainNetworkComponent,
  analyzeNetworkMetrics
};
