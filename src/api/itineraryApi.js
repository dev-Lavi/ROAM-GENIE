import { API_BASE_URL } from '../utils/constants';

/**
 * Generate a full travel plan (flights + hotels + itinerary).
 * @param {Object} formData
 */
export const generateTravelPlan = async (formData) => {
    const res = await fetch(`${API_BASE_URL}/api/travel/plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `Server error: ${res.status}`);
    }
    return res.json();
};

/**
 * Search flights only.
 */
export const searchFlights = async (params) => {
    const res = await fetch(`${API_BASE_URL}/api/flights/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error(`Flight search failed: ${res.status}`);
    return res.json();
};
