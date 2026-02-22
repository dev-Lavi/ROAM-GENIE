/**
 * War Room Service — Live Trip Disruption Intelligence
 *
 * Monitors flights via AviationStack API and travel advisories via SerpAPI,
 * then summarises actionable intelligence using Gemini.
 */
import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';
import logger from '../utils/logger.js';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const MODEL_ID = 'gemini-2.5-flash';

// AviationStack — free tier is 100 req/month, perfect for demos
const AVIATIONSTACK_BASE = 'http://api.aviationstack.com/v1';
const SERPAPI_BASE = 'https://serpapi.com/search.json';

// ─── Flight Status ───────────────────────────────────────────────────────────

/**
 * Fetch real-time flight status from AviationStack.
 * Falls back to a mock response if the key is not configured.
 *
 * @param {string} flightIata - e.g. "EK502"
 * @returns {Promise<object>}
 */
export async function fetchFlightStatus(flightIata) {
    const key = process.env.AVIATIONSTACK_KEY;

    if (!key) {
        logger.warn('[WarRoom] AVIATIONSTACK_KEY not set — returning mock flight data');
        return buildMockFlightStatus(flightIata);
    }

    try {
        logger.info(`[WarRoom] Fetching status for flight ${flightIata}`);
        const { data } = await axios.get(`${AVIATIONSTACK_BASE}/flights`, {
            params: { access_key: key, flight_iata: flightIata },
            timeout: 10_000,
        });
        const flight = data?.data?.[0] ?? null;
        if (!flight) return buildMockFlightStatus(flightIata);
        return normalizeAviationStackFlight(flight);
    } catch (err) {
        logger.error(`[WarRoom] AviationStack error: ${err.message}`);
        return buildMockFlightStatus(flightIata);
    }
}

function normalizeAviationStackFlight(f) {
    return {
        flightIata: f.flight?.iata ?? 'N/A',
        airline: f.airline?.name ?? 'Unknown',
        status: f.flight_status ?? 'Unknown',
        departure: {
            airport: f.departure?.airport ?? 'N/A',
            iata: f.departure?.iata ?? 'N/A',
            scheduled: f.departure?.scheduled ?? null,
            estimated: f.departure?.estimated ?? null,
            delay: f.departure?.delay ?? 0,
            terminal: f.departure?.terminal ?? null,
            gate: f.departure?.gate ?? null,
        },
        arrival: {
            airport: f.arrival?.airport ?? 'N/A',
            iata: f.arrival?.iata ?? 'N/A',
            scheduled: f.arrival?.scheduled ?? null,
            estimated: f.arrival?.estimated ?? null,
            delay: f.arrival?.delay ?? 0,
            terminal: f.arrival?.terminal ?? null,
            gate: f.arrival?.gate ?? null,
        },
        isMock: false,
    };
}

function buildMockFlightStatus(flightIata) {
    const now = new Date();
    const dep = new Date(now.getTime() + 3 * 60 * 60 * 1000);
    const arr = new Date(dep.getTime() + 2.25 * 60 * 60 * 1000);
    const delayMin = Math.random() > 0.5 ? Math.floor(Math.random() * 55) + 10 : 0;

    return {
        flightIata,
        airline: 'Demo Airline',
        status: delayMin > 0 ? 'delayed' : 'active',
        departure: {
            airport: 'Chhatrapati Shivaji Maharaj International Airport',
            iata: 'BOM',
            scheduled: dep.toISOString(),
            estimated: new Date(dep.getTime() + delayMin * 60 * 1000).toISOString(),
            delay: delayMin,
            terminal: 'T2',
            gate: 'A12',
        },
        arrival: {
            airport: 'Indira Gandhi International Airport',
            iata: 'DEL',
            scheduled: arr.toISOString(),
            estimated: new Date(arr.getTime() + delayMin * 60 * 1000).toISOString(),
            delay: delayMin,
            terminal: 'T3',
            gate: 'B7',
        },
        isMock: true,
    };
}

// ─── Travel Advisory ──────────────────────────────────────────────────────────

/**
 * Scrape travel advisories for a destination using SerpAPI news search.
 *
 * @param {string} destination  - City or country name
 * @returns {Promise<string[]>} - Array of headline strings
 */
export async function fetchTravelAdvisories(destination) {
    const key = process.env.SERPAPI_KEY;
    if (!key) {
        logger.warn('[WarRoom] SERPAPI_KEY not set — returning mock advisories');
        return [
            `${destination}: No disruptions reported. Check official government travel advisories.`,
        ];
    }

    try {
        logger.info(`[WarRoom] Fetching travel advisories for ${destination}`);
        const month = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });
        const { data } = await axios.get(SERPAPI_BASE, {
            params: {
                engine: 'google',
                q: `${destination} travel advisory alert ${month}`,
                api_key: key,
                num: 5,
                tbm: 'nws',
            },
            timeout: 15_000,
        });

        const results = data?.news_results ?? data?.organic_results ?? [];
        if (!results.length) return [`No current advisories found for ${destination}.`];
        return results.slice(0, 5).map((r) => `${r.title || r.snippet || 'Advisory'}`);
    } catch (err) {
        logger.error(`[WarRoom] SerpAPI advisory error: ${err.message}`);
        return [`Unable to fetch advisories for ${destination} at this time.`];
    }
}

// ─── Gemini Intelligence Summary ──────────────────────────────────────────────

/**
 * Use Gemini to produce a plain-English War Room intelligence brief
 * from flight status + advisory headlines.
 *
 * @param {object} flightStatus
 * @param {string[]} advisories
 * @param {object} context        - { destination, layoverMinutes? }
 * @returns {Promise<object>}     - { summary, alertLevel, actions }
 */
export async function buildIntelBrief(flightStatus, advisories, context) {
    logger.info('[WarRoom] Building intelligence brief with Gemini');

    const systemInstruction = [
        'You are RoamGenie\'s real-time travel intelligence officer.',
        'Assess the situation and return ONLY valid JSON (no markdown fences).',
        'Schema:',
        '{',
        '  "alertLevel": "green" | "amber" | "red",',
        '  "headline": string,',
        '  "summary": string,',
        '  "connectionViable": boolean | null,',
        '  "recommendedActions": string[],',
        '  "whatsappAlert": string',
        '}',
        '"whatsappAlert" must be a short, human-friendly WhatsApp message (max 200 chars).',
        '"alertLevel" green = all good, amber = worth watching, red = immediate action needed.',
    ].join('\n');

    const userPrompt = [
        `Flight: ${flightStatus.flightIata} | Status: ${flightStatus.status}`,
        `Departure delay: ${flightStatus.departure.delay ?? 0} minutes`,
        `Layover available: ${context.layoverMinutes ?? 'unknown'} minutes`,
        `Destination: ${context.destination ?? 'unknown'}`,
        `Travel advisories:\n${advisories.map((a, i) => `${i + 1}. ${a}`).join('\n')}`,
        `Assess if the connection is viable, what the traveler should do, and whether a WhatsApp alert is warranted.`,
    ].join('\n');

    const model = genAI.getGenerativeModel({ model: MODEL_ID, systemInstruction });
    const result = await model.generateContent(userPrompt);
    const raw = result.response.text().trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();

    try {
        return JSON.parse(raw);
    } catch {
        logger.warn('[WarRoom] Gemini JSON parse failed, using fallback');
        return {
            alertLevel: 'amber',
            headline: 'Status Update Available',
            summary: raw,
            connectionViable: null,
            recommendedActions: ['Check with your airline for the latest updates.'],
            whatsappAlert: `⚠️ War Room update for ${flightStatus.flightIata}: ${flightStatus.status}. Check app for details.`,
        };
    }
}
