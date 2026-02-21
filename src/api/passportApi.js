/**
 * passportApi.js
 *
 * POST /api/passport/scan
 *   Body: FormData { image: File }             ← field name is "image" (not "file")
 *   Response: { country, confidence, visaFreeCountries[], regionBreakdown, flags }
 *
 * POST /api/passport/visa-free
 *   Body: { country: string }
 *   Response: { country, visaFreeCountries[], regionBreakdown, flags, availablePassports[] }
 *
 * GET /api/passport/countries
 *   Response: { countries: string[] }
 */

import { API_BASE_URL } from '../utils/constants';

/**
 * Upload passport image for OCR extraction + visa-free lookup.
 * @param {File} file
 */
export const analyzePassport = async (file) => {
    const form = new FormData();
    form.append('image', file);   // backend multer field name is "image"

    const res = await fetch(`${API_BASE_URL}/api/passport/scan`, {
        method: 'POST',
        body: form,
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Passport scan failed: ${res.status}`);
    }

    const data = await res.json();

    // Normalise to shape expected by Passport.jsx:
    //   res.country              → string
    //   res.confidence           → number 0-1
    //   res.visa_free_countries  → string[]  (Passport.jsx reads this key)
    return {
        country: data.country,
        confidence: data.confidence,
        visa_free_countries: data.visaFreeCountries || [],
        regionBreakdown: data.regionBreakdown || {},
        flags: data.flags || {},
    };
};

/**
 * Get visa-free countries for a manually chosen passport country.
 * @param {string} country  e.g. "India"
 */
export const getVisaFreeCountries = async (country) => {
    const res = await fetch(`${API_BASE_URL}/api/passport/visa-free`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ country }),
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Visa lookup failed: ${res.status}`);
    }

    const data = await res.json();

    // Normalise to shape expected by Passport.jsx:
    //   res.countries → string[]
    return {
        countries: data.visaFreeCountries || [],
        regionBreakdown: data.regionBreakdown || {},
        flags: data.flags || {},
    };
};

/**
 * Fetch all available passport countries from the dataset.
 * @returns {Promise<string[]>}
 */
export const getAvailableCountries = async () => {
    const res = await fetch(`${API_BASE_URL}/api/passport/countries`);
    if (!res.ok) throw new Error(`Countries fetch failed: ${res.status}`);
    const data = await res.json();
    return data.countries || [];
};
