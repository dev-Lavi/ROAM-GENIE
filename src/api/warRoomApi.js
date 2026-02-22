/**
 * warRoomApi.js
 *
 * POST /api/warroom/monitor      — full intelligence brief
 * GET  /api/warroom/advisories   — travel advisories only
 * GET  /api/warroom/flight       — raw flight status only
 */
import { API_BASE_URL } from '../utils/constants';

/**
 * Run full War Room monitoring for a flight.
 */
export const monitorFlight = async ({ flightIata, destination, layoverMinutes, whatsappNumber }) => {
    const res = await fetch(`${API_BASE_URL}/api/warroom/monitor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flightIata, destination, layoverMinutes, whatsappNumber }),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Server error: ${res.status}`);
    }
    return res.json();
};

/**
 * Fetch travel advisories only.
 */
export const getTravelAdvisories = async (destination) => {
    const res = await fetch(`${API_BASE_URL}/api/warroom/advisories?destination=${encodeURIComponent(destination)}`);
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Server error: ${res.status}`);
    }
    return res.json();
};

/**
 * Fetch raw flight status only.
 */
export const getFlightStatus = async (iata) => {
    const res = await fetch(`${API_BASE_URL}/api/warroom/flight?iata=${encodeURIComponent(iata)}`);
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Server error: ${res.status}`);
    }
    return res.json();
};
