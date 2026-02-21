/**
 * contactApi.js
 *
 * POST /api/contact/submit
 *   Body: { firstName, lastName, email, phone }
 *   Response: { success, message }
 *
 * Contact.jsx uses field names: firstName, secondName, email, phone
 * Backend expects:              firstName, lastName,   email, phone
 * → we remap secondName → lastName here.
 */

import { API_BASE_URL } from '../utils/constants';

/**
 * Submit contact form data.
 * @param {{ firstName: string, secondName: string, email: string, phone: string }} data
 */
export const submitContact = async (data) => {
    const payload = {
        firstName: data.firstName,
        lastName: data.secondName || data.lastName || '',   // accept both shapes
        email: data.email,
        phone: data.phone,
    };

    const res = await fetch(`${API_BASE_URL}/api/contact/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Contact submission failed: ${res.status}`);
    }

    return res.json();
};
