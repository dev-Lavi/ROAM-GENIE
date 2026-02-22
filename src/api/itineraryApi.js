/**
 * itineraryApi.js — POST /api/travel/plan
 *
 * Handles two possible formats from the backend:
 *
 * FORMAT A  (raw SerpAPI best_flights item):
 * {
 *   airline_logo:  string,
 *   price:         number,
 *   total_duration:number (minutes),
 *   layovers:      [...],
 *   link:          string,
 *   flights: [           ← array of legs
 *     {
 *       airline:           string,
 *       airline_logo:      string,
 *       travel_class:      string,
 *       flight_number:     string,
 *       airplane:          string,
 *       departure_airport: { id, name, time },   // "YYYY-MM-DD HH:MM"
 *       arrival_airport:   { id, name, time },
 *     }
 *   ]
 * }
 *
 * FORMAT B  (already-normalized flat object from backend):
 * {
 *   airline:     string,
 *   price:       number,
 *   departure:   string (ISO or "YYYY-MM-DD HH:MM"),
 *   arrival:     string,
 *   duration:    number,
 *   stops:       number,
 *   flightClass: string,
 *   link:        string,
 *   logoUrl:     string,
 * }
 */

import { API_BASE_URL } from '../utils/constants';

const BUDGET_MAP = { budget: 'Economy', moderate: 'Standard', luxury: 'Luxury' };
const CLASS_MAP = {
    economy: 'Economy', premium_economy: 'Business',
    business: 'Business', first: 'First Class',
};

/** Convert "YYYY-MM-DD HH:MM" → valid ISO so new Date() works */
const toISO = (v) => {
    if (!v) return null;
    if (typeof v !== 'string') return null;
    const s = v.trim();
    if (s.includes('T')) return s;           // already ISO
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}/.test(s))
        return s.replace(' ', 'T') + ':00';  // "YYYY-MM-DD HH:MM" → ISO
    return s;
};

/**
 * Detect whether a flight item is FORMAT A (has nested `flights[]` legs)
 * or FORMAT B (already-flat with `airline`, `departure`, `arrival` etc.)
 */
const isSerpRaw = (f) => Array.isArray(f.flights) && f.flights.length > 0;

/**
 * Normalize whatever the backend returns into the rich shape FlightCard needs.
 */
const normaliseFlight = (f, requestedClass) => {
    /* ── FORMAT A: raw SerpAPI ── */
    if (isSerpRaw(f)) {
        const legs = f.flights;
        const firstLeg = legs[0];
        const lastLeg = legs[legs.length - 1];

        const airline =
            firstLeg.airline ||
            legs.map(l => l.airline).filter(Boolean).join(' + ') ||
            'Airline';

        const logoUrl = firstLeg.airline_logo || f.airline_logo || null;

        const classKey = (firstLeg.travel_class || requestedClass || 'Economy')
            .toLowerCase().replace(/\s+/g, '_');

        return {
            airline,
            logoUrl,
            price: f.price || 0,
            currency: 'INR',
            departure: toISO(firstLeg.departure_airport?.time),
            arrival: toISO(lastLeg.arrival_airport?.time),
            duration: f.total_duration || null,
            stops: Math.max(0, legs.length - 1),
            flightClass: classKey,
            link: f.link || null,
            // Detailed fields
            depAirportCode: firstLeg.departure_airport?.id || '',
            depAirportName: firstLeg.departure_airport?.name || '',
            arrAirportCode: lastLeg.arrival_airport?.id || '',
            arrAirportName: lastLeg.arrival_airport?.name || '',
            flightNumber: firstLeg.flight_number || legs.map(l => l.flight_number).filter(Boolean).join(', ') || '',
            aircraft: firstLeg.airplane || '',
            layovers: f.layovers || [],
            allLegs: legs.map(l => ({
                airline: l.airline,
                flightNumber: l.flight_number || '',
                aircraft: l.airplane || '',
                depCode: l.departure_airport?.id || '',
                depName: l.departure_airport?.name || '',
                depTime: toISO(l.departure_airport?.time),
                arrCode: l.arrival_airport?.id || '',
                arrName: l.arrival_airport?.name || '',
                arrTime: toISO(l.arrival_airport?.time),
                duration: l.duration || null,
                travelClass: l.travel_class || '',
                legroom: l.legroom || '',
            })),
        };
    }

    /* ── FORMAT B: already-normalized from backend ── */
    const classRaw = f.flightClass || f.travel_class || f.flightclass || requestedClass || 'Economy';
    const classKey = classRaw.toLowerCase().replace(/\s+/g, '_');

    // Airline: skip generic "Unknown Airline" from backend, prefer logo domain approach
    const airlineRaw = f.airline || f.airlineName || '';
    const airline = (airlineRaw && airlineRaw !== 'Unknown Airline') ? airlineRaw : 'Airline';

    const logoUrl = f.logoUrl || f.airline_logo || f.airlineLogo || null;

    const departure = toISO(f.departure) || toISO(f.departureTime) || null;
    const arrival = toISO(f.arrival) || toISO(f.arrivalTime) || null;
    const duration = f.duration || f.total_duration || f.totalDuration || null;
    const stops = typeof f.stops === 'number' ? f.stops : 0;

    return {
        airline,
        logoUrl,
        price: f.price || 0,
        currency: 'INR',
        departure,
        arrival,
        duration,
        stops,
        flightClass: classKey,
        link: f.link || f.bookingLink || f.bookingUrl || null,
        // Detailed fields — may not be present in FORMAT B
        depAirportCode: f.depAirportCode || f.from || '',
        depAirportName: f.depAirportName || '',
        arrAirportCode: f.arrAirportCode || f.to || '',
        arrAirportName: f.arrAirportName || '',
        flightNumber: f.flightNumber || f.flight_number || '',
        aircraft: f.aircraft || f.airplane || '',
        layovers: f.layovers || [],
        allLegs: f.allLegs || [],
    };
};

/** Generate a full AI travel plan */
export const generateTravelPlan = async (formData) => {
    let numDays = 5;
    if (formData.departDate && formData.returnDate) {
        const d1 = new Date(formData.departDate);
        const d2 = new Date(formData.returnDate);
        const diff = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
        if (diff > 0) numDays = diff;
    }

    const requestedClass = CLASS_MAP[formData.flightClass] || 'Economy';

    const payload = {
        source: formData.source,
        destination: formData.destination,
        departureDate: formData.departDate,
        returnDate: formData.returnDate || formData.departDate,
        numDays,
        travelTheme: formData.travelTheme || 'Couple Getaway',
        activityPreferences: (formData.preferences || []).join(', ') || 'Sightseeing',
        budget: BUDGET_MAP[formData.budget] || 'Standard',
        flightClass: requestedClass,
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

    // Debug: log raw flight schema so we can see what the backend actually sends
    if (data.flights?.length > 0) {
        console.log('[RoamGenie] Raw flight[0] from backend:', JSON.stringify(data.flights[0], null, 2));
    }

    const rawFlights = data.flights || [];
    const normalisedFlights = rawFlights.map((f) => normaliseFlight(f, requestedClass));

    return {
        visaStatus: data.visaStatus,
        destinationCountry: data.destinationCountry,
        destination: formData.destination,
        flights: normalisedFlights,
        hotels: [],
        restaurants: [],
        itinerary: data.itinerary || '',
        hotelRestaurantResults: data.hotelRestaurantResults || '',
        researchResults: data.researchResults || '',
    };
};
