/**
 * itineraryApi.js
 *
 * POST /api/travel/plan
 *
 * Request body (matches backend travel route):
 * {
 *   source:              string   (IATA, e.g. "BOM")
 *   destination:         string   (IATA, e.g. "BKK")
 *   departureDate:       string   ("YYYY-MM-DD")
 *   returnDate:          string   ("YYYY-MM-DD", optional for one-way)
 *   numDays:             number
 *   travelTheme:         string   (e.g. "Couple Getaway")
 *   activityPreferences: string   (comma-joined preferences)
 *   budget:              string   ("Economy" | "Standard" | "Luxury")
 *   flightClass:         string   ("Economy" | "Business" | "First Class")
 *   hotelRating:         string   ("Any" | "3" | "4" | "5")
 *   passportCountry?:    string
 *   visaFreeCountries?:  string[]
 * }
 *
 * Response:
 * {
 *   visaStatus:             string
 *   destinationCountry:     string
 *   flights:                FlightCard[]
 *   researchResults:        string   (AI text)
 *   hotelRestaurantResults: string   (AI text)
 *   itinerary:              string   (AI text)
 * }
 */

import { API_BASE_URL } from '../utils/constants';

/** Map frontend form values → backend expected values */
const BUDGET_MAP = { budget: 'Economy', moderate: 'Standard', luxury: 'Luxury' };
const CLASS_MAP = {
    economy: 'Economy', premium_economy: 'Business',
    business: 'Business', first: 'First Class',
};

/**
 * Generate a full AI travel plan.
 * @param {object} formData  - Shape produced by TravelForm component
 */
export const generateTravelPlan = async (formData) => {
    // Derive numDays from depart + return dates
    let numDays = 5;
    if (formData.departDate && formData.returnDate) {
        const d1 = new Date(formData.departDate);
        const d2 = new Date(formData.returnDate);
        const diff = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
        if (diff > 0) numDays = diff;
    }

    const payload = {
        source: formData.source,
        destination: formData.destination,
        departureDate: formData.departDate,
        returnDate: formData.returnDate || formData.departDate,
        numDays,
        travelTheme: 'Couple Getaway',               // default; form doesn't expose it yet
        activityPreferences: (formData.preferences || []).join(', ') || 'Sightseeing',
        budget: BUDGET_MAP[formData.budget] || 'Standard',
        flightClass: CLASS_MAP[formData.flightClass] || 'Economy',
        hotelRating: 'Any',
        passportCountry: formData.passportCountry || null,
        visaFreeCountries: formData.visaFreeCountries || [],
    };

    const res = await fetch(`${API_BASE_URL}/api/travel/plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || err.message || `Server error: ${res.status}`);
    }

    const data = await res.json();

    // Normalise response so TravelPlan.jsx finds what it expects:
    //   flights[]        → already an array of FlightCard objects from backend
    //   hotels[]         → not returned as array; pass hotelRestaurantResults as text
    //   restaurants[]    → same
    //   itinerary        → AI text string
    return {
        visaStatus: data.visaStatus,
        destinationCountry: data.destinationCountry,
        flights: data.flights || [],
        hotels: [],           // hotels are part of hotelRestaurantResults (text)
        restaurants: [],           // same
        itinerary: data.itinerary || '',
        hotelRestaurantResults: data.hotelRestaurantResults || '',
        researchResults: data.researchResults || '',
    };
};
