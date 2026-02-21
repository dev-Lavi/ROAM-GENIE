/**
 * flightApi.js
 *
 * Standalone flight search is not a separate endpoint on the Node.js backend.
 * All flight data is returned as part of POST /api/travel/plan.
 *
 * This file is kept for compatibility; use itineraryApi.generateTravelPlan() instead.
 */

import { API_BASE_URL } from '../utils/constants';

/** @deprecated Use generateTravelPlan() from itineraryApi instead */
export const searchFlights = async (params) => {
    // Delegate to the full plan endpoint
    const res = await fetch(`${API_BASE_URL}/api/travel/plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error(`Flight search failed: ${res.status}`);
    const data = await res.json();
    return data.flights || [];
};
