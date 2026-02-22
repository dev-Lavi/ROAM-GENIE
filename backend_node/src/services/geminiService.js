/**
 * Gemini AI Service
 * Wraps @google/generative-ai for multi-agent style prompting used by the
 * Researcher, Planner, and Hotel & Restaurant Finder agents.
 */
import { GoogleGenerativeAI } from '@google/generative-ai';
import logger from '../utils/logger.js';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

const MODEL_ID = 'gemini-2.5-flash';

/**
 * Run a single prompt against the Gemini model and return the text result.
 * @param {string} systemInstruction  -  Role / persona for the model
 * @param {string} userPrompt         -  User-facing task description
 * @returns {Promise<string>}
 */
async function runAgent(systemInstruction, userPrompt) {
    const model = genAI.getGenerativeModel({
        model: MODEL_ID,
        systemInstruction,
    });

    const result = await model.generateContent(userPrompt);
    const response = result.response;
    return response.text();
}

// ─── Named Agents ────────────────────────────────────────────────────────────

/**
 * Researcher agent – identifies climate, safety, top attractions & activities.
 */
export async function runResearcher(prompt) {
    const systemInstruction = [
        'You are an expert travel researcher.',
        'Identify the destination and research its climate, safety level, top attractions, and best activities.',
        'Use reliable travel knowledge and always summarize results clearly and concisely.',
        `Current date and time: ${new Date().toISOString()}`,
    ].join('\n');

    logger.info('[Researcher Agent] Prompt received');
    return runAgent(systemInstruction, prompt);
}

/**
 * Planner agent – creates a detailed, preference-aligned day-by-day itinerary.
 */
export async function runPlanner(prompt) {
    const systemInstruction = [
        'You are an expert travel planner.',
        'Create a detailed daily itinerary with time estimates and budget alignment.',
        'Format each day clearly with morning, afternoon, and evening sections.',
        `Current date and time: ${new Date().toISOString()}`,
    ].join('\n');

    logger.info('[Planner Agent] Prompt received');
    return runAgent(systemInstruction, prompt);
}

/**
 * Hotel & Restaurant Finder agent – recommends top-rated places near attractions.
 */
export async function runHotelRestaurantFinder(prompt) {
    const systemInstruction = [
        'You are a hotel and restaurant expert.',
        'Find and recommend top-rated hotels and restaurants near main tourist attractions.',
        'Include price range, highlights, and booking links where possible.',
        `Current date and time: ${new Date().toISOString()}`,
    ].join('\n');

    logger.info('[Hotel & Restaurant Finder Agent] Prompt received');
    return runAgent(systemInstruction, prompt);
}
