/**
 * Travel Routes  –  /api/travel
 *
 * POST /api/travel/plan
 *   Body: {
 *     source, destination, departureDate, returnDate,
 *     numDays, travelTheme, activityPreferences,
 *     budget, flightClass, hotelRating,
 *     passportCountry?, visaFreeCountries?
 *   }
 *   Response: { visaStatus, flights: [], researchResults, hotelRestaurantResults, itinerary }
 */
import { Router } from 'express';
import {
    fetchFlights,
    extractCheapestFlights,
    IATA_TO_COUNTRY,
    formatDatetime,
} from '../services/flightService.js';
import {
    runResearcher,
    runPlanner,
    runHotelRestaurantFinder,
} from '../services/geminiService.js';
import logger from '../utils/logger.js';

const router = Router();

// ─── POST /api/travel/plan ────────────────────────────────────────────────────
router.post('/plan', async (req, res) => {
    try {
        const {
            source,
            destination,
            departureDate,
            returnDate,
            numDays = 5,
            travelTheme = 'Couple Getaway',
            activityPreferences = 'Sightseeing',
            budget = 'Standard',
            flightClass = 'Economy',
            hotelRating = 'Any',
            passportCountry = null,
            visaFreeCountries = [],
        } = req.body;

        if (!source || !destination || !departureDate || !returnDate) {
            return res.status(400).json({
                error: 'source, destination, departureDate, and returnDate are required.',
            });
        }

        const destinationCountry = IATA_TO_COUNTRY[destination.toUpperCase()] ?? 'Unknown';

        // ── Visa status check ──────────────────────────────────────────────────
        let visaStatus = 'Unknown';
        if (passportCountry && visaFreeCountries.length > 0) {
            if (visaFreeCountries.includes(destinationCountry)) {
                visaStatus = 'Visa-Free';
            } else if (destinationCountry !== 'Unknown') {
                visaStatus = 'Visa Required';
            } else {
                visaStatus = 'Check visa requirements';
            }
        }

        // ── Parallel: flights + research + hotels ─────────────────────────────
        logger.info(`[TravelRoute] Planning trip ${source}→${destination}`);

        const researchPrompt =
            `Research top attractions in ${destination} for a ${numDays}-day ` +
            `${travelTheme.toLowerCase()} trip. ` +
            `Interests: ${activityPreferences}. Budget: ${budget}. ` +
            `Flight class: ${flightClass}. Hotel rating: ${hotelRating}.`;

        const hotelRestaurantPrompt =
            `Recommend hotels and restaurants in ${destination} for a ` +
            `${travelTheme.toLowerCase()} trip. ` +
            `Preferences: ${activityPreferences}. Budget: ${budget}. ` +
            `Hotel Rating: ${hotelRating}.`;

        const [flightData, researchResults, hotelRestaurantResults] = await Promise.all([
            fetchFlights(source, destination, departureDate, returnDate),
            runResearcher(researchPrompt),
            runHotelRestaurantFinder(hotelRestaurantPrompt),
        ]);

        const cheapestFlights = extractCheapestFlights(flightData);

        // ── Itinerary (needs research + hotel results) ─────────────────────────
        const planningPrompt =
            `Create a ${numDays}-day travel itinerary to ${destination} ` +
            `for a ${travelTheme.toLowerCase()} trip. ` +
            `Preferences: ${activityPreferences}. Budget: ${budget}. ` +
            `Flight class: ${flightClass}. Hotel rating: ${hotelRating}. ` +
            `Research: ${researchResults}. ` +
            `Flights: ${JSON.stringify(cheapestFlights)}. ` +
            `Hotels & Restaurants: ${hotelRestaurantResults}.`;

        const itinerary = await runPlanner(planningPrompt);

        // ── Format flight cards for the frontend ──────────────────────────────
        const formattedFlights = cheapestFlights.map((flight) => {
            const flightsDetails = flight.flights ?? [{}];
            const dep = flightsDetails[0]?.departure_airport ?? {};
            const arr = flightsDetails[flightsDetails.length - 1]?.arrival_airport ?? {};
            return {
                airlineLogo: flight.airline_logo ?? '',
                airline: flight.airline ?? 'Unknown Airline',
                price: flight.price ?? 'N/A',
                totalDuration: flight.total_duration ?? 'N/A',
                departureTime: formatDatetime(dep.time ?? 'N/A'),
                arrivalTime: formatDatetime(arr.time ?? 'N/A'),
                bookingLink: flight.link ?? `https://www.google.com/flights?q=${source}+${destination}`,
            };
        });

        res.json({
            visaStatus,
            destinationCountry,
            flights: formattedFlights,
            researchResults,
            hotelRestaurantResults,
            itinerary,
        });
    } catch (err) {
        logger.error(`[TravelRoute] Error: ${err.message}`, { stack: err.stack });
        res.status(500).json({ error: err.message });
    }
});

// ─── GET /api/travel/iata-map ─────────────────────────────────────────────────
router.get('/iata-map', (_req, res) => {
    res.json(IATA_TO_COUNTRY);
});

export default router;
