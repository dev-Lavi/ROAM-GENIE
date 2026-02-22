/**
 * tripScannerApi.js
 *
 * POST /api/scanner/parse        — parse raw text
 * POST /api/scanner/parse-image  — OCR + parse image
 */
import { API_BASE_URL } from '../utils/constants';

/**
 * Parse a raw booking confirmation text.
 * @param {object} params
 * @param {string}       params.text
 * @param {string|null}  params.passportCountry
 * @param {string|null}  params.whatsappNumber
 */
export const parseBookingText = async ({ text, passportCountry = null, whatsappNumber = null }) => {
    const res = await fetch(`${API_BASE_URL}/api/scanner/parse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, passportCountry, whatsappNumber }),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Server error: ${res.status}`);
    }
    return res.json();
};

/**
 * Upload an image/PDF and parse the booking from OCR text.
 * @param {object} params
 * @param {File}         params.file
 * @param {string|null}  params.passportCountry
 * @param {string|null}  params.whatsappNumber
 */
export const parseBookingImage = async ({ file, passportCountry = null, whatsappNumber = null }) => {
    const form = new FormData();
    form.append('file', file);
    if (passportCountry) form.append('passportCountry', passportCountry);
    if (whatsappNumber) form.append('whatsappNumber', whatsappNumber);

    const res = await fetch(`${API_BASE_URL}/api/scanner/parse-image`, {
        method: 'POST',
        body: form,
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Server error: ${res.status}`);
    }
    return res.json();
};
