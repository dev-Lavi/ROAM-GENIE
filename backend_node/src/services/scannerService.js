/**
 * Scanner Service — AI Trip DNA Scanner
 *
 * Accepts raw text (email body, WhatsApp message, OCR output from a PDF/image)
 * and uses Gemini to:
 *   1. Extract a structured booking JSON
 *   2. Generate a day-by-day itinerary from the extracted details
 *   3. Build a WhatsApp-ready message with the full itinerary summary
 */
import { GoogleGenerativeAI } from '@google/generative-ai';
import logger from '../utils/logger.js';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const MODEL_ID = 'gemini-2.5-flash';

// ─── Step 1: Parse booking confirmation → structured JSON ─────────────────────

/**
 * Parse a booking confirmation text and return structured data.
 *
 * @param {string} rawText   - Raw email / WhatsApp / OCR text
 * @returns {Promise<object>} - Structured booking object
 */
export async function parseBookingConfirmation(rawText) {
    logger.info('[ScannerService] Parsing booking confirmation with Gemini');

    const systemInstruction = [
        'You are a world-class travel document parser.',
        'Your job is to extract every piece of booking information from the supplied text.',
        'Return ONLY valid JSON — no markdown fences, no prose.',
        'Use null for fields you cannot find.',
        'The JSON schema must be:',
        '{',
        '  "type": "flight" | "hotel" | "car_rental" | "tour" | "unknown",',
        '  "bookingReference": string | null,',
        '  "pnr": string | null,',
        '  "airline": string | null,',
        '  "flightNumber": string | null,',
        '  "departure": { "airport": string | null, "iata": string | null, "city": string | null, "terminal": string | null, "time": string | null, "date": string | null },',
        '  "arrival": { "airport": string | null, "iata": string | null, "city": string | null, "terminal": string | null, "time": string | null, "date": string | null },',
        '  "seat": string | null,',
        '  "class": string | null,',
        '  "baggageAllowance": string | null,',
        '  "layovers": [{ "city": string, "iata": string, "duration": string }],',
        '  "passengerName": string | null,',
        '  "hotel": { "name": string | null, "checkIn": string | null, "checkOut": string | null, "roomType": string | null, "address": string | null },',
        '  "carRental": { "company": string | null, "pickupDate": string | null, "returnDate": string | null, "pickupLocation": string | null },',
        '  "tour": { "name": string | null, "startDate": string | null, "endDate": string | null, "inclusions": string[] },',
        '  "totalPrice": string | null,',
        '  "currency": string | null,',
        '  "summary": string',
        '}',
    ].join('\n');

    const model = genAI.getGenerativeModel({ model: MODEL_ID, systemInstruction });

    const result = await model.generateContent(
        `Extract all booking details from the following confirmation text:\n\n${rawText}`
    );

    const raw = result.response.text().trim();
    logger.info('[ScannerService] Gemini booking extraction complete');

    // Strip possible markdown fences
    const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();

    try {
        return JSON.parse(cleaned);
    } catch (e) {
        logger.warn('[ScannerService] Failed to parse Gemini JSON, returning raw text');
        return { type: 'unknown', summary: raw, parseError: true };
    }
}

// ─── Step 2: Generate itinerary from parsed booking ───────────────────────────

/**
 * Build a day-by-day itinerary from a parsed booking confirmation.
 * Works for flights (generates destination activities + logistics),
 * hotels, tours, and car rentals.
 *
 * @param {object} booking         - Structured booking from parseBookingConfirmation
 * @param {string|null} passportCountry
 * @returns {Promise<string>}      - Markdown itinerary string
 */
export async function generateItineraryFromBooking(booking, passportCountry = null) {
    if (booking.parseError) {
        return 'Could not generate itinerary — booking details could not be fully parsed.';
    }

    logger.info('[ScannerService] Generating itinerary from booking with Gemini');

    const systemInstruction = [
        'You are RoamGenie, an expert AI travel planner.',
        'Given extracted booking details, generate a complete, helpful, day-by-day travel itinerary.',
        'The itinerary should include:',
        '  - Arrival logistics (airport → hotel, terminal info, check-in tips)',
        '  - Day-by-day activities at the destination (morning, afternoon, evening)',
        '  - Departure logistics on the last day',
        '  - Practical tips: local transport, food, must-see spots, safety',
        '  - If layovers exist, include layover tips',
        'Format the output in clean Markdown with ## Day 1, ## Day 2, etc.',
        'Be specific and detailed — this is meant to be printed and used on the trip.',
        `Current date: ${new Date().toISOString().split('T')[0]}`,
    ].join('\n');

    // Build a rich context prompt from the booking data
    const parts = [];

    if (booking.type === 'flight') {
        const dep = booking.departure;
        const arr = booking.arrival;
        parts.push(`Flight: ${booking.airline ?? ''} ${booking.flightNumber ?? ''}`);
        if (dep?.city && arr?.city) parts.push(`Route: ${dep.city} (${dep.iata ?? '—'}) → ${arr.city} (${arr.iata ?? '—'})`);
        if (dep?.date) parts.push(`Departure: ${dep.date} at ${dep.time ?? 'TBD'}`);
        if (arr?.date) parts.push(`Arrival: ${arr.date} at ${arr.time ?? 'TBD'}`);
        if (booking.seat) parts.push(`Seat: ${booking.seat} (${booking.class ?? 'Economy'})`);
        if (booking.baggageAllowance) parts.push(`Baggage: ${booking.baggageAllowance}`);
        if (booking.layovers?.length) {
            parts.push(`Layovers: ${booking.layovers.map(l => `${l.city ?? l.iata} (${l.duration})`).join(', ')}`);
        }
        if (passportCountry) parts.push(`Traveller's passport: ${passportCountry}`);
    }

    if (booking.type === 'hotel' && booking.hotel) {
        const h = booking.hotel;
        parts.push(`Hotel: ${h.name ?? 'Unknown'}`);
        if (h.checkIn) parts.push(`Check-in: ${h.checkIn}`);
        if (h.checkOut) parts.push(`Check-out: ${h.checkOut}`);
        if (h.roomType) parts.push(`Room: ${h.roomType}`);
        if (h.address) parts.push(`Location: ${h.address}`);
    }

    if (booking.type === 'car_rental' && booking.carRental) {
        const c = booking.carRental;
        parts.push(`Car Rental: ${c.company ?? 'Unknown'}`);
        if (c.pickupDate) parts.push(`Pick-up: ${c.pickupDate} at ${c.pickupLocation ?? 'TBD'}`);
        if (c.returnDate) parts.push(`Return: ${c.returnDate}`);
    }

    if (booking.type === 'tour' && booking.tour) {
        const t = booking.tour;
        parts.push(`Tour: ${t.name ?? 'Unknown'}`);
        if (t.startDate) parts.push(`Starts: ${t.startDate}`);
        if (t.endDate) parts.push(`Ends: ${t.endDate}`);
        if (t.inclusions?.length) parts.push(`Inclusions: ${t.inclusions.join(', ')}`);
    }

    parts.push(`Booking reference: ${booking.pnr || booking.bookingReference || 'N/A'}`);
    if (booking.passengerName) parts.push(`Passenger: ${booking.passengerName}`);
    if (booking.summary) parts.push(`Booking summary: ${booking.summary}`);

    const userPrompt = [
        'Here are the confirmed booking details extracted from a travel document:',
        '',
        ...parts.map(p => `• ${p}`),
        '',
        'Please generate a complete, day-by-day travel itinerary based on these bookings.',
        'Include practical travel advice, local tips, and logistics at each stage of the journey.',
    ].join('\n');

    const model = genAI.getGenerativeModel({ model: MODEL_ID, systemInstruction });
    const result = await model.generateContent(userPrompt);
    const itinerary = result.response.text().trim();

    logger.info('[ScannerService] Itinerary generation complete');
    return itinerary;
}

// ─── Step 3: Build WhatsApp message with itinerary snippet ────────────────────

/**
 * Generate a WhatsApp-ready confirmation + itinerary highlight message.
 * Kept under ~1600 chars to be readable on mobile.
 *
 * @param {object} booking         - Structured booking
 * @param {string} itinerary       - Full markdown itinerary
 * @param {string|null} passportCountry
 * @returns {string}               - WhatsApp message body
 */
export function buildWhatsAppSummary(booking, itinerary = '', passportCountry = null) {
    const lines = ['✈️ *RoamGenie — Trip DNA Scanner*', ''];

    if (booking.parseError) {
        lines.push('⚠️ Could not fully parse your booking. Raw extract saved to itinerary.');
        return lines.join('\n');
    }

    const t = (booking.type || 'unknown').toUpperCase();
    lines.push(`📋 *Booking Type:* ${t}`);

    if (booking.pnr || booking.bookingReference) {
        lines.push(`🔖 *Reference:* ${booking.pnr || booking.bookingReference}`);
    }

    // ── Flight details ─────────────────────────────────────────────────────────
    if (booking.type === 'flight') {
        if (booking.airline || booking.flightNumber) {
            lines.push(`🛫 *Flight:* ${booking.airline ?? ''} ${booking.flightNumber ?? ''}`);
        }
        const dep = booking.departure;
        const arr = booking.arrival;
        if (dep?.city && arr?.city) {
            lines.push(`📍 *Route:* ${dep.city} (${dep.iata ?? '—'}) → ${arr.city} (${arr.iata ?? '—'})`);
        }
        if (dep?.date && dep?.time) lines.push(`🕐 *Departure:* ${dep.date} at ${dep.time}`);
        if (arr?.date && arr?.time) lines.push(`🕓 *Arrival:* ${arr.date} at ${arr.time}`);
        if (booking.seat) lines.push(`💺 *Seat:* ${booking.seat}`);
        if (booking.baggageAllowance) lines.push(`🧳 *Baggage:* ${booking.baggageAllowance}`);

        if (Array.isArray(booking.layovers) && booking.layovers.length > 0) {
            lines.push('');
            lines.push('🔄 *Layovers:*');
            for (const lay of booking.layovers) {
                lines.push(`  • ${lay.city ?? lay.iata ?? 'Unknown'} — ${lay.duration ?? 'duration unknown'}`);
            }

            // Transit visa note
            if (passportCountry) {
                const VISA_FREE_TRANSIT = ['India', 'Singapore', 'Japan', 'United Kingdom', 'United States', 'Germany', 'Australia', 'Canada', 'France'];
                const needsCheck = !VISA_FREE_TRANSIT.includes(passportCountry);
                lines.push('');
                if (needsCheck) {
                    lines.push('⚠️ *Transit Visa:* Please verify transit visa requirements for your layover airports.');
                } else {
                    lines.push('✅ *Transit Visa:* You likely do not need a transit visa (verify before travel).');
                }
            }
        }
    }

    // ── Hotel details ──────────────────────────────────────────────────────────
    if (booking.type === 'hotel' && booking.hotel?.name) {
        lines.push(`🏨 *Hotel:* ${booking.hotel.name}`);
        if (booking.hotel.checkIn) lines.push(`📅 *Check-in:* ${booking.hotel.checkIn}`);
        if (booking.hotel.checkOut) lines.push(`📅 *Check-out:* ${booking.hotel.checkOut}`);
        if (booking.hotel.roomType) lines.push(`🛏 *Room:* ${booking.hotel.roomType}`);
    }

    // ── Car rental details ─────────────────────────────────────────────────────
    if (booking.type === 'car_rental' && booking.carRental) {
        lines.push(`🚗 *Car Rental:* ${booking.carRental.company ?? 'N/A'}`);
        if (booking.carRental.pickupDate) lines.push(`📅 *Pick-up:* ${booking.carRental.pickupDate}`);
        if (booking.carRental.returnDate) lines.push(`📅 *Return:* ${booking.carRental.returnDate}`);
    }

    // ── Tour details ───────────────────────────────────────────────────────────
    if (booking.type === 'tour' && booking.tour?.name) {
        lines.push(`🗺️ *Tour:* ${booking.tour.name}`);
        if (booking.tour.startDate) lines.push(`📅 *Starts:* ${booking.tour.startDate}`);
        if (booking.tour.endDate) lines.push(`📅 *Ends:* ${booking.tour.endDate}`);
    }

    if (booking.totalPrice) {
        lines.push('');
        lines.push(`💰 *Total:* ${booking.currency ?? ''} ${booking.totalPrice}`);
    }

    // ── Itinerary snippet ──────────────────────────────────────────────────────
    if (itinerary && itinerary.trim()) {
        lines.push('');
        lines.push('━━━━━━━━━━━━━━━━━━━━━');
        lines.push('🗓️ *Your AI-Generated Itinerary*');
        lines.push('━━━━━━━━━━━━━━━━━━━━━');
        lines.push('');

        // Extract just the first 2 days / ~800 chars to stay WhatsApp-friendly
        const cleanItinerary = itinerary
            .replace(/\*\*/g, '*')           // convert bold
            .replace(/#{1,3} /g, '*📌 ')     // convert headings
            .trim();

        const snippet = cleanItinerary.length > 900
            ? cleanItinerary.slice(0, 900) + '…\n\n_(Full itinerary available in the app)_'
            : cleanItinerary;

        lines.push(snippet);
    }

    lines.push('');
    lines.push('_Powered by RoamGenie AI 🌍_');

    return lines.join('\n');
}
