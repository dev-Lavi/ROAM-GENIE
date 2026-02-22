/**
 * Flight Service
 * Fetches flight data from the SerpAPI Google Flights engine.
 */
import axios from 'axios';
import logger from '../utils/logger.js';

const SERPAPI_BASE = 'https://serpapi.com/search.json';

/**
 * Fetch round-trip flight results for the given route and dates.
 *
 * @param {string} departureId      - IATA code for departure airport  (e.g. "BOM")
 * @param {string} arrivalId        - IATA code for arrival airport    (e.g. "DEL")
 * @param {string} outboundDate     - ISO date string "YYYY-MM-DD"
 * @param {string} returnDate       - ISO date string "YYYY-MM-DD"
 * @returns {Promise<object>}       - Raw SerpAPI response object
 */
export async function fetchFlights(departureId, arrivalId, outboundDate, returnDate) {
    const params = {
        engine: 'google_flights',
        departure_id: departureId.toUpperCase(),
        arrival_id: arrivalId.toUpperCase(),
        outbound_date: outboundDate,
        return_date: returnDate,
        currency: 'INR',
        hl: 'en',
        api_key: process.env.SERPAPI_KEY,
    };

    logger.info(`[FlightService] Searching flights ${departureId} → ${arrivalId} on ${outboundDate}`);

    const { data } = await axios.get(SERPAPI_BASE, { params, timeout: 20_000 });
    return data;
}

/**
 * Extract and return the 3 cheapest flights from the SerpAPI result.
 *
 * @param {object} flightData - Raw SerpAPI response
 * @returns {Array}           - Sorted list of up to 3 cheapest best_flights
 */
export function extractCheapestFlights(flightData) {
    const bestFlights = flightData?.best_flights ?? [];
    return [...bestFlights]
        .sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity))
        .slice(0, 3);
}

/**
 * Map of IATA airport codes to country names.
 * Used to determine visa requirements before generating a travel plan.
 */
export const IATA_TO_COUNTRY = {
    DEL: 'India', BOM: 'India', BLR: 'India', MAA: 'India',
    BKK: 'Thailand', SIN: 'Singapore', KUL: 'Malaysia',
    DXB: 'UAE', DOH: 'Qatar', KTM: 'Nepal', CMB: 'Sri Lanka',
    NRT: 'Japan', ICN: 'South Korea', TPE: 'Taiwan',
    LHR: 'United Kingdom', CDG: 'France', FRA: 'Germany',
    FCO: 'Italy', MAD: 'Spain', AMS: 'Netherlands',
    ZUR: 'Switzerland', VIE: 'Austria', ARN: 'Sweden',
    CPH: 'Denmark', OSL: 'Norway', HEL: 'Finland',
    JFK: 'United States', LAX: 'United States', YYZ: 'Canada',
    SYD: 'Australia', MEL: 'Australia', AKL: 'New Zealand',
};

/**
 * Format a datetime string from "YYYY-MM-DD HH:MM" to "MMM-DD, YYYY | HH:MM AM/PM"
 *
 * @param {string} isoString
 * @returns {string}
 */
export function formatDatetime(isoString) {
    if (!isoString || isoString === 'N/A') return 'N/A';
    try {
        const dt = new Date(isoString.replace(' ', 'T'));
        return dt.toLocaleString('en-US', {
            month: 'short', day: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });
    } catch {
        return 'N/A';
    }
}
